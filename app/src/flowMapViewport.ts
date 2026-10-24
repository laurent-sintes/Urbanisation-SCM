import type { FlowMapBox } from './flowMapLayout.ts';
import type { FlowRoutePoint } from './flowMapRouting.ts';

export interface FlowCamera {
  x: number;
  y: number;
  zoom: number;
}

/** Locked framing is recomputed from the actual canvas, independently of React Flow's resize cycle. */
export function fitFlowCamera(
  world: { width: number; height: number; boxes: readonly FlowMapBox[] },
  bounds: { width: number; height: number },
  framing: 'width' | 'all',
): FlowCamera {
  const insetX = framing === 'all' && world.boxes.length >= 6 && bounds.width < 340 ? 40 : 16;
  const insetY = 16;
  // Landscape controls sit in the corners; shrinking the central map again
  // would leave no room for its own readable identifiers.
  const footer =
    framing === 'all' && !(bounds.width > 700 && bounds.height < 220) ? Math.min(56, bounds.height * 0.22) : 0;
  const zoom = Math.min(
    2.5,
    Math.max(
      0.003,
      framing === 'width'
        ? Math.max(1, bounds.width - 64) / Math.max(1, world.width)
        : Math.min(
            Math.max(1, bounds.width - insetX * 2) / Math.max(1, world.width),
            Math.max(1, bounds.height - insetY * 2 - footer) / Math.max(1, world.height),
          ),
    ),
  );
  return {
    x: (bounds.width - world.width * zoom) / 2,
    y:
      framing === 'width'
        ? 24 - (world.boxes.length ? Math.min(...world.boxes.map((box) => box.y)) : 0) * zoom
        : (bounds.height - footer - world.height * zoom) / 2,
    zoom,
  };
}

function positiveMedian(values: readonly number[], fallback = 0): number {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!sorted.length) return fallback;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Open a readable neighborhood at its natural scale, independently of the complete world's size.
 * The complete map remains available by panning; overview and a remembered camera are separate choices.
 */
export function standardFlowCamera(
  boxes: readonly FlowMapBox[],
  bounds: { width: number; height: number },
  scopeId?: string,
): FlowCamera {
  if (!boxes.length) return { x: 0, y: 0, zoom: 1 };
  const byId = new Map(boxes.map((box) => [box.id, box]));
  const roots = boxes.filter((box) => !box.parentId || !byId.has(box.parentId));
  const territories = roots.length ? roots : boxes;
  const first = [...territories].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))[0];
  const usefulKind =
    first.node.kind === 'business_system'
      ? 'domain'
      : first.node.kind === 'domain'
        ? 'area'
        : first.node.kind === 'area' || first.node.kind === 'group'
          ? 'business_area'
          : first.node.kind;
  const useful = boxes.filter(
    (box) => box.node.kind === usefulKind || (usefulKind === 'area' && box.node.kind === 'group'),
  );
  const medianWidth = positiveMedian(
    (useful.length ? useful : territories).map((box) => box.width),
    260,
  );
  const parents = useful.flatMap((box) => {
    const parent = box.parentId ? byId.get(box.parentId) : undefined;
    return parent ? [parent] : [];
  });
  const readableHeaders = (parents.length ? parents : territories)
    .map((box) => box.headerHeight)
    .filter((height) => Number.isFinite(height) && height > 0);
  const headingZoom = readableHeaders.length ? Math.max(...readableHeaders.map((height) => 30 / height)) : 0;
  // Enterprise Standard reveals named subdomains inside systems, rather than stopping at empty domain frames.
  const medianAreaWidth =
    first.node.kind === 'business_system'
      ? positiveMedian(
          boxes.filter((box) => box.node.kind === 'area' || box.node.kind === 'group').map((box) => box.width),
        )
      : 0;
  const medianDomainHeader =
    first.node.kind === 'business_system'
      ? positiveMedian(boxes.filter((box) => box.node.kind === 'domain').map((box) => box.headerHeight))
      : 0;
  const systemDetailZoom = Math.max(
    medianAreaWidth ? 120 / medianAreaWidth : 0,
    medianDomainHeader ? 30 / medianDomainHeader : 0,
  );
  const targetWidth = usefulKind === 'domain' ? 200 : usefulKind === 'area' ? 210 : 220;
  const zoom =
    first.node.kind === 'business_area'
      ? 1
      : Math.min(1.2, Math.max(targetWidth / medianWidth, headingZoom, systemDetailZoom));

  // Use the same published corridor whatever overlays are active; nested Supply does not move a system's origin.
  const profile = first.node.reading?.neighborhood;
  const coreIds = new Set(profile?.core_ids ?? []);
  const core = territories.filter((box) => coreIds.has(box.id));
  const hasSupplyCore =
    profile &&
    (!scopeId || scopeId === profile.scope_id) &&
    profile.required_ids.every((id) => core.some((box) => box.id === id));
  const originX = hasSupplyCore ? Math.min(...core.map((box) => box.x)) : first.x;
  const originY = hasSupplyCore ? Math.min(...core.map((box) => box.y)) : first.y;
  const leftInset = Math.min(24, Math.max(0, bounds.width) * 0.08);
  const topInset = Math.min(24, Math.max(0, bounds.height) * 0.1);
  return { x: leftInset - originX * zoom, y: topInset - originY * zoom, zoom };
}

