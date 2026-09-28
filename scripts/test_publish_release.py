"""Publication workflow tests; all writes stay in isolated temporary projects."""

from copy import deepcopy
from scripts.structured_io import dumps, read
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import shutil
import os
import stat
import unittest
from unittest.mock import patch
import uuid

try:
    from . import publish_release as publisher
except ImportError:
    import publish_release as publisher


ROOT = Path(__file__).resolve().parents[1]


@contextmanager
def isolated_project():
    # Plain mkdir inherits workspace ACLs; Windows mkdtemp(mode=0700) can
    # produce an inaccessible directory under the restricted execution token.
    base = (ROOT / '.tmp-model-publication-tests').resolve()
    base.mkdir(exist_ok=True)
    folder = base / uuid.uuid4().hex
    folder.mkdir()
    try:
        yield folder
    finally:
        resolved = folder.resolve()
        if resolved.parent != base or len(resolved.name) != 32:
            raise ValueError('Refusing cleanup outside the isolated test directory')
        def retry_readonly(operation, path, error):
            if not Path(path).resolve().is_relative_to(resolved):
                raise ValueError('Cleanup escaped the fixture')
            os.chmod(path, stat.S_IWRITE | stat.S_IREAD)
            operation(path)
        shutil.rmtree(resolved, onexc=retry_readonly)
        try:
            base.rmdir()
        except OSError:
            pass  # Another independent test may still use its own child.


def save(path, document):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(dumps(document, path.suffix), encoding='utf-8')


def source(identifier, text):
    return {'id': identifier, 'path': 'notes.md', 'anchor': identifier.lower(),
            'captured_text': text, 'content_sha256': hashlib.sha256(text.strip().encode()).hexdigest()}


