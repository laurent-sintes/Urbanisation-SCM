"""Windows rename retries are bounded and never replace an existing dossier."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.decision_review import _rename_review


class ReviewAtomicRenameTests(unittest.TestCase):
    def test_windows_lock_is_retried_without_changing_rename(self):
        error = PermissionError('locked')
        error.winerror = 5
        with patch('scripts.decision_review.os.rename', side_effect=[error, None]) as rename, \
             patch('scripts.decision_review.time.sleep') as sleep:
            _rename_review(Path('source'), Path('missing-review-destination'))
        self.assertEqual(rename.call_args_list[0], rename.call_args_list[1])
        self.assertEqual(rename.call_count, 2)
        sleep.assert_called_once_with(0.05)

    def test_permanent_refusal_and_non_windows_errors_propagate(self):
        for winerror, attempts in [(5, 5), (None, 1)]:
            error = PermissionError('denied')
            error.winerror = winerror
            with patch('scripts.decision_review.os.rename', side_effect=error) as rename, \
                 patch('scripts.decision_review.time.sleep'):
                with self.assertRaises(PermissionError):
                    _rename_review(Path('source'), Path('missing-review-destination'))
                self.assertEqual(rename.call_count, attempts)

    def test_existing_destination_is_not_retried(self):
        error = PermissionError('locked')
        error.winerror = 5
        with tempfile.TemporaryDirectory() as folder, \
             patch('scripts.decision_review.os.rename', side_effect=error) as rename, \
             patch('scripts.decision_review.time.sleep') as sleep:
            with self.assertRaises(PermissionError):
                _rename_review(Path('source'), Path(folder))
            self.assertEqual(rename.call_count, 1)
            sleep.assert_not_called()


if __name__ == '__main__':
    unittest.main()
