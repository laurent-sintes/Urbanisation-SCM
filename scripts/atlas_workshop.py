"""Stage local workshop changes without modifying the backlog or a publication.

Requests are JSON files. The envelope can support other model entities later;
only hotspots have a materializer in this first version.
"""

from __future__ import annotations

try:
    from .atlas_text import ReaderError, text as ui_text
except ImportError:
    from atlas_text import ReaderError, text as ui_text

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
    from .hotspot_resolution import validate_resolution
except ImportError:
    from atlas_lock import atlas_lock
    from hotspot_catalog import severity_for
    from hotspot_resolution import validate_resolution

ROOT = Path(__file__).resolve().parents[1]
STAGING = Path('.runtime/atlas-atelier/staging.json')
LEVELS = ('S', 'M', 'L', 'XL')
EDITABLE = {'visible', 'title', 'problem', 'kind', 'location', 'examples', 'market_view', 'resolution_options',
            'complexity', 'arbitration_level', 'arbitration_note', 'status', 'resolution', 'selected_option_id', 'resolution_note'}
TABLE_EDITABLE = {'visible', 'title', 'kind', 'location', 'complexity', 'arbitration_level', 'status',
                  'selected_option_id', 'resolution_note', 'resolution'}


class StageConflictError(ReaderError):
    """The browser edited a staging revision that is no longer current."""


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
        raise ReaderError('workshopApi.la_publication_locale_ne_correspond_pas_a_son_empreinte')
    model = json.loads(raw)
    if model['version'] != version:
        raise ReaderError('workshopApi.version_du_modele_local_incoherente')
    return model, entry['model_sha256']


def stage_path(root):
    return root / STAGING


def load_stage(root):
    path = stage_path(root)
    return json.loads(path.read_bytes()) if path.is_file() else None


def save_stage(root, stage):
    path = stage_path(root)
    if path.parent.resolve() != path.parent or (path.exists() and path.resolve() != path):
        raise ReaderError('workshopApi.chemin_de_staging_non_autorise')
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
        raise ReaderError('workshopApi.la_publication_a_change_depuis_le_debut_de_cet_atelier_conserver_')
    return stage


def effective_hotspots(model, stage):
    items = {item['id']: item for item in model.get('hotspot_catalog', {}).get('hotspots', [])}
    for operation in stage['operations']:
        if operation['entity'] != 'hotspot':
            raise ReaderError('workshopApi.type_de_changement_non_pris_en_charge', value1=operation['entity'])
        if operation['action'] == 'remove':
            items.pop(operation['id'], None)
        else:
            items[operation['id']] = operation['value']
    return items


