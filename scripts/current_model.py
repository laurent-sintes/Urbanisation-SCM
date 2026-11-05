"""Build Atlas directly from the single working model, with no release mutation."""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import json
import re
import shutil

from scripts.structured_io import read, dumps

CONFIG = 'modeles/project.yaml'
GENERATED = re.compile(r'(?:\d{4}-\d{2}-\d{2}\.[1-9]\d*|current-[a-f0-9]{24})\Z')


def enabled(root):
    return (Path(root) / CONFIG).is_file()


def configuration(root):
    root = Path(root).resolve()
    config = read(root / CONFIG)
    if config.get('schema_version') != 1 or config.get('mode') != 'current':
        raise ValueError('Invalid current-model configuration')
    for key in ('model', 'glossary', 'methodology', 'agreements', 'intents', 'sources', 'schema'):
        path = root / config[key]
        if not path.resolve().is_relative_to(root) or path.is_symlink() or not path.is_file():
            raise ValueError('Missing or unsafe current-model input: ' + key)
    return config


def compile_current(root):
    from scripts.guide_candidate import compile_draft
    from scripts.record_decision import ContextIndex, _values, canonical_sha256, compile_intents
    from scripts.decision_registry import read_registry
    from scripts.dependency_signature import signature
    from scripts.publish_release import compile_snapshot
    from scripts.validate_models import validate_urbanism, validate_sources
    from scripts.atlas_documentation import separate_documentation
    from scripts.atlas_metamodel import describe_metamodel
    from scripts.atlas_reader_content import (reading_projection, reader_vocabulary,
                                             presentation_profile, application_contexts, reader_content_inputs)
    root = Path(root).resolve()
    config = configuration(root)
    dependencies = {CONFIG: sha256((root / CONFIG).read_bytes()).hexdigest()}
    for key in ('model', 'glossary', 'agreements', 'intents', 'sources', 'schema'):
        name = config[key]
        dependencies[name] = sha256((root / name).read_bytes()).hexdigest()
    model = read(root / config['model'])
    model['glossary'] = read(root / config['glossary'])
    _, guide, guide_dependencies = compile_draft(root, config['methodology'])
    dependencies.update(guide_dependencies)
    sources = read(root / config['sources'])
    schema = read(root / config['schema'])
    errors = validate_sources(sources) + validate_urbanism(
        model, {r['id']: r for r in sources['records']}, schema,
        require_function_mapping=True, method_terms=guide.get('glossary', {}).get('terms', []))
    if errors:
        raise ValueError('\n'.join(errors))
    # A content identity pins model, vocabulary and guide to the same generated build.
    tooling = signature(Path(__file__).resolve().parents[1], ['scripts/current_model.py'])
    identity = sha256(json.dumps({'sources': dependencies, 'tooling': tooling,
                                  'reading': reader_content_inputs(root)}, sort_keys=True).encode()).hexdigest()
    version = 'current-' + identity[:24]
    contexts = ContextIndex(model)
    ledger = read(root / config['agreements'])
    accepted, stale = [], []
    for decision in ledger['decisions']:
        target = decision['target']
        try:
            values = _values(model, target['collection'], target['id'], target['approved_fields'])
            unchanged = all(canonical_sha256(v) == target['value_sha256'][f] for f, v in values.items())
            current_context = canonical_sha256(contexts.context(target['collection'], target['id']))
            if unchanged and ledger['contexts'].get(decision['id']) == current_context:
                accepted.append(deepcopy(decision))
            else:
                stale.append(decision['id'])
        except ValueError:
            stale.append(decision['id'])
    intents = read_registry(root / config['intents'])
    pending = compile_intents(intents, model, {'decisions': accepted}, sources)
    accepted.extend(pending['decisions'])
    raw = compile_snapshot(model, {'decisions': accepted}, version, [])
    raw.update(space='current', sourcePath=config['model'], build={'identity': identity, 'source_sha256': dependencies})
    for key in ('release_kind', 'publication', 'source_version', 'source_files'):
        raw.pop(key, None)
    raw['limitations'] = ['Les accords explicites portent uniquement sur leurs champs et leur contexte inchangés.',
                          'La génération et les tests ne constituent pas une validation métier.']
    raw['agreement_review'] = {'stale_decisions': stale}
    response = {'schema_version': '1.0.0', 'publication_version': version, 'status': 'available',
                'message': 'Méthode du modèle courant.', 'guide': guide}
    metamodel_document, public_guide = separate_documentation(response, raw)
    raw['metamodel'] = describe_metamodel(raw, response, schema)
    if metamodel_document:
        raw['metamodel']['documentation'] = metamodel_document
    raw['metamodel']['vocabulary'] = reader_vocabulary(root, raw, response)
    raw['presentation'] = presentation_profile(root, raw)
    if raw.get('application_catalog'):
        raw['application_catalog']['contexts'] = application_contexts(root, raw)
    projection = reading_projection(root, raw, response)
    if projection is not None:
        raw['reader_projection'] = projection
    if any(sha256((root / name).read_bytes()).hexdigest() != digest for name, digest in dependencies.items()):
        raise ValueError('Current-model sources changed during generation')
    return raw, public_guide, dependencies


