import { legacyFlowLayout } from './benchmarks/legacyFlowOptimization.ts';
/**
 * Historical router / ELK comparison, isolated from the production layout path.
 * node app/benchmark-flow-engines.mjs [--runs=5] [--elk=/absolute/elk.bundled.js]
 * Reads the compiled publication selected by dist/data/index.json, never the backlog.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { buildFlowMap } from './src/flowMapLayout.ts';
import { flowRoutingCongestion } from './src/flowMapRouting.ts';
import { FLOW_STUB, flowConnections, flowLabelSize } from './src/flowMapSpacing.ts';
import { adaptPublication } from './src/model.ts';

const argument = (name) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const runs = Number(argument('runs') || 5);
assert.ok(Number.isInteger(runs) && runs >= 3 && runs <= 15, 'Use 3–15 repetitions');
const output = resolve(import.meta.dirname, '.runtime/elk-comparison/results');
await mkdir(output, { recursive: true });
const elkPath = resolve(
  argument('elk') || resolve(import.meta.dirname, 'node_modules/elkjs/lib/elk.bundled.js'),
);
const elkBytes = await readFile(elkPath);
const elkPackage = JSON.parse(await readFile(resolve(dirname(elkPath), '../package.json'), 'utf8'));
const importStarted = performance.now();
const { default: ELK } = await import(pathToFileURL(elkPath));
const elkImportMs = performance.now() - importStarted;
const elk = new ELK();
const index = JSON.parse(await readFile(resolve(import.meta.dirname, 'dist/data/index.json'), 'utf8'));
const modelBytes = await readFile(resolve(import.meta.dirname, `dist/data/${index.current_version}/model.json`));
const model = adaptPublication(JSON.parse(modelBytes));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const epsilon = 0.01;
const near = (a, b) => Math.abs(a - b) < epsilon;
const boxesOverlap = (a, b, margin = 0) =>
  a.x < b.x + b.width + margin - epsilon &&
  a.x + a.width > b.x - margin + epsilon &&
  a.y < b.y + b.height + margin - epsilon &&
  a.y + a.height > b.y - margin + epsilon;
const between = (value, a, b, inclusive = false) =>
  inclusive
    ? value >= Math.min(a, b) - epsilon && value <= Math.max(a, b) + epsilon
    : value > Math.min(a, b) + epsilon && value < Math.max(a, b) - epsilon;
const segments = (route) => route.points.slice(1).map((b, i) => ({ a: route.points[i], b }));
const horizontal = (segment) => near(segment.a.y, segment.b.y);
const through = ({ a, b }, box, margin = 0) =>
  near(a.y, b.y)
    ? between(a.y, box.y - margin, box.y + box.height + margin) &&
      Math.max(a.x, b.x) > box.x - margin + epsilon &&
      Math.min(a.x, b.x) < box.x + box.width + margin - epsilon
    : between(a.x, box.x - margin, box.x + box.width + margin) &&
      Math.max(a.y, b.y) > box.y - margin + epsilon &&
      Math.min(a.y, b.y) < box.y + box.height + margin - epsilon;

function simplify(points) {
  const unique = points.filter((p, i) => !i || !near(p.x, points[i - 1].x) || !near(p.y, points[i - 1].y));
  return unique.filter(
    (p, i) =>
      !i ||
      i === unique.length - 1 ||
      !(
        (near(p.x, unique[i - 1].x) && near(p.x, unique[i + 1].x)) ||
        (near(p.y, unique[i - 1].y) && near(p.y, unique[i + 1].y))
      ),
  );
}

/** Same tolerant geometry measurement for both engines; contacts and shared tracks are not hidden. */
function measure(layout, baseline, edges) {
  const routes = layout.routes.map((route) => ({
    ...route,
    points: simplify(route.points),
  }));
  const paths = routes.map(segments);
  const crossings = new Set(),
    contacts = new Set(),
    shared = new Set(),
    blockHits = new Set(),
    labelHits = new Set();
  const byId = new Map(layout.boxes.map((box) => [box.id, box]));
  let bends = 0,
    length = 0,
    sharedLength = 0,
    shortLeads = 0,
    badAttachments = 0,
    diagonalSegments = 0,
    minimumLead = Infinity;
  const boundary = (p, q, box) =>
    (near(p.y, q.y) &&
      between(p.y, box.y, box.y + box.height, true) &&
      ((near(p.x, box.x) && q.x < p.x) || (near(p.x, box.x + box.width) && q.x > p.x))) ||
    (near(p.x, q.x) &&
      between(p.x, box.x, box.x + box.width, true) &&
      ((near(p.y, box.y) && q.y < p.y) || (near(p.y, box.y + box.height) && q.y > p.y)));
  for (const [i, route] of routes.entries()) {
    const edge = edges.find((edge) => edge.id === route.id);
    assert.ok(edge, 'Every route retains its directed published pair and type');
    bends += Math.max(0, route.points.length - 2);
    if (route.points.length < 2) continue;
    for (const [id, p, q] of [
      [edge.sourceId, route.points[0], route.points[1]],
      [edge.targetId, route.points.at(-1), route.points.at(-2)],
    ]) {
      const lead = Math.hypot(q.x - p.x, q.y - p.y);
      minimumLead = Math.min(minimumLead, lead);
      if (lead < FLOW_STUB - epsilon) shortLeads++;
      if (!boundary(p, q, byId.get(id))) badAttachments++;
    }
    for (const segment of paths[i]) {
      const { a, b } = segment;
      if (!near(a.x, b.x) && !near(a.y, b.y)) diagonalSegments++;
      length += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      for (const box of layout.boxes) if (through(segment, box)) blockHits.add(`${route.id}/${box.id}`);
      for (const other of routes)
        if (other.id !== route.id && other.label && through(segment, other.label, 8))
          labelHits.add(`${route.id}/${other.id}`);
      for (let j = i + 1; j < paths.length; j++)
        for (const other of paths[j]) {
          if (horizontal(segment) !== horizontal(other)) {
            const [h, v] = horizontal(segment) ? [segment, other] : [other, segment];
            const pointKey = `${i}/${j}/${round(v.a.x)}/${round(h.a.y)}`;
            if (between(v.a.x, h.a.x, h.b.x) && between(h.a.y, v.a.y, v.b.y)) crossings.add(pointKey);
            else if (between(v.a.x, h.a.x, h.b.x, true) && between(h.a.y, v.a.y, v.b.y, true)) contacts.add(pointKey);
          } else {
            const axis = horizontal(segment) ? 'x' : 'y',
              across = axis === 'x' ? 'y' : 'x';
            const overlap =
              Math.min(Math.max(a[axis], b[axis]), Math.max(other.a[axis], other.b[axis])) -
              Math.max(Math.min(a[axis], b[axis]), Math.min(other.a[axis], other.b[axis]));
            if (near(a[across], other.a[across]) && overlap > epsilon) {
              shared.add(`${i}/${j}`);
              sharedLength += overlap;
            }
          }
        }
    }
  }
  for (const point of crossings) contacts.delete(point);
  let labelOverlaps = 0,
    labelsOnBlocks = 0,
    blockOverlaps = 0;
  for (const [i, route] of routes.entries())
    if (route.label) {
      labelsOnBlocks += layout.boxes.filter((box) => boxesOverlap(route.label, box)).length;
      labelOverlaps += routes
        .slice(i + 1)
        .filter((other) => other.label && boxesOverlap(route.label, other.label)).length;
    }
  for (const [i, box] of layout.boxes.entries())
    blockOverlaps += layout.boxes.slice(i + 1).filter((other) => boxesOverlap(box, other)).length;
  let reversals = 0,
    lostAlignments = 0;
  for (const [i, box] of baseline.boxes.entries())
    for (const other of baseline.boxes.slice(i + 1))
      for (const axis of ['x', 'y']) {
        const oldDelta = box[axis] - other[axis],
          delta = byId.get(box.id)[axis] - byId.get(other.id)[axis];
        if (Math.abs(oldDelta) < epsilon && Math.abs(delta) > 32) lostAlignments++;
        else if (Math.abs(oldDelta) > epsilon && Math.abs(delta) > 32 && Math.sign(oldDelta) !== Math.sign(delta))
          reversals++;
      }
  const points = [
    ...layout.boxes.flatMap((box) => [
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y + box.height },
    ]),
    ...routes.flatMap((route) => [
      ...route.points,
      ...(route.label
        ? [
            { x: route.label.x, y: route.label.y },
            {
              x: route.label.x + route.label.width,
              y: route.label.y + route.label.height,
            },
          ]
        : []),
    ]),
  ];
  const width = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)) + 64;
  const height = Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)) + 64;
  return {
    nodes: layout.boxes.length,
    routes: routes.length,
    missing: edges.filter((edge) => !routes.some((route) => route.id === edge.id && route.points.length >= 2)).length,
    labels: routes.filter((route) => route.label).length,
    crossings: crossings.size,
    contacts: contacts.size,
    bends,
    length: round(length),
    sharedPairs: shared.size,
    sharedLength: round(sharedLength),
    congestion: round(flowRoutingCongestion(routes)),
    blockHits: blockHits.size,
    labelHits: labelHits.size,
    labelOverlaps,
    labelsOnBlocks,
    blockOverlaps,
    shortLeads,
    minimumLead: round(minimumLead),
    badAttachments,
    diagonalSegments,
    reversals,
    lostAlignments,
    width: round(width),
    height: round(height),
    area: round(width * height),
    blockArea: layout.boxes.reduce((sum, box) => sum + box.width * box.height, 0),
  };
}

