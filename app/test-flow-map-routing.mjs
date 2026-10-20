import assert from 'node:assert/strict';
import { test } from 'node:test';
import ELK from 'elkjs/lib/elk.bundled.js';
import { layoutElkFlowMap } from './src/flowMapElk.ts';
import { buildFlowMap } from './src/flowMapLayout.ts';

import { flowRibbonPath, roundedFlowPath, routeFlowExchanges } from './src/flowMapRouting.ts';
import { FLOW_STUB, FLOW_TRACK, flowFacingSides, spaceFlowMap } from './src/flowMapSpacing.ts';
import { adaptPublication } from './src/model.ts';

const box = (id, x, y, width = 100, height = 100) => ({ id, x, y, width, height });

const denseBoxes = [
  [0, 0],
  [428, 0],
  [856, 220],
  [856, 0],
  [428, 220],
  [856, 440],
  [1284, 0],
  [1284, 220],
  [0, 220],
].map(([x, y], index) => ({ ...box(`territory-${index}`, x, y, 288, 80), node: { kind: 'area' } }));
const denseEdges = [
  [7, 3],
  [5, 4],
  [5, 3],
  [4, 5],
  [3, 4],
  [1, 5],
  [1, 4],
  [7, 4],
  [7, 5],
  [7, 8, 'knowledge'],
  [8, 7, 'knowledge'],
  [8, 3, 'knowledge'],
  [3, 7, 'knowledge'],
  [5, 7, 'knowledge'],
  [2, 4],
  [4, 3],
  [3, 2],
  [4, 2],
  [7, 2],
  [7, 6],
  [3, 6],
  [7, 8],
  [8, 7],
  [8, 6],
  [4, 6],
  [2, 6],
].map(([source, target, type = 'data'], index) => ({
  id: `edge-${index}`,
  sourceId: `territory-${source}`,
  targetId: `territory-${target}`,
  type,
}));

test('dense flow spacing preserves row and column ordering and counts projected pairs rather than raw relations', () => {
  const spaced = spaceFlowMap(denseBoxes, denseEdges);
  for (const a of denseBoxes)
    for (const b of denseBoxes)
      for (const axis of ['x', 'y'])
        assert.equal(
          Math.sign(spaced.find((box) => box.id === a.id)[axis] - spaced.find((box) => box.id === b.id)[axis]),
          Math.sign(a[axis] - b[axis]),
        );
  assert.deepEqual(
    spaceFlowMap(denseBoxes, [...denseEdges, { ...denseEdges[0], id: 'another-original-relation' }]),
    spaced,
  );
  const plan = spaced.find((box) => box.id === 'territory-4');
  assert.ok(plan.height >= 5 * FLOW_TRACK, 'Busy faces reserve room for distinct ports');
  assert.ok(plan.x - spaced[0].x - spaced[0].width > 200, 'Flow traffic expands the corridor');
});

test('joint routing gives every dense exchange distinct ports, endpoint clearance and an unambiguous text bay', () => {
  // A fully occupied synthetic corridor exercises the largest adaptive spacing pass.
  const boxes = spaceFlowMap(denseBoxes, denseEdges, 1.5);
  const byId = new Map(boxes.map((box) => [box.id, box]));
  const inputs = denseEdges.map((edge) => ({
    id: edge.id,
    source: byId.get(edge.sourceId),
    target: byId.get(edge.targetId),
  }));
  const routes = routeFlowExchanges(inputs, boxes);
  const endpointKeys = new Set();
  for (const [index, route] of routes.entries()) {
    verify(route, inputs[index].source, inputs[index].target, boxes);
    assert.ok(route.label, `${route.id} keeps its caption at the natural scale`);
    for (const [end, point, next] of [
      [inputs[index].source.id, route.points[0], route.points[1]],
      [inputs[index].target.id, route.points.at(-1), route.points.at(-2)],
    ]) {
      const key = `${end}/${point.x}/${point.y}`;
      assert.ok(!endpointKeys.has(key), 'Incoming and outgoing exchanges never share an attachment');
      endpointKeys.add(key);
      assert.ok(
        Math.hypot(point.x - next.x, point.y - next.y) >= FLOW_STUB,
        'A clear straight lead identifies each endpoint',
      );
    }
    const anchor = route.labelPoint;
    assert.ok(
      route.points.slice(1).some((b, i) => {
        const a = route.points[i];
        return (
          (a.x === b.x && anchor.x === a.x && anchor.y >= Math.min(a.y, b.y) && anchor.y <= Math.max(a.y, b.y)) ||
          (a.y === b.y && anchor.y === a.y && anchor.x >= Math.min(a.x, b.x) && anchor.x <= Math.max(a.x, b.x))
        );
      }),
      'The caption belongs to an actual segment, with no detached leader',
    );
    for (const other of routes)
      if (other.id !== route.id)
        for (let i = 1; i < other.points.length; i++)
          assert.equal(
            crossesInterior(other.points[i - 1], other.points[i], route.label),
            false,
            `${other.id} avoids ${route.id}'s caption`,
          );
  }
  const stable = (items) => items.toSorted((a, b) => a.id.localeCompare(b.id));
  assert.deepEqual(
    stable(routeFlowExchanges([...inputs].reverse(), boxes)),
    stable(routes),
    'Input iteration order cannot change the negotiated routes',
  );
});
const onBoundary = (point, rectangle) =>
  point.x >= rectangle.x &&
  point.x <= rectangle.x + rectangle.width &&
  point.y >= rectangle.y &&
  point.y <= rectangle.y + rectangle.height &&
  (point.x === rectangle.x ||
    point.x === rectangle.x + rectangle.width ||
    point.y === rectangle.y ||
    point.y === rectangle.y + rectangle.height);
