import { MiniMap, type Node, type NodeProps, ReactFlow, type ReactFlowInstance, type Viewport } from '@xyflow/react';
import {
  ArrowRight,
  Focus,
  Maximize2,
  Minimize2,
  Minus,
  Move,
  MoveHorizontal,
  Plus,
  Route,
  Ruler,
  Scan,
  X,
} from 'lucide-react';
import { type CSSProperties, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { productFor, projectedApplicationMapIds, selectionMappings } from '../applicationCatalog';
import { flowExchangeContract, flowMapBoundaryRelations, flowMapDetailBoxes } from '../flowMapDetail';
import { buildFlowMap, type FlowMapBox } from '../flowMapLayout';
import { flowRibbonPath, roundedFlowPath, routeFlowExchange } from '../flowMapRouting';
import {
  flowRouteInViewport,
  flowTargetFocus,
  placeFlowExchangeLabel,
  resizeFlowCamera,
  standardFlowCamera,
  visibleFlowHotspotAnchor,
} from '../flowMapViewport';
import { filterMapHotspots, hotspotsInScope } from '../hotspotMap';
import { layoutHotspots } from '../hotspotPlacement';
import { visibleAncestorId } from '../model';
import { kindLabel } from '../presentation';
import type { AtlasRelation, PublishedModel } from '../types';
import { COMPACT_HOTSPOT_DIAMETER, COMPACT_HOTSPOT_TOUCH_DIAMETER, HotspotMapMarker } from './HotspotDisplay';
import { MapApplicationPicker } from './MapApplicationPicker';
import { MapHotspotPicker } from './MapHotspotPicker';
import type { MapPanelProps } from './MapPanel';
import { MetaTypeLabel, ModelText, ReferenceLink } from './ModelLinks';
import '@xyflow/react/dist/style.css';
import './flow-map.css';

// Each view keeps its camera across tabs. This is UI state, never publication data.
const cameras = new Map<string, Viewport>();
const cameraSizes = new Map<string, { width: number; height: number }>();
const cameraSelections = new Map<string, string>();
const arrowChoices = new Map<string, boolean>();
type FlowFraming = 'standard' | 'width' | 'all' | 'custom';
const cameraFramings = new Map<string, FlowFraming>();
const motionDuration = (duration: number) => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration);
type SpatialNode = Node<
  {
    box: FlowMapBox;
    zoom: number;
    expanded: boolean;
    active: boolean;
    application: boolean;
    applicationName?: string;
    headerHeight: number;
    onSelect: (id: string) => void;
    onCenter: (id: string) => void;
  },
  'spatial'
>;

function SpatialObject({ data }: NodeProps<SpatialNode>) {
  const { box, zoom, expanded, active, application } = data;
  const screenWidth = box.width * zoom;
  const screenHeight = box.height * zoom;
  const header = expanded ? data.headerHeight * zoom : screenHeight;
  const lines =
    box.node.kind === 'business_area'
      ? box.height >= 72
        ? 3
        : 2
      : expanded
        ? header >= 26
          ? 2
          : 1
        : header >= 64
          ? 3
          : 2;
  const padding = Math.min(box.node.kind === 'business_area' ? 8 : 10, header * 0.14, Math.max(1, (header - 25) / 2));
  const longestWord = Math.max(...box.node.name.split(/\s+/).map((word) => word.length));
  const labelSize = Math.max(
    10,
    Math.min(
      box.node.kind === 'business_area' ? 14 : box.depth === 0 ? 20 : 17,
      (screenWidth - padding * 2) / Math.max(6, longestWord * 0.54),
      (header - padding * 2) / (lines * 1.25),
    ),
  );
  const titleHeight = Math.min(header, labelSize * 1.25 * lines + padding * 2);
  return (
    <div
      className={`spatial-map-object kind-${box.node.kind}${expanded ? ' is-expanded' : ' is-collapsed'}${active ? ' is-active' : ''}${application ? ' spatial-application-mark' : ''}`}
      data-node-id={box.id}
      data-world-x={box.x}
      data-world-y={box.y}
      data-world-width={box.width}
      data-world-height={box.height}
      style={{ '--spatial-border': `${1 / zoom}px`, '--spatial-unit': `${1 / zoom}px` } as CSSProperties}
    >
      <button
        type="button"
        className="spatial-object-title nodrag"
        aria-pressed={active}
        aria-label={`Sélectionner ${box.node.name}`}
        onClick={() => data.onSelect(box.id)}
        onDoubleClick={() => data.onCenter(box.id)}
        title={`${box.node.name} · ${kindLabel(box.node)} · Double-cliquer pour centrer`}
        style={{
          fontSize: labelSize / zoom,
          padding: `${padding / zoom}px ${Math.min(12, screenWidth * 0.07) / zoom}px`,
          maxHeight: titleHeight / zoom,
          WebkitLineClamp: lines,
        }}
      >
        {box.node.name}
      </button>
      {application && data.applicationName && screenWidth >= 135 && screenHeight >= 32 && (
        <span className="spatial-application-badge" style={{ fontSize: 10 / zoom }}>
          {data.applicationName}
        </span>
      )}
    </div>
  );
}
const nodeTypes = { spatial: SpatialObject };
interface ExchangeGroup {
  id: string;
  source: FlowMapBox;
  target: FlowMapBox;
  type: string;
  relations: AtlasRelation[];
  label: string;
  caption: string;
}
const exchangeLabel = (relation: AtlasRelation) =>
  relation.label === relation.type
    ? relation.type === 'shares-data'
      ? 'Partage de données'
      : 'Apport de connaissance'
    : relation.label;

