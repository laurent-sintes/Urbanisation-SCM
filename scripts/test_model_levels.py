"""Domain/Area hierarchy and unchanged historical Universe/Domain publications."""
from copy import deepcopy
from pathlib import Path
import unittest

from scripts.element_versions import assign_versions
from scripts.render_models import render
from scripts.structured_io import read
from scripts.validate_models import validate_urbanism


ROOT = Path(__file__).resolve().parents[1]


class ModelLevelTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # This publication predates the naming decision: its bytes stay frozen.
        cls.legacy = read(ROOT / 'modeles/release/2026-09-19.7/model.yaml')
        cls.sources = {s['id']: s for s in read(ROOT / 'modeles/provenance/source-records.json')['records']}
        cls.schema = read(ROOT / 'modeles/schemas/urbanism.schema.json')

    def modern(self):
        model = deepcopy(self.legacy)
        for node in model['nodes']:
            if node['kind'] == 'domain':
                node['kind'] = 'area'
            elif node.get('group_role') == 'urbanism_level':
                node['kind'] = 'domain'
                node.pop('group_role')
                node.pop('level_ref')
        return model

    def purpose_model(self):
        model = self.modern()
        next(n for n in model['nodes'] if n['id'] == 'business-references')['kind'] = 'area'
        model['principles'].append({'id': 'PRINCIPLE-DOMAIN-PURPOSE', 'statement': 'Purpose fixture', 'source_refs': []})
        for node in model['nodes']:
            if node['kind'] in ('domain', 'area'):
                for field in ('name', 'definition', 'finality', 'scope'):
                    node['fields'].setdefault(field, 'Meaningful fixture value')
        assign_versions(model, {}, now='2026-09-23T00:00:00Z')
        return model

    def test_purpose_contract_accepts_reference_children_and_renders_new_label(self):
        model = self.purpose_model()
        self.assertEqual(validate_urbanism(model, self.sources), [])
        self.assertIn('| business-references | Business References | Purpose |', render(model, 'Purpose'))

    def test_subdomain_contract_preserves_unique_parent_and_historical_label(self):
        model = self.purpose_model()
        next(p for p in model['principles'] if p['id'] == 'PRINCIPLE-DOMAIN-PURPOSE')['id'] = 'PRINCIPLE-DOMAIN-SUBDOMAIN'
        self.assertEqual(validate_urbanism(model, self.sources), [])
        self.assertIn('| business-references | Business References | Sous-domaine |', render(model, 'Subdomain'))
        capability = next(n for n in model['nodes'] if n['kind'] == 'capability')
        model['relations'] = [r for r in model['relations'] if not (r['type'] == 'contains' and r['target_id'] == capability['id'])]
        self.assertTrue(any('capability requires exactly one' in e for e in validate_urbanism(model, self.sources)))
        self.assertIn('| business-references | Business References | Purpose |', render(self.purpose_model(), 'Historical Purpose'))

    def test_purpose_requires_a_nonempty_finality_without_retroactive_rule(self):
        model = self.purpose_model()
        node = next(n for n in model['nodes'] if n['kind'] == 'area')
        node['fields']['finality'] = '  '
        self.assertIn(f"purpose/{node['id']}: finality must be nonempty", validate_urbanism(model, self.sources))
        model['principles'] = [p for p in model['principles'] if p['id'] != 'PRINCIPLE-DOMAIN-PURPOSE']
        self.assertFalse(any(e.startswith('purpose/') for e in validate_urbanism(model, self.sources)))

    def test_purpose_detects_orphan_and_ambiguous_capabilities(self):
        for mode in ('orphan', 'ambiguous'):
            with self.subTest(mode=mode):
                model = self.purpose_model()
                capability = next(n for n in model['nodes'] if n['kind'] == 'capability')
                edge = next(r for r in model['relations'] if r['target_id'] == capability['id'] and r['type'] == 'contains')
                if mode == 'orphan':
                    model['relations'].remove(edge)
                else:
                    other = next(n for n in model['nodes'] if n['kind'] == 'area' and n['id'] != edge['source_id'])
                    duplicate = deepcopy(edge)
                    duplicate.update(id='PURPOSE-AMBIGUITY', source_id=other['id'])
                    duplicate['lifecycle'] = {'state': 'ai_proposed', 'recorded_at': '2026-09-22T00:00:00Z', 'source_refs': []}
                    model['relations'].append(duplicate)
                self.assertIn(f"purpose/{capability['id']}: capability requires exactly one Purpose ancestor", validate_urbanism(model, self.sources))

    def test_historical_schema_and_rendering_keep_the_published_levels(self):
        self.assertEqual(validate_urbanism(self.legacy, self.sources, self.schema), [])
        universe = next(n for n in self.legacy['nodes'] if n['id'] == 'universe-supply')
        self.assertEqual(universe['kind'], 'group')
        self.assertEqual(universe['group_role'], 'urbanism_level')
        output = render(self.legacy, 'Historique')
        self.assertTrue('| universe-supply | Supply Chain Orchestration | universe |' in output)
        self.assertTrue('## D04 — Order Management' in output)

    def test_new_levels_accept_existing_capability_and_business_relationships(self):
        model = self.modern()
        self.assertTrue(any(n['kind'] == 'area' for n in model['nodes']))
        self.assertEqual(validate_urbanism(model, self.sources, self.schema), [])
        self.assertEqual(model['relations'], self.legacy['relations'])
        output = render(model, 'Nouveau')
        self.assertTrue('| universe-supply | Supply Chain Orchestration | Domain |' in output)
        self.assertTrue('| D04 | Order Management | Area |' in output)
        self.assertTrue('## D04 — Order Management' in output)
        self.assertFalse('dont Business References' in output)

    def test_new_domain_does_not_present_a_capability_as_an_area(self):
        model = self.modern()
        relation = next(r for r in model['relations'] if r['source_id'] == 'universe-supply')
        relation['target_id'] = next(n['id'] for n in model['nodes'] if n['kind'] == 'capability')
        errors = validate_urbanism(model, self.sources)
        self.assertTrue(any('domain presents only' in e for e in errors), errors)

    def test_area_cannot_replace_the_capability_parent_of_a_behavior(self):
        model = self.modern()
        behavior_id = next(n['id'] for n in model['nodes'] if n['kind'] == 'behavior')
        relation = next(r for r in model['relations'] if r['target_id'] == behavior_id and r['type'] == 'contains')
        relation['source_id'] = next(n['id'] for n in model['nodes'] if n['kind'] == 'area')
        errors = validate_urbanism(model, self.sources)
        self.assertTrue(any('exactly one capability parent' in e for e in errors), errors)

    def test_authoritative_area_preserves_distinct_references_and_their_capabilities(self):
        model = self.modern()
        area = next(n for n in model['nodes'] if n['id'] == 'business-references')
        original_relations = deepcopy(model['relations'])
        area['kind'] = 'area'
        self.assertEqual(validate_urbanism(model, self.sources, self.schema), [])
        self.assertEqual(model['relations'], original_relations)
        references = {r['target_id'] for r in model['relations']
                      if r['source_id'] == area['id'] and r['type'] == 'presents'}
        self.assertEqual(references, {'D08', 'D09', 'D11', 'D12', 'D13', 'D14'})
        for identifier in references:
            self.assertTrue(any(r['source_id'] == identifier and r['type'] == 'contains'
                                for r in model['relations']))
        self.assertIn('| business-references | Business References | Area |', render(model, 'Area'))

    def test_area_presentation_does_not_introduce_nested_levels_or_bypass_contains(self):
        for target_kind in ('area', 'domain', 'group', 'capability'):
            with self.subTest(target_kind=target_kind):
                model = self.modern()
                area = next(n for n in model['nodes'] if n['id'] == 'business-references')
                area['kind'] = 'area'
                relation = next(r for r in model['relations'] if r['source_id'] == area['id'])
                target = next(n for n in model['nodes'] if n['id'] == relation['target_id'])
                target['kind'] = target_kind
                errors = validate_urbanism(model, self.sources)
                self.assertTrue(any('area presents only references' in e for e in errors), errors)

    def test_kind_changes_create_revisions_without_mutating_the_previous_value(self):
        previous = {'model_id': 'fixture', 'nodes': [{'id': 'D01', 'kind': 'domain', 'fields': {'name': 'Order Management'}}]}
        assign_versions(previous, {}, now='2026-09-19T00:00:00Z')
        current = deepcopy(previous)
        current['nodes'][0]['kind'] = 'area'
        changes = assign_versions(current, previous, now='2026-09-19T01:00:00Z')
        self.assertEqual(current['nodes'][0]['revision'], 2)
        self.assertEqual(previous['nodes'][0]['kind'], 'domain')
        self.assertTrue(any(c['id'] == 'D01' and c['reason'] == 'changed' for c in changes))

    def test_reference_use_and_supply_are_qualified_non_structural_links(self):
        for relation_type in ('uses-reference', 'supplies-reference'):
            with self.subTest(relation_type=relation_type):
                model = self.modern()
                capability = next(n['id'] for n in model['nodes'] if n['kind'] == 'capability')
                relation = {
                    'id': 'REFERENCE-USE', 'revision': 1, 'type': relation_type,
                    'source_id': capability, 'target_id': 'D11', 'source_refs': ['U858'],
                    'review': {'state': 'proposed', 'note': 'Information, pas un parent.'},
                    'qualification': {'meaning': 'Informations contractuelles reçues.',
                                      'conditions': ['Si pertinentes pour la demande.'],
                                      'effects': ['Conserver origine et validité.']},
                    'lifecycle': {'state': 'ai_proposed', 'recorded_at': '2026-10-06T00:00:00Z',
                                  'recorded_by': 'Codex', 'source_refs': ['U858'],
                                  'validated_fields': [], 'value_sha256': {}, 'note': 'Test.'}}
                model['relations'].append(relation)
                assign_versions(model, {}, now='2026-10-06T00:00:00Z')
                self.assertEqual(validate_urbanism(model, self.sources, self.schema), [])
                unqualified = deepcopy(model)
                unqualified['relations'][-1].pop('qualification')
                self.assertTrue(any('requires qualification' in e for e in validate_urbanism(unqualified, self.sources)))
                reversed_link = deepcopy(model)
                reversed_link['relations'][-1].update(source_id='D11', target_id=capability)
                self.assertTrue(any('incompatible endpoint kinds' in e for e in validate_urbanism(reversed_link, self.sources)))

    def test_reference_association_is_qualified_and_does_not_create_a_parent(self):
        model = self.modern()
        relation = {'id': 'REFERENCE-LINK', 'revision': 1, 'type': 'relates-to',
                    'source_id': 'D11', 'target_id': 'D12', 'source_refs': [],
                    'review': {'state': 'proposed', 'note': 'Association métier entre référentiels.'},
                    'qualification': {'meaning': 'Référence une sélection convenue.',
                                      'conditions': ['Lorsqu’elle est convenue.'],
                                      'effects': ['Retrouver son périmètre produit.']}}
        model['relations'].append(relation)
        relation['lifecycle'] = {
            'state': 'ai_proposed', 'recorded_at': '2026-09-19T00:00:00Z',
            'recorded_by': 'Codex', 'source_refs': ['U509'], 'validated_fields': [],
            'value_sha256': {}, 'note': 'Association de test.'}
        assign_versions(model, {}, now='2026-09-19T00:00:00Z')
        self.assertEqual(validate_urbanism(model, self.sources, self.schema), [])
        relation.pop('qualification')
        self.assertTrue(any('requires qualification' in e for e in validate_urbanism(model, self.sources)))
        relation['target_id'] = next(n['id'] for n in model['nodes'] if n['kind'] == 'capability')
        self.assertTrue(any('mixed endpoint kinds' in e for e in validate_urbanism(model, self.sources)))


if __name__ == '__main__':
    unittest.main()
