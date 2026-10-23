"""Sharded YAML approval registry; published monolithic registries remain readable."""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import os
import re
import tempfile

try:
    from .git_history import enabled
    from .structured_io import read, loads, dumps, ModelLoader
except ImportError:
    from git_history import enabled
    from structured_io import read, loads, dumps, ModelLoader

FORMAT = 'decision-intents-index-v1'


def contract():
    # Lazy import keeps record_decision's public API compatible.
    try:
        from . import record_decision
    except ImportError:
        import record_decision
    return record_decision


def is_index(document):
    return isinstance(document, dict) and document.get('format') == FORMAT


def summary(intent):
    result = {k: deepcopy(intent[k]) for k in ('id', 'source_refs')}
    result['target'] = {k: deepcopy(intent['target'][k]) for k in ('collection', 'id', 'approved_fields')}
    if 'supersedes' in intent:
        result['supersedes'] = intent['supersedes']
    return result


def shard_path(path, entry):
    relative = entry.get('path', '')
    if not isinstance(relative, str) or not re.fullmatch(r'decision-intents/(?:active|archive)/[a-f0-9]{64}\.yaml', relative):
        raise ValueError('Invalid registry shard path')
    target = path.parent / relative
    if not target.resolve().is_relative_to(path.parent.resolve()):
        raise ValueError('Registry shard escapes its directory')
    return target


