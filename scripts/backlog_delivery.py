"""Expose delivery declarations; never infer approval from an annex status."""
from pathlib import Path

try:
    from .structured_io import read
    from .delivery_index import declarations
except ImportError:
    from structured_io import read
    from delivery_index import declarations


def check_delivery(root, candidate, *, stats=None):
    root = Path(root)
    nodes = {n['id']: n for n in candidate['nodes']}
    relations = candidate['relations']
    relation_by_id = {r['id']: r for r in relations if 'id' in r}
    parent_edges = {(r.get('type'), r.get('source_id'), r.get('target_id')) for r in relations}
    terms = {t['id']: t for t in candidate.get('glossary', {}).get('terms', [])}
    rows, errors = [], []
    documents = declarations(root, stats)
    overrides, override_errors = replacement_scopes(documents)
    errors.extend(override_errors)
    prepared = requirement_index(root, documents, overrides) if not override_errors else {
        label: active_requirements(label, declaration, overrides) for label, declaration in documents.items()}
    for label, original in documents.items():
        declaration = prepared[label]
        if not isinstance(declaration, dict) or declaration.get('state') not in ('pending', 'applied'):
            errors.append('backlog-delivery: invalid declaration in ' + label)
            continue
        state = declaration['state']
        rows.append({'path': 'modeles/backlog/' + label, 'state': state,
                     'summary': declaration.get('summary', ''),
                     'source_refs': declaration.get('source_refs', [])})
        if state == 'pending':
            continue
        required = declaration.get('required_nodes', [])
        absent = declaration.get('absent_nodes', [])
        catalog_checks = declaration.get('required_catalog', [])
        glossary_checks = declaration.get('required_glossary', [])
        required_relations = declaration.get('required_relations', [])
        absent_relations = declaration.get('absent_relations', [])
        if not any(original.get(key) for key in ('required_nodes', 'absent_nodes', 'required_catalog',
                                                 'required_glossary', 'required_relations', 'absent_relations')):
            errors.append('backlog-delivery: applied declaration without checks in ' + label)
        try:
            from .element_versions import content_hash
            from .record_decision import canonical_sha256
        except ImportError:
            from element_versions import content_hash
            from record_decision import canonical_sha256
        for expected in catalog_checks:
            collection = expected['collection']
            if collection == 'principles':
                items = candidate.get('principles', [])
            elif collection == 'hotspots':
                items = candidate.get('hotspot_catalog', {}).get('hotspots', [])
            elif collection == 'application_products':
                items = candidate.get('application_catalog', {}).get('products', [])
            elif collection == 'application_selections':
                items = candidate.get('application_catalog', {}).get('selections', [])
            elif collection == 'information_items':
                items = candidate.get('information_catalog', {}).get('items', [])
            elif collection == 'information_links':
                items = candidate.get('information_catalog', {}).get('links', [])
            else:
                items = candidate.get('scenario_catalog', {}).get(collection, [])
            item = next((v for v in items if v['id'] == expected['id']), None)
            if item is None or content_hash(item) != expected['content_sha256']:
                errors.append(f'backlog-delivery: {label}: catalog mismatch: {expected["id"]}')
        for expected in glossary_checks:
            term = terms.get(expected['id'])
            if term is None:
                errors.append(f'backlog-delivery: {label}: glossary term missing: {expected["id"]}')
                continue
            for field, fingerprint in expected.get('field_sha256', {}).items():
                if field not in term or canonical_sha256(term[field]) != fingerprint:
                    errors.append(f'backlog-delivery: {label}: glossary field mismatch: {expected["id"]}.{field}')
        for item in required:
            ident = item['id']
            node = nodes.get(ident)
            if node is None:
                errors.append(f'backlog-delivery: {label}: required node missing: {ident}')
                continue
            for field, expected in item.get('fields', {}).items():
                if node['fields'].get(field) != expected:
                    errors.append(f'backlog-delivery: {label}: field mismatch: {ident}.{field}')
            # Bind corrected content without copying entire fiches into an annex.
            for field, expected in item.get('field_sha256', {}).items():
                if (field not in node['fields']
                        or canonical_sha256(node['fields'][field]) != expected):
                    errors.append(f'backlog-delivery: {label}: field hash mismatch: {ident}.{field}')
            if 'kind' in item and node.get('kind') != item['kind']:
                errors.append(f'backlog-delivery: {label}: kind mismatch: {ident}')
            parent_type = item.get('parent_type', 'contains')
            if 'parent' in item and (parent_type not in ('contains', 'presents') or (parent_type, item['parent'], ident) not in parent_edges):
                errors.append(f'backlog-delivery: {label}: missing parent: {ident}')
        for ident in absent:
            if ident in nodes:
                errors.append(f'backlog-delivery: {label}: retired node still present: {ident}')
        for expected in required_relations:
            ident = expected['id']
            relation = relation_by_id.get(ident)
            if relation is None:
                errors.append(f'backlog-delivery: {label}: required relation missing: {ident}')
                continue
            for field in ('type', 'source_id', 'target_id'):
                if field in expected and relation.get(field) != expected[field]:
                    errors.append(f'backlog-delivery: {label}: relation mismatch: {ident}.{field}')
            for field, fingerprint in expected.get('field_sha256', {}).items():
                if field not in relation.get('fields', {}) or canonical_sha256(relation['fields'][field]) != fingerprint:
                    errors.append(f'backlog-delivery: {label}: relation field hash mismatch: {ident}.{field}')
        for ident in absent_relations:
            if ident in relation_by_id:
                errors.append(f'backlog-delivery: {label}: retired relation still present: {ident}')
    return rows, errors


