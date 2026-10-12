"""Module receipts reuse unchanged successes and retain failures for the next run."""
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import patch

from scripts.run_python_tests import run


class PythonCheckReceiptsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'scripts').mkdir()
        for name in ('test_one', 'test_two'):
            (self.root / 'scripts' / (name + '.py')).write_text('')

    def test_only_failed_module_is_replayed(self):
        with patch('scripts.run_python_tests.fingerprint', return_value={'source': 'a'}), \
             patch('scripts.run_python_tests.platform.platform', return_value='test'), \
             patch('scripts.run_python_tests.subprocess.run', side_effect=[SimpleNamespace(returncode=0), SimpleNamespace(returncode=1), SimpleNamespace(returncode=0)]) as process:
            self.assertEqual(run(self.root)['status'], 'failed')
            result = run(self.root)
        self.assertEqual(result['status'], 'passed')
        self.assertEqual(process.call_count, 3)
        self.assertEqual([row['reused'] for row in result['modules']], [True, False])

    def test_source_change_and_corrupt_receipt_force_replay(self):
        with patch('scripts.run_python_tests.fingerprint', return_value={'source': 'a'}) as fingerprint, \
             patch('scripts.run_python_tests.platform.platform', return_value='test'), \
             patch('scripts.run_python_tests.subprocess.run', return_value=SimpleNamespace(returncode=0)) as process:
            run(self.root)
            (self.root / '.runtime/python-checks/scripts-test_one.json').write_text('{}')
            run(self.root)
            self.assertEqual(process.call_count, 3)
            fingerprint.return_value = {'source': 'b'}
            run(self.root)
            self.assertEqual(process.call_count, 5)

    def test_changed_inputs_refuse_suite_and_subset_is_not_full_scope(self):
        with patch('scripts.run_python_tests.fingerprint', side_effect=[{'source': 'a'}, {'source': 'b'}]), \
             patch('scripts.run_python_tests.platform.platform', return_value='test'), \
             patch('scripts.run_python_tests.subprocess.run', return_value=SimpleNamespace(returncode=0)):
            with self.assertRaisesRegex(ValueError, 'Sources changed'):
                run(self.root, modules=['test_one'])
        with patch('scripts.run_python_tests.fingerprint', return_value={'source': 'b'}), \
             patch('scripts.run_python_tests.platform.platform', return_value='test'), \
             patch('scripts.run_python_tests.subprocess.run', return_value=SimpleNamespace(returncode=0)):
            self.assertFalse(run(self.root, modules=['test_one'])['full_scope'])


if __name__ == '__main__':
    unittest.main()
