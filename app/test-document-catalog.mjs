import assert from 'node:assert/strict';
import test from 'node:test';
import { documentDownloadName, documentFormat, documentsForHotspot, documentUrl } from './src/documentCatalog.ts';
import { readRoute, routeHash } from './src/navigation.ts';

test('document links stay within the selected publication', () => {
  const document = { id: 'DOC001', title: 'Synthèse', asset: { path: 'modeles/documents/source.pdf' } };
  const model = { version: '2026-10-10.2', raw: { document_catalog: { documents: [document] } } };
  assert.deepEqual(documentsForHotspot(model, ['DOC001']), [document]);
  assert.deepEqual(documentsForHotspot(model, ['DOC999']), []);
  assert.equal(documentUrl(model, document), './data/2026-10-10.2/documents/DOC001.pdf');
  const route = readRoute(routeHash({ view: 'documents', version: model.version, document: 'DOC001' }));
  assert.equal(route.view, 'documents');
  assert.equal(route.version, model.version);
  assert.equal(route.document, 'DOC001');
});

test('PDF and PPTX links preserve format and the selected publication', () => {
  const model = { version: '2026-10-13.2' };
  const pdf = { id: 'DOC002', asset: { media_type: 'application/pdf' } };
  const pptx = {
    id: 'DOC003',
    asset: { media_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  };
  assert.equal(documentFormat(pdf), 'PDF');
  assert.equal(documentFormat(pptx), 'PPTX');
  assert.equal(documentDownloadName(pdf), 'flow-atlas-DOC002.pdf');
  assert.equal(documentDownloadName(pptx), 'flow-atlas-DOC003.pptx');
  assert.equal(documentUrl(model, pptx), './data/2026-10-13.2/documents/DOC003.pptx');
  assert.equal(documentUrl({ version: '2026-10-10.2' }, pdf), './data/2026-10-10.2/documents/DOC002.pdf');
});
