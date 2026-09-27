"""Published methodology chapters remain optional and reject unsafe references."""
import unittest
from copy import deepcopy
from pathlib import Path
from scripts.structured_io import read
from app.modeling_guide import _validate_guide, ModelingGuideError

ROOT = Path(__file__).resolve().parents[1]

class ChapterContractTests(unittest.TestCase):
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