def checked_hotspot(value, nodes):
    complexity = value.get('complexity')
    if isinstance(complexity, dict) and 'arbitration' not in complexity and 'political' in complexity:
        complexity['arbitration'] = complexity.pop('political')
        if 'political_rationale' in complexity:
            complexity['arbitration_rationale'] = complexity.pop('political_rationale')
    if 'visible' in value and not isinstance(value['visible'], bool):
        raise ReaderError('workshopApi.la_visibilite_doit_etre_un_booleen')
    if not isinstance(value.get('title'), str) or not value['title'].strip():
        raise ReaderError('workshopApi.un_titre_est_requis')
    if not isinstance(value.get('problem'), str) or not value['problem'].strip():
        raise ReaderError('workshopApi.une_description_du_probleme_est_requise')
    location = value.get('location')
    anchors = location.get('node_ids') if isinstance(location, dict) else None
    if (not isinstance(anchors, list) or any(not isinstance(a, str) for a in anchors)
            or len(anchors) != len(set(anchors)) or any(a not in nodes for a in anchors)):
        raise ReaderError('workshopApi.les_ancrages_doivent_etre_des_identifiants_distincts_du_modele_pu')
    if value.get('kind') == 'integration' and len(anchors) != 2:
        raise ReaderError('workshopApi.un_point_chaud_d_integration_exige_deux_ancrages')
    if value.get('kind') == 'scope' and not anchors:
        raise ReaderError('workshopApi.un_point_chaud_de_perimetre_exige_au_moins_un_ancrage')
    if value.get('kind') not in ('scope', 'integration'):
        raise ReaderError('workshopApi.type_de_point_chaud_inconnu')
    complexity = value.get('complexity', {})
    if not isinstance(complexity, dict) or not isinstance(complexity.get('rationale'), str):
        raise ReaderError('workshopApi.la_justification_de_complexite_doit_etre_un_texte')
    if any(not isinstance(complexity.get(key, ''), str) for key in ('arbitration_rationale', 'implementation_rationale')):
        raise ReaderError('workshopApi.les_justifications_par_axe_doivent_etre_des_textes')
    arbitration, implementation = complexity.get('arbitration'), complexity.get('implementation')
    if arbitration not in (*LEVELS, 'unassessed') or implementation not in (*LEVELS, 'unassessed'):
        raise ReaderError('workshopApi.les_difficultes_doivent_etre_s_m_l_xl_ou_non_evaluees')
    value['severity'] = severity_for(arbitration, implementation)
    if value.get('status') not in ('discovered', 'shared', 'validated', 'resolved'):
        raise ReaderError('workshopApi.statut_de_point_chaud_inconnu')
    if value.get('arbitration_level') not in ('to_confirm', 'business_direction', 'flow_internal', 'flow_steering'):
        raise ReaderError('workshopApi.niveau_d_arbitrage_inconnu')
    if not isinstance(value.get('arbitration_note'), str):
        raise ReaderError('workshopApi.la_note_d_arbitrage_doit_etre_un_texte')
    if not isinstance(value.get('examples'), list) or any(not isinstance(x, str) for x in value['examples']):
        raise ReaderError('workshopApi.les_exemples_doivent_etre_une_liste_de_textes')
    market = value.get('market_view')
    if market is not None:
        if (not isinstance(market, dict)
                or set(market) != {'finding', 'flow_assessment', 'limits', 'sources'}
                or any(not isinstance(market[key], str) or not market[key].strip()
                       for key in ('finding', 'flow_assessment', 'limits'))
                or not isinstance(market['sources'], list) or not market['sources']
                or any(not isinstance(source, dict)
                       or set(source) != {'publisher', 'title', 'url', 'relevance'}
                       or any(not isinstance(source[key], str) or not source[key].strip()
                              for key in ('publisher', 'title', 'url', 'relevance'))
                       or not source['url'].startswith('https://')
                       for source in market['sources'])):
            raise ReaderError('workshopApi.lecture_du_marche_incomplete_ou_source_non_securisee')
    options = value.get('resolution_options')
    if not isinstance(options, list) or any(
        not isinstance(option, dict)
        or not all(isinstance(option.get(key), str) and option[key].strip() for key in ('id', 'title', 'principle'))
        or option.get('implementation_complexity') not in (*LEVELS, 'unassessed')
        or option.get('evidence_state') not in ('documented', 'hypothesis', 'to_investigate')
        for option in options
    ):
        raise ReaderError('workshopApi.options_de_resolution_incompletes')
    if len({option['id'] for option in options}) != len(options):
        raise ReaderError('workshopApi.identifiants_d_options_dupliques')
    selected = value.get('selected_option_id')
    if selected is not None and not isinstance(selected, str):
        raise ReaderError('workshopApi.l_option_de_resolution_retenue_doit_etre_un_identifiant')
    if 'resolution_note' in value and not isinstance(value['resolution_note'], str):
        raise ReaderError('workshopApi.la_note_de_resolution_doit_etre_un_texte')
    if selected and selected not in {option['id'] for option in options}:
        raise ReaderError('workshopApi.l_option_de_resolution_retenue_est_absente_de_la_fiche')
    resolution_errors = validate_resolution(value)
    if resolution_errors:
        raise ReaderError('workshopApi.resolution_de_cadrage_invalide', value1='; '.join(resolution_errors))
    if 'resolution' not in value and value['status'] == 'resolved' and (not selected or not isinstance(value.get('resolution_note'), str)
                                          or not value['resolution_note'].strip()):
        raise ReaderError('workshopApi.un_point_chaud_resolu_exige_une_option_retenue_et_une_note_de_res')
    if 'resolution' not in value and value['status'] != 'resolved' and selected:
        raise ReaderError('workshopApi.une_option_retenue_exige_le_statut_resolu')
    if any(complexity[axis] != 'unassessed' for axis in ('arbitration', 'implementation')) and not complexity['rationale'].strip():
        raise ReaderError('workshopApi.une_complexite_evaluee_exige_une_justification')
    return value


