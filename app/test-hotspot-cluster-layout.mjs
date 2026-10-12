import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hotspotClusterLayout } from './src/hotspotClusterLayout.ts';

test('pastilles stay on a circle, within the viewport and clear of each other at every edge', () => {
  for (const [width, height, top, headingHeight, max] of [
    [1440, 950, 60, 64, 60],
    [900, 900, 60, 64, 60],
    [390, 900, 60, 80, 60],
    [844, 390, 8, 44, 60],
    [667, 320, 8, 44, 60],
    [320, 480, 60, 100, 60],
  ]) {
    for (let count = 2; count <= max; count++) {
      for (const anchor of [
        { x: 0, y: 0 },
        { x: width, y: height },
        { x: width / 2, y: height / 2 },
      ]) {
        const layout = hotspotClusterLayout(count, anchor, width, height, top, headingHeight);
        assert.equal(layout.points.length, Math.min(count, layout.capacity));
        const radius = Math.hypot(layout.points[0].x - layout.center.x, layout.points[0].y - layout.center.y);
        for (const [index, point] of layout.points.entries()) {
          assert.ok(point.x - layout.itemSize / 2 >= 12 - 0.001);
          assert.ok(point.x + layout.itemSize / 2 <= width - 12 + 0.001);
          assert.ok(point.y - layout.itemSize / 2 >= top + headingHeight + 12 - 0.001);
          assert.ok(point.y + layout.itemSize / 2 <= height - layout.footerReserve + 0.001);
          assert.ok(radius >= (layout.itemSize + layout.centerSize) / 2 + 4 - 0.001, 'center stays clear');
          assert.ok(Math.abs(Math.hypot(point.x - layout.center.x, point.y - layout.center.y) - radius) < 0.001);
          for (const other of layout.points.slice(index + 1)) {
            assert.ok(Math.hypot(point.x - other.x, point.y - other.y) >= 64 - 0.001);
          }
        }
      }
    }
  }
});

test('a central anchor stays fixed when the circle fits around it', () => {
  const anchor = { x: 720, y: 475 };
  assert.deepEqual(hotspotClusterLayout(8, anchor, 1440, 950, 60).center, anchor);
});

test('large groups keep their pastilles and paginate only when the circle cannot fit everyone', () => {
  assert.equal(hotspotClusterLayout(27, { x: 720, y: 475 }, 1440, 950, 60).points.length, 27);
  for (const [count, width, height] of [
    [40, 390, 900],
    [27, 900, 480],
    [12, 240, 700],
  ]) {
    const layout = hotspotClusterLayout(count, { x: 20, y: 20 }, width, height, 60);
    assert.ok(layout.capacity < count);
    assert.ok(layout.capacity > 1);
    for (let remaining = 1; remaining <= layout.capacity; remaining++) {
      const lastPage = hotspotClusterLayout(remaining, layout.center, width, height, 60, 64, layout.footerReserve);
      assert.deepEqual(lastPage.center, layout.center, 'the last page retains the origin of the first circle');
      assert.equal(lastPage.points.length, remaining);
    }
  }
});
