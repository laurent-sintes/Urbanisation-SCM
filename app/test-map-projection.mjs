import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adaptPublication } from './src/model.ts';
import { defaultMapDepth, mapDepthLimit, structuralMap } from './src/mapProjection.ts';

const node = (id, kind) => ({ id, kind, fields: { name: id } });
const edge = (id, source_id, target_id) => ({ id, type: source_id === 'system' || source_id === 'domain' ? 'presents' : 'contains', source_id, target_id });

test('each map scope opens at its own default detail', () => {
  assert.equal(defaultMapDepth('universe'), 1, 'Universe opens with domains visible');
  assert.equal(defaultMapDepth('business_system'), 0, 'System opens at Domain level');
  assert.equal(defaultMapDepth('domain'), 1, 'Domain opens with subdomains visible');
});

test('domain map progressively reveals the published hierarchy and keeps sparse domains readable', () => {
  const model = adaptPublication({ space: 'release', version: 'fixture',
    nodes: [node('system','business_system'), node('domain','domain'), node('empty','domain'), node('area','area'), node('ba','business_area'), node('cap','capability'), node('behavior','behavior')],
    relations: [edge('r1','system','domain'), edge('r2','system','empty'), edge('r3','domain','area'), edge('r4','area','ba'), edge('r5','ba','cap'), edge('r6','cap','behavior')],
  });
  assert.equal(mapDepthLimit(model,'domain'),4);
  assert.equal(mapDepthLimit(model,'empty'),0);
  assert.deepEqual(structuralMap(model,'empty',0).nodes.map(n => n.id),['empty']);
  for (const detail of [1, 2, 3, 4]) {
    assert.deepEqual(structuralMap(model,'domain',detail).nodes.map(n => n.id),['domain','area']);
    assert.equal(structuralMap(model,'domain',detail).group.id,'domain');
  }
  assert.equal(mapDepthLimit(model,'system'),4);
  assert.deepEqual(structuralMap(model,'system',0).nodes.map(n => n.id),['system','domain','empty']);
  assert.deepEqual(structuralMap(model,'system',1).nodes.map(n => n.id),['system','domain','area','empty']);
  assert.deepEqual(structuralMap(model,'system',3).nodes.map(n => n.id),['system','domain','area','ba','cap','empty']);
});

test('historical direct domain children keep their original card projection', () => {
  const model = adaptPublication({ space: 'release', version: 'historic',
    nodes: [node('domain','domain'), node('cap','capability')],
    relations: [edge('r1','domain','cap')],
  });
  assert.equal(mapDepthLimit(model,'domain'),0);
  assert.equal(structuralMap(model,'domain',0),undefined);
});
