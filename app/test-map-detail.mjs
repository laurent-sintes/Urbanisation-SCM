import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectedApplicationMapIds } from './src/applicationCatalog.ts';
import { hotspotRelatedElementIds } from './src/hotspotMap.ts';
import { areaListAtDetail, cardListStatistics } from './src/mapDetail.ts';
import { adaptPublication, visibleAncestorId } from './src/model.ts';

test('Business Area detail does not reveal directly attached capabilities or references', () => {
  const businessArea = { id: 'ba', kind: 'business_area' };
  const capability = { id: 'cap', kind: 'capability' };
  const reference = { id: 'ref', kind: 'reference' };
  const list = {
    kind: 'mixed',
    items: [businessArea, capability, reference],
    businessAreaChildren: { ba: [capability] },
  };
  assert.deepEqual(areaListAtDetail(list, 2).items, [businessArea]);
  assert.deepEqual(areaListAtDetail(list, 2).businessAreaChildren, { ba: [] });
  assert.equal(areaListAtDetail(list, 3), list);
});

test('visible list counters distinguish Business Areas, capabilities, references and displayed behaviors', () => {
  const list = {
    kind: 'mixed',
    items: [
      { id: 'ba-1', kind: 'business_area' },
      { id: 'ba-2', kind: 'business_area' },
    ],
    businessAreaChildren: {
      'ba-1': [
        { id: 'cap-1', kind: 'capability' },
        { id: 'ref', kind: 'reference' },
      ],
      'ba-2': [{ id: 'cap-2', kind: 'capability' }],
    },
  };
  const behaviors = {
    'cap-1': [
      { id: 'bhv-1', kind: 'behavior' },
      { id: 'bhv-2', kind: 'behavior' },
    ],
    'hidden-cap': [{ id: 'hidden-bhv', kind: 'behavior' }],
  };
  assert.deepEqual(cardListStatistics(areaListAtDetail(list, 2), 2), [
    { kind: 'business_area', count: 2, label: 'Business Areas' },
  ]);
  assert.deepEqual(cardListStatistics(list, 3, behaviors), [
    { kind: 'business_area', count: 2, label: 'Business Areas' },
    { kind: 'capability', count: 2, label: 'capacités' },
    { kind: 'reference', count: 1, label: 'référentiel' },
  ]);
  assert.deepEqual(cardListStatistics(list, 4, behaviors).at(-1), {
    kind: 'behavior',
    count: 2,
    label: 'comportements',
  });
});

test('a hidden capability lights its nearest visible Business Area for applications and hotspots', () => {
  const nodes = ['domain', 'area', 'ba', 'cap', 'other-ba'].map((id) => ({
    id,
    kind: id === 'ba' || id === 'other-ba' ? 'business_area' : id === 'cap' ? 'capability' : id,
    fields: { name: id },
  }));
  const model = adaptPublication({
    space: 'release',
    version: 'fixture',
    nodes,
    relations: [
      ['domain', 'area'],
      ['area', 'ba'],
      ['area', 'other-ba'],
      ['ba', 'cap'],
    ].map(([source_id, target_id], index) => ({ id: `r${index}`, type: 'contains', source_id, target_id })),
  });
  const visible = new Set(['domain', 'area', 'ba', 'other-ba']);
  assert.equal(visibleAncestorId(model, 'cap', visible), 'ba');
  assert.deepEqual([...projectedApplicationMapIds(model, [{ node_id: 'cap' }], visible)], ['ba']);
  const hotspot = { location: { node_ids: ['cap'] } };
  assert.deepEqual(hotspotRelatedElementIds(model, [hotspot], ['ba']).sort(), ['ba', 'cap']);
  assert.equal(projectedApplicationMapIds(model, [{ node_id: 'cap' }], visible).has('other-ba'), false);
  assert.equal(visibleAncestorId(model, 'cap', new Set(['domain', 'area'])), 'area');
});
