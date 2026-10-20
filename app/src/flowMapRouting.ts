import type { FlowMapBox } from './flowMapLayout.ts';
import { FLOW_STUB, FLOW_TRACK, flowFacingSides, flowLabelSize } from './flowMapSpacing.ts';

export interface FlowRoutePoint {
  x: number;
  y: number;
}

export interface FlowExchangeRoute {
  points: FlowRoutePoint[];
  labelPoint: FlowRoutePoint;
}

interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
interface RoutedSegment {
  a: FlowRoutePoint;
  b: FlowRoutePoint;
}
interface RoutingContext {
  source: { point: FlowRoutePoint; side: number; lead?: number };
  target: { point: FlowRoutePoint; side: number; lead?: number };
  segments: readonly RoutedSegment[];
  labels: readonly Rectangle[];
  crossingPenalty?: number;
  parallelPenalty?: number;
}
type Interval = [number, number];
const EPSILON = 0.001;
const BEND_COST = 24;
const SIDE_COST = BEND_COST * 4;

const rectangle = (box: FlowMapBox, padding = 0): Rectangle => ({
  left: box.x - padding,
  top: box.y - padding,
  right: box.x + box.width + padding,
  bottom: box.y + box.height + padding,
});
const contains = (outer: FlowMapBox, inner: FlowMapBox) =>
  outer.x <= inner.x &&
  outer.y <= inner.y &&
  outer.x + outer.width >= inner.x + inner.width &&
  outer.y + outer.height >= inner.y + inner.height;

function ports(box: FlowMapBox, lane: number): FlowRoutePoint[] {
  const spacing = Math.max(20, Math.min(box.width, box.height) * 0.12);
  const offset = lane === 0 ? 0 : Math.ceil(lane / 2) * (lane % 2 ? 1 : -1) * spacing;
  const y = box.y + box.height / 2 + Math.max(-box.height * 0.3, Math.min(box.height * 0.3, offset));
  const x = box.x + box.width / 2 + Math.max(-box.width * 0.3, Math.min(box.width * 0.3, offset));
  return [
    { x: box.x + box.width, y },
    { x: box.x, y },
    { x, y: box.y + box.height },
    { x, y: box.y },
  ];
}

/** Facing sides make neighboring exchanges readable without preventing an obstacle detour. */
function facingSides(source: FlowMapBox, target: FlowMapBox): [number, number] | undefined {
  if (
    source.x + source.width < target.x + EPSILON ||
    target.x + target.width < source.x + EPSILON ||
    source.y + source.height < target.y + EPSILON ||
    target.y + target.height < source.y + EPSILON
  )
    return flowFacingSides(source, target);
  return undefined;
}

function alignFacingPorts(
  source: FlowMapBox,
  target: FlowMapBox,
  sourcePorts: FlowRoutePoint[],
  targetPorts: FlowRoutePoint[],
  facing: [number, number] | undefined,
) {
  if (!facing || facing[0] < 2 !== facing[1] < 2) return;
  const from = sourcePorts[facing[0]];
  const to = targetPorts[facing[1]];
  if (facing[0] < 2) {
    const top = Math.max(source.y + 12, target.y + 12);
    const bottom = Math.min(source.y + source.height - 12, target.y + target.height - 12);
    if (top > bottom) return;
    const y = Math.max(top, Math.min(bottom, source.height <= target.height ? from.y : to.y));
    from.y = y;
    to.y = y;
  } else {
    const left = Math.max(source.x + 12, target.x + 12);
    const right = Math.min(source.x + source.width - 12, target.x + target.width - 12);
    if (left > right) return;
    const x = Math.max(left, Math.min(right, source.width <= target.width ? from.x : to.x));
    from.x = x;
    to.x = x;
  }
}

function intervals(values: Interval[]): Interval[] {
  const sorted = values.sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const value of sorted) {
    const previous = merged.at(-1);
    if (previous && value[0] < previous[1] - EPSILON) previous[1] = Math.max(previous[1], value[1]);
    else merged.push([...value]);
  }
  return merged;
}

function firstIntervalAfter(values: readonly Interval[], coordinate: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (values[middle][1] <= coordinate + EPSILON) low = middle + 1;
    else high = middle;
  }
  return low;
}

