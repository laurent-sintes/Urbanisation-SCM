"""Post-release integrity checks against disposable static exports, without network."""
from copy import deepcopy
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit

from scripts import release
from scripts.export_atlas import encoded, export_atlas


class AtlasVerificationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.folder = self.root / 'modeles/release'
        self.output = self.root / 'site/data'
        self.folder.mkdir(parents=True)
        self.version = '2026-09-25.1'
        entries = []
        # The indexed current publication deliberately precedes the highest version.
        for version in (self.version, '2026-09-26.1'):
            target = self.folder / version
            target.mkdir()
            model = {
                'model_id': 'fixture', 'space': 'release', 'version': version,
                'revision': 1, 'last_modified': '2026-09-25',
                'nodes': [{'id': 'D1', 'kind': 'domain', 'fields': {'name': 'Domain'}},
                          {'id': 'C1', 'kind': 'capability', 'fields': {'name': 'Capability'}}],
                'relations': [{'id': 'R1', 'source_id': 'D1', 'target_id': 'C1', 'type': 'contains'}],
                'glossary': {'terms': [{'id': 'T1', 'name': 'Term'}]},
                'principles': [{'id': 'P1', 'definition': 'Published method'}],
                'display_index': {'roots': ['D1'], 'codes': {'D1': 'DOM001', 'C1': 'CAP001'}},
                'scenario_catalog': {'scenarios': [{'id': 'S1'}], 'paths': [{'id': 'PATH1'}]},
                'information_catalog': {'items': [{'id': 'I1'}], 'links': []},
                'publication': {'source_refs': ['fixture']},
                'future_extension': {'payload': ['must also survive']},
            }
            payload = encoded(model)
            (target / 'model.json').write_bytes(payload)
            descriptor = encoded({'version': version, 'path': version + '/model.json',
                                  'sha256': hashlib.sha256(payload).hexdigest()})
            name = version + '.json'
            (self.folder / name).write_bytes(descriptor)
            entries.append({'descriptor': name, 'sha256': hashlib.sha256(descriptor).hexdigest()})
        (self.folder / 'index.json').write_bytes(encoded({'current': entries[0]['descriptor'], 'publications': entries}))
        export_atlas(self.root, [self.output])
        self.model_path = self.output / self.version / 'model.json'
        self.model = json.loads(self.model_path.read_bytes())
        self.catalog_path = self.output / 'index.json'
        self.catalog = json.loads(self.catalog_path.read_bytes())

    def response(self, address, timeout=10):
        route = urlsplit(address).path
        if route == '/__atlas__/identity.json':
            return io.BytesIO(encoded({'appName': 'FLOW Atlas', 'repositoryRoot': str(self.root), 'mode': 'static'}))
        if not route.startswith('/data/'):
            raise AssertionError('Unexpected simulated route: ' + route)
        return io.BytesIO((self.output / route.removeprefix('/data/')).read_bytes())

    def verify(self):
        with patch.object(release, 'urlopen', side_effect=self.response):
            return release.verify_atlas(self.root, self.version)

    def test_complete_export_and_unavailable_guide_match_the_explicit_current_pointer(self):
        (self.root / 'modeles/backlog').mkdir()
        (self.root / 'modeles/backlog/model.yaml').write_text('invalid live backlog')
        result = self.verify()
        self.assertTrue(result['verified'])
        self.assertEqual(result['version'], self.version)
        self.assertEqual(self.catalog['versions'][0]['version'], '2026-09-26.1')

    def test_frozen_associated_guide_roundtrips_with_a_string_repository_path(self):
        from scripts.git_history import read_bytes
        from scripts.structured_io import dumps
        name = 'versions/2026-09-19.4.yaml'
        folder = self.root / 'modeles/modeling-guides'
        (folder / 'versions').mkdir(parents=True)
        payload = read_bytes(Path(__file__).resolve().parents[1] / 'modeles/modeling-guides' / name)
        (folder / name).write_bytes(payload)
        index = {'schema_version': '1.0.0', 'guides': [{
            'version': '2026-09-19.4', 'path': name, 'sha256': hashlib.sha256(payload).hexdigest()}],
            'associations': [{'publication_version': self.version, 'guide_version': '2026-09-19.4',
                              'scope': 'fixture', 'note': 'Explicit association for the isolated test.'}]}
        (folder / 'index.yaml').write_text(dumps(index, '.yaml'), encoding='utf-8')
        export_atlas(self.root, [self.output])
        with patch.object(release, 'urlopen', side_effect=self.response):
            self.assertTrue(release.verify_atlas(str(self.root), self.version)['verified'])
        path = self.output / self.version / 'guide.json'
        guide = json.loads(path.read_bytes())
        guide['guide']['lessons'].pop()
        path.write_bytes(encoded(guide))
        with self.assertRaisesRegex(ValueError, 'Atlas methodology differs'):
            self.verify()

    def test_loss_of_any_published_root_field_is_rejected(self):
        for field in self.model:
            with self.subTest(field=field):
                actual = deepcopy(self.model)
                del actual[field]
                self.model_path.write_bytes(encoded(actual))
                message = 'Atlas serves another publication' if field in ('version', 'sourcePath') else 'Atlas model differs:.*' + field
                with self.assertRaisesRegex(ValueError, message):
                    self.verify()

    def test_altered_catalogs_and_future_fields_are_rejected_even_with_matching_served_hash(self):
        for field in ('scenario_catalog', 'display_index', 'principles', 'information_catalog', 'future_extension'):
            with self.subTest(field=field):
                actual = deepcopy(self.model)
                actual[field] = [] if isinstance(actual[field], list) else {}
                payload = encoded(actual)
                self.model_path.write_bytes(payload)
                catalog = deepcopy(self.catalog)
                entry = next(item for item in catalog['versions'] if item['version'] == self.version)
                entry['model_sha256'] = hashlib.sha256(payload).hexdigest()
                self.catalog_path.write_bytes(encoded(catalog))
                with self.assertRaisesRegex(ValueError, 'Atlas model differs:.*' + field):
                    self.verify()

    def test_extra_fields_and_reordered_nodes_are_rejected(self):
        for change in ('added_root', 'added_node_field', 'node_order'):
            with self.subTest(change=change):
                actual = deepcopy(self.model)
                if change == 'added_root':
                    actual['extra'] = 'not published'
                elif change == 'added_node_field':
                    actual['nodes'][0]['fields']['extra'] = 'not published'
                else:
                    actual['nodes'].reverse()
                self.model_path.write_bytes(encoded(actual))
                with self.assertRaisesRegex(ValueError, 'Atlas model differs'):
                    self.verify()

    def test_served_catalog_model_hash_is_required_and_checked(self):
        for value in (None, '0' * 64):
            with self.subTest(value=value):
                catalog = deepcopy(self.catalog)
                entry = next(item for item in catalog['versions'] if item['version'] == self.version)
                if value is None:
                    del entry['model_sha256']
                else:
                    entry['model_sha256'] = value
                self.catalog_path.write_bytes(encoded(catalog))
                with self.assertRaisesRegex(ValueError, 'Atlas model hash differs'):
                    self.verify()

    def test_equivalent_json_with_a_nonexported_payload_hash_is_rejected(self):
        payload = json.dumps(self.model, ensure_ascii=False, indent=2).encode('utf-8')
        self.model_path.write_bytes(payload)
        catalog = deepcopy(self.catalog)
        entry = next(item for item in catalog['versions'] if item['version'] == self.version)
        entry['model_sha256'] = hashlib.sha256(payload).hexdigest()
        self.catalog_path.write_bytes(encoded(catalog))
        with self.assertRaisesRegex(ValueError, 'Atlas model hash differs'):
            self.verify()

    def test_catalog_metadata_current_selection_and_order_are_checked(self):
        for change in ('order', 'descriptor', 'current', 'missing_version'):
            with self.subTest(change=change):
                catalog = deepcopy(self.catalog)
                if change == 'order':
                    catalog['versions'].reverse()
                elif change == 'descriptor':
                    catalog['versions'][0]['descriptor'] = 'another-descriptor.json'
                elif change == 'current':
                    catalog['current_version'] = '2026-09-26.1'
                else:
                    catalog['versions'] = catalog['versions'][:1]
                self.catalog_path.write_bytes(encoded(catalog))
                with self.assertRaisesRegex(ValueError, 'Atlas catalog differs'):
                    self.verify()

    def test_associated_guide_loss_and_catalog_hash_are_checked(self):
        guide_path = self.output / self.version / 'guide.json'
        original = guide_path.read_bytes()
        guide = json.loads(original)
        del guide['publication_version']
        guide_path.write_bytes(encoded(guide))
        with self.assertRaisesRegex(ValueError, 'Atlas methodology differs'):
            self.verify()
        guide_path.write_bytes(original)
        catalog = deepcopy(self.catalog)
        entry = next(item for item in catalog['versions'] if item['version'] == self.version)
        entry['guide_sha256'] = '0' * 64
        self.catalog_path.write_bytes(encoded(catalog))
        with self.assertRaisesRegex(ValueError, 'Atlas methodology hash differs'):
            self.verify()


if __name__ == '__main__':
    unittest.main()
