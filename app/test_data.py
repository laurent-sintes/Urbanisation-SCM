"""HTTP boundary tests for the standard-library static server."""
import contextlib
import hashlib
import http.client
import io
import json
import tempfile
import threading
import unittest
from pathlib import Path
from server import activate_workshop, create_server
from scripts.atlas_workshop import apply_request, current_stage, publication

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

    def request(self, path, method="GET", headers=None, body=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        try:
            with contextlib.redirect_stderr(io.StringIO()):
                connection.request(method, path, body=body, headers=headers or {})
                response = connection.getresponse()
                body = response.read()
            return response.status, dict(response.getheaders()), body
        finally:
            connection.close()

    def test_server_startup_opens_and_resumes_workshop_without_replacing_conflicts(self):
        data = self.dist / 'data'
        folder = data / '2026-10-10.1'
        folder.mkdir(parents=True)
        model = {'space': 'release', 'version': '2026-10-10.1', 'nodes': [],
                 'hotspot_catalog': {'schema_version': 1, 'source_refs': [], 'hotspots': []}}
        raw = json.dumps(model).encode()
        (folder / 'model.json').write_bytes(raw)
        index = data / 'index.json'
        index.write_text(json.dumps({'current_version': model['version'], 'versions': [
            {'version': model['version'], 'model_sha256': hashlib.sha256(raw).hexdigest()}]}))
        first = activate_workshop(self.root)
        self.assertEqual(first['revision'], 0)
        self.assertEqual(activate_workshop(self.root)['session_id'], first['session_id'])
        model['version'] = '2026-10-11.1'
        next_folder = data / model['version']
        next_folder.mkdir()
        next_raw = json.dumps(model).encode()
        (next_folder / 'model.json').write_bytes(next_raw)
        index.write_text(json.dumps({'current_version': model['version'], 'versions': [
            {'version': model['version'], 'model_sha256': hashlib.sha256(next_raw).hexdigest()}]}))
        with self.assertRaisesRegex(ValueError, 'publication a changé'):
            activate_workshop(self.root)
        self.assertEqual(json.loads((self.root / '.runtime/atlas-atelier/staging.json').read_bytes())['session_id'], first['session_id'])

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

    def test_published_pdf_download_and_head_preserve_bytes(self):
        folder = self.dist / 'data/2026-10-11.2/documents'
        folder.mkdir(parents=True)
        pdf = b'%PDF-1.4\nPublished document\n%%EOF\n'
        (folder / 'DOC001.pdf').write_bytes(pdf)
        route = '/data/2026-10-11.2/documents/DOC001.pdf'
        status, headers, body = self.request(route)
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'], 'application/pdf')
        self.assertEqual(body, pdf)
        status, headers, body = self.request(route, method='HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(int(headers['Content-Length']), len(pdf))
        self.assertEqual(body, b'')
        self.assertEqual(self.request('/data/2026-10-11.2/documents/DOC999.pdf')[0], 404)
        self.assertEqual(self.request('/data/2026-10-11.2/documents/DOC001.yaml')[0], 404)
        self.assertEqual(self.request('/data/2026-10-11.2/documents/../model.json')[0], 404)
        self.assertEqual(self.request('/modeles/documents/DOC001.pdf')[0], 404)

    def test_published_pptx_download_and_head_preserve_bytes(self):
        folder = self.dist / 'data/2026-10-13.2/documents'
        folder.mkdir(parents=True)
        payload = b'PK\x03\x04Published native presentation bytes'
        (folder / 'DOC003.pptx').write_bytes(payload)
        route = '/data/2026-10-13.2/documents/DOC003.pptx'
        status, headers, body = self.request(route)
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'],
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation')
        self.assertEqual(body, payload)
        status, headers, body = self.request(route, method='HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(int(headers['Content-Length']), len(payload))
        self.assertEqual(body, b'')
        self.assertEqual(self.request('/data/2026-10-13.2/documents/DOC003.pptm')[0], 404)
        self.assertEqual(self.request('/modeles/documents/DOC003.pptx')[0], 404)

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

    def test_workshop_batch_post_is_local_and_stages_changes(self):
        data = self.dist / 'data'
        folder = data / '2026-10-10.1'
        folder.mkdir(parents=True)
        model = {'space': 'release', 'version': '2026-10-10.1',
                 'nodes': [{'id': 'logistics'}],
                 'hotspot_catalog': {'schema_version': 1, 'source_refs': [], 'hotspots': []}}
        raw = json.dumps(model).encode()
        (folder / 'model.json').write_bytes(raw)
        (data / 'index.json').write_text(json.dumps({
            'current_version': model['version'],
            'versions': [{'version': model['version'], 'model_sha256': hashlib.sha256(raw).hexdigest()}]}))
        published, model_sha = publication(self.root)
        stage = current_stage(self.root, published, model_sha)
        apply_request(self.root, {'expected_revision': 0, 'entity': 'hotspot', 'action': 'add',
                                  'verbatim': 'Ajouter un point chaud.',
                                  'fields': {'title': 'Sujet initial', 'problem': 'Question ouverte.',
                                             'location': {'node_ids': ['logistics']},
                                             'resolution_options': [{'id': 'credible', 'title': 'Contrat',
                                                 'principle': 'Clarifier les responsabilités',
                                                 'implementation_complexity': 'S', 'evidence_state': 'hypothesis'}]}})
        route = '/__atlas__/workshop/hotspots/batch'
        body = json.dumps({'session_id': stage['session_id'], 'expected_revision': 1,
                           'changes': [{'id': 'AT-HS-001', 'fields': {'title': 'Sujet précisé'}}]}).encode()
        headers = {'Origin': f'http://127.0.0.1:{self.port}', 'X-Atlas-Workshop': '1',
                   'Content-Type': 'application/json'}
        staging_path = self.root / '.runtime/atlas-atelier/staging.json'
        staging_before = staging_path.read_bytes()
        for method in ('PUT', 'PATCH', 'DELETE'):
            with self.subTest(method=method):
                self.assertEqual(self.request(route, method, headers=headers, body=body)[0], 405)
                self.assertEqual(staging_path.read_bytes(), staging_before)
                self.assertEqual(self.request('/data/2026-10-10.1/model.json')[2], raw)
        self.assertEqual(self.request(route, 'POST', headers={'Origin': 'https://evil.example'}, body=body)[0], 403)
        self.assertEqual(self.request(route, 'POST', headers={'Content-Type': 'application/json'}, body=body)[0], 403)
        status, _, payload = self.request(route, 'POST', headers=headers, body=body)
        self.assertEqual(status, 200)
        saved = json.loads(payload)
        self.assertEqual(saved['revision'], 2)
        self.assertEqual(saved['operations'][-1]['value']['title'], 'Sujet précisé')
        self.assertEqual(self.request(route, 'POST', headers=headers, body=body)[0], 409)
        from scripts.hotspot_resolution import empty_resolution
        resolution = dict(empty_resolution(), stage='credible', summary='Solution envisageable',
                          credible_option_ids=['credible'], credibility_note='Sous réserves explicites',
                          assessed_on='2026-10-11', assessment_source='Séance')
        resolved = json.dumps({'session_id': stage['session_id'], 'expected_revision': 2,
            'changes': [{'id': 'AT-HS-001', 'fields': {'status': 'resolved', 'resolution': resolution}}]}).encode()
        status, _, payload = self.request(route, 'POST', headers=headers, body=resolved)
        self.assertEqual(status, 200)
        saved = json.loads(payload)
        self.assertEqual(saved['operations'][-1]['value']['resolution'], resolution)
        self.assertNotIn('selected_option_id', saved['operations'][-1]['value'])
        self.assertEqual(self.request('/data/2026-10-10.1/model.json')[2], raw)

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

    def test_full_model_downloads_preserve_unicode_large_payload_and_head(self):
        from scripts.structured_io import dumps, loads
        folder = self.dist / 'data/2026-10-12.1'
        folder.mkdir(parents=True)
        model = {'version': '2026-10-12.1', 'nodes': [], 'relations': [],
                 'hotspot_catalog': {'hotspots': [{'id': 'HS-023', 'title': 'Décision → provenance',
                    'gap_analysis': [], 'notes': 'Écart été — ' * 30000}]},
                 'metamodel': {'snapshot_schema': {'$defs': {'hotspot': {'type': 'object'}}},
                    'catalog_types': [{'path': 'hotspot_catalog.hotspots', 'label': 'Hotspot'}]}}
        formats = {'json': (json.dumps(model, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8'),
                   'yaml': (dumps(model).encode('utf-8'), 'application/yaml; charset=utf-8')}
        for extension, (payload, content_type) in formats.items():
            (folder / f'model.{extension}').write_bytes(payload)
            route = f'/data/2026-10-12.1/model.{extension}'
            for _ in range(2):
                status, headers, downloaded = self.request(route)
                self.assertEqual(status, 200)
                self.assertEqual(headers['Content-Type'], content_type)
                self.assertEqual(int(headers['Content-Length']), len(payload))
                self.assertEqual(downloaded, payload)
                self.assertEqual(loads(downloaded.decode('utf-8'), '.' + extension), model)
            status, headers, downloaded = self.request(route, method='HEAD')
            self.assertEqual(status, 200)
            self.assertEqual(int(headers['Content-Length']), len(payload))
            self.assertEqual(downloaded, b'')
        self.assertEqual(self.request('/data/2026-10-12.2/model.yaml')[0], 404)

if __name__ == '__main__':
    unittest.main()