function blocked(values: readonly Interval[], from: number, to: number): boolean {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const index = firstIntervalAfter(values, low);
  return index < values.length && values[index][0] < high - EPSILON;
}

function pointBlocked(values: readonly Interval[], coordinate: number): boolean {
  const index = firstIntervalAfter(values, coordinate);
  return index < values.length && values[index][0] < coordinate - EPSILON;
}

/** A deterministic min heap keeps the rectilinear search bounded to promising corridors. */
class Frontier {
  private values: { state: number; score: number; cost: number; order: number }[] = [];
  private sequence = 0;
  private before(a: (typeof this.values)[number], b: (typeof this.values)[number]) {
    return a.score < b.score || (a.score === b.score && a.order < b.order);
  }
  push(state: number, score: number, cost: number) {
    const value = { state, score, cost, order: this.sequence++ };
    let index = this.values.length;
    this.values.push(value);
    while (index > 0) {
      const parent = (index - 1) >>> 1;
      if (!this.before(value, this.values[parent])) break;
      this.values[index] = this.values[parent];
      index = parent;
    }
    this.values[index] = value;
  }
  pop() {
    const first = this.values[0];
    const last = this.values.pop();
    if (!this.values.length || !last) return first;
    let index = 0;
    while (index * 2 + 1 < this.values.length) {
      const left = index * 2 + 1;
      const right = left + 1;
      const child = right < this.values.length && this.before(this.values[right], this.values[left]) ? right : left;
      if (!this.before(this.values[child], last)) break;
      this.values[index] = this.values[child];
      index = child;
    }
    this.values[index] = last;
    return first;
  }
}

function simplify(points: FlowRoutePoint[]): FlowRoutePoint[] {
  return points.filter((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    return (
      !previous ||
      !next ||
      !(
        ((previous.x === point.x && point.x === next.x) || (previous.y === point.y && point.y === next.y)) &&
        (point.x - previous.x) * (next.x - point.x) + (point.y - previous.y) * (next.y - point.y) > 0
      )
    );
  });
}

