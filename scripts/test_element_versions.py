from copy import deepcopy
import hashlib
import json
import unittest

try:
    from .element_versions import assign_versions
except ImportError:
    from element_versions import assign_versions


class ElementVersionsTests(unittest.TestCase):
    def model(self):
        return {'model_id':'test', 'nodes':[{'id':'N1','revision':77,'fields':{'name':'Name'},'review':{'state':'proposed'}}],
                'relations':[{'id':'R1','revision':77,'source_id':'N1','target_id':'N1','type':'relates-to'}],
                'principles':[{'id':'P1','statement':'Principle'}]}

    def test_new_unchanged_changed_and_new_element(self):
        first=self.model(); assign_versions(first, {}, '2026-09-13T10:00:00Z')
        for collection in ('nodes','relations','principles'):
            self.assertEqual(first[collection][0]['revision'],1)
        same=self.model(); assign_versions(same, first, '2026-09-13T11:00:00Z')
        self.assertEqual(same,first)
        changed=self.model(); changed['nodes'][0]['fields']['name']='New name'
        changed['relations'][0]['target_id']='N2'
        changed['nodes'].append({'id':'N2','fields':{'name':'Added'}})
        assign_versions(changed,first,'2026-09-13T12:00:00Z')
        self.assertEqual(changed['nodes'][0]['revision'],2)
        self.assertEqual(changed['nodes'][1]['revision'],1)
        self.assertEqual(changed['relations'][0]['last_modified'],'2026-09-13T12:00:00Z')
        self.assertEqual(changed['principles'][0],first['principles'][0])
        self.assertEqual(changed['revision'],2)

    def test_derived_validation_notes_do_not_cause_perpetual_revisions(self):
        first=self.model(); assign_versions(first,{},'2026-09-13T10:00:00Z')
        first['nodes'][0]['review']['note']='Automatically qualified by publisher'
        again=self.model(); assign_versions(again,first,'2026-09-13T11:00:00Z')
        self.assertEqual(again['nodes'][0]['revision'],1)
        self.assertEqual(again['nodes'][0]['last_modified'],'2026-09-13T10:00:00Z')

    def test_source_and_principle_changes_are_versioned(self):
        old=self.model();assign_versions(old,{},'2026-09-13T10:00:00Z')
        new=self.model();new['nodes'][0]['source_refs']=['U120'];new['principles'][0]['statement']='Changed'
        assign_versions(new,old,'2026-09-13T11:00:00Z')
        self.assertEqual(new['nodes'][0]['revision'],2)
        self.assertEqual(new['principles'][0]['revision'],2)
        self.assertEqual(new['relations'],old['relations'])

    def test_legacy_review_state_can_match_published_or_raw_state(self):
        old=self.model();old['nodes'][0]['revision']=1
        published=deepcopy(old);published['nodes'][0]['review']['state']='accepted'
        current=deepcopy(published)
        assign_versions(current,old,'2026-09-13T10:00:00Z',published)
        self.assertEqual(current['nodes'][0]['revision'],1)

    def test_removing_legacy_lifecycle_keeps_business_revisions(self):
        old = self.model()
        old['nodes'][0]['lifecycle'] = {'state': 'ai_proposed'}
        assign_versions(old, {}, '2026-09-13T10:00:00Z')
        node = old['nodes'][0]
        legacy = {key: value for key, value in node.items()
                  if key not in {'revision', 'last_modified', 'content_sha256', 'adoption_ids',
                                 'approved_fields', 'proposed_fields', 'missing_fields'}}
        node['content_sha256'] = hashlib.sha256(json.dumps(legacy, sort_keys=True,
            ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
        old['content_sha256'] = hashlib.sha256(json.dumps({
            'model_id': old['model_id'], 'limitations': [],
            'elements': {collection: [(item['id'], item['content_sha256']) for item in old[collection]]
                         for collection in ('nodes', 'relations', 'principles')}},
            sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
        current = deepcopy(old)
        current['nodes'][0].pop('lifecycle')
        changes = assign_versions(current, old, '2026-09-13T11:00:00Z')
        self.assertEqual(changes, [])
        self.assertEqual(current['nodes'][0]['revision'], old['nodes'][0]['revision'])
        self.assertEqual(current['revision'], old['revision'])

if __name__=='__main__': unittest.main()