def export_current(root, destinations=None, *, require_cached=False):
    from scripts.export_atlas import atomic_write, encoded
    from scripts.document_catalog import asset_bytes, document_extension
    root = Path(root).resolve()
    model, guide, dependencies = compile_current(root)
    version = model['version']
    payloads = {'model.json': encoded(model), 'model.yaml': dumps(model).encode('utf-8'), 'guide.json': encoded(guide)}
    entry = {'version': version, 'model_sha256': sha256(payloads['model.json']).hexdigest(),
             'model_yaml_sha256': sha256(payloads['model.yaml']).hexdigest(),
             'guide_sha256': sha256(payloads['guide.json']).hexdigest()}
    catalog = {'schema_version': '1.0.0', 'mode': 'current', 'current_version': version, 'versions': [entry]}
    files = {version + '/' + name: value for name, value in payloads.items()}
    for document in model.get('document_catalog', {}).get('documents', []):
        files[f"{version}/documents/{document['id']}.{document_extension(document)}"] = asset_bytes(root, document)
    if destinations is None:
        destinations = [root / 'app/public/data']
        if (root / 'app/dist/index.html').is_file():
            destinations.append(root / 'app/dist/data')
    if require_cached:
        source = root / 'app/public/data'
        for name, payload in {**files, 'index.json': encoded(catalog)}.items():
            if not (source / name).is_file() or (source / name).read_bytes() != payload:
                raise ValueError('Current-model data are outdated; generate Atlas data first')
    for destination in destinations:
        destination = Path(destination)
        for name, payload in files.items():
            atomic_write(destination / name, payload)
        if any(sha256((root / name).read_bytes()).hexdigest() != digest for name, digest in dependencies.items()):
            raise ValueError('Current-model sources changed before activation')
        atomic_write(destination / 'index.json', encoded(catalog))
        if destination.resolve() == (root / 'app/public/data').resolve():
            prune_generated_history(destination, version)
    return {'mode': 'current', 'current_version': version, 'publications': 1,
            'files': len(files) + 1, 'destinations': [str(p) for p in destinations]}


def prune_generated_history(data, version):
    """Remove only managed generated data folders, never historical source files."""
    data = Path(data).absolute()
    if data.resolve() != data or data.is_symlink() or data.is_junction():
        raise ValueError('Generated data directory is redirected')
    removed = 0
    for folder in data.iterdir():
        if folder.name == version or not GENERATED.fullmatch(folder.name):
            continue
        if folder.is_symlink() or folder.is_junction() or folder.resolve().parent != data:
            raise ValueError('Unsafe generated data directory')
        if folder.is_dir() and (folder / 'model.json').is_file():
            shutil.rmtree(folder)
            removed += 1
    return removed
