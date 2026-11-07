"""A successful checks-only push must not be reported as a deployment failure."""
import json
import unittest
from unittest.mock import patch

from scripts.follow_delivery import follow, gh, verify_private_deployment


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

    def test_enterprise_workflow_query_uses_qualified_repository(self):
        with patch('scripts.follow_delivery.subprocess.check_output', return_value='[]') as command:
            gh('run', 'list', target='beaumanoir')
        self.assertEqual(command.call_args.args[0],
                         ['gh', 'run', 'list', '--repo', 'beaumanoir.ghe.com/solution-ai/Urbanisation-SCM'])

    def private_fixture(self, commit):
        url = 'https://solution-ai-urbanisation-scm.pages.beaumanoir.ghe.com/'
        return [dict(public=False, build_type='workflow', html_url=url),
                [dict(id=12, sha=commit, environment='github-pages')],
                [dict(state='success', environment_url=url)]]

    def test_private_pages_proof_requires_exact_commit_and_successful_deployment(self):
        commit = 'c' * 40
        expected = dict(commit=commit, current_version='current-example', files={name: 'a' * 64 for name in (
            'index.html', 'data/index.json', 'data/current-example/model.json',
            'data/current-example/model.yaml', 'data/current-example/guide.json')})
        with patch('scripts.follow_delivery.subprocess.run', side_effect=AssertionError('HTTP check attempted')):
            result = verify_private_deployment(commit, expected, api=unittest.mock.Mock(side_effect=self.private_fixture(commit)))
        self.assertEqual(result['status'], 'verified')
        self.assertEqual(result['http_content_check'], 'not_performed_sso_protected')
        for failure in ('commit', 'status', 'url', 'public'):
            responses = self.private_fixture(commit)
            if failure == 'commit': responses[1][0]['sha'] = 'd' * 40
            if failure == 'status': responses[2][0]['state'] = 'failure'
            if failure == 'url': responses[2][0]['environment_url'] = 'https://example.com/'
            if failure == 'public': responses[0]['public'] = True
            with self.assertRaises(ValueError, msg=failure):
                verify_private_deployment(commit, expected, api=unittest.mock.Mock(side_effect=responses))


if __name__ == '__main__':
    unittest.main()
