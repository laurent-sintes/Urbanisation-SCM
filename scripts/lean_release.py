"""One candidate, one validation gate, disposable staging, Git-backed history."""
from pathlib import Path
from time import perf_counter
import json
import os
import shutil
import uuid

from . import prepare_release as workflow
from . import git_history
from .record_decision import _registry_lock
from .atlas_lock import atlas_lock
from .decision_registry import atomic_replace
from .structured_io import read, dumps
from .model_provenance import validate_model_provenance


def archive_plan(root, version):
    """Refuse retirement until the exact published bytes are recoverable in Git."""
    root = Path(root).resolve()
    commit = git_history.git(root, 'rev-parse', 'HEAD').decode().strip()
    prefixes = [f'modeles/{folder}/{version}' for folder in ('release', 'revisions', 'provenance')]
    prefixes.append(f'modeles/decisions/{version}.json')
    entries = []
    for prefix in prefixes:
        path = root / prefix
        if not path.exists():
            continue
        files = [path] if path.is_file() else list(path.rglob('*'))
        for item in files:
            if item.is_file():
                message = 'Commit the current publication before replacing it: ' + str(item)
                try:
                    archived = git_history.blob(str(root), commit, item.relative_to(root).as_posix())
                except ValueError as exc:
                    raise ValueError(message) from exc
                if archived != item.read_bytes():
                    raise ValueError(message)
        entries.append({'path': prefix, 'commit': commit})
    return entries


def retire(root, entries):
    """Called after activation; verify recoverability before each bounded removal."""
    root = Path(root).resolve()
    index = read(root / git_history.INDEX)
    by_path = {e['path']: e for e in index['archives']}
    for entry in entries:
        if entry['path'] in by_path and by_path[entry['path']] != entry:
            # Migration may already have retired part of this directory. Keep
            # that older mapping; only the remaining files belong to this commit.
            path = root / entry['path']
            files = [path] if path.is_file() else path.rglob('*')
            for item in files:
                if item.is_file():
                    name = item.relative_to(root).as_posix()
                    by_path[name] = {'path': name, 'commit': entry['commit']}
        else:
            by_path[entry['path']] = entry
    index['archives'] = list(by_path.values())
    workflow.publisher.activate_pointer(root / git_history.INDEX, index)
    for entry in entries:
        path = (root / entry['path']).resolve()
        if not path.is_relative_to(root / 'modeles') or path == root / 'modeles':
            raise ValueError('Unsafe retirement path')
        files = [path] if path.is_file() else list(path.rglob('*'))
        if any(p.is_file() and p.read_bytes() != git_history.blob(str(root), entry['commit'], p.relative_to(root).as_posix()) for p in files):
            raise ValueError('Publication changed during retirement')
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()


def check_stage(root, stage, manifest):
    if manifest['input_state'] != workflow.decision_review.input_state(root):
        raise ValueError('Sources or publication code changed since preparation')
    for name, expected in manifest['files'].items():
        path = workflow.checked_path(stage, name)
        if workflow.digest(path) != expected:
            raise ValueError('Prepared artifact changed: ' + name)
    workflow.verify_association(root, manifest['base_version'], manifest['modeling_guide'])
    if manifest.get('new_modeling_guide'):
        workflow.guide_candidate.verify(root, stage, manifest['new_modeling_guide'])


