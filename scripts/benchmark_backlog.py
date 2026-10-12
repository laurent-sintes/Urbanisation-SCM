"""Measure working checks and identical agreement contexts; never capture/publish."""
import argparse
import json
from pathlib import Path
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.check_backlog import check
from scripts.structured_io import read
from scripts.record_decision import ContextIndex, semantic_context, compact_context, canonical_sha256


def benchmark(root=ROOT):
    root = Path(root)
    model = read(root / 'modeles/backlog/model.yaml')
    model['glossary'] = read(root / 'modeles/backlog/glossary.yaml')
    targets = [n['id'] for n in model['nodes'][:15]]
    contexts, timings = {}, {}
    for mode in ('reference', 'indexed'):
        started = perf_counter()
        index = ContextIndex(model) if mode == 'indexed' else None
        contexts[mode] = [index.context('nodes', target) if index else
                          compact_context(semantic_context(model, 'nodes', target)) for target in targets]
        timings[mode] = round(perf_counter() - started, 4)
    if contexts['reference'] != contexts['indexed']:
        raise ValueError('Indexed agreement context differs from reference')
    return {'scope': 'read_only_backlog_benchmark', 'targets': len(targets),
            'context_seconds': timings, 'context_sha256': canonical_sha256(contexts['reference']),
            'runs': [check(root), check(root)]}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = benchmark(args.root)
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(text, encoding='utf-8')
    print(text)