function graphFor(base, edges, config) {
  const labelSize = flowLabelSize(base.boxes);
  const columns = [...new Set(base.boxes.map((box) => box.x))].sort((a, b) => a - b);
  const side = (id, box, source) => {
    const route = base.routes.find((route) => route.id === id),
      p = source ? route.points[0] : route.points.at(-1);
    return near(p.x, box.x) ? 'WEST' : near(p.x, box.x + box.width) ? 'EAST' : near(p.y, box.y) ? 'NORTH' : 'SOUTH';
  };
  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': config.direction,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.randomSeed': '1',
      'elk.layered.mergeEdges': 'false',
      'elk.spacing.nodeNode': '140',
      'elk.layered.spacing.nodeNodeBetweenLayers': String(config.gap ?? labelSize.width + 160),
      'elk.spacing.edgeNode': '64',
      'elk.layered.spacing.edgeNodeBetweenLayers': '64',
      'elk.spacing.edgeEdge': '44',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '44',
      'elk.spacing.portPort': '44',
      'elk.spacing.edgeLabel': '16',
      'elk.spacing.labelNode': '32',
      'elk.spacing.labelLabel': '24',
      'elk.padding': '[top=32,left=32,bottom=32,right=32]',
      ...(config.mode === 'guided'
        ? {
            'elk.layered.cycleBreaking.strategy': 'INTERACTIVE',
            'elk.layered.layering.strategy': 'INTERACTIVE',
            'elk.layered.crossingMinimization.semiInteractive': 'true',
            'elk.separateConnectedComponents': 'false',
            'elk.layered.interactiveReferencePoint': 'TOP_LEFT',
          }
        : {}),
      ...(config.mode === 'partition'
        ? {
            'elk.partitioning.activate': 'true',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
            'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
          }
        : {}),
    },
    children: [...base.boxes]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((box) => ({
        id: box.id,
        width: box.width,
        height: box.height,
        x: box.x,
        y: box.y,
        layoutOptions: {
          'elk.portConstraints': config.ports ? 'FIXED_SIDE' : 'FREE',
          'elk.nodeSize.constraints': '[MINIMUM_SIZE, PORTS]',
          'elk.nodeSize.minimum': `(${box.width},${box.height})`,
          ...(config.mode === 'partition' ? { 'elk.partitioning.partition': String(columns.indexOf(box.x)) } : {}),
        },
        ports: edges.flatMap((edge) => [
          ...(edge.sourceId === box.id
            ? [
                {
                  id: `${edge.id}/s`,
                  width: 0,
                  height: 0,
                  ...(config.ports
                    ? {
                        layoutOptions: {
                          'elk.port.side': side(edge.id, box, true),
                        },
                      }
                    : {}),
                },
              ]
            : []),
          ...(edge.targetId === box.id
            ? [
                {
                  id: `${edge.id}/t`,
                  width: 0,
                  height: 0,
                  ...(config.ports
                    ? {
                        layoutOptions: {
                          'elk.port.side': side(edge.id, box, false),
                        },
                      }
                    : {}),
                },
              ]
            : []),
        ]),
      })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [`${edge.id}/s`],
      targets: [`${edge.id}/t`],
      labels: [
        {
          id: `${edge.id}/label`,
          text: edge.caption,
          ...labelSize,
          layoutOptions: {
            'elk.edgeLabels.placement': 'CENTER',
            'elk.edgeLabels.inline': 'true',
          },
        },
      ],
    })),
  };
}

