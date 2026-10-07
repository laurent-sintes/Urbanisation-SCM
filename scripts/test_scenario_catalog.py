from copy import deepcopy
import unittest
from scripts.structured_io import read
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

    def test_missing_endpoints_and_wrong_contributor_rejected(self):
        path=self.model['scenario_catalog']['paths'][0]
        path['steps'][0]['contributions'][0]['node_id']='missing'
        path['dependencies'].append({'from':'absent','to':'step-1','condition':'Test'})
        errors=validate_catalog(self.model)
        self.assertTrue(any('published capability or reference' in e for e in errors))
        self.assertTrue(any('endpoint' in e for e in errors))

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

if __name__=='__main__': unittest.main()
