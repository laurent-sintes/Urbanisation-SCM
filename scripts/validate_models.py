"""Validate structured models, adoption evidence and frozen release inputs.

JSON contracts are checked by the deliberately limited json_contract module.
These additional rules validate graph integrity and publication provenance;
they do not decide whether a business statement should be adopted.
"""

import argparse
from collections import Counter
from datetime import date, datetime
import hashlib
import json
from pathlib import Path
import re

try:
    from .business_scenarios import validate_scenarios
    from .git_history import read_bytes
    from .glossary import validate as validate_glossary
    from .json_contract import validate as validate_contract
    from .release_catalog import resolve_release
    from .structured_io import read as read_document, working_path
except ImportError:
    from business_scenarios import validate_scenarios
    from git_history import read_bytes
    from glossary import validate as validate_glossary
    from json_contract import validate as validate_contract
    from release_catalog import resolve_release
    from structured_io import read as read_document, working_path


ROOT = Path(__file__).resolve().parents[1]
PANORAMA_COLLECTIONS = ("objects", "flows", "information_authorities", "decision_responsibilities")
CAPABILITY_NATURES = {'evaluation', 'ledger', 'integration', 'action', 'management', 'knowledge', 'orchestration', 'planning', 'policy', 'decision'}
BEHAVIOR_NATURES = {'policy_strategy', 'process_variant', 'intervention_mechanism', 'business_scope', 'decision_dimension', 'business_effect', 'planning_practice'}
REQUEST_ORIGINS = {'frontoffice', 'backoffice'}
BEHAVIOR_ASPECTS = {'trigger', 'activity'}
RELATION_KINDS = {
    # The former lower-level domain remains supported in frozen publications.
    "contains": ({"domain", "area", "business_area", "reference", "capability"}, {"business_area", "capability", "behavior"}),
    "documents-reference": ({"capability"}, {"reference"}),
    "uses-reference": ({"capability"}, {"reference"}),
    "supplies-reference": ({"capability"}, {"reference"}),
    "presents": ({"business_system", "group", "domain", "area", "business_area"}, {"domain", "area", "reference", "group", "capability"}),
    "confirms": ({"capability"}, {"object"}),
    "associated-document": ({"capability"}, {"document"}),
    "observed-result": ({"capability"}, {"event"}),
    "represents": ({"document"}, {"object"}),
    "records": ({"document"}, {"event"}),
    "provides-knowledge": ({"domain", "area", "business_area"}, {"domain", "area", "business_area"}),
    "provides-conditions": ({"reference"}, {"domain", "area"}),
    "describes-network": ({"reference"}, {"domain", "area"}),
    "relates-to": ({"capability", "behavior", "reference"}, {"capability", "behavior", "object", "document", "event", "reference"}),
}


def canonical_sha256(value):
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _relation_values(relation):
    fields = {key: relation.get(key) for key in ("type", "source_id", "target_id")}
    if "fields" in relation:
        fields["fields"] = relation["fields"]
    if "qualification" in relation:
        fields["qualification"] = relation["qualification"]
    return fields


def _index(records, label, errors):
    index = {}
    for i, record in enumerate(records):
        identifier = record.get("id") if isinstance(record, dict) else None
        if not isinstance(identifier, str) or not identifier:
            errors.append(f"{label}/{i}: missing or invalid id")
        elif identifier in index:
            errors.append(f"{label}/{identifier}: duplicate id")
        else:
            index[identifier] = record
    return index


def _source_refs(value, sources, path=""):
    errors = []
    if isinstance(value, dict):
        for key, child in value.items():
            here = f"{path}/{key}"
            if key in ("source_refs", "correction_refs"):
                if not isinstance(child, list) or any(not isinstance(r, str) for r in child):
                    errors.append(f"{here}: expected source id list")
                else:
                    for ref in child:
                        if ref not in sources:
                            errors.append(f"{here}: unknown source {ref}")
            else:
                errors.extend(_source_refs(child, sources, here))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            errors.extend(_source_refs(child, sources, f"{path}/{i}"))
    return errors


def validate_sources(source_document):
    errors = []
    sources = _index(source_document.get("records", []), "sources", errors)
    for identifier, source in sources.items():
        text = source.get("captured_text")
        if not isinstance(text, str):
            errors.append(f"sources/{identifier}: captured_text missing")
        elif hashlib.sha256(text.strip().encode("utf-8")).hexdigest() != source.get("content_sha256"):
            errors.append(f"sources/{identifier}: captured_text hash mismatch")
    return errors


