"""A workshop stages changes without editing the published model."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from scripts.atlas_workshop import apply_request, apply_table_changes, close_stage, current_stage, effective_hotspots, load_stage, publication


class WorkshopTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        data = self.root / 'app/dist/data'
        folder = data / '2026-10-10.1'
        folder.mkdir(parents=True)
        self.model = {
            'space': 'release', 'version': '2026-10-10.1',
            'nodes': [{'id': 'logistics'}, {'id': 'orchestration'}],
            'hotspot_catalog': {'schema_version': 1, 'source_refs': [], 'hotspots': []},
        }
        payload = json.dumps(self.model).encode()
        (folder / 'model.json').write_bytes(payload)
        (data / 'index.json').write_text(json.dumps({
            'current_version': '2026-10-10.1',
            'versions': [{'version': '2026-10-10.1', 'model_sha256': hashlib.sha256(payload).hexdigest()}],
        }))

    def test_add_update_remove_leave_publication_unchanged(self):
        model, model_sha = publication(self.root)
        stage = current_stage(self.root, model, model_sha)
        self.assertEqual(stage['revision'], 0)
        added = apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                          'verbatim': 'Ajoute un point chaud entre Logistics et Orchestration.',
                                          'fields': {'title': 'Interface C-LOG', 'kind': 'integration',
                                                     'location': {'node_ids': ['logistics', 'orchestration']},
                                                     'problem': 'Qui décide du site ?'}})
        self.assertEqual(added['id'], 'AT-HS-001')
        self.assertEqual(load_stage(self.root)['revision'], 1)
        self.assertEqual(effective_hotspots(model, load_stage(self.root))['AT-HS-001']['severity'], 'unassessed')
        with self.assertRaisesRegex(ValueError, 'relire sa révision'):
            apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'remove', 'id': 'AT-HS-001',
                                      'verbatim': 'Retire ce point chaud.'})
        apply_request(self.root, {'expected_revision': 1, 'entity': 'hotspot', 'action': 'update',
                                  'verbatim': 'La difficulté politique est XL, l’implémentation L.',
                                  'id': 'AT-HS-001', 'fields': {'complexity': {
                                      'arbitration': 'XL', 'implementation': 'L', 'rationale': 'Décision transverse.'}}})
        self.assertEqual(effective_hotspots(model, load_stage(self.root))['AT-HS-001']['severity'], 'XL')
        apply_request(self.root, {'expected_revision': 2, 'entity': 'hotspot', 'action': 'remove', 'id': 'AT-HS-001',
                                  'verbatim': 'Retire le post-it créé par erreur.'})
        self.assertNotIn('AT-HS-001', effective_hotspots(model, load_stage(self.root)))
        again = apply_request(self.root, {'expected_revision': 3, 'entity': 'hotspot', 'action': 'add',
                                          'verbatim': 'Ajoute une nouvelle question.',
                                          'fields': {'title': 'Nouvelle question', 'problem': 'À clarifier',
                                                     'location': {'node_ids': ['logistics']}}})
        self.assertEqual(again['id'], 'AT-HS-002')
        self.assertEqual(publication(self.root)[0], self.model)
        closed = close_stage(self.root, 4)
        self.assertFalse(closed['active'])
        self.assertIsNone(load_stage(self.root))
        self.assertTrue(Path(closed['archived']).is_file())

    def test_invalid_anchor_does_not_change_stage(self):
        model, model_sha = publication(self.root)
        current_stage(self.root, model, model_sha)
        with self.assertRaisesRegex(ValueError, 'ancrages'):
            apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                      'verbatim': 'Ajoute un point chaud ici.',
                                      'fields': {'title': 'X', 'problem': 'Y', 'location': {'node_ids': ['missing']}}})
        self.assertEqual(load_stage(self.root)['revision'], 0)

    def test_missing_verbatim_does_not_create_an_operation(self):
        model, model_sha = publication(self.root)
        current_stage(self.root, model, model_sha)
        with self.assertRaisesRegex(ValueError, 'verbatim'):
            apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                      'fields': {'title': 'X', 'problem': 'Y',
                                                 'location': {'node_ids': ['logistics']}}})
        self.assertEqual(load_stage(self.root)['operations'], [])

    def test_market_view_requires_a_traceable_source(self):
        model, model_sha = publication(self.root)
        current_stage(self.root, model, model_sha)
        fields = {'title': 'Référence produit', 'problem': 'Où construire le GTIN ?',
                  'location': {'node_ids': ['orchestration']},
                  'market_view': {'finding': 'Les ERP portent le GTIN.',
                                  'flow_assessment': 'Séparer construction et consommation.',
                                  'limits': 'Aucune capacité source décidée.',
                                  'sources': [{'publisher': 'SAP', 'title': 'EAN',
                                               'url': 'https://help.sap.com/example',
                                               'relevance': 'EAN par unité.'}]}}
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                  'verbatim': 'Ajoute un avis marché sourcé.', 'fields': fields})
        self.assertEqual(load_stage(self.root)['operations'][0]['value']['market_view'], fields['market_view'])
        fields['market_view']['sources'][0]['url'] = 'http://example.com'
        with self.assertRaisesRegex(ValueError, 'Lecture du marché'):
            apply_request(self.root, {'expected_revision': 1, 'entity': 'hotspot', 'action': 'add',
                                      'verbatim': 'Ajoute un avis marché sans source valide.', 'fields': fields})
        self.assertEqual(load_stage(self.root)['revision'], 1)

    def test_table_changes_are_atomic_and_keep_the_published_model(self):
        model, model_sha = publication(self.root)
        stage = current_stage(self.root, model, model_sha)
        for revision, title in enumerate(('Premier', 'Second')):
            apply_request(self.root, {'expected_revision': revision, 'entity': 'hotspot', 'action': 'add',
                                      'verbatim': f'Ajoute {title}.',
                                      'fields': {'title': title, 'problem': 'Question ouverte.',
                                                 'location': {'node_ids': ['logistics']}}})
        batch = {'session_id': stage['session_id'], 'expected_revision': 2,
                 'changes': [
                     {'id': 'AT-HS-001', 'fields': {'title': 'Premier précisé', 'complexity': {
                         'arbitration': 'XL', 'implementation': 'L', 'rationale': 'Décision transverse.',
                         'arbitration_rationale': 'Compromis entre pôles.',
                         'implementation_rationale': 'Interfaces interdépendantes.'}}},
                     {'id': 'AT-HS-002', 'fields': {'status': 'shared', 'visible': False}},
                 ]}
        result = apply_table_changes(self.root, batch)
        self.assertEqual(result['revision'], 4)
        items = effective_hotspots(model, result)
        self.assertEqual(items['AT-HS-001']['severity'], 'XL')
        self.assertEqual(items['AT-HS-001']['complexity']['arbitration_rationale'], 'Compromis entre pôles.')
        self.assertEqual(items['AT-HS-001']['complexity']['implementation_rationale'], 'Interfaces interdépendantes.')
        self.assertEqual(items['AT-HS-002']['status'], 'shared')
        self.assertFalse(items['AT-HS-002']['visible'])
        self.assertTrue(items['AT-HS-001']['visible'])
        self.assertEqual(publication(self.root)[0], self.model)
        stale = dict(batch, expected_revision=2)
        with self.assertRaisesRegex(ValueError, 'relire sa révision'):
            apply_table_changes(self.root, stale)
        invalid = {'session_id': stage['session_id'], 'expected_revision': 4,
                   'changes': [{'id': 'AT-HS-001', 'fields': {'title': 'Ne pas écrire'}},
                               {'id': 'AT-HS-002', 'fields': {'status': 'resolved'}}]}
        with self.assertRaisesRegex(ValueError, 'option retenue'):
            apply_table_changes(self.root, invalid)
        self.assertEqual(load_stage(self.root)['revision'], 4)
        self.assertEqual(effective_hotspots(model, load_stage(self.root))['AT-HS-001']['title'], 'Premier précisé')
        invalid_visibility = {'session_id': stage['session_id'], 'expected_revision': 4,
                              'changes': [{'id': 'AT-HS-001', 'fields': {'visible': False}},
                                          {'id': 'AT-HS-002', 'fields': {'visible': 'false'}}]}
        with self.assertRaisesRegex(ValueError, 'booléen'):
            apply_table_changes(self.root, invalid_visibility)
        self.assertEqual(load_stage(self.root)['revision'], 4)
        self.assertTrue(effective_hotspots(model, load_stage(self.root))['AT-HS-001']['visible'])

    def test_table_coordinates_type_location_and_resolution(self):
        model, model_sha = publication(self.root)
        stage = current_stage(self.root, model, model_sha)
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                  'verbatim': 'Ajoute une question de périmètre.',
                                  'fields': {'title': 'Coordination', 'problem': 'Qui agit ?',
                                             'location': {'node_ids': ['logistics']},
                                             'resolution_options': [{'id': 'opt-1', 'title': 'Clarifier',
                                                                     'principle': 'Fixer le contrat.',
                                                                     'implementation_complexity': 'S',
                                                                     'evidence_state': 'hypothesis'}]}})
        result = apply_table_changes(self.root, {'session_id': stage['session_id'], 'expected_revision': 1,
            'changes': [{'id': 'AT-HS-001', 'fields': {
                'kind': 'integration', 'location': {'node_ids': ['logistics', 'orchestration']},
                'status': 'resolved', 'selected_option_id': 'opt-1',
                'resolution_note': 'Contrat retenu pour la séance.'}}]})
        item = effective_hotspots(model, result)['AT-HS-001']
        self.assertEqual(item['kind'], 'integration')
        self.assertEqual(item['selected_option_id'], 'opt-1')
        self.assertEqual(item['status'], 'resolved')
        result = apply_table_changes(self.root, {'session_id': stage['session_id'], 'expected_revision': 2,
            'changes': [{'id': 'AT-HS-001', 'fields': {'status': 'validated'}}]})
        item = effective_hotspots(model, result)['AT-HS-001']
        self.assertNotIn('selected_option_id', item)
        self.assertNotIn('resolution_note', item)

    def test_table_credible_framing_is_atomic_and_keeps_final_choice_distinct(self):
        from scripts.hotspot_resolution import empty_resolution
        model, model_sha = publication(self.root)
        stage = current_stage(self.root, model, model_sha)
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
            'verbatim': 'Deux pistes de cadrage.', 'fields': {
                'title': 'Question', 'problem': 'Qui agit ?', 'location': {'node_ids': ['logistics']},
                'resolution_options': [{'id': key, 'title': key, 'principle': 'Contrat à qualifier',
                                       'implementation_complexity': 'S', 'evidence_state': 'hypothesis'}
                                       for key in ('a', 'b')]}})
        resolution = dict(empty_resolution(), stage='credible', summary='Deux solutions crédibles',
                          credible_option_ids=['a', 'b'], credibility_note='Hypothèses explicites',
                          assessed_on='2026-10-11', assessment_source='Séance')
        def request(fields, revision):
            return {'session_id': stage['session_id'], 'expected_revision': revision,
                    'changes': [{'id': 'AT-HS-001', 'fields': fields}]}
        with self.assertRaises(ValueError):
            apply_table_changes(self.root, request({'status': 'resolved', 'resolution': dict(resolution, credible_option_ids=[])}, 1))
        self.assertEqual(load_stage(self.root)['revision'], 1)
        result = apply_table_changes(self.root, request({'status': 'resolved', 'resolution': resolution}, 1))
        item = effective_hotspots(model, result)['AT-HS-001']
        self.assertEqual(item['resolution']['credible_option_ids'], ['a', 'b'])
        self.assertNotIn('selected_option_id', item)
        apply_table_changes(self.root, request({'selected_option_id': 'b'}, 2))
        result = apply_table_changes(self.root, request({'status': 'validated', 'resolution': dict(resolution, stage='qualifying', credible_option_ids=[])}, 3))
        self.assertEqual(effective_hotspots(model, result)['AT-HS-001']['selected_option_id'], 'b')
        self.assertEqual(publication(self.root)[0], self.model)


if __name__ == '__main__':
    unittest.main()
