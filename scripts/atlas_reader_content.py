"""Explicit, checksummed reading profiles for already published Atlas editions.

No prose rules and no backlog fallback. The original exported snapshot is retained;
the reader receives a separate presentation projection for legacy annotations.
"""
from functools import lru_cache
from hashlib import sha256
import json

FROZEN_LEGACY_INPUTS = {
    'legacy-reader-projections.json': 'dcc2141c6c93cc9bd5c7b80e1533b6e80706b073c2aa7d01bed2f19a3b4f8244',
    'legacy-vocabulary.json': '02b001c7d6c1f13a2127d4ed1f39caa520a1ddf5bfc5ae3f5f1dcffe89cc036a',
}


def verify_legacy_inputs(root, *, required=False):
    for name, expected in FROZEN_LEGACY_INPUTS.items():
        path = root / 'app/content' / name
        if not path.exists() and not required:
            continue
        if not path.exists() or sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError('Frozen legacy reader data differs: ' + name)


@lru_cache(maxsize=8)
def _parsed_content(content):
    return json.loads(content)


def _content(root, name):
    path = root / 'app/content' / name
    return _parsed_content(path.read_bytes()) if path.exists() else {}


def reader_content_inputs(root):
    result = {name: sha256((root / 'app/content' / name).read_bytes()).hexdigest()
            for name in ('legacy-reader-projections.json', 'legacy-vocabulary.json', 'presentation-profiles.json', 'metamodel-export.json')
            if (root / 'app/content' / name).exists()}
    resources_path = root / 'app/locales/fr/ui.json'
    if resources_path.exists():
        texts = {key: value for key, value in json.loads(resources_path.read_bytes()).items()
                 if key.startswith(('metamodelExport.', 'documentationExport.'))}
        result['export_texts'] = sha256(json.dumps(texts, sort_keys=True, ensure_ascii=False).encode('utf-8')).hexdigest()
    return result


def scoped_projection(model, content):
    patches = []
    seen = set()
    for entry in content['entries']:
        collection = entry['collection']
        if collection not in {'nodes', 'relations', 'terms', 'principles'}:
            raise ValueError('Invalid reader content collection')
        if not entry['field_path'] or any(key in {'__proto__', 'constructor', 'prototype', 'id', 'source_id', 'target_id',
                                                  'kind', 'review', 'lifecycle', 'source_refs', 'source_locator'}
                                         for key in entry['field_path']):
            raise ValueError('Invalid reader content field path')
        prefix = ['glossary', 'terms'] if collection == 'terms' else [collection]
        items = model.get('glossary', {}).get('terms', []) if collection == 'terms' else model.get(collection, [])
        matches = [index for index, item in enumerate(items) if item.get('id') == entry['id']]
        if len(matches) != 1:
            raise ValueError('Reader content target missing or ambiguous: ' + entry['id'])
        path = prefix + [str(matches[0])] + entry['field_path']
        if tuple(path) in seen:
            raise ValueError('Duplicate reader content target: ' + entry['id'])
        seen.add(tuple(path))
        value = model
        for key in path:
            value = value[int(key)] if isinstance(value, list) else value[key]
        if not isinstance(value, str) or sha256(value.encode('utf-8')).hexdigest() != entry['source_sha256']:
            raise ValueError('Reader content source differs; remove its legacy override after editing the public source: ' + entry['id'])
        patches.append({'path': path, 'source_sha256': entry['source_sha256'], 'text': entry['text']})
    return {'schema_version': 1, 'publication_version': model['version'], 'patches': patches}


def compile_reader_content(root, source, model):
    """Carry existing legacy presentation forward; never author new prose here."""
    if source.get('schema_version') != 1 or not isinstance(source.get('entries'), list):
        raise ValueError('Invalid reader binding source')
    pool = _content(root, 'legacy-reader-projections.json')['entries']
    entries = []
    for binding in source['entries']:
        if set(binding) != {'collection', 'id', 'field_path', 'legacy_text_ref'}:
            raise ValueError('Reader bindings are reference-only; edit new public prose in the canonical model')
        value = pool[binding['legacy_text_ref']]
        entries.append({key: binding[key] for key in ('collection', 'id', 'field_path')} |
                       {'source_sha256': value['source_sha256'], 'text': value['text']})
    content = {'schema_version': 1, 'entries': entries}
    scoped_projection(model, content)
    return content


def reading_projection(root, model, guide_response=None):
    guide = (guide_response or {}).get('guide') or {}
    if 'reader_content' in guide:
        return scoped_projection(model, guide['reader_content'])
    data = _content(root, 'legacy-reader-projections.json')
    edition = data.get('versions', {}).get(model['version'])
    if edition is None:
        return None
    patches = []
    for patch_id in data['profiles'][edition['profile']]:
        pointer, entry_id = data['patches'][patch_id]
        entry = data['entries'][entry_id]
        path = pointer.split('/')
        if any(key in {'__proto__', 'constructor', 'prototype', 'id', 'source_id', 'target_id',
                       'kind', 'review', 'lifecycle', 'source_refs', 'source_locator'} for key in path):
            raise ValueError('Invalid legacy reading path: ' + pointer)
        value = model
        for key in path:
            value = value[int(key)] if isinstance(value, list) else value[key]
        if not isinstance(value, str) or sha256(value.encode('utf-8')).hexdigest() != entry['source_sha256']:
            raise ValueError('Legacy reading source differs: ' + model['version'] + '/' + pointer)
        patches.append({'path': path, 'source_sha256': entry['source_sha256'], 'text': entry['text']})
    return {'schema_version': 1, 'publication_version': model['version'], 'patches': patches}


def reader_vocabulary(root, model, guide_response):
    guide = guide_response.get('guide') or {}
    if 'reader_vocabulary' in guide:
        return guide['reader_vocabulary']
    legacy = _content(root, 'legacy-vocabulary.json')
    # Only explicitly listed historical editions get a legacy vocabulary.
    return legacy.get('vocabulary', {}) if model['version'] in legacy.get('publication_versions', []) else {}


def presentation_profile(root, model):
    data = _content(root, 'presentation-profiles.json')
    assignments = data.get('icons_by_publication', {}).get(model['version'], data.get('default_icon_assignments', {}))
    ids = {node['id'] for node in model['nodes']}
    return {'icons': {key: value for key, value in assignments.items() if key in ids},
            'flow_neighborhood': data.get('flow_neighborhood')}


def application_contexts(root, model):
    catalog = model.get('application_catalog') or {}
    if 'contexts' in catalog:
        return catalog['contexts']
    legacy = _content(root, 'legacy-vocabulary.json')
    if model['version'] not in legacy.get('publication_versions', []):
        return []
    return [{'id': ident, 'name': name} for ident, name in legacy.get('contexts', {}).items()]
