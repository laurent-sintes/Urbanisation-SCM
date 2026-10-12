"""Build a disposable object/graph/reference index from the canonical YAML bytes."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts import parsed_cache
from scripts.structured_io import read, _PARSER_SIGNATURE
from scripts.glossary import references
from scripts.model_index import ModelIndex


def build(model):
    graph = ModelIndex(model)
    return {'positions': {key: {item['id']: i for i, item in enumerate(model.get(key, []))}
                          for key in ('nodes', 'relations', 'principles')},
            'kinds': {kind: [node['id'] for node in model.get('nodes', []) if node.get('kind') == kind]
                      for kind in sorted({node.get('kind', '') for node in model.get('nodes', [])})},
            'parents': {identifier: [edge['source_id'] for edge in edges] for identifier, edges in graph.parents.items()},
            'incoming': {identifier: [edge['id'] for edge in edges] for identifier, edges in graph.incoming.items()},
            'outgoing': {identifier: [edge['id'] for edge in edges] for identifier, edges in graph.outgoing.items()},
            'term_users': term_users(model)}


def term_users(model):
    users = {}
    for collection in ('nodes', 'relations'):
        for item in model.get(collection, []):
            for field, value in item.items():
                for kind, target in set(references(value)):
                    if kind == 'glossary':
                        users.setdefault(target, []).append({'collection': collection, 'id': item['id'], 'field': field})
    return users


def load(root=ROOT):
    root = Path(root).resolve()
    paths = [root / 'modeles/backlog/model.yaml', root / 'modeles/backlog/glossary.yaml']
    fingerprints = {p.relative_to(root).as_posix(): sha256(p.read_bytes()).hexdigest() for p in paths}
    code = b''.join(Path(module).read_bytes() for module in (__file__, ROOT / 'scripts/model_index.py', ROOT / 'scripts/glossary.py'))
    key = sha256(_PARSER_SIGNATURE + code + json.dumps(fingerprints, sort_keys=True).encode()).hexdigest()
    cache = parsed_cache.get(key, directory=root / '.runtime/model-index')
    if (not isinstance(cache, dict) or cache.get('inputs') != fingerprints or cache.get('format') != 1
            or not isinstance(cache.get('index'), dict)
            or set(cache['index']) != {'positions', 'kinds', 'parents', 'incoming', 'outgoing', 'term_users'}):
        model = read(paths[0], expected_sha256=fingerprints[paths[0].relative_to(root).as_posix()])
        model['glossary'] = read(paths[1], expected_sha256=fingerprints[paths[1].relative_to(root).as_posix()])
        cache = {'format': 1, 'inputs': fingerprints, 'index': build(model)}
        if any(sha256(p.read_bytes()).hexdigest() != fingerprints[p.relative_to(root).as_posix()] for p in paths):
            raise ValueError('Model changed during index construction')
        parsed_cache.put(key, cache, directory=root / '.runtime/model-index')
    return cache


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--id')
    args = parser.parse_args()
    document = load(args.root)
    index = document['index']
    result = ({key: index[key].get(args.id, []) for key in ('parents', 'incoming', 'outgoing', 'term_users')}
              if args.id else {'inputs': document['inputs'], 'counts': {key: len(value) for key, value in index['positions'].items()}})
    print(json.dumps(result, ensure_ascii=False, indent=2))
