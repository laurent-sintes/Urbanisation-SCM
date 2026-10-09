"""Describe the structure of one verified publication inside its Atlas JSON export.

This is a reading aid, not another model source. Types and endpoint pairs are
observed in the selected snapshot; definitions come only from its associated,
frozen methodology guide when that guide contains the matching term.
"""

from collections import Counter, defaultdict
import re

from scripts.validate_models import RELATION_KINDS


GUIDE_TERMS = {
    'business_system': 'Business System',
    'domain': 'Domain',
    'area': 'Subdomain',
    'business_area': 'Business Area',
    'reference': 'Business Reference',
    'capability': 'Capability',
    'behavior': 'Capability Behavior',
}
PUBLICATION_TERMS = {'universe': 'Univers'}
RELATION_ROLES = {
    'contains': 'composition',
    'presents': 'presentation',
    'relates-to': 'interaction',
    'uses-reference': 'interaction',
    'supplies-reference': 'interaction',
    'provides-knowledge': 'interaction',
    'provides-conditions': 'interaction',
}
FIELD_MEANINGS = {
    'nodes': 'Objets de cette publication ; kind indique leur type.',
    'relations': 'Liens orientés entre objets ; source_id et target_id désignent des nodes.id.',
    'nodes.id': 'Identifiant persistant, distinct du nom et du code de lecture.',
    'nodes.kind': 'Type de l’objet, déclaré dans metamodel.node_types.',
    'nodes.fields': 'Contenu de la fiche de cet objet dans la publication.',
    'relations.type': 'Type du lien, déclaré dans metamodel.relation_types.',
    'relations.qualification': 'Sens, rôle, conditions et effets propres à ce lien.',
    'display_index': 'Ordre, parenté de lecture et codes figés pour cette publication.',
}

