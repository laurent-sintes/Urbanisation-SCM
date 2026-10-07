"""Core/Case boundaries, financial references and scenario traceability (U898)."""
from pathlib import Path
import unittest
from scripts.structured_io import read
from scripts.glossary import references
from scripts.scenario_catalog import validate_catalog

ROOT=Path(__file__).resolve().parents[1]


class CreditCheckTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model=read(ROOT/'modeles/backlog/model.yaml')
        cls.nodes={n['id']:n for n in cls.model['nodes']}
        cls.paths={p['id']:p for p in cls.model['scenario_catalog']['paths']}
        cls.terms={t['id']:t for t in read(ROOT/'modeles/backlog/glossary.yaml')['terms']}

    def test_financial_decision_is_retired_without_dangling_current_links(self):
        self.assertNotIn('credit-check-decision',self.nodes)
        self.assertNotIn(('model','credit-check-decision'),references(self.model))
        self.assertNotIn(('model','credit-check-decision'),references(list(self.terms.values())))
        self.assertFalse(any('credit-check-decision' in (r['source_id'],r['target_id']) for r in self.model['relations']))

    def test_sales_contexts_belong_to_sales_and_do_not_decompose_the_core(self):
        expected={'subdomain-sales-b2c-ecommerce','subdomain-sales-b2c-store','subdomain-sales-wholesale'}
        actual={r['target_id'] for r in self.model['relations'] if r['source_id']=='domain-sales' and r['type']=='presents'}
        self.assertEqual(expected,actual)
        for ident in expected:
            self.assertEqual(self.nodes[ident]['kind'],'area')
            parents=[r['source_id'] for r in self.model['relations'] if r['target_id']==ident and r['type'] in ['contains','presents']]
            self.assertEqual(parents,['domain-sales'])
        for ident in ['D04.i','order-workflow-orchestration']:
            self.assertIn(('model','subdomain-sales-wholesale'),references(self.nodes[ident]['fields']['scope']))

    def test_profile_has_one_documentary_parent_and_finance_ingestion(self):
        node=self.nodes['customer-credit-profile']
        self.assertEqual(node['kind'],'reference')
        self.assertNotIn('nature',node['fields'])
        parents=[(r['source_id'],r['type']) for r in self.model['relations'] if r['target_id']==node['id'] and r['type'] in ['contains','presents']]
        self.assertEqual(parents,[('ba-partner-agreement-references','presents')])
        edges={(r['type'],r['source_id'],r['target_id']) for r in self.model['relations']}
        self.assertIn(('supplies-reference','master-data-ingestion',node['id']),edges)
        self.assertIn(('relates-to',node['id'],'D09'),edges)
        self.assertIn('ne sont pas des paramètres de référence',node['fields']['scope'])
        self.assertIn('Finance conserve l’autorité',node['fields']['scope'])
        self.assertIn('ne vaut pas autorisation',node['fields']['scope'])

    def test_existing_scenario_preserves_external_control_and_indeterminate_result(self):
        self.assertEqual(validate_catalog(self.model),[])
        scenarios=self.model['scenario_catalog']['scenarios']
        self.assertEqual(sum(s['id']=='customer-credit-hold' for s in scenarios),1)
        for ident in ['customer-credit-hold-path','credit-review-no-response-path']:
            contributions={c['node_id'] for s in self.paths[ident]['steps'] for c in s['contributions']}
            self.assertIn('D04.i',contributions)
            self.assertNotIn('credit-check-decision',contributions)
            self.assertTrue(all(self.nodes[i]['kind']=='capability' for i in contributions))
        waiting=self.paths['credit-review-no-response-path']['steps'][0]
        self.assertIn('indéterminé',waiting['description'])
        self.assertIn('ni refus financier',waiting['description'])
        self.assertIn('reste effectif',self.paths['credit-review-no-response-path']['outcome'])

    def test_glossary_and_primary_market_support_are_linked(self):
        self.assertIn('Credit Check',self.terms['TER155']['definition'])
        self.assertIn(('model','subdomain-sales-wholesale'),references(self.terms['TER155']['context']))
        self.assertEqual(self.terms['TER190']['definition'],self.nodes['customer-credit-profile']['fields']['definition'])
        comparisons=self.nodes['customer-credit-profile']['fields']['market_comparisons']
        self.assertEqual({c['vendor'] for c in comparisons},{'SAP','Microsoft'})
        self.assertTrue(all(c['consulted_on']=='2026-10-07' for c in comparisons))

    def test_glossary_explanations_keep_the_correct_credit_authority(self):
        party=self.terms['TER046']
        self.assertEqual(party['context'],party['market_inspiration']['flow_approach'])
        self.assertIn(('model','customer-credit-profile'),references(party['context']))
        self.assertNotIn('comprend le classement de risque et la limite',party['context'])
        profile=self.terms['TER190']
        scope = self.nodes['customer-credit-profile']['fields']['scope']
        self.assertTrue(scope.startswith(profile['context'] + '\n\n'))
        self.assertIn(('glossary', 'TER198'), references(scope))
        self.assertEqual(self.terms['TER145']['notes'],self.nodes['product-price-book']['fields']['scope'])


if __name__=='__main__':
    unittest.main()
