"""Prepare evidence for explicit reassessment; never infer a business approval."""
from copy import deepcopy
from collections import Counter, defaultdict
from hashlib import sha256
from pathlib import Path
import os
import shutil
import sys
import uuid

try:
    from .structured_io import read
    from .publish_release import write, digest
    from .validate_models import canonical_sha256
    from .element_versions import GENERATED
    from .glossary import reference_impacts
except ImportError:
    from structured_io import read
    from publish_release import write, digest
    from validate_models import canonical_sha256
    from element_versions import GENERATED
    from glossary import reference_impacts


def input_state(root):
    """Hash the bounded live inputs and tool code, including directory inventories."""
    root = Path(root).resolve()
    paths = []
    for folder in ('modeles/backlog', 'modeles/schemas'):
        paths.extend(p for p in (root / folder).iterdir()
                     if p.is_file() and p.suffix in ('.yaml', '.yml', '.json'))
    paths.extend((root / 'modeles/backlog/decision-intents').rglob('*.yaml'))
    paths.extend(root / p for p in ('modeles/provenance/source-records.json',
                                   'modeles/release/index.json', 'modeles/modeling-guides/index.yaml',
                                   'modeles/git-history.json')
                 if (root / p).exists())
    if (root / 'modeles/git-history.json').is_file():
        # Bind the approved baseline as well as the working sources. This is a
        # byte check, not another semantic validation of the previous release.
        folder = root / 'modeles/release'
        index = read(folder / 'index.json')
        descriptor = folder / index['current']
        model = folder / read(descriptor)['path']
        manifest_path = model.parent / 'manifest.json'
        manifest = read(manifest_path)
        paths.extend((descriptor, model, manifest_path))
        for key in ('input_revision', 'decisions', 'provenance'):
            path = (model.parent / manifest[key + '_path']).resolve()
            if not path.is_relative_to(root):
                raise ValueError('Publication baseline escapes the project')
            paths.append(path)
        for relative in manifest.get('decision_review', {}):
            path = (model.parent / relative).resolve()
            if not path.is_relative_to(root):
                raise ValueError('Reassessment evidence escapes the project')
            paths.append(path)
    return {
        'files': {p.relative_to(root).as_posix(): digest(p) for p in sorted(paths)},
        'tool_code': {p.name: digest(p) for p in sorted(Path(__file__).parent.glob('*.py'))},
        'python': sys.version,
    }


def semantic(value):
    if isinstance(value, dict):
        return {k: deepcopy(v) if k in ('fields', 'qualification') else semantic(v)
                for k, v in value.items() if k not in GENERATED}
    if isinstance(value, list):
        return [semantic(v) for v in value]
    return value


