import assert from 'node:assert/strict';
import test from 'node:test';
import { documentsForHotspot, documentUrl } from './src/documentCatalog.ts';
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
