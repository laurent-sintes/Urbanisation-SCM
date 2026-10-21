import assert from 'node:assert/strict';
import { test } from 'node:test';
import ELK from 'elkjs/lib/elk.bundled.js';
import { flowLayoutsFor } from './src/flowMapCache.ts';
import { flowRectanglesOverlap, placeFlowAnnotations } from './src/flowMapCaptions.ts';
import { layoutElkFlowMap } from './src/flowMapElk.ts';
import { flowRoutingQuality } from './src/flowMapQuality.ts';
import { fitFlowText } from './src/flowMapText.ts';
import { fitFlowCamera } from './src/flowMapViewport.ts';

const engine = new ELK();

test('ELK keeps Logistics below Business Operations and preserves every published row and column', async () => {
  const boxes = [
    ['design', 0, 0],
    ['operations', 500, 0],
    ['management', 1000, 0],
    ['logistics', 500, 500],
  ].map(([id, x, y]) => ({
    id,
    x,
    y,
    width: 360,
    height: 180,
    headerHeight: 180,
    depth: 0,
    node: { id, name: id, kind: 'business_system' },
  }));
  const exchanges = [
    [0, 1],
    [1, 0],
    [1, 3],
    [3, 1],
    [1, 2],
    [2, 1],
    [2, 0],
    [0, 2],
    [2, 3],
    [3, 2],
  ].map(([s, t], i) => ({
    id: `e${i}`,
    sourceId: boxes[s].id,
    targetId: boxes[t].id,
    type: 'shares-data',
    label: 'Documented exchange',
    relations: [],
  }));
  const seed = { boxes, exchanges, width: 1360, height: 680 };
  const layout = await layoutElkFlowMap(seed, engine);
  const result = new Map(layout.boxes.map((box) => [box.id, box]));
  assert.equal(result.get('logistics').x, result.get('operations').x);
  assert.ok(result.get('logistics').y > result.get('operations').y + result.get('operations').height);
  for (const a of boxes)
    for (const b of boxes)
      for (const axis of ['x', 'y'])
        assert.equal(Math.sign(result.get(a.id)[axis] - result.get(b.id)[axis]), Math.sign(a[axis] - b[axis]));
  const inputs = exchanges.map((e) => ({
    id: `${e.sourceId}/${e.targetId}/${e.type}`,
    source: result.get(e.sourceId),
    target: result.get(e.targetId),
  }));
  const quality = flowRoutingQuality(layout.routes, layout.boxes, inputs);
  assert.equal(quality.invalid + quality.missing + quality.missingLabels, 0);
  assert.ok(quality.crossings <= 1 && quality.bends <= 12);
  assert.deepEqual(await layoutElkFlowMap({ ...seed, exchanges: [...exchanges].reverse() }, engine), {
    ...layout,
    exchanges: [...exchanges].reverse(),
  });
  for (const route of layout.routes) {
    assert.ok(route.label.x >= 0 && route.label.y >= 0);
    assert.ok(route.label.x + route.label.width <= layout.width && route.label.y + route.label.height <= layout.height);
  }
  for (const [zoom, size] of [
    [0.4, { width: 1000, height: 700 }],
    [0.12, { width: 341, height: 333 }],
    [0.8, { width: 1000, height: 700 }],
  ])
    assert.equal(
      placeFlowAnnotations(layout.routes, layout.boxes, layout, size, zoom).captions.size,
      exchanges.length,
      'Reduced zoom keeps every caption',
    );
});

test('explicit title wrapping retains every word and fits the full text without a clamp', () => {
  const measure = (text, font) => text.length * font * 0.52;
  for (const title of [
    'Enterprise Management & Control',
    'Operational References',
    'Supply Policy Management',
    'Fulfilment Orchestration',
  ])
    for (const [width, height] of [
      [125, 60],
      [95, 46],
      [140, 60],
    ]) {
      const fitted = fitFlowText(title, width, height, 20, measure);
      assert.equal(fitted.lines.join(' ').replaceAll(' ', ''), title.replaceAll(' ', ''));
      assert.ok(fitted.lines.every((line) => measure(line, fitted.font) <= width + 0.1));
      assert.ok(fitted.lines.length * fitted.font * 1.25 <= height + 0.1);
      assert.ok(
        fitted.lines.every((line) => !line || title.includes(line)),
        'Words are not split across lines',
      );
    }
});