def verify_index(path, document, sources=None):
    """Check the entire byte inventory on every write, without parsing old captures."""
    r = contract()
    if (not isinstance(document, dict) or not is_index(document)
            or set(document) != {'format', 'schema_version', 'entries', 'suspensions'} or document['schema_version'] != '1.0.0'):
        raise ValueError('Invalid registry index schema')
    entries = r._records(document['entries'], 'registry entries')
    known = r._source_ids(sources) if sources is not None else None
    paths = set()
    for entry in entries.values():
        keys = {'id', 'source_refs', 'target', 'path', 'sha256'}
        if set(entry) not in (keys, keys | {'supersedes'}):
            raise ValueError('Invalid registry entry')
        target = entry['target']
        if not isinstance(target, dict) or set(target) != {'collection', 'id', 'approved_fields'} or target['collection'] not in ('nodes', 'relations', 'principles'):
            raise ValueError('Invalid registry target')
        r._text(target['id'], 'target id')
        r._strings(target['approved_fields'], 'approved fields')
        refs = r._strings(entry['source_refs'], 'source refs')
        if known is not None and set(refs) - known:
            raise ValueError('Unknown decision sources')
        source = shard_path(path, entry)
        digest = entry['sha256']
        if not isinstance(digest, str) or not re.fullmatch('[a-f0-9]{64}', digest) or source.stem != digest:
            raise ValueError('Invalid registry shard digest or filename: ' + entry['id'])
        if entry['path'] in paths:
            raise ValueError('Duplicate registry shard path')
        paths.add(entry['path'])
        if not source.is_file() or sha256(source.read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError('Registry shard hash mismatch: ' + entry['id'])
    r.superseded_intents({'intents': list(entries.values())})
    # Use the same suspension contract as monolithic registries.
    r.validate_suspensions(document['suspensions'], entries, known)
    return document


def load_entry(path, entry):
    source = shard_path(path, entry)
    content = source.read_bytes()
    if sha256(content).hexdigest() != entry['sha256']:
        raise ValueError('Registry shard hash mismatch: ' + entry['id'])
    values = read(source)
    if source.read_bytes() != content:
        raise ValueError('Registry shard changed during reading: ' + entry['id'])
    if not isinstance(values, list) or len(values) != 1:
        raise ValueError('Registry shard must contain exactly one intent: ' + entry['id'])
    contract().validate_document({'schema_version': '1.0.0', 'intents': values})
    if summary(values[0]) != {k: v for k, v in entry.items() if k not in ('path', 'sha256')}:
        raise ValueError('Registry shard summary mismatch: ' + entry['id'])
    return values[0]


def read_registry(path, sources=None):
    path = Path(path)
    document = read(path)
    if is_index(document):
        verify_index(path, document, sources)
        document = {'schema_version': '1.0.0', 'intents': [load_entry(path, e) for e in document['entries']],
                    'suspensions': document['suspensions']}
    contract().validate_document(document, sources)
    contract().superseded_intents(document)
    return document


def read_consumed_registry(root, version, sources=None):
    """Require the registry declared by the publication, even if it disappeared."""
    root = Path(root)
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', version):
        raise ValueError('Invalid consumed registry version')
    if enabled(root):
        return None  # Published approvals live in the current decisions, past states in Git.
    base = root / 'modeles/revisions' / version
    frozen = base / 'deferred/decision-intents.yaml'
    manifest_path = root / 'modeles/release' / version / 'manifest.json'
    manifest = read(manifest_path) if manifest_path.exists() else {}
    inventory = manifest.get('decision_registry_files')
    if 'decision_registry_files' in manifest and not isinstance(inventory, dict):
        raise ValueError('Invalid frozen registry inventory')
    if inventory is None and 'prepared_manifest_sha256' in manifest:
        prepared_path = root / 'modeles/staging' / version / 'manifest.json'
        if not prepared_path.is_file() or sha256(prepared_path.read_bytes()).hexdigest() != manifest['prepared_manifest_sha256']:
            raise ValueError('Frozen registry inventory: prepared manifest missing or changed')
        prepared = read(prepared_path)
        inventory = {e['path']: e['sha256'] for e in prepared['deferred']
                     if e['path'] == 'deferred/decision-intents.yaml' or e['path'].startswith('deferred/decision-intents/')}
    if inventory is not None:
        if not isinstance(inventory, dict):
            raise ValueError('Invalid frozen registry inventory')
        for relative, digest in inventory.items():
            if (relative != 'deferred/decision-intents.yaml' and not re.fullmatch(
                    r'deferred/decision-intents/(?:active|archive)/[a-f0-9]{64}\.yaml', relative)):
                raise ValueError('Invalid frozen registry inventory path')
            path = base / relative
            if (not path.resolve().is_relative_to(base.resolve()) or not path.is_file()
                    or sha256(path.read_bytes()).hexdigest() != digest):
                raise ValueError('Frozen registry artifact missing or changed: ' + relative)
        expected = set()
        if frozen.exists():
            expected.add('deferred/decision-intents.yaml')
            index = read(frozen)
            if is_index(index):
                expected.update('deferred/' + e['path'] for e in index['entries'])
        if set(inventory) != expected:
            raise ValueError('Frozen registry inventory mismatch')
    return read_registry(frozen, sources) if frozen.exists() else None


def validate_project_registry(root, sources, version):
    """Exhaustive integrity check, without deciding whether pending approvals carry."""
    root = Path(root)
    path = root / contract().REGISTRY_PATH
    frozen = root / 'modeles/revisions' / version / 'deferred/decision-intents.yaml'
    errors, counters = [], {}
    try:
        consumed = read_consumed_registry(root, version, sources)
        if not path.exists():
            if frozen.exists() or any((path.parent / 'decision-intents').rglob('*.yaml')):
                raise ValueError('Decision registry index is missing')
            return errors, {'decision_intents': 0}
        document = read_registry(path, sources)
        contract().validate_consumed_intents(document, consumed)
        index = read(path)
        referenced = {shard_path(path, e).resolve() for e in index['entries']} if is_index(index) else set()
        counters = {'decision_intents': len(document['intents']),
                    'decision_suspensions': len(document.get('suspensions', [])),
                    'decision_shards': len(referenced),
                    'decision_unreferenced_shards': sum(p.resolve() not in referenced for p in (path.parent / 'decision-intents').rglob('*.yaml'))}
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append('decision-intents: ' + str(exc))
    return errors, counters


def store_shard(path, intent, content=None, section='active'):
    content = content if content is not None else dumps([intent]).encode('utf-8')
    digest = sha256(content).hexdigest()
    entry = summary(intent) | {'path': f'decision-intents/{section}/{digest}.yaml', 'sha256': digest}
    target = shard_path(path, entry)
    target.parent.mkdir(parents=True, exist_ok=True)
    # Immutable, content-addressed file; an interrupted write cannot enter the index.
    if target.exists():
        if target.read_bytes() != content:
            raise ValueError('Existing registry shard was changed')
    else:
        atomic_replace(target, None, content)
    return entry


def atomic_replace(path, before, content):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.decision-intents-', suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        if (path.read_bytes() if path.exists() else None) != before:
            raise ValueError('Decision intent registry changed concurrently')
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def migrate(root, archived_ids=()):
    """Split exact YAML item spans; validate equivalence before the atomic switch."""
    r = contract()
    path = Path(root) / r.REGISTRY_PATH
    with r._registry_lock(path):
        before = path.read_bytes()
        original = read(path)
        if is_index(original):
            read_registry(path)
            return {'migrated': False, 'entries': len(original['entries'])}
        r.validate_document(original)
        r.superseded_intents(original)
        text = before.decode('utf-8-sig')
        loader = ModelLoader(text)
        try:
            tree = loader.get_single_node()
            sequence = next(value for key, value in tree.value if key.value == 'intents')
            # Use parser boundaries for item values and retain the leading dash.
            if sequence.flow_style or sequence.start_mark.column != 0:
                raise ValueError('Migration requires a root block sequence')
            starts = [text.rfind('\n', 0, item.start_mark.index) + 1 for item in sequence.value]
            ends = starts[1:] + [sequence.end_mark.index]
        finally:
            loader.dispose()
        index = {'format': FORMAT, 'schema_version': '1.0.0', 'entries': [],
                 'suspensions': deepcopy(original.get('suspensions', []))}
        for intent, start, end in zip(original['intents'], starts, ends):
            content = text[start:end].encode('utf-8')
            if loads(content.decode('utf-8')) != [intent]:
                raise ValueError('Migration item differs from original')
            index['entries'].append(store_shard(path, intent, content,
                'archive' if intent['id'] in archived_ids else 'active'))
        verify_index(path, index)
        reconstructed = {'schema_version': '1.0.0', 'intents': [load_entry(path, e) for e in index['entries']], 'suspensions': index['suspensions']}
        if reconstructed != original | {'suspensions': original.get('suspensions', [])}:
            raise ValueError('Migration changed registry values')
        atomic_replace(path, before, dumps(index).encode('utf-8'))
        return {'migrated': True, 'entries': len(index['entries']), 'before_bytes': len(before),
                'index_bytes': path.stat().st_size, 'before_sha256': sha256(before).hexdigest()}


def record_sharded(root, path, before, index, parameters, snapshot, sources):
    r = contract()
    context_index = r.ContextIndex(snapshot)
    verify_index(path, index, sources)
    entries = {e['id']: e for e in index['entries']}
    pending, results = {}, []
    for params in parameters:
        identifier = params.get('intent_id')
        predecessor = params.get('supersedes')
        if isinstance(predecessor, str) and predecessor in entries:
            # A replacement must use the immutable capture, never an unchecked summary.
            old = load_entry(path, entries[predecessor])
            r.validate_document({'schema_version': '1.0.0', 'intents': [old]}, sources)
        existing = pending.get(identifier) or (load_entry(path, entries[identifier]) if identifier in entries else None)
        if existing:
            r.validate_document({'schema_version': '1.0.0', 'intents': [existing]}, sources)
        intent = r.make_intent(snapshot, sources, **params, context_index=context_index, recorded_at=existing['recorded_at'] if existing else None,
                               legacy_context=bool(existing and 'format' not in existing['target']['context']))
        if existing and existing != intent:
            raise ValueError('Decision intent ID already exists with different content: ' + identifier)
        results.append({'recorded': existing is None, 'path': str(path), 'intent': intent})
        if existing is None:
            pending[identifier] = intent
    if not pending:
        return results
    r.superseded_intents({'intents': index['entries'] + [summary(i) for i in pending.values()]})
    for intent in pending.values():
        index['entries'].append(store_shard(path, intent))
    verify_index(path, index, sources)
    atomic_replace(path, before, dumps(index).encode('utf-8'))
    return results


if __name__ == '__main__':
    import argparse
    import json
    parser = argparse.ArgumentParser(description='Split the live approval registry without publishing.')
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    release = args.root / 'modeles/release'
    pointer = read(release / 'index.json')
    descriptor = read(release / pointer['current'])
    consumed = read_consumed_registry(args.root, descriptor['version']) or {'intents': []}
    print(json.dumps(migrate(args.root, {i['id'] for i in consumed['intents']}), indent=2))
