import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { SystemDataSharing } from '../dataSharing';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';

type Box = { x: number; y: number; width: number; height: number };
export type ExchangeMarkerAnchor = { exchangeId: string; x: number; y: number };
type Arrow = {
  exchange: SystemDataSharing;
  path: string;
  transform: string;
  x: number;
  y: number;
  lines: string[];
  returning: boolean;
  vertical: boolean;
  markerX: number;
  markerY: number;
};
const linesFor = (label: string, limit: number) => {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const last = lines.length - 1;
    if (last < 0 || lines[last].length + word.length + 1 > limit) lines.push(word);
    else lines[last] += ` ${word}`;
  }
  return lines;
};

// A filled silhouette with a rounded tail, soft shoulders and a broad, unambiguous arrowhead.
const ribbon = (length: number, body: number, head: number, tip: number) => {
  const neck = length - tip;
  const half = body / 2;
  const wing = head / 2;
  return ui('systemDataSharingMap.m_8_h_q_v_q_l_3_q_0_3_l_q_v_q_h_8_q_0_0_v_q_0_8_z', {
    value1: -half,
    value2: neck - 5,
    neck: neck,
    value4: -half,
    neck5: neck,
    value6: -half - 5,
    value7: -wing + 5,
    neck8: neck,
    value9: -wing - 2,
    value10: neck + 6,
    value11: -wing + 3,
    value12: length - 3,
    value13: length + 1,
    value14: length - 3,
    value15: neck + 6,
    value16: wing - 3,
    neck17: neck,
    value18: wing + 2,
    neck19: neck,
    value20: wing - 5,
    value21: half + 5,
    neck22: neck,
    half: half,
    value24: neck - 5,
    half25: half,
    half26: half,
    value27: half - 8,
    value28: -half + 8,
    value29: -half,
    value30: -half,
  });
};

