"""The exported metamodel and transformation guide own distinct glossaries."""
import unittest

from scripts.atlas_documentation import separate_documentation


class DocumentationSplitTests(unittest.TestCase):
    def test_documents_keep_only_their_own_terms_and_chapters(self):
        response = {'status': 'available', 'guide': {
            'version': '2026-10-09.2', 'title': 'Transformation',
            'chapters': [{'id': name} for name in ('start', 'metamodel', 'method', 'references')],
            'lessons': [{'id': 'one'}],
            'glossary': {
                'terms': [{'id': 'MOD008', 'name': 'Domain'},
                          {'id': 'MOD032', 'name': 'Enterprise Architecture Practice'}],
                'model_term_ids': ['TER030'], 'aliases': {'TER030': 'MOD008'},
                'groups': [{'id': 'objects', 'term_ids': ['MOD008']},
                           {'id': 'transformation', 'term_ids': ['MOD032']}],
            },
        }}
        model = {'glossary': {'terms': [{'id': 'TER030', 'name': 'Domain'}]}}
        metamodel, transformation = separate_documentation(response, model)
        self.assertEqual([term['id'] for term in metamodel['glossary']['terms']], ['MOD008'])
        self.assertEqual([term['id'] for term in metamodel['glossary']['business_terms']], ['TER030'])
        self.assertEqual([term['id'] for term in transformation['guide']['glossary']['terms']], ['MOD032'])
        self.assertEqual([chapter['id'] for chapter in metamodel['chapters']], ['metamodel', 'method'])
        self.assertEqual([chapter['id'] for chapter in transformation['guide']['chapters']], ['start', 'references'])
        self.assertEqual(transformation['guide']['lessons'], [])
        self.assertEqual(response['guide']['glossary']['terms'][0]['id'], 'MOD008')

    def test_old_guide_remains_readable_without_an_explicit_split(self):
        response = {'status': 'available', 'guide': {'version': 'old', 'glossary': {'terms': []}}}
        self.assertEqual(separate_documentation(response, {}), (None, response))
