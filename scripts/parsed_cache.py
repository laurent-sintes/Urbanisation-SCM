"""Disposable JSON parse cache across commands; never an authority or validation.

Callers hash the source bytes and parser implementation before looking here.
Payload checksums detect partial/corrupt entries. No pickle, filesystem metadata
shortcut or cache of a successful business validation is used.
"""
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import uuid

DIRECTORY = Path(__file__).resolve().parents[1] / '.runtime/parsed-models'
MAX_BYTES = 256 * 1024 * 1024
MAX_ENTRY_BYTES = 64 * 1024 * 1024
MAX_ENTRIES = 1024
MISSING = object()


def get(key, *, directory=None):
    directory = DIRECTORY if directory is None else Path(directory)
    try:
        if directory.resolve() != directory:
            return MISSING
        path = directory / (key + '.json')
        if path.resolve() != path or path.stat().st_size > min(MAX_BYTES, MAX_ENTRY_BYTES):
            return MISSING
        header, payload = path.read_bytes().split(b'\n', 1)
        if json.loads(header) != {'key': key, 'sha256': sha256(payload).hexdigest()}:
            return MISSING
        return json.loads(payload)
    except (OSError, ValueError):
        return MISSING


def put(key, value, *, directory=None):
    directory = DIRECTORY if directory is None else Path(directory)
    temporary = None
    try:
        if directory.resolve() != directory:
            return
        payload = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(',', ':')).encode('utf-8')
        header = json.dumps({'key': key, 'sha256': sha256(payload).hexdigest()}).encode('ascii')
        content = header + b'\n' + payload
        if len(content) > min(MAX_BYTES, MAX_ENTRY_BYTES):
            return
        directory.mkdir(parents=True, exist_ok=True)
        temporary = directory / (uuid.uuid4().hex + '.tmp')
        with temporary.open('xb') as stream:
            stream.write(content)
        os.replace(temporary, directory / (key + '.json'))
        # Only our own regular cache entries can be evicted. No recursive cleanup.
        entries = []
        for path in directory.iterdir():
            if re.fullmatch(r'[a-f0-9]{64}\.json', path.name) and path.resolve() == path and path.is_file():
                stamp = path.stat()
                entries.append((stamp.st_mtime_ns, stamp.st_size, path))
        total = sum(size for _, size, _ in entries)
        count = len(entries)
        for _, size, path in sorted(entries):
            if total <= MAX_BYTES and count <= MAX_ENTRIES:
                break
            path.unlink(missing_ok=True)
            total -= size
            count -= 1
    except (OSError, ValueError):
        # Read-only workspace, concurrent eviction, or interrupted writes only
        # lose an acceleration. Source parsing and its errors remain authoritative.
        pass
    finally:
        if temporary is not None:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