def validate_urbanism(model, sources, schema=None):
    try:
        from .display_codes import validate_display_index
    except ImportError:
        from display_codes import validate_display_index
    try:
        from .information_catalog import validate_information, versioned_items
    except ImportError:
        from information_catalog import validate_information, versioned_items
    try:
        from .market_comparison import validate_comparisons, validate_inspiration, validate_reference_policy
    except ImportError:
        from market_comparison import validate_comparisons, validate_inspiration, validate_reference_policy
    try:
        from .lifecycle import validate_lifecycle
    except ImportError:
        from lifecycle import validate_lifecycle
    errors = validate_contract(model, schema) if schema is not None else validate_contract(model, True)
    if errors:
        return errors
    errors += validate_display_index(model)
    if not isinstance(model, dict):
        return ["model: expected object"]
    if any(not isinstance(model.get(k), list) for k in ("nodes", "relations")):
        return ["model: nodes and relations must be lists"]
    errors.extend(validate_glossary(model))
    errors.extend(validate_reference_policy(model))
    errors.extend(validate_information(model))
    nodes = _index(model["nodes"], "nodes", errors)
    errors.extend(validate_scenarios(nodes))
    try:
        from .scenario_catalog import validate_catalog
    except ImportError:
        from scenario_catalog import validate_catalog
    errors.extend(validate_catalog(model))
    relations = _index(model["relations"], "relations", errors)
    business_areas = any(p.get('id') == 'PRINCIPLE-BUSINESS-AREA' for p in model.get('principles', []))
    if any(n.get('kind') == 'business_area' for n in nodes.values()) and not business_areas:
        errors.append('business-area: explicit principle required')
    if business_areas:
        for identifier, node in nodes.items():
            kind = node.get('kind')
            if 'category' in node.get('fields', {}):
                errors.append(f'business-area/{identifier}: category is retired')
            if kind in ('business_area', 'capability'):
                parents = [r for r in model['relations'] if r.get('type') in ('contains', 'presents') and r.get('target_id') == identifier]
                allowed = ('area',) if kind == 'business_area' else ('area', 'business_area')
                if len(parents) != 1 or parents[0]['type'] != 'contains' or nodes.get(parents[0]['source_id'], {}).get('kind') not in allowed:
                    errors.append(f'business-area/{identifier}: invalid responsibility parent')
            if kind == 'business_area':
                for field in ('name', 'definition', 'finality', 'scope'):
                    if not isinstance(node.get('fields', {}).get(field), str) or not node['fields'][field].strip():
                        errors.append(f'business-area/{identifier}: {field} must be nonempty')
                children = [r for r in model['relations'] if r.get('type') in ('contains', 'presents') and r.get('source_id') == identifier]
                if not children or any((r['type'], nodes.get(r['target_id'], {}).get('kind')) not in {('contains', 'capability'), ('presents', 'reference')} for r in children):
                    errors.append(f'business-area/{identifier}: requires contained capabilities or presented references')
            if kind == 'reference':
                parents = [r for r in model['relations'] if r.get('type') in ('contains', 'presents') and r.get('target_id') == identifier]
                if any(nodes.get(r['source_id'], {}).get('kind') == 'business_area' for r in parents) and len(parents) != 1:
                    errors.append(f'business-area/{identifier}: reference requires a unique presentation parent')
    for item in model['nodes'] + model['relations']:
        if 'market_comparisons' in item.get('fields', {}):
            errors.extend(validate_comparisons(item['fields']['market_comparisons'], item['id'] + '/market_comparisons'))
        if model.get('lifecycle_policy') == 1 and 'lifecycle' not in item:
            errors.append('lifecycle/' + item['id'] + ': required by lifecycle_policy')
        errors.extend(validate_lifecycle(item))
    for identifier in set(nodes) & set(relations):
        errors.append(f"model/{identifier}: id shared by node and relation")
    for identifier, node in nodes.items():
        fields = node.get('fields', {})
        if 'data_governance' in fields:
            if node.get('kind') not in ('reference', 'capability'):
                errors.append(f'nodes/{identifier}: data_governance belongs to a reference or capability')
            if fields['data_governance'] not in ('Domain-managed', 'Projection', 'Domain-View'):
                errors.append(f'nodes/{identifier}: invalid data_governance')
        if 'request_origins' in fields:
            origins = fields['request_origins']
            if node.get('kind') != 'capability':
                errors.append(f'nodes/{identifier}: request_origins belongs to a capability')
            if (not isinstance(origins, list) or not 1 <= len(origins) <= 2
                    or any(not isinstance(origin, str) or origin not in REQUEST_ORIGINS for origin in origins)
                    or len(set(origins)) != len(origins)):
                errors.append(f'nodes/{identifier}: request_origins must be a nonempty unique list of frontoffice/backoffice')
        if 'behavior_aspect' in fields:
            aspect = fields['behavior_aspect']
            if node.get('kind') != 'behavior':
                errors.append(f'nodes/{identifier}: behavior_aspect belongs to a behavior')
            if not isinstance(aspect, str) or aspect not in BEHAVIOR_ASPECTS:
                errors.append(f'nodes/{identifier}: behavior_aspect must be trigger or activity')
        if 'market_inspiration' in node.get('fields', {}):
            errors.extend(validate_inspiration(node['fields']['market_inspiration'],
                                              node['fields'].get('market_comparisons'),
                                              identifier + '/market_inspiration'))
        role, level = node.get("group_role"), node.get("level_ref")
        if role is not None and (node.get("kind") != "group" or role not in ("presentation", "urbanism_level")):
            errors.append(f"nodes/{identifier}: group_role requires a group and a supported role")
        if role == "urbanism_level" and (not isinstance(level, str) or not level.strip()):
            errors.append(f"nodes/{identifier}: urbanism_level requires an explicit level_ref")
        if level is not None and role != "urbanism_level":
            errors.append(f"nodes/{identifier}: level_ref is not a presentation grouping")
        if 'modeling_depth' in fields:
            if node.get('kind') not in ('business_system', 'domain') or fields['modeling_depth'] not in ('context', 'domains', 'behaviors'):
                errors.append(f'nodes/{identifier}: modeling_depth requires a business system/domain and context/domains/behaviors')
    # U757 opts current models into exhaustive presentation categories; frozen models remain unchanged.
    if any(p.get('id') == 'PRINCIPLE-CAPABILITY-CATEGORY' for p in model.get('principles', [])):
        for identifier, node in nodes.items():
            if node.get('kind') != 'capability':
                continue
            category = node.get('fields', {}).get('category')
            if (not isinstance(category, dict)
                    or not isinstance(category.get('id'), str)
                    or re.fullmatch(r'[a-z][a-z0-9-]*', category['id']) is None
                    or not isinstance(category.get('display_name'), str)
                    or not category['display_name'].strip()
                    or type(category.get('order')) is not int):
                errors.append(f'nodes/{identifier}: capability category requires id, display_name and integer order')
    # Opt-in convention: immutable publications before U449 remain valid unchanged.
    if any(p.get('id') == 'PRINCIPLE-BEHAVIOR-NATURE' for p in model.get('principles', [])):
        for identifier, node in nodes.items():
            if node.get('kind') == 'behavior' and node.get('fields', {}).get('nature') not in BEHAVIOR_NATURES:
                errors.append(f'nodes/{identifier}: behavior nature must be one of {sorted(BEHAVIOR_NATURES)}')
    if any(p.get('id') == 'PRINCIPLE-CAPABILITY-NATURE' for p in model.get('principles', [])):
        for identifier, node in nodes.items():
            if node.get('kind') == 'capability' and node.get('fields', {}).get('nature') not in CAPABILITY_NATURES:
                errors.append(f'nodes/{identifier}: capability nature must be one of {sorted(CAPABILITY_NATURES)}')
    errors.extend(_source_refs(model, sources))
    graph = {identifier: [] for identifier in nodes}
    for identifier, rel in relations.items():
        source, target = nodes.get(rel.get("source_id")), nodes.get(rel.get("target_id"))
        if source is None or target is None:
            errors.append(f"relations/{identifier}: dangling source_id or target_id")
            continue
        rule = RELATION_KINDS.get(rel.get("type"))
        if rule is None:
            errors.append(f"relations/{identifier}: unsupported relation type")
        elif source.get("kind") not in rule[0] or target.get("kind") not in rule[1]:
            errors.append(f"relations/{identifier}: incompatible endpoint kinds for {rel.get('type')}")
        if source.get('kind') == 'business_system' and rel.get('type') == 'presents' and target.get('kind') != 'domain':
            errors.append(f'relations/{identifier}: business system presents only domains')
        if (rel.get("type") == "presents" and source.get("kind") == "domain"
                and target.get("kind") not in {"area", "reference", "group"}):
            errors.append(f"relations/{identifier}: domain presents only areas, references or presentation groups")
        if (rel.get("type") == "presents" and source.get("kind") in {"area", "business_area"}
                and target.get("kind") != "reference"):
            errors.append(f"relations/{identifier}: area presents only references; capabilities use contains")
        if rel.get("type") in {"relates-to", "uses-reference", "supplies-reference"}:
            if (rel.get("type") == "relates-to" and
                    ((source.get("kind") == "reference") != (target.get("kind") == "reference"))):
                errors.append(f"relations/{identifier}: a reference relates-to another reference; mixed endpoint kinds are not supported")
            qualification = rel.get("qualification")
            if not isinstance(qualification, dict):
                errors.append(f"relations/{identifier}: {rel.get('type')} requires qualification")
            else:
                if not isinstance(qualification.get("meaning"), str) or not qualification["meaning"].strip():
                    errors.append(f"relations/{identifier}: qualification needs a nonempty meaning")
                for field in ("conditions", "effects"):
                    if not isinstance(qualification.get(field), list) or any(not isinstance(v, str) for v in qualification[field]):
                        errors.append(f"relations/{identifier}: qualification {field} must be a string list")
                if "role" in qualification and not isinstance(qualification["role"], str):
                    errors.append(f"relations/{identifier}: qualification role must be a string")
        if rel.get("type") in ("contains", "presents"):
            graph[source["id"]].append(target["id"])
    # U461 requires a business document for each management fact. Opt-in keeps
    # immutable publications on their original contract; no exact cardinality.
    if any(p.get('id') == 'PRINCIPLE-MANAGEMENT-FACT-DOCUMENT' for p in model.get('principles', [])):
        documented_facts = {
            rel.get('target_id') for rel in relations.values()
            if rel.get('type') == 'records'
            and nodes.get(rel.get('source_id'), {}).get('kind') == 'document'
            and nodes.get(rel.get('target_id'), {}).get('kind') == 'event'
        }
        for identifier, node in nodes.items():
            if node.get('kind') == 'event' and identifier not in documented_facts:
                errors.append(f'nodes/{identifier}: management fact requires an identified document via records')
    visited, active = set(), set()

    def traverse(identifier):
        if identifier in active:
            errors.append(f"relations/{identifier}: presentation or containment cycle")
            return
        if identifier in visited:
            return
        active.add(identifier)
        for child in graph[identifier]:
            traverse(child)
        active.remove(identifier)
        visited.add(identifier)

    for identifier in graph:
        traverse(identifier)
    # U780 is opt-in: frozen publications keep their historical root contract.
    if any(p.get('id') == 'PRINCIPLE-BUSINESS-SYSTEM' for p in model.get('principles', [])):
        parents = {identifier: [] for identifier in nodes}
        for source, children in graph.items():
            for target in children:
                parents[target].append(source)
        for identifier, node in nodes.items():
            if node.get('kind') in ('business_system', 'domain'):
                for field in ('name', 'definition', 'finality', 'scope', 'modeling_depth'):
                    if not node.get('fields', {}).get(field):
                        errors.append(f'business-system/{identifier}: {field} must be nonempty')
            if node.get('kind') == 'business_system' and parents[identifier]:
                errors.append(f'business-system/{identifier}: business system must be a root')
            if node.get('kind') == 'domain' and (len(parents[identifier]) != 1 or nodes[parents[identifier][0]].get('kind') != 'business_system'):
                errors.append(f'business-system/{identifier}: domain requires exactly one business system parent')
    # U624/U626 is an opt-in contract; old snapshots keep their own hierarchy.
    if any(p.get('id') in ('PRINCIPLE-DOMAIN-PURPOSE', 'PRINCIPLE-DOMAIN-SUBDOMAIN') for p in model.get('principles', [])):
        structural_parents = {identifier: set() for identifier in nodes}
        for source, children in graph.items():
            for target in children:
                structural_parents[target].add(source)
        for identifier, node in nodes.items():
            if node.get('kind') in ('domain', 'area'):
                for field in ('name', 'definition', 'finality', 'scope'):
                    value = node.get('fields', {}).get(field)
                    if not isinstance(value, str) or not value.strip():
                        errors.append(f'purpose/{identifier}: {field} must be nonempty')
            if node.get('kind') != 'capability':
                continue
            pending = list(structural_parents[identifier])
            seen, purposes = set(), set()
            while pending:
                parent = pending.pop()
                if parent in seen:
                    continue
                seen.add(parent)
                if nodes[parent].get('kind') == 'area':
                    purposes.add(parent)
                pending.extend(structural_parents[parent])
            if len(purposes) != 1:
                errors.append(f'purpose/{identifier}: capability requires exactly one Purpose ancestor')
    # Justification is required only for models that adopt this convention;
    # historical immutable snapshots retain their original contract.
    justified_behaviors = any(p.get('id') == 'PRINCIPLE-JUSTIFIED-BEHAVIOR'
                             for p in model.get('principles', []))
    differentiating_behaviors = any(p.get('id') == 'PRINCIPLE-DIFFERENTIATING-BEHAVIORS'
                                    for p in model.get('principles', []))
    for identifier, node in nodes.items():
        rationale = node.get('fields', {}).get('decomposition_rationale')
        if rationale is not None and node.get('kind') != 'capability':
            errors.append(f'behavior/{identifier}: decomposition rationale belongs to a capability')
        children = [child for child in graph[identifier]
                    if nodes.get(child, {}).get('kind') == 'behavior']
        if differentiating_behaviors and node.get('kind') == 'capability' and len(children) == 1:
            errors.append(f'behavior/{identifier}: requires zero or at least two differentiating behaviors')
        if 'dominant_role' in node.get('fields', {}) and node.get('kind') != 'area':
            errors.append(f'role/{identifier}: dominant role belongs to a subdomain')
        if justified_behaviors and children and (not isinstance(rationale, str) or not rationale.strip()):
            errors.append(f'behavior/{identifier}: decomposition requires a complexity or targeted benefit rationale')
    # U455 retires the layer axis. Historical snapshots keep their original contract.
    without_layers = any(p.get('id') == 'PRINCIPLE-DOMAIN-INTERACTIONS'
                         for p in model.get('principles', []))
    for identifier, node in nodes.items():
        if without_layers and 'layer' in node:
            errors.append(f'nodes/{identifier}: layer is retired by PRINCIPLE-DOMAIN-INTERACTIONS')
        elif not without_layers and 'layer' not in node:
            errors.append(f'nodes/{identifier}: historical model requires layer')
    # Behaviors are terminal descriptive children, never a second capability tree.
    for identifier, node in nodes.items():
        if node.get('kind') != 'behavior':
            continue
        parents = [r for r in model['relations'] if r.get('type') in ('contains', 'presents')
                   and r.get('target_id') == identifier]
        if (len(parents) != 1 or parents[0]['type'] != 'contains'
                or nodes.get(parents[0]['source_id'], {}).get('kind') != 'capability'):
            errors.append(f'behavior/{identifier}: requires exactly one capability parent via contains')
        elif not without_layers and nodes[parents[0]['source_id']].get('layer') != node.get('layer'):
            errors.append(f'behavior/{identifier}: layer differs from parent capability')
        if graph[identifier]:
            errors.append(f'behavior/{identifier}: terminal level cannot contain children')
        for field in ('name', 'definition'):
            if not isinstance(node.get('fields', {}).get(field), str) or not node['fields'][field].strip():
                errors.append(f'behavior/{identifier}: nonempty {field} required')
    alternatives = _index(model.get("alternatives", []), "alternatives", errors)
    for identifier, alternative in alternatives.items():
        targets = [alternative.get("target_id")]
        targets.extend(o.get("target_id") for o in alternative.get("field_overrides", []))
        for target in targets:
            if target not in nodes:
                errors.append(f"alternatives/{identifier}: dangling target {target}")
    _index(model.get("principles", []), "principles", errors)
    if model.get('element_versioning') == 1:
        glossary = model.get('glossary')
        glossary_items = ([glossary] + glossary['terms']) if isinstance(glossary, dict) and isinstance(glossary.get('terms'), list) else []
        for item in [model] + model['nodes'] + model['relations'] + model.get('principles', []) + [g for g in glossary_items if isinstance(g, dict)] + versioned_items(model):
            identifier = item.get('id', item.get('model_id'))
            if type(item.get('revision')) is not int or item['revision'] < 1:
                errors.append(f'versioning/{identifier}: positive integer revision required')
            try:
                stamp = item['last_modified']
                if not isinstance(stamp, str) or not stamp.endswith('Z'):
                    raise ValueError('UTC required')
                datetime.fromisoformat(stamp.replace('Z', '+00:00'))
            except (KeyError, TypeError, ValueError):
                errors.append(f'versioning/{identifier}: UTC last_modified required')
            if not re.fullmatch(r'[0-9a-f]{64}', item.get('content_sha256', '')):
                errors.append(f'versioning/{identifier}: content fingerprint required')
    if model.get("space") == "release":
        if model.get("alternatives"):
            errors.append("release: alternatives belong in backlog")
        for collection in ("nodes", "relations"):
            for item in model[collection]:
                forbidden = {"illustration"} if model.get("release_kind") == "published_snapshot" else {"proposed", "illustration"}
                if item.get("review", {}).get("state") in forbidden:
                    errors.append(f"release/{item['id']}: unpublishable review state")
    return errors


