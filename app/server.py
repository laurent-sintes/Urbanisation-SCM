"""Local, read-only HTTP server for FLOW Atlas (Python standard library only)."""

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

class SourceAccessError(ValueError):
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
}
MISSING_BUILD = "Interface Atlas non compilée. Depuis le projet : pnpm --dir app install, puis pnpm --dir app build."
CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self'; "
    "style-src-attr 'unsafe-inline'; "
    "img-src 'self' data:; connect-src 'self'; font-src 'self'; "
    "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
)


def built_file(root: Path, route: str) -> tuple[Path, str] | None:
    """Serve only compiled assets and generated publication JSON, never sources."""
    if route in BUILT_ROOT_FILES:
        filename, content_type = BUILT_ROOT_FILES[route]
    elif re.fullmatch(r"/assets/[A-Za-z0-9][A-Za-z0-9._-]*", route) and ".." not in route:
        filename = route.lstrip("/")
        content_type = BUILT_ASSET_TYPES.get(Path(filename).suffix)
        if content_type is None:
            return None
    elif route == '/data/index.json' or re.fullmatch(r'/data/\d{4}-\d{2}-\d{2}\.[1-9]\d*/(?:model|guide)\.json', route):
        filename, content_type = route.lstrip('/'), 'application/json; charset=utf-8'
    else:
        return None
    build_dir = root / "app" / "dist"
    path = build_dir / filename
    # Reject symlinks and junctions for both the build root and individual files.
    if build_dir.resolve() != build_dir or path.resolve() != path:
        raise SourceAccessError("Fichier compilé non autorisé.")
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
        self._json(status, {"error": message, "status": status}, head)

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
        self._error(405, "Cette application propose uniquement la lecture du modèle.")

    do_PUT = do_POST
    do_PATCH = do_POST
    do_DELETE = do_POST

    def _dispatch(self, head: bool = False):
        if not self._local_request():
            self._error(403, "Accès réservé à l’application locale.", head)
            return
        try:
            request = urlsplit(self.path)
            route = unquote(request.path, errors="strict")
            if route == '/__atlas__/identity.json':
                self._json(200, {
                    'appName': 'FLOW Atlas', 'mode': 'static',
                    'pid': os.getpid(), 'repositoryRoot': str(self.root),
                }, head)
            else:
                asset = built_file(self.root, route)
                if asset is None:
                    self._error(404, "Ressource introuvable.", head)
                else:
                    path, content_type = asset
                    if route in {"/", "/index.html"} and not path.is_file():
                        self._error(503, MISSING_BUILD, head)
                        return
                    self._send(200, path.read_bytes(), content_type, head)
        except SourceAccessError as exc:
            self._error(403, str(exc), head)
        except FileNotFoundError:
            self._error(404, "Source ou fichier de l’application introuvable.", head)
        except (ValueError, UnicodeError):
            self._error(400, "Requête invalide.", head)
        except (ConnectionError, BrokenPipeError):
            pass
        except OSError:
            self._error(500, "Lecture impossible. Vérifie la disponibilité des fichiers du projet.", head)

    def log_message(self, format, *args):
        # Avoid copying source query strings or terminal control characters into
        # logs. Status codes are enough to diagnose this small local server.
        status = args[1] if len(args) > 1 else ""
        print(f"FLOW Atlas {self.command} {status}", file=sys.stderr)


def create_server(port=8765, root=REPOSITORY_ROOT):
    return ThreadingHTTPServer(("127.0.0.1", port), partial(AtlasHandler, root=root))


def main(argv=None):
    parser = argparse.ArgumentParser(description="FLOW Atlas — explorateur local du modèle métier")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--check", action="store_true", help="Vérifier la présence du site statique et quitter")
    args = parser.parse_args(argv)
    if not 1 <= args.port <= 65535:
        parser.error("Le port doit être compris entre 1 et 65535.")
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
        print(f"Démarrage impossible sur le port {args.port} : {exc}", file=sys.stderr)
        return 1
    print(f"FLOW Atlas : http://127.0.0.1:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
