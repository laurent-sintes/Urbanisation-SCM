"""Measure draft construction and safe reuse without publishing or granting approval."""
import argparse
import json
from pathlib import Path
from time import perf_counter
from unittest.mock import patch

from scripts import prepare_release as workflow


def benchmark(root, version, source):
    rows, before = [], None
    get_cached = workflow.parsed_cache.get
    for mode in ('rebuild', 'reuse'):
        started = perf_counter()
        with patch.object(workflow, 'reconcile_decisions', wraps=workflow.reconcile_decisions) as reconcile, \
                patch.object(workflow, 'validate_release', wraps=workflow.validate_release) as validate:
            if mode == 'rebuild':
                with patch.object(workflow.parsed_cache, 'get', side_effect=lambda key, **kwargs:
                                  workflow.parsed_cache.MISSING if 'directory' in kwargs else get_cached(key, **kwargs)):
                    bundle = workflow.build_candidate(root, version, [source], include_review=True, lightweight=True)
            else:
                bundle = workflow.build_candidate(root, version, [source], include_review=True, lightweight=True)
        values = {key: bundle[key] for key in ('candidate', 'snapshot', 'decisions', 'report', 'review')}
        fingerprint = workflow.canonical_sha256(values)
        if before is not None and before != fingerprint:
            raise ValueError('Reused draft changed candidate or evidence')
        before = fingerprint
        rows.append({'mode': mode, 'seconds': round(perf_counter() - started, 3),
                     'draft_cache_hit': bundle['draft_cache_hit'], 'reconciliations': reconcile.call_count,
                     'validations': validate.call_count, 'content_sha256': fingerprint,
                     'validation_errors': len(bundle['report']['validation_errors'])})
    return {'scope': 'Read-only candidate preparation; no release, activation or approval', 'runs': rows}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', required=True)
    parser.add_argument('--source', required=True)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = benchmark(Path(__file__).resolve().parents[1], args.version, args.source)
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        args.output.write_text(text, encoding='utf-8')
    print(text)
