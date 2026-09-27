import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchModelingGuide, lessonForPublication } from './src/modelingGuide.ts';

const response = data => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
test('guide presentation follows the displayed hierarchy without rewriting historical lessons', () => {
  const lesson = {
    id: 'meaningful-links', rule: 'Domain → Purpose → Capability → Behavior',
    scene: { items: [{ label: 'Commerce', text: 'Domain · Purpose · Capacité · Comportement · Relation' }] },
    contributor: { boundary: 'Historical boundary' },
  };
  const before = structuredClone(lesson);
  assert.equal(lessonForPublication(lesson, { nodes: [] }), lesson);
  const current = lessonForPublication(lesson, { nodes: [{ kind: 'business_system' }] });
  assert.equal(current.rule, 'Business System → Domain → Subdomain → Capability → Behavior');
  assert.equal(current.scene.items[0].label, 'Sales / Sourcing and Procurement');
  assert.match(current.scene.items[0].text, /Sous-domaine/);
  assert.match(current.contributor.boundary, /publication affichée/);
  assert.deepEqual(lesson, before);
});
test('guide selection is pinned to the displayed publication and carries cancellation', async () => {
  const controller = new AbortController();
  const expected = { schema_version: '1.0.0', publication_version: '2026-09-16.2', status: 'unavailable', message: 'Pas de guide associé.' };
  let calls = 0;
  const guide = await fetchModelingGuide(expected.publication_version, controller.signal, async (url, init) => {
    calls++;
    assert.equal(url, './data/2026-09-16.2/guide.json');
    assert.ok(init.signal instanceof AbortSignal);
    assert.equal(init.signal.aborted, false);
    assert.equal(init.cache, 'no-store');
    return response(expected);
  });
  assert.deepEqual(guide, expected);
  assert.equal(calls, 1, 'An unavailable guide must not trigger any fallback');
});
test('a guide for another publication or an incomplete response is rejected', async () => {
  for (const data of [
    { schema_version: '1.0.0', publication_version: 'other', status: 'unavailable', message: '' },
    { schema_version: '1.0.0', publication_version: 'current', status: 'available', message: '', guide: { version: '1', lessons: [], sources: [] } },
    { schema_version: '2.0.0', publication_version: 'current', status: 'unavailable', message: '' },
  ]) await assert.rejects(fetchModelingGuide('current', undefined, async () => response(data)), /ne correspond pas/);
});
test('an error is surfaced without retrying another guide version', async () => {
  let calls = 0;
  await assert.rejects(fetchModelingGuide('fixed', undefined, async () => {
    calls++;
    return new Response(JSON.stringify({ error: 'Empreinte du guide invalide.' }), { status: 422 });
  }), /Empreinte/);
  assert.equal(calls, 1);
});

test('guide request cancellation aborts the transport even when it never settles', async () => {
  const controller = new AbortController();
  let transport;
  const pending = fetchModelingGuide('2026-09-16.2', controller.signal, async (_, init) => {
    transport = init.signal;
    return new Promise(() => {});
  });
  controller.abort(new Error('selection changed'));
  await assert.rejects(pending, /selection changed/);
  assert.equal(transport.aborted, true);
});