export function SystemDataSharingMap({
  model,
  exchanges,
  markedExchangeIds,
  detail,
  onGeometryChange,
}: {
  model: PublishedModel;
  exchanges: readonly SystemDataSharing[];
  markedExchangeIds: ReadonlySet<string>;
  detail: number;
  onGeometryChange: (anchors: ExchangeMarkerAnchor[]) => void;
}) {
  const paintId = useId().replaceAll(':', '');
  const svg = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState<{ width: number; height: number; arrows: Arrow[] }>({
    width: 0,
    height: 0,
    arrows: [],
  });
  useLayoutEffect(() => {
    onGeometryChange(
      drawing.arrows.map(({ exchange, markerX, markerY }) => ({ exchangeId: exchange.id, x: markerX, y: markerY })),
    );
  }, [drawing, onGeometryChange]);
  // Detail changes the cards' natural height; arrows follow measured boxes at every framing scale.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Detail changes the measured DOM before painting.
  useLayoutEffect(() => {
    const grid = svg.current?.parentElement;
    if (!grid || !exchanges.length) return;
    const measure = () => {
      const boxes = new Map<string, Box>();
      for (const article of grid.querySelectorAll<HTMLElement>('.overview-system')) {
        boxes.set(article.dataset.nodeId || '', {
          x: article.offsetLeft,
          y: article.offsetTop,
          width: article.offsetWidth,
          height: article.offsetHeight,
        });
      }
      const arrows: Arrow[] = [];
      const lanes: { left: number; right: number }[][] = [];
      for (const exchange of exchanges) {
        const source = boxes.get(exchange.sourceId);
        const target = boxes.get(exchange.targetId);
        if (!source || !target) continue;
        const marked = markedExchangeIds.has(exchange.id);
        if (Math.abs(source.x - target.x) < 1) {
          const down = source.y < target.y;
          const x = source.x + source.width * (down ? 0.28 : 0.72);
          const start = down ? source.y + source.height - 96 : source.y + 96;
          const end = down ? target.y + 96 : target.y + target.height - 96;
          const length = Math.abs(end - start);
          const lines = linesFor(exchange.label, 12);
          arrows.push({
            exchange,
            path: ribbon(length, 88, 136, 56),
            transform: ui('systemDataSharingMap.translate_rotate', { x: x, start: start, value3: down ? 90 : -90 }),
            x,
            y: start + (down ? 1 : -1) * (length - 56) * (marked ? 0.82 : 0.5) + 4 - ((lines.length - 1) * 16) / 2,
            lines,
            returning: !down,
            vertical: true,
            markerX: x,
            markerY: start + (down ? 1 : -1) * (length - 56) * 0.5,
          });
        } else {
          const right = source.x < target.x;
          const startX = right ? source.x + source.width - 160 : source.x + 160;
          const endX = right ? target.x + 160 : target.x + target.width - 160;
          const extent = { left: Math.min(startX, endX) - 4, right: Math.max(startX, endX) + 4 };
          let lane = lanes.findIndex((items) =>
            items.every((item) => extent.right < item.left || extent.left > item.right),
          );
          if (lane < 0) lane = lanes.length;
          lanes[lane] ||= [];
          lanes[lane].push(extent);
          const y = Math.max(source.y, target.y) + 8 + lane * 76;
          const length = Math.abs(endX - startX);
          const lines = linesFor(exchange.label, marked ? Math.max(8, Math.floor(((length - 42) / 2 - 52) / 7)) : 30);
          arrows.push({
            exchange,
            path: ribbon(length, 44, 68, 42),
            transform: ui('systemDataSharingMap.translate_rotate_2', { startX: startX, y: y, value3: right ? 0 : 180 }),
            x: startX + (right ? 1 : -1) * (length - 42) * (marked ? 0.25 : 0.5),
            y: y + 5 - ((lines.length - 1) * 16) / 2,
            lines,
            returning: !right,
            vertical: false,
            markerX: startX + (right ? 1 : -1) * (length - 42) * 0.5,
            markerY: y,
          });
        }
      }
      const next = { width: grid.clientWidth, height: grid.offsetHeight, arrows };
      setDrawing((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    for (const card of grid.querySelectorAll('.overview-system')) observer.observe(card);
    measure();
    return () => observer.disconnect();
  }, [exchanges, markedExchangeIds, detail]);
  if (!exchanges.length) return null;
  return (
    <svg
      ref={svg}
      className="system-data-sharing-map"
      width={drawing.width}
      height={drawing.height}
      role="img"
      aria-label={ui('systemDataSharingMap.partages_de_donnees_orientes_entre_systemes_metier')}
    >
      <title>{ui('systemDataSharingMap.partages_de_donnees_metier_sens_et_contenus_issus_de_la_publicati')}</title>
      <defs>
        <linearGradient id={`${paintId}-forward`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--exchange-forward-start)" />
          <stop offset="100%" stopColor="var(--exchange-forward-end)" />
        </linearGradient>
        <linearGradient id={`${paintId}-return`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--exchange-return-start)" />
          <stop offset="100%" stopColor="var(--exchange-return-end)" />
        </linearGradient>
        <filter id={`${paintId}-shadow`} x="-30%" y="-50%" width="160%" height="200%" colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="var(--exchange-shadow)"
            floodOpacity="var(--exchange-shadow-opacity)"
          />
        </filter>
      </defs>
      {drawing.arrows.map(({ exchange, path, transform, x, y, lines, returning, vertical }) => (
        <g
          key={exchange.id}
          data-sharing-ids={exchange.relations.map((relation) => relation.id).join('|')}
          data-sharing-source={exchange.sourceId}
          data-sharing-target={exchange.targetId}
        >
          <title>{`${model.nodeById.get(exchange.sourceId)?.name} → ${model.nodeById.get(exchange.targetId)?.name} : ${exchange.label}${exchange.detailLabel !== exchange.label ? ` — ${exchange.detailLabel}` : ''}`}</title>
          <g filter={`url(#${paintId}-shadow)`}>
            <path
              className="data-sharing-ribbon"
              d={path}
              transform={transform}
              fill={`url(#${paintId}-${returning ? 'return' : 'forward'})`}
            />
          </g>
          <text x={x} y={y} textAnchor="middle" className={vertical ? 'data-sharing-vertical-label' : undefined}>
            {lines.map((line, index) => (
              <tspan key={line} x={x} dy={index ? 16 : 0}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}
    </svg>
  );
}
