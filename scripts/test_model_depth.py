"""Declared context depth preserves hierarchy without inventing capabilities."""
from copy import deepcopy
import unittest
from scripts.validate_models import validate_urbanism
from scripts.atlas_metamodel import describe_metamodel


class ContextDepthTests(unittest.TestCase):
    def model(self):
        fields={'name':'Responsibility','definition':'Service','finality':'Result','scope':'Boundary'}
        return {'version':'fixture','nodes':[
            {'id':'supply-chain-orchestration','kind':'domain','fields':dict(fields,modeling_depth='behaviors')},
            {'id':'commerce','kind':'domain','fields':dict(fields,modeling_depth='business_areas')},
            {'id':'sub','kind':'area','fields':deepcopy(fields)},
            {'id':'ba','kind':'business_area','fields':deepcopy(fields)}],
            'relations':[{'id':'sub-parent','type':'presents','source_id':'commerce','target_id':'sub'},
                         {'id':'ba-parent','type':'contains','source_id':'sub','target_id':'ba'}],
            'principles':[{'id':'PRINCIPLE-BUSINESS-AREA'},{'id':'PRINCIPLE-REQUIRED-BUSINESS-AREA'},
                          {'id':'PRINCIPLE-ORCHESTRATION-DETAIL'},{'id':'PRINCIPLE-DOMAIN-INTERACTIONS'}]}

    def test_declared_context_area_can_be_terminal(self):
        self.assertEqual(validate_urbanism(self.model(),{}),[])
        rules=describe_metamodel(self.model(),{'status':'unavailable'})['constraints']
        rule=next(r for r in rules if r['id']=='business-area-children')
        self.assertEqual(rule['cardinality']['context_domain_exception'],
                         {'domain_ids':['commerce'],'children_min':0})

    def test_context_area_does_not_allow_capabilities_or_behaviors(self):
        m=self.model();m['nodes'].append({'id':'cap','kind':'capability','fields':{}})
        m['relations'].append({'id':'cap-parent','type':'contains','source_id':'ba','target_id':'cap'})
        self.assertTrue(any('model-depth/cap:' in e for e in validate_urbanism(m,{})))
        m['nodes'].append({'id':'behavior','kind':'behavior','fields':{}})
        m['relations'].append({'id':'behavior-parent','type':'contains','source_id':'cap','target_id':'behavior'})
        self.assertTrue(any('model-depth/behavior:' in e for e in validate_urbanism(m,{})))

    def test_depth_does_not_propagate_to_other_domains_or_core_empty_areas(self):
        for domain,depth in [('commerce','domains'),('supply-chain-orchestration','behaviors')]:
            m=self.model();m['relations'][0]['source_id']=domain
            next(n for n in m['nodes'] if n['id']==domain)['fields']['modeling_depth']=depth
            self.assertTrue(any('business-area/ba: requires' in e for e in validate_urbanism(m,{})))

    def test_knowledge_link_and_ambiguous_parents_do_not_grant_context_depth(self):
        m=self.model();m['nodes'].append({'id':'finance','kind':'domain','fields':{'modeling_depth':'domains'}})
        m['relations'][0]['source_id']='finance'
        m['relations'].append({'id':'link','type':'depends-on','source_id':'sub','target_id':'commerce','fields':{'label':'Knowledge'}})
        self.assertTrue(any('model-depth/ba:' in e for e in validate_urbanism(m,{})))
        m=self.model();m['relations'].append({'id':'second-parent','type':'presents','source_id':'supply-chain-orchestration','target_id':'sub'})
        self.assertTrue(any('model-depth/ba:' in e for e in validate_urbanism(m,{})))

    def test_business_area_depth_is_domain_only_and_historical_opt_in_is_preserved(self):
        m=self.model();m['nodes'][1]['kind']='business_system'
        self.assertTrue(any('business_areas requires a domain' in e for e in validate_urbanism(m,{})))
        m=self.model();m['principles']=[p for p in m['principles'] if p['id']!='PRINCIPLE-ORCHESTRATION-DETAIL']
        self.assertTrue(any('business-area/ba: requires' in e for e in validate_urbanism(m,{})))


if __name__=='__main__':unittest.main()
