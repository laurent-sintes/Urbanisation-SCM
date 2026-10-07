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
        glossary_checks = declaration.get('required_glossary', [])
        if not required and not absent and not catalog_checks and not glossary_checks:
            errors.append('backlog-delivery: applied declaration without checks in ' + label)
        try:
            from .element_versions import content_hash
            from .record_decision import canonical_sha256
        except ImportError:
            from element_versions import content_hash
            from record_decision import canonical_sha256
        for expected in catalog_checks:
            items = candidate.get('scenario_catalog', {}).get(expected['collection'], [])
            item = next((v for v in items if v['id'] == expected['id']), None)
            if item is None or content_hash(item) != expected['content_sha256']:
                errors.append(f'backlog-delivery: {label}: catalog mismatch: {expected["id"]}')
        terms = {t['id']: t for t in candidate.get('glossary', {}).get('terms', [])}
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
            if 'parent' in item and (parent_type not in ('contains', 'presents') or not any(r['type'] == parent_type and r['source_id'] == item['parent']
                                            and r['target_id'] == ident for r in relations)):
                errors.append(f'backlog-delivery: {label}: missing parent: {ident}')
        for ident in absent:
            if ident in nodes:
                errors.append(f'backlog-delivery: {label}: retired node still present: {ident}')
    return rows, errors
