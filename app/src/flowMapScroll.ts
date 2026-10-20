import type { FlowMapLayout } from './flowMapLayout.ts';
import type { FlowCamera } from './flowMapViewport.ts';

export interface FlowScrollExtent {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export interface FlowScrollAxis {
  visible: boolean;
  range: number;
  value: number;
  origin: number;
}
export const FLOW_SCROLLBAR_SIZE = 14;

/** Include every documented route and caption even when a display layer is hidden. */
export function flowScrollContent(layout: FlowMapLayout): FlowScrollExtent {
  const points = [
    ...layout.boxes.flatMap((box) => [
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y + box.height },
    ]),
    ...(layout.routes || []).flatMap((route) => [
      ...route.points,
      ...(route.label
        ? [
            { x: route.label.x, y: route.label.y },
            { x: route.label.x + route.label.width, y: route.label.y + route.label.height },
          ]
        : []),
    ]),
  ];
  return points.length
    ? {
        left: Math.min(...points.map((point) => point.x)),
        top: Math.min(...points.map((point) => point.y)),
        right: Math.max(...points.map((point) => point.x)),
        bottom: Math.max(...points.map((point) => point.y)),
      }
    : { left: 0, top: 0, right: 0, bottom: 0 };
}

/** The envelope can grow during free dragging, so scrolling can always return to the map. */
export function flowScrollGeometry(
  content: FlowScrollExtent,
  camera: FlowCamera,
  size: { width: number; height: number },
  previous?: FlowScrollExtent,
) {
  const zoom = Math.max(0.003, camera.zoom);
  const margin = 16 / zoom;
  const extent = {
    left: Math.min(content.left - margin, -camera.x / zoom, previous?.left ?? Infinity),
    top: Math.min(content.top - margin, -camera.y / zoom, previous?.top ?? Infinity),
    right: Math.max(content.right + margin, (size.width - camera.x) / zoom, previous?.right ?? -Infinity),
    bottom: Math.max(content.bottom + margin, (size.height - camera.y) / zoom, previous?.bottom ?? -Infinity),
  };
  const axis = (
    from: number,
    to: number,
    min: number,
    max: number,
    offset: number,
    viewport: number,
  ): FlowScrollAxis => {
    const range = Math.max(0, (max - min) * zoom - viewport);
    return {
      origin: -min * zoom,
      range,
      value: Math.max(0, Math.min(range, -offset - min * zoom)),
      visible: from * zoom + offset < -1 || to * zoom + offset > viewport + 1,
    };
  };
  return {
    extent,
    horizontal: axis(content.left, content.right, extent.left, extent.right, camera.x, size.width),
    vertical: axis(content.top, content.bottom, extent.top, extent.bottom, camera.y, size.height),
  };
}

export function scrollFlowCamera(
  camera: FlowCamera,
  geometry: ReturnType<typeof flowScrollGeometry>,
  dx: number,
  dy: number,
): FlowCamera {
  const move = (axis: FlowScrollAxis, delta: number, offset: number) =>
    !axis.visible || !delta ? offset : axis.origin - Math.max(0, Math.min(axis.range, axis.value + delta));
  return { ...camera, x: move(geometry.horizontal, dx, camera.x), y: move(geometry.vertical, dy, camera.y) };
}
