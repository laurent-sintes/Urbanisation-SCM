import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flowMapBoundaryRelations } from './src/flowMapDetail.ts';
import { buildFlowMap } from './src/flowMapLayout.ts';
import { flowMapBoundaryDestinations, flowMapPresentation } from './src/flowMapPresentation.ts';
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
  assert.deepEqual(ids(plan.relations), [
    'detail-ab',
    'detail-ac',
    'detail-bc',
    'reverse-ba',
    'summary-ab',
    'summary-bc',
  ]);
  assert.equal(plan.omittedRelationCount, 0);
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

test('a native summary never suppresses another directed pair or a different exchange type', () => {
  const dataNativeOnly = {
    ...model,
    relations: model.relations.filter((relation) => relation.id !== 'summary-bc'),
  };
  assert.deepEqual(ids(principal({}, supplyBoxes, dataNativeOnly).relations), [
    'detail-ab',
    'detail-ac',
    'detail-bc',
    'reverse-ba',
    'summary-ab',
  ]);
  const knowledge = principal({ types: ['provides-knowledge'] }, supplyBoxes, dataNativeOnly);
  assert.equal(knowledge.mode, 'main');
  assert.deepEqual(ids(knowledge.relations), ['detail-bc', 'reverse-ba']);
  assert.equal(knowledge.omittedRelationCount, 0, 'Disabled data summaries cannot suppress knowledge detail');
});

test('external navigation groups 27 Commerce and Procurement exchanges in their closest common system', () => {
  const tree = [
    ['ea', 'universe'],
    ['operations', 'business_system', 'ea'],
    ['enterprise', 'business_system', 'ea'],
    ['supply', 'domain', 'operations'],
    ['commerce', 'domain', 'operations'],
    ['procurement', 'domain', 'operations'],
    ['finance', 'domain', 'enterprise'],
    ...['supply', 'commerce', 'procurement', 'finance'].flatMap((id) => [
      [`${id}-area`, 'area', id],
      [`${id}-ba`, 'business_area', `${id}-area`],
      [`${id}-cap`, 'capability', `${id}-ba`],
    ]),
  ];
  const exchanges = [
    ...[
      ['commerce', 'supply', 8],
      ['supply', 'commerce', 7],
      ['procurement', 'supply', 5],
      ['supply', 'procurement', 7],
    ].flatMap(([from, to, count]) =>
      Array.from({ length: count }, (_, index) => ({
        id: `${from}-${to}-${index}`,
        type: 'shares-data',
        source_id: `${from}-cap`,
        target_id: `${to}-cap`,
        fields: { label: `${from}-${to}-${index}` },
      })),
    ),
    { id: 'financial-result', type: 'shares-data', source_id: 'finance-cap', target_id: 'supply-cap' },
  ];
  const fixture = adaptPublication({
    version: 'boundary-27',
    space: 'release',
    glossary: { terms: [{ id: 'facts', name: 'Facts', definition: 'Faits transmis.' }] },
    nodes: tree.map(([id, kind]) => ({ id, kind, fields: { name: id } })),
    relations: [
      ...tree
        .filter((entry) => entry[2])
        .map(([id, , parent]) => ({ id: `parent-${id}`, source_id: parent, target_id: id, type: 'contains' })),
      ...exchanges.map((relation) => ({
        ...relation,
        fields: {
          label: relation.id,
          data_exchange: {
            purpose: relation.id,
            contents: [{ name: 'Business facts', description: relation.id, glossary_refs: ['facts'] }],
          },
        },
      })),
    ],
  });
  const before = structuredClone(fixture.raw);
  const external = flowMapBoundaryRelations(fixture, 'supply');
  const destinations = flowMapBoundaryDestinations(fixture, external);
  assert.deepEqual(
    destinations.map((destination) => [destination.scopeId, destination.relations.length]),
    [
      ['operations', 27],
      ['', 1],
    ],
    'An exchange inside Business Operations does not send the reader to the architecture root',
  );
  const destination = destinations[0];
  const plan = flowMapPresentation(fixture, buildFlowMap(fixture, destination.scopeId).boxes, {
    scopeId: destination.scopeId,
    selectedId: destination.scopeId,
    zoom: 0.5,
    mode: 'main',
    types: ['shares-data'],
  });
  assert.equal(plan.mode, 'main', 'Opening the common scope clears the old focused neighborhood');
  assert.deepEqual(ids(plan.relations), ids(destination.relations));
  assert.equal(plan.relations.length, 27);
  const domains = new Set(plan.boxes.map((box) => box.id));
  assert.deepEqual([...domains].sort(), ['commerce', 'procurement', 'supply']);
  assert.deepEqual(fixture.raw, before, 'Navigation does not modify the publication');
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
  const plan = flowMapPresentation(model, boxes, { zoom: 1, scopeId: 'area-a' });
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
