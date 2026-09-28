"""Reassessment safety and single-build preparation on an isolated publication."""
from copy import deepcopy
from unittest.mock import patch
import unittest

from scripts import prepare_release as workflow
from scripts import decision_review as review
from scripts import test_prepare_release as fixtures
from scripts.test_publish_release import save


class DecisionReviewTests(unittest.TestCase):
    setUpClass = classmethod(fixtures.BacklogPublicationTests.setUpClass.__func__)
    setUp = fixtures.BacklogPublicationTests.setUp

    def dossier(self, changed_approved=False, context=False):
        model = workflow.read(self.backlog_path)
        node = next(n for n in model['nodes'] if n['id'] == 'D03.a')
        if changed_approved:
            node['fields']['definition'] += ' Different approved meaning.'
        else:
            node['fields']['scope'] = 'Additional scope requiring explicit reassessment.'
        if context:
            next(r for r in model['relations'] if r['id'] == 'REL-MEMBER-D03.a')['source_id'] = 'D04'
        save(self.backlog_path, model)
        self.bundle = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], include_review=True)
        self.folder = self.root / 'review'
        review.save_review(self.folder, self.bundle['review'], self.bundle['report'])
        return next(i for i in self.bundle['review']['items'] if i['decision_id'] == 'ADOPT-003')

    def assess(self, retain=('ADOPT-003',)):
        document = workflow.read(self.folder / 'assessment.yaml')
        document['reviewer'] = 'Test reviewer'
        for item in document['items']:
            item.update(action='retain' if item['decision_id'] in retain else 'defer',
                        rationale='Test fixture: same approved meaning after examining scope and relations.'
                        if item['decision_id'] in retain else 'Test fixture: leave this scope suspended.')
        save(self.folder / 'assessment.yaml', document)
        return document

    def prepare_reviewed(self):
        return workflow.prepare(self.root, self.version, ['PUB-TEST-NEW'], review_path=self.folder)

    def test_dossier_has_values_context_and_no_automatic_approval(self):
        item = self.dossier(context=True)
        self.assertTrue(item['eligible_for_reassessment'])
        self.assertTrue(item['target_changes'])
        self.assertTrue(item['relation_changes'])
        self.assertTrue(all(v['before_sha256'] == v['after_sha256'] == v['approved_sha256']
                            for v in item['approved_values'].values()))
        with self.assertRaisesRegex(ValueError, 'reviewer'):
            self.prepare_reviewed()
        self.assertFalse((self.models / 'staging' / self.version).exists())
        with self.assertRaisesRegex(ValueError, 'already exists'):
            review.save_review(self.folder, self.bundle['review'], self.bundle['report'])

    def test_one_final_build_preserves_scope_and_publishes_reassessment_evidence(self):
        item = self.dossier()
        self.assess()
        index_before = (self.models / 'release/index.json').read_bytes()
        old_before = (self.models / 'decisions/2026-09-13.4.json').read_bytes()
        with patch.object(workflow, 'build_candidate', wraps=workflow.build_candidate) as build:
            result = self.prepare_reviewed()
        self.assertEqual(build.call_count, 1)
        self.assertFalse(result['release_activated'])
        self.assertEqual(result['summary']['validation_error_count'], 0)
        stage = self.models / 'staging' / self.version
        decisions = workflow.read(stage / 'decisions.json')['decisions']
        mapping = workflow.read(stage / 'decision-review/transcriptions.json')['items']
        self.assertEqual(len(mapping), 1)
        decision = next(d for d in decisions if d['id'] == mapping[0]['decision_id'])
        original = item['prior_decision']
        self.assertEqual(self.bundle['review']['items'][0]['prior_decision'],
                         workflow.read(stage / 'decision-review/review.json')['items'][0]['prior_decision'])
        self.assertTrue(decision['note'].startswith('Réexamen de '))
        self.assertIn('review.json', decision['note'])
        self.assertNotIn(original['note'], decision['note'])
        for field in ('author', 'decided_at', 'interpretation', 'decision_state', 'source_refs'):
            self.assertEqual(decision[field], original[field])
        for field in ('collection', 'id', 'approved_fields', 'value_sha256'):
            self.assertEqual(decision['target'][field], original['target'][field])
        self.assertNotEqual(decision['id'], original['id'])
        self.assertEqual((self.models / 'release/index.json').read_bytes(), index_before)
        workflow.publish_prepared(self.root, self.version, activate=True)
        proof = self.models / 'revisions' / self.version / 'decision-review/assessment.yaml'
        self.assertEqual(proof.read_bytes(), (stage / 'decision-review/assessment.yaml').read_bytes())
        manifest = workflow.read(self.models / 'release' / self.version / 'manifest.json')
        self.assertEqual(len(manifest['decision_review']), 3)
        self.assertEqual((self.models / 'decisions/2026-09-13.4.json').read_bytes(), old_before)
        self.assertEqual(workflow.load_current(self.root)[1]['version'], self.version)
        proof.write_bytes(proof.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'Archived review integrity mismatch'):
            workflow.load_current(self.root)

    def test_long_history_stays_in_evidence_not_in_active_note(self):
        item = self.dossier()
        history = 'Historical rationale with original reservations. ' * 2000
        item['prior_decision']['note'] = history
        item['prior_decision_sha256'] = workflow.canonical_sha256(item['prior_decision'])
        save(self.folder / 'review.json', self.bundle['review'])
        assessment = self.assess()
        assessment['review_sha256'] = workflow.canonical_sha256(self.bundle['review'])
        save(self.folder / 'assessment.yaml', assessment)
        decisions, evidence = review.apply_assessment(self.folder, self.bundle['review'])
        self.assertLess(len(decisions['decisions'][0]['note']), 1000)
        saved = next(i for i in evidence['review.json']['items'] if i['decision_id'] == 'ADOPT-003')
        self.assertEqual(saved['prior_decision']['note'], history)
        self.assertEqual(saved['prior_decision_sha256'], workflow.canonical_sha256(saved['prior_decision']))

    def test_changed_approved_values_cannot_be_transcribed(self):
        item = self.dossier(changed_approved=True)
        self.assertFalse(item['eligible_for_reassessment'])
        self.assess()
        with self.assertRaisesRegex(ValueError, 'cannot be transcribed'):
            self.prepare_reviewed()
        self.assess(retain=())
        result = self.prepare_reviewed()
        self.assertEqual(result['summary']['new_decisions'], 0)

    def test_pending_missing_duplicate_or_unexplained_assessment_is_rejected(self):
        self.dossier()
        complete = self.assess()
        variants = []
        pending = deepcopy(complete); pending['items'][0]['action'] = 'pending'; variants.append(pending)
        missing = deepcopy(complete); missing['items'].pop(); variants.append(missing)
        duplicate = deepcopy(complete); duplicate['items'].append(duplicate['items'][0]); variants.append(duplicate)
        blank = deepcopy(complete); blank['items'][0]['rationale'] = ' '; variants.append(blank)
        for document in variants:
            with self.subTest(document=document):
                save(self.folder / 'assessment.yaml', document)
                with self.assertRaises(ValueError):
                    self.prepare_reviewed()

    def test_live_inputs_inventory_and_sources_invalidate_review(self):
        self.dossier(); self.assess()
        for path in (self.backlog_path, self.models / 'backlog/glossary.json',
                     self.models / 'provenance/source-records.json', self.models / 'schemas/decisions.schema.json'):
            if not path.exists():
                continue
            before = path.read_bytes()
            try:
                path.write_bytes(before + b'\n')
                with self.subTest(path=path), self.assertRaisesRegex(ValueError, 'stale or altered'):
                    self.prepare_reviewed()
            finally:
                path.write_bytes(before)
        addition = self.models / 'backlog/new-context.json'
        save(addition, {'source_refs': []})
        with self.assertRaisesRegex(ValueError, 'stale or altered'):
            self.prepare_reviewed()

    def test_forged_dossier_even_with_updated_assessment_hash_is_rejected(self):
        self.dossier(); assessment = self.assess()
        altered = deepcopy(self.bundle['review'])
        altered['items'][0]['prior_decision']['author'] = 'Fabricated author'
        save(self.folder / 'review.json', altered)
        assessment['review_sha256'] = workflow.canonical_sha256(altered)
        save(self.folder / 'assessment.yaml', assessment)
        with self.assertRaisesRegex(ValueError, 'stale or altered'):
            self.prepare_reviewed()

    def test_prepared_evidence_is_frozen_and_tampering_blocks_publication(self):
        self.dossier(); self.assess(); self.prepare_reviewed()
        stage = self.models / 'staging' / self.version
        # Editing the working assessment after preparation cannot rewrite frozen evidence.
        self.assess(retain=())
        self.assertEqual(len(workflow.read(stage / 'decision-review/transcriptions.json')['items']), 1)
        path = stage / 'decision-review/assessment.yaml'
        path.write_bytes(path.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'review hash mismatch'):
            workflow.publish_prepared(self.root, self.version)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_inspection_never_rebuilds_and_pages_exact_saved_values(self):
        self.dossier()
        with patch.object(workflow, 'build_candidate', side_effect=AssertionError('Unexpected rebuild')):
            summary = workflow.inspect_artifact(self.folder)
            first = workflow.inspect_artifact(self.folder, identifier='D03.a', limit=1, full=True)
            second = workflow.inspect_artifact(self.folder, identifier='D03.a', offset=1, limit=1)
            evidence = workflow.inspect_artifact(self.folder, 'review', 'ADOPT-003', full=True)
            context = workflow.inspect_artifact(self.folder, 'review-context', limit=1)
        self.assertEqual(summary['candidate_version'], self.version)
        self.assertEqual(first['returned'], 1)
        self.assertEqual(second['offset'], 1)
        self.assertEqual(evidence['items'][0]['decision_id'], 'ADOPT-003')
        self.assertLessEqual(context['returned'], 1)

    def test_input_change_during_build_is_rejected(self):
        first = review.input_state(self.root)
        with patch.object(review, 'input_state', side_effect=[first, {}]):
            with self.assertRaisesRegex(ValueError, 'Inputs changed while building'):
                workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'])


if __name__ == '__main__':
    unittest.main()
