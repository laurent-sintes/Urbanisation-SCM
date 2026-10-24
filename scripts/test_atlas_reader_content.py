import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from scripts.atlas_reader_content import reading_projection, reader_vocabulary, reader_content_inputs, scoped_projection, compile_reader_content
from scripts.check_atlas_text import check
from scripts.atlas_text import ReaderError, load_resources, CATALOGS
from scripts.atlas_metamodel import describe_metamodel


class ReaderContentTests(unittest.TestCase):
    def test_catalog_split_preserves_export_fingerprints_and_rejects_duplicate_keys(self):
        root = Path(__file__).resolve().parents[1]
        resources = load_resources(root)
        export_texts = {key: value for key, value in resources.items()
                        if key.startswith(('metamodelExport.', 'documentationExport.'))}
        expected = hashlib.sha256(json.dumps(export_texts, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        self.assertEqual(reader_content_inputs(root)['export_texts'], expected)
        with tempfile.TemporaryDirectory() as directory:
            fixture = Path(directory)
            folder = fixture / 'app/locales/fr'
            folder.mkdir(parents=True)
            for name in CATALOGS:
                (folder / f'{name}.json').write_text('{}')
            (folder / 'core.json').write_text('{"duplicate": "first"}')
            (folder / 'ui.json').write_text('{"duplicate": "second"}')
            with self.assertRaisesRegex(ValueError, 'Duplicate text resources'):
                load_resources(fixture)

    def test_authoring_bindings_cannot_introduce_alternative_business_prose(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            folder = root / 'app/content'
            folder.mkdir(parents=True)
            original = 'U1 : Keep this condition.'
            (folder / 'legacy-reader-projections.json').write_text(json.dumps({'entries': {'T': {
                'source_sha256': hashlib.sha256(original.encode()).hexdigest(), 'text': 'Keep this condition.'
            }}}), encoding='utf-8')
            model = {'version': 'work', 'nodes': [{'id': 'N', 'fields': {'scope': original}}]}
            binding = {'collection': 'nodes', 'id': 'N', 'field_path': ['fields', 'scope'], 'legacy_text_ref': 'T'}
            source = {'schema_version': 1, 'entries': [binding]}
            content = compile_reader_content(root, source, model)
            self.assertEqual(content['entries'][0]['text'], 'Keep this condition.')
            binding['text'] = 'A new interpretation.'
            with self.assertRaisesRegex(ValueError, 'reference-only'):
                compile_reader_content(root, source, model)
    def test_prepared_reader_content_follows_identity_and_refuses_stale_or_duplicate_fields(self):
        source = 'Unchanged canonical paragraph.'
        content = {'schema_version': 1, 'entries': [{'collection': 'nodes', 'id': 'N', 'field_path': ['fields', 'scope'],
                   'source_sha256': hashlib.sha256(source.encode()).hexdigest(), 'text': 'Frozen public paragraph.'}]}
        model = {'version': 'new', 'nodes': [{'id': 'other'}, {'id': 'N', 'fields': {'scope': source}}]}
        projection = scoped_projection(model, content)
        self.assertEqual(projection['patches'][0]['path'], ['nodes', '1', 'fields', 'scope'])
        self.assertEqual(projection['publication_version'], 'new')
        content['entries'].append(content['entries'][0])
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            scoped_projection(model, content)
        content['entries'].pop()
        model['nodes'][1]['fields']['scope'] = 'Edited canonical paragraph.'
        with self.assertRaisesRegex(ValueError, 'differs'):
            scoped_projection(model, content)
    def test_type_names_are_resolved_by_persistent_term_identity(self):
        model = {'version': 'isolated', 'nodes': [{'id': 'D', 'kind': 'domain', 'fields': {'name': 'Business name'}}],
                 'relations': []}
        guide = {'status': 'available', 'guide': {'version': 'guide', 'glossary': {'terms': [
            {'id': 'MOD008', 'name': 'Renamed type', 'definition': 'Definition from this edition.'}
        ]}}}
        descriptor = describe_metamodel(model, guide)['node_types'][0]
        self.assertEqual(descriptor['label'], 'Renamed type')
        self.assertEqual(descriptor['definition_source'], 'method:MOD008')
        model['nodes'][0]['kind'] = 'universe'
        guide['guide']['glossary']['terms'][0]['id'] = 'MOD043'
        root_type = describe_metamodel(model, guide)['node_types'][0]
        self.assertEqual(root_type['label'], 'Renamed type')
        model['nodes'][0]['fields']['name'] = 'Renamed root instance'
        self.assertEqual(describe_metamodel(model, guide)['node_types'][0], root_type)

    def test_legacy_text_and_vocabulary_are_frozen_compatibility_data(self):
        root = Path(__file__).resolve().parents[1] / 'app/content'
        for name, expected in {
            'legacy-reader-projections.json': 'dcc2141c6c93cc9bd5c7b80e1533b6e80706b073c2aa7d01bed2f19a3b4f8244',
            'legacy-vocabulary.json': '02b001c7d6c1f13a2127d4ed1f39caa520a1ddf5bfc5ae3f5f1dcffe89cc036a',
        }.items():
            self.assertEqual(hashlib.sha256((root / name).read_bytes()).hexdigest(), expected)

    def test_python_reader_has_no_embedded_copy_and_resource_arguments_match(self):
        self.assertEqual(check(), [])

    def test_projection_is_explicit_pinned_and_rejects_a_changed_source(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            content = root / 'app/content'
            content.mkdir(parents=True)
            source = 'U1 : Original business condition.'
            manifest = {'versions': {'fixed': {'profile': 'P'}},
                        'profiles': {'P': ['patch-1']}, 'patches': {'patch-1': ['nodes/0/fields/definition', 'T']},
                        'entries': {'T': {'source_sha256': hashlib.sha256(source.encode()).hexdigest(),
                                          'text': 'Original business condition.'}}}
            path = content / 'legacy-reader-projections.json'
            path.write_text(json.dumps(manifest), encoding='utf-8')
            model = {'version': 'fixed', 'nodes': [{'fields': {'definition': source}}]}
            projection = reading_projection(root, model)
            self.assertEqual(projection['publication_version'], 'fixed')
            self.assertEqual(projection['patches'][0]['text'], 'Original business condition.')
            self.assertEqual(model['nodes'][0]['fields']['definition'], source)
            self.assertIsNone(reading_projection(root, {**model, 'version': 'new'}))
            model['nodes'][0]['fields']['definition'] = 'Changed business condition.'
            with self.assertRaisesRegex(ValueError, 'differs'):
                reading_projection(root, model)
            before = reader_content_inputs(root)
            manifest['entries']['T']['text'] = 'Explicit revised projection.'
            path.write_text(json.dumps(manifest), encoding='utf-8')
            self.assertNotEqual(reader_content_inputs(root), before)
            model['nodes'][0]['fields']['definition'] = source
            self.assertEqual(reading_projection(root, model)['patches'][0]['text'], 'Explicit revised projection.')

    def test_new_editions_use_only_their_associated_vocabulary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            content = root / 'app/content'
            content.mkdir(parents=True)
            (content / 'legacy-vocabulary.json').write_text(json.dumps({
                'publication_versions': ['old'], 'vocabulary': {'field_labels': {'name': 'Historical label'}}
            }), encoding='utf-8')
            self.assertEqual(reader_vocabulary(root, {'version': 'new'}, {}), {})
            associated = {'guide': {'reader_vocabulary': {'field_labels': {'name': 'Edition label'}}}}
            self.assertEqual(reader_vocabulary(root, {'version': 'new'}, associated)['field_labels']['name'], 'Edition label')
            self.assertEqual(reader_vocabulary(root, {'version': 'old'}, {})['field_labels']['name'], 'Historical label')

    def test_structured_errors_retain_a_readable_message_and_machine_code(self):
        error = ReaderError('server.requete_invalide')
        self.assertEqual(str(error), 'Requête invalide.')
        self.assertEqual(error.code, 'server.requete_invalide')
        self.assertEqual(error.parameters, {})


if __name__ == '__main__':
    unittest.main()
