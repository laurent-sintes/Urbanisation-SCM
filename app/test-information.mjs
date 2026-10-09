import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptPublication } from './src/model.ts';
import { searchPublication } from './src/search.ts';

const card = (id, cap) => ({
  id,
  name: `Information ${id}`,
  label_fr: 'Attendu métier',
  question: 'Que faut-il satisfaire ?',
  definition: 'Un attendu contextualisé.',
  context: 'Pour une commande.',
  essential_elements: ['Besoin et quantité'],
  granularity_rationale: 'Le besoin donne son sens à la quantité.',
  document_and_fact_boundary: 'Pas de fait de réalisation.',
  boundaries: ['Distinct d’un engagement'],
  capability_roles: [
    { capability_ref: cap, role: 'utilise', meaning: 'Éclaire le besoin', source_refs: ['SOURCESECRET'] },
  ],
  examples: [{ title: 'Exemple', situation: 'Quarante chemises.', source_refs: ['SOURCESECRET'] }],
  market_comparisons: [
    { vendor: 'Éditeur', similarities: 'Un besoin documenté', source_refs: ['SOURCESECRET'], status: 'proposed' },
  ],
  review: { state: 'proposed', note: 'NOTEINTERNE' },
  source_refs: ['SOURCESECRET'],
});
const fixture = () => ({
  space: 'release',
  version: '2099-01-01.1',
  nodes: [
    { id: 'D', kind: 'domain', fields: { name: 'Domain' } },
    { id: 'A', kind: 'capability', fields: { name: 'Purchase Order' } },
    { id: 'B', kind: 'capability', fields: { name: 'Reservation' } },
    { id: 'BH', kind: 'behavior', fields: { name: 'Partial' } },
  ],
  relations: [
    { id: 'R1', type: 'contains', source_id: 'D', target_id: 'A' },
    { id: 'R2', type: 'contains', source_id: 'A', target_id: 'BH' },
    { id: 'R3', type: 'needs', source_id: 'A', target_id: 'B' },
  ],
  information_catalog: {
    id: 'CAT',
    items: [card('I1', 'A'), card('I2', 'B')],
    links: [
      {
        id: 'L',
        from_ref: 'I1',
        to_ref: 'I2',
        meaning: 'éclaire',
        condition: 'Si requis',
        effect: 'Un besoin protégé',
      },
    ],
  },
});

test('information stays transverse, immutable and confined to the selected publication', () => {
  const raw = fixture(),
    model = adaptPublication(raw);
  assert.equal(model.nodes.length, 4);
  assert.equal(model.information.length, 2);
  assert.equal(model.hasInformationCatalogue, true);
  assert.throws(() => model.information[0].essential_elements.push('mutation'), TypeError);
  const legacy = fixture();
  delete legacy.information_catalog;
  assert.equal(adaptPublication(legacy).hasInformationCatalogue, false);
  assert.deepEqual(adaptPublication(legacy).information, []);
  assert.equal(model.raw.information_catalog.items[0].review.note, 'NOTEINTERNE');
});
test('invalid identities, roles, missing content and orphan links fail explicitly', () => {
  for (const mutate of [
    (x) => x.information_catalog.items.push(structuredClone(x.information_catalog.items[0])),
    (x) => (x.information_catalog.id = 'A'),
    (x) => (x.information_catalog.items[0].id = 'A'),
    (x) => (x.information_catalog.items[0].capability_roles[0].capability_ref = 'BH'),
    (x) => x.information_catalog.items[0].capability_roles.push(x.information_catalog.items[0].capability_roles[0]),
    (x) => delete x.information_catalog.items[0].essential_elements,
    (x) => (x.information_catalog.links[0].to_ref = 'missing'),
    (x) => (x.information_catalog.links[0].to_ref = 'I1'),
  ]) {
    const raw = fixture();
    mutate(raw);
    assert.throws(() => adaptPublication(raw));
  }
});
test('U470 hides information from search while keeping internal data', () => {
  const model = adaptPublication(fixture());
  assert.deepEqual(searchPublication(model, 'attendu métier'), []);
  assert.deepEqual(searchPublication(model, 'chemises'), []);
  assert.equal(model.information.length, 2);
  for (const value of ['NOTEINTERNE', 'SOURCESECRET', 'proposed'])
    assert.deepEqual(searchPublication(model, value), []);
});
