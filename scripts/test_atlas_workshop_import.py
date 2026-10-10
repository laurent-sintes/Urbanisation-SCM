"""Workshop import must preserve unrelated YAML and stop on conflicting edits."""

import json
import hashlib
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts import structured_io
from scripts.atlas_workshop import ROOT, apply_request, current_stage, publication, stage_path
from scripts.atlas_workshop_import import apply, preview


class WorkshopImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        source_data = ROOT / 'app/dist/data'
        index = json.loads((source_data / 'index.json').read_bytes())
        version = index['current_version']
        for relative in [f'app/dist/data/{version}/model.json', 'app/dist/data/index.json',
                         'modeles/backlog/model.yaml', 'modeles/backlog/glossary.yaml',
                         'modeles/schemas/urbanism.schema.json', 'modeles/provenance/source-records.json']:
            destination = self.root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / relative, destination)
        model, model_sha = publication(self.root)
        current_stage(self.root, model, model_sha)

    def test_preview_and_apply_preserve_unrelated_yaml(self):
        request = {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                   'verbatim': 'Ajoute un sujet sur Logistics.',
                   'fields': {'title': 'Sujet atelier', 'kind': 'scope',
                              'location': {'node_ids': ['domain-logistics-execution']},
                              'problem': 'Question à instruire.'}}
        apply_request(self.root, request)
        plan = preview(self.root, stage_path(self.root))
        self.assertEqual(plan['changes'][0]['action'], 'add')
        self.assertFalse(plan['changes'][0]['conflicts'])
        plan_path = self.root / 'plan.json'
        plan_path.write_text(structured_io.dumps(plan, '.json'), encoding='utf-8')
        backlog_path = self.root / 'modeles/backlog/model.yaml'
        before = backlog_path.read_text(encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Source absente'):
            apply(self.root, plan_path, 'U99999')
        self.assertEqual(before, backlog_path.read_text(encoding='utf-8'))
        self.add_source(plan, 'U99999')
        result = apply(self.root, plan_path, 'U99999')
        after = backlog_path.read_text(encoding='utf-8')
        self.assertEqual(result['integrated'], 1)
        self.assertEqual(before[before.index('display_policy:'):before.index('hotspot_catalog:')],
                         after[after.index('display_policy:'):after.index('hotspot_catalog:')])
        item = structured_io.read(backlog_path)['hotspot_catalog']['hotspots'][-1]
        self.assertTrue(item['id'].startswith('HS-W-'))
        self.assertEqual(item['source_refs'], ['U99999'])
        self.assertNotIn('workshop', item)
        with self.assertRaisesRegex(ValueError, 'périmé'):
            apply(self.root, plan_path, 'U99999')

    def add_source(self, plan, identifier):
        path = self.root / 'modeles/provenance/source-records.json'
        document = structured_io.read(path)
        verbatims = [text for change in plan['changes'] for text in change['verbatims']]
        captured = f'## {identifier}\nSéance : {plan["session_id"]}\nVerbatim :\n' + '\n'.join(f'> {text}' for text in verbatims)
        document['records'].append({'id': identifier, 'path': 'connaissance/01-contributions-utilisateur.md',
                                    'anchor': identifier.lower(), 'line': 1, 'captured_text': captured,
                                    'content_sha256': hashlib.sha256(captured.strip().encode()).hexdigest()})
        path.write_text(structured_io.dumps(document, '.json'), encoding='utf-8')

    def test_conflicting_published_update_is_reported(self):
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'update',
                                  'id': 'HS-002', 'verbatim': 'Précise la question C-LOG.',
                                  'fields': {'problem': 'Nouvelle question d’atelier.'}})
        backlog_path = self.root / 'modeles/backlog/model.yaml'
        model = structured_io.read(backlog_path)
        model['hotspot_catalog']['hotspots'][0]['problem'] = 'Autre correction du backlog.'
        backlog_path.write_text(structured_io.dumps(model), encoding='utf-8')
        plan = preview(self.root, stage_path(self.root))
        self.assertIn('problem', plan['changes'][0]['conflicts'])


if __name__ == '__main__':
    unittest.main()
