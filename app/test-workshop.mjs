import assert from 'node:assert/strict';
import test from 'node:test';
import { overlayWorkshop } from './src/workshop.ts';

test('workshop operations overlay hotspots without changing the published snapshot', () => {
  const published = {
    space: 'release',
    version: '2026-10-10.1',
    nodes: [],
    relations: [],
    hotspot_catalog: { schema_version: 1, source_refs: [], hotspots: [{ id: 'HS-002', title: 'C-LOG' }] },
  };
  const draft = { id: 'AT-HS-001', title: 'Nouvelle interface', workshop: { session_id: 'atelier-test', revision: 1 } };
  const stage = {
    active: true,
    schema_version: 1,
    session_id: 'atelier-test',
    base_version: published.version,
    base_model_sha256: 'base',
    revision: 2,
    operations: [
      { sequence: 1, entity: 'hotspot', action: 'add', id: draft.id, value: draft },
      { sequence: 2, entity: 'hotspot', action: 'remove', id: 'HS-002' },
    ],
  };
  const working = overlayWorkshop(published, stage);
  assert.deepEqual(
    working.hotspot_catalog.hotspots.map((item) => item.id),
    ['AT-HS-001'],
  );
  assert.equal(working.workshop.revision, 2);
  assert.deepEqual(
    published.hotspot_catalog.hotspots.map((item) => item.id),
    ['HS-002'],
  );
  assert.equal(overlayWorkshop({ ...published, version: '2026-10-11.1' }, stage).workshop, undefined);
});
