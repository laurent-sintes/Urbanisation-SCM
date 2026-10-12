"""Address relation business fields individually without approving their siblings."""


def adoption_values(item, collection):
    if not item:
        return {}
    if collection == 'nodes':
        return item.get('fields', {})
    values = dict(item)
    if isinstance(item.get('fields'), dict):
        values.update({'fields.' + key: value for key, value in item['fields'].items()})
    return values
