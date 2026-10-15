"""Check declared business depth without changing historical publications."""


def responsibility_domains(model):
    """Structural ancestors only; cross-domain business links do not grant depth."""
    nodes = {node['id']: node for node in model['nodes']}
    parents = {}
    for relation in model['relations']:
        if relation['type'] in ('contains', 'presents'):
            parents.setdefault(relation['target_id'], set()).add(relation['source_id'])
    result = {}
    for node in model['nodes']:
        if node['kind'] not in ('business_area', 'capability', 'behavior'):
            continue
        pending = list(parents.get(node['id'], []))
        seen, domains = set(), set()
        while pending:
            identifier = pending.pop()
            if identifier in seen:
                continue
            seen.add(identifier)
            if nodes.get(identifier, {}).get('kind') == 'domain':
                domains.add(identifier)
            pending.extend(parents.get(identifier, set()) - seen)
        result[node['id']] = domains
    return result


def context_business_area_ids(model, domains=None):
    if not any(p.get('id') == 'PRINCIPLE-ORCHESTRATION-DETAIL' for p in model.get('principles', [])):
        return set()
    allowed = {n['id'] for n in model['nodes'] if n['kind'] == 'domain'
               and n['id'] != 'supply-chain-orchestration'
               and n.get('fields', {}).get('modeling_depth') == 'business_areas'}
    ancestry = responsibility_domains(model) if domains is None else domains
    return {n['id'] for n in model['nodes'] if n['kind'] == 'business_area'
            and len(ancestry.get(n['id'], set())) == 1
            and ancestry[n['id']] <= allowed}


def validate_detail_scope(model):
    if not any(p.get('id') == 'PRINCIPLE-ORCHESTRATION-DETAIL' for p in model.get('principles', [])):
        return []
    nodes = {node['id']: node for node in model['nodes']}
    core = 'supply-chain-orchestration'
    errors = []
    if nodes.get(core, {}).get('kind') != 'domain':
        errors.append('model-depth: detailed orchestration domain is missing')
    operations_domains = {relation['target_id'] for relation in model['relations']
                          if relation['type'] == 'presents'
                          and relation['source_id'] == 'system-business-operations'
                          and nodes.get(relation['target_id'], {}).get('kind') == 'domain'}
    capability_domains = {identifier for identifier in operations_domains
                          if nodes[identifier].get('fields', {}).get('modeling_depth') == 'capabilities'}
    domains = responsibility_domains(model)
    context_areas = context_business_area_ids(model, domains)
    for node in model['nodes']:
        if (node['kind'] == 'domain' and node['id'] != core
                and node.get('fields', {}).get('modeling_depth') == 'behaviors'):
            errors.append(f'model-depth/{node["id"]}: detailed modeling is reserved to Supply Chain Orchestration')
        if (node['kind'] == 'domain' and node.get('fields', {}).get('modeling_depth') == 'capabilities'
                and node['id'] not in operations_domains):
            errors.append(f'model-depth/{node["id"]}: capability depth requires Business Operations ownership')
        if node['kind'] not in ('business_area', 'capability', 'behavior') or node['id'] in context_areas:
            continue
        allowed = {core} if node['kind'] == 'behavior' else ({core} | capability_domains)
        if len(domains[node['id']]) != 1 or not domains[node['id']] <= allowed:
            errors.append(f'model-depth/{node["id"]}: responsibility exceeds the declared domain depth')
    return errors
