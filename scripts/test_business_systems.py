"""Business-system hierarchy is opt-in and preserves operational ownership."""
from copy import deepcopy
from pathlib import Path
import unittest

from scripts.structured_io import read
from scripts.validate_models import validate_urbanism
from scripts.backlog_delivery import check_delivery
from scripts.render_models import render

ROOT = Path(__file__).resolve().parents[1]


class BusinessSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')
        cls.model['glossary'] = read(ROOT / 'modeles/backlog/glossary.yaml')
        cls.sources = {s['id']: s for s in read(ROOT / 'modeles/provenance/source-records.json')['records']}
        cls.schema = read(ROOT / 'modeles/schemas/urbanism.schema.json')

    def errors(self, model):
        return validate_urbanism(model, self.sources, self.schema)

    def test_complete_structure_and_delivery(self):
        self.assertEqual(self.errors(self.model), [])
        self.assertEqual(check_delivery(ROOT, self.model)[1], [])
        self.assertIn('| beaumanoir-target-universe | Enterprise Architecture | Enterprise Architecture |', render(self.model, 'Fixture'))
        self.assertIn('| system-business-operations | Business Operations | Business System |', render(self.model, 'Fixture'))

    def test_universe_is_single_root_of_the_three_business_systems(self):
        model = deepcopy(self.model)
        universe = next(n for n in model['nodes'] if n['kind'] == 'universe')
        systems = {n['id'] for n in model['nodes'] if n['kind'] == 'business_system'}
        children = {r['target_id'] for r in model['relations'] if r['type'] == 'contains' and r['source_id'] == universe['id']}
        self.assertEqual(children, systems)
        model['relations'] = [r for r in model['relations'] if not (r['source_id'] == universe['id'] and r['target_id'] == 'system-business-operations')]
        self.assertTrue(any('invalid parent for business system' in e for e in self.errors(model)))

    def test_domain_requires_one_explicit_system_parent(self):
        for variant in ('orphan', 'duplicate', 'wrong-kind'):
            with self.subTest(variant=variant):
                model = deepcopy(self.model)
                edge = next(r for r in model['relations'] if r['target_id'] == 'domain-sales')
                if variant == 'orphan':
                    model['relations'].remove(edge)
                elif variant == 'duplicate':
                    model['relations'].append(dict(edge, id='SECOND-PARENT', source_id='system-design-development'))
                else:
                    edge['source_id'] = 'domain-sourcing-procurement'
                self.assertIn('business-system/domain-sales: domain requires exactly one business system parent', self.errors(model))

    def test_system_cannot_adopt_a_capability_directly(self):
        model = deepcopy(self.model)
        edge = next(r for r in model['relations'] if r['target_id'] == 'domain-sales')
        edge['target_id'] = 'D04.i'
        self.assertTrue(any('business system presents only domains' in error for error in self.errors(model)))

    def test_detailed_subdomains_have_explicit_roles(self):
        nodes = {node['id']: node for node in self.model['nodes']}
        detailed_areas = {edge['source_id'] for edge in self.model['relations']
                          if edge['type'] == 'contains' and nodes[edge['source_id']]['kind'] == 'area'
                          and nodes[edge['target_id']]['kind'] in ('business_area', 'capability')}
        self.assertTrue(detailed_areas)
        self.assertEqual([area_id for area_id in sorted(detailed_areas)
                          if not nodes[area_id]['fields'].get('dominant_role')], [])

    def test_subdomain_role_labels_are_english_and_consistent(self):
        expected = {
            'commitments': 'Commitment Management',
            'data-state': 'Data & State',
            'decision-planning': 'Decision & Planning',
            'orchestration': 'Orchestration',
            'policies': 'Configuration Control',
            'processes': 'Process Management',
        }
        for node in self.model['nodes']:
            role = node['fields'].get('dominant_role')
            if role:
                self.assertEqual(role['display_name'], expected[role['id']], node['id'])

    def test_depth_cannot_be_attached_to_a_capability(self):
        model = deepcopy(self.model)
        next(n for n in model['nodes'] if n['id'] == 'D04.i')['fields']['modeling_depth'] = 'domains'
        self.assertTrue(any('modeling_depth requires' in error for error in self.errors(model)))

    def test_delivery_rejects_missing_presentation_edge_and_wrong_kind(self):
        model = deepcopy(self.model)
        model['relations'] = [r for r in model['relations'] if r['target_id'] != 'domain-sales']
        next(n for n in model['nodes'] if n['id'] == 'domain-sales')['kind'] = 'group'
        errors = check_delivery(ROOT, model)[1]
        self.assertTrue(any('missing parent: domain-sales' in e for e in errors))
        self.assertTrue(any('kind mismatch: domain-sales' in e for e in errors))

    def test_historical_model_does_not_require_systems(self):
        legacy = read(ROOT / 'modeles/release/2026-09-19.7/model.yaml')
        self.assertEqual(self.errors(legacy), [])


if __name__ == '__main__':
    unittest.main()