function projectedExchanges(model: PublishedModel, relations: readonly AtlasRelation[], boxes: FlowMapBox[]) {
  const byId = new Map(boxes.map((box) => [box.id, box]));
  const visible = new Set(byId.keys());
  const groups = new Map<string, ExchangeGroup>();
  for (const relation of relations) {
    const source = byId.get(visibleAncestorId(model, relation.sourceId, visible) || '');
    const target = byId.get(visibleAncestorId(model, relation.targetId, visible) || '');
    if (!source || !target || source.id === target.id) continue;
    // A relation carried by a perimeter does not imply a relation with all its children.
    const id = `${source.id}/${target.id}/${relation.type}`;
    const previous = groups.get(id);
    if (previous) previous.relations.push(relation);
    else
      groups.set(id, {
        id,
        source,
        target,
        type: relation.type,
        relations: [relation],
        label: exchangeLabel(relation),
        caption: exchangeLabel(relation),
      });
  }
  for (const group of groups.values()) {
    const summary = group.relations.find(
      (relation) =>
        relation.sourceId === group.source.id && relation.targetId === group.target.id && relation.fields.summary_label,
    )?.fields.summary_label;
    const labels = [...new Set(group.relations.map(exchangeLabel))];
    group.label = typeof summary === 'string' ? summary : labels.join(' · ');
    group.caption =
      typeof summary === 'string'
        ? summary
        : `${labels.slice(0, 2).join(' · ')}${labels.length > 2 ? ` · +${labels.length - 2}` : ''}`;
  }
  return [...groups.values()];
}

