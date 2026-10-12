"""Validate enlarged synthetic models and mutation deltas without publishing."""
import argparse
from copy import deepcopy
import json
from pathlib import Path
import re
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.structured_io import read
from scripts.model_index import ModelIndex
from scripts.element_versions import content_hash
from scripts.validate_models import validate_urbanism
from scripts.delta_model import indexed_delta


def enlarged(model, factor):
    result = deepcopy(model)
    graph = ModelIndex(model)
    # Extend Business Areas inside an existing core subdomain, preserving the four systems.
    areas = [node for node in model['nodes'] if node['kind'] == 'business_area']
    selected = {node['id'] for node in areas}
    pending = list(selected)
    while pending:
        for edge in graph.children.get(pending.pop(), []):
            if edge['target_id'] not in selected:
                selected.add(edge['target_id'])
                pending.append(edge['target_id'])
    edges = [edge for edge in model['relations'] if edge['source_id'] in selected or
             (edge.get('type') in ('contains', 'presents') and edge['target_id'] in {n['id'] for n in areas})]
    for copy in range(1, factor):
        mapping = {identifier: f'PERF{copy}-{identifier}' for identifier in selected | {edge['id'] for edge in edges}}
        def remap(value):
            if isinstance(value, dict):
                return {k: remap(v) for k, v in value.items()}
            if isinstance(value, list):
                return [remap(v) for v in value]
            if isinstance(value, str):
                if value in mapping:
                    return mapping[value]
                return re.sub(r'(model:)([A-Za-z0-9_.-]+)', lambda match: match[1] + mapping.get(match[2], match[2]), value)
            return value
        for collection, objects in [('nodes', [n for n in model['nodes'] if n['id'] in selected]), ('relations', edges)]:
            for item in objects:
                clone = remap(item)
                clone['content_sha256'] = content_hash(clone)
                result[collection].append(clone)
    result['content_sha256'] = content_hash(result)
    return result


def benchmark(root=ROOT, factors=(1, 5, 10)):
    model = read(root / 'modeles/backlog/model.yaml')
    model['glossary'] = read(root / 'modeles/backlog/glossary.yaml')
    sources = {s['id']: s for s in read(root / 'modeles/provenance/source-records.json')['records']}
    schema = read(root / 'modeles/schemas/urbanism.schema.json')
    rows = []
    for factor in factors:
        fixture = enlarged(model, factor)
        start = perf_counter()
        errors = validate_urbanism(fixture, sources, schema)
        validation = perf_counter() - start
        if errors:
            raise ValueError('Invalid performance fixture: ' + '; '.join(errors[:10]))
        changed = deepcopy(fixture)
        next(n for n in changed['nodes'] if n['kind'] == 'capability')['fields']['definition'] += ' Synthetic benchmark precision.'
        for mode in ('first', 'reuse'):
            start = perf_counter()
            delta = indexed_delta(fixture, changed, root=root)
            seconds = perf_counter() - start
            rows.append({'factor': factor, 'mode': mode, 'nodes': len(fixture['nodes']), 'relations': len(fixture['relations']),
                         'validation_seconds': round(validation, 3), 'delta_seconds': round(seconds, 3),
                         'changed_objects': len(delta['changes']), 'validation_errors': 0})
        print(json.dumps(rows[-2:]), flush=True)
    return {'scope': 'Synthetic core expansion and one field mutation; no real publication or approval', 'runs': rows}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '.runtime/incremental-scale.json')
    args = parser.parse_args()
    result = benchmark()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding='utf-8')
