import { bypassPorts } from '../src/flowMapPorts.ts';
import type { FlowMapBox, FlowMapExchange, FlowMapLayout } from '../src/flowMapLayout.ts';
import { betterFlowScore, flowQualityScore, flowRoutingQuality } from '../src/flowMapQuality.ts';
import {
  type FlowPortChoices,
  type FlowRoutedExchange,
  type FlowRoutingInput,
  routeFlowExchanges,
} from './legacyFlowRouting.ts';
import { flowConnections, spaceFlowMap } from '../src/flowMapSpacing.ts';

/** A bounded search, independent of viewport and overlays. No territory is reordered. */
export function optimizeFlowMap(boxes: readonly FlowMapBox[], exchanges: readonly FlowMapExchange[]) {
  const edges = flowConnections(exchanges);
  let best: { boxes: FlowMapBox[]; routes: FlowRoutedExchange[]; score: number[] } | undefined;
  const evaluate = (candidate: FlowMapBox[], ports?: FlowPortChoices) => {
    const byId = new Map(candidate.map((box) => [box.id, box]));
    const inputs = edges.flatMap((edge) => {
      const source = byId.get(edge.sourceId),
        target = byId.get(edge.targetId);
      return source && target ? [{ id: `${edge.sourceId}/${edge.targetId}/${edge.type}`, source, target }] : [];
    });
    const routes = routeFlowExchanges(inputs, candidate, ports);
    const points = [
      ...candidate.flatMap((box) => [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
      ]),
      ...routes.flatMap((route) => route.points),
    ];
    const width = Math.max(...points.map((point) => point.x)) - Math.min(...points.map((point) => point.x));
    const height = Math.max(...points.map((point) => point.y)) - Math.min(...points.map((point) => point.y));
    const displacement = candidate.reduce(
      (sum, box, i) => sum + Math.abs(box.x - boxes[i].x) + Math.abs(box.y - boxes[i].y),
      0,
    );
    const score = flowQualityScore(flowRoutingQuality(routes, candidate, inputs), width * height, displacement);
    if (!best || betterFlowScore(score, best.score)) best = { boxes: candidate, routes, score };
    return inputs;
  };
  const candidates = [1, 1.25, 1.5].map((scale) => spaceFlowMap(boxes, exchanges, scale));
  for (const candidate of candidates) evaluate(candidate);
  // Negotiate faces on the best default spacing and the widest corridor (at most seven candidates).
  const alternatives = [...new Set([best?.boxes, candidates[2]])].filter(
    (candidate): candidate is FlowMapBox[] => !!candidate,
  );
  for (const candidate of alternatives) {
    const byId = new Map(candidate.map((box) => [box.id, box]));
    const inputs = edges.flatMap((edge) => {
      const source = byId.get(edge.sourceId),
        target = byId.get(edge.targetId);
      return source && target ? [{ id: `${edge.sourceId}/${edge.targetId}/${edge.type}`, source, target }] : [];
    });
    const signatures = new Set<string>(['[]']);
    for (const ports of [bypassPorts(inputs, candidate, true), bypassPorts(inputs, candidate, false)]) {
      const signature = JSON.stringify([...ports]);
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      evaluate(candidate, ports);
    }
  }
  return best;
}

export function legacyFlowLayout(seed: FlowMapLayout): FlowMapLayout {
  const best = optimizeFlowMap(seed.boxes, seed.exchanges);
  if (!best) return seed;
  const points = best.routes.flatMap(route => route.points);
  const dx = Math.max(0,32-Math.min(...points.map(p=>p.x),...best.boxes.map(b=>b.x)));
  const dy = Math.max(0,32-Math.min(...points.map(p=>p.y),...best.boxes.map(b=>b.y)));
  const boxes = best.boxes.map(box=>({...box,x:box.x+dx,y:box.y+dy}));
  const routes = best.routes.map(route=>({...route,points:route.points.map(p=>({x:p.x+dx,y:p.y+dy})),labelPoint:{x:route.labelPoint.x+dx,y:route.labelPoint.y+dy},label:route.label?{...route.label,x:route.label.x+dx,y:route.label.y+dy}:undefined}));
  return {...seed,boxes,routes,width:Math.max(...boxes.map(b=>b.x+b.width),...routes.flatMap(r=>r.points.map(p=>p.x)))+168,height:Math.max(...boxes.map(b=>b.y+b.height),...routes.flatMap(r=>r.points.map(p=>p.y)))+168};
}
