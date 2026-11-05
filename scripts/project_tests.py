"""Explicit local/CI test entry point; never installed as a Git hook."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def run(suite='all', *, profile='full', modules='', full=False, browser_mode='smoke', workers=3):
    temporary = ROOT / '.runtime/test-temp'
    temporary.mkdir(parents=True, exist_ok=True)
    env = {**os.environ, 'TEMP': str(temporary), 'TMP': str(temporary), 'PYTHONUTF8': '1',
           'PYTHONPATH': os.pathsep.join((str(ROOT / 'app'), str(ROOT)))}
    pnpm = shutil.which('pnpm')
    commands = []
    if suite in ('all', 'python'):
        commands.append([sys.executable, 'scripts/contract_checks.py', '--profile', profile,
                         '--modules', modules, *(['--full'] if full else [])])
    if suite in ('all', 'frontend'):
        if not pnpm:
            raise ValueError('pnpm is required for frontend tests')
        commands += [[pnpm, '--dir', 'app', 'check:code'], [pnpm, '--dir', 'app', 'test']]
    if suite in ('all', 'browser'):
        if not pnpm:
            raise ValueError('pnpm is required to build Atlas before browser tests')
        commands.append([pnpm, '--dir', 'app', 'build'])
        commands.append([sys.executable, 'scripts/verify_atlas.py', '--workers', str(workers),
                         *([] if browser_mode == 'full' else ['--smoke'])])
    for command in commands:
        result = subprocess.run(command, cwd=ROOT, env=env)
        if result.returncode:
            return result.returncode
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--suite', choices=('all', 'python', 'frontend', 'browser'), default='all')
    parser.add_argument('--profile', default='full', choices=('full', 'current', 'backlog', 'release', 'sources', 'policy', 'tests', 'syntax', 'none'))
    parser.add_argument('--modules', default='')
    parser.add_argument('--full', action='store_true', help='Re-run tests without reusing local receipts')
    parser.add_argument('--browser-mode', choices=('smoke', 'full'), default='smoke')
    parser.add_argument('--workers', type=int, default=3)
    args = parser.parse_args()
    raise SystemExit(run(**vars(args)))
