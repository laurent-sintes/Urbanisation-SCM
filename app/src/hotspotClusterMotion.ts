type Point = { x: number; y: number };

export const HOTSPOT_CLUSTER_MOTION_MS = 460;

// Keep the glyph upright while its position winds clockwise out of the clicked group.
// The orbit's center shifts only when the final circle must be clamped to the viewport.
export function hotspotClusterMotion(anchor: Point, center: Point, point: Point): Keyframe[] {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return Array.from({ length: 37 }, (_, index) => {
    const progress = index / 36;
    const turn = -(1 - progress) * Math.PI * 1.5;
    const radius = progress ** 0.8;
    const x = anchor.x + (center.x - anchor.x) * progress + radius * (dx * Math.cos(turn) - dy * Math.sin(turn));
    const y = anchor.y + (center.y - anchor.y) * progress + radius * (dx * Math.sin(turn) + dy * Math.cos(turn));
    return {
      offset: progress,
      opacity: Math.min(1, progress * 5),
      transform: `translate(${x - point.x}px, ${y - point.y}px) scale(${0.55 + progress * 0.45})`,
    };
  });
}
