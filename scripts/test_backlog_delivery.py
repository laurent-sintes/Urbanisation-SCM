import tempfile
from pathlib import Path
import unittest
from scripts.structured_io import dumps
from scripts.backlog_delivery import check_delivery


class DeliveryTests(unittest.TestCase):
    def test_glossary_delivery_preserves_definitions_and_aliases(self):
        from scripts.record_decision import canonical_sha256
        item = {'id': 'OLD', 'definition': 'A preserved definition.', 'alias_of': 'CURRENT'}
        self.model['glossary'] = {'terms': [item]}
        declaration = {'state': 'applied', 'required_glossary': [{'id': 'OLD', 'field_sha256': {
            k: canonical_sha256(item[k]) for k in ('definition', 'alias_of')}}]}
        (self.folder / 'glossary.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        item['alias_of'] = 'WRONG'
        self.assertTrue(any('glossary field mismatch' in e for e in check_delivery(self.root, self.model)[1]))
        self.model['glossary']['terms'] = []
        self.assertTrue(any('glossary term missing' in e for e in check_delivery(self.root, self.model)[1]))

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = self.root / 'modeles/backlog'
        self.folder.mkdir(parents=True)
        self.model = {'nodes': [{'id': 'packing', 'fields': {'name': 'Packing Order'}}],
                      'relations': [{'type': 'contains', 'source_id': 'services', 'target_id': 'packing'}]}

    def declare(self, state='applied'):
        (self.folder / 'study.yaml').write_text(dumps({'publication_delivery': {
            'state': state, 'summary': 'Packing replaces VAS',
            'required_nodes': [{'id': 'packing', 'fields': {'name': 'Packing Order'}, 'parent': 'services'}],
            'absent_nodes': ['vas']}}), encoding='utf-8')

    def test_complete_delivery(self):
        self.declare()
        rows, errors = check_delivery(self.root, self.model)
        self.assertFalse(errors)
        self.assertEqual(rows[0]['state'], 'applied')

    def test_missing_or_retired_node_blocks(self):
        self.declare()
        self.model['nodes'] = [{'id': 'vas', 'fields': {}}]
        self.assertEqual(len(check_delivery(self.root, self.model)[1]), 2)

    def test_wrong_name_or_parent_blocks(self):
        self.declare()
        self.model['nodes'][0]['fields']['name'] = 'Old'
        self.model['relations'] = []
        self.assertEqual(len(check_delivery(self.root, self.model)[1]), 2)

    def test_pending_is_visible_without_approval(self):
        self.declare('pending')
        self.model['nodes'] = []
        rows, errors = check_delivery(self.root, self.model)
        self.assertEqual(rows[0]['state'], 'pending')
        self.assertFalse(errors)

    def test_empty_applied_declaration_blocks(self):
        (self.folder / 'study.yaml').write_text(dumps({'publication_delivery': {'state': 'applied'}}), encoding='utf-8')
        self.assertTrue(check_delivery(self.root, self.model)[1])

    def test_field_fingerprint_rejects_changed_or_missing_content(self):
        from scripts.record_decision import canonical_sha256
        fields = self.model['nodes'][0]['fields']
        fields['scope'] = 'Tenir la commande sans confirmer automatiquement son exécution.'
        declaration = {'state': 'applied', 'required_nodes': [{'id': 'packing',
            'field_sha256': {'scope': canonical_sha256(fields['scope'])}}]}
        (self.folder / 'scope.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        fields['scope'] += ' Une confirmation artificielle est ajoutée.'
        self.assertIn('field hash mismatch', check_delivery(self.root, self.model)[1][0])
        del fields['scope']
        self.assertIn('field hash mismatch', check_delivery(self.root, self.model)[1][0])

    def test_catalog_delivery_checks_exact_content_without_approval(self):
        from scripts.element_versions import content_hash
        item = {'id': 'scenario', 'title': 'Illustration', 'review': {'state': 'proposed'}}
        self.model['scenario_catalog'] = {'scenarios': [item]}
        declaration = {'state': 'applied', 'required_catalog': [
            {'collection': 'scenarios', 'id': 'scenario', 'content_sha256': content_hash(item)}]}
        (self.folder / 'catalog.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        item['title'] = 'Changed'
        self.assertTrue(check_delivery(self.root, self.model)[1])
        self.assertEqual(item['review']['state'], 'proposed')

    def test_hotspot_delivery_tracks_backlog_item(self):
        from scripts.element_versions import content_hash
        item = {'id': 'HS-003', 'problem': 'Vue de stock à rafraîchir.'}
        self.model['hotspot_catalog'] = {'hotspots': [item]}
        declaration = {'state': 'applied', 'required_catalog': [
            {'collection': 'hotspots', 'id': 'HS-003', 'content_sha256': content_hash(item)}]}
        (self.folder / 'hotspot.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        item['problem'] = 'Sujet différent.'
        self.assertTrue(check_delivery(self.root, self.model)[1])

    def test_exchange_delivery_binds_direction_content_and_retirement(self):
        from copy import deepcopy
        from scripts.record_decision import canonical_sha256
        relation = {'id': 'exchange', 'type': 'shares-data', 'source_id': 'producer', 'target_id': 'receiver',
                    'fields': {'data_exchange': {'contents': [{'name': 'Facts'}], 'purpose': 'Interpret facts'}}}
        declaration = {'state': 'applied', 'required_relations': [{'id': 'exchange', 'type': 'shares-data',
                       'source_id': 'producer', 'target_id': 'receiver',
                       'field_sha256': {'data_exchange': canonical_sha256(relation['fields']['data_exchange'])}}],
                       'absent_relations': ['retired']}
        (self.folder / 'exchange.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.model['relations'] = [relation]
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        for mutate, message in [
            (lambda r: r.update(source_id='receiver', target_id='producer'), 'relation mismatch'),
            (lambda r: r.update(type='relates-to'), 'relation mismatch'),
            (lambda r: r['fields']['data_exchange'].update(purpose='Different responsibility'), 'relation field hash mismatch'),
            (lambda r: r['fields'].clear(), 'relation field hash mismatch'),
        ]:
            with self.subTest(message=message):
                changed = deepcopy(relation)
                mutate(changed)
                self.model['relations'] = [changed]
                self.assertTrue(any(message in e for e in check_delivery(self.root, self.model)[1]))
        self.model['relations'] = []
        self.assertTrue(any('required relation missing' in e for e in check_delivery(self.root, self.model)[1]))
        self.model['relations'] = [relation, dict(relation, id='retired')]
        self.assertTrue(any('retired relation still present' in e for e in check_delivery(self.root, self.model)[1]))
