"""Stage local workshop changes without modifying the backlog or a publication.

Requests are JSON files. The envelope can support other model entities later;
only hotspots have a materializer in this first version.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile
from datetime import datetime, timezone
from uuid import uuid4
try:
    from .atlas_lock import atlas_lock
    from .hotspot_catalog import severity_for
except ImportError:
    from atlas_lock import atlas_lock
    from hotspot_catalog import severity_for

ROOT = Path(__file__).resolve().parents[1]
STAGING = Path('.runtime/atlas-atelier/staging.json')
LEVELS = ('S', 'M', 'L', 'XL')
EDITABLE = {'title', 'problem', 'kind', 'location', 'examples', 'resolution_options',
            'complexity', 'arbitration_level', 'arbitration_note', 'status'}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode('utf-8')


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode('utf-8')).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')


def publication(root):
    data = root / 'app/dist/data'
    catalog = json.loads((data / 'index.json').read_bytes())
    version = catalog['current_version']
    entry = next(item for item in catalog['versions'] if item['version'] == version)
    raw = (data / version / 'model.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != entry['model_sha256']:
        raise ValueError('La publication locale ne correspond pas à son empreinte.')
    model = json.loads(raw)
    if model['version'] != version:
        raise ValueError('Version du modèle local incohérente.')
    return model, entry['model_sha256']


def stage_path(root):
    return root / STAGING


def load_stage(root):
    path = stage_path(root)
    return json.loads(path.read_bytes()) if path.is_file() else None


def save_stage(root, stage):
    path = stage_path(root)
    if path.parent.resolve() != path.parent or (path.exists() and path.resolve() != path):
        raise ValueError('Chemin de staging non autorisé.')
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.staging-', suffix='.tmp', delete=False) as stream:
        temporary = Path(stream.name)
        try:
            stream.write(encoded(stage))
            stream.flush()
            os.fsync(stream.fileno())
        except BaseException:
            temporary.unlink(missing_ok=True)
            raise
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def current_stage(root, model, model_sha):
    stage = load_stage(root)
    if stage is None:
        stamp = now()
        stage = {'schema_version': 1, 'active': True,
                 'session_id': 'atelier-' + stamp.replace(':', '').replace('-', '') + '-' + uuid4().hex[:8],
                 'base_version': model['version'], 'base_model_sha256': model_sha,
                 'revision': 0, 'created_at': stamp, 'updated_at': stamp, 'operations': []}
        save_stage(root, stage)
    if stage.get('base_version') != model['version'] or stage.get('base_model_sha256') != model_sha:
        raise ValueError('La publication a changé depuis le début de cet atelier ; conserver le staging et réexaminer la base.')
    return stage


def effective_hotspots(model, stage):
    items = {item['id']: item for item in model.get('hotspot_catalog', {}).get('hotspots', [])}
    for operation in stage['operations']:
        if operation['entity'] != 'hotspot':
            raise ValueError('Type de changement non pris en charge : ' + operation['entity'])
        if operation['action'] == 'remove':
            items.pop(operation['id'], None)
        else:
            items[operation['id']] = operation['value']
    return items


def checked_hotspot(value, nodes):
    if not isinstance(value.get('title'), str) or not value['title'].strip():
        raise ValueError('Un titre est requis.')
    if not isinstance(value.get('problem'), str) or not value['problem'].strip():
        raise ValueError('Une description du problème est requise.')
    location = value.get('location')
    anchors = location.get('node_ids') if isinstance(location, dict) else None
    if (not isinstance(anchors, list) or any(not isinstance(a, str) for a in anchors)
            or len(anchors) != len(set(anchors)) or any(a not in nodes for a in anchors)):
        raise ValueError('Les ancrages doivent être des identifiants distincts du modèle publié.')
    if value.get('kind') == 'integration' and len(anchors) != 2:
        raise ValueError('Un point chaud d’intégration exige deux ancrages.')
    if value.get('kind') == 'scope' and not anchors:
        raise ValueError('Un point chaud de périmètre exige au moins un ancrage.')
    if value.get('kind') not in ('scope', 'integration'):
        raise ValueError('Type de point chaud inconnu.')
    complexity = value.get('complexity', {})
    if not isinstance(complexity, dict) or not isinstance(complexity.get('rationale'), str):
        raise ValueError('La justification de complexité doit être un texte.')
    political, implementation = complexity.get('political'), complexity.get('implementation')
    if political not in (*LEVELS, 'unassessed') or implementation not in (*LEVELS, 'unassessed'):
        raise ValueError('Les difficultés doivent être S, M, L, XL ou non évaluées.')
    value['severity'] = severity_for(political, implementation)
    if value.get('status') not in ('discovered', 'shared', 'validated', 'resolved'):
        raise ValueError('Statut de point chaud inconnu.')
    if value.get('arbitration_level') not in ('to_confirm', 'business_direction', 'flow_internal', 'flow_steering'):
        raise ValueError('Niveau d’arbitrage inconnu.')
    if not isinstance(value.get('arbitration_note'), str):
        raise ValueError('La note d’arbitrage doit être un texte.')
    if not isinstance(value.get('examples'), list) or any(not isinstance(x, str) for x in value['examples']):
        raise ValueError('Les exemples doivent être une liste de textes.')
    options = value.get('resolution_options')
    if not isinstance(options, list) or any(
        not isinstance(option, dict)
        or not all(isinstance(option.get(key), str) and option[key].strip() for key in ('id', 'title', 'principle'))
        or option.get('implementation_complexity') not in (*LEVELS, 'unassessed')
        or option.get('evidence_state') not in ('documented', 'hypothesis', 'to_investigate')
        for option in options
    ):
        raise ValueError('Options de résolution incomplètes.')
    if len({option['id'] for option in options}) != len(options):
        raise ValueError('Identifiants d’options dupliqués.')
    return value


def apply_request(root, request):
    with atlas_lock(root):
        if not isinstance(request, dict):
            raise ValueError('La requête doit être un objet JSON.')
        if not isinstance(request.get('note', ''), str):
            raise ValueError('La note de séance doit être un texte.')
        if not isinstance(request.get('verbatim'), str) or not request['verbatim'].strip():
            raise ValueError('Le verbatim de la demande est requis pour la traçabilité.')
        model, model_sha = publication(root)
        stage = current_stage(root, model, model_sha)
        if request.get('expected_revision') != stage['revision']:
            raise ValueError('Le staging a changé ; relire sa révision avant de modifier.')
        if request.get('entity') != 'hotspot':
            raise ValueError('Seuls les points chauds sont pris en charge dans cette version.')
        action = request.get('action')
        if action not in ('add', 'update', 'remove'):
            raise ValueError('Action attendue : add, update ou remove.')
        items = effective_hotspots(model, stage)
        published = {item['id']: item for item in model.get('hotspot_catalog', {}).get('hotspots', [])}
        identifier = request.get('id')
        if action == 'add':
            used = {item['id'] for item in stage['operations']} | set(published)
            if identifier is None:
                numbers = [int(value[6:]) for value in used if value.startswith('AT-HS-') and value[6:].isdigit()]
                identifier = f'AT-HS-{max(numbers, default=0) + 1:03d}'
            if not isinstance(identifier, str) or not identifier.startswith('AT-HS-') or identifier in used:
                raise ValueError('Identifiant de brouillon absent, déjà utilisé ou invalide.')
            fields = request.get('fields', {})
            if not isinstance(fields, dict) or set(fields) - EDITABLE:
                raise ValueError('Champs de point chaud non autorisés.')
            if fields.get('status', 'discovered') not in ('discovered', 'shared'):
                raise ValueError('L’atelier ne peut pas valider ni résoudre un point chaud.')
            value = {
                'id': identifier, 'title': fields.get('title'), 'kind': fields.get('kind', 'scope'),
                'location': fields.get('location', {}), 'problem': fields.get('problem'),
                'examples': fields.get('examples', []), 'resolution_options': fields.get('resolution_options', []),
                'complexity': fields.get('complexity', {'political': 'unassessed', 'implementation': 'unassessed', 'rationale': ''}),
                'severity_policy': 'matrix-v1', 'arbitration_level': fields.get('arbitration_level', 'to_confirm'),
                'arbitration_note': fields.get('arbitration_note', ''), 'status': fields.get('status', 'discovered'),
                'source_refs': [],
                'origin': {'repository': 'Atelier Atlas', 'path': str(STAGING).replace('\\', '/'),
                           'id': identifier, 'source_id': stage['session_id'],
                           'evidence_limit': 'Note d’atelier à qualifier avant intégration au backlog.'},
                'review': {'state': 'proposed', 'note': 'Proposition recueillie en atelier ; non validée.'},
            }
        else:
            if not isinstance(identifier, str) or identifier not in items:
                raise ValueError('Point chaud introuvable dans cette séance.')
            value = json.loads(json.dumps(items[identifier]))
            if action == 'update':
                fields = request.get('fields', {})
                if not isinstance(fields, dict) or not fields or set(fields) - EDITABLE:
                    raise ValueError('Champs de point chaud non autorisés.')
                if 'status' in fields and fields['status'] not in ('discovered', 'shared'):
                    raise ValueError('L’atelier ne peut pas valider ni résoudre un point chaud.')
                value.update(fields)
        if action != 'remove':
            checked_hotspot(value, {item['id'] for item in model['nodes']})
            if identifier in published:
                value['origin'] = {'repository': 'Atelier Atlas', 'path': str(STAGING).replace('\\', '/'),
                                   'id': identifier, 'source_id': stage['session_id'],
                                   'evidence_limit': 'Modification proposée en atelier sur une fiche publiée ; sources initiales à réexaminer.'}
                value['review'] = {'state': 'proposed', 'note': 'Modification recueillie en atelier ; contenu non revalidé.'}
            value['workshop'] = {'session_id': stage['session_id'], 'revision': stage['revision'] + 1}
        operation = {'sequence': stage['revision'] + 1, 'entity': 'hotspot', 'action': action,
                     'id': identifier, 'base_sha256': digest(published[identifier]) if identifier in published else None,
                     'at': now(), 'verbatim': request['verbatim'], 'note': request.get('note', '')}
        if action != 'remove':
            operation['value'] = value
        stage['operations'].append(operation)
        stage['revision'] += 1
        stage['updated_at'] = operation['at']
        save_stage(root, stage)
        return {'session_id': stage['session_id'], 'revision': stage['revision'], 'action': action,
                'entity': 'hotspot', 'id': identifier, 'staging': str(stage_path(root))}


def close_stage(root, expected_revision):
    with atlas_lock(root):
        stage = load_stage(root)
        if stage is None:
            raise ValueError('Aucun atelier actif à clôturer.')
        if stage['revision'] != expected_revision:
            raise ValueError('Le staging a changé ; relire sa révision avant de clôturer.')
        archive = root / '.runtime/atlas-atelier/archive' / (stage['session_id'] + '.json')
        archive.parent.mkdir(parents=True, exist_ok=True)
        if archive.exists():
            raise ValueError('Une archive de cette séance existe déjà.')
        os.replace(stage_path(root), archive)
        return {'active': False, 'session_id': stage['session_id'], 'revision': stage['revision'],
                'archived': str(archive)}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('status')
    sub.add_parser('start')
    close = sub.add_parser('close')
    close.add_argument('--expected-revision', type=int, required=True)
    apply = sub.add_parser('apply')
    apply.add_argument('--input', type=Path, required=True)
    args = parser.parse_args(argv)
    root = args.root.resolve()
    try:
        if args.command == 'status':
            result = load_stage(root) or {'active': False, 'revision': 0}
        elif args.command == 'start':
            with atlas_lock(root):
                model, model_sha = publication(root)
                result = current_stage(root, model, model_sha)
        elif args.command == 'close':
            result = close_stage(root, args.expected_revision)
        else:
            result = apply_request(root, json.loads(args.input.read_bytes()))
        print(json.dumps(result, ensure_ascii=False))
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.exit(2, f'Atelier Atlas : {exc}\n')


if __name__ == '__main__':
    main()
