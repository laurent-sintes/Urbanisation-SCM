"""Measure real publication export without touching Atlas, backlog or releases.

Example: python scripts/benchmark_atlas_export.py --runs 2 --compare .runtime/atlas-perf-before
All output is disposable under .runtime unless an explicit directory is supplied.
"""
import argparse
import cProfile
from hashlib import sha256
import json
from pathlib import Path
import sys
from time import perf_counter
import uuid

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.export_atlas import export_atlas
from scripts.clean_generated import clean


def fingerprints(folder):
    return {p.relative_to(folder).as_posix(): sha256(p.read_bytes()).hexdigest()
            for p in sorted(folder.rglob('*.json'))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runs', type=int, default=1, choices=range(1, 6))
    parser.add_argument('--output', type=Path, default=ROOT / '.runtime/atlas-benchmarks')
    parser.add_argument('--compare', type=Path, help='Previous exported data directory to compare byte for byte')
    parser.add_argument('--profile', action='store_true', help='Save cProfile data for each run; adds measurement overhead')
    args = parser.parse_args()
    folder = args.output / uuid.uuid4().hex
    folder.mkdir(parents=True)
    baseline = fingerprints(args.compare) if args.compare else None
    if args.compare and not baseline:
        raise ValueError('Comparison directory has no exported JSON files')
    results = []
    for number in range(1, args.runs + 1):
        destination = folder / f'run-{number}'
        profiler = cProfile.Profile() if args.profile else None
        started = perf_counter()
        if profiler:
            profiler.enable()
        try:
            result = export_atlas(ROOT, [destination])
        finally:
            if profiler:
                profiler.disable()
                profiler.dump_stats(folder / f'run-{number}.prof')
        result['wall_seconds'] = round(perf_counter() - started, 4)
        actual = fingerprints(destination)
        if baseline is not None:
            differences = sorted(k for k in actual.keys() | baseline.keys() if actual.get(k) != baseline.get(k))
            if differences:
                raise ValueError('Export differs from baseline: ' + ', '.join(differences))
            result['identical_files'] = len(actual)
        results.append(result)
        print(json.dumps(result, ensure_ascii=False), flush=True)
    report = {'schema_version': 1, 'python': sys.version, 'profiled': args.profile,
              'comparison': str(args.compare) if args.compare else None, 'runs': results}
    (folder / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'report': str(folder / 'report.json')}))
    # Only known regenerable exports, after a successful run and comparison.
    if args.output.resolve() == (ROOT / '.runtime/atlas-benchmarks').resolve():
        print(json.dumps({'retention': clean(ROOT, min_age_days=7, apply=True)}))


if __name__ == '__main__':
    main()
