"""Static export boundaries: explicit index, immutable snapshots, atomic activation."""
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from scripts.export_atlas import export_atlas, encoded
from scripts.structured_io import loads


class StaticExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.release = self.root / 'modeles/release'
        self.output = self.root / 'site/data'
        self.release.mkdir(parents=True)
        entries = []
        for version in ('2026-09-25.1', '2026-09-26.1'):
            folder = self.release / version
            folder.mkdir()
            model = encoded({'space': 'release', 'version': version, 'nodes': [], 'relations': [],
                             'glossary': {'terms': []}, 'source_version': 'archived',
                             'source_files': [{'path': 'evidence.txt', 'sha256': 'a' * 64}]})
            (folder / 'model.json').write_bytes(model)
            descriptor = encoded({'version': version, 'path': version + '/model.json', 'sha256': hashlib.sha256(model).hexdigest()})
            name = version + '.json'
            (self.release / name).write_bytes(descriptor)
            entries.append({'descriptor': name, 'sha256': hashlib.sha256(descriptor).hexdigest()})
        # Current is deliberately NOT the highest version.
        (self.release / 'index.json').write_bytes(encoded({'current': entries[0]['descriptor'], 'publications': entries}))

    def test_explicit_pointer_exact_content_and_idempotent_export(self):
        (self.root / 'modeles/backlog').mkdir()
        (self.root / 'modeles/backlog/model.yaml').write_text('invalid live backlog')
        result = export_atlas(self.root, [self.output])
        self.assertEqual(result['current_version'], '2026-09-25.1')
        catalog = json.loads((self.output / 'index.json').read_bytes())
        for entry in catalog['versions']:
            version = entry['version']
            payload = (self.output / version / 'model.json').read_bytes()
            model = json.loads(payload)
            yaml_payload = (self.output / version / 'model.yaml').read_text(encoding='utf-8')
            self.assertEqual(loads(yaml_payload, '.yaml'), model)
            self.assertEqual(model.pop('sourcePath'), f'modeles/release/{version}/model.json')
            metamodel = model.pop('metamodel')
            self.assertEqual(metamodel['publication_version'], version)
            self.assertEqual(metamodel['methodology']['status'], 'unavailable')
            self.assertEqual(metamodel['node_types'], [])
            self.assertEqual(metamodel['relation_types'], [])
            archived = json.loads((self.release / version / 'model.json').read_bytes())
            self.assertEqual(model, archived)
            self.assertEqual(hashlib.sha256(payload).hexdigest(), entry['model_sha256'])
            self.assertEqual(hashlib.sha256(yaml_payload.encode('utf-8')).hexdigest(), entry['model_yaml_sha256'])
            guide = json.loads((self.output / version / 'guide.json').read_bytes())
            self.assertEqual(guide['publication_version'], version)
            self.assertEqual(guide['status'], 'unavailable')
        before = {p: p.stat().st_mtime_ns for p in self.output.rglob('*') if p.is_file()}
        export_atlas(self.root, [self.output])
        self.assertEqual(before, {p: p.stat().st_mtime_ns for p in before})

    def test_document_asset_is_exported_with_its_publication(self):
        version = '2026-09-25.1'
        payload = b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n'
        digest = hashlib.sha256(payload).hexdigest()
        asset = self.root / 'modeles/documents' / f'{digest}.pdf'
        asset.parent.mkdir(parents=True)
        asset.write_bytes(payload)
        model_path = self.release / version / 'model.json'
        model = json.loads(model_path.read_bytes())
        model['document_catalog'] = {'schema_version': 1, 'source_refs': ['U946'], 'documents': [{
            'id': 'DOC001', 'title': 'Test', 'summary': 'Test', 'context': 'Test', 'category': 'analysis',
            'asset': {'path': f'modeles/documents/{digest}.pdf', 'sha256': digest,
                      'media_type': 'application/pdf'}, 'source_refs': ['U946'],
            'review': {'state': 'proposed', 'note': 'Test'},
        }]}
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as archive:
            archive.writestr('[Content_Types].xml',
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
                '</Types>')
            archive.writestr('ppt/presentation.xml', '<presentation/>')
        presentation = stream.getvalue()
        pptx_digest = hashlib.sha256(presentation).hexdigest()
        pptx_asset = self.root / 'modeles/documents' / f'{pptx_digest}.pptx'
        pptx_asset.write_bytes(presentation)
        model['document_catalog']['documents'].append({
            'id': 'DOC002', 'title': 'Support original', 'summary': 'Test', 'context': 'Test', 'category': 'source',
            'asset': {'path': f'modeles/documents/{pptx_digest}.pptx', 'sha256': pptx_digest,
                      'media_type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'},
            'source_refs': ['U946'], 'review': {'state': 'proposed', 'note': 'Test'},
        })
        model_payload = encoded(model)
        model_path.write_bytes(model_payload)
        descriptor_path = self.release / f'{version}.json'
        descriptor = json.loads(descriptor_path.read_bytes())
        descriptor['sha256'] = hashlib.sha256(model_payload).hexdigest()
        descriptor_payload = encoded(descriptor)
        descriptor_path.write_bytes(descriptor_payload)
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['publications'][0]['sha256'] = hashlib.sha256(descriptor_payload).hexdigest()
        index_path.write_bytes(encoded(index))

        export_atlas(self.root, [self.output])
        self.assertEqual((self.output / version / 'documents/DOC001.pdf').read_bytes(), payload)
        self.assertEqual((self.output / version / 'documents/DOC002.pptx').read_bytes(), presentation)
        self.assertFalse((self.output / '2026-09-26.1/documents/DOC002.pptx').exists())
        asset.write_bytes(b'%PDF-1.4\ntampered')
        with self.assertRaisesRegex(ValueError, 'fingerprint or format differs'):
            export_atlas(self.root, [self.output])

    def test_yaml_and_json_keep_complete_model_metamodel_and_nested_hotspots(self):
        from unittest.mock import patch
        from scripts.structured_io import read
        from scripts import export_atlas as module
        project = Path(__file__).resolve().parents[1]
        version = '2026-09-25.1'
        model_path = self.release / version / 'model.json'
        original = json.loads(model_path.read_bytes())
        catalog = read(project / 'modeles/backlog/model.yaml')['hotspot_catalog']
        hotspot = next(h for h in catalog['hotspots'] if h['id'] == 'HS-008')
        hotspot['visible'] = False
        original.update(hotspot_catalog={**catalog, 'hotspots': [hotspot]},
                        information_catalog={'items': [], 'links': []},
                        arbitrary_published_extension={'unicode': 'Écart été → décision', 'nested': {'kept': True}})
        payload = encoded(original)
        model_path.write_bytes(payload)
        descriptor_path = self.release / f'{version}.json'
        descriptor = json.loads(descriptor_path.read_bytes())
        descriptor['sha256'] = hashlib.sha256(payload).hexdigest()
        descriptor_payload = encoded(descriptor)
        descriptor_path.write_bytes(descriptor_payload)
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['publications'][0]['sha256'] = hashlib.sha256(descriptor_payload).hexdigest()
        index_path.write_bytes(encoded(index))
        schema_path = self.root / 'modeles/schemas/urbanism.schema.json'
        schema_path.parent.mkdir()
        schema = read(project / 'modeles/schemas/urbanism.schema.json')
        schema_path.write_bytes(encoded(schema))
        guide = {'status': 'available', 'guide': {'version': version, 'glossary': {'terms': [
            {'id': 'MOD044', 'name': 'Hotspot', 'definition': 'Sujet à creuser et arbitrer.'},
            {'id': 'MOD045', 'name': 'Gap Analysis', 'definition': 'Comparaison facultative.'}]}}}
        with patch.object(module, '_load_associated_guide', return_value=guide):
            export_atlas(self.root, [self.output])
        downloaded_json = json.loads((self.output / version / 'model.json').read_bytes())
        downloaded_yaml = loads((self.output / version / 'model.yaml').read_text(encoding='utf-8'), '.yaml')
        self.assertEqual(downloaded_json, downloaded_yaml)
        for key, value in original.items():
            self.assertEqual(downloaded_json[key], value, key)
        meta = downloaded_json['metamodel']
        self.assertEqual(meta['hotspot_criticality_policy'], catalog['criticality_policy'])
        self.assertEqual(downloaded_yaml['hotspot_catalog']['sources'], catalog['sources'])
        self.assertEqual(downloaded_yaml['hotspot_catalog']['hotspots'][0]['complexity'], hotspot['complexity'])
        self.assertFalse(downloaded_yaml['hotspot_catalog']['hotspots'][0]['visible'])
        self.assertIn('hotspot_catalog.hotspots.visible', meta['fields'])
        self.assertEqual(meta['snapshot_schema']['properties']['hotspot_catalog']['properties']['hotspots']['items']['properties']['visible']['default'], True)
        self.assertEqual(meta['snapshot_schema'], schema)
        types = {item['path']: item for item in meta['catalog_types']}
        self.assertEqual(types['hotspot_catalog.hotspots']['definition_source'], 'method:MOD044')
        self.assertEqual(types['hotspot_catalog.hotspots.gap_analysis']['definition_source'], 'method:MOD045')
        self.assertEqual(meta['profile']['catalog_counts']['hotspot_catalog.hotspots'], 1)
        self.assertIn('hotspot-gap-optional', {rule['id'] for rule in meta['constraints']})

    def test_incremental_export_reuses_serialization_and_repairs_corrupt_output(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        export_atlas(self.root, [self.output])
        original = (self.output / '2026-09-25.1/model.yaml').read_bytes()
        with patch.object(module, 'dump_yaml', wraps=module.dump_yaml) as dump:
            result = export_atlas(self.root, [self.output])
            self.assertEqual(result['reused_publications'], 2)
            self.assertEqual(dump.call_count, 0)
            (self.output / '2026-09-25.1/model.yaml').write_bytes(b'corrupt')
            result = export_atlas(self.root, [self.output])
            self.assertEqual(result['generated_publications'], 1)
            self.assertEqual(dump.call_count, 1)
        self.assertEqual((self.output / '2026-09-25.1/model.yaml').read_bytes(), original)

    def test_new_destination_reuses_verified_outputs_and_matches_full_export(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        source = self.root / 'app/public/data'
        export_atlas(self.root, [source])
        with patch.object(module, 'dump_yaml', side_effect=AssertionError('unnecessary serialization')):
            result = export_atlas(self.root, [self.output])
        self.assertEqual(result['reused_publications'], 2)
        before = {p.relative_to(self.output): p.read_bytes() for p in self.output.rglob('*') if p.is_file()}
        result = export_atlas(self.root, [self.output], incremental=False)
        self.assertEqual(result['generated_publications'], 2)
        self.assertEqual(before, {p.relative_to(self.output): p.read_bytes() for p in self.output.rglob('*') if p.is_file()})

    def test_historical_metadata_stays_stable_until_explicit_rebuild(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        export_atlas(self.root, [self.output])
        schema = self.root / 'modeles/schemas/urbanism.schema.json'
        schema.parent.mkdir()
        schema.write_bytes(encoded({'title': 'new schema'}))
        self.assertEqual(export_atlas(self.root, [self.output])['generated_publications'], 0)
        with patch.object(module, 'describe_metamodel', side_effect=AssertionError('changed generator must not rebuild verified history')):
            self.assertEqual(export_atlas(self.root, [self.output])['generated_publications'], 0)
        self.assertEqual(export_atlas(self.root, [self.output], incremental=False)['generated_publications'], 2)
        original = module._load_associated_guide
        with patch.object(module, '_load_associated_guide', side_effect=lambda *a: {**original(*a), 'note': 'changed association'}):
            self.assertEqual(export_atlas(self.root, [self.output])['generated_publications'], 2)

    def test_verified_reuse_does_not_parse_published_yaml_and_still_rejects_tampering(self):
        from unittest.mock import patch
        from scripts.release_catalog import PublicationReader
        export_atlas(self.root, [self.output])
        with patch.object(PublicationReader, 'load', side_effect=AssertionError('unnecessary model parsing')):
            self.assertEqual(export_atlas(self.root, [self.output])['reused_publications'], 2)
        path = self.release / '2026-09-25.1/model.json'
        path.write_bytes(path.read_bytes() + b' ')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            export_atlas(self.root, [self.output])

    def test_frontend_mode_refuses_missing_or_corrupt_exports(self):
        with self.assertRaisesRegex(ValueError, 'export missing'):
            export_atlas(self.root, [self.output], require_cached=True)
        export_atlas(self.root, [self.output])
        self.assertEqual(export_atlas(self.root, [self.output], require_cached=True)['reused_publications'], 2)
        (self.output / '2026-09-25.1/guide.json').write_bytes(b'corrupt')
        with self.assertRaisesRegex(ValueError, 'export missing'):
            export_atlas(self.root, [self.output], require_cached=True)

    def test_frontend_mode_checks_the_exact_staged_directory_and_catalog(self):
        source = self.root / 'app/public/data'
        fallback = self.root / 'app/dist/data'
        export_atlas(self.root, [source, fallback])
        (source / 'index.json').write_bytes(b'{}')
        with self.assertRaisesRegex(ValueError, 'catalog'):
            export_atlas(self.root, [], require_cached=True)
        export_atlas(self.root, [source])
        (source / '2026-09-25.1/model.json').write_bytes(b'corrupt')
        with self.assertRaisesRegex(ValueError, 'export missing'):
            export_atlas(self.root, [], require_cached=True)

    def test_corrupt_receipts_are_rebuilt_without_trusting_paths(self):
        export_atlas(self.root, [self.output])
        for invalid in ({'../../evidence.txt': 'a' * 64}, ['model.yaml', 'model.json', 'guide.json']):
            for path in (self.root / '.runtime/atlas-export-receipts').glob('*.json'):
                path.write_bytes(encoded(invalid))
            self.assertEqual(export_atlas(self.root, [self.output])['generated_publications'], 2)

    def test_added_publication_generates_only_the_new_version(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        export_atlas(self.root, [self.output])
        version = '2026-09-27.1'
        folder = self.release / version
        folder.mkdir()
        model = json.loads((self.release / '2026-09-26.1/model.json').read_bytes())
        model['version'] = version
        payload = encoded(model)
        (folder / 'model.json').write_bytes(payload)
        descriptor = encoded({'version': version, 'path': version + '/model.json',
                              'sha256': hashlib.sha256(payload).hexdigest()})
        (self.release / (version + '.json')).write_bytes(descriptor)
        index = json.loads((self.release / 'index.json').read_bytes())
        index['publications'].append({'descriptor': version + '.json', 'sha256': hashlib.sha256(descriptor).hexdigest()})
        index['current'] = version + '.json'
        (self.release / 'index.json').write_bytes(encoded(index))
        with patch.object(module, 'dump_yaml', wraps=module.dump_yaml) as dump:
            result = export_atlas(self.root, [self.output])
        self.assertEqual((result['generated_publications'], result['reused_publications']), (1, 2))
        self.assertEqual(dump.call_count, 1)
        self.assertEqual(json.loads((self.output / 'index.json').read_bytes())['current_version'], version)

    def test_metamodel_describes_object_semantics_and_observed_relations(self):
        from scripts.atlas_metamodel import describe_metamodel
        model = {
            'version': '2026-09-25.1',
            'glossary': {'terms': [{'id': 'TER203', 'name': 'Univers',
                                    'definition': 'Vue de la cible.', 'historical': False}]},
            'nodes': [{'id': 'u', 'kind': 'universe', 'fields': {'name': 'Univers'}},
                      {'id': 's', 'kind': 'business_system'}],
            'relations': [{'id': 'r', 'type': 'contains', 'source_id': 'u', 'target_id': 's'}],
            'principles': [{'id': 'PRINCIPLE-TARGET-UNIVERSE'}],
        }
        guide = {'status': 'available', 'association': {'scope': 'contemporaneous'},
                 'guide': {'version': '2026-09-25.1', 'glossary': {'terms': [
                     {'id': 'MOD022', 'name': 'Business System',
                      'definition': 'Ensemble de [domaines](method:MOD008).'}]}}}
        header = describe_metamodel(model, guide)
        types = {entry['kind']: entry for entry in header['node_types']}
        self.assertEqual(types['universe']['label'], 'Univers')
        self.assertEqual(types['universe']['definition'], 'Vue de la cible.')
        self.assertEqual(types['universe']['definition_source'], 'glossary:TER203')
        self.assertEqual(types['business_system']['definition'], 'Ensemble de domaines.')
        self.assertEqual(types['business_system']['definition_source'], 'method:MOD022')
        self.assertEqual(header['profile']['observed_endpoints']['contains'], [
            {'source_kind': 'universe', 'target_kind': 'business_system', 'count': 1}])
        self.assertEqual(header['profile']['node_counts'], {'business_system': 1, 'universe': 1})
        self.assertIn('Univers', next(rule['rule'] for rule in header['constraints']
                                     if rule['id'] == 'target-universe'))

    def test_metamodel_uses_enterprise_architecture_for_new_guide(self):
        from scripts.atlas_metamodel import describe_metamodel

        model = {'version': 'future', 'nodes': [{'id': 'root', 'kind': 'universe',
                                               'fields': {'name': 'Enterprise Architecture'}}],
                 'relations': [], 'glossary': {'terms': []}}
        guide = {'status': 'available', 'guide': {'version': 'future', 'glossary': {'terms': [
            {'id': 'MOD043', 'name': 'Enterprise Architecture',
             'definition': 'Architecture cible de l’entreprise.'},
        ]}}}
        root_type = describe_metamodel(model, guide)['node_types'][0]
        self.assertEqual(root_type['label'], 'Enterprise Architecture')
        self.assertEqual(root_type['definition'], 'Architecture cible de l’entreprise.')
        self.assertEqual(root_type['definition_source'], 'method:MOD043')

    def test_current_publication_has_semantics_cardinalities_and_schema(self):
        from app.modeling_guide import _load_associated_guide
        from scripts.atlas_metamodel import describe_metamodel
        from scripts.structured_io import read
        from scripts.release_catalog import PublicationReader
        project = Path(__file__).resolve().parents[1]
        reader = PublicationReader(project / 'modeles/release')
        current = reader.catalog()['current_version']
        _, model = reader.load(current)
        guide = _load_associated_guide(project, current)
        schema = read(project / 'modeles/schemas/urbanism.schema.json')
        header = describe_metamodel(model, guide, schema)
        self.assertEqual(header['publication_version'], current)
        self.assertEqual(header['methodology']['status'], 'available')
        self.assertTrue(all(entry['definition'] for entry in header['node_types']))
        self.assertTrue(all(entry['definition'] for entry in header['catalog_types']))
        self.assertEqual(sum(header['profile']['node_counts'].values()), len(model['nodes']))
        self.assertEqual(sum(header['profile']['relation_counts'].values()), len(model['relations']))
        self.assertTrue(all('count' not in entry for entry in header['node_types'] + header['relation_types']))
        rules = {entry['id']: entry for entry in header['constraints']}
        self.assertEqual(rules['capability-parent']['cardinality']['parent'], {'min': 1, 'max': 1})
        self.assertEqual(rules['capability-behaviors']['cardinality']['behavior_children']['allowed'], [0, '2..*'])
        relation_types = {entry['type']: entry for entry in header['relation_types']}
        self.assertEqual(relation_types['contains']['allowed_endpoints'], [
            {'source_kind': 'universe', 'target_kind': 'business_system'},
            {'source_kind': 'area', 'target_kind': 'business_area'},
            {'source_kind': 'business_area', 'target_kind': 'capability'},
            {'source_kind': 'capability', 'target_kind': 'behavior'},
        ])
        self.assertIn('$defs', header['snapshot_schema'])

    def test_corrupt_publication_does_not_activate_partial_export(self):
        export_atlas(self.root, [self.output])
        before = {p: p.read_bytes() for p in self.output.rglob('*.json')}
        (self.release / '2026-09-26.1/model.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            export_atlas(self.root, [self.output])
        self.assertEqual(before, {p: p.read_bytes() for p in before})

    def test_missing_index_is_not_inferred_from_directories(self):
        (self.release / 'index.json').unlink()
        with self.assertRaises(FileNotFoundError):
            export_atlas(self.root, [self.output])
        self.assertFalse(self.output.exists())

    def test_inventory_is_read_once_and_each_model_is_verified_once(self):
        from unittest.mock import patch
        from scripts import release_catalog
        with patch.object(release_catalog, 'descriptors', wraps=release_catalog.descriptors) as inventory, \
                patch.object(release_catalog, '_read_release', wraps=release_catalog._read_release) as models:
            result = export_atlas(self.root, [self.output])
        self.assertEqual(inventory.call_count, 1)
        self.assertEqual(models.call_count, 2)
        self.assertGreaterEqual(result['timings_seconds']['total'], result['timings_seconds']['models'])

    def test_descriptor_change_during_writes_blocks_catalog_activation(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        original = module.atomic_write
        def changed(path, payload):
            if Path(path).name == 'model.json':
                descriptor = self.release / '2026-09-26.1.json'
                descriptor.write_bytes(descriptor.read_bytes() + b' ')
            original(path, payload)
        with patch.object(module, 'atomic_write', side_effect=changed):
            with self.assertRaisesRegex(ValueError, 'descriptor hash mismatch'):
                export_atlas(self.root, [self.output])
        self.assertFalse((self.output / 'index.json').exists())

    def test_warm_parsing_cache_does_not_skip_integrity_checks(self):
        from scripts.structured_io import read
        path = self.release / '2026-09-25.1/model.json'
        expected = hashlib.sha256(path.read_bytes()).hexdigest()
        read(path)
        self.assertEqual(read(path, expected_sha256=expected)['version'], '2026-09-25.1')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            read(path, expected_sha256='0' * 64)
        path.write_bytes(path.read_bytes().replace(b'2026-09-25.1', b'2026-09-25.2'))
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            read(path, expected_sha256=expected)

    def test_missing_model_hash_cannot_disable_verification(self):
        descriptor_path = self.release / '2026-09-25.1.json'
        descriptor = json.loads(descriptor_path.read_bytes())
        descriptor['sha256'] = None
        descriptor_path.write_bytes(encoded(descriptor))
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['publications'][0]['sha256'] = hashlib.sha256(descriptor_path.read_bytes()).hexdigest()
        index_path.write_bytes(encoded(index))
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            export_atlas(self.root, [self.output])
        self.assertFalse(self.output.exists())

    def test_shared_lock_refuses_other_process_and_allows_nested_owner(self):
        import subprocess
        import sys
        from scripts.atlas_lock import atlas_lock
        with atlas_lock(self.root):
            export_atlas(self.root, [self.output])
            child = subprocess.run([sys.executable, '-c',
                'import sys; from pathlib import Path; from scripts.export_atlas import export_atlas; export_atlas(Path(sys.argv[1]))',
                str(self.root)], capture_output=True, text=True)
            self.assertNotEqual(child.returncode, 0)
            self.assertIn('Atlas is being', child.stderr)
        export_atlas(self.root, [self.output])

    def test_pointer_change_during_writes_refuses_old_catalog_activation(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        original = module.atomic_write
        def changed(path, payload):
            if Path(path).name == 'model.json':
                index_path = self.release / 'index.json'
                index = json.loads(index_path.read_bytes())
                index['current'] = '2026-09-26.1.json'
                index_path.write_bytes(encoded(index))
            original(path, payload)
        with patch.object(module, 'atomic_write', side_effect=changed):
            with self.assertRaisesRegex(ValueError, 'before static activation'):
                export_atlas(self.root, [self.output])
        self.assertFalse((self.output / 'index.json').exists())
        export_atlas(self.root, [self.output])
        self.assertEqual(json.loads((self.output / 'index.json').read_bytes())['current_version'], '2026-09-26.1')

    def test_activation_failure_preserves_served_catalog_and_cleans_temp(self):
        from unittest.mock import patch
        from scripts import export_atlas as module
        export_atlas(self.root, [self.output])
        previous = (self.output / 'index.json').read_bytes()
        index_path = self.release / 'index.json'
        index = json.loads(index_path.read_bytes())
        index['current'] = '2026-09-26.1.json'
        index_path.write_bytes(encoded(index))
        with patch.object(module.os, 'replace', side_effect=OSError('interrupted')):
            with self.assertRaises(OSError):
                export_atlas(self.root, [self.output])
        self.assertEqual((self.output / 'index.json').read_bytes(), previous)
        self.assertEqual(list(self.output.rglob('*.tmp')), [])
        export_atlas(self.root, [self.output])


if __name__ == '__main__':
    unittest.main()
