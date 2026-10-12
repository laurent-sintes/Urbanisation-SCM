"""Build static Atlas data from verified, explicitly indexed publications only."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import uuid
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.atlas_lock import atlas_lock
from scripts.release_catalog import PublicationReader
from scripts.git_history import batch_reader
from app.modeling_guide import _load_associated_guide
from scripts.atlas_metamodel import describe_metamodel
from scripts.atlas_documentation import separate_documentation
from scripts.document_catalog import asset_bytes
from scripts.structured_io import dumps as dump_yaml, read as read_document
from scripts.structured_io import _PARSER_SIGNATURE


def generator_signature():
    """Only generator dependencies invalidate historical serialization receipts."""
    from scripts.dependency_signature import signature
    return signature(ROOT, ['scripts/export_atlas.py'], _PARSER_SIGNATURE)


EXPORT_NAMES = ('model.yaml', 'model.json', 'guide.json')


def cached_export(receipt, sources):
    """Receipts accelerate serialization only; source integrity is checked upstream."""
    try:
        hashes = json.loads(receipt.read_bytes())
        if not isinstance(hashes, dict) or set(hashes) != set(EXPORT_NAMES) or any(
                not isinstance(value, str) or not re.fullmatch('[a-f0-9]{64}', value)
                for value in hashes.values()):
            return None
        for source in sources:
            try:
                payloads = {name: (source / name).read_bytes() for name in EXPORT_NAMES}
                if all(hashlib.sha256(payload).hexdigest() == hashes[name]
                       for name, payload in payloads.items()):
                    return payloads
            except OSError:
                continue
    except (OSError, ValueError, TypeError):
        pass
    return None


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n').encode('utf-8')


def atomic_write(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() == content:
        return
    temporary = path.with_name(path.name + '.' + uuid.uuid4().hex + '.tmp')
    try:
        temporary.write_bytes(content)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def export_atlas(root=ROOT, destinations=None, *, incremental=True):
    root = Path(root).resolve()
    with atlas_lock(root), batch_reader(root):
        return _export_atlas(root, destinations, incremental=incremental)


def _export_atlas(root, destinations, *, incremental=True):
    started = perf_counter()
    # Refuse the legacy directory-scanning fallback: the index is authoritative.
    index_path = root / 'modeles/release/index.json'
    before = index_path.read_bytes()
    reader = PublicationReader(index_path.parent)
    result = reader.catalog()
    schema_path = root / 'modeles/schemas/urbanism.schema.json'
    snapshot_schema = read_document(schema_path) if schema_path.is_file() else None
    signature = generator_signature()
    schema_digest = hashlib.sha256(encoded(snapshot_schema)).hexdigest()
    destinations = [Path(path) for path in (destinations if destinations is not None else
                    [root / 'app/public/data'] + (
                    [root / 'app/dist/data'] if (root / 'app/dist/index.html').is_file() else []))]
    sources = list(dict.fromkeys([*destinations, root / 'app/public/data', root / 'app/dist/data']))
    catalog_seconds = perf_counter() - started
    model_seconds = guide_seconds = serialization_seconds = 0.0
    files = {}
    receipts = {}
    reused = 0
    for entry in result['versions']:
        version = entry['version']
        if not isinstance(version, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', version):
            raise ValueError('Invalid static publication version')
        step = perf_counter()
        descriptor, raw = reader.load(version)
        model_seconds += perf_counter() - step
        step = perf_counter()
        complete_guide = _load_associated_guide(root, version)
        guide_seconds += perf_counter() - step
        step = perf_counter()
        key = hashlib.sha256(encoded({'generator': signature, 'schema': schema_digest,
                                     'descriptor': descriptor, 'guide': complete_guide})).hexdigest()
        receipt = root / '.runtime/atlas-export-receipts' / (key + '.json')
        payloads = cached_export(receipt, [source / version for source in sources]) if incremental else None
        if payloads is None:
            metamodel_document, guide = separate_documentation(complete_guide, raw)
            model = {**raw,
                     'sourcePath': 'modeles/release/' + descriptor['path'],
                     'metamodel': describe_metamodel(raw, complete_guide, snapshot_schema)}
            if metamodel_document:
                model['metamodel']['documentation'] = metamodel_document
            payloads = {'model.yaml': dump_yaml(model).encode('utf-8'),
                        'model.json': encoded(model), 'guide.json': encoded(guide)}
        else:
            reused += 1
        receipts[receipt] = encoded({name: hashlib.sha256(payload).hexdigest()
                                    for name, payload in payloads.items()})
        for name, payload in payloads.items():
            files[f'{version}/{name}'] = payload
        for name in ('model', 'guide'):
            entry[name + '_sha256'] = hashlib.sha256(payloads[name + '.json']).hexdigest()
        entry['model_yaml_sha256'] = hashlib.sha256(payloads['model.yaml']).hexdigest()
        for document in raw.get('document_catalog', {}).get('documents', []):
            files[f"{version}/documents/{document['id']}.pdf"] = asset_bytes(root, document)
        serialization_seconds += perf_counter() - step
    if index_path.read_bytes() != before:
        raise ValueError('Publication index changed during static export; retry.')
    reader.verify_descriptors()
    # Build everything before touching the served catalog. Keep older files for
    # readers whose catalog request preceded a release.
    write_started = perf_counter()
    for destination in destinations:
        destination = Path(destination)
        for relative, payload in files.items():
            atomic_write(destination / relative, payload)
        if index_path.read_bytes() != before:
            raise ValueError('Publication index changed before static activation; retry.')
        reader.verify_descriptors()
        atomic_write(destination / 'index.json', encoded(result))
    # Only successful activation produces receipts; never copy the large payloads.
    if destinations:
        for path, content in receipts.items():
            atomic_write(path, content)
    return {'current_version': result['current_version'], 'publications': len(result['versions']),
            'reused_publications': reused, 'generated_publications': len(result['versions']) - reused,
            'files': len(files) + 1, 'bytes': sum(map(len, files.values())),
            'destinations': [str(path) for path in destinations],
            'timings_seconds': {key: round(value, 4) for key, value in {
                'catalog': catalog_seconds, 'models': model_seconds, 'guides': guide_seconds,
                'serialization': serialization_seconds, 'write': perf_counter() - write_started,
                'total': perf_counter() - started}.items()}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--output', type=Path, action='append')
    parser.add_argument('--full', action='store_true', help='Regenerate every publication for comparison or diagnosis')
    args = parser.parse_args()
    print(json.dumps(export_atlas(args.root, args.output, incremental=not args.full), ensure_ascii=False))


if __name__ == '__main__':
    main()
