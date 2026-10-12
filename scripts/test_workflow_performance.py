"""Acceleration must preserve exact contexts, invalidation and explicit scopes."""
from copy import deepcopy
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.dependency_signature import signature, dependency_files
from scripts.delivery_index import declarations
from scripts import record_decision as recorder
from scripts.backlog_delivery import check_delivery
from scripts.structured_io import dumps


class WorkflowPerformanceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.folder = self.root / 'modeles/backlog'
        self.folder.mkdir(parents=True)

    def save(self, name, declaration):
        path = self.folder / name
        path.write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        return path

    def test_signature_tracks_transitive_imports_but_not_tests(self):
        package = self.root / 'scripts'
        package.mkdir()
        (package / 'entry.py').write_text('from . import helper\n', encoding='utf-8')
        helper = package / 'helper.py'
        helper.write_text('VALUE = 1\n', encoding='utf-8')
        before = signature(self.root, ['scripts/entry.py'])
        (package / 'test_extra.py').write_text('VALUE = 2\n', encoding='utf-8')
        self.assertEqual(before, signature(self.root, ['scripts/entry.py']))
        helper.write_text('VALUE = 2\n', encoding='utf-8')
        self.assertNotEqual(before, signature(self.root, ['scripts/entry.py']))
        self.assertIn(helper, dependency_files(self.root, ['scripts/entry.py']))

    def test_index_detects_same_size_change_and_new_deleted_files(self):
        old = self.save('old.yaml', {'state': 'applied', 'required_nodes': [{'id': 'A', 'fields': {'name': 'Old'}}]})
        declarations(self.root)
        with patch('scripts.delivery_index.read', side_effect=AssertionError('Unchanged source must not be parsed')):
            self.assertIn('old.yaml', declarations(self.root))
        old.write_text(old.read_text(encoding='utf-8').replace('Old', 'New'), encoding='utf-8')
        self.assertEqual(declarations(self.root)['old.yaml']['required_nodes'][0]['fields']['name'], 'New')
        self.save('new.yaml', {'state': 'pending'})
        self.assertIn('new.yaml', declarations(self.root))
        old.unlink()
        self.assertNotIn('old.yaml', declarations(self.root))

    def test_replacement_preserves_history_and_other_field_checks(self):
        old = self.save('old.yaml', {'state': 'applied', 'required_nodes': [{'id': 'A', 'fields': {'name': 'Old', 'scope': 'Kept'}}]})
        before = old.read_bytes()
        self.save('new.yaml', {'state': 'applied', 'source_refs': ['U2'],
            'required_nodes': [{'id': 'A', 'fields': {'name': 'New'}}],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'nodes', 'id': 'A', 'fields': ['name']}]})
        model = {'nodes': [{'id': 'A', 'fields': {'name': 'New', 'scope': 'Kept'}}], 'relations': []}
        self.assertEqual(check_delivery(self.root, model)[1], [])
        self.assertEqual(old.read_bytes(), before)
        model['nodes'][0]['fields']['scope'] = 'Changed'
        self.assertTrue(any('scope' in e for e in check_delivery(self.root, model)[1]))

    def test_invalid_null_declaration_is_not_hidden_by_index(self):
        self.save('invalid.yaml', None)
        for _ in range(2):
            self.assertTrue(check_delivery(self.root, {'nodes': [], 'relations': []})[1])

    def test_corrupt_index_is_rebuilt_from_sources(self):
        self.save('old.yaml', {'state': 'pending'})
        declarations(self.root)
        for path in (self.root / '.runtime/delivery-index').glob('*.json'):
            path.write_bytes(b'corrupt cache')
        stats = {}
        self.assertEqual(declarations(self.root, stats)['old.yaml']['state'], 'pending')
        self.assertEqual(stats['parsed_files'], 1)

    def test_supersession_requires_replacement_check_and_source(self):
        self.save('old.yaml', {'state': 'applied', 'required_nodes': [{'id': 'A', 'fields': {'name': 'Old'}}]})
        self.save('new.yaml', {'state': 'applied', 'required_nodes': [{'id': 'A'}],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'nodes', 'id': 'A', 'fields': ['name']}]})
        model = {'nodes': [{'id': 'A', 'fields': {'name': 'New'}}], 'relations': []}
        self.assertTrue(any('invalid supersession' in e for e in check_delivery(self.root, model)[1]))

    def test_retirement_does_not_require_rewriting_old_annex(self):
        self.save('old.yaml', {'state': 'applied', 'required_nodes': [{'id': 'A', 'fields': {'name': 'Old'}}]})
        self.save('new.yaml', {'state': 'applied', 'source_refs': ['U2'], 'absent_nodes': ['A'],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'nodes', 'id': 'A', 'fields': ['exists']}]})
        self.assertEqual(check_delivery(self.root, {'nodes': [], 'relations': []})[1], [])
        self.assertTrue(check_delivery(self.root, {'nodes': [{'id': 'A', 'fields': {}}], 'relations': []})[1])

    def test_cyclic_supersessions_cannot_remove_all_checks(self):
        for name, previous in [('one.yaml', 'two.yaml'), ('two.yaml', 'one.yaml')]:
            self.save(name, {'state': 'applied', 'source_refs': ['U2'],
                'required_nodes': [{'id': 'A', 'fields': {'name': 'New'}}],
                'supersedes_requirements': [{'annex': previous, 'collection': 'nodes', 'id': 'A', 'fields': ['name']}]})
        model = {'nodes': [{'id': 'A', 'fields': {'name': 'Unchecked'}}], 'relations': []}
        self.assertTrue(any('cyclic' in e for e in check_delivery(self.root, model)[1]))

    def test_failed_preflight_cannot_capture_agreements(self):
        from scripts.check_backlog import check
        def read_input(path):
            if path.name == 'model.yaml':
                return {'nodes': [], 'relations': []}
            if path.name == 'source-records.json':
                return {'records': []}
            return {}
        with patch('scripts.check_backlog.read', side_effect=read_input), \
             patch('scripts.check_backlog.validate_sources', return_value=[]), \
             patch('scripts.check_backlog.validate_urbanism', return_value=['Invalid model']), \
             patch('scripts.check_backlog.check_delivery', return_value=([], [])), \
             patch('scripts.check_backlog.record_intents') as capture:
            self.assertEqual(check(self.root, intents=[{}])['errors'], ['Invalid model'])
            capture.assert_not_called()

    def test_context_index_is_identical_and_catches_new_snapshots(self):
        model = {'nodes': [{'id': 'A', 'fields': {'name': 'A'}}, {'id': 'B', 'fields': {'name': 'B'}}],
                 'relations': [{'id': 'R', 'type': 'contains', 'source_id': 'A', 'target_id': 'B'}],
                 'glossary': {'terms': [{'id': 'T', 'definition': 'Original'}]}, 'principles': []}
        index = recorder.ContextIndex(model)
        for collection, identifier in [('nodes', 'A'), ('nodes', 'B'), ('relations', 'R')]:
            expected = recorder.compact_context(recorder.semantic_context(model, collection, identifier))
            self.assertEqual(index.context(collection, identifier), expected)
            self.assertEqual(index.context(collection, identifier, True), recorder.semantic_context(model, collection, identifier))
        other = deepcopy(model)
        other['glossary']['terms'][0]['definition'] = 'Changed'
        self.assertNotEqual(index.context('nodes', 'A'), recorder.ContextIndex(other).context('nodes', 'A'))
