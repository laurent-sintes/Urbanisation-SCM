"""Human-authored YAML and immutable legacy JSON share the same data contract.

Only JSON-compatible values are supported. YAML aliases, duplicate keys and
non-string mapping keys are rejected; dates and identifiers stay strings.
Content hashes elsewhere use canonical JSON, independently of file formatting.
"""
import json
import math
from pathlib import Path
import re
import sys
from collections import OrderedDict
from copy import deepcopy
from hashlib import sha256
from threading import RLock
try:
    from . import parsed_cache
    from .git_history import read_bytes
except ImportError:
    import parsed_cache
    from git_history import read_bytes

DEPENDENCIES = Path(__file__).resolve().parents[1] / '.tools/yaml-runtime'
if DEPENDENCIES.is_dir():
    sys.path.insert(0, str(DEPENDENCIES))
try:
    import yaml
except ImportError as exc:
    raise RuntimeError('PyYAML requis : python -m pip install --target .tools/yaml-runtime -r requirements.txt') from exc


class ModelLoader(yaml.SafeLoader):
    def compose_node(self, parent, index):
        # Reject aliases during composition, without parsing the whole file twice.
        if self.check_event(yaml.AliasEvent):
            raise ValueError('YAML aliases are not supported in models')
        return super().compose_node(parent, index)


# Deliberately narrower than all of YAML: no yes/on booleans, octal or dates.
ModelLoader.yaml_implicit_resolvers = {}
ModelLoader.add_implicit_resolver('tag:yaml.org,2002:null', re.compile(r'^(?:null|~|)$'), ['n', '~', ''])
ModelLoader.add_implicit_resolver('tag:yaml.org,2002:bool', re.compile(r'^(?:true|false)$'), ['t', 'f'])
ModelLoader.add_implicit_resolver('tag:yaml.org,2002:int', re.compile(r'^-?(?:0|[1-9][0-9]*)$'), list('-0123456789'))
ModelLoader.add_implicit_resolver('tag:yaml.org,2002:float', re.compile(r'^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+(?:[eE][+-]?[0-9]+)?|[eE][+-]?[0-9]+)$'), list('-0123456789'))


def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if not isinstance(key, str):
            raise ValueError('Model mapping keys must be strings')
        if key in result:
            raise ValueError('duplicate key: ' + key)
        result[key] = value
    return result


def construct_mapping(loader, node):
    return unique_pairs((loader.construct_object(k, deep=True), loader.construct_object(v, deep=True))
                        for k, v in node.value)


ModelLoader.add_constructor('tag:yaml.org,2002:map', construct_mapping)


# Keep the strict Python loader for parser marks used by append/migration tools.
# LibYAML handles ordinary reads; its composer cannot override compose_node, so
# reject alias events explicitly before constructing the document.
if hasattr(yaml, 'CSafeLoader'):
    class NativeModelLoader(yaml.CSafeLoader):
        pass
    NativeModelLoader.yaml_implicit_resolvers = ModelLoader.yaml_implicit_resolvers.copy()
    NativeModelLoader.add_constructor('tag:yaml.org,2002:map', construct_mapping)
else:
    NativeModelLoader = None


def check_values(value):
    if value is None or type(value) in (str, bool, int):
        return
    if type(value) is float and math.isfinite(value):
        return
    if type(value) is list:
        for item in value:
            check_values(item)
        return
    if type(value) is dict and all(type(k) is str for k in value):
        for item in value.values():
            check_values(item)
        return
    raise ValueError('Only finite JSON-compatible model values are allowed')


def loads(text, suffix='.yaml'):
    try:
        if suffix.lower() in ('.yaml', '.yml'):
            if NativeModelLoader is not None:
                for event in yaml.parse(text, Loader=NativeModelLoader):
                    if isinstance(event, yaml.AliasEvent):
                        raise ValueError('YAML aliases are not supported in models')
            value = yaml.load(text, Loader=NativeModelLoader or ModelLoader)
        else:
            value = json.loads(text, object_pairs_hook=unique_pairs)
        check_values(value)
        return value
    except yaml.YAMLError as exc:
        raise ValueError('Invalid model YAML: ' + str(exc)) from exc


# Cache parsed content, never filesystem metadata or mutable caller objects.
# Reading and hashing bytes on every call detects changes even at equal mtime/size.
# Bounded by both entry count and source size (parsed objects can be larger).
_cache = OrderedDict()
_cache_bytes = 0
_cache_lock = RLock()
_CACHE_LIMIT = 128 * 1024 * 1024
_CACHE_ENTRIES = 128
# An implementation/runtime change invalidates persisted parses, including the
# JSON-only contract and alias/duplicate rejection. Source bytes are always read.
_PARSER_SIGNATURE = sha256(Path(__file__).read_bytes() +
                          Path(parsed_cache.__file__).read_bytes() +
                          (sys.version + yaml.__version__ + str(NativeModelLoader is not None)).encode()).digest()
_DISK_MIN_BYTES = 4096


def clear_read_cache():
    global _cache_bytes
    with _cache_lock:
        _cache.clear()
        _cache_bytes = 0


