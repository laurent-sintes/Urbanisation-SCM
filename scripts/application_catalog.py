"""Validate the application overlay without making products business nodes."""

from pathlib import Path
from datetime import date


CONTEXT_PERSPECTIVES = {
    'beaumanoir-historique': 'as_is',
    'boardriders': 'as_is',
    'sarenza': 'as_is',
    'flow-platform': 'target',
}
BUSINESS_KINDS = {'universe', 'business_system', 'domain', 'area', 'business_area', 'capability', 'behavior'}


def _date_errors(value, label):
    try:
        date.fromisoformat(value)
    except (TypeError, ValueError):
        return [f'application_catalog/{label}: invalid date']
    return []


def validate_catalog(model, *, require_function_mapping=False):
    catalog = model.get('application_catalog')
    if catalog is None:
        return []  # Historical releases predate this optional catalogue.
    errors = []
    products = {}
    component_owner = {}
    for product in catalog['products']:
        product_id = product['id']
        if product_id in products:
            errors.append(f'application_catalog: duplicate product {product_id}')
            continue
        products[product_id] = product
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
        if require_function_mapping and product['kind'] == 'vendor_product':
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
