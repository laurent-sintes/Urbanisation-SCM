import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPublication } from '../scripts/load-publication.mjs';
import { adaptPublication } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';
import {
  catalogOf,
  filterScenarios,
  pathsForNode,
  scenarioCapabilities,
  scenarioContextParticipants,
  scenariosForNode,
} from './src/scenarioCatalog.ts';
import { searchPublication } from './src/search.ts';

const catalog = {
  value_streams: [
    {
      id: 'v',
      label_fr: 'Recevoir des produits',
      name: 'Receive Products',
      value: 'Produits obtenus',
      beneficiary: 'Client',
      boundary: 'Livraison',
    },
  ],
  scenarios: [
    {
      id: 's',
      title: 'Livraison partielle',
      situation: 'Stock partiel',
      objective: 'Livrer',
      trigger: 'Commande',
      value_stream_ids: ['v', 'w'],
      events: ['shortage'],
      objects: ['order'],
      situations: ['exception'],
    },
  ],
  paths: [
    {
      id: 'p',
      scenario_id: 's',
      steps: [{ description: 'Expédier', contributions: [{ node_id: 'c', role: 'Préparer' }] }],
    },
  ],
  legacy_links: [],
};
const model = () =>
  adaptPublication({
    space: 'release',
    version: 'fixture',
    nodes: [
      { id: 'd', kind: 'domain', fields: { name: 'Supply' } },
      { id: 'c', kind: 'capability', fields: { name: 'Preparation' } },
    ],
    relations: [{ id: 'r', type: 'contains', source_id: 'd', target_id: 'c' }],
    scenario_catalog: catalog,
  });
