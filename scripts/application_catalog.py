"""Validate the application overlay without making products business nodes."""

from pathlib import Path
from datetime import date
import re


def panorama_owners(root=None):
    """Read the explicitly indexed, hash-verified As Is snapshots only."""
    try:
        from .structured_io import read
    except ImportError:
        from structured_io import read
    root = Path(root or Path(__file__).resolve().parents[1]).resolve()
    index = read(root / 'modeles/panorama-as-is/current.json')
    owners = {}
    for pointer in index['panoramas']:
        path = (root / pointer['path']).resolve()
        if not path.is_relative_to(root / 'modeles/panorama-as-is'):
            raise ValueError('As Is panorama path escapes its directory')
        panorama = read(path, expected_sha256=pointer['sha256'])
        context_id = pointer['model_id'].removesuffix('-si')
        for record in panorama['objects']:
            owners.setdefault(record['id'], set()).add(context_id)
    return owners


CONTEXT_PERSPECTIVES = {
    'beaumanoir-historique': 'as_is',
    'boardriders': 'as_is',
    'sarenza': 'as_is',
    'flow-platform': 'target',
}
BUSINESS_KINDS = {'universe', 'business_system', 'domain', 'area', 'business_area', 'capability', 'behavior'}
CHANNEL_NODES = {
    'store': {'subdomain-sales-b2c-store'},
    'online_b2c': {'subdomain-sales-b2c-ecommerce'},
    'wholesale_b2b': {'subdomain-sales-wholesale', 'ba-wholesale-sales', 'ba-wholesale-account-management'},
}


def _date_errors(value, label):
    try:
        date.fromisoformat(value)
    except (TypeError, ValueError):
        return [f'application_catalog/{label}: invalid date']
    return []


def _documentation_errors(product):
    documentation = product.get('documentation')
    if not documentation:
        return []  # Historical publications keep their original contract.
    label = product['id'] + '/documentation'
    errors = _date_errors(documentation['reviewed_on'], label + '/reviewed_on')
    errors.extend(_date_errors(documentation['release_tracking']['checked_on'], label + '/release_tracking/checked_on'))
    if product['kind'] == 'vendor_product' and not product.get('branding'):
        errors.append(f'application_catalog/{label}: reviewed vendor product needs a logo')
    sources = {source['url'] for source in documentation['sources']}
    for milestone in documentation['history']:
        value = milestone['date']
        normalized = value + ('-01-01' if len(value) == 4 else '-01' if len(value) == 7 else '')
        if not re.fullmatch(r'\d{4}(-\d{2}(-\d{2})?)?', value) or _date_errors(normalized, label):
            errors.append(f'application_catalog/{label}: invalid milestone date')
        if milestone['source_url'] not in sources:
            errors.append(f'application_catalog/{label}: milestone needs a consulted source')
    if documentation['release_tracking']['source_url'] not in sources:
        errors.append(f'application_catalog/{label}: release tracking needs a consulted source')
    linked = {mapping['node_id'] for mapping in product.get('offering_mappings', [])}
    for channel in documentation['channels']:
        if not linked.intersection(CHANNEL_NODES.get(channel, set())):
            errors.append(f'application_catalog/{label}: documented channel has no business mapping: {channel}')
    return errors


