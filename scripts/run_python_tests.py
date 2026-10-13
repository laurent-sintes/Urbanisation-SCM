"""Run isolated test modules and reuse only results tied to identical source bytes."""
import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
import platform
import subprocess
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.preflight_push import fingerprint

# These tests use isolated fixtures or code/workflow contracts. A backlog edit
# cannot affect their assertions. Every other module retains the full input
# stamp until its data dependencies are explicitly reviewed.
BACKLOG_INDEPENDENT = frozenset({
    'test_check_policy', 'test_clean_generated', 'test_git_batch',
    'test_preflight_push', 'test_python_check_receipts',
})


def module_inputs(inputs, name):
    if name in BACKLOG_INDEPENDENT:
        return {path: digest for path, digest in inputs.items() if not path.startswith('modeles/backlog/')}
    return inputs


def run(root=ROOT, *, directory='scripts', full=False, modules=None):
    root = Path(root).resolve()
    names = sorted(p.stem for p in (root / directory).glob('test_*.py'))
    if modules:
        if not set(modules).issubset(names):
            raise ValueError('Unknown test module')
        names = [name for name in names if name in modules]
    if not names:
        raise ValueError('No test modules found')
    inputs = fingerprint(root, include_generated=False)
    runtime = {'python': sys.version, 'optimize': sys.flags.optimize, 'platform': platform.platform(),
               'atlas': {key: value for key, value in os.environ.items() if key.startswith('ATLAS_')}}
    full_scope_stamp = sha256(json.dumps({'inputs': inputs, 'runtime': runtime}, sort_keys=True).encode()).hexdigest()
    output = root / '.runtime/python-checks'
    output.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    temporary = root / '.runtime/test-temp'
    temporary.mkdir(parents=True, exist_ok=True)
    env.update(TEMP=str(temporary), TMP=str(temporary), PYTHONIOENCODING='utf-8',
               PYTHONPATH=os.pathsep.join((str(root / 'app'), str(root))))
    rows = []
    for name in names:
        started = perf_counter()
        scope = sha256(json.dumps({'inputs': module_inputs(inputs, name), 'runtime': runtime}, sort_keys=True).encode()).hexdigest()
        receipt = output / (directory + '-' + name + '.json')
        # Preserve discovery's import path: some existing tests import sibling modules.
        command = [sys.executable, '-m', 'unittest', 'discover', '-s', directory, '-p', name + '.py']
        key = {'format': 1, 'scope': scope, 'command': command, 'status': 'passed'}
        try:
            saved = json.loads(receipt.read_bytes())
        except (OSError, ValueError):
            saved = None
        reused = not full and saved == key
        if not reused:
            receipt.unlink(missing_ok=True)
            log_path = output / (directory + '-' + name + '.log')
            with log_path.open('w', encoding='utf-8') as log:
                result = subprocess.run(command, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT)
            if result.returncode:
                print(log_path.read_text(encoding='utf-8', errors='replace')[-12000:], flush=True)
                rows.append({'module': name, 'status': 'failed', 'log': str(log_path),
                             'seconds': round(perf_counter() - started, 3)})
                continue
            # Each module is an independent process; its successful result is reusable.
            receipt.write_text(json.dumps(key), encoding='utf-8')
        rows.append({'module': name, 'status': 'passed', 'reused': reused,
                     'seconds': round(perf_counter() - started, 3)})
        print(json.dumps(rows[-1]), flush=True)
    if fingerprint(root, include_generated=False) != inputs:
        # None of this run's results can be reused under the changed input stamp.
        raise ValueError('Sources changed during Python checks')
    result = {'status': 'passed' if all(row['status'] == 'passed' for row in rows) else 'failed',
              'modules': rows, 'full_scope': not bool(modules), 'scope': full_scope_stamp}
    (output / (directory + '-report.json')).write_text(json.dumps(result, indent=2), encoding='utf-8')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', choices=('scripts', 'app'), default='scripts')
    parser.add_argument('--module', action='append')
    parser.add_argument('--full', action='store_true')
    args = parser.parse_args()
    raise SystemExit(run(directory=args.directory, full=args.full, modules=args.module)['status'] != 'passed')
