"""Carry an explicit frozen methodology association through a prepared release."""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import os
import re
import tempfile
try:
    from .structured_io import read, loads, dumps
except ImportError:
    from structured_io import read, loads, dumps

VERSION = re.compile(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*\Z')


def validate_model_links(root, model, association, *, guide=None):
    """Check methodology links against this exact frozen publication association."""
    try:
        from .glossary import validate
    except ImportError:
        from glossary import validate
    if guide is None and association is not None:
        entry = association['guide']
        guide = read(Path(root) / 'modeles/modeling-guides' / entry['path'], expected_sha256=entry['sha256'])
    return validate(model, method_terms=guide.get('glossary', {}).get('terms', []) if guide else None)


def capture_association(root, version):
    folder = Path(root).resolve() / 'modeles/modeling-guides'
    path = folder / 'index.yaml'
    if not path.exists(): return None
    index_bytes = path.read_bytes()
    index = loads(index_bytes.decode('utf-8-sig'), '.yaml')
    associations = [item for item in index['associations'] if item['publication_version'] == version]
    if not associations: return None
    if len(associations) != 1: raise ValueError('Duplicate methodology association')
    association = associations[0]
    entries = [item for item in index['guides'] if item['version'] == association['guide_version']]
    if len(entries) != 1: raise ValueError('Missing or duplicate methodology guide')
    entry = entries[0]
    if not VERSION.fullmatch(entry['version']) or entry['path'] != 'versions/' + entry['version'] + '.yaml':
        raise ValueError('Invalid methodology path')
    guide_path = folder / entry['path']
    if guide_path.resolve() != guide_path or sha256(guide_path.read_bytes()).hexdigest() != entry['sha256']:
        raise ValueError('Methodology guide integrity mismatch')
    return {'index_sha256':sha256(index_bytes).hexdigest(), 'guide':entry, 'association':association}

def verify_association(root, base_version, frozen):
    if capture_association(root, base_version) != frozen:
        raise ValueError('Methodology association changed since preparation; prepare a fresh candidate')

def carry_association(root, base_version, version, frozen):
    verify_association(root, base_version, frozen)
    if frozen is None: return
    if not VERSION.fullmatch(version): raise ValueError('Invalid publication version')
    path = Path(root).resolve() / 'modeles/modeling-guides/index.yaml'
    index = read(path)
    if any(item['publication_version'] == version for item in index['associations']):
        raise ValueError('Methodology association already exists')
    association = deepcopy(frozen['association'])
    association.update(publication_version=version, scope='carried_frozen_methodology',
        note=f'Édition méthodologique figée reprise explicitement depuis {base_version} ; aucune lecture du backlog.')
    index['associations'].append(association)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n', dir=path.parent, suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(dumps(index)); stream.flush(); os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists(): temporary.unlink()
