"""Cross-fiche contracts that schema validation cannot establish (U887)."""
from pathlib import Path
import re
import unittest
from scripts.structured_io import read
from scripts.display_codes import build_display_index
from scripts.glossary import references

ROOT = Path(__file__).resolve().parents[1]


def plain(value):
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', value)


class ModelCoherenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT/'modeles/backlog/model.yaml')
        cls.nodes = {x['id']: x for x in cls.model['nodes']}
        cls.terms = {x['id']: x for x in read(ROOT/'modeles/backlog/glossary.yaml')['terms']}
        cls.paths = {x['id']: x for x in cls.model['scenario_catalog']['paths']}

    def test_domain_summary_includes_each_of_its_subdomains(self):
        summary = plain(self.nodes['supply-chain-orchestration']['fields']['scope'])
        children = [r['target_id'] for r in self.model['relations']
                    if r['source_id'] == 'supply-chain-orchestration' and r['type'] == 'contains']
        for ident in children:
            with self.subTest(ident=ident):
                self.assertIn(self.nodes[ident]['fields']['name'], summary)

    def test_current_glossary_explains_real_ownership(self):
        refs = set(references(self.terms['TER031']['market_inspiration']))
        self.assertLessEqual({('glossary','TER129'), ('glossary','TER176'), ('glossary','TER177')}, refs)
        self.assertNotIn('Process Adaptation Decision', str(self.terms['TER031']['market_inspiration']))
        for text in [self.terms['TER112']['context'], self.terms['TER113']['context'],
                     self.nodes['subdomain-integration']['fields']['scope']]:
            self.assertNotIn('catégories', text)
            self.assertIn('Business Areas', plain(text))
        self.assertNotIn('Inventory Foundation', str(self.nodes['D01']['fields']))
        meta = read(ROOT/'modeles/backlog/modeling-glossary.yaml')
        nature = next(t for t in meta['terms'] if t['id']=='MOD007')
        self.assertIn('activités et attentes', nature['values']['Orchestration'])

    def test_scenario_contributions_respect_packing_and_finishing(self):
        path = self.paths['fashion-launch-path']
        contributions = {c['node_id']: c['role'] for s in path['steps'] for c in s['contributions']}
        self.assertIn('cintre', contributions['service-order-packing'])
        self.assertNotIn('cintre', contributions['service-order-garment-finishing'])
        self.assertIn('défroiss', contributions['service-order-garment-finishing'])
        self.assertIn('libér', self.paths['b2b-partial-stock-path']['outcome'])

    def test_conditional_feasibility_is_discoverable_from_ctp(self):
        coverage = next(s for s in self.paths['preorder-future-availability-path']['steps'] if s['id']=='coverage')
        ctp = [c for c in coverage['contributions'] if c['node_id']=='D03.j']
        self.assertEqual(len(ctp), 1)
        self.assertIn('Si', ctp[0]['role'])
        self.assertIn('ne pas affermir', ctp[0]['role'])

    def test_negative_variants_preserve_authority_and_known_effects(self):
        for ident, required in [
            ('credit-review-no-response-path', {'human-task-management','work-deadline-management','work-assignment','D04.i'}),
            ('payment-resumption-not-confirmed-path', {'process-intervention','order-workflow-orchestration','service-order-payment-collection'})]:
            path=self.paths[ident]
            actual={c['node_id'] for s in path['steps'] for c in s['contributions']}
            self.assertLessEqual(required,actual)
        self.assertIn('reste effectif', self.paths['credit-review-no-response-path']['outcome'])
        self.assertIn('aucun effet métier', self.paths['payment-resumption-not-confirmed-path']['outcome'])

    def test_common_rules_are_linked_without_erasing_specialized_constraints(self):
        for ident in ['D03.i','D03.j','D03.k']:
            scope=self.nodes[ident]['fields']['scope']
            self.assertIn(('model','ba-order-promising'),set(references(scope)))
            self.assertLess(len(plain(scope).split()),500)
        self.assertIn('absence de solution admissible', plain(self.nodes['ba-order-promising']['fields']['scope']))
        self.assertIn('capacités finies', self.nodes['D03.j']['fields']['scope'])
        self.assertIn('valeur absente', self.nodes['D03.k']['fields']['scope'])
        self.assertLess(len(plain(self.nodes['D04.i']['fields']['scope']).split()),450)

    def test_identity_and_reading_order_are_unaffected_by_editorial_changes(self):
        audit=read(ROOT/'modeles/backlog/model-coherence-audit-U886.yaml')
        index=build_display_index(self.model)
        for example in audit['reading_codes']['examples']:
            self.assertEqual(index['codes'][example['id']],example.get('candidate_after_U898', example.get('candidate_after_U894', example.get('candidate_after_U891', example['candidate']))))
        for ident in ['master-data-ingestion-commerce','master-data-ingestion-design']:
            self.assertIn(ident,self.nodes)


if __name__ == '__main__':
    unittest.main()
