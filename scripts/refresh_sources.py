"""Refresh the current source index without importing or publishing a model."""
from datetime import date
from pathlib import Path
import json
import argparse

try:
    from .migrate_urbanism import source_records
    from .publish_release import activate_pointer
    from .validate_models import validate_sources
except ImportError:
    from migrate_urbanism import source_records
    from publish_release import activate_pointer
    from validate_models import validate_sources


def main(*, check=False):
    document = {'schema_version':'1.0.0', 'captured_at':date.today().isoformat(), 'records':source_records()}
    errors = validate_sources(document)
    if errors:
        raise ValueError('\n'.join(errors))
    path = Path(__file__).resolve().parents[1] / 'modeles/provenance/source-records.json'
    if check:
        if not path.is_file():
            raise ValueError('Source index missing; run python scripts/refresh_sources.py')
        current = json.loads(path.read_text(encoding='utf-8-sig'))
        if current.get('schema_version') != document['schema_version'] or current.get('records') != document['records']:
            raise ValueError('Source index stale; run python scripts/refresh_sources.py')
        print(f'Current source index verified: {len(document["records"])} records.')
        return
    if not path.exists() or json.loads(path.read_text(encoding='utf-8-sig')) != document:
        activate_pointer(path, document)
    print(f'Current source index refreshed: {len(document["records"])} records; frozen files unchanged.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify the index without changing its capture date')
    main(check=parser.parse_args().check)
