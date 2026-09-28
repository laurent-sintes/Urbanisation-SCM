"""Verify the exact built artifact after deployment; no model mutation or release."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import time
from urllib.request import Request, urlopen
from urllib.parse import urljoin


def digest(payload):
    return hashlib.sha256(payload).hexdigest()


def manifest(dist, commit):
    dist = Path(dist)
    index = json.loads((dist / 'data/index.json').read_bytes())
    version = index['current_version']
    paths = [dist / 'index.html', dist / 'data/index.json',
             dist / f'data/{version}/model.json', dist / f'data/{version}/guide.json']
    paths += sorted(p for p in (dist / 'assets').rglob('*') if p.is_file())
    return {'schema_version': 1, 'commit': commit, 'current_version': version,
            'files': {p.relative_to(dist).as_posix(): digest(p.read_bytes()) for p in paths}}


def write_manifest(root, dist=None):
    root = Path(root)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    dist = Path(dist) if dist is not None else root / 'app/dist'
    result = manifest(dist, commit)
    (dist / 'delivery.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    return result


def verify(expected, fetch):
    """Compare served bytes with a trusted manifest from the build job."""
    if expected.get('schema_version') != 1 or not expected.get('files'):
        raise ValueError('Invalid delivery manifest')
    required = {'index.html', 'data/index.json',
                f'data/{expected["current_version"]}/model.json',
                f'data/{expected["current_version"]}/guide.json'}
    if not required <= expected['files'].keys():
        raise ValueError('Incomplete delivery manifest')
    for name, fingerprint in expected['files'].items():
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or ':' in name:
            raise ValueError('Invalid artifact path')
        if digest(fetch(name)) != fingerprint:
            raise ValueError(f'Deployed content differs from the verified build: {name}')
    return {'status': 'verified', 'commit': expected['commit'],
            'current_version': expected['current_version'], 'files': len(expected['files'])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--url', required=True)
    parser.add_argument('--attempts', type=int, default=1)
    args = parser.parse_args()
    expected = json.loads(args.manifest.read_text(encoding='utf-8'))
    base = args.url.rstrip('/') + '/'
    def fetch(name):
        request = Request(urljoin(base, name) + '?atlas_delivery=' + expected['commit'], headers={'Cache-Control': 'no-cache'})
        with urlopen(request, timeout=20) as response:
            return response.read()
    for attempt in range(max(1, args.attempts)):
        try:
            print(json.dumps(verify(expected, fetch)))
            return
        except (OSError, ValueError):
            if attempt + 1 >= args.attempts:
                raise
            time.sleep(10)


if __name__ == '__main__':
    main()
