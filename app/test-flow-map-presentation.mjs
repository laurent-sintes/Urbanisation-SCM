import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildFlowMap } from './src/flowMapLayout.ts';
import { flowMapPresentation } from './src/flowMapPresentation.ts';
import { adaptPublication } from './src/model.ts';

const entries = [
  ['root', 'universe'],
  ['operations', 'business_system', 'root'],
  ['finance-system', 'business_system', 'root'],
  ['supply', 'domain', 'operations'],
  ['commerce', 'domain', 'operations'],
  ['finance', 'domain', 'finance-system'],
  ['area-a', 'area', 'supply'],
  ['area-b', 'area', 'supply'],
  ['area-c', 'area', 'supply'],
  ['area-commerce', 'area', 'commerce'],
  ['area-finance', 'area', 'finance'],
  ['ba-a', 'business_area', 'area-a'],
  ['ba-b', 'business_area', 'area-b'],
  ['ba-c', 'business_area', 'area-c'],
  ['ba-commerce', 'business_area', 'area-commerce'],
  ['ba-finance', 'business_area', 'area-finance'],
  ['cap-a', 'capability', 'ba-a'],
  ['cap-a2', 'capability', 'ba-a'],
  ['cap-b', 'capability', 'ba-b'],
  ['cap-c', 'capability', 'ba-c'],
  ['cap-commerce', 'capability', 'ba-commerce'],
  ['cap-finance', 'capability', 'ba-finance'],
  ['behavior', 'behavior', 'cap-a'],
];
const flows = [
  ['summary-ab', 'area-a', 'area-b'],
  ['detail-ab', 'cap-a', 'cap-b'],
  ['detail-ac', 'cap-a', 'cap-c'],
  ['reverse-ba', 'cap-b', 'cap-a', 'provides-knowledge'],
  ['summary-bc', 'area-b', 'area-c', 'provides-knowledge'],
  ['detail-bc', 'cap-b', 'cap-c', 'provides-knowledge'],
  ['system-summary', 'operations', 'finance-system'],
  ['system-detail', 'cap-a', 'cap-finance'],
  ['commerce-incoming', 'cap-commerce', 'cap-a'],
  ['commerce-outgoing', 'cap-a', 'cap-commerce'],
  ['internal-ba', 'cap-a', 'cap-a2'],
];
const model = adaptPublication({
  version: 'presentation-fixture',
  space: 'release',
  glossary: { terms: [{ id: 'term', name: 'Facts', definition: 'Faits transmis.' }] },
  nodes: entries.map(([id, kind]) => ({ id, kind, fields: { name: id } })),
  relations: [
    ...entries
      .filter((entry) => entry[2])
      .map(([id, , parent]) => ({ id: `parent-${id}`, source_id: parent, target_id: id, type: 'contains' })),
    ...flows.map(([id, source_id, target_id, type = 'shares-data']) => ({
      id,
      source_id,
      target_id,
      type,
      fields: {
        label: id,
        ...(type === 'shares-data'
          ? {
              data_exchange: {
                purpose: id,
                contents: [{ name: 'Business facts', description: id, glossary_refs: ['term'] }],
              },
            }
          : {}),
      },
    })),
  ],
});
const ids = (items) => items.map((item) => item.id).sort();
const supplyBoxes = buildFlowMap(model, 'supply').boxes;
const principal = (options = {}, boxes = supplyBoxes, fixture = model) =>
  flowMapPresentation(fixture, boxes, { zoom: 1, scopeId: 'supply', selectedId: 'supply', ...options });

test('principal flows use a single subdomain frontier and keep every original detail of each retained pair', () => {
  const plan = principal();
  assert.equal(plan.mode, 'main');
  assert.deepEqual(ids(plan.boxes), ['area-a', 'area-b', 'area-c']);
  assert.deepEqual(ids(plan.relations), ['detail-ab', 'detail-bc', 'summary-ab', 'summary-bc']);
  assert.equal(plan.omittedRelationCount, 2);
  assert.ok(
    plan.relations.every((relation) => model.relations.includes(relation)),
    'No relation ID or endpoint is synthesized',
  );
  assert.ok(
    plan.boxes.every((box) => supplyBoxes.includes(box)),
    'Anchors retain their original geometry',
  );
});

test('enterprise principal arrows retain published system summaries and their detailed supporting relations', () => {
  const boxes = buildFlowMap(model).boxes;
  const plan = flowMapPresentation(model, boxes, { zoom: 0.3, selectedId: 'root' });
  assert.equal(plan.mode, 'main', 'The architecture selection is not a focused neighborhood');
  assert.deepEqual(ids(plan.boxes), ['finance-system', 'operations']);
  assert.deepEqual(ids(plan.relations), ['system-detail', 'system-summary']);
});

