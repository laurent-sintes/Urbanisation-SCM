"""One controlled release run: prepare, publish, verify Atlas and report timings.

Without --activate this only prepares. A semantic reassessment returns needs_review
and a bounded dossier; it never answers that review or grants an approval.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
from time import perf_counter
from urllib.parse import urlsplit
from urllib.request import urlopen

try:
    from . import prepare_release as workflow
    from . import render_models
    from .validate_models import validate_project
except ImportError:
    import prepare_release as workflow
    import render_models
    from validate_models import validate_project


def verify_atlas(root, version, base_url='http://127.0.0.1:8765'):
    root = Path(root).resolve()
    repository = str(Path(__file__).resolve().parents[1])
    if repository not in sys.path:
        sys.path.insert(0, repository)
    address = urlsplit(base_url)
    if address.scheme != 'http' or address.hostname not in ('127.0.0.1', 'localhost', '::1') or address.path not in ('', '/') or address.query or address.fragment or address.username:
        raise ValueError('Atlas verification requires a local HTTP origin')
    from scripts.export_atlas import encoded
    from scripts.atlas_metamodel import describe_metamodel
    from scripts.atlas_documentation import separate_documentation
    from scripts.release_catalog import PublicationReader
    from scripts.structured_io import read as read_document
    from app.modeling_guide import _load_associated_guide

    def document(route):
        with urlopen(base_url.rstrip('/') + route, timeout=10) as response:
            payload = response.read()
        return json.loads(payload), payload

    def get(route):
        return document(route)[0]

    status = get('/__atlas__/identity.json')
    if status.get('appName') != 'FLOW Atlas' or Path(status.get('repositoryRoot', '')).resolve() != Path(root).resolve() or status.get('mode') != 'static':
        raise ValueError('The local service is not this project’s FLOW Atlas')
    reader = PublicationReader(root / 'modeles/release')
    pointer, raw = reader.load(version)
    complete_guide = _load_associated_guide(root, version)
    metamodel_document, expected_guide = separate_documentation(complete_guide, raw)
    schema_path = root / 'modeles/schemas/urbanism.schema.json'
    snapshot_schema = read_document(schema_path) if schema_path.is_file() else None
    expected = {**raw, 'sourcePath': 'modeles/release/' + pointer['path'],
                'metamodel': describe_metamodel(raw, complete_guide, snapshot_schema)}
    if metamodel_document:
        expected['metamodel']['documentation'] = metamodel_document
    actual, model_payload = document('/data/' + version + '/model.json')
    if not isinstance(actual, dict) or actual.get('version') != version or actual.get('sourcePath') != expected['sourcePath']:
        raise ValueError('Atlas serves another publication')
    # Every published root participates, including catalogs and future fields.
    # List order is part of the frozen export, just as values and identities are.
    if actual != expected:
        changed = sorted(key for key in actual.keys() | expected.keys()
                         if key not in actual or key not in expected or actual[key] != expected[key])
        raise ValueError('Atlas model differs: ' + ', '.join(changed))

    catalog = get('/data/index.json')
    expected_catalog = reader.catalog()
    if not isinstance(catalog, dict) or reader.current_version != version or catalog.get('current_version') != version:
        raise ValueError('Atlas catalog differs')
    entries = catalog.get('versions')
    if not isinstance(entries, list) or any(not isinstance(entry, dict) for entry in entries):
        raise ValueError('Atlas catalog differs')
    metadata = {**catalog, 'versions': [
        {key: value for key, value in entry.items() if key not in ('model_sha256', 'guide_sha256')}
        for entry in entries]}
    if metadata != expected_catalog:
        raise ValueError('Atlas catalog differs')
    entry = next(item for item in entries if item['version'] == version)
    if (hashlib.sha256(model_payload).hexdigest() != entry.get('model_sha256')
            or entry.get('model_sha256') != hashlib.sha256(encoded(expected)).hexdigest()):
        raise ValueError('Atlas model hash differs')

    guide, guide_payload = document('/data/' + version + '/guide.json')
    if guide != expected_guide:
        raise ValueError('Atlas methodology differs')
    if (hashlib.sha256(guide_payload).hexdigest() != entry.get('guide_sha256')
            or entry.get('guide_sha256') != hashlib.sha256(encoded(expected_guide)).hexdigest()):
        raise ValueError('Atlas methodology hash differs')
    reader.verify_descriptors()
    return {'verified': True, 'version': version, 'sourcePath': actual['sourcePath']}


def final_checks(root):
    validation = validate_project(root)
    errors, counters = validation['errors'], validation['counters']
    if errors:
        raise ValueError('\n'.join(errors))
    pointer = workflow.resolve_release(Path(root) / 'modeles/release')
    model = workflow.read(Path(root) / 'modeles/release' / pointer['path'])
    target = Path(root) / 'restitutions/release.md'
    target.parent.mkdir(parents=True, exist_ok=True)
    render_models.write_text_if_changed(target, render_models.render(model, 'Release'))
    return {'validation_errors': 0, 'counters': counters, 'rendered': 'restitutions/release.md'}


def _complete(root, version, source_refs, result, measure, timings, atlas_url, verify_site):
    errors = []
    try:
        result['checks'] = measure('final_checks', lambda: final_checks(root))
    except (ValueError, OSError) as exc:
        errors.append(str(exc))
    try:
        from scripts.export_atlas import export_atlas
        result['static_export'] = measure('static_export', lambda: export_atlas(root))
    except (ValueError, OSError) as exc:
        errors.append('Static export: ' + str(exc))
    if verify_site:
        try:
            result['atlas'] = measure('atlas', lambda: verify_atlas(root, version, atlas_url))
        except (ValueError, OSError) as exc:
            result['atlas'] = {'verified': False, 'error': str(exc)}
            errors.append('Atlas: ' + str(exc))
    else:
        result['atlas'] = {'verified': False, 'skipped': True}
    result.update(status='published_checks_failed' if errors else 'published', errors=errors,
                  version=version, timings_seconds=timings)
    folder = Path(root) / '.runtime/release-runs' / version
    folder.mkdir(parents=True, exist_ok=True)
    workflow.publisher.activate_pointer(folder / 'completion.json', result)
    text = [f'# Publication {version}', '',
            f"État : {result['status']}. Sources de publication : {', '.join(source_refs)}.", '',
            f"Atlas vérifié : {'oui' if result['atlas'].get('verified') else 'non'}.",
            'Publication et validation métier restent distinctes.', '', '## Durées', '']
    text += [f'- {name} : {seconds:.3f} s' for name, seconds in timings.items()]
    if errors:
        text += ['', '## Vérifications à reprendre', ''] + ['- ' + error for error in errors]
    (folder / 'completion.md').write_text('\n'.join(text) + '\n', encoding='utf-8')
    journal = Path(root) / 'JOURNAL.md'
    marker = f'<!-- release-run:{version} -->'
    if journal.exists() and marker not in journal.read_text(encoding='utf-8'):
        entry = f'\n\n{marker}\n## Publication {version}\n\nSources : {", ".join(source_refs)}. État : {result["status"]}. Atlas vérifié : {bool(result["atlas"].get("verified"))}. Détail : `.runtime/release-runs/{version}/completion.md`.\n'
        with journal.open('ab') as stream:
            stream.write(entry.encode('utf-8'))
    result['completion_report'] = str(folder / 'completion.md')
    return result


def _incomplete(root, version, error, timings):
    result = {'status': 'publication_incomplete', 'version': version,
              'error': str(error), 'timings_seconds': timings,
              'recovery': 'Inspect the existing artifacts and active pointer before recovery. No publication file has been overwritten or automatically retried.'}
    folder = Path(root) / '.runtime/release-runs' / version
    folder.mkdir(parents=True, exist_ok=True)
    workflow.publisher.activate_pointer(folder / 'incomplete.json', result)
    return result


def run(root, version=None, source_refs=None, *, activate=False, review_path=None,
        decisions_path=None, guide_path=None, atlas_url='http://127.0.0.1:8765', verify_site=True):
    root = Path(root).resolve()
    if (root / 'modeles/git-history.json').is_file():
        if __package__:
            from .lean_release import run as lean_run
        else:
            sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
            from scripts.lean_release import run as lean_run
        return lean_run(root, version, source_refs, activate=activate, review_path=review_path,
                        decisions_path=decisions_path, guide_path=guide_path,
                        atlas_url=atlas_url, verify_site=verify_site)
    if not source_refs:
        raise ValueError('An explicit publication source is required')
    timings = {}
    def measure(name, operation):
        start = perf_counter()
        try:
            return operation()
        finally:
            timings[name] = round(perf_counter() - start, 4)
    models, current, published, _, _ = workflow.load_current(root)
    version = workflow.valid_version(version or workflow.suggested_version(models))
    if current['version'] == version:
        if review_path or decisions_path or guide_path:
            raise ValueError('Published version is frozen; omit new inputs when repeating its checks')
        if not activate or set(source_refs) != set(published.get('publication', {}).get('source_refs', [])):
            raise ValueError('Version already published with another requested scope')
        return _complete(root, version, source_refs, {'already_published': True, 'release_activated': True},
                         measure, timings, atlas_url, verify_site)
    if any(path.exists() for path in (models / 'release' / version, models / 'revisions' / version,
                                      models / 'provenance' / version, models / 'decisions' / (version + '.json'))):
        return _incomplete(root, version, 'Unactivated publication artifacts already exist', timings)
    stage = models / 'staging' / version
    if stage.exists():
        manifest = workflow.read(stage / 'manifest.json')
        if source_refs != manifest['publication_source_refs']:
            raise ValueError('Prepared publication sources differ')
        if review_path or decisions_path or guide_path:
            raise ValueError('Existing preparation is frozen; omit inputs to resume it')
        result = {'prepared_manifest': str(stage / 'manifest.json'),
                  'summary': workflow.summarize_report(workflow.read(stage / 'report.json'))}
    else:
        bundle = measure('candidate', lambda: workflow.build_candidate(root, version, source_refs,
            decisions_path, include_review=True, review_path=review_path))
        report = bundle['report']
        if review_path is None and report['deferred_decisions']:
            folder = root / '.runtime/release-reviews' / version
            review = workflow.decision_review.save_review(folder, bundle['review'], report)
            return {'status': 'needs_review', 'version': version, **review,
                    'summary': workflow.summarize_report(report), 'timings_seconds': timings}
        if report['validation_errors']:
            folder = root / '.runtime/release-runs' / version
            folder.mkdir(parents=True, exist_ok=True)
            workflow.publisher.activate_pointer(folder / 'blocked-report.json', report)
            return {'status': 'blocked', 'version': version, 'report': str(folder / 'blocked-report.json'),
                    'summary': workflow.summarize_report(report), 'timings_seconds': timings}
        # Pure annex-only changes do not republish an identical business snapshot,
        # unless a new explicit methodology edition is part of this release.
        has_changes = any(any(delta.values()) if isinstance(delta, dict) else bool(delta)
                          for delta in report['changes'].values())
        if not has_changes and not report['glossary_changes'] and not report['new_decision_ids'] and guide_path is None:
            result = {'status': 'unchanged', 'version': current['version'], 'timings_seconds': timings}
            if activate:
                try:
                    from scripts.export_atlas import export_atlas
                    result['static_export'] = measure('static_export', lambda: export_atlas(root))
                except (ValueError, OSError) as exc:
                    result.update(status='unchanged_checks_failed', static_export={'error': str(exc)})
                    return result
            if activate and verify_site:
                try:
                    result['atlas'] = measure('atlas', lambda: verify_atlas(root, current['version'], atlas_url))
                except (ValueError, OSError) as exc:
                    result.update(status='unchanged_checks_failed', atlas={'verified': False, 'error': str(exc)})
            return result
        result = measure('freeze', lambda: workflow.stage_candidate(root, bundle, guide_path=guide_path))
    if not activate:
        return {**result, 'status': 'prepared', 'version': version, 'timings_seconds': timings}
    try:
        result.update(measure('publish', lambda: workflow.publish_prepared(root, version, activate=True)))
    except (ValueError, OSError) as exc:
        if any((models / folder / version).exists() for folder in ('release', 'revisions', 'provenance')):
            return _incomplete(root, version, exc, timings)
        raise
    return _complete(root, version, source_refs, result, measure, timings, atlas_url, verify_site)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=workflow.ROOT)
    parser.add_argument('--version')
    parser.add_argument('--source', action='append', required=True)
    parser.add_argument('--activate', action='store_true')
    parser.add_argument('--review', type=Path)
    parser.add_argument('--decisions', type=Path)
    parser.add_argument('--guide', type=Path)
    parser.add_argument('--atlas-url', default='http://127.0.0.1:8765')
    args = parser.parse_args()
    result = run(args.root, args.version, args.source, activate=args.activate,
                 review_path=args.review, decisions_path=args.decisions,
                 guide_path=args.guide, atlas_url=args.atlas_url)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['status'] in ('prepared', 'published', 'unchanged') else 2


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.exit(main())
