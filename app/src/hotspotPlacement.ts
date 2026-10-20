export interface HotspotPlacementItem {
  id: string;
  x: number;
  y: number;
  diameter: number;
}

export interface HotspotPlacementBounds {
  width: number;
  height: number;
  obstacles?: { x: number; y: number; width: number; height: number }[];
  maxDisplacement?: number;
  /** Reserved empty positions may be farther away than the normal local search. */
  fallbackPositions?: { x: number; y: number }[];
}

export const HOTSPOT_DIAMETERS: Record<string, number> = {
  S: 36,
  M: 40,
  L: 44,
  XL: 48,
  unassessed: 40,
};

export const CATALOGUE_HOTSPOT_HEADROOM = 56;

/** Reserve extra map space only when the ordinary placement still covers text. */
export function hotspotPlacementNeedsSpace(
  groups: HotspotPlacementGroup[],
  obstacles: NonNullable<HotspotPlacementBounds['obstacles']>,
) {
  return groups.some((group) =>
    obstacles.some((obstacle) => {
      const x = Math.max(obstacle.x, Math.min(group.x, obstacle.x + obstacle.width));
      const y = Math.max(obstacle.y, Math.min(group.y, obstacle.y + obstacle.height));
      return Math.hypot(group.x - x, group.y - y) < group.diameter / 2 + 2;
    }),
  );
}

/** Safe screen-space alternatives in the empty strip above the Catalogue map. */
export function catalogueHotspotDock(width: number): { x: number; y: number }[] {
  const positions = [];
  for (let x = 26; x <= width - 26; x += 54) positions.push({ x, y: 26 });
  return positions;
}

/** Screen-space placement: fast rings first, then a finer search around obstacles. */
export function placeHotspots(
  items: HotspotPlacementItem[],
  bounds: HotspotPlacementBounds,
  gap = 6,
): Record<string, { x: number; y: number }> | null {
  return placeWithCandidates(items, bounds, gap, new Map());
}

type CandidateCache = Map<string, { x: number; y: number }[]>;

function placeWithCandidates(
  items: HotspotPlacementItem[],
  bounds: HotspotPlacementBounds,
  gap: number,
  cache: CandidateCache,
): Record<string, { x: number; y: number }> | null {
  if (!items.length) return {};
  if (items.reduce((area, item) => area + Math.PI * (item.diameter / 2) ** 2, 0) > bounds.width * bounds.height)
    return null;
  const margin = 2;
  const maxDistance = bounds.maxDisplacement ?? 192;
  const candidatesFor = (fine: boolean) =>
    items.map((item) => {
      const key = `${fine}:${item.x}:${item.y}:${item.diameter}`;
      const cached = cache.get(key);
      if (cached) return cached;
      const positions: { x: number; y: number }[] = [];
      const cells = new Map<string, { x: number; y: number }[]>();
      const radius = item.diameter / 2;
      const centerX = Math.max(radius + margin, Math.min(bounds.width - radius - margin, item.x));
      const centerY = Math.max(radius + margin, Math.min(bounds.height - radius - margin, item.y));
      const add = (x: number, y: number, fallback = false) => {
        if (
          (!fallback && Math.hypot(x - item.x, y - item.y) > maxDistance) ||
          x - radius < margin ||
          y - radius < margin ||
          x + radius > bounds.width - margin ||
          y + radius > bounds.height - margin
        )
          return;
        if (
          bounds.obstacles?.some((obstacle) => {
            const nearestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.width));
            const nearestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.height));
            return Math.hypot(x - nearestX, y - nearestY) < radius + 2;
          })
        )
          return;
        const cellX = Math.floor(x / 3),
          cellY = Math.floor(y / 3);
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (
              cells
                .get(`${cellX + dx}:${cellY + dy}`)
                ?.some((position) => Math.hypot(position.x - x, position.y - y) < 3)
            )
              return;
        const cellKey = `${cellX}:${cellY}`;
        const neighbors = cells.get(cellKey) || [];
        const point = { x, y };
        neighbors.push(point);
        cells.set(cellKey, neighbors);
        positions.push(point);
      };
      add(centerX, centerY);
      for (let distance = fine ? 12 : 48; distance <= maxDistance; distance += fine ? 12 : 48) {
        const steps = Math.ceil((2 * Math.PI * distance) / (fine ? 16 : 26));
        for (let step = 0; step < steps; step++) {
          const angle = (step * 2 * Math.PI) / steps;
          add(centerX + distance * Math.cos(angle), centerY + distance * Math.sin(angle));
        }
      }
      // Include obstacle boundaries so narrow free spaces are not missed by the rings.
      if (fine) {
        for (const obstacle of bounds.obstacles || []) {
          const xs = [obstacle.x - radius - 2, obstacle.x + obstacle.width + radius + 2, centerX];
          const ys = [obstacle.y - radius - 2, obstacle.y + obstacle.height + radius + 2, centerY];
          for (const x of xs) for (const y of ys) add(x, y);
        }
        for (const position of bounds.fallbackPositions || []) add(position.x, position.y, true);
      }
      positions.sort((a, b) => Math.hypot(a.x - item.x, a.y - item.y) - Math.hypot(b.x - item.x, b.y - item.y));
      cache.set(key, positions);
      return positions;
    });
  const solve = (candidates: { x: number; y: number }[][]) => {
    const order = items
      .map((_, index) => index)
      .sort((a, b) => candidates[a].length - candidates[b].length || items[a].id.localeCompare(items[b].id));
    const chosen: { x: number; y: number }[] = [];
    let attempts = 0;
    let candidatesChecked = 0;
    const search = (depth: number): boolean => {
      if (depth === order.length) return true;
      if (++attempts > 30_000) return false;
      const index = order[depth];
      const item = items[index];
      for (const candidate of candidates[index]) {
        // Stop the whole search, including ancestor loops, when the budget is exhausted.
        if (attempts > 30_000 || ++candidatesChecked > 150_000) return false;
        if (
          chosen.some((position, placedIndex) => {
            const other = items[order[placedIndex]];
            const dx = position.x - candidate.x,
              dy = position.y - candidate.y;
            const clearance = (item.diameter + other.diameter) / 2 + gap;
            return dx * dx + dy * dy < clearance * clearance;
          })
        )
          continue;
        chosen.push(candidate);
        if (search(depth + 1)) return true;
        chosen.pop();
      }
      return false;
    };
    if (!search(0)) return null;
    return Object.fromEntries(order.map((index, position) => [items[index].id, chosen[position]]));
  };
  return solve(candidatesFor(false)) || solve(candidatesFor(true));
}

