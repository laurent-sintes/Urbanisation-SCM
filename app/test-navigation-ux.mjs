import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptPublication } from './src/model.ts';
import { revealSection } from './src/readerNavigation.ts';
import { searchPublication } from './src/search.ts';
import { filterSearchResults, searchExcerpt, searchResultRoute } from './src/searchPresentation.ts';

const model = adaptPublication({
  space: 'release',
  version: 'fixed-snapshot',
  nodes: [
    { id: 'SYS', kind: 'business_system', fields: { name: 'Operations' } },
    { id: 'SUPPLY', kind: 'domain', fields: { name: 'Supply' } },
    { id: 'OTHER', kind: 'domain', fields: { name: 'Commerce' } },
    { id: 'STOCK', kind: 'capability', fields: { name: 'Stock', definition: 'Suivre le [stock](glossary:T1).' } },
  ],
  relations: [
    { id: 'R1', type: 'contains', source_id: 'SYS', target_id: 'SUPPLY' },
    { id: 'R2', type: 'contains', source_id: 'SYS', target_id: 'OTHER' },
    { id: 'R3', type: 'contains', source_id: 'SUPPLY', target_id: 'STOCK' },
  ],
  document_catalog: {
    documents: [{ id: 'DOC', title: 'Stock — guide', summary: 'Une étude', context: 'Contexte publié' }],
  },
});
const result = {
  id: 'STOCK',
  kind: 'model',
  node: model.nodeById.get('STOCK'),
  name: 'Stock',
  excerpt: 'Contexte',
  score: 1,
};

test('a scoped search includes the scope itself and its descendants without assigning documents to a domain', () => {
  const results = [
    result,
    { ...result, id: 'SUPPLY', node: model.nodeById.get('SUPPLY') },
    { id: 'DOC', kind: 'document', name: 'Guide', score: 0 },
  ];
  assert.deepEqual(
    filterSearchResults(model, results, 'all', 'SUPPLY').map((r) => r.id),
    ['STOCK', 'SUPPLY'],
  );
  assert.deepEqual(filterSearchResults(model, results, 'all', 'OTHER'), []);
  assert.deepEqual(
    filterSearchResults(model, results, 'document', '').map((r) => r.id),
    ['DOC'],
  );
});

test('search distinguishes reading an object from locating it on the map and retains its published scope', () => {
  const sheet = searchResultRoute(model, result);
  const map = searchResultRoute(model, result, true);
  assert.equal(sheet.view, 'sheet');
  assert.equal(sheet.scope, 'SUPPLY');
  assert.equal(sheet.node, 'STOCK');
  assert.equal(map.view, 'map');
  assert.equal(map.mapFocus, 'STOCK');
  assert.equal(map.scope, sheet.scope);
  assert.equal(sheet.query, '');
  assert.equal(sheet.version, undefined); // The selected publication is preserved by route merging.
});

test('documents come only from the selected snapshot and open their own document destination', () => {
  const document = searchPublication(model, 'Stock').find((r) => r.kind === 'document');
  assert.equal(document.id, 'DOC');
  assert.equal(searchResultRoute(model, document).document, 'DOC');
  assert.equal(searchResultRoute(model, document).view, 'documents');
  const older = adaptPublication({ space: 'release', version: 'older', nodes: [], relations: [] });
  assert.equal(searchPublication(older, 'Stock').length, 0);
});

test('result excerpts render business text without internal link syntax', () => {
  assert.equal(searchExcerpt(result), 'Suivre le stock.');
  assert.ok(searchExcerpt({ ...result, node: undefined, excerpt: 'Une information '.repeat(50) }).length <= 190);
});

test('a direct section jump opens the reference definition before focusing and scrolling it', () => {
  const calls = [];
  const pane = { scrollTop: 0, getBoundingClientRect: () => ({ top: 20 }), scrollTo: () => calls.push('scroll') };
  const details = { tagName: 'DETAILS', open: false, parentElement: null };
  const target = {
    tagName: 'P',
    parentElement: details,
    closest: () => pane,
    focus: () => {
      assert.equal(details.open, true);
      calls.push('focus');
    },
    getBoundingClientRect: () => ({ top: 50 }),
  };
  revealSection(target);
  assert.deepEqual(calls, ['focus', 'scroll']);
});
