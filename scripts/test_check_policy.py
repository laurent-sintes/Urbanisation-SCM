"""CI and local gates retain required checks and the complete browser matrix."""
import json
from pathlib import Path
import unittest

from scripts.structured_io import read
from scripts.plan_checks import plan
from scripts.verify_atlas import GROUPS
from scripts.decision_review import publication_tool_state

ROOT = Path(__file__).resolve().parents[1]


class CheckPolicyTests(unittest.TestCase):
    def test_required_status_runs_on_every_pr_and_never_deploys_pr(self):
        workflow = read(ROOT / '.github/workflows/atlas-pages.yml')
        self.assertIn('pull_request', workflow['on'])
        self.assertNotIn('paths', workflow['on']['pull_request'])
        gate = workflow['jobs']['checks']
        self.assertEqual(gate['name'], 'Atlas checks')
        self.assertEqual(gate['if'], 'always()')
        self.assertEqual(set(gate['needs']), {'plan', 'build', 'contracts', 'launcher'})
        script = gate['steps'][0]['run']
        for flag in ('NEED_BUILD', 'NEED_CONTRACTS', 'NEED_LAUNCHER'):
            self.assertIn(flag, script)
        deploy = workflow['jobs']['deploy']
        self.assertIn("github.event_name != 'pull_request'", deploy['if'])
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

    def test_publication_code_tracks_helpers_and_not_unrelated_tests(self):
        state = publication_tool_state()
        self.assertIn('scripts/glossary.py', state)
        self.assertIn('scripts/dependency_signature.py', state)
        self.assertIn('scripts/model_index.py', state)
        self.assertFalse(any(Path(name).name.startswith(('test_', 'benchmark_')) for name in state))

    def test_frontend_python_and_global_config_select_conservative_checks(self):
        self.assertTrue(plan(['app/modeling_guide.py'])['contracts'])
        self.assertTrue(plan(['modeles/backlog/glossary.yaml'])['browser'])
        self.assertTrue(plan(['.github/workflows/atlas-pages.yml'])['launcher'])


if __name__ == '__main__':
    unittest.main()
