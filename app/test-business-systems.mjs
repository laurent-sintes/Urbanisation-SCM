import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dependencyLevel, dependencyLevels, projectDependencies } from './src/dependencyGraph.ts';
import { adaptPublication, cardChildListOf, childrenOf, hasCapabilityCards, lineageOf, rootsOf } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';
import { kindLabel, modelingDepthLabel } from './src/presentation.ts';

const node = (id, kind, depth) => ({ id, kind, fields: { name: id, ...(depth ? { modeling_depth: depth } : {}) } });
const edge = (id, type, source_id, target_id) => ({ id, type, source_id, target_id });
function fixture() {
  return adaptPublication({
    space: 'release',
    version: 'fixture',
    nodes: [
      node('design', 'business_system', 'context'),
      node('operations', 'business_system', 'domains'),
      node('control', 'business_system', 'context'),
      node('sales', 'domain', 'domains'),
      node('orchestration', 'domain', 'behaviors'),
      node('orders', 'area'),
      node('order', 'capability'),
      node('promise', 'capability'),
    ],
    relations: [
      edge('sales-parent', 'presents', 'operations', 'sales'),
      edge('sc-parent', 'presents', 'operations', 'orchestration'),
      edge('area-parent', 'presents', 'orchestration', 'orders'),
      edge('cap-parent', 'contains', 'orders', 'order'),
      edge('promise-parent', 'contains', 'orders', 'promise'),
      edge('business-link', 'relates-to', 'order', 'promise'),
    ],
  });
}

test('overview shows explicit domains, compact contexts and complete breadcrumbs', () => {
  const model = fixture();
  assert.deepEqual(
    rootsOf(model).map((n) => n.id),
    ['design', 'operations', 'control'],
  );
  assert.equal(hasCapabilityCards(model), true);
  const list = cardChildListOf(model, model.nodeById.get('operations'));
  assert.equal(list.kind, 'domain');
  assert.deepEqual(
    list.items.map((n) => n.id),
    ['sales', 'orchestration'],
  );
  assert.equal(cardChildListOf(model, model.nodeById.get('design')), undefined);
  assert.deepEqual(
    lineageOf(model, 'order').map((n) => n.id),
    ['operations', 'orchestration', 'orders', 'order'],
  );
  assert.equal(kindLabel(model.nodeById.get('operations')), 'Business System');
  assert.equal(modelingDepthLabel(model.nodeById.get('orchestration')), 'Capacités et comportements');
  assert.equal(modelingDepthLabel(model.nodeById.get('sales')), 'Vue de domaine');
});

test('dependency system level preserves original business relations and route', () => {
  const model = fixture();
  assert.ok(dependencyLevels(model).some((level) => level.value === 'business_system'));
  assert.equal(dependencyLevel(model, 'business_system'), 'business_system');
  const route = readRoute('#/relations?level=business_system&node=operations');
  assert.equal(readRoute(routeHash(route)).graphLevel, 'business_system');
  const projection = projectDependencies(model, {
    level: 'business_system',
    depth: 0,
    direction: 'both',
    family: 'all',
  });
  assert.deepEqual(projection.nodes.map((n) => n.id).sort(), ['control', 'design', 'operations']);
  assert.deepEqual(projection.nodes.find((n) => n.id === 'operations').internalRelationIds, ['business-link']);
  assert.deepEqual(
    projection.relations.map((r) => r.id),
    ['business-link'],
  );
  assert.equal(projection.edges.length, 0);
  assert.equal(model.relations.filter((r) => r.type === 'relates-to').length, 1);
  assert.equal(
    model.relations.some((r) => r.sourceId === 'design' || r.sourceId === 'control'),
    false,
  );
});

test('historical publications keep roots and fallback for a shared system-level URL', () => {
  const historical = adaptPublication({
    space: 'release',
    version: 'old',
    nodes: [node('domain', 'domain'), node('area', 'area')],
    relations: [edge('parent', 'presents', 'domain', 'area')],
  });
  assert.equal(kindLabel(historical.nodeById.get('domain')), 'Domain');
  assert.equal(rootsOf(historical)[0].id, 'domain');
  assert.equal(
    dependencyLevels(historical).some((l) => l.value === 'business_system'),
    false,
  );
  assert.equal(dependencyLevel(historical, 'business_system'), 'domain');
});

test('published Universe is the navigable root above the systems', () => {
  const model = adaptPublication({
    space: 'release',
    version: 'universe-fixture',
    nodes: [
      node('universe', 'universe'),
      node('design', 'business_system'),
      node('operations', 'business_system'),
      node('control', 'business_system'),
      node('orchestration', 'domain'),
      node('orders', 'area'),
      node('order', 'capability'),
    ],
    relations: [
      edge('u-design', 'contains', 'universe', 'design'),
      edge('u-operations', 'contains', 'universe', 'operations'),
      edge('u-control', 'contains', 'universe', 'control'),
      edge('o-domain', 'presents', 'operations', 'orchestration'),
      edge('domain-area', 'presents', 'orchestration', 'orders'),
      edge('area-cap', 'contains', 'orders', 'order'),
    ],
  });
  assert.deepEqual(
    rootsOf(model).map((n) => n.id),
    ['universe'],
  );
  assert.deepEqual(
    childrenOf(model, 'universe').map((n) => n.id),
    ['design', 'operations', 'control'],
  );
  assert.deepEqual(
    lineageOf(model, 'order').map((n) => n.id),
    ['universe', 'operations', 'orchestration', 'orders', 'order'],
  );
  assert.equal(kindLabel(model.nodeById.get('universe')), 'Universe');
  const renamed = adaptPublication({
    space: 'release',
    version: 'renamed-root',
    nodes: [{ id: 'beaumanoir-target-universe', kind: 'universe', fields: { name: 'Enterprise Architecture' } }],
    relations: [],
  });
  assert.equal(kindLabel(renamed.nodeById.get('beaumanoir-target-universe')), 'Enterprise Architecture');
});
