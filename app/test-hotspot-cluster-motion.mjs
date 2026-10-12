import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hotspotClusterMotion } from './src/hotspotClusterMotion.ts';

function position(frame, target) {
  const [x, y] = frame.transform
    .match(/translate\(([-\d.e]+)px, ([-\d.e]+)px\)/)
    .slice(1)
    .map(Number);
  return { x: target.x + x, y: target.y + y };
}

test('pastilles wind clockwise through three quarters of a turn with steadily growing radius', () => {
  const center = { x: 400, y: 300 };
  const target = { x: 400, y: 180 };
  const frames = hotspotClusterMotion(center, center, target);
  assert.deepEqual(position(frames[0], target), center);
  assert.deepEqual(position(frames.at(-1), target), target);
  let radius = 0;
  let angle;
  let turn = 0;
  for (const frame of frames.slice(1)) {
    const point = position(frame, target);
    const nextRadius = Math.hypot(point.x - center.x, point.y - center.y);
    assert.ok(nextRadius > radius);
    radius = nextRadius;
    const nextAngle = Math.atan2(point.y - center.y, point.x - center.x);
    if (angle !== undefined) {
      const delta = Math.atan2(Math.sin(nextAngle - angle), Math.cos(nextAngle - angle));
      assert.ok(delta > 0, 'the orbit keeps turning in the same direction');
      turn += delta;
    }
    angle = nextAngle;
  }
  assert.ok(turn > Math.PI * 1.4 && turn < Math.PI * 1.5);
  assert.ok(Math.abs(position(frames[18], target).x - center.x) > 40, 'the trajectory visibly leaves the direct line');
});

test('clamped circles still deploy from the clicked marker and collapse to that exact marker', () => {
  const anchor = { x: 12, y: 40 };
  const center = { x: 140, y: 240 };
  const target = { x: 240, y: 240 };
  const frames = hotspotClusterMotion(anchor, center, target);
  assert.deepEqual(position(frames[0], target), anchor);
  assert.deepEqual(position(frames.at(-1), target), target);
  const reverse = [...frames].reverse();
  assert.deepEqual(position(reverse[0], target), target);
  assert.deepEqual(position(reverse.at(-1), target), anchor);
  for (const frame of frames) assert.ok(!/NaN|Infinity/.test(frame.transform));
});