def make_review(snapshot, previous_snapshot, previous_release, old_decisions, deferred,
                pointer, base_manifest_sha256, state, source_refs, diff):
    """Exact values plus context, prior to derived publication notes/timestamps."""
    old = {c: {v['id']: v for v in previous_snapshot[c]} for c in ('nodes', 'relations')}
    new = {c: {v['id']: v for v in snapshot[c]} for c in old}
    decisions = {v['id']: v for v in old_decisions['decisions']}
    impacts = reference_impacts(previous_release, snapshot)
    items = []
    for suspended in deferred:
        original = decisions[suspended['id']]
        target = original['target']
        collection, identifier = target['collection'], target['id']
        before, after = old[collection].get(identifier), new[collection].get(identifier)
        old_values = before.get('fields', {}) if before and collection == 'nodes' else before or {}
        new_values = after.get('fields', {}) if after and collection == 'nodes' else after or {}
        values = {}
        for field in target['approved_fields']:
            values[field] = {
                'before_present': field in old_values, 'after_present': field in new_values,
                'before': deepcopy(old_values.get(field)), 'after': deepcopy(new_values.get(field)),
                'approved_sha256': target['value_sha256'][field],
                'before_sha256': canonical_sha256(old_values[field]) if field in old_values else None,
                'after_sha256': canonical_sha256(new_values[field]) if field in new_values else None,
            }
        unchanged_fields = [field for field, value in values.items()
                            if value['before_present'] and value['after_present']
                            and value['before_sha256'] == value['after_sha256'] == value['approved_sha256']]
        changed_fields = [field for field in values if field not in unchanged_fields]
        unchanged = not changed_fields
        context_reasons = ('revision_changed_requires_explicit_reassessment', 'context_changed_requires_explicit_reassessment')
        eligible = (suspended['reason'] in context_reasons
                    and bool(values) and unchanged and original['decision_state'] == 'accepted')
        eligible_partial = (suspended['reason'] in (*context_reasons, 'approved_value_changed')
                            and bool(unchanged_fields) and after is not None
                            and original['decision_state'] == 'accepted')
        # Include identities and explicit incident edges, even for relation decisions.
        neighbors = {identifier}
        if collection == 'relations':
            neighbors.update(v[k] for v in (before, after) if v for k in ('source_id', 'target_id'))
        linked = lambda records: {key: semantic(v) for key, v in records.items()
                                  if v['source_id'] in neighbors or v['target_id'] in neighbors}
        items.append({
            'decision_id': original['id'], 'target': {'collection': collection, 'id': identifier},
            'reason': suspended['reason'], 'eligible_for_reassessment': eligible,
            'eligible_for_partial_reassessment': eligible_partial,
            'unchanged_fields': unchanged_fields, 'changed_fields': changed_fields,
            'prior_decision': deepcopy(original), 'prior_decision_sha256': canonical_sha256(original),
            'before_revision': target['revision'], 'after_revision': after['revision'] if after else None,
            'approved_values': values,
            'target_changes': diff(semantic(before), semantic(after)),
            'relation_changes': diff(linked(old['relations']), linked(new['relations'])),
            'glossary_impacts': [v for v in impacts if v['id'] in neighbors],
        })
    return {
        'schema_version': '1.0.0', 'kind': 'decision_reassessment',
        'base_version': pointer['version'], 'candidate_version': snapshot['version'],
        'base_pointer': pointer, 'base_manifest_sha256': base_manifest_sha256,
        'inputs': state, 'publication_source_refs': source_refs,
        'global_context_changes': diff(semantic({k: v for k, v in previous_snapshot.items()
                                                if k not in ('nodes', 'relations', 'version', 'as_of', 'space')}),
                                       semantic({k: v for k, v in snapshot.items()
                                                 if k not in ('nodes', 'relations', 'version', 'as_of', 'space')})),
        'items': items, 'publication_is_business_validation': False,
        'note': 'Égalité de valeurs ne vaut pas identité de sens. Examiner le contexte et la portée avant toute reprise.',
    }


def save_review(destination, review, report):
    """Create a complete dossier once; only assessment.yaml is intended for editing."""
    destination = Path(destination).resolve()
    if destination.exists():
        raise ValueError('Review destination already exists')
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.parent / ('.review-' + uuid.uuid4().hex)
    temporary.mkdir()
    try:
        write(temporary / 'review.json', review)
        write(temporary / 'report.json', report)
        write(temporary / 'summary.json', summarize_review(review, report))
        write(temporary / 'assessment.yaml', {
            'schema_version': '1.0.0', 'version': review['candidate_version'],
            'review_sha256': canonical_sha256(review), 'reviewer': '',
            'items': [{'decision_id': item['decision_id'], 'action': 'pending', 'rationale': ''}
                      for item in review['items']],
        })
        os.rename(temporary, destination)
    finally:
        if temporary.exists():
            if temporary.resolve().parent != destination.parent or not temporary.name.startswith('.review-'):
                raise ValueError('Unsafe review cleanup target')
            shutil.rmtree(temporary)
    return {'review_directory': str(destination), 'assessment': str(destination / 'assessment.yaml'),
            'decisions_to_examine': len(review['items']),
            'unchanged_values_to_reassess': sum(i['eligible_for_reassessment'] for i in review['items']),
            'review_summary': str(destination / 'summary.json')}


def summarize_review(review, report):
    """Small navigation index; the complete dossier remains the review authority."""
    groups = defaultdict(list)
    for item in review['items']:
        groups[(item['target']['collection'], item['target']['id'])].append(item['decision_id'])
    return {'decisions': len(review['items']), 'targets': len(groups),
            'reasons': dict(Counter(item['reason'] for item in review['items'])),
            'context_reasons': dict(Counter(reason for item in report.get('deferred_decisions', [])
                                           for reason in item.get('context_reasons', []))),
            'per_target': [{'collection': collection, 'id': identifier, 'decision_ids': ids}
                           for (collection, identifier), ids in sorted(groups.items())],
            'note': 'Index de lecture ; aucune décision ni extension d’accord.'}


