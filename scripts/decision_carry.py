"""Conservative context comparison for carrying an existing, unchanged approval.

Only explicitly identified editorial metadata and market documentation are ignored.
Business fields, unknown content and the local graph context remain significant.
This module never creates an approval or changes its scope.
"""

from copy import deepcopy

try:
    from .element_versions import GENERATED
    from .glossary import references
    from .validate_models import canonical_sha256
except ImportError:
    from element_versions import GENERATED
    from glossary import references
    from validate_models import canonical_sha256


EDITORIAL_METADATA = GENERATED | {
    'source_refs', 'correction_refs', 'source_locator', 'review', 'lifecycle',
    'editorial_basis',
}
MARKET_FIELDS = {'market_comparisons', 'market_inspiration'}
ROOT_METADATA = EDITORIAL_METADATA | {
    'version', 'as_of', 'space', 'source_version', 'source_files', 'publication',
    'release_kind', 'excluded_nodes', 'lifecycle_policy',
}


def business_record(record):
    """Strip only known metadata at record boundaries; retain unknown fields."""
    if not isinstance(record, dict):
        return deepcopy(record)
    result = {key: deepcopy(value) for key, value in record.items()
              if key not in EDITORIAL_METADATA | MARKET_FIELDS}
    if isinstance(result.get('fields'), dict):
        result['fields'] = {key: value for key, value in result['fields'].items()
                            if key not in MARKET_FIELDS}
    if isinstance(result.get('qualification'), dict):
        result['qualification'] = {key: value for key, value in result['qualification'].items()
                                   if key not in {'source_refs', 'correction_refs'}}
    return result


def _index(records):
    result = {}
    for item in records:
        if not isinstance(item, dict) or not isinstance(item.get('id'), str) or item['id'] in result:
            raise ValueError('Invalid or duplicate context identifier')
        result[item['id']] = item
    return result


class ContextIndex:
    """Private, operation-scoped indexes; callers keep snapshots fixed while in use."""

    def __init__(self, snapshot):
        self.snapshot = snapshot
        self.records = {key: _index(snapshot.get(key, [])) for key in ('nodes', 'relations', 'principles')}
        self.business = {key: {identifier: business_record(value) for identifier, value in records.items()}
                         for key, records in self.records.items()}
        self.terms = {key: business_record(value) for key, value in
                      _index(snapshot.get('glossary', {}).get('terms', [])).items()}
        self.incident, self.parents, self.contexts, self.glossaries = {}, {}, {}, {}
        for identifier, edge in self.business['relations'].items():
            for endpoint in ('source_id', 'target_id'):
                self.incident.setdefault(edge[endpoint], set()).add(identifier)
            if edge.get('type') in ('contains', 'presents'):
                self.parents.setdefault(edge['target_id'], set()).add(identifier)
        self.root = {key: value for key, value in snapshot.items()
                     if key not in ROOT_METADATA | {'nodes', 'relations', 'principles', 'glossary', 'scenario_catalog'}}
        catalog = snapshot.get('scenario_catalog', {})
        if catalog:
            # Unknown catalogue metadata and shared taxonomies remain global.
            self.root['scenario_catalog'] = business_record({key: value for key, value in catalog.items()
                if key not in {'paths', 'scenarios', 'value_streams'}})
        self.scenarios = {key: {identifier: business_record(value) for identifier, value in
                                _index(catalog.get(key, [])).items()}
                          for key in ('paths', 'scenarios', 'value_streams')}
        self.path_scopes, self.scenario_contexts = {}, {}
        for identifier, path in self.scenarios['paths'].items():
            scope = {c['node_id'] for step in path.get('steps', []) for c in step.get('contributions', [])}
            scope.update(target for kind, target in references(path) if kind == 'model')
            pending = list(scope)
            while pending:
                for edge in self.parents.get(pending.pop(), ()):
                    parent = self.business['relations'][edge]['source_id']
                    if parent not in scope:
                        scope.add(parent)
                        pending.append(parent)
            self.path_scopes[identifier] = scope
        self.header = business_record({key: value for key, value in snapshot.get('glossary', {}).items()
                                       if key not in {'terms', 'version', 'as_of', 'source_files', 'note'}})

    def scenario_context(self, seeds):
        key = frozenset(seeds)
        if key in self.scenario_contexts:
            return self.scenario_contexts[key]
        scenarios = {path['scenario_id'] for identifier, path in self.scenarios['paths'].items()
                     if self.path_scopes[identifier] & seeds}
        paths = {identifier: path for identifier, path in self.scenarios['paths'].items()
                 if path['scenario_id'] in scenarios}
        selected = {identifier: self.scenarios['scenarios'].get(identifier) for identifier in scenarios}
        if any(value is None for value in selected.values()):
            raise ValueError('Scenario context missing')
        streams = {identifier for scenario in selected.values() for identifier in scenario.get('value_stream_ids', [])}
        values = {identifier: self.scenarios['value_streams'].get(identifier) for identifier in streams}
        if any(value is None for value in values.values()):
            raise ValueError('Value stream context missing')
        result = {'paths': paths, 'scenarios': selected, 'value_streams': values}
        self.scenario_contexts[key] = result
        return result