def requirement_index(root, documents, overrides):
    """Cache the compact active obligations, never their result against a model."""
    import json
    from hashlib import sha256
    try:
        from . import parsed_cache
    except ImportError:
        import parsed_cache
    key = sha256(Path(__file__).read_bytes() + json.dumps(documents, ensure_ascii=False,
                                                        sort_keys=True).encode('utf-8')).hexdigest()
    directory = Path(root).resolve() / '.runtime/active-requirements'
    indexed = parsed_cache.get(key, directory=directory)
    if not isinstance(indexed, dict) or set(indexed) != set(documents):
        indexed = {label: active_requirements(label, declaration, overrides) for label, declaration in documents.items()}
        parsed_cache.put(key, indexed, directory=directory)
    return indexed


def replacement_scopes(documents):
    """Explicit field replacements; never infer them from chronology or status."""
    scopes, errors, replacements = set(), [], {}
    for label, declaration in documents.items():
        if not isinstance(declaration, dict) or declaration.get('state') != 'applied':
            continue
        for entry in declaration.get('supersedes_requirements', []):
            try:
                if set(entry) != {'annex', 'collection', 'id', 'fields'}:
                    raise ValueError('expected annex, collection, id and fields')
                old_label, collection, identifier = entry['annex'], entry['collection'], entry['id']
                if old_label == label or old_label not in documents or not declaration.get('source_refs'):
                    raise ValueError('existing distinct annex and explicit source_refs required')
                fields = entry['fields']
                if not isinstance(fields, list) or not fields or len(set(fields)) != len(fields):
                    raise ValueError('explicit unique nonempty fields required')
                for field in fields:
                    key = (old_label, collection, identifier, field)
                    if key in scopes:
                        raise ValueError('conflicting replacement')
                    if not requirement_covers(documents[old_label], collection, identifier, field):
                        raise ValueError('historical requirement does not cover field')
                    if not requirement_covers(declaration, collection, identifier, field, replacement=True):
                        raise ValueError('replacement must check the same field or explicit retirement')
                    scopes.add(key)
                    replacements[key] = label
            except (KeyError, TypeError, ValueError, AttributeError) as error:
                errors.append(f'backlog-delivery: {label}: invalid supersession: {error}')
    for start in replacements:
        current, visited = start, set()
        while current in replacements:
            if current in visited:
                errors.append(f'backlog-delivery: {start[0]}: cyclic requirement supersession')
                break
            visited.add(current)
            current = (replacements[current], *current[1:])
    return scopes, errors


def requirement_covers(declaration, collection, identifier, field, replacement=False):
    if collection in ('principles', 'hotspots', 'scenarios', 'paths', 'application_products', 'application_selections',
                      'information_items', 'information_links'):
        return field in ('exists', 'content_sha256') and any(
            item.get('collection') == collection and item.get('id') == identifier
            and (field == 'exists' or field in item)
            for item in declaration.get('required_catalog', []))
    key = {'nodes': 'required_nodes', 'relations': 'required_relations', 'terms': 'required_glossary'}.get(collection)
    if key is None:
        return False
    absent = {'nodes': 'absent_nodes', 'relations': 'absent_relations'}.get(collection)
    if replacement and absent and identifier in declaration.get(absent, []):
        return True
    for item in declaration.get(key, []):
        if item['id'] != identifier:
            continue
        if field == 'exists':
            return True
        if field in item.get('fields', {}) or field in item.get('field_sha256', {}):
            return True
        if field in ('parent', 'kind', 'type', 'source_id', 'target_id') and field in item:
            return True
    return False


def active_requirements(label, declaration, overrides):
    from copy import deepcopy
    if not isinstance(declaration, dict):
        return declaration
    result = deepcopy(declaration)
    result['required_catalog'] = [item for item in result.get('required_catalog', [])
        if not any((label, item['collection'], item['id'], field) in overrides
                   for field in ('exists', 'content_sha256'))]
    for collection, key in [('nodes', 'required_nodes'), ('relations', 'required_relations'), ('terms', 'required_glossary')]:
        items = []
        for item in result.get(key, []):
            prefix = (label, collection, item['id'])
            if (*prefix, 'exists') in overrides:
                continue
            for field in list(item.get('fields', {})):
                if (*prefix, field) in overrides:
                    del item['fields'][field]
            for field in list(item.get('field_sha256', {})):
                if (*prefix, field) in overrides:
                    del item['field_sha256'][field]
            for field in ('parent', 'kind', 'type', 'source_id', 'target_id'):
                if (*prefix, field) in overrides:
                    item.pop(field, None)
                    if field == 'parent':
                        item.pop('parent_type', None)
            items.append(item)
        result[key] = items
    return result
