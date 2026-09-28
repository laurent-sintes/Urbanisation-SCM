"""Bounded cleanup of reproducible benchmark exports; dry run by default.

Review dossiers, publication preparations, served data and parsing caches are
deliberately outside the allowlist. No arbitrary directory argument is accepted.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import time

try:
    from .atlas_lock import atlas_lock
except ImportError:
    from atlas_lock import atlas_lock

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = ('.runtime/atlas-benchmarks', '.runtime/atlas-perf-before')


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


def inventory(root, folder):
    files = []
    checked(root, folder)
    for path in folder.iterdir():
        checked(root, path)
        if path.is_dir():
            files.extend(inventory(root, path))
        elif path.is_file():
            if path.suffix not in ('.json', '.prof'):
                raise ValueError('Unexpected benchmark content; preserve directory: ' + str(path))
            files.append(path)
        else:
            raise ValueError('Unsupported cleanup entry: ' + str(path))
    return files


def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def plan(root, min_age_days=7, now=None):
    root = Path(root).resolve()
    if not math.isfinite(min_age_days) or min_age_days < 0:
        raise ValueError('Age must be a finite non-negative number')
    cutoff = (time.time() if now is None else now) - min_age_days * 86400
    result = []
    for relative in ALLOWED:
        folder = checked(root, root / relative)
        if not folder.exists():
            continue
        # A benchmark run is one unit: do not prune individual files within it.
        units = list(folder.iterdir()) if relative.endswith('atlas-benchmarks') else [folder]
        for unit in units:
            checked(root, unit)
            if not unit.is_dir():
                raise ValueError('Unexpected benchmark entry: ' + str(unit))
            files = inventory(root, unit)
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
        if name != ALLOWED[1] and not (name.startswith(ALLOWED[0] + '/')
                and len(Path(name).parts) == 3):
            raise ValueError('Cleanup target is not allowlisted')
        folder = checked(root, root / name)
        actual = {p.relative_to(root).as_posix(): {'bytes': p.stat().st_size,
                   'sha256': fingerprint(p)} for p in inventory(root, folder)}
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


def clean(root=ROOT, min_age_days=7, apply=False):
    with atlas_lock(root):
        selected = plan(root, min_age_days)
        total = sum(f['bytes'] for entry in selected for f in entry['files'].values())
        removed = apply_plan(root, selected) if apply else 0
        return {'mode': 'applied' if apply else 'dry_run', 'candidate_bytes': total,
                'removed_bytes': removed, 'directories': [e['path'] for e in selected],
                'protected': ['review dossiers', 'publication preparations', 'served data', 'parsing caches']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--min-age-days', type=float, default=7)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    print(json.dumps(clean(min_age_days=args.min_age_days, apply=args.apply), indent=2))
