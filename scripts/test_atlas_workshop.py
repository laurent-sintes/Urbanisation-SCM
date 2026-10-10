"""A workshop stages changes without editing the published model."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from scripts.atlas_workshop import apply_request, close_stage, current_stage, effective_hotspots, load_stage, publication


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
                                      'political': 'XL', 'implementation': 'L', 'rationale': 'Décision transverse.'}}})
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


if __name__ == '__main__':
    unittest.main()