class IllustrationBoundaryTests(unittest.TestCase):
    def test_publication_preserves_all_business_fields_and_scenario_content(self):
        source = read(ROOT / 'modeles/backlog/model.yaml')
        before = deepcopy(source)
        published = publisher.compile_snapshot(source, {'decisions': []}, '2099-01-01.1', ['QA'])
        self.assertEqual(source, before, 'Publication must not mutate the source')
        expected = {n['id']: n['fields'] for n in source['nodes'] if n['review']['state'] != 'illustration'}
        self.assertEqual({n['id']: n['fields'] for n in published['nodes']}, expected)
        self.assertEqual(published['scenario_catalog'], source['scenario_catalog'])
        self.assertEqual({n['id'] for n in published['excluded_nodes']},
                         {n['id'] for n in source['nodes'] if n['review']['state'] == 'illustration'})

    def test_verified_copy_preserves_bytes_and_never_overwrites(self):
        with isolated_project() as root:
            source_path, target = root/'source.yaml', root/'frozen.yaml'
            content = b'\xef\xbb\xbf# Evidence comment\r\nvalue: "00123"\r\n'
            source_path.write_bytes(content)
            publisher.copy_verified(source_path, target, publisher.digest(source_path))
            self.assertEqual(target.read_bytes(), content)
            with self.assertRaises(FileExistsError):
                publisher.copy_verified(source_path, target, publisher.digest(source_path))
            self.assertEqual(target.read_bytes(), content)

    def test_verified_copy_rejects_stale_source_and_corrupt_destination(self):
        with isolated_project() as root:
            source_path, target = root/'source.yaml', root/'frozen.yaml'
            source_path.write_bytes(b'original')
            expected = publisher.digest(source_path)
            source_path.write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError, 'hash mismatch'):
                publisher.copy_verified(source_path, target, expected)
            self.assertFalse(target.exists())
            with patch.object(publisher, 'digest', return_value='corrupted'):
                with self.assertRaisesRegex(ValueError, 'hash mismatch'):
                    publisher.copy_verified(source_path, target, hashlib.sha256(b'changed').hexdigest())
            self.assertFalse(target.exists())

    def test_deferred_approval_does_not_survive_in_lifecycle(self):
        snapshot = self.snapshot()
        snapshot['nodes'][0]['lifecycle'] = {'state': 'urbanist_validated',
            'validated_fields': ['name'], 'value_sha256': {'name': 'historical'}}
        before = deepcopy(snapshot)
        result = publisher.compile_snapshot(snapshot, {'decisions': []}, '2099-01-01.1', ['U1'])
        cycle = result['nodes'][0]['lifecycle']
        self.assertEqual(cycle['state'], 'under_instruction')
        self.assertEqual(cycle['validated_fields'], [])
        self.assertEqual(cycle['value_sha256'], {})
        self.assertEqual(snapshot, before)

    def snapshot(self):
        def node(identifier, state):
            return {'id': identifier, 'revision': 1, 'kind': 'capability',
                    'fields': {'name': identifier}, 'source_refs': ['U1'],
                    'review': {'state': state, 'note': ''}}
        def relation(identifier, source, target, state='under_review'):
            return {'id': identifier, 'revision': 1, 'type': 'relates-to',
                    'source_id': source, 'target_id': target, 'source_refs': ['U1'],
                    'review': {'state': state, 'note': ''}}
        return {'nodes': [node('CAP', 'proposed'), node('EXAMPLE', 'illustration')],
                'relations': [relation('TO-EXAMPLE', 'CAP', 'EXAMPLE'),
                              relation('FROM-EXAMPLE', 'EXAMPLE', 'CAP'),
                              relation('BUSINESS', 'CAP', 'CAP'),
                              relation('ILL-LINK', 'CAP', 'CAP', 'illustration')]}

    def test_links_to_excluded_illustrations_stay_out_even_when_under_review(self):
        snapshot = self.snapshot()
        before = deepcopy(snapshot)
        release = publisher.compile_snapshot(snapshot, {'decisions': []}, '2099-01-01.1', ['U1'])
        self.assertEqual([r['id'] for r in release['relations']], ['BUSINESS'])
        self.assertEqual([n['id'] for n in release['nodes']], ['CAP'])
        self.assertEqual(publisher.relations_to_illustrations(snapshot), {'TO-EXAMPLE', 'FROM-EXAMPLE'})
        self.assertEqual(snapshot, before)

    def test_missing_endpoint_is_not_hidden_by_illustration_filter(self):
        snapshot = self.snapshot()
        broken = deepcopy(snapshot['relations'][2])
        broken.update(id='BROKEN', target_id='MISSING')
        snapshot['relations'].append(broken)
        release = publisher.compile_snapshot(snapshot, {'decisions': []}, '2099-01-01.1', ['U1'])
        self.assertIn(broken['id'], [r['id'] for r in release['relations']])
        self.assertNotIn(broken['id'], publisher.relations_to_illustrations(snapshot))


class PublicationEvidenceTests(unittest.TestCase):
    def test_live_changes_do_not_replace_frozen_proof(self):
        frozen = {'records': [source('U1', 'original proof')]}
        live = {'records': [source('U1', 'later context'), source('U2', 'publish'), source('U3', 'unrelated')]}
        merged = publisher.publication_sources(frozen, live, ['U2'])
        self.assertEqual(merged['records'], [frozen['records'][0], live['records'][1]])
        self.assertEqual(frozen['records'][0]['captured_text'], 'original proof')

    def test_explicit_reuse_of_contradictory_frozen_id_rejected(self):
        frozen = {'records': [source('U1', 'original')]}
        with self.assertRaisesRegex(ValueError, 'contradictory'):
            publisher.publication_sources(frozen, {'records': [source('U1', 'different')]}, ['U1'])

    def test_bad_new_proof_and_unknown_id_rejected(self):
        corrupt = source('U2', 'new')
        corrupt['captured_text'] = 'altered without hash'
        for live, refs in (({'records': [corrupt]}, ['U2']), ({'records': []}, ['U2'])):
            with self.subTest(refs=refs), self.assertRaises(ValueError):
                publisher.publication_sources({'records': []}, live, refs)

    def test_failed_atomic_activation_keeps_old_pointer(self):
        with isolated_project() as folder:
            path = folder / 'current.json'
            save(path, {'version': 'old'})
            before = path.read_bytes()
            with patch.object(publisher.os, 'replace', side_effect=OSError('simulated interruption')):
                with self.assertRaises(OSError):
                    publisher.activate_pointer(path, {'version': 'new'})
            self.assertEqual(path.read_bytes(), before)
            self.assertEqual(list(folder.glob('.current-*.tmp')), [])


class PublicationWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = isolated_project()
        self.root = self.temp.__enter__()
        self.addCleanup(self.temp.__exit__, None, None, None)
        # Copy only inputs used by the publisher, never the live backlog.
        from scripts.git_history import read_bytes
        shutil.copytree(ROOT / 'modeles/schemas', self.root / 'modeles/schemas')
        manifest_path = ROOT / 'modeles/release/2026-09-13.2/manifest.json'
        manifest = publisher.read(manifest_path)
        paths = [manifest_path, manifest_path.parent / 'model.json', ROOT / 'modeles/provenance/source-records.json']
        paths += [(manifest_path.parent / manifest[key + '_path']).resolve() for key in ('input_revision', 'decisions', 'provenance')]
        for source_path in paths:
            target = self.root / source_path.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(read_bytes(source_path))
        save(self.root / 'modeles/release/current.json', {'version': 'unchanged'})
        self.manifest = self.root / 'modeles/release/2026-09-13.2/manifest.json'
        self.version = '2026-09-13.99'
        live_path = self.root / 'modeles/provenance/source-records.json'
        live = publisher.read(live_path)
        live['records'].append(source('PUB-TEST-NEW', 'Authorized next publication'))
        save(live_path, live)

    def test_publication_uses_frozen_inputs_and_activates_last(self):
        original = (self.manifest.parent / 'model.json').read_bytes()
        result = publisher.publish(self.manifest, self.version, ['PUB-TEST-NEW'], activate=True)
        self.assertEqual((result['capability_count'], result['complete_capability_count']), (36, 9))
        current = publisher.read(self.root / 'modeles/release/current.json')
        self.assertEqual(current['version'], self.version)
        self.assertEqual((self.manifest.parent / 'model.json').read_bytes(), original)
        proof = publisher.read(self.root / f'modeles/provenance/{self.version}/source-records.json')
        self.assertIn('PUB-TEST-NEW', {record['id'] for record in proof['records']})
        with self.assertRaisesRegex(ValueError, 'already exists'):
            publisher.publish(self.manifest, self.version, ['PUB-TEST-NEW'])

    def test_validation_failure_creates_no_publication(self):
        with self.assertRaisesRegex(ValueError, 'Unknown publication source'):
            publisher.publish(self.manifest, self.version, ['ABSENT'])
        self.assertFalse((self.root / f'modeles/release/{self.version}').exists())
        self.assertFalse((self.root / f'modeles/provenance/{self.version}').exists())
        self.assertEqual(publisher.read(self.root / 'modeles/release/current.json')['version'], 'unchanged')

    def test_tampered_frozen_provenance_rejected_before_writes(self):
        manifest = publisher.read(self.manifest)
        frozen = (self.manifest.parent / manifest['provenance_path']).resolve()
        frozen.write_text(frozen.read_text(encoding='utf-8') + ' ', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'digest mismatch'):
            publisher.publish(self.manifest, self.version, ['PUB-TEST-NEW'])
        self.assertFalse((self.root / f'modeles/release/{self.version}').exists())

    def test_unsafe_or_ambiguous_versions_rejected(self):
        for version in ('../escape', 'C:escape', 'CON', '2026-09-13.3 ', '2026-09-13.0', '2026-99-99.1'):
            with self.subTest(version=version), self.assertRaises(ValueError):
                publisher.publish(self.manifest, version, ['PUB-TEST-NEW'])


if __name__ == '__main__':
    unittest.main()
