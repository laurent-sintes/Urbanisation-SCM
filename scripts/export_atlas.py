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
import tempfile
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.atlas_lock import atlas_lock
from scripts.release_catalog import PublicationReader
from scripts.git_history import batch_reader
from app.modeling_guide import _load_associated_guide, guide_validation_batch
from scripts.atlas_metamodel import describe_metamodel
from scripts.atlas_documentation import separate_documentation
from scripts.document_catalog import asset_bytes
from scripts.structured_io import dumps as dump_yaml, read as read_document
from scripts import parsed_cache


EXPORT_NAMES = ('model.yaml', 'model.json', 'guide.json')
# Deliberate output-contract migration, independent of incidental code edits.
EXPORT_FORMAT_VERSION = 1


def cached_export(receipt, sources, *, with_source=False):
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
                    return (payloads, source) if with_source else payloads
            except OSError:
                continue
    except (OSError, ValueError, TypeError):
        pass
    return None


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n').encode('utf-8')


def legacy_receipt_hashes(root):
    """Read small legacy receipts once, never repeatedly read large exports."""
    result = set()
    for path in (root / '.runtime/atlas-export-receipts').glob('*.json'):
        try:
            hashes = json.loads(path.read_bytes())
            if isinstance(hashes, dict) and set(hashes) == set(EXPORT_NAMES):
                result.add(tuple(hashes[name] for name in EXPORT_NAMES))
        except (OSError, ValueError, TypeError):
            continue
    return result


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


def export_atlas(root=ROOT, destinations=None, *, incremental=True, require_cached=False):
    root = Path(root).resolve()
    with atlas_lock(root), batch_reader(root), guide_validation_batch():
        return _export_atlas(root, destinations, incremental=incremental, require_cached=require_cached)


def _export_atlas(root, destinations, *, incremental=True, require_cached=False):
    runtime = root / '.runtime'
    runtime.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='export-', dir=runtime) as directory:
        return _staged_export(root, destinations, Path(directory), incremental=incremental,
                              require_cached=require_cached)


