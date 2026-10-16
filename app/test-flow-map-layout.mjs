import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildFlowMap, projectFlowMapExchanges } from './src/flowMapLayout.ts';
import { adaptPublication, visibleAncestorId } from './src/model.ts';

const node = (id, kind, name = id) => ({ id, kind, fields: { name } });
const relation = (id, source_id, target_id, type = 'contains') => ({ id, source_id, target_id, type });
const model = adaptPublication({
  space: 'release',
  version: 'flow-fixture',
  nodes: [
    node('universe', 'universe'),
    node('system-design-development', 'business_system'),
    node('system-business-operations', 'business_system'),
    node('system-enterprise-management-control', 'business_system'),
    node('domain-logistics-execution', 'business_system'),
    node('domain-sourcing-procurement', 'domain'),
    node('domain-sales', 'domain'),
    node('supply-chain-orchestration', 'domain'),
    node('subdomain', 'area'),
    node('ba', 'business_area'),
    node('ba-b', 'business_area'),
    node('cap-a', 'capability'),
    node('cap-b', 'capability'),
    node('behavior', 'behavior'),
    node('empty-domain', 'domain'),
  ],
  relations: [
    ...[
      'system-design-development',
      'system-business-operations',
      'system-enterprise-management-control',
      'domain-logistics-execution',
    ].map((id) => relation(`root-${id}`, 'universe', id)),
    ...['domain-sourcing-procurement', 'domain-sales', 'supply-chain-orchestration'].map((id) =>
      relation(`domain-${id}`, 'system-business-operations', id),
    ),
    relation('domain-empty', 'system-design-development', 'empty-domain'),
    relation('sub', 'supply-chain-orchestration', 'subdomain'),
    relation('business-area', 'subdomain', 'ba'),
    relation('business-area-b', 'subdomain', 'ba-b'),
    relation('cap-a-parent', 'ba', 'cap-a'),
    relation('cap-b-parent', 'ba-b', 'cap-b'),
    relation('behavior-parent', 'cap-a', 'behavior'),
    relation('knowledge', 'behavior', 'cap-b', 'provides-knowledge'),
    relation('other-relation', 'cap-b', 'cap-a', 'depends-on'),
  ],
});

test('fixed territories contain every descendant and leave sibling corridors', () => {
  const layout = buildFlowMap(model);
  const boxes = new Map(layout.boxes.map((box) => [box.id, box]));
  assert.equal(boxes.has('behavior'), false);
  assert.equal(boxes.has('cap-a'), false);
  assert.equal(boxes.has('cap-b'), false);
  assert.equal(boxes.size, 11);
  for (const box of layout.boxes) {
    assert.ok(box.width > 0 && box.height > 0);
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= layout.width && box.y + box.height <= layout.height);
    if (!box.parentId) continue;
    const parent = boxes.get(box.parentId);
    assert.ok(box.x > parent.x && box.y >= parent.y + parent.headerHeight);
    assert.ok(box.x + box.width < parent.x + parent.width);
    assert.ok(box.y + box.height < parent.y + parent.height);
    assert.equal(box.depth, parent.depth + 1);
  }
  for (const a of layout.boxes)
    for (const b of layout.boxes) {
      if (a.id >= b.id || a.parentId !== b.parentId) continue;
      assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }
});

test('world positions preserve explicit system and Operations geography', () => {
  const layout = buildFlowMap(model);
  const box = (id) => layout.boxes.find((item) => item.id === id);
  const design = box('system-design-development');
  const operations = box('system-business-operations');
  const management = box('system-enterprise-management-control');
  const logistics = box('domain-logistics-execution');
  assert.ok(design.x < operations.x && operations.x < management.x);
  assert.equal(design.y, management.y);
  assert.equal(operations.x, logistics.x);
  assert.ok(logistics.y > operations.y);
  const sourcing = box('domain-sourcing-procurement');
  const commerce = box('domain-sales');
  const supply = box('supply-chain-orchestration');
  assert.equal(sourcing.y, commerce.y);
  assert.ok(sourcing.x < commerce.x);
  assert.ok(supply.y > sourcing.y);
  assert.equal(supply.x, sourcing.x);
  assert.ok(design.height < operations.height);
  assert.ok(management.height < operations.height);
  assert.deepEqual(buildFlowMap(model), layout);
});

