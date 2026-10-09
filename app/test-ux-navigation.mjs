import assert from 'node:assert/strict';
import test from 'node:test';
import { inlineParts } from './src/inlineLinks.ts';
import { adaptPublication } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';
import { searchPublication } from './src/search.ts';

test('consultation keeps scenario, chosen path, filter and scroll across a glossary round trip', () => {
  const catalog = routeHash({ ...readRoute(''), version: 'fixed', view: 'scenarios', capability: 'c', scroll: '630' });
  const scenario = routeHash({
    ...readRoute(catalog),
    scenario: 's',
    path: 'alternative',
    scroll: '920',
    catalogReturn: catalog,
  });
  const sheet = routeHash({ ...readRoute(''), version: 'fixed', view: 'sheet', node: 'c', returnTo: scenario });
  const glossary = readRoute(
    routeHash({ ...readRoute(''), version: 'fixed', view: 'glossary', term: 'MOD015', returnTo: sheet }),
  );
  const restored = readRoute(readRoute(glossary.returnTo).returnTo);
  assert.equal(restored.path, 'alternative');
  assert.equal(restored.scenario, 's');
  assert.equal(restored.scroll, '920');
  assert.equal(readRoute(restored.catalogReturn).capability, 'c');
  assert.equal(readRoute(restored.catalogReturn).scroll, '630');
  assert.equal(readRoute('#/sheet?returnTo=https%3A%2F%2Fevil.test&scroll=-1').returnTo, undefined);
});
test('method search uses only the supplied guide and excludes retired notions and maintenance notes', () => {
  const model = adaptPublication({ space: 'release', version: 'fixed', nodes: [], relations: [] });
  const guide = {
    glossary: {
      terms: [
        {
          id: 'MOD015',
          name: 'Capability',
          label_fr: 'Capacité',
          definition: 'Aptitude durable',
          editorial_notes: ['SECRETNOTE'],
        },
        { id: 'MOD026', name: 'Ancienne notion', definition: 'Retirée', status: 'retired' },
      ],
    },
    chapters: [{ id: 'start', title: 'Pour commencer', intro: 'Lire une fiche', sections: [] }],
    lessons: [],
  };
  assert.equal(searchPublication(model, 'capacité', guide)[0].id, 'MOD015');
  assert.equal(searchPublication(model, 'Pour commencer', guide)[0].kind, 'guide');
  assert.equal(searchPublication(model, 'capacité').length, 0);
  assert.equal(searchPublication(model, 'Ancienne notion', guide).length, 0);
  assert.equal(searchPublication(model, 'SECRETNOTE', guide).length, 0);
  assert.deepEqual(inlineParts('[Capacité](method:MOD015)'), [
    { text: 'Capacité', kind: 'method', target: 'MOD015', anchor: undefined },
  ]);
});

test('method search suppresses aliases and moved entries but indexes the unified type definitions', () => {
  const model = adaptPublication({
    space: 'release',
    version: 'fixed',
    nodes: [],
    relations: [],
    glossary: { terms: [{ id: 'TER001', name: 'Capacité', definition: 'Aptitude' }] },
  });
  const guide = {
    glossary: {
      aliases: { TER001: 'MOD015' },
      terms: [
        { id: 'MOD015', name: 'Capability', label_fr: 'Capacité', definition: 'Aptitude' },
        { id: 'MOD007', name: 'Type', definition: 'Résultat dominant', values: { Décision: 'Choisir une réponse' } },
        { id: 'MOD001', name: 'Decision', definition: 'Choisir', parent_term: 'MOD007' },
        { id: 'MOD017', name: 'Function', definition: 'Fonction', guide_section: 'method' },
      ],
    },
    chapters: [],
    lessons: [],
  };
  assert.deepEqual(
    searchPublication(model, 'capacité', guide).map((t) => t.id),
    ['MOD015'],
  );
  assert.deepEqual(
    searchPublication(model, 'décision', guide).map((t) => t.id),
    ['MOD007'],
  );
  assert.equal(searchPublication(model, 'function', guide).length, 0);
});
