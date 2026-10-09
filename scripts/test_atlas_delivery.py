"""A successful deployment must contain the exact build, not only an HTTP 200."""
import unittest
from scripts.atlas_delivery import digest, verify


class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.files = {'index.html': b'new UI', 'data/index.json': b'new catalog',
                      'data/2026-09-28.3/model.json': b'complete model',
                      'data/2026-09-28.3/model.yaml': b'readable model',
                      'data/2026-09-28.3/guide.json': b'complete methodology',
                      'assets/scenarios.js': b'scenario reader'}
        self.expected = {'schema_version': 1, 'commit': 'expected-commit',
                         'current_version': '2026-09-28.3',
                         'files': {name: digest(body) for name, body in self.files.items()}}

    def test_exact_content_is_required_including_lazy_reader(self):
        self.assertEqual(verify(self.expected, self.files.__getitem__)['status'], 'verified')
        for name in self.files:
            with self.subTest(name=name):
                changed = {**self.files, name: b'old, empty or truncated content'}
                with self.assertRaisesRegex(ValueError, 'differs'):
                    verify(self.expected, changed.__getitem__)

    def test_missing_manifest_fields_and_escaping_paths_are_rejected(self):
        self.expected['files'].pop('data/2026-09-28.3/guide.json')
        with self.assertRaisesRegex(ValueError, 'Incomplete'):
            verify(self.expected, self.files.__getitem__)
        self.setUp()
        self.expected['files']['../outside'] = digest(b'')
        with self.assertRaisesRegex(ValueError, 'path'):
            verify(self.expected, self.files.__getitem__)
