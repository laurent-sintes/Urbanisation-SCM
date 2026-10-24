"""Local FLOW Atlas server: static reads and a bounded workshop staging endpoint."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from functools import partial
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPOSITORY_ROOT))
from scripts.atlas_text import ReaderError, text as ui_text
from scripts.atlas_lock import atlas_lock
from scripts.atlas_workshop import StageConflictError, apply_table_changes, current_stage, publication

class SourceAccessError(ReaderError):
    pass

BUILT_ROOT_FILES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/icon.svg": ("icon.svg", "image/svg+xml"),
    "/manifest.webmanifest": ("manifest.webmanifest", "application/manifest+json"),
    "/delivery.json": ("delivery.json", "application/json; charset=utf-8"),
}
BUILT_ASSET_TYPES = {
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".pdf": "application/pdf",
}
MISSING_BUILD = ui_text('server.interface_atlas_non_compilee_depuis_le_projet_pnpm_dir_app_instal')
CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self'; "
    "style-src-attr 'unsafe-inline'; "
    "img-src 'self' data:; connect-src 'self'; font-src 'self'; "
    "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
)


def built_file(root: Path, route: str) -> tuple[Path, str] | None:
    """Serve only compiled assets and generated publication data, never sources."""
    if route in BUILT_ROOT_FILES:
        filename, content_type = BUILT_ROOT_FILES[route]
    elif re.fullmatch(r"/assets/[A-Za-z0-9][A-Za-z0-9._-]*", route) and ".." not in route:
        filename = route.lstrip("/")
        content_type = BUILT_ASSET_TYPES.get(Path(filename).suffix)
        if content_type is None:
            return None
    elif route == '/data/index.json' or re.fullmatch(r'/data/\d{4}-\d{2}-\d{2}\.[1-9]\d*/(?:model|guide)\.json', route):
        filename, content_type = route.lstrip('/'), 'application/json; charset=utf-8'
    elif re.fullmatch(r'/data/\d{4}-\d{2}-\d{2}\.[1-9]\d*/model\.yaml', route):
        filename, content_type = route.lstrip('/'), 'application/yaml; charset=utf-8'
    elif re.fullmatch(r'/data/\d{4}-\d{2}-\d{2}\.[1-9]\d*/documents/[A-Za-z0-9][A-Za-z0-9_-]*\.(?:pdf|pptx)', route):
        filename = route.lstrip('/')
        content_type = ('application/pdf' if route.endswith('.pdf') else
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    else:
        return None
    build_dir = root / "app" / "dist"
    path = build_dir / filename
    # Reject symlinks and junctions for both the build root and individual files.
    if build_dir.resolve() != build_dir or path.resolve() != path:
        raise SourceAccessError('server.fichier_compile_non_autorise')
    return path, content_type


class AtlasHandler(BaseHTTPRequestHandler):
    server_version = "FLOWAtlas/1"
    sys_version = ""

    def __init__(self, *args, root=REPOSITORY_ROOT, **kwargs):
        self.root = Path(root).resolve()
        super().__init__(*args, **kwargs)

    def _send(self, status: int, body: bytes, content_type: str, head: bool = False):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def _json(self, status: int, value: dict, head: bool = False):
        self._send(status, json.dumps(value, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8", head)

    def _error(self, status: int, message: str, head: bool = False):
        payload = {"error": str(message), "status": status}
        if isinstance(message, ReaderError):
            payload.update(code=message.code, parameters=message.parameters)
        self._json(status, payload, head)

    def _local_request(self) -> bool:
        # No permissive CORS, and reject DNS-rebinding hostnames before exposing
        # source contents. The server itself binds exclusively to loopback.
        authority = self.headers.get("Host", "")
        expected_port = self.server.server_address[1]
        if authority.lower() not in {f"127.0.0.1:{expected_port}", f"localhost:{expected_port}"}:
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in {f"http://127.0.0.1:{expected_port}", f"http://localhost:{expected_port}"}:
            return False
        return self.headers.get("Sec-Fetch-Site", "") != "cross-site"

    def do_GET(self):
        self._dispatch()

    def do_HEAD(self):
        self._dispatch(head=True)

    def do_POST(self):
        if not self._local_request():
            self._error(403, ReaderError('server.acces_reserve_a_l_application_locale'))
            return
        try:
            route = unquote(urlsplit(self.path).path, errors="strict")
            if route != '/__atlas__/workshop/hotspots/batch':
                self._error(405, ReaderError('server.ecriture_indisponible_pour_cette_ressource'))
                return
            expected_origin = f"http://{self.headers.get('Host', '')}"
            if (self.headers.get('Origin') != expected_origin
                    or self.headers.get('X-Atlas-Workshop') != '1'
                    or self.headers.get('Content-Type', '').split(';', 1)[0].strip().lower() != 'application/json'):
                self._error(403, ReaderError('server.ecriture_reservee_a_l_atelier_local_ouvert_dans_atlas'))
                return
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 128_000:
                self._error(413, ReaderError('server.lot_d_atelier_trop_volumineux_ou_vide'))
                return
            request = json.loads(self.rfile.read(length))
            stage = apply_table_changes(self.root, request)
            self._json(200, stage)
        except StageConflictError as exc:
            self._error(409, exc)
        except (ValueError, UnicodeError, json.JSONDecodeError) as exc:
            self._error(400, exc if str(exc) else ui_text('server.requete_invalide'))
        except OSError:
            self._error(500, ReaderError('server.ecriture_du_staging_impossible'))

    def _reject_write_method(self):
        if not self._local_request():
            self._error(403, ReaderError('server.acces_reserve_a_l_application_locale'))
            return
        self._error(405, ReaderError('server.seul_post_est_autorise_pour_modifier_l_atelier'))

    do_PUT = _reject_write_method
    do_PATCH = _reject_write_method
    do_DELETE = _reject_write_method

    def _dispatch(self, head: bool = False):
        if not self._local_request():
            self._error(403, ReaderError('server.acces_reserve_a_l_application_locale'), head)
            return
        try:
            request = urlsplit(self.path)
            route = unquote(request.path, errors="strict")
            if route == '/__atlas__/identity.json':
                self._json(200, {
                    'appName': ui_text('server.flow_atlas_2'), 'mode': 'static',
                    'pid': os.getpid(), 'repositoryRoot': str(self.root),
                }, head)
            elif route == '/__atlas__/workshop/staging.json':
                stage = self.root / '.runtime/atlas-atelier/staging.json'
                if stage.resolve() != stage:
                    raise SourceAccessError('server.staging_non_autorise')
                if stage.is_file():
                    payload = stage.read_bytes()
                    if len(payload) > 2_000_000:
                        raise SourceAccessError('server.staging_trop_volumineux')
                    self._send(200, payload, 'application/json; charset=utf-8', head)
                else:
                    self._json(200, {'active': False}, head)
            else:
                asset = built_file(self.root, route)
                if asset is None:
                    self._error(404, ReaderError('server.ressource_introuvable'), head)
                else:
                    path, content_type = asset
                    if route in {"/", "/index.html"} and not path.is_file():
                        self._error(503, MISSING_BUILD, head)
                        return
                    self._send(200, path.read_bytes(), content_type, head)
        except SourceAccessError as exc:
            self._error(403, str(exc), head)
        except FileNotFoundError:
            self._error(404, ReaderError('server.source_ou_fichier_de_l_application_introuvable'), head)
        except (ValueError, UnicodeError):
            self._error(400, ReaderError('server.requete_invalide'), head)
        except (ConnectionError, BrokenPipeError):
            pass
        except OSError:
            self._error(500, ReaderError('server.lecture_impossible_verifie_la_disponibilite_des_fichiers_du_proje'), head)

    def log_message(self, format, *args):
        # Avoid copying source query strings or terminal control characters into
        # logs. Status codes are enough to diagnose this small local server.
        status = args[1] if len(args) > 1 else ""
        print(ui_text('server.flow_atlas', value1=self.command, status=status), file=sys.stderr)


def create_server(port=8765, root=REPOSITORY_ROOT):
    return ThreadingHTTPServer(("127.0.0.1", port), partial(AtlasHandler, root=root))


def activate_workshop(root=REPOSITORY_ROOT):
    """Resume or create the local workshop without replacing an incompatible stage."""
    with atlas_lock(root):
        model, model_sha = publication(root)
        return current_stage(root, model, model_sha)


def main(argv=None):
    parser = argparse.ArgumentParser(description=ui_text('server.flow_atlas_explorateur_local_du_modele_metier'))
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--check", action="store_true", help=ui_text('server.verifier_la_presence_du_site_statique_et_quitter'))
    args = parser.parse_args(argv)
    if not 1 <= args.port <= 65535:
        parser.error(ui_text('server.le_port_doit_etre_compris_entre_1_et_65535'))
    ready = all((REPOSITORY_ROOT / 'app/dist' / name).is_file() for name in ('index.html', 'data/index.json'))
    if args.check:
        print(json.dumps({'frontend': {'ready': ready}, 'mode': 'static'}))
        return 0 if ready else 1
    if not ready:
        print(MISSING_BUILD, file=sys.stderr)
        return 1
    try:
        server = create_server(args.port)
    except OSError as exc:
        print(ui_text('server.demarrage_impossible_sur_le_port', value1=args.port, exc=exc), file=sys.stderr)
        return 1
    try:
        stage = activate_workshop()
        print(ui_text('server.atelier_local_actif', value1=stage['session_id']), flush=True)
    except ValueError as exc:
        # Keep the older staging available for export and conflict resolution.
        print(ui_text('server.atelier_a_reexaminer', exc=exc), file=sys.stderr)
    except OSError as exc:
        server.server_close()
        print(ui_text('server.demarrage_de_l_atelier_impossible', exc=exc), file=sys.stderr)
        return 1
    print(ui_text('server.flow_atlas_http_127_0_0_1', value1=args.port), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
