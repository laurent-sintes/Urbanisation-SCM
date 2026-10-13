"""Cleanup must preserve proofs and reject changed or redirected candidates."""
from pathlib import Path
import tempfile
import os
import time
import unittest

from scripts.clean_generated import clean, plan, apply_plan


class CleanupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.folder = self.root / '.runtime/atlas-benchmarks/run'
        self.folder.mkdir(parents=True)
        (self.folder / 'model.json').write_text('{"regenerable":true}')
        self.proof = self.root / '.runtime/release-reviews/review.json'
        self.proof.parent.mkdir()
        self.proof.write_text('Unique historical evidence')

    def test_dry_run_and_apply_preserve_proofs(self):
        result = clean(self.root, min_age_days=0)
        self.assertGreater(result['candidate_bytes'], 0)
        self.assertEqual(result['removed_bytes'], 0)
        self.assertTrue(self.folder.exists())
        result = clean(self.root, min_age_days=0, apply=True)
        self.assertGreater(result['removed_bytes'], 0)
        self.assertFalse(self.folder.exists())
        self.assertEqual(self.proof.read_text(), 'Unique historical evidence')

    def test_recent_run_and_unknown_content_are_preserved(self):
        self.assertEqual(clean(self.root)['candidate_bytes'], 0)
        (self.folder / 'evidence.yaml').write_text('keep: true')
        with self.assertRaisesRegex(ValueError, 'Unexpected benchmark content'):
            clean(self.root, min_age_days=0, apply=True)
        self.assertTrue((self.folder / 'model.json').exists())

    def test_changed_inventory_cannot_be_applied(self):
        selected = plan(self.root, min_age_days=0)
        (self.folder / 'model.json').write_text('changed')
        with self.assertRaisesRegex(ValueError, 'changed since'):
            apply_plan(self.root, selected)
        self.assertTrue(self.folder.exists())

    def test_non_allowlisted_directory_is_refused(self):
        with self.assertRaisesRegex(ValueError, 'not allowlisted'):
            apply_plan(self.root, [{'path': '.runtime/release-reviews', 'files': {}}])
        self.assertTrue(self.proof.exists())

    def test_link_is_refused(self):
        link = self.folder / 'link'
        try:
            link.symlink_to(self.proof.parent, target_is_directory=True)
        except OSError:
            self.skipTest('Symbolic links unavailable for this account')
        with self.assertRaisesRegex(ValueError, 'links and junctions'):
            clean(self.root, min_age_days=0, apply=True)
        self.assertTrue(self.proof.exists())

    def test_negative_age_is_refused(self):
        for age in (-1, float('nan'), float('inf')):
            with self.assertRaises(ValueError):
                clean(self.root, min_age_days=age, apply=True)

    def test_build_copies_require_explicit_scope_and_preserve_active_build(self):
        copy = self.root / 'app/.runtime/qa-dist'
        (copy / 'data/2026-10-11.1').mkdir(parents=True)
        (copy / 'index.html').write_text('<html>generated</html>')
        (copy / 'data/index.json').write_text('{}')
        (copy / 'data/2026-10-11.1/model.yaml').write_text('version: test')
        active = self.root / 'app/.runtime/build-active/index.html'
        active.parent.mkdir()
        active.write_text('active build')
        clean(self.root, min_age_days=0, apply=True)
        self.assertTrue(copy.exists())
        result = clean(self.root, min_age_days=0, apply=True, build_copies=True)
        self.assertIn('app/.runtime/qa-dist', result['directories'])
        self.assertFalse(copy.exists())
        self.assertEqual(active.read_text(), 'active build')
        self.assertTrue(self.proof.exists())

    def test_unknown_build_evidence_blocks_cleanup(self):
        copy = self.root / 'app/.runtime/qa-dist'
        (copy / 'data').mkdir(parents=True)
        (copy / 'index.html').write_text('generated')
        (copy / 'data/index.json').write_text('{}')
        proof = copy / 'notes.yaml'
        proof.write_text('unique proof')
        with self.assertRaisesRegex(ValueError, 'Unexpected build content'):
            clean(self.root, min_age_days=0, apply=True, build_copies=True)
        self.assertEqual(proof.read_text(), 'unique proof')

    def test_benchmark_yaml_and_document_exports_are_regenerable(self):
        version = self.folder / '2026-10-11.1'
        (version / 'documents').mkdir(parents=True)
        (version / 'model.yaml').write_text('version: test')
        (version / 'documents/DOC001.pdf').write_bytes(b'%PDF-generated')
        clean(self.root, min_age_days=0, apply=True)
        self.assertFalse(self.folder.exists())
        self.assertTrue(self.proof.exists())

    def test_retention_keeps_newest_runs_and_only_expires_older_ones(self):
        older = self.folder.parent / 'older'
        older.mkdir()
        (older / 'model.json').write_text('{}')
        now = time.time()
        old = now - 3 * 86400
        for path in (older, older / 'model.json'):
            os.utime(path, (old, old))
        result = clean(self.root, min_age_days=1, max_benchmark_runs=1, apply=True)
        self.assertIn('.runtime/atlas-benchmarks/older', result['directories'])
        self.assertTrue(self.folder.exists())
        self.assertFalse(older.exists())
        self.assertTrue(self.proof.exists())