function search(
  source: FlowMapBox,
  target: FlowMapBox,
  obstacles: readonly FlowMapBox[],
  lane: number,
  clearance: number,
  context?: RoutingContext,
): FlowRoutePoint[] {
  const sourcePorts = ports(source, lane);
  const targetPorts = ports(target, lane);
  const facing = facingSides(source, target);
  if (context) {
    const shift = (port: RoutingContext['source']) => ({
      x: port.point.x + (port.side === 0 ? (port.lead ?? FLOW_STUB) : port.side === 1 ? -(port.lead ?? FLOW_STUB) : 0),
      y: port.point.y + (port.side === 2 ? (port.lead ?? FLOW_STUB) : port.side === 3 ? -(port.lead ?? FLOW_STUB) : 0),
    });
    sourcePorts[context.source.side] = shift(context.source);
    targetPorts[context.target.side] = shift(context.target);
  } else alignFacingPorts(source, target, sourcePorts, targetPorts, facing);
  const sources = sourcePorts.flatMap((point, side) =>
    !context || side === context.source.side ? [{ point, side }] : [],
  );
  const targets = targetPorts.flatMap((point, side) =>
    !context || side === context.target.side ? [{ point, side }] : [],
  );
  const rectangles: Rectangle[] = [];
  for (const box of obstacles) {
    if (box.id === source.id || box.id === target.id) continue;
    if (contains(box, source) || contains(box, target)) {
      // An ancestor's body is traversable, while its named heading stays protected.
      if (box.headerHeight > 0)
        rectangles.push(rectangle({ ...box, height: Math.min(box.height, box.headerHeight) }, clearance));
      continue;
    }
    let padding = clearance;
    for (const endpoint of [source, target]) {
      if (!contains(endpoint, box)) continue;
      const inset = Math.min(
        box.x - endpoint.x,
        box.y - endpoint.y,
        endpoint.x + endpoint.width - box.x - box.width,
        endpoint.y + endpoint.height - box.y - box.height,
      );
      // Inner cards must not close their parent's boundary ports with their clearance halo.
      padding = Math.min(padding, Math.max(0, inset - 6));
    }
    rectangles.push(rectangle(box, padding));
  }
  // Endpoints remain barriers to prevent an arrow from crossing their centered titles.
  if (!contains(source, target))
    rectangles.push(rectangle(source, context ? Math.min(FLOW_TRACK, (context.source.lead ?? FLOW_STUB * 2) / 2) : 0));
  if (!contains(target, source))
    rectangles.push(rectangle(target, context ? Math.min(FLOW_TRACK, (context.target.lead ?? FLOW_STUB * 2) / 2) : 0));
  if (context)
    for (const port of [context.source, context.target]) {
      const lead = port.lead ?? FLOW_STUB;
      const stub = {
        x: port.point.x + (port.side === 0 ? lead : port.side === 1 ? -lead : 0),
        y: port.point.y + (port.side === 2 ? lead : port.side === 3 ? -lead : 0),
      };
      const runway = segmentRectangle({ a: port.point, b: stub }, 12);
      // The search starts/ends on this boundary. Protect the fixed lead-in as well
      // as the node itself, so a detour cannot cross its own first or last segment.
      if (port.side === 0) runway.right = stub.x;
      if (port.side === 1) runway.left = stub.x;
      if (port.side === 2) runway.bottom = stub.y;
      if (port.side === 3) runway.top = stub.y;
      rectangles.push(runway);
    }
  rectangles.push(...(context?.labels || []));
  const xValues = [...sources, ...targets].map(({ point }) => point.x);
  const yValues = [...sources, ...targets].map(({ point }) => point.y);
  if (facing) {
    const from = sourcePorts[facing[0]];
    const to = targetPorts[facing[1]];
    xValues.push((from.x + to.x) / 2);
    yValues.push((from.y + to.y) / 2);
  }
  for (const box of rectangles) {
    xValues.push(box.left, box.right);
    yValues.push(box.top, box.bottom);
  }
  // Offer separate tracks alongside every occupied segment instead of reusing its centerline.
  for (const { a, b } of context?.segments || []) {
    if (a.x === b.x) xValues.push(a.x - FLOW_TRACK, a.x + FLOW_TRACK);
    else yValues.push(a.y - FLOW_TRACK, a.y + FLOW_TRACK);
  }
  xValues.push(Math.min(...xValues) - 80, Math.max(...xValues) + 80);
  yValues.push(Math.min(...yValues) - 80, Math.max(...yValues) + 80);
  const xs = [...new Set(xValues)].sort((a, b) => a - b);
  const ys = [...new Set(yValues)].sort((a, b) => a - b);
  const columns = xs.length;
  const horizontal = ys.map((y) =>
    intervals(
      rectangles
        .filter((box) => box.top < y - EPSILON && box.bottom > y + EPSILON)
        .map((box): Interval => [box.left, box.right]),
    ),
  );
  const vertical = xs.map((x) =>
    intervals(
      rectangles
        .filter((box) => box.left < x - EPSILON && box.right > x + EPSILON)
        .map((box): Interval => [box.top, box.bottom]),
    ),
  );
  const nodeFor = (point: FlowRoutePoint) => ys.indexOf(point.y) * columns + xs.indexOf(point.x);
  const goals = new Map(
    targets.map(({ point, side }) => [
      nodeFor(point),
      { axis: side < 2 ? 0 : 1, side, cost: facing && side !== facing[1] ? SIDE_COST : 0 },
    ]),
  );
  const starts = new Map(sources.map(({ point, side }) => [nodeFor(point), side]));
  const costs = new Float64Array(columns * ys.length * 2).fill(Number.POSITIVE_INFINITY);
  const previous = new Int32Array(costs.length).fill(-1);
  const frontier = new Frontier();
  const heuristic = (x: number, y: number) =>
    Math.min(
      ...targets.map(
        ({ point, side }) =>
          Math.abs(point.x - x) + Math.abs(point.y - y) + (facing && side !== facing[1] ? SIDE_COST : 0),
      ),
    );
  for (const { side, point } of sources) {
    const node = nodeFor(point);
    if (pointBlocked(horizontal[Math.floor(node / columns)], point.x)) continue;
    const state = node * 2 + (side < 2 ? 0 : 1);
    const cost = facing && side !== facing[0] ? SIDE_COST : 0;
    costs[state] = cost;
    frontier.push(state, cost + heuristic(point.x, point.y), cost);
  }
  let finalState = -1;
  let finalCost = Number.POSITIVE_INFINITY;
  for (let current = frontier.pop(); current; current = frontier.pop()) {
    if (current.score >= finalCost) break;
    if (current.cost !== costs[current.state]) continue;
    const node = current.state >>> 1;
    const column = node % columns;
    const row = Math.floor(node / columns);
    const goal = goals.get(node);
    if (goal && (context || goal.axis === (current.state & 1))) {
      const cost = current.cost + goal.cost;
      if (cost < finalCost) {
        finalState = current.state;
        finalCost = cost;
      }
      continue;
    }
    for (const [dc, dr, direction] of [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 1],
      [0, -1, 1],
    ]) {
      const nextColumn = column + dc;
      const nextRow = row + dr;
      if (nextColumn < 0 || nextColumn >= columns || nextRow < 0 || nextRow >= ys.length) continue;
      const arrival = goals.get(nextRow * columns + nextColumn);
      if (
        context &&
        arrival &&
        ((arrival.side === 0 && dc > 0) ||
          (arrival.side === 1 && dc < 0) ||
          (arrival.side === 2 && dr > 0) ||
          (arrival.side === 3 && dr < 0))
      )
        continue;
      if (previous[current.state] < 0) {
        const side = starts.get(node);
        if (!context && direction !== (current.state & 1)) continue;
        if (
          !contains(source, target) &&
          ((side === 0 && dc < 0) || (side === 1 && dc > 0) || (side === 2 && dr < 0) || (side === 3 && dr > 0))
        )
          continue;
      }
      if (
        direction === 0
          ? blocked(horizontal[row], xs[column], xs[nextColumn])
          : blocked(vertical[column], ys[row], ys[nextRow])
      )
        continue;
      const nextState = (nextRow * columns + nextColumn) * 2 + direction;
      const cost =
        current.cost +
        Math.abs(xs[nextColumn] - xs[column]) +
        Math.abs(ys[nextRow] - ys[row]) +
        ((current.state & 1) === direction ? 0 : BEND_COST) +
        congestion(
          { x: xs[column], y: ys[row] },
          { x: xs[nextColumn], y: ys[nextRow] },
          context?.segments || [],
          context?.crossingPenalty,
          context?.parallelPenalty,
        );
      if (cost >= costs[nextState]) continue;
      costs[nextState] = cost;
      previous[nextState] = current.state;
      frontier.push(nextState, cost + heuristic(xs[nextColumn], ys[nextRow]), cost);
    }
  }
  if (finalState < 0) return [];
  const points: FlowRoutePoint[] = [];
  for (let state = finalState; state >= 0; state = previous[state]) {
    const node = state >>> 1;
    points.push({ x: xs[node % columns], y: ys[Math.floor(node / columns)] });
  }
  const ordered = points.reverse();
  return simplify(context ? [context.source.point, ...ordered, context.target.point] : ordered);
}