test('dense Supply-style maps preserve all rows, columns, routes and captions', async () => {
  const boxes = Array.from({ length: 9 }, (_, i) => ({
    id: `s${i}`,
    x: (i % 3) * 500,
    y: Math.floor(i / 3) * 400,
    width: 144,
    height: 100,
    headerHeight: 100,
    depth: 0,
    node: { id: `s${i}`, name: `Supply territory ${i}`, kind: 'area' },
  }));
  const exchanges = Array.from({ length: 26 }, (_, i) => ({
    id: `e${i}`,
    sourceId: boxes[i % 9].id,
    targetId: boxes[((i % 9) + 1 + Math.floor(i / 9)) % 9].id,
    type: 'shares-data',
    label: 'A documented contribution between territories',
    relations: [],
  }));
  const layout = await layoutElkFlowMap({ boxes, exchanges, width: 1144, height: 900 }, engine);
  const byId = new Map(layout.boxes.map((box) => [box.id, box]));
  for (const a of boxes)
    for (const b of boxes)
      for (const axis of ['x', 'y'])
        assert.equal(Math.sign(byId.get(a.id)[axis] - byId.get(b.id)[axis]), Math.sign(a[axis] - b[axis]));
  const inputs = exchanges.map((edge) => ({
    id: `${edge.sourceId}/${edge.targetId}/${edge.type}`,
    source: byId.get(edge.sourceId),
    target: byId.get(edge.targetId),
  }));
  const quality = flowRoutingQuality(layout.routes, layout.boxes, inputs);
  assert.equal(quality.invalid + quality.missing + quality.missingLabels, 0);
  for (const zoom of [0.1, 0.4, 0.8]) {
    const captions = placeFlowAnnotations(
      layout.routes,
      layout.boxes,
      layout,
      { width: 1000, height: 700 },
      zoom,
    ).captions;
    assert.equal(captions.size, exchanges.length);
    assert.deepEqual(
      captions,
      placeFlowAnnotations(layout.routes, layout.boxes, layout, { width: 1000, height: 700 }, zoom).captions,
    );
  }
  for (const size of [
    { width: 1000, height: 700 },
    { width: 341, height: 333 },
    { width: 780, height: 100 },
    { width: 270, height: 228 },
  ]) {
    const camera = fitFlowCamera(layout, size, 'all');
    const obstacles = [
      { x: 12, y: size.height - 48, width: Math.min(260, size.width - 72), height: 36 },
      { x: size.width - 54, y: size.height - 48, width: 42, height: 36 },
    ];
    const titles = layout.boxes.map((box, i) => ({
      id: box.id,
      text: `Supply territory ${i}`,
      shortText: `S${i}`,
      x: box.x * camera.zoom,
      y: box.y * camera.zoom,
      width: 124,
      height: 38,
    }));
    const result = placeFlowAnnotations(layout.routes, layout.boxes, layout, size, camera.zoom, {
      camera,
      obstacles,
      titles,
      overview: true,
    });
    assert.ok(
      result.complete,
      `Every flow and territory retains an annotation in ${JSON.stringify(size)}: ${result.titles.size} titles, ${result.captions.size} flows`,
    );
    const annotations = [...result.captions.values(), ...result.titles.values()].map((rect) => ({
      ...rect,
      x: rect.x + camera.x,
      y: rect.y + camera.y,
    }));
    for (const [id, title] of result.titles) {
      const box = byId.get(id),
        x = box.x * camera.zoom,
        y = box.y * camera.zoom;
      const gap = size.height < 220 ? 64 : 32;
      assert.ok(Math.max(x - title.x - title.width, title.x - x - box.width * camera.zoom, 0) <= gap);
      assert.ok(Math.max(y - title.y - title.height, title.y - y - box.height * camera.zoom, 0) <= gap);
    }
    for (const [i, rect] of annotations.entries()) {
      assert.ok(
        ![...annotations.slice(i + 1), ...obstacles].some((other) => flowRectanglesOverlap(rect, other)),
        'No collision is accepted as a fallback',
      );
      assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= size.width && rect.y + rect.height <= size.height);
    }
  }
});

