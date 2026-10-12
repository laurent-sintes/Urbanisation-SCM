"""Integrity of directed business data sharing, independent of diagram geometry."""


def validate_data_sharing(model):
    errors = []
    glossary = model.get('glossary')
    terms = {t['id'] for t in glossary.get('terms', [])} if isinstance(glossary, dict) else None
    for relation in model.get('relations', []):
        fields = relation.get('fields', {})
        exchange = fields.get('data_exchange')
        path = 'relations/' + relation['id']
        if relation.get('type') != 'shares-data':
            if exchange is not None:
                errors.append(path + ': data_exchange belongs only to shares-data')
            continue
        if relation.get('source_id') == relation.get('target_id'):
            errors.append(path + ': data sharing requires distinct endpoints')
        if not isinstance(fields.get('label'), str) or not fields['label'].strip():
            errors.append(path + ': data sharing needs a content label')
        if not isinstance(exchange, dict):
            errors.append(path + ': data sharing requires data_exchange')
            continue
        if not isinstance(exchange.get('purpose'), str) or not exchange['purpose'].strip():
            errors.append(path + ': data sharing needs a purpose')
        contents = exchange.get('contents')
        if not isinstance(contents, list) or not contents:
            errors.append(path + ': data sharing needs nonempty contents')
            continue
        names = set()
        for content in contents:
            if not isinstance(content, dict):
                errors.append(path + ': invalid content')
                continue
            for field in ('name', 'description'):
                if not isinstance(content.get(field), str) or not content[field].strip():
                    errors.append(path + ': content needs ' + field)
            name = content.get('name')
            if isinstance(name, str):
                if name in names:
                    errors.append(path + ': duplicate content name')
                names.add(name)
            refs = content.get('glossary_refs')
            if not isinstance(refs, list) or not refs or any(not isinstance(ref, str) for ref in refs):
                errors.append(path + ': content needs glossary references')
            elif terms is not None:
                for ref in refs:
                    if ref not in terms:
                        errors.append(path + ': unknown content glossary reference ' + ref)
    return errors