function fromElk(graph, base) {
  return {
    ...base,
    width: graph.width,
    height: graph.height,
    boxes: graph.children.map((box) => ({
      ...base.boxes.find((item) => item.id === box.id),
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      headerHeight: box.height,
    })),
    routes: graph.edges.map((edge) => {
      assert.equal(edge.sections?.length, 1, 'One simple route per directed exchange');
      const section = edge.sections[0],
        label = edge.labels?.[0];
      return {
        id: edge.id,
        points: simplify([section.startPoint, ...(section.bendPoints || []), section.endPoint]),
        ...(label
          ? {
              label: {
                x: label.x,
                y: label.y,
                width: label.width,
                height: label.height,
              },
              labelPoint: {
                x: label.x + label.width / 2,
                y: label.y + label.height / 2,
              },
            }
          : { labelPoint: section.startPoint }),
      };
    }),
  };
}

function captions(base) {
  return flowConnections(base.exchanges).map((edge) => {
    const relations = base.exchanges
      .filter(
        (other) => other.sourceId === edge.sourceId && other.targetId === edge.targetId && other.type === edge.type,
      )
      .flatMap((other) => other.relations);
    const native = relations.filter((r) => r.sourceId === edge.sourceId && r.targetId === edge.targetId);
    const summary = native.find((r) => r.fields.summary_label)?.fields.summary_label;
    const labels = [...new Set((native.length ? native : relations).map((r) => r.label))];
    return {
      id: `${edge.sourceId}/${edge.targetId}/${edge.type}`,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      type: edge.type,
      relationIds: relations.map((r) => r.id),
      caption:
        typeof summary === 'string'
          ? summary
          : `${labels.slice(0, 2).join(' · ')}${labels.length > 2 ? ` · +${labels.length - 2}` : ''}`,
    };
  });
}

