import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryOf, categorySections, startsCategorySection } from './src/categories.ts';
import { adaptPublication, childrenOf, parentRelationOf } from './src/model.ts';

const cap = (id, category, nature = 'action') => ({ id, kind: 'capability', fields: { name: id, category, nature } });
const transport = { id: 'transport', display_name: 'Transport', order: 20 };
const warehouse = { id: 'warehouse', display_name: 'Entrepôt', order: 10 };
test('optional categories preserve historical order and never infer labels', () => {
  const old = [cap('Transport Order'), cap('Picking Order')];
  assert.equal(categorySections(old).length, 1);
  assert.deepEqual(categorySections(old)[0].items, old);
  assert.equal(startsCategorySection(old, 0), false);
  assert.equal(categoryOf({ ...cap('b', transport), kind: 'behavior' }), undefined);
  assert.equal(categoryOf(cap('bad', { id: 'transport' })), undefined);
});
test('category grouping keeps every item and uses published captions and order', () => {
  const nodes = Object.freeze([cap('t', transport), cap('other'), cap('w', warehouse), cap('t2', transport)]);
  const sections = categorySections(nodes);
  assert.deepEqual(
    sections.map((s) => s.items.map((n) => n.id)),
    [['w'], ['t', 't2'], ['other']],
  );
  assert.equal(sections[0].category.display_name, 'Entrepôt');
  assert.deepEqual(
    nodes.map((n) => n.id),
    ['t', 'other', 'w', 't2'],
  );
});
test('subdomain categories do not add hierarchy nodes, relations or change behavior parents', () => {
  const raw = {
    space: 'release',
    version: 'category-fixture',
    nodes: [
      { id: 'sd', kind: 'area' },
      cap('t', transport),
      cap('w', warehouse),
      { id: 'b', kind: 'behavior', fields: { name: 'Variant' } },
    ],
    relations: [
      { id: 'st', type: 'contains', source_id: 'sd', target_id: 't' },
      { id: 'sw', type: 'contains', source_id: 'sd', target_id: 'w' },
      { id: 'tb', type: 'contains', source_id: 't', target_id: 'b' },
    ],
  };
  const model = adaptPublication(raw);
  assert.deepEqual(
    childrenOf(model, 'sd').map((n) => n.id),
    ['w', 't'],
  );
  assert.equal(parentRelationOf(model, 'b').sourceId, 't');
  assert.equal(model.nodes.length, 4);
  assert.equal(model.relations.length, 3);
  assert.deepEqual(model.raw, raw);
});
