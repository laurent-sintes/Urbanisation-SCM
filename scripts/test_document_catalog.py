"""A document belongs to one publication and cannot point outside its verified assets."""

import hashlib
from pathlib import Path
import tempfile
import unittest

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


if __name__ == '__main__':
    unittest.main()