def relations_to_illustrations(snapshot):
    """Links to excluded examples stay in context; genuinely missing IDs do not.

    Shared by compilation and validation so their publication scopes agree.
    """
    illustrative = {n['id'] for n in snapshot['nodes'] if n['review']['state'] == 'illustration'}
    return {r['id'] for r in snapshot['relations']
            if r['source_id'] in illustrative or r['target_id'] in illustrative}


def validate_release(release, decisions_document, snapshot, sources, schema=None):
    """Validate against the frozen input, NEVER against the live backlog."""
    errors = validate_urbanism(release, sources, schema)
    if release.get("glossary") != snapshot.get("glossary"):
        errors.append("release: glossary differs from frozen input")
    if release.get('scenario_catalog') != snapshot.get('scenario_catalog'):
        errors.append('release: scenario catalogue differs from frozen input')
    if release.get('information_catalog') != snapshot.get('information_catalog'):
        errors.append('release: information catalogue differs from frozen input')
    if errors:
        return errors
    errors.extend(validate_urbanism(snapshot, sources, schema))
    if errors:
        return errors
    if release.get("space") != "release" or snapshot.get("space") != "backlog":
        errors.append("release: incorrect publication or frozen input space")
    if release.get("model_id") != snapshot.get("model_id"):
        errors.append("release: model_id differs from frozen input")
    if release.get('display_policy') != snapshot.get('display_policy'):
        errors.append('release: display_policy differs from frozen input')
    published_snapshot = release.get("release_kind") == "published_snapshot"
    if snapshot.get("version") != decisions_document.get("version"):
        errors.append("release: decisions/frozen input version mismatch")
    errors.extend(_source_refs(decisions_document, sources, "decisions"))
    decisions = _index(decisions_document.get("decisions", []), "decisions", errors)
    frozen = {c: _index(snapshot[c], f"snapshot/{c}", errors) for c in ("nodes", "relations")}
    approved_targets = {"nodes": set(), "relations": set()}
    for identifier, decision in decisions.items():
        target = decision.get("target", {})
        collection, target_id = target.get("collection"), target.get("id")
        original = frozen.get(collection, {}).get(target_id)
        if original is None:
            errors.append(f"decisions/{identifier}: missing target in frozen input")
            continue
        if target.get("revision") != original.get("revision") or target.get("import_version") != snapshot.get("version"):
            errors.append(f"decisions/{identifier}: frozen target revision/version mismatch")
        fields = target.get("approved_fields", [])
        hashes = target.get("value_sha256", {})
        if not isinstance(fields, list) or not fields or len(fields) != len(set(fields)) or set(fields) != set(hashes):
            errors.append(f"decisions/{identifier}: approved_fields/hash keys mismatch")
            continue
        values = original.get("fields", {}) if collection == "nodes" else original
        for field in fields:
            if field not in values or canonical_sha256(values[field]) != hashes[field]:
                errors.append(f"decisions/{identifier}/{field}: frozen value hash mismatch")
        if decision.get("decision_state") == "accepted":
            approved_targets[collection].add(target_id)
            if not isinstance(decision.get("author"), str) or not decision["author"].strip() or not decision.get("source_refs"):
                errors.append(f"decisions/{identifier}: accepted decision requires author and source")
            try:
                date.fromisoformat(decision.get("decided_at", ""))
            except (ValueError, TypeError):
                errors.append(f"decisions/{identifier}: invalid decision date")

    for collection in ("nodes", "relations"):
        released_ids = {r["id"] for r in release[collection]}
        expected_ids = {key for key, item in frozen[collection].items() if item.get("review", {}).get("state") != "illustration"} if published_snapshot else approved_targets[collection]
        if published_snapshot and collection == 'relations':
            expected_ids -= relations_to_illustrations(snapshot)
        if released_ids != expected_ids:
            errors.append(f"release/{collection}: contents differ from frozen publication scope")
        for item in release[collection]:
            identifier = item["id"]
            original = frozen[collection].get(identifier)
            if original is None:
                errors.append(f"release/{identifier}: no frozen input record")
                continue
            metadata = ("revision", "last_modified", "content_sha256", "kind", "layer", "group_role", "level_ref", "source_refs", "source_locator") if collection == "nodes" else ("revision", "last_modified", "content_sha256", "source_refs")
            for field in metadata:
                if item.get(field) != original.get(field):
                    errors.append(f"release/{identifier}/{field}: differs from frozen metadata")
            adoption_ids = item.get("adoption_ids", [])
            if (not adoption_ids and not published_snapshot) or len(adoption_ids) != len(set(adoption_ids)):
                errors.append(f"release/{identifier}: missing or duplicate adoption_ids")
            expected_adoptions = {key for key, decision in decisions.items() if decision.get("decision_state") == "accepted" and decision.get("target", {}).get("collection") == collection and decision.get("target", {}).get("id") == identifier and decision.get("target", {}).get("revision") == item.get("revision")}
            if set(adoption_ids) != expected_adoptions:
                errors.append(f"release/{identifier}: adoption_ids differ from accepted decisions for this revision")
            expected, adoption_sources = {}, set()
            for adoption_id in adoption_ids:
                adoption = decisions.get(adoption_id)
                if adoption is None:
                    errors.append(f"release/{identifier}: unknown adoption {adoption_id}")
                    continue
                target = adoption.get("target", {})
                if adoption.get("decision_state") != "accepted" or (target.get("collection"), target.get("id"), target.get("revision")) != (collection, identifier, item.get("revision")):
                    errors.append(f"release/{identifier}: adoption {adoption_id} is not accepted for this revision")
                    continue
                adoption_sources.update(adoption.get("source_refs", []))
                for field, digest in target.get("value_sha256", {}).items():
                    if field in expected and expected[field] != digest:
                        errors.append(f"release/{identifier}/{field}: conflicting adoptions")
                    expected[field] = digest
            actual = item.get("fields", {}) if collection == "nodes" else _relation_values(item)
            lifecycle = item.get('lifecycle', {})
            original_cycle = original.get('lifecycle')
            expected_cycle = original_cycle
            if published_snapshot and original_cycle and set(original_cycle.get('validated_fields', [])) - set(expected):
                expected_cycle = dict(original_cycle)
                expected_cycle['validated_fields'] = [f for f in original_cycle['validated_fields'] if f in expected]
                expected_cycle['value_sha256'] = {f: v for f, v in original_cycle.get('value_sha256', {}).items() if f in expected}
                if not expected_cycle['validated_fields'] and expected_cycle.get('state') == 'urbanist_validated':
                    expected_cycle['state'] = 'under_instruction'
            if item.get('lifecycle') != expected_cycle:
                errors.append(f'release/{identifier}/lifecycle: differs from frozen metadata qualified by adoption evidence')
            for field in lifecycle.get('validated_fields', []):
                if field not in expected or lifecycle.get('value_sha256', {}).get(field) != expected[field]:
                    errors.append(f'release/{identifier}: lifecycle approval lacks a matching decision: {field}')
            if not published_snapshot and set(actual) != set(expected):
                errors.append(f"release/{identifier}: released fields differ from approved_fields")
            if published_snapshot:
                frozen_values = original.get("fields", {}) if collection == "nodes" else _relation_values(original)
                if canonical_sha256(actual) != canonical_sha256(frozen_values):
                    errors.append(f"release/{identifier}: published fields differ from frozen input")
                if collection == "nodes":
                    approved, proposed = item.get("approved_fields", []), item.get("proposed_fields", [])
                    if set(approved) != set(expected) or len(approved) != len(set(approved)):
                        errors.append(f"release/{identifier}: approved_fields differ from adoption evidence")
                    if set(proposed) != set(actual) - set(expected) or len(proposed) != len(set(proposed)):
                        errors.append(f"release/{identifier}: proposed_fields do not cover the unapproved fields")
                    state = item.get("review", {}).get("state")
                    fully_adopted = (bool(expected)
                                     and (item.get("kind") != "capability" or {"name", "definition", "finality", "nature"} <= set(expected))
                                     and set(expected) == set(actual)
                                     and all(decisions[a].get("interpretation") == "explicit" for a in adoption_ids if a in decisions))
                    if (state == "accepted" and not fully_adopted) or (state == "partial" and not expected) or (state == "proposed" and expected):
                        errors.append(f"release/{identifier}: validation status contradicts adoption evidence")
                elif item.get("review", {}).get("state") != (original.get("review", {}).get("state") if expected else "proposed"):
                    errors.append(f"release/{identifier}: relation review state contradicts frozen adoption status")
                if collection == "relations" and item.get("review", {}).get("state") == "accepted" and set(expected) != set(actual):
                    errors.append(f"release/{identifier}: accepted relation requires approval of its qualification and endpoints")
            for field in set(actual) & set(expected):
                if canonical_sha256(actual[field]) != expected[field]:
                    errors.append(f"release/{identifier}/{field}: adopted value hash mismatch")
            if collection == "relations" and item.get("review", {}).get("state") == "under_review":
                if not (item.get("source_id") == "D01" and item.get("target_id") == "D02.c" and {"U75", "U78"} <= adoption_sources):
                    errors.append(f"release/{identifier}: under_review relation lacks its retained adoption and review evidence")
            if collection == "nodes":
                missing = set(item.get("missing_fields", []))
                if missing & set(actual):
                    errors.append(f"release/{identifier}: fields are both present and missing")
    if release.get("principles", []) != snapshot.get("principles", []):
        errors.append("release/principles: changed from frozen source orientations")
    for key in ('element_versioning', 'revision', 'last_modified', 'content_sha256'):
        if release.get(key) != snapshot.get(key):
            errors.append(f'release/{key}: differs from frozen metadata')
    excluded = _index(release.get("excluded_nodes", []), "excluded_nodes", errors)
    if set(excluded) != set(frozen["nodes"]) - {n["id"] for n in release["nodes"]}:
        errors.append("release/excluded_nodes: exclusion inventory differs from frozen input")
    return errors