/** Camera changes reveal detail inside fixed boxes; they never run a new layout. */
export function FlowMapPanel(props: MapPanelProps) {
  const {
    model,
    scope,
    scopeId,
    selectedId,
    rootName,
    hotspotFilters,
    onHotspotFiltersChange,
    onOpenHotspot,
    applicationSelectionId,
    applicationComponentId,
    onApplicationChange,
    onSelect,
    onOpenScope,
    onAnnouncement,
  } = props;
  const panel = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const instance = useRef<ReactFlowInstance<SpatialNode> | null>(null);
  const lastCanvasSize = useRef<{ width: number; height: number } | null>(null);
  const key = `${model.version}/${scopeId || '@root'}`;
  const lastSelection = useRef(selectedId);
  lastSelection.current = selectedId;
  const [viewport, setViewport] = useState<Viewport>(() => cameras.get(key) || { x: 0, y: 0, zoom: 0.5 });
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [framing, setFraming] = useState<FlowFraming>(() => cameraFramings.get(key) || 'standard');
  const [expanded, setExpanded] = useState(false);
  const [shortScreen, setShortScreen] = useState(() => matchMedia('(max-height: 500px)').matches);
  const [coarsePointer, setCoarsePointer] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [arrows, setArrows] = useState(() => arrowChoices.get(key) ?? true);
  const [openedExchange, setOpenedExchange] = useState<{ key: string; exchange: ExchangeGroup } | null>(null);
  const [hoveredExchangeId, setHoveredExchangeId] = useState('');
  const [selectedHotspotId, setSelectedHotspotId] = useState('');
  const exchangeTrigger = useRef<{ element: HTMLElement | SVGElement; relationIds: string[] } | null>(null);
  const paintId = useId().replaceAll(':', '');
  const layout = useMemo(() => buildFlowMap(model, scopeId), [model, scopeId]);
  const boundaryRelations = useMemo(() => flowMapBoundaryRelations(model, scopeId), [model, scopeId]);
  const allIds = useMemo(() => new Set(layout.boxes.map((box) => box.id)), [layout]);
  const selectedBoxId = visibleAncestorId(model, selectedId, allIds);
  const byId = useMemo(() => new Map(layout.boxes.map((box) => [box.id, box])), [layout]);
  const scopedHotspots = useMemo(() => hotspotsInScope(model, scopeId), [model, scopeId]);
  const hotspots = useMemo(() => filterMapHotspots(scopedHotspots, hotspotFilters), [scopedHotspots, hotspotFilters]);
  const visibleKey = useMemo(() => {
    const ids = new Set<string>();
    return layout.boxes
      .filter((box) => {
        const show =
          !box.parentId ||
          (ids.has(box.parentId) &&
            box.width * viewport.zoom >= 120 &&
            box.height * viewport.zoom >= 32 &&
            (byId.get(box.parentId)?.headerHeight || 80) * viewport.zoom >= 30);
        if (show) ids.add(box.id);
        return show;
      })
      .map((box) => box.id)
      .join('|');
  }, [layout, viewport.zoom, byId]);
  const visibleBoxes = useMemo(() => {
    const ids = new Set(visibleKey.split('|'));
    return layout.boxes.filter((box) => ids.has(box.id));
  }, [layout, visibleKey]);
  const visibleIds = useMemo(() => new Set(visibleBoxes.map((box) => box.id)), [visibleBoxes]);
  const flowBoxes = useMemo(
    () => flowMapDetailBoxes(layout.boxes, viewport.zoom).filter((box) => visibleIds.has(box.id)),
    [layout, viewport.zoom, visibleIds],
  );
  const anchorIds = useMemo(() => new Set(flowBoxes.map((box) => box.id)), [flowBoxes]);
  const flowExpandedIds = useMemo(() => new Set(flowBoxes.map((box) => box.parentId)), [flowBoxes]);
  const displayedSelectionId = visibleAncestorId(model, selectedId, anchorIds);
  const expandedIds = useMemo(() => new Set(visibleBoxes.map((box) => box.parentId)), [visibleBoxes]);
  const catalog = model.raw.application_catalog;
  const mappings = useMemo(
    () => selectionMappings(catalog, applicationSelectionId, applicationComponentId),
    [catalog, applicationSelectionId, applicationComponentId],
  );
  const appIds = useMemo(() => projectedApplicationMapIds(model, mappings, anchorIds), [model, mappings, anchorIds]);
  const applicationBoxIds = useMemo(
    () => projectedApplicationMapIds(model, mappings, allIds),
    [model, mappings, allIds],
  );
  const applicationAtScope = mappings.some((mapping) => mapping.node_id === scopeId);
  const selection = catalog?.selections.find((item) => item.id === applicationSelectionId);
  const product =
    selection && catalog
      ? productFor(catalog, selection)
      : catalog?.products.find((item) => item.id === applicationSelectionId);
  const exchanges = useMemo(
    () =>
      projectedExchanges(
        model,
        layout.exchanges.flatMap((exchange) => exchange.relations),
        flowBoxes,
      ),
    [model, layout, flowBoxes],
  );
  // A selected exchange keeps its published relations when semantic zoom changes their visible projection.
  const selectedExchange = openedExchange?.key === key ? openedExchange.exchange : undefined;
  const selectedRelationIds = useMemo(
    () => new Set(selectedExchange?.relations.map((relation) => relation.id) || []),
    [selectedExchange],
  );
  const closeExchange = useCallback(() => {
    setOpenedExchange(null);
    const origin = exchangeTrigger.current;
    exchangeTrigger.current = null;
    if (!origin) return;
    requestAnimationFrame(() => {
      const replacement = [
        ...(canvas.current?.querySelectorAll<HTMLElement | SVGElement>(
          '.flow-exchange-label, .flow-exchange-hit[tabindex="0"]',
        ) || []),
      ].find((element) =>
        origin.relationIds.some((id) =>
          element.closest('[data-relation-ids]')?.getAttribute('data-relation-ids')?.split('|').includes(id),
        ),
      );
      const target = origin.element.isConnected
        ? origin.element
        : replacement || canvas.current?.querySelector<HTMLElement>('.flow-camera-tools button');
      target?.focus({ preventScroll: true });
    });
  }, []);
  const toggleExchange = (exchange: ExchangeGroup, element: HTMLElement | SVGElement) => {
    if (exchange.relations.some((relation) => selectedRelationIds.has(relation.id))) closeExchange();
    else {
      exchangeTrigger.current = { element, relationIds: exchange.relations.map((relation) => relation.id) };
      setOpenedExchange({ key, exchange });
    }
  };

  const rememberFraming = useCallback(
    (choice: FlowFraming) => {
      setFraming(choice);
      cameraFramings.set(key, choice);
    },
    [key],
  );
  const standard = useCallback(
    (duration = 250) => {
      const bounds = canvas.current ? { width: canvas.current.clientWidth, height: canvas.current.clientHeight } : size;
      rememberFraming('standard');
      void instance.current?.setViewport(standardFlowCamera(layout.boxes, bounds, scopeId), {
        duration: motionDuration(duration),
      });
    },
    [layout.boxes, scopeId, size, rememberFraming],
  );
  const fitWidth = useCallback(() => {
    if (!layout.width) return;
    const width = canvas.current?.clientWidth || size.width;
    const zoom = Math.min(2.5, Math.max(0.003, (width - 64) / layout.width));
    rememberFraming('width');
    void instance.current?.setViewport(
      { x: (width - layout.width * zoom) / 2, y: 24 - Math.min(...layout.boxes.map((box) => box.y)) * zoom, zoom },
      { duration: motionDuration(250) },
    );
  }, [layout, size.width, rememberFraming]);

  const center = useCallback(
    (id: string, duration = 250) => {
      const box = byId.get(visibleAncestorId(model, id, allIds) || '');
      if (!box) return;
      const available = canvas.current
        ? { width: canvas.current.clientWidth, height: canvas.current.clientHeight }
        : size;
      const target = flowTargetFocus(box, available);
      rememberFraming('custom');
      void instance.current?.setCenter(target.x, target.y, { zoom: target.zoom, duration: motionDuration(duration) });
    },
    [byId, model, allIds, size, rememberFraming],
  );
  const overview = useCallback(() => {
    rememberFraming('all');
    void instance.current?.fitBounds(
      { x: 0, y: 0, width: layout.width, height: layout.height },
      { padding: 0.08, duration: motionDuration(250) },
    );
  }, [layout, rememberFraming]);
  const centerApplication = useCallback(() => {
    const boxes = [...applicationBoxIds].flatMap((id) => byId.get(id) || []);
    if (!boxes.length) {
      if (applicationAtScope) overview();
      return;
    }
    const x = Math.min(...boxes.map((box) => box.x));
    rememberFraming('custom');
    const y = Math.min(...boxes.map((box) => box.y));
    const right = Math.max(...boxes.map((box) => box.x + box.width));
    const bottom = Math.max(...boxes.map((box) => box.y + box.height));
    void instance.current?.fitBounds(
      { x, y, width: right - x, height: bottom - y },
      { padding: 0.15, duration: motionDuration(250) },
    );
  }, [applicationBoxIds, byId, applicationAtScope, overview, rememberFraming]);
  useEffect(() => setFraming(cameraFramings.get(key) || 'standard'), [key]);
  useEffect(() => {
    return () => {
      cameraSelections.set(key, lastSelection.current);
    };
  }, [key]);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const observer = new ResizeObserver(() => {
      const next = { width: target.clientWidth, height: target.clientHeight };
      const previous = lastCanvasSize.current;
      if (previous && instance.current && (previous.width !== next.width || previous.height !== next.height))
        void instance.current.setViewport(resizeFlowCamera(instance.current.getViewport(), previous, next), {
          duration: 0,
        });
      lastCanvasSize.current = next;
      setSize(next);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const changed = () => setExpanded(document.fullscreenElement === panel.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    const media = matchMedia('(max-height: 500px)');
    const changed = () => setShortScreen(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    const media = matchMedia('(pointer: coarse)');
    const changed = () => setCoarsePointer(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  const nodes: SpatialNode[] = useMemo(
    () =>
      visibleBoxes.map((box) => ({
        id: box.id,
        type: 'spatial',
        position: { x: box.x, y: box.y },
        width: box.width,
        height: box.height,
        style: { width: box.width, height: box.height },
        zIndex: box.depth,
        data: {
          box,
          zoom: viewport.zoom,
          expanded: expandedIds.has(box.id),
          active: displayedSelectionId === box.id,
          application: appIds.has(box.id),
          applicationName: product?.name,
          headerHeight: box.headerHeight,
          onSelect,
          onCenter: center,
        },
      })),
    [visibleBoxes, viewport.zoom, expandedIds, displayedSelectionId, appIds, product?.name, onSelect, center],
  );
  const [markerObstacles, setMarkerObstacles] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Camera, canvas and semantic detail change the measured text positions.
  useLayoutEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const measure = () => {
      const bounds = surface.getBoundingClientRect();
      const obstacles: typeof markerObstacles = [];
      const add = (rect: DOMRect) => {
        const x = Math.max(0, rect.left - bounds.left);
        const y = Math.max(0, rect.top - bounds.top);
        const right = Math.min(bounds.width, rect.right - bounds.left);
        const bottom = Math.min(bounds.height, rect.bottom - bounds.top);
        if (right > x && bottom > y) obstacles.push({ x, y, width: right - x, height: bottom - y });
      };
      for (const element of surface.querySelectorAll('.spatial-object-title, .spatial-application-badge')) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = [...range.getClientRects()];
        if (element instanceof HTMLButtonElement) {
          const button = element.getBoundingClientRect();
          const owner = element.closest('.spatial-map-object')?.getBoundingClientRect() || button;
          const left = Math.max(0, bounds.left, button.left, owner.left);
          const top = Math.max(0, bounds.top, button.top, owner.top);
          const right = Math.min(innerWidth, bounds.right, button.right, owner.right);
          const bottom = Math.min(innerHeight, bounds.bottom, button.bottom, owner.bottom);
          const visible = rects.some(
            (rect) =>
              Math.min(rect.right, right) - Math.max(rect.left, left) >= Math.min(12, rect.width) &&
              Math.min(rect.bottom, bottom) - Math.max(rect.top, top) >= Math.min(8, rect.height),
          );
          element.tabIndex = visible ? 0 : -1;
          if (!visible && document.activeElement === element) surface.focus({ preventScroll: true });
        }
        for (const rect of rects) add(rect);
      }
      for (const element of surface.querySelectorAll('.flow-camera-tools, .react-flow__minimap, .flow-map-note'))
        add(element.getBoundingClientRect());
      setMarkerObstacles((previous) => (JSON.stringify(previous) === JSON.stringify(obstacles) ? previous : obstacles));
    };
    // React Flow commits its internal nodes after this component; measure their actual rendered text.
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(surface.querySelector('.react-flow') || surface, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [viewport, size, visibleKey, product?.id, arrows]);
  const markerGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const hotspot of hotspots) {
      const anchors = [
        ...new Set(hotspot.location.node_ids.map((id) => visibleAncestorId(model, id, anchorIds)).filter(Boolean)),
      ];
      // A transversal subject is attached to the scope, without inventing a child location.
      if (
        !anchors.length &&
        hotspot.location.node_ids.includes(scopeId || model.nodes.find((node) => node.kind === 'universe')?.id || '')
      )
        anchors.push('@scope');
      for (const anchor of anchors) {
        const ids = groups.get(anchor || '') || new Set<string>();
        ids.add(hotspot.id);
        groups.set(anchor || '', ids);
      }
    }
    const entries = [...groups].flatMap(([id, ids]) => {
      const box = byId.get(id);
      const anchor = box ? visibleFlowHotspotAnchor(box, viewport, size) : { x: 30, y: 30 };
      if (!anchor) return [];
      const { x, y } = anchor;
      const items = hotspots.filter((hotspot) => ids.has(hotspot.id));
      return [{ id, x, y, diameter: coarsePointer ? COMPACT_HOTSPOT_TOUCH_DIAMETER : COMPACT_HOTSPOT_DIAMETER, items }];
    });
    if (size.width < 60 || size.height < 60) return [];
    return layoutHotspots(entries, { ...size, obstacles: markerObstacles }).map((group) => ({
      ...group,
      items: [
        ...new Map(
          entries
            .filter((entry) => group.ids.includes(entry.id))
            .flatMap((entry) => entry.items.map((item) => [item.id, item] as const)),
        ).values(),
      ],
    }));
  }, [hotspots, anchorIds, scopeId, model, byId, viewport, size, markerObstacles, coarsePointer]);
  const routes = useMemo(() => {
    const lanes = new Map<string, number>();
    return exchanges.map((exchange) => {
      const pair = [exchange.source.id, exchange.target.id].sort().join('/');
      const lane = lanes.get(pair) || 0;
      lanes.set(pair, lane + 1);
      return {
        exchange,
        ...routeFlowExchange(exchange.source, exchange.target, flowBoxes, lane),
      };
    });
  }, [exchanges, flowBoxes]);
  const drawings = useMemo(() => {
    const screen = (point: { x: number; y: number }) => ({
      x: point.x * viewport.zoom + viewport.x,
      y: point.y * viewport.zoom + viewport.y,
    });
    const obstacles = flowBoxes.map((box) => ({
      x: box.x * viewport.zoom + viewport.x,
      y: box.y * viewport.zoom + viewport.y,
      width: box.width * viewport.zoom,
      height: flowExpandedIds.has(box.id) ? box.headerHeight * viewport.zoom : box.height * viewport.zoom,
    }));
    const placed: { x: number; y: number; width: number; height: number }[] = [];
    const endpointInView = (box: FlowMapBox) => {
      const left = Math.max(0, box.x * viewport.zoom + viewport.x);
      const top = Math.max(0, box.y * viewport.zoom + viewport.y);
      const right = Math.min(size.width, (box.x + box.width) * viewport.zoom + viewport.x);
      const bottom = Math.min(size.height, (box.y + box.height) * viewport.zoom + viewport.y);
      return (
        right - left >= Math.min(85, box.width * viewport.zoom * 0.5) &&
        bottom - top >= Math.min(36, box.height * viewport.zoom * 0.5)
      );
    };
    return routes.flatMap(({ exchange, points, labelPoint }) => {
      const pathPoints = points.map(screen);
      if (!flowRouteInViewport(pathPoints, size)) return [];
      const sourceInView = endpointInView(exchange.source);
      const targetInView = endpointInView(exchange.target);
      // Crossing a camera window is insufficient when neither endpoint belongs to the visible neighborhood.
      if (!sourceInView && !targetInView) return [];
      const segments = pathPoints
        .slice(1)
        .map((point, index) => ({
          x: (point.x + pathPoints[index].x) / 2,
          y: (point.y + pathPoints[index].y) / 2,
          length: Math.abs(point.x - pathPoints[index].x) + Math.abs(point.y - pathPoints[index].y),
        }))
        .sort((a, b) => b.length - a.length);
      const width = Math.min(
        190,
        Math.max(84, Math.min(exchange.caption.length * 5.5 + 10, (segments[0]?.length || 120) - 40)),
      );
      const height = 53;
      const label =
        sourceInView && targetInView
          ? placeFlowExchangeLabel([screen(labelPoint), ...segments], size, { width, height }, [
              ...obstacles,
              ...markerObstacles,
              ...placed,
            ])
          : undefined;
      const emphasized =
        exchange.relations.some((relation) => selectedRelationIds.has(relation.id)) ||
        hoveredExchangeId === exchange.id;
      if (label) placed.push(label);
      return [
        {
          exchange,
          path: roundedFlowPath(pathPoints, 10),
          ribbon: flowRibbonPath(pathPoints, 10, 16),
          contextual: !sourceInView || !targetInView,
          label,
          emphasized,
        },
      ];
    });
  }, [routes, viewport, flowBoxes, flowExpandedIds, size, markerObstacles, selectedRelationIds, hoveredExchangeId]);

  const exchangeDetail = selectedExchange && (
    <aside className={`flow-exchange-detail${shortScreen ? ' is-floating' : ''}`} aria-label="Détail du flux">
      <header>
        <strong>
          {selectedExchange.source.node.name}
          <ArrowRight size={14} />
          {selectedExchange.target.node.name}
        </strong>
        <button type="button" aria-label="Fermer le détail du flux" onClick={closeExchange}>
          <X size={16} />
        </button>
      </header>
      <p className="flow-relation-context">
        Les synthèses entre systèmes et les échanges détaillés peuvent décrire un même apport. Les relations d’origine
        figurent ci-dessous ; leur nombre ne dénombre pas les interfaces installées.
      </p>
      {selectedExchange.relations.map((relation) => {
        const source = model.nodeById.get(relation.sourceId);
        const target = model.nodeById.get(relation.targetId);
        const systemSummary = source?.kind === 'business_system' && target?.kind === 'business_system';
        return (
          <div key={relation.id} data-relation-id={relation.id}>
            <strong>{exchangeLabel(relation)}</strong>
            <small>{systemSummary ? 'Synthèse entre systèmes' : 'Échange détaillé'}</small>
            <small>
              <ReferenceLink target={relation.sourceId}>{source?.name || relation.sourceId}</ReferenceLink>
              {source && (
                <>
                  {' '}
                  (<MetaTypeLabel node={source} />)
                </>
              )}
              {' → '}
              <ReferenceLink target={relation.targetId}>{target?.name || relation.targetId}</ReferenceLink>
              {target && (
                <>
                  {' '}
                  (<MetaTypeLabel node={target} />)
                </>
              )}
            </small>
            <small>Relation publiée : {relation.id}</small>
            {flowExchangeContract(relation).map((section) => (
              <section className="flow-contract-section" key={section.label}>
                <h3>{section.label}</h3>
                {section.texts.length === 1 ? (
                  <p>
                    <ModelText text={section.texts[0]} />
                  </p>
                ) : (
                  <ul>
                    {section.texts.map((text) => (
                      <li key={text}>
                        <ModelText text={text} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {!!relation.dataExchange?.contents.length && (
              <section className="flow-contract-section">
                <h3>Informations partagées</h3>
                {relation.dataExchange.contents.map((content) => (
                  <div key={content.name}>
                    <p>
                      <b>
                        <ModelText text={content.name} />
                      </b>{' '}
                      — <ModelText text={content.description} />
                    </p>
                    {!!content.glossary_refs.length && (
                      <small>
                        Termes :{' '}
                        {content.glossary_refs.map((termId, index) => (
                          <span key={termId}>
                            {index > 0 && ' · '}
                            <ReferenceLink kind="glossary" target={termId}>
                              {model.glossaryById.get(termId)?.name || termId}
                            </ReferenceLink>
                          </span>
                        ))}
                      </small>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        );
      })}
    </aside>
  );

  return (
    <section
      className="map-panel flow-map-panel"
      ref={panel}
      aria-label="Carte spatiale des flux"
      onKeyDown={(event) => {
        if (!event.defaultPrevented && event.key === 'Escape' && selectedExchange) {
          event.preventDefault();
          closeExchange();
        }
      }}
    >
      <div className="map-toolbar flow-map-toolbar">
        <div>
          <strong>{scope?.name || rootName}</strong>
          <span className="flow-toolbar-note">Flux documentés</span>
        </div>
        <div className="map-actions">
          <button
            type="button"
            className="flow-tool-button"
            aria-label="Afficher les flux"
            aria-pressed={arrows}
            onClick={() => {
              if (arrows) closeExchange();
              setArrows(!arrows);
              arrowChoices.set(key, !arrows);
            }}
          >
            <Route size={16} />
            Flux
          </button>
          {!!model.raw.hotspot_catalog?.hotspots.length && (
            <MapHotspotPicker
              filters={hotspotFilters}
              onChange={onHotspotFiltersChange}
              scopedHotspots={scopedHotspots}
              visibleHotspots={hotspots}
              onOpenHotspot={onOpenHotspot}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={(id) => {
                onHotspotFiltersChange({ enabled: true });
                setSelectedHotspotId(id);
                const hotspot = scopedHotspots.find((item) => item.id === id);
                const anchor = hotspot?.location.node_ids.find((nodeId) => visibleAncestorId(model, nodeId, allIds));
                if (anchor) center(anchor);
              }}
            />
          )}
          {!!catalog && (
            <MapApplicationPicker
              catalog={catalog}
              selectionId={applicationSelectionId}
              componentId={applicationComponentId}
              onChange={onApplicationChange}
            />
          )}
          <button
            type="button"
            className="map-fullscreen-button"
            aria-label={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            title={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            onClick={() => {
              if (expanded) void document.exitFullscreen();
              else
                void panel.current
                  ?.requestFullscreen()
                  .catch(() => onAnnouncement('Le plein écran est indisponible dans ce navigateur.'));
            }}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      {!!boundaryRelations.length && (
        <div className="flow-scope-note" role="note">
          <span className="flow-scope-full">
            Ce cadrage montre les échanges internes. {boundaryRelations.length} relation(s) documentée(s) avec d’autres
            périmètres sont hors champ.
          </span>
          <span className="flow-scope-short">{boundaryRelations.length} échanges hors champ</span>
          {onOpenScope && (
            <button
              type="button"
              aria-label="Voir les échanges dans Enterprise Architecture"
              onClick={() => onOpenScope('')}
            >
              <span className="flow-scope-full">Voir les échanges dans Enterprise Architecture</span>
              <span className="flow-scope-short">Voir l’ensemble</span>
            </button>
          )}
        </div>
      )}
      <div
        ref={canvas}
        className="flow-map-canvas"
        role="region"
        aria-label="Exploration spatiale des flux, flèches pour déplacer, plus et moins pour zoomer"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const directions: Record<string, [number, number]> = {
            ArrowLeft: [80, 0],
            ArrowRight: [-80, 0],
            ArrowUp: [0, 80],
            ArrowDown: [0, -80],
          };
          const delta = directions[event.key];
          if (delta) {
            event.preventDefault();
            rememberFraming('custom');
            void instance.current?.setViewport({ ...viewport, x: viewport.x + delta[0], y: viewport.y + delta[1] });
          } else if (['+', '=', '-'].includes(event.key)) {
            event.preventDefault();
            rememberFraming('custom');
            if (event.key === '-') void instance.current?.zoomOut();
            else void instance.current?.zoomIn();
          } else if (event.key === 'Home') {
            event.preventDefault();
            overview();
          }
        }}
        data-zoom={viewport.zoom}
        data-framing={framing}
        data-layout={JSON.stringify(layout.boxes.map(({ id, x, y, width, height }) => ({ id, x, y, width, height })))}
      >
        <ReactFlow<SpatialNode>
          key={key}
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          minZoom={0.003}
          maxZoom={2.5}
          panOnDrag
          zoomOnDoubleClick={false}
          defaultViewport={cameras.get(key) || viewport}
          preventScrolling
          onInit={(flow) => {
            instance.current = flow;
            if (!layout.boxes.length) return;
            const saved = cameras.get(key);
            const focusSelection = selectedBoxId && selectedId !== scopeId;
            if (saved && (!focusSelection || cameraSelections.get(key) === selectedId)) {
              const previous = cameraSizes.get(key);
              const current = canvas.current && {
                width: canvas.current.clientWidth,
                height: canvas.current.clientHeight,
              };
              void flow.setViewport(previous && current ? resizeFlowCamera(saved, previous, current) : saved);
            } else
              requestAnimationFrame(() => {
                if (focusSelection) center(selectedId, 0);
                else standard(0);
              });
          }}
          onMoveStart={(event) => {
            if (event) rememberFraming('custom');
          }}
          onMove={(_, next) => {
            setViewport(next);
            cameras.set(key, next);
            if (canvas.current)
              cameraSizes.set(key, { width: canvas.current.clientWidth, height: canvas.current.clientHeight });
          }}
          onPaneClick={closeExchange}
          proOptions={{ hideAttribution: true }}
          ariaLabelConfig={{ 'minimap.ariaLabel': 'Vue miniature de la carte spatiale' }}
        >
          <MiniMap
            style={{ width: size.width < 600 ? 72 : 160, height: size.width < 600 ? 54 : 100 }}
            pannable
            zoomable
            nodeColor={(node) => (node.data.application ? '#d7c6e8' : '#c4ded3')}
            maskColor="#edf3f0b0"
          />
        </ReactFlow>
        {arrows && (
          <svg
            className="flow-exchanges"
            width={size.width}
            height={size.height}
            aria-label="Échanges orientés de la publication"
          >
            <title>Partages de données et apports de connaissance documentés</title>
            <defs>
              <marker
                id={`${paintId}-arrow`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                markerUnits="userSpaceOnUse"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#448e81" />
              </marker>
            </defs>
            {drawings.map(({ exchange, path, ribbon, emphasized, contextual }) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: Hover spans the keyboard-accessible path and label to avoid flicker between them.
              <g
                className={`flow-exchange${exchange.type === 'provides-knowledge' ? ' is-knowledge' : ''}${emphasized ? ' is-emphasized' : ''}${contextual ? ' is-contextual' : ''}`}
                key={exchange.id}
                data-source-id={exchange.source.id}
                data-target-id={exchange.target.id}
                data-relation-ids={exchange.relations.map((relation) => relation.id).join('|')}
                onMouseEnter={() => setHoveredExchangeId(exchange.id)}
                onMouseLeave={() => setHoveredExchangeId('')}
              >
                <title>
                  {exchange.source.node.name} → {exchange.target.node.name} : {exchange.label}
                </title>
                <path className="flow-exchange-halo" d={path} />
                {exchange.type === 'provides-knowledge' ? (
                  <path className="flow-exchange-line" d={path} markerEnd={`url(#${paintId}-arrow)`} />
                ) : (
                  <path className="flow-exchange-ribbon" d={ribbon} />
                )}
                <path
                  className="flow-exchange-hit"
                  d={path}
                  role="button"
                  tabIndex={0}
                  aria-pressed={exchange.relations.some((relation) => selectedRelationIds.has(relation.id))}
                  aria-label={`${exchange.source.node.name} vers ${exchange.target.node.name} : ${exchange.label}`}
                  onFocus={() => setHoveredExchangeId(exchange.id)}
                  onBlur={() => setHoveredExchangeId('')}
                  onClick={(event) => toggleExchange(exchange, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleExchange(exchange, event.currentTarget);
                    }
                  }}
                />
              </g>
            ))}
            {drawings.map(
              ({ exchange, label }) =>
                label && (
                  <g
                    key={exchange.id}
                    className="flow-exchange-caption"
                    data-relation-ids={exchange.relations.map((relation) => relation.id).join('|')}
                  >
                    <line
                      className="flow-caption-leader"
                      x1={label.anchor.x}
                      y1={label.anchor.y}
                      x2={Math.max(label.x, Math.min(label.x + label.width, label.anchor.x))}
                      y2={Math.max(label.y, Math.min(label.y + label.height, label.anchor.y))}
                    />
                    <foreignObject x={label.x} y={label.y} width={label.width} height={label.height}>
                      <button
                        type="button"
                        className="flow-exchange-label"
                        tabIndex={-1}
                        title={`${exchange.label} · ${exchange.relations.length} relation${exchange.relations.length > 1 ? 's' : ''}`}
                        aria-label={`${exchange.source.node.name} vers ${exchange.target.node.name} : ${exchange.label}`}
                        aria-pressed={exchange.relations.some((relation) => selectedRelationIds.has(relation.id))}
                        onMouseEnter={() => setHoveredExchangeId(exchange.id)}
                        onMouseLeave={() => setHoveredExchangeId('')}
                        onFocus={() => setHoveredExchangeId(exchange.id)}
                        onBlur={() => setHoveredExchangeId('')}
                        onClick={(event) => toggleExchange(exchange, event.currentTarget)}
                      >
                        {exchange.caption}
                      </button>
                    </foreignObject>
                  </g>
                ),
            )}
          </svg>
        )}
        {!layout.boxes.length && (
          <p className="flow-map-note">Aucun périmètre cartographiable dans cette publication.</p>
        )}
        {!!layout.boxes.length && !layout.exchanges.length && (
          <p className="flow-map-note">Aucun échange documenté pour ce périmètre.</p>
        )}
        {arrows && !!layout.exchanges.length && !exchanges.length && (
          <p className="flow-map-note">Zoome pour voir les échanges internes à ces périmètres.</p>
        )}
        <div className="flow-map-hotspots">
          <svg className="flow-hotspot-leaders" width={size.width} height={size.height} aria-hidden="true">
            {markerGroups.map(
              (group) =>
                Math.hypot(group.x - group.anchor.x, group.y - group.anchor.y) > 6 && (
                  <line key={group.id} x1={group.anchor.x} y1={group.anchor.y} x2={group.x} y2={group.y} />
                ),
            )}
          </svg>
          {markerGroups.map((group) => (
            <div className="flow-hotspot-marker" key={group.id}>
              <HotspotMapMarker
                id={`flow:${group.id}`}
                items={group.items}
                x={group.x}
                y={group.y}
                model={model}
                onOpen={onOpenHotspot}
                variant="compact"
              />
            </div>
          ))}
        </div>
        <div className="flow-camera-tools" role="group" aria-label="Cadrage des flux">
          <select
            className="flow-framing-select"
            aria-label="Cadrage des flux"
            value={framing}
            onChange={(event) => {
              if (event.target.value === 'standard') standard();
              else if (event.target.value === 'width') fitWidth();
              else if (event.target.value === 'all') overview();
            }}
          >
            {framing === 'custom' && (
              <option value="custom" disabled>
                Libre
              </option>
            )}
            <option value="standard">Standard</option>
            <option value="width">Largeur</option>
            <option value="all">Tout cadrer</option>
          </select>
          <button
            className="flow-framing-button"
            type="button"
            aria-label="Échelle standard"
            aria-pressed={framing === 'standard'}
            title="Échelle de lecture naturelle ; glisser pour parcourir toute la carte"
            onClick={() => standard()}
          >
            <Ruler size={16} />
            <span>Standard</span>
          </button>
          <button
            className="flow-framing-button"
            type="button"
            aria-label="Cadrer la largeur"
            aria-pressed={framing === 'width'}
            title="Adapter la largeur de toute la carte"
            onClick={fitWidth}
          >
            <MoveHorizontal size={16} />
            <span>Largeur</span>
          </button>
          <button
            className="flow-framing-button"
            type="button"
            aria-label="Tout cadrer"
            aria-pressed={framing === 'all'}
            title="Voir la carte entière"
            onClick={overview}
          >
            <Scan size={16} />
            <span>Tout cadrer</span>
          </button>
          <button
            type="button"
            aria-label="Centrer la sélection"
            title="Centrer la sélection"
            disabled={!selectedBoxId}
            onClick={() => center(selectedId)}
          >
            <Focus size={16} />
            <span>Centrer la sélection</span>
          </button>
          <div className="flow-zoom-tools">
            <button
              type="button"
              aria-label="Zoom arrière"
              onClick={() => {
                rememberFraming('custom');
                void instance.current?.zoomOut({ duration: motionDuration(150) });
              }}
            >
              <Minus size={16} />
            </button>
            <output aria-label="Zoom des flux">{Math.round(viewport.zoom * 100)} %</output>
            <button
              type="button"
              aria-label="Zoom avant"
              onClick={() => {
                rememberFraming('custom');
                void instance.current?.zoomIn({ duration: motionDuration(150) });
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          {product && (
            <button
              type="button"
              aria-label="Centrer l’application"
              title="Centrer l’application"
              disabled={!applicationBoxIds.size && !applicationAtScope}
              onClick={centerApplication}
            >
              <Focus size={16} />
              <span>Centrer l’application</span>
            </button>
          )}
        </div>
        {exchangeDetail &&
          (shortScreen
            ? createPortal(exchangeDetail, expanded && panel.current ? panel.current : document.body)
            : exchangeDetail)}
      </div>
      <div className="flow-map-legend">
        <span>
          <i />
          Partage de données
        </span>
        <span>
          <i className="is-knowledge" />
          Apport de connaissance
        </span>
        {product && (
          <span className="flow-app-legend">
            {product.name} ·{' '}
            {selection
              ? 'couverture documentée dans le SI sélectionné'
              : 'offre éditeur · usage Beaumanoir non présumé'}
            {!applicationBoxIds.size &&
              (applicationAtScope
                ? ' · rattachement au périmètre courant, sans localisation plus fine'
                : ' · aucun rattachement documenté dans ce périmètre')}
          </span>
        )}
      </div>
      <div className="map-footer">
        <span>
          <Move size={13} /> Glisser pour se déplacer · Zoomer jusqu’aux Business Areas · Double-cliquer sur un nom pour
          centrer
        </span>
        <span>Lecture seule</span>
      </div>
    </section>
  );
}
