"""Responsibility boundaries, optional depth and historical compatibility."""
from copy import deepcopy
from pathlib import Path
import unittest
from scripts.structured_io import read
from scripts.validate_models import validate_urbanism
from scripts.display_codes import build_display_index
from scripts.backlog_delivery import check_delivery

class BusinessAreaTests(unittest.TestCase):
    def model(self):
        fields = dict(name='Area', definition='Responsibility', finality='Result', scope='Boundary')
        return {'nodes': [dict(id='sub', kind='area', fields=fields),
                          dict(id='ba', kind='business_area', fields=deepcopy(fields)),
                          dict(id='cap', kind='capability', fields={}),
                          dict(id='direct', kind='capability', fields={})],
                'relations': [dict(id='a', type='contains', source_id='sub', target_id='ba'),
                              dict(id='b', type='contains', source_id='ba', target_id='cap'),
                              dict(id='c', type='contains', source_id='sub', target_id='direct')],
                'principles': [{'id':'PRINCIPLE-BUSINESS-AREA'}, {'id':'PRINCIPLE-DOMAIN-INTERACTIONS'}]}

    def test_one_capability_and_optional_depth_are_valid(self):
        self.assertEqual(validate_urbanism(self.model(), {}), [])

    def test_empty_nested_and_duplicate_ownership_are_rejected(self):
        for mode in ('empty', 'nested', 'duplicate', 'category'):
            m = self.model()
            if mode == 'empty': m['relations'].pop(1)
            if mode == 'nested': m['relations'][0]['source_id'] = 'ba'
            if mode == 'duplicate': m['relations'].append(dict(id='d',type='contains',source_id='sub',target_id='cap'))
            if mode == 'category': m['nodes'][2]['fields']['category'] = {'id':'old'}
            with self.subTest(mode=mode): self.assertTrue(validate_urbanism(m, {}))

    def test_reference_link_does_not_create_a_parent(self):
        m = self.model()
        m['nodes'].append(dict(id='ref',kind='reference',fields={}))
        m['relations'].append(dict(id='doc',type='documents-reference',source_id='direct',target_id='ref'))
        self.assertEqual(validate_urbanism(m, {}), [])
        m['display_policy'] = 'typed-tree-v1'
        index = build_display_index(m)
        self.assertEqual(index['codes']['ba'], 'BA-001')
        self.assertEqual(index['children']['ref'], [])

    def test_business_area_knowledge_is_not_a_hierarchy_link(self):
        m = self.model()
        m['relations'].append(dict(id='knowledge',type='provides-knowledge',source_id='ba',target_id='sub'))
        self.assertEqual(validate_urbanism(m, {}), [])
        m['display_policy'] = 'typed-tree-v1'
        self.assertEqual(build_display_index(m)['children']['sub'], ['ba','direct'])

    def test_reference_area_preserves_documentary_kind_and_unique_parent(self):
        m = self.model()
        m['display_policy'] = 'typed-tree-v1'
        m['nodes'][2]['kind'] = 'reference'
        m['relations'][1]['type'] = 'presents'
        self.assertEqual(validate_urbanism(m, {}), [])
        index = build_display_index(m)
        self.assertEqual(index['children']['ba'], ['cap'])
        self.assertTrue(index['codes']['cap'].startswith('REF-'))
        duplicate = dict(id='duplicate', type='presents', source_id='sub', target_id='cap')
        m['relations'].append(duplicate)
        self.assertTrue(validate_urbanism(m, {}))
        m['relations'].pop()
        m['relations'][1]['type'] = 'contains'
        self.assertTrue(validate_urbanism(m, {}))

    def test_live_mapping_is_exhaustive_and_scenarios_remain_capability_based(self):
        root = Path(__file__).resolve().parents[1]
        m = read(root/'modeles/backlog/model.yaml')
        plan = read(root/'modeles/backlog/business-area-migration-U846.yaml')
        retirement = read(root/'modeles/backlog/visibility-scope-U858.yaml')
        nodes = {n['id']:n for n in m['nodes']}
        caps = {i for i,n in nodes.items() if n['kind']=='capability'}
        # U846 remains the historical mapping; U858 explicitly retires eight members.
        initial_caps = {r['capability_id'] for r in plan['capability_mapping']}
        retired = set(retirement['retirement']['nodes'])
        self.assertEqual(len(initial_caps),81)
        self.assertEqual(len(retired),8)
        self.assertLessEqual(retired, initial_caps)
        self.assertEqual(initial_caps - retired, caps)
        self.assertTrue(retired.isdisjoint(nodes))
        from scripts.glossary import references as inline_references
        self.assertNotIn(('model', 'price-book'), set(inline_references(m)))
        split = read(root/'modeles/backlog/operational-reference-areas-U863.yaml')
        references = set(retirement['reference_mapping'].values()) - set(split['retirement']['nodes'])
        references.update(split['replacement']['price-book'])
        self.assertEqual(len(references),9)
        for identifier in references:
            self.assertEqual(nodes[identifier]['kind'],'reference')
        reference_areas = {a['id'] for a in split['areas']}
        self.assertEqual({r['target_id'] for r in m['relations']
                          if r['type']=='contains' and r['source_id']=='business-references'}, reference_areas)
        self.assertEqual({r['target_id'] for r in m['relations']
                          if r['type']=='presents' and r['source_id'] in reference_areas}, references)
        self.assertEqual(sum(n['kind']=='business_area' for n in nodes.values()),17+len(reference_areas))
        self.assertEqual(nodes['subdomain-plans']['kind'],'business_area')
        self.assertTrue(any(r['type']=='contains' and r['source_id']=='D03' and r['target_id']=='subdomain-plans' for r in m['relations']))
        self.assertFalse(any(r['type']=='documents-reference' for r in m['relations']))
        self.assertEqual(check_delivery(root,m)[1],[])
        from scripts.json_contract import validate
        published = deepcopy(m)
        published['space'] = 'release'
        published['display_index'] = build_display_index(published)
        self.assertEqual(validate(published, read(root/'modeles/schemas/urbanism.schema.json')), [])
        for p in m['scenario_catalog']['paths']:
            for s in p['steps']:
                for c in s['contributions']: self.assertIn(c['node_id'],caps)

    def test_historical_categories_still_validate(self):
        m=self.model();m['nodes']=[n for n in m['nodes'] if n['id']!='ba']
        m['relations']=[r for r in m['relations'] if r['id']!='a'];m['relations'][0]['source_id']='sub'
        m['principles']=[{'id':'PRINCIPLE-DOMAIN-INTERACTIONS'},{'id':'PRINCIPLE-CAPABILITY-CATEGORY'}]
        for n in m['nodes'][1:]:n['fields']['category']={'id':'old','display_name':'Historical','order':10}
        self.assertEqual(validate_urbanism(m,{}),[])
