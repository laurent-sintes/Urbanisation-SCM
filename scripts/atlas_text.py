"""Shared French interface resources for the static exporter and local API."""
from functools import lru_cache
import json
from pathlib import Path
import re


CATALOGS = ('ui', 'core', 'server', 'export', 'bootstrap')


def load_resources(root):
    result = {}
    for name in CATALOGS:
        catalog = json.loads((root / f'app/locales/fr/{name}.json').read_bytes())
        duplicates = result.keys() & catalog.keys()
        if duplicates:
            raise ValueError('Duplicate text resources: ' + ', '.join(sorted(duplicates)))
        result.update(catalog)
    return result


@lru_cache(maxsize=1)
def resources():
    return load_resources(Path(__file__).resolve().parents[1])


def text(key, **parameters):
    template = resources()[key]
    if isinstance(template, dict):
        template = template['one' if 0 <= parameters['count'] < 2 else 'other']

    def replace(match):
        if match.group(0) == '{{':
            return '{'
        if match.group(0) == '}}':
            return '}'
        return str(parameters[match.group(1)])

    return re.sub(r'\{\{|\}\}|\{([\w$]+)\}', replace, template)


class ReaderError(ValueError):
    def __init__(self, code, **parameters):
        self.code = code
        self.parameters = {key: value if key == 'count' and isinstance(value, (int, float)) else str(value)
                           for key, value in parameters.items()}
        super().__init__(text(code, **self.parameters))