def _model_context(index, seed_ids):
    cache_key = frozenset(seed_ids)
    if cache_key in index.contexts:
        return index.contexts[cache_key]
    nodes, relations = index.business['nodes'], index.business['relations']
    selected = set(seed_ids)
    incident = {identifier: relations[identifier] for seed in seed_ids
                for identifier in index.incident.get(seed, ())}
    for relation in incident.values():
        selected.update(relation[key] for key in ('source_id', 'target_id'))
    # Explicit model links carry business meaning even without a graph edge.
    for value in [nodes.get(identifier, {}) for identifier in seed_ids] + list(incident.values()):
        selected.update(target for kind, target in references(value) if kind == 'model')
    # A Domain/Area move changes context even when the capability itself is untouched.
    pending = list(selected)
    while pending:
        identifier = pending.pop()
        for edge_id in index.parents.get(identifier, ()):
            relation = relations[edge_id]
            incident[edge_id] = relation
            parent = relation['source_id']
            if parent not in selected:
                selected.add(parent)
                pending.append(parent)
    result = ({identifier: nodes.get(identifier) for identifier in selected}, incident)
    index.contexts[cache_key] = result
    return result


def _glossary_context(index, context, seeds):
    key = frozenset(seeds)
    if key in index.glossaries:
        return index.glossaries[key]
    selected = {}
    pending = [identifier for kind, identifier in references(context) if kind == 'glossary']
    while pending:
        identifier = pending.pop()
        if identifier in selected:
            continue
        value = selected[identifier] = index.terms.get(identifier)
        if value is not None:
            pending.extend(target for kind, target in references(value) if kind == 'glossary')
            if value.get('alias_of'):
                chain, target = {identifier}, value['alias_of']
                while target is not None:
                    if target in chain:
                        raise ValueError('Cyclic glossary alias')
                    chain.add(target)
                    target = (index.terms.get(target) or {}).get('alias_of')
                pending.append(value['alias_of'])
    index.glossaries[key] = selected
    return selected


