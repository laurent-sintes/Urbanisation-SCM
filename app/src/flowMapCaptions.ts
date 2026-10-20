import type { FlowMapBox } from './flowMapLayout.ts';
import type { FlowRoutedExchange } from './flowMapRouting.ts';

export interface FlowRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface FlowTitleRequest extends FlowRectangle {
  id: string;
  text: string;
  shortText: string;
}
export interface FlowCaption extends FlowRectangle {
  anchor: { x: number; y: number };
  compact: boolean;
  badge?: number;
  text?: string;
}
export const flowRectanglesOverlap = (a: FlowRectangle, b: FlowRectangle, margin = 2) =>
  a.x < b.x + b.width + margin &&
  a.x + a.width + margin > b.x &&
  a.y < b.y + b.height + margin &&
  a.y + a.height + margin > b.y;

/** Strict screen-space packing. A crowded overview uses readable identifiers, never colliding text. */
export function placeFlowAnnotations(
  routes: readonly FlowRoutedExchange[],
  boxes: readonly FlowMapBox[],
  world: { width: number; height: number },
  size: { width: number; height: number },
  zoom: number,
  options: {
    camera?: { x: number; y: number };
    obstacles?: readonly FlowRectangle[];
    titles?: readonly FlowTitleRequest[];
    overview?: boolean;
  } = {},
) {
  const camera = options.camera || { x: 0, y: 0 };
  const bounds = options.overview
    ? { left: 6, top: 6, right: size.width - 6, bottom: size.height - 6 }
    : {
        left: Math.min(0, camera.x),
        top: Math.min(0, camera.y),
        right: Math.max(size.width, camera.x + world.width * zoom),
        bottom: Math.max(size.height, camera.y + world.height * zoom),
      };
  const bodies = boxes.map((box) => ({
    id: box.id,
    x: box.x * zoom + camera.x,
    y: box.y * zoom + camera.y,
    width: box.width * zoom,
    height: box.height * zoom,
  }));
  const wires = routes.flatMap((route) =>
    route.points.slice(1).map((p, i) => {
      const before = route.points[i];
      return {
        id: route.id,
        x: Math.min(p.x, before.x) * zoom + camera.x - 1,
        y: Math.min(p.y, before.y) * zoom + camera.y - 1,
        width: Math.abs(p.x - before.x) * zoom + 2,
        height: Math.abs(p.y - before.y) * zoom + 2,
      };
    }),
  );
  const ordered = [...routes].filter((route) => route.points.length).sort((a, b) => a.id.localeCompare(b.id));
  const attempt = (badges: boolean, shortTitles: boolean) => {
    const placed: FlowRectangle[] = [];
    const captions = new Map<string, FlowCaption>(),
      titles = new Map<string, FlowCaption>();
    const requests = [
      ...(options.titles || []).map((title) => ({
        id: title.id,
        owner: title.id,
        title: true,
        text: shortTitles ? title.shortText : title.text,
        width: shortTitles ? Math.max(26, title.shortText.length * 7 + 8) : title.width,
        height: shortTitles ? 20 : title.height,
        ideal: { x: title.x + title.width / 2 + camera.x, y: title.y + title.height / 2 + camera.y },
        anchor: {
          x:
            (boxes.find((box) => box.id === title.id)?.x || 0) * zoom +
            camera.x +
            ((boxes.find((box) => box.id === title.id)?.width || 0) * zoom) / 2,
          y:
            (boxes.find((box) => box.id === title.id)?.y || 0) * zoom +
            camera.y +
            ((boxes.find((box) => box.id === title.id)?.height || 0) * zoom) / 2,
        },
        badge: undefined as number | undefined,
      })),
      ...ordered.map((route, index) => ({
        id: route.id,
        owner: route.id,
        title: false,
        text: undefined,
        width: badges ? (shortTitles ? 18 : 22) : zoom < 0.5 ? 112 : 190,
        height: badges ? (shortTitles ? 18 : 22) : 58,
        ideal: {
          x: (route.label ? route.label.x + route.label.width / 2 : route.labelPoint.x) * zoom + camera.x,
          y: (route.label ? route.label.y + route.label.height / 2 : route.labelPoint.y) * zoom + camera.y,
        },
        anchor: { x: route.labelPoint.x * zoom + camera.x, y: route.labelPoint.y * zoom + camera.y },
        badge: badges ? index + 1 : undefined,
      })),
    ];
    for (const request of requests) {
      const { width, height, ideal } = request;
      const obstacles = [
        ...(options.obstacles || []),
        ...placed,
        ...bodies.filter((box) => !request.title || box.id !== request.owner),
        ...wires.filter((wire) => request.title || wire.id !== request.id),
      ];
      const fits = (p: FlowRectangle) =>
        p.x >= bounds.left &&
        p.y >= bounds.top &&
        p.x + width <= bounds.right &&
        p.y + height <= bounds.bottom &&
        !obstacles.some((other) => flowRectanglesOverlap(p, other));
      const at = (x: number, y: number) => ({
        x: Math.max(bounds.left, Math.min(bounds.right - width, x - width / 2)),
        y: Math.max(bounds.top, Math.min(bounds.bottom - height, y - height / 2)),
        width,
        height,
      });
      const candidates: FlowRectangle[] = [];
      for (const center of [ideal, request.anchor])
        for (let ring = 0; ring <= 3; ring++)
          for (const [dx, dy] of [
            [0, -ring],
            [0, ring],
            [-ring, 0],
            [ring, 0],
            [-ring, -ring],
            [ring, ring],
            [-ring, ring],
            [ring, -ring],
          ])
            candidates.push(at(center.x + dx * (width + 6), center.y + dy * (height + 6)));
      let chosen = candidates.find(fits);
      if (!chosen) {
        const step = shortTitles ? 2 : 6;
        for (let y = bounds.top; y + height <= bounds.bottom; y += step)
          for (let x = bounds.left; x + width <= bounds.right; x += step) candidates.push({ x, y, width, height });
        const distance = (p: FlowRectangle) =>
          Math.abs(p.x + width / 2 - ideal.x) + Math.abs(p.y + height / 2 - ideal.y);
        candidates.sort((a, b) => distance(a) - distance(b) || a.y - b.y || a.x - b.x);
        chosen = candidates.find(fits);
      }
      if (!chosen) continue;
      placed.push(chosen);
      (request.title ? titles : captions).set(request.id, {
        ...chosen,
        x: chosen.x - camera.x,
        y: chosen.y - camera.y,
        anchor: { x: request.anchor.x - camera.x, y: request.anchor.y - camera.y },
        compact: zoom < 0.5,
        badge: request.badge,
        text: request.text,
      });
    }
    return {
      captions,
      titles,
      shortTitles,
      complete: captions.size === ordered.length && titles.size === (options.titles?.length || 0),
    };
  };
  for (const [badges, shortTitles] of [
    [false, false],
    [true, false],
    [true, true],
  ]) {
    const result = attempt(badges, shortTitles);
    if (result.complete || shortTitles) return result;
  }
  throw new Error('Placement des annotations indisponible.');
}
