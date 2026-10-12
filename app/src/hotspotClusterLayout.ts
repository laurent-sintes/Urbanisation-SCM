export interface ClusterPoint {
  x: number;
  y: number;
}

/** Screen coordinates, independent of map zoom. Leave room for the heading and footer. */
export function hotspotClusterLayout(
  count: number,
  anchor: ClusterPoint,
  width: number,
  height: number,
  top = 0,
  headingHeight = 64,
  footerReserve?: number,
) {
  const itemSize = 56;
  const bounds = { left: 12, right: width - 12, top: top + headingHeight + 12, bottom: height - 12 };
  const availableRadius = (reserve: number) =>
    Math.max(0, Math.min(bounds.right - bounds.left - itemSize, height - reserve - bounds.top - itemSize) / 2);
  const capacityAt = (radius: number) =>
    radius < 32 ? 1 : Math.max(1, Math.floor(Math.PI / Math.asin(Math.min(1, 64 / (2 * radius)))));
  const reserved = footerReserve ?? (count <= capacityAt(availableRadius(12)) ? 12 : 76);
  bounds.bottom = height - reserved;
  const maxRadius = availableRadius(reserved);
  const capacity = capacityAt(maxRadius);
  const visibleCount = Math.max(1, Math.min(count, capacity));
  const radius = Math.min(maxRadius, Math.max(88, visibleCount < 2 ? 88 : 64 / (2 * Math.sin(Math.PI / visibleCount))));
  const offsets = Array.from({ length: visibleCount }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / visibleCount;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
  // Reserve the complete circle, even on a partial last page: its center must not jump.
  const extent = radius + itemSize / 2;
  const center = {
    x: Math.max(bounds.left + extent, Math.min(bounds.right - extent, anchor.x)),
    y: Math.max(bounds.top + extent, Math.min(bounds.bottom - extent, anchor.y)),
  };
  return {
    center,
    capacity,
    itemSize,
    footerReserve: reserved,
    centerSize: radius >= 64 ? 60 : radius >= 50 ? 40 : radius >= 44 ? 24 : 6,
    points: offsets.map((point) => ({ x: center.x + point.x, y: center.y + point.y })),
  };
}