def read(path, *, expected_sha256=None):
    global _cache_bytes
    path = Path(path)
    content = read_bytes(path)
    key = (path.suffix.lower(), sha256(content).digest())
    if expected_sha256 is not None and key[1].hex() != expected_sha256:
        raise ValueError('Structured file hash mismatch: ' + str(path))
    with _cache_lock:
        cached = _cache.get(key)
        if cached is not None:
            _cache.move_to_end(key)
            return deepcopy(cached[0])
        disk_key = sha256(_PARSER_SIGNATURE + key[0].encode() + key[1]).hexdigest()
        use_disk = key[0] in ('.yaml', '.yml') and len(content) >= _DISK_MIN_BYTES
        value = parsed_cache.get(disk_key) if use_disk else parsed_cache.MISSING
        if value is not parsed_cache.MISSING:
            try:
                check_values(value)
            except ValueError:
                value = parsed_cache.MISSING
        if value is parsed_cache.MISSING:
            value = loads(content.decode('utf-8-sig'), path.suffix)
            if use_disk:
                parsed_cache.put(disk_key, value)
        # A single large context must not evict the working set of small models.
        # Larger documents still benefit from the independent disk cache.
        if len(content) <= _CACHE_LIMIT // 2:
            _cache[key] = (value, len(content))
            _cache_bytes += len(content)
            while _cache_bytes > _CACHE_LIMIT or len(_cache) > _CACHE_ENTRIES:
                _, (_, size) = _cache.popitem(last=False)
                _cache_bytes -= size
        return deepcopy(value)


def write_text_if_changed(path, text):
    """Write a derived view only when its text changes; not for immutable evidence."""
    path = Path(path)
    if path.exists() and path.read_text(encoding='utf-8') == text:
        return False
    path.write_text(text, encoding='utf-8')
    return True


class ModelDumper(getattr(yaml, 'CSafeDumper', yaml.SafeDumper)):
    def ignore_aliases(self, data):
        return True


def represent_text(dumper, value):
    return dumper.represent_scalar('tag:yaml.org,2002:str', value, style='|' if '\n' in value else None)


ModelDumper.add_representer(str, represent_text)


def dumps(document, suffix='.yaml'):
    check_values(document)
    if suffix.lower() in ('.yaml', '.yml'):
        # Round-trip assertion catches a future dumper/loader scalar mismatch.
        text = yaml.dump(document, Dumper=ModelDumper, allow_unicode=True, sort_keys=False,
                         default_flow_style=False, width=120)
        if loads(text) != document:
            raise ValueError('YAML serialization would change model values')
        return text
    return json.dumps(document, ensure_ascii=False, indent=2, allow_nan=False) + '\n'


def _sequence_cache_key(content, key):
    return sha256(_PARSER_SIGNATURE + b'block-sequence-append-v1\0' +
                  key.encode('utf-8') + b'\0' + sha256(content).digest()).hexdigest()


def load_for_sequence_append(content, key):
    """Read exact YAML bytes and locate a root block sequence using parser marks.

    The disposable cache stores both values and the character offset, bound to
    source bytes and parser code. No regex guesses at keys inside quoted text.
    Unsupported layouts remain valid but use the full round-trip writer.
    """
    cache_key = _sequence_cache_key(content, key)
    cached = parsed_cache.get(cache_key)
    text = content.decode('utf-8-sig')
    if isinstance(cached, dict) and set(cached) == {'document', 'offset'}:
        offset = cached['offset']
        if offset is None or (type(offset) is int and 0 <= offset <= len(text)):
            try:
                check_values(cached['document'])
                return cached['document'], offset
            except ValueError:
                pass
    loader = ModelLoader(text)
    try:
        root = loader.get_single_node()
        document = loader.construct_document(root) if root is not None else None
        check_values(document)
        offset = None
        if isinstance(root, yaml.MappingNode):
            for name, value in root.value:
                if (name.value == key and isinstance(value, yaml.SequenceNode)
                        and not value.flow_style and value.start_mark.column == 0
                        and value.end_mark.column == 0):
                    offset = value.end_mark.index
    except yaml.YAMLError as exc:
        raise ValueError('Invalid model YAML: ' + str(exc)) from exc
    finally:
        loader.dispose()
    parsed_cache.put(cache_key, {'document': document, 'offset': offset})
    return document, offset


def dump_sequence_append(content, document, key, items, offset):
    """Serialize only new items in a previously loaded root block sequence.

    Caller has appended exactly ``items`` to the parsed document and validated
    its business contract. Parser-derived boundaries keep old bytes intact;
    dumps still checks every newly serialized value by a strict round trip.
    """
    if offset is None:
        return dumps(document).encode('utf-8')
    text = content.decode('utf-8-sig')
    fragment = dumps(items)
    if '\r\n' in text:
        fragment = fragment.replace('\n', '\r\n')
    newline = '\r\n' if '\r\n' in text else '\n'
    if offset and text[offset - 1] not in '\r\n':
        fragment = newline + fragment
    result = (text[:offset] + fragment + text[offset:]).encode('utf-8')
    if content.startswith(b'\xef\xbb\xbf'):
        result = b'\xef\xbb\xbf' + result
    parsed_cache.put(_sequence_cache_key(result, key),
                     {'document': document, 'offset': offset + len(fragment)})
    return result


def working_path(folder, stem='model'):
    """One live authority; JSON is supported for legacy fixtures/migrations only."""
    folder = Path(folder)
    paths = [folder / (stem + suffix) for suffix in ('.yaml', '.yml', '.json')]
    existing = [p for p in paths if p.exists()]
    if len(existing) > 1:
        raise ValueError('Competing model authorities: ' + ', '.join(str(p) for p in existing))
    return existing[0] if existing else paths[0]
