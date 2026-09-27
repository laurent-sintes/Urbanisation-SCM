"""Compare live backlog, prepare an immutable candidate, then publish explicitly.

report reads the model; optional outputs create analysis artifacts only.
prepare writes only modeles/staging/<version>. publish copies
verified staged inputs into the permanent history; --activate changes the local
pointer last. Neither operation grants a business validation.
"""
import argparse
import copy
from datetime import date
import json
import os
from pathlib import Path
import re
import shutil
import sys
import uuid
from collections import Counter
from hashlib import sha256

try:
    from .element_versions import assign_versions
    from .glossary import reference_impacts
    from .structured_io import working_path
    from .modeling_guide_publication import capture_association, verify_association, carry_association
    from .release_catalog import resolve_release, register
    from . import publish_release as publisher
    from . import decision_review
    from .decision_carry import classify_context
    from .record_decision import compile_intents
    from .decision_registry import read_registry, read_consumed_registry, is_index, shard_path
    from . import guide_candidate
    from .backlog_delivery import check_delivery
    from .json_contract import validate as validate_contract
    from .validate_models import canonical_sha256, validate_release, validate_sources, validate_urbanism, validate_decision_review
except ImportError:
    from element_versions import assign_versions
    from glossary import reference_impacts
    from structured_io import working_path
    from modeling_guide_publication import capture_association, verify_association, carry_association
    from release_catalog import resolve_release, register
    import publish_release as publisher
    import decision_review
    from decision_carry import classify_context
    from record_decision import compile_intents
    from decision_registry import read_registry, read_consumed_registry, is_index, shard_path
    import guide_candidate
    from backlog_delivery import check_delivery
    from json_contract import validate as validate_contract
    from validate_models import canonical_sha256, validate_release, validate_sources, validate_urbanism, validate_decision_review

ROOT = Path(__file__).resolve().parents[1]
read, digest, write = publisher.read, publisher.digest, publisher.write
PUBLICATION_FIELDS = {'adoption_ids', 'approved_fields', 'proposed_fields', 'missing_fields'}


def checked_path(base, relative):
    path = (base / relative).resolve()
    if not path.is_relative_to(base.resolve()):
        raise ValueError('Path escapes its intended directory: ' + str(relative))
    return path


