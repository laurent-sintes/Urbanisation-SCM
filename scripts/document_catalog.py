"""Validate versioned Atlas documents and their hotspot links."""

from __future__ import annotations

import hashlib
from pathlib import Path
import re
from io import BytesIO
import zipfile
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
ASSET_PATH = re.compile(r"modeles/documents/([0-9a-f]{64})\.(pdf|pptx)\Z")
DOCUMENT_EXTENSIONS = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
}


def document_extension(document: dict) -> str:
    try:
        return DOCUMENT_EXTENSIONS[document['asset']['media_type']]
    except (KeyError, TypeError) as exc:
        raise ValueError(f"{document.get('id', 'document')}: unsupported document media type") from exc


def _valid_pptx(payload: bytes) -> bool:
    try:
        with zipfile.ZipFile(BytesIO(payload)) as archive:
            names = set(archive.namelist())
            if not {'[Content_Types].xml', 'ppt/presentation.xml'} <= names:
                return False
            content_types = ElementTree.fromstring(archive.read('[Content_Types].xml'))
            return any(
                item.get('PartName') == '/ppt/presentation.xml'
                and item.get('ContentType') ==
                'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'
                for item in content_types)
    except (zipfile.BadZipFile, KeyError, ElementTree.ParseError, OSError, RuntimeError):
        return False


def asset_bytes(root: Path, document: dict) -> bytes:
    asset = document['asset']
    match = ASSET_PATH.fullmatch(asset['path'])
    extension = document_extension(document)
    if not match or match.group(1) != asset['sha256'] or match.group(2) != extension:
        raise ValueError(f"{document['id']}: invalid document path or fingerprint")
    path = root / asset['path']
    try:
        payload = path.read_bytes()
    except OSError as exc:
        raise ValueError(f"{document['id']}: document file is unavailable") from exc
    valid_format = payload.startswith(b'%PDF-') if extension == 'pdf' else _valid_pptx(payload)
    if not valid_format or hashlib.sha256(payload).hexdigest() != asset['sha256']:
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
