"""Working references must freeze into a complete, immutable guide."""
from pathlib import Path
from copy import deepcopy
import json
import tempfile
import unittest

from scripts import guide_candidate as guide
from scripts.structured_io import read, dumps

ROOT = Path(__file__).resolve().parents[1]
DRAFT = 'modeles/backlog/atlas-transformation-methodology.yaml'


class GuideSourceTests(unittest.TestCase):
    def test_reference_notice_links_use_existing_chapters_and_sections(self):
        from app.modeling_guide import _validate_guide
        document = deepcopy(self.expected)
        document['glossary']['terms'][0]['notes'] = ['[Source](guide:references#method-section-0)']
        _validate_guide(document, document['version'])
        for link in ('guide:missing', 'guide:references#method-section-99'):
            document['glossary']['terms'][0]['notes'] = ['[Source](' + link + ')']
            with self.subTest(link=link), self.assertRaises(ValueError):
                _validate_guide(document, document['version'])

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.expected = read(ROOT / 'modeles/modeling-guides/versions/2026-09-28.2.yaml')
        # A frozen fixture tests compilation independently of the evolving backlog.
        draft = deepcopy(self.expected)
        canonical = {'terms': deepcopy(draft['glossary']['terms'])}
        draft['glossary']['canonical_source'] = guide.CANONICAL_GLOSSARY
        for term in draft['glossary']['terms']:
            fields = [f for f in sorted(guide.SHARED_FIELDS) if f in term]
            term['canonical_fields'] = fields
            for field in fields:
                del term[field]
        for name, document in ((DRAFT, draft), (guide.CANONICAL_GLOSSARY, canonical)):
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(dumps(document), encoding='utf-8')
        registry = self.root / 'modeles/provenance/source-records.json'
        registry.parent.mkdir(parents=True)
        registry.write_text(json.dumps({'records': [{'id': i} for i in self.expected['source_refs']]}))
        self.stage = self.root / 'stage'
        self.stage.mkdir()

    def test_references_reconstruct_the_exact_previous_content(self):
        self.assertEqual(guide.load_draft(self.root, DRAFT), self.expected)
        frozen = guide.stage(self.root, DRAFT, self.stage)
        self.assertEqual(guide.verify(self.root, self.stage, frozen), self.expected)
        self.assertEqual(set(frozen['source_inputs']), {DRAFT, guide.CANONICAL_GLOSSARY})
        self.assertNotIn('canonical_source', read(self.stage / frozen['path'])['glossary'])

    def test_dependency_change_blocks_activation(self):
        frozen = guide.stage(self.root, DRAFT, self.stage)
        path = self.root / guide.CANONICAL_GLOSSARY
        path.write_bytes(path.read_bytes() + b'\n# changed after preparation\n')
        with self.assertRaisesRegex(ValueError, 'dependencies changed'):
            guide.verify(self.root, self.stage, frozen)
        self.assertEqual(read(self.stage / frozen['path']), self.expected)

    def test_missing_term_and_override_fail_closed(self):
        original = read(self.root / DRAFT)
        for mutation in ('missing', 'override', 'source'):
            document = deepcopy(original)
            if mutation == 'missing': document['glossary']['terms'][0]['id'] = 'MOD999'
            if mutation == 'override': document['glossary']['terms'][0]['definition'] = 'Second authority'
            if mutation == 'source': document['glossary']['canonical_source'] = '../outside.yaml'
            (self.root / DRAFT).write_text(dumps(document), encoding='utf-8')
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                guide.load_draft(self.root, DRAFT)

    def test_self_contained_legacy_source_is_still_supported(self):
        path = self.root / DRAFT
        path.write_text(dumps(self.expected), encoding='utf-8')
        content, result, dependencies = guide.compile_draft(self.root, path)
        self.assertEqual(content, path.read_bytes())
        self.assertEqual(result, self.expected)
        self.assertEqual(set(dependencies), {DRAFT})

    def test_model_examples_freeze_their_model_dependency(self):
        draft = read(self.root / DRAFT)
        draft['model_examples'] = [{'node_id': 'atp', 'name': 'ATP', 'nature': 'decision'}]
        # This test adds a current-model contract to a historical fixture:
        # remove its unrelated obsolete explanatory examples first.
        content = dumps(draft)
        for old in ('ATP, CTP et PTP sont de type Evaluation', 'Promise Selection Decision choisit',
                    'Les catégories regroupent des capacités'):
            content = content.replace(old, 'Exemple isolé du test')
        (self.root / DRAFT).write_text(content, encoding='utf-8')
        model_path = self.root / 'modeles/backlog/model.yaml'
        model_path.write_text(dumps({'nodes': [{'id': 'atp', 'fields': {'name': 'ATP', 'nature': 'decision'}}], 'relations': []}), encoding='utf-8')
        frozen = guide.stage(self.root, DRAFT, self.stage)
        self.assertIn('modeles/backlog/model.yaml', frozen['source_inputs'])
        model_path.write_bytes(model_path.read_bytes() + b'\n# new input\n')
        with self.assertRaisesRegex(ValueError, 'dependencies changed'):
            guide.verify(self.root, self.stage, frozen)
