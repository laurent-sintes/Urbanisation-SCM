"""Compile a complete, qualified publication from frozen JSON inputs.

Publication never grants business approval. No Markdown model is read here.
Use a new YYYY-MM-DD.N version. Existing version directories are never overwritten.
Old evidence always comes from the manifest's frozen provenance. Current records
are read only for explicitly requested publication sources: new IDs may be added;
an old ID explicitly reused with contradictory content is refused. Changes to
unrelated current records do not change or invalidate the frozen evidence.
"""
import argparse
import copy
from datetime import date
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

try:
    from .validate_models import _load as read, validate_release, validate_sources, relations_to_illustrations
    from .structured_io import dumps
except ImportError:
    from validate_models import _load as read, validate_release, validate_sources, relations_to_illustrations
    from structured_io import dumps

ROOT = Path(__file__).resolve().parents[1]


try:
    from .git_history import read_bytes
except ImportError:
    from git_history import read_bytes


def digest(path):
    return hashlib.sha256(read_bytes(path)).hexdigest()


def copy_verified(source, destination, expected_sha256):
    """Copy frozen bytes exclusively, checking both the stream and destination.

    No parser/serializer can normalize evidence. A changing source or damaged
    destination fails before activation; only our newly created file is removed.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    created = False
    try:
        fingerprint = hashlib.sha256()
        with source.open('rb') as incoming, destination.open('xb') as outgoing:
            created = True
            for chunk in iter(lambda: incoming.read(1024 * 1024), b''):
                fingerprint.update(chunk)
                outgoing.write(chunk)
            outgoing.flush()
            os.fsync(outgoing.fileno())
        if fingerprint.hexdigest() != expected_sha256 or digest(destination) != expected_sha256:
            raise ValueError('Copied artifact hash mismatch: ' + str(source))
    except BaseException:
        if created:
            destination.unlink(missing_ok=True)
        raise


def write(path, document):
    """Create a new artifact exclusively; never replace a released file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8', newline='\n') as handle:
        handle.write(dumps(document, path.suffix))
        handle.flush()
        os.fsync(handle.fileno())