def apply_request(root, request):
    with atlas_lock(root):
        if not isinstance(request, dict):
            raise ReaderError('workshopApi.la_requete_doit_etre_un_objet_json')
        if not isinstance(request.get('note', ''), str):
            raise ReaderError('workshopApi.la_note_de_seance_doit_etre_un_texte')
        if not isinstance(request.get('verbatim'), str) or not request['verbatim'].strip():
            raise ReaderError('workshopApi.le_verbatim_de_la_demande_est_requis_pour_la_tracabilite')
        model, model_sha = publication(root)
        stage = current_stage(root, model, model_sha)
        if request.get('expected_revision') != stage['revision']:
            raise ReaderError('workshopApi.le_staging_a_change_relire_sa_revision_avant_de_modifier')
        if request.get('entity') != 'hotspot':
            raise ReaderError('workshopApi.seuls_les_points_chauds_sont_pris_en_charge_dans_cette_version')
        action = request.get('action')
        if action not in ('add', 'update', 'remove'):
            raise ReaderError('workshopApi.action_attendue_add_update_ou_remove')
        items = effective_hotspots(model, stage)
        published = {item['id']: item for item in model.get('hotspot_catalog', {}).get('hotspots', [])}
        identifier = request.get('id')
        if action == 'add':
            used = {item['id'] for item in stage['operations']} | set(published)
            if identifier is None:
                numbers = [int(value[6:]) for value in used if value.startswith('AT-HS-') and value[6:].isdigit()]
                identifier = f'AT-HS-{max(numbers, default=0) + 1:03d}'
            if not isinstance(identifier, str) or not identifier.startswith('AT-HS-') or identifier in used:
                raise ReaderError('workshopApi.identifiant_de_brouillon_absent_deja_utilise_ou_invalide')
            fields = request.get('fields', {})
            if not isinstance(fields, dict) or set(fields) - EDITABLE:
                raise ReaderError('workshopApi.champs_de_point_chaud_non_autorises')
            if fields.get('status', 'discovered') not in ('discovered', 'shared'):
                raise ReaderError('workshopApi.l_atelier_ne_peut_pas_valider_ni_resoudre_un_point_chaud')
            value = {
                'visible': fields.get('visible', True),
                'id': identifier, 'title': fields.get('title'), 'kind': fields.get('kind', 'scope'),
                'location': fields.get('location', {}), 'problem': fields.get('problem'),
                'examples': fields.get('examples', []), 'resolution_options': fields.get('resolution_options', []),
                'complexity': fields.get('complexity', {'arbitration': 'unassessed', 'implementation': 'unassessed', 'rationale': ''}),
                'severity_policy': 'matrix-v1', 'arbitration_level': fields.get('arbitration_level', 'to_confirm'),
                'arbitration_note': fields.get('arbitration_note', ''), 'status': fields.get('status', 'discovered'),
                'source_refs': [],
                'origin': {'repository': ui_text('workshopApi.atelier_atlas_2'), 'path': str(STAGING).replace('\\', '/'),
                           'id': identifier, 'source_id': stage['session_id'],
                           'evidence_limit': ui_text('workshopApi.note_d_atelier_a_qualifier_avant_integration_au_backlog')},
                'review': {'state': 'proposed', 'note': ui_text('workshopApi.proposition_recueillie_en_atelier_non_validee')},
            }
            if 'market_view' in fields:
                value['market_view'] = fields['market_view']
            for key in ('resolution', 'selected_option_id', 'resolution_note'):
                if key in fields:
                    value[key] = fields[key]
        else:
            if not isinstance(identifier, str) or identifier not in items:
                raise ReaderError('workshopApi.point_chaud_introuvable_dans_cette_seance')
            value = json.loads(json.dumps(items[identifier]))
            if action == 'update':
                fields = request.get('fields', {})
                if not isinstance(fields, dict) or not fields or set(fields) - EDITABLE:
                    raise ReaderError('workshopApi.champs_de_point_chaud_non_autorises')
                if 'status' in fields and fields['status'] not in ('discovered', 'shared'):
                    raise ReaderError('workshopApi.l_atelier_ne_peut_pas_valider_ni_resoudre_un_point_chaud')
                value.update(fields)
        if action != 'remove':
            checked_hotspot(value, {item['id'] for item in model['nodes']})
            if identifier in published:
                value['origin'] = {'repository': ui_text('workshopApi.atelier_atlas_2'), 'path': str(STAGING).replace('\\', '/'),
                                   'id': identifier, 'source_id': stage['session_id'],
                                   'evidence_limit': ui_text('workshopApi.modification_proposee_en_atelier_sur_une_fiche_publiee_sources_in')}
                value['review'] = {'state': 'proposed', 'note': ui_text('workshopApi.modification_recueillie_en_atelier_contenu_non_revalide')}
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


