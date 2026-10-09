import copy
from pathlib import Path
import unittest

from scripts.hotspot_catalog import severity_for, validate_catalog
from scripts.structured_io import read
from scripts.publish_release import compile_snapshot


ROOT = Path(__file__).resolve().parents[1]


class HotspotCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')

    def test_clog_pilot_is_located_on_two_domains(self):
        self.assertEqual(validate_catalog(self.model), [])
        hotspot = self.model['hotspot_catalog']['hotspots'][0]
        self.assertEqual(hotspot['id'], hotspot['origin']['id'])
        self.assertEqual(hotspot['kind'], 'integration')
        self.assertEqual(set(hotspot['location']['node_ids']), {
            'domain-logistics-execution', 'supply-chain-orchestration'})
        self.assertEqual(hotspot['complexity']['political'], 'XL')
        self.assertEqual(hotspot['complexity']['implementation'], 'L')
        self.assertEqual(hotspot['severity'], severity_for('XL', 'L'))

    def test_matrix_preserves_unknown_complexity(self):
        self.assertEqual(severity_for('S', 'M'), 'M')
        self.assertEqual(severity_for('L', 'L'), 'XL')
        self.assertEqual(severity_for('unassessed', 'XL'), 'unassessed')

    def test_publication_freezes_catalog_without_backlog_lookup(self):
        snapshot = compile_snapshot(self.model, {'decisions': []}, '2026-10-09.1', ['U922'])
        self.assertEqual(snapshot['hotspot_catalog'], self.model['hotspot_catalog'])
        previous_shape = copy.deepcopy(self.model)
        del previous_shape['hotspot_catalog']
        historical = compile_snapshot(previous_shape, {'decisions': []}, '2026-10-08.1', [])
        self.assertNotIn('hotspot_catalog', historical)

    def test_missing_anchor_and_false_resolution_are_rejected(self):
        model = copy.deepcopy(self.model)
        hotspot = model['hotspot_catalog']['hotspots'][0]
        hotspot['location']['node_ids'][0] = 'absent'
        hotspot['status'] = 'resolved'
        errors = validate_catalog(model)
        self.assertTrue(any('missing anchor' in error for error in errors))
        self.assertTrue(any('resolved hotspot requires' in error for error in errors))


if __name__ == '__main__':
    unittest.main()
