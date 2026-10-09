"""Static export boundaries: explicit index, immutable snapshots, atomic activation."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from scripts.export_atlas import export_atlas, encoded


class StaticExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.release = self.root / 'modeles/release'
        self.output = self.root / 'site/data'
        self.release.mkdir(parents=True)
        entries = []
        for version in ('2026-09-25.1', '2026-09-26.1'):
            folder = self.release / version
            folder.mkdir()
            model = encoded({'space': 'release', 'version': version, 'nodes': [], 'relations': [], 'glossary': {'terms': []}})
            (folder / 'model.json').write_bytes(model)
            descriptor = encoded({'version': version, 'path': version + '/model.json', 'sha256': hashlib.sha256(model).hexdigest()})
            name = version + '.json'
            (self.release / name).write_bytes(descriptor)
            entries.append({'descriptor': name, 'sha256': hashlib.sha256(descriptor).hexdigest()})
        # Current is deliberately NOT the highest version.
        (self.release / 'index.json').write_bytes(encoded({'current': entries[0]['descriptor'], 'publications': entries}))

    def test_explicit_pointer_exact_content_and_idempotent_export(self):
        (self.root / 'modeles/backlog').mkdir()
        (self.root / 'modeles/backlog/model.yaml').write_text('invalid live backlog')
        result = export_atlas(self.root, [self.output])
        self.assertEqual(result['current_version'], '2026-09-25.1')
        catalog = json.loads((self.output / 'index.json').read_bytes())
        for entry in catalog['versions']:
            version = entry['version']
            payload = (self.output / version / 'model.json').read_bytes()
            model = json.loads(payload)
            self.assertEqual(model.pop('sourcePath'), f'modeles/release/{version}/model.json')
            metamodel = model.pop('metamodel')
            self.assertEqual(metamodel['publication_version'], version)
            self.assertEqual(metamodel['methodology']['status'], 'unavailable')
            self.assertEqual(metamodel['node_types'], [])
            self.assertEqual(metamodel['relation_types'], [])
            self.assertEqual(model, json.loads((self.release / version / 'model.json').read_bytes()))
            self.assertEqual(hashlib.sha256(payload).hexdigest(), entry['model_sha256'])
            guide = json.loads((self.output / version / 'guide.json').read_bytes())
            self.assertEqual(guide['publication_version'], version)
            self.assertEqual(guide['status'], 'unavailable')
        before = {p: p.stat().st_mtime_ns for p in self.output.rglob('*.json')}
        export_atlas(self.root, [self.output])
        self.assertEqual(before, {p: p.stat().st_mtime_ns for p in before})

    def test_metamodel_describes_object_semantics_and_observed_relations(self):
        from scripts.atlas_metamodel import describe_metamodel
        model = {
            'version': '2026-09-25.1',
            'glossary': {'terms': [{'id': 'TER203', 'name': 'Univers',
                                    'definition': 'Vue de la cible.', 'historical': False}]},
            'nodes': [{'id': 'u', 'kind': 'universe'}, {'id': 's', 'kind': 'business_system'}],
            'relations': [{'id': 'r', 'type': 'contains', 'source_id': 'u', 'target_id': 's'}],
        }
        guide = {'status': 'available', 'association': {'scope': 'contemporaneous'},
                 'guide': {'version': '2026-09-25.1', 'glossary': {'terms': [
                     {'id': 'MOD022', 'name': 'Business System',
                      'definition': 'Ensemble de [domaines](method:MOD008).'}]}}}
        header = describe_metamodel(model, guide)
        types = {entry['kind']: entry for entry in header['node_types']}
        self.assertEqual(types['universe']['definition'], 'Vue de la cible.')
        self.assertEqual(types['universe']['definition_source'], 'glossary:TER203')
        self.assertEqual(types['business_system']['definition'], 'Ensemble de domaines.')
        self.assertEqual(types['business_system']['definition_source'], 'method:MOD022')
        self.assertEqual(header['relation_types'][0]['observed_endpoints'], [
            {'source_kind': 'universe', 'target_kind': 'business_system', 'count': 1}])

    def test_current_publication_has_semantics_cardinalities_and_schema(self):
        from app.modeling_guide import _load_associated_guide
        from scripts.atlas_metamodel import describe_metamodel
        from scripts.structured_io import read
        from scripts.release_catalog import PublicationReader
        project = Path(__file__).resolve().parents[1]
        reader = PublicationReader(project / 'modeles/release')
        current = reader.catalog()['current_version']
        _, model = reader.load(current)
        guide = _load_associated_guide(project, current)
        schema = read(project / 'modeles/schemas/urbanism.schema.json')
        header = describe_metamodel(model, guide, schema)
        self.assertEqual(header['publication_version'], current)
        self.assertEqual(header['methodology']['status'], 'available')
        self.assertTrue(all(entry['definition'] for entry in header['node_types']))
        self.assertTrue(all(entry['definition'] for entry in header['catalog_types']))
        rules = {entry['id']: entry for entry in header['constraints']}
        self.assertEqual(rules['capability-parent']['cardinality']['parent'], {'min': 1, 'max': 1})
        self.assertEqual(rules['capability-behaviors']['cardinality']['behavior_children']['allowed'], [0, '2..*'])
        relation_types = {entry['type']: entry for entry in header['relation_types']}
        self.assertEqual(relation_types['contains']['allowed_endpoints'], [
            {'source_kind': 'universe', 'target_kind': 'business_system'},
            {'source_kind': 'area', 'target_kind': 'business_area'},
            {'source_kind': 'business_area', 'target_kind': 'capability'},
            {'source_kind': 'capability', 'target_kind': 'behavior'},
        ])
        self.assertIn('$defs', header['snapshot_schema'])

    def test_corrupt_publication_does_not_activate_partial_export(self):
        export_atlas(self.root, [self.output])
        before = {p: p.read_bytes() for p in self.output.rglob('*.json')}
        (self.release / '2026-09-26.1/model.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            export_atlas(self.root, [self.output])
        self.assertEqual(before, {p: p.read_bytes() for p in before})

    def test_missing_index_is_not_inferred_from_directories(self):
        (self.release / 'index.json').unlink()
        with self.assertRaises(FileNotFoundError):
            export_atlas(self.root, [self.output])
        self.assertFalse(self.output.exists())

    def test_inventory_is_read_once_and_each_model_is_verified_once(self):
        from unittest.mock import patch
        from scripts import release_catalog
        with patch.object(release_catalog, 'descriptors', wraps=release_catalog.descriptors) as inventory, \
                patch.object(release_catalog, '_read_release', wraps=release_catalog._read_release) as models:
            result = export_atlas(self.root, [self.output])
        self.assertEqual(inventory.call_count, 1)
        self.assertEqual(models.call_count, 2)
        self.assertGreaterEqual(result['timings_seconds']['total'], result['timings_seconds']['models'])

    def test_descriptor_change_during_writes_blocks_catalog_activation(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        original = module.atomic_write
        def changed(path, payload):
            if Path(path).name == 'model.json':
                descriptor = self.release / '2026-09-26.1.json'
                descriptor.write_bytes(descriptor.read_bytes() + b' ')
            original(path, payload)
        with patch.object(module, 'atomic_write', side_effect=changed):
            with self.assertRaisesRegex(ValueError, 'descriptor hash mismatch'):
                export_atlas(self.root, [self.output])
        self.assertFalse((self.output / 'index.json').exists())

    def test_warm_parsing_cache_does_not_skip_integrity_checks(self):
        from scripts.structured_io import read
        path = self.release / '2026-09-25.1/model.json'
        expected = hashlib.sha256(path.read_bytes()).hexdigest()
        read(path)
        self.assertEqual(read(path, expected_sha256=expected)['version'], '2026-09-25.1')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            read(path, expected_sha256='0' * 64)
        path.write_bytes(path.read_bytes().replace(b'2026-09-25.1', b'2026-09-25.2'))
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            read(path, expected_sha256=expected)

    def test_missing_model_hash_cannot_disable_verification(self):
        descriptor_path = self.release / '2026-09-25.1.json'
        descriptor = json.loads(descriptor_path.read_bytes())
        descriptor['sha256'] = None
        descriptor_path.write_bytes(encoded(descriptor))
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['publications'][0]['sha256'] = hashlib.sha256(descriptor_path.read_bytes()).hexdigest()
        index_path.write_bytes(encoded(index))
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            export_atlas(self.root, [self.output])
        self.assertFalse(self.output.exists())

    def test_shared_lock_refuses_other_process_and_allows_nested_owner(self):
        import subprocess
        import sys
        from scripts.atlas_lock import atlas_lock
        with atlas_lock(self.root):
            export_atlas(self.root, [self.output])
            child = subprocess.run([sys.executable, '-c',
                'import sys; from pathlib import Path; from scripts.export_atlas import export_atlas; export_atlas(Path(sys.argv[1]))',
                str(self.root)], capture_output=True, text=True)
            self.assertNotEqual(child.returncode, 0)
            self.assertIn('Atlas is being', child.stderr)
        export_atlas(self.root, [self.output])

    def test_pointer_change_during_writes_refuses_old_catalog_activation(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        original = module.atomic_write
        def changed(path, payload):
            if Path(path).name == 'model.json':
                index_path = self.release / 'index.json'
                index = json.loads(index_path.read_bytes())
                index['current'] = '2026-09-26.1.json'
                index_path.write_bytes(encoded(index))
            original(path, payload)
        with patch.object(module, 'atomic_write', side_effect=changed):
            with self.assertRaisesRegex(ValueError, 'before static activation'):
                export_atlas(self.root, [self.output])
        self.assertFalse((self.output / 'index.json').exists())
        export_atlas(self.root, [self.output])
        self.assertEqual(json.loads((self.output / 'index.json').read_bytes())['current_version'], '2026-09-26.1')

    def test_activation_failure_preserves_served_catalog_and_cleans_temp(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        export_atlas(self.root, [self.output])
        previous = (self.output / 'index.json').read_bytes()
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['current'] = '2026-09-26.1.json'
        index_path.write_bytes(encoded(index))
        with patch.object(module.os, 'replace', side_effect=OSError('interrupted')):
            with self.assertRaises(OSError):
                export_atlas(self.root, [self.output])
        self.assertEqual((self.output / 'index.json').read_bytes(), previous)
        self.assertEqual(list(self.output.rglob('*.tmp')), [])
        export_atlas(self.root, [self.output])


if __name__ == '__main__':
    unittest.main()
