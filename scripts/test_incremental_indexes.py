"""Equivalence, missing-target and invalidation tests for disposable indexes."""
from copy import deepcopy
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.glossary import reference_impacts, ReferenceIndex
from scripts.delta_model import delta
from scripts.index_model import load
from scripts.structured_io import dumps
from scripts.plan_checks import plan
from scripts.model_index import ModelIndex


class IncrementalIndexTests(unittest.TestCase):
    def model(self):
        return {'nodes': [{'id': 'root', 'kind': 'domain', 'fields': {'name': 'Root'}},
                          {'id': 'cap', 'kind': 'capability', 'fields': {'name': 'Cap', 'definition': '[A](glossary:A)'}}],
                'relations': [{'id': 'edge', 'source_id': 'root', 'target_id': 'cap', 'type': 'contains'}],
                'glossary': {'terms': [{'id': 'A', 'definition': '[B](glossary:B)'},
                                       {'id': 'B', 'definition': '[A](glossary:A)'}]}}

    def test_unchanged_terms_do_not_walk_model_links(self):
        with patch('scripts.glossary.references', side_effect=AssertionError('Unnecessary reference scan')):
            self.assertEqual(reference_impacts(self.model(), self.model()), [])

    def test_transitive_impacts_cycles_aliases_and_removal(self):
        before = self.model()
        before['glossary']['terms'].append({'id': 'OLD', 'alias_of': 'A'})
        before['nodes'][1]['fields']['definition'] = '[old](glossary:OLD)'
        after = deepcopy(before)
        after['glossary']['terms'][1]['definition'] = 'Changed'
        self.assertEqual(reference_impacts(before, after)[0]['changed_terms'], ['B'])
        after['glossary']['terms'].pop(1)
        self.assertEqual(reference_impacts(before, after)[0]['changed_terms'], ['B'])
        self.assertEqual(ReferenceIndex(before['glossary']['terms']).closure(['OLD']), {'OLD', 'A', 'B'})

    def test_delta_retains_unknown_global_fields_and_removed_endpoints(self):
        before = self.model()
        after = deepcopy(before)
        after['relations'] = []
        after['glossary']['unknown_policy'] = 'New policy'
        result = delta(before, after)
        self.assertTrue(result['global_impact'])
        self.assertIn('glossary.unknown_policy', result['global_fields'])
        self.assertEqual(result['impacted_nodes'], ['cap', 'root'])
        self.assertEqual(result['changes'][0]['state'], 'removed')

    def test_graph_index_preserves_multiple_parents_for_validation(self):
        model = self.model()
        model['relations'].append({**model['relations'][0], 'id': 'duplicate'})
        self.assertEqual(len(ModelIndex(model).parents['cap']), 2)
        model['nodes'].append({'kind': 'domain'})
        model['relations'].append({'id': 'broken'})
        self.assertEqual(len(ModelIndex(model).parents['cap']), 2)

    def test_byte_hash_invalidates_index_at_identical_size_and_mtime(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            backlog = root / 'modeles/backlog'
            backlog.mkdir(parents=True)
            model = self.model()
            glossary = model.pop('glossary')
            path = backlog / 'model.yaml'
            path.write_text(dumps(model), encoding='utf-8')
            (backlog / 'glossary.yaml').write_text(dumps(glossary), encoding='utf-8')
            first = load(root)
            stamp = path.stat()
            path.write_bytes(path.read_bytes().replace(b'root', b'toot'))
            os.utime(path, ns=(stamp.st_atime_ns, stamp.st_mtime_ns))
            other = load(root)
            self.assertNotEqual(first['inputs'], other['inputs'])
            self.assertIn('toot', other['index']['positions']['nodes'])
            (backlog / 'glossary.yaml').unlink()
            with self.assertRaises(FileNotFoundError):
                load(root)

    def test_model_changes_run_current_tests_and_unknown_changes_fail_closed(self):
        result = plan(['modeles/backlog/model.yaml'])
        self.assertTrue(result['contracts'])
        self.assertFalse(result['frontend'])
        self.assertFalse(result['browser'])
        self.assertTrue(all(plan(['modeles/release/index.json'])[key] for key in ('contracts', 'frontend', 'browser')))
        self.assertTrue(plan(['unknown.config'])['contracts'])
        self.assertFalse(plan(['app/README.md'])['browser'])
        self.assertTrue(plan(['scripts/test_credit_check.py'])['contracts'])

    def test_indexed_impacts_match_recursive_reference_for_crosslinked_terms(self):
        from scripts.glossary import references
        before = self.model()
        before['nodes'].append({'id': 'peer', 'fields': {'definition': '[missing](glossary:MISSING) [alias](glossary:OLD)'}})
        before['glossary']['terms'].append({'id': 'OLD', 'alias_of': 'A'})
        after = deepcopy(before)
        after['glossary']['terms'][1]['definition'] = 'Different B'
        after['glossary']['terms'].append({'id': 'MISSING', 'definition': 'New term'})
        terms = {t['id']: t for t in after['glossary']['terms']}
        changed = {'B', 'MISSING'}
        def affected(value, seen=None):
            seen = set() if seen is None else seen
            found = set()
            for kind, target in references(value):
                if kind != 'glossary' or target in seen:
                    continue
                seen.add(target)
                if target in changed:
                    found.add(target)
                term = terms.get(target, {})
                found.update(affected(term, seen))
                if term.get('alias_of'):
                    found.update(affected('[alias](glossary:' + term['alias_of'] + ')', seen))
            return found
        expected = [{'collection': 'nodes', 'id': node['id'], 'field': 'fields',
                     'changed_terms': sorted(affected(node['fields'])), 'disposition': 'semantic_review_required'}
                    for node in after['nodes'] if affected(node['fields'])]
        self.assertEqual(reference_impacts(before, after), expected)


if __name__ == '__main__':
    unittest.main()
