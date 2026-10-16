import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flowExchangeContract, flowMapBoundaryRelations, flowMapDetailBoxes } from './src/flowMapDetail.ts';
import { adaptPublication } from './src/model.ts';

const box = (id, depth, width, height, parentId) => ({
  id,
  depth,
  x: depth * 20,
  y: Number(id.match(/\d+/)?.[0] || 0) * 30,
  width,
  height,
  headerHeight: 60,
  node: { id, kind: 'group', name: id },
  ...(parentId ? { parentId } : {}),
});

test('exchange details preserve meaning, a distinct purpose and the restrictions on recognition', () => {
  const relation = {
    qualification: {
      meaning: 'Transmettre les faits reconnus au destinataire.',
      conditions: ['Une transmission ne vaut pas écriture enregistrée.', 'Les corrections sont conservées.'],
      effects: ['Permettre au destinataire de contrôler les faits.'],
      scope: 'Faits produits par le registre ; interface installée non démontrée.',
    },
    dataExchange: { purpose: 'Alimenter la comptabilité.' },
  };
  const before = structuredClone(relation);
  assert.deepEqual(flowExchangeContract(relation), [
    { label: 'Sens métier', texts: [relation.qualification.meaning] },
    { label: 'Finalité', texts: [relation.dataExchange.purpose] },
    { label: 'Conditions', texts: relation.qualification.conditions },
    { label: 'Effets', texts: relation.qualification.effects },
    { label: 'Périmètre', texts: [relation.qualification.scope] },
  ]);
  assert.deepEqual(relation, before, 'Reading a relation never rewrites its published contract');
});

test('equivalent purpose is not repeated and knowledge flows without a data exchange retain their qualifications', () => {
  assert.deepEqual(
    flowExchangeContract({
      qualification: { meaning: ' Fournir les faits. ', conditions: ['', 'Seulement les faits reconnus.'] },
      dataExchange: { purpose: 'Fournir\n les faits.' },
    }),
    [
      { label: 'Sens métier', texts: ['Fournir les faits.'] },
      { label: 'Conditions', texts: ['Seulement les faits reconnus.'] },
    ],
  );
  assert.deepEqual(
    flowExchangeContract({
      qualification: { meaning: 'Fournir une connaissance.', effects: ['Éclairer la décision.'] },
    }),
    [
      { label: 'Sens métier', texts: ['Fournir une connaissance.'] },
      { label: 'Effets', texts: ['Éclairer la décision.'] },
    ],
  );
});

test('scoped boundary notice counts published incoming and outgoing exchanges at their original endpoints', () => {
  const fixture = adaptPublication({
    space: 'release',
    version: 'boundary',
    glossary: { terms: [{ id: 'TERM', name: 'Information', definition: 'Information échangée.' }] },
    nodes: [
      ['root', 'universe'],
      ['supply', 'domain'],
      ['cap-a', 'capability'],
      ['cap-b', 'capability'],
      ['outside', 'domain'],
    ].map(([id, kind]) => ({ id, kind, fields: { name: id } })),
    relations: [
      ['parent-supply', 'root', 'supply', 'contains'],
      ['parent-outside', 'root', 'outside', 'contains'],
      ['parent-a', 'supply', 'cap-a', 'contains'],
      ['parent-b', 'supply', 'cap-b', 'contains'],
      ['internal', 'cap-a', 'cap-b', 'shares-data'],
      ['outgoing', 'cap-a', 'outside', 'shares-data'],
      ['incoming', 'outside', 'cap-b', 'provides-knowledge'],
      ['dependency', 'cap-a', 'outside', 'relates-to'],
    ].map(([id, source_id, target_id, type]) => ({
      id,
      source_id,
      target_id,
      type,
      ...(type === 'shares-data'
        ? {
            fields: {
              label: id,
              data_exchange: {
                purpose: 'Transmettre les faits.',
                contents: [{ name: 'Business facts', description: 'Faits reconnus.', glossary_refs: ['TERM'] }],
              },
            },
          }
        : {}),
    })),
  });
  assert.deepEqual(
    flowMapBoundaryRelations(fixture, 'supply').map((relation) => relation.id),
    ['outgoing', 'incoming'],
  );
  assert.deepEqual(flowMapBoundaryRelations(fixture, 'root'), []);
  assert.deepEqual(flowMapBoundaryRelations(fixture), []);
});

test('root at eight percent exposes its four systems instead of their nested silhouettes', () => {
  const systems = Array.from({ length: 4 }, (_, index) => box(`system${index}`, 0, 1800, 2000));
  const domains = Array.from({ length: 12 }, (_, index) => box(`domain${index}`, 1, 900, 1000, systems[index % 4].id));
  const input = [...systems, ...domains];
  assert.deepEqual(flowMapDetailBoxes(input, 0.08), systems);
  assert.deepEqual(
    flowMapDetailBoxes(input, 0),
    systems,
    'Root territories remain available even at the smallest scale',
  );
});

test('Business Operations at seventeen percent exposes three domains with no premature subdomain routes', () => {
  const domains = Array.from({ length: 3 }, (_, index) => box(`domain${index}`, 0, 1600, 1800));
  const subdomains = Array.from({ length: 19 }, (_, index) =>
    box(`subdomain${index}`, 1, 288, 400, domains[index % 3].id),
  );
  const input = [...subdomains, ...domains];
  assert.deepEqual(flowMapDetailBoxes(input, 0.17), domains, 'Input ordering does not change the allowed hierarchy');
});

test('Supply at eighty-five percent exposes ten subdomains and twenty-nine readable Business Areas without changing geometry', () => {
  const areas = Array.from({ length: 10 }, (_, index) => box(`area${index}`, 0, 288, 700));
  const businessAreas = Array.from({ length: 29 }, (_, index) => box(`ba${index}`, 1, 260, 130, areas[index % 10].id));
  const leaves = Array.from({ length: 80 }, (_, index) => box(`row${index}`, 2, 232, 28, businessAreas[index % 29].id));
  const input = [...areas, ...businessAreas, ...leaves];
  const before = structuredClone(input);
  const visible = flowMapDetailBoxes(input, 0.85);
  assert.equal(visible.length, 39);
  assert.deepEqual(visible, [...areas, ...businessAreas]);
  assert.ok(
    visible.every((item) => input.includes(item)),
    'Return the original boxes, retaining identity and historical groups',
  );
  flowMapDetailBoxes(input, 3);
  assert.deepEqual(input, before, 'Zoom and detail choices never change world-space geometry');
  const small = box('small', 1, 80, 80, areas[0].id);
  const child = box('child', 2, 232, 80, small.id);
  assert.equal(
    flowMapDetailBoxes([...input, small, child], 0.85).includes(small),
    false,
    'Individual titles must fit as well as the median',
  );
  assert.equal(
    flowMapDetailBoxes([...areas, ...businessAreas, small, child], 0.85).includes(child),
    false,
    'A child cannot bypass its unreadable parent',
  );
});
