"""Describe the structure of one verified publication inside its Atlas JSON export.

This is a reading aid, not another model source. Types and endpoint pairs are
observed in the selected snapshot; definitions come only from its associated,
frozen methodology guide when that guide contains the matching term.
"""

try:
    from .atlas_text import text as ui_text
except ImportError:
    from atlas_text import text as ui_text

import json
from pathlib import Path
from collections import Counter, defaultdict
import re

from scripts.validate_models import RELATION_KINDS


_DESCRIPTORS = json.loads((Path(__file__).resolve().parents[1] / 'app/content/metamodel-export.json').read_bytes())

GUIDE_TERMS = _DESCRIPTORS['GUIDE_TERMS']
ROOT_BINDINGS = _DESCRIPTORS['ROOT_BINDINGS']
RELATION_ROLES = _DESCRIPTORS['RELATION_ROLES']
FIELD_MEANINGS = _DESCRIPTORS['FIELD_MEANINGS']

RELATION_MEANINGS = _DESCRIPTORS['RELATION_MEANINGS']


def _plain(text):
    return re.sub(r'\[([^]]+)\]\([^)]+\)', r'\1', text)


def _allowed_pairs(relation_type, kinds, principles):
    if relation_type not in RELATION_KINDS:
        return []
    if {'PRINCIPLE-TARGET-UNIVERSE', 'PRINCIPLE-REQUIRED-BUSINESS-AREA',
        'PRINCIPLE-DOMAIN-SUBDOMAIN'} <= principles and relation_type in {'contains', 'presents'}:
        hierarchy = {
            'contains': [('universe', 'business_system'), ('area', 'business_area'),
                         ('business_area', 'capability'), ('capability', 'behavior')],
            'presents': [('business_system', 'domain'), ('domain', 'area'),
                         ('business_area', 'reference')],
        }
        return [{'source_kind': source, 'target_kind': target}
                for source, target in hierarchy[relation_type] if source in kinds and target in kinds]
    source_kinds, target_kinds = RELATION_KINDS[relation_type]
    if relation_type == 'shares-data':
        return [{'source_kind': source, 'target_kind': target}
                for source in sorted(kinds) for target in sorted(kinds)]
    pairs = []
    for source in sorted(source_kinds & kinds):
        for target in sorted(target_kinds & kinds):
            if source == 'universe' and (relation_type, target) != ('contains', 'business_system'):
                continue
            if source == 'business_system' and relation_type == 'presents' and target != 'domain':
                continue
            if source == 'domain' and relation_type == 'presents' and target not in {'area', 'reference', 'group'}:
                continue
            if source in {'area', 'business_area'} and relation_type == 'presents' and target != 'reference':
                continue
            if relation_type == 'relates-to' and (source == 'reference') != (target == 'reference'):
                continue
            pairs.append({'source_kind': source, 'target_kind': target})
    return pairs


