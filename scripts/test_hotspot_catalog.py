import copy
from pathlib import Path
import unittest

from scripts.hotspot_catalog import severity_for, validate_catalog
from scripts.structured_io import read
from scripts.publish_release import compile_snapshot


ROOT = Path(__file__).resolve().parents[1]


class HotspotCatalogTests(unittest.TestCase):
    def test_transition_impact_and_consolidated_identity_are_preserved(self):
        items = {h['id']: h for h in self.model['hotspot_catalog']['hotspots']}
        self.assertEqual(items['HS-001']['framing_impact']['scopes'], ['transition'])
        self.assertEqual(items['HS-001']['framing_impact']['targets'], [])
        self.assertEqual(items['HS-011']['consolidated_into'], 'HS-002')
        self.assertFalse(items['HS-011']['visible'])
        self.assertTrue(items['HS-011']['source_refs'])
        self.assertEqual(items['HS-011']['status'], 'validated')
        self.assertFalse(items['HS-002']['resolution']['credible_option_ids'])
        model = copy.deepcopy(self.model)
        model['hotspot_catalog']['hotspots'][0]['framing_impact']['targets'] = ['core_system']
        self.assertTrue(any('model scope' in error for error in validate_catalog(model)))
        model = copy.deepcopy(self.model)
        origin = next(h for h in model['hotspot_catalog']['hotspots'] if h['id'] == 'HS-011')
        origin['consolidated_into'] = 'HS-011'
        self.assertTrue(any('independent hotspot' in error for error in validate_catalog(model)))

    def test_visibility_is_technical_and_strictly_boolean(self):
        model = copy.deepcopy(self.model)
        item = model['hotspot_catalog']['hotspots'][0]
        item['visible'] = False
        self.assertEqual(validate_catalog(model), [])
        self.assertEqual(item['status'], self.model['hotspot_catalog']['hotspots'][0]['status'])
        item['visible'] = 'false'
        self.assertTrue(any('visible' in error for error in validate_catalog(model)))
        item.pop('visible')
        self.assertEqual(validate_catalog(model), [])
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')

    def test_clog_pilot_is_located_on_two_domains(self):
        self.assertEqual(validate_catalog(self.model), [])
        hotspot = next(item for item in self.model['hotspot_catalog']['hotspots'] if item['id'] == 'HS-002')
        self.assertEqual(hotspot['id'], hotspot['origin']['id'])
        self.assertEqual(hotspot['kind'], 'integration')
        self.assertEqual(set(hotspot['location']['node_ids']), {
            'domain-logistics-execution', 'D06'})
        self.assertEqual(hotspot['complexity']['political'], 'XL')
        self.assertEqual(hotspot['complexity']['implementation'], 'L')
        self.assertEqual(hotspot['severity'], severity_for('XL', 'L'))

    def test_matrix_preserves_unknown_complexity(self):
        self.assertEqual(severity_for('S', 'M'), 'M')
        self.assertEqual(severity_for('L', 'L'), 'XL')
        self.assertEqual(severity_for('unassessed', 'XL'), 'unassessed')

    def test_published_matrix_cannot_disagree_with_criticality_calculation(self):
        model = copy.deepcopy(self.model)
        policy = model['hotspot_catalog']['criticality_policy']
        for row, political in enumerate(policy['levels']):
            for column, implementation in enumerate(policy['levels']):
                self.assertEqual(policy['matrix'][row][column], severity_for(political, implementation))
        policy['matrix'][0][0] = 'XL'
        self.assertTrue(any('criticality policy' in error for error in validate_catalog(model)))

    def test_source_candidates_are_integrated_and_subjects_validated_without_forcing_resolution(self):
        from scripts.structured_io import read
        candidates = read(ROOT / 'modeles/backlog/hotspot-source-candidates-U958.yaml')
        hotspots = {item['id']: item for item in self.model['hotspot_catalog']['hotspots']}
        self.assertEqual(len(hotspots), 27)
        self.assertTrue(all(item['status'] == 'validated' for item in hotspots.values()))
        self.assertTrue(all(row['hotspot_id'] in hotspots for row in candidates['integration_map']))
        self.assertEqual(hotspots['HS-018']['framing_impact']['category'], 'to_assess')
        self.assertEqual({item['id'] for item in hotspots.values() if item['framing_impact']['category'] == 'usage'}, {'HS-017', 'HS-030'})
        self.assertTrue(all(item['resolution']['stage'] != 'credible' for item in hotspots.values()))

    def test_first_reviewed_lot_has_three_product_subjects_and_c08_document(self):
        hotspots = {item['id']: item for item in self.model['hotspot_catalog']['hotspots']}
        reviewed = {'HS-001', 'HS-002', 'HS-011', 'HS-003', 'HS-012', 'HS-013', 'HS-006', 'HS-014', 'HS-015', 'HS-007', 'HS-008'}
        self.assertTrue(reviewed.issubset(hotspots))
        self.assertEqual({hotspots[identifier]['origin']['id'] for identifier in ('HS-006', 'HS-014', 'HS-015')},
                         {'C06a', 'C06b', 'C06c'})
        self.assertEqual(hotspots['HS-008']['document_ids'], ['DOC001'])
        self.assertTrue(all(hotspots[identifier]['status'] == 'validated' for identifier in reviewed))

    def test_intra_system_scopes_and_mixed_comparison(self):
        model = copy.deepcopy(self.model)
        hotspot = next(h for h in model['hotspot_catalog']['hotspots'] if h['id'] == 'HS-016')
        gap = hotspot['gap_analysis'][0]
        self.assertEqual(len({o['context_id'] for o in gap['observations_by_context']}), 1)
        self.assertEqual(validate_catalog(model), [])
        other = copy.deepcopy(gap['observations_by_context'][0])
        other['context_id'] = 'boardriders'
        del other['observation_scope']
        gap['observations_by_context'].append(other)
        self.assertEqual(validate_catalog(model), [])
        del gap['observations_by_context'][0]['observation_scope']
        self.assertTrue(any('repeated context requires explicit' in error for error in validate_catalog(model)))

    def test_scope_identity_and_description_are_checked(self):
        model = copy.deepcopy(self.model)
        gap = next(h for h in model['hotspot_catalog']['hotspots'] if h['id'] == 'HS-016')['gap_analysis'][0]
        gap['observations_by_context'][1]['observation_scope']['id'] = gap['observations_by_context'][0]['observation_scope']['id']
        gap['observations_by_context'][0]['observation_scope']['description'] = ' '
        errors = validate_catalog(model)
        self.assertTrue(any('duplicate observation context' in error for error in errors))
        self.assertTrue(any('scope requires identity' in error for error in errors))

    def test_unknown_coverage_and_hypotheses_are_not_promoted(self):
        hotspots = {h['id']: h for h in self.model['hotspot_catalog']['hotspots']}
        # Approval of a problem does not establish installed coverage or a solution.
        for identifier in ('HS-017', 'HS-018'):
            self.assertEqual(hotspots[identifier]['status'], 'validated')
            self.assertEqual(hotspots[identifier]['framing_impact']['evidence_state'], 'documented')
            self.assertTrue(all(o['evidence_state'] == 'hypothesis'
                                for gap in hotspots[identifier]['gap_analysis']
                                for o in gap['observations_by_context']))
        self.assertEqual(hotspots['HS-019']['status'], 'validated')
        self.assertEqual(hotspots['HS-019']['framing_impact']['evidence_state'], 'hypothesis')
        for identifier in ('HS-017', 'HS-018', 'HS-019'):
            if identifier == 'HS-018':
                self.assertEqual(hotspots[identifier]['severity'], 'unassessed')
            else:
                self.assertIn('faible confiance', hotspots[identifier]['complexity']['rationale'])
            self.assertEqual(hotspots[identifier]['resolution']['stage'], 'unassessed')
        for hotspot in hotspots.values():
            if hotspot['id'] == 'HS-008':
                continue  # Existing qualified pilot coverage is preserved, not reset by this extension.
            for gap in hotspot.get('gap_analysis', []):
                self.assertTrue(all(o['system_coverage'] == 'not_assessed' for o in gap['observations_by_context']))

    def test_publication_freezes_catalog_without_backlog_lookup(self):
        snapshot = compile_snapshot(self.model, {'decisions': []}, '2026-10-09.1', ['U922'])
        self.assertEqual(snapshot['hotspot_catalog'], self.model['hotspot_catalog'])
        previous_shape = copy.deepcopy(self.model)
        del previous_shape['hotspot_catalog']
        historical = compile_snapshot(previous_shape, {'decisions': []}, '2026-10-08.1', [])
        self.assertNotIn('hotspot_catalog', historical)

    def test_missing_anchor_and_false_resolution_are_rejected(self):
        model = copy.deepcopy(self.model)
        hotspot = model['hotspot_catalog']['hotspots'][0]
        hotspot['location']['node_ids'][0] = 'absent'
        hotspot['status'] = 'resolved'
        errors = validate_catalog(model)
        self.assertTrue(any('missing anchor' in error for error in errors))
        self.assertTrue(any('require credible resolution stage' in error for error in errors))

    def test_gap_comparison_rejects_false_subject_context_and_option_links(self):
        model = copy.deepcopy(self.model)
        hotspot = next(item for item in model['hotspot_catalog']['hotspots'] if item['id'] == 'HS-008')
        gap = hotspot['gap_analysis'][0]
        gap['subject_node_id'] = 'supply-chain-orchestration'
        gap['observations_by_context'][1]['context_id'] = gap['observations_by_context'][0]['context_id']
        gap['resolution_option_ids'] = ['missing-option']
        hotspot['gap_analysis'].append(copy.deepcopy(gap))
        errors = validate_catalog(model)
        for message in ('gap subject must be', 'duplicate observation context', 'gap resolution option is missing', 'duplicate gap identity'):
            self.assertTrue(any(message in error for error in errors), message)

    def test_legacy_hotspot_without_gap_still_validates(self):
        model = copy.deepcopy(self.model)
        for hotspot in model['hotspot_catalog']['hotspots']:
            hotspot.pop('gap_analysis', None)
        self.assertEqual(validate_catalog(model), [])

    def test_framing_impact_is_independent_and_legacy_optional(self):
        model = copy.deepcopy(self.model)
        for hotspot in model['hotspot_catalog']['hotspots']:
            hotspot.pop('framing_impact', None)
        self.assertEqual(validate_catalog(model), [])
        hotspot = model['hotspot_catalog']['hotspots'][0]
        hotspot['framing_impact'] = {
            'category': 'usage', 'targets': [], 'rationale': 'Trop de manipulations manuelles.',
            'follow_up': 'product_design', 'evidence_state': 'hypothesis', 'source_refs': ['U959'],
        }
        self.assertEqual(validate_catalog(model), [])
        hotspot['framing_impact']['targets'] = ['core_system']
        self.assertTrue(any('cannot declare a model target' in e for e in validate_catalog(model)))
        hotspot['framing_impact']['targets'] = []
        hotspot['framing_impact']['follow_up'] = 'framing'
        self.assertTrue(any('follow-up disagree' in e for e in validate_catalog(model)))

    def test_gap_contract_requires_evidence_and_comparison(self):
        import json
        from jsonschema import Draft202012Validator
        schema = json.loads((ROOT / 'modeles/schemas/urbanism.schema.json').read_text(encoding='utf-8'))['$defs']['hotspotGapAnalysis']
        gap = copy.deepcopy(next(item for item in self.model['hotspot_catalog']['hotspots'] if item['id'] == 'HS-008')['gap_analysis'][0])
        validator = Draft202012Validator(schema)
        self.assertEqual(list(validator.iter_errors(gap)), [])
        del gap['observations_by_context'][0]['evidence_kind']
        gap['observations_by_context'] = gap['observations_by_context'][:1]
        errors = list(validator.iter_errors(gap))
        self.assertTrue(any('evidence_kind' in error.message for error in errors))
        self.assertTrue(any(error.validator == 'minItems' for error in errors))


if __name__ == '__main__':
    unittest.main()
