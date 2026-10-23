"""Business-system hierarchy is opt-in and preserves operational ownership."""
from copy import deepcopy
from pathlib import Path
import unittest

from scripts.structured_io import read
from scripts.validate_models import validate_urbanism
from scripts.backlog_delivery import check_delivery
from scripts.render_models import render
from scripts.test_readability_contract import business_scope

ROOT = Path(__file__).resolve().parents[1]


class BusinessSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')
        cls.model['glossary'] = read(ROOT / 'modeles/backlog/glossary.yaml')
        cls.sources = {s['id']: s for s in read(ROOT / 'modeles/provenance/source-records.json')['records']}
        cls.schema = read(ROOT / 'modeles/schemas/urbanism.schema.json')

    def errors(self, model):
        return validate_urbanism(model, self.sources, self.schema)

    def test_complete_structure_and_delivery(self):
        self.assertEqual(self.errors(self.model), [])
        self.assertEqual(check_delivery(ROOT, self.model)[1], [])
        self.assertIn('| beaumanoir-target-universe | Enterprise Architecture | Enterprise Architecture |', render(self.model, 'Fixture'))
        self.assertIn('| system-business-operations | Business Operations | Business System |', render(self.model, 'Fixture'))

    def test_universe_is_single_root_of_the_three_business_systems(self):
        model = deepcopy(self.model)
        universe = next(n for n in model['nodes'] if n['kind'] == 'universe')
        systems = {n['id'] for n in model['nodes'] if n['kind'] == 'business_system'}
        children = {r['target_id'] for r in model['relations'] if r['type'] == 'contains' and r['source_id'] == universe['id']}
        self.assertEqual(children, systems)
        model['relations'] = [r for r in model['relations'] if not (r['source_id'] == universe['id'] and r['target_id'] == 'system-business-operations')]
        self.assertTrue(any('invalid parent for business system' in e for e in self.errors(model)))

    def test_domain_requires_one_explicit_system_parent(self):
        for variant in ('orphan', 'duplicate', 'wrong-kind'):
            with self.subTest(variant=variant):
                model = deepcopy(self.model)
                edge = next(r for r in model['relations'] if r['target_id'] == 'domain-sales')
                if variant == 'orphan':
                    model['relations'].remove(edge)
                elif variant == 'duplicate':
                    model['relations'].append(dict(edge, id='SECOND-PARENT', source_id='system-design-development'))
                else:
                    edge['source_id'] = 'domain-sourcing-procurement'
                self.assertIn('business-system/domain-sales: domain requires exactly one business system parent', self.errors(model))

    def test_system_cannot_adopt_a_capability_directly(self):
        model = deepcopy(self.model)
        edge = next(r for r in model['relations'] if r['target_id'] == 'domain-sales')
        edge['target_id'] = 'D04.i'
        self.assertTrue(any('business system presents only domains' in error for error in self.errors(model)))

    def test_detailed_subdomains_have_explicit_roles(self):
        nodes = {node['id']: node for node in self.model['nodes']}
        from scripts.model_depth import context_business_area_ids
        context_areas = context_business_area_ids(self.model)
        detailed_areas = {edge['source_id'] for edge in self.model['relations']
                          if edge['type'] == 'contains' and nodes[edge['source_id']]['kind'] == 'area'
                          and nodes[edge['target_id']]['kind'] in ('business_area', 'capability')
                          and edge['target_id'] not in context_areas}
        self.assertTrue(detailed_areas)
        parents = {edge['target_id']: edge['source_id'] for edge in self.model['relations']
                   if edge['type'] in ('contains', 'presents')}
        def domain_of(area_id):
            while area_id in parents:
                area_id = parents[area_id]
                if nodes[area_id]['kind'] == 'domain': return area_id
            return None
        self.assertEqual([area_id for area_id in sorted(detailed_areas)
                          if domain_of(area_id) == 'supply-chain-orchestration'
                          if not nodes[area_id]['fields'].get('dominant_role')], [])

    def test_subdomain_role_labels_are_english_and_consistent(self):
        expected = {
            'commitments': 'Commitment Management',
            'data-state': 'Data & State',
            'decision-planning': 'Decision & Planning',
            'orchestration': 'Orchestration',
            'policies': 'Configuration Control',
            'processes': 'Process Management',
        }
        for node in self.model['nodes']:
            role = node['fields'].get('dominant_role')
            if role:
                self.assertEqual(role['display_name'], expected[role['id']], node['id'])

    def test_depth_cannot_be_attached_to_a_capability(self):
        model = deepcopy(self.model)
        next(n for n in model['nodes'] if n['id'] == 'D04.i')['fields']['modeling_depth'] = 'domains'
        self.assertTrue(any('modeling_depth requires' in error for error in self.errors(model)))

    def test_delivery_rejects_missing_presentation_edge_and_wrong_kind(self):
        model = deepcopy(self.model)
        model['relations'] = [r for r in model['relations'] if r['target_id'] != 'domain-sales']
        next(n for n in model['nodes'] if n['id'] == 'domain-sales')['kind'] = 'group'
        errors = check_delivery(ROOT, model)[1]
        self.assertTrue(any('missing parent: domain-sales' in e for e in errors))
        self.assertTrue(any('kind mismatch: domain-sales' in e for e in errors))

    def test_historical_model_does_not_require_systems(self):
        legacy = read(ROOT / 'modeles/release/2026-09-19.7/model.yaml')
        self.assertEqual(self.errors(legacy), [])

    def test_context_details_cannot_reappear_in_finance(self):
        model = deepcopy(self.model)
        area = next(n for n in model['nodes'] if n['kind'] == 'business_area')
        edge = next(r for r in model['relations'] if r['target_id'] == area['id'] and r['type'] == 'contains')
        edge['source_id'] = 'subdomain-financial-accounting'
        self.assertIn(f'model-depth/{area["id"]}: responsibility exceeds the declared domain depth', self.errors(model))
        next(n for n in model['nodes'] if n['id'] == 'domain-finance')['fields']['modeling_depth'] = 'behaviors'
        self.assertIn('model-depth/domain-finance: detailed modeling is reserved to Supply Chain Orchestration', self.errors(model))

    def test_retired_finance_detail_preserves_responsibility_and_real_exchange(self):
        nodes = {n['id']: n for n in self.model['nodes']}
        self.assertNotIn('accounting-interpretation', nodes)
        self.assertNotIn('ba-accounting-translation', nodes)
        from scripts.model_depth import responsibility_domains
        ancestry = responsibility_domains(self.model)
        allowed = {'supply-chain-orchestration', 'domain-sales', 'domain-sourcing-procurement', 'domain-plan'}
        self.assertTrue(all(len(ancestry[n['id']]) == 1 and ancestry[n['id']] <= allowed
                            for n in nodes.values() if n['kind'] == 'capability'))
        self.assertIn('glossary:TER119', nodes['subdomain-financial-accounting']['fields']['scope'])
        exchange = next(r for r in self.model['relations'] if r['id'] == 'REL-U981-accounting-facts')
        self.assertEqual((exchange['type'], exchange['source_id'], exchange['target_id']),
                         ('shares-data', 'accounting-data-provision', 'subdomain-financial-accounting'))
        from scripts.atlas_metamodel import describe_metamodel
        rules = describe_metamodel(self.model, {'status': 'unavailable'})['constraints']
        self.assertTrue(any(r['id'] == 'orchestration-detail-scope' for r in rules))
        step = next(s for p in self.model['scenario_catalog']['paths'] for s in p['steps']
                    if p['id'] == 'intercompany-direct-delivery-path' and s['id'] == 'accounting-facts')
        self.assertEqual([c['node_id'] for c in step['contributions']], ['accounting-data-provision'])
        self.assertIn('model:subdomain-financial-accounting', step['description'])
        hotspot = next(h for h in self.model['hotspot_catalog']['hotspots'] if h['id'] == 'HS-021')
        self.assertEqual(hotspot['location']['node_ids'], ['accounting-data-provision', 'subdomain-financial-accounting'])

    def test_commerce_retail_split_preserves_identities_and_boundaries(self):
        nodes = {n['id']: n for n in self.model['nodes']}
        expected = {
            'domain-sales': ('Commerce', 'system-business-operations'),
            'subdomain-sales-b2c-store': ('Store Sales', 'subdomain-retail-commerce'),
            'subdomain-sales-b2c-ecommerce': ('Digital Commerce', 'subdomain-retail-commerce'),
            'subdomain-sales-wholesale': ('Wholesale Commerce', 'domain-sales'),
            'subdomain-assortment-catalog-management': ('Assortment & Catalog Management', 'domain-sales'),
            'subdomain-retail-network-management': ('Retail Network Management', 'subdomain-retail-commerce'),
            'subdomain-store-backoffice-operations': ('Store Operations', 'subdomain-retail-commerce'),
            'subdomain-pricing-promotions-management': ('Pricing & Promotions Management', 'domain-sales'),
            'subdomain-rebates-incentives-management': ('Rebates & Incentives Management', 'domain-sales'),
            'subdomain-commercial-settlement-management': ('Commercial Settlement Management', 'domain-finance'),
        }
        terms = {t['name']: t for t in self.model['glossary']['terms']}
        self.assertNotIn('domain-retail-operations', nodes)
        for node_id, (name, parent) in expected.items():
            with self.subTest(node_id=node_id):
                self.assertEqual(nodes[node_id]['fields']['name'], name)
                parents = [r['source_id'] for r in self.model['relations']
                           if r['type'] in ('presents','contains') and r['target_id'] == node_id]
                self.assertEqual(parents, [parent])
                self.assertEqual(business_scope(terms[name]['context'], self.model),
                                 business_scope(nodes[node_id]['fields']['scope'], self.model))
        backoffice = nodes['subdomain-store-backoffice-operations']['fields']['scope']
        self.assertIn('central ou local', backoffice)
        self.assertIn('model:subdomain-sales-b2c-store', backoffice)
        self.assertIn('model:subdomain-retail-network-management', backoffice)
        digital = nodes['subdomain-sales-b2c-ecommerce']['fields']['scope']
        self.assertIn('Wholesale Commerce', digital)
        self.assertEqual(len([n for n in nodes.values() if n['kind'] == 'business_system']), 4)

    def test_price_producer_and_settlement_remain_outside_orchestration(self):
        nodes = {n['id']: n for n in self.model['nodes']}
        exchanges = {r['id']: r for r in self.model['relations'] if r['type'] == 'shares-data'}
        expected = {
            'contextual-prices': ('cap-sales-price-determination', 'D04.i'),
            'commercial-benefit-conditions': ('subdomain-rebates-incentives-management', 'subdomain-commercial-settlement-management'),
            'eligible-supply-facts': ('accounting-data-provision', 'subdomain-commercial-settlement-management'),
            'commercial-settlement-results': ('subdomain-commercial-settlement-management', 'D04'),
        }
        for suffix, endpoints in expected.items():
            relation = exchanges['REL-U996-' + suffix]
            self.assertEqual((relation['source_id'], relation['target_id']), endpoints)
        self.assertEqual(nodes['subdomain-policies']['fields']['name'], 'Supply Policy Management')
        self.assertEqual(nodes['D03']['fields']['name'], 'Availability')
        self.assertIn('glossary:TER263', nodes['D04']['fields']['scope'])
        self.assertIn('aucun paiement fournisseur', nodes['ba-financial-service-order-management']['fields']['scope'])
        from scripts.model_depth import responsibility_domains
        ancestry = responsibility_domains(self.model)
        allowed = {'supply-chain-orchestration', 'domain-sales', 'domain-sourcing-procurement', 'domain-plan'}
        self.assertTrue(all(len(ancestry[n['id']]) == 1 and ancestry[n['id']] <= allowed
                            for n in nodes.values() if n['kind'] == 'capability'))

    def test_frozen_publication_keeps_its_finance_capability(self):
        published = read(ROOT / 'modeles/release/2026-10-12.6/model.yaml')
        self.assertTrue(any(n['id'] == 'accounting-interpretation' and n['kind'] == 'capability' for n in published['nodes']))
        self.assertEqual(self.errors(published), [])


if __name__ == '__main__':
    unittest.main()