def _load(path):
    return read_document(path)


def validate_applicability(document, sources, models, realizations, schema=None):
    errors = validate_contract(document, schema) if schema is not None else []
    if errors:
        return errors
    errors.extend(_source_refs(document, sources, "applicability"))
    contexts = _index(document.get("contexts", []), "applicability/contexts", errors)
    expected_contexts = {
        "beaumanoir-historique": ("as_is", "beaumanoir-historique-si"),
        "boardriders": ("as_is", "boardriders-si"),
        "sarenza": ("as_is", "sarenza-si"),
        "flow-platform": ("target", "flow-urbanism"),
    }
    if set(contexts) != set(expected_contexts):
        errors.append("applicability: exactly the three As Is contexts and FLOW target are required")
    for identifier, context in contexts.items():
        if (context.get("perspective"), context.get("model_id")) != expected_contexts.get(identifier):
            errors.append(f"applicability/{identifier}: context perspective/model mismatch")
    assessments = _index(document.get("assessments", []), "applicability/assessments", errors)
    assessed_keys = set()
    for identifier, assessment in assessments.items():
        context_id = assessment.get("context_id")
        context = contexts.get(context_id)
        subject = assessment.get("subject", {})
        model_key = (subject.get("space"), subject.get("model_id"), subject.get("version"))
        model = models.get(model_key)
        if context is None or assessment.get("perspective") != context.get("perspective"):
            errors.append(f"applicability/{identifier}: assessment/context perspective mismatch")
        nodes = {n["id"]: n for n in model.get("nodes", [])} if model else {}
        node = nodes.get(subject.get("node_id"))
        if node is None or node.get("kind") not in ("domain", "area", "capability"):
            errors.append(f"applicability/{identifier}: subject is not a domain/area/capability in the referenced model version")
        key = (*model_key, subject.get("node_id"), context_id)
        if key in assessed_keys:
            errors.append(f"applicability/{identifier}: duplicate assessment for subject/version/context")
        assessed_keys.add(key)
        status = assessment.get("assessment_status")
        responsibility = assessment.get("realization_responsibility")
        if assessment.get("perspective") == "as_is" and responsibility not in ("unknown", "not_applicable"):
            errors.append(f"applicability/{identifier}: FLOW target responsibility cannot be assigned to an As Is assessment")
        if status == "not_assessed":
            if assessment.get("applicability") != "unknown" or assessment.get("coverage") != "unknown" or assessment.get("realization_refs"):
                errors.append(f"applicability/{identifier}: not_assessed requires unknown applicability/coverage and no realization claim")
            if responsibility not in (("unknown", "not_applicable") if assessment.get("perspective") == "as_is" else ("unknown",)):
                errors.append(f"applicability/{identifier}: not_assessed cannot determine target responsibility")
        elif not assessment.get("source_refs"):
            errors.append(f"applicability/{identifier}: an assessment requires evidence sources")
        if context and context.get("assessment_state") == "not_assessed" and status != "not_assessed":
            errors.append(f"applicability/{identifier}: context is still not_assessed")
        allowed_realizations = (set().union(*realizations.values()) if context_id == "flow-platform"
                                else realizations.get(context_id, set()) | realizations.get("shared", set()))
        for ref in assessment.get("realization_refs", []):
            if ref not in allowed_realizations:
                errors.append(f"applicability/{identifier}: realization {ref} is not a resolved As Is identity in this context")
    return errors


