"""One conservative check policy for local preflight and GitHub CI."""
import argparse
import json
import os
from pathlib import Path
import subprocess


def plan(paths):
    paths = sorted(set(paths))
    result = {'contracts': False, 'frontend': False, 'frontend_tests': False, 'launcher': False, 'browser': False,
              'matrix': False, 'release_browser': False, 'contract_profile': 'none', 'contract_modules': []}
    reasons = []
    modules = set()
    for path in paths:
        flags = set()
        if path == 'modeles/provenance/source-records.json':
            flags = {'contracts'}
            profile = 'sources'
        elif path.startswith('modeles/backlog/'):
            # Atlas renders only activated snapshots. Backlog edits are checked by
            # Python contracts; their future publication will trigger the UI gate.
            flags = {'contracts'}
            profile = 'backlog'
        elif path.startswith('modeles/'):
            flags = {'contracts', 'frontend', 'browser'}
            profile = 'release' if path.startswith(('modeles/release/', 'modeles/modeling-guides/')) or path == 'modeles/git-history.json' else 'full'
            if path.startswith('modeles/release/'):
                flags.add('release_browser')
        elif path.startswith('scripts/') and path.endswith('.py'):
            name = Path(path).stem
            if name.startswith('test_'):
                flags, profile = {'contracts'}, 'tests'
                modules.add('scripts:' + name)
            elif name.startswith('benchmark_'):
                flags, profile = {'contracts'}, 'syntax'
            else:
                flags, profile = {'contracts', 'frontend', 'browser'}, 'full'
        elif path.startswith('app/') and not path.endswith('.md'):
            flags = {'frontend', 'browser'}
            profile = 'full' if path.endswith('.py') else 'none'
            if Path(path).name.startswith('test-') and path.endswith('.mjs'):
                flags = {'frontend_tests'}
            if path.endswith('.py'):
                flags.add('contracts')
                if Path(path).stem.startswith('test_'):
                    flags, profile = {'contracts'}, 'tests'
                    modules.add('app:' + Path(path).stem)
            if 'launcher' in path:
                flags.add('launcher')
            if path in {'app/catalogue-geometry.mjs', 'app/verify-catalogue-page.mjs',
                        'app/verify-flow-map.mjs', 'app/verify-map-placement.mjs',
                        'app/verify-map-hotspot-matrix.mjs', 'app/verify-hotspot-depths.mjs'} or path.startswith('app/src/') and (
                any(term in path.lower() for term in ('map', 'hotspot', 'reactflow', 'overview', 'adaptivelayout'))
                or path in {'app/src/styles.css', 'app/src/reader.css'}
            ):
                flags.add('matrix')
        elif path == 'Lancer-FLOW-Atlas.ps1':
            flags = {'launcher'}
            profile = 'none'
        elif path == 'requirements.txt':
            flags = {'contracts', 'frontend', 'browser'}
            profile = 'full'
        elif path.startswith('.github/'):
            flags = {'contracts', 'frontend'}
            profile = 'policy'
        elif path.startswith(('connaissance/', 'marche/')):
            flags = {'contracts'}
            profile = 'sources'
        elif path in ('AGENTS.md', 'CONVENTIONS-MODELE.md') or path.startswith('skills/') or path.endswith('.md'):
            flags = set()
            profile = 'none'
        else:
            flags = {'contracts', 'frontend', 'launcher', 'browser', 'matrix'}
            profile = 'full'  # Unknown configuration/content never silently skips checks.
        for flag in flags:
            result[flag] = True
        current = result['contract_profile']
        ranks = {'none': 0, 'syntax': 1, 'policy': 2, 'tests': 3, 'sources': 3, 'backlog': 4, 'release': 5, 'full': 6}
        compatible_model_profiles = {'sources', 'backlog', 'release'}
        if current in compatible_model_profiles and profile in compatible_model_profiles:
            result['contract_profile'] = max((current, profile), key=ranks.__getitem__)
        elif current not in ('none', profile) and profile != 'none' and {current, profile} != {'policy', 'full'}:
            result['contract_profile'] = 'full'
        elif ranks[profile] > ranks[current]:
            result['contract_profile'] = profile
        reasons.append({'path': path, 'checks': sorted(flags)})
    result['contract_modules'] = sorted(modules) if result['contract_profile'] == 'tests' else []
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
            for key in ('contracts', 'frontend', 'frontend_tests', 'launcher', 'browser', 'matrix', 'release_browser'):
                stream.write(f'{key}={str(result[key]).lower()}\n')
            stream.write(f"contract_profile={result['contract_profile']}\n")
            stream.write(f"contract_modules={','.join(result['contract_modules'])}\n")
    print(json.dumps(result, indent=2))
