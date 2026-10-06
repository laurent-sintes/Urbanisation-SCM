import unittest
from scripts.methodology_alignment import validate_examples


class MethodologyAlignmentTests(unittest.TestCase):
    def setUp(self):
        self.model={'nodes':[{'id':'atp','fields':{'name':'ATP','nature':'decision'}}],
                    'relations':[{'type':'contains','source_id':'promising','target_id':'atp'}]}
        self.guide={'model_examples':[{'node_id':'atp','name':'ATP','nature':'decision','parent_id':'promising'}]}

    def test_current_example(self):
        self.assertEqual(validate_examples(self.guide,self.model),[])

    def test_type_parent_and_missing_entity_drift_are_detected(self):
        self.model['nodes'][0]['fields']['nature']='evaluation'
        self.model['relations'][0]['source_id']='elsewhere'
        self.assertEqual(len(validate_examples(self.guide,self.model)),2)
        self.model['nodes']=[]
        self.assertIn('missing node',validate_examples(self.guide,self.model)[0])

    def test_old_explanation_fails_but_source_quote_is_preserved(self):
        old='ATP, CTP et PTP sont de type Evaluation'
        self.guide['sources']=[{'excerpt':old}]
        self.assertEqual(validate_examples(self.guide,self.model),[])
        self.guide['chapters']=[{'text':old}]
        self.assertTrue(validate_examples(self.guide,self.model))
