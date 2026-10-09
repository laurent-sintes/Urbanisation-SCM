"""The working model's file inventory is evidence, separate from its semantics."""

import re


def validate_model_provenance(document):
    if not isinstance(document, dict) or set(document) != {'schema_version', 'model_id', 'source_version', 'source_files'} or document.get('schema_version') != '1.0.0' or document.get('model_id') != 'flow-urbanism':
        return ['model provenance: invalid identity']
    if not isinstance(document.get('source_version'), str) or not document['source_version'].strip():
        return ['model provenance: source_version is required']
    files = document.get('source_files')
    if not isinstance(files, list):
        return ['model provenance: source_files must be a list']
    errors, seen = [], set()
    for entry in files:
        if not isinstance(entry, dict) or set(entry) != {'path', 'sha256'} or not isinstance(entry['path'], str) or not entry['path'].strip() or entry['path'].startswith(('/', '\\')) or '..' in entry['path'].replace('\\', '/').split('/') or not re.fullmatch(r'[0-9a-f]{64}', entry['sha256'] if isinstance(entry['sha256'], str) else ''):
            errors.append('model provenance: invalid source file entry')
            continue
        if entry['path'] in seen:
            errors.append('model provenance: duplicate source file ' + entry['path'])
        seen.add(entry['path'])
    return errors
