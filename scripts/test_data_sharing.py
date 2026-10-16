"""Model integrity, arbitrary business levels and publication of sharing contents."""
from copy import deepcopy
from pathlib import Path
import unittest

from scripts.structured_io import read
from scripts.validate_models import validate_urbanism
from scripts.element_versions import content_hash
from scripts.publish_release import compile_snapshot
from scripts.render_models import render
from scripts.atlas_metamodel import describe_metamodel

ROOT = Path(__file__).resolve().parents[1]


class DataSharingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = read(ROOT / 'modeles/release/2026-10-12.6/model.yaml')
        cls.schema = read(ROOT / 'modeles/schemas/urbanism.schema.json')
        cls.sources = {s['id']: s for s in read(ROOT / 'modeles/provenance/source-records.json')['records']}

    def fixture(self, source='system-design-development', target='system-business-operations'):
        model = deepcopy(self.base)
        relation = dict(id='REL-TEST-SHARING', revision=1, type='shares-data', source_id=source, target_id=target,
                        fields=dict(label='Définitions produit', data_exchange=dict(purpose='Utiliser les produits.', contents=[
                            dict(name='Product definitions', description='Définitions approuvées.', glossary_refs=['TER052'])])),
                        qualification=dict(meaning='Fournir les définitions.', conditions=[], effects=[]),
                        source_refs=['U979'], review=dict(state='proposed', note='Isolated test fixture.'))
        model['relations'].append(relation)
        return model, relation

    def errors(self, model):
        for relation in model['relations']:
            if relation['type'] == 'shares-data':
                relation['last_modified'] = '2026-10-12T00:00:00Z'
                relation['content_sha256'] = content_hash(relation)
        return validate_urbanism(model, self.sources, self.schema)

    def test_business_levels_are_not_limited_to_systems(self):
        for kind in ['business_system', 'domain', 'area', 'business_area', 'capability', 'behavior', 'reference']:
            ids = [n['id'] for n in self.base['nodes'] if n['kind'] == kind]
            with self.subTest(kind=kind):
                model, _ = self.fixture(ids[0], ids[1])
                self.assertEqual(self.errors(model), [])

    def test_summary_label_is_optional_directed_and_cannot_conflict(self):
        from scripts.data_sharing import validate_data_sharing
        model, relation = self.fixture()
        relation['fields']['summary_label'] = 'Définitions et conditions produit'
        self.assertEqual(self.errors(model), [])
        second = deepcopy(relation)
        second['id'] = 'OTHER-SUMMARY'
        second['fields']['summary_label'] = 'Contradictory summary'
        model['relations'].append(second)
        self.assertTrue(any('conflicting summary' in e for e in validate_data_sharing(model)))
        second['source_id'], second['target_id'] = second['target_id'], second['source_id']
        self.assertEqual(validate_data_sharing(model), [])
        second['fields']['summary_label'] = ' '
        self.assertTrue(any('nonempty' in e for e in validate_data_sharing(model)))

    def test_missing_content_and_same_endpoint_fail(self):
        for mutation, expected in [
            (lambda r: r['fields'].pop('data_exchange'), 'requires data_exchange'),
            (lambda r: r['fields']['data_exchange'].update(contents=[]), 'minItems'),
            (lambda r: r.update(target_id=r['source_id']), 'distinct endpoints'),
            (lambda r: r['fields'].update(label=' '), 'content label'),
            (lambda r: r['fields']['data_exchange']['contents'][0].update(name=' '), 'content needs name'),
            (lambda r: r['fields']['data_exchange']['contents'][0].update(glossary_refs=['TER-UNKNOWN']), 'unknown content glossary'),
            (lambda r: r.update(target_id='unknown-node'), 'dangling'),
        ]:
            model, relation = self.fixture()
            mutation(relation)
            with self.subTest(expected=expected):
                self.assertTrue(any(expected in error for error in self.errors(model)), self.errors(model))

    def test_payload_requires_qualified_relation_and_correct_type(self):
        model, relation = self.fixture()
        relation.pop('qualification')
        self.assertTrue(any('requires qualification' in error for error in self.errors(model)))
        model, relation = self.fixture('plans-ingestion', 'domain-plan')
        relation['type'] = 'provides-knowledge'
        self.assertTrue(any('belongs only' in error for error in self.errors(model)))

    def test_duplicate_content_and_unknown_fields_fail(self):
        model, relation = self.fixture()
        relation['fields']['data_exchange']['contents'].append(deepcopy(relation['fields']['data_exchange']['contents'][0]))
        self.assertTrue(any('duplicate content' in error for error in self.errors(model)))
        model, relation = self.fixture()
        relation['fields']['data_exchange']['contents'][0]['protocol'] = 'not a business field'
        self.assertTrue(any('rejected by false schema' in error for error in self.errors(model)))

    def test_reverse_direction_requires_separate_relation(self):
        model, relation = self.fixture()
        reverse = deepcopy(relation)
        reverse.update(id='REL-TEST-RETURN', source_id=relation['target_id'], target_id=relation['source_id'])
        model['relations'].append(reverse)
        self.assertEqual(self.errors(model), [])
        self.assertEqual(len([r for r in model['relations'] if r['type'] == 'shares-data']), 2)

    def test_content_is_versioned_and_survives_publication(self):
        model, relation = self.fixture()
        before = content_hash(relation)
        published = compile_snapshot(model, {'decisions': []}, '2026-10-12.999', [])
        frozen = next(r for r in published['relations'] if r['id'] == relation['id'])
        self.assertEqual(frozen['fields']['data_exchange'], relation['fields']['data_exchange'])
        meta = describe_metamodel(published, {'status': 'unavailable'})
        sharing = next(r for r in meta['relation_types'] if r['type'] == 'shares-data')
        self.assertEqual(sharing['direction'], 'source_id → target_id')
        self.assertIn({'source_kind': 'area', 'target_kind': 'capability'}, sharing['allowed_endpoints'])
        self.assertIn('Partages de données métier', render(model, 'Test'))
        self.assertIn('Définitions approuvées.', render(model, 'Test'))
        relation['fields']['data_exchange']['contents'][0]['description'] = 'Another business meaning.'
        self.assertNotEqual(content_hash(relation), before)
        self.assertNotEqual(frozen['fields']['data_exchange'], relation['fields']['data_exchange'])

    def test_current_business_lot_preserves_capabilities_and_hierarchy(self):
        backlog = read(ROOT / 'modeles/backlog/model.yaml')
        baseline = {n['id'] for n in self.base['nodes'] if n['kind'] in ['capability', 'behavior']}
        current = {n['id'] for n in backlog['nodes'] if n['kind'] in ('capability', 'behavior')}
        self.assertLessEqual(baseline - {'accounting-interpretation'}, current)
        self.assertTrue({'delivery-release-decision', 'demand-fulfilment-policy-management',
                         'demand-plan-development', 'cap-store-order-preparation-handover',
                         'cap-purchasing-case-coordination'} <= current)
        exchanges = {r['id']: r for r in backlog['relations'] if r['type'] == 'shares-data'}
        expected = {
            'REL-U1091-store-stock-facts-to-inventory': ('cap-store-stock-operations-management', 'D01.f'),
            'REL-U1091-store-preparation-results-to-fulfilment': ('cap-store-order-preparation-handover', 'D07.d'),
            'REL-U1091-supplier-response-to-purchase-order': ('cap-supplier-commitment-follow-up', 'D04.j'),
            'REL-U1091-purchasing-decision-to-purchase-order': ('cap-purchasing-case-coordination', 'D04.j'),
            'REL-U794-PLAN-INGESTION': ('plans-ingestion', 'domain-plan'),
            'REL-U826-planning-data-provision-TO-domain-plan': ('planning-data-provision', 'domain-plan'),
        }
        for ident, endpoints in expected.items():
            with self.subTest(relation=ident):
                self.assertIn(ident, exchanges)
                self.assertEqual((exchanges[ident]['source_id'], exchanges[ident]['target_id']), endpoints)
                self.assertTrue(exchanges[ident]['qualification']['conditions'])
        self.assertEqual(len([r for r in backlog['relations'] if r['source_id'] == 'domain-sourcing-procurement' and r['type'] == 'presents']), 4)


if __name__ == '__main__':
    unittest.main()