const configs = [
  { id: 'elk-free-right', mode: 'free', direction: 'RIGHT' },
  { id: 'elk-free-down', mode: 'free', direction: 'DOWN' },
  { id: 'elk-guided', mode: 'guided', direction: 'RIGHT' },
  { id: 'elk-partition', mode: 'partition', direction: 'RIGHT' },
  { id: 'elk-guided-ports', mode: 'guided', direction: 'RIGHT', ports: true },
  {
    id: 'elk-partition-ports',
    mode: 'partition',
    direction: 'RIGHT',
    ports: true,
  },
];
configs.push(
  ...configs.map((config) => ({
    ...config,
    id: config.id.replace('elk-', 'elk-compact-'),
    gap: 160,
  })),
);
const timing = (samples) => ({
  firstMs: round(samples[0]),
  medianMs: round([...samples.slice(1)].sort((a, b) => a - b)[Math.floor(runs / 2)]),
  minMs: round(Math.min(...samples.slice(1))),
  maxMs: round(Math.max(...samples.slice(1))),
  samplesMs: samples.map(round),
});
const sourceFiles = ['flowMapLayout.ts', 'flowMapOptimization.ts', 'flowMapRouting.ts', 'flowMapSpacing.ts'];
const report = {
  date: new Date().toISOString(),
  version: index.current_version,
  modelSha256: hash(modelBytes),
  elkVersion: elkPackage.version,
  runtime: {
    node: process.version,
    platform: process.platform,
    cpu: cpus()[0]?.model,
  },
  runs,
  engineLoad: {
    importMs: round(elkImportMs),
    bytes: elkBytes.length,
    gzipBytes: gzipSync(elkBytes).length,
  },
  sources: Object.fromEntries(
    await Promise.all(
      sourceFiles.map(async (file) => [file, hash(await readFile(resolve(import.meta.dirname, 'src', file)))]),
    ),
  ),
  configs,
  scopes: [],
};
for (const scopeId of [undefined, 'supply-chain-orchestration']) {
  const scope = {
    id: scopeId || '@root',
    name: scopeId ? model.nodeById.get(scopeId).name : model.nodes.find((node) => node.kind === 'universe').name,
    variants: [],
  };
  const samples = [];
  let base;
  for (let i = 0; i <= runs; i++) {
    const started = performance.now();
    const seed = buildFlowMap(model, scopeId, { overviewDepth: 0 });
    const layout = legacyFlowLayout(seed);
    samples.push(performance.now() - started);
    if (base) assert.deepEqual(layout.routes, base.routes, 'Repeated calculations retain geography');
    base = layout;
  }
  const edges = captions(base);
  const compact = (layout) => ({
    width: layout.width,
    height: layout.height,
    boxes: layout.boxes.map(({ id, node, x, y, width, height, headerHeight, depth }) => ({
      id,
      name: node.name,
      kind: node.kind,
      x,
      y,
      width,
      height,
      headerHeight,
      depth,
    })),
    routes: layout.routes,
  });
  scope.edges = edges;
  scope.variants.push({
    id: 'atlas',
    timing: timing(samples),
    metrics: measure(base, base, edges),
    layout: compact(base),
  });
  console.log(
    JSON.stringify({
      scope: scope.id,
      engine: 'atlas',
      timing: timing(samples),
      metrics: scope.variants[0].metrics,
    }),
  );
  for (const config of configs) {
    const samples = [];
    let result;
    for (let i = 0; i <= runs; i++) {
      const started = performance.now();
      const graph = graphFor(base, edges, config);
      const outputGraph = await elk.layout(graph);
      const layout = fromElk(outputGraph, base);
      samples.push(performance.now() - started);
      if (result) assert.deepEqual(layout.routes, result.routes, 'ELK uses a fixed seed and stable inputs');
      result = layout;
    }
    const variant = {
      id: config.id,
      timing: timing(samples),
      metrics: measure(result, base, edges),
      layout: compact(result),
      options: graphFor(base, edges, config).layoutOptions,
    };
    scope.variants.push(variant);
    console.log(
      JSON.stringify({
        scope: scope.id,
        engine: config.id,
        timing: variant.timing,
        metrics: variant.metrics,
      }),
    );
  }
  assert.ok(
    scope.variants.every((variant) => !variant.metrics.missing && variant.metrics.labels === edges.length),
    'No documented exchange or label may disappear',
  );
  report.scopes.push(scope);
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
}
console.log(
  JSON.stringify({
    status: 'complete',
    output,
    version: report.version,
    elkVersion: report.elkVersion,
  }),
);
