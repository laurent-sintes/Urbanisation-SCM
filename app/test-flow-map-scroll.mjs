import assert from 'node:assert/strict';
import { test } from 'node:test';
import { flowScrollContent, flowScrollGeometry, scrollFlowCamera } from './src/flowMapScroll.ts';
import { fitFlowCamera } from './src/flowMapViewport.ts';

const world = {
  width: 3200,
  height: 2400,
  boxes: [{ id: 'territory', x: 32, y: 32, width: 3136, height: 2336 }],
  exchanges: [],
};
const content = flowScrollContent(world);

test('whole-page framing needs no scrollbars on desktop, short screens or mobile', () => {
  for (const size of [
    { width: 1050, height: 700 },
    { width: 341, height: 333 },
    { width: 796, height: 180 },
  ]) {
    const geometry = flowScrollGeometry(content, fitFlowCamera(world, size, 'all'), size);
    assert.equal(geometry.horizontal.visible, false);
    assert.equal(geometry.vertical.visible, false);
  }
});

test('width framing scrolls vertically without changing zoom or horizontal alignment', () => {
  const size = { width: 1050, height: 350 };
  const camera = fitFlowCamera(world, size, 'width');
  const geometry = flowScrollGeometry(content, camera, size);
  assert.equal(geometry.horizontal.visible, false);
  assert.equal(geometry.vertical.visible, true);
  const next = scrollFlowCamera(camera, geometry, 400, 200);
  assert.equal(next.zoom, camera.zoom);
  assert.equal(next.x, camera.x);
  assert.equal(next.y, camera.y - 200);
  assert.deepEqual(scrollFlowCamera(camera, geometry, Infinity, Infinity), {
    ...camera,
    y: geometry.vertical.origin - geometry.vertical.range,
  });
});

test('camera scroll envelope allows returning after dragging beyond the map', () => {
  const size = { width: 900, height: 600 };
  const camera = { x: -5000, y: 1800, zoom: 1 };
  const geometry = flowScrollGeometry(content, camera, size);
  assert.ok(geometry.horizontal.visible && geometry.vertical.visible);
  const next = scrollFlowCamera(camera, geometry, -Infinity, Infinity);
  const after = flowScrollGeometry(content, next, size, geometry.extent);
  assert.equal(after.horizontal.value, 0);
  assert.equal(after.vertical.value, after.vertical.range);
  assert.deepEqual(after.extent, geometry.extent);
  assert.equal(next.zoom, camera.zoom);
});

test('scroll content includes every route and its caption, independently of display filters', () => {
  assert.deepEqual(
    flowScrollContent({
      boxes: [],
      exchanges: [],
      routes: [
        {
          points: [
            { x: -30, y: 10 },
            { x: 100, y: 10 },
          ],
          label: { x: 150, y: 20, width: 360, height: 104 },
        },
      ],
    }),
    { left: -30, top: 10, right: 510, bottom: 124 },
  );
});