def stage_candidate(root, bundle, guide_path=None):
    parent = root / '.runtime/publication'
    parent.mkdir(parents=True, exist_ok=True)
    stage = parent / bundle['candidate']['version']
    if stage.exists():
        raise ValueError('Preparation already exists')
    folder = parent / ('.prepare-' + uuid.uuid4().hex)
    folder.mkdir()
    try:
        for name, key in [('model.yaml', 'candidate'), ('backlog.yaml', 'snapshot'),
                          ('decisions.json', 'decisions'), ('source-records.json', 'provenance')]:
            workflow.write(folder / name, bundle[key])
        model_provenance = root / 'modeles/backlog/model-provenance.yaml'
        if model_provenance.is_file():
            provenance_errors = validate_model_provenance(read(model_provenance))
            if provenance_errors:
                raise ValueError('\n'.join(provenance_errors))
            workflow.publisher.copy_verified(model_provenance, folder / 'model-provenance.yaml',
                                             workflow.digest(model_provenance))
        evidence = bundle.get('review_evidence', {})
        if evidence and set(evidence) != {'review.json', 'assessment.yaml', 'transcriptions.json'}:
            raise ValueError('Incomplete reassessment evidence')
        for name, document in evidence.items():
            workflow.write(folder / 'decision-review' / name, document)
        report = workflow.summarize_report(bundle['report'])
        manifest = {'kind': 'git_preparation', 'version': bundle['candidate']['version'],
                    'base_version': bundle['pointer']['version'], 'input_state': bundle['input_state'],
                    'source_refs': bundle['publication_refs'], 'summary': report,
                    'files': {p.relative_to(folder).as_posix(): workflow.digest(p)
                              for p in folder.rglob('*') if p.is_file()},
                    'modeling_guide': workflow.capture_association(root, bundle['pointer']['version'])}
        if guide_path:
            manifest['new_modeling_guide'] = workflow.guide_candidate.stage(root, guide_path, folder)
        workflow.write(folder / 'manifest.json', manifest)
        check_stage(root, folder, manifest)
        # Move files, not the TemporaryDirectory itself, keeping cleanup ownership clear.
        stage.mkdir()
        for path in folder.iterdir():
            shutil.move(str(path), stage / path.name)
    finally:
        if folder.resolve().parent != parent.resolve():
            raise ValueError('Unsafe preparation cleanup')
        shutil.rmtree(folder)
    return stage, manifest


