"""Indexes for one fixed model; disposable views, never a model authority."""
from collections import defaultdict


class ModelIndex:
    def __init__(self, model):
        self.records = {key: {item['id']: item for item in model.get(key, [])
                             if isinstance(item, dict) and isinstance(item.get('id'), str)}
                        for key in ('nodes', 'relations', 'principles')}
        self.incoming = defaultdict(list)
        self.outgoing = defaultdict(list)
        self.parents = defaultdict(list)
        self.children = defaultdict(list)
        for edge in model.get('relations', []):
            if not isinstance(edge, dict) or not all(isinstance(edge.get(key), str) for key in ('source_id', 'target_id')):
                continue  # Validation reports malformed endpoints independently.
            self.incoming[edge['target_id']].append(edge)
            self.outgoing[edge['source_id']].append(edge)
            if edge.get('type') in ('contains', 'presents'):
                self.parents[edge['target_id']].append(edge)
                self.children[edge['source_id']].append(edge)

    def ancestors(self, identifiers):
        found = set(identifiers)
        pending = list(found)
        while pending:
            for edge in self.parents.get(pending.pop(), ()):
                if edge['source_id'] not in found:
                    found.add(edge['source_id'])
                    pending.append(edge['source_id'])
        return found