def _staged_export(root, destinations, stage, *, incremental, require_cached):
    started = perf_counter()
    # Refuse the legacy directory-scanning fallback: the index is authoritative.
    index_path = root / 'modeles/release/index.json'
    before = index_path.read_bytes()
    reader = PublicationReader(index_path.parent)
    result = reader.catalog()
    schema_path = root / 'modeles/schemas/urbanism.schema.json'
    snapshot_schema = read_document(schema_path) if schema_path.is_file() else None
    destinations = [Path(path) for path in (destinations if destinations is not None else
                    [root / 'app/public/data'] + (
                    [root / 'app/dist/data'] if (root / 'app/dist/index.html').is_file() else []))]
    sources = list(dict.fromkeys([*destinations, root / 'app/public/data', root / 'app/dist/data']))
    if require_cached:
        # The frontend stages public/data. A valid copy in dist must never mask
        # corruption in that exact directory.
        sources = destinations or [root / 'app/public/data']
    catalog_seconds = perf_counter() - started
    model_seconds = guide_seconds = serialization_seconds = 0.0
    files = {}
    receipts = {}
    legacy_hashes = None
    reused = 0
    def stage_payload(relative, payload, existing=None):
        path = stage / relative
        if not path.resolve().is_relative_to(stage.resolve()):
            raise ValueError('Export path escapes staging')
        path.parent.mkdir(parents=True, exist_ok=True)
        if existing is not None:
            try:
                os.link(existing, path)
            except OSError:
                path.write_bytes(payload)
        else:
            path.write_bytes(payload)
        files[relative] = (path, hashlib.sha256(payload).hexdigest(), len(payload))

    def staged_bytes(entry):
        path, fingerprint, _ = entry
        content = path.read_bytes()
        if hashlib.sha256(content).hexdigest() != fingerprint:
            raise ValueError('Export staging changed before activation')
        return content

    for entry in result['versions']:
        version = entry['version']
        if not isinstance(version, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', version):
            raise ValueError('Invalid static publication version')
        step = perf_counter()
        descriptor = reader.verify_model(version)
        model_seconds += perf_counter() - step
        step = perf_counter()
        complete_guide = _load_associated_guide(root, version)
        guide_seconds += perf_counter() - step
        step = perf_counter()
        key = hashlib.sha256(encoded({'format': EXPORT_FORMAT_VERSION,
                                     'descriptor': descriptor, 'guide': complete_guide})).hexdigest()
        receipt = root / '.runtime/atlas-export-receipts' / (key + '.json')
        cached = cached_export(receipt, [source / version for source in sources], with_source=True) if incremental else None
        payloads, payload_source = cached if cached is not None else (None, None)
        if payloads is None:
            if require_cached:
                raise ValueError('Verified static export missing or outdated; run the data export first: ' + version)
            descriptor, raw = reader.load(version)
            metamodel_document, guide = separate_documentation(complete_guide, raw)
            model = {**raw,
                     'sourcePath': 'modeles/release/' + descriptor['path'],
                     'metamodel': describe_metamodel(raw, complete_guide, snapshot_schema)}
            if metamodel_document:
                model['metamodel']['documentation'] = metamodel_document
            model_json, guide_json = encoded(model), encoded(guide)
            # One-time migration from code-dependent receipts. Reuse only a
            # previously checksummed payload whose model and guide are identical.
            if incremental:
                if legacy_hashes is None:
                    legacy_hashes = legacy_receipt_hashes(root)
                for source in sources:
                    try:
                        candidate = {name: (source / version / name).read_bytes() for name in EXPORT_NAMES}
                    except OSError:
                        continue
                    hashes = tuple(hashlib.sha256(candidate[name]).hexdigest() for name in EXPORT_NAMES)
                    if hashes in legacy_hashes and candidate['model.json'] == model_json and candidate['guide.json'] == guide_json:
                        payloads = candidate
                        payload_source = source / version
                        reused += 1
                        break
            if payloads is None:
                payloads = {'model.yaml': dump_yaml(model).encode('utf-8'),
                            'model.json': model_json, 'guide.json': guide_json}
        else:
            reused += 1
            # The cached JSON has already passed parsing and publication metadata
            # checks when its receipt was created. Source bytes are checked above.
            raw = None
        document_key = hashlib.sha256(b'export-document-index-v1\0' + payloads['model.json']).hexdigest()
        document_directory = root / '.runtime/export-document-index'
        document_index = parsed_cache.get(document_key, directory=document_directory)
        if not isinstance(document_index, dict) or set(document_index) != {'documents'} or not isinstance(document_index['documents'], list):
            document_index = {'documents': (raw if raw is not None else json.loads(payloads['model.json'])).get('document_catalog', {}).get('documents', [])}
            parsed_cache.put(document_key, document_index, directory=document_directory)
        receipts[receipt] = encoded({name: hashlib.sha256(payload).hexdigest()
                                    for name, payload in payloads.items()})
        for name, payload in payloads.items():
            stage_payload(f'{version}/{name}', payload, payload_source / name if payload_source else None)
        for name in ('model', 'guide'):
            entry[name + '_sha256'] = hashlib.sha256(payloads[name + '.json']).hexdigest()
        entry['model_yaml_sha256'] = hashlib.sha256(payloads['model.yaml']).hexdigest()
        for document in document_index['documents']:
            stage_payload(f"{version}/documents/{document['id']}.pdf", asset_bytes(root, document))
        serialization_seconds += perf_counter() - step
    if index_path.read_bytes() != before:
        raise ValueError('Publication index changed during static export; retry.')
    reader.verify_descriptors()
    if require_cached:
        source = sources[0]
        if (source / 'index.json').read_bytes() != encoded(result) or any(
                (source / relative).read_bytes() != staged_bytes(payload) for relative, payload in files.items()):
            raise ValueError('Static export differs from the verified publication catalog; run the data export first')
    # Build everything before touching the served catalog. Keep older files for
    # readers whose catalog request preceded a release.
    write_started = perf_counter()
    for destination in destinations:
        destination = Path(destination)
        for relative, payload in files.items():
            atomic_write(destination / relative, staged_bytes(payload))
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
            'files': len(files) + 1, 'bytes': sum(value[2] for value in files.values()),
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
