"""Exact field delta and conservative impact scope; never infer an agreement."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.structured_io import read, loads
from scripts.model_index import ModelIndex
from scripts.glossary import ReferenceIndex
from scripts.index_model import term_users
from scripts import parsed_cache
from scripts.dependency_signature import signature


def fields(before, after, prefix=''):
    if isinstance(before, dict) and isinstance(after, dict):
        return [path for key in sorted(before.keys() | after.keys())
                for path in (fields(before[key], after[key], prefix + key + '.')
                             if key in before and key in after else [prefix + key])]
    return [] if before == after else [prefix.rstrip('.')]


def delta(before, after):
    changes = []
    collections = {key: (before.get(key, []), after.get(key, [])) for key in ('nodes', 'relations', 'principles')}
    collections['terms'] = (before.get('glossary', {}).get('terms', []), after.get('glossary', {}).get('terms', []))
    for key in ('scenarios', 'paths', 'value_streams'):
        collections[key] = (before.get('scenario_catalog', {}).get(key, []), after.get('scenario_catalog', {}).get(key, []))
    for key in ('hotspots', 'documents'):
        catalog = 'hotspot_catalog' if key == 'hotspots' else 'document_catalog'
        collections[key] = (before.get(catalog, {}).get(key, []), after.get(catalog, {}).get(key, []))
    for collection, (old, new) in collections.items():
        old, new = ({item['id']: item for item in values} for values in (old, new))
        for identifier in sorted(old.keys() | new.keys()):
            changed = fields(old.get(identifier), new.get(identifier))
            if changed or identifier not in old or identifier not in new:
                changes.append({'collection': collection, 'id': identifier,
                                'state': 'added' if identifier not in old else 'removed' if identifier not in new else 'changed',
                                'fields': changed})
    nodes = {row['id'] for row in changes if row['collection'] == 'nodes'}
    term_changes = {row['id'] for row in changes if row['collection'] == 'terms'}
    for model in (before, after):
        graph = ModelIndex(model)
        for row in changes:
            if row['collection'] == 'relations':
                edge = graph.records['relations'].get(row['id'], {})
                nodes.update(edge[key] for key in ('source_id', 'target_id') if key in edge)
            if row['collection'] in ('paths', 'scenarios', 'value_streams'):
                for path in model.get('scenario_catalog', {}).get('paths', []):
                    nodes.update(c['node_id'] for step in path.get('steps', []) for c in step.get('contributions', []))
                    nodes.update(c['node_id'] for step in path.get('steps', []) for c in step.get('context_participants', []))
        affected_terms = ReferenceIndex(model.get('glossary', {}).get('terms', [])).changed_reachable(term_changes)
        for term, users in term_users(model).items():
            if term in affected_terms:
                for user in users:
                    if user['collection'] == 'nodes':
                        nodes.add(user['id'])
                    else:
                        edge = graph.records['relations'].get(user['id'], {})
                        nodes.update(edge[k] for k in ('source_id', 'target_id') if k in edge)
        neighbors = {edge[key] for identifier in list(nodes)
                     for edge in graph.incoming.get(identifier, []) + graph.outgoing.get(identifier, [])
                     for key in ('source_id', 'target_id')}
        nodes.update(graph.ancestors(nodes | neighbors))
    excluded = {'nodes', 'relations', 'principles', 'glossary', 'scenario_catalog', 'hotspot_catalog', 'document_catalog'}
    root_delta = fields({k: v for k, v in before.items() if k not in excluded},
                        {k: v for k, v in after.items() if k not in excluded})
    # Unknown catalogue/header changes retain a global impact rather than being lost.
    for catalog in ('glossary', 'scenario_catalog', 'hotspot_catalog', 'document_catalog'):
        known = {'terms', 'scenarios', 'paths', 'value_streams', 'hotspots', 'documents'}
        root_delta.extend(catalog + '.' + path for path in fields(
            {k: v for k, v in before.get(catalog, {}).items() if k not in known},
            {k: v for k, v in after.get(catalog, {}).items() if k not in known}))
    return {'format': 1, 'changes': changes, 'impacted_nodes': sorted(nodes),
            'global_fields': root_delta, 'global_impact': bool(root_delta or any(c['collection'] == 'principles' for c in changes))}


def document(root, ref=None):
    def load(relative):
        return loads(subprocess.check_output(['git', 'show', f'{ref}:{relative}'], cwd=root).decode('utf-8'), '.yaml') if ref else read(root / relative)
    result = load('modeles/backlog/model.yaml')
    result['glossary'] = load('modeles/backlog/glossary.yaml')
    return result


def indexed_delta(before, after, *, root=ROOT):
    content = json.dumps([before, after], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    key = sha256(signature(ROOT, ['scripts/delta_model.py']).encode() + content).hexdigest()
    directory = Path(root).resolve() / '.runtime/model-deltas'
    result = parsed_cache.get(key, directory=directory)
    if (not isinstance(result, dict) or result.get('format') != 1
            or not isinstance(result.get('changes'), list) or not isinstance(result.get('impacted_nodes'), list)
            or not isinstance(result.get('global_fields'), list) or type(result.get('global_impact')) is not bool):
        result = delta(before, after)
        parsed_cache.put(key, result, directory=directory)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--base', default='HEAD')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = indexed_delta(document(args.root, args.base), document(args.root), root=args.root)
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding='utf-8')
    print(text)