const crossesInterior = (a, b, rectangle) =>
  a.y === b.y
    ? a.y > rectangle.y &&
      a.y < rectangle.y + rectangle.height &&
      Math.max(Math.min(a.x, b.x), rectangle.x) < Math.min(Math.max(a.x, b.x), rectangle.x + rectangle.width)
    : a.x > rectangle.x &&
      a.x < rectangle.x + rectangle.width &&
      Math.max(Math.min(a.y, b.y), rectangle.y) < Math.min(Math.max(a.y, b.y), rectangle.y + rectangle.height);

function verify(route, source, target, obstacles) {
  assert.ok(route.points.length >= 2);
  assert.ok(onBoundary(route.points[0], source));
  assert.ok(onBoundary(route.points.at(-1), target));
  for (let index = 1; index < route.points.length; index++) {
    const a = route.points[index - 1];
    const b = route.points[index];
    assert.ok(a.x === b.x || a.y === b.y, 'Every segment is orthogonal');
    for (const obstacle of obstacles) assert.equal(crossesInterior(a, b, obstacle), false, `Avoid ${obstacle.id}`);
  }
  const segments = route.points.slice(1).map((b, index) => ({ a: route.points[index], b }));
  for (const [index, first] of segments.entries())
    for (const second of segments.slice(index + 2)) {
      const horizontal = first.a.y === first.b.y;
      const otherHorizontal = second.a.y === second.b.y;
      let overlaps = false;
      if (horizontal === otherHorizontal) {
        const level = (point) => (horizontal ? point.y : point.x);
        const along = (point) => (horizontal ? point.x : point.y);
        overlaps =
          level(first.a) === level(second.a) &&
          Math.min(Math.max(along(first.a), along(first.b)), Math.max(along(second.a), along(second.b))) >
            Math.max(Math.min(along(first.a), along(first.b)), Math.min(along(second.a), along(second.b)));
      } else {
        const h = horizontal ? first : second,
          v = horizontal ? second : first;
        overlaps =
          v.a.x >= Math.min(h.a.x, h.b.x) &&
          v.a.x <= Math.max(h.a.x, h.b.x) &&
          h.a.y >= Math.min(v.a.y, v.b.y) &&
          h.a.y <= Math.max(v.a.y, v.b.y);
      }
      assert.equal(overlaps, false, 'A directed arrow never crosses itself or its own fixed endpoint leads');
    }
}

test('a backward diagonal BA exchange cannot loop across its final lead while passing its caption', async () => {
  const publication = adaptPublication({
    version: 'diagonal-regression',
    space: 'release',
    nodes: [
      { id: 'scope', kind: 'area', fields: { name: 'Scope' } },
      ...[0, 1, 2, 3].map((index) => ({ id: `ba-${index}`, kind: 'business_area', fields: { name: `Area ${index}` } })),
    ],
    relations: [
      ...[0, 1, 2, 3].map((index) => ({
        id: `parent-${index}`,
        type: 'contains',
        source_id: 'scope',
        target_id: `ba-${index}`,
      })),
      ...[
        [0, 1],
        [1, 3],
        [2, 1],
      ].map(([source, target]) => ({
        id: `flow-${source}-${target}`,
        type: 'provides-knowledge',
        source_id: `ba-${source}`,
        target_id: `ba-${target}`,
      })),
    ],
  });
  const { boxes, routes } = await layoutElkFlowMap(buildFlowMap(publication, 'scope', { overviewDepth: 0 }), new ELK());
  assert.equal(routes.length, 3);
  for (const route of routes) {
    const [source, target] = route.id.split('/');
    verify(
      route,
      boxes.find((box) => box.id === source),
      boxes.find((box) => box.id === target),
      boxes,
    );
    assert.ok(route.label);
  }
});

