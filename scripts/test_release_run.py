"""Release orchestration and guide checks; all publications use disposable fixtures."""
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch
import unittest

from scripts import prepare_release as workflow
from scripts import release
from scripts import test_prepare_release as fixtures
from scripts.test_publish_release import save
from scripts.record_decision import record_intent


class ReleaseRunTests(unittest.TestCase):
    setUpClass = classmethod(fixtures.BacklogPublicationTests.setUpClass.__func__)
    setUp = fixtures.BacklogPublicationTests.setUp
    mutate_capability = fixtures.BacklogPublicationTests.mutate_capability

    def editorial_change(self):
        model = workflow.read(self.backlog_path)
        node = next(n for n in model['nodes'] if n['id'] == 'D03.a')
        node['review']['note'] += ' Editorial clarification for this isolated test.'
        save(self.backlog_path, model)

    def test_final_checks_use_the_real_validator_contract(self):
        with patch.object(release.render_models, 'write_text_if_changed') as write:
            result = release.final_checks(fixtures.ROOT)
        self.assertEqual(result['validation_errors'], 0)
        self.assertGreater(result['counters']['release_capability_count'], 0)
        write.assert_called_once()

    def test_final_checks_surface_validation_errors_without_rendering(self):
        with patch.object(release, 'validate_project', return_value={
                'errors': ['broken publication hash'], 'counters': {}}), \
             patch.object(release.render_models, 'write_text_if_changed') as write:
            with self.assertRaisesRegex(ValueError, 'broken publication hash'):
                release.final_checks(self.root)
        write.assert_not_called()

    def test_editorial_run_builds_once_and_stops_at_preparation_by_default(self):
        self.editorial_change()
        before = (self.models / 'release/index.json').read_bytes()
        with patch.object(workflow, 'build_candidate', wraps=workflow.build_candidate) as builds:
            result = release.run(self.root, self.version, ['PUB-TEST-NEW'])
        self.assertEqual(result['status'], 'prepared', result)
        self.assertEqual(builds.call_count, 1)
        self.assertEqual((self.models / 'release/index.json').read_bytes(), before)
        self.assertGreater(result['summary']['automatically_carried_decisions'], 0)

    def test_semantic_change_returns_review_without_publication(self):
        self.mutate_capability()
        before = (self.models / 'release/index.json').read_bytes()
        result = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertEqual(result['status'], 'needs_review')
        assessment = workflow.read(Path(result['assessment']))
        self.assertTrue(all(i['action'] == 'pending' for i in assessment['items']))
        self.assertEqual((self.models / 'release/index.json').read_bytes(), before)
        self.assertFalse((self.models / 'staging' / self.version).exists())

    def test_resume_publication_checks_without_republishing(self):
        self.editorial_change()
        (self.root / 'JOURNAL.md').write_text('# Journal\n', encoding='utf-8')
        with patch.object(release, 'final_checks', return_value={'validation_errors': 0}), \
             patch.object(release, 'verify_atlas', return_value={'verified': True}), \
             patch.object(workflow, 'publish_prepared', wraps=workflow.publish_prepared) as publish:
            first = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
            second = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertEqual(first['status'], 'published', first)
        self.assertEqual(second['status'], 'published', second)
        self.assertTrue(second['already_published'])
        self.assertEqual(publish.call_count, 1)
        self.assertEqual((self.root / 'JOURNAL.md').read_text().count('release-run:'), 1)
        with self.assertRaisesRegex(ValueError, 'Published version is frozen'):
            release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True, guide_path=self.root / 'new-guide.yaml')

    def test_published_site_failure_is_reported_without_claiming_availability(self):
        self.editorial_change()
        with patch.object(release, 'final_checks', return_value={'validation_errors': 0}), \
             patch.object(release, 'verify_atlas', side_effect=OSError('offline')):
            result = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertEqual(result['status'], 'published_checks_failed')
        self.assertTrue(result['release_activated'])
        self.assertFalse(result['atlas']['verified'])
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], self.version)

    def test_staged_resume_keeps_integrity_checks(self):
        self.editorial_change()
        prepared = release.run(self.root, self.version, ['PUB-TEST-NEW'])
        self.assertEqual(prepared['status'], 'prepared')
        self.mutate_capability()
        with self.assertRaisesRegex(ValueError, 'Backlog changed'):
            release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def guide(self):
        guide = deepcopy(workflow.read(fixtures.ROOT / 'modeles/modeling-guides/versions/2026-09-19.4.yaml'))
        guide['version'] = '2099-09-13.1'
        path = self.root / 'guide-candidate.yaml'
        save(path, guide)
        return path

    def test_new_guide_is_frozen_and_associated_before_activation(self):
        path = self.guide()
        self.editorial_change()
        workflow.prepare(self.root, self.version, ['PUB-TEST-NEW'], guide_path=path)
        staged = workflow.read(self.models / 'staging' / self.version / 'manifest.json')
        self.assertEqual(staged['new_modeling_guide']['version'], '2099-09-13.1')
        workflow.publish_prepared(self.root, self.version, activate=True)
        index = workflow.read(self.models / 'modeling-guides/index.yaml')
        self.assertEqual(index['associations'][0]['publication_version'], self.version)
        self.assertEqual((self.models / 'modeling-guides/versions/2099-09-13.1.yaml').read_bytes(), path.read_bytes())

    def test_guide_tamper_refuses_before_writing_any_publication(self):
        path = self.guide()
        workflow.prepare(self.root, self.version, ['PUB-TEST-NEW'], guide_path=path)
        path.write_bytes(path.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'Guide candidate changed'):
            workflow.publish_prepared(self.root, self.version, activate=True)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_in_memory_candidate_cannot_bypass_fresh_input_check(self):
        bundle = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'])
        self.mutate_capability()
        with self.assertRaisesRegex(ValueError, 'Inputs changed'):
            workflow.stage_candidate(self.root, bundle)
        self.assertFalse((self.models / 'staging' / self.version).exists())

    def test_atlas_verification_rejects_nonlocal_service_before_network(self):
        with patch.object(release, 'urlopen') as network:
            with self.assertRaisesRegex(ValueError, 'local HTTP'):
                release.verify_atlas(self.root, self.version, 'https://example.com')
        network.assert_not_called()

    @patch('scripts.release_catalog.datetime')
    def test_new_approval_without_business_edit_is_not_discarded_as_unchanged(self, clock):
        from datetime import datetime, timezone
        # A fast runner can publish both versions at the very same instant.
        clock.now.return_value = datetime(2026, 9, 26, 12, 0, tzinfo=timezone.utc)
        self.editorial_change()
        with patch.object(release, 'final_checks', return_value={'validation_errors': 0}):
            first = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True, verify_site=False)
        self.assertEqual(first['status'], 'published', first)
        record_intent(self.root, intent_id='ADOPT-RECORDED-ONLY', collection='nodes', target_id='D03.a',
            fields=['name'], source_refs=['PUB-TEST-NEW'], author='Laurent', decided_at='2026-09-19',
            interpretation='explicit', note='Explicit fixture agreement only.', reviewer='Test')
        result = release.run(self.root, '2099-09-13.100', ['PUB-TEST-NEW'], verify_site=False)
        self.assertEqual(result['status'], 'prepared', result)
        self.assertIn('ADOPT-RECORDED-ONLY', workflow.read(self.models / 'staging/2099-09-13.100/report.json')['new_decision_ids'])
        workflow.publish_prepared(self.root, '2099-09-13.100', activate=True)
        (self.models / 'backlog/decision-intents.yaml').unlink()
        removed = workflow.build_candidate(self.root, '2099-09-13.101', ['PUB-TEST-NEW'])
        self.assertTrue(any('previously published registry was removed' in e for e in removed['report']['validation_errors']))

    def test_wrong_additional_version_is_not_hidden_by_intent_registry(self):
        record_intent(self.root, intent_id='ADOPT-RECORDED-VERSION', collection='nodes', target_id='D03.a',
            fields=['name'], source_refs=['PUB-TEST-NEW'], author='Laurent', decided_at='2026-09-19',
            interpretation='explicit', note='Explicit fixture agreement only.', reviewer='Test')
        additional = self.root / 'additional.json'
        save(additional, {'schema_version': '1.0.0', 'version': '2099-09-13.3', 'decisions': []})
        with self.assertRaisesRegex(ValueError, 'prepared version'):
            workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], additional)

    def test_partial_write_is_reported_and_never_blindly_retried(self):
        self.editorial_change()
        def partial(*args, **kwargs):
            (self.models / 'release' / self.version).mkdir()
            raise OSError('simulated interruption')
        with patch.object(workflow, 'publish_prepared', side_effect=partial) as publish:
            first = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
            second = release.run(self.root, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertEqual(first['status'], 'publication_incomplete')
        self.assertEqual(second['status'], 'publication_incomplete')
        self.assertEqual(publish.call_count, 1)
        self.assertNotEqual(workflow.resolve_release(self.models / 'release')['version'], self.version)


class AtlasDownloadChecks(unittest.TestCase):
    def test_release_verifies_downloaded_yaml_hash_and_complete_semantics(self):
        import hashlib
        import io
        import tempfile
        from scripts.export_atlas import encoded
        from scripts.structured_io import dumps
        from scripts.atlas_metamodel import describe_metamodel
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            version = '2026-10-12.1'
            raw = {'version': version, 'nodes': [], 'relations': [], 'hotspot_catalog': {'hotspots': []}}
            guide = {'status': 'unavailable', 'publication_version': version}
            expected = {**raw, 'sourcePath': f'modeles/release/{version}/model.yaml',
                        'metamodel': describe_metamodel(raw, guide)}
            expected['metamodel']['vocabulary'] = {}
            expected['presentation'] = {'icons': {}, 'flow_neighborhood': None}
            model_bytes = encoded(expected)
            yaml_bytes = dumps(expected).encode('utf-8')
            guide_bytes = encoded(guide)
            catalog = {'current_version': version, 'versions': [{'version': version}]}
            actual_catalog = deepcopy(catalog)
            entry = actual_catalog['versions'][0]
            entry.update(model_sha256=hashlib.sha256(model_bytes).hexdigest(),
                         model_yaml_sha256=hashlib.sha256(yaml_bytes).hexdigest(),
                         guide_sha256=hashlib.sha256(guide_bytes).hexdigest())
            routes = {'/__atlas__/identity.json': encoded({'appName': 'FLOW Atlas', 'mode': 'static', 'repositoryRoot': str(root)}),
                      '/data/index.json': encoded(actual_catalog),
                      f'/data/{version}/model.json': model_bytes,
                      f'/data/{version}/model.yaml': yaml_bytes,
                      f'/data/{version}/guide.json': guide_bytes}
            with patch('scripts.release_catalog.PublicationReader') as reader_type, \
                    patch('app.modeling_guide._load_associated_guide', return_value=guide), \
                    patch.object(release, 'urlopen', side_effect=lambda url, **kw: io.BytesIO(routes[url.replace('http://127.0.0.1:8765', '')])):
                reader = reader_type.return_value
                reader.current_version = version
                reader.load.return_value = ({'path': f'{version}/model.yaml'}, raw)
                reader.catalog.return_value = catalog
                self.assertTrue(release.verify_atlas(root, version)['verified'])
                routes[f'/data/{version}/model.yaml'] = yaml_bytes[:-1]
                with self.assertRaisesRegex(ValueError, 'YAML hash differs'):
                    release.verify_atlas(root, version)
                incomplete = dumps({**expected, 'hotspot_catalog': None}).encode('utf-8')
                routes[f'/data/{version}/model.yaml'] = incomplete
                entry['model_yaml_sha256'] = hashlib.sha256(incomplete).hexdigest()
                routes['/data/index.json'] = encoded(actual_catalog)
                with self.assertRaisesRegex(ValueError, 'YAML model or metamodel differs'):
                    release.verify_atlas(root, version)


if __name__ == '__main__':
    unittest.main()
