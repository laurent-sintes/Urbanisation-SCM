"""Workshop import must preserve unrelated YAML and stop on conflicting edits."""

import json
import hashlib
import shutil
import tempfile
import unittest
from pathlib import Path

from scripts import structured_io
from scripts.atlas_workshop import ROOT, apply_request, apply_table_changes, current_stage, encoded, publication, stage_path
from scripts.atlas_workshop_import import apply, preview
from scripts.release_catalog import PublicationReader


class WorkshopImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        descriptor, model = PublicationReader(ROOT / 'modeles/release').load()
        version = descriptor['version']
        payload = encoded(model)
        data = self.root / 'app/dist/data'
        (data / version).mkdir(parents=True)
        (data / version / 'model.json').write_bytes(payload)
        (data / 'index.json').write_text(json.dumps({
            'current_version': version,
            'versions': [{'version': version, 'model_sha256': hashlib.sha256(payload).hexdigest()}],
        }), encoding='utf-8')
        for relative in ['modeles/backlog/model.yaml', 'modeles/backlog/glossary.yaml',
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
        next(item for item in model['hotspot_catalog']['hotspots'] if item['id'] == 'HS-002')['problem'] = 'Autre correction du backlog.'
        backlog_path.write_text(structured_io.dumps(model), encoding='utf-8')
        plan = preview(self.root, stage_path(self.root))
        self.assertIn('problem', plan['changes'][0]['conflicts'])

    def test_progress_import_accepts_empty_baseline_and_preserves_credible_solutions(self):
        from scripts.hotspot_resolution import empty_resolution
        model, model_sha = publication(self.root)
        stage = current_stage(self.root, model, model_sha)
        # Open an atelier before editing its published subject from the table.
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'update',
                                  'id': 'HS-002', 'verbatim': 'Évalue le cadrage.', 'fields': {'status': 'shared'}})
        item = next(item for item in model['hotspot_catalog']['hotspots'] if item['id'] == 'HS-002')
        resolution = dict(empty_resolution(), stage='credible', summary='Solution envisageable',
                          assessed_on='2026-10-11', assessment_source='Séance',
                          credible_option_ids=[item['resolution_options'][0]['id']], credibility_note='Sous réserves explicites')
        apply_table_changes(self.root, {'session_id': stage['session_id'], 'expected_revision': 1,
            'changes': [{'id': 'HS-002', 'fields': {'status': 'resolved', 'resolution': resolution}}]})
        plan = preview(self.root, stage_path(self.root))
        self.assertFalse(plan['changes'][0]['conflicts'])
        path = self.root / 'plan.json'
        path.write_text(structured_io.dumps(plan, '.json'), encoding='utf-8')
        self.add_source(plan, 'U99999')
        apply(self.root, path, 'U99999')
        updated = next(item for item in structured_io.read(self.root / 'modeles/backlog/model.yaml')['hotspot_catalog']['hotspots'] if item['id'] == 'HS-002')
        self.assertEqual(updated['resolution'], resolution)
        self.assertNotIn('selected_option_id', updated)


if __name__ == '__main__':
    unittest.main()
