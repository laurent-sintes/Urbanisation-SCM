"""Validate editorial references inside the same model; no external or backlog lookup."""


def validate_pedagogy(model):
    nodes = {node['id']: node for node in model.get('nodes', [])}
    errors = []
    for identifier, node in nodes.items():
        fields = node.get('fields', {})
        for collection in ('examples', 'market_comparisons'):
            ids = [item['id'] for item in fields.get(collection, []) if item.get('id')]
            if len(ids) != len(set(ids)):
                errors.append(f'pedagogy/{identifier}/{collection}: duplicate identity')
        block = fields.get('pedagogical_description')
        if not block:
            continue
        for key, collection, ref_key in (
            ('example_refs', 'examples', 'example_id'),
            ('market_comparison_refs', 'market_comparisons', 'comparison_id'),
        ):
            for ref in block.get(key, []):
                matches = [item for item in nodes.get(ref['node_id'], {}).get('fields', {}).get(collection, [])
                           if item.get('id') == ref[ref_key]]
                if len(matches) != 1:
                    errors.append(f'pedagogy/{identifier}/{key}: reference must resolve exactly once: {ref}')
                elif key == 'example_refs':
                    example = matches[0]
                    if not example.get('outcome') or not ref.get('contribution', '').strip():
                        errors.append(f'pedagogy/{identifier}/{key}: result and explicit contribution required')
        neighbors = [ref['node_id'] for ref in block.get('distinctions', [])]
        if len(neighbors) != len(set(neighbors)):
            errors.append(f'pedagogy/{identifier}/distinctions: duplicate neighbor')
        for neighbor in neighbors:
            if neighbor not in nodes or neighbor == identifier:
                errors.append(f'pedagogy/{identifier}/distinctions: invalid neighbor {neighbor}')
    return errors
