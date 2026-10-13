"""A document belongs to one publication and cannot point outside its verified assets."""

import hashlib
import io
from pathlib import Path
import tempfile
import unittest
import zipfile

from scripts.document_catalog import asset_bytes, validate_catalog


class DocumentCatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.payload = b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n'
        self.digest = hashlib.sha256(self.payload).hexdigest()
        path = self.root / 'modeles/documents' / f'{self.digest}.pdf'
        path.parent.mkdir(parents=True)
        path.write_bytes(self.payload)
        self.document = {
            'id': 'DOC001',
            'asset': {'path': f'modeles/documents/{self.digest}.pdf', 'sha256': self.digest,
                      'media_type': 'application/pdf'},
        }
        self.model = {
            'document_catalog': {'documents': [self.document]},
            'hotspot_catalog': {'hotspots': [{'id': 'HS-001', 'document_ids': ['DOC001']}]},
        }

    def test_asset_and_hotspot_link(self):
        self.assertEqual(validate_catalog(self.model, self.root), [])
        self.assertEqual(asset_bytes(self.root, self.document), self.payload)

    def test_missing_link_and_duplicate_document(self):
        self.model['hotspot_catalog']['hotspots'][0]['document_ids'] = ['DOC999']
        self.assertIn('HS-001: missing document DOC999', validate_catalog(self.model, self.root))
        self.model['document_catalog']['documents'].append(self.document)
        self.assertIn('document_catalog: duplicate identity DOC001', validate_catalog(self.model, self.root))

    def test_tamper_and_path_traversal(self):
        path = self.root / self.document['asset']['path']
        path.write_bytes(b'%PDF-1.4\nchanged')
        self.assertIn('fingerprint or format differs', ' '.join(validate_catalog(self.model, self.root)))
        self.document['asset']['path'] = '../outside.pdf'
        self.assertIn('invalid document path', ' '.join(validate_catalog(self.model, self.root)))

    def test_pptx_native_format_and_mime_must_agree(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as archive:
            archive.writestr('[Content_Types].xml',
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
                '</Types>')
            archive.writestr('ppt/presentation.xml', '<presentation/>')
        payload = stream.getvalue()
        digest = hashlib.sha256(payload).hexdigest()
        document = {'id': 'DOC002', 'asset': {
            'path': f'modeles/documents/{digest}.pptx', 'sha256': digest,
            'media_type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'}}
        (self.root / document['asset']['path']).write_bytes(payload)
        self.assertEqual(asset_bytes(self.root, document), payload)
        document['asset']['media_type'] = 'application/pdf'
        with self.assertRaisesRegex(ValueError, 'invalid document path'):
            asset_bytes(self.root, document)

    def test_generic_zip_cannot_masquerade_as_pptx(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as archive:
            archive.writestr('unrelated.txt', 'Not a presentation')
        payload = stream.getvalue()
        digest = hashlib.sha256(payload).hexdigest()
        document = {'id': 'DOC002', 'asset': {
            'path': f'modeles/documents/{digest}.pptx', 'sha256': digest,
            'media_type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'}}
        (self.root / document['asset']['path']).write_bytes(payload)
        with self.assertRaisesRegex(ValueError, 'fingerprint or format differs'):
            asset_bytes(self.root, document)

    def test_schema_rejects_extension_mime_mismatch(self):
        from scripts.json_contract import validate
        from scripts.structured_io import read
        schema = read(Path(__file__).resolve().parents[1] / 'modeles/schemas/urbanism.schema.json')
        asset_schema = schema['properties']['document_catalog']['properties']['documents']['items']['properties']['asset']
        pdf = self.document['asset']
        self.assertFalse(validate(pdf, asset_schema))
        pptx = dict(pdf, path=f'modeles/documents/{self.digest}.pptx',
                    media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')
        self.assertFalse(validate(pptx, asset_schema))
        self.assertTrue(validate(dict(pptx, media_type='application/pdf'), asset_schema))
        self.assertTrue(validate(dict(pdf, path=f'modeles/documents/{self.digest}.pptm'), asset_schema))


if __name__ == '__main__':
    unittest.main()
