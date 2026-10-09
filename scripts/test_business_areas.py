"""Responsibility boundaries, optional depth and historical compatibility."""
from copy import deepcopy
from pathlib import Path
import unittest
from scripts.structured_io import read
from scripts.validate_models import validate_urbanism
from scripts.display_codes import build_display_index

class BusinessAreaTests(unittest.TestCase):
    def test_physical_targets_and_logical_usage_have_distinct_responsibility_parents(self):
        root = Path(__file__).resolve().parents[1]
        model = read(root/'modeles/backlog/model.yaml')
        index = build_display_index(model)
        physical = 'ba-physical-stock-configuration-optimization'
        logical = 'ba-policy-optimization'
        self.assertEqual(index['children'][physical], ['D05.a'])
        self.assertEqual(set(index['children'][logical]), {'D05.d', 'D05.h'})
        self.assertIn('D05.c', index['children']['ba-supply-matching'])
        self.assertNotIn('D05.c', index['children'][physical])

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

    def test_required_area_rejects_direct_capability_but_preserves_history(self):
        m = self.model()
        self.assertEqual(validate_urbanism(m, {}), [])
        m['principles'].append({'id': 'PRINCIPLE-REQUIRED-BUSINESS-AREA'})
        self.assertIn('business-area/direct: invalid responsibility parent', validate_urbanism(m, {}))
        m['relations'][2]['source_id'] = 'ba'
        self.assertEqual(validate_urbanism(m, {}), [])
        m['relations'][2]['type'] = 'presents'
        self.assertIn('business-area/direct: invalid responsibility parent', validate_urbanism(m, {}))

    def test_required_area_policy_cannot_bypass_parent_validation(self):
        m = self.model()
        m['principles'] = [{'id': 'PRINCIPLE-REQUIRED-BUSINESS-AREA'}]
        self.assertIn('business-area: required parent policy needs the Business Area principle', validate_urbanism(m, {}))

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

    def test_live_mapping_is_exhaustive_and_scenarios_keep_documentary_contributions(self):
        root = Path(__file__).resolve().parents[1]
        m = read(root/'modeles/backlog/model.yaml')
        plan = read(root/'modeles/backlog/business-area-migration-U846.yaml')
        retirement = read(root/'modeles/backlog/visibility-scope-U858.yaml')
        nodes = {n['id']:n for n in m['nodes']}
        caps = {i for i,n in nodes.items() if n['kind']=='capability'}
        # Preserve the historical mapping; each later retirement must be explicit.
        initial_caps = {r['capability_id'] for r in plan['capability_mapping']}
        retired = set(retirement['retirement']['nodes'])
        self.assertEqual(len(initial_caps),81)
        self.assertEqual(len(retired),8)
        services = read(root/'modeles/backlog/service-management-U874.yaml')
        service_retirements = set(services['retirement']['node_ids'])
        self.assertEqual(service_retirements, {'service-order-document-production'})
        retired.update(service_retirements)
        self.assertLessEqual(retired, initial_caps)
        process_additions = {'BHV082', 'process-intervention', 'process-exception-management',
                             'human-task-management', 'work-assignment', 'work-deadline-management',
                             'process-mining', 'operational-analysis-reporting'}
        credit_lot = read(root/'modeles/backlog/credit-check-decision-U892.yaml')
        self.assertTrue(credit_lot['canonical_model_modified'])
        decision_additions = {credit_lot['recommendation']['candidate_id']}
        correction=read(root/'modeles/backlog/core-reference-credit-boundaries-U895.yaml')
        later_retirements=set(correction['retirement']['node_ids'])
        visibility_fusion=read(root/'modeles/backlog/process-tasks-order-visibility-U909.yaml')
        self.assertEqual(visibility_fusion['publication_delivery']['absent_nodes'], ['order-visibility'])
        later_retirements.update(visibility_fusion['publication_delivery']['absent_nodes'])
        control_references = {'D02.b', 'D19.a', 'D19.b', 'BHV017', 'BHV018', 'BHV019', 'BHV020'}
        self.assertEqual((((initial_caps - retired) | process_additions | decision_additions)-later_retirements)
                         - (control_references & initial_caps), caps)
        self.assertTrue(retired.isdisjoint(nodes))
        from scripts.glossary import references as inline_references
        self.assertNotIn(('model', 'price-book'), set(inline_references(m)))
        split = read(root/'modeles/backlog/operational-reference-areas-U863.yaml')
        references = set(retirement['reference_mapping'].values()) - set(split['retirement']['nodes'])
        references.update(split['replacement']['price-book'])
        # U863 remains evidence of the original nine documentary subjects.
        self.assertEqual(len(references),9)
        references.update({'customer-credit-profile', 'packaging-material-reference',
                           'packaging-specification', 'internal-supplies-equipment-reference'})
        self.assertEqual(len(references),13)
        references.update(control_references)
        self.assertEqual({ident for ident,node in nodes.items() if node['kind']=='reference'}, references)
        for identifier in references:
            self.assertEqual(nodes[identifier]['kind'],'reference')
        common_references = set()
        reference_mapping = {
            'ba-partner-agreement-references': {'D09', 'D11', 'customer-credit-profile'},
            'ba-product-references': {'D08', 'product-price-book', 'D12', 'D16'},
            'ba-service-references': {'D13', 'D14', 'service-price-book'},
            'ba-packaging-references': {'packaging-material-reference', 'packaging-specification'},
            'ba-internal-supplies-equipment-references': {'internal-supplies-equipment-reference'},
            'ba-protection-policies': {'D02.b', 'D19.b', 'BHV017', 'BHV018', 'BHV019', 'BHV020'},
            'ba-service-provider-controls': {'D19.a'},
        }
        reference_areas = set(reference_mapping)
        operational_areas = reference_areas - {'ba-protection-policies', 'ba-service-provider-controls'}
        self.assertEqual(nodes['ba-product-references']['fields']['name'], 'Merchandise References')
        self.assertEqual({r['target_id'] for r in m['relations']
                          if r['type']=='contains' and r['source_id']=='business-references'}, operational_areas)
        self.assertEqual({r['target_id'] for r in m['relations']
                          if r['type']=='presents' and r['source_id']=='business-references'}, common_references)
        for area, expected in reference_mapping.items():
            self.assertEqual({r['target_id'] for r in m['relations']
                              if r['type']=='presents' and r['source_id']==area}, expected)
        self.assertEqual({r['target_id'] for r in m['relations']
                          if r['type']=='presents' and r['source_id'] in reference_areas}, references-common_references)
        self.assertEqual(len(m['nodes']),len(nodes), 'An identity must never be copied into another reference group')
        for ident in references:
            parents = [r for r in m['relations'] if r['target_id']==ident and r['type'] in ('contains','presents')]
            expected_parent = 'business-references' if ident in common_references else next(
                area for area, items in reference_mapping.items() if ident in items)
            self.assertEqual([(r['source_id'],r['type']) for r in parents], [(expected_parent,'presents')],ident)
        self.assertEqual(sum(n['kind']=='business_area' for n in nodes.values()),26+len(operational_areas))  # U911 adds the physical target area.
        for ident in caps:
            parents = [r for r in m['relations'] if r['target_id']==ident and r['type'] in ('contains','presents')]
            self.assertEqual(len(parents), 1, ident)
            self.assertEqual(parents[0]['type'], 'contains', ident)
            self.assertEqual(nodes[parents[0]['source_id']]['kind'], 'business_area', ident)
        self.assertEqual(nodes['subdomain-plans']['kind'],'business_area')
        self.assertTrue(any(r['type']=='contains' and r['source_id']=='D03' and r['target_id']=='subdomain-plans' for r in m['relations']))
        self.assertFalse(any(r['type']=='documents-reference' for r in m['relations']))
        from scripts.json_contract import validate
        published = deepcopy(m)
        published['space'] = 'release'
        published['display_index'] = build_display_index(published)
        self.assertEqual(validate(published, read(root/'modeles/schemas/urbanism.schema.json')), [])
        for p in m['scenario_catalog']['paths']:
            for s in p['steps']:
                for c in s['contributions']: self.assertIn(c['node_id'],caps|references)

    def test_business_references_keep_explicit_dependencies_without_a_common_identity_hub(self):
        root = Path(__file__).resolve().parents[1]
        model = read(root/'modeles/backlog/model.yaml')
        nodes = {node['id']:node for node in model['nodes']}
        new_references = {'customer-credit-profile', 'packaging-material-reference',
                          'packaging-specification', 'internal-supplies-equipment-reference'}
        required = {
            ('relates-to','customer-credit-profile','D09'),
            ('relates-to','packaging-specification','D08'),
            ('relates-to','packaging-specification','packaging-material-reference'),
            *(('supplies-reference','master-data-ingestion',ident) for ident in new_references),
            ('uses-reference','service-order-packing','packaging-material-reference'),
            ('uses-reference','service-order-packing','packaging-specification'),
            ('uses-reference','service-order-receiving','packaging-specification'),
        }
        self.assertNotIn('merchandise-reference',nodes)
        self.assertFalse(any(edge['type']=='relates-to' and edge['source_id'] in
            {'packaging-material-reference','internal-supplies-equipment-reference'} and edge['target_id']=='D08'
            for edge in model['relations']))
        for kind,source,target in required:
            with self.subTest(kind=kind,source=source,target=target):
                links = [edge for edge in model['relations']
                         if (edge['type'],edge['source_id'],edge['target_id'])==(kind,source,target)]
                self.assertEqual(len(links),1,'The dependency must exist once, without a copied link')
                edge = links[0]
                self.assertEqual(nodes[source]['kind'],'reference' if kind=='relates-to' else 'capability')
                self.assertEqual(nodes[target]['kind'],'reference')
                qualification = edge['qualification']
                self.assertEqual(qualification['role'],'needs' if kind=='uses-reference' else 'information')
                self.assertIsInstance(qualification['meaning'],str)
                self.assertTrue(qualification['meaning'].strip())
                for field in ('conditions','effects'):
                    self.assertIsInstance(qualification[field],list)
                    self.assertTrue(qualification[field])
                    self.assertTrue(all(isinstance(value,str) and value.strip() for value in qualification[field]))
        # Knowledge and consumption links must never create extra business parents.
        for ident in new_references|{'D08'}:
            parents = [edge for edge in model['relations']
                       if edge['target_id']==ident and edge['type'] in ('contains','presents')]
            self.assertEqual(len(parents),1,ident)
            self.assertEqual(parents[0]['type'],'presents',ident)
        structural_only = deepcopy(model)
        structural_only['relations'] = [edge for edge in model['relations']
                                       if edge['type'] in ('contains','presents')]
        self.assertEqual(build_display_index(model),build_display_index(structural_only))

    def test_historical_categories_still_validate(self):
        m=self.model();m['nodes']=[n for n in m['nodes'] if n['id']!='ba']
        m['relations']=[r for r in m['relations'] if r['id']!='a'];m['relations'][0]['source_id']='sub'
        m['principles']=[{'id':'PRINCIPLE-DOMAIN-INTERACTIONS'},{'id':'PRINCIPLE-CAPABILITY-CATEGORY'}]
        for n in m['nodes'][1:]:n['fields']['category']={'id':'old','display_name':'Historical','order':10}
        self.assertEqual(validate_urbanism(m,{}),[])
