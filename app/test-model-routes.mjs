import assert from 'node:assert/strict';
import test from 'node:test';
import { readRoute, routeHash } from './src/navigation.ts';

const nodes = [
  { id: 'supply-chain-orchestration', kind: 'domain', displayCode: 'DOM-004' },
  { id: 'D04', kind: 'area', hierarchyLabel: 'Sous-domaine', displayCode: 'SUB-001' },
];
const model = { version: 'v1', nodes, nodeById: new Map(nodes.map((n) => [n.id, n])) };
test('domain links expose canonical identity with no compatibility alias', () => {
  const route = readRoute('#/sheet?version=v1&node=supply-chain-orchestration&scope=D04&section=definition');
  assert.deepEqual(readRoute(routeHash(route, model)), route);
  assert.match(routeHash(route, model), /node=supply-chain-orchestration/);
  assert.ok(!routeHash(route, model).includes('DOM-004'));
});
test('current and historical relation levels retain the selected publication semantics', () => {
  assert.match(routeHash(readRoute('#/relations?level=universe'), model), /level=domain/);
  assert.match(routeHash(readRoute('#/relations?level=area'), model), /level=subdomain/);
  assert.equal(readRoute('#/relations?level=subdomain').graphLevel, 'area');
  assert.match(routeHash(readRoute('#/relations?level=universe'), { ...model, nodes: [] }), /level=universe/);
  const route = readRoute('#/scenarios?version=v1&capability=D04');
  assert.equal(readRoute(routeHash(route, model)).capability, 'D04');
});
test('hotspot direct link keeps its identifier and pinned publication', () => {
  const route = readRoute('#/hotspots?version=2026-10-09.1&hotspot=HS-002');
  assert.equal(route.view, 'hotspots');
  assert.equal(route.hotspot, 'HS-002');
  assert.deepEqual(readRoute(routeHash(route, model)), route);
});
