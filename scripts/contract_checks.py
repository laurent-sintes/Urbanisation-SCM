"""Run the Python contract scope selected by the shared push policy."""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.run_python_tests import run

BACKLOG_MODULES = (
    'test_backlog_delivery', 'test_business_areas', 'test_decision_registry',
    'test_glossary', 'test_model_coherence', 'test_models', 'test_scenario_catalog',
)
RELEASE_MODULES = tuple(sorted(set(BACKLOG_MODULES) | {
    'test_atlas_delivery', 'test_export_atlas', 'test_publish_release', 'test_release_run'}))


def check(profile, *, full=False, modules=()):
    if profile == 'tests':
        selected = {'scripts': [], 'app': []}
        for item in modules:
            directory, separator, name = item.partition(':')
            if not separator or directory not in selected or not name.startswith('test_'):
                raise ValueError(f'Invalid contract module: {item}')
            selected[directory].append(name)
        if not any(selected.values()):
            raise ValueError('Test profile requires changed modules')
        for directory, names in selected.items():
            if names and run(directory=directory, full=full, modules=names)['status'] != 'passed':
                return 'failed'
        return 'passed'
    if profile == 'policy':
        return run(directory='scripts', full=full, modules=('test_check_policy', 'test_preflight_push'))['status']
    if profile == 'backlog':
        subprocess.run([sys.executable, 'scripts/refresh_sources.py', '--check'], check=True)
        subprocess.run([sys.executable, 'scripts/validate_models.py'], check=True)
        return run(directory='scripts', full=full, modules=BACKLOG_MODULES)['status']
    if profile == 'release':
        subprocess.run([sys.executable, 'scripts/refresh_sources.py', '--check'], check=True)
        subprocess.run([sys.executable, 'scripts/validate_models.py'], check=True)
        return run(directory='scripts', full=full, modules=RELEASE_MODULES)['status']
    if profile == 'sources':
        subprocess.run([sys.executable, 'scripts/refresh_sources.py', '--check'], check=True)
        return 'passed'
    if profile == 'syntax':
        subprocess.run([sys.executable, '-m', 'compileall', '-q', 'scripts'], check=True)
        return 'passed'
    if profile == 'full':
        if run(directory='scripts', full=full)['status'] != 'passed':
            return 'failed'
        return run(directory='app', full=full)['status']
    if profile == 'none':
        return 'passed'
    raise ValueError(f'Unknown contract profile: {profile}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', choices=('policy', 'tests', 'backlog', 'release', 'sources', 'syntax', 'full'), required=True)
    parser.add_argument('--modules', default='', help='Comma-separated directory:test_name entries for test-only changes')
    parser.add_argument('--full', action='store_true')
    args = parser.parse_args()
    raise SystemExit(check(args.profile, full=args.full, modules=tuple(filter(None, args.modules.split(',')))) != 'passed')
