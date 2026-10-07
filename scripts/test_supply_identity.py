"""The current identity is canonical; historical snapshots remain independent."""
from pathlib import Path
import unittest

from scripts.structured_io import read, dumps
from scripts.backlog_delivery import check_delivery

ROOT = Path(__file__).resolve().parents[1]


class SupplyIdentityTests(unittest.TestCase):
    def test_current_references_and_delivery_use_canonical_identity(self):
        model = read(ROOT / 'modeles/backlog/model.yaml')
        glossary = read(ROOT / 'modeles/backlog/glossary.yaml')
        identifier = 'supply-chain-orchestration'
        self.assertNotIn('universe-supply', dumps(model))
        self.assertNotIn('universe-supply', dumps(glossary))
        node = next(n for n in model['nodes'] if n['id'] == identifier)
        self.assertEqual(node['fields']['name'], 'Supply Chain Orchestration')
        self.assertEqual(node['kind'], 'domain')
        parents = [r for r in model['relations'] if r['type'] in ('contains', 'presents') and r['target_id'] == identifier]
        self.assertEqual([(r['source_id'], r['type']) for r in parents], [('system-business-operations', 'presents')])
        self.assertCountEqual(
            [r['target_id'] for r in model['relations'] if r['source_id'] == identifier and r['type'] == 'presents'],
            ['business-references', 'subdomain-policies',
             'D04', 'D01', 'D03', 'D06', 'subdomain-service-orders',
             'subdomain-integration'],
        )
        nodes = {n['id']: n for n in model['nodes']}
        self.assertEqual(nodes['subdomain-plans']['kind'], 'business_area')
        self.assertEqual(
            [(r['source_id'], r['type']) for r in model['relations']
             if r['target_id'] == 'subdomain-plans' and r['type'] in ('contains', 'presents')],
            [('D03', 'contains')],
        )
        self.assertEqual(nodes['D03']['fields']['name'], 'Availability')
        self.assertEqual(nodes['business-references']['fields']['name'], 'Operational References')
        for removed in ('subdomain-order-promising', 'D03.l', 'BHV109', 'BHV110'):
            self.assertNotIn(removed, nodes)
        for capability in ('D03.i', 'D03.j', 'D03.k'):
            self.assertEqual(nodes[capability]['fields']['nature'], 'decision')
            self.assertEqual(nodes['ba-order-promising']['fields']['name'], 'Order Promising')
            self.assertEqual(
                [r['source_id'] for r in model['relations']
                 if r['type'] == 'contains' and r['target_id'] == capability], ['ba-order-promising'])
        self.assertEqual(check_delivery(ROOT, model)[1], [])

    def test_historical_identity_is_not_rewritten(self):
        model = read(ROOT / 'modeles/release/2026-09-27.5/model.yaml')
        self.assertTrue(any(n['id'] == 'universe-supply' for n in model['nodes']))
        self.assertFalse(any(n['id'] == 'supply-chain-orchestration' for n in model['nodes']))
