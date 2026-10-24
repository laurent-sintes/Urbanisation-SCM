"""Serialize the complete static build with local publication and export."""
from pathlib import Path
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from time import perf_counter, time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.atlas_lock import atlas_lock
from scripts.export_atlas import export_atlas, atomic_write
from scripts.atlas_delivery import write_manifest


def promote_build(stage, destination):
    """Keep the served entry point until the new build is complete.

    Retain hashed assets for open tabs that have not loaded their lazy chunks.
    JSON is separately activated by its catalog, then HTML switches last.
    """
    stage, destination = Path(stage), Path(destination)
    for name in ('index.html', 'data/index.json', 'delivery.json'):
        if not (stage / name).is_file():
            raise ValueError(f'Incomplete Atlas build: {name}')
    deferred = {'index.html', 'data/index.json', 'delivery.json'}
    for path in sorted(p for p in stage.rglob('*') if p.is_file()):
        relative = path.relative_to(stage)
        if relative.as_posix() not in deferred:
            atomic_write(destination / relative, path.read_bytes())
    for name in ('data/index.json', 'delivery.json', 'index.html'):
        atomic_write(destination / name, (stage / name).read_bytes())


def prune_old_assets(stage, destination, *, grace_days=14, now=None):
    """Retire les anciens chunks Vite après une période pour les onglets ouverts."""
    stage_assets = Path(stage) / 'assets'
    live_assets = Path(destination) / 'assets'
    if not live_assets.exists():
        return 0
    if live_assets.is_symlink() or live_assets.is_junction():
        raise ValueError('Asset directory is redirected')
    active = {path.name for path in stage_assets.iterdir() if path.is_file()} if stage_assets.exists() else set()
    cutoff = (time() if now is None else now) - grace_days * 86400
    removed = 0
    for path in live_assets.iterdir():
        if path.is_symlink() or path.is_junction():
            raise ValueError('Asset directory contains a redirected entry')
        if not path.is_file() or path.name in active:
            continue
        if not re.fullmatch(r'.+-[A-Za-z0-9_-]{8}\.(?:js|css|map)', path.name):
            continue
        if path.stat().st_mtime > cutoff:
            continue
        path.unlink()
        removed += 1
    return removed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--frontend', action='store_true', help='Use verified existing data; refuse to regenerate models')
    parser.add_argument('--full-export', action='store_true', help='Explicitly rebuild historical export metadata')
    args = parser.parse_args()
    if args.frontend and args.full_export:
        parser.error('--frontend and --full-export are mutually exclusive')
    started = perf_counter()
    pnpm = shutil.which('pnpm')
    if not pnpm:
        raise ValueError('pnpm is required to build Atlas')
    with atlas_lock(ROOT):
        subprocess.run([pnpm, 'run', 'check:labels'], cwd=ROOT / 'app', check=True)
        # A failed type check must not update the data served by the old build.
        subprocess.run([pnpm, 'exec', 'tsc', '--noEmit'], cwd=ROOT / 'app', check=True)
        print('Atlas: checking published data', flush=True)
        exported = export_atlas(ROOT, [] if args.frontend else [ROOT / 'app/public/data'],
                                incremental=not args.full_export, require_cached=args.frontend)
        print(json.dumps({'export': exported}), flush=True)
        runtime = ROOT / 'app/.runtime'
        runtime.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='build-', dir=runtime) as temporary:
            stage = Path(temporary).resolve()
            if stage.parent != runtime.resolve():
                raise ValueError('Build staging must stay inside app/.runtime')
            # Avoid Vite copying hundreds of MB of unchanged historical data.
            # Hard links are confined to the disposable build stage and never edited.
            subprocess.run([pnpm, 'exec', 'vite', 'build', '--mode', 'atlas-stage', '--outDir', str(stage), '--emptyOutDir'], cwd=ROOT / 'app', check=True)
            def stage_copy(source, destination):
                try:
                    os.link(source, destination)
                except OSError:
                    shutil.copy2(source, destination)
                return destination
            shutil.copytree(ROOT / 'app/public', stage, dirs_exist_ok=True, copy_function=stage_copy)
            write_manifest(ROOT, stage)
            promote_build(stage, ROOT / 'app/dist')
            print(json.dumps({'old_assets_removed': prune_old_assets(stage, ROOT / 'app/dist')}), flush=True)
    print(json.dumps({'build_seconds': round(perf_counter() - started, 4)}), flush=True)


if __name__ == '__main__':
    main()