def publish(root, stage, manifest):
    check_stage(root, stage, manifest)
    version, base = manifest['version'], manifest['base_version']
    archive = archive_plan(root, base)
    models = root / 'modeles'
    release_dir = models / 'release' / version
    destinations = {
        'model.yaml': release_dir / 'model.yaml',
        'backlog.yaml': models / 'revisions' / version / 'backlog.yaml',
        'decisions.json': models / 'decisions' / (version + '.json'),
        'source-records.json': models / 'provenance' / version / 'source-records.json'}
    if 'model-provenance.yaml' in manifest['files']:
        destinations['model-provenance.yaml'] = models / 'revisions' / version / 'model-provenance.yaml'
    review_files = {name: sha for name, sha in manifest['files'].items()
                    if name.startswith('decision-review/')}
    if review_files and set(review_files) != {
            'decision-review/review.json', 'decision-review/assessment.yaml',
            'decision-review/transcriptions.json'}:
        raise ValueError('Incomplete reassessment evidence')
    destinations.update({name: models / 'revisions' / version / name for name in review_files})
    if any(p.exists() for p in destinations.values()) or release_dir.exists():
        raise ValueError('Publication version already exists; inspect interrupted output')
    candidate = read(stage / 'model.yaml')
    for name, path in destinations.items():
        workflow.publisher.copy_verified(stage / name, path, manifest['files'][name])
    output = {'kind': 'git_release', 'schema_version': '1.0.0', 'version': version,
              'model_path': 'model.yaml', 'model_sha256': manifest['files']['model.yaml'],
              'source_state_sha256': workflow.canonical_sha256(manifest['input_state']),
              'node_count': len(candidate['nodes']),
              'capability_count': sum(n['kind'] == 'capability' for n in candidate['nodes']),
              'complete_capability_count': sum(n['kind'] == 'capability' and n['review']['state'] == 'accepted' for n in candidate['nodes'])}
    for key, name in [('input_revision', 'backlog.yaml'), ('decisions', 'decisions.json'), ('provenance', 'source-records.json')]:
        output[key + '_path'] = os.path.relpath(destinations[name], release_dir).replace('\\', '/')
        output[key + '_sha256'] = manifest['files'][name]
    if 'model-provenance.yaml' in manifest['files']:
        output['model_provenance_path'] = os.path.relpath(destinations['model-provenance.yaml'], release_dir).replace('\\', '/')
        output['model_provenance_sha256'] = manifest['files']['model-provenance.yaml']
    if review_files:
        output['decision_review'] = {f'../../revisions/{version}/{name}': sha
                                    for name, sha in review_files.items()}
    workflow.write(release_dir / 'manifest.json', output)
    notes = f"# Urbanisation {version}\n\n{output['capability_count']} capacités. Sources : {', '.join(manifest['source_refs'])}.\n\nPublication et accord métier restent distincts. Comparaison détaillée disponible dans Git.\n"
    if 'scenario_catalog' in candidate:
        catalog = candidate['scenario_catalog']
        notes += f"\n## Scénarios métier\n\n{len(catalog['value_streams'])} flux de valeur, {len(catalog['scenarios'])} scénarios et {len(catalog['paths'])} parcours autonomes. Illustrations locales et lecture des anciennes publications conservées. Les nouveaux contenus restent proposés.\n"
    if 'hotspot_catalog' in candidate:
        notes += f"\n## Points chauds\n\n{len(candidate['hotspot_catalog']['hotspots'])} points chauds localisés. La publication ne vaut ni arbitrage ni résolution.\n"
    (release_dir / 'release-notes.md').write_text(notes, encoding='utf-8')
    # Recheck every source immediately before the activation boundary.
    check_stage(root, stage, manifest)
    if manifest.get('new_modeling_guide'):
        workflow.guide_candidate.publish(root, stage, version, manifest['new_modeling_guide'])
    else:
        workflow.carry_association(root, base, version, manifest['modeling_guide'])
    workflow.register(models / 'release', candidate, version + '/release-notes.md', workflow.write, workflow.publisher.activate_pointer)
    # Pending captures have now been represented in published decisions or explicitly deferred.
    pending = root / 'modeles/backlog/decision-intents.yaml'
    atomic_replace(pending, pending.read_bytes() if pending.exists() else None,
                   dumps({'schema_version': '1.0.0', 'intents': [], 'suspensions': []}).encode('utf-8'))
    retire(root, archive)
    if stage.resolve().parent != (root / '.runtime/publication').resolve():
        raise ValueError('Unsafe staging cleanup')
    shutil.rmtree(stage)
    return {'status': 'published', 'version': version, 'release_activated': True,
            'checks': {'validation_errors': 0}, 'summary': manifest['summary']}


def run(root, version=None, source_refs=None, *, activate=False, review_path=None,
        decisions_path=None, guide_path=None, atlas_url='http://127.0.0.1:8765', verify_site=True):
    root = Path(root).resolve()
    (root / '.runtime').mkdir(exist_ok=True)
    with atlas_lock(root), _registry_lock(root / 'modeles/backlog/decision-intents.yaml'):
        return _run(root, version, source_refs, activate=activate, review_path=review_path,
                    decisions_path=decisions_path, guide_path=guide_path, atlas_url=atlas_url, verify_site=verify_site)


