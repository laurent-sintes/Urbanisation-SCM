"""Expose delivery declarations; never infer approval from an annex status."""
from pathlib import Path

try:
    from .structured_io import read
except ImportError:
    from structured_io import read


def check_delivery(root, candidate):
    root = Path(root)
    nodes = {n['id']: n for n in candidate['nodes']}
    relations = candidate['relations']
    rows, errors = [], []
    for path in sorted((root / 'modeles/backlog').glob('*.yaml')):
        doc = read(path)
        if not isinstance(doc, dict) or 'publication_delivery' not in doc:
            continue
        declaration = doc['publication_delivery']
        label = path.name
        if not isinstance(declaration, dict) or declaration.get('state') not in ('pending', 'applied'):
            errors.append('backlog-delivery: invalid declaration in ' + label)
            continue
        state = declaration['state']
        rows.append({'path': path.relative_to(root).as_posix(), 'state': state,
                     'summary': declaration.get('summary', ''),
                     'source_refs': declaration.get('source_refs', [])})
        if state == 'pending':
            continue
        required = declaration.get('required_nodes', [])
        absent = declaration.get('absent_nodes', [])
        catalog_checks = declaration.get('required_catalog', [])
        if not required and not absent and not catalog_checks:
            errors.append('backlog-delivery: applied declaration without checks in ' + label)
        try:
            from .element_versions import content_hash
        except ImportError:
            from element_versions import content_hash
        for expected in catalog_checks:
            items = candidate.get('scenario_catalog', {}).get(expected['collection'], [])
            item = next((v for v in items if v['id'] == expected['id']), None)
            if item is None or content_hash(item) != expected['content_sha256']:
                errors.append(f'backlog-delivery: {label}: catalog mismatch: {expected["id"]}')
        for item in required:
            ident = item['id']
            node = nodes.get(ident)
            if node is None:
                errors.append(f'backlog-delivery: {label}: required node missing: {ident}')
                continue
            for field, expected in item.get('fields', {}).items():
                if node['fields'].get(field) != expected:
                    errors.append(f'backlog-delivery: {label}: field mismatch: {ident}.{field}')
            if 'kind' in item and node.get('kind') != item['kind']:
                errors.append(f'backlog-delivery: {label}: kind mismatch: {ident}')
            parent_type = item.get('parent_type', 'contains')
            if 'parent' in item and (parent_type not in ('contains', 'presents') or not any(r['type'] == parent_type and r['source_id'] == item['parent']
                                            and r['target_id'] == ident for r in relations)):
                errors.append(f'backlog-delivery: {label}: missing parent: {ident}')
        for ident in absent:
            if ident in nodes:
                errors.append(f'backlog-delivery: {label}: retired node still present: {ident}')
    return rows, errors
