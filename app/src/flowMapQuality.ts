import type { FlowMapBox } from './flowMapLayout.ts';
import { type FlowRoutedExchange, type FlowRoutingInput, flowRoutingCongestion } from './flowMapRouting.ts';
import { FLOW_STUB, FLOW_TRACK } from './flowMapSpacing.ts';

const EPSILON = 0.01;
const segments = (route: FlowRoutedExchange) => route.points.slice(1).map((b, i) => ({ a: route.points[i], b }));
type Segment = ReturnType<typeof segments>[number];
type Box = Pick<FlowMapBox, 'x' | 'y' | 'width' | 'height'>;

function through({ a, b }: Segment, box: Box, margin = 0) {
  return a.y === b.y
    ? a.y > box.y - margin + EPSILON &&
        a.y < box.y + box.height + margin - EPSILON &&
        Math.max(a.x, b.x) > box.x - margin + EPSILON &&
        Math.min(a.x, b.x) < box.x + box.width + margin - EPSILON
    : a.x > box.x - margin + EPSILON &&
        a.x < box.x + box.width + margin - EPSILON &&
        Math.max(a.y, b.y) > box.y - margin + EPSILON &&
        Math.min(a.y, b.y) < box.y + box.height + margin - EPSILON;
}

function normal(point: Segment['a'], next: Segment['a'], box: Box) {
  if (Math.hypot(point.x - next.x, point.y - next.y) < FLOW_STUB - EPSILON) return false;
  const withinX = point.x >= box.x && point.x <= box.x + box.width;
  const withinY = point.y >= box.y && point.y <= box.y + box.height;
  return (
    (withinY &&
      point.y === next.y &&
      ((point.x === box.x && next.x < point.x) || (point.x === box.x + box.width && next.x > point.x))) ||
    (withinX &&
      point.x === next.x &&
      ((point.y === box.y && next.y < point.y) || (point.y === box.y + box.height && next.y > point.y)))
  );
}

/** Geometric crossings exclude shared endpoints and collinear tracks, measured separately. */
export function flowRoutingQuality(
  routes: readonly FlowRoutedExchange[],
  boxes: readonly FlowMapBox[],
  inputs: readonly FlowRoutingInput[],
) {
  const byId = new Map(inputs.map((edge) => [edge.id, edge]));
  const paths = routes.map(segments);
  let invalid = 0,
    crossings = 0,
    bends = 0,
    length = 0;
  for (const [i, route] of routes.entries()) {
    const edge = byId.get(route.id);
    if (route.points.length < 2) continue;
    if (
      !edge ||
      !normal(route.points[0], route.points[1], edge.source) ||
      !normal(route.points[route.points.length - 1], route.points[route.points.length - 2], edge.target)
    )
      invalid++;
    bends += Math.max(0, route.points.length - 2);
    for (const segment of paths[i]) {
      const { a, b } = segment;
      if (![a.x, a.y, b.x, b.y].every(Number.isFinite) || (a.x !== b.x && a.y !== b.y)) invalid++;
      if (boxes.some((box) => through(segment, box))) invalid++;
      if (routes.some((other) => other.id !== route.id && other.label && through(segment, other.label, 8))) invalid++;
      length += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      for (const other of paths.slice(i + 1))
        for (const candidate of other) {
          const [h, v] = a.y === b.y ? [segment, candidate] : [candidate, segment];
          if (
            h.a.y === h.b.y &&
            v.a.x === v.b.x &&
            v.a.x > Math.min(h.a.x, h.b.x) + EPSILON &&
            v.a.x < Math.max(h.a.x, h.b.x) - EPSILON &&
            h.a.y > Math.min(v.a.y, v.b.y) + EPSILON &&
            h.a.y < Math.max(v.a.y, v.b.y) - EPSILON
          )
            crossings++;
        }
    }
  }
  return {
    invalid,
    missing: inputs.length - routes.filter((route) => route.points.length >= 2).length,
    missingLabels: routes.filter((route) => !route.label).length,
    congestion: flowRoutingCongestion(routes),
    crossings,
    bends,
    length,
  };
}

/** Safety and documented content precede readability; ties preserve compact, familiar geography. */
export function flowQualityScore(quality: ReturnType<typeof flowRoutingQuality>, area: number, displacement: number) {
  return [
    quality.invalid,
    quality.missing,
    quality.missingLabels,
    Math.ceil(quality.congestion / FLOW_TRACK),
    quality.crossings,
    quality.bends,
    quality.length,
    area,
    displacement,
  ];
}

export function betterFlowScore(candidate: readonly number[], previous: readonly number[]) {
  for (let i = 0; i < candidate.length; i++)
    if (candidate[i] !== previous[i]) return candidate[i] < (previous[i] ?? Infinity);
  return false;
}
