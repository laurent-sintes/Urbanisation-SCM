import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptPublication } from './src/model.ts';
import { pedagogyOf, resolvePedagogy, shortNodeDescription } from './src/pedagogy.ts';
import { searchPublication } from './src/search.ts';

function fixture() {
  return adaptPublication({
    space: 'release',
    version: 'pilot',
    nodes: [
      {
        id: 'A',
        kind: 'capability',
        fields: {
          name: 'A',
          definition: 'Courte',
          finality: 'Autre texte',
          examples: [
            {
              id: 'E',
              title: 'Cas',
              situation: 'Situation',
              outcome: 'Résultat',
              contributions: [{ node_id: 'A', role: 'Contribution' }],
            },
          ],
          market_comparisons: [{ id: 'M', product: 'Produit', differences: 'Limite' }],
          pedagogical_description: {
            explanation: 'Explication',
            source_refs: ['U1125'],
            example_refs: [{ node_id: 'A', example_id: 'E', contribution: 'Contribution' }],
            market_comparison_refs: [{ node_id: 'A', comparison_id: 'M' }],
          },
        },
      },
    ],
    relations: [],
  });
}
test('short help uses the definition and pedagogy resolves only stable identities in its snapshot', () => {
  const model = fixture(),
    node = model.nodeById.get('A');
  assert.equal(shortNodeDescription(node), 'Courte');
  const resolved = resolvePedagogy(model, node);
  assert.equal(resolved.examples[0].contribution, 'Contribution');
  assert.equal(resolved.comparisons[0].differences, 'Limite');
  assert.ok(searchPublication(model, 'Explication').some((result) => result.id === 'A'));
  assert.ok(searchPublication(model, 'Contribution').some((result) => result.id === 'A'));
  assert.equal(searchPublication(model, 'U1125').length, 0);
  const copied = { ...node, fields: structuredClone(node.fields) };
  copied.fields.examples.unshift({ id: 'other', title: 'Autre', situation: 'Autre' });
  const reordered = { ...model, nodeById: new Map([['A', copied]]) };
  assert.equal(resolvePedagogy(reordered, copied).examples[0].id, 'E');
  copied.fields.examples.push({ ...copied.fields.examples[1] });
  assert.deepEqual(resolvePedagogy(reordered, copied).examples, []);
});
test('historical absence and unresolved references never use another publication', () => {
  const current = fixture(),
    node = current.nodeById.get('A');
  const old = adaptPublication({
    space: 'release',
    version: 'old',
    nodes: [{ id: 'A', kind: 'capability', fields: { name: 'A', definition: 'Ancienne' } }],
    relations: [],
  });
  assert.equal(pedagogyOf(old.nodeById.get('A')), undefined);
  assert.equal(resolvePedagogy(old, node).block, undefined);
  assert.deepEqual(resolvePedagogy(old, node).examples, []);
  assert.deepEqual(resolvePedagogy(old, node).comparisons, []);
});
