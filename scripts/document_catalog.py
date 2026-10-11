"""Validate versioned Atlas documents and their hotspot links."""

from __future__ import annotations

import hashlib
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
ASSET_PATH = re.compile(r"modeles/documents/([0-9a-f]{64})\.pdf\Z")


def asset_bytes(root: Path, document: dict) -> bytes:
    asset = document['asset']
    match = ASSET_PATH.fullmatch(asset['path'])
    if not match or match.group(1) != asset['sha256']:
        raise ValueError(f"{document['id']}: invalid document path or fingerprint")
    path = root / asset['path']
    try:
        payload = path.read_bytes()
    except OSError as exc:
        raise ValueError(f"{document['id']}: document file is unavailable") from exc
    if not payload.startswith(b'%PDF-') or hashlib.sha256(payload).hexdigest() != asset['sha256']:
        raise ValueError(f"{document['id']}: document fingerprint or format differs")
    return payload


def validate_catalog(model: dict, root: Path = ROOT) -> list[str]:
    catalog = model.get('document_catalog')
    document_ids = set()
    errors = []
    if catalog is not None:
        for document in catalog['documents']:
            identifier = document['id']
            if identifier in document_ids:
                errors.append(f'document_catalog: duplicate identity {identifier}')
            document_ids.add(identifier)
            try:
                asset_bytes(root, document)
            except ValueError as exc:
                errors.append(f'document_catalog: {exc}')
    for hotspot in model.get('hotspot_catalog', {}).get('hotspots', []):
        for identifier in hotspot.get('document_ids', []):
            if identifier not in document_ids:
                errors.append(f"{hotspot['id']}: missing document {identifier}")
    return errors
