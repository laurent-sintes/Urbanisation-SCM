"""Serialize the complete static build with local publication and export."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

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


def main():
    pnpm = shutil.which('pnpm')
    if not pnpm:
        raise ValueError('pnpm is required to build Atlas')
    with atlas_lock(ROOT):
        # A failed type check must not update the data served by the old build.
        subprocess.run([pnpm, 'exec', 'tsc', '--noEmit'], cwd=ROOT / 'app', check=True)
        export_atlas(ROOT, [ROOT / 'app/public/data'])
        runtime = ROOT / 'app/.runtime'
        runtime.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='build-', dir=runtime) as temporary:
            stage = Path(temporary).resolve()
            if stage.parent != runtime.resolve():
                raise ValueError('Build staging must stay inside app/.runtime')
            subprocess.run([pnpm, 'exec', 'vite', 'build', '--outDir', str(stage), '--emptyOutDir'], cwd=ROOT / 'app', check=True)
            write_manifest(ROOT, stage)
            promote_build(stage, ROOT / 'app/dist')


if __name__ == '__main__':
    main()
