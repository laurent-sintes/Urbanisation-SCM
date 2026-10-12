import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { SystemDataSharing } from '../dataSharing';
import type { PublishedModel } from '../types';
import { ModelText } from './ModelLinks';

type Box = { x: number; y: number; width: number; height: number };
type Arrow = {
  exchange: SystemDataSharing;
  path: string;
  transform: string;
  x: number;
  y: number;
  lines: string[];
  returning: boolean;
  vertical: boolean;
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
  return `M 8 ${-half}
    H ${neck - 5} Q ${neck} ${-half} ${neck} ${-half - 5}
    V ${-wing + 5} Q ${neck} ${-wing - 2} ${neck + 6} ${-wing + 3}
    L ${length - 3} -3 Q ${length + 1} 0 ${length - 3} 3
    L ${neck + 6} ${wing - 3} Q ${neck} ${wing + 2} ${neck} ${wing - 5}
    V ${half + 5} Q ${neck} ${half} ${neck - 5} ${half}
    H 8 Q 0 ${half} 0 ${half - 8}
    V ${-half + 8} Q 0 ${-half} 8 ${-half} Z`;
};

export function SystemDataSharingMap({
  model,
  exchanges,
  detail,
  onGeometryChange,
}: {
  model: PublishedModel;
  exchanges: readonly SystemDataSharing[];
  detail: number;
  onGeometryChange: () => void;
}) {
  const paintId = useId().replaceAll(':', '');
  const svg = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState<{ width: number; height: number; arrows: Arrow[] }>({
    width: 0,
    height: 0,
    arrows: [],
  });
  useLayoutEffect(() => {
    if (drawing.arrows.length) onGeometryChange();
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
            transform: `translate(${x} ${start}) rotate(${down ? 90 : -90})`,
            x,
            y: start + (down ? 1 : -1) * ((length - 56) / 2) + 4 - ((lines.length - 1) * 16) / 2,
            lines,
            returning: !down,
            vertical: true,
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
          const lines = linesFor(exchange.label, 30);
          arrows.push({
            exchange,
            path: ribbon(length, 44, 68, 42),
            transform: `translate(${startX} ${y}) rotate(${right ? 0 : 180})`,
            x: startX + (right ? 1 : -1) * ((length - 42) / 2),
            y: y + 5 - ((lines.length - 1) * 16) / 2,
            lines,
            returning: !right,
            vertical: false,
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
  }, [exchanges, detail]);
  if (!exchanges.length) return null;
  return (
    <svg
      ref={svg}
      className="system-data-sharing-map"
      width={drawing.width}
      height={drawing.height}
      role="img"
      aria-label="Partages de données orientés entre systèmes métier"
    >
      <title>Partages de données métier — sens et contenus issus de la publication consultée</title>
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

export function SystemDataSharingDetails({
  model,
  exchanges,
}: {
  model: PublishedModel;
  exchanges: readonly SystemDataSharing[];
}) {
  if (!exchanges.length) return null;
  return (
    <details className="system-data-sharing-details">
      <summary>{exchanges.length} partages de données · voir les contenus et leurs frontières</summary>
      <ul>
        {exchanges.flatMap((exchange) =>
          exchange.relations.map((relation) => (
            <li key={relation.id} data-sharing-detail={relation.id}>
              <strong>
                {model.nodeById.get(relation.sourceId)?.name} → {model.nodeById.get(relation.targetId)?.name} :{' '}
                {relation.label}
              </strong>
              {relation.dataExchange?.contents.map((content) => (
                <p key={content.name}>
                  <ModelText text={content.description} />
                </p>
              ))}
              <p>{relation.dataExchange?.purpose}</p>
              {relation.qualification.conditions?.map((condition) => (
                <p key={condition}>
                  <ModelText text={condition} />
                </p>
              ))}
              <p>{relation.qualification.scope}</p>
            </li>
          )),
        )}
      </ul>
    </details>
  );
}