test('scope only changes the cartographic extent and includes terminal scopes', () => {
  assert.deepEqual(
    buildFlowMap(model, 'system-business-operations')
      .boxes.filter((box) => box.depth === 0)
      .map((box) => box.id),
    ['domain-sourcing-procurement', 'domain-sales', 'supply-chain-orchestration'],
  );
  assert.equal(buildFlowMap(model, 'supply-chain-orchestration').boxes[0].id, 'subdomain');
  assert.deepEqual(
    buildFlowMap(model, 'empty-domain').boxes.map((box) => box.id),
    ['empty-domain'],
  );
  assert.deepEqual(
    buildFlowMap(model, 'cap-a').boxes.map((box) => box.id),
    ['ba'],
  );
  assert.deepEqual(
    buildFlowMap(model, 'behavior').boxes.map((box) => box.id),
    ['ba'],
  );
  const ids = new Set(buildFlowMap(model).boxes.map((box) => box.id));
  assert.equal(visibleAncestorId(model, 'cap-a', ids), 'ba');
  assert.equal(visibleAncestorId(model, 'behavior', ids), 'ba');
  assert.equal(buildFlowMap(model, 'missing').boxes.length, 0);
});

test('exchange projection preserves published identity, direction and original endpoints', () => {
  const layout = buildFlowMap(model);
  assert.equal(layout.exchanges.length, 1);
  const exchange = layout.exchanges[0];
  assert.equal(exchange.id, 'knowledge');
  assert.equal(exchange.sourceId, 'ba');
  assert.equal(exchange.targetId, 'ba-b');
  assert.equal(exchange.type, 'provides-knowledge');
  assert.equal(exchange.relations[0], model.relationById.get('knowledge'));
  assert.equal(exchange.relations[0].sourceId, 'behavior');
  assert.deepEqual(projectFlowMapExchanges(model, new Set(['ba'])), []);
  assert.deepEqual(projectFlowMapExchanges(model, new Set(['cap-a'])), []);
});

test('applications and hotspot layers cannot reorganize the world', () => {
  const geometry = (layout) => layout.boxes.map(({ node: _node, ...box }) => box);
  const changed = {
    ...model,
    raw: { ...model.raw, application_catalog: {}, hotspot_catalog: { hotspots: [{ id: 'hotspot' }] } },
  };
  assert.deepEqual(geometry(buildFlowMap(changed)), geometry(buildFlowMap(model)));
});

test('both supported relation types retain their own identities without invented reverse arrows', () => {
  const original = model.relationById.get('knowledge');
  const shared = { ...original, id: 'shared', type: 'shares-data', sourceId: 'cap-b', targetId: 'cap-a' };
  const exchanges = projectFlowMapExchanges(
    { ...model, relations: [...model.relations, shared] },
    new Set(['cap-a', 'cap-b']),
  );
  assert.deepEqual(
    exchanges.map(({ id, type, sourceId, targetId }) => ({ id, type, sourceId, targetId })),
    [
      { id: 'knowledge', type: 'provides-knowledge', sourceId: 'cap-a', targetId: 'cap-b' },
      { id: 'shared', type: 'shares-data', sourceId: 'cap-b', targetId: 'cap-a' },
    ],
  );
});

test('historical groups remain territories while documentary reference scopes reveal their ancestor', () => {
  const historical = adaptPublication({
    space: 'release',
    version: 'historical-group',
    nodes: [
      node('domain', 'domain'),
      node('business-references', 'group'),
      node('reference', 'reference'),
      node('cap', 'capability'),
    ],
    relations: [
      relation('group-parent', 'domain', 'business-references'),
      relation('reference-parent', 'business-references', 'reference'),
      relation('cap-parent', 'reference', 'cap'),
    ],
  });
  const boxes = buildFlowMap(historical, 'domain').boxes;
  assert.deepEqual(
    boxes.map((box) => box.id),
    ['business-references'],
  );
  assert.equal(boxes[0].node.kind, 'group');
  assert.deepEqual(
    buildFlowMap(historical, 'reference').boxes.map((box) => box.id),
    ['business-references'],
  );
  assert.deepEqual(
    buildFlowMap(historical, 'cap').boxes.map((box) => box.id),
    ['business-references'],
  );
});

