from copy import deepcopy
import unittest

from scripts.application_catalog import validate_catalog
from scripts.atlas_metamodel import _catalog_types
from scripts.structured_io import read


class ApplicationCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read('modeles/backlog/model.yaml')

    def test_pilot_has_distinct_contexts_and_no_implied_activation(self):
        self.assertEqual(validate_catalog(self.model), [])
        catalog = self.model['application_catalog']
        elastic = [item for item in catalog['selections'] if item['product_id'] == 'product-elastic-suite']
        self.assertEqual({item['context_id'] for item in elastic}, {'beaumanoir-historique', 'boardriders'})
        self.assertTrue(all(state['activated'] == 'unknown' for item in elastic for state in item['component_states']))
        flow = next(item for item in catalog['selections'] if item['product_id'] == 'product-flow-core')
        self.assertEqual([(item['node_id'], item['evidence_state']) for item in flow['mappings']],
                         [('supply-chain-orchestration', 'planned')])

    def test_wrong_product_and_business_endpoint_are_rejected(self):
        model = deepcopy(self.model)
        selection = model['application_catalog']['selections'][0]
        selection['mappings'][0]['component_id'] = 'flow-core-root'
        selection['mappings'][0]['node_id'] = 'absent'
        errors = validate_catalog(model)
        self.assertTrue(any('foreign component' in error for error in errors))
        self.assertTrue(any('unknown business node' in error for error in errors))

    def test_panorama_reference_must_exist_in_the_selected_si(self):
        model = deepcopy(self.model)
        selection = next(s for s in model['application_catalog']['selections'] if s.get('panorama_ref'))
        selection['panorama_ref'] = 'APP-ABSENT'
        self.assertTrue(any('unknown panorama_ref APP-ABSENT' in e for e in validate_catalog(model)))
        selection['panorama_ref'] = 'APP-NEW' if selection['context_id'] != 'boardriders' else 'APP-ELA'
        self.assertTrue(any('panorama_ref belongs to another SI' in e for e in validate_catalog(model)))

    def test_component_cycle_is_rejected(self):
        model = deepcopy(self.model)
        components = model['application_catalog']['products'][0]['components']
        components[1]['parent_id'] = components[3]['id']
        errors = validate_catalog(model)
        self.assertTrue(any('component cycle' in error for error in errors))

    def test_export_metamodel_lists_the_catalog(self):
        types, counts = _catalog_types(self.model, {})
        paths = {item['path'] for item in types}
        self.assertIn('application_catalog.selections.mappings', paths)
        self.assertEqual(counts['application_catalog.products'], 13)
        self.assertEqual(counts['application_catalog.selections'], 14)

    def test_offering_links_require_a_primary_source_and_never_imply_si_use(self):
        catalog = self.model['application_catalog']
        newstore = next(item for item in catalog['products'] if item['id'] == 'product-newstore')
        selection = next(item for item in catalog['selections'] if item['id'] == 'selection-newstore-boardriders')
        self.assertTrue(any(item['component_id'] == 'newstore-order-routing' and item['node_id'] == 'D06.e'
                            for item in newstore['offering_mappings']))
        self.assertFalse(any(item['node_id'] == 'D06' for item in selection['mappings']))
        model = deepcopy(self.model)
        mapping = next(item for item in model['application_catalog']['products']
                       if item['id'] == 'product-newstore')['offering_mappings'][0]
        del mapping['source_url']
        self.assertTrue(any('vendor offering needs a primary source' in error for error in validate_catalog(model)))
        self.assertTrue(any(item['evidence_state'] == 'candidate' and item.get('source_url')
                            for product in catalog['products'] for item in product.get('offering_mappings', [])))

    def test_every_vendor_function_has_a_business_mapping(self):
        model = deepcopy(self.model)
        elastic = next(item for item in model['application_catalog']['products']
                       if item['id'] == 'product-elastic-suite')
        elastic['offering_mappings'] = [item for item in elastic['offering_mappings']
                                        if item['component_id'] != 'elastic-custom-collections']
        self.assertTrue(any('elastic-custom-collections: vendor component needs a business mapping' in error
                            for error in validate_catalog(model, require_function_mapping=True)))
        self.assertTrue(any('elastic-custom-collections: vendor component needs a business mapping' in error
                            for error in validate_catalog(model)))
        del elastic['documentation']
        self.assertFalse(any('elastic-custom-collections: vendor component needs a business mapping' in error
                             for error in validate_catalog(model)))

    def test_newstore_boardriders_distinguishes_offering_and_use(self):
        catalog = self.model['application_catalog']
        product = next(item for item in catalog['products'] if item['id'] == 'product-newstore')
        selection = next(item for item in catalog['selections'] if item['id'] == 'selection-newstore-boardriders')
        self.assertIn('newstore-pos', {item['id'] for item in product['components']})
        self.assertIn('newstore-order-management', {item['id'] for item in product['components']})
        self.assertEqual({item['component_id']: item['used'] for item in selection['component_states']},
                         {'newstore-core': 'declared', 'newstore-order-routing': 'no', 'newstore-shopping-app': 'documented'})
        self.assertEqual([(item['node_id'], item['evidence_state']) for item in selection['mappings']],
                         [('D04.i', 'declared'), ('subdomain-sales-b2c-ecommerce', 'declared'),
                          ('subdomain-sales-b2c-ecommerce', 'documented')])
        self.assertFalse(any(item['node_id'] == 'D06' for item in selection['mappings']))
        self.assertTrue(any(item['component_id'] == 'newstore-order-management'
                            and item['node_id'] == 'subdomain-sales-b2c-ecommerce'
                            for item in product['offering_mappings']))
        socloz = next(item for item in catalog['products'] if item['id'] == 'product-socloz')
        self.assertTrue(any(item['component_id'] == 'socloz-oms'
                            and item['node_id'] == 'subdomain-sales-b2c-ecommerce'
                            for item in socloz['offering_mappings']))
        socloz_selection = next(item for item in catalog['selections']
                                if item['id'] == 'selection-socloz-beaumanoir-historique')
        self.assertEqual([(item['node_id'], item['evidence_state']) for item in socloz_selection['mappings']],
                         [('subdomain-sales-b2c-ecommerce', 'candidate')])
        sfcc = next(item for item in catalog['selections'] if item['id'] == 'selection-sfcc-boardriders')
        self.assertEqual([(item['node_id'], item['evidence_state']) for item in sfcc['mappings']],
                         [('subdomain-sales-b2c-ecommerce', 'declared')])

    def test_boardriders_sap_tree_keeps_fulfillment_mapping_at_core_level(self):
        catalog = self.model['application_catalog']
        sap = next(item for item in catalog['products'] if item['id'] == 'product-sap-ecc')
        parents = {item['id']: item.get('parent_id') for item in sap['components']}
        self.assertEqual(parents['sap-allocation-run'], 'sap-afs')
        self.assertEqual(parents['sap-afs'], 'sap-ecc-core')
        self.assertEqual(parents['sap-ecc-mm-im'], 'sap-ecc-mm')
        selection = next(item for item in catalog['selections'] if item['product_id'] == sap['id'])
        self.assertEqual(selection['context_id'], 'boardriders')
        self.assertEqual(selection['component_states'], [{
            'component_id': 'sap-allocation-run', 'acquired': 'unknown',
            'activated': 'unknown', 'used': 'historical_document',
            'source_refs': ['U02', 'U942', 'U945', 'U953', 'U1115'],
        }])
        self.assertEqual([(item['component_id'], item['node_id'], item['evidence_state'])
                          for item in selection['mappings']], [
                              ('sap-ecc-core', 'D06', 'declared'),
                              ('sap-allocation-run', 'D03.o', 'historical_document')])

    def test_product_identity_does_not_infer_dates_or_deployments(self):
        catalog = self.model['application_catalog']
        elastic = next(item for item in catalog['products'] if item['id'] == 'product-elastic-suite')
        self.assertEqual(elastic['branding']['accent_color'], '#EC6A56')
        self.assertNotIn('launched_on', elastic)
        self.assertNotIn('latest_release', elastic)
        self.assertTrue(all('deployed_version' not in item for item in catalog['selections']))

    def test_reviewed_products_keep_channels_sources_and_logos_consistent(self):
        self.assertEqual(validate_catalog(self.model), [])
        model = deepcopy(self.model)
        product = next(p for p in model['application_catalog']['products'] if p['id'] == 'product-newstore')
        product['offering_mappings'] = [m for m in product['offering_mappings']
                                       if m['node_id'] != 'subdomain-sales-b2c-ecommerce']
        self.assertTrue(any('documented channel has no business mapping: online_b2c' in e
                            for e in validate_catalog(model)))
        del product['branding']
        self.assertTrue(any('reviewed vendor product needs a logo' in e for e in validate_catalog(model)))
        product['documentation']['history'][0]['date'] = '2025-02-30'
        self.assertTrue(any('invalid milestone date' in e for e in validate_catalog(model)))
        product['documentation']['history'][0]['source_url'] = 'https://unsupported.example/'
        self.assertTrue(any('milestone needs a consulted source' in e for e in validate_catalog(model)))

    def test_payment_mapping_does_not_confuse_customer_collection_and_rebates(self):
        product = next(p for p in self.model['application_catalog']['products'] if p['id'] == 'product-newstore')
        payment_nodes = {m['node_id'] for m in product['offering_mappings'] if m['component_id'] == 'newstore-payments'}
        self.assertIn('service-order-payment-collection', payment_nodes)
        self.assertNotIn('subdomain-commercial-settlement-management', payment_nodes)


if __name__ == '__main__':
    unittest.main()