function congestion(
  a: FlowRoutePoint,
  b: FlowRoutePoint,
  occupied: readonly RoutedSegment[],
  crossingPenalty = 200,
  parallelPenalty = 18,
): number {
  const horizontal = a.y === b.y;
  const low = horizontal ? Math.min(a.x, b.x) : Math.min(a.y, b.y);
  const high = horizontal ? Math.max(a.x, b.x) : Math.max(a.y, b.y);
  let cost = 0;
  for (const segment of occupied) {
    const parallel = (segment.a.y === segment.b.y) === horizontal;
    if (parallel) {
      const distance = Math.abs(horizontal ? a.y - segment.a.y : a.x - segment.a.x);
      if (distance >= FLOW_TRACK - EPSILON) continue;
      const overlap =
        Math.min(high, Math.max(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y)) -
        Math.max(low, Math.min(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y));
      if (overlap > 0) cost += overlap * parallelPenalty * (1 - distance / FLOW_TRACK);
    } else {
      const cross = horizontal ? segment.a.x : segment.a.y;
      const level = horizontal ? a.y : a.x;
      const from = Math.min(horizontal ? segment.a.y : segment.a.x, horizontal ? segment.b.y : segment.b.x);
      const to = Math.max(horizontal ? segment.a.y : segment.a.x, horizontal ? segment.b.y : segment.b.x);
      // Charge half at a grid endpoint, so splitting a crossing cannot avoid its penalty.
      if (cross >= low && cross <= high && level >= from && level <= to)
        cost += cross === low || cross === high ? crossingPenalty / 2 : crossingPenalty;
    }
  }
  return cost;
}