const supplyAreas = [
  ['business-references', [4, 5, 3, 2, 4]],
  ['subdomain-policies', [7, 2]],
  ['subdomain-integration', [2, 3]],
  ['D01', [5, 2]],
  ['D03', [3]],
  ['D04', [8]],
  ['subdomain-process-management', [4, 3, 3, 2]],
  ['D06', [4, 3, 3, 1]],
  ['subdomain-service-orders', [12, 2, 2, 1]],
  ['domain-plan', [4, 5, 3, 5]],
];

function supplyFixture(extra = false, integration = true) {
  const nodes = [node('supply-chain-orchestration', 'domain')];
  const relations = [];
  for (const [id, counts] of supplyAreas) {
    if (!integration && id === 'subdomain-integration') continue;
    nodes.push(node(id, 'area'));
    relations.push(relation(`parent-${id}`, 'supply-chain-orchestration', id));
    counts.forEach((count, index) => {
      const ba = `${id}-ba-${index}`;
      nodes.push(node(ba, 'business_area'));
      relations.push(relation(`parent-${ba}`, id, ba));
      for (let cap = 0; cap < count; cap++) {
        const child = `${ba}-cap-${cap}`;
        nodes.push(node(child, 'capability'));
        relations.push(relation(`parent-${child}`, ba, child));
      }
    });
  }
  if (extra) {
    nodes.push(node('new-published-territory', 'area'));
    relations.push(relation('new-parent', 'supply-chain-orchestration', 'new-published-territory'));
  }
  return adaptPublication({ space: 'release', version: 'supply-neighborhood', nodes, relations });
}

test('Business Areas have a fixed footprint independent of their capability count', () => {
  const { boxes } = buildFlowMap(supplyFixture(), 'supply-chain-orchestration');
  const ba = boxes.find((box) => box.id === 'domain-plan-ba-1');
  const caps = boxes.filter((box) => box.parentId === ba.id);
  assert.equal(ba.width, 260);
  assert.equal(ba.headerHeight, 60);
  assert.equal(ba.height, 60);
  assert.equal(caps.length, 0);
  assert.equal(boxes.find((box) => box.id === 'subdomain-service-orders-ba-0').height, ba.height);
  assert.equal(
    boxes.some((box) => ['capability', 'reference', 'behavior'].includes(box.node.kind)),
    false,
  );
});

test('Business Area titles reserve two or three compact text lines at publication time', () => {
  const publication = adaptPublication({
    space: 'release',
    version: 'compact-titles',
    nodes: [
      node('short', 'business_area', 'Order Promising'),
      node('two-lines', 'business_area', 'Physical Stock Configuration Optimization'),
      node('three-lines', 'business_area', 'Commercial Transaction Processing and Supply Chain Settlement Management'),
      node('terminal-area', 'area', 'Context'),
    ],
    relations: [],
  });
  const boxes = new Map(buildFlowMap(publication).boxes.map((box) => [box.id, box]));
  assert.equal(boxes.get('short').height, 60);
  assert.equal(boxes.get('two-lines').height, 60);
  assert.equal(boxes.get('three-lines').height, 80);
  assert.equal(boxes.get('terminal-area').height, 80);
  for (const id of ['short', 'two-lines', 'three-lines']) {
    assert.equal(boxes.get(id).width, 260);
    assert.equal(boxes.get(id).headerHeight, boxes.get(id).height);
  }
});

