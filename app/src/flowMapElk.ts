import type { ElkNode } from 'elkjs/lib/elk.bundled.js';
import type { FlowMapBox, FlowMapLayout } from './flowMapLayout.ts';
import { bypassPorts } from './flowMapPorts.ts';
import { betterFlowScore, flowQualityScore, flowRoutingQuality } from './flowMapQuality.ts';
import {
  type FlowPortChoices,
  type FlowRoutedExchange,
  type FlowRoutingInput,
  routeFlowExchanges,
} from './flowMapRouting.ts';
import {
  FLOW_STUB,
  FLOW_TRACK,
  flowConnections,
  flowFacingSides,
  flowLabelSize,
  spaceFlowMap,
} from './flowMapSpacing.ts';

export interface FlowLayoutEngine {
  layout(graph: ElkNode): Promise<ElkNode>;
}
const SIDES = ['EAST', 'WEST', 'SOUTH', 'NORTH'] as const;
const keyOf = (edge: { sourceId: string; targetId: string; type: string }) =>
  `${edge.sourceId}/${edge.targetId}/${edge.type}`;
function required<T>(map: ReadonlyMap<string, T>, id: string): T {
  const value = map.get(id);
  if (value === undefined) throw new Error(`Élément de routage absent : ${id}`);
  return value;
}

/** ELK allocates ports; published rows and columns are hard constraints, never an interactive hint. */
export async function layoutElkFlowMap(seed: FlowMapLayout, engine: FlowLayoutEngine): Promise<FlowMapLayout> {
  if (!seed.boxes.length || !seed.exchanges.length) return seed;
  const connections = flowConnections(seed.exchanges).sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
  const natural = seed.boxes.map((box) => ({
    ...box,
    height: ['area', 'group'].includes(box.node.kind) ? Math.max(144, box.height) : box.height,
  }));
  let boxes = spaceFlowMap(natural, seed.exchanges);
  let byId = new Map(boxes.map((box) => [box.id, box]));
  const inputs: FlowRoutingInput[] = connections.flatMap((edge) => {
    const source = byId.get(edge.sourceId),
      target = byId.get(edge.targetId);
    return source && target ? [{ id: keyOf(edge), source, target }] : [];
  });
  const bypass = bypassPorts(inputs, boxes, boxes[0]?.node.kind === 'business_system');
  const sides: FlowPortChoices = new Map(
    inputs.map((edge) => [edge.id, bypass.get(edge.id) || flowFacingSides(edge.source, edge.target)]),
  );
  // Size every face for its actual load, including bypasses, before asking ELK to order ports.
  const loads = new Map<string, number[]>();
  for (const edge of inputs)
    for (const [index, end] of (['source', 'target'] as const).entries()) {
      const counts = loads.get(edge[end].id) || [0, 0, 0, 0];
      counts[required(sides, edge.id)[index]]++;
      loads.set(edge[end].id, counts);
    }
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.randomSeed': '1',
      'elk.layered.mergeEdges': 'false',
      'elk.layered.spacing.nodeNodeBetweenLayers': '160',
      'elk.spacing.nodeNode': '140',
      'elk.spacing.portPort': String(FLOW_TRACK),
      'elk.spacing.edgeNode': String(FLOW_STUB),
      'elk.layered.spacing.edgeNodeBetweenLayers': String(FLOW_STUB),
      'elk.spacing.edgeEdge': String(FLOW_TRACK),
      'elk.layered.spacing.edgeEdgeBetweenLayers': String(FLOW_TRACK),
      'elk.partitioning.activate': 'true',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
    },
    children: [...boxes]
      .sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))
      .map((box) => {
        const counts = loads.get(box.id) || [0, 0, 0, 0];
        const width = Math.max(box.width, (Math.max(counts[2], counts[3]) - 1) * FLOW_TRACK + 48);
        const height = Math.max(box.height, (Math.max(counts[0], counts[1]) - 1) * FLOW_TRACK + 48);
        const columns = [...new Set(boxes.map((box) => box.x))].sort((a, b) => a - b);
        return {
          id: box.id,
          width,
          height,
          x: box.x,
          y: box.y,
          layoutOptions: {
            'elk.portConstraints': 'FIXED_SIDE',
            'elk.nodeSize.constraints': '[]',
            'elk.partitioning.partition': String(columns.indexOf(box.x)),
          },
          ports: inputs.flatMap((edge) =>
            (['source', 'target'] as const).flatMap((end, index) =>
              edge[end].id === box.id
                ? [
                    {
                      id: `${edge.id}/${index}`,
                      width: 0,
                      height: 0,
                      layoutOptions: { 'elk.port.side': SIDES[required(sides, edge.id)[index]] },
                    },
                  ]
                : [],
            ),
          ),
        };
      }),
    edges: inputs.map((edge) => ({
      id: edge.id,
      sources: [`${edge.id}/0`],
      targets: [`${edge.id}/1`],
      labels: [
        { id: `${edge.id}/caption`, ...flowLabelSize(boxes), layoutOptions: { 'elk.edgeLabels.inline': 'true' } },
      ],
    })),
  };
  const proposal = await engine.layout(graph);
  const proposed = new Map(proposal.children?.map((box) => [box.id, box]));
  // Reapply the publication's grid after ELK. No node or route is moved independently afterward.
  boxes = spaceFlowMap(
    natural.map((box) => ({
      ...box,
      width: proposed.get(box.id)?.width || box.width,
      height: proposed.get(box.id)?.height || box.height,
    })),
    seed.exchanges,
  );
  byId = new Map(boxes.map((box) => [box.id, box]));
  const locked = inputs.map((edge) => ({
    ...edge,
    source: required(byId, edge.source.id),
    target: required(byId, edge.target.id),
  }));
  const portRanks = new Map<string, readonly [number, number]>();
  const edgeRanks = new Map<string, number>();
  for (const edge of inputs) {
    const ranks = (['source', 'target'] as const).map((end, index) => {
      const port = proposed.get(edge[end].id)?.ports?.find((port) => port.id === `${edge.id}/${index}`);
      if (!port) throw new Error('ELK n’a pas attribué toutes les attaches.');
      return required(sides, edge.id)[index] < 2 ? port.y || 0 : port.x || 0;
    });
    portRanks.set(edge.id, [ranks[0], ranks[1]]);
    const section = proposal.edges?.find((route) => route.id === edge.id)?.sections?.[0];
    const points = section ? [section.startPoint, ...(section.bendPoints || []), section.endPoint] : [];
    edgeRanks.set(
      edge.id,
      points
        .slice(1)
        .reduce(
          (sum, point, index) => sum + Math.abs(point.x - points[index].x) + Math.abs(point.y - points[index].y),
          0,
        ),
    );
  }
  let best: { routes: FlowRoutedExchange[]; score: number[] } | undefined;
  for (const ordered of [false, true]) {
    const routes = routeFlowExchanges(locked, boxes, sides, {
      portRanks,
      ...(ordered ? { edgeRanks } : {}),
      crossingPenalty: 1200,
      parallelPenalty: 80,
    });
    const quality = flowRoutingQuality(routes, boxes, locked);
    const score = flowQualityScore(quality, 0, 0);
    if (!best || betterFlowScore(score, best.score)) best = { routes, score };
  }
  if (!best || best.score[0] || best.score[1] || best.score[2])
    throw new Error('Le routage contraint ne couvre pas tous les échanges et leurs libellés.');
  return flowMapWithRoutes(seed, boxes, best.routes);
}