export interface FlowRoutingInput {
  id: string;
  source: FlowMapBox;
  target: FlowMapBox;
}
export type FlowPortChoices = ReadonlyMap<string, readonly [number, number]>;
export interface FlowRoutingPlan {
  portRanks?: ReadonlyMap<string, readonly [number, number]>;
  edgeRanks?: ReadonlyMap<string, number>;
  crossingPenalty?: number;
  parallelPenalty?: number;
}
export interface FlowRoutedExchange extends FlowExchangeRoute {
  id: string;
  label?: { x: number; y: number; width: number; height: number };
}

const segmentsOf = (points: readonly FlowRoutePoint[]): RoutedSegment[] =>
  points.slice(1).map((b, index) => ({ a: points[index], b }));
const intersects = (a: Rectangle, b: Rectangle) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const segmentRectangle = ({ a, b }: RoutedSegment, margin = 12): Rectangle => ({
  left: Math.min(a.x, b.x) - margin,
  right: Math.max(a.x, b.x) + margin,
  top: Math.min(a.y, b.y) - margin,
  bottom: Math.max(a.y, b.y) + margin,
});

/** Only sustained parallel crowding triggers another spacing pass; isolated crossings remain possible. */
export function flowRoutingCongestion(routes: readonly FlowRoutedExchange[]): number {
  let score = 0;
  for (const [index, route] of routes.entries())
    for (const other of routes.slice(index + 1))
      for (const { a, b } of segmentsOf(route.points))
        for (const { a: c, b: d } of segmentsOf(other.points)) {
          const horizontal = a.y === b.y;
          if (horizontal !== (c.y === d.y)) continue;
          const distance = Math.abs(horizontal ? a.y - c.y : a.x - c.x);
          if (distance >= FLOW_TRACK * 0.75) continue;
          const overlap =
            Math.min(
              Math.max(horizontal ? a.x : a.y, horizontal ? b.x : b.y),
              Math.max(horizontal ? c.x : c.y, horizontal ? d.x : d.y),
            ) -
            Math.max(
              Math.min(horizontal ? a.x : a.y, horizontal ? b.x : b.y),
              Math.min(horizontal ? c.x : c.y, horizontal ? d.x : d.y),
            );
          if (overlap > FLOW_STUB) score += overlap * (1 - distance / FLOW_TRACK);
        }
  return score;
}

