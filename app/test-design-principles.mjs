import assert from 'node:assert/strict';
import test from 'node:test';
import { annotatePrincipleText, designPrinciples, principlesForNode } from './src/designPrinciples.ts';
import { adaptPublication } from './src/model.ts';
import { drawerNavigationKey, readRoute, routeHash } from './src/navigation.ts';
import { searchPublication } from './src/search.ts';

const fixture = () =>
  adaptPublication({
    space: 'release',
    version: 'fixed',
    nodes: [
      { id: 'D', kind: 'domain', fields: { name: 'Domain' } },
      { id: 'C', kind: 'capability', fields: { name: 'Child' } },
    ],
    relations: [{ id: 'R', type: 'contains', source_id: 'D', target_id: 'C' }],
    principles: [
      {
        id: 'P',
        label_fr: 'Des contextes configurables',
        statement: 'Saison, intercompany et grille.',
        rationale: 'Rythmes variables.',
        featured: true,
        display_order: 1,
        scope: { kind: 'targeted', targets: [{ collection: 'nodes', id: 'D' }] },
        source_refs: ['secret-user'],
        review: { note: 'internal-note' },
      },
      { id: 'OLD', statement: 'Historic convention' },
    ],
    glossary: {
      terms: [
        {
          id: 'T',
          name: 'Season',
          label_fr: 'Saison',
          short_description: 'Un repère configurable.',
          definition: 'Un repère de calendrier.',
        },
      ],
    },
  });
test('principles have a distinct direct route with fixed publication and origin', () => {
  const route = readRoute(
    '#/design-principles?principle=P&version=fixed&returnTo=%23%2Fsheet%3Fnode%3DC&node=obsolete',
  );
  assert.equal(route.view, 'design-principles');
  assert.equal(route.node, '');
  assert.deepEqual(readRoute(routeHash(route)), route);
  assert.equal(readRoute('#/principles?principle=CH01').view, 'principles');
});
test('principle search and reciprocal reading links use only the supplied snapshot', () => {
  const model = fixture(),
    original = structuredClone(model.raw);
  for (const q of ['saison', 'intercompany', 'grille']) assert.equal(searchPublication(model, q)[0].kind, 'principle');
  for (const q of ['secret-user', 'internal-note']) assert.deepEqual(searchPublication(model, q), []);
  assert.deepEqual(
    principlesForNode(model, 'C').map((p) => p.id),
    ['P'],
  );
  assert.deepEqual(
    designPrinciples(model).map((p) => p.id),
    ['P', 'OLD'],
  );
  const old = adaptPublication({ ...original, principles: [original.principles[1]] });
  assert.deepEqual(principlesForNode(old, 'C'), []);
  assert.equal(
    searchPublication(old, 'saison').some((result) => result.kind === 'principle'),
    false,
  );
  assert.deepEqual(model.raw, original);
});
test('jargon links use this edition glossary and preserve authored links', () => {
  const model = fixture();
  assert.equal(
    annotatePrincipleText(model, 'Saison, saison et [Season](glossary:T).'),
    '[Saison](glossary:T), [saison](glossary:T) et [Season](glossary:T).',
  );
  assert.equal(annotatePrincipleText(model, 'Saisons et Seasons.'), '[Saisons](glossary:T) et [Seasons](glossary:T).');
});
test('typing and clearing a query keeps the drawer while choosing content closes it', () => {
  const route = readRoute('#/sheet?node=C&version=fixed');
  assert.equal(drawerNavigationKey(route), drawerNavigationKey({ ...route, query: 'saison' }));
  assert.notEqual(
    drawerNavigationKey(route),
    drawerNavigationKey({ ...route, view: 'design-principles', principle: 'P', node: '' }),
  );
  assert.notEqual(drawerNavigationKey(route), drawerNavigationKey({ ...route, version: 'older' }));
});