def _constraints(model):
    principles = {item['id'] for item in model.get('principles', [])}
    root_name = next((node.get('fields', {}).get('name') for node in model.get('nodes', [])
                      if node['kind'] == 'universe'), 'Univers')
    rules = [
        {'id': 'structural-acyclic', 'applies_to': 'contains/presents',
         'rule': ui_text('metamodelExport.aucun_cycle_dans_les_liens_de_decomposition_ou_de_presentation'),
         'source': 'validation'},
        {'id': 'behavior-parent', 'applies_to': 'behavior',
         'cardinality': {'parent': {'min': 1, 'max': 1}, 'children': {'min': 0, 'max': 0}},
         'rule': ui_text('metamodelExport.chaque_comportement_a_exactement_une_capacite_par_contains_et_auc'),
         'source': 'validation'},
        {'id': 'qualified-dependencies', 'applies_to': 'relates-to/uses-reference/supplies-reference',
         'rule': ui_text('metamodelExport.chaque_lien_porte_qualification_meaning_non_vide_conditions_et_ef'),
         'source': ui_text('metamodelExport.validation_et_convention_de_lecture')},
        {'id': 'reference-dependency', 'applies_to': 'uses-reference/supplies-reference',
         'rule': ui_text('metamodelExport.ces_liens_decrivent_usage_et_apport_de_donnees_ils_ne_creent_ni_p'),
         'source': ui_text('metamodelExport.methodologie_associee')},
    ]

    def add(principle, ident, applies_to, rule, cardinality=None):
        if principle in principles:
            entry = {'id': ident, 'applies_to': applies_to, 'rule': rule, 'source': principle}
            if cardinality is not None:
                entry['cardinality'] = cardinality
            rules.append(entry)

    add('PRINCIPLE-TARGET-UNIVERSE', 'target-universe', 'universe',
        ui_text('metamodelExport.une_seule_racine_elle_contient_une_fois_chaque_business_system_et', root_name=root_name),
        {'instances': {'min': 1, 'max': 1}, 'parent': {'min': 0, 'max': 0}})
    add('PRINCIPLE-TARGET-UNIVERSE', 'business-system-parent', 'business_system',
        ui_text('metamodelExport.chaque_business_system_a_exactement_un_parent_par_contains', root_name=root_name),
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-BUSINESS-SYSTEM', 'domain-parent', 'domain',
        ui_text('metamodelExport.chaque_domain_a_exactement_un_parent_business_system_par_presents'),
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-BUSINESS-AREA', 'business-area-parent', 'business_area',
        ui_text('metamodelExport.chaque_business_area_a_exactement_un_parent_subdomain_kind_area_p'),
        {'parent': {'min': 1, 'max': 1}})
    context_domains = [n['id'] for n in model.get('nodes', []) if n.get('kind') == 'domain'
                       and n.get('fields', {}).get('modeling_depth') == 'business_areas'
                       and 'PRINCIPLE-ORCHESTRATION-DETAIL' in principles]
    area_cardinality = {'children': {'min': 1, 'max': None}}
    area_statement = ui_text('metamodelExport.chaque_business_area_contient_au_moins_une_capacite_ou_presente_a')
    if context_domains:
        area_cardinality['context_domain_exception'] = {'domain_ids': context_domains, 'children_min': 0}
        area_statement += ui_text('metamodelExport.dans_un_domaine_de_contexte_explicitement_limite_aux_business_are')
    add('PRINCIPLE-BUSINESS-AREA', 'business-area-children', 'business_area',
        area_statement, area_cardinality)
    add('PRINCIPLE-BUSINESS-AREA', 'reference-presentation-parent', 'reference',
        ui_text('metamodelExport.toute_reference_presentee_par_une_business_area_a_un_seul_parent_'),
        {'presentation_parent_when_business_area': {'min': 1, 'max': 1}})
    add('PRINCIPLE-REQUIRED-BUSINESS-AREA', 'capability-parent', 'capability',
        ui_text('metamodelExport.chaque_capacite_a_exactement_une_business_area_par_contains_aucun'),
        {'parent': {'min': 1, 'max': 1}})
    capability_domains = [n['id'] for n in model.get('nodes', []) if n.get('kind') == 'domain'
                          and n.get('fields', {}).get('modeling_depth') == 'capabilities']
    detailed_domains = [n.get('fields', {}).get('name', n['id']) for n in model.get('nodes', [])
                        if n.get('kind') == 'domain' and n.get('fields', {}).get('modeling_depth') == 'behaviors']
    depth_statement = (ui_text('metamodelExport.behavior_depth', domains=', '.join(detailed_domains))
                       if detailed_domains else ui_text('metamodelExport.declared_depth'))
    if capability_domains:
        depth_statement += ui_text('metamodelExport.les_domaines') + ', '.join(capability_domains) + ui_text('metamodelExport.sont_detailles_jusqu_aux_capacites')
    if context_domains:
        depth_statement += ui_text('metamodelExport.les_domaines_explicitement_marques_business_areas_peuvent_decrire')
    depth_statement += ui_text('metamodelExport.les_autres_restent_limites_a_leur_profondeur_declaree')
    add('PRINCIPLE-ORCHESTRATION-DETAIL', 'orchestration-detail-scope', 'business_area/capability/behavior',
        depth_statement)
    add('PRINCIPLE-DIFFERENTIATING-BEHAVIORS', 'capability-behaviors', 'capability',
        ui_text('metamodelExport.une_capacite_possede_zero_ou_au_moins_deux_comportements_differen'),
        {'behavior_children': {'allowed': [0, '2..*']}})
    add('PRINCIPLE-JUSTIFIED-BEHAVIOR', 'behavior-rationale', 'capability',
        ui_text('metamodelExport.une_capacite_decomposee_en_comportements_justifie_cette_decomposi'))
    add('PRINCIPLE-DOMAIN-SUBDOMAIN', 'capability-subdomain', 'capability',
        ui_text('metamodelExport.chaque_capacite_a_exactement_un_ancetre_subdomain_kind_area'),
        {'subdomain_ancestors': {'min': 1, 'max': 1}})
    if model.get('scenario_catalog') is not None:
        rules.extend([
            {'id': 'scenario-streams', 'applies_to': 'scenario_catalog.scenarios',
             'cardinality': {'value_streams': {'min': 1, 'max': None}},
             'rule': ui_text('metamodelExport.chaque_scenario_reference_au_moins_un_flux_de_valeur_existant'), 'source': 'validation'},
            {'id': 'scenario-paths', 'applies_to': 'scenario_catalog.scenarios',
             'cardinality': {'paths': {'min': 1, 'max': None}},
             'rule': ui_text('metamodelExport.chaque_scenario_possede_au_moins_un_parcours_de_mobilisation'), 'source': 'validation'},
            {'id': 'path-scenario', 'applies_to': 'scenario_catalog.paths',
             'cardinality': {'scenario': {'min': 1, 'max': 1}},
             'rule': ui_text('metamodelExport.chaque_parcours_reference_un_scenario_existant'), 'source': 'validation'},
            {'id': 'step-contributions', 'applies_to': 'scenario_catalog.paths.steps',
             'cardinality': {'contributions': {'min': 1, 'max': None}},
             'rule': ui_text('metamodelExport.chaque_etape_mobilise_au_moins_une_capacite_ou_reference_publiee_'),
             'source': 'validation'},
        ])
        if any(step.get('context_participants') for path in model['scenario_catalog'].get('paths', [])
               for step in path.get('steps', [])):
            rules.append({'id': 'step-context-participants', 'applies_to': 'scenario_catalog.paths.steps.context_participants',
                          'rule': ui_text('metamodelExport.une_participation_de_contexte_vise_un_domain_subdomain_ou_busines'),
                          'source': 'validation'})
    if model.get('information_catalog') is not None:
        rules.extend([
            {'id': 'information-capability-roles', 'applies_to': 'information_catalog.items',
             'cardinality': {'capability_roles': {'min': 1, 'max': None}},
             'rule': ui_text('metamodelExport.chaque_information_est_reliee_a_au_moins_une_capacite_publiee_ave'),
             'source': 'validation'},
            {'id': 'information-links', 'applies_to': 'information_catalog.links',
             'rule': ui_text('metamodelExport.chaque_lien_va_d_une_information_existante_vers_une_autre_informa'),
             'source': 'validation'},
        ])
    if model.get('hotspot_catalog') is not None:
        rules.extend([
            {'id': 'hotspot-location', 'applies_to': 'hotspot_catalog.hotspots',
             'rule': ui_text('metamodelExport.un_sujet_de_perimetre_possede_au_moins_un_ancrage_un_sujet_d_inte'), 'source': 'validation'},
            {'id': 'hotspot-gap-optional', 'applies_to': 'hotspot_catalog.hotspots.gap_analysis',
             'cardinality': {'gaps': {'min': 0, 'max': None}},
             'rule': ui_text('metamodelExport.une_analyse_d_ecarts_est_facultative_son_sujet_est_une_business_a'), 'source': 'validation'},
            {'id': 'hotspot-independent-dimensions', 'applies_to': 'hotspot_catalog.hotspots',
             'rule': ui_text('metamodelExport.qualification_du_sujet_impact_du_cadrage_criticite_et_avancement_'), 'source': ui_text('metamodelExport.conventions_hotspot_et_gap_analysis')},
            {'id': 'hotspot-impact-scopes', 'applies_to': 'hotspot_catalog.hotspots.framing_impact.scopes',
             'rule': ui_text('metamodelExport.modele_transition_et_usage_sont_cumulables_une_transition_structu'), 'source': 'validation'},
            {'id': 'hotspot-consolidation', 'applies_to': 'hotspot_catalog.hotspots.consolidated_into',
             'rule': ui_text('metamodelExport.la_destination_est_une_fiche_independante_existante_la_fiche_sour'), 'source': 'validation'},
        ])
    return rules