/** Joint port allocation and negotiated orthogonal routing, in stable publication space. */
export function routeFlowExchanges(
  inputs: readonly FlowRoutingInput[],
  boxes: readonly FlowMapBox[],
  portChoices?: FlowPortChoices,
  plan?: FlowRoutingPlan,
): FlowRoutedExchange[] {
  const portsByEdge = new Map<string, { source?: RoutingContext['source']; target?: RoutingContext['target'] }>();
  const groups = new Map<
    string,
    { edge: FlowRoutingInput; end: 'source' | 'target'; side: number; other: FlowMapBox }[]
  >();
  for (const edge of inputs) {
    const sides = portChoices?.get(edge.id) || flowFacingSides(edge.source, edge.target);
    for (const [index, end] of (['source', 'target'] as const).entries()) {
      const key = `${edge[end].id}/${sides[index]}`;
      const entries = groups.get(key) || [];
      entries.push({ edge, end, side: sides[index], other: end === 'source' ? edge.target : edge.source });
      groups.set(key, entries);
    }
  }
  for (const entries of groups.values()) {
    entries.sort(
      (a, b) =>
        (plan?.portRanks?.get(a.edge.id)?.[a.end === 'source' ? 0 : 1] ?? 0) -
          (plan?.portRanks?.get(b.edge.id)?.[b.end === 'source' ? 0 : 1] ?? 0) ||
        (a.side < 2 ? a.other.y - b.other.y : a.other.x - b.other.x) ||
        a.edge.id.localeCompare(b.edge.id),
    );
    for (const [index, { edge, end, side }] of entries.entries()) {
      const box = edge[end];
      const offset = (index - (entries.length - 1) / 2) * FLOW_TRACK;
      const point =
        side < 2
          ? { x: box.x + (side === 0 ? box.width : 0), y: box.y + box.height / 2 + offset }
          : { x: box.x + box.width / 2 + offset, y: box.y + (side === 2 ? box.height : 0) };
      const assigned = portsByEdge.get(edge.id) || {};
      assigned[end] = { point, side };
      portsByEdge.set(edge.id, assigned);
    }
  }
  const length = (edge: FlowRoutingInput) =>
    Math.abs(edge.source.x - edge.target.x) + Math.abs(edge.source.y - edge.target.y);
  const ordered = [...inputs].sort(
    (a, b) =>
      (plan?.edgeRanks?.get(a.id) ?? length(a)) - (plan?.edgeRanks?.get(b.id) ?? length(b)) || a.id.localeCompare(b.id),
  );
  const occupied: RoutedSegment[] = [];
  const routes = ordered.map((edge) => {
    const assigned = portsByEdge.get(edge.id);
    const points =
      assigned?.source && assigned.target
        ? search(edge.source, edge.target, boxes, 0, FLOW_TRACK, {
            source: assigned.source,
            target: assigned.target,
            segments: occupied,
            labels: [],
            crossingPenalty: plan?.crossingPenalty,
            parallelPenalty: plan?.parallelPenalty,
          })
        : [];
    occupied.push(...segmentsOf(points));
    return { id: edge.id, points, labelPoint: { x: 0, y: 0 } } as FlowRoutedExchange;
  });
  const size = flowLabelSize(boxes);
  const reserved: Rectangle[] = [];
  for (const route of routes) {
    const segments = segmentsOf(route.points).sort(
      (a, b) => Math.hypot(b.b.x - b.a.x, b.b.y - b.a.y) - Math.hypot(a.b.x - a.a.x, a.b.y - a.a.y),
    );
    for (const { a, b } of segments) {
      const offsets = [
        [0, 0],
        ...[1, -1, 2, -2, 3, -3, 4, -4].flatMap((i) => [
          [0, i * (size.height + 24)],
          [i * (size.width + 24), 0],
        ]),
      ];
      candidates: for (const [dx, dy] of offsets)
        for (const fraction of [0.5, 0.35, 0.65, 0.2, 0.8]) {
          const anchor = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
          const label = { x: anchor.x + dx - size.width / 2, y: anchor.y + dy - size.height / 2, ...size };
          const bounds = rectangle(label as FlowMapBox, 12);
          const fits =
            a.y === b.y
              ? label.x >= Math.min(a.x, b.x) + 16 && label.x + size.width <= Math.max(a.x, b.x) - 16
              : label.y >= Math.min(a.y, b.y) + 16 && label.y + size.height <= Math.max(a.y, b.y) - 16;
          if (
            (!dx && !dy && !fits) ||
            boxes.some((box) => intersects(bounds, rectangle(box, 16))) ||
            reserved.some((other) => intersects(bounds, other)) ||
            routes.some(
              (other) =>
                (other.id !== route.id || dx || dy) &&
                segmentsOf(other.points).some((segment) => intersects(bounds, segmentRectangle(segment, 8))),
            )
          )
            continue;
          route.label = label;
          route.labelPoint = anchor;
          reserved.push(bounds);
          break candidates;
        }
      if (route.label) break;
    }
    if (!route.label && route.points.length) {
      const middle = route.points[Math.floor(route.points.length / 2)];
      const top = Math.min(
        ...boxes.map((box) => box.y),
        ...routes.flatMap((other) => other.points.map((point) => point.y)),
      );
      let label = { x: middle.x - size.width / 2, y: top - size.height - 32, ...size };
      while (reserved.some((other) => intersects(rectangle(label as FlowMapBox, 16), other)))
        label = { ...label, y: label.y - size.height - 32 };
      route.label = label;
      route.labelPoint = middle;
      reserved.push(rectangle(label as FlowMapBox, 12));
    }
  }
  return inputs.map(
    (edge) => routes.find((route) => route.id === edge.id) || { id: edge.id, points: [], labelPoint: { x: 0, y: 0 } },
  );
}

function cleanPoints(points: readonly FlowRoutePoint[]): FlowRoutePoint[] {
  if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return [];
  const result: FlowRoutePoint[] = [];
  for (const point of points) {
    const previous = result.at(-1);
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < EPSILON) continue;
    const before = result.at(-2);
    if (before && previous) {
      const ax = previous.x - before.x;
      const ay = previous.y - before.y;
      const bx = point.x - previous.x;
      const by = point.y - previous.y;
      if (Math.abs(ax * by - ay * bx) < EPSILON && ax * bx + ay * by > 0) result.pop();
    }
    result.push(point);
  }
  return result;
}
const coordinates = (point: FlowRoutePoint) => `${Number(point.x.toFixed(3))} ${Number(point.y.toFixed(3))}`;

