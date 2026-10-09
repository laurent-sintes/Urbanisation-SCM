"""The assembled guide must teach the current responsibility hierarchy."""
from pathlib import Path
import re
import unittest

from scripts.guide_candidate import load_draft
from scripts.structured_io import read


ROOT = Path(__file__).resolve().parents[1]
DRAFT = 'modeles/backlog/atlas-transformation-methodology.yaml'


class MethodResponsibilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.guide = load_draft(ROOT, DRAFT)
        cls.canonical = {term['id']: term for term in read(
            ROOT / 'modeles/backlog/modeling-glossary.yaml')['terms']}
        cls.assembled = {term['id']: term for term in cls.guide['glossary']['terms']}
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')
        method = next(chapter for chapter in cls.guide['chapters'] if chapter['id'] == 'method')
        cls.responsibility = next(section for section in method['sections']
                                  if section['title'] == 'Regrouper par responsabilité')

    def test_current_definitions_are_assembled_from_one_authority(self):
        for identifier in ('MOD008', 'MOD013'):
            with self.subTest(term=identifier):
                self.assertEqual(self.assembled[identifier]['definition'],
                                 self.canonical[identifier]['definition'])
                self.assertIn('(method:MOD039)', self.assembled[identifier]['definition'])
                self.assertNotIn('éventuellement Business Areas',
                                 self.assembled[identifier]['definition'])
                self.assertNotIn('lorsque cela est utile',
                                 self.assembled[identifier]['definition'])
        self.assertEqual(self.assembled['MOD013']['notes'], self.canonical['MOD013']['notes'])

    def test_active_guidance_never_allows_a_direct_capability_parent(self):
        active = '\n'.join([
            self.responsibility['text'], self.responsibility['example'],
            *self.assembled['MOD013']['notes']])
        for obsolete in ('directement ou via une Business Area',
                         'rattacher les capacités directement au sous-domaine',
                         'restent directement rattachées'):
            with self.subTest(obsolete=obsolete):
                self.assertNotIn(obsolete, active)
        self.assertIn('exactement une', self.responsibility['text'])
        self.assertIn('une seule capacité', self.responsibility['text'])
        self.assertNotRegex(self.canonical['MOD013']['market_comparison']['flow_position'],
                            r'(?i)\b(huit|8) sous-domaines')

    def test_control_plane_example_uses_existing_areas_and_references(self):
        example = self.responsibility['example']
        links = set(re.findall(r'\]\(model:([^\)]+)\)', example))
        areas = {'ba-protection-policies', 'ba-service-provider-controls'}
        self.assertTrue(areas <= links)
        self.assertIn('subdomain-policies', links)
        self.assertIn('D19.a', links)
        self.assertIn('objets documentaires', example)
        nodes = {node['id']: node for node in self.model['nodes']}
        self.assertTrue(links <= nodes.keys())
        contracts = {item['node_id']: item for item in self.guide['model_examples']}
        for area in areas:
            with self.subTest(area=area):
                self.assertEqual(nodes[area]['kind'], 'business_area')
                self.assertEqual(contracts[area]['parent_id'], 'subdomain-policies')
                self.assertEqual(contracts[area]['name'], nodes[area]['fields']['name'])
        children = [rel['target_id'] for rel in self.model['relations']
                    if rel['type'] == 'presents'
                    and rel['source_id'] == 'ba-service-provider-controls']
        self.assertEqual(len(children), 1)
        self.assertEqual(children, ['D19.a'])
        self.assertEqual(nodes[children[0]]['kind'], 'reference')