def valid_version(version):
    if not isinstance(version, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.[1-9]\d*', version):
        raise ValueError('Version must use YYYY-MM-DD.N with a positive sequence number')
    date.fromisoformat(version.split('.')[0])
    return version


def references(document):
    found = set()
    if isinstance(document, dict):
        for key, value in document.items():
            if key in ('source_refs', 'correction_refs'):
                found.update(value)
            else:
                found.update(references(value))
    elif isinstance(document, list):
        for value in document:
            found.update(references(value))
    return found


def context_source_references(document):
    """A methodology guide embeds its lesson sources; only its roots are global.

    Keep the embedded records in the frozen annex, and reject unresolved local
    references instead of either inventing a global record or dropping evidence.
    Other backlog documents retain the ordinary global source contract.
    """
    found = references(document)
    if not isinstance(document, dict) or document.get('id') != 'flow-modeling-keys':
        return found
    records = document.get('sources')
    if not isinstance(records, list) or not records:
        raise ValueError('Methodology context has no embedded sources')
    local_ids = set()
    for record in records:
        if (not isinstance(record, dict)
                or any(not isinstance(record.get(k), str) or not record[k].strip()
                       for k in ('id', 'title', 'excerpt', 'scope'))
                or record['id'] in local_ids):
            raise ValueError('Invalid or duplicate embedded methodology source')
        local_ids.add(record['id'])
    if found - local_ids:
        raise ValueError('Unresolved embedded methodology source: ' + ', '.join(sorted(found - local_ids)))
    roots = document.get('source_refs')
    if not isinstance(roots, list) or not roots:
        raise ValueError('Methodology context requires global source roots')
    return set(roots)


def load_current(root):
    models = (Path(root).resolve() / 'modeles').resolve()
    pointer = resolve_release(models / 'release')
    release_path = checked_path(models / 'release', pointer['path'])
    if digest(release_path) != pointer['sha256']:
        raise ValueError('Current release pointer hash mismatch')
    release = read(release_path)
    manifest_path = release_path.parent / 'manifest.json'
    manifest = read(manifest_path)
    if (manifest['model_sha256'] != pointer['sha256'] or manifest['version'] != pointer['version']
            or release['version'] != pointer['version']):
        raise ValueError('Current release manifest/version mismatch')
    review_errors = validate_decision_review(Path(root).resolve(), manifest_path, manifest)
    if review_errors:
        raise ValueError('Archived review integrity mismatch: ' + '\n'.join(review_errors))
    inputs = {}
    for key in ('input_revision', 'decisions', 'provenance'):
        path = (manifest_path.parent / manifest[key + '_path']).resolve()
        if not path.is_relative_to(models) or digest(path) != manifest[key + '_sha256']:
            raise ValueError('Frozen input path or hash mismatch: ' + key)
        inputs[key] = read(path)
    if manifest.get('kind') == 'git_release':
        return models, pointer, release, inputs, manifest_path
    errors = validate_release(release, inputs['decisions'], inputs['input_revision'],
                              {r['id']: r for r in inputs['provenance']['records']},
                              read(models / 'schemas/urbanism.schema.json'))
    if errors:
        raise ValueError('\n'.join(errors))
    return models, pointer, release, inputs, manifest_path


def suggested_version(models):
    prefix = date.today().isoformat() + '.'
    try:
        from .release_catalog import descriptors
    except ImportError:
        from release_catalog import descriptors
    used = {d['version'] for d in descriptors(models / 'release')}
    for folder in ('release', 'revisions', 'staging', 'provenance'):
        base = models / folder
        if base.exists():
            used.update(p.name for p in base.iterdir())
    number = 1
    while prefix + str(number) in used or (models / 'decisions' / (prefix + str(number) + '.json')).exists():
        number += 1
    return prefix + str(number)


def reconcile_decisions(old_document, snapshot, additional=None, previous_snapshot=None, *, stable_ids=False):
    """Preserve exact approvals; carry across revisions only with proven stable context."""
    targets = {c: {item['id']: item for item in snapshot[c]} for c in ('nodes', 'relations')}
    previous_targets = {c: {item['id']: item for item in (previous_snapshot or {}).get(c, [])} for c in targets}
    kept, deferred = [], []
    context_cache = {}
    for original in old_document['decisions']:
        target = original['target']
        item = targets[target['collection']].get(target['id'])
        values = item.get('fields', {}) if item and target['collection'] == 'nodes' else item
        reason = None
        if item is None:
            reason = 'target_removed'
        elif any(field not in values or canonical_sha256(values[field]) != target['value_sha256'][field]
                 for field in target['approved_fields']):
            reason = 'approved_value_changed'
        elif original['decision_state'] == 'accepted' and previous_snapshot is not None:
            key = canonical_sha256(target)
            context = context_cache.setdefault(key, None)
            if context is None:
                context = classify_context(original, previous_snapshot, snapshot)
                context_cache[key] = context
            if not context['safe']:
                reason = 'context_changed_requires_explicit_reassessment'
            elif item['revision'] != target['revision']:
                decision = copy.deepcopy(original)
                if stable_ids:
                    decision['target'].update(revision=item['revision'], import_version=snapshot['version'])
                    kept.append(decision)
                    continue
                decision['id'] = 'ADOPT-CARRY-' + sha256((snapshot['version'] + ':' + original['id']).encode()).hexdigest()[:24]
                decision['recorded_at'] = snapshot['as_of']
                decision['target'].update(revision=item['revision'], import_version=snapshot['version'])
                decision['note'] += (' Report de ' + original['id'] +
                    ' : valeurs approuvées et contexte métier vérifiés identiques ; seules des métadonnées ou références éditoriales évoluent. Aucune extension de portée.')
                kept.append(decision)
                continue
        elif item['revision'] != target['revision']:
            old = previous_targets[target['collection']].get(target['id'])
            ignored = PUBLICATION_FIELDS | {'revision', 'last_modified', 'content_sha256', 'lifecycle'}
            content = lambda record: {k: v for k, v in record.items() if k not in ignored}
            # U131 introduces a lifecycle without changing the approved content.
            # Transcribe, rather than overwrite, the original decision. This is
            # deliberately limited to the first addition of lifecycle metadata.
            if (old and 'lifecycle' not in old and 'U131' in item.get('lifecycle', {}).get('source_refs', [])
                    and content(old) == content(item) and old['revision'] == target['revision']):
                decision = copy.deepcopy(original)
                decision['id'] = original['id'] + '-LIFECYCLE-r' + str(item['revision'])
                decision['recorded_at'] = snapshot['as_of']
                decision['source_refs'] = list(dict.fromkeys(original['source_refs'] + ['U131']))
                decision['note'] += ' Transcription de ' + original['id'] + ' pour l’introduction du cycle U131 ; valeurs et portée inchangées.'
                decision['target'].update(revision=item['revision'], import_version=snapshot['version'])
                kept.append(decision)
                continue
            reason = 'revision_changed_requires_explicit_reassessment'
        if reason:
            deferred.append({'id': original['id'], 'target': target['id'], 'reason': reason,
                             'approved_fields': target['approved_fields'],
                             **({'context_reasons': context['reasons']} if reason == 'context_changed_requires_explicit_reassessment' else {})})
        else:
            decision = copy.deepcopy(original)
            decision['target']['import_version'] = snapshot['version']
            kept.append(decision)
    if additional:
        if additional['version'] != snapshot['version']:
            raise ValueError('Additional decisions must target the prepared version')
        # A new decision gets a new stable identifier. No existing decision is rewritten.
        old_ids = {item['id'] for item in old_document['decisions']}
        for decision in additional['decisions']:
            if decision['id'] in old_ids or decision['id'] in {item['id'] for item in kept}:
                raise ValueError('Additional decision must use a new id: ' + decision['id'])
            kept.append(copy.deepcopy(decision))
    return {'schema_version': '1.0.0', 'version': snapshot['version'], 'decisions': kept}, deferred


def explain_deferred_validations(snapshot, decisions, deferred, previous_release=None):
    """Keep old editorial notes as history, never as approval of a new revision."""
    for collection in ('nodes', 'relations'):
        previous = {r['id']: r for r in (previous_release or {}).get(collection, [])}
        for item in snapshot[collection]:
            removed = [d for d in deferred if d['target'] == item['id']]
            applicable = [d for d in decisions['decisions']
                          if d['decision_state'] == 'accepted'
                          and d['target']['collection'] == collection
                          and d['target']['id'] == item['id']]
            previous_item = previous.get(item['id'], {})
            previous_note = previous_item.get('review', {}).get('note', '')
            original_note = item['review']['note']
            if (not removed and previous_item.get('revision') == item['revision']
                    and 'Note antérieure, qui ne qualifie pas cette révision' in previous_note
                    and previous_note.endswith('« ' + original_note + ' »')
                    and set(previous_item.get('adoption_ids', [])) == {d['id'] for d in applicable}):
                # Preserve the qualification on later publications while the live
                # backlog still carries its original editorial note.
                item['review']['note'] = previous_note
                continue
            if not removed and (applicable or item['review']['state'] not in ('accepted', 'partial')):
                continue
            current = ('Seules les décisions applicables à cette version qualifient les champs validés ; '
                       'elles ne rétablissent pas les validations antérieures suspendues.' if applicable else
                       'Aucune validation antérieure reprise pour cette révision ; '
                       'aucune validation courante applicable enregistrée.')
            history = (' Validations conservées dans l’historique : ' + ', '.join(d['id'] for d in removed) + '.'
                       if removed else ' Le statut éditorial du backlog ne constitue pas une preuve de validation.')
            item['review']['note'] = (current + history
                                     + ' Note antérieure, qui ne qualifie pas cette révision : « '
                                     + original_note + ' »')


def changes(before, after, path=''):
    """Return explicit before/after values, including relation qualification."""
    result = []
    if isinstance(before, dict) and isinstance(after, dict):
        for key in sorted(set(before) | set(after)):
            here = path + '/' + key
            if key not in before or key not in after:
                result.append({'path': here, 'before_present': key in before, 'after_present': key in after,
                               'before': before.get(key), 'after': after.get(key)})
            else:
                result.extend(changes(before[key], after[key], here))
    elif (isinstance(before, list) and isinstance(after, list) and (before or after)
          and all(isinstance(x, dict) and isinstance(x.get('id'), str) for x in before + after)
          and len({x['id'] for x in before}) == len(before)
          and len({x['id'] for x in after}) == len(after)):
        # Stable identifiers avoid copying an entire glossary or registry for one edit.
        result.extend(changes({x['id']: x for x in before}, {x['id']: x for x in after}, path))
        old_order, new_order = [x['id'] for x in before], [x['id'] for x in after]
        if old_order != new_order:
            result.append({'path': path + '/@order', 'before': old_order, 'after': new_order})
    elif before != after:
        result.append({'path': path, 'before': before, 'after': after})
    return result


def registry_report(document):
    """Describe approval changes without copying their already preserved evidence."""
    if document is None:
        return None
    return {'schema_version': document['schema_version'],
            'intents': [{k: copy.deepcopy(v) for k, v in intent.items() if k != 'target'} | {
                'target': {k: copy.deepcopy(v) for k, v in intent['target'].items()
                           if k not in ('values', 'context')}} for intent in document['intents']],
            'suspensions': document.get('suspensions', [])}


def model_diff(previous, candidate):
    result = {}
    for collection in ('nodes', 'relations'):
        before = {r['id']: r for r in previous[collection]}
        after = {r['id']: r for r in candidate[collection]}
        result[collection] = {'added': [after[k] for k in sorted(set(after) - set(before))],
                              'removed': [before[k] for k in sorted(set(before) - set(after))],
                              'modified': []}
        for identifier in sorted(set(before) & set(after)):
            delta = changes(before[identifier], after[identifier])
            if delta:
                result[collection]['modified'].append({'id': identifier, 'changes': delta})
    result['principles'] = changes(previous.get('principles', []), candidate.get('principles', []))
    if 'scenario_catalog' in previous or 'scenario_catalog' in candidate:
        result['scenario_catalog'] = changes(previous.get('scenario_catalog'), candidate.get('scenario_catalog'))
    if 'display_policy' in previous or 'display_policy' in candidate:
        result['display_policy'] = changes(previous.get('display_policy'), candidate.get('display_policy'))
        result['display_index'] = changes(previous.get('display_index'), candidate.get('display_index'))
    if 'information_catalog' in previous or 'information_catalog' in candidate:
        result['information_catalog'] = changes(
            {k:v for k,v in previous.get('information_catalog', {}).items() if k not in ('items','links')},
            {k:v for k,v in candidate.get('information_catalog', {}).items() if k not in ('items','links')})
    for collection in ('items', 'links'):
        before = {r['id']:r for r in previous.get('information_catalog', {}).get(collection, [])}
        after = {r['id']:r for r in candidate.get('information_catalog', {}).get(collection, [])}
        if before or after:
            result['information_' + collection] = {
                'added':[after[k] for k in sorted(after.keys() - before.keys())],
                'removed':[before[k] for k in sorted(before.keys() - after.keys())],
                'modified':[{'id':k, 'changes':changes(before[k], after[k])}
                            for k in sorted(before.keys() & after.keys()) if before[k] != after[k]]}
    return result


def revision_errors(previous_snapshot, snapshot):
    errors = []
    for collection in ('nodes', 'relations'):
        previous = {r['id']: r for r in previous_snapshot[collection]}
        for item in snapshot[collection]:
            old = previous.get(item['id'])
            if not old:
                continue
            if item['revision'] < old['revision']:
                errors.append(item['id'] + ': revision cannot decrease')
            keys = ('fields', 'kind', 'layer', 'group_role', 'level_ref') if collection == 'nodes' else ('type', 'source_id', 'target_id', 'qualification', 'fields')
            if any(item.get(k) != old.get(k) for k in keys) and item['revision'] <= old['revision']:
                errors.append(item['id'] + ': changed model content requires a new revision')
    return errors


def build_candidate(root=ROOT, version=None, source_refs=None, additional_path=None, *,
                    review_path=None, include_review=False, current=None, lightweight=False):
    lightweight = lightweight or (Path(root) / 'modeles/git-history.json').is_file()
    state = decision_review.input_state(root)
    models, pointer, previous, inputs, manifest_path = current or load_current(root)
    version = valid_version(version or suggested_version(models))
    live_path = working_path(models / 'backlog')
    live = read(live_path)
    snapshot = copy.deepcopy(live)
    glossary_path = working_path(models / 'backlog', 'glossary')
    if glossary_path.exists():
        snapshot['glossary'] = read(glossary_path)
    snapshot.update(space='backlog', version=version, as_of=version.split('.')[0])
    for collection in ('nodes', 'relations'):
        for item in snapshot[collection]:
            for key in PUBLICATION_FIELDS:
                item.pop(key, None)
    element_changes = assign_versions(snapshot, inputs['input_revision'], published=previous)
    additional = read(additional_path) if additional_path else None
    if additional is not None and additional.get('version') != version:
        raise ValueError('Additional decisions must target the prepared version')
    intent_errors = []
    intent_path = models / 'backlog/decision-intents.yaml'
    consumed_path = models / 'revisions' / pointer['version'] / 'deferred/decision-intents.yaml'
    consumed_registry = read_consumed_registry(root, pointer['version'])
    live_registry = None
    if consumed_path.exists() and not intent_path.exists():
        intent_errors.append('decision-intents: previously published registry was removed')
    if intent_path.exists():
        try:
            live_registry = read_registry(intent_path)
            recorded = compile_intents(live_registry, snapshot, inputs['decisions'],
                                       read(models / 'provenance/source-records.json'),
                                       consumed_document=consumed_registry)
            if additional:
                recorded['decisions'].extend(additional['decisions'])
            additional = recorded
        except ValueError as exc:
            intent_errors.append('decision-intents: ' + str(exc))
    decisions, deferred_decisions = reconcile_decisions(inputs['decisions'], snapshot, additional, inputs['input_revision'], stable_ids=lightweight)
    publication_refs = source_refs or previous.get('publication', {}).get('source_refs', [])
    review, review_evidence = None, {}
    if include_review or review_path:
        review = decision_review.make_review(snapshot, inputs['input_revision'], previous,
            inputs['decisions'], deferred_decisions, pointer, digest(manifest_path), state,
            publication_refs, changes)
    if review_path:
        transcribed, review_evidence = decision_review.apply_assessment(review_path, review)
        if additional:
            transcribed['decisions'].extend(additional['decisions'])
        decisions, deferred_decisions = reconcile_decisions(inputs['decisions'], snapshot, transcribed, inputs['input_revision'], stable_ids=lightweight)
    explain_deferred_validations(snapshot, decisions, deferred_decisions, previous)
    # Working proposals and research remain in the knowledge base, not in every release.
    deferred_paths = [intent_path] if intent_path.exists() and not lightweight else []
    all_refs = references(snapshot) | references(decisions) | set(publication_refs)
    registry_index = read(intent_path) if intent_path.exists() else None
    if is_index(registry_index) and not lightweight:
        deferred_paths.extend(shard_path(intent_path, entry) for entry in registry_index['entries'])
    # Reuse the fully validated logical registry; never parse each capture twice.
    deferred_documents = {path: read(path) for path in deferred_paths if path != intent_path
                          and not path.is_relative_to(intent_path.parent / 'decision-intents')}
    if intent_path.exists():
        live_registry = live_registry if live_registry is not None else read_registry(intent_path)
        deferred_documents[intent_path] = live_registry
        if is_index(registry_index):
            intents_by_id = {i['id']: i for i in live_registry['intents']}
            deferred_documents.update({shard_path(intent_path, e): [intents_by_id[e['id']]]
                                       for e in registry_index['entries']})
    for path in deferred_paths:
        all_refs.update(context_source_references(deferred_documents[path]))
    provenance = publisher.publication_sources(inputs['provenance'], read(models / 'provenance/source-records.json'), sorted(all_refs))
    sources = {r['id']: r for r in provenance['records']}
    urbanism_schema = read(models / 'schemas/urbanism.schema.json')
    errors = validate_contract(decisions, read(models / 'schemas/decisions.schema.json'))
    errors += validate_sources(provenance)
    if not lightweight:
        errors += validate_urbanism(snapshot, sources, urbanism_schema)
    errors += revision_errors(inputs['input_revision'], snapshot)
    if errors:
        # Report still needs to explain edits even when their revisions need correction.
        fatal = [e for e in errors if 'requires a new revision' not in e]
        if fatal:
            raise ValueError('\n'.join(fatal))
    candidate = publisher.compile_snapshot(snapshot, decisions, version, publication_refs)
    errors += validate_release(candidate, decisions, snapshot, sources, urbanism_schema)
    errors += intent_errors
    deferred_artifacts = []
    for path in deferred_paths:
        previous_path = models / 'revisions' / pointer['version'] / 'deferred' / path.relative_to(models / 'backlog')
        if path.parent == models / 'backlog':
            previous_path = working_path(previous_path.parent, path.stem)
        current_document = deferred_documents[path]
        same_bytes = previous_path.exists() and digest(previous_path) == digest(path)
        previous_document = (current_document if same_bytes else
                             consumed_registry if path == intent_path else
                             read(previous_path) if previous_path.exists() else None)
        if path == intent_path:
            previous_document, current_document = registry_report(previous_document), registry_report(current_document)
        deferred_artifacts.append({'path': path.relative_to(models).as_posix(), 'sha256': digest(path),
                                   'comparison': 'changed' if previous_path.exists() and previous_document != current_document else 'unchanged' if previous_path.exists() else 'baseline_not_captured',
                                   'changes': changes(previous_document, current_document) if previous_path.exists() else [],
                                   'disposition': 'frozen_as_context_only_not_published_as_model'})
    delivery_rows, delivery_errors = check_delivery(root, candidate)
    errors.extend(delivery_errors)
    report = {'schema_version': '1.0.0', 'base_version': pointer['version'], 'candidate_version': version,
              'backlog_delivery': delivery_rows,
              'element_version_changes': element_changes,
              'glossary_reference_impacts': reference_impacts(previous, candidate),
              'publication_is_business_validation': False, 'glossary_changes': changes(previous.get('glossary'), candidate.get('glossary')), 'changes': model_diff(previous, candidate),
              'retained_decision_ids': [d['id'] for d in decisions['decisions'] if d['id'] in {o['id'] for o in inputs['decisions']['decisions']}],
              'deferred_decisions': deferred_decisions,
              'new_decision_ids': [d['id'] for d in decisions['decisions'] if d['id'] not in {o['id'] for o in inputs['decisions']['decisions']}],
              'automatically_carried_decision_ids': [d['id'] for d in decisions['decisions'] if d['id'].startswith('ADOPT-CARRY-') and d['id'] not in {o['id'] for o in inputs['decisions']['decisions']}],
              'deferred_artifacts': deferred_artifacts,
              'backlog_only': {'alternatives': [r['id'] for r in snapshot.get('alternatives', [])],
                               'relations_to_illustrations': sorted(publisher.relations_to_illustrations(snapshot)),
                               'illustrations': [r['id'] for r in snapshot['nodes'] + snapshot['relations'] if r['review']['state'] == 'illustration']},
              'validation_errors': sorted(set(errors)),
              'note': 'Les validations différées restent dans les versions antérieures. Les artefacts de contexte gelés ne deviennent pas des éléments publiés.'}
    if state != decision_review.input_state(root):
        raise ValueError('Inputs changed while building candidate; retry from stable inputs')
    return {'models': models, 'pointer': pointer, 'snapshot': snapshot, 'decisions': decisions,
            'provenance': provenance, 'candidate': candidate, 'report': report,
            'backlog_sha256': digest(live_path), 'glossary_sha256': digest(glossary_path) if glossary_path.exists() else None, 'base_manifest_sha256': digest(manifest_path),
            'publication_refs': publication_refs, 'input_state': state,
            'review': review, 'review_evidence': review_evidence}


def prepare(root, version, source_refs, additional_path=None, *, review_path=None, guide_path=None):
    if (Path(root) / 'modeles/git-history.json').is_file():
        raise ValueError('Use release.py for the Git-backed publication workflow')
    bundle = build_candidate(root, version, source_refs, additional_path, review_path=review_path)
    return stage_candidate(root, bundle, guide_path=guide_path)


def stage_candidate(root, bundle, *, guide_path=None):
    """Freeze an already checked in-memory candidate without rebuilding it."""
    version = bundle['snapshot']['version']
    source_refs = bundle['publication_refs']
    if bundle['input_state'] != decision_review.input_state(root):
        raise ValueError('Inputs changed since candidate construction; rebuild before staging')
    models = bundle['models']
    if bundle['report']['validation_errors']:
        raise ValueError('\n'.join(bundle['report']['validation_errors']))
    if not source_refs:
        raise ValueError('Preparation requires explicit publication source IDs')
    destination = checked_path(models / 'staging', version)
    for path in (destination, models / 'release' / version, models / 'revisions' / version,
                 models / 'provenance' / version, models / 'decisions' / (version + '.json')):
        if path.exists():
            raise ValueError('Version already exists; choose a new version: ' + str(path))
    destination.parent.mkdir(exist_ok=True)
    temporary = destination.parent / ('.prepare-' + uuid.uuid4().hex)
    temporary.mkdir()
    try:
        for name, key in [('backlog.yaml', 'snapshot'), ('decisions.json', 'decisions'),
                          ('source-records.json', 'provenance'), ('candidate.yaml', 'candidate'), ('report.json', 'report')]:
            write(temporary / name, bundle[key])
        deferred = []
        for record in bundle['report']['deferred_artifacts']:
            source_path = checked_path(models, record['path'])
            path = temporary / 'deferred' / source_path.relative_to(models / 'backlog')
            publisher.copy_verified(source_path, path, record['sha256'])
            deferred.append({'path': path.relative_to(temporary).as_posix(), 'sha256': record['sha256'],
                             'source_path': record['path'], 'source_sha256': record['sha256']})
        review_files = {}
        for name, document in bundle['review_evidence'].items():
            path = temporary / 'decision-review' / name
            write(path, document)
            review_files[path.relative_to(temporary).as_posix()] = digest(path)
        manifest = {'schema_version': '1.0.0', 'kind': 'prepared_release', 'version': version,
                    'base_pointer': bundle['pointer'], 'base_manifest_sha256': bundle['base_manifest_sha256'],
                    'live_backlog_sha256': bundle['backlog_sha256'], 'live_glossary_sha256': bundle['glossary_sha256'], 'publication_source_refs': source_refs,
                    'files': {name: digest(temporary / name) for name in ('backlog.yaml', 'decisions.json', 'source-records.json', 'candidate.yaml', 'report.json')},
                    'schemas': {name: digest(models / 'schemas' / name) for name in ('urbanism.schema.json', 'decisions.schema.json')},
                    'deferred': deferred,
                    'input_state': bundle['input_state'],
                    'modeling_guide': capture_association(root, bundle['pointer']['version'])}
        if guide_path is not None:
            manifest['new_modeling_guide'] = guide_candidate.stage(root, guide_path, temporary)
        if review_files:
            manifest['decision_review'] = review_files
        write(temporary / 'manifest.json', manifest)
        if bundle['input_state'] != decision_review.input_state(root):
            raise ValueError('Inputs changed during preparation; prepare from stable inputs')
        os.rename(temporary, destination)
    finally:
        if temporary.exists():
            if temporary.resolve().parent != destination.parent.resolve() or not temporary.name.startswith('.prepare-'):
                raise ValueError('Unsafe staging cleanup target')
            shutil.rmtree(temporary)
    return {'prepared_manifest': str(destination / 'manifest.json'), 'report': str(destination / 'report.json'),
            'candidate': str(destination / 'candidate.yaml'), 'release_activated': False,
            'summary': summarize_report(bundle['report'])}


def publish_prepared(root, version, activate=False):
    if (Path(root) / 'modeles/git-history.json').is_file():
        raise ValueError('Use release.py for the Git-backed publication workflow')
    models, pointer, _, _, current_manifest_path = load_current(root)
    valid_version(version)
    stage = checked_path(models / 'staging', version)
    manifest = read(stage / 'manifest.json')
    if manifest.get('kind') != 'prepared_release' or manifest.get('version') != version:
        raise ValueError('Invalid prepared manifest')
    if manifest['base_pointer'] != pointer or digest(current_manifest_path) != manifest['base_manifest_sha256']:
        raise ValueError('Current release changed since preparation; prepare a fresh candidate')
    if 'input_state' in manifest and manifest['input_state'] != decision_review.input_state(root):
        # Keep the established specific diagnostics below for ordinary data edits.
        current_state = decision_review.input_state(root)
        if manifest['input_state']['tool_code'] != current_state['tool_code']:
            raise ValueError('Publication code changed since preparation; prepare a fresh candidate')
        if manifest['input_state']['python'] != current_state['python']:
            raise ValueError('Python runtime changed since preparation')
        before_paths, after_paths = set(manifest['input_state']['files']), set(current_state['files'])
        if before_paths != after_paths:
            raise ValueError('Backlog context inventory changed since preparation')
        source_path = 'modeles/provenance/source-records.json'
        if manifest['input_state']['files'].get(source_path) != current_state['files'].get(source_path):
            raise ValueError('Publication source registry changed since preparation')
    if 'modeling_guide' in manifest:
        verify_association(root, pointer['version'], manifest['modeling_guide'])
    if 'new_modeling_guide' in manifest:
        guide_candidate.verify(root, stage, manifest['new_modeling_guide'])
    if digest(working_path(models / 'backlog')) != manifest['live_backlog_sha256']:
        raise ValueError('Backlog changed since preparation; prepare a fresh candidate')
    glossary_path = working_path(models / 'backlog', 'glossary')
    glossary_hash = digest(glossary_path) if glossary_path.exists() else None
    if glossary_hash != manifest.get('live_glossary_sha256'):
        raise ValueError('Glossary changed since preparation; prepare a fresh candidate')
    if 'input_state' in manifest and manifest['input_state']['files'] != decision_review.input_state(root)['files']:
        raise ValueError('Backlog context changed since preparation; prepare a fresh candidate')
    required_files = {'backlog.yaml', 'decisions.json', 'source-records.json', 'candidate.yaml', 'report.json'}
    if set(manifest['files']) != required_files:
        raise ValueError('Prepared manifest file inventory mismatch')
    for name, sha in manifest['files'].items():
        if digest(checked_path(stage, name)) != sha:
            raise ValueError('Prepared artifact hash mismatch: ' + name)
    review_files = manifest.get('decision_review', {})
    if review_files and set(review_files) != {'decision-review/review.json', 'decision-review/assessment.yaml',
                                              'decision-review/transcriptions.json'}:
        raise ValueError('Prepared review inventory mismatch')
    for name, sha in review_files.items():
        if digest(checked_path(stage, name)) != sha:
            raise ValueError('Prepared review hash mismatch: ' + name)
    for name, sha in manifest['schemas'].items():
        if digest(checked_path(models / 'schemas', name)) != sha:
            raise ValueError('Model contract changed since preparation: ' + name)
    for item in manifest['deferred']:
        if digest(checked_path(stage, item['path'])) != item['sha256']:
            raise ValueError('Deferred artifact hash mismatch')
        if digest(checked_path(models, item['source_path'])) != item['source_sha256']:
            raise ValueError('Backlog context changed since preparation; prepare a fresh candidate')
    snapshot, decisions, provenance = (read(stage / name) for name in ('backlog.yaml', 'decisions.json', 'source-records.json'))
    if snapshot['version'] != version or decisions['version'] != version:
        raise ValueError('Prepared input version mismatch')
    source_refs = manifest['publication_source_refs']
    if not source_refs or not set(source_refs) <= {r['id'] for r in provenance['records']}:
        raise ValueError('Missing prepared publication evidence')
    release = publisher.compile_snapshot(snapshot, decisions, version, source_refs)
    if release != read(stage / 'candidate.yaml'):
        raise ValueError('Prepared candidate differs from current compiler result')
    errors = validate_sources(provenance)
    errors += validate_contract(decisions, read(models / 'schemas/decisions.schema.json'))
    errors += validate_release(release, decisions, snapshot, {r['id']: r for r in provenance['records']}, read(models / 'schemas/urbanism.schema.json'))
    report = read(stage / 'report.json')
    errors += report['validation_errors']
    if errors:
        raise ValueError('\n'.join(errors))
    release_dir, revision_dir, proof_dir = (models / folder / version for folder in ('release', 'revisions', 'provenance'))
    decision_path = models / 'decisions' / (version + '.json')
    for path in (release_dir, revision_dir, proof_dir, decision_path):
        if path.exists():
            raise ValueError('Version already exists; publication history is immutable')
    # All checks precede writes. Interrupted output stays unactivated for diagnosis.
    release_dir.mkdir()
    revision_dir.mkdir()
    proof_dir.mkdir()
    publisher.copy_verified(stage / 'backlog.yaml', revision_dir / 'backlog.yaml', manifest['files']['backlog.yaml'])
    publisher.copy_verified(stage / 'decisions.json', decision_path, manifest['files']['decisions.json'])
    publisher.copy_verified(stage / 'source-records.json', proof_dir / 'source-records.json', manifest['files']['source-records.json'])
    for name in review_files:
        publisher.copy_verified(checked_path(stage, name), checked_path(revision_dir, name), review_files[name])
    for item in manifest['deferred']:
        publisher.copy_verified(checked_path(stage, item['path']), checked_path(revision_dir, item['path']), item['sha256'])
    publisher.copy_verified(stage / 'candidate.yaml', release_dir / 'model.yaml', manifest['files']['candidate.yaml'])
    publisher.copy_verified(stage / 'report.json', release_dir / 'changes.json', manifest['files']['report.json'])
    notes=[f"# Urbanisation — version {release['revision']}", '', f"Publication {version} · modèle modifié le {release['last_modified']}.", '',
           f"{sum(n['kind']=='capability' for n in release['nodes'])} capacités ; les statuts et réserves sont conservés.", '', '## Changements', '']
    changed_ids={e['id'] for e in report['element_version_changes'] if e['collection']=='nodes' and e['reason'] in ('new','changed')}
    for action in ('added','removed','modified'):
        for item in report['changes']['nodes'][action]:
            if action=='modified' and item['id'] not in changed_ids:continue
            renaming=next((c for c in item.get('changes',[]) if c['path']=='/fields/name'),None)
            detail=(' — '+item['fields']['name']) if 'fields' in item else (' — '+str(renaming['before'])+' → '+str(renaming['after'])) if renaming else ' — contenu ou notice actualisé'
            notes.append(f"- {action} : {item['id']}" + detail)
    if report.get('glossary_changes'):
        notes += ['', '## Glossaire', '', f"{len(release.get('glossary', {}).get('terms', []))} termes figés dans cette publication. Les liens sont résolus dans cette même version."]
        term_changes = [item for item in report['element_version_changes'] if item['collection'] == 'glossary']
        notes.append(f"{sum(item['reason']=='new' for item in term_changes)} termes introduits ; {sum(item['reason']=='changed' for item in term_changes)} révisés. Détail des changements, y compris retraits éventuels, dans changes.json.")
        for impact in report.get('glossary_reference_impacts', []):
            notes.append(f"- Sens à réexaminer : {impact['id']} ({impact['field']}) référence {', '.join(impact['changed_terms'])}.")
    if 'scenario_catalog' in release:
        catalogue = release['scenario_catalog']
        notes += ['', '## Scénarios métier', '', f"{len(catalogue['value_streams'])} flux de valeur, {len(catalogue['scenarios'])} scénarios et {len(catalogue['paths'])} parcours figés dans cette publication. Les contenus proposés ne deviennent pas des accords métier par publication."]
    if 'information_catalog' in release:
        catalogue = release['information_catalog']
        notes += ['', '## Informations métier', '',
                  f"{len(catalogue['items'])} informations et {len(catalogue['links'])} liens figés dans cette publication ; usages des capacités, exemples et sources marché inclus."]
        for collection, label in (('information_items', 'informations'), ('information_links', 'liens')):
            delta = report['changes'].get(collection, {})
            notes.append(f"{label.capitalize()} : {len(delta.get('added', []))} ajouts, {len(delta.get('modified', []))} modifications, {len(delta.get('removed', []))} retraits.")
    notes+=['', '## Validations et points ouverts', '',
            f"{len(report['retained_decision_ids'])} décisions antérieures conservées ; {len(report['deferred_decisions'])} suspendues pour les révisions modifiées.",
            f"{len(report.get('automatically_carried_decision_ids', []))} accords reportés après vérification de valeurs et contexte métier inchangés.",
            f"{sum('-LIFECYCLE-r' in key for key in report['new_decision_ids'])} accords transcrits à portée identique pour le cycle U131 ; {sum('-LIFECYCLE-r' not in key for key in report['new_decision_ids'])} autres décisions nouvelles sourcées.",
            'Aucune publication ne vaut validation métier. Les champs proposés, réserves et alternatives du rapport restent à instruire.', '']
    notes += [f"- {d['id']} ({d['target']}) : conservée dans l’historique, reprise suspendue pour cette révision." for d in report['deferred_decisions']]
    notes += ['', 'Les éléments inchangés conservent leurs révisions. L’initialisation de last_modified marque le début du suivi lorsque la date antérieure est inconnue.', '']
    (release_dir/'release-notes.md').write_text('\n'.join(notes),encoding='utf-8')
    output = {'schema_version': '1.0.0', 'version': version, 'model_path': 'model.yaml', 'model_sha256': digest(release_dir / 'model.yaml'),
              'input_revision_path': f'../../revisions/{version}/backlog.yaml', 'input_revision_sha256': digest(revision_dir / 'backlog.yaml'),
              'decisions_path': f'../../decisions/{version}.json', 'decisions_sha256': digest(decision_path),
              'provenance_path': f'../../provenance/{version}/source-records.json', 'provenance_sha256': digest(proof_dir / 'source-records.json'),
              'source_files': release['source_files'], 'node_count': len(release['nodes']),
              'capability_count': sum(n['kind'] == 'capability' for n in release['nodes']),
              'complete_capability_count': sum(n['kind'] == 'capability' and n['review']['state'] == 'accepted' for n in release['nodes']),
              'changes_path': 'changes.json', 'changes_sha256': digest(release_dir / 'changes.json'),
              'prepared_manifest_sha256': digest(stage / 'manifest.json'),
              'decision_registry_files': {e['path']: e['sha256'] for e in manifest['deferred']
                  if e['path'] == 'deferred/decision-intents.yaml' or e['path'].startswith('deferred/decision-intents/')},
              'note': 'Publication du backlog préparé ; validations conservées seulement à révision et valeurs identiques.'}
    if review_files:
        output['decision_review'] = {f'../../revisions/{version}/{name}': digest(revision_dir / name)
                                     for name in review_files}
    if 'new_modeling_guide' in manifest:
        new_guide = manifest['new_modeling_guide']
        output['published_modeling_guide'] = {
            'path': '../../modeling-guides/versions/' + new_guide['version'] + '.yaml',
            'sha256': new_guide['sha256']}
    write(release_dir / 'manifest.json', output)
    if 'new_modeling_guide' in manifest:
        guide_candidate.publish(root, stage, version, manifest['new_modeling_guide'])
    elif 'modeling_guide' in manifest:
        carry_association(root, pointer['version'], version, manifest['modeling_guide'])
    if activate:
        register(models/'release',release,version+'/release-notes.md',write,publisher.activate_pointer)
    return {'version': version, 'manifest': str(release_dir / 'manifest.json'), 'release_activated': activate,
            'capability_count': output['capability_count'], 'complete_capability_count': output['complete_capability_count']}


def summarize_report(report):
    """Keep the complete report available without flooding routine CLI output."""
    errors = report['validation_errors']
    return {
        'base_version': report['base_version'], 'candidate_version': report['candidate_version'],
        'ready_to_prepare': not errors, 'validation_error_count': len(errors),
        'validation_error_categories': dict(Counter(e.split(': ', 1)[-1] for e in errors)),
        'validation_error_examples': errors[:5],
        'changes': {collection: {action: len(items) for action, items in delta.items()}
                    for collection, delta in report['changes'].items() if isinstance(delta, dict)},
        'retained_decisions': len(report['retained_decision_ids']),
        'deferred_decisions': len(report['deferred_decisions']),
        'new_decisions': len(report['new_decision_ids']),
        'automatically_carried_decisions': len(report.get('automatically_carried_decision_ids', [])),
        'glossary_reference_impacts': report['glossary_reference_impacts'],
        'deferred_artifacts': dict(Counter(a['comparison'] for a in report['deferred_artifacts'])),
        'backlog_only': report['backlog_only'],
        'backlog_delivery': report.get('backlog_delivery', []),
        'detail': 'Read saved results with inspect PATH --section SECTION --id ID. For a new diagnostic, report --output NEW_PATH saves all details.',
        'publication_is_business_validation': False,
    }


def inspect_artifact(path, section=None, identifier=None, offset=0, limit=20, full=False):
    """Read a saved report/review only: no candidate build, validation or publication."""
    path = Path(path)
    if offset < 0 or not 1 <= limit <= 100:
        raise ValueError('Use offset >= 0 and limit between 1 and 100')
    if path.is_dir():
        path = path / ('review.json' if section in ('review', 'review-context') else 'report.json')
    document = read(path)
    if not section and not identifier:
        return summarize_report(document)
    section = section or 'changes'
    rows = []
    if section == 'review':
        rows = document['items']
    elif section == 'review-context':
        rows = document['global_context_changes']
    elif section == 'errors':
        rows = [{'error': value} for value in document['validation_errors']]
    elif section == 'decisions':
        rows = ([{'state': 'deferred', **v} for v in document['deferred_decisions']]
                + [{'state': state, 'id': v} for state, key in (('retained', 'retained_decision_ids'), ('new', 'new_decision_ids'))
                   for v in document[key]])
    elif section == 'context':
        rows = document['deferred_artifacts']
    elif section == 'changes':
        for collection, delta in document['changes'].items():
            if isinstance(delta, list):
                rows.extend({'collection': collection, **v} for v in delta)
            else:
                for action, items in delta.items():
                    for item in items:
                        if action == 'modified':
                            rows.extend({'collection': collection, 'action': action, 'id': item['id'], **v}
                                        for v in item['changes'])
                        else:
                            rows.append({'collection': collection, 'action': action, 'id': item['id'], 'value': item})
    else:
        raise ValueError('Unknown report section: ' + section)
    if identifier:
        rows = [r for r in rows if identifier in (r.get('id'), r.get('decision_id'),
                 r.get('target', {}).get('id') if isinstance(r.get('target'), dict) else r.get('target'))]
    selected = rows[offset:offset + limit]
    if not full:
        def preview(value):
            text = json.dumps(value, ensure_ascii=False)
            return value if len(text) <= 1200 else {'preview': text[:1200], 'truncated': True,
                                                   'value_sha256': canonical_sha256(value)}
        selected = [{key: preview(value) for key, value in row.items()} for row in selected]
    return {'artifact': str(path), 'section': section, 'total': len(rows), 'offset': offset,
            'returned': len(selected), 'next_offset': offset + len(selected) if offset + len(selected) < len(rows) else None,
            'items': selected, 'note': 'Saved evidence only; not a fresh validation. --full keeps complete values.'}


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='Project root; useful for isolated verification')
    commands = parser.add_subparsers(dest='command', required=True)
    for command in ('report', 'prepare'):
        child = commands.add_parser(command)
        child.add_argument('--version', required=command == 'prepare')
        child.add_argument('--source', action='append', required=command == 'prepare')
        child.add_argument('--decisions', type=Path, help='Only new, explicitly sourced decisions for the prepared version')
        if command == 'report':
            child.add_argument('--full', action='store_true', help='Print the complete detailed report')
            child.add_argument('--output', type=Path, help='Save the complete detailed report to a new file')
            child.add_argument('--review-output', type=Path, help='Create a reassessment dossier and pending assessment; requires version/source')
        else:
            child.add_argument('--review', type=Path, help='Dossier with explicitly completed assessment.yaml')
            child.add_argument('--guide', type=Path, help='Explicit new methodology edition to freeze with this publication')
    child = commands.add_parser('inspect', help='Read saved evidence without rebuilding a candidate')
    child.add_argument('path', type=Path)
    child.add_argument('--section', choices=['changes', 'decisions', 'errors', 'context', 'review', 'review-context'])
    child.add_argument('--id', dest='identifier')
    child.add_argument('--offset', type=int, default=0)
    child.add_argument('--limit', type=int, default=20)
    child.add_argument('--full', action='store_true')
    child = commands.add_parser('publish')
    child.add_argument('--version', required=True)
    child.add_argument('--activate', action='store_true')
    args = parser.parse_args()
    if args.command == 'report':
        if args.review_output and (not args.version or not args.source or args.decisions):
            parser.error('--review-output requires --version and --source, without --decisions')
        bundle = build_candidate(args.root, args.version, args.source, args.decisions,
                                 include_review=bool(args.review_output))
        result = bundle['report']
        review_result = decision_review.save_review(args.review_output, bundle['review'], result) if args.review_output else None
        if args.output:
            # Exclusive creation prevents overwriting a source or publication.
            with args.output.open('x', encoding='utf-8') as stream:
                json.dump(result, stream, ensure_ascii=False, indent=2)
                stream.write('\n')
        if not args.full:
            result = summarize_report(result)
        if args.output:
            result['detailed_report'] = str(args.output)
        if review_result:
            result['reassessment'] = review_result
    elif args.command == 'prepare':
        result = prepare(args.root, args.version, args.source, args.decisions, review_path=args.review, guide_path=args.guide)
    elif args.command == 'inspect':
        result = inspect_artifact(args.path, args.section, args.identifier, args.offset, args.limit, args.full)
    else:
        result = publish_prepared(args.root, args.version, args.activate)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
