import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HOTSPOT_DIAMETERS, layoutHotspots, placeHotspots } from './src/hotspotPlacement.ts';

test('seeded mixed-size layouts preserve identities, clearance, bounds and inputs', () => {
  let seed = 915;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let run = 0; run < 80; run++) {
    const bounds = { width: 280 + random() * 240, height: 180 + random() * 240 };
    const items = Array.from({ length: 2 + Math.floor(random() * 7) }, (_, index) => ({
      id: String(index),
      x: random() * bounds.width,
      y: random() * bounds.height,
      diameter: [36, 40, 44, 48][Math.floor(random() * 4)],
    }));
    const original = structuredClone(items);
    const groups = layoutHotspots(items, bounds);
    assert.deepEqual(items, original, 'placement does not mutate anchors');
    assert.deepEqual(groups.flatMap((group) => group.ids).sort(), items.map((item) => item.id).sort());
    for (const [index, group] of groups.entries()) {
      assert.ok(group.x >= group.diameter / 2 + 2 && group.x <= bounds.width - group.diameter / 2 - 2);
      assert.ok(group.y >= group.diameter / 2 + 2 && group.y <= bounds.height - group.diameter / 2 - 2);
      assert.ok(Math.hypot(group.x - group.anchor.x, group.y - group.anchor.y) <= 192);
      for (const other of groups.slice(index + 1))
        assert.ok(Math.hypot(group.x - other.x, group.y - other.y) >= (group.diameter + other.diameter) / 2 + 6);
    }
  }
});

test('extreme density uses groups while retaining every source hotspot', () => {
  const items = Array.from({ length: 40 }, (_, index) => ({ id: String(index), x: 80, y: 80, diameter: 48 }));
  const groups = layoutHotspots(items, { width: 160, height: 160 });
  assert.ok(groups.length < items.length);
  assert.equal(new Set(groups.flatMap((group) => group.ids)).size, items.length);
  for (const [index, group] of groups.entries())
    for (const other of groups.slice(index + 1)) assert.ok(Math.hypot(group.x - other.x, group.y - other.y) >= 54);
});

test('same and nearby hotspot anchors remain individually visible when there is space', () => {
  const items = [
    { id: 'a', x: 150, y: 150, diameter: HOTSPOT_DIAMETERS.S },
    { id: 'b', x: 150, y: 150, diameter: HOTSPOT_DIAMETERS.XL },
    { id: 'c', x: 170, y: 160, diameter: HOTSPOT_DIAMETERS.M },
    { id: 'd', x: 175, y: 160, diameter: HOTSPOT_DIAMETERS.L },
  ];
  const positions = placeHotspots(items, { width: 320, height: 320 });
  assert.ok(positions);
  assert.deepEqual(
    Object.keys(positions).sort(),
    items.map((item) => item.id),
  );
  for (const item of items) {
    const point = positions[item.id];
    assert.ok(point.x >= item.diameter / 2 && point.x <= 320 - item.diameter / 2);
    assert.ok(point.y >= item.diameter / 2 && point.y <= 320 - item.diameter / 2);
    for (const other of items.filter((candidate) => candidate.id > item.id)) {
      const distance = Math.hypot(point.x - positions[other.id].x, point.y - positions[other.id].y);
      assert.ok(distance >= (item.diameter + other.diameter) / 2 + 6);
    }
  }
  assert.deepEqual(placeHotspots(items, { width: 320, height: 320 }), positions);
});

test('the placement reports insufficient space for a fallback cluster', () => {
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: String(index),
    x: 40,
    y: 40,
    diameter: HOTSPOT_DIAMETERS.XL,
  }));
  assert.equal(placeHotspots(items, { width: 80, height: 80 }), null);
});

test('overview markers keep clear of text', () => {
  const obstacles = [{ x: 70, y: 70, width: 120, height: 30 }];
  const positions = placeHotspots([{ id: 'a', x: 130, y: 80, diameter: HOTSPOT_DIAMETERS.XL }], {
    width: 260,
    height: 180,
    obstacles,
  });
  assert.ok(positions);
  const point = positions.a;
  const nearX = Math.max(70, Math.min(point.x, 190));
  const nearY = Math.max(70, Math.min(point.y, 100));
  assert.ok(Math.hypot(point.x - nearX, point.y - nearY) >= 26);
});

test('a narrow free lane is found by the finer pass without crossing text', () => {
  const obstacles = [
    { x: 0, y: 0, width: 280, height: 75 },
    { x: 0, y: 135, width: 280, height: 100 },
  ];
  const items = Array.from({ length: 4 }, (_, index) => ({ id: String(index), x: 140, y: 105, diameter: 40 }));
  const positions = placeHotspots(items, { width: 280, height: 235, obstacles });
  assert.ok(positions);
  for (const point of Object.values(positions)) assert.ok(point.y >= 97 && point.y <= 113);
});

test('regrouping preserves unrelated individuals and all source identities', () => {
  const items = [
    ...Array.from({ length: 6 }, (_, index) => ({ id: String(index), x: 40, y: 40, diameter: 48 })),
    { id: 'far', x: 400, y: 40, diameter: 36 },
  ];
  const groups = layoutHotspots(items, { width: 450, height: 80, maxDisplacement: 65 });
  assert.deepEqual(groups.find((group) => group.ids.includes('far')).ids, ['far']);
  assert.deepEqual(groups.flatMap((group) => group.ids).sort(), items.map((item) => item.id).sort());
  assert.ok(groups.length > 1 && groups.length < items.length);
  for (const group of groups) assert.ok(Math.hypot(group.x - group.anchor.x, group.y - group.anchor.y) <= 65);
});

test('placement respects a maximum distance from each anchor', () => {
  assert.equal(
    placeHotspots([{ id: 'a', x: 10, y: 10, diameter: 48 }], {
      width: 300,
      height: 300,
      maxDisplacement: 30,
      obstacles: [{ x: 0, y: 0, width: 90, height: 90 }],
    }),
    null,
  );
});
