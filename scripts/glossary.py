"""Explicit inline glossary links and the published terminology catalogue."""
import re
try:
    from .market_comparison import validate_comparisons, validate_inspiration
except ImportError:
    from market_comparison import validate_comparisons, validate_inspiration

LINK = re.compile(r'(?<!\\)\[((?:\\.|[^\]\\\n])+)\]\((glossary|model):([A-Za-z0-9_.-]+)(?:#([A-Za-z0-9_-]+))?\)')


def links(value):
    if isinstance(value, str):
        yield from ((m[2], m[3], m[4]) for m in LINK.finditer(value))
    elif isinstance(value, dict):
        for child in value.values():
            yield from links(child)
    elif isinstance(value, list):
        for child in value:
            yield from links(child)


def references(value):
    yield from ((kind, target) for kind, target, _ in links(value))


def reference_impacts(previous, candidate):
    """Flag statements whose linked vocabulary changed, including term-to-term links."""
    before = {t['id']: t for t in previous.get('glossary', {}).get('terms', [])}
    after = {t['id']: t for t in candidate.get('glossary', {}).get('terms', [])}
    semantic = lambda t: {k: v for k, v in t.items() if k not in ('revision', 'last_modified', 'content_sha256')}
    changed = {key for key in set(before) | set(after) if semantic(before.get(key, {})) != semantic(after.get(key, {}))}
    def affected(value, seen=None):
        seen = set() if seen is None else seen
        found = set()
        for kind, target in references(value):
            if kind != 'glossary' or target in seen:
                continue
            seen.add(target)
            if target in changed:
                found.add(target)
            term = after.get(target, {})
            found.update(affected(term, seen))
            if term.get('alias_of'):
                found.update(affected('[alias](glossary:' + term['alias_of'] + ')', seen))
        return found
    result = []
    for collection in ('nodes', 'relations'):
        for item in candidate.get(collection, []):
            for field in ('fields', 'qualification'):
                impacted = affected(item.get(field, {}))
                if impacted:
                    result.append({'collection': collection, 'id': item['id'], 'field': field,
                                   'changed_terms': sorted(impacted), 'disposition': 'semantic_review_required'})
    return result


def validate(model):
    catalog = model.get('glossary')
    terms = catalog.get('terms', []) if isinstance(catalog, dict) else []
    errors, ids = [], set()
    if catalog is not None and (not isinstance(catalog, dict) or not isinstance(catalog.get('terms'), list)):
        return ['glossary: catalogue with terms required']
    for term in terms:
        if not isinstance(term, dict):
            errors.append('glossary: invalid term')
            continue
        if 'market_comparisons' in term:
            errors.extend(validate_comparisons(term['market_comparisons'], 'glossary/' + str(term.get('id')) + '/market_comparisons'))
        if 'market_inspiration' in term:
            errors.extend(validate_inspiration(term['market_inspiration'], term.get('market_comparisons'),
                                              'glossary/' + str(term.get('id')) + '/market_inspiration'))
        identifier = term.get('id')
        if not isinstance(identifier, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+', identifier) or identifier in ids:
            errors.append('glossary: absent or duplicate term id')
        if isinstance(identifier, str):
            ids.add(identifier)
        for field in ('name', 'short_description', 'definition'):
            if not isinstance(term.get(field), str) or not term[field].strip():
                errors.append(f'glossary/{identifier}: {field} required')
        for field in ('context', 'notes'):
            if field in term and not isinstance(term[field], str):
                errors.append(f'glossary/{identifier}: {field} must be text')
        if not isinstance(term.get('source_refs'), list) or any(not isinstance(ref, str) for ref in term['source_refs']):
            errors.append(f'glossary/{identifier}: source_refs list required')
        review = term.get('review')
        if not isinstance(review, dict) or review.get('state') not in ('proposed', 'under_review', 'accepted', 'partial'):
            errors.append(f'glossary/{identifier}: review state required')
    nodes = {node['id']: node for node in model.get('nodes', [])}
    by_id = {term['id']: term for term in terms if isinstance(term, dict) and isinstance(term.get('id'), str)}
    for identifier, term in by_id.items():
        if 'presentation' in term and term['presentation'] not in ('historical', 'method'):
            errors.append(f'glossary/{identifier}: invalid presentation')
        if term.get('presentation') == 'method' and term.get('guide_section') != 'method':
            errors.append(f'glossary/{identifier}: method destination required')
        if 'guide_section' in term and (term['guide_section'] != 'method' or term.get('presentation') != 'method'):
            errors.append(f'glossary/{identifier}: invalid method destination')
        current, seen = term, {identifier}
        while 'alias_of' in current:
            target = current['alias_of']
            if not isinstance(target, str) or target not in by_id:
                errors.append(f'glossary/{identifier}: unresolved alias')
                break
            if target in seen:
                errors.append(f'glossary/{identifier}: cyclic alias')
                break
            seen.add(target)
            current = by_id[target]
        else:
            if 'alias_of' in term and current.get('presentation'):
                errors.append(f'glossary/{identifier}: alias must resolve to a current term')
    # Current statements only; historical verbatim/provenance is not rewritten.
    texts = [n.get('fields', {}) for n in model.get('nodes', [])]
    texts += [{k: r.get(k) for k in ('fields', 'qualification')} for r in model.get('relations', [])]
    texts += [{k: t.get(k) for k in ('name', 'short_description', 'definition', 'context', 'notes', 'market_inspiration')} for t in terms if isinstance(t, dict)]
    for kind, target, anchor in links(texts):
        if target not in (ids if kind == 'glossary' else nodes):
            errors.append(f'{kind}: unresolved published link {target}')
        elif anchor:
            allowed = {'definition', 'short-description', 'market_comparisons'} if kind == 'glossary' else {'definition', 'finality'}
            if kind == 'model':
                allowed.update(k for k, v in nodes[target].get('fields', {}).items() if k != 'name' and v)
            if anchor not in allowed:
                errors.append(f'{kind}: unresolved section {target}#{anchor}')
    return errors
