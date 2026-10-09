import assert from 'node:assert/strict';
import test from 'node:test';
import { behaviorNature, behaviorTypes } from './src/behaviorTypes.ts';
import { adaptPublication } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';

test('seven behavior forms have distinct icons and never inherit a capacity type', () => {
  assert.equal(Object.keys(behaviorTypes).length, 7);
  assert.equal(new Set(Object.values(behaviorTypes).map((item) => item.icon)).size, 7);
  assert.equal(behaviorNature({ kind: 'behavior', fields: { nature: 'decision' } }), undefined);
  assert.equal(behaviorNature({ kind: 'behavior', fields: { nature: 'policy' } }), undefined);
  assert.equal(behaviorNature({ kind: 'capability', fields: { nature: 'policy' } }), undefined);
  assert.equal(behaviorNature({ kind: 'capability', fields: { nature: 'business_scope' } }), undefined);
  assert.equal(behaviorNature({ kind: 'behavior', fields: { nature: 'policy_strategy' } }), 'policy_strategy');
  assert.equal(behaviorNature({ kind: 'behavior', fields: { nature: 'toString' } }), undefined);
});
test('reference exception is derived from explicit published parent, not ID or name', () => {
  const model = adaptPublication({
    space: 'release',
    version: 'fixture',
    nodes: [
      { id: 'external', kind: 'reference', fields: { name: 'Product Reference' } },
      { id: 'D01.noHint', kind: 'capability', fields: { name: 'Unrelated', nature: 'action' } },
      { id: 'D08.fake', kind: 'capability', fields: { name: 'Product Reference Ingestion', nature: 'action' } },
    ],
    relations: [{ id: 'edge', type: 'contains', source_id: 'external', target_id: 'D01.noHint' }],
  });
  assert.equal(model.nodeById.get('D01.noHint').referenceParentName, 'Product Reference');
  assert.equal(model.nodeById.get('D08.fake').referenceParentName, undefined);
});
test('meta glossary deep links preserve their separate namespace and fixed publication', () => {
  const route = readRoute('#/glossary?glossary=meta&term=MOD006&version=2026-09-19.2');
  assert.equal(route.glossary, 'meta');
  assert.deepEqual(readRoute(routeHash(route)), route);
});
