from copy import deepcopy
import unittest
from scripts.structured_io import read
from scripts.json_contract import validate
from scripts.scenario_catalog import validate_catalog, assign_catalog_versions, record_field_agreement
from scripts.migrate_scenarios import migrate


class ScenarioCatalogTests(unittest.TestCase):
    def setUp(self):
        self.model=read('modeles/backlog/model.yaml')

    def test_live_catalog_integrity_and_migration_idempotence(self):
        self.assertEqual(validate_catalog(self.model), [])
        result, report=migrate(self.model)
        self.assertEqual(result,self.model)
        self.assertIsNone(report)
        report=read('modeles/backlog/scenario-migration-U793.yaml')
        self.assertEqual(len(report['items']),49)
        self.assertEqual(sum(i['action']=='migrate_scenario' for i in report['items']),26)

    def test_market_source_urls_require_http_or_https(self):
        schema = read('modeles/schemas/urbanism.schema.json')
        contract = (schema['properties']['scenario_catalog']['properties']['value_streams']['items']
                    ['properties']['market_sources']['items']['properties']['url'])
        for url in ('https://example.com/source', 'http://example.com/source'):
            self.assertEqual(validate(url, contract), [])
        for url in ('javascript:alert(1)', 'data:text/html,source', 'https://example.com/bad path'):
            self.assertTrue(validate(url, contract))

    def test_missing_endpoints_and_wrong_contributor_rejected(self):
        path=self.model['scenario_catalog']['paths'][0]
        path['steps'][0]['contributions'][0]['node_id']='missing'
        path['dependencies'].append({'from':'absent','to':'step-1','condition':'Test'})
        errors=validate_catalog(self.model)
        self.assertTrue(any('published capability or reference' in e for e in errors))
        self.assertTrue(any('endpoint' in e for e in errors))

    def test_context_participation_keeps_declared_depth_and_does_not_replace_capabilities(self):
        path = self.model['scenario_catalog']['paths'][0]
        path['field_agreements'] = [a for a in path.get('field_agreements', []) if a['field'] != 'steps']
        step = path['steps'][0]
        participant = {'node_id': 'ba-receiving-operations', 'role': 'Réaliser la réception demandée.',
                       'conditions': ['Prestation confiée et périmètre identifié.'], 'source_refs': ['U1115']}
        step['context_participants'] = [participant]
        self.assertEqual(validate_catalog(self.model), [])
        schema = read('modeles/schemas/urbanism.schema.json')
        step_contract = schema['properties']['scenario_catalog']['properties']['paths']['items']['properties']['steps']['items']
        self.assertEqual(validate(step, step_contract), [])
        for target in ('domain-product-development', 'subdomain-product-change-release'):
            participant['node_id'] = target
            self.assertEqual(validate_catalog(self.model), [], target)
        # Even beneath an existing context subdomain, a capability cannot be
        # reclassified as a context participant.
        self.model['nodes'].append({'id': 'context-capability-fixture', 'kind': 'capability'})
        self.model['relations'].append({'id': 'context-capability-parent', 'type': 'contains',
            'source_id': 'subdomain-product-change-release', 'target_id': 'context-capability-fixture'})
        participant['node_id'] = 'context-capability-fixture'
        self.assertTrue(any('declared context depth' in e for e in validate_catalog(self.model)))
        for target in ('missing', 'D04.i', 'domain-sales', 'supply-chain-orchestration'):
            participant['node_id'] = target
            self.assertTrue(any('declared context depth' in e for e in validate_catalog(self.model)), target)
        participant['node_id'] = 'ba-receiving-operations'
        step['contributions'] = []
        self.assertTrue(any('empty or duplicate contributions' in e for e in validate_catalog(self.model)))
        step['contributions'] = [{'node_id': 'ba-receiving-operations', 'role': 'Recevoir'}]
        self.assertTrue(any('published capability or reference' in e for e in validate_catalog(self.model)))

    def test_multiple_paths_streams_and_repeated_capabilities_allowed(self):
        catalog=self.model['scenario_catalog']
        self.assertGreater(len(catalog['scenarios'][0]['value_stream_ids']),1)
        self.assertEqual(len([p for p in catalog['paths'] if p['scenario_id']=='b2b-partial-stock']),2)
        path=catalog['paths'][0]
        path['dependencies'].append({'from':'step-4','to':'step-2','condition':'Réexamen explicitement demandé'})
        self.assertEqual(validate_catalog(self.model),[])

    def test_field_agreement_bound_to_value_and_source(self):
        catalog=self.model['scenario_catalog']
        self.model['scenario_catalog']=record_field_agreement(catalog,'scenarios','b2b-partial-stock',['objective'],['U793'])
        self.assertEqual(validate_catalog(self.model),[])
        self.model['scenario_catalog']['scenarios'][0]['objective']='Autre résultat'
        self.assertTrue(any('stale field agreement' in e for e in validate_catalog(self.model)))
        self.assertNotIn('field_agreements',catalog['scenarios'][0])

    def test_versions_change_only_edited_entity_and_old_model_supported(self):
        before=deepcopy(self.model)
        assign_catalog_versions(before,{},'2026-09-27T00:00:00Z')
        after=deepcopy(self.model)
        self.assertEqual(assign_catalog_versions(after,before,'2026-09-27T01:00:00Z'),[])
        after['scenario_catalog']['paths'][0]['outcome']='Résultat modifié'
        changes=assign_catalog_versions(after,before,'2026-09-27T02:00:00Z')
        self.assertEqual(len(changes),1)
        self.assertEqual(changes[0]['collection'],'scenario_paths')
        self.assertEqual(validate_catalog({'nodes':[]}),[])

    def test_duplicate_identity_and_invalid_classification(self):
        catalog=self.model['scenario_catalog']
        catalog['scenarios'].append(deepcopy(catalog['scenarios'][0]))
        catalog['scenarios'][0]['value_stream_ids']=['absent']
        catalog['scenarios'][0]['events']=['not-a-facet']
        self.assertGreaterEqual(len(validate_catalog(self.model)),3)

    def test_unreachable_legacy_links_and_duplicate_filter_choices_rejected(self):
        catalog=self.model['scenario_catalog']
        catalog['legacy_links'][0]['owner_id']='removed-owner'
        catalog['legacy_links'].append(deepcopy(catalog['legacy_links'][0]))
        catalog['facets']['events'].append(deepcopy(catalog['facets']['events'][0]))
        errors=validate_catalog(self.model)
        self.assertTrue(any('missing legacy owner' in e for e in errors))
        self.assertTrue(any('duplicate legacy link' in e for e in errors))
        self.assertTrue(any('duplicate facet' in e for e in errors))

    def test_b2b_alternatives_keep_their_own_acceptance_conditions(self):
        catalog=self.model['scenario_catalog']
        scenario=next(s for s in catalog['scenarios'] if s['id']=='b2b-partial-stock')
        grouped=next(p for p in catalog['paths'] if p['id']=='b2b-partial-stock-path')
        split=next(p for p in catalog['paths'] if p['id']=='b2b-partial-stock-split-path')
        condition='Le client accepte le regroupement et la date résultante.'
        self.assertNotIn(condition,scenario['conditions'])
        self.assertIn(condition,grouped['conditions'])
        self.assertNotIn(condition,split['conditions'])
        self.assertIn('Le client accepte deux livraisons annoncées et leurs dates.',split['conditions'])

    def test_sales_delivery_authorization_precedes_service_release(self):
        paths={p['id']:p for p in self.model['scenario_catalog']['paths']}
        for ident in ('b2b-partial-stock-path','b2b-partial-stock-split-path'):
            release=next(s for s in paths[ident]['steps'] if s['id']=='step-4')
            contributors={c['node_id'] for c in release['contributions']}
            self.assertTrue({'delivery-release-decision','D04.i','service-order-release-decision'} <= contributors)
        # Deux livraisons ne créent pas automatiquement deux commandes de vente.
        split_contributors={c['node_id'] for s in paths['b2b-partial-stock-split-path']['steps'] for c in s['contributions']}
        self.assertNotIn('D04.n',split_contributors)

    def test_supply_proposal_is_not_supplier_commitment(self):
        path=next(p for p in self.model['scenario_catalog']['paths'] if p['id']=='additional-purchase-partial-path')
        proposal={c['node_id'] for c in path['steps'][0]['contributions']}
        self.assertTrue({'D05.e','D03.j','D05.f'} <= proposal)
        self.assertNotIn('D04.j',proposal)
        response=next(s for s in path['steps'] if s['id']=='map-response')
        self.assertIn('D04.j',{c['node_id'] for c in response['contributions']})
        self.assertTrue(any(d['from']=='map-response' and d['to']=='step-2' for d in path['dependencies']))
        refusal=next(p for p in self.model['scenario_catalog']['paths'] if p['id']=='seasonal-map-refusal-path')
        self.assertNotIn('D04.j',{c['node_id'] for s in refusal['steps'] for c in s['contributions']})

    def test_stock_move_and_contract_firming_keep_distinct_responsibilities(self):
        paths={p['id']:p for p in self.model['scenario_catalog']['paths']}
        for ident in ('fashion-launch-path','transfer-replenishment-order-driven-path'):
            transfer=next(s for s in paths[ident]['steps'] if s['id']=='step-2')
            self.assertTrue({'D05.c','D03.o','D04.k'} <= {c['node_id'] for c in transfer['contributions']})
        firming={c['node_id'] for s in paths['seasonal-contract-firming-path']['steps'] for c in s['contributions']}
        self.assertIn('D04.i',firming)
        self.assertNotIn('D05.h',firming)

if __name__=='__main__': unittest.main()
