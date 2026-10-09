import assert from 'node:assert/strict';
import test from 'node:test';
import { inlineParts, plainInlineText } from './src/inlineLinks.ts';
import { adaptPublication } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';

test('explicit links retain their label and target without interpreting HTML', () => {
  const text = 'Le [produit](glossary:TER057#definition) : [Stock](model:D01).';
  assert.equal(plainInlineText(text), 'Le produit : Stock.');
  assert.deepEqual(inlineParts(text)[1], { text: 'produit', kind: 'glossary', target: 'TER057', anchor: 'definition' });
  assert.equal(inlineParts('[code](javascript:alert) <script>')[0].kind, undefined);
  assert.equal(inlineParts(String.raw`\[literal](glossary:TER057)`)[0].kind, undefined);
  assert.equal(inlineParts(String.raw`[a\]b](glossary:TER057)`)[0].text, 'a]b');
});

test('glossary deep link preserves its publication, term and section', () => {
  const route = { ...readRoute(''), view: 'glossary', term: 'TER057', section: 'definition', version: '2026-09-13.5' };
  assert.deepEqual(readRoute(routeHash(route)), route);
});

test('old publications have no glossary fallback and duplicate identities fail', () => {
  const raw = { space: 'release', version: 'test', nodes: [], relations: [] };
  assert.equal(adaptPublication(raw).glossary.length, 0);
  const term = { id: 'T1', name: 'Test', short_description: 'Short', definition: 'Definition' };
  const enriched = { ...raw, glossary: { terms: [term] } };
  assert.equal(adaptPublication(enriched).glossaryById.get('T1').definition, 'Definition');
  assert.equal(enriched.glossary.terms[0], term);
  assert.throws(() => adaptPublication({ ...raw, glossary: { terms: [term, term] } }), /dupliqué/);
});
