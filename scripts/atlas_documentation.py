"""Separate a frozen combined guide into publication-owned documents."""

from copy import deepcopy


METAMODEL_CHAPTERS = {'metamodel', 'method'}
TRANSFORMATION_CHAPTERS = {'start', 'explore', 'decisions', 'transform', 'sustain', 'references'}


def separate_documentation(guide_response, model):
    """Return independent metamodel and transformation views of one frozen edition.

    Older editions without an explicit transformation group retain their guide.
    No live backlog source contributes to either view.
    """
    if guide_response.get('status') != 'available':
        return None, guide_response
    guide = guide_response['guide']
    glossary = guide.get('glossary') or {}
    groups = glossary.get('groups') or []
    transformation_group = next((group for group in groups if group['id'] == 'transformation'), None)
    if not transformation_group:
        return None, guide_response

    transformation_ids = set(transformation_group['term_ids'])
    terms = glossary.get('terms', [])
    meta_terms = [deepcopy(term) for term in terms if term['id'] not in transformation_ids]
    transformation_terms = [deepcopy(term) for term in terms if term['id'] in transformation_ids]
    model_ids = set(glossary.get('model_term_ids', []))
    metamodel_glossary = {
        'terms': meta_terms,
        'model_term_ids': list(glossary.get('model_term_ids', [])),
        'business_terms': [deepcopy(term) for term in model.get('glossary', {}).get('terms', [])
                           if term['id'] in model_ids],
        'aliases': deepcopy(glossary.get('aliases', {})),
        'groups': deepcopy([group for group in groups if group['id'] != 'transformation']),
    }
    metamodel_document = {
        'id': 'flow-atlas-metamodel', 'version': guide['version'],
        'as_of': guide.get('as_of', model.get('as_of', '')),
        'title': 'Métamodèle FLOW',
        'subtitle': 'Objets, relations et règles de lecture de cette publication.',
        'source_refs': deepcopy(guide.get('source_refs', [])),
        'sources': deepcopy(guide.get('sources', [])),
        'chapters': deepcopy([chapter for chapter in guide.get('chapters', [])
                              if chapter['id'] in METAMODEL_CHAPTERS]),
        'lessons': deepcopy(guide.get('lessons', [])),
        'glossary': metamodel_glossary,
    }
    transformation = deepcopy(guide)
    transformation['chapters'] = [chapter for chapter in transformation.get('chapters', [])
                                  if chapter['id'] in TRANSFORMATION_CHAPTERS]
    transformation['lessons'] = []
    transformation['glossary'] = {
        'terms': transformation_terms, 'model_term_ids': [],
        'groups': [deepcopy(transformation_group)],
    }
    return metamodel_document, {**guide_response, 'guide': transformation}