/** Round bends in world coordinates, retaining exact directed source and target endpoints. */
export function roundedFlowPath(points: readonly FlowRoutePoint[], radius = 10): string {
  const path = cleanPoints(points);
  if (path.length < 2) return '';
  const limit = Number.isFinite(radius) ? Math.max(0, radius) : 0;
  const commands = [`M ${coordinates(path[0])}`];
  for (let index = 1; index < path.length - 1; index++) {
    const before = path[index - 1];
    const point = path[index];
    const after = path[index + 1];
    const ax = point.x - before.x;
    const ay = point.y - before.y;
    const bx = after.x - point.x;
    const by = after.y - point.y;
    const lengthA = Math.hypot(ax, ay);
    const lengthB = Math.hypot(bx, by);
    const corner = Math.min(limit, lengthA / 2, lengthB / 2);
    if (!corner || Math.abs(ax * by - ay * bx) < EPSILON) {
      commands.push(`L ${coordinates(point)}`);
      continue;
    }
    const start = { x: point.x - (ax / lengthA) * corner, y: point.y - (ay / lengthA) * corner };
    const end = { x: point.x + (bx / lengthB) * corner, y: point.y + (by / lengthB) * corner };
    commands.push(`L ${coordinates(start)} Q ${coordinates(point)} ${coordinates(end)}`);
  }
  commands.push(`L ${coordinates(path[path.length - 1])}`);
  return commands.join(' ');
}

/** A closed data arrow. Width is the body thickness; head is the desired arrowhead length. */
export function flowRibbonPath(points: readonly FlowRoutePoint[], width = 10, head = 14): string {
  const path = cleanPoints(points);
  if (path.length < 2 || !Number.isFinite(width) || width <= 0 || !Number.isFinite(head) || head < 0) return '';
  const directions = path.slice(1).map((point, index) => {
    const dx = point.x - path[index].x;
    const dy = point.y - path[index].y;
    const length = Math.hypot(dx, dy);
    return { x: dx / length, y: dy / length, length };
  });
  // A route never doubles back; rejecting that degenerate input avoids a self-crossing outline.
  if (
    directions.some(
      (direction, index) =>
        index && direction.x * directions[index - 1].x + direction.y * directions[index - 1].y < -1 + EPSILON,
    )
  )
    return '';
  const last = directions[directions.length - 1];
  const tip = path[path.length - 1];
  const halfWidth = Math.min(width / 2, ...directions.map((direction) => direction.length / 3));
  const headLength = Math.min(head, last.length * 0.6);
  const halfHead = headLength ? Math.max(halfWidth, Math.min(head / 2, headLength * 0.6)) : halfWidth;
  const base = { x: tip.x - last.x * headLength, y: tip.y - last.y * headLength };
  const outline = (side: number) =>
    path.slice(0, -1).map((point, index) => {
      const next = directions[index];
      const before = directions[index - 1];
      if (!before) return { x: point.x - next.y * halfWidth * side, y: point.y + next.x * halfWidth * side };
      const nx = -before.y - next.y;
      const ny = before.x + next.x;
      const denominator = nx * -next.y + ny * next.x;
      const scale = Math.min(halfWidth / Math.max(EPSILON, denominator), halfWidth * 2) * side;
      return { x: point.x + nx * scale, y: point.y + ny * scale };
    });
  const left = outline(1);
  const right = outline(-1).reverse();
  const polygon = [
    ...left,
    { x: base.x - last.y * halfWidth, y: base.y + last.x * halfWidth },
    { x: base.x - last.y * halfHead, y: base.y + last.x * halfHead },
    tip,
    { x: base.x + last.y * halfHead, y: base.y - last.x * halfHead },
    { x: base.x + last.y * halfWidth, y: base.y - last.x * halfWidth },
    ...right,
  ];
  return `M ${coordinates(polygon[0])} ${polygon
    .slice(1)
    .map((point) => `L ${coordinates(point)}`)
    .join(' ')} Z`;
}