CATALOG_TERMS = _DESCRIPTORS['CATALOG_TERMS']


def _catalog_types(model, terms):
    hotspots = (model.get('hotspot_catalog') or {}).get('hotspots', [])
    gaps = [gap for item in hotspots for gap in item.get('gap_analysis', [])]
    scenarios = model.get('scenario_catalog') or {}
    streams = scenarios.get('value_streams', [])
    paths = scenarios.get('paths', [])
    applications = model.get('application_catalog') or {}
    products = applications.get('products', [])
    selections = applications.get('selections', [])
    counts = {
        'hotspot_catalog.hotspots': len(hotspots),
        'hotspot_catalog.hotspots.gap_analysis': len(gaps),
        'hotspot_catalog.hotspots.gap_analysis.observations_by_context': sum(len(gap['observations_by_context']) for gap in gaps),
        'hotspot_catalog.hotspots.resolution_options': sum(len(item.get('resolution_options', [])) for item in hotspots),
        'scenario_catalog.value_streams': len(streams),
        'scenario_catalog.value_streams.stages': sum(len(item.get('stages', [])) for item in streams),
        'scenario_catalog.scenarios': len(scenarios.get('scenarios', [])),
        'scenario_catalog.paths': len(paths),
        'scenario_catalog.paths.steps': sum(len(item.get('steps', [])) for item in paths),
        'scenario_catalog.paths.steps.context_participants': sum(len(step.get('context_participants', [])) for path in paths for step in path.get('steps', [])),
        'scenario_catalog.facets': sum(len(values) for values in scenarios.get('facets', {}).values()),
        'scenario_catalog.legacy_links': len(scenarios.get('legacy_links', [])),
        'information_catalog.items': len((model.get('information_catalog') or {}).get('items', [])),
        'information_catalog.links': len((model.get('information_catalog') or {}).get('links', [])),
        'document_catalog.documents': len((model.get('document_catalog') or {}).get('documents', [])),
        'application_catalog.products': len(products),
        'application_catalog.products.components': sum(len(product.get('components', [])) for product in products),
        'application_catalog.selections': len(selections),
        'application_catalog.selections.mappings': sum(len(selection.get('mappings', [])) for selection in selections),
        'glossary.terms': len((model.get('glossary') or {}).get('terms', [])),
        'principles': len(model.get('principles', [])),
    }
    result = []
    for path, term_ref, legacy_label, fallback in CATALOG_TERMS:
        if path.split('.')[0] not in model:
            continue
        if path.endswith('.context_participants') and not counts[path]:
            continue  # Historical snapshots do not acquire a new catalogue type.
        term = terms.get(term_ref)
        result.append({'path': path, 'label': term['name'] if term else legacy_label,
                       'definition': _plain(term['definition']) if term else fallback,
                       'definition_source': f"method:{term['id']}" if term else 'export-format' if fallback else None})
    return result, counts


