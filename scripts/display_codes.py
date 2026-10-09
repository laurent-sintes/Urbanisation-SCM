"""Versioned reading order and codes; persistent object IDs never change."""
POLICY = 'typed-tree-v1'
PREFIXES = {'universe': 'UNI', 'business_system': 'SYS', 'domain': 'DOM', 'area': 'SUB', 'business_area': 'BA',
            'reference': 'REF', 'capability': 'CAP', 'behavior': 'BHV'}
NATURES = ['integration', 'action', 'management', 'ledger', 'knowledge',
           'orchestration', 'planning', 'policy', 'evaluation', 'decision']


def build_display_index(model):
    if model.get('display_policy') != POLICY:
        raise ValueError('Unknown display policy')
    nodes = {n['id']: n for n in model['nodes']}
    children = {identifier: [] for identifier in nodes}
    parents = {}
    for relation in model['relations']:
        if relation['type'] not in ('contains', 'presents'):
            continue
        parent, child = relation['source_id'], relation['target_id']
        if parent not in nodes or child not in nodes or child in parents:
            raise ValueError('Display tree: missing endpoint or duplicate parent')
        parents[child] = parent
        children[parent].append(child)
    def type_rank(identifier):
        node = nodes[identifier]
        nature = node.get('fields', {}).get('nature')
        return -1 if node['kind'] != 'capability' else NATURES.index(nature) if nature in NATURES else len(NATURES)
    for identifier, items in children.items():
        kind = nodes[identifier]['kind']
        if kind == 'area':
            groups = {}
            orders = {}
            for child in items:
                node = nodes[child]
                category = node.get('fields', {}).get('category') if node['kind'] == 'capability' else None
                key = category['id'] if category else None
                groups.setdefault(key, []).append(child)
                orders.setdefault(key, category.get('order', 0) if category else 0)
            children[identifier] = [child for key in sorted(groups, key=lambda key: (key is None, orders[key]))
                                    for child in sorted(groups[key], key=type_rank)]
        elif kind in ('domain', 'reference', 'business_area'):
            explicit = [nodes[child].get('fields', {}).get('reading_order') for child in items]
            if any(order is not None for order in explicit):
                if any(order is None for order in explicit):
                    raise ValueError(f'Display tree: incomplete reading order under {identifier}')
                children[identifier] = sorted(items, key=lambda child: (
                    nodes[child]['fields']['reading_order'], type_rank(child)))
            else:
                children[identifier] = sorted(items, key=type_rank)
        elif kind == 'capability':
            # Same trigger/activity groups in tree, cards and behavior sheets.
            ranks = {'trigger': 0, 'activity': 1}
            children[identifier] = sorted(items, key=lambda child: ranks.get(nodes[child].get('fields', {}).get('behavior_aspect'), 2))
    roots = [n['id'] for n in model['nodes'] if n['id'] not in parents]
    visited, codes, counts = set(), {}, {}
    def visit(identifier):
        if identifier in visited:
            raise ValueError('Display tree: duplicate node or cycle')
        visited.add(identifier)
        kind = nodes[identifier]['kind']
        if kind in PREFIXES:
            counts[kind] = counts.get(kind, 0) + 1
            codes[identifier] = f'{PREFIXES[kind]}-{counts[kind]:03d}'
        for child in children[identifier]:
            visit(child)
    for root in roots:
        visit(root)
    if visited != set(nodes):
        raise ValueError('Display tree: unreachable cycle')
    return {'policy': POLICY, 'roots': roots, 'children': children, 'codes': codes}


def validate_display_index(model):
    policy, index = model.get('display_policy'), model.get('display_index')
    if policy is None:
        return ['display_index: missing policy'] if index is not None else []
    try:
        expected = build_display_index(model)
    except (ValueError, KeyError, TypeError) as exc:
        return [f'display_index: {exc}']
    if model.get('space') == 'release' and index != expected:
        return ['display_index: codes and reading order differ from the frozen snapshot']
    if model.get('space') == 'backlog' and index is not None:
        return ['display_index: generated at publication only; do not maintain a second catalogue']
    return []