/** A resized window keeps the same world point at its center and preserves zoom. */
export function resizeFlowCamera(
  camera: FlowCamera,
  previous: { width: number; height: number },
  next: { width: number; height: number },
): FlowCamera {
  return {
    ...camera,
    x: camera.x + (next.width - previous.width) / 2,
    y: camera.y + (next.height - previous.height) / 2,
  };
}

/** Selection reveals the named heading, including when only the top of its territory fits. */
export function flowTargetFocus(
  box: FlowMapBox,
  bounds: { width: number; height: number },
): FlowRoutePoint & { zoom: number } {
  const zoom = Math.min(
    1.4,
    Math.max(
      0.32,
      170 / box.width,
      42 / box.height,
      Math.min((bounds.width - 80) / box.width, (bounds.height - 80) / box.height),
    ),
  );
  const topInset = Math.min(32, bounds.height * 0.1);
  const leftInset = Math.min(24, bounds.width * 0.1);
  return {
    x: box.x + Math.min(box.width / 2, (bounds.width / 2 - leftInset) / zoom),
    y: box.y + Math.min(box.height / 2, (bounds.height / 2 - topInset) / zoom),
    zoom,
  };
}

/** Keep a perimeter's marker on its visible footprint when its original corner is outside the camera. */
export function visibleFlowHotspotAnchor(
  box: FlowMapBox,
  camera: FlowCamera,
  bounds: { width: number; height: number },
): FlowRoutePoint | undefined {
  const left = Math.max(0, box.x * camera.zoom + camera.x);
  const top = Math.max(0, box.y * camera.zoom + camera.y);
  const right = Math.min(bounds.width, (box.x + box.width) * camera.zoom + camera.x);
  const bottom = Math.min(bounds.height, (box.y + box.height) * camera.zoom + camera.y);
  if (right <= left || bottom <= top) return undefined;
  // A compact BA has little spare space above its name; keep its marker near its own lower corner.
  if (box.node?.kind === 'business_area')
    return {
      x: right - Math.min(6, (right - left) / 2),
      y: bottom - Math.min(6, (bottom - top) / 2),
    };
  return {
    x: Math.max(left, Math.min(right, right - Math.min(26, (right - left) / 2))),
    y: Math.max(top, Math.min(bottom, top + Math.min(26, (bottom - top) / 2))),
  };
}

/** Completely offscreen arrows must not leave invisible keyboard stops in the current map. */
export function flowRouteInViewport(
  points: readonly FlowRoutePoint[],
  bounds: { width: number; height: number },
): boolean {
  return points.slice(1).some((point, index) => {
    const previous = points[index];
    return (
      Math.max(point.x, previous.x) >= 0 &&
      Math.min(point.x, previous.x) <= bounds.width &&
      Math.max(point.y, previous.y) >= 0 &&
      Math.min(point.y, previous.y) <= bounds.height
    );
  });
}
