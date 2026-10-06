"""Check authored examples against the model while compiling a new guide only."""
import json


def validate_examples(guide, model):
    nodes = {n['id']: n for n in model['nodes']}
    parents = {r['target_id']: r['source_id'] for r in model['relations']
               if r['type'] in ('contains', 'presents')}
    errors = []
    for example in guide.get('model_examples', []):
        node = nodes.get(example['node_id'])
        if not node:
            errors.append('Guide example references missing node: ' + example['node_id'])
            continue
        for field in ('name', 'nature'):
            if field in example and node['fields'].get(field) != example[field]:
                errors.append('Guide example differs from model: ' + node['id'] + '.' + field)
        if 'parent_id' in example and parents.get(node['id']) != example['parent_id']:
            errors.append('Guide example parent differs: ' + node['id'])
    # These assertions concern active explanatory content, never historical sources.
    text = json.dumps({'chapters': guide.get('chapters'), 'glossary': guide.get('glossary')}, ensure_ascii=False)
    for obsolete in ('ATP, CTP et PTP sont de type Evaluation',
                     'Promise Selection Decision choisit',
                     'Les catégories regroupent des capacités',
                     'Huit sous-domaines Supply convenus'):
        if obsolete in text:
            errors.append('Obsolete current methodology statement: ' + obsolete)
    return errors
