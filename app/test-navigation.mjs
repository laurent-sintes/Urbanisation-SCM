import test from 'node:test';
import assert from 'node:assert/strict';
import { readRoute, routeHash } from './src/navigation.ts';

test('a shared link preserves its fixed publication, selection, source and literal characters', () => {
  const route = {
    ...readRoute(''), node: 'OBJ/été&1', scope: '@root', version: '2026-09-13.5', view: 'relations',
    query: 'ordre & événement', status: 'partial', relation: 'REL-1',
    source: 'connaissance/fichier avec espaces.md', anchor: 'référence-1', sourceId: 'U153',
  };
  assert.deepEqual(readRoute(routeHash(route)), route);
});
test('old space links use the published model and preserve actual node identities', () => {
  const route = readRoute('#space=backlog&node=D02.b&view=links');
  assert.equal(route.node, 'D02.b');
  assert.equal(route.view, 'relations');
  assert.equal(route.version, '');
  assert.ok(!routeHash(route).includes('space='));
  for (const id of ['atlas', 'transactional', 'process']) assert.equal(readRoute(`#node=${id}`).node, '');
});
test('legacy type filters cannot restrict a shared search invisibly', () => {
  const route = readRoute('#version=2026-09-19.6&node=D04&q=order&type=capability');
  assert.deepEqual(route, readRoute('#version=2026-09-19.6&node=D04&q=order'));
  assert.ok(!routeHash(route).includes('type='));
});
test('a direct capability URL leaves view selection to its published structure', () => {
  assert.equal(readRoute('#node=D04.e').view, undefined);
  assert.equal(readRoute('#node=D04.e&view=unknown').view, undefined);
  assert.equal(routeHash(readRoute('')), '#');
});

test('market view is shareable and old sheet market anchors open the dedicated tab', () => {
  const route = readRoute('#version=2026-09-19.3&node=D03.n&view=market');
  assert.equal(route.view, 'market');
  assert.deepEqual(readRoute(routeHash(route)), route);
  const legacy = readRoute('#version=2026-09-19.3&node=D04.j&view=sheet&section=market_comparisons');
  assert.equal(legacy.view, 'market');
  assert.equal(legacy.node, 'D04.j');
  assert.equal(legacy.version, '2026-09-19.3');
  assert.equal(readRoute('#view=glossary&term=TER070&section=market_comparisons').view, 'glossary');
  assert.equal(readRoute('#view=market').view, 'map');
});

test('a principle deep link pins its publication without creating a model selection', () => {
  const route = readRoute('#version=2026-09-16.2&view=principles&principle=metier&node=D01&scope=D01');
  assert.equal(route.view, 'principles');
  assert.equal(route.principle, 'metier');
  assert.equal(route.version, '2026-09-16.2');
  assert.equal(route.node, '');
  assert.equal(route.scope, '');
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.ok(!routeHash({ ...route, view: 'sheet', node: 'D01' }).includes('principle='));
  assert.equal(readRoute('#view=glossary&principle=metier').principle, undefined);
});

test('graph exploration links preserve level, complete depth, filters and fixed publication', () => {
  const route = { ...readRoute(''), view: 'relations', node: 'D07.c', version: '2026-09-13.5',
    graphLevel: 'domain', graphDepth: 0, graphDirection: 'incoming', graphFamily: 'other', graphLayout: 'organic', graphLabels: 'focus' };
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.equal(readRoute('#view=links&depth=3&level=universe').graphDepth, 3);
  const invalid = readRoute('#view=relations&depth=-1&level=solution&direction=random&qualification=x&layout=x&labels=x');
  for (const key of Object.keys(route).filter(k => k.startsWith('graph'))) assert.equal(invalid[key], undefined);
  assert.ok(!routeHash({ ...route, view: 'map' }).includes('depth='));
});

test('area links round-trip without changing historical domain and universe levels', () => {
  for (const graphLevel of ['area', 'domain', 'universe']) {
    const route = { ...readRoute(''), view: 'relations', node: 'D04', version: 'fixed-publication', graphLevel };
    assert.deepEqual(readRoute(routeHash(route)), route);
  }
});

test('map detail and selected Business Area survive a shared publication link', () => {
  const route = { ...readRoute(''), view: 'map', node: 'BA-EXAMPLE', scope: 'D04', version: 'fixed-publication', mapDepth: 4, mapFocus: 'BA-EXAMPLE' };
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.equal(readRoute('#view=map&mapDepth=9').mapDepth, undefined);
  assert.ok(!routeHash({ ...route, view: 'sheet' }).includes('mapDepth='));
});