test('workshop-only changes reuse geometry while structural or publication changes invalidate it', () => {
  const model = { nodes: [], relations: [], version: 'v1', raw: { workshop: { revision: 1 } } };
  const layouts = flowLayoutsFor(model),
    layout = { boxes: [], exchanges: [], width: 10, height: 10 };
  layouts.set('supply', layout);
  assert.equal(flowLayoutsFor({ ...model, raw: { workshop: { revision: 2 } } }).get('supply'), layout);
  assert.notEqual(flowLayoutsFor({ ...model, nodes: [] }), layouts);
  assert.notEqual(flowLayoutsFor({ ...model, relations: [] }), layouts);
  assert.notEqual(flowLayoutsFor({ ...model, version: 'v2' }), layouts);
});

test('a four-column Supply map keeps all 26 flow identifiers beside touch-sized controls on a 320px phone', async () => {
  const positions = [
    [0, 0],
    [1, 0],
    [2, 1],
    [2, 0],
    [1, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [0, 1],
  ];
  const names = [
    'Operational References',
    'Supply Policy Management',
    'Inventory Management',
    'Order Management',
    'Master Plan',
    'Availability',
    'Process Management',
    'Fulfilment Orchestration',
    'Service Management',
  ];
  const boxes = positions.map(([column, row], i) => ({
    id: `s${i}`,
    x: column * 500,
    y: row * 400,
    width: 288,
    height: 144,
    headerHeight: 144,
    depth: 0,
    node: { id: `s${i}`, name: names[i], kind: 'area' },
  }));
  const pairs = [
    [2, 4],
    [2, 6],
    [5, 3],
    [5, 7, 1],
    [5, 4],
    [3, 2],
    [3, 7, 1],
    [3, 4],
    [3, 6],
    [7, 2],
    [7, 5],
    [7, 3],
    [7, 4],
    [7, 6],
    [7, 8, 1],
    [7, 8],
    [4, 2],
    [4, 5],
    [4, 3],
    [4, 6],
    [1, 5],
    [1, 4],
    [8, 3, 1],
    [8, 7, 1],
    [8, 7],
    [8, 6],
  ];
  const exchanges = pairs.map(([source, target, knowledge], i) => ({
    id: `e${i}`,
    sourceId: `s${source}`,
    targetId: `s${target}`,
    type: knowledge ? 'provides-knowledge' : 'shares-data',
    label: 'Documented exchange',
    relations: [],
  }));
  const layout = await layoutElkFlowMap({ boxes, exchanges, width: 1788, height: 944 }, engine);
  const size = { width: 285, height: 228 },
    camera = fitFlowCamera(layout, size, 'all');
  const result = placeFlowAnnotations(layout.routes, layout.boxes, layout, size, camera.zoom, {
    camera,
    overview: true,
    titles: layout.boxes.map((box) => ({
      id: box.id,
      text: box.node.name,
      shortText: box.node.name
        .split(/\s+/)
        .map((word) => word[0])
        .join(''),
      x: (box.x + box.width / 2) * camera.zoom - 62,
      y: (box.y + box.height / 2) * camera.zoom - 18,
      width: 124,
      height: 38,
    })),
    obstacles: [
      { x: 4, y: size.height - 56, width: 232, height: 52 },
      { x: size.width - 56, y: size.height - 56, width: 52, height: 52 },
    ],
  });
  assert.ok(
    result.complete,
    `No annotation may disappear on the smallest phone (${result.titles.size}/9 titles, ${result.captions.size}/26 flows)`,
  );
  assert.equal(result.captions.size, 26);
  assert.equal(result.titles.size, 9);
});

test('text that cannot fit at a readable size requests an external title rather than microscopic characters', () => {
  const fitted = fitFlowText('Supply Policy Management', 12, 6, 20, (text, font) => text.length * font * 0.52);
  assert.equal(fitted.font, 11);
  assert.equal(fitted.fits, false);
});
