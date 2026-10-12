"""Validate autonomous hotspots against the model snapshot they annotate."""
try:
    from .hotspot_resolution import validate_resolution
except ImportError:
    from hotspot_resolution import validate_resolution

LEVELS = ('S', 'M', 'L', 'XL')
GAP_SUBJECT_KINDS = ('business_area', 'capability', 'behavior')
GAP_CONTEXTS = ('beaumanoir-historique', 'boardriders', 'sarenza')
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
    policy = catalog.get('criticality_policy')
    if policy and (policy.get('id') != 'matrix-v1' or policy.get('levels') != list(LEVELS) or policy.get('matrix') != [list(row) for row in MATRIX]):
        return ['Hotspot criticality policy differs from matrix-v1']
    nodes = {node['id']: node for node in model['nodes']}
    errors = []
    ids = set()
    for hotspot in catalog['hotspots']:
        identifier = hotspot['id']
        if 'visible' in hotspot and not isinstance(hotspot['visible'], bool):
            errors.append(f'{identifier}: visible must be a boolean')
        if identifier in ids:
            errors.append(f'hotspot_catalog: duplicate identity {identifier}')
        ids.add(identifier)
        impact = hotspot.get('framing_impact')
        if impact:
            category = impact['category']
            targets = impact['targets']
            if category == 'structuring' and not targets:
                errors.append(f'{identifier}: structuring impact requires a model target')
            if category != 'structuring' and targets:
                errors.append(f'{identifier}: usage or unassessed impact cannot declare a model target')
            expected = {'structuring': 'framing', 'usage': 'product_design', 'to_assess': 'qualification'}
            if category in expected and impact['follow_up'] != expected[category]:
                errors.append(f'{identifier}: framing impact and follow-up disagree')
            if not impact['rationale'].strip():
                errors.append(f'{identifier}: framing impact requires a rationale')
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
        gap_ids = set()
        for gap in hotspot.get('gap_analysis', []):
            gap_id = gap['id']
            if gap_id in gap_ids:
                errors.append(f'{identifier}: duplicate gap identity {gap_id}')
            gap_ids.add(gap_id)
            subject = nodes.get(gap['subject_node_id'])
            if subject is None or subject['kind'] not in GAP_SUBJECT_KINDS:
                errors.append(f'{identifier}/{gap_id}: gap subject must be a Business Area, capability or behavior')
            contexts = [observation['context_id'] for observation in gap['observations_by_context']]
            observations = gap['observations_by_context']
            keys = [(item['context_id'], item.get('observation_scope', {}).get('id', '')) for item in observations]
            if len(set(keys)) != len(keys):
                errors.append(f'{identifier}/{gap_id}: duplicate observation context or scope')
            for item in observations:
                scope = item.get('observation_scope')
                if contexts.count(item['context_id']) > 1 and not scope:
                    errors.append(f'{identifier}/{gap_id}: repeated context requires explicit observation scopes')
                if scope and any(not scope.get(field, '').strip() for field in ('id', 'label', 'description')):
                    errors.append(f'{identifier}/{gap_id}: observation scope requires identity, label and description')
            if any(context not in GAP_CONTEXTS for context in contexts):
                errors.append(f'{identifier}/{gap_id}: unknown As Is context')
            if any(option_id not in options for option_id in gap['resolution_option_ids']):
                errors.append(f'{identifier}/{gap_id}: gap resolution option is missing')
        errors.extend(f'{identifier}: {error}' for error in validate_resolution(hotspot))
        if 'resolution' not in hotspot and hotspot['status'] == 'resolved' and (not selected or not hotspot.get('resolution_note')):
            errors.append(f'{identifier}: resolved hotspot requires a selected option and resolution note')
        if 'resolution' not in hotspot and hotspot['status'] != 'resolved' and selected:
            errors.append(f'{identifier}: selected option requires resolved status')
        complexity = hotspot['complexity']
        if hotspot['severity'] != severity_for(complexity['political'], complexity['implementation']):
            errors.append(f'{identifier}: severity does not match matrix-v1')
        if any(not isinstance(complexity.get(key, ''), str) for key in ('political_rationale', 'implementation_rationale')):
            errors.append(f'{identifier}: per-axis rationale must be text')
        if any(complexity[axis] != 'unassessed' for axis in ('political', 'implementation')) and not complexity['rationale'].strip():
            errors.append(f'{identifier}: assessed complexity requires a rationale')
    return errors
