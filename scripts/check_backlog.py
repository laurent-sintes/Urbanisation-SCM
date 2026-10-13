"""Check one final working batch without validating unrelated published snapshots."""
import argparse
import json
from pathlib import Path
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.structured_io import read
from scripts.validate_models import validate_urbanism, validate_sources
from scripts.backlog_delivery import check_delivery
from scripts.record_decision import record_intents


def check(root=ROOT, *, intents=None, render=False):
    root = Path(root).resolve()
    timings = {}
    started = perf_counter()
    model = read(root / 'modeles/backlog/model.yaml')
    model['glossary'] = read(root / 'modeles/backlog/glossary.yaml')
    source_document = read(root / 'modeles/provenance/source-records.json')
    sources = {s['id']: s for s in source_document['records']}
    schema = read(root / 'modeles/schemas/urbanism.schema.json')
    timings['load'] = perf_counter() - started
    step = perf_counter()
    errors = validate_sources(source_document) + validate_urbanism(model, sources, schema, require_function_mapping=True)
    timings['validate_backlog'] = perf_counter() - step
    step = perf_counter()
    stats = {}
    rows, delivery_errors = check_delivery(root, model, stats=stats)
    errors += delivery_errors
    timings['delivery'] = perf_counter() - step
    captures = 0
    if not errors and intents is not None:
        step = perf_counter()
        captures = sum(r['recorded'] for r in record_intents(root, intents))
        timings['capture'] = perf_counter() - step
    if not errors and render:
        from scripts.render_models import render as render_model
        from scripts.structured_io import write_text_if_changed
        step = perf_counter()
        destination = root / 'restitutions'
        destination.mkdir(exist_ok=True)
        write_text_if_changed(destination / 'backlog.md', render_model(model, 'Backlog'))
        timings['render'] = perf_counter() - step
    timings['total'] = perf_counter() - started
    return {'scope': 'backlog_only', 'errors': errors, 'captured_intents': captures,
            'nodes': len(model['nodes']), 'delivery_index': stats,
            'pending_lots': [r['path'] for r in rows if r['state'] == 'pending'],
            'timings_seconds': {k: round(v, 4) for k, v in timings.items()}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--intents', type=Path, help='Explicit reviewed record_intents parameters; never inferred')
    parser.add_argument('--render', action='store_true')
    args = parser.parse_args()
    result = check(args.root, intents=read(args.intents) if args.intents else None, render=args.render)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return bool(result['errors'])


if __name__ == '__main__':
    raise SystemExit(main())
