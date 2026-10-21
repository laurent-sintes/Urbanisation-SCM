import copy
import unittest
from scripts.pedagogy import validate_pedagogy
from scripts.structured_io import read
from scripts.json_contract import validate
from scripts.business_scenarios import validate_scenarios


class PedagogyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read('modeles/backlog/model.yaml')
        cls.schema = read('modeles/schemas/urbanism.schema.json')['$defs']['pedagogicalDescription']

    def test_references_contract_and_rollout_coverage(self):
        self.assertEqual(validate_pedagogy(self.model), [])
        pilots = {'supply-chain-orchestration', 'D01', 'ba-inventory-position-management', 'D08', 'process-ledger', 'process-mining', 'D03.j', 'BHV004'}
        scoped = {n['id'] for n in self.model['nodes'] if n['kind'] in ('business_system', 'domain', 'area', 'business_area')}
        enriched = [n for n in self.model['nodes'] if 'pedagogical_description' in n['fields']]
        self.assertEqual({n['id'] for n in enriched}, scoped | pilots)
        for node in enriched:
            self.assertEqual(validate(node['fields']['pedagogical_description'], self.schema), [])

    def test_absent_editorial_object_preserves_historical_models(self):
        self.assertEqual(validate_pedagogy({'nodes': [{'id': 'old', 'fields': {'definition': 'Texte'}}]}), [])

    def test_identified_illustrations_are_not_shared_scenario_contributions(self):
        for kind in ('reference', 'behavior'):
            node = {'id': 'A', 'kind': kind, 'fields': {'examples': [{'id': 'illustration', 'title': 'Cas', 'situation': 'Situation'}]}}
            self.assertEqual(validate_scenarios({'A': node}), [])
            node['fields']['examples'][0]['contributions'] = [{'node_id': 'A', 'role': 'Contribution'}]
            self.assertTrue(validate_scenarios({'A': node}))

    def test_unknown_refs_duplicate_ids_and_self_distinction_rejected(self):
        for case in ('example', 'market', 'duplicate', 'neighbor', 'result', 'contribution'):
            model = copy.deepcopy(self.model)
            node = next(n for n in model['nodes'] if n['id'] == 'D01')
            block = node['fields']['pedagogical_description']
            if case == 'example': block['example_refs'][0]['example_id'] = 'missing'
            if case == 'market': block['market_comparison_refs'][0]['node_id'] = 'missing'
            if case == 'duplicate': node['fields']['examples'].append(copy.deepcopy(node['fields']['examples'][0]))
            if case == 'neighbor': block['distinctions'][0]['node_id'] = 'D01'
            if case == 'result': node['fields']['examples'][0].pop('outcome')
            if case == 'contribution': block['example_refs'][0]['contribution'] = ''
            self.assertTrue(validate_pedagogy(model), case)

    def test_closed_contract_and_no_array_position_reference(self):
        valid = {'explanation': 'Texte', 'source_refs': ['U1125']}
        self.assertEqual(validate(valid, self.schema), [])
        for extra in ({'index': 0}, {'explanation': ' '}, {'example_refs': [{'node_id': 'D01', 'index': 0}]}):
            self.assertTrue(validate({**valid, **extra}, self.schema))


if __name__ == '__main__':
    unittest.main()
