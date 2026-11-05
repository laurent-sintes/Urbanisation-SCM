"""Single-source builds, coherent artifacts and safe cleanup of generated history."""
from hashlib import sha256
from pathlib import Path
import json
import tempfile
import unittest
from unittest.mock import patch
from scripts.current_model import compile_current, export_current, prune_generated_history
from scripts.structured_io import dumps


class CurrentModelTests(unittest.TestCase):
    def fixture(self, root):
        def write(name, value):
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(dumps(value), encoding='utf-8')
        config = {'schema_version': 1, 'mode': 'current', 'model': 'work/model.yaml',
                  'glossary': 'work/glossary.yaml', 'methodology': 'work/guide.yaml',
                  'agreements': 'work/agreements.yaml', 'intents': 'work/intents.yaml',
                  'sources': 'work/sources.yaml', 'schema': 'work/schema.yaml'}
        write('modeles/project.yaml', config)
        write(config['model'], {'schema_version': '1.0.0', 'model_id': 'test', 'version': '2026-11-05.1',
                                'space': 'backlog', 'nodes': [], 'relations': [], 'principles': []})
        write(config['glossary'], {'terms': []})
        write(config['agreements'], {'decisions': [], 'contexts': {}})
        write(config['intents'], {'schema_version': '1.0.0', 'intents': []})
        write(config['sources'], {'records': []})
        write(config['schema'], {})
        write(config['methodology'], {'version': '2026-11-05.1'})
        guide = {'version': '2026-11-05.1', 'chapters': [], 'glossary': {'terms': []}}
        return patch('scripts.guide_candidate.compile_draft', return_value=(b'', guide, {
            config['methodology']: sha256((root / config['methodology']).read_bytes()).hexdigest()}))

    def test_dirty_source_changes_build_identity_without_release_or_commit(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with self.fixture(root):
                first, _, _ = compile_current(root)
                path = root / 'work/model.yaml'
                path.write_bytes(path.read_bytes() + b'working_note: "New local change"\n')
                second, _, _ = compile_current(root)
                self.assertNotEqual(first['version'], second['version'])
                self.assertEqual(second['working_note'], 'New local change')
                self.assertEqual(second['space'], 'current')
                self.assertNotIn('publication', second)
                self.assertFalse((root / 'modeles/release').exists())
                self.assertEqual(compile_current(root)[0], second)

    def test_missing_source_never_falls_back_to_a_historical_snapshot(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with self.fixture(root):
                (root / 'work/model.yaml').unlink()
                with self.assertRaisesRegex(ValueError, 'Missing or unsafe'):
                    compile_current(root)

    def test_export_pins_one_model_glossary_and_guide_and_detects_tampering(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            with self.fixture(root):
                output = root / 'app/public/data'
                result = export_current(root, [output])
                catalog = json.loads((output / 'index.json').read_bytes())
                self.assertEqual(catalog['mode'], 'current')
                self.assertEqual(len(catalog['versions']), 1)
                version = result['current_version']
                entry = catalog['versions'][0]
                for name, field in [('model.json', 'model_sha256'), ('model.yaml', 'model_yaml_sha256'),
                                    ('guide.json', 'guide_sha256')]:
                    self.assertEqual(sha256((output / version / name).read_bytes()).hexdigest(), entry[field])
                export_current(root, [], require_cached=True)
                (output / version / 'guide.json').write_bytes(b'{}')
                with self.assertRaisesRegex(ValueError, 'outdated'):
                    export_current(root, [], require_cached=True)

    def test_generated_cleanup_preserves_sources_and_unknown_directories(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            data = root / 'app/dist/data'
            for name in ['2026-11-05.1', 'current-' + 'a' * 24, 'current-' + 'b' * 24, 'user-files']:
                (data / name).mkdir(parents=True)
                (data / name / 'model.json').write_text('{}')
            source = root / 'modeles/release/2026-11-05.1/model.yaml'
            source.parent.mkdir(parents=True)
            source.write_text('Frozen proof')
            self.assertEqual(prune_generated_history(data, 'current-' + 'b' * 24), 2)
            self.assertTrue(source.exists())
            self.assertTrue((data / 'user-files/model.json').exists())
            self.assertTrue((data / ('current-' + 'b' * 24)).exists())


if __name__ == '__main__':
    unittest.main()
