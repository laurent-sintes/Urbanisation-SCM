"""Check the opted-in FLOW boundary without changing historical publications."""


def validate_detail_scope(model):
    if not any(p.get('id') == 'PRINCIPLE-ORCHESTRATION-DETAIL' for p in model.get('principles', [])):
        return []
    nodes = {node['id']: node for node in model['nodes']}
    parents = {}
    for relation in model['relations']:
        if relation['type'] in ('contains', 'presents'):
            parents.setdefault(relation['target_id'], set()).add(relation['source_id'])
    core = 'supply-chain-orchestration'
    errors = []
    if nodes.get(core, {}).get('kind') != 'domain':
        errors.append('model-depth: detailed orchestration domain is missing')
    for node in model['nodes']:
        if (node['kind'] == 'domain' and node['id'] != core
                and node.get('fields', {}).get('modeling_depth') == 'behaviors'):
            errors.append(f'model-depth/{node["id"]}: detailed modeling is reserved to Supply Chain Orchestration')
        if node['kind'] not in ('business_area', 'capability', 'behavior'):
            continue
        pending = list(parents.get(node['id'], []))
        seen = set()
        domains = set()
        while pending:
            identifier = pending.pop()
            if identifier in seen:
                continue
            seen.add(identifier)
            if nodes.get(identifier, {}).get('kind') == 'domain':
                domains.add(identifier)
            pending.extend(parents.get(identifier, set()) - seen)
        if domains != {core}:
            errors.append(f'model-depth/{node["id"]}: detailed responsibility must belong only to Supply Chain Orchestration')
    return errors
