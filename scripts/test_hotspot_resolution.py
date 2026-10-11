import copy
import unittest
from scripts.hotspot_resolution import empty_resolution, validate_resolution
from scripts.atlas_workshop import checked_hotspot
from scripts.structured_io import read
from pathlib import Path


class ResolutionTests(unittest.TestCase):
    def item(self):
        model = read(Path(__file__).resolve().parents[1] / 'modeles/backlog/model.yaml')
        item = copy.deepcopy(model['hotspot_catalog']['hotspots'][0])
        item['resolution'] = dict(empty_resolution(), stage='credible', summary='Solution envisageable',
                                  assessed_on='2026-10-11', assessment_source='Séance de cadrage',
                                  credible_option_ids=[option['id'] for option in item['resolution_options']],
                                  credibility_note='Hypothèses et réserves explicites')
        item['status'] = 'resolved'
        return item, {node['id'] for node in model['nodes']}

    def test_credible_options_need_no_final_choice_or_deployment(self):
        item, nodes = self.item()
        self.assertNotIn('selected_option_id', item)
        self.assertEqual(validate_resolution(item), [])
        self.assertEqual(checked_hotspot(item, nodes)['status'], 'resolved')

    def test_null_unknown_fields_dates_and_missing_arguments_fail(self):
        for field, value in [('resolution', None), ('extra', True), ('assessed_on', '2026-02-30'),
                             ('credible_option_ids', ['absent']), ('credible_option_ids', []),
                             ('credibility_note', ''), ('assessment_source', ''), ('summary', '')]:
            with self.subTest(field=field, value=value):
                item, nodes = self.item()
                if field == 'resolution': item[field] = value
                else: item['resolution'][field] = value
                self.assertTrue(validate_resolution(item))
                with self.assertRaises(ValueError): checked_hotspot(item, nodes)

    def test_block_and_reopening_preserve_a_genuine_choice(self):
        item, nodes = self.item()
        item['selected_option_id'] = item['resolution_options'][0]['id']
        item['status'] = 'validated'
        item['resolution'].update(stage='qualifying', credible_option_ids=[], blocked_reason='Volumes inconnus')
        self.assertTrue(validate_resolution(item))
        item['resolution']['next_step'] = 'Obtenir les volumes'
        self.assertEqual(validate_resolution(item), [])
        self.assertEqual(checked_hotspot(item, nodes)['selected_option_id'], item['selected_option_id'])

    def test_legacy_contract_remains_valid(self):
        item, nodes = self.item()
        del item['resolution']
        item['selected_option_id'] = item['resolution_options'][0]['id']
        item['resolution_note'] = 'Décision historique'
        self.assertEqual(checked_hotspot(item, nodes)['resolution_note'], 'Décision historique')


if __name__ == '__main__': unittest.main()
