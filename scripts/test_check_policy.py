"""CI and local gates retain required checks and the complete browser matrix."""
import json
from pathlib import Path
import unittest
from unittest.mock import patch

from scripts.structured_io import read
from scripts.plan_checks import plan
from scripts.verify_atlas import GROUPS, SMOKE, RELEASE
from scripts.preflight_push import commands
from scripts.contract_checks import BACKLOG_MODULES
from scripts.decision_review import publication_tool_state

ROOT = Path(__file__).resolve().parents[1]


class CheckPolicyTests(unittest.TestCase):
    def test_main_push_runs_checks_before_deploy(self):
        workflow = read(ROOT / '.github/workflows/atlas-pages.yml')
        self.assertNotIn('pull_request', workflow['on'])
        self.assertEqual(workflow['on']['push']['branches'], ['main'])
        gate = workflow['jobs']['checks']
        self.assertEqual(gate['name'], 'Atlas checks')
        self.assertEqual(gate['if'], 'always()')
        self.assertEqual(set(gate['needs']), {'plan', 'build', 'contracts', 'launcher'})
        script = gate['steps'][0]['run']
        for flag in ('NEED_BUILD', 'NEED_CONTRACTS', 'NEED_LAUNCHER'):
            self.assertIn(flag, script)
        deploy = workflow['jobs']['deploy']
        # A skipped optional launcher must not suppress a validated main deployment.
        self.assertIn('always()', deploy['if'])
        self.assertIn("needs.checks.result == 'success'", deploy['if'])
        self.assertIn("needs.build.result == 'success'", deploy['if'])
        self.assertIn("github.ref == 'refs/heads/main'", deploy['if'])
        self.assertFalse(deploy['concurrency']['cancel-in-progress'])
        self.assertIn('git ls-remote origin refs/heads/main', deploy['steps'][1]['run'])

    def test_all_existing_recipes_remain_in_parallel_runner(self):
        scripts = json.loads((ROOT / 'app/package.json').read_bytes())['scripts']
        serial = scripts['verify:serial']
        for name in ('verify:hotspots', 'verify:hotspot-resolution', 'verify:hotspot-detail'):
            serial = serial.replace('pnpm run ' + name, scripts[name])
        expected = {part.strip()[5:] for part in serial.split('&&') if part.strip().startswith('node ')}
        actual = {script.split()[0] for group in GROUPS.values() for script in group}
        self.assertEqual(actual, expected)
        self.assertEqual(sum(script.startswith('verify-map-hotspot-matrix.mjs') for group in GROUPS.values() for script in group), 3)
        self.assertEqual({script for group in SMOKE.values() for script in group},
                         {'verify-browser.mjs', 'verify-display-codes.mjs', 'verify-published-content.mjs'})
        self.assertTrue({script for group in SMOKE.values() for script in group}.issubset(
            {script for group in RELEASE.values() for script in group}))
        self.assertIn('verify-map-placement.mjs', RELEASE['placement'])
        self.assertIn('verify-hotspots.mjs', RELEASE['hotspot'])

    def test_publication_code_tracks_helpers_and_not_unrelated_tests(self):
        state = publication_tool_state()
        self.assertIn('scripts/glossary.py', state)
        self.assertIn('scripts/dependency_signature.py', state)
        self.assertIn('scripts/model_index.py', state)
        self.assertFalse(any(Path(name).name.startswith(('test_', 'benchmark_')) for name in state))

    def test_frontend_python_and_global_config_select_conservative_checks(self):
        self.assertTrue(plan(['app/modeling_guide.py'])['contracts'])
        self.assertTrue(plan(['modeles/backlog/glossary.yaml'])['contracts'])
        self.assertFalse(plan(['modeles/backlog/glossary.yaml'])['browser'])
        self.assertTrue(plan(['modeles/release/index.json'])['browser'])
        self.assertFalse(plan(['.github/workflows/atlas-pages.yml'])['launcher'])
        self.assertFalse(plan(['.github/workflows/atlas-pages.yml'])['matrix'])
        self.assertTrue(plan(['app/src/components/MapPanel.tsx'])['matrix'])
        self.assertFalse(plan(['app/src/components/SearchPanel.tsx'])['matrix'])
        self.assertFalse(plan(['app/src/components/glossary.css'])['matrix'])
        self.assertEqual(plan(['modeles/backlog/model.yaml'])['contract_profile'], 'backlog')
        self.assertEqual(plan(['.github/workflows/atlas-pages.yml'])['contract_profile'], 'policy')
        self.assertTrue(plan(['.github/workflows/atlas-pages.yml'])['contracts'])
        self.assertEqual(plan(['scripts/export_atlas.py', 'modeles/backlog/model.yaml'])['contract_profile'], 'full')
        self.assertTrue(plan(['modeles/release/index.json'])['release_browser'])
        self.assertIn('test_models', BACKLOG_MODULES)
        self.assertEqual(plan(['scripts/test_models.py'])['contract_profile'], 'tests')
        self.assertEqual(plan(['scripts/test_models.py'])['contract_modules'], ['scripts:test_models'])
        self.assertEqual(plan(['scripts/test_models.py', 'modeles/backlog/model.yaml'])['contract_profile'], 'full')
        self.assertEqual(plan(['app/test_data.py'])['contract_modules'], ['app:test_data'])

    def test_local_browser_mode_matches_ci(self):
        for paths, suffix in (
            (['app/src/search.ts'], ['--smoke']),
            (['modeles/release/index.json'], ['--release']),
            (['app/src/components/MapPanel.tsx'], []),
        ):
            with patch('scripts.preflight_push.shutil.which', return_value='pnpm'):
                browser = dict(commands(plan(paths), ROOT))['browser']
            self.assertEqual(browser[-1:] if suffix else browser[2:], suffix)


if __name__ == '__main__':
    unittest.main()
