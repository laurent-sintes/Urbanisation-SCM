"""Preview and integrate a workshop staging file into the canonical YAML backlog.

This command never treats workshop notes as business approval. A source record must
already exist, and the preview must be reviewed before apply.
"""

from __future__ import annotations

import argparse
from datetime import date
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

import yaml

try:
    from . import structured_io
    from .atlas_lock import atlas_lock
    from .atlas_workshop import EDITABLE, ROOT, checked_hotspot
    from .validate_models import validate_urbanism
except ImportError:
    import structured_io
    from atlas_lock import atlas_lock
    from atlas_workshop import EDITABLE, ROOT, checked_hotspot
    from validate_models import validate_urbanism


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def pinned_publication(root, stage):
    data = root / 'app/dist/data'
    catalog = structured_io.read(data / 'index.json')
    entry = next((item for item in catalog['versions'] if item['version'] == stage['base_version']), None)
    if entry is None or entry['model_sha256'] != stage['base_model_sha256']:
        raise ValueError('La publication de base et son empreinte sont introuvables dans Atlas local.')
    payload = (data / stage['base_version'] / 'model.json').read_bytes()
    if sha(payload) != entry['model_sha256']:
        raise ValueError('La publication de base a changé.')
    return json.loads(payload)


def read_stage(path):
    payload = path.read_bytes()
    stage = json.loads(payload)
    if (not isinstance(stage, dict) or stage.get('schema_version') != 1 or stage.get('active') is not True
            or not isinstance(stage.get('operations'), list) or not isinstance(stage.get('session_id'), str)
            or not isinstance(stage.get('revision'), int) or not stage.get('base_model_sha256')):
        raise ValueError('Staging d’atelier invalide.')
    if len(stage['operations']) != stage['revision']:
        raise ValueError('Révision et nombre d’opérations incohérents.')
    for index, operation in enumerate(stage['operations'], 1):
        if (not isinstance(operation, dict) or operation.get('sequence') != index
                or operation.get('entity') != 'hotspot'
                or operation.get('action') not in ('add', 'update', 'remove')
                or not isinstance(operation.get('verbatim'), str) or not operation['verbatim'].strip()):
            raise ValueError(f'Opération d’atelier {index} invalide ou sans verbatim.')
    return stage, sha(payload)


def final_hotspots(base, stage):
    values = {item['id']: item for item in base.get('hotspot_catalog', {}).get('hotspots', [])}
    touched = []
    for operation in stage['operations']:
        identifier = operation['id']
        if identifier not in touched:
            touched.append(identifier)
        if operation['action'] == 'remove':
            values.pop(identifier, None)
        else:
            value = operation.get('value')
            if not isinstance(value, dict) or value.get('id') != identifier:
                raise ValueError(f'Valeur d’atelier invalide : {identifier}.')
            values[identifier] = value
    return values, touched


def new_id(stage, temporary):
    suffix = stage['session_id'].rsplit('-', 1)[-1]
    if not re.fullmatch(r'[a-f0-9]{8}', suffix) or not re.fullmatch(r'AT-HS-\d+', temporary):
        raise ValueError('Identifiant temporaire ou séance invalide.')
    return f'HS-W-{suffix}-{temporary.removeprefix("AT-HS-")}'


def preview(root, stage_path, selected=None):
    stage, stage_sha = read_stage(stage_path)
    base = pinned_publication(root, stage)
    backlog_path = root / 'modeles/backlog/model.yaml'
    backlog_sha = sha(backlog_path.read_bytes())
    backlog = structured_io.read(backlog_path)
    base_items = {item['id']: item for item in base.get('hotspot_catalog', {}).get('hotspots', [])}
    current_items = {item['id']: item for item in backlog.get('hotspot_catalog', {}).get('hotspots', [])}
    final, touched = final_hotspots(base, stage)
    if selected is not None:
        unknown = set(selected) - set(touched)
        if unknown:
            raise ValueError('Identifiants absents du staging : ' + ', '.join(sorted(unknown)))
        touched = [identifier for identifier in touched if identifier in selected]
    changes = []
    for identifier in touched:
        original = base_items.get(identifier)
        proposed = final.get(identifier)
        current = current_items.get(identifier)
        if original is None and proposed is None:
            continue
        if original is None:
            target = new_id(stage, identifier)
            conflicts = ['Identifiant canonique déjà occupé.'] if target in current_items else []
            fields = sorted(EDITABLE & proposed.keys())
            action = 'add'
        elif proposed is None:
            target = identifier
            conflicts = [] if current == original else ['La fiche du backlog diffère de la publication de base.']
            fields = []
            action = 'remove'
        else:
            target = identifier
            fields = sorted(key for key in EDITABLE if proposed.get(key) != original.get(key))
            if not fields:
                continue
            conflicts = ['Fiche absente du backlog.'] if current is None else [
                key for key in fields if current.get(key) not in (original.get(key), proposed.get(key))
            ]
            action = 'update'
        verbatims = [operation['verbatim'] for operation in stage['operations'] if operation['id'] == identifier]
        changes.append({'action': action, 'staging_id': identifier, 'backlog_id': target,
                        'fields': fields, 'conflicts': conflicts, 'verbatims': verbatims})
    result = {'schema_version': 1, 'stage_path': str(stage_path.resolve()), 'stage_sha256': stage_sha,
              'session_id': stage['session_id'], 'base_version': stage['base_version'],
              'backlog_sha256': backlog_sha, 'selected_ids': touched, 'changes': changes}
    result['plan_sha256'] = sha(canonical(result).encode())
    return result