def _run(root, version, source_refs, *, activate, review_path, decisions_path, guide_path, atlas_url, verify_site):
    if not source_refs:
        raise ValueError('An explicit publication source is required')
    started = perf_counter()
    timings = {}
    def measured(name, operation):
        before = perf_counter()
        try:
            return operation()
        finally:
            timings[name] = round(perf_counter() - before, 4)
    current = measured('load_current', lambda: workflow.load_current(root))
    version = workflow.valid_version(version or workflow.suggested_version(current[0]))
    if version == current[1]['version']:
        if not activate or review_path or decisions_path or guide_path or set(source_refs) != set(current[2].get('publication', {}).get('source_refs', [])):
            raise ValueError('Version already published with another requested scope')
        return finish(root, {'status': 'published', 'version': version, 'already_published': True}, verify_site, atlas_url, started, timings=timings)
    if activate and not (root / '.runtime/publication' / version).exists():
        # Fail before constructing/reviewing a candidate. Publication still checks
        # again at retirement: this early diagnostic is not an integrity waiver.
        measured('git_preflight', lambda: archive_plan(root, current[1]['version']))
    stage = root / '.runtime/publication' / version
    if stage.exists():
        if review_path or decisions_path or guide_path:
            raise ValueError('Existing preparation is frozen; choose a new version for new inputs')
        manifest = read(stage / 'manifest.json')
        if manifest['source_refs'] != source_refs or manifest['base_version'] != current[1]['version']:
            raise ValueError('Preparation scope or base publication changed')
        check_stage(root, stage, manifest)
    else:
        bundle = measured('candidate_and_validation', lambda: workflow.build_candidate(root, version, source_refs, decisions_path,
                    review_path=review_path, include_review=True, current=current, lightweight=True))
        report = bundle['report']
        if report['validation_errors']:
            return {'status': 'blocked', 'summary': workflow.summarize_report(report), 'timings_seconds': {**timings, 'total': round(perf_counter() - started, 4)}}
        if report['deferred_decisions'] and review_path is None:
            folder = root / '.runtime/release-reviews' / version
            dossier = workflow.decision_review.save_review(folder, bundle['review'], report)
            return {'status': 'needs_review', 'version': version, **dossier, 'timings_seconds': {**timings, 'total': round(perf_counter() - started, 4)}}
        has_changes = any(any(delta.values()) if isinstance(delta, dict) else bool(delta) for delta in report['changes'].values())
        model_provenance = root / 'modeles/backlog/model-provenance.yaml'
        current_manifest = read(current[4])
        provenance_changed = (model_provenance.is_file()
                              and workflow.digest(model_provenance) != current_manifest.get('model_provenance_sha256'))
        metadata_cleaned = any(key in current[2] and key not in bundle['candidate']
                               for key in ('source_version', 'source_files', 'lifecycle_policy'))
        if not has_changes and not report['glossary_changes'] and not report['new_decision_ids'] and guide_path is None and not provenance_changed and not metadata_cleaned:
            return finish(root, {'status': 'unchanged', 'version': current[1]['version']}, activate and verify_site, atlas_url, started, export_site=activate, timings=timings)
        stage, manifest = measured('stage', lambda: stage_candidate(root, bundle, guide_path))
    try:
        result = measured('publish', lambda: publish(root, stage, manifest)) if activate else {'status': 'prepared', 'version': version, 'prepared_manifest': str(stage / 'manifest.json'), 'summary': manifest['summary']}
    except (OSError, ValueError) as exc:
        if (root / 'modeles/release' / version).exists():
            return {'status': 'publication_incomplete', 'version': version, 'error': str(exc),
                    'recovery': 'Inspect written artifacts and the active pointer before retrying.'}
        raise
    return finish(root, result, activate and verify_site, atlas_url, started, timings=timings)


def finish(root, result, verify_site, atlas_url, started, export_site=True, timings=None):
    timings = dict(timings or {})
    if export_site and result['status'] in ('published', 'unchanged'):
        from .export_atlas import export_atlas
        try:
            step = perf_counter()
            result['static_export'] = export_atlas(root)
        except (ValueError, OSError) as exc:
            result.update(status='published_checks_failed', static_export={'error': str(exc)})
            verify_site = False
        finally:
            timings['static_export'] = round(perf_counter() - step, 4)
    if verify_site:
        from .release import verify_atlas
        try:
            step = perf_counter()
            result['atlas'] = verify_atlas(root, result['version'], atlas_url)
        except (ValueError, OSError) as exc:
            result.update(status='published_checks_failed', atlas={'verified': False, 'error': str(exc)})
        finally:
            timings['verify_atlas'] = round(perf_counter() - step, 4)
    result['timings_seconds'] = {**timings, 'total': round(perf_counter() - started, 4)}
    return result
