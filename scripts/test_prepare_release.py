"""Backlog publication tests. Every mutation uses an isolated project fixture."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import unittest

try:
    from . import prepare_release as workflow
    from .test_publish_release import isolated_project, save, source
except ImportError:
    import prepare_release as workflow
    from test_publish_release import isolated_project, save, source

ROOT = Path(__file__).resolve().parents[1]


class BacklogPublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Build one minimal legacy fixture. Each test still receives independent
        # copies: no hard links, no mutable shared model and no live audit history.
        temp = isolated_project()
        cls.fixture = temp.__enter__()
        cls.addClassCleanup(temp.__exit__, None, None, None)
        cls.root = cls.fixture
        src, dst = ROOT/'modeles', cls.fixture/'modeles'
        def copy(relative):
            # Compatibility fixture pinned in Git; no ignored staging dependency.
            from scripts.git_history import git, read_bytes
            target = dst / relative
            original = src / relative
            paths = git(ROOT, 'ls-tree', '-r', '--name-only', '66b4d7a2fc796ea4d48fe7da0461a794fab1c345', '--', 'modeles/' + relative).decode().splitlines()
            if original.is_file():
                paths = ['modeles/' + relative]
            for name in paths:
                output = cls.fixture / name
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(read_bytes(ROOT / name))
        for relative in ('schemas', 'release/2026-09-13.2', 'release/2026-09-13.4',
                         'revisions/2026-09-13.4', 'decisions/2026-09-13.4.json',
                         'provenance/2026-09-13.4', 'provenance/source-records.json',
                         'backlog/applicability.yaml', 'backlog/modeling-roadmap.yaml'):
            copy(relative)
        manifest_path = dst / 'release/2026-09-13.4/manifest.json'
        manifest = workflow.read(manifest_path)
        manifest['decision_registry_files'] = {}
        save(manifest_path, manifest)
        index = workflow.read(src/'release/index.json')
        wanted = {'urbanisation-v002-2026-09-13-162623.json', 'urbanisation-2026-09-13.2-legacy.json'}
        index['publications'] = [e for e in index['publications'] if e['descriptor'] in wanted]
        for entry in index['publications']:
            copy('release/'+entry['descriptor'])
        save(dst/'release/index.json', index)
        # The test publication must sort after all copied historical releases.
        cls.models = cls.root / 'modeles'
        cls.backlog_path = cls.models / 'backlog/model.yaml'
        # These tests exercise the legacy contract; lifecycle has its own tests.
        # Pin the legacy fixture to its immutable publication, not the live
        # backlog: new releases must not change this test's approval baseline.
        index_path = cls.models / 'release/index.json'
        index = workflow.read(index_path)
        index['current'] = 'urbanisation-v002-2026-09-13-162623.json'
        save(index_path, index)
        baseline = workflow.read(cls.models / 'revisions/2026-09-13.4/backlog.json')
        baseline.pop('lifecycle_policy', None)
        for collection in ('nodes', 'relations'):
            for item in baseline[collection]:
                item.pop('lifecycle', None)
        save(cls.backlog_path, baseline)
        # Freeze vocabulary too: the current glossary now links to domains and
        # capabilities that did not exist in this legacy fixture.
        historical_glossary = workflow.read(ROOT / 'modeles/release/2026-09-14.1/model.yaml')['glossary']
        save(cls.models / 'backlog/glossary.yaml', historical_glossary)
        path = cls.models / 'provenance/source-records.json'
        live = workflow.read(path)
        live['records'].append(source('PUB-TEST-NEW', 'Explicit local publication request'))
        save(path, live)

    def setUp(self):
        self.temp = isolated_project()
        self.root = self.temp.__enter__()
        self.addCleanup(self.temp.__exit__, None, None, None)
        shutil.copytree(self.fixture/'modeles', self.root/'modeles')
        self.version = '2099-09-13.99'
        self.models = self.root/'modeles'
        self.backlog_path = self.models/'backlog/model.yaml'

    def mutate_capability(self, revision=True):
        model = workflow.read(self.backlog_path)
        cap = next(n for n in model['nodes'] if n['id'] == 'D03.a')
        cap['fields']['definition'] += ' New proposed precision.'
        if revision:
            cap['revision'] += 1
        save(self.backlog_path, model)
        return cap

    def prepare(self):
        return workflow.prepare(self.root, self.version, ['PUB-TEST-NEW'])

    def test_model_file_provenance_is_frozen_outside_the_published_model(self):
        model = workflow.read(self.backlog_path)
        evidence = {'schema_version': '1.0.0', 'model_id': model['model_id'],
                    'source_version': model.pop('source_version'),
                    'source_files': model.pop('source_files')}
        save(self.backlog_path, model)
        save(self.models / 'backlog/model-provenance.yaml', evidence)
        self.prepare()
        stage = self.models / 'staging' / self.version
        staged_manifest = workflow.read(stage / 'manifest.json')
        self.assertIn('model-provenance.yaml', staged_manifest['files'])
        workflow.publish_prepared(self.root, self.version)
        published = workflow.read(self.models / 'release' / self.version / 'model.yaml')
        manifest = workflow.read(self.models / 'release' / self.version / 'manifest.json')
        self.assertNotIn('source_files', published)
        self.assertNotIn('source_version', published)
        self.assertNotIn('source_files', manifest)
        self.assertEqual(workflow.read(self.models / 'revisions' / self.version / 'model-provenance.yaml'), evidence)
        self.assertEqual(manifest['model_provenance_sha256'],
                         workflow.digest(self.models / 'revisions' / self.version / 'model-provenance.yaml'))

    def test_working_annexes_stay_in_knowledge_base(self):
        annex = self.models/'backlog/exact-evidence.yaml'
        content = b'# Research retained in knowledge base\r\nvalue: "00123"\r\n'
        annex.write_bytes(content)
        self.prepare()
        self.assertFalse((self.models/'staging'/self.version/'deferred/exact-evidence.yaml').exists())
        workflow.publish_prepared(self.root, self.version)
        self.assertFalse((self.models/'revisions'/self.version/'deferred/exact-evidence.yaml').exists())
        self.assertEqual(annex.read_bytes(), content)

    def test_sharded_registry_is_frozen_and_reused_without_backlog(self):
        from scripts import record_decision, decision_registry, decision_review
        record_decision.record_intent(self.root, intent_id='SPLIT-TEST', collection='nodes',
            target_id='D03.a', fields=['name'], source_refs=['PUB-TEST-NEW'], author='Laurent',
            decided_at='2026-09-22', interpretation='explicit', note='Test agreement', reviewer='Codex')
        decision_registry.migrate(self.root)
        path = self.models/'backlog/decision-intents.yaml'
        original = decision_registry.read_registry(path)
        index = workflow.read(path)
        shard = index['entries'][0]['path']
        orphan = path.parent / 'decision-intents/active' / ('0' * 64 + '.yaml')
        orphan.write_text('- ignored: interrupted unreferenced write\n', encoding='utf-8')
        self.assertIn('modeles/backlog/' + shard, decision_review.input_state(self.root)['files'])
        self.prepare()
        staged = self.models/'staging'/self.version/'deferred'
        self.assertEqual(decision_registry.read_registry(staged/'decision-intents.yaml'), original)
        self.assertEqual((staged/shard).read_bytes(), (path.parent/shard).read_bytes())
        self.assertFalse((staged/orphan.relative_to(path.parent)).exists())
        workflow.publish_prepared(self.root, self.version, activate=True)
        frozen = self.models/'revisions'/self.version/'deferred/decision-intents.yaml'
        self.assertEqual(decision_registry.read_registry(frozen), original)
        # New publications carry their inventory without relying on staging.
        (self.models/'staging'/self.version/'manifest.json').unlink()
        frozen_bytes = frozen.read_bytes()
        frozen.unlink()
        with self.assertRaisesRegex(ValueError, 'Frozen registry artifact missing'):
            workflow.build_candidate(self.root, '2099-09-13.100', ['PUB-TEST-NEW'])
        frozen.write_bytes(frozen_bytes)
        frozen_shard = frozen.parent / shard
        shard_bytes = frozen_shard.read_bytes()
        frozen_shard.write_bytes(shard_bytes + b'# altered proof\n')
        with self.assertRaisesRegex(ValueError, 'Frozen registry artifact missing or changed'):
            workflow.build_candidate(self.root, '2099-09-13.100', ['PUB-TEST-NEW'])
        frozen_shard.write_bytes(shard_bytes)
        next_bundle = workflow.build_candidate(self.root, '2099-09-13.100', ['PUB-TEST-NEW'])
        self.assertFalse(next_bundle['report']['validation_errors'])
        # The frozen proof is independent of the live index and fragments.
        (path.parent/shard).write_bytes(b'corrupt\n')
        self.assertEqual(decision_registry.read_registry(frozen), original)
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            decision_registry.read_registry(path)
        from scripts.validate_models import validate_project
        report = validate_project(self.root)
        self.assertTrue(any('decision-intents:' in e and 'hash mismatch' in e for e in report['errors']), report['errors'])


    def test_information_catalogue_is_frozen_published_and_stale_edits_rejected(self):
        catalogue = deepcopy(workflow.read(ROOT/'modeles/backlog/model.yaml')['information_catalog'])
        # The legacy fixture keeps its own capabilities; use two existing roles.
        catalogue['items'] = catalogue['items'][:2]
        catalogue['links'] = [dict(id='INFO-TEST-LINK', from_ref=catalogue['items'][0]['id'],
            to_ref=catalogue['items'][1]['id'], meaning='réponse à un attendu', condition='Réponse reçue',
            effect='Éclaire les conditions retenues',source_refs=['PUB-TEST-NEW'],
            review={'state':'proposed','note':'Fixture only'})]
        for item in catalogue['items']:
            item['capability_roles'] = [dict(capability_ref='D03.a',role='utilise',meaning='Fixture only',source_refs=['PUB-TEST-NEW'])]
        model=workflow.read(self.backlog_path);model['information_catalog']=catalogue;save(self.backlog_path,model)
        self.prepare()
        changed=deepcopy(model);changed['information_catalog']['items'][0]['definition']+=' Later edit.'
        save(self.backlog_path,changed)
        with self.assertRaises(ValueError): workflow.publish_prepared(self.root,self.version,activate=True)
        self.assertFalse((self.models/f'release/{self.version}').exists())
        save(self.backlog_path,model)
        workflow.publish_prepared(self.root,self.version,activate=True)
        release_path=self.models/f'release/{self.version}/model.yaml'
        published=workflow.read(release_path)
        self.assertEqual(published['information_catalog']['items'][0]['definition'],catalogue['items'][0]['definition'])
        self.assertEqual(published['information_catalog']['items'][0]['revision'],1)
        self.assertIn('Informations métier',(release_path.parent/'release-notes.md').read_text(encoding='utf-8'))
        frozen=release_path.read_bytes();save(self.backlog_path,changed)
        self.assertEqual(release_path.read_bytes(),frozen)

    def add_methodology_association(self):
        from hashlib import sha256
        folder = self.models / 'modeling-guides'
        (folder / 'versions').mkdir(parents=True)
        guide = folder / 'versions/2026-09-19.1.yaml'
        guide.write_text('version: 2026-09-19.1\n', encoding='utf-8')
        save(folder / 'index.yaml', {'guides': [{'version': '2026-09-19.1', 'path': 'versions/2026-09-19.1.yaml', 'sha256': sha256(guide.read_bytes()).hexdigest()}],
             'associations': [{'publication_version': '2026-09-13.4', 'guide_version': '2026-09-19.1', 'scope': 'test'}]})
        return folder / 'index.yaml'

    def test_prepared_publication_carries_exact_methodology_association(self):
        path = self.add_methodology_association()
        before = workflow.read(path)
        self.prepare()
        staged = workflow.read(self.models / 'staging' / self.version / 'manifest.json')
        self.assertEqual(staged['modeling_guide']['guide'], before['guides'][0])
        workflow.publish_prepared(self.root, self.version, activate=True)
        after = workflow.read(path)
        self.assertEqual(after['guides'], before['guides'])
        self.assertEqual(after['associations'][0], before['associations'][0])
        self.assertEqual(after['associations'][1]['publication_version'], self.version)
        self.assertEqual(after['associations'][1]['guide_version'], before['guides'][0]['version'])

    def test_changed_methodology_index_blocks_before_writing_release(self):
        path = self.add_methodology_association()
        self.prepare()
        index = workflow.read(path)
        index['associations'][0]['scope'] = 'changed'
        save(path, index)
        with self.assertRaisesRegex(ValueError, 'Methodology association changed'):
            workflow.publish_prepared(self.root, self.version, activate=True)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_read_only_report_identifies_live_changed_field_and_lost_validation(self):
        staged_before = {p.relative_to(self.models/'staging'): p.read_bytes()
                         for p in (self.models/'staging').rglob('*') if p.is_file()}
        self.mutate_capability()
        before = (self.models / 'release' / ('index.json' if (self.models/'release/index.json').exists() else 'current.json')).read_bytes()
        bundle = workflow.build_candidate(self.root, self.version)
        report = bundle['report']
        summary = workflow.summarize_report(report)
        self.assertEqual(summary['validation_error_count'], len(report['validation_errors']))
        self.assertEqual(summary['ready_to_prepare'], not report['validation_errors'])
        self.assertEqual(summary['changes']['nodes']['modified'], len(report['changes']['nodes']['modified']))
        change = next(n for n in report['changes']['nodes']['modified'] if n['id'] == 'D03.a')
        self.assertIn('/fields/definition', {c['path'] for c in change['changes']})
        released = next(n for n in bundle['candidate']['nodes'] if n['id'] == 'D03.a')
        self.assertEqual(released['approved_fields'], [])
        self.assertEqual(released['review']['state'], 'proposed')
        self.assertTrue(released['review']['note'].startswith('Aucune validation antérieure reprise pour cette révision'))
        self.assertIn('Note antérieure, qui ne qualifie pas cette révision', released['review']['note'])
        original_note = next(n for n in workflow.read(self.backlog_path)['nodes'] if n['id'] == 'D03.a')['review']['note']
        self.assertIn(original_note, released['review']['note'])
        self.assertTrue(any(d['target'] == 'D03.a' for d in report['deferred_decisions']))
        self.assertEqual((self.models / 'release' / ('index.json' if (self.models/'release/index.json').exists() else 'current.json')).read_bytes(), before)
        self.assertEqual({p.relative_to(self.models/'staging'): p.read_bytes()
                          for p in (self.models/'staging').rglob('*') if p.is_file()}, staged_before)

    def test_changed_value_without_manual_revision_is_automatically_versioned(self):
        self.mutate_capability(revision=False)
        report = workflow.build_candidate(self.root, self.version)['report']
        self.assertEqual(report['validation_errors'], [])
        self.prepare()
        candidate=workflow.read(self.models / 'staging' / self.version / 'candidate.yaml')
        cap=next(n for n in candidate['nodes'] if n['id']=='D03.a')
        self.assertEqual(cap['revision'], 2)
        self.assertTrue(cap['last_modified'].endswith('Z'))

    def test_prepare_freezes_current_backlog_without_changing_release(self):
        self.mutate_capability()
        pointer = (self.models / 'release' / ('index.json' if (self.models/'release/index.json').exists() else 'current.json')).read_bytes()
        result = self.prepare()
        self.assertFalse(result['release_activated'])
        self.assertEqual((self.models / 'release' / ('index.json' if (self.models/'release/index.json').exists() else 'current.json')).read_bytes(), pointer)
        self.assertFalse((self.models / 'release' / self.version).exists())
        candidate = workflow.read(self.models / 'staging' / self.version / 'candidate.yaml')
        cap = next(n for n in candidate['nodes'] if n['id'] == 'D03.a')
        self.assertIn('New proposed precision.', cap['fields']['definition'])
        self.assertEqual(sum(n['kind'] == 'capability' for n in candidate['nodes']), 36)
        self.assertFalse((self.models / 'staging' / self.version / 'deferred/applicability.yaml').exists())

    def test_publish_prepared_activates_verified_live_backlog_and_preserves_old_release(self):
        self.mutate_capability()
        old_path = self.models / 'release/2026-09-13.2/model.json'
        old_bytes = old_path.read_bytes()
        self.prepare()
        result = workflow.publish_prepared(self.root, self.version, activate=True)
        self.assertEqual(result['complete_capability_count'], 8)
        self.assertEqual(workflow.resolve_release(self.models / 'release')['version'], self.version)
        self.assertEqual(old_path.read_bytes(), old_bytes)
        self.assertTrue((self.models / f'revisions/{self.version}/backlog.yaml').exists())
        self.assertTrue((self.models / f'decisions/{self.version}.json').exists())
        # The resulting current release is valid for another report/preparation.
        bundle = workflow.build_candidate(self.root, '2026-09-13.100')
        from scripts.release_catalog import catalog
        published = workflow.read(self.models / f'release/{self.version}/model.yaml')
        for collection in ('nodes', 'relations', 'principles'):
            previous = {x['id']: x for x in published[collection]}
            for item in bundle['candidate'][collection]:
                self.assertEqual(item['revision'], previous[item['id']]['revision'])
                self.assertEqual(item['last_modified'], previous[item['id']]['last_modified'])
        entries=catalog(self.models/'release')
        self.assertEqual(entries['versions'][0]['version'],self.version)
        self.assertEqual(workflow.resolve_release(self.models/'release','2026-09-13.2')['version'],'2026-09-13.2')
        descriptor=workflow.read(self.models/'release/index.json')['current']
        self.assertRegex(descriptor,r'^urbanisation-v\d{3,}-\d{4}-\d{2}-\d{2}\.[1-9]\d*\.yaml$')
        self.assertTrue((self.models/f'release/{self.version}/release-notes.md').exists())
        self.assertFalse(bundle['report']['validation_errors'])
        published_cap = next(n for n in workflow.read(self.models / f'release/{self.version}/model.yaml')['nodes'] if n['id'] == 'D03.a')
        next_cap = next(n for n in bundle['candidate']['nodes'] if n['id'] == 'D03.a')
        self.assertEqual(next_cap['review']['note'], published_cap['review']['note'])
        self.assertTrue(next_cap['review']['note'].startswith('Aucune validation antérieure reprise pour cette révision'))

    def test_stale_live_backlog_refuses_publication(self):
        self.prepare()
        self.mutate_capability()
        with self.assertRaisesRegex(ValueError, 'Backlog changed'):
            workflow.publish_prepared(self.root, self.version, activate=True)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_glossary_is_frozen_and_changes_require_new_preparation(self):
        self.prepare()
        path = self.models / 'backlog/glossary.yaml'
        before = workflow.read(path)
        candidate = workflow.read(self.models / 'staging' / self.version / 'candidate.yaml')
        self.assertEqual(len(candidate['glossary']['terms']), len(before['terms']))
        self.assertTrue(all(t['revision'] == 1 for t in candidate['glossary']['terms']))
        altered = deepcopy(before)
        altered['terms'][0]['definition'] += ' New definition.'
        save(path, altered)
        with self.assertRaisesRegex(ValueError, 'Glossary changed'):
            workflow.publish_prepared(self.root, self.version, activate=True)
        self.assertEqual(workflow.read(self.models / 'staging' / self.version / 'candidate.yaml'), candidate)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_published_glossary_remains_independent_of_live_edits(self):
        self.prepare()
        workflow.publish_prepared(self.root, self.version, activate=True)
        path = self.models / f'release/{self.version}/model.yaml'
        before = path.read_bytes()
        live_path = self.models / 'backlog/glossary.yaml'
        live = workflow.read(live_path)
        live['terms'][0]['definition'] += ' New proposed precision.'
        save(live_path, live)
        bundle = workflow.build_candidate(self.root, '2026-09-13.100')
        self.assertEqual(bundle['report']['validation_errors'], [])
        self.assertEqual(bundle['candidate']['glossary']['terms'][0]['revision'], 2)
        self.assertEqual(path.read_bytes(), before)

    def test_modified_staged_candidate_is_rejected(self):
        self.prepare()
        path = self.models / 'staging' / self.version / 'candidate.yaml'
        path.write_text(path.read_text(encoding='utf-8') + ' ', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            workflow.publish_prepared(self.root, self.version)
        self.assertFalse((self.models / 'release' / self.version).exists())

    def test_changed_backlog_context_refuses_publication(self):
        self.prepare()
        path = self.models / 'backlog/modeling-roadmap.yaml'
        doc = workflow.read(path)
        doc['current_focus'] = ['domain']
        save(path, doc)
        with self.assertRaisesRegex(ValueError, 'context changed'):
            workflow.publish_prepared(self.root, self.version)

    def test_additional_explicit_decision_can_validate_changed_revision(self):
        cap = self.mutate_capability()
        doc = {'schema_version': '1.0.0', 'version': self.version, 'decisions': [{
            'id': 'ADOPT-TEST-NEW', 'decision_state': 'accepted', 'author': 'Laurent',
            'decided_at': '2026-09-13', 'recorded_at': '2026-09-13', 'interpretation': 'explicit',
            'source_refs': ['PUB-TEST-NEW'], 'note': 'Test only: explicit scoped approval.',
            'target': {'collection': 'nodes', 'id': cap['id'], 'revision': cap['revision'],
                       'approved_fields': list(cap['fields']), 'value_sha256': {k: workflow.canonical_sha256(v) for k, v in cap['fields'].items()},
                       'import_version': self.version}}]}
        path = self.root / 'new-decisions.json'
        save(path, doc)
        bundle = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], path)
        released = next(n for n in bundle['candidate']['nodes'] if n['id'] == cap['id'])
        self.assertEqual(released['review']['state'], 'accepted')
        self.assertEqual(released['adoption_ids'], ['ADOPT-TEST-NEW'])
        self.assertTrue(released['review']['note'].startswith('Seules les décisions applicables à cette version'))
        self.assertEqual(bundle['report']['new_decision_ids'], ['ADOPT-TEST-NEW'])
        self.assertFalse(bundle['report']['validation_errors'])

    def test_lost_validation_note_remains_historical_after_new_partial_approval(self):
        cap = self.mutate_capability()
        snapshot = workflow.read(self.backlog_path)
        decision = {'id': 'ADOPT-TEST-PARTIAL', 'decision_state': 'accepted',
                    'target': {'collection': 'nodes', 'id': cap['id']}}
        workflow.explain_deferred_validations(snapshot, {'decisions': [decision]},
                                             [{'id': 'OLD-APPROVAL', 'target': cap['id']}])
        changed = next(n for n in snapshot['nodes'] if n['id'] == cap['id'])
        self.assertTrue(changed['review']['note'].startswith('Seules les décisions applicables à cette version'))
        self.assertIn('OLD-APPROVAL', changed['review']['note'])
        self.assertIn('Note antérieure, qui ne qualifie pas cette révision', changed['review']['note'])

    def test_universe_can_be_fully_validated_only_with_all_explicit_field_evidence(self):
        model = workflow.read(self.backlog_path)
        group = {'id': 'universe-test', 'kind': 'group', 'layer': 'process', 'revision': 1,
                 'group_role': 'urbanism_level', 'level_ref': 'universe',
                 'fields': {'name': 'Test Services', 'definition': 'A scoped test universe.'},
                 'review': {'state': 'proposed', 'note': 'Test fixture only.'},
                 'source_refs': ['PUB-TEST-NEW'], 'source_locator': {'path': 'test.md', 'anchor': 'universe'}}
        model['nodes'].append(group)
        save(self.backlog_path, model)
        decision = {'id': 'ADOPT-TEST-UNIVERSE', 'decision_state': 'accepted', 'author': 'Laurent',
                    'decided_at': '2026-09-14', 'recorded_at': '2026-09-14', 'interpretation': 'explicit',
                    'source_refs': ['PUB-TEST-NEW'], 'note': 'Test fixture only.',
                    'target': {'collection': 'nodes', 'id': group['id'], 'revision': 1,
                               'approved_fields': list(group['fields']),
                               'value_sha256': {k: workflow.canonical_sha256(v) for k, v in group['fields'].items()},
                               'import_version': self.version}}
        doc = {'schema_version': '1.0.0', 'version': self.version, 'decisions': [decision]}
        path = self.root / 'universe-decision.json'
        save(path, doc)
        bundle = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], path)
        self.assertEqual(bundle['report']['validation_errors'], [])
        released = next(n for n in bundle['candidate']['nodes'] if n['id'] == group['id'])
        self.assertEqual(released['review']['state'], 'accepted')
        decision['target']['approved_fields'] = ['name']
        decision['target']['value_sha256'].pop('definition')
        save(path, doc)
        partial = workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], path)
        item = next(n for n in partial['candidate']['nodes'] if n['id'] == group['id'])
        self.assertEqual(item['review']['state'], 'partial')
        item['review']['state'] = 'accepted'
        errors = workflow.validate_release(partial['candidate'], partial['decisions'], partial['snapshot'],
                                           {r['id']: r for r in partial['provenance']['records']},
                                           workflow.read(self.models / 'schemas/urbanism.schema.json'))
        self.assertTrue(any('validation status contradicts' in e for e in errors))

    def test_relation_qualification_diff_and_new_relation_are_explicit(self):
        model = workflow.read(self.backlog_path)
        relation = {'id': 'REL-TEST', 'revision': 1, 'type': 'relates-to', 'source_id': 'D03.a', 'target_id': 'D03.b',
                    'source_refs': ['PUB-TEST-NEW'], 'review': {'state': 'proposed', 'note': 'Test hypothesis'},
                    'qualification': {'meaning': 'Test relation', 'conditions': [], 'effects': []}}
        model['relations'].append(relation)
        save(self.backlog_path, model)
        report = workflow.build_candidate(self.root, self.version)['report']
        added = report['changes']['relations']['added']
        test_relation = next(r for r in added if r['id'] == 'REL-TEST')
        self.assertEqual(test_relation['qualification']['meaning'], 'Test relation')
        after = deepcopy(test_relation)
        after['qualification']['meaning'] = 'Changed meaning'
        delta = workflow.model_diff({'nodes': [], 'relations': added}, {'nodes': [], 'relations': [after]})
        self.assertEqual(delta['relations']['modified'][0]['changes'][0]['path'], '/qualification/meaning')

    def test_deletions_and_status_changes_are_reported(self):
        before = {'nodes': [{'id': 'A', 'review': {'state': 'proposed'}}, {'id': 'B'}], 'relations': [{'id': 'R'}]}
        after = {'nodes': [{'id': 'A', 'review': {'state': 'under_review'}}], 'relations': []}
        report = workflow.model_diff(before, after)
        self.assertEqual(report['nodes']['removed'], [{'id': 'B'}])
        self.assertEqual(report['relations']['removed'], [{'id': 'R'}])
        self.assertEqual(report['nodes']['modified'][0]['changes'][0]['path'], '/review/state')

    def test_version_collision_refuses_to_rewrite_stage(self):
        self.prepare()
        manifest_path = self.models / 'staging' / self.version / 'manifest.json'
        before = manifest_path.read_bytes()
        with self.assertRaisesRegex(ValueError, 'already exists'):
            self.prepare()
        self.assertEqual(manifest_path.read_bytes(), before)

    def test_malformed_new_decision_or_unknown_source_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unknown publication source'):
            workflow.prepare(self.root, self.version, ['ABSENT'])
        bundle = workflow.build_candidate(self.root, self.version)
        doc = deepcopy(bundle['decisions'])
        doc['decisions'] = [doc['decisions'][0]]
        path = self.root / 'reused-decision.json'
        save(path, doc)
        with self.assertRaisesRegex(ValueError, 'new id'):
            workflow.build_candidate(self.root, self.version, ['PUB-TEST-NEW'], path)


class EmbeddedMethodologySourcesTests(unittest.TestCase):
    def guide(self):
        return {'id': 'flow-modeling-keys', 'source_refs': ['U467'],
                'sources': [dict(id=identifier, title='Source', excerpt='Frozen text', scope='Dated excerpt')
                            for identifier in ['U467', 'AGENTS-2026-09-18']],
                'lessons': [{'contributor': {'source_refs': ['AGENTS-2026-09-18']}}]}

    def test_embedded_sources_remain_in_context_without_becoming_global_records(self):
        guide = self.guide()
        original = deepcopy(guide)
        self.assertEqual(workflow.context_source_references(guide), {'U467'})
        self.assertEqual(guide, original)
        # Other annexes cannot bypass global provenance by adding a sources list.
        guide['id'] = 'ordinary-annex'
        self.assertEqual(workflow.context_source_references(guide), {'U467', 'AGENTS-2026-09-18'})

    def test_missing_duplicate_or_empty_embedded_evidence_is_rejected(self):
        guide = self.guide()
        guide['lessons'][0]['contributor']['source_refs'] = ['MISSING']
        with self.assertRaisesRegex(ValueError, 'Unresolved embedded'):
            workflow.context_source_references(guide)
        guide = self.guide()
        guide['sources'].append(deepcopy(guide['sources'][0]))
        with self.assertRaisesRegex(ValueError, 'duplicate embedded'):
            workflow.context_source_references(guide)
        guide = self.guide()
        guide['sources'][1]['excerpt'] = ''
        with self.assertRaisesRegex(ValueError, 'Invalid'):
            workflow.context_source_references(guide)


if __name__ == '__main__':
    unittest.main()


class CompactReportTests(unittest.TestCase):
    def test_identified_list_reports_only_changed_record(self):
        before = [{'id': str(i), 'definition': 'x' * 1000} for i in range(100)]
        after = deepcopy(before)
        after[10]['definition'] = 'new'
        delta = workflow.changes(before, after)
        self.assertEqual(delta, [{'path': '/10/definition', 'before': 'x' * 1000, 'after': 'new'}])
        self.assertLess(len(json.dumps(delta)), 2000)

    def test_registry_report_excludes_captured_context_and_values(self):
        document = {'schema_version': '1.0.0', 'intents': [
            {'id': 'A', 'target': {'id': 'N', 'context': {'glossary': 'x' * 1000000},
             'context_sha256': 'digest', 'values': {'name': 'A'}, 'value_sha256': {'name': 'hash'}}}]}
        summary = workflow.registry_report(document)
        self.assertLess(len(json.dumps(summary)), 1000)
        self.assertEqual(summary['intents'][0]['target']['context_sha256'], 'digest')

    def test_list_order_and_empty_list_remain_explicit(self):
        before = [{'id': 'A'}, {'id': 'B'}]
        self.assertEqual(workflow.changes(before, list(reversed(before)))[0]['path'], '/@order')
        self.assertTrue(workflow.changes(before, []))
