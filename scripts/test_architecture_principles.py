"""Principle agreements survive publication without widening their approved scope."""
from copy import deepcopy
import json
from pathlib import Path
import unittest

from scripts.architecture_principles import applicable_principles, validate_principles
from scripts.decision_carry import classify_context
from scripts.element_versions import assign_versions
from scripts.json_contract import validate
from scripts.publish_release import compile_snapshot
from scripts.prepare_release import reconcile_decisions, revision_errors
from scripts.record_decision import make_intent, compile_intents, canonical_sha256
from scripts.test_decision_carry import fixture


class ArchitecturePrincipleTests(unittest.TestCase):
    def setUp(self):
        self.decision, self.model = fixture()
        self.model['model_id']='flow-urbanism'
        self.model['principles'] = [{'id':'LOCAL','statement':'Keep a complete context.',
            'source_refs':['U1'], 'revision':1, 'rationale':'Explain the boundary.',
            'scope':{'kind':'targeted','targets':[{'collection':'nodes','id':'peer'}]},
            'references':[{'title':'A source','url':'https://example.test/source'}]}]

    def test_local_normative_change_uses_responsibility_not_adjacent_peer(self):
        after = deepcopy(self.model)
        after['principles'][0]['rationale'] = 'A different business reason.'
        self.assertTrue(classify_context(self.decision,self.model,after)['safe'])
        self.model['principles'][0]['scope']['targets'][0]['id']='area'
        after = deepcopy(self.model)
        after['principles'][0]['statement']='Changed obligation'
        self.assertIn('principles_changed',classify_context(self.decision,self.model,after)['reasons'])

    def test_global_and_unknown_fields_remain_conservative_sources_are_editorial(self):
        self.model['principles'][0]['scope']['kind']='global'
        after=deepcopy(self.model); after['principles'][0]['references']=[{'title':'Corrected source'}]
        self.assertTrue(classify_context(self.decision,self.model,after)['safe'])
        after['principles'][0]['unknown_rule']='New constraint'
        self.assertIn('principles_changed',classify_context(self.decision,self.model,after)['reasons'])
        after=deepcopy(self.model); after['principles'].append({'id':'LEGACY','statement':'New global rule'})
        self.assertIn('principles_changed',classify_context(self.decision,self.model,after)['reasons'])

    def test_capture_materialize_freeze_and_reassess_principle_field_only(self):
        args=dict(intent_id='ADOPT-P',collection='principles',target_id='LOCAL',fields=['statement'],
            source_refs=['U1'],author='Laurent',decided_at='2026-10-23',interpretation='explicit',
            note='Only this statement.',reviewer='Codex')
        intent=make_intent(self.model,{'U1':{}},**args)
        registry={'schema_version':'1.0.0','intents':[intent]}
        snapshot=deepcopy(self.model); snapshot['version']='2026-10-23.999'
        assign_versions(snapshot,self.model)
        decisions=compile_intents(registry,snapshot,[],{'U1':{}})
        self.assertEqual(decisions['decisions'][0]['target']['approved_fields'],['statement'])
        # Compilation copies the exact principles, independent of adoption metadata.
        for item in snapshot['nodes']+snapshot['relations']:
            item.update(review={'state':'proposed','note':''},source_refs=[])
        release=compile_snapshot(snapshot,decisions,snapshot['version'],[])
        self.assertEqual(release['principles'],snapshot['principles'])
        self.assertNotIn('approved_fields',release['principles'][0])
        decision=decisions['decisions'][0]
        after=deepcopy(snapshot); after['principles'][0]['statement']='A new obligation'
        self.assertFalse(classify_context(decision,snapshot,after)['safe'])
        with self.assertRaisesRegex(ValueError,'approved values changed'):
            compile_intents(registry,after,[],{'U1':{}})
        after=deepcopy(snapshot); after['principles'][0]['rationale']='New business scope'
        self.assertFalse(classify_context(decision,snapshot,after)['safe'])

    def test_typed_targets_resolve_and_legacy_stays_global(self):
        self.assertEqual(validate_principles(self.model),[])
        self.model['principles'][0]['scope']['targets'][0]['id']='MISSING'
        self.assertTrue(validate_principles(self.model))
        self.model['principles']=[{'id':'OLD','statement':'Legacy global rule'}]
        self.assertIn('OLD',applicable_principles(self.model,{'cap'}))

    def test_reading_citation_never_widens_normative_scope_or_hides_text_changes(self):
        before = deepcopy(self.model)
        cap = next(n for n in self.model['nodes'] if n['id'] == 'cap')
        cap['fields']['scope'] = '[Explanation](principle:LOCAL)'
        self.assertEqual(applicable_principles(self.model, {'cap'}), {})
        self.assertEqual(self.model['principles'], before['principles'])
        self.assertIn('target_business_changed', classify_context(self.decision, before, self.model)['reasons'])

    def test_schema_reads_old_and_rich_principles_and_rejects_unknown_attributes(self):
        schema=json.loads((Path(__file__).resolve().parents[1]/'modeles/schemas/urbanism.schema.json').read_text(encoding='utf8'))
        contract=schema['properties']['principles']['items']
        legacy={'id':'OLD','statement':'A rule','source_refs':[]}
        self.assertEqual(validate(legacy,contract),[])
        rich={**legacy,'name':'Durable Responsibilities','featured':True,'scope':{'kind':'targeted','targets':[{'collection':'nodes','id':'cap'}]}}
        self.assertEqual(validate(rich,contract),[])
        self.assertTrue(validate({**rich,'unsupported':'unsafe'},contract))

    def test_reconciliation_carries_only_unchanged_approved_values_across_editorial_revision(self):
        before=deepcopy(self.model)
        before.update(version='2026-10-23.1',as_of='2026-10-23')
        assign_versions(before,self.model)
        principle=before['principles'][0]
        decision={'id':'ADOPT-P','decision_state':'accepted','target':{
            'collection':'principles','id':'LOCAL','revision':principle['revision'],
            'approved_fields':['statement'],'value_sha256':{'statement':canonical_sha256(principle['statement'])},
            'import_version':before['version']}}
        after=deepcopy(before); after['version']='2026-10-23.2'
        after['principles'][0]['references'][0]['title']='Corrected title'
        assign_versions(after,before)
        carried,deferred=reconcile_decisions({'decisions':[decision]},after,previous_snapshot=before,stable_ids=True)
        self.assertEqual(deferred,[])
        self.assertEqual(carried['decisions'][0]['target']['approved_fields'],['statement'])
        self.assertEqual(revision_errors(before,after),[])
        after['principles'][0]['statement']='Changed business obligation'
        self.assertTrue(revision_errors(before,{**after,'principles':[{**after['principles'][0],'revision':principle['revision']}]}))
        _,deferred=reconcile_decisions({'decisions':[decision]},after,previous_snapshot=before,stable_ids=True)
        self.assertEqual(deferred[0]['reason'],'approved_value_changed')


if __name__=='__main__': unittest.main()
