"""Guard promotion, ownership and content delivery across the Process migration."""
from pathlib import Path
import unittest
from scripts.structured_io import read
from scripts.display_codes import build_display_index
from scripts.backlog_delivery import check_delivery
from scripts.glossary import references

ROOT = Path(__file__).resolve().parents[1]

class ProcessManagementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT/'modeles/backlog/model.yaml')
        cls.model['glossary'] = read(ROOT/'modeles/backlog/glossary.yaml')
        cls.nodes = {n['id']:n for n in cls.model['nodes']}

    def test_promotion_preserves_identity_and_historical_meaning(self):
        old = read(ROOT/'modeles/release/2026-10-07.2/model.yaml')
        old_nodes = {n['id']:n for n in old['nodes']}
        self.assertEqual(old_nodes['BHV082']['kind'], 'behavior')
        self.assertEqual(self.nodes['BHV082']['kind'], 'capability')
        code = build_display_index(self.model)['codes']['BHV082']
        self.assertTrue(code.startswith('CAP-'), code)
        self.assertTrue(old['display_index']['codes']['BHV082'].startswith('BHV-'))
        self.assertEqual([r['source_id'] for r in self.model['relations']
                          if r['target_id']=='BHV082' and r['type'] in ('contains','presents')],
                         ['ba-process-supervision'])
        self.assertEqual({r['target_id'] for r in self.model['relations']
                          if r['source_id']=='operations-visibility' and r['type']=='contains'},
                         {'BHV079','BHV080','BHV081'})
        self.assertEqual(old_nodes['D06.d']['fields']['name'], 'Process Orchestration')
        self.assertEqual(self.nodes['D06.d']['fields']['name'], 'Fulfilment Coordination')

    def test_target_is_complete_and_scenarios_use_real_capabilities(self):
        areas={r['target_id'] for r in self.model['relations']
               if r['source_id']=='subdomain-process-management' and r['type']=='contains'}
        self.assertEqual(areas, {'ba-reactive-workflow-management','ba-process-supervision',
                                'ba-human-work-management','ba-process-intelligence'})
        caps={r['target_id'] for r in self.model['relations']
              if r['source_id'] in areas and r['type']=='contains'}
        self.assertEqual(len(caps),12)
        self.assertTrue(all(self.nodes[c]['kind']=='capability' for c in caps))
        contributions={c['node_id'] for p in self.model['scenario_catalog']['paths']
                       for s in p['steps'] for c in s['contributions']}
        self.assertLessEqual(caps, contributions)
        self.assertEqual(sum(n['fields']['name']=='Process Orchestration' for n in self.nodes.values()),1)
        self.assertEqual(check_delivery(ROOT,self.model)[1],[])

    def test_target_glossary_and_market_evidence_are_not_lost(self):
        audit=read(ROOT/'modeles/backlog/operational-work-audit-U881.yaml')
        glossary=read(ROOT/'modeles/backlog/glossary.yaml')
        terms={t['id']:t for t in glossary['terms']}
        for ident,term_id in audit['application_U885']['term_nodes'].items():
            with self.subTest(ident=ident):
                f=self.nodes[ident]['fields']; t=terms[term_id]
                self.assertEqual(t['name'],f['name'])
                self.assertEqual(t['definition'],f['definition'])
                # U903 adds glossary explanations to these sheets, while the
                # glossary keeps the full original responsibility boundary.
                additions = {'process-mining': 'TER201', 'BHV082': 'TER200'}
                if ident in additions:
                    self.assertTrue(f['scope'].startswith(t['context'] + '\n\n'))
                    self.assertIn(('glossary', additions[ident]), references(f['scope']))
                else:
                    self.assertEqual(t['context'],f['scope'])
                vendors={c['vendor'] for c in f.get('market_comparisons',[])}
                self.assertLessEqual({'SAP','Microsoft'},vendors)
        for kind,ident in references(self.model):
            if kind=='model': self.assertIn(ident,self.nodes)
            if kind=='glossary': self.assertIn(ident,terms)

if __name__=='__main__': unittest.main()
