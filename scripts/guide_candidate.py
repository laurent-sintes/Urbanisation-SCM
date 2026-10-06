"""Freeze and publish an explicitly prepared methodology edition with a release."""
from hashlib import sha256
from pathlib import Path
import os
import sys
import tempfile

try:
    from .structured_io import read, loads, dumps
    from .modeling_guide_publication import VERSION
except ImportError:
    from structured_io import read, loads, dumps
    from modeling_guide_publication import VERSION


def digest(path):
    return sha256(Path(path).read_bytes()).hexdigest()


def validate(content):
    # Share Atlas' reader contract; no dependency on a running server.
    repository = str(Path(__file__).resolve().parents[1])
    if repository not in sys.path:
        sys.path.insert(0, repository)
    from app.modeling_guide import _validate_guide
    guide = loads(content.decode('utf-8-sig'), '.yaml')
    if not isinstance(guide, dict) or not VERSION.fullmatch(guide.get('version', '')):
        raise ValueError('Invalid candidate guide version')
    return _validate_guide(guide, guide['version'])


CANONICAL_GLOSSARY = 'modeles/backlog/modeling-glossary.yaml'
SHARED_FIELDS = {'name', 'label_fr', 'definition', 'short_description'}


def compile_draft(root, source):
    """Resolve working references once; published editions stay self-contained."""
    root = Path(root).resolve()
    source = Path(source)
    source = (root / source).resolve() if not source.is_absolute() else source.resolve()
    if not source.is_relative_to(root):
        raise ValueError('Guide candidate must be inside the project')
    raw = source.read_bytes()
    guide = loads(raw.decode('utf-8-sig'), '.yaml')
    dependencies = {source.relative_to(root).as_posix(): sha256(raw).hexdigest()}
    glossary = guide.get('glossary', {})
    if 'canonical_source' not in glossary:
        return raw, validate(raw), dependencies
    if glossary.pop('canonical_source') != CANONICAL_GLOSSARY:
        raise ValueError('Unknown canonical methodology glossary')
    glossary_path = (root / CANONICAL_GLOSSARY).resolve()
    if not glossary_path.is_relative_to(root):
        raise ValueError('Canonical glossary escapes project')
    content = glossary_path.read_bytes()
    dependencies[CANONICAL_GLOSSARY] = sha256(content).hexdigest()
    records = loads(content.decode('utf-8-sig'), '.yaml')['terms']
    terms = {term['id']: term for term in records}
    if len(terms) != len(records):
        raise ValueError('Duplicate canonical glossary term')
    for term in glossary['terms']:
        fields = term.pop('canonical_fields', None)
        if (not isinstance(fields, list) or any(not isinstance(f, str) for f in fields)
                or len(set(fields)) != len(fields) or not {'name', 'definition'} <= set(fields)
                or not set(fields) <= SHARED_FIELDS or term['id'] not in terms):
            raise ValueError('Invalid canonical term reference: ' + str(term.get('id')))
        for field in fields:
            if field in term or field not in terms[term['id']]:
                raise ValueError('Missing or overridden canonical field: ' + term['id'] + '.' + field)
            term[field] = terms[term['id']][field]
    if guide.get('model_examples'):
        try:
            from .methodology_alignment import validate_examples
        except ImportError:
            from methodology_alignment import validate_examples
        model_path = root / 'modeles/backlog/model.yaml'
        model_content = model_path.read_bytes()
        dependencies['modeles/backlog/model.yaml'] = sha256(model_content).hexdigest()
        errors = validate_examples(guide, loads(model_content.decode('utf-8-sig'), '.yaml'))
        if errors:
            raise ValueError('; '.join(errors))
    content = dumps(guide).encode('utf-8')
    return content, validate(content), dependencies


def load_draft(root, source):
    return compile_draft(root, source)[1]


def stage(root, source, destination):
    root = Path(root).resolve()
    source = Path(source)
    source = (root / source).resolve() if not source.is_absolute() else source.resolve()
    if not source.is_relative_to(root):
        raise ValueError('Guide candidate must be inside the project')
    content, guide, dependencies = compile_draft(root, source)
    registry = read(root / 'modeles/provenance/source-records.json')
    if not set(guide['source_refs']) <= {r['id'] for r in registry['records']}:
        raise ValueError('Unknown candidate guide source')
    folder = root / 'modeles/modeling-guides'
    index = folder / 'index.yaml'
    if (folder / 'versions' / (guide['version'] + '.yaml')).exists():
        raise ValueError('Guide version already exists; historical editions are immutable')
    if index.exists() and any(g['version'] == guide['version'] for g in read(index)['guides']):
        raise ValueError('Guide version already indexed')
    name = 'new-modeling-guide.yaml'
    (Path(destination) / name).write_bytes(content)
    return {'version': guide['version'], 'path': name, 'sha256': sha256(content).hexdigest(),
            'source_path': source.relative_to(root).as_posix(),
            'source_sha256': dependencies[source.relative_to(root).as_posix()],
            'source_inputs': dependencies,
            'index_sha256': digest(index) if index.exists() else None}


def verify(root, stage_path, record):
    root = Path(root).resolve()
    if record['path'] != 'new-modeling-guide.yaml' or not VERSION.fullmatch(record['version']):
        raise ValueError('Invalid prepared guide path or version')
    source = (root / record['source_path']).resolve()
    if not source.is_relative_to(root):
        raise ValueError('Guide source escapes project')
    content = (Path(stage_path) / record['path']).read_bytes()
    if sha256(content).hexdigest() != record['sha256'] or digest(source) != record['source_sha256']:
        raise ValueError('Guide candidate changed since preparation')
    if 'source_inputs' in record:
        rebuilt, _, dependencies = compile_draft(root, source)
        if dependencies != record['source_inputs'] or rebuilt != content:
            raise ValueError('Guide dependencies changed since preparation')
    guide = validate(content)
    if guide['version'] != record['version']:
        raise ValueError('Guide version differs from prepared edition')
    folder = root / 'modeles/modeling-guides'
    index = folder / 'index.yaml'
    if (digest(index) if index.exists() else None) != record['index_sha256']:
        raise ValueError('Guide index changed since preparation')
    if (folder / 'versions' / (record['version'] + '.yaml')).exists():
        raise ValueError('Guide version already exists')
    return guide


def publish(root, stage_path, publication_version, record):
    verify(root, stage_path, record)
    folder = Path(root).resolve() / 'modeles/modeling-guides'
    index_path = folder / 'index.yaml'
    index = read(index_path) if index_path.exists() else {'schema_version': '1.0.0', 'guides': [], 'associations': []}
    if any(a['publication_version'] == publication_version for a in index['associations']):
        raise ValueError('Methodology association already exists')
    relative = 'versions/' + record['version'] + '.yaml'
    target = folder / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('xb') as stream:
        stream.write((Path(stage_path) / record['path']).read_bytes())
    index['guides'].append({'version': record['version'], 'path': relative, 'sha256': record['sha256']})
    index['associations'].append({'publication_version': publication_version, 'guide_version': record['version'],
        'scope': 'explicit_prepared_methodology',
        'note': 'Édition méthodologique explicitement préparée et contrôlée avec cette publication ; aucune validation métier supplémentaire.'})
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n', dir=folder, suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(dumps(index)); stream.flush(); os.fsync(stream.fileno())
        os.replace(temporary, index_path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()