def classify_context(original, previous_snapshot, snapshot, *, indexes=None):
    """Return ``{safe: bool, reasons: list[str]}`` without mutating any input.

    Safety requires the original approved values and their local context to be
    unchanged. Context includes direct neighbors, membership ancestors, incident
    relations, global principles and transitively referenced glossary terms.
    """
    reasons = []
    try:
        target = original['target']
        collection, identifier = target['collection'], target['id']
        if collection not in ('nodes', 'relations') or original.get('decision_state') != 'accepted':
            return {'safe': False, 'reasons': ['decision_not_accepted_or_supported']}
        old_index, new_index = indexes or (ContextIndex(previous_snapshot), ContextIndex(snapshot))
        if old_index.snapshot is not previous_snapshot or new_index.snapshot is not snapshot:
            raise ValueError('Context indexes belong to other snapshots')
        before = old_index.records[collection]
        after = new_index.records[collection]
        if identifier not in before or identifier not in after:
            return {'safe': False, 'reasons': ['target_missing']}
        old, new = before[identifier], after[identifier]
        if old.get('revision') != target['revision']:
            reasons.append('prior_revision_mismatch')
        old_values = old.get('fields', {}) if collection == 'nodes' else old
        new_values = new.get('fields', {}) if collection == 'nodes' else new
        approved = target['approved_fields']
        if (not isinstance(approved, list) or not approved
                or any(not isinstance(field, str) for field in approved)
                or len(set(approved)) != len(approved)
                or set(approved) != set(target['value_sha256'])):
            return {'safe': False, 'reasons': ['invalid_approved_scope']}
        if any(field not in old_values or field not in new_values
               or canonical_sha256(old_values[field]) != target['value_sha256'][field]
               or canonical_sha256(new_values[field]) != target['value_sha256'][field]
               for field in approved):
            reasons.append('approved_values_changed_or_unverified')
        if old_index.business[collection][identifier] != new_index.business[collection][identifier]:
            reasons.append('target_business_changed')
        seeds = {identifier} if collection == 'nodes' else {
            value[key] for value in (old, new) for key in ('source_id', 'target_id')
        }
        old_nodes, old_relations = _model_context(old_index, seeds)
        new_nodes, new_relations = _model_context(new_index, seeds)
        if old_nodes != new_nodes:
            reasons.append('neighbor_or_ancestor_business_changed')
        if old_relations != new_relations:
            reasons.append('incident_or_membership_relation_changed')
        if any(value is None for value in [*old_nodes.values(), *new_nodes.values()]):
            reasons.append('context_node_missing')
        old_principles, new_principles = old_index.business['principles'], new_index.business['principles']
        if old_principles != new_principles:
            reasons.append('principles_changed')
        # Unknown root/glossary properties are significant by default.
        if old_index.root != new_index.root:
            reasons.append('global_business_context_changed')
        # Mobilization paths affect their contributors and responsibility ancestors,
        # without suspending approvals in an unrelated domain for every scenario edit.
        old_scenarios = old_index.scenario_context(set(old_nodes) - {
            edge['source_id'] for edge in old_relations.values() if edge.get('type') in ('contains', 'presents')})
        new_scenarios = new_index.scenario_context(set(new_nodes) - {
            edge['source_id'] for edge in new_relations.values() if edge.get('type') in ('contains', 'presents')})
        # Always include the target itself, including a Domain or Business Area.
        old_scenarios = {**old_scenarios, 'target': old_index.scenario_context(seeds)}
        new_scenarios = {**new_scenarios, 'target': new_index.scenario_context(seeds)}
        if old_scenarios != new_scenarios:
            reasons.append('mobilizing_scenario_changed')
        old_terms = _glossary_context(old_index, [old_nodes, old_relations, old_principles, old_scenarios], seeds)
        new_terms = _glossary_context(new_index, [new_nodes, new_relations, new_principles, new_scenarios], seeds)
        # A first catalogue or an unrelated catalogue header does not redefine
        # an approval whose business context contains no explicit term links.
        if (old_terms or new_terms) and old_index.header != new_index.header:
            reasons.append('glossary_context_changed')
        if old_terms != new_terms:
            reasons.append('referenced_glossary_changed')
        if any(value is None for value in [*old_terms.values(), *new_terms.values()]):
            reasons.append('referenced_glossary_missing')
    except (KeyError, TypeError, ValueError, AttributeError):
        reasons.append('invalid_context')
    return {'safe': not reasons, 'reasons': reasons or ['unchanged_business_context']}
