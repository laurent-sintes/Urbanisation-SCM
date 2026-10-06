"""Contracts for optional request origins and behavior reading aspects (U501)."""

from copy import deepcopy
from pathlib import Path
import unittest

from scripts.json_contract import validate as validate_contract
from scripts.publish_release import compile_snapshot
from scripts.render_models import render
from scripts.structured_io import read
from scripts.validate_models import validate_urbanism


ROOT = Path(__file__).resolve().parents[1]


def node(identifier, kind, **fields):
    return {
        'id': identifier, 'revision': 1, 'kind': kind,
        'fields': {'name': identifier, 'definition': 'Description métier.', **fields},
        'source_refs': [], 'source_locator': {'path': 'fixture', 'anchor': identifier},
        'review': {'state': 'proposed', 'note': 'Fixture'},
    }


def model():
    return {
        'version': 'test', 'as_of': '2026-09-19', 'space': 'backlog',
        'nodes': [
            node('area', 'area'),
            node('request', 'capability', nature='action', request_origins=['frontoffice', 'backoffice']),
            node('reaction', 'behavior', nature='process_variant', behavior_aspect='trigger'),
        ],
        'relations': [
            {'id': 'parent', 'type': 'contains', 'source_id': 'area', 'target_id': 'request',
             'review': {'state': 'proposed', 'note': 'Fixture'}, 'revision': 1},
            {'id': 'child', 'type': 'contains', 'source_id': 'request', 'target_id': 'reaction',
             'review': {'state': 'proposed', 'note': 'Fixture'}, 'revision': 1},
        ],
        'principles': [{'id': 'PRINCIPLE-DOMAIN-INTERACTIONS'}],
    }


class RequestMetadataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schema = read(ROOT / 'modeles/schemas/urbanism.schema.json')
        cls.node_schema = {'$ref': '#/$defs/node', '$defs': schema['$defs']}

    def test_one_or_both_origins_and_both_aspects_are_valid(self):
        for origins in (['frontoffice'], ['backoffice'], ['frontoffice', 'backoffice'], ['backoffice', 'frontoffice']):
            for aspect in ('trigger', 'activity'):
                with self.subTest(origins=origins, aspect=aspect):
                    current = model()
                    current['nodes'][1]['fields']['request_origins'] = origins
                    current['nodes'][2]['fields']['behavior_aspect'] = aspect
                    self.assertEqual(validate_urbanism(current, {}), [])
                    for item in current['nodes']:
                        self.assertEqual(validate_contract(item, self.node_schema), [])

    def test_invalid_origins_fail_schema_and_semantic_validation(self):
        for origins in ([], ['frontoffice', 'frontoffice'], ['external'], 'backoffice', None,
                        ['frontoffice', 'backoffice', 'frontoffice'], [['backoffice']]):
            with self.subTest(origins=origins):
                current = model()
                current['nodes'][1]['fields']['request_origins'] = origins
                self.assertTrue(validate_contract(current['nodes'][1], self.node_schema))
                self.assertTrue(any('request_origins' in error for error in validate_urbanism(current, {})))

    def test_invalid_aspects_fail_schema_and_semantic_validation(self):
        for aspect in ('process_variant', 'frontoffice', '', None, ['trigger']):
            with self.subTest(aspect=aspect):
                current = model()
                current['nodes'][2]['fields']['behavior_aspect'] = aspect
                self.assertTrue(validate_contract(current['nodes'][2], self.node_schema))
                self.assertTrue(any('behavior_aspect' in error for error in validate_urbanism(current, {})))

    def test_metadata_belongs_only_to_its_descriptive_level(self):
        for kind in ('domain', 'area', 'reference', 'group', 'capability', 'behavior', 'object', 'document', 'event'):
            for field, value, expected_kind in (
                ('request_origins', ['backoffice'], 'capability'),
                ('behavior_aspect', 'trigger', 'behavior'),
            ):
                if kind == expected_kind:
                    continue
                with self.subTest(kind=kind, field=field):
                    item = node('wrong', kind, **{field: value})
                    self.assertTrue(validate_contract(item, self.node_schema))
                    current = model()
                    current['nodes'].append(item)
                    self.assertTrue(any(field + ' belongs to' in error for error in validate_urbanism(current, {})))

    def test_metadata_does_not_replace_nature(self):
        current = model()
        self.assertEqual(current['nodes'][1]['fields']['nature'], 'action')
        self.assertEqual(current['nodes'][2]['fields']['nature'], 'process_variant')
        current['principles'] += [
            {'id': 'PRINCIPLE-CAPABILITY-NATURE'}, {'id': 'PRINCIPLE-BEHAVIOR-NATURE'},
        ]
        self.assertEqual(validate_urbanism(current, {}), [])
        current['nodes'][1]['fields']['nature'] = 'backoffice'
        current['nodes'][2]['fields']['nature'] = 'trigger'
        errors = validate_urbanism(current, {})
        self.assertTrue(any('capability nature' in error for error in errors))
        self.assertTrue(any('behavior nature' in error for error in errors))

    def test_historical_nodes_remain_valid_without_metadata(self):
        historical = read(ROOT / 'modeles/release/2026-09-13.2/model.json')
        for item in historical['nodes']:
            with self.subTest(identifier=item['id']):
                self.assertNotIn('request_origins', item['fields'])
                self.assertNotIn('behavior_aspect', item['fields'])
                self.assertEqual(validate_contract(item, self.node_schema), [])
        current = model()
        current['nodes'][1]['fields'].pop('request_origins')
        current['nodes'][2]['fields'].pop('behavior_aspect')
        self.assertEqual(validate_urbanism(current, {}), [])

    def test_publication_preserves_explicit_metadata_without_inference(self):
        snapshot = model()
        before = deepcopy(snapshot)
        release = compile_snapshot(snapshot, {'decisions': []}, '2026-09-19.99', ['U501'])
        self.assertEqual(snapshot, before)
        self.assertEqual(release['nodes'][1]['fields']['request_origins'], ['frontoffice', 'backoffice'])
        self.assertEqual(release['nodes'][2]['fields']['behavior_aspect'], 'trigger')
        self.assertIn('request_origins', release['nodes'][1]['proposed_fields'])
        self.assertIn('behavior_aspect', release['nodes'][2]['proposed_fields'])
        self.assertNotIn('request_origins', release['nodes'][0]['fields'])
        self.assertNotIn('behavior_aspect', release['nodes'][1]['fields'])

    def test_reading_view_explains_origins_and_aspects_at_the_same_level(self):
        current = model()
        current['nodes'].append(node('activity', 'behavior', behavior_aspect='activity'))
        current['relations'].append({'id': 'activity-child', 'type': 'contains', 'source_id': 'request',
                                     'target_id': 'activity', 'review': {'state': 'proposed', 'note': 'Fixture'}})
        result = render(current, 'Backlog')
        self.assertIn('sollicitation externe au Domain', result)
        self.assertIn('Frontoffice, Backoffice', result)
        self.assertIn('| Angle de lecture |', result)
        self.assertIn('| reaction | reaction | Déclenchement |', result)
        self.assertIn('| activity | activity | Activité |', result)
        self.assertEqual(result.count('## Comportements — request'), 1)

    def test_reading_view_does_not_invent_missing_metadata(self):
        current = model()
        current['nodes'][1]['fields'].pop('request_origins')
        current['nodes'][2]['fields'].pop('behavior_aspect')
        result = render(current, 'Backlog')
        self.assertNotIn('Origine des demandes', result)
        self.assertNotIn('Angle de lecture', result)
        self.assertIn('| Repère | Élément | Type | Statut | Définition | Finalité | Rattachement |', result)
        self.assertIn('| Repère | Comportement | Statut | Définition |', result)


if __name__ == '__main__':
    unittest.main()
