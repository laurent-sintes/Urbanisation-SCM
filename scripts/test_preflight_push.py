"""Push refuses wrong destinations, stale refs, conflicts and interrupted checks."""
from hashlib import sha256
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.preflight_push import context, run, check_inputs, fingerprint, ALLOWED


class PreflightPushTests(unittest.TestCase):
    def test_first_push_preserves_origin_base_in_final_context_check(self):
        with tempfile.TemporaryDirectory() as folder:
            ctx = {'head': 'commit', 'branch': 'codex/new', 'upstream': 'origin/main',
                   'base': 'resolved-base-sha', 'paths': [], 'plan': {'frontend': False},
                   'offline': True, 'working': True, 'first_push': True}
            with patch('scripts.preflight_push.context', return_value=ctx) as context_check, \
                 patch('scripts.preflight_push.commands', return_value=[]), \
                 patch('scripts.preflight_push.fingerprint', return_value={}), \
                 patch('scripts.preflight_push.platform.platform', return_value='test'):
                run(Path(folder), base='origin/main', working=True, offline=True, execute=True)
                self.assertEqual(context_check.call_args.kwargs['base'], 'origin/main')

    def test_browser_receipt_binds_served_assets_and_data_but_not_commit_metadata(self):
        inputs = {'scripts/code.py': 'a', 'app/dist/delivery.json': 'head',
                  'app/dist/assets/app.js': 'ui', 'app/dist/data/index.json': 'data'}
        with patch('scripts.preflight_push.fingerprint', return_value=inputs.copy()) as fingerprint:
            self.assertEqual(check_inputs(Path('.'), 'browser'),
                             {key: value for key, value in inputs.items() if key != 'app/dist/delivery.json'})
            fingerprint.assert_called_once_with(Path('.'), generated_folders=('app/dist',))
        with patch('scripts.preflight_push.fingerprint', return_value={'scripts/code.py': 'a'}) as fingerprint:
            check_inputs(Path('.'), 'scripts')
            fingerprint.assert_called_once_with(Path('.'), include_generated=False)

    def test_browser_receipt_ignores_unserved_public_data(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'app/dist/data').mkdir(parents=True)
            (root / 'app/public/data').mkdir(parents=True)
            (root / 'app/dist/data/index.json').write_text('served', encoding='utf-8')
            (root / 'app/public/data/index.json').write_text('build input', encoding='utf-8')
            with patch('scripts.preflight_push.git_paths', return_value=set()):
                browser = check_inputs(root, 'browser')
                build = check_inputs(root, 'build')
            self.assertIn('app/dist/data/index.json', browser)
            self.assertNotIn('app/public/data/index.json', browser)
            self.assertIn('app/public/data/index.json', build)

    def test_tracked_symlink_fingerprints_link_without_reading_its_target(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            link = root / 'link.txt'
            with patch('scripts.preflight_push.git_paths', side_effect=[{'link.txt'}, set()]), \
                 patch.object(Path, 'is_symlink', autospec=True, side_effect=lambda path: path == link), \
                 patch('scripts.preflight_push.os.readlink', return_value='../outside.txt'), \
                 patch.object(Path, 'read_bytes', side_effect=AssertionError('link target was read')):
                stamp = fingerprint(root, include_generated=False)
            self.assertEqual(stamp['link.txt'], sha256(os.fsencode('../outside.txt')).hexdigest())

    def test_nul_separated_git_paths_preserve_leading_whitespace(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / ' leading.txt').write_text('content', encoding='utf-8')
            with patch('scripts.preflight_push.subprocess.check_output', side_effect=[b' leading.txt\0', b'']):
                stamp = fingerprint(root, include_generated=False)
            self.assertEqual(stamp[' leading.txt'], sha256(b'content').hexdigest())

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.urls = ['https://github.com/laurent-sintes/Urbanisation-SCM.git']
        self.responses = {'branch': 'codex/test', 'upstream': 'origin/main', 'status': '', 'conflicts': '', 'behind': '0'}

    def git(self, root, *args):
        if args == ('rev-parse', '--show-toplevel'):
            return str(self.root)
        if args[:2] == ('remote', 'get-url'):
            return '\n'.join(self.urls)
        if args == ('branch', '--show-current'):
            return self.responses['branch']
        if args == ('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'):
            return self.responses['upstream']
        if args[:3] == ('diff', '--name-only', '--diff-filter=U'):
            return self.responses['conflicts']
        if args[0] == 'status':
            return self.responses['status']
        if args[0] == 'ls-remote':
            return 'newcommit\trefs/heads/main'
        if args[0] == 'rev-list':
            return self.responses['behind']
        return 'commit'

    def test_unexpected_or_multiple_destinations_refuse_check(self):
        for urls in [['https://example.com/repo'], list(ALLOWED)[:2]]:
            self.urls = urls
            with patch('scripts.preflight_push.git', side_effect=self.git):
                with self.assertRaisesRegex(ValueError, 'destinations'):
                    context(self.root, offline=True)

    def test_stale_remote_and_dirty_tree_refuse_push(self):
        with patch('scripts.preflight_push.git', side_effect=self.git), patch('scripts.preflight_push.changed_paths', return_value=[]):
            with self.assertRaisesRegex(ValueError, 'stale'):
                context(self.root)
            self.responses['status'] = ' M scripts/tool.py'
            with self.assertRaisesRegex(ValueError, 'working changes'):
                context(self.root, offline=True)

    def test_detached_conflicted_and_diverged_branches_refuse_push(self):
        for key, value, message in [('branch', '', 'Detached'), ('conflicts', 'file', 'conflicts'), ('behind', '2', 'behind')]:
            old = self.responses[key]
            self.responses[key] = value
            with patch('scripts.preflight_push.git', side_effect=self.git):
                with self.assertRaisesRegex(ValueError, message):
                    context(self.root, offline=True)
            self.responses[key] = old

    def test_changed_source_after_check_cannot_create_receipt(self):
        ctx = {'head': 'commit', 'branch': 'codex/test', 'upstream': 'origin/main', 'base': 'base',
               'paths': ['script'], 'plan': {'frontend': False}, 'offline': True, 'working': True,
               'first_push': False}
        with patch('scripts.preflight_push.context', return_value=ctx), \
             patch('scripts.preflight_push.commands', return_value=[('check', ['fake'])]), \
             patch('scripts.preflight_push.fingerprint', side_effect=[{'script': 'old'}, {'script': 'old'}, {'script': 'new'}]), \
             patch('scripts.preflight_push.platform.platform', return_value='Test platform'), \
             patch('scripts.preflight_push.subprocess.run'):
            with self.assertRaisesRegex(ValueError, 'Sources changed'):
                run(self.root, offline=True, working=True, execute=True)
        self.assertFalse((self.root / '.runtime/preflight/check.json').exists())


if __name__ == '__main__':
    unittest.main()
