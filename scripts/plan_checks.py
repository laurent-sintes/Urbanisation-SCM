"""One conservative check policy for local preflight and GitHub CI."""
import argparse
import json
import os
from pathlib import Path
import subprocess


def plan(paths):
    paths = sorted(set(paths))
    result = {'contracts': False, 'frontend': False, 'launcher': False, 'browser': False}
    reasons = []
    for path in paths:
        flags = set()
        if path.startswith('modeles/'):
            flags = {'contracts', 'frontend', 'browser'}
        elif path.startswith('scripts/') and path.endswith('.py'):
            flags = {'contracts'} if Path(path).name.startswith(('test_', 'benchmark_')) else {'contracts', 'frontend', 'browser'}
        elif path.startswith('app/') and not path.endswith('.md'):
            flags = {'frontend', 'browser'}
            if path.endswith('.py'):
                flags.add('contracts')
            if 'launcher' in path:
                flags.add('launcher')
        elif path in ('requirements.txt', 'Lancer-FLOW-Atlas.ps1') or path.startswith('.github/'):
            flags = set(result)
        elif path.startswith(('connaissance/', 'marche/')):
            flags = {'contracts', 'frontend', 'browser'}
        elif path in ('AGENTS.md', 'CONVENTIONS-MODELE.md') or path.startswith('skills/') or path.endswith('.md'):
            flags = set()
        else:
            flags = set(result)  # Unknown configuration/content never silently skips checks.
        for flag in flags:
            result[flag] = True
        reasons.append({'path': path, 'checks': sorted(flags)})
    return {'format': 1, **result, 'reasons': reasons}


def changed_paths(root, base, head='HEAD', *, working=False):
    args = ['git', 'diff', '--name-only', '-z', base, head, '--']
    names = subprocess.check_output(args, cwd=root).decode('utf-8').split('\0')
    if working:
        names += subprocess.check_output(['git', 'diff', '--name-only', '-z', 'HEAD', '--'], cwd=root).decode('utf-8').split('\0')
        names += subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z'], cwd=root).decode('utf-8').split('\0')
    return sorted(set(filter(None, names)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--head', default='HEAD')
    parser.add_argument('--working', action='store_true')
    parser.add_argument('--github-output', action='store_true')
    args = parser.parse_args()
    result = plan(changed_paths(Path.cwd(), args.base, args.head, working=args.working))
    if args.github_output:
        with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as stream:
            for key in ('contracts', 'frontend', 'launcher', 'browser'):
                stream.write(f'{key}={str(result[key]).lower()}\n')
    print(json.dumps(result, indent=2))