def apply_table_changes(root, request):
    """Atomically stage a small batch of direct edits from the local Atlas table."""
    with atlas_lock(root):
        if not isinstance(request, dict):
            raise ReaderError('workshopApi.la_requete_doit_etre_un_objet_json')
        changes = request.get('changes')
        if not isinstance(changes, list) or not 1 <= len(changes) <= 100:
            raise ReaderError('workshopApi.entre_1_et_100_points_chauds_modifies_sont_attendus')
        model, model_sha = publication(root)
        stage = load_stage(root)
        if not stage or not stage.get('active'):
            raise StageConflictError('workshopApi.aucun_atelier_actif_sur_cette_publication')
        if stage.get('base_version') != model['version'] or stage.get('base_model_sha256') != model_sha:
            raise StageConflictError('workshopApi.la_publication_a_change_conserver_le_staging_et_reexaminer_la_bas')
        if request.get('session_id') != stage['session_id'] or request.get('expected_revision') != stage['revision']:
            raise StageConflictError('workshopApi.le_staging_a_change_relire_sa_revision_avant_de_modifier')
        # Work on a copy: one invalid row must leave the complete staging untouched.
        stage = json.loads(json.dumps(stage))
        items = effective_hotspots(model, stage)
        published = {item['id']: item for item in model.get('hotspot_catalog', {}).get('hotspots', [])}
        nodes = {item['id'] for item in model['nodes']}
        seen = set()
        for change in changes:
            if not isinstance(change, dict) or set(change) != {'id', 'fields'}:
                raise ReaderError('workshopApi.modification_de_tableau_invalide')
            identifier, fields = change['id'], change['fields']
            if not isinstance(identifier, str) or identifier in seen or identifier not in items:
                raise ReaderError('workshopApi.point_chaud_absent_ou_duplique_dans_le_lot')
            seen.add(identifier)
            if not isinstance(fields, dict) or not fields or set(fields) - TABLE_EDITABLE:
                raise ReaderError('workshopApi.champs_de_tableau_non_autorises')
            if 'complexity' in fields and (not isinstance(fields['complexity'], dict)
                                           or not {'arbitration', 'implementation', 'rationale'} <= set(fields['complexity'])
                                           or not set(fields['complexity']) <= {'arbitration', 'implementation', 'rationale', 'arbitration_rationale', 'implementation_rationale'}):
                raise ReaderError('workshopApi.complexite_de_tableau_invalide')
            if 'status' in fields and fields['status'] not in ('discovered', 'shared', 'validated', 'resolved'):
                raise ReaderError('workshopApi.statut_de_tableau_inconnu')
            value = json.loads(json.dumps(items[identifier]))
            value.update(fields)
            if 'resolution' not in value and 'status' in fields and fields['status'] != 'resolved':
                value.pop('selected_option_id', None)
                value.pop('resolution_note', None)
            checked_hotspot(value, nodes)
            if identifier in published:
                value['origin'] = {'repository': ui_text('workshopApi.atelier_atlas_2'), 'path': str(STAGING).replace('\\', '/'),
                                   'id': identifier, 'source_id': stage['session_id'],
                                   'evidence_limit': ui_text('workshopApi.modification_proposee_en_atelier_sur_une_fiche_publiee_sources_in')}
                value['review'] = {'state': 'proposed', 'note': ui_text('workshopApi.modification_recueillie_en_atelier_contenu_non_revalide')}
            revision = stage['revision'] + 1
            value['workshop'] = {'session_id': stage['session_id'], 'revision': revision}
            operation = {'sequence': revision, 'entity': 'hotspot', 'action': 'update',
                         'id': identifier, 'base_sha256': digest(published[identifier]) if identifier in published else None,
                         'at': now(),
                         'verbatim': ui_text('workshopApi.saisie_directe_dans_le_tableau_atlas')
                                     + json.dumps(fields, ensure_ascii=False, sort_keys=True),
                         'note': ui_text('workshopApi.valeurs_soumises_depuis_l_interface_locale_auteur_de_la_propositi'),
                         'value': value}
            stage['operations'].append(operation)
            stage['revision'] = revision
            stage['updated_at'] = operation['at']
            items[identifier] = value
        save_stage(root, stage)
        return stage


def close_stage(root, expected_revision):
    with atlas_lock(root):
        stage = load_stage(root)
        if stage is None:
            raise ReaderError('workshopApi.aucun_atelier_actif_a_cloturer')
        if stage['revision'] != expected_revision:
            raise ReaderError('workshopApi.le_staging_a_change_relire_sa_revision_avant_de_cloturer')
        archive = root / '.runtime/atlas-atelier/archive' / (stage['session_id'] + '.json')
        archive.parent.mkdir(parents=True, exist_ok=True)
        if archive.exists():
            raise ReaderError('workshopApi.une_archive_de_cette_seance_existe_deja')
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
        parser.exit(2, ui_text('workshopApi.atelier_atlas', exc=exc))


if __name__ == '__main__':
    main()