def validate_catalog(model, *, require_function_mapping=False, panorama_records=None):
    catalog = model.get('application_catalog')
    if catalog is None:
        return []  # Historical releases predate this optional catalogue.
    errors = []
    if 'contexts' in catalog:
        contexts = [context['id'] for context in catalog['contexts']]
        if len(set(contexts)) != len(contexts):
            errors.append('application_catalog: duplicate context descriptor')
        if any(selection['context_id'] not in contexts for selection in catalog['selections']):
            errors.append('application_catalog: selection context has no descriptor')
    panorama_refs = any(selection.get('panorama_ref') for selection in catalog['selections'])
    if panorama_refs and panorama_records is None:
        try:
            panorama_records = panorama_owners()
        except (OSError, ValueError, KeyError) as exc:
            errors.append('application_catalog: unverifiable frozen As Is panorama: ' + str(exc))
            panorama_records = {}
    products = {}
    component_owner = {}
    for product in catalog['products']:
        product_id = product['id']
        if product_id in products:
            errors.append(f'application_catalog: duplicate product {product_id}')
            continue
        products[product_id] = product
        errors.extend(_documentation_errors(product))
        if 'launched_on' in product:
            errors.extend(_date_errors(product['launched_on'], product_id + '/launched_on'))
        latest_release = product.get('latest_release')
        if latest_release:
            for field in ('released_on', 'checked_on'):
                if field in latest_release:
                    errors.extend(_date_errors(latest_release[field], product_id + '/latest_release/' + field))
        branding = product.get('branding')
        if branding:
            errors.extend(_date_errors(branding['checked_on'], product_id + '/branding/checked_on'))
            assets = (Path(__file__).resolve().parents[1] / 'app/public/assets').resolve()
            logo = (assets.parent / branding['logo_path']).resolve()
            if not logo.is_relative_to(assets) or not logo.is_file():
                errors.append(f'application_catalog/{product_id}: missing or unsafe logo asset')
        components = {}
        for component in product['components']:
            identifier = component['id']
            if identifier in component_owner:
                errors.append(f'application_catalog: duplicate component {identifier}')
            component_owner[identifier] = product_id
            components[identifier] = component
        roots = [item for item in components.values() if 'parent_id' not in item]
        if len(roots) != 1 or roots[0]['kind'] != 'product':
            errors.append(f'application_catalog/{product_id}: exactly one product root is required')
        for component in components.values():
            parent = component.get('parent_id')
            if component['kind'] == 'product' and parent:
                errors.append(f'application_catalog/{component["id"]}: product cannot have a parent')
            if component['kind'] != 'product' and not parent:
                errors.append(f'application_catalog/{component["id"]}: component needs a parent')
            if parent and parent not in components:
                errors.append(f'application_catalog/{component["id"]}: unknown parent {parent}')
            seen = {component['id']}
            while parent in components:
                if parent in seen:
                    errors.append(f'application_catalog/{component["id"]}: component cycle')
                    break
                seen.add(parent)
                parent = components[parent].get('parent_id')
    nodes = {item['id']: item for item in model['nodes']}
    selections = set()
    mappings = set()
    for product in catalog['products']:
        if product['kind'] == 'internal_product' and product.get('offering_mappings'):
            errors.append(f'application_catalog/{product["id"]}: internal product cannot claim a vendor offering')
        if (require_function_mapping or product.get('documentation')) and product['kind'] == 'vendor_product':
            mapped_components = {item['component_id'] for item in product.get('offering_mappings', [])}
            for component in product['components']:
                if component['kind'] != 'product' and component['id'] not in mapped_components:
                    errors.append(f'application_catalog/{component["id"]}: vendor component needs a business mapping')
        for mapping in product.get('offering_mappings', []):
            mapping_id = mapping['id']
            if mapping_id in mappings:
                errors.append(f'application_catalog: duplicate mapping {mapping_id}')
            mappings.add(mapping_id)
            if component_owner.get(mapping['component_id']) != product['id']:
                errors.append(f'application_catalog/{mapping_id}: foreign component')
            node = nodes.get(mapping['node_id'])
            if not node or node.get('kind') not in BUSINESS_KINDS:
                errors.append(f'application_catalog/{mapping_id}: unknown business node {mapping["node_id"]}')
            if mapping['evidence_state'] not in {'documented', 'candidate'} or not mapping.get('source_url'):
                errors.append(f'application_catalog/{mapping_id}: vendor offering needs a primary source and a documented or candidate state')
            if mapping['role'] == 'planned_support':
                errors.append(f'application_catalog/{mapping_id}: vendor offering cannot be planned support')
    for selection in catalog['selections']:
        identifier = selection['id']
        if identifier in selections:
            errors.append(f'application_catalog: duplicate selection {identifier}')
        selections.add(identifier)
        product_id = selection['product_id']
        if product_id not in products:
            errors.append(f'application_catalog/{identifier}: unknown product {product_id}')
        if selection['perspective'] != CONTEXT_PERSPECTIVES.get(selection['context_id']):
            errors.append(f'application_catalog/{identifier}: context/perspective mismatch')
        if selection['perspective'] == 'target' and selection['presence'] != 'planned':
            errors.append(f'application_catalog/{identifier}: target selection must be planned')
        if selection['perspective'] == 'as_is' and selection['presence'] == 'planned':
            errors.append(f'application_catalog/{identifier}: As Is selection cannot be planned')
        if selection.get('panorama_ref') and selection['perspective'] != 'as_is':
            errors.append(f'application_catalog/{identifier}: target cannot cite an As Is record')
        if selection.get('panorama_ref'):
            owners = (panorama_records or {}).get(selection['panorama_ref'], set())
            if not owners:
                errors.append(f'application_catalog/{identifier}: unknown panorama_ref {selection["panorama_ref"]}')
            elif selection['context_id'] not in owners:
                errors.append(f'application_catalog/{identifier}: panorama_ref belongs to another SI: {selection["panorama_ref"]}')
        if selection.get('deployed_version') and selection['perspective'] != 'as_is':
            errors.append(f'application_catalog/{identifier}: target cannot claim a deployed version')
        if 'deployed_on' in selection:
            errors.extend(_date_errors(selection['deployed_on'], identifier + '/deployed_on'))
        states = set()
        for state in selection['component_states']:
            component_id = state['component_id']
            if component_id in states:
                errors.append(f'application_catalog/{identifier}: duplicate state {component_id}')
            states.add(component_id)
            if component_owner.get(component_id) != product_id:
                errors.append(f'application_catalog/{identifier}: foreign component {component_id}')
        for mapping in selection['mappings']:
            mapping_id = mapping['id']
            if mapping_id in mappings:
                errors.append(f'application_catalog: duplicate mapping {mapping_id}')
            mappings.add(mapping_id)
            if component_owner.get(mapping['component_id']) != product_id:
                errors.append(f'application_catalog/{mapping_id}: foreign component')
            node = nodes.get(mapping['node_id'])
            if not node or node.get('kind') not in BUSINESS_KINDS:
                errors.append(f'application_catalog/{mapping_id}: unknown business node {mapping["node_id"]}')
            if selection['perspective'] == 'target' and mapping['evidence_state'] != 'planned':
                errors.append(f'application_catalog/{mapping_id}: target mapping must be planned')
            if selection['perspective'] == 'as_is' and mapping['evidence_state'] == 'planned':
                errors.append(f'application_catalog/{mapping_id}: As Is mapping cannot be planned')
    return errors
