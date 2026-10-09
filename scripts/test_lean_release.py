"""Publication contracts on isolated Git repositories; no real publication."""
from pathlib import Path
import unittest
from unittest.mock import patch

from scripts import git_history, lean_release, release, prepare_release as workflow
from scripts import test_prepare_release as fixtures
from scripts.test_publish_release import save


class GitPublicationTests(unittest.TestCase):
    setUpClass = classmethod(fixtures.BacklogPublicationTests.setUpClass.__func__)
    mutate_capability = fixtures.BacklogPublicationTests.mutate_capability

    def setUp(self):
        fixtures.BacklogPublicationTests.setUp(self)
        pointer = workflow.resolve_release(self.models / 'release')
        self.base = pointer['version']
        path = self.models / 'release' / self.base / 'manifest.json'
        manifest = workflow.read(path)
        manifest['kind'] = 'git_release'
        save(path, manifest)
        save(self.root / git_history.INDEX, {'schema_version': '1.0.0', 'archives': []})
        save(self.models / 'backlog/decision-intents.yaml', {'schema_version': '1.0.0', 'intents': [], 'suspensions': []})
        (self.root / '.gitattributes').write_text('* -text\n', encoding='utf-8')
        git_history.git(self.root, 'init', '-q')
        git_history.git(self.root, 'add', 'modeles')
        git_history.git(self.root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Fixture baseline')

    def editorial(self):
        model = workflow.read(self.backlog_path)
        next(n for n in model['nodes'] if n['id'] == 'D03.a')['review']['note'] += ' Précision éditoriale.'
        save(self.backlog_path, model)

    def test_uncommitted_publication_fails_before_candidate_work(self):
        path = self.models / 'release' / self.base / 'uncommitted-proof.json'
        path.write_text('{}')
        with patch.object(workflow, 'build_candidate', side_effect=AssertionError('Too late')):
            with self.assertRaisesRegex(ValueError, 'Commit the current publication'):
                self.run_release(activate=True)

    def run_release(self, **options):
        return release.run(self.root, self.version, ['PUB-TEST-NEW'], verify_site=False, **options)

    def test_technical_provenance_cleanup_publishes_without_business_delta(self):
        model = workflow.read(self.backlog_path)
        evidence = {'schema_version': '1.0.0', 'model_id': model['model_id'],
                    'source_version': model.pop('source_version'),
                    'source_files': model.pop('source_files')}
        save(self.backlog_path, model)
        save(self.models / 'backlog/model-provenance.yaml', evidence)
        prior_model = workflow.load_current(self.root)[2]
        prior_decisions = workflow.read(self.models / 'decisions' / (self.base + '.json'))['decisions']
        result = self.run_release(activate=True)
        self.assertEqual(result['status'], 'published')
        self.assertEqual(result['summary']['deferred_decisions'], 0)
        published = workflow.read(self.models / 'release' / self.version / 'model.yaml')
        manifest = workflow.read(self.models / 'release' / self.version / 'manifest.json')
        self.assertNotIn('source_files', published)
        self.assertNotIn('source_version', published)
        self.assertEqual({item['id']: item['fields'] for item in published['nodes']},
                         {item['id']: item['fields'] for item in prior_model['nodes']})
        self.assertEqual(manifest['model_provenance_sha256'],
                         workflow.digest(self.models / 'revisions' / self.version / 'model-provenance.yaml'))
        carried = workflow.read(self.models / 'decisions' / (self.version + '.json'))['decisions']
        self.assertEqual({item['id'] for item in carried}, {item['id'] for item in prior_decisions})
        self.assertEqual({item['id']: item['target']['value_sha256'] for item in carried},
                         {item['id']: item['target']['value_sha256'] for item in prior_decisions})

    def test_incomplete_declared_delivery_blocks_publication(self):
        self.editorial()
        workflow.write(self.models / 'backlog/delivery.yaml', {'publication_delivery': {
            'state': 'applied', 'summary': 'Approved family must be delivered',
            'required_nodes': [{'id': 'missing-approved-order'}]}})
        before = workflow.resolve_release(self.models / 'release')['version']
        result = self.run_release(activate=True)
        self.assertEqual(result['status'], 'blocked')
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], before)

    def test_one_gate_and_historical_read_after_retirement(self):
        self.editorial()
        before = workflow.read(self.models / 'release' / self.base / 'model.json')
        with patch.object(workflow, 'validate_release', wraps=workflow.validate_release) as check:
            result = self.run_release(activate=True)
        self.assertEqual(result['status'], 'published')
        self.assertEqual(check.call_count, 1)
        self.assertTrue({'load_current', 'candidate_and_validation', 'stage', 'publish', 'static_export', 'total'}
                        <= result['timings_seconds'].keys())
        self.assertTrue(all(value >= 0 for value in result['timings_seconds'].values()))
        self.assertFalse((self.models / 'release' / self.base).exists())
        self.assertEqual(workflow.read(self.models / 'release' / self.base / 'model.json'), before)
        self.assertEqual(workflow.resolve_release(self.models / 'release', self.base)['version'], self.base)
        self.assertFalse((self.root / '.runtime/publication' / self.version).exists())
        self.assertFalse((self.models / 'release' / self.version / 'changes.json').exists())
        self.assertFalse((self.models / 'revisions' / self.version / 'deferred').exists())
        self.assertEqual(workflow.read(self.models / 'backlog/decision-intents.yaml')['intents'], [])

    def test_source_change_blocks_resume(self):
        self.editorial()
        self.assertEqual(self.run_release()['status'], 'prepared')
        self.editorial()
        with self.assertRaisesRegex(ValueError, 'Sources or publication code changed'):
            self.run_release(activate=True)
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], self.base)

    def test_candidate_corruption_blocks_activation(self):
        self.editorial()
        result = self.run_release()
        candidate = Path(result['prepared_manifest']).parent / 'model.yaml'
        candidate.write_bytes(candidate.read_bytes() + b'\n# corrupted\n')
        with self.assertRaisesRegex(ValueError, 'Prepared artifact changed'):
            self.run_release(activate=True)

    def test_business_change_needs_explicit_review(self):
        self.mutate_capability()
        self.assertEqual(self.run_release(activate=True)['status'], 'needs_review')
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], self.base)

    def test_reassessment_evidence_survives_staging_and_is_verified(self):
        model = workflow.read(self.backlog_path)
        next(n for n in model['nodes'] if n['id'] == 'D03.a')['fields']['scope'] = 'Changed fixture scope.'
        save(self.backlog_path, model)
        result = self.run_release()
        self.assertEqual(result['status'], 'needs_review')
        folder = self.root / '.runtime/release-reviews' / self.version
        assessment = workflow.read(folder / 'assessment.yaml')
        assessment['reviewer'] = 'Fixture reviewer'
        for entry in assessment['items']:
            entry.update(action='retain' if entry['decision_id'] == 'ADOPT-003' else 'defer',
                         rationale='Fixture: reviewed unchanged approved fields in their new context.')
        save(folder / 'assessment.yaml', assessment)
        self.assertEqual(self.run_release(review_path=folder)['status'], 'prepared')
        staged_proof = self.root / '.runtime/publication' / self.version / 'decision-review/assessment.yaml'
        frozen = staged_proof.read_bytes()
        staged_proof.write_bytes(frozen + b'\n')
        with self.assertRaisesRegex(ValueError, 'Prepared artifact changed'):
            self.run_release(activate=True)
        staged_proof.write_bytes(frozen)
        self.assertEqual(self.run_release(activate=True)['status'], 'published')
        proof = self.models / 'revisions' / self.version / 'decision-review'
        for name in ('review.json', 'assessment.yaml'):
            self.assertEqual(workflow.read(proof / name), workflow.read(folder / name))
        self.assertEqual((proof / 'assessment.yaml').read_bytes(), frozen)
        manifest = workflow.read(self.models / 'release' / self.version / 'manifest.json')
        self.assertEqual(len(manifest['decision_review']), 3)
        decisions = workflow.read(self.models / 'decisions' / (self.version + '.json'))['decisions']
        self.assertTrue(any(d['note'].startswith('Réexamen de ADOPT-003 ') for d in decisions))
        self.assertEqual(workflow.load_current(self.root)[1]['version'], self.version)
        (proof / 'assessment.yaml').write_bytes(b'corrupted')
        with self.assertRaisesRegex(ValueError, 'Archived review integrity mismatch'):
            workflow.load_current(self.root)

    def test_uncommitted_publication_cannot_be_retired(self):
        self.editorial()
        path = self.models / 'release' / self.base / 'changes.json'
        path.write_bytes(path.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'Commit the current publication'):
            self.run_release(activate=True)
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], self.base)

    def test_stable_approval_identity_on_editorial_revision(self):
        self.editorial()
        current = workflow.load_current(self.root)
        bundle = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], current=current, lightweight=True)
        prior = {d['id']: d for d in current[3]['decisions']['decisions']}
        for decision in bundle['decisions']['decisions']:
            self.assertIn(decision['id'], prior)
            self.assertEqual(decision['note'], prior[decision['id']]['note'])

    def test_baseline_change_blocks_resume(self):
        self.editorial()
        self.run_release()
        manifest = self.models / 'release' / self.base / 'manifest.json'
        manifest.write_bytes(manifest.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'Sources or publication code changed'):
            self.run_release(activate=True)

    def test_retirement_preserves_previously_archived_proofs(self):
        folder = self.models / 'release' / self.base
        proof = folder / 'old-proof.txt'
        proof.write_bytes(b'Original evidence')
        git_history.git(self.root, 'add', 'modeles')
        git_history.git(self.root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Older proof')
        original = git_history.git(self.root, 'rev-parse', 'HEAD').decode().strip()
        save(self.root / git_history.INDEX, {'schema_version': '1.0.0', 'archives': [
            {'path': folder.relative_to(self.root).as_posix(), 'commit': original}]})
        proof.unlink()
        git_history.git(self.root, 'add', 'modeles')
        git_history.git(self.root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Retire old proof')
        self.editorial()
        self.assertEqual(self.run_release(activate=True)['status'], 'published')
        self.assertEqual(git_history.read_bytes(proof), b'Original evidence')


if __name__ == '__main__':
    unittest.main()