test('catalog filters intersect, keep unique scenarios and do not infer historical data', () => {
  assert.equal(filterScenarios(catalog, { stream: 'v', event: 'shortage', capability: 'c' }).length, 1);
  assert.equal(filterScenarios(catalog, { stream: 'w' }).length, 1);
  assert.equal(filterScenarios(catalog, { event: 'other' }).length, 0);
  assert.equal(catalogOf({ raw: {} }), undefined);
});
test('scenario links derive from explicit contributions in same snapshot', () => {
  assert.equal(scenariosForNode(model(), 'c').length, 1);
  assert.equal(scenariosForNode(model(), 'd').length, 1);
  assert.equal(scenariosForNode(model(), 'absent').length, 0);
  assert.deepEqual(
    pathsForNode(model(), 'c').map((path) => path.id),
    ['p'],
  );
  assert.deepEqual(
    pathsForNode(model(), 'd').map((path) => path.id),
    ['p'],
  );
  assert.deepEqual(pathsForNode(model(), 'absent'), []);
  assert.deepEqual(pathsForNode({ raw: {} }, 'c'), []);
});
test('context participants link scenarios to their own ancestors without becoming capabilities', () => {
  const raw = structuredClone(model().raw);
  raw.nodes.push(
    { id: 'logistics', kind: 'business_system', fields: { name: 'Logistics' } },
    { id: 'receiving', kind: 'business_area', fields: { name: 'Receiving Operations' } },
  );
  raw.relations.push({ id: 'logistics-receiving', type: 'contains', source_id: 'logistics', target_id: 'receiving' });
  raw.scenario_catalog.paths[0].steps[0].context_participants = [
    {
      node_id: 'receiving',
      role: 'Confirmer la réception physique',
      conditions: ['Prestation confiée'],
      source_refs: ['U1115'],
    },
  ];
  const m = adaptPublication(raw);
  assert.deepEqual(scenarioCapabilities(raw.scenario_catalog, 's'), ['c']);
  assert.deepEqual(scenarioContextParticipants(raw.scenario_catalog, 's'), ['receiving']);
  assert.equal(scenariosForNode(m, 'receiving').length, 1);
  assert.equal(scenariosForNode(m, 'logistics').length, 1);
  assert.deepEqual(
    pathsForNode(m, 'receiving').map((path) => path.id),
    ['p'],
  );
  assert.deepEqual(
    pathsForNode(m, 'logistics').map((path) => path.id),
    ['p'],
  );
  assert.equal(filterScenarios(raw.scenario_catalog, { capability: 'receiving' }).length, 0);
  assert.equal(filterScenarios(raw.scenario_catalog, { query: 'Confirmer la réception physique' }).length, 1);
  assert.equal(filterScenarios(raw.scenario_catalog, { query: 'U1115' }).length, 0);
});
test('a path is listed once despite repeated contributions and a legacy scenario does not invent a path', () => {
  const raw = structuredClone(model().raw);
  raw.scenario_catalog.paths[0].steps.push({ contributions: [{ node_id: 'c', role: 'Confirmer' }] });
  raw.scenario_catalog.legacy_links.push({ owner_id: 'legacy', legacy_id: 'old', scenario_id: 's' });
  const m = adaptPublication(raw);
  assert.deepEqual(
    pathsForNode(m, 'd').map((path) => path.id),
    ['p'],
  );
  assert.deepEqual(
    scenariosForNode(m, 'legacy').map((scenario) => scenario.id),
    ['s'],
  );
  assert.deepEqual(pathsForNode(m, 'legacy'), []);
});
test('published orchestration and process visibility links select their contributing variants', async () => {
  const m = adaptPublication((await loadPublication({ version: '2026-10-16.4' })).raw);
  for (const [node, scenario, expected, irrelevantDefault] of [
    [
      'order-workflow-orchestration',
      'remote-payment-ambiguous',
      'payment-resumption-not-confirmed-path',
      'remote-payment-ambiguous-path',
    ],
    ['BHV082', 'customer-credit-hold', 'credit-review-no-response-path', 'customer-credit-hold-path'],
  ]) {
    const paths = pathsForNode(m, node).filter((path) => path.scenario_id === scenario);
    assert.ok(
      paths.some((path) => path.id === expected),
      node,
    );
    assert.ok(
      paths.every((path) => path.id !== irrelevantDefault),
      node,
    );
    assert.equal(new Set(paths.map((path) => path.id)).size, paths.length);
    assert.equal(scenariosForNode(m, node).filter((item) => item.id === scenario).length, 1);
    const parent = m.relations.find((relation) => relation.targetId === node && relation.type === 'contains');
    assert.ok(pathsForNode(m, parent.sourceId).some((path) => path.id === expected));
  }
});
test('search returns a unique scenario and a value stream, never review metadata', () => {
  const m = model();
  assert.equal(searchPublication(m, 'Livraison partielle').filter((r) => r.kind === 'scenario').length, 1);
  assert.equal(searchPublication(m, 'Recevoir des produits')[0].kind, 'value_stream');
});

test('path choices, dependencies and results are discoverable without leaking review notes', () => {
  const raw = structuredClone(model().raw);
  const c = raw.scenario_catalog;
  c.paths[0].title = 'Livraison fractionnée';
  c.paths[0].dependencies = [{ from: 'a', to: 'b', condition: 'Contrôle contradictoire' }];
  c.paths[0].steps[0].outcome = 'Écart régularisé';
  c.scenarios[0].review = { note: 'ConfidentielEditorial' };
  c.paths.push({ ...c.paths[0], id: 'second-path' });
  const m = adaptPublication(raw);
  for (const query of ['Livraison fractionnée', 'Contrôle contradictoire', 'Écart régularisé']) {
    assert.equal(searchPublication(m, query).filter((r) => r.kind === 'scenario').length, 1, query);
    assert.equal(filterScenarios(c, { query }).length, 1, query);
  }
  assert.equal(searchPublication(m, 'ConfidentielEditorial').length, 0);
  assert.equal(filterScenarios(c, { query: 'ConfidentielEditorial' }).length, 0);
});
test('deep links pin version, path, origin and filters across reload', () => {
  const route = readRoute('#/scenarios?version=fixed&scenario=s&path=p&node=c&event=shortage');
  assert.equal(route.scenario, 's');
  assert.equal(route.path, 'p');
  assert.equal(route.node, 'c');
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.ok(!routeHash({ ...route, view: 'sheet' }).includes('scenario='));
});
