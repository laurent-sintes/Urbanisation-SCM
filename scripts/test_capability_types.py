"""U449/U586 typing contract: opted-in models, historical snapshots preserved."""
from copy import deepcopy
import unittest
from scripts.validate_models import validate_urbanism, CAPABILITY_NATURES
from scripts.structured_io import read
from scripts.display_codes import build_display_index


class CapabilityTypeTests(unittest.TestCase):
    def model(self, nature='action', typing_required=True):
        # This fixture keeps the historical layer contract while isolating typing.
        return {'nodes': [{'id': 'cap', 'kind': 'capability', 'layer': 'transactional', 'fields': {'nature': nature}}],
                'relations': [], 'principles': [{'id': 'PRINCIPLE-CAPABILITY-NATURE'}] if typing_required else []}

    def test_supported_types_include_integration_and_ledger(self):
        expected = {'evaluation', 'ledger', 'integration', 'action', 'management', 'knowledge', 'orchestration', 'planning', 'policy', 'decision'}
        self.assertEqual(CAPABILITY_NATURES, expected)
        for nature in expected:
            with self.subTest(nature=nature):
                self.assertEqual(validate_urbanism(self.model(nature), {}), [])

    def test_missing_or_invalid_type_rejected(self):
        for nature in (None, '', 'calculation', 'Decision', 'Policy', 'policy_strategy'):
            self.assertTrue(any('capability nature' in e for e in validate_urbanism(self.model(nature), {})))

    def test_legacy_models_do_not_gain_a_typing_requirement(self):
        self.assertEqual(validate_urbanism(self.model(None, False), {}), [])
        model = self.model(typing_required=False)
        model['nodes'][0]['fields'] = {'name': 'Supply Policy'}
        before = deepcopy(model)
        self.assertEqual(validate_urbanism(model, {}), [])
        self.assertEqual(model, before)

    def test_category_requirement_is_opt_in_and_does_not_mutate_history(self):
        current = self.model()
        before = deepcopy(current)
        self.assertEqual(validate_urbanism(current, {}), [])
        self.assertEqual(current, before)
        current['principles'].append({'id': 'PRINCIPLE-CAPABILITY-CATEGORY'})
        self.assertTrue(any('capability category' in e for e in validate_urbanism(current, {})))
        current['nodes'][0]['fields']['category'] = {'id': 'integration', 'display_name': 'Intégration', 'order': 10}
        current['nodes'].append({'id': 'behavior', 'kind': 'behavior', 'layer': 'transactional', 'fields': {'name': 'Variant', 'definition': 'A business variant.'}})
        current['relations'].append({'id': 'parent', 'type': 'contains', 'source_id': 'cap', 'target_id': 'behavior'})
        self.assertEqual(validate_urbanism(current, {}), [])

    def test_category_rejects_missing_or_invalid_presentation_values(self):
        valid = {'id': 'reference-visibility', 'display_name': 'Reference Visibility', 'order': 20}
        variants = [None, {}, 'category', {**valid, 'id': 'Not an ID'},
                    {**valid, 'display_name': '  '}, {**valid, 'order': True},
                    {**valid, 'order': '20'}]
        for category in variants:
            with self.subTest(category=category):
                current = self.model()
                current['principles'].append({'id': 'PRINCIPLE-CAPABILITY-CATEGORY'})
                current['nodes'][0]['fields']['category'] = category
                self.assertTrue(any('capability category' in e for e in validate_urbanism(current, {})))

    def test_live_completeness_order_and_typology(self):
        model = read('modeles/backlog/model.yaml')
        nodes = {n['id']: n for n in model['nodes']}
        display = build_display_index(model)
        for node in nodes.values():
            if node['kind'] == 'capability':
                self.assertIn(node['fields'].get('nature'), CAPABILITY_NATURES)
                self.assertTrue(node['fields'].get('category', {}).get('id'))
            if node['kind'] in ('domain', 'area', 'reference'):
                # U783 freezes the displayed order, independently of YAML edge order.
                # Subdomains group categories first, then types within each category.
                groups = {}
                for child_id in display['children'][node['id']]:
                    child = nodes[child_id]
                    if child['kind'] != 'capability':
                        continue
                    category = child['fields'].get('category', {}).get('id') if node['kind'] == 'area' else None
                    groups.setdefault(category, []).append(child['fields']['nature'] == 'decision')
                for category, decisions in groups.items():
                    with self.subTest(parent=node['id'], category=category):
                        self.assertEqual(decisions, sorted(decisions))
        annex = read('modeles/backlog/capability-types-U449.yaml')
        self.assertEqual({item['id'] for item in annex['types']}, CAPABILITY_NATURES)
