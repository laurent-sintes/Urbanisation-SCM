"""Follow the exact GitHub commit and verify served bytes against its trusted artifact."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

REPO = 'laurent-sintes/Urbanisation-SCM'
URL = 'https://laurent-sintes.github.io/Urbanisation-SCM/'


def gh(*args):
    return subprocess.check_output(['gh', *args, '--repo', REPO], cwd=ROOT, text=True)


def follow(commit, *, timeout=1800, deploy=False):
    deadline = time.monotonic() + timeout
    run = None
    while time.monotonic() < deadline:
        rows = json.loads(gh('run', 'list', '--workflow', 'atlas-pages.yml', '--commit', commit,
                             '--json', 'databaseId,headSha,status,conclusion,event'))
        rows = [row for row in rows if row['headSha'] == commit and (not deploy or row['event'] != 'pull_request')]
        if rows:
            run = rows[0]
            if run['status'] == 'completed':
                break
        time.sleep(10)
    if run is None:
        return {'status': 'workflow_not_started', 'commit': commit}
    if run['status'] != 'completed':
        return {'status': 'pending', 'commit': commit, 'run': run['databaseId']}
    if run['conclusion'] != 'success':
        return {'status': 'checks_failed', 'commit': commit, 'run': run['databaseId'], 'conclusion': run['conclusion']}
    if not deploy:
        return {'status': 'checks_passed', 'commit': commit, 'run': run['databaseId']}
    remote = subprocess.check_output(['git', 'ls-remote', 'origin', 'refs/heads/main'], cwd=ROOT, text=True).split()[0]
    if remote != commit:
        return {'status': 'superseded', 'commit': commit, 'remote_commit': remote}
    jobs = json.loads(gh('run', 'view', str(run['databaseId']), '--json', 'jobs'))['jobs']
    if not any(job['name'] == 'deploy' and job['conclusion'] == 'success' for job in jobs):
        return {'status': 'deployment_not_started', 'commit': commit, 'run': run['databaseId']}
    folder = ROOT / '.runtime/delivery' / str(run['databaseId']) / uuid.uuid4().hex
    folder.mkdir(parents=True, exist_ok=True)
    gh('run', 'download', str(run['databaseId']), '--name', 'atlas-delivery-manifest', '--dir', str(folder))
    expected = json.loads((folder / 'delivery.json').read_bytes())
    if expected['commit'] != commit:
        raise ValueError('Delivery artifact belongs to another commit')
    subprocess.run([sys.executable, 'scripts/atlas_delivery.py', '--manifest', str(folder / 'delivery.json'),
                    '--url', URL, '--attempts', '6'], cwd=ROOT, check=True)
    return {'status': 'verified', 'commit': commit, 'version': expected['current_version'], 'url': URL}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', default=None)
    parser.add_argument('--timeout', type=int, default=1800)
    parser.add_argument('--deploy', action='store_true')
    args = parser.parse_args()
    commit = args.commit or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    result = follow(commit, timeout=args.timeout, deploy=args.deploy)
    print(json.dumps(result))
    raise SystemExit(result['status'] not in ('checks_passed', 'verified'))
