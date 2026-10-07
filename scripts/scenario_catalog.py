"""Autonomous illustrative scenarios, frozen with their publication.

An explicit field agreement is an immutable value hash, never inherited from
a legacy owner or from a release operation. New editorial content is proposed.
"""
from copy import deepcopy
try:
    from .element_versions import content_hash
except ImportError:
    from element_versions import content_hash

COLLECTIONS = ('value_streams', 'scenarios', 'paths')


def validate_catalog(model):
    catalog = model.get('scenario_catalog')
    if catalog is None:
        return []
    errors = []
    nodes = {n['id']: n for n in model['nodes']}
    indexes = {}
    for collection in COLLECTIONS:
        items = catalog.get(collection, [])
        indexes[collection] = {i['id']: i for i in items}
        if len(indexes[collection]) != len(items):
            errors.append(f'scenario_catalog/{collection}: duplicate identity')
        for item in items:
            for agreement in item.get('field_agreements', []):
                field = agreement['field']
                if field not in item or content_hash({'value': item[field]}) != agreement['value_sha256']:
                    errors.append(f'scenario_catalog/{item["id"]}: stale field agreement {field}')
    all_ids = [i['id'] for c in COLLECTIONS for i in catalog[c]]
    if len(set(all_ids)) != len(all_ids):
        errors.append('scenario_catalog: identity shared by collections')
    for facet, values in catalog['facets'].items():
        if len({v['id'] for v in values}) != len(values):
            errors.append(f'scenario_catalog: duplicate facet identity: {facet}')
    for stream in catalog['value_streams']:
        ids = [s['id'] for s in stream['stages']]
        if len(set(ids)) != len(ids):
            errors.append(f'{stream["id"]}: duplicate value stage')
    for scenario in catalog['scenarios']:
        if not scenario['value_stream_ids'] or len(set(scenario['value_stream_ids'])) != len(scenario['value_stream_ids']):
            errors.append(f'{scenario["id"]}: classification missing or duplicated')
        for stream in scenario['value_stream_ids']:
            if stream not in indexes['value_streams']:
                errors.append(f'{scenario["id"]}: missing value stream {stream}')
        for facet in ('events', 'objects', 'situations'):
            allowed = {v['id'] for v in catalog['facets'][facet]}
            if not scenario[facet] or not set(scenario[facet]) <= allowed:
                errors.append(f'{scenario["id"]}: invalid facet {facet}')
        if not any(p['scenario_id'] == scenario['id'] for p in catalog['paths']):
            errors.append(f'{scenario["id"]}: no mobilization path')
    for path in catalog['paths']:
        if path['scenario_id'] not in indexes['scenarios']:
            errors.append(f'{path["id"]}: missing scenario')
        ids = [s['id'] for s in path['steps']]
        if len(set(ids)) != len(ids):
            errors.append(f'{path["id"]}: duplicate step')
        for step in path['steps']:
            contributions = [c['node_id'] for c in step['contributions']]
            if not contributions or len(set(contributions)) != len(contributions):
                errors.append(f'{path["id"]}/{step["id"]}: empty or duplicate contributions')
            for target in contributions:
                if nodes.get(target, {}).get('kind') not in {'capability', 'reference'}:
                    errors.append(f'{path["id"]}: contribution must reference a published capability or reference: {target}')
        for edge in path['dependencies']:
            if edge['from'] not in ids or edge['to'] not in ids:
                errors.append(f'{path["id"]}: missing dependency endpoint')
    aliases = set()
    for alias in catalog['legacy_links']:
        if alias['scenario_id'] not in indexes['scenarios']:
            errors.append('scenario_catalog: missing legacy target')
        if alias['owner_id'] not in nodes:
            errors.append('scenario_catalog: missing legacy owner: ' + alias['owner_id'])
        identity = (alias['owner_id'], alias['legacy_id'], alias['scenario_id'])
        if identity in aliases:
            errors.append('scenario_catalog: duplicate legacy link')
        aliases.add(identity)
    return errors


def assign_catalog_versions(snapshot, previous, stamp):
    catalog = snapshot.get('scenario_catalog')
    if catalog is None:
        return []
    old_catalog = previous.get('scenario_catalog', {})
    changes = []
    for collection in COLLECTIONS:
        before = {i['id']: i for i in old_catalog.get(collection, [])}
        for item in catalog[collection]:
            old = before.get(item['id'], {})
            digest = content_hash(item)
            changed = digest != old.get('content_sha256')
            item.update(content_sha256=digest,
                        revision=old.get('revision', 0) + int(changed),
                        last_modified=stamp if changed else old['last_modified'])
            if changed:
                changes.append({'collection': 'scenario_' + collection, 'id': item['id'],
                                'revision': item['revision'], 'reason': 'changed' if old else 'new',
                                'last_modified': item['last_modified']})
    digest = content_hash(catalog)
    changed = digest != old_catalog.get('content_sha256')
    catalog.update(content_sha256=digest, revision=old_catalog.get('revision', 0) + int(changed),
                   last_modified=stamp if changed else old_catalog['last_modified'])
    return changes


def record_field_agreement(catalog, collection, identifier, fields, source_refs):
    """Caller must supply the actual authorized fields and source, not defaults."""
    result = deepcopy(catalog)
    item = next(i for i in result[collection] if i['id'] == identifier)
    for field in fields:
        if field in ('field_agreements', 'review', 'revision', 'last_modified', 'content_sha256'):
            raise ValueError('Not a business field')
        item.setdefault('field_agreements', []).append({
            'field': field, 'source_refs': list(source_refs),
            'value_sha256': content_hash({'value': item[field]})})
    return result
