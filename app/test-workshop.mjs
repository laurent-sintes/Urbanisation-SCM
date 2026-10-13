import assert from 'node:assert/strict';
import test from 'node:test';
import { overlayWorkshop, readWorkshopStage } from './src/workshop.ts';

const activeStage = {
  active: true,
  schema_version: 1,
  session_id: 'atelier-test',
  base_version: '2026-10-10.1',
  base_model_sha256: 'base',
  revision: 1,
  operations: [],
};

test('workshop polling times out stalled headers or JSON and can load again', async () => {
  for (const stalledBody of [false, true]) {
    let signal;
    const stalled = (_url, init) => {
      signal = init.signal;
      assert.equal(init.cache, 'no-store');
      return stalledBody
        ? Promise.resolve({ ok: true, status: 200, json: () => new Promise(() => {}) })
        : new Promise(() => {});
    };
    await assert.rejects(readWorkshopStage(undefined, stalled, 20), /trop de temps/);
    assert.equal(signal.aborted, true);
    assert.deepEqual(await readWorkshopStage(undefined, async () => Response.json(activeStage)), activeStage);
  }
});

test('workshop polling aborts the in-flight request on disposal', async () => {
  const controller = new AbortController();
  let requestSignal;
  const pending = readWorkshopStage(controller.signal, (_url, init) => {
    requestSignal = init.signal;
    return new Promise(() => {});
  });
  const rejected = assert.rejects(pending, { name: 'AbortError' });
  controller.abort();
  await rejected;
  assert.equal(requestSignal.aborted, true);
});

test('missing or inactive workshop is quiet, while errors and malformed staging are rejected', async () => {
  assert.equal(await readWorkshopStage(undefined, async () => new Response('', { status: 404 })), null);
  assert.equal(await readWorkshopStage(undefined, async () => Response.json({ active: false })), null);
  await assert.rejects(
    readWorkshopStage(undefined, async () => Response.json({ error: 'Lecture impossible' }, { status: 500 })),
    /Lecture impossible/,
  );
  for (const value of [null, { active: true }, { ...activeStage, operations: null }]) {
    await assert.rejects(
      readWorkshopStage(undefined, async () => Response.json(value)),
      /invalide/,
    );
  }
});

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