RELATION_MEANINGS = {
    'contains': 'Décomposition ou appartenance structurelle du parent vers l’enfant.',
    'presents': 'Présentation d’un objet sous un autre, sans créer une responsabilité métier supplémentaire.',
    'relates-to': 'Interaction métier qualifiée ; son sens précis est dans qualification.',
    'uses-reference': 'La capacité source utilise les données du référentiel cible.',
    'supplies-reference': 'La capacité source alimente le référentiel cible avec des apports qualifiés.',
    'provides-knowledge': 'Le périmètre source apporte une connaissance au périmètre cible.',
    'provides-conditions': 'La référence source apporte des conditions au périmètre cible.',
}


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
    rules = [
        {'id': 'structural-acyclic', 'applies_to': 'contains/presents',
         'rule': 'Aucun cycle dans les liens de décomposition ou de présentation.',
         'source': 'validation'},
        {'id': 'behavior-parent', 'applies_to': 'behavior',
         'cardinality': {'parent': {'min': 1, 'max': 1}, 'children': {'min': 0, 'max': 0}},
         'rule': 'Chaque comportement a exactement une capacité par contains et aucun enfant structurel.',
         'source': 'validation'},
        {'id': 'qualified-dependencies', 'applies_to': 'relates-to/uses-reference/supplies-reference',
         'rule': 'Chaque lien porte qualification.meaning non vide ; conditions et effets, s’ils existent, sont des listes de textes. Le rôle needs oriente la flèche du consommateur vers le fournisseur.',
         'source': 'validation et convention de lecture'},
        {'id': 'reference-dependency', 'applies_to': 'uses-reference/supplies-reference',
         'rule': 'Ces liens décrivent usage et apport de données ; ils ne créent ni parent hiérarchique ni transfert implicite de maîtrise.',
         'source': 'méthodologie associée'},
    ]

    def add(principle, ident, applies_to, rule, cardinality=None):
        if principle in principles:
            entry = {'id': ident, 'applies_to': applies_to, 'rule': rule, 'source': principle}
            if cardinality is not None:
                entry['cardinality'] = cardinality
            rules.append(entry)

    add('PRINCIPLE-TARGET-UNIVERSE', 'target-universe', 'universe',
        'Une seule racine Univers ; elle contient une fois chaque Business System et n’a pas de parent.',
        {'instances': {'min': 1, 'max': 1}, 'parent': {'min': 0, 'max': 0}})
    add('PRINCIPLE-TARGET-UNIVERSE', 'business-system-parent', 'business_system',
        'Chaque Business System a exactement un parent Univers par contains.',
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-BUSINESS-SYSTEM', 'domain-parent', 'domain',
        'Chaque Domain a exactement un parent Business System par presents.',
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-BUSINESS-AREA', 'business-area-parent', 'business_area',
        'Chaque Business Area a exactement un parent Subdomain (kind area) par contains.',
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-BUSINESS-AREA', 'business-area-children', 'business_area',
        'Chaque Business Area contient au moins une capacité ou présente au moins une référence.',
        {'children': {'min': 1, 'max': None}})
    add('PRINCIPLE-BUSINESS-AREA', 'reference-presentation-parent', 'reference',
        'Toute référence présentée par une Business Area a un seul parent de présentation.',
        {'presentation_parent_when_business_area': {'min': 1, 'max': 1}})
    add('PRINCIPLE-REQUIRED-BUSINESS-AREA', 'capability-parent', 'capability',
        'Chaque capacité a exactement une Business Area par contains ; aucun rattachement direct au sous-domaine.',
        {'parent': {'min': 1, 'max': 1}})
    add('PRINCIPLE-DIFFERENTIATING-BEHAVIORS', 'capability-behaviors', 'capability',
        'Une capacité possède zéro ou au moins deux comportements différenciants.',
        {'behavior_children': {'allowed': [0, '2..*']}})
    add('PRINCIPLE-JUSTIFIED-BEHAVIOR', 'behavior-rationale', 'capability',
        'Une capacité décomposée en comportements justifie cette décomposition dans fields.decomposition_rationale.')
    add('PRINCIPLE-DOMAIN-SUBDOMAIN', 'capability-subdomain', 'capability',
        'Chaque capacité a exactement un ancêtre Subdomain (kind area).',
        {'subdomain_ancestors': {'min': 1, 'max': 1}})
    if model.get('scenario_catalog') is not None:
        rules.extend([
            {'id': 'scenario-streams', 'applies_to': 'scenario_catalog.scenarios',
             'cardinality': {'value_streams': {'min': 1, 'max': None}},
             'rule': 'Chaque scénario référence au moins un flux de valeur existant.', 'source': 'validation'},
            {'id': 'scenario-paths', 'applies_to': 'scenario_catalog.scenarios',
             'cardinality': {'paths': {'min': 1, 'max': None}},
             'rule': 'Chaque scénario possède au moins un parcours de mobilisation.', 'source': 'validation'},
            {'id': 'path-scenario', 'applies_to': 'scenario_catalog.paths',
             'cardinality': {'scenario': {'min': 1, 'max': 1}},
             'rule': 'Chaque parcours référence un scénario existant.', 'source': 'validation'},
            {'id': 'step-contributions', 'applies_to': 'scenario_catalog.paths.steps',
             'cardinality': {'contributions': {'min': 1, 'max': None}},
             'rule': 'Chaque étape mobilise au moins une capacité ou référence publiée ; ses dépendances pointent vers des étapes du même parcours.',
             'source': 'validation'},
        ])
    if model.get('information_catalog') is not None:
        rules.extend([
            {'id': 'information-capability-roles', 'applies_to': 'information_catalog.items',
             'cardinality': {'capability_roles': {'min': 1, 'max': None}},
             'rule': 'Chaque information est reliée à au moins une capacité publiée, avec un rôle qualifié.',
             'source': 'validation'},
            {'id': 'information-links', 'applies_to': 'information_catalog.links',
             'rule': 'Chaque lien va d’une information existante vers une autre information distincte.',
             'source': 'validation'},
        ])
    return rules


CATALOG_TERMS = (
    ('scenario_catalog.value_streams', 'Value Stream', None),
    ('scenario_catalog.value_streams.stages', 'Value Stream Stage', None),
    ('scenario_catalog.scenarios', 'Business Scenario', None),
    ('scenario_catalog.paths', 'Capability Mobilization Path', None),
    ('scenario_catalog.paths.steps', 'Capability Mobilization Step', None),
    ('scenario_catalog.facets', 'Scenario Facet', 'Valeur de classement utilisée pour retrouver des scénarios par événement, objet métier ou type de situation.'),
    ('scenario_catalog.legacy_links', 'Legacy Scenario Link', 'Correspondance de lecture entre une ancienne illustration locale et un scénario autonome de cette publication.'),
    ('information_catalog.items', 'Information', None),
    ('information_catalog.links', 'Information Link', 'Relation orientée et qualifiée entre deux informations métier distinctes.'),
    ('glossary.terms', 'Business Glossary Term', 'Terme du vocabulaire métier de cette publication, avec définition et statut de revue.'),
    ('principles', 'Model Principle', 'Règle ou choix de modélisation applicable à cette publication, identifié et sourcé.'),
)


