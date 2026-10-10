import assert from 'node:assert/strict';
import test from 'node:test';
import { readRoute, routeHash } from './src/navigation.ts';

test('a route preserves its fixed publication, selection and literal characters', () => {
  const route = {
    ...readRoute(''),
    node: 'OBJ/été&1',
    scope: '@root',
    version: '2026-09-13.5',
    view: 'relations',
    query: 'ordre & événement',
    status: 'partial',
    relation: 'REL-1',
    source: 'connaissance/fichier avec espaces.md',
    anchor: 'référence-1',
    sourceId: 'U153',
  };
  assert.deepEqual(readRoute(routeHash(route)), route);
});

test('only the current path syntax selects a view', () => {
  assert.equal(readRoute('#view=sheet&node=D04').view, undefined);
  assert.equal(readRoute('#view=sheet&node=D04').node, '');
  assert.equal(readRoute('#/unknown?node=D04').view, undefined);
  assert.equal(readRoute('#/sheet?node=D04').node, 'D04');
  assert.equal(routeHash(readRoute('')), '#/');
});

test('help topics keep the selected publication and clear model selection', () => {
  const workshop = readRoute('#/help?topic=workshop&version=2026-10-09.8&node=some-node&scope=some-domain');
  assert.equal(workshop.view, 'help');
  assert.equal(workshop.helpTopic, 'workshop');
  assert.equal(workshop.version, '2026-10-09.8');
  assert.equal(workshop.node, '');
  assert.equal(workshop.scope, '');
  assert.deepEqual(readRoute(routeHash(workshop)), workshop);
  assert.equal(readRoute('#/help?topic=unknown').helpTopic, undefined);
});

test('unknown query keys do not restrict a search invisibly', () => {
  const route = readRoute('#/map?version=2026-09-19.6&node=D04&q=order&type=capability');
  assert.deepEqual(route, readRoute('#/map?version=2026-09-19.6&node=D04&q=order'));
  assert.ok(!routeHash(route).includes('type='));
});

test('market needs a selected object; principles clear model selection', () => {
  const market = readRoute('#/market?version=2026-09-19.3&node=D03.n');
  assert.equal(market.view, 'market');
  assert.deepEqual(readRoute(routeHash(market)), market);
  assert.equal(readRoute('#/market').view, 'map');
  const method = readRoute('#/principles?version=2026-09-16.2&principle=metier&node=D01&scope=D01');
  assert.equal(method.view, 'principles');
  assert.equal(method.node, '');
  assert.equal(method.scope, '');
  assert.deepEqual(readRoute(routeHash(method)), method);
  assert.ok(!routeHash({ ...method, view: 'sheet', node: 'D01' }).includes('principle='));
});

test('graph options retain valid values and reject invalid values', () => {
  const route = {
    ...readRoute(''),
    view: 'relations',
    node: 'D07.c',
    version: 'fixed',
    graphLevel: 'domain',
    graphDepth: 0,
    graphDirection: 'incoming',
    graphFamily: 'other',
    graphLayout: 'organic',
    graphLabels: 'focus',
  };
  assert.deepEqual(readRoute(routeHash(route)), route);
  const invalid = readRoute('#/relations?depth=-1&level=solution&direction=random&qualification=x&layout=x&labels=x');
  for (const key of Object.keys(route).filter((k) => k.startsWith('graph'))) assert.equal(invalid[key], undefined);
  assert.ok(!routeHash({ ...route, view: 'map' }).includes('depth='));
});

test('map detail and selected Business Area survive a fixed publication route', () => {
  const route = {
    ...readRoute(''),
    view: 'map',
    node: 'BA-EXAMPLE',
    scope: 'D04',
    version: 'fixed',
    mapDepth: 4,
    mapFocus: 'BA-EXAMPLE',
  };
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.equal(readRoute('#/map?mapDepth=9').mapDepth, undefined);
  assert.ok(!routeHash({ ...route, view: 'sheet' }).includes('mapDepth='));
});