test('a system without native domain summaries projects its actual relations without inventing a summary', () => {
  const boxes = buildFlowMap(model, 'operations').boxes;
  const plan = flowMapPresentation(model, boxes, { zoom: 0.73, scopeId: 'operations', selectedId: 'operations' });
  assert.deepEqual(ids(plan.boxes), ['commerce', 'supply']);
  assert.deepEqual(ids(plan.relations), ['commerce-incoming', 'commerce-outgoing']);
});

test('historical publications without native principal summaries keep their projected exchanges', () => {
  const historical = {
    ...model,
    relations: model.relations.filter((relation) => !['summary-ab', 'summary-bc'].includes(relation.id)),
  };
  const plan = principal({}, supplyBoxes, historical);
  assert.deepEqual(ids(plan.relations), ['detail-ab', 'detail-ac', 'detail-bc', 'reverse-ba']);
  assert.equal(plan.omittedRelationCount, 0);
});

test('the type filter precedes native-summary selection so knowledge alone keeps its projected exchanges', () => {
  const dataNativeOnly = {
    ...model,
    relations: model.relations.filter((relation) => relation.id !== 'summary-bc'),
  };
  assert.deepEqual(ids(principal({}, supplyBoxes, dataNativeOnly).relations), ['detail-ab', 'summary-ab']);
  const knowledge = principal({ types: ['provides-knowledge'] }, supplyBoxes, dataNativeOnly);
  assert.equal(knowledge.mode, 'main');
  assert.deepEqual(ids(knowledge.relations), ['detail-bc', 'reverse-ba']);
  assert.equal(knowledge.omittedRelationCount, 0, 'Disabled data summaries cannot suppress knowledge detail');
});

test('type choices apply to All and focused neighborhoods, including an explicitly empty selection', () => {
  assert.deepEqual(ids(principal({ mode: 'all', types: ['provides-knowledge'] }).relations), [
    'detail-bc',
    'reverse-ba',
    'summary-bc',
  ]);
  assert.deepEqual(ids(principal({ selectedId: 'cap-a', types: ['provides-knowledge'] }).relations), ['reverse-ba']);
  for (const types of [[], ['contains']]) {
    const plan = principal({ types, mode: 'all' });
    assert.deepEqual(plan.relations, []);
    assert.equal(plan.omittedRelationCount, 0);
  }
});

test('an explicit capability or Business Area selection reveals only its published incident neighborhood', () => {
  for (const selectedId of ['cap-a', 'ba-a']) {
    const plan = principal({ selectedId });
    assert.equal(plan.mode, 'focus');
    assert.equal(plan.focusId, selectedId);
    assert.deepEqual(ids(plan.relations), ['detail-ab', 'detail-ac', 'reverse-ba']);
    assert.equal(
      plan.boxes.some((box) => ['capability', 'behavior', 'reference'].includes(box.node.kind)),
      false,
    );
    assert.equal(
      plan.relations.some((relation) => relation.id === 'summary-ab'),
      false,
      'Selecting a BA does not invent that BA as endpoint of a parent-level summary',
    );
  }
});

test('All is explicit, overrides a focused selection and keeps the BA rendering ceiling', () => {
  const plan = principal({ mode: 'all', selectedId: 'cap-a' });
  assert.equal(plan.mode, 'all');
  assert.deepEqual(ids(plan.relations), [
    'detail-ab',
    'detail-ac',
    'detail-bc',
    'reverse-ba',
    'summary-ab',
    'summary-bc',
  ]);
  assert.equal(plan.omittedRelationCount, 0);
  assert.equal(
    plan.boxes.some((box) => ['capability', 'behavior', 'reference'].includes(box.node.kind)),
    false,
  );
});

test('principal choices are independent of pan, viewport dimensions and overlays, with immutable world geometry', () => {
  const original = structuredClone(supplyBoxes),
    relationSnapshot = structuredClone(model.relations);
  const initial = principal();
  for (const zoom of [0.2, 0.85, 2.5]) {
    const plan = principal(
      {
        zoom,
        viewport: { x: -10000, y: 12000, width: 320, height: 180 },
        application: 'other',
        hotspots: ['unrelated'],
      },
      [...supplyBoxes].reverse(),
    );
    assert.deepEqual(ids(plan.boxes), ids(initial.boxes));
    assert.deepEqual(ids(plan.relations), ids(initial.relations));
  }
  assert.deepEqual(supplyBoxes, original);
  assert.deepEqual(model.relations, relationSnapshot);
});

test('entering a subdomain uses its Business Areas as frontier; an empty historical scope stays empty', () => {
  const boxes = buildFlowMap(model, 'area-a').boxes;
  const plan = flowMapPresentation(model, boxes, { zoom: 1, scopeId: 'area-a', selectedId: 'area-a' });
  assert.equal(plan.mode, 'main');
  assert.deepEqual(ids(plan.boxes), ['ba-a']);
  assert.deepEqual(plan.relations, []);
  assert.deepEqual(flowMapPresentation(model, [], { zoom: 1 }), {
    boxes: [],
    relations: [],
    mode: 'main',
    omittedRelationCount: 0,
  });
});
