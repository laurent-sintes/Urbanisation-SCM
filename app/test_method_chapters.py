"""Published methodology chapters remain optional and reject unsafe references."""
import unittest
from copy import deepcopy
from pathlib import Path
from scripts.structured_io import read
from app.modeling_guide import _validate_guide, ModelingGuideError

ROOT = Path(__file__).resolve().parents[1]

class ChapterContractTests(unittest.TestCase):
    def test_transformation_candidate_keeps_legacy_contract_and_resolves_terms(self):
        guide = read(ROOT / 'modeles/backlog/atlas-transformation-methodology.yaml')
        _validate_guide(guide, guide['version'])
        for mutation in ('missing_dimension', 'unknown_visual', 'broken_link', 'svg_script', 'svg_external'):
            invalid = deepcopy(guide)
            if mutation == 'missing_dimension': invalid['chapters'][0]['visual']['items'].pop()
            if mutation == 'unknown_visual': invalid['chapters'][0]['visual']['kind'] = 'external-svg'
            if mutation == 'broken_link': invalid['chapters'][1]['sections'][0]['text'] = '[DDD](method:MOD999)'
            if mutation == 'svg_script': invalid['chapters'][0]['visual']['overview_svg'] = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
            if mutation == 'svg_external': invalid['chapters'][0]['visual']['overview_svg'] = '<svg xmlns="http://www.w3.org/2000/svg"><style>text{fill:url(//example.com/remote)}</style></svg>'
            with self.subTest(mutation=mutation), self.assertRaises(ModelingGuideError):
                _validate_guide(invalid, invalid['version'])
        canonical = read(ROOT / 'modeles/backlog/modeling-glossary.yaml')
        for term in guide['glossary']['terms']:
            if int(term['id'][3:]) >= 32:
                source = next(t for t in canonical['terms'] if t['id'] == term['id'])
                self.assertEqual(term['definition'], source['definition'])

    def test_simplified_glossary_covers_each_visible_term_once(self):
        guide = read(ROOT / 'modeles/backlog/atlas-methodology-glossary-U806.yaml')
        _validate_guide(guide, guide['version'])
        glossary = guide['glossary']
        self.assertNotIn('MOD004', [t['id'] for t in glossary['terms']])
        values = next(t for t in glossary['terms'] if t['id'] == 'MOD007')['values']
        types = read(ROOT / 'modeles/backlog/capability-types-U449.yaml')['types']
        self.assertEqual(values, {t['label_fr']: t['definition'] for t in types})
        self.assertEqual(sum(len(g['term_ids']) for g in glossary['groups']), 21)
        glossary['groups'][0]['term_ids'].append('MOD015')
        with self.assertRaisesRegex(ModelingGuideError, 'incomplets ou dupliqués'):
            _validate_guide(guide, guide['version'])

    def test_ux_guide_links_resolve_and_maintenance_notes_stay_separate(self):
        guide = read(ROOT / 'modeles/backlog/atlas-methodology-ux.yaml')
        _validate_guide(guide, guide['version'])
        scenario = next(t for t in guide['glossary']['terms'] if t['id'] == 'MOD027')
        self.assertTrue(scenario['editorial_notes'])
        self.assertFalse(any('scenario_catalog' in n for n in scenario['notes']))
        guide['chapters'][0]['intro'] = '[Absente](method:MOD999)'
        with self.assertRaisesRegex(ModelingGuideError, 'non résolue'):
            _validate_guide(guide, guide['version'])

    def setUp(self):
        self.guide = read(ROOT / 'modeles/backlog/atlas-methodology-U788.yaml')

    def test_new_and_legacy_guides(self):
        _validate_guide(self.guide, self.guide['version'])
        legacy = deepcopy(self.guide)
        legacy.pop('chapters')
        _validate_guide(legacy, legacy['version'])

    def test_missing_duplicate_and_unsafe_chapters(self):
        for mutation in ('missing', 'duplicate', 'url', 'notes'):
            guide = deepcopy(self.guide)
            if mutation == 'missing': guide['chapters'].pop()
            if mutation == 'duplicate': guide['chapters'][1]['id'] = 'start'
            if mutation == 'url': guide['chapters'][0]['sections'][0]['url'] = 'javascript:alert(1)'
            if mutation == 'notes': guide['glossary']['terms'][0]['notes'] = 'invalid'
            with self.subTest(mutation=mutation), self.assertRaises(ModelingGuideError):
                _validate_guide(guide, guide['version'])

    def test_short_method_definitions_are_optional_nonempty_text(self):
        guide = read(ROOT / 'modeles/backlog/atlas-methodology-U797.yaml')
        _validate_guide(guide, guide['version'])
        for value in ('', None, 12, ['definition']):
            invalid = deepcopy(guide)
            invalid['glossary']['terms'][0]['short_description'] = value
            with self.subTest(value=value), self.assertRaises(ModelingGuideError):
                _validate_guide(invalid, invalid['version'])
