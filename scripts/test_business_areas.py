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

    def test_live_mapping_is_exhaustive_and_scenarios_remain_capability_based(self):
        root = Path(__file__).resolve().parents[1]
        m = read(root/'modeles/backlog/model.yaml')
        plan = read(root/'modeles/backlog/business-area-migration-U846.yaml')
        nodes = {n['id']:n for n in m['nodes']}
        caps = {i for i,n in nodes.items() if n['kind']=='capability'}
        self.assertEqual(len(caps),81)
        self.assertEqual({r['capability_id'] for r in plan['capability_mapping']},caps)
        self.assertEqual(sum(n['kind']=='business_area' for n in nodes.values()),16)
        self.assertEqual(sum(r['type']=='documents-reference' for r in m['relations']),8)
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