test('terminal territories use compact label footprints and never reserve a heading larger than their box', () => {
  const publication = adaptPublication({
    space: 'release',
    version: 'terminal-footprints',
    nodes: [
      node('system', 'business_system', 'System'),
      node('domain', 'domain', 'Domain'),
      node('area', 'area', 'Context'),
      node('group', 'group', 'Historical Context'),
    ],
    relations: [],
  });
  const boxes = new Map(buildFlowMap(publication).boxes.map((box) => [box.id, box]));
  assert.equal(boxes.get('system').height, 120);
  assert.equal(boxes.get('system').headerHeight, 120);
  assert.equal(boxes.get('domain').width, 288);
  assert.equal(boxes.get('domain').height, 104);
  assert.equal(boxes.get('area').height, 80);
  assert.equal(boxes.get('group').height, 80);
  for (const box of boxes.values()) assert.ok(box.headerHeight <= box.height);
});

test('enclosing territories end after their real descendants rather than growing into empty panels', () => {
  const { boxes } = buildFlowMap(model);
  for (const parent of boxes) {
    const children = boxes.filter((box) => box.parentId === parent.id);
    if (!children.length) continue;
    assert.equal(parent.y + parent.height - Math.max(...children.map((box) => box.y + box.height)), 14);
  }
});

test('adding capabilities, behaviors or documentary references never changes Flux geography', () => {
  const publication = supplyFixture();
  const changed = adaptPublication({
    ...publication.raw,
    nodes: [
      ...publication.raw.nodes,
      node('additional-capability', 'capability'),
      node('additional-behavior', 'behavior'),
      node('additional-reference', 'reference'),
    ],
    relations: [
      ...publication.raw.relations,
      relation('additional-capability-parent', 'domain-plan-ba-1', 'additional-capability'),
      relation('additional-behavior-parent', 'additional-capability', 'additional-behavior'),
      relation('additional-reference-parent', 'domain-plan-ba-1', 'additional-reference'),
    ],
  });
  const geometry = (layout) => layout.boxes.map(({ node: _node, ...box }) => box);
  assert.deepEqual(geometry(buildFlowMap(changed)), geometry(buildFlowMap(publication)));
  assert.deepEqual(
    buildFlowMap(changed, 'additional-reference').boxes.map((box) => box.id),
    ['domain-plan-ba-1'],
  );
});

test('Supply keeps its four-territory neighborhood and every identity in a compact world', () => {
  const publication = supplyFixture();
  const layout = buildFlowMap(publication, 'supply-chain-orchestration');
  const byId = new Map(layout.boxes.map((box) => [box.id, box]));
  assert.equal(byId.size, publication.nodes.filter((node) => ['area', 'business_area'].includes(node.kind)).length);
  assert.ok(layout.width < 2400 && layout.height < 1900);
  const integration = byId.get('subdomain-integration');
  const planning = byId.get('domain-plan');
  const inventory = byId.get('D01');
  const availability = byId.get('D03');
  assert.equal(integration.y + integration.height / 2, planning.y + planning.height / 2);
  assert.equal(planning.y, inventory.y);
  assert.equal(planning.x - integration.x - integration.width, 140);
  assert.equal(inventory.x - planning.x - planning.width, 140);
  assert.equal(inventory.x, availability.x);
  assert.equal(availability.y - inventory.y - inventory.height, 140);
  assert.equal(planning.headerHeight, 64);
  assert.ok(integration.height < planning.height);
  for (const box of layout.boxes) {
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= layout.width && box.y + box.height <= layout.height);
    if (!box.parentId) continue;
    const parent = byId.get(box.parentId);
    assert.ok(box.x > parent.x && box.y >= parent.y + parent.headerHeight);
    assert.ok(box.x + box.width < parent.x + parent.width);
    assert.ok(box.y + box.height < parent.y + parent.height);
  }
  for (const a of layout.boxes)
    for (const b of layout.boxes) {
      if (a.id >= b.id || a.parentId !== b.parentId) continue;
      assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }
});

test('only large areas have two columns of Business Areas, with every BA keeping its fixed footprint', () => {
  const { boxes } = buildFlowMap(supplyFixture(), 'supply-chain-orchestration');
  const references = boxes.filter((box) => box.parentId === 'business-references');
  const planning = boxes.filter((box) => box.parentId === 'domain-plan');
  assert.equal(new Set(references.map((box) => box.x)).size, 2);
  assert.equal(new Set(planning.map((box) => box.x)).size, 1);
  assert.ok([...references, ...planning].every((box) => box.width === 260 && box.height === 60));
});

