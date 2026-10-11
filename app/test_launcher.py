"""Exercise the real Windows launcher in a disposable repository, never port 8765."""
import json
import hashlib
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import unittest
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(os.name == 'nt', 'Windows PowerShell launcher')
class LauncherTests(unittest.TestCase):
    def test_lifecycle_and_stop_identity_guards(self):
        with tempfile.TemporaryDirectory(prefix='atlas-launcher-') as directory:
            root = Path(directory).resolve()
            (root / 'app/dist/data').mkdir(parents=True)
            (root / 'app/dist/index.html').write_bytes(b'<!doctype html><title>Test</title>')
            version = '2026-10-10.1'
            model = json.dumps({'space': 'release', 'version': version, 'nodes': [],
                                'hotspot_catalog': {'schema_version': 1, 'source_refs': [], 'hotspots': []}}).encode()
            (root / 'app/dist/data' / version).mkdir()
            (root / 'app/dist/data' / version / 'model.json').write_bytes(model)
            (root / 'app/dist/data/index.json').write_text(json.dumps({
                'current_version': version,
                'versions': [{'version': version, 'model_sha256': hashlib.sha256(model).hexdigest()}],
            }))
            shutil.copy2(ROOT / 'Lancer-FLOW-Atlas.ps1', root)
            shutil.copy2(ROOT / 'app/server.py', root / 'app')
            (root / 'scripts').mkdir()
            for dependency in ('atlas_lock.py', 'atlas_workshop.py', 'hotspot_catalog.py'):
                shutil.copy2(ROOT / 'scripts' / dependency, root / 'scripts')
            with socket.socket() as reservation:
                reservation.bind(('127.0.0.1', 0))
                port = reservation.getsockname()[1]
            env = dict(os.environ, PATH=str(Path(sys.executable).parent) + os.pathsep + os.environ['PATH'])
            command = ['powershell.exe', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                       '-File', str(root / 'Lancer-FLOW-Atlas.ps1'), '-Port', str(port), '-NoBrowser']
            def launch(*extra):
                # Start-Process can retain inherited pipe handles after PowerShell exits.
                # Files allow waiting for the launcher itself, not its background server.
                with tempfile.TemporaryFile() as output:
                    result = subprocess.run(command + list(extra), env=env, stdin=subprocess.DEVNULL,
                                            stdout=output, stderr=output, timeout=45)
                    output.seek(0)
                    result.stderr = output.read()
                    return result
            def identity():
                with urlopen(f'http://127.0.0.1:{port}/__atlas__/identity.json', timeout=3) as response:
                    return json.load(response)
            state_path = root / f'app/.runtime/server-{port}.json'
            saved = None
            try:
                first = launch()
                self.assertEqual(first.returncode, 0, first.stderr)
                saved = state_path.read_bytes()
                status = identity()
                self.assertEqual(status['repositoryRoot'], str(root))
                self.assertEqual(status['mode'], 'static')
                again = launch()
                self.assertEqual(again.returncode, 0, again.stderr)
                self.assertEqual(identity()['pid'], status['pid'])
                for field, value in [('repositoryRoot', str(root / 'other')),
                                     ('pid', status['pid'] + 1),
                                     ('processStartedUtc', '2000-01-01T00:00:00Z')]:
                    with self.subTest(field=field):
                        altered = json.loads(saved.decode('utf-8-sig'))
                        altered[field] = value
                        state_path.write_bytes(json.dumps(altered).encode('utf-8'))
                        refused = launch('-Stop')
                        self.assertNotEqual(refused.returncode, 0)
                        self.assertEqual(identity()['pid'], status['pid'])
                state_path.write_bytes(saved)
                stopped = launch('-Stop')
                self.assertEqual(stopped.returncode, 0, stopped.stderr)
                self.assertFalse(state_path.exists())
                saved = None
                with self.assertRaises(OSError):
                    identity()
            finally:
                if saved is not None:
                    state_path.write_bytes(saved)
                if state_path.exists():
                    cleanup = launch('-Stop')
                    self.assertEqual(cleanup.returncode, 0, cleanup.stderr)
