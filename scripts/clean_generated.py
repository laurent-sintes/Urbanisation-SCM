"""Bounded cleanup of reproducible benchmark exports and old build copies.

Review dossiers, publication preparations, served data and parsing caches are
deliberately outside the allowlist. No arbitrary directory argument is accepted.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import time

try:
    from .atlas_lock import atlas_lock
except ImportError:
    from atlas_lock import atlas_lock

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = ('.runtime/atlas-benchmarks', '.runtime/atlas-perf-before')
BUILD_COPIES = ('app/.runtime/qa-dist', 'app/.runtime/qa-hotspot-build',
                'app/.runtime/quick-build', 'app/.runtime/build-final', 'app/.runtime/build-clean')


def generated_build_file(relative):
    name = relative.as_posix()
    if name in {'index.html', 'delivery.json', 'icon.svg', 'manifest.webmanifest', 'data/index.json', 'data/data/index.json'}:
        return True
    if len(relative.parts) == 2 and relative.parts[0] == 'assets':
        return relative.suffix in {'.js', '.css', '.map', '.svg', '.png', '.jpg', '.woff', '.woff2'}
    # An older QA copy accidentally nested the generated data directory twice.
    return bool(re.fullmatch(r'data/(?:data/)?\d{4}-\d{2}-\d{2}\.[1-9]\d*/(?:model\.(?:json|yaml)|guide\.json|documents/[A-Za-z0-9_-]+\.pdf)', name))


def checked(root, path):
    if not path.is_relative_to(root):
        raise ValueError('Cleanup path escapes workspace')
    for candidate in (path, *path.parents):
        if candidate == root:
            break
        if candidate.is_symlink() or candidate.is_junction():
            raise ValueError('Cleanup refuses links and junctions: ' + str(candidate))
    if path.resolve() != path:
        raise ValueError('Cleanup path is redirected')
    return path


def inventory(root, folder, *, build_root=None):
    files = []
    checked(root, folder)
    for path in folder.iterdir():
        checked(root, path)
        if path.is_dir():
            files.extend(inventory(root, path, build_root=build_root))
        elif path.is_file():
            if build_root is not None:
                if not generated_build_file(path.relative_to(build_root)):
                    raise ValueError('Unexpected build content; preserve directory: ' + str(path))
            elif path.suffix not in ('.json', '.prof') and not (
                    path.name == 'model.yaml' and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', path.parent.name)) and not (
                    path.suffix == '.pdf' and path.parent.name == 'documents'
                    and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', path.parent.parent.name)
                    and re.fullmatch(r'[A-Za-z0-9_-]+\.pdf', path.name)):
                raise ValueError('Unexpected benchmark content; preserve directory: ' + str(path))
            files.append(path)
        else:
            raise ValueError('Unsupported cleanup entry: ' + str(path))
    return files


def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def plan(root, min_age_days=7, now=None, *, build_copies=False, max_benchmark_runs=None):
    root = Path(root).resolve()
    if not math.isfinite(min_age_days) or min_age_days < 0:
        raise ValueError('Age must be a finite non-negative number')
    if max_benchmark_runs is not None and (not isinstance(max_benchmark_runs, int) or max_benchmark_runs < 1):
        raise ValueError('Keep at least one benchmark run')
    cutoff = (time.time() if now is None else now) - min_age_days * 86400
    result = []
    for relative in (*ALLOWED, *(BUILD_COPIES if build_copies else ())):
        folder = checked(root, root / relative)
        if not folder.exists():
            continue
        # A benchmark run is one unit: do not prune individual files within it.
        units = list(folder.iterdir()) if relative.endswith('atlas-benchmarks') else [folder]
        for unit in units:
            checked(root, unit)
            if not unit.is_dir():
                raise ValueError('Unexpected benchmark entry: ' + str(unit))
        keep = set()
        if relative.endswith('atlas-benchmarks') and max_benchmark_runs is not None:
            keep = set(sorted(units, key=lambda path: path.stat().st_mtime, reverse=True)[:max_benchmark_runs])
        for unit in units:
            if unit in keep:
                continue
            build = relative in BUILD_COPIES
            if build and not ((unit / 'index.html').is_file() and (unit / 'data/index.json').is_file()):
                raise ValueError('Incomplete build copy; preserve directory: ' + str(unit))
            files = inventory(root, unit, build_root=unit if build else None)
            if max([unit.stat().st_mtime, *(p.stat().st_mtime for p in files)]) > cutoff:
                continue
            result.append({'path': unit.relative_to(root).as_posix(),
                           'files': {p.relative_to(root).as_posix(): {
                               'bytes': p.stat().st_size, 'sha256': fingerprint(p)} for p in files}})
    return result


def apply_plan(root, selected):
    root = Path(root).resolve()
    # Reject caller-supplied paths outside the hard allowlist before any mutation.
    for entry in selected:
        name = entry['path']
        if name not in (ALLOWED[1], *BUILD_COPIES) and not (name.startswith(ALLOWED[0] + '/')
                and len(Path(name).parts) == 3):
            raise ValueError('Cleanup target is not allowlisted')
        folder = checked(root, root / name)
        actual = {p.relative_to(root).as_posix(): {'bytes': p.stat().st_size,
                   'sha256': fingerprint(p)} for p in inventory(root, folder, build_root=folder if name in BUILD_COPIES else None)}
        if actual != entry['files']:
            raise ValueError('Benchmark changed since cleanup plan')
    removed = 0
    for entry in selected:
        folder = checked(root, root / entry['path'])
        for name, expected in entry['files'].items():
            path = checked(root, root / name)
            if fingerprint(path) != expected['sha256']:
                raise ValueError('Benchmark changed during cleanup')
            path.unlink()
            removed += expected['bytes']
        # Paths are bounded and checked; never recursively remove unknown content.
        for directory in sorted((p for p in folder.rglob('*') if p.is_dir()),
                                key=lambda p: len(p.parts), reverse=True):
            checked(root, directory).rmdir()
        folder.rmdir()
    return removed


def clean(root=ROOT, min_age_days=7, apply=False, *, build_copies=False, max_benchmark_runs=None):
    with atlas_lock(root):
        selected = plan(root, min_age_days, build_copies=build_copies, max_benchmark_runs=max_benchmark_runs)
        total = sum(f['bytes'] for entry in selected for f in entry['files'].values())
        removed = apply_plan(root, selected) if apply else 0
        return {'mode': 'applied' if apply else 'dry_run', 'candidate_bytes': total,
                'removed_bytes': removed, 'directories': [e['path'] for e in selected],
                'protected': ['review dossiers', 'publication preparations', 'served data', 'parsing caches', 'active build staging']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--min-age-days', type=float, default=7)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--build-copies', action='store_true', help='Include the five explicitly named obsolete build copies')
    parser.add_argument('--max-benchmark-runs', type=int, help='Always retain this many newest benchmark runs')
    args = parser.parse_args()
    print(json.dumps(clean(min_age_days=args.min_age_days, apply=args.apply, build_copies=args.build_copies,
                           max_benchmark_runs=args.max_benchmark_runs), indent=2))
