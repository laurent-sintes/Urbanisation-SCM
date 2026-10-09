import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptPublication, childrenOf } from './src/model.ts';
import { behaviorAspect, behaviorReadingGroups, requestOrigins } from './src/requestMetadata.ts';
import { searchPublication } from './src/search.ts';

const node = (id, kind, fields = {}) => ({ id, name: id, kind, fields });

test('request origins are explicit, non-exclusive and restricted to capabilities', () => {
  const values = Object.freeze(['backoffice', 'frontoffice', 'backoffice', 'unknown']);
  assert.deepEqual(requestOrigins(node('Transfer Order', 'capability', { request_origins: values })), [
    'frontoffice',
    'backoffice',
  ]);
  assert.deepEqual(requestOrigins(node('Backoffice Request', 'capability')), []);
  assert.deepEqual(requestOrigins(node('Service Requests', 'area', { request_origins: values })), []);
  assert.deepEqual(requestOrigins(node('B', 'behavior', { request_origins: values })), []);
  for (const value of ['frontoffice', null, {}, [null, 'external', 'toString']]) {
    assert.deepEqual(requestOrigins(node('C', 'capability', { request_origins: value })), []);
  }
  assert.deepEqual(values, ['backoffice', 'frontoffice', 'backoffice', 'unknown']);
});

test('reading angles never derive from nature, name, or unsupported metadata', () => {
  assert.equal(behaviorAspect(node('Reactive Review', 'behavior', { nature: 'intervention_mechanism' })), undefined);
  assert.equal(behaviorAspect(node('B', 'behavior', { behavior_aspect: 'trigger' })), 'trigger');
  assert.equal(behaviorAspect(node('B', 'behavior', { behavior_aspect: 'activity' })), 'activity');
  for (const value of ['toString', 'Trigger', ['activity'], null]) {
    assert.equal(behaviorAspect(node('B', 'behavior', { behavior_aspect: value })), undefined);
  }
  assert.equal(behaviorAspect(node('C', 'capability', { behavior_aspect: 'trigger' })), undefined);
});

test('reading groups retain unclassified behaviors and preserve published structure and order', () => {
  const raw = {
    space: 'release',
    version: 'request-fixture',
    nodes: [
      node('REQUEST', 'capability', { request_origins: ['backoffice'] }),
      node('ACT1', 'behavior', { behavior_aspect: 'activity' }),
      node('LEGACY', 'behavior'),
      node('TRIGGER', 'behavior', { behavior_aspect: 'trigger' }),
      node('ACT2', 'behavior', { behavior_aspect: 'activity' }),
      node('UNKNOWN', 'behavior', { behavior_aspect: 'unsupported' }),
    ],
    relations: ['ACT1', 'LEGACY', 'TRIGGER', 'ACT2', 'UNKNOWN'].map((id) => ({
      id: `R-${id}`,
      type: 'contains',
      source_id: 'REQUEST',
      target_id: id,
    })),
  };
  const model = adaptPublication(raw);
  const children = childrenOf(model, 'REQUEST');
  const groups = behaviorReadingGroups(children);
  assert.deepEqual(
    groups.map((group) => [group.label, group.behaviors.map((item) => item.id)]),
    [
      ['Déclenchement', ['TRIGGER']],
      ['Activité', ['ACT1', 'ACT2']],
      ['Autres comportements', ['LEGACY', 'UNKNOWN']],
    ],
  );
  assert.deepEqual(
    children.map((item) => item.id),
    ['ACT1', 'LEGACY', 'TRIGGER', 'ACT2', 'UNKNOWN'],
  );
  assert.deepEqual(model.raw, raw);
  assert.equal(new Set(groups.flatMap((group) => group.behaviors)).size, children.length);
  assert.ok(groups.flatMap((group) => group.behaviors).every((item) => model.nodeById.get(item.id) === item));
  assert.deepEqual(behaviorReadingGroups([]), []);
  const legacy = [model.nodeById.get('LEGACY'), model.nodeById.get('UNKNOWN')];
  assert.deepEqual(behaviorReadingGroups(legacy), [{ key: 'other', behaviors: legacy }]);
});

test('origins and reading angles are searchable only when present in the selected published snapshot', () => {
  const raw = {
    space: 'release',
    version: 'request-fixture',
    nodes: [node('TRANSFER', 'capability'), node('AREA', 'area'), node('B', 'behavior')],
    relations: [{ id: 'R', type: 'contains', source_id: 'TRANSFER', target_id: 'B' }],
  };
  const historical = adaptPublication(raw);
  raw.nodes[0].fields.request_origins = ['frontoffice', 'backoffice', 'privatevalue'];
  raw.nodes[1].fields.request_origins = ['backoffice'];
  raw.nodes[2].fields.behavior_aspect = 'trigger';
  const current = adaptPublication(raw);
  for (const query of ['Frontoffice', 'Backoffice', 'Sollicitation initiée']) {
    assert.deepEqual(
      searchPublication(current, query).map((item) => item.id),
      ['TRANSFER'],
    );
    assert.deepEqual(searchPublication(historical, query), []);
  }
  assert.deepEqual(
    searchPublication(current, 'Déclenchement').map((item) => item.id),
    ['B'],
  );
  assert.deepEqual(searchPublication(current, 'privatevalue'), []);
  assert.deepEqual(searchPublication(historical, 'Déclenchement'), []);
});
