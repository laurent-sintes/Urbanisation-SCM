import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMapZoom, widthFit } from './src/mapZoom.ts';

test('automatic framing preserves readable text while manual choices stay fixed', () => {
  assert.equal(resolveMapZoom('auto', 1), 'page');
  assert.equal(resolveMapZoom('auto', 2, 0.42), 'width');
  assert.equal(resolveMapZoom('auto', 2, 0.9), 'page');
  assert.equal(resolveMapZoom('auto', 3), 'width');
  assert.equal(resolveMapZoom('auto', 4), 'width');
  assert.equal(resolveMapZoom('page', 4), 'page');
  assert.equal(resolveMapZoom('width', 0), 'width');
});

test('width framing gives tall maps scrollable height and caps sparse-map enlargement', () => {
  const tall = widthFit(1000, 2400, 1200, 600);
  assert.ok(tall.zoom > 1);
  assert.ok(tall.height > 2400);
  assert.equal(tall.y, 16);
  const sparse = widthFit(300, 220, 1920, 600);
  assert.equal(sparse.zoom, 2);
  assert.ok(sparse.x > 16);
  assert.equal(sparse.height, 600);
});