export interface HotspotPlacementGroup extends HotspotPlacementItem {
  ids: string[];
  anchor: { x: number; y: number };
}

/** Collapse only nearby groups, retaining all unrelated individual markers. */
export function layoutHotspots(items: HotspotPlacementItem[], bounds: HotspotPlacementBounds): HotspotPlacementGroup[] {
  const groups = items.map((item) => ({ ...item, ids: [item.id], anchor: { x: item.x, y: item.y } }));
  // Bounds and obstacles are fixed during this call; merges can reuse their candidate positions.
  const cache: CandidateCache = new Map();
  const place = (subset: HotspotPlacementItem[]) => placeWithCandidates(subset, bounds, 6, cache);
  let positions = place(groups);
  while (!positions && groups.length > 1) {
    const blocked = groups.findIndex((group) => !place([group]));
    let pair = [0, 1];
    let distance = Infinity;
    for (let a = 0; a < groups.length; a++)
      for (let b = a + 1; b < groups.length; b++) {
        if (blocked >= 0 && a !== blocked && b !== blocked) continue;
        const score = Math.hypot(groups[a].x - groups[b].x, groups[a].y - groups[b].y);
        if (score < distance) {
          distance = score;
          pair = [a, b];
        }
      }
    const [a, b] = pair;
    const first = groups[a],
      second = groups[b];
    const ids = [...first.ids, ...second.ids].sort();
    const x = (first.x * first.ids.length + second.x * second.ids.length) / ids.length;
    const y = (first.y * first.ids.length + second.y * second.ids.length) / ids.length;
    groups.splice(b, 1);
    groups.splice(a, 1, {
      id: `cluster:${ids.join('|')}`,
      ids,
      x,
      y,
      anchor: { x, y },
      diameter: Math.max(first.diameter, second.diameter),
    });
    positions = place(groups);
  }
  return groups.map((group) => ({
    ...group,
    ...(positions?.[group.id] || {
      x: Math.max(group.diameter / 2 + 2, Math.min(bounds.width - group.diameter / 2 - 2, group.x)),
      y: Math.max(group.diameter / 2 + 2, Math.min(bounds.height - group.diameter / 2 - 2, group.y)),
    }),
  }));
}