def activate_pointer(path, document):
    """Replace the current pointer atomically after all artifacts are complete."""
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n',
                                         dir=path.parent, prefix='.current-', suffix='.tmp',
                                         delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(document, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write('\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def publication_sources(frozen, live, source_refs):
    """Preserve frozen records; add only requested new publication source IDs."""
    if (not source_refs or any(not isinstance(ref, str) for ref in source_refs)
            or len(source_refs) != len(set(source_refs))):
        raise ValueError('Publication sources must be a nonempty unique list of IDs')
    errors = validate_sources(frozen)
    if errors:
        raise ValueError('\n'.join(errors))
    old = {r['id']: r for r in frozen['records']}
    current = {}
    for record in live['records']:
        if record['id'] in current:
            raise ValueError('Duplicate live source ID: ' + record['id'])
        current[record['id']] = record
    merged = copy.deepcopy(frozen)
    for ref in source_refs:
        if ref in old:
            if ref in current and any(current[ref].get(key) != old[ref].get(key)
                                      for key in ('captured_text', 'content_sha256', 'path', 'anchor')):
                raise ValueError('Publication source reuses frozen ID with contradictory content: ' + ref)
            continue
        if ref not in current:
            raise ValueError('Unknown publication source: ' + ref)
        errors = validate_sources({'records': [current[ref]]})
        if errors:
            raise ValueError('\n'.join(errors))
        merged['records'].append(copy.deepcopy(current[ref]))
    return merged


def compile_snapshot(snapshot, decisions, version, publication_refs):
    release = {k: copy.deepcopy(v) for k, v in snapshot.items() if k not in ('nodes', 'relations', 'alternatives')}
    release.update(space='release', version=version, release_kind='published_snapshot')
    release['publication'] = {'source_refs': publication_refs, 'note': 'Publication complète demandée par Laurent ; publier ne vaut pas valider.'}
    release['nodes'], release['relations'], release['excluded_nodes'] = [], [], []
    context_relations = relations_to_illustrations(snapshot)
    for collection in ('nodes', 'relations'):
        for original in snapshot[collection]:
            if original['review']['state'] == 'illustration':
                if collection == 'nodes':
                    release['excluded_nodes'].append({'id': original['id'], 'source_refs': original['source_refs'], 'reason': 'Illustration conservée dans le backlog.'})
                continue
            if collection == 'relations' and original['id'] in context_relations:
                continue
            item = copy.deepcopy(original)
            adoptions = [d for d in decisions['decisions'] if d['decision_state'] == 'accepted' and d['target']['collection'] == collection and d['target']['id'] == item['id'] and d['target']['revision'] == item['revision']]
            item['adoption_ids'] = [d['id'] for d in adoptions]
            approved = {f for d in adoptions for f in d['target']['approved_fields']}
            # A deferred agreement must not survive through copied lifecycle
            # metadata. Preserve the input proof, narrow only the new publication.
            cycle = item.get('lifecycle')
            if cycle and set(cycle.get('validated_fields', [])) - approved:
                cycle['validated_fields'] = [f for f in cycle['validated_fields'] if f in approved]
                cycle['value_sha256'] = {f: v for f, v in cycle.get('value_sha256', {}).items() if f in approved}
                if not cycle['validated_fields'] and cycle.get('state') == 'urbanist_validated':
                    cycle['state'] = 'under_instruction'
            if collection == 'nodes':
                item['approved_fields'] = sorted(approved)
                item['proposed_fields'] = sorted(set(item['fields']) - approved)
                # Contextual agreements keep their qualified status. Nine explicit
                # D03 approvals cover all fields in this first published snapshot.
                all_explicit = adoptions and all(d['interpretation'] == 'explicit' for d in adoptions)
                state = 'accepted' if approved == set(item['fields']) and all_explicit else 'partial' if adoptions else 'proposed'
                if original['review']['state'] == 'under_review':
                    state = 'under_review'
            else:
                state = original['review']['state'] if adoptions else 'proposed'
            item['review'] = {'state': state, 'note': original['review']['note']}
            release[collection].append(item)
    release['limitations'] = [
        f"Les {sum(n['kind']=='capability' for n in release['nodes'])} capacités du modèle figé sont publiées ; la publication ne valide pas leurs définitions, noms ou rattachements.",
        'approved_fields et les décisions associées délimitent les aspects validés ; proposed_fields restent à valider.',
        'Les validations contextuelles restent partielles ; le réexamen du rattachement de Reservation demeure visible.',
        'Les alternatives non intégrées et les illustrations restent dans le backlog.',
        'Le modèle processus détaillé reste à construire ; les autorités et frontières ouvertes ne sont pas arbitrées par cette publication.'
    ]
    if release.get('display_policy'):
        try:
            from .display_codes import build_display_index
        except ImportError:
            from display_codes import build_display_index
        release['display_index'] = build_display_index(release)
    return release


def publish(input_manifest, version, source_refs, activate=False):
    input_manifest = Path(input_manifest).resolve()
    manifest = read(input_manifest)
    model_root = input_manifest.parents[2]
    if input_manifest.name != 'manifest.json' or input_manifest.parent.parent.name != 'release':
        raise ValueError('Input must be a manifest inside release/<version>/')
    if not isinstance(version, str) or re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}\.[1-9][0-9]*', version) is None:
        raise ValueError('Version must use YYYY-MM-DD.N with a positive sequence number')
    date.fromisoformat(version.split('.')[0])
    release_root, provenance_root = (model_root / 'release').resolve(), (model_root / 'provenance').resolve()
    destination = (release_root / version).resolve()
    provenance_path = (provenance_root / version / 'source-records.json').resolve()
    if (not release_root.is_relative_to(model_root) or not provenance_root.is_relative_to(model_root)
            or not destination.is_relative_to(release_root) or not provenance_path.is_relative_to(provenance_root)):
        raise ValueError('Output path escapes its intended model directory')
    if destination.exists() or provenance_path.parent.exists():
        raise ValueError('Version already exists; choose a new version')
    inputs = {}
    for name, key in [('snapshot','input_revision'),('decisions','decisions'),('provenance','provenance')]:
        path = (input_manifest.parent / manifest[key+'_path']).resolve()
        if not path.is_relative_to(model_root) or digest(path) != manifest[key+'_sha256']:
            raise ValueError('Frozen input path or digest mismatch: ' + key)
        inputs[name] = (path, read(path))
    live_sources = read(model_root / 'provenance/source-records.json')
    source_document = publication_sources(inputs['provenance'][1], live_sources, source_refs)
    sources = {r['id']: r for r in source_document['records']}
    errors = validate_sources(source_document)
    if set(source_refs) - sources.keys():
        errors.append('Unknown publication source')
    release = compile_snapshot(inputs['snapshot'][1], inputs['decisions'][1], version, source_refs)
    schema = read(model_root / 'schemas/urbanism.schema.json')
    errors += validate_release(release, inputs['decisions'][1], inputs['snapshot'][1], sources, schema)
    if errors:
        raise ValueError('\n'.join(errors))
    # All semantic checks precede any write. Activation is the last, local step.
    # Exclusive directory creation also rejects another publisher winning a race.
    destination.mkdir()
    provenance_path.parent.mkdir()
    write(provenance_path, source_document)
    path = destination / 'model.json'
    write(path, release)
    output_manifest = {
        'schema_version':'1.0.0', 'version':version, 'model_sha256':digest(path),
        'input_revision_path':'../../' + inputs['snapshot'][0].relative_to(model_root).as_posix(),
        'input_revision_sha256':digest(inputs['snapshot'][0]),
        'decisions_path':'../../' + inputs['decisions'][0].relative_to(model_root).as_posix(),
        'decisions_sha256':digest(inputs['decisions'][0]),
        'provenance_path':f'../../provenance/{version}/source-records.json',
        'provenance_sha256':digest(provenance_path),
        'node_count':len(release['nodes']),
        'capability_count':sum(n['kind']=='capability' for n in release['nodes']),
        'complete_capability_count':sum(n['kind']=='capability' and n['review']['state']=='accepted' for n in release['nodes']),
        'note':'Publication complète ; validation distincte, détaillée par champ et sourcée.'
    }
    if 'source_files' in release:
        output_manifest['source_files'] = release['source_files']
    write(destination / 'manifest.json', output_manifest)
    if activate:
        activate_pointer(model_root / 'release/current.json', {'schema_version':'1.0.0', 'model_id':release['model_id'], 'space':'release', 'version':version, 'path':f'{version}/model.json','sha256':digest(path)})
    return output_manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--from-manifest', type=Path, required=True)
    parser.add_argument('--version', required=True)
    parser.add_argument('--source', action='append', required=True)
    parser.add_argument('--activate', action='store_true', help='Update the local current pointer after validation')
    args = parser.parse_args()
    print(json.dumps(publish(args.from_manifest,args.version,args.source,args.activate),ensure_ascii=False,indent=2))
