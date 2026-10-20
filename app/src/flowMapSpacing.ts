import type { FlowMapBox, FlowMapExchange } from './flowMapLayout.ts';

/** Distances in publication space, sized for the natural (Standard) reading scale. */
export const FLOW_TRACK = 44;
export const FLOW_STUB = 64;
export const FLOW_LABEL_WIDTH = 360;
export const FLOW_LABEL_HEIGHT = 104;

export function flowLabelSize(boxes: readonly FlowMapBox[]) {
  const kind = boxes[0]?.node?.kind;
  if (kind === 'business_area') return { width: 204, height: 60 };
  if (kind === 'area' || kind === 'group') return { width: 260, height: 76 };
  return { width: FLOW_LABEL_WIDTH, height: FLOW_LABEL_HEIGHT };
}

export function flowFacingSides(source: FlowMapBox, target: FlowMapBox): [number, number] {
  const left = source.x + source.width <= target.x;
  const right = target.x + target.width <= source.x;
  const above = source.y + source.height <= target.y;
  const below = target.y + target.height <= source.y;
  // Diagonal neighbors use a corner: leave the upper row through its bottom
  // and join the lower row from the side facing it. Reversing a flow reverses
  // the same pair, so returning traffic does not wrap around the upper block.
  if ((left || right) && (above || below)) {
    if (above) return [2, left ? 1 : 0];
    return [left ? 0 : 1, 2];
  }
  if (source.x + source.width <= target.x) return [0, 1];
  if (target.x + target.width <= source.x) return [1, 0];
  return source.y <= target.y ? [2, 3] : [3, 2];
}

/** Aggregate only the same directed pair and type, exactly like the visible exchange layer. */
export function flowConnections(exchanges: readonly FlowMapExchange[]) {
  return [...new Map(exchanges.map((edge) => [`${edge.sourceId}/${edge.targetId}/${edge.type}`, edge])).values()];
}

/**
 * Expand the existing row/column ordering, never reorder territories. Each cut reserves
 * tracks for all crossing exchanges and a label bay. All published types participate,
 * so filtering, overlays, viewport size and zoom cannot move the map.
 */
export function spaceFlowMap(
  boxes: readonly FlowMapBox[],
  exchanges: readonly FlowMapExchange[],
  corridorScale = 1,
): FlowMapBox[] {
  const edges = flowConnections(exchanges);
  if (!edges.length || boxes.length < 2) return boxes.map((box) => ({ ...box }));
  const byId = new Map(boxes.map((box) => [box.id, box]));
  const labelSize = flowLabelSize(boxes);
  const loads = new Map<string, number[]>();
  for (const edge of edges) {
    const source = byId.get(edge.sourceId);
    const target = byId.get(edge.targetId);
    if (!source || !target) continue;
    const sides = flowFacingSides(source, target);
    for (const [index, box] of [source, target].entries()) {
      const counts = loads.get(box.id) || [0, 0, 0, 0];
      counts[sides[index]]++;
      loads.set(box.id, counts);
    }
  }
  const expanded = boxes.map((box) => {
    const counts = loads.get(box.id) || [0, 0, 0, 0];
    const width = Math.max(box.width, (Math.max(counts[2], counts[3]) - 1) * FLOW_TRACK + 48);
    const height = Math.max(box.height, (Math.max(counts[0], counts[1]) - 1) * FLOW_TRACK + 48);
    return { ...box, width, height, headerHeight: height };
  });
  for (const axis of ['x', 'y'] as const) {
    const dimension = axis === 'x' ? 'width' : 'height';
    const positions = [...new Set(boxes.map((box) => box[axis]))].sort((a, b) => a - b);
    let coordinate = FLOW_LABEL_HEIGHT + FLOW_STUB;
    for (const [index, position] of positions.entries()) {
      if (index) {
        const previous = positions[index - 1];
        const crossing = edges.filter((edge) => {
          const source = byId.get(edge.sourceId);
          const target = byId.get(edge.targetId);
          return (
            source &&
            target &&
            Math.min(source[axis], target[axis]) < position &&
            Math.max(source[axis], target[axis]) >= position
          );
        });
        // Tracks can be reused at different heights/columns. Reserve the busiest
        // endpoint's load, rather than adding every flow across the entire cut.
        const traffic = new Map<string, number>();
        for (const edge of crossing)
          for (const id of [edge.sourceId, edge.targetId]) traffic.set(id, (traffic.get(id) || 0) + 1);
        const peak = Math.max(0, ...traffic.values());
        // Crossings at different rows or columns can share the same corridor.
        // Reserve a compact initial bundle; the routing pass expands it when
        // obstacle avoidance or caption protection needs more room.
        const tracks = Math.ceil(Math.sqrt(peak));
        const previousSize = Math.max(
          ...expanded.filter((box) => byId.get(box.id)?.[axis] === previous).map((box) => box[dimension]),
        );
        const labelBay = axis === 'x' ? labelSize.width : labelSize.height;
        coordinate +=
          previousSize + Math.max(200, FLOW_STUB * 2 + labelBay + Math.max(0, tracks - 1) * FLOW_TRACK) * corridorScale;
      }
      for (const box of expanded) if (byId.get(box.id)?.[axis] === position) box[axis] = coordinate;
    }
  }
  return expanded;
}
