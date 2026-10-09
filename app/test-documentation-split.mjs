import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptPublication } from './src/model.ts';
import { readRoute, routeHash } from './src/navigation.ts';
import { searchPublication } from './src/search.ts';

test('documentation search retains the owner of each chapter and glossary term', () => {
  const meta = {
    id: 'flow-atlas-metamodel',
    chapters: [{ id: 'metamodel', title: 'Structure des objets', intro: 'Cardinalité métier', sections: [] }],
    lessons: [],
    glossary: { terms: [{ id: 'MOD008', name: 'Domain', definition: 'Périmètre métier' }], model_term_ids: [] },
  };
  const transformation = {
    id: 'transformation',
    chapters: [{ id: 'transform', title: 'Conduire la transformation', intro: 'Trajectoire cible', sections: [] }],
    lessons: [],
    glossary: {
      terms: [{ id: 'MOD032', name: 'Transformation', definition: 'Faire évoluer la cible' }],
      model_term_ids: [],
    },
  };
  const model = adaptPublication({
    space: 'release',
    version: 'test',
    nodes: [],
    relations: [],
    glossary: { terms: [] },
    metamodel: { documentation: meta },
  });
  assert.equal(
    searchPublication(model, 'cardinalité', transformation, meta).find((result) => result.id === 'metamodel')?.document,
    'metamodel',
  );
  assert.equal(
    searchPublication(model, 'trajectoire', transformation, meta).find((result) => result.id === 'transform')?.document,
    'principles',
  );
  assert.equal(
    searchPublication(model, 'Domain', transformation, meta).find((result) => result.id === 'MOD008')?.document,
    'metamodel',
  );
});

test('the two documentation entries and glossaries have distinct routes', () => {
  for (const [view, glossary] of [
    ['metamodel', 'meta'],
    ['principles', 'transformation'],
  ]) {
    const route = { ...readRoute(''), view, glossary, version: '2026-10-09.5' };
    assert.equal(readRoute(routeHash(route)).view, view);
    assert.equal(readRoute(routeHash({ ...route, view: 'glossary' })).glossary, glossary);
  }
});
