"""Scoped agreement capture and later compilation, using isolated model roots."""
from contextlib import redirect_stdout, redirect_stderr
from copy import deepcopy
from io import StringIO
import json
import subprocess
import sys
import unittest
from unittest.mock import patch

from scripts import record_decision as recorder
from scripts.structured_io import read, dumps
from scripts.test_publish_release import isolated_project


class DecisionIntentTests(unittest.TestCase):
    def setUp(self):
        self.root = self.enterContext(isolated_project())
        self.backlog = self.root / 'modeles/backlog'
        self.backlog.mkdir(parents=True)
        (self.root / 'modeles/provenance').mkdir()
        self.model = {
            'schema_version': '1.0.0', 'version': 'old-backlog', 'as_of': '2026-09-19',
            'nodes': [
                {'id': 'AREA', 'kind': 'area', 'revision': 1, 'fields': {'name': 'Service Requests'}},
                {'id': 'C', 'kind': 'capability', 'revision': 2,
                 'fields': {'name': 'Backlog Request', 'definition': 'Porter une demande.', 'scope': 'Carnet ciblé.',
                            'request_origins': ['backoffice'], 'enabled': False, 'threshold': 0},
                 'lifecycle': {'state': 'validated', 'validated_fields': ['name', 'definition', 'scope']},
                 'review': {'state': 'accepted', 'note': 'Editorial claim'}, 'source_refs': ['U1']},
                {'id': 'B', 'kind': 'behavior', 'revision': 1,
                 'fields': {'name': 'Reactive Review', 'behavior_aspect': 'trigger'}},
                {'id': 'OTHER', 'kind': 'area', 'revision': 1, 'fields': {'name': 'Unrelated'}},
            ],
            'relations': [
                {'id': 'R1', 'type': 'contains', 'source_id': 'AREA', 'target_id': 'C', 'revision': 1,
                 'qualification': {'meaning': 'Porte les demandes.'}},
                {'id': 'R2', 'type': 'contains', 'source_id': 'C', 'target_id': 'B', 'revision': 1},
            ],
            'principles': [{'id': 'P1', 'text': 'Un comportement reste terminal.', 'source_refs': ['U1']}],
        }
        self.glossary = {'version': 'working', 'terms': [
            {'id': 'T1', 'name': 'Request', 'definition': 'Travail demandé.', 'source_refs': ['U1'],
             'review': {'state': 'accepted'}, 'revision': 1},
        ]}
        self.sources = {'records': [{'id': 'U1'}, {'id': 'U2'}]}
        self.save('modeles/backlog/model.yaml', self.model)
        self.save('modeles/backlog/glossary.yaml', self.glossary)
        self.save('modeles/provenance/source-records.json', self.sources)
        self.params = {
            'intent_id': 'ADOPT-TEST-1', 'collection': 'nodes', 'target_id': 'C',
            'fields': ['name', 'request_origins'], 'source_refs': ['U1'], 'author': 'Laurent',
            'decided_at': '2026-09-19', 'interpretation': 'explicit',
            'note': 'Accord explicite sur le nom et l’origine.', 'reviewer': 'Codex operator',
        }

    def save(self, relative, document):
        path = self.root / relative
        path.write_text(dumps(document, path.suffix), encoding='utf-8')

    def record(self, **overrides):
        return recorder.record_intent(self.root, **(self.params | overrides))

    def snapshot(self):
        document = deepcopy(self.model)
        document['glossary'] = deepcopy(self.glossary)
        document['version'] = '2026-09-20.1'
        document['as_of'] = '2026-09-20'
        document['nodes'][1]['revision'] = 42
        return document

    def document(self):
        return read(self.root / recorder.REGISTRY_PATH)

    def test_legacy_full_context_still_compiles_and_is_idempotent(self):
        intent = recorder.make_intent(self.snapshot(), self.sources, **self.params, legacy_context=True)
        # Use the live model's revision-neutral semantic context.
        document = {'schema_version': '1.0.0', 'intents': [intent]}
        (self.root / recorder.REGISTRY_PATH).write_text(dumps(document), encoding='utf-8')
        self.assertFalse(self.record()['recorded'])
        recorder.compile_intents(document, self.snapshot(), [], self.sources)

    def test_reports_all_stale_intents_in_one_pass(self):
        self.record(intent_id='FIRST')
        self.record(intent_id='SECOND', fields=['definition'])
        snapshot = self.snapshot()
        snapshot['nodes'][1]['fields']['scope'] = 'Changed context'
        with self.assertRaises(ValueError) as raised:
            recorder.compile_intents(self.document(), snapshot, [], self.sources)
        self.assertIn('FIRST', str(raised.exception))
        self.assertIn('SECOND', str(raised.exception))

    def test_compact_context_does_not_copy_research_and_detects_changes(self):
        self.glossary['large_market_dossier'] = 'market research ' * 10000
        (self.backlog / 'glossary.yaml').write_text(dumps(self.glossary), encoding='utf-8')
        self.record()
        intent = self.document()['intents'][0]
        self.assertLess(len(json.dumps(intent)), 5000)
        recorder.compile_intents(self.document(), self.snapshot(), [], self.sources)
        changed = self.snapshot()
        changed['glossary']['large_market_dossier'] += 'changed'
        with self.assertRaisesRegex(ValueError, 'semantic context changed'):
            recorder.compile_intents(self.document(), changed, [], self.sources)

    def test_explicit_suspension_preserves_proof_without_creating_approval(self):
        original = deepcopy(self.record()['intent'])
        document = self.document()
        document['suspensions'] = [{'intent_id': original['id'], 'reviewer': 'Codex',
            'reviewed_at': '2026-09-22', 'source_refs': ['U2'],
            'rationale': 'Scope changed; preserve the historical proof without carrying approval.'}]
        snapshot = self.snapshot()
        snapshot['nodes'][1]['fields']['name'] = 'Changed'
        self.assertEqual(recorder.compile_intents(document, snapshot, [], self.sources)['decisions'], [])
        self.assertEqual(document['intents'][0], original)
        with self.assertRaisesRegex(ValueError, 'Published intents'):
            recorder.compile_intents(document, snapshot, [], self.sources, self.document())
        changed = deepcopy(document)
        changed['suspensions'][0]['rationale'] = 'Rewritten'
        with self.assertRaisesRegex(ValueError, 'suspension was removed or changed'):
            recorder.compile_intents(changed, snapshot, [], self.sources, document)
        self.assertEqual(recorder.compile_intents(document, snapshot, [], self.sources, document)['decisions'], [])

    def test_suspension_requires_known_source_target_and_unique_entry(self):
        self.record()
        document = self.document()
        entry = {'intent_id': 'ADOPT-TEST-1', 'reviewer': 'Codex', 'reviewed_at': '2026-09-22',
                 'source_refs': ['U2'], 'rationale': 'Scope changed.'}
        for entries in ([entry, entry], [entry | {'intent_id': 'missing'}],
                        [entry | {'source_refs': ['unknown']}], [entry | {'rationale': ''}]):
            with self.assertRaises(ValueError):
                recorder.validate_document(document | {'suspensions': entries}, self.sources)

    def test_explicit_replacement_retains_old_proof_and_requires_a_fresh_context(self):
        old = deepcopy(self.record()['intent'])
        self.model['nodes'][1]['fields']['name'] = 'Renamed Request'
        self.save('modeles/backlog/model.yaml', self.model)
        with self.assertRaisesRegex(ValueError, 'Stale decision'):
            recorder.compile_intents(self.document(), self.snapshot(), [], self.sources)
        self.record(intent_id='ADOPT-REVIEW', supersedes=old['id'], source_refs=['U2'])
        self.assertEqual(self.document()['intents'][0], old)
        result = recorder.compile_intents(self.document(), self.snapshot(), [], self.sources)
        self.assertEqual([d['id'] for d in result['decisions']], ['ADOPT-REVIEW'])
        changed = self.snapshot()
        changed['nodes'][1]['fields']['scope'] = 'Another scope'
        with self.assertRaisesRegex(ValueError, 'semantic context changed'):
            recorder.compile_intents(self.document(), changed, [], self.sources)

    def test_replacement_cannot_expand_scope_change_target_or_fork(self):
        self.record()
        for overrides in ({'fields': ['name', 'scope']}, {'target_id': 'OTHER', 'fields': ['name']},
                          {'supersedes': 'MISSING'}):
            before = (self.root / recorder.REGISTRY_PATH).read_bytes()
            with self.assertRaises(ValueError):
                self.record(**({'intent_id': 'BAD', 'supersedes': self.params['intent_id']} | overrides))
            self.assertEqual((self.root / recorder.REGISTRY_PATH).read_bytes(), before)
        self.record(intent_id='REVIEW', supersedes=self.params['intent_id'], fields=['name'])
        with self.assertRaisesRegex(ValueError, 'unreplaced'):
            self.record(intent_id='FORK', supersedes=self.params['intent_id'])

    def test_published_intent_cannot_be_reapproved_by_supersession(self):
        self.record()
        consumed = deepcopy(self.document())
        decisions = recorder.compile_intents(consumed, self.snapshot(), [], self.sources)
        self.record(intent_id='REVIEW', supersedes=self.params['intent_id'])
        with self.assertRaisesRegex(ValueError, 'publication review'):
            recorder.compile_intents(self.document(), self.snapshot(), decisions, self.sources, consumed)

    def test_batch_is_atomic_and_idempotent(self):
        second = self.params | {'intent_id': 'SECOND', 'fields': ['scope']}
        with patch.object(recorder.os, 'replace', wraps=recorder.os.replace) as replace:
            results = recorder.record_intents(self.root, [self.params, second])
            self.assertEqual(replace.call_count, 1)
        self.assertTrue(all(r['recorded'] for r in results))
        before = (self.root / recorder.REGISTRY_PATH).read_bytes()
        self.assertFalse(any(r['recorded'] for r in recorder.record_intents(self.root, [self.params, second])))
        with self.assertRaises(ValueError):
            recorder.record_intents(self.root, [second | {'intent_id': 'THIRD'}, second | {'fields': ['missing']}])
        self.assertEqual((self.root / recorder.REGISTRY_PATH).read_bytes(), before)

    def test_relation_summary_can_be_approved_without_approving_other_fields(self):
        self.model['relations'][0]['fields'] = {'summary_label': 'Facts and conditions', 'label': 'Detailed facts'}
        self.save('modeles/backlog/model.yaml', self.model)
        result = self.record(collection='relations', target_id='R1', fields=['fields.summary_label'])
        self.assertEqual(result['intent']['target']['values'], {'fields.summary_label': 'Facts and conditions'})
        compiled = recorder.compile_intents(self.document(), self.snapshot(), [], self.sources)
        self.assertEqual(compiled['decisions'][0]['target']['approved_fields'], ['fields.summary_label'])

    def test_capture_is_explicit_versionless_idempotent_and_append_only(self):
        before = {path: path.read_bytes() for path in self.root.rglob('*') if path.is_file()}
        first = self.record()
        intent = first['intent']
        self.assertTrue(first['recorded'])
        self.assertEqual(intent['target']['approved_fields'], ['name', 'request_origins'])
        self.assertNotIn('definition', intent['target']['values'])
        self.assertNotIn('revision', intent['target'])
        self.assertNotIn('import_version', intent['target'])
        self.assertEqual(set(self.document()), {'schema_version', 'intents'})
        self.assertNotIn('version', intent['target']['context']['glossary'])
        self.assertNotIn('lifecycle', intent['target']['context']['target'])
        registry_bytes = (self.root / recorder.REGISTRY_PATH).read_bytes()
        self.assertFalse(self.record(fields=['request_origins', 'name'])['recorded'])
        self.assertEqual((self.root / recorder.REGISTRY_PATH).read_bytes(), registry_bytes)
        self.record(intent_id='ADOPT-TEST-2', fields=['scope'], source_refs=['U2'])
        self.assertEqual(self.document()['intents'][0], intent)
        self.assertEqual(len(self.document()['intents']), 2)
        for path, content in before.items():
            self.assertEqual(path.read_bytes(), content, str(path))
        self.assertEqual(set(path for path in self.root.rglob('*') if path.is_file()) - before.keys(),
                         {self.root / recorder.REGISTRY_PATH, self.backlog / '.decision-intents.lock'})

    def test_append_preserves_historical_bytes_and_suspensions(self):
        self.record()
        path = self.root / recorder.REGISTRY_PATH
        document = self.document()
        document['suspensions'] = [{'intent_id': self.params['intent_id'], 'reviewer': 'Codex',
            'reviewed_at': '2026-09-22', 'source_refs': ['U2'], 'rationale': 'Changed scope.'}]
        original = ('# Historical comment\n' + dumps(document)).encode('utf-8')
        path.write_bytes(original)
        split = original.index(b'suspensions:')
        self.record(intent_id='SECOND', fields=['scope'])
        result = path.read_bytes()
        self.assertTrue(result.startswith(original[:split]))
        self.assertTrue(result.endswith(original[split:]))
        updated = self.document()
        self.assertEqual(updated['intents'][:-1], document['intents'])
        self.assertEqual(updated['suspensions'], document['suspensions'])

    def test_second_writer_fails_without_overwriting_and_lock_is_reusable(self):
        self.record()
        path = self.root / recorder.REGISTRY_PATH
        before = path.read_bytes()
        program = ('from pathlib import Path; import sys; '
                   'from scripts.record_decision import _registry_lock; '
                   'lock = _registry_lock(Path(sys.argv[1])); lock.__enter__()')
        with recorder._registry_lock(path):
            child = subprocess.run([sys.executable, '-c', program, str(path)],
                                   capture_output=True, text=True, timeout=30)
            self.assertNotEqual(child.returncode, 0)
            self.assertIn('registry is being written', child.stderr)
        self.assertEqual(path.read_bytes(), before)
        self.assertTrue(self.record(intent_id='SECOND')['recorded'])

    def test_external_edit_during_capture_is_not_overwritten(self):
        self.record()
        path = self.root / recorder.REGISTRY_PATH
        changed = path.read_bytes() + b'# external change\n'
        original_dump = recorder.dump_sequence_append
        def edit(*args, **kwargs):
            result = original_dump(*args, **kwargs)
            path.write_bytes(changed)
            return result
        with patch.object(recorder, 'dump_sequence_append', side_effect=edit):
            with self.assertRaisesRegex(ValueError, 'changed concurrently'):
                self.record(intent_id='SECOND')
        self.assertEqual(path.read_bytes(), changed)
        self.assertEqual(list(self.backlog.glob('.decision-intents-*')), [])

    def test_cached_registry_still_checks_historical_hashes_on_every_write(self):
        self.record()
        path = self.root / recorder.REGISTRY_PATH
        # A warm cache is not an agreement/integrity cache. Editing the source
        # bytes must invalidate the parse and expose the broken historical hash.
        self.record(intent_id='SECOND')
        broken = path.read_bytes().replace(b'Backlog Request', b'Changed Request', 1)
        path.write_bytes(broken)
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            self.record(intent_id='THIRD')
        self.assertEqual(path.read_bytes(), broken)

    def test_lock_is_released_after_writer_process_exits(self):
        path = self.root / recorder.REGISTRY_PATH
        program = ('from pathlib import Path; import os,sys; '
                   'from scripts.record_decision import _registry_lock; '
                   'lock=_registry_lock(Path(sys.argv[1])); lock.__enter__(); os._exit(0)')
        child = subprocess.run([sys.executable, '-c', program, str(path)],
                               capture_output=True, text=True, timeout=30)
        self.assertEqual(child.returncode, 0, child.stderr)
        self.assertTrue(self.record()['recorded'])

    def test_id_collision_and_missing_approval_data_leave_registry_untouched(self):
        self.record()
        before = (self.root / recorder.REGISTRY_PATH).read_bytes()
        invalid = [
            ({'note': 'Different agreement'}, 'already exists'),
            ({'source_refs': []}, 'nonempty'),
            ({'source_refs': ['MISSING']}, 'Unknown decision sources'),
            ({'source_refs': ['U1', 'U1']}, 'unique'),
            ({'fields': []}, 'nonempty'),
            ({'fields': 'name'}, 'nonempty list'),
            ({'fields': ['not_a_field']}, 'absent or empty'),
            ({'fields': ['lifecycle']}, 'editorial metadata'),
            ({'target_id': 'REMOVED'}, 'Unknown target'),
            ({'note': ' '}, 'note'),
            ({'reviewer': ''}, 'reviewer'),
            ({'author': ''}, 'author'),
            ({'decided_at': '2026-02-30'}, 'valid date'),
            ({'decided_at': '2026-9-19'}, 'YYYY-MM-DD'),
            ({'interpretation': 'inferred'}, 'interpretation'),
        ]
        for overrides, message in invalid:
            with self.subTest(overrides=overrides), self.assertRaisesRegex(ValueError, message):
                self.record(**overrides)
            self.assertEqual((self.root / recorder.REGISTRY_PATH).read_bytes(), before)

    def test_empty_values_refused_but_false_and_zero_are_preserved(self):
        for value in (None, '', ' ', [], {}):
            with self.subTest(value=value):
                self.model['nodes'][1]['fields']['scope'] = value
                self.save('modeles/backlog/model.yaml', self.model)
                with self.assertRaisesRegex(ValueError, 'absent or empty'):
                    self.record(fields=['scope'])
        result = self.record(fields=['enabled', 'threshold'])
        self.assertEqual(result['intent']['target']['values'], {'enabled': False, 'threshold': 0})

    def test_compile_binds_only_selected_values_to_final_revision_and_version(self):
        result = self.record()
        document = self.document()
        original = deepcopy(document)
        snapshot = self.snapshot()
        compiled = recorder.compile_intents(document, snapshot, {'decisions': []}, self.sources)
        self.assertEqual(compiled['version'], snapshot['version'])
        self.assertEqual(len(compiled['decisions']), 1)
        decision = compiled['decisions'][0]
        self.assertEqual(decision['target']['revision'], 42)
        self.assertEqual(decision['target']['import_version'], snapshot['version'])
        self.assertEqual(decision['target']['approved_fields'], ['name', 'request_origins'])
        self.assertEqual(decision['target']['value_sha256'], result['intent']['target']['value_sha256'])
        self.assertNotIn('reviewer', decision)
        self.assertEqual(document, original)

    def test_editorial_changes_and_disconnected_nodes_do_not_stale_intent(self):
        self.record()
        snapshot = self.snapshot()
        snapshot['nodes'][1].update(lifecycle={'state': 'proposed'}, review={'state': 'under_review'},
                                    last_modified='2027-01-01', source_refs=['OTHER-SOURCE'], approved_fields=['scope'])
        snapshot['nodes'][3]['fields']['name'] = 'Elsewhere changed'
        snapshot['relations'][0].update(revision=14, review={'state': 'proposed'}, last_modified='2027-01-01')
        snapshot['glossary']['version'] = 'frozen-next'
        snapshot['glossary']['terms'][0].update(revision=30, review={'state': 'proposed'}, source_refs=['U2'])
        result = recorder.compile_intents(self.document(), snapshot, [], {'U1': {'id': 'U1'}})
        self.assertEqual(len(result['decisions']), 1)

    def test_every_semantic_change_in_scope_requires_a_new_explicit_agreement(self):
        self.record()
        mutations = [
            ('selected value', lambda s: s['nodes'][1]['fields'].update(name='Changed')),
            ('other target value', lambda s: s['nodes'][1]['fields'].update(scope='Broader scope')),
            ('target kind', lambda s: s['nodes'][1].update(kind='area')),
            ('parent meaning', lambda s: s['nodes'][0]['fields'].update(name='Another Area')),
            ('neighbor meaning', lambda s: s['nodes'][2]['fields'].update(name='Changed behavior')),
            ('relation endpoint', lambda s: s['relations'][0].update(source_id='OTHER')),
            ('relation meaning', lambda s: s['relations'][0]['qualification'].update(meaning='Different')),
            ('ancestor membership', lambda s: s['relations'].append({'id': 'R3', 'type': 'contains', 'source_id': 'OTHER', 'target_id': 'AREA'})),
            ('new relation', lambda s: s['relations'].append({'id': 'R3', 'type': 'uses', 'source_id': 'C', 'target_id': 'OTHER'})),
            ('removed relation', lambda s: s['relations'].pop()),
            ('principle', lambda s: s['principles'][0].update(text='Different rule')),
            ('glossary', lambda s: s['glossary']['terms'][0].update(definition='Different meaning')),
            ('removed target', lambda s: s['nodes'].pop(1)),
        ]
        for label, mutate in mutations:
            snapshot = self.snapshot()
            mutate(snapshot)
            with self.subTest(label=label), self.assertRaisesRegex(ValueError, 'Stale decision intent ADOPT-TEST-1'):
                recorder.compile_intents(self.document(), snapshot, [], self.sources)

    def test_relation_capture_uses_relation_values_and_endpoint_context(self):
        self.record(collection='relations', target_id='R1', fields=['type', 'source_id', 'qualification'])
        snapshot = self.snapshot()
        snapshot['relations'][0]['revision'] = 9
        compiled = recorder.compile_intents(self.document(), snapshot, [], self.sources)
        self.assertEqual(compiled['decisions'][0]['target']['revision'], 9)
        self.assertEqual(compiled['decisions'][0]['target']['collection'], 'relations')
        snapshot['nodes'][1]['fields']['scope'] = 'Changed endpoint meaning'
        with self.assertRaisesRegex(ValueError, 'semantic context changed'):
            recorder.compile_intents(self.document(), snapshot, [], self.sources)

    def test_already_materialized_intent_never_resurrects_an_agreement(self):
        self.record()
        snapshot = self.snapshot()
        compiled = recorder.compile_intents(self.document(), snapshot, [], self.sources)
        snapshot['nodes'][1]['fields']['name'] = 'Now different'
        snapshot['nodes'][1]['revision'] += 1
        snapshot['version'] = '2026-09-21.1'
        result = recorder.compile_intents(self.document(), snapshot, compiled, self.sources)
        self.assertEqual(result['decisions'], [])
        conflicting = deepcopy(compiled)
        conflicting['decisions'][0]['target']['value_sha256']['name'] = 'tampered'
        with self.assertRaisesRegex(ValueError, 'conflicts with a historical decision'):
            recorder.compile_intents(self.document(), snapshot, conflicting, self.sources)

    def test_strict_registry_rejects_extra_keys_duplicates_and_tampered_captures(self):
        self.record()
        mutations = [
            lambda d: d.update(version='release-like-version'),
            lambda d: d.update(schema_version=1),
            lambda d: d['intents'].append(deepcopy(d['intents'][0])),
            lambda d: d['intents'][0].update(automatic=True),
            lambda d: d['intents'][0]['target'].update(revision=2),
            lambda d: d['intents'][0]['target']['values'].update(name='Tampered'),
            lambda d: d['intents'][0]['target']['context'].update(target='0' * 64),
        ]
        for mutate in mutations:
            document = self.document()
            mutate(document)
            with self.subTest(document=document), self.assertRaises(ValueError):
                recorder.compile_intents(document, self.snapshot(), [], self.sources)

    def test_consumed_intents_survive_three_cycles_with_new_carry_and_review_ids(self):
        self.record()
        document = self.document()
        snapshot = self.snapshot()
        first = recorder.compile_intents(document, snapshot, [], self.sources)
        self.assertEqual(len(first['decisions']), 1)
        consumed = deepcopy(document)
        carried = deepcopy(first)
        carried['decisions'][0]['id'] = 'ADOPT-CARRY-NEW-ID'
        carried['decisions'][0]['note'] += ' Editorial carry.'
        snapshot['version'] = '2026-09-21.1'
        second = recorder.compile_intents(document, snapshot, carried, self.sources, consumed)
        self.assertEqual(second['decisions'], [])
        reviewed = deepcopy(carried)
        reviewed['decisions'][0]['id'] = 'ADOPT-REVIEW-ANOTHER-ID'
        snapshot['version'] = '2026-09-22.1'
        snapshot['nodes'][1]['fields']['scope'] = 'Explicitly reviewed new scope'
        third = recorder.compile_intents(document, snapshot, reviewed, self.sources, consumed)
        self.assertEqual(third['decisions'], [])
        # Also keep consumed intentions inert if the old approval is suspended.
        self.assertEqual(recorder.compile_intents(document, snapshot, [], self.sources, consumed)['decisions'], [])

    def test_consumed_registry_entries_cannot_be_removed_or_rewritten(self):
        self.record()
        consumed = self.document()
        for change in ('remove', 'note', 'scope'):
            current = deepcopy(consumed)
            if change == 'remove':
                current['intents'] = []
            elif change == 'note':
                current['intents'][0]['note'] = 'Rewritten historical scope'
            else:
                target = current['intents'][0]['target']
                target['values']['name'] = 'Rewritten name'
                target['value_sha256']['name'] = recorder.canonical_sha256('Rewritten name')
            with self.subTest(change=change), self.assertRaisesRegex(ValueError, 'Consumed decision intent was removed or changed'):
                recorder.compile_intents(current, self.snapshot(), [], self.sources, consumed)

    def test_new_intent_can_be_added_after_a_consumed_context_has_changed(self):
        self.record()
        consumed = self.document()
        self.model['nodes'][1]['fields']['scope'] = 'New explicitly agreed scope'
        self.save('modeles/backlog/model.yaml', self.model)
        self.record(intent_id='ADOPT-NEW-CYCLE', fields=['scope'], source_refs=['U2'])
        compiled = recorder.compile_intents(self.document(), self.snapshot(), [], self.sources, consumed)
        self.assertEqual([decision['id'] for decision in compiled['decisions']], ['ADOPT-NEW-CYCLE'])

    def test_final_revision_and_sources_are_required_at_compilation(self):
        self.record()
        for revision in (None, 0, True, '2'):
            snapshot = self.snapshot()
            snapshot['nodes'][1]['revision'] = revision
            with self.subTest(revision=revision), self.assertRaisesRegex(ValueError, 'Final target revision'):
                recorder.compile_intents(self.document(), snapshot, [], self.sources)
        with self.assertRaisesRegex(ValueError, 'Unknown decision sources'):
            recorder.compile_intents(self.document(), self.snapshot(), [], {'records': []})

    def test_atomic_failure_leaves_original_registry_and_no_temporary_file(self):
        self.record()
        path = self.root / recorder.REGISTRY_PATH
        before = path.read_bytes()
        with patch.object(recorder.os, 'replace', side_effect=OSError('simulated replace failure')):
            with self.assertRaisesRegex(OSError, 'simulated replace failure'):
                self.record(intent_id='ADOPT-SECOND')
        self.assertEqual(path.read_bytes(), before)
        self.assertEqual(list(self.backlog.glob('.decision-intents-*')), [])

    def test_cli_requires_scope_and_reports_only_the_registered_intent(self):
        arguments = ['--root', str(self.root), '--id', 'CLI-1', '--collection', 'nodes', '--target', 'C',
                     '--fields', 'name', '--source', 'U1', '--author', 'Laurent', '--decided-at', '2026-09-19',
                     '--interpretation', 'contextual', '--note', 'Accord contextualisé.', '--reviewer', 'Codex']
        with redirect_stdout(StringIO()) as output:
            self.assertEqual(recorder.main(arguments), 0)
        self.assertEqual(json.loads(output.getvalue())['id'], 'CLI-1')
        with redirect_stderr(StringIO()), self.assertRaises(SystemExit) as raised:
            recorder.main(arguments[:arguments.index('--fields')] + arguments[arguments.index('--source'):])
        self.assertEqual(raised.exception.code, 2)


if __name__ == '__main__':
    unittest.main()
