"""Exact immutable Git reads through one process, including failure recovery."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts import git_history as history


class GitBatchTests(unittest.TestCase):
    def test_exact_binary_reads_nested_sessions_and_missing_objects(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            history.git(root, 'init', '-q')
            payload = b'\x00binary\n' * 30000
            (root / 'sample.bin').write_bytes(payload)
            history.git(root, 'add', 'sample.bin')
            history.git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'Fixture')
            commit = history.git(root, 'rev-parse', 'HEAD').decode().strip()
            history.blob.cache_clear()
            with patch.object(history.subprocess, 'Popen', wraps=history.subprocess.Popen) as processes:
                with history.batch_reader(root):
                    with history.batch_reader(root):
                        self.assertEqual(history.blob(str(root), commit, 'sample.bin'), payload)
                    with self.assertRaisesRegex(ValueError, 'history unavailable'):
                        history.blob(str(root), commit, 'missing.bin')
                    history.blob.cache_clear()
                    self.assertEqual(history.blob(str(root), commit, 'sample.bin'), payload)
                    with self.assertRaisesRegex(ValueError, 'Invalid Git artifact path'):
                        history.blob(str(root), commit, 'sample.bin\nHEAD:sample.bin')
                self.assertEqual(processes.call_count, 1)
            (root / 'sample.bin').write_bytes(b'changed live bytes')
            history.blob.cache_clear()
            self.assertEqual(history.blob(str(root), commit, 'sample.bin'), payload)


if __name__ == '__main__':
    unittest.main()
