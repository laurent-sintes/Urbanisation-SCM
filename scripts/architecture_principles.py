"""Published directing principles: typed reading links and conservative context.

Legacy principles remain global. Only the documented presentation fields are
editorial; unknown fields and every normative field remain significant.
"""
from copy import deepcopy

PRESENTATION_FIELDS = frozenset({'name', 'label_fr', 'summary', 'category',
                                 'display_order', 'featured', 'references', 'examples'})
METADATA = frozenset({'revision', 'last_modified', 'content_sha256', 'source_refs',
                      'correction_refs', 'source_locator', 'review', 'lifecycle',
                      'editorial_basis', 'adoption_ids', 'approved_fields',
                      'proposed_fields', 'missing_fields'})


def normative_principle(principle):
    return {key: deepcopy(value) for key, value in principle.items()
            if key not in PRESENTATION_FIELDS | METADATA}


def ancestors(snapshot, seeds):
    selected = set(seeds)
    parents = {}
    for edge in snapshot.get('relations', []):
        if edge.get('type') in ('contains', 'presents'):
            parents.setdefault(edge['target_id'], set()).add(edge['source_id'])
    pending = list(selected)
    while pending:
        for parent in parents.get(pending.pop(), ()):
            if parent not in selected:
                selected.add(parent)
                pending.append(parent)
    return selected


def principle_anchors(principle, relations):
    anchors = set()
    edges = {edge['id']: edge for edge in relations}
    for target in principle.get('scope', {}).get('targets', []):
        if target['collection'] == 'nodes':
            anchors.add(target['id'])
        elif target['collection'] == 'relations' and target['id'] in edges:
            anchors.update(edges[target['id']][key] for key in ('source_id', 'target_id'))
    return anchors


def applicable_principles(snapshot, seeds):
    responsibility = ancestors(snapshot, seeds)
    result = {}
    for principle in snapshot.get('principles', []):
        scope = principle.get('scope', {})
        if (scope.get('kind', 'global') == 'global'
                or principle_anchors(principle, snapshot.get('relations', [])) & responsibility):
            result[principle['id']] = normative_principle(principle)
    return result


def validate_principles(model):
    errors = []
    known = {key: {item['id'] for item in model.get(key, [])}
             for key in ('nodes', 'relations', 'principles')}
    orders = set()
    for principle in model.get('principles', []):
        label = 'principles/' + principle['id']
        if 'display_order' in principle and principle['display_order'] < 1:
            errors.append(label + ': display_order must be positive')
        if principle.get('featured'):
            for key in ('name', 'label_fr', 'summary', 'rationale', 'implications', 'tradeoffs', 'scope', 'display_order'):
                if not principle.get(key):
                    errors.append(label + ': featured principle requires ' + key)
            order = principle.get('display_order')
            if order in orders:
                errors.append(label + ': duplicate featured display_order')
            orders.add(order)
        scope = principle.get('scope')
        if scope:
            targets = scope.get('targets', [])
            if scope['kind'] == 'targeted' and not targets:
                errors.append(label + ': targeted scope requires targets')
            seen = set()
            for target in targets:
                key = (target['collection'], target['id'])
                if key in seen or target['id'] not in known.get(target['collection'], set()):
                    errors.append(label + ': duplicate or unknown scope target ' + str(key))
                seen.add(key)
        for related in principle.get('related_principles', []) + principle.get('supersedes', []):
            if related == principle['id'] or related not in known['principles']:
                errors.append(label + ': invalid related principle ' + related)
        for ref in principle.get('references', []):
            if not ref['url'].startswith('https://'):
                errors.append(label + ': reference must use HTTPS')
    return errors
