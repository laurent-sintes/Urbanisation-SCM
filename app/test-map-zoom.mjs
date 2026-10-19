import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveMapZoom, stablePageFitZoom, widthFit } from './src/mapZoom.ts';

test('automatic framing preserves readable text while manual choices stay fixed', () => {
  assert.equal(resolveMapZoom('auto', 1), 'page');
  assert.equal(resolveMapZoom('auto', 2, 0.42), 'width');
  assert.equal(resolveMapZoom('auto', 2, 0.9), 'page');
  assert.equal(resolveMapZoom('auto', 3), 'width');
  assert.equal(resolveMapZoom('auto', 4), 'width');
  assert.equal(resolveMapZoom('page', 4), 'page');
  assert.equal(resolveMapZoom('page', 2, 0.84), 'page');
  assert.equal(resolveMapZoom('page', 4, 0.001), 'page');
  assert.equal(resolveMapZoom('page', 2, 0.85), 'page');
  assert.equal(resolveMapZoom('width', 0), 'width');
});

test('width framing gives tall maps scrollable height without enlarging the grid', () => {
  const tall = widthFit(1000, 2400, 1200, 600);
  assert.equal(tall.zoom, 1);
  assert.ok(tall.height > 2400);
  assert.equal(tall.y, 16);
  const sparse = widthFit(300, 220, 1920, 600);
  assert.equal(sparse.zoom, 1);
  assert.ok(sparse.x > 16);
  assert.equal(sparse.height, 600);
});

test('page fit settles subpixel oscillation without enlarging or limiting a tiny zoom', () => {
  assert.equal(stablePageFitZoom(0.112418), stablePageFitZoom(0.112736));
  for (const fitted of [1, 0.85, 0.112736, 0.000112736]) {
    const zoom = stablePageFitZoom(fitted);
    assert.ok(zoom > 0 && zoom <= fitted);
    assert.ok(zoom / fitted > 0.99);
  }
});

test('width framing fits minimum-width maps without horizontal overflow at every viewport size', () => {
  for (const viewport of [180, 288, 341, 600, 900, 1440]) {
    for (const width of [332, 660, 812, 1232]) {
      const frame = widthFit(width, 4800, viewport, 400);
      assert.ok(frame.zoom > 0 && frame.zoom <= 1);
      assert.ok(frame.x >= 16);
      assert.ok(frame.x + width * frame.zoom <= viewport - 16 + 1e-6);
      assert.ok(frame.height >= 4800 * frame.zoom + 32);
      assert.equal(frame.zoom === 1, width <= viewport - 32);
    }
  }
});