def _pointer(root, base, pointer, errors, hash_key="sha256"):
    target = (base / pointer["path"]).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError(f"pointer escapes project: {pointer['path']}")
    if hashlib.sha256(read_bytes(target)).hexdigest() != pointer.get(hash_key):
        errors.append(f"{target.relative_to(root)}: pointer hash mismatch")
    return target, _load(target)


def validate_decision_review(root, manifest_path, manifest):
    """Optional reassessment evidence is immutable like the other frozen inputs."""
    if 'decision_review' not in manifest:
        return []
    errors = []
    prefix = f"../../revisions/{manifest['version']}/decision-review/"
    expected = {prefix + name for name in ('review.json', 'assessment.yaml', 'transcriptions.json')}
    if set(manifest['decision_review']) != expected:
        return ['release: archived review inventory mismatch']
    for relative, sha in manifest['decision_review'].items():
        _pointer(root, manifest_path.parent, {'path': relative, 'sha256': sha}, errors)
    return errors


def validate_project(root=ROOT):
    root = Path(root).resolve()
    errors, counters = [], {}
    try:
        schemas = root / "modeles/schemas"
        urbanism_schema = _load(schemas / "urbanism.schema.json")
        source_doc = _load(root / "modeles/provenance/source-records.json")
        errors.extend(validate_sources(source_doc))
        sources = _index(source_doc["records"], "sources", errors)
        counters["source_records"] = len(sources)
        backlog = _load(working_path(root / "modeles/backlog"))
        glossary_path = working_path(root / "modeles/backlog", "glossary")
        if glossary_path.exists():
            backlog["glossary"] = _load(glossary_path)
        errors.extend(f"backlog: {e}" for e in validate_urbanism(backlog, sources, urbanism_schema))
        guide_path = root / 'modeles/backlog/atlas-transformation-methodology.yaml'
        if guide_path.exists() and _load(guide_path).get('model_examples'):
            try:
                from .guide_candidate import compile_draft
            except ImportError:
                from guide_candidate import compile_draft
            try:
                compile_draft(root, guide_path)
            except ValueError as exc:
                errors.append('methodology alignment: ' + str(exc))
        counters["backlog_nodes"] = len(backlog["nodes"])
        counters["backlog_capabilities"] = sum(n["kind"] == "capability" for n in backlog["nodes"])
        pointer = resolve_release(root / "modeles/release")
        try:
            from .decision_registry import validate_project_registry
        except ImportError:
            from decision_registry import validate_project_registry
        registry_errors, registry_counters = validate_project_registry(root, sources, pointer['version'])
        errors.extend(registry_errors)
        counters.update(registry_counters)
        release_path, release = _pointer(root, root / "modeles/release", pointer, errors)
        manifest = _load(release_path.parent / "manifest.json")
        errors.extend(validate_decision_review(root, release_path.parent / 'manifest.json', manifest))
        if 'published_modeling_guide' in manifest:
            _pointer(root, release_path.parent, manifest['published_modeling_guide'], errors)
        if manifest.get("model_sha256") != pointer.get("sha256") or manifest.get("version") != release.get("version") or pointer.get("version") != release.get("version"):
            errors.append("release: pointer/manifest/model version or hash mismatch")
        _, snapshot = _pointer(root, release_path.parent, {"path": manifest["input_revision_path"], "sha256": manifest.get("input_revision_sha256")}, errors)
        _, decisions = _pointer(root, release_path.parent, {"path": manifest["decisions_path"], "sha256": manifest.get("decisions_sha256")}, errors)
        release_sources = sources
        if "provenance_path" in manifest:
            _, frozen_sources = _pointer(root, release_path.parent, {"path": manifest["provenance_path"], "sha256": manifest.get("provenance_sha256")}, errors)
            errors.extend(validate_sources(frozen_sources))
            release_sources = _index(frozen_sources["records"], "release_sources", errors)
        decision_schema = schemas / "decisions.schema.json"
        errors.extend(validate_contract(decisions, _load(decision_schema)))
        errors.extend(f"release: {e}" for e in validate_release(release, decisions, snapshot, release_sources, urbanism_schema))
        for key, actual in {
            "node_count": len(release["nodes"]),
            "capability_count": sum(n["kind"] == "capability" for n in release["nodes"]),
            "complete_capability_count": sum(n["kind"] == "capability" and n.get("review", {}).get("state") == "accepted" for n in release["nodes"]),
        }.items():
            counters["release_" + key] = actual
            if manifest.get(key) != actual:
                errors.append(f"release/manifest/{key}: count mismatch")
        counters["adoptions"] = len(decisions["decisions"])
        realizations = _validate_panoramas(root, schemas, sources, errors, counters)
        roadmap = _load(working_path(root / "modeles/backlog", "modeling-roadmap"))
        errors.extend(validate_contract(roadmap, _load(schemas / "modeling-roadmap.schema.json")))
        errors.extend(_source_refs(roadmap, sources, "modeling-roadmap"))
        _index(roadmap.get("extensions", []), "modeling-roadmap/extensions", errors)
        applicability = _load(working_path(root / "modeles/backlog", "applicability"))
        models = {(m["space"], m["model_id"], m["version"]): m for m in (backlog, release)}
        for assessment in applicability.get("assessments", []):
            subject = assessment.get("subject", {})
            key = (subject.get("space"), subject.get("model_id"), subject.get("version"))
            if key not in models and key[0] == "release" and isinstance(key[2], str) and re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}\.[1-9][0-9]*", key[2]):
                historical_dir = root / "modeles/release" / key[2]
                historical_manifest = _load(historical_dir / "manifest.json")
                _, historical = _pointer(root, historical_dir, {"path": historical_manifest.get("model_path", "model.json"), "sha256": historical_manifest["model_sha256"]}, errors)
                if historical.get("model_id") == key[1] and historical.get("version") == key[2]:
                    models[key] = historical
        errors.extend(validate_applicability(applicability, sources, models, realizations, _load(schemas / "applicability.schema.json")))
        counters["applicability_contexts"] = len(applicability["contexts"])
        counters["applicability_assessments"] = len(applicability["assessments"])
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(f"validation could not finish: {exc}")
    return {"errors": errors, "counters": counters}


