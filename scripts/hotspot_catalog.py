"""Validate autonomous hotspots against the model snapshot they annotate."""

LEVELS = ('S', 'M', 'L', 'XL')
MATRIX = (
    ('S', 'M', 'L', 'XL'),
    ('M', 'L', 'L', 'XL'),
    ('L', 'L', 'XL', 'XL'),
    ('XL', 'XL', 'XL', 'XL'),
)


def severity_for(political, implementation):
    if political == 'unassessed' or implementation == 'unassessed':
        return 'unassessed'
    return MATRIX[LEVELS.index(political)][LEVELS.index(implementation)]


def validate_catalog(model):
    catalog = model.get('hotspot_catalog')
    if catalog is None:
        return []
    nodes = {node['id']: node for node in model['nodes']}
    errors = []
    ids = set()
    for hotspot in catalog['hotspots']:
        identifier = hotspot['id']
        if identifier in ids:
            errors.append(f'hotspot_catalog: duplicate identity {identifier}')
        ids.add(identifier)
        anchors = hotspot['location']['node_ids']
        if hotspot['kind'] == 'integration' and len(anchors) != 2:
            errors.append(f'{identifier}: integration requires exactly two anchors')
        if hotspot['kind'] == 'scope' and not anchors:
            errors.append(f'{identifier}: scope requires an anchor')
        for anchor in anchors:
            if anchor not in nodes:
                errors.append(f'{identifier}: missing anchor {anchor}')
        options = {option['id'] for option in hotspot['resolution_options']}
        if len(options) != len(hotspot['resolution_options']):
            errors.append(f'{identifier}: duplicate resolution option')
        selected = hotspot.get('selected_option_id')
        if selected and selected not in options:
            errors.append(f'{identifier}: selected option is missing')
        if hotspot['status'] == 'resolved' and (not selected or not hotspot.get('resolution_note')):
            errors.append(f'{identifier}: resolved hotspot requires a selected option and resolution note')
        if hotspot['status'] != 'resolved' and selected:
            errors.append(f'{identifier}: selected option requires resolved status')
        complexity = hotspot['complexity']
        if hotspot['severity'] != severity_for(complexity['political'], complexity['implementation']):
            errors.append(f'{identifier}: severity does not match matrix-v1')
        if any(complexity[axis] != 'unassessed' for axis in ('political', 'implementation')) and not complexity['rationale'].strip():
            errors.append(f'{identifier}: assessed complexity requires a rationale')
    return errors
