import tempfile
from pathlib import Path
import unittest
from scripts.structured_io import dumps
from scripts.backlog_delivery import check_delivery


class DeliveryTests(unittest.TestCase):
    def test_principle_delivery_checks_canonical_presence_and_content(self):
        from copy import deepcopy
        from scripts.element_versions import content_hash
        principle = {'id': 'PRINCIPLE-RELATION-DIRECTION',
                     'statement': 'Une fourniture ne porte pas le rôle de dépendance inverse.'}
        original = deepcopy(principle)
        self.model['principles'] = [principle]
        declaration = {'state': 'applied', 'required_catalog': [
            {'collection': 'principles', 'id': principle['id'], 'content_sha256': content_hash(principle)}]}
        (self.folder / 'principles.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        principle['statement'] = 'La direction est indifférente.'
        self.assertTrue(any('catalog mismatch: PRINCIPLE-RELATION-DIRECTION' in error
                            for error in check_delivery(self.root, self.model)[1]))
        # An identically named scenario collection must not satisfy a model principle.
        self.model['scenario_catalog'] = {'principles': [original]}
        self.model['principles'] = []
        self.assertTrue(any('catalog mismatch: PRINCIPLE-RELATION-DIRECTION' in error
                            for error in check_delivery(self.root, self.model)[1]))

    def test_principle_supersession_preserves_other_obligations(self):
        from scripts.element_versions import content_hash
        original = {'id': 'target', 'statement': 'Original attribution'}
        current = dict(original, statement='Corrected attribution')
        other = {'id': 'other', 'statement': 'Keep this principle'}
        same_id_item = {'id': 'target', 'description': 'Keep this information proof'}
        self.model['principles'] = [current, other]
        self.model['information_catalog'] = {'items': [same_id_item]}
        old_path = self.folder / 'old.yaml'
        old_path.write_text(dumps({'publication_delivery': {
            'state': 'applied', 'required_catalog': [
                {'collection': collection, 'id': value['id'], 'content_sha256': content_hash(value)}
                for collection, value in [('principles', original), ('principles', other),
                                          ('information_items', same_id_item)]],
            'required_nodes': [{'id': 'packing', 'fields': {'name': 'Packing Order'}}],
        }}), encoding='utf-8')
        old_bytes = old_path.read_bytes()
        replacement = {'state': 'applied', 'source_refs': ['U1118'], 'required_catalog': [
            {'collection': 'principles', 'id': current['id'], 'content_sha256': content_hash(current)}],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'principles',
                                        'id': 'target', 'fields': ['content_sha256']}]}
        new_path = self.folder / 'new.yaml'
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        self.assertEqual(old_path.read_bytes(), old_bytes)
        for value, field in [(current, 'statement'), (other, 'statement'),
                             (same_id_item, 'description'), (self.model['nodes'][0]['fields'], 'name')]:
            with self.subTest(value=value, field=field):
                before = value[field]
                value[field] = 'Unapproved change'
                self.assertTrue(check_delivery(self.root, self.model)[1])
                value[field] = before
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        replacement['required_catalog'] = []
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertTrue(any('invalid supersession' in error for error in check_delivery(self.root, self.model)[1]))

    def test_information_delivery_checks_items_and_links_separately(self):
        from copy import deepcopy
        from scripts.element_versions import content_hash
        item = {'id': 'PINFO011', 'definition': 'Recognized stock facts', 'review': {'state': 'proposed'}}
        link = {'id': 'PINFOL001', 'from_ref': 'PINFO011', 'to_ref': 'PINFO013', 'meaning': 'Supports a position'}
        self.model['information_catalog'] = {'items': [item], 'links': [link]}
        declaration = {'state': 'applied', 'required_catalog': [
            {'collection': collection, 'id': value['id'], 'content_sha256': content_hash(value)}
            for collection, value in [('information_items', item), ('information_links', link)]]}
        (self.folder / 'information.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        self.assertEqual(item['review']['state'], 'proposed')
        for key, field, value in [('items', 'definition', 'Different facts'), ('links', 'to_ref', 'PINFO099')]:
            with self.subTest(collection=key):
                original = deepcopy(self.model['information_catalog'][key])
                identifier = original[0]['id']
                self.model['information_catalog'][key][0][field] = value
                self.assertTrue(any(f'catalog mismatch: {identifier}' in error
                                    for error in check_delivery(self.root, self.model)[1]))
                self.model['information_catalog'][key] = []
                self.assertTrue(any(f'catalog mismatch: {identifier}' in error
                                    for error in check_delivery(self.root, self.model)[1]))
                self.model['information_catalog'][key] = original
        self.assertEqual(check_delivery(self.root, self.model)[1], [])

    def test_information_supersession_preserves_other_proofs_and_checks_replacement(self):
        from copy import deepcopy
        from scripts.element_versions import content_hash
        for collection, key in [('information_items', 'items'), ('information_links', 'links')]:
            with self.subTest(collection=collection):
                root = self.root / collection
                folder = root / 'modeles/backlog'
                folder.mkdir(parents=True)
                original = {'id': 'target', 'description': 'Original responsibility'}
                current = dict(original, description='Corrected responsibility')
                unrelated = {'id': 'other', 'description': 'Preserve this proof'}
                opposite_key = 'links' if key == 'items' else 'items'
                opposite_collection = 'information_links' if key == 'items' else 'information_items'
                # A matching id in another collection must not be superseded.
                opposite = {'id': 'target', 'description': 'Different collection'}
                model = deepcopy(self.model)
                model['information_catalog'] = {key: [current, unrelated], opposite_key: [opposite]}
                old_path = folder / 'old.yaml'
                old_path.write_text(dumps({'publication_delivery': {'state': 'applied', 'required_catalog': [
                    {'collection': coll, 'id': value['id'], 'content_sha256': content_hash(value)}
                    for coll, value in [(collection, original), (collection, unrelated),
                                        (opposite_collection, opposite)]]}}), encoding='utf-8')
                old_bytes = old_path.read_bytes()
                replacement = {'state': 'applied', 'source_refs': ['U1115'], 'required_catalog': [
                    {'collection': collection, 'id': current['id'], 'content_sha256': content_hash(current)}],
                    'supersedes_requirements': [{'annex': 'old.yaml', 'collection': collection,
                                                'id': current['id'], 'fields': ['content_sha256']}]}
                new_path = folder / 'new.yaml'
                new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
                self.assertEqual(check_delivery(root, model)[1], [])
                self.assertEqual(old_path.read_bytes(), old_bytes)
                for value in [current, unrelated, opposite]:
                    description = value['description']
                    value['description'] = 'Unapproved change'
                    self.assertTrue(any(f'catalog mismatch: {value["id"]}' in error
                                        for error in check_delivery(root, model)[1]))
                    value['description'] = description
                self.assertEqual(check_delivery(root, model)[1], [])
                replacement['required_catalog'] = []
                new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
                self.assertTrue(any('invalid supersession' in error for error in check_delivery(root, model)[1]))

    def test_application_delivery_checks_product_and_si_selection_separately(self):
        from scripts.element_versions import content_hash
        product = {'id': 'product-oms', 'documentation': {'channels': ['online_b2c']}}
        selection = {'id': 'si-oms', 'component_states': [{'used': 'unknown'}]}
        self.model['application_catalog'] = {'products': [product], 'selections': [selection]}
        declaration = {'state': 'applied', 'required_catalog': [
            {'collection': collection, 'id': item['id'], 'content_sha256': content_hash(item)}
            for collection, item in [('application_products', product), ('application_selections', selection)]]}
        (self.folder / 'products.yaml').write_text(dumps({'publication_delivery': declaration}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        selection['component_states'][0]['used'] = 'confirmed'
        self.assertTrue(any('catalog mismatch: si-oms' in error for error in check_delivery(self.root, self.model)[1]))
        selection['component_states'][0]['used'] = 'unknown'
        product['documentation']['channels'] = []
        self.assertTrue(any('catalog mismatch: product-oms' in error for error in check_delivery(self.root, self.model)[1]))

    def test_hotspot_supersession_preserves_old_proof_and_checks_replacement(self):
        from scripts.element_versions import content_hash
        original = {'id': 'HS-008', 'title': 'Assignment'}
        current = {'id': 'HS-008', 'title': 'Backlog management'}
        unrelated = {'id': 'HS-009', 'title': 'Keep this proof'}
        self.model['hotspot_catalog'] = {'hotspots': [current, unrelated]}
        old_path = self.folder / 'old.yaml'
        old_path.write_text(dumps({'publication_delivery': {'state': 'applied', 'required_catalog': [
            {'collection': 'hotspots', 'id': h['id'], 'content_sha256': content_hash(h)}
            for h in [original, unrelated]]}}), encoding='utf-8')
        old_bytes = old_path.read_bytes()
        replacement = {'state': 'applied', 'source_refs': ['U1009'], 'required_catalog': [
            {'collection': 'hotspots', 'id': current['id'], 'content_sha256': content_hash(current)}],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'hotspots',
                                        'id': 'HS-008', 'fields': ['content_sha256']}]}
        new_path = self.folder / 'new.yaml'
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        self.assertEqual(old_path.read_bytes(), old_bytes)
        current['title'] = 'Unapproved change'
        self.assertTrue(any('catalog mismatch: HS-008' in e for e in check_delivery(self.root, self.model)[1]))
        current['title'] = 'Backlog management'
        unrelated['title'] = 'Unrelated change'
        self.assertTrue(any('catalog mismatch: HS-009' in e for e in check_delivery(self.root, self.model)[1]))
        unrelated['title'] = 'Keep this proof'
        replacement['required_catalog'] = []
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertTrue(any('invalid supersession' in e for e in check_delivery(self.root, self.model)[1]))

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

    def test_path_correction_preserves_old_proof_and_checks_replacement(self):
        from scripts.element_versions import content_hash
        old = {'id': 'path', 'description': 'Supply excluding purchases'}
        current = dict(old, description='Supply including planned purchases')
        other = {'id': 'other', 'description': 'Keep this path'}
        self.model['scenario_catalog'] = {'paths': [current, other]}
        old_path = self.folder / 'old.yaml'
        old_path.write_text(dumps({'publication_delivery': {'state': 'applied', 'required_catalog': [
            {'collection': 'paths', 'id': item['id'], 'content_sha256': content_hash(item)}
            for item in [old, other]]}}), encoding='utf-8')
        old_bytes = old_path.read_bytes()
        replacement = {'state': 'applied', 'source_refs': ['U1013'], 'required_catalog': [
            {'collection': 'paths', 'id': 'path', 'content_sha256': content_hash(current)}],
            'supersedes_requirements': [{'annex': 'old.yaml', 'collection': 'paths',
                                        'id': 'path', 'fields': ['content_sha256']}]}
        new_path = self.folder / 'new.yaml'
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertEqual(check_delivery(self.root, self.model)[1], [])
        self.assertEqual(old_path.read_bytes(), old_bytes)
        current['description'] = 'Different scope'
        self.assertTrue(any('catalog mismatch: path' in e for e in check_delivery(self.root, self.model)[1]))
        current['description'] = 'Supply including planned purchases'
        other['description'] = 'Changed unrelated path'
        self.assertTrue(any('catalog mismatch: other' in e for e in check_delivery(self.root, self.model)[1]))
        replacement['required_catalog'] = []
        new_path.write_text(dumps({'publication_delivery': replacement}), encoding='utf-8')
        self.assertTrue(any('invalid supersession' in e for e in check_delivery(self.root, self.model)[1]))

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
