import assert from 'node:assert/strict';
import test from 'node:test';
import {
  annotatePrincipleText,
  designPrinciples,
  featuredPrinciples,
  principleDestination,
  principleGroupsForNode,
  principlesForNode,
  principlesForRelation,
  readingGuides,
  readingsForPrinciple,
} from './src/designPrinciples.ts';
import { inlineParts, plainInlineText } from './src/inlineLinks.ts';
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

test('generic practices form a reading guide outside the directing principles', () => {
  const raw = structuredClone(fixture().raw);
  raw.principles[0].featured = false;
  raw.principles[0].implications = 'private-iteration-detail';
  raw.principles.push({
    id: 'FOUNDATION',
    label_fr: 'Une cartographie métier',
    statement: 'Des responsabilités durables.',
    featured: true,
    reading_children: ['P'],
    scope: { kind: 'global', targets: [{ collection: 'nodes', id: 'D' }] },
  });
  raw.nodes[1].fields.scope = '[Pourquoi](principle:P)';
  const original = structuredClone(raw),
    model = adaptPublication(raw);
  assert.deepEqual(
    featuredPrinciples(model).map((p) => p.id),
    [],
  );
  assert.deepEqual(
    readingGuides(model).map((p) => p.id),
    ['FOUNDATION'],
  );
  assert.equal(principleDestination(model, 'P').principle.id, 'FOUNDATION');
  assert.equal(principleDestination(model, 'P').section, 'principle-P');
  assert.equal(principleDestination(model, 'OLD'), undefined);
  assert.equal(
    searchPublication(model, 'private-iteration-detail').some((r) => r.kind === 'principle'),
    false,
  );
  assert.equal(
    searchPublication(model, 'Historic convention').some((r) => r.kind === 'principle'),
    false,
  );
  const guide = searchPublication(model, 'saison').find((r) => r.id === 'FOUNDATION');
  assert.equal(guide.kind, 'guide');
  assert.equal(guide.document, 'design-principles');
  assert.equal(guide.name, 'Comment lire la cartographie');
  assert.equal(
    searchPublication(model, 'saison').some((r) => r.kind === 'principle'),
    false,
  );
  assert.deepEqual(
    principleGroupsForNode(model, 'C').direct.map((p) => p.id),
    [],
  );
  assert.deepEqual(principleGroupsForNode(model, 'C').inherited, []);
  assert.equal(readingsForPrinciple(model, 'FOUNDATION').length, 1);
  assert.deepEqual(model.raw, original);
  const historical = adaptPublication({ ...raw, principles: raw.principles.filter((p) => p.id !== 'FOUNDATION') });
  assert.equal(principleDestination(historical, 'P'), undefined);
  assert.deepEqual(featuredPrinciples(historical), []);
  assert.deepEqual(readingGuides(historical), []);
});

test('typed principle links preserve escaped labels and plain text without inventing links', () => {
  const text = String.raw`A [Pourquoi \[ce choix\]](principle:P) et \[littéral](principle:absent).`;
  const parts = inlineParts(text);
  assert.deepEqual(
    parts.filter((p) => p.kind),
    [{ text: 'Pourquoi [ce choix]', kind: 'principle', target: 'P', anchor: undefined }],
  );
  assert.equal(plainInlineText(text), 'A Pourquoi [ce choix] et [littéral](principle:absent).');
  assert.equal(annotatePrincipleText(fixture(), '[Saison](principle:P)'), '[Saison](principle:P)');
});

test('local citations, explicit targets and collapsed inheritance are distinct and deduplicated', () => {
  const raw = structuredClone(fixture().raw);
  raw.nodes[1].fields.scope = '[Pourquoi](principle:P). [Encore](principle:P). [Absente](principle:missing).';
  raw.nodes[1].fields.pedagogical_description = {
    explanation: '[Raison](principle:P)',
    source_refs: ['[Privé](principle:OLD)'],
  };
  raw.glossary.terms[0].context = '[Comprendre le choix](principle:P).';
  raw.relations.push({
    id: 'SHARE',
    type: 'shares-data',
    source_id: 'D',
    target_id: 'C',
    fields: {
      label: 'Shared facts',
      data_exchange: {
        contents: [{ name: 'Facts', description: 'Shared facts.', glossary_refs: ['T'] }],
        purpose: '[Pourquoi](principle:P)',
      },
    },
  });
  raw.principles.push({
    id: 'OTHER',
    featured: true,
    statement: 'Another choice',
    scope: { kind: 'targeted', targets: [{ collection: 'nodes', id: 'D' }] },
  });
  const original = structuredClone(raw),
    model = adaptPublication(raw);
  assert.deepEqual(
    principleGroupsForNode(model, 'C').direct.map((p) => p.id),
    ['P'],
  );
  assert.deepEqual(
    principleGroupsForNode(model, 'C').inherited.map((p) => p.id),
    ['OTHER'],
  );
  assert.deepEqual(
    principlesForRelation(model, 'SHARE').map((p) => p.id),
    ['P'],
  );
  assert.deepEqual(readingsForPrinciple(model, 'P'), [
    { collection: 'nodes', id: 'C', fields: ['scope', 'pedagogical_description'] },
    { collection: 'terms', id: 'T', fields: ['context'] },
    { collection: 'relations', id: 'SHARE', fields: ['data_exchange'] },
  ]);
  assert.deepEqual(readingsForPrinciple(model, 'OLD'), []);
  assert.deepEqual(readingsForPrinciple(model, 'missing'), []);
  assert.deepEqual(model.raw, original);
  const old = adaptPublication({ ...raw, principles: raw.principles.filter((p) => p.id !== 'P') });
  assert.deepEqual(readingsForPrinciple(old, 'P'), []);
  assert.deepEqual(principleGroupsForNode(old, 'C').direct, []);
});