def _validate_panoramas(root, schemas, sources, errors, counters):
    current = _load(root / "modeles/panorama-as-is/current.json")
    documents, assignments, all_objects = [], {}, {}
    _, shared = _pointer(root, root, current["shared"], errors)
    documents.append(("shared", shared))
    for pointer in current["panoramas"]:
        _, panorama = _pointer(root, root, pointer, errors)
        owner = pointer["model_id"].removesuffix("-si")
        documents.append((owner, panorama))
        for key in ("model_id", "version", "assessment_status"):
            if panorama.get(key) != pointer.get(key):
                errors.append(f"panorama/{owner}: pointer {key} mismatch")
        for collection in PANORAMA_COLLECTIONS:
            if len(panorama.get(collection, [])) != pointer.get("record_counts", {}).get(collection):
                errors.append(f"panorama/{owner}/{collection}: pointer count mismatch")
        if panorama.get("assessment_status") == "not_assessed" and any(panorama.get(k) for k in PANORAMA_COLLECTIONS):
            errors.append(f"panorama/{owner}: not_assessed must not assert an assessed inventory")
        if panorama.get("shared_context") != current.get("shared"):
            errors.append(f"panorama/{owner}: shared context pointer mismatch")
    _, candidates = _pointer(root, root, current["candidates"], errors)
    documents.append(("backlog", candidates))
    counts = Counter()
    panorama_schema = _load(schemas / "panorama.schema.json")
    record_schema = _load(schemas / "panorama-record.schema.json")
    for owner, document in documents:
        if owner != "backlog":
            errors.extend(f"panorama/{owner}: {e}" for e in validate_contract(document, panorama_schema))
        if document.get("version") != current.get("version"):
            errors.append(f"panorama/{owner}: inconsistent version")
        errors.extend(_source_refs(document, sources, f"panorama/{owner}"))
        records = document.get("records", []) if owner == "backlog" else [r for c in PANORAMA_COLLECTIONS for r in document.get(c, [])]
        for record in records:
            identifier = record["id"]
            errors.extend(f"panorama/{identifier}: {e}" for e in validate_contract(record, record_schema))
            if identifier in assignments:
                errors.append(f"panorama/{identifier}: duplicate record assignment")
            assignments[identifier] = owner
            category = record.get("source_category")
            if category not in PANORAMA_COLLECTIONS:
                errors.append(f"panorama/{identifier}: unknown source category")
            counts[category] += 1
            if identifier not in sources:
                errors.append(f"panorama/{identifier}: source record missing")
            else:
                captured = sources[identifier]["captured_text"].strip()
                # Some old captures continue into a following non-record heading.
                # Only the exact complete first section is an admissible fragment.
                first_section = re.split(r"\n## ", captured, maxsplit=1)[0].strip()
                if record.get("source_record_text", "").strip() not in (captured, first_section):
                    errors.append(f"panorama/{identifier}: captured record differs from provenance")
            if category == "objects":
                all_objects[identifier] = record
            if owner != "backlog" and record.get("architecture_intent") != "as_is":
                errors.append(f"panorama/{identifier}: target/need belongs in backlog")
            if record.get("evidence_status") == "observed" and not record.get("observed_at"):
                errors.append(f"panorama/{identifier}: observed evidence needs an observation date")
    if assignments != current.get("record_assignment"):
        errors.append("panorama: record_assignment differs from actual inventories")
    source_paths = {"connaissance/07-composants.md", "connaissance/08-flux.md", "connaissance/10-autorites-information.md", "connaissance/11-responsabilites-decision.md"}
    captured_ids = {key for key, source in sources.items() if source.get("path") in source_paths}
    if set(assignments) != captured_ids:
        errors.append("panorama: inventories do not account for every captured source record")
    if dict(counts) != current.get("source_record_counts"):
        errors.append("panorama: source record counts mismatch")
    for owner, document in documents:
        records = document.get("records", []) if owner == "backlog" else document.get("flows", [])
        for record in records:
            for endpoint in record.get("endpoints", {}).values():
                if endpoint.get("id") is not None and endpoint["id"] not in all_objects:
                    errors.append(f"panorama/{record['id']}: dangling endpoint {endpoint['id']}")
                if endpoint.get("id") is None and not endpoint.get("unresolved_label"):
                    errors.append(f"panorama/{record['id']}: unknown endpoint needs its source label")
    counters["panorama_source_records"] = sum(counts.values())
    counters["panorama_assessed_records"] = sum(owner != "backlog" for owner in assignments.values())
    counters["panorama_pending_records"] = sum(owner == "backlog" for owner in assignments.values())
    return {owner: {record["id"] for record in document.get("objects", [])
                    if record.get("kind") != "unresolved_application_mention"}
            for owner, document in documents if owner != "backlog"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--json", action="store_true", help="print machine-readable results")
    args = parser.parse_args()
    result = validate_project(args.root)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        for key, value in result["counters"].items():
            print(f"{key}: {value}")
        for error in result["errors"]:
            print(f"ERROR: {error}")
        print(f"{'FAILED' if result['errors'] else 'OK'}: {len(result['errors'])} error(s)")
    return 1 if result["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
