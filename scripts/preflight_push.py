"""Fail-closed local checks for the exact content to send; never commit or push."""
import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.plan_checks import plan, changed_paths

ALLOWED = {'https://github.com/laurent-sintes/Urbanisation-SCM.git',
           'https://github.com/laurent-sintes/Urbanisation-SCM',
           'git@github.com:laurent-sintes/Urbanisation-SCM.git',
           'ssh://git@github.com/laurent-sintes/Urbanisation-SCM.git'}


def git(root, *args):
    return subprocess.check_output(['git', *args], cwd=root).decode('utf-8').strip()


def git_paths(root, *args):
    # NUL output must not be stripped: a tracked filename may begin with whitespace.
    raw = subprocess.check_output(['git', *args, '-z'], cwd=root)
    return {os.fsdecode(name) for name in raw.split(b'\0') if name}


def context(root, *, base=None, working=False, offline=False):
    root = Path(root).resolve()
    if sys.flags.optimize:
        raise ValueError('Run checks without Python optimization')
    if Path(git(root, 'rev-parse', '--show-toplevel')).resolve() != root:
        raise ValueError('Not the expected repository root')
    for mode in ([], ['--push']):
        urls = git(root, 'remote', 'get-url', '--all', *mode, 'origin').splitlines()
        if len(urls) != 1 or urls[0] not in ALLOWED:
            raise ValueError('Unexpected or multiple origin destinations')
    branch = git(root, 'branch', '--show-current')
    if not branch:
        raise ValueError('Detached HEAD')
    try:
        upstream = git(root, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')
        first_push = False
    except subprocess.CalledProcessError:
        upstream = base or git(root, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD')
        first_push = True
    if not upstream.startswith('origin/'):
        raise ValueError('Upstream must belong to origin')
    if git(root, 'diff', '--name-only', '--diff-filter=U'):
        raise ValueError('Unresolved conflicts')
    if not working and git(root, 'status', '--porcelain'):
        raise ValueError('Commit or exclude working changes before final push verification')
    remote_branch = upstream[len('origin/'):]
    if not offline:
        remote = git(root, 'ls-remote', '--exit-code', 'origin', 'refs/heads/' + remote_branch).split()[0]
        if remote != git(root, 'rev-parse', upstream):
            raise ValueError('Remote tracking ref is stale; fetch and rerun')
        if first_push and git(root, 'ls-remote', 'origin', 'refs/heads/' + branch):
            raise ValueError('Branch already exists remotely; fetch and establish its upstream')
    if int(git(root, 'rev-list', '--count', 'HEAD..' + upstream)):
        raise ValueError('Branch is behind/diverged from upstream; integrate before pushing')
    base = base or upstream
    base = git(root, 'rev-parse', '--verify', base + '^{commit}')
    paths = changed_paths(root, base, working=working)
    return {'head': git(root, 'rev-parse', 'HEAD'), 'branch': branch, 'upstream': upstream,
            'base': base, 'paths': paths, 'plan': plan(paths), 'offline': offline, 'working': working,
            'target_branch': branch if first_push else remote_branch, 'first_push': first_push}


def fingerprint(root, *, include_generated=True, generated_folders=None):
    root = Path(root)
    names = git_paths(root, 'ls-files')
    names.update(git_paths(root, 'ls-files', '--others', '--exclude-standard'))
    result = {}
    for name in sorted(names):
        path = root / name
        # Git records a link's destination, not the contents outside this checkout.
        content = (os.fsencode(os.readlink(path)) if path.is_symlink()
                   else path.read_bytes() if path.is_file() else None)
        result[name] = sha256(content).hexdigest() if content is not None else None
    # Browser checks and build operate on ignored derived outputs too.
    folders = (generated_folders if generated_folders is not None
               else ('app/dist', 'app/public/data') if include_generated else ())
    for folder in folders:
        if (root / folder).is_symlink():
            raise ValueError(f'Generated output contains a symlink: {root / folder}')
        for path in sorted((root / folder).rglob('*')):
            if path.is_symlink():
                raise ValueError(f'Generated output contains a symlink: {path}')
            if path.is_file():
                result[path.relative_to(root).as_posix()] = sha256(path.read_bytes()).hexdigest()
    return result


def commands(checks, root):
    pnpm = shutil.which('pnpm')
    if (checks['frontend'] or checks.get('frontend_tests')) and not pnpm:
        raise ValueError('pnpm unavailable')
    rows = []
    if checks['frontend']:
        rows.append(('style', [pnpm, '--dir', 'app', 'check:code']))
    if checks['contracts']:
        rows.append(('contracts', [sys.executable, 'scripts/contract_checks.py', '--profile', checks['contract_profile'],
                                   '--modules', ','.join(checks['contract_modules'])]))
    if checks['launcher'] and os.name == 'nt' and not checks['contracts']:
        rows.append(('launcher', [sys.executable, '-m', 'unittest', 'discover', '-s', 'app', '-p', 'test_launcher.py']))
    if checks['frontend']:
        rows += [('frontend', [pnpm, '--dir', 'app', 'test']), ('build', [pnpm, '--dir', 'app', 'build'])]
    elif checks.get('frontend_tests'):
        rows.append(('frontend', [pnpm, '--dir', 'app', 'test']))
    if checks['browser']:
        mode = [] if checks['matrix'] else ['--release'] if checks['release_browser'] else ['--smoke']
        rows.append(('browser', [sys.executable, 'scripts/verify_atlas.py', *mode]))
    return rows


def check_inputs(root, name):
    # Browser verification reads dist only; public/data is a build input, not a served output.
    if name == 'browser':
        inputs = fingerprint(root, generated_folders=('app/dist',))
    else:
        inputs = fingerprint(root, include_generated=name == 'build')
    if name == 'browser':
        # Delivery provenance is checked separately for the final commit. Its SHA
        # does not change the UI; all served assets and data remain byte-bound.
        inputs.pop('app/dist/delivery.json', None)
    return inputs


def run(root=ROOT, *, base=None, working=False, offline=False, execute=False, full=False):
    root = Path(root).resolve()
    ctx = context(root, base=base, working=working, offline=offline)
    rows = commands(ctx['plan'], root)
    if full:
        for name, command in rows:
            if name == 'contracts':
                command.append('--full')
    if not execute:
        return {**ctx, 'status': 'planned', 'checks': [name for name, _ in rows]}
    runtime = root / '.runtime/preflight'
    runtime.mkdir(parents=True, exist_ok=True)
    environment = {'python': sys.version, 'platform': platform.platform(),
                   'optimize': sys.flags.optimize,
                   'node': subprocess.check_output(['node', '--version'], text=True).strip() if ctx['plan']['frontend'] or ctx['plan'].get('frontend_tests') else '',
                   'pnpm': subprocess.check_output([shutil.which('pnpm'), '--version'], text=True).strip() if ctx['plan']['frontend'] or ctx['plan'].get('frontend_tests') else '',
                   'atlas_environment': {k: v for k, v in os.environ.items() if k.startswith('ATLAS_')}}
    env = dict(os.environ)
    temp = root / '.runtime/test-temp'
    temp.mkdir(parents=True, exist_ok=True)
    env.update(TEMP=str(temp), TMP=str(temp), PYTHONPATH=os.pathsep.join((str(root / 'app'), str(root))))
    results = []
    source_inputs = {key: value for key, value in fingerprint(root).items()
                     if not key.startswith(('app/dist/', 'app/public/data/'))}
    for name, command in rows:
        before = check_inputs(root, name)
        key = {'format': 1, 'environment': environment, 'inputs': before, 'command': command}
        if name == 'build':
            key['head'] = ctx['head']  # delivery.json is bound to the exact commit.
        path = runtime / (name + '.json')
        try:
            saved = json.loads(path.read_bytes())
        except (OSError, ValueError):
            saved = None
        reused = not full and saved == key
        if not reused:
            path.unlink(missing_ok=True)
            subprocess.run(command, cwd=root, env=env, check=True)
            after = check_inputs(root, name)
            # A build may replace derived outputs, never tracked/untracked source inputs.
            changed = {p for p in before.keys() | after.keys() if before.get(p) != after.get(p)}
            if any(not p.startswith(('app/dist/', 'app/public/data/')) for p in changed):
                raise ValueError('Sources changed during checks; rerun from stable inputs')
            key['inputs'] = after
            path.write_text(json.dumps(key, ensure_ascii=False), encoding='utf-8')
        results.append({'check': name, 'reused': reused})
    # A new branch has no upstream: preserve its observed origin base rather
    # than passing the resolved SHA as an upstream name on the second check.
    final = context(root, base=ctx['upstream'] if ctx['first_push'] else ctx['base'],
                    working=working, offline=offline)
    if any(final[k] != ctx[k] for k in ('head', 'branch', 'upstream', 'paths')):
        raise ValueError('Git context changed during checks')
    final_inputs = fingerprint(root)
    if source_inputs != {key: value for key, value in final_inputs.items()
                         if not key.startswith(('app/dist/', 'app/public/data/'))}:
        raise ValueError('Sources changed after checks; rerun before pushing')
    return {**ctx, 'status': 'passed', 'checks': results,
            'ready_to_push': not working and not offline}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base')
    parser.add_argument('--working', action='store_true', help='Prepare checks before commit; not a push authorization')
    parser.add_argument('--offline', action='store_true', help='Preparation only: do not certify remote freshness')
    parser.add_argument('--run', action='store_true')
    parser.add_argument('--full', action='store_true')
    args = parser.parse_args()
    print(json.dumps(run(base=args.base, working=args.working, offline=args.offline, execute=args.run, full=args.full), indent=2))
