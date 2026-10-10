"""HTTP boundary tests for the standard-library static server."""
import contextlib
import http.client
import io
import json
import tempfile
import threading
import unittest
from pathlib import Path
from server import create_server

class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        (self.root / 'app').mkdir()
        (self.root / "app/index.html").write_text("SOURCE INTERFACE — NEVER SERVED", encoding="utf-8")
        self.dist = self.root / "app/dist"
        (self.dist / "assets").mkdir(parents=True)
        (self.dist / "index.html").write_text('<!doctype html><title>Atlas React</title><script type="module" src="/assets/index-test123.js"></script>', encoding="utf-8")
        (self.dist / "assets/index-test123.js").write_text('console.log("Atlas bundle");', encoding="utf-8")
        (self.dist / "assets/index-test123.css").write_text("body { color: navy; }", encoding="utf-8")
        (self.dist / "icon.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"></svg>', encoding="utf-8")
        self.server = create_server(0, self.root)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop_server)

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def request(self, path, method="GET", headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        try:
            with contextlib.redirect_stderr(io.StringIO()):
                connection.request(method, path, headers=headers or {})
                response = connection.getresponse()
                body = response.read()
            return response.status, dict(response.getheaders()), body
        finally:
            connection.close()

    def test_api_identification_and_security_headers(self):
        status, headers, body = self.request("/__atlas__/identity.json")
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertEqual(data["appName"], "FLOW Atlas")
        self.assertEqual(data["repositoryRoot"], str(self.root.resolve()))
        self.assertEqual(data["mode"], "static")
        self.assertIsInstance(data["pid"], int)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
        self.assertIn("script-src 'self'", headers["Content-Security-Policy"])
        directives = {item.strip().split(" ", 1)[0]: item.strip().split(" ", 1)[1] for item in headers["Content-Security-Policy"].split(";") if item.strip()}
        self.assertEqual(directives["script-src"], "'self'")
        self.assertEqual(directives["style-src"], "'self'")
        self.assertEqual(directives["style-src-attr"], "'unsafe-inline'")
        self.assertNotIn("'unsafe-eval'", headers["Content-Security-Policy"])

    def test_built_entry_and_typed_assets_are_served(self):
        status, headers, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"Atlas React", body)
        self.assertNotIn(b"SOURCE INTERFACE", body)
        self.assertEqual(headers["Content-Type"], "text/html; charset=utf-8")
        for route, content_type in [
            ("/assets/index-test123.js", "text/javascript; charset=utf-8"),
            ("/assets/index-test123.css", "text/css; charset=utf-8"),
            ("/icon.svg", "image/svg+xml"),
        ]:
            with self.subTest(route=route):
                status, headers, body = self.request(route)
                self.assertEqual(status, 200)
                self.assertEqual(headers["Content-Type"], content_type)
                self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
                self.assertTrue(body)
        status, headers, body = self.request("/assets/index-test123.js", method="HEAD")
        self.assertEqual(status, 200)
        self.assertEqual(body, b"")
        self.assertGreater(int(headers["Content-Length"]), 0)

    def test_missing_build_has_diagnostic_without_old_interface_fallback(self):
        (self.dist / "index.html").unlink()
        status, _, body = self.request("/")
        self.assertEqual(status, 503)
        self.assertIn("pnpm --dir app build", json.loads(body)["error"])
        self.assertNotIn(b"SOURCE INTERFACE", body)
        self.assertEqual(self.request("/api/model")[0], 404)

    def test_workshop_staging_is_read_only_and_local(self):
        route = '/__atlas__/workshop/staging.json'
        status, _, body = self.request(route)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), {'active': False})
        folder = self.root / '.runtime/atlas-atelier'
        folder.mkdir(parents=True)
        (folder / 'staging.json').write_text('{"active":true,"revision":1}', encoding='utf-8')
        status, headers, body = self.request(route)
        self.assertEqual(status, 200)
        self.assertEqual(headers['Cache-Control'], 'no-store')
        self.assertEqual(json.loads(body)['revision'], 1)
        self.assertEqual(self.request(route, method='POST')[0], 405)
        self.assertEqual(self.request(route, headers={'Origin': 'https://evil.example'})[0], 403)

    def test_build_never_exposes_sources_models_maps_or_dependency_trees(self):
        # Even accidental copies into dist must not become public endpoints.
        for filename in ["model.json", "index-test123.js.map", "secret.tsx"]:
            (self.dist / "assets" / filename).write_text("PRIVATE", encoding="utf-8")
        (self.dist / "model.json").write_text("PRIVATE MODEL", encoding="utf-8")
        for route in [
            "/assets/model.json", "/assets/index-test123.js.map", "/assets/secret.tsx",
            "/assets/../index.html", "/assets/%2e%2e/index.html", "/assets/%2e%2e%5cindex.html",
            "/assets/.secret.js", "/assets/sub/file.js", "/assets/index-test123.js:secret",
            "/app.js", "/model.js", "/styles.css", "/exploration.json",
            "/model.json", "/package.json", "/src/main.tsx", "/node_modules/react/index.js",
            "/anything", "/assets/",
        ]:
            with self.subTest(route=route):
                status, _, body = self.request(route)
                self.assertEqual(status, 404)
                self.assertIn("error", json.loads(body))

    def test_compiled_asset_symlink_cannot_escape_build_directory(self):
        link = self.dist / "assets/leak.js"
        try:
            link.symlink_to(self.root / "app/index.html")
        except OSError:
            self.skipTest("Création de lien symbolique non autorisée sur cet hôte.")
        self.assertEqual(self.request("/assets/leak.js")[0], 403)

    def test_foreign_hosts_and_cross_origin_reads_are_rejected(self):
        self.assertEqual(self.request("/api/model", headers={"Host": "evil.example"})[0], 403)
        self.assertEqual(self.request("/api/model", headers={"Origin": "https://evil.example"})[0], 403)
        self.assertEqual(self.request("/api/model", headers={"Sec-Fetch-Site": "cross-site"})[0], 403)
        self.assertEqual(self.request("/api/model", method="POST")[0], 405)


    def test_static_data_and_no_runtime_model_dependency(self):
        folder = self.dist / 'data/2026-09-26.2'
        folder.mkdir(parents=True)
        payload = b'{"space":"release","version":"2026-09-26.2"}'
        yaml_payload = b'space: release\nversion: 2026-09-26.2\n'
        (folder / 'model.json').write_bytes(payload)
        (folder / 'model.yaml').write_bytes(yaml_payload)
        (self.dist / 'data/index.json').write_text('{"current_version":"2026-09-26.2"}')
        self.assertEqual(self.request('/data/2026-09-26.2/model.json')[2], payload)
        status, headers, body = self.request('/data/2026-09-26.2/model.yaml')
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'], 'application/yaml; charset=utf-8')
        self.assertEqual(body, yaml_payload)
        status, headers, body = self.request('/data/2026-09-26.2/model.yaml', method='HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(int(headers['Content-Length']), len(yaml_payload))
        self.assertEqual(body, b'')
        # No modeles directory exists: serving published files needs no release reader.
        self.assertEqual(self.request('/data/2026-09-26.2/model.json')[2], payload)
        for route in ['/api/model', '/api/releases', '/api/source', '/api/modeling-guide',
                      '/data/../AGENTS.md', '/data/2026-09-26.2/secret.json',
                      '/data/2026-09-26.2/guide.yaml', '/data/2026-09-26.2/model.yaml.bak']:
            self.assertEqual(self.request(route)[0], 404, route)

    def test_static_delivery_manifest_is_served_for_build_update_detection(self):
        payload = b'{"schema_version":1,"files":{"index.html":"verified-build-hash"}}'
        (self.dist / 'delivery.json').write_bytes(payload)
        status, headers, body = self.request('/delivery.json')
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'], 'application/json; charset=utf-8')
        self.assertEqual(body, payload)
        status, headers, body = self.request('/delivery.json', method='HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(int(headers['Content-Length']), len(payload))
        self.assertEqual(body, b'')
        for route in ['/data/delivery.json', '/data/2026-09-26.2/delivery.json',
                      '/assets/delivery.json', '/report.json']:
            self.assertEqual(self.request(route)[0], 404, route)

if __name__ == '__main__':
    unittest.main()
