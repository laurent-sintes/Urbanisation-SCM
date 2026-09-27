"""Optional illustrative scenarios, resolved exclusively inside one model snapshot."""
from copy import deepcopy

LEVELS = {'domain', 'area', 'capability'}


def validate_scenarios(nodes):
    errors = []
    for identifier, node in nodes.items():
        fields = node.get('fields', {})
        seen = set()
        for example in fields.get('examples', []):
            key = example.get('id')
            if example.get('steps') and (not key or node['kind'] not in LEVELS):
                errors.append(f'{identifier}/examples: mapped scenario requires an id and a supported owner')
            for step in example.get('steps', []):
                contributors = set()
                for contribution in step.get('contributions', []):
                    target_id = contribution['node_id']
                    target = nodes.get(target_id)
                    if not target or target['kind'] != 'capability':
                        errors.append(f'{identifier}/examples/steps: contribution must reference a capability: {target_id}')
                    if target_id in contributors:
                        errors.append(f'{identifier}/examples/steps: duplicate capability {target_id}')
                    contributors.add(target_id)
            if key:
                if node['kind'] not in LEVELS:
                    errors.append(f'{identifier}/examples: shared scenarios require a domain, subdomain or capability')
                if key in seen:
                    errors.append(f'{identifier}/examples: duplicate scenario id {key}')
                seen.add(key)
            for contribution in example.get('contributions', []):
                target = nodes.get(contribution['node_id'])
                if not target or target['kind'] not in LEVELS:
                    errors.append(f'{identifier}/examples: invalid contribution {contribution["node_id"]}')
        seen_refs = set()
        for ref in fields.get('scenario_refs', []):
            pair = (ref['node_id'], ref['scenario_id'])
            owner = nodes.get(ref['node_id'])
            if node['kind'] not in LEVELS:
                errors.append(f'{identifier}/scenario_refs: unsupported level')
            if pair in seen_refs or ref['node_id'] == identifier:
                errors.append(f'{identifier}/scenario_refs: duplicate or self reference {pair}')
            seen_refs.add(pair)
            if not owner or owner['kind'] not in LEVELS or not any(
                e.get('id') == ref['scenario_id'] for e in owner.get('fields', {}).get('examples', [])
            ):
                errors.append(f'{identifier}/scenario_refs: missing directly defined scenario {pair}')
    return errors


def scenario_coverage(model):
    """Measure explicit mapping only. Mentioning a node in prose is not coverage."""
    capabilities = {n['id'] for n in model['nodes'] if n['kind'] == 'capability'}
    mapped = set()
    scenarios = []
    catalog = model.get('scenario_catalog', {})
    for scenario in catalog.get('scenarios', []):
        paths = [p for p in catalog['paths'] if p['scenario_id'] == scenario['id']]
        steps = [s for p in paths for s in p['steps']]
        covered = capabilities & {c['node_id'] for s in steps for c in s['contributions']}
        mapped.update(covered)
        scenarios.append({'scenario_id': scenario['id'], 'title': scenario['title'],
                          'steps': len(steps), 'path_count': len(paths), 'capability_ids': sorted(covered)})
    for node in model['nodes']:
        for index, example in enumerate(node.get('fields', {}).get('examples', [])):
            referenced = {c['node_id'] for c in example.get('contributions', [])}
            for step in example.get('steps', []):
                referenced.update(c['node_id'] for c in step['contributions'])
            covered = capabilities & referenced
            mapped.update(covered)
            scenarios.append({'owner_id': node['id'], 'scenario_id': example.get('id'),
                              'index': index, 'title': example['title'], 'steps': len(example.get('steps', [])),
                              'capability_ids': sorted(covered)})
    return {'structured_examples': len(scenarios), 'mapped_scenarios': sum(bool(s['capability_ids']) for s in scenarios),
            'stories_with_steps': sum(bool(s['steps']) for s in scenarios), 'capabilities': len(capabilities),
            'mapped_capabilities': len(mapped), 'unmapped_capabilities': sorted(capabilities - mapped),
            'scenarios': scenarios,
            'meaning': 'Mapping explicite illustratif ; ni couverture de réalisation ni validation du modèle métier.'}


def scenarios_for_node(node, nodes):
    fields = node.get('fields', {})
    result = deepcopy(fields.get('examples', []))
    for ref in fields.get('scenario_refs', []):
        owner = nodes.get(ref['node_id'], {})
        example = next((e for e in owner.get('fields', {}).get('examples', [])
                        if e.get('id') == ref['scenario_id']), None)
        if example:
            result.append({**deepcopy(example), 'source_node': ref['node_id'], 'contribution': ref['contribution']})
    return result