def describe_metamodel(model, guide_response, snapshot_schema=None):
    """Return a self-contained structural header without changing the snapshot."""
    guide = guide_response.get('guide') if guide_response.get('status') == 'available' else None
    terms = {term['id']: term for term in (guide or {}).get('glossary', {}).get('terms', [])
             if term.get('status') != 'retired'}
    publication_terms = {term['id']: term for term in model.get('glossary', {}).get('terms', [])
                         if not term.get('historical')}
    kinds = Counter(node['kind'] for node in model.get('nodes', []))
    node_types = []
    for kind in sorted(kinds):
        root_binding = ROOT_BINDINGS.get(model['version']) if kind == 'universe' else None
        term = terms.get(GUIDE_TERMS.get(kind)) if not root_binding else None
        publication_term = publication_terms.get(root_binding.get('glossary_ref')) if root_binding else None
        if kind == 'universe' and not term and not root_binding:
            root_name = next((node.get('fields', {}).get('name') for node in model.get('nodes', [])
                              if node['kind'] == kind), None)
            matching_terms = [candidate for candidate in publication_terms.values() if candidate['name'] == root_name]
            publication_term = matching_terms[0] if len(matching_terms) == 1 else None
        semantic_term = term or publication_term
        node_types.append({
            'kind': kind,
            'label': semantic_term['name'] if semantic_term else root_binding['legacy_label'] if root_binding else kind.replace('_', ' ').title(),
            'definition': _plain(semantic_term['definition']) if semantic_term else None,
            'short_description': _plain(semantic_term.get('short_description') or semantic_term['definition']) if semantic_term else None,
            'definition_source': (f"method:{term['id']}" if term else
                                  f"glossary:{publication_term['id']}" if publication_term else None),
        })

    by_id = {node['id']: node['kind'] for node in model.get('nodes', [])}
    relations = defaultdict(Counter)
    for relation in model.get('relations', []):
        source = by_id.get(relation['source_id'], 'external')
        target = by_id.get(relation['target_id'], 'external')
        relations[relation['type']][(source, target)] += 1
    relation_types = []
    principles = {item['id'] for item in model.get('principles', [])}
    current_hierarchy = {'PRINCIPLE-TARGET-UNIVERSE', 'PRINCIPLE-REQUIRED-BUSINESS-AREA',
                         'PRINCIPLE-DOMAIN-SUBDOMAIN'} <= principles
    for relation_type in sorted(relations):
        pairs = relations[relation_type]
        relation_types.append({
            'type': relation_type,
            'role': RELATION_ROLES.get(relation_type, 'interaction'),
            'definition': RELATION_MEANINGS.get(relation_type),
            'direction': ui_text('metamodelExport.source_id_target_id'),
            'allowed_endpoints': _allowed_pairs(relation_type, set(kinds), principles),
            'allowed_endpoints_source': 'published_hierarchy' if current_hierarchy and relation_type in {'contains', 'presents'} else 'validator',
        })

    catalog_types, catalog_counts = _catalog_types(model, terms)
    profile = {
        'node_counts': dict(sorted(kinds.items())),
        'catalog_counts': {item['path']: catalog_counts[item['path']] for item in catalog_types},
        'relation_counts': {kind: sum(pairs.values()) for kind, pairs in sorted(relations.items())},
        'observed_endpoints': {
            kind: [{'source_kind': source, 'target_kind': target, 'count': count}
                   for (source, target), count in sorted(pairs.items())]
            for kind, pairs in sorted(relations.items())
        },
    }

    return {
        'schema_version': '1.0.0',
        'scope': ui_text('metamodelExport.types_et_liens_observes_dans_cette_publication_les_couples_observ'),
        'publication_version': model['version'],
        'methodology': {
            'status': guide_response['status'],
            'guide_version': guide['version'] if guide else None,
            'association_scope': guide_response.get('association', {}).get('scope'),
        },
        'fields': FIELD_MEANINGS,
        'snapshot_schema': snapshot_schema,
        'snapshot_schema_scope': ui_text('metamodelExport.contrat_general_du_contenu_publie_profile_indique_les_types_et_li') if snapshot_schema else None,
        'node_types': node_types,
        'catalog_types': catalog_types,
        'relation_types': relation_types,
        'constraints': _constraints(model),
        'hotspot_criticality_policy': (model.get('hotspot_catalog') or {}).get('criticality_policy'),
        'profile': profile,
    }