def replace_root_value(source, name, value):
    tree = yaml.compose(source)
    if not isinstance(tree, yaml.MappingNode):
        raise ValueError('Backlog YAML invalide.')
    match = [(key, node) for key, node in tree.value if key.value == name]
    if len(match) != 1:
        raise ValueError(f'Bloc {name} absent ou dupliqué.')
    key, node = match[0]
    fragment = structured_io.dumps({name: value}).rstrip('\n')
    result = source[:key.start_mark.index] + fragment + source[node.end_mark.index:]
    if structured_io.loads(result) is None:
        raise ValueError('Écriture YAML invalide.')
    return result


def apply(root, plan_path, source_ref):
    with atlas_lock(root):
        plan = json.loads(plan_path.read_bytes())
        expected = preview(root, Path(plan['stage_path']), plan['selected_ids'])
        if plan != expected or any(item['conflicts'] for item in plan['changes']):
            raise ValueError('Aperçu périmé ou conflit ; refaire un aperçu avant intégration.')
        if not plan['changes']:
            raise ValueError('Aucun changement retenu dans cet aperçu.')
        if not re.fullmatch(r'U\d+', source_ref):
            raise ValueError('Référence U de contribution attendue.')
        source_doc = structured_io.read(root / 'modeles/provenance/source-records.json')
        sources = {record['id']: record for record in source_doc['records']}
        if source_ref not in sources:
            raise ValueError('Source absente de l’index ; capturer le verbatim puis actualiser les sources.')
        stage, _ = read_stage(Path(plan['stage_path']))
        source_text = re.sub(r'\s+', ' ', sources[source_ref]['captured_text'].replace('> ', ' '))
        if stage['session_id'] not in source_text or any(
            re.sub(r'\s+', ' ', verbatim).strip() not in source_text
            for change in plan['changes'] for verbatim in change['verbatims']
        ):
            raise ValueError('La source ne contient pas la séance et tous les verbatims retenus.')
        final, _ = final_hotspots(pinned_publication(root, stage), stage)
        model_path = root / 'modeles/backlog/model.yaml'
        model = structured_io.read(model_path)
        catalog = model['hotspot_catalog']
        items = {item['id']: item for item in catalog['hotspots']}
        for change in plan['changes']:
            action, source_id, target = change['action'], change['staging_id'], change['backlog_id']
            if action == 'remove':
                items.pop(target)
                continue
            if action == 'add':
                value = json.loads(json.dumps(final[source_id]))
                value['id'] = target
            else:
                value = json.loads(json.dumps(items[target]))
                value.update({key: final[source_id][key] for key in change['fields']})
            value.pop('workshop', None)
            value['source_refs'] = list(dict.fromkeys([*value.get('source_refs', []), source_ref]))
            value['origin'] = {'repository': 'Beaumanoir Cartographie',
                               'path': sources[source_ref]['path'], 'id': source_ref,
                               'source_id': stage['session_id'],
                               'evidence_limit': 'Proposition issue du staging d’atelier ; validation métier distincte.'}
            value['review'] = {'state': 'proposed', 'note': f'Proposition d’atelier {stage["session_id"]} ; source {source_ref}.'}
            checked_hotspot(value, {node['id'] for node in model['nodes']})
            items[target] = value
        catalog['hotspots'] = list(items.values())
        catalog['source_refs'] = list(dict.fromkeys([*catalog['source_refs'], source_ref]))
        model['as_of'] = date.today().isoformat()
        validation_model = dict(model)
        validation_model['glossary'] = structured_io.read(root / 'modeles/backlog/glossary.yaml')
        errors = validate_urbanism(validation_model, sources, structured_io.read(root / 'modeles/schemas/urbanism.schema.json'))
        if errors:
            raise ValueError('Modèle candidat invalide : ' + '; '.join(errors[:8]))
        before = model_path.read_text(encoding='utf-8')
        after = replace_root_value(before, 'hotspot_catalog', catalog)
        after = replace_root_value(after, 'as_of', model['as_of'])
        written = structured_io.loads(after)
        if written != model:
            raise ValueError('Le modèle sérialisé diffère du candidat.')
        with tempfile.NamedTemporaryFile(dir=model_path.parent, prefix='.atelier-', suffix='.yaml', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(after.encode('utf-8'))
            stream.flush()
            os.fsync(stream.fileno())
        try:
            if sha(model_path.read_bytes()) != plan['backlog_sha256']:
                raise ValueError('Le backlog a changé pendant la préparation ; aucun fichier remplacé.')
            os.replace(temporary, model_path)
        finally:
            temporary.unlink(missing_ok=True)
        return {'integrated': len(plan['changes']), 'source_ref': source_ref,
                'backlog': str(model_path), 'session_id': stage['session_id']}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    sub = parser.add_subparsers(dest='command', required=True)
    preview_cmd = sub.add_parser('preview')
    preview_cmd.add_argument('--staging', type=Path, required=True)
    preview_cmd.add_argument('--output', type=Path, required=True)
    preview_cmd.add_argument('--include', action='append')
    apply_cmd = sub.add_parser('apply')
    apply_cmd.add_argument('--plan', type=Path, required=True)
    apply_cmd.add_argument('--source-ref', required=True)
    args = parser.parse_args(argv)
    try:
        root = args.root.resolve()
        if args.command == 'preview':
            plan = preview(root, args.staging, args.include)
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(structured_io.dumps(plan, '.json'), encoding='utf-8')
            result = plan
        else:
            result = apply(root, args.plan, args.source_ref)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (OSError, ValueError, KeyError, TypeError, StopIteration) as exc:
        parser.exit(2, f'Reprise atelier : {exc}\n')


if __name__ == '__main__':
    main()
