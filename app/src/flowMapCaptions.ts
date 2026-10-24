import type { FlowMapBox } from './flowMapLayout.ts';
import { type FlowRoutedExchange, flowScreenStroke } from './flowMapRouting.ts';
import { ui } from './ui.ts';

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
    captionSizes?: ReadonlyMap<string, { width: number; height: number }>;
    overview?: boolean;
  } = {},
) {
  const camera = options.camera || { x: 0, y: 0 };
  const wirePadding = Math.max(1, flowScreenStroke(zoom) / 2);
  const titleGap = size.height < 220 ? 64 : 32;
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
        terminalOwners: [...(i === 0 ? [before] : []), ...(i === route.points.length - 2 ? [p] : [])].flatMap((point) =>
          boxes
            .filter(
              (box) =>
                point.x >= box.x - 0.01 &&
                point.x <= box.x + box.width + 0.01 &&
                point.y >= box.y - 0.01 &&
                point.y <= box.y + box.height + 0.01,
            )
            .map((box) => box.id),
        ),
        x: Math.min(p.x, before.x) * zoom + camera.x - wirePadding,
        y: Math.min(p.y, before.y) * zoom + camera.y - wirePadding,
        width: Math.abs(p.x - before.x) * zoom + wirePadding * 2,
        height: Math.abs(p.y - before.y) * zoom + wirePadding * 2,
      };
    }),
  );
  const ordered = [...routes].filter((route) => route.points.length).sort((a, b) => a.id.localeCompare(b.id));
  const attempt = (badges: boolean, shortTitles: boolean) => {
    const placed: FlowRectangle[] = [];
    const captions = new Map<string, FlowCaption>(),
      titles = new Map<string, FlowCaption>();
    const requests = [
      ...[...(options.titles || [])]
        .sort((a, b) => {
          const distance = (title: FlowTitleRequest) => {
            const body = bodies.find((item) => item.id === title.id);
            return body
              ? Math.hypot(body.x + body.width / 2 - size.width / 2, body.y + body.height / 2 - size.height / 2)
              : 0;
          };
          return distance(a) - distance(b) || a.id.localeCompare(b.id);
        })
        .map((title) => ({
          id: title.id,
          owner: title.id,
          title: true,
          text: shortTitles ? title.shortText : title.text,
          width: shortTitles ? Math.max(24, title.shortText.length * 8 + 8) : title.width,
          height: shortTitles ? 18 : title.height,
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
        width: badges ? (shortTitles ? 16 : 22) : (options.captionSizes?.get(route.id)?.width ?? 190),
        height: badges ? (shortTitles ? 16 : 22) : (options.captionSizes?.get(route.id)?.height ?? 58),
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
      ];
      const wireObstacles = wires.filter((wire) =>
        request.title ? !wire.terminalOwners.includes(request.owner) : wire.id !== request.id,
      );
      const owner = bodies.find((body) => body.id === request.owner);
      // Routed paths stop at the territory boundary. Their padded hit boxes must
      // not push a short title out of its own protected interior.
      const insideOwner = (p: FlowRectangle) =>
        request.title &&
        owner &&
        p.x >= owner.x &&
        p.y >= owner.y &&
        p.x + width <= owner.x + owner.width &&
        p.y + height <= owner.y + owner.height;
      const localTitle = (p: FlowRectangle) =>
        !request.title ||
        !owner ||
        (Math.max(owner.x - p.x - width, p.x - owner.x - owner.width, 0) <= titleGap &&
          Math.max(owner.y - p.y - height, p.y - owner.y - owner.height, 0) <= titleGap);
      const fits = (p: FlowRectangle) =>
        p.x >= bounds.left &&
        p.y >= bounds.top &&
        p.x + width <= bounds.right &&
        p.y + height <= bounds.bottom &&
        localTitle(p) &&
        !obstacles.some((other) => flowRectanglesOverlap(p, other)) &&
        (insideOwner(p) || !wireObstacles.some((other) => flowRectanglesOverlap(p, other)));
      const at = (x: number, y: number) => ({
        x: Math.max(bounds.left, Math.min(bounds.right - width, x - width / 2)),
        y: Math.max(bounds.top, Math.min(bounds.bottom - height, y - height / 2)),
        width,
        height,
      });
      const candidates: FlowRectangle[] = [];
      if (request.title && owner) candidates.push(at(owner.x + owner.width / 2, owner.y + owner.height / 2));
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
  throw new Error(ui('flowMapCaptions.placement_des_annotations_indisponible'));
}
