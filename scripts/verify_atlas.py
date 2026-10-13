"""Run independent Atlas recipes in bounded parallel groups, retaining every case."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import shutil
import subprocess
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
GROUPS = {
    'navigation': ['verify-browser.mjs', 'verify-ux.mjs', 'verify-hotspot-detail.mjs'],
    'structure': ['verify-map-history.mjs', 'verify-map-placement.mjs', 'verify-static.mjs', 'verify-display-codes.mjs'],
    'content': ['verify-modeling-guide.mjs', 'verify-published-content.mjs', 'verify-process-management.mjs'],
    'hotspots': ['verify-hotspots.mjs', 'verify-hotspot-clusters.mjs', 'verify-hotspot-depths.mjs',
                 'verify-hotspot-audit.mjs', 'verify-hotspot-visibility.mjs', 'verify-hotspot-resolution.mjs'],
    'matrix-0': ['verify-map-hotspot-matrix.mjs --shard=0/3'],
    'matrix-1': ['verify-map-hotspot-matrix.mjs --shard=1/3'],
    'matrix-2': ['verify-map-hotspot-matrix.mjs --shard=2/3'],
}
SMOKE = {
    'navigation': ['verify-browser.mjs'],
    'structure': ['verify-display-codes.mjs'],
    'content': ['verify-published-content.mjs'],
}
RELEASE = {
    **SMOKE,
    'placement': ['verify-map-placement.mjs'],
    'hotspot': ['verify-hotspots.mjs'],
}


def verify(root=ROOT, *, workers=3, groups=None, smoke=False, release=False):
    root = Path(root).resolve()
    node = shutil.which('node')
    if not node:
        raise ValueError('Node is required for browser verification')
    selected = RELEASE if release else SMOKE if smoke else {key: GROUPS[key] for key in (groups or GROUPS)}
    output = root / 'app/.runtime/qa-parallel'
    output.mkdir(parents=True, exist_ok=True)
    def run_group(name, scripts):
        started = perf_counter()
        for script in scripts:
            log_path = output / (name + '-' + script.split()[0] + '.log')
            with log_path.open('w', encoding='utf-8') as log:
                result = subprocess.run([node, *script.split()], cwd=root / 'app', stdout=log, stderr=subprocess.STDOUT)
            if result.returncode:
                print(log_path.read_text(encoding='utf-8')[-6000:], flush=True)
                return {'group': name, 'status': 'failed', 'script': script,
                        'log': str(log_path), 'seconds': round(perf_counter() - started, 3)}
        return {'group': name, 'status': 'passed', 'scripts': scripts, 'seconds': round(perf_counter() - started, 3)}
    rows = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(run_group, name, scripts) for name, scripts in selected.items()]
        for future in as_completed(futures):
            row = future.result()
            rows.append(row)
            print(json.dumps(row), flush=True)
    result = {'status': 'passed' if all(row['status'] == 'passed' for row in rows) else 'failed', 'groups': rows}
    if result['status'] == 'passed' and all(f'matrix-{i}' in selected for i in range(3)):
        cases = []
        for i in range(3):
            report = json.loads((root / f'app/.runtime/qa-map-hotspot-matrix/shard-{i}-3/report.json').read_bytes())
            cases.extend(report['cases'])
            if i == 0 and len(report.get('navigation', [])) != 2:
                raise ValueError('Matrix navigation journeys were not checked')
        signatures = [json.dumps({k: case[k] for k in ('width', 'scope', 'detail', 'mode', 'profile', 'fullscreen')}, sort_keys=True) for case in cases]
        if len(cases) != 660 or len(set(signatures)) != len(cases):
            raise ValueError('Matrix partition lost or duplicated cases')
        result['matrix_cases'] = len(cases)
    (output / 'report.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workers', type=int, choices=range(1, 6), default=3)
    parser.add_argument('--group', action='append', choices=GROUPS)
    parser.add_argument('--smoke', action='store_true', help='Short browser and publication check')
    parser.add_argument('--release', action='store_true', help='Smoke plus representative placement and hotspots')
    args = parser.parse_args()
    if sum((args.smoke, args.release, bool(args.group))) > 1:
        parser.error('--smoke, --release and --group are mutually exclusive')
    raise SystemExit(verify(workers=args.workers, groups=args.group, smoke=args.smoke, release=args.release)['status'] != 'passed')