/** Fit includes all caption reservations, not just boxes and wire bends. */
function flowMapWithRoutes(seed: FlowMapLayout, boxes: FlowMapBox[], routes: FlowRoutedExchange[]): FlowMapLayout {
  const points = [
    ...boxes.flatMap((box) => [
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y + box.height },
    ]),
    ...routes.flatMap((route) => [
      ...route.points,
      ...(route.label
        ? [
            { x: route.label.x, y: route.label.y },
            { x: route.label.x + route.label.width, y: route.label.y + route.label.height },
          ]
        : []),
    ]),
  ];
  const dx = 32 - Math.min(...points.map((point) => point.x)),
    dy = 32 - Math.min(...points.map((point) => point.y));
  return {
    ...seed,
    boxes: boxes.map((box) => ({ ...box, x: box.x + dx, y: box.y + dy, headerHeight: box.height })),
    routes: routes.map((route) => ({
      ...route,
      points: route.points.map((point) => ({ x: point.x + dx, y: point.y + dy })),
      labelPoint: { x: route.labelPoint.x + dx, y: route.labelPoint.y + dy },
      ...(route.label ? { label: { ...route.label, x: route.label.x + dx, y: route.label.y + dy } } : {}),
    })),
    width: Math.max(...points.map((point) => point.x)) + dx + 32,
    height: Math.max(...points.map((point) => point.y)) + dy + 32,
  };
}