def apply_assessment(directory, current):
    """Materialize only explicitly reviewed, unchanged scopes as new transcriptions."""
    directory = Path(directory)
    frozen = read(directory / 'review.json')
    if frozen != current:
        raise ValueError('Review is stale or altered; create a new dossier from current inputs')
    assessment = read(directory / 'assessment.yaml')
    if (set(assessment) != {'schema_version', 'version', 'review_sha256', 'reviewer', 'items'}
            or assessment['schema_version'] != '1.0.0'
            or assessment['version'] != current['candidate_version']
            or assessment['review_sha256'] != canonical_sha256(current)):
        raise ValueError('Assessment does not match its review')
    reviewer = assessment['reviewer']
    if not isinstance(reviewer, str) or not reviewer.strip():
        raise ValueError('An explicit reviewer is required')
    entries = assessment['items']
    base_keys = {'decision_id', 'action', 'rationale'}
    if not isinstance(entries, list) or any(not isinstance(e, dict) or set(e) not in (base_keys, base_keys | {'approved_fields'})
                                          or not isinstance(e['decision_id'], str) for e in entries):
        raise ValueError('Invalid assessment entries')
    by_id = {e['decision_id']: e for e in entries}
    if len(by_id) != len(entries) or set(by_id) != {e['decision_id'] for e in current['items']}:
        raise ValueError('Assessment must cover each suspended decision exactly once')
    decisions, transcriptions = [], []
    for item in current['items']:
        entry = by_id[item['decision_id']]
        if (entry['action'] not in ('retain', 'retain_partial', 'defer') or not isinstance(entry['rationale'], str)
                or not entry['rationale'].strip()):
            raise ValueError('Explicit retain/retain_partial/defer and scope rationale required: ' + item['decision_id'])
        if entry['action'] != 'retain_partial' and 'approved_fields' in entry:
            raise ValueError('approved_fields requires retain_partial: ' + item['decision_id'])
        if entry['action'] == 'defer':
            continue
        prior_target = item['prior_decision']['target']
        if entry['action'] == 'retain_partial':
            selected = entry.get('approved_fields')
            unchanged = {
                field for field, value in item['approved_values'].items()
                if field in prior_target['approved_fields']
                and value['before_present'] and value['after_present']
                and canonical_sha256(value['before']) == canonical_sha256(value['after'])
                == prior_target['value_sha256'][field]
            }
            if (not item.get('eligible_for_partial_reassessment')
                    or item['prior_decision']['decision_state'] != 'accepted'
                    or not isinstance(selected, list) or not selected
                    or any(not isinstance(field, str) or field not in unchanged for field in selected)
                    or len(set(selected)) != len(selected)):
                raise ValueError('Partial reassessment requires an explicit nonempty unchanged scope: ' + item['decision_id'])
        elif not item['eligible_for_reassessment']:
            raise ValueError('Changed, removed or unapproved values cannot be transcribed: ' + item['decision_id'])
        else:
            selected = prior_target['approved_fields']
        decision = deepcopy(item['prior_decision'])
        identifier = 'ADOPT-REASSESS-' + sha256((current['candidate_version'] + ':' + decision['id']).encode()).hexdigest()[:24]
        decision.update(id=identifier, recorded_at=current['candidate_version'].split('.')[0])
        decision['target'].update(revision=item['after_revision'], import_version=current['candidate_version'])
        decision['target']['approved_fields'] = list(selected)
        decision['target']['value_sha256'] = {field: prior_target['value_sha256'][field] for field in selected}
        # The complete prior decision (including its note) is kept in review.json.
        # Do not copy the entire reassessment history into each active decision.
        decision['note'] = (f"Réexamen de {item['decision_id']} par {reviewer.strip()} : {entry['rationale'].strip()} "
                             'Transcription des seules valeurs historiques inchangées ; aucune extension de portée. '
                             f"Preuve : modeles/revisions/{current['candidate_version']}/decision-review/assessment.yaml. "
                             'Décision antérieure intégrale et empreinte : review.json du même dossier.')
        decisions.append(decision)
        transcriptions.append({'decision_id': identifier, 'prior_decision_id': item['decision_id'],
                               'approved_fields': decision['target']['approved_fields']})
    return {'schema_version': '1.0.0', 'version': current['candidate_version'], 'decisions': decisions}, {
        'review.json': current, 'assessment.yaml': assessment,
        'transcriptions.json': {'version': current['candidate_version'], 'items': transcriptions},
    }
