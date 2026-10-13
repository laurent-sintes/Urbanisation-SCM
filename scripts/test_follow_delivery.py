"""A successful checks-only push must not be reported as a deployment failure."""
import json
import unittest
from unittest.mock import patch

from scripts.follow_delivery import follow


class FollowDeliveryTests(unittest.TestCase):
    def test_validated_without_build(self):
        commit = 'a' * 40
        run = [{'databaseId': 42, 'headSha': commit, 'status': 'completed',
                'conclusion': 'success', 'event': 'push'}]
        jobs = {'jobs': [{'name': 'build', 'conclusion': 'skipped'},
                         {'name': 'Atlas checks', 'conclusion': 'success'}]}
        with patch('scripts.follow_delivery.gh', side_effect=[json.dumps(run), json.dumps(jobs)]), \
                patch('scripts.follow_delivery.subprocess.check_output', return_value=commit + '\trefs/heads/main\n'):
            result = follow(commit, timeout=1, deploy=True)
        self.assertEqual(result['status'], 'validated_only')
        self.assertEqual(result['commit'], commit)

    def test_failed_checks_remain_failure(self):
        commit = 'b' * 40
        run = [{'databaseId': 43, 'headSha': commit, 'status': 'completed',
                'conclusion': 'failure', 'event': 'push'}]
        with patch('scripts.follow_delivery.gh', return_value=json.dumps(run)):
            result = follow(commit, timeout=1, deploy=True)
        self.assertEqual(result['status'], 'checks_failed')


if __name__ == '__main__':
    unittest.main()