test('diagonal exchanges use the lower face of the upper territory in both directions', () => {
  const top = box('procurement', 168, 168, 360, 160);
  for (const bottom of [box('supply', 1104, 736, 360, 160), box('supply', -900, 736, 360, 160)]) {
    const boxes = [top, bottom];
    const forward = flowFacingSides(bottom, top);
    assert.equal(forward[1], 2, 'Return to the south face of Sourcing and Procurement');
    assert.deepEqual(flowFacingSides(top, bottom), [...forward].reverse());
    const routes = routeFlowExchanges(
      [
        { id: 'supply-to-procurement', source: bottom, target: top },
        { id: 'procurement-to-supply', source: top, target: bottom },
      ],
      boxes,
    );
    for (const [index, route] of routes.entries()) {
      const source = index === 0 ? bottom : top;
      const target = index === 0 ? top : bottom;
      verify(route, source, target, boxes);
      assert.ok(route.label, 'Both directions keep their own readable caption');
      const port = index === 0 ? route.points.at(-1) : route.points[0];
      const next = index === 0 ? route.points.at(-2) : route.points[1];
      assert.equal(port.y, top.y + top.height);
      assert.equal(next.x, port.x);
      assert.ok(next.y > port.y, 'The lead remains below the upper territory');
    }
    assert.notDeepEqual(routes[0].points.at(-1), routes[1].points[0]);
  }
});

test('rounded routes retain directed endpoints and bound each bend by short adjacent segments', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 8 },
    { x: 140, y: 8 },
  ];
  const copy = structuredClone(points);
  const path = roundedFlowPath(points, 10);
  assert.equal(path, 'M 0 0 L 96 0 Q 100 0 100 4 L 100 4 Q 100 8 104 8 L 140 8');
  assert.deepEqual(points, copy, 'Rendering never mutates the world-space route');
  assert.equal(roundedFlowPath([...points].reverse(), 10).startsWith('M 140 8'), true);
  assert.equal(roundedFlowPath([...points].reverse(), 10).endsWith('L 0 0'), true);
  assert.equal(roundedFlowPath(points, 0).includes('Q'), false);
});

test('render paths safely handle duplicate points and invalid or missing geometry', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 40, y: 0 },
  ];
  assert.equal(roundedFlowPath(points), 'M 0 0 L 40 0');
  assert.equal(roundedFlowPath([]), '');
  assert.equal(flowRibbonPath([{ x: 1, y: 1 }]), '');
  assert.equal(
    flowRibbonPath([
      { x: 0, y: 0 },
      { x: Number.NaN, y: 0 },
    ]),
    '',
  );
  assert.equal(flowRibbonPath(points, 0), '');
  assert.equal(
    flowRibbonPath([
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 0, y: 0 },
    ]),
    '',
  );
});

const ribbonPoints = (path) =>
  [...path.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
test('closed ribbons preserve an exact arrow tip for both directions and vertical exchanges', () => {
  for (const points of [
    [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
    [
      { x: 100, y: 0 },
      { x: 0, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    ],
  ]) {
    const path = flowRibbonPath(points, 10, 14);
    assert.ok(path.endsWith(' Z'));
    assert.ok(!/NaN|Infinity/.test(path));
    const outline = ribbonPoints(path);
    assert.ok(outline.some((point) => point.x === points.at(-1).x && point.y === points.at(-1).y));
    assert.equal(outline.filter((point) => point.x === points.at(-1).x && point.y === points.at(-1).y).length, 1);
  }
});

test('bent ribbon outlines stay simple and finite when an adjacent segment is short', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 80, y: 0 },
    { x: 80, y: 6 },
    { x: 120, y: 6 },
  ];
  const outline = ribbonPoints(flowRibbonPath(points, 10, 14));
  assert.ok(outline.length >= 8);
  assert.ok(outline.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  for (let first = 0; first < outline.length; first++)
    for (let second = first + 2; second < outline.length; second++) {
      if (first === 0 && second === outline.length - 1) continue;
      const a = outline[first],
        b = outline[(first + 1) % outline.length],
        c = outline[second],
        d = outline[(second + 1) % outline.length];
      assert.equal(
        cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0,
        false,
        'The filled outline must not cross itself',
      );
    }
});
