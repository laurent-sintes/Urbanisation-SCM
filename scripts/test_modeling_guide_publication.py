from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import unittest
from scripts.structured_io import dumps, read
from scripts.modeling_guide_publication import capture_association, verify_association, carry_association, validate_model_links
from scripts.test_publish_release import isolated_project

class MethodologyPublicationTests(unittest.TestCase):
    def setUp(self):
        # Inherit workspace ACLs, like the other publication fixtures. Python's
        # TemporaryDirectory(mode=0700) excludes restricted Windows tokens.
        self.root = self.enterContext(isolated_project())
        self.folder = self.root / 'modeles/modeling-guides'
        (self.folder / 'versions').mkdir(parents=True)
        self.guide = self.folder / 'versions/2026-09-19.1.yaml'
        self.guide.write_text('version: 2026-09-19.1\n', encoding='utf-8')
        self.index = {'guides':[{'version':'2026-09-19.1','path':'versions/2026-09-19.1.yaml','sha256':sha256(self.guide.read_bytes()).hexdigest()}],
                      'associations':[{'publication_version':'2026-09-19.2','guide_version':'2026-09-19.1','scope':'explicit','note':'test'}]}
        self.write_index()

    def write_index(self):
        (self.folder/'index.yaml').write_text(dumps(self.index),encoding='utf-8')

    def test_explicit_association_carried_without_touching_guide_or_previous_association(self):
        before = self.guide.read_bytes()
        frozen=capture_association(self.root,'2026-09-19.2')
        carry_association(self.root,'2026-09-19.2','2026-09-19.3',frozen)
        index=read(self.folder/'index.yaml')
        self.assertEqual(index['associations'][0],self.index['associations'][0])
        self.assertEqual(index['associations'][1]['guide_version'],'2026-09-19.1')
        self.assertEqual(before,self.guide.read_bytes())

    def test_unassociated_publication_does_not_take_latest_guide(self):
        self.assertIsNone(capture_association(self.root,'2026-09-18.1'))

    def test_model_links_use_only_the_explicit_frozen_guide(self):
        model = {'nodes': [], 'relations': [], 'scenario_catalog': {'note': '[Méthode](method:MOD050)'}}
        # A canonical term in the fixture must not complete the frozen guide.
        canonical = self.root / 'modeles/backlog/modeling-glossary.yaml'
        canonical.parent.mkdir(parents=True, exist_ok=True)
        canonical.write_text(dumps({'terms': [{'id': 'MOD050', 'definition': 'Current only'}]}), encoding='utf-8')
        frozen = {'glossary': {'terms': [{'id': 'MOD001', 'definition': 'Frozen'}]}}
        self.assertIn('method: unresolved published link MOD050', validate_model_links(self.root, model, None, guide=frozen))
        self.assertEqual(validate_model_links(self.root, model, None), [])

    def test_changed_index_or_corrupt_frozen_guide_prevents_carry(self):
        frozen=capture_association(self.root,'2026-09-19.2')
        self.index['associations'][0]['note']='changed'; self.write_index()
        with self.assertRaises(ValueError): verify_association(self.root,'2026-09-19.2',frozen)
        self.guide.write_text('tampered',encoding='utf-8')
        with self.assertRaises(ValueError): capture_association(self.root,'2026-09-19.2')

    def test_duplicate_or_outside_path_rejected(self):
        self.index['associations'].append(deepcopy(self.index['associations'][0]));self.write_index()
        with self.assertRaises(ValueError): capture_association(self.root,'2026-09-19.2')
        self.index['associations'].pop(); self.index['guides'][0]['path']='../backlog/model.yaml';self.write_index()
        with self.assertRaises(ValueError): capture_association(self.root,'2026-09-19.2')