def _catalog_types(model, terms):
    scenarios = model.get('scenario_catalog') or {}
    streams = scenarios.get('value_streams', [])
    paths = scenarios.get('paths', [])
    counts = {
        'scenario_catalog.value_streams': len(streams),
        'scenario_catalog.value_streams.stages': sum(len(item.get('stages', [])) for item in streams),
        'scenario_catalog.scenarios': len(scenarios.get('scenarios', [])),
        'scenario_catalog.paths': len(paths),
        'scenario_catalog.paths.steps': sum(len(item.get('steps', [])) for item in paths),
        'scenario_catalog.facets': sum(len(values) for values in scenarios.get('facets', {}).values()),
        'scenario_catalog.legacy_links': len(scenarios.get('legacy_links', [])),
        'information_catalog.items': len((model.get('information_catalog') or {}).get('items', [])),
        'information_catalog.links': len((model.get('information_catalog') or {}).get('links', [])),
        'glossary.terms': len((model.get('glossary') or {}).get('terms', [])),
        'principles': len(model.get('principles', [])),
    }
    result = []
    for path, term_name, fallback in CATALOG_TERMS:
        if path.split('.')[0] not in model:
            continue
        term = terms.get(term_name)
        result.append({'path': path, 'count': counts[path], 'label': term_name,
                       'definition': _plain(term['definition']) if term else fallback,
                       'definition_source': f"method:{term['id']}" if term else 'export-format' if fallback else None})
    return result


def describe_metamodel(model, guide_response, snapshot_schema=None):
    """Return a self-contained structural header without changing the snapshot."""
    guide = guide_response.get('guide') if guide_response.get('status') == 'available' else None
    terms = {term['name']: term for term in (guide or {}).get('glossary', {}).get('terms', [])
             if term.get('status') != 'retired'}
    publication_terms = {term['name']: term for term in model.get('glossary', {}).get('terms', [])
                         if not term.get('historical')}
    kinds = Counter(node['kind'] for node in model['nodes'])
    node_types = []
    for kind in sorted(kinds):
        term = terms.get(GUIDE_TERMS.get(kind))
        publication_term = publication_terms.get(PUBLICATION_TERMS.get(kind)) if not term else None
        semantic_term = term or publication_term
        node_types.append({
            'kind': kind,
            'count': kinds[kind],
            'label': semantic_term['name'] if semantic_term else kind.replace('_', ' ').title(),
            'definition': _plain(semantic_term['definition']) if semantic_term else None,
            'definition_source': (f"method:{term['id']}" if term else
                                  f"glossary:{publication_term['id']}" if publication_term else None),
        })

    by_id = {node['id']: node['kind'] for node in model['nodes']}
    relations = defaultdict(Counter)
    for relation in model['relations']:
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
            'direction': 'source_id → target_id',
            'count': sum(pairs.values()),
            'allowed_endpoints': _allowed_pairs(relation_type, set(kinds), principles),
            'allowed_endpoints_source': 'published_hierarchy' if current_hierarchy and relation_type in {'contains', 'presents'} else 'validator',
            'observed_endpoints': [
                {'source_kind': source, 'target_kind': target, 'count': count}
                for (source, target), count in sorted(pairs.items())
            ],
        })

    return {
        'schema_version': '1.0.0',
        'scope': 'Types et liens observés dans cette publication ; les couples observés ne définissent pas à eux seuls les liens autorisés.',
        'publication_version': model['version'],
        'methodology': {
            'status': guide_response['status'],
            'guide_version': guide['version'] if guide else None,
            'association_scope': guide_response.get('association', {}).get('scope'),
        },
        'fields': FIELD_MEANINGS,
        'snapshot_schema': snapshot_schema,
        'snapshot_schema_scope': 'Schéma du contenu publié, avant ajout de sourcePath et metamodel par l’export Atlas.' if snapshot_schema else None,
        'node_types': node_types,
        'catalog_types': _catalog_types(model, terms),
        'relation_types': relation_types,
        'constraints': _constraints(model),
    }
