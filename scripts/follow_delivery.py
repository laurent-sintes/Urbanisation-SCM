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
TARGETS = {
    'personal': {'repo': REPO, 'remote': 'origin', 'host': 'github.com', 'url': URL},
    'beaumanoir': {'repo': 'beaumanoir.ghe.com/solution-ai/Urbanisation-SCM',
                   'remote': 'beaumanoir', 'host': 'beaumanoir.ghe.com',
                   'url': 'https://solution-ai-urbanisation-scm.pages.beaumanoir.ghe.com/'},
}


def gh(*args, target='personal'):
    return subprocess.check_output(['gh', *args, '--repo', TARGETS[target]['repo']], cwd=ROOT, text=True)


def enterprise_api(path):
    return json.loads(subprocess.check_output(
        ['gh', 'api', '--hostname', TARGETS['beaumanoir']['host'], path], cwd=ROOT, text=True))


def verify_private_deployment(commit, expected, api=enterprise_api):
    """Bind the private Pages deployment to the commit and its trusted build artifact.

    Private Beaumanoir Pages require a browser SSO session. Never compare the login
    response with site bytes or silently describe this API proof as an HTTP check.
    """
    if expected.get('commit') != commit or not expected.get('current_version') or not expected.get('files'):
        raise ValueError('Private delivery artifact belongs to another commit or is incomplete')
    version = expected['current_version']
    required = {'index.html', 'data/index.json', f'data/{version}/model.json',
                f'data/{version}/model.yaml', f'data/{version}/guide.json'}
    if not required <= expected['files'].keys():
        raise ValueError('Private delivery artifact is incomplete')
    prefix = 'repos/solution-ai/Urbanisation-SCM'
    page = api(prefix + '/pages')
    url = TARGETS['beaumanoir']['url']
    if page.get('public') is not False or page.get('build_type') != 'workflow' or page.get('html_url', '').rstrip('/') != url.rstrip('/'):
        raise ValueError('Unexpected private Pages configuration')
    deployments = api(prefix + '/deployments?sha=' + commit + '&environment=github-pages')
    if not deployments or deployments[0].get('sha') != commit or deployments[0].get('environment') != 'github-pages':
        raise ValueError('No private Pages deployment for this commit')
    statuses = api(prefix + '/deployments/' + str(int(deployments[0]['id'])) + '/statuses')
    if not statuses or statuses[0].get('state') != 'success' or statuses[0].get('environment_url', '').rstrip('/') != url.rstrip('/'):
        raise ValueError('Private Pages deployment is not successful at the expected URL')
    return {'status': 'verified', 'commit': commit, 'version': expected['current_version'],
            'url': url, 'verification': 'authenticated_deployment_api_and_build_artifact',
            'http_content_check': 'not_performed_sso_protected'}


def follow(commit, *, timeout=1800, deploy=False, target='personal'):
    destination = TARGETS[target]
    deadline = time.monotonic() + timeout
    run = None
    while time.monotonic() < deadline:
        rows = json.loads(gh('run', 'list', '--workflow', 'atlas-pages.yml', '--commit', commit,
                             '--json', 'databaseId,headSha,status,conclusion,event', target=target))
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
    remote = subprocess.check_output(['git', 'ls-remote', destination['remote'], 'refs/heads/main'], cwd=ROOT, text=True).split()[0]
    if remote != commit:
        return {'status': 'superseded', 'commit': commit, 'remote_commit': remote}
    jobs = json.loads(gh('run', 'view', str(run['databaseId']), '--json', 'jobs', target=target))['jobs']
    build = next((job for job in jobs if job['name'] == 'build'), None)
    if build and build['conclusion'] == 'skipped':
        return {'status': 'validated_only', 'commit': commit, 'run': run['databaseId'],
                'url': destination['url'], 'reason': 'No Atlas build or deployment required for these changes'}
    if not any(job['name'] == 'deploy' and job['conclusion'] == 'success' for job in jobs):
        return {'status': 'deployment_not_started', 'commit': commit, 'run': run['databaseId']}
    folder = ROOT / '.runtime/delivery' / target / str(run['databaseId']) / uuid.uuid4().hex
    folder.mkdir(parents=True, exist_ok=True)
    gh('run', 'download', str(run['databaseId']), '--name', 'atlas-delivery-manifest', '--dir', str(folder), target=target)
    expected = json.loads((folder / 'delivery.json').read_bytes())
    if expected['commit'] != commit:
        raise ValueError('Delivery artifact belongs to another commit')
    if target == 'beaumanoir':
        return verify_private_deployment(commit, expected)
    subprocess.run([sys.executable, 'scripts/atlas_delivery.py', '--manifest', str(folder / 'delivery.json'),
                    '--url', URL, '--attempts', '6'], cwd=ROOT, check=True)
    return {'status': 'verified', 'commit': commit, 'version': expected['current_version'], 'url': URL}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', default=None)
    parser.add_argument('--timeout', type=int, default=1800)
    parser.add_argument('--deploy', action='store_true')
    parser.add_argument('--target', choices=TARGETS, default='personal')
    args = parser.parse_args()
    commit = args.commit or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    result = follow(commit, timeout=args.timeout, deploy=args.deploy, target=args.target)
    print(json.dumps(result))
    raise SystemExit(result['status'] not in ('checks_passed', 'validated_only', 'verified'))
