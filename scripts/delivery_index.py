"""Derived declaration index: verify every source byte, parse only changed files."""
from hashlib import sha256
from pathlib import Path
try:
    from . import parsed_cache
    from .structured_io import read, _PARSER_SIGNATURE
except ImportError:
    import parsed_cache
    from structured_io import read, _PARSER_SIGNATURE


def declarations(root, stats=None):
    folder = Path(root) / 'modeles/backlog'
    directory = Path(root).resolve() / '.runtime/delivery-index'
    signature = sha256(Path(__file__).read_bytes() + _PARSER_SIGNATURE).digest()
    key = sha256(signature).hexdigest()
    cached_index = parsed_cache.get(key, directory=directory)
    if not isinstance(cached_index, dict):
        cached_index = {}
    entries = {}
    result = {}
    hits = parsed = 0
    for path in sorted(folder.glob('*.yaml')):
        content = path.read_bytes()
        fingerprint = sha256(content).hexdigest()
        cached = cached_index.get(path.name)
        if (isinstance(cached, dict) and set(cached) == {'source_sha256', 'present', 'declaration'}
                and type(cached['present']) is bool and cached['source_sha256'] == fingerprint):
            declaration = cached['declaration']
            present = cached['present']
            hits += 1
        else:
            doc = read(path)
            if path.read_bytes() != content:
                raise ValueError('Delivery source changed during indexing: ' + str(path))
            present = isinstance(doc, dict) and 'publication_delivery' in doc
            declaration = doc['publication_delivery'] if present else None
            parsed += 1
        entries[path.name] = {'source_sha256': fingerprint, 'present': present, 'declaration': declaration}
        if present:
            result[path.name] = declaration
    if parsed or set(entries) != set(cached_index):
        # One atomic cache write per batch, rather than scanning cache retention per file.
        parsed_cache.put(key, entries, directory=directory)
    if stats is not None:
        stats.update(files_verified=hits + parsed, declarations=len(result), cache_hits=hits, parsed_files=parsed)
    return result
