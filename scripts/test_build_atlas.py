"""Build failures leave a usable reader; open tabs retain lazy assets."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from scripts.build_atlas import promote_build
from scripts.export_atlas import atomic_write


class BuildActivationTests(unittest.TestCase):
    def test_failure_keeps_entry_point_and_success_keeps_old_lazy_asset(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            stage, live = root / 'stage', root / 'live'
            for folder in (stage, live):
                (folder / 'assets').mkdir(parents=True)
                (folder / 'data').mkdir()
            (live / 'index.html').write_bytes(b'old UI')
            (live / 'assets/old-lazy.js').write_bytes(b'old lazy module')
            for name, body in {'index.html': b'new UI', 'data/index.json': b'new catalog',
                               'delivery.json': b'manifest', 'assets/new-lazy.js': b'new lazy module'}.items():
                (stage / name).write_bytes(body)
            def interrupted(path, content):
                if Path(path).suffix == '.js':
                    raise OSError('interrupted copy')
                atomic_write(path, content)
            with patch('scripts.build_atlas.atomic_write', side_effect=interrupted):
                with self.assertRaises(OSError):
                    promote_build(stage, live)
            self.assertEqual((live / 'index.html').read_bytes(), b'old UI')
            promote_build(stage, live)
            self.assertEqual((live / 'index.html').read_bytes(), b'new UI')
            self.assertEqual((live / 'assets/old-lazy.js').read_bytes(), b'old lazy module')
            self.assertEqual((live / 'assets/new-lazy.js').read_bytes(), b'new lazy module')

    def test_incomplete_build_is_not_activated(self):
        with tempfile.TemporaryDirectory() as temporary:
            with self.assertRaisesRegex(ValueError, 'Incomplete'):
                promote_build(Path(temporary), Path(temporary) / 'live')
