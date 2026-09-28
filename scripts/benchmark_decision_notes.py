"""Read-only replay of an existing assessment to measure active note compaction.

This does not create an assessment, update decisions or publish a release.
"""
import argparse
import json
from pathlib import Path
import sys
import timeit

if __package__ in (None, ''):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.decision_review import apply_assessment
from scripts.structured_io import read


def measure(decisions_path, review_path):
    before = read(decisions_path)
    after, _ = apply_assessment(review_path, read(Path(review_path) / 'review.json'))
    scopes = lambda doc: {d['id']: {k: v for k, v in d.items() if k != 'note'}
                          for d in doc['decisions']}
    if scopes(before) != scopes(after):
        raise ValueError('Comparison requires the same decisions and exact scopes')
    result = {'decisions': len(before['decisions']), 'all_fields_except_note_identical': True,
              'simulation_only': True}
    for label, document in [('before', before), ('after', after)]:
        payload = json.dumps(document, ensure_ascii=False, indent=2)
        result[label + '_bytes'] = len(payload.encode('utf-8'))
        result[label + '_parse_ms'] = round(1000 * min(timeit.repeat(
            lambda: json.loads(payload), number=10, repeat=3)) / 10, 3)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--decisions', required=True, type=Path)
    parser.add_argument('--review', required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(measure(args.decisions, args.review), ensure_ascii=False, indent=2))