test('Supply retains its published neighborhood after Integration is removed', () => {
  const publication = supplyFixture(false, false);
  const layout = buildFlowMap(publication, 'supply-chain-orchestration');
  const boxes = new Map(layout.boxes.map((box) => [box.id, box]));
  const references = boxes.get('business-references');
  const policies = boxes.get('subdomain-policies');
  const plan = boxes.get('domain-plan');
  const inventory = boxes.get('D01');
  const availability = boxes.get('D03');
  assert.equal(boxes.has('subdomain-integration'), false);
  assert.deepEqual(
    [...boxes.keys()].sort(),
    publication.nodes
      .filter((item) => ['area', 'business_area'].includes(item.kind))
      .map((item) => item.id)
      .sort(),
  );
  assert.ok(references.x < policies.x);
  assert.equal(policies.x, plan.x);
  assert.ok(policies.y + policies.height < plan.y);
  assert.equal(plan.y, inventory.y);
  assert.equal(inventory.x - plan.x - plan.width, 140);
  assert.equal(inventory.x, availability.x);
  assert.equal(availability.y - inventory.y - inventory.height, 140);
  const withExtra = buildFlowMap(supplyFixture(true, false), 'supply-chain-orchestration');
  const geometry = ({ id, x, y, width, height }) => ({ id, x, y, width, height });
  assert.deepEqual(
    withExtra.boxes.filter((box) => box.id !== 'new-published-territory').map(geometry),
    layout.boxes.map(geometry),
  );
});

test('an additional published territory remains visible without moving the known neighborhood', () => {
  const original = buildFlowMap(supplyFixture(), 'supply-chain-orchestration');
  const extended = buildFlowMap(supplyFixture(true), 'supply-chain-orchestration');
  const coordinates = ({ id, x, y, width, height }) => ({ id, x, y, width, height });
  assert.deepEqual(
    extended.boxes.filter((box) => box.id !== 'new-published-territory').map(coordinates),
    original.boxes.map(coordinates),
  );
  const extra = extended.boxes.find((box) => box.id === 'new-published-territory');
  assert.ok(extra.y >= original.height);
});

test('large systems and domains keep bounded headings without changing their inner neighborhood', () => {
  const publication = supplyFixture();
  const wrapped = adaptPublication({
    ...publication.raw,
    nodes: [node('system', 'business_system'), ...publication.raw.nodes],
    relations: [relation('system-supply', 'system', 'supply-chain-orchestration'), ...publication.raw.relations],
  });
  const layout = buildFlowMap(wrapped);
  const system = layout.boxes.find((box) => box.id === 'system');
  const supply = layout.boxes.find((box) => box.id === 'supply-chain-orchestration');
  assert.equal(system.headerHeight, 200);
  assert.equal(supply.headerHeight, 88);
  assert.ok(supply.y >= system.y + system.headerHeight);
  const local = buildFlowMap(publication, 'supply-chain-orchestration');
  for (const box of local.boxes) {
    const nested = layout.boxes.find((item) => item.id === box.id);
    assert.equal(nested.x - supply.x - 14, box.x - 32);
    assert.equal(nested.y - supply.y - supply.headerHeight, box.y - 32);
    assert.equal(nested.width, box.width);
    assert.equal(nested.height, box.height);
  }
});

test('broad systems and domains leave bounded routing corridors at the natural map scale', () => {
  const layout = buildFlowMap(model);
  const byId = new Map(layout.boxes.map((box) => [box.id, box]));
  const design = byId.get('system-design-development');
  const operations = byId.get('system-business-operations');
  assert.equal(operations.x - design.x - design.width, 420);
  const sourcing = byId.get('domain-sourcing-procurement');
  const commerce = byId.get('domain-sales');
  const gap = commerce.x - sourcing.x - sourcing.width;
  assert.ok(gap >= 140 && gap <= 320);
});
