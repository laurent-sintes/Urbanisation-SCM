import {
  Background,
  Controls,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prominentChildIndex } from './adaptiveLayout';
import { startsCapabilityTypeSection } from './capabilityTypes';
import { categoryCaption, categoryOf, startsCategorySection } from './categories';
import { HotspotMapMarker } from './components/HotspotDisplay';
import { type MapChildList, nodeTypes } from './components/MapCards';
import { ModelText } from './components/ModelLinks';
import { hotspotRelatedElementIds } from './hotspotMap';
import { HOTSPOT_DIAMETERS, layoutHotspots } from './hotspotPlacement';
import { NodeIcon } from './icons';
import { measureMapCards } from './mapCardMeasure';
import { areaListAtDetail } from './mapDetail';
import { chooseMapGrid } from './mapLayout';
import { operationsMapSlots } from './mapPlacement';
import { structuralMap } from './mapProjection';
import { businessAreaSections, directSectionCaption } from './mapSections';
import { type MapZoomChoice, resolveMapZoom, widthFit } from './mapZoom';
import {
  cardChildListOf,
  cardContentSummary,
  cardListedItems,
  childrenOf,
  descendantsOf,
  parentRelationOf,
  requiredNode,
  rootsOf,
  scopeStatistics,
} from './model';
import { kindLabel } from './presentation';
import type { AtlasNode, Hotspot, PublishedModel } from './types';
import '@xyflow/react/dist/style.css';

export interface ReactFlowPaneProps {
  model: PublishedModel;
  selectedId: string;
  scopeId?: string;
  detail?: number;
  zoomMode?: MapZoomChoice;
  focusId?: string;
  onSelect: (id: string) => void;
  onRead: (id: string) => void;
  onPageFallbackChange: (fallback: boolean) => void;
  perspective: string;
  hotspots?: Hotspot[];
  onOpenHotspot?: (id: string, groupIds?: string[]) => void;
}
interface HotspotMarker {
  id: string;
  projectionKey: string;
  x: number;
  y: number;
  title: string;
  titles: string[];
  hotspotIds: string[];
  count: number;
  severity: string;
  political: string;
  implementation: string;
  workshop: boolean;
  projectedElementIds: string[];
}
function Canvas(props: ReactFlowPaneProps) {
  const { model, selectedId, scopeId, perspective, detail = 0, zoomMode = 'auto', focusId } = props;
  const [layout, setLayout] = useState<{
    nodes: Node[];
    ms: number;
    width: number;
    height: number;
    mode: 'page' | 'width';
  }>({
    nodes: [],
    ms: 0,
    width: 0,
    height: 0,
    mode: 'page',
  });
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [hoveredHotspotIds, setHoveredHotspotIds] = useState<string[]>([]);
  const [clusterExpanded, setClusterExpanded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [touch, setTouch] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [error, setError] = useState('');
  const { fitView, setViewport } = useReactFlow();
  const viewport = useViewport();
  const container = useRef<HTMLDivElement>(null);
  const capabilityOverview = detail >= 3;
  const minimumHeight = availableHeight
    ? Math.max(60, availableHeight)
    : matchMedia('(max-width: 600px)').matches
      ? 420
      : 600;
  useEffect(() => {
    const pointer = matchMedia('(pointer: coarse)');
    const updatePointer = () => setTouch(pointer.matches);
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    pointer.addEventListener('change', updatePointer);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => {
      pointer.removeEventListener('change', updatePointer);
      document.removeEventListener('fullscreenchange', updateFullscreen);
    };
  }, []);
  const onHeight = useCallback((id: string, height: number) => {
    setCardHeights((previous) => (previous[id] === height ? previous : { ...previous, [id]: height }));
  }, []);
  const areaSections = useMemo(
    () => (detail === 0 ? businessAreaSections(model, scopeId) : undefined),
    [model, scopeId, detail],
  );
  const graph = useMemo(() => {
    if (!scopeId) return { nodes: rootsOf(model), group: undefined };
    const projection = structuralMap(model, scopeId, detail);
    if (projection) return projection;
    const scope = model.nodeById.get(scopeId);
    if (!scope) return { nodes: [], group: undefined };
    const children = areaSections ? areaSections.flatMap((section) => section.items) : childrenOf(model, scopeId);
    // Cards only express explicit structure. A leaf never expands into business neighbours here.
    return children.length ? { nodes: [scope, ...children], group: scope } : { nodes: [scope], group: undefined };
  }, [model, scopeId, areaSections, detail]);
  const items = useMemo(() => graph.nodes.filter((node) => node.id !== graph.group?.id), [graph]);
  const fixedSlots = useMemo(
    () =>
      graph.group?.kind === 'business_system'
        ? operationsMapSlots(
            scopeId,
            items.map((item) => item.id),
          )
        : undefined,
    [graph.group, scopeId, items],
  );
  // Height measurements only change placement; published descendants depend on scope and detail.
  const childLists = useMemo(() => {
    const lists = new Map<string, MapChildList>();
    for (const item of items) {
      if (item.kind === 'domain' && detail >= 1) {
        const subdomains = childrenOf(model, item.id).filter((child) => child.kind === 'area');
        if (subdomains.length)
          lists.set(item.id, {
            kind: 'mixed',
            items: subdomains,
            subdomainChildren: Object.fromEntries(
              subdomains.flatMap((subdomain) => {
                const list = cardChildListOf(model, subdomain);
                const visible = list && areaListAtDetail(list, detail);
                return visible?.items.length ? [[subdomain.id, visible]] : [];
              }),
            ),
          });
        continue;
      }
      if (detail < 2) continue;
      const list = cardChildListOf(model, item);
      if (!list) continue;
      const visible = item.kind === 'area' ? areaListAtDetail(list, detail) : list;
      if (visible.items.length) lists.set(item.id, visible);
    }
    return lists;
  }, [model, items, detail]);
  const behaviorsByItem = useMemo(
    () =>
      new Map(
        items.map((item) => {
          const childList = childLists.get(item.id);
          const behaviors =
            detail >= 4 && childList
              ? Object.fromEntries(
                  (item.kind === 'domain' ? descendantsOf(model, item.id) : cardListedItems(childList))
                    .filter((child) => child.kind === 'capability')
                    .map((child) => [
                      child.id,
                      childrenOf(model, child.id).filter((behavior) => behavior.kind === 'behavior'),
                    ]),
                )
              : {};
          return [item.id, behaviors] as const;
        }),
      ),
    [model, items, childLists, detail],
  );
  useEffect(() => {
    const start = performance.now();
    setError('');
    try {
      const group = graph.group;
      const inputs = items.map((n) => {
        const childList = childLists.get(n.id);
        return {
          id: n.id,
          height:
            cardHeights[n.id] || (childList ? 260 + childList.items.length * 34 : n.fields.modeling_depth ? 280 : 220),
        };
      });
      const categorized = group?.kind === 'area' && items.some(categoryOf);
      const sectionByItem = new Map(
        areaSections?.flatMap((section) => section.items.map((item) => [item.id, section] as const)),
      );
      const startsArea = (index: number) =>
        !!areaSections &&
        (index === 0 || sectionByItem.get(items[index].id) !== sectionByItem.get(items[index - 1].id));
      const boundaries = [
        0,
        ...items.flatMap((_, index) =>
          index > 0 &&
          (startsArea(index) ||
            (categorized && startsCategorySection(items, index)) ||
            startsCapabilityTypeSection(items, index))
            ? [index]
            : [],
        ),
        items.length,
      ];
      const sections = boundaries.slice(0, -1).map((start, index) => inputs.slice(start, boundaries[index + 1]));
      const headingHeights = sections.map((_, sectionIndex) => {
        const start = boundaries[sectionIndex];
        if (startsArea(start)) return 64;
        if (categorized && startsCategorySection(items, start)) return 52;
        return sectionIndex ? 14 : 0;
      });
      // Reflow the cards before framing the viewport. The page mode balances height and width;
      // the width mode spreads cards across available columns at a readable native scale.
      const gridSections = sections.map((section, index) => ({
        heights: section.map((item) => item.height),
        headingHeight: headingHeights[index],
        prominentIndex: prominentChildIndex(section.map((item) => childLists.get(item.id)?.items.length || 0)),
      }));
      const measuredSections = new Map<number, typeof gridSections>();
      const measure = (cardWidth: number) => {
        const cached = measuredSections.get(cardWidth);
        if (cached) return cached;
        const heights = measureMapCards(
          container.current,
          inputs.map((item) => item.id),
          detail,
          cardWidth,
        );
        const result = sections.map((section, index) => ({
          heights: section.map((item) => heights.get(item.id) || item.height),
          headingHeight: headingHeights[index],
          prominentIndex: gridSections[index].prominentIndex,
        }));
        measuredSections.set(cardWidth, result);
        return result;
      };
      const pageGrid = chooseMapGrid(
        gridSections,
        canvasWidth,
        minimumHeight,
        'page',
        Boolean(group),
        measure,
        fixedSlots,
      );
      const mode = resolveMapZoom(zoomMode, detail, pageGrid.pageZoom);
      const grid =
        mode === 'page'
          ? pageGrid
          : chooseMapGrid(gridSections, canvasWidth, minimumHeight, 'width', Boolean(group), measure, fixedSlots);
      const { cardWidth } = grid;
      const positioned: ((typeof inputs)[number] & { x: number; y: number; width: number })[] = [];
      let top = 16;
      const dividerPositions: number[] = [];
      const banners: { caption: string; y: number; area?: AtlasNode }[] = [];
      sections.forEach((section, sectionIndex) => {
        const start = boundaries[sectionIndex];
        if (startsArea(start)) {
          const businessSection = sectionByItem.get(items[start].id);
          const area = businessSection?.area;
          banners.push({ caption: area?.name || directSectionCaption(businessSection?.items || []), area, y: top });
          top += 64;
        } else if (categorized && startsCategorySection(items, start)) {
          banners.push({ caption: categoryCaption(items[start]), y: top });
          top += 52;
        } else if (sectionIndex) {
          dividerPositions.push(top - 7);
          top += 14;
        }
        for (const row of grid.rows[sectionIndex]) {
          const rowHeight = Math.max(...row.map((entry) => entry.height));
          row.forEach((entry) => {
            positioned.push({
              ...section[entry.index],
              height: entry.displayHeight,
              width: entry.span * cardWidth + (entry.span - 1) * 28,
              x: 16 + entry.column * (cardWidth + 28),
              y: top,
            });
          });
          top += rowHeight + 28;
        }
      });
      const result = {
        width: grid.width - (group ? 28 : 0),
        height: Math.max(32, top - 12),
        children: positioned,
      };
      const nodes: Node[] = [];
      if (group)
        nodes.push({
          id: `group:${group.id}`,
          type: 'container',
          data: { item: group },
          position: { x: 0, y: 0 },
          width: result.width + 28,
          height: result.height + 70,
          style: { width: result.width + 28, height: result.height + 70 },
          selectable: false,
          draggable: false,
          focusable: false,
        });
      banners.forEach((banner, index) => {
        nodes.push({
          id: `category-banner:${scopeId}:${index}`,
          type: 'categoryBanner',
          data: { caption: banner.caption, area: banner.area },
          position: { x: 16 + (group ? 14 : 0), y: banner.y + (group ? 54 : 0) },
          ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}),
          width: result.width - 32,
          height: areaSections ? 52 : 40,
          style: { width: result.width - 32, height: areaSections ? 52 : 40 },
          selectable: false,
          draggable: false,
          focusable: false,
        });
      });
      dividerPositions.forEach((dividerY, index) => {
        nodes.push({
          id: `capability-type-divider:${scopeId}:${index}`,
          type: 'capabilityTypeDivider',
          data: {},
          position: { x: 16 + (group ? 14 : 0), y: dividerY + (group ? 54 : 0) },
          ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}),
          width: result.width - 32,
          height: 1,
          style: { width: result.width - 32, height: 1 },
          selectable: false,
          draggable: false,
          focusable: false,
        });
      });
      for (const position of result.children) {
        const item = requiredNode(model, position.id);
        // Explicit dimensions keep a controlled node measurable during selection updates.
        // CSS sizes alone briefly hide it between the two clicks of a double-click.
        const childList = childLists.get(item.id);
        const behaviorsByCapability = behaviorsByItem.get(item.id) || {};
        nodes.push({
          id: item.id,
          type: 'business',
          data: { item, childList, detail, behaviorsByCapability },
          position: { x: (position.x || 0) + (group ? 14 : 0), y: (position.y || 0) + (group ? 54 : 0) },
          ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}),
          width: position.width,
          height: position.height,
          style: { width: position.width, height: position.height },
          draggable: false,
          ariaLabel: `${kindLabel(item)} ${item.name}`,
        });
      }
      setLayout({
        nodes,
        ms: Math.round(performance.now() - start),
        width: result.width + (group ? 28 : 0),
        height: result.height + (group ? 70 : 0),
        mode,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [
    graph,
    items,
    childLists,
    behaviorsByItem,
    model,
    scopeId,
    areaSections,
    cardHeights,
    canvasWidth,
    detail,
    minimumHeight,
    zoomMode,
    fixedSlots,
  ]);
  const effectiveZoomMode = layout.mode;
  useEffect(() => {
    props.onPageFallbackChange(zoomMode === 'page' && effectiveZoomMode === 'width' && layout.nodes.length > 0);
  }, [zoomMode, effectiveZoomMode, layout.nodes.length, props.onPageFallbackChange]);
  const nativeTouchScroll = (effectiveZoomMode === 'width' || capabilityOverview) && touch;
  const widthFrame =
    layout.width && canvasWidth
      ? widthFit(layout.width, layout.height, canvasWidth, minimumHeight, Boolean(fixedSlots))
      : undefined;
  const surfaceWidth =
    effectiveZoomMode === 'width' && fixedSlots ? Math.max(canvasWidth, layout.width + 32) : undefined;
  const frameX = widthFrame?.x;
  const frameY = widthFrame?.y;
  const frameZoom = widthFrame?.zoom;
  useEffect(() => {
    if (!layout.nodes.length || !canvasWidth) return;
    const id = setTimeout(() => {
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
      if (effectiveZoomMode === 'width' && frameX !== undefined && frameY !== undefined && frameZoom !== undefined)
        void setViewport({ x: frameX, y: frameY, zoom: frameZoom }, { duration });
      else void fitView({ padding: fullscreen ? 0.04 : 0.01, maxZoom: 1, duration });
    }, 80);
    return () => clearTimeout(id);
  }, [layout, canvasWidth, fitView, setViewport, fullscreen, effectiveZoomMode, frameX, frameY, frameZoom]);
  useEffect(() => {
    if (!focusId || !layout.nodes.length) return;
    const timer = setTimeout(() => {
      const target = [
        ...(container.current?.querySelectorAll<HTMLElement>(
          '[data-node-id], [data-business-area-summary], [data-map-item-id]',
        ) || []),
      ].find(
        (element) =>
          element.dataset.nodeId === focusId ||
          element.dataset.businessAreaSummary === focusId ||
          element.dataset.mapItemId === focusId,
      );
      target?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }, 160);
    return () => clearTimeout(timer);
  }, [focusId, layout.nodes]);
  // A new scope, detail or mode starts at the top of its map canvas.
  // biome-ignore lint/correctness/useExhaustiveDependencies: These values intentionally trigger a scroll reset.
  useEffect(() => {
    container.current?.closest('.map-scroll-viewport')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [effectiveZoomMode, scopeId, detail]);
  useEffect(() => {
    const target = container.current;
    if (!target) return;
    const scroll = target.closest<HTMLElement>('.map-scroll-viewport');
    const update = () => {
      setCanvasWidth(target.clientWidth);
      const legend = scroll?.querySelector<HTMLElement>('.hotspot-map-legend');
      setAvailableHeight(Math.max(60, (scroll?.clientHeight || target.clientHeight) - (legend?.offsetHeight || 0)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(target);
    if (scroll) observer.observe(scroll);
    const legend = scroll?.querySelector<HTMLElement>('.hotspot-map-legend');
    if (legend) observer.observe(legend);
    const mutations = new MutationObserver(update);
    if (scroll) mutations.observe(scroll, { childList: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
  const nodes = useMemo(
    () =>
      layout.nodes.map((n) => {
        if (n.type !== 'business') return n;
        const item = requiredNode(model, n.id);
        return {
          ...n,
          selected: n.id === selectedId,
          data: {
            ...n.data,
            selectedId,
            onHeight,
            parentName:
              model.nodeById.get(n.id)?.kind === 'business_area' ||
              (model.nodeById.get(n.id)?.kind === 'area' && model.nodeById.get(scopeId || '')?.kind !== 'domain')
                ? model.nodeById.get(parentRelationOf(model, n.id)?.sourceId || '')?.name
                : undefined,
            summary: cardContentSummary(model, item),
            statistics:
              item.kind === 'area'
                ? scopeStatistics(model, item).filter(
                    (stat) =>
                      stat.count > 0 && ['business_area', 'capability', 'reference', 'behavior'].includes(stat.kind),
                  )
                : [],
            onRead: props.onRead,
            highlighted: Boolean(perspective && model.nodeById.get(n.id)?.status === perspective),
            muted: Boolean(perspective && model.nodeById.get(n.id)?.status !== perspective),
          },
        };
      }),
    [layout, selectedId, model, scopeId, props.onRead, perspective, onHeight],
  );
  const hotspotMarkers = useMemo(() => {
    if (!props.hotspots?.length) return [];
    const visible = new Map(layout.nodes.filter((node) => node.type === 'business').map((node) => [node.id, node]));
    for (const node of layout.nodes.filter((candidate) => candidate.type === 'business')) {
      const list = childLists.get(node.id);
      if (!list) continue;
      for (const item of list.items) visible.set(item.id, node);
      for (const sublist of Object.values(list.subdomainChildren || {})) {
        for (const item of sublist.items) {
          visible.set(item.id, node);
          for (const child of sublist.businessAreaChildren?.[item.id] || []) visible.set(child.id, node);
        }
      }
      if (detail >= 3) {
        for (const children of Object.values(list.businessAreaChildren || {}))
          for (const child of children) visible.set(child.id, node);
      }
    }
    const group = layout.nodes.find((node) => node.type === 'container');
    if (group?.id.startsWith('group:')) visible.set(group.id.slice(6), group);
    const projected = (id: string): { node: Node; elementId: string } | undefined => {
      let current = id;
      const seen = new Set<string>();
      while (current && !seen.has(current)) {
        seen.add(current);
        const found = visible.get(current);
        if (found) return { node: found, elementId: current };
        current = parentRelationOf(model, current)?.sourceId || '';
      }
      return undefined;
    };
    const markers = props.hotspots.flatMap((hotspot): HotspotMarker[] => {
      const anchors = hotspot.location.node_ids
        .map(projected)
        .filter((anchor): anchor is { node: Node; elementId: string } => Boolean(anchor));
      if (!anchors.length) return [];
      const distinct = [...new Map(anchors.map((anchor) => [anchor.elementId, anchor])).values()];
      const boxes = distinct.map(({ node }) => ({
        left: node.position.x,
        top: node.position.y,
        right: node.position.x + (node.width || 0),
        bottom: node.position.y + (node.height || 0),
      }));
      let x: number;
      let y: number;
      if (hotspot.kind === 'integration' && boxes.length === 1) {
        x = boxes[0].right;
        y = boxes[0].top + 24;
      } else if (hotspot.kind === 'integration' && boxes.length === 2) {
        const [a, b] = boxes;
        const horizontalOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const verticalOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (horizontalOverlap <= 0 && verticalOverlap > 0) {
          const [left, right] = a.left < b.left ? [a, b] : [b, a];
          x = (left.right + right.left) / 2;
          y = Math.max(left.top, right.top) + 10;
        } else if (verticalOverlap <= 0 && horizontalOverlap > 0) {
          const [top, bottom] = a.top < b.top ? [a, b] : [b, a];
          x = (Math.max(top.left, bottom.left) + Math.min(top.right, bottom.right)) / 2;
          y = (top.bottom + bottom.top) / 2;
        } else {
          x = (a.left + a.right + b.left + b.right) / 4;
          y = Math.min(a.top, b.top) + 10;
        }
      } else if (distinct.length === 1 && distinct[0].node.type === 'container') {
        x = boxes[0].left + 190;
        y = boxes[0].top + 28;
      } else {
        x = boxes.reduce((sum, box) => sum + (box.left + box.right) / 2, 0) / boxes.length;
        y = boxes.reduce((sum, box) => sum + (box.top + box.bottom) / 2, 0) / boxes.length;
      }
      return [
        {
          id: hotspot.id,
          projectionKey: distinct
            .map((anchor) => anchor.elementId)
            .sort()
            .join('|'),
          x,
          y,
          title: hotspot.workshop ? `Atelier · ${hotspot.title}` : hotspot.title,
          titles: [hotspot.title],
          hotspotIds: [hotspot.id],
          count: 1,
          severity: hotspot.severity,
          political: hotspot.complexity.political,
          implementation: hotspot.complexity.implementation,
          workshop: Boolean(hotspot.workshop),
          projectedElementIds: distinct.map((anchor) => anchor.elementId),
        },
      ];
    });
    return markers;
  }, [layout.nodes, model, childLists, detail, props.hotspots]);
  const [textObstacles, setTextObstacles] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const [measuredMarkerPositions, setMeasuredMarkerPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [textMeasurementVersion, setTextMeasurementVersion] = useState(0);
  const measurementViewport = useRef(viewport);
  measurementViewport.current = viewport;
  // biome-ignore lint/correctness/useExhaustiveDependencies: A new layout replaces the card elements being observed.
  useEffect(() => {
    const surface = container.current?.querySelector<HTMLElement>('.map-flow-surface');
    if (!surface) return;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTextMeasurementVersion((version) => version + 1));
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(surface);
    for (const card of surface.querySelectorAll('.business-card')) observer.observe(card);
    window.addEventListener('resize', refresh);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      cancelAnimationFrame(frame);
    };
  }, [layout.nodes]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Resize measurements invalidate the DOM text geometry even when anchors remain unchanged.
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const surface = container.current?.querySelector<HTMLElement>('.map-flow-surface');
      const { x: panX, y: panY, zoom } = measurementViewport.current;
      if (!surface || !zoom) return;
      const surfaceRect = surface.getBoundingClientRect();
      const targets = [...surface.querySelectorAll<HTMLElement>('[data-business-area-summary], [data-map-item-id]')];
      const targetById = new Map<string, HTMLElement>();
      for (const target of targets) {
        for (const attribute of ['data-business-area-summary', 'data-map-item-id']) {
          const id = target.getAttribute(attribute);
          if (id && !targetById.has(id)) targetById.set(id, target);
        }
      }
      const next: Record<string, { x: number; y: number }> = {};
      for (const marker of hotspotMarkers) {
        if (marker.projectedElementIds.length !== 1) continue;
        const id = marker.projectedElementIds[0];
        const target = targetById.get(id);
        if (!target) continue;
        const rect = target.getBoundingClientRect();
        const x = (rect.right - 16 - surfaceRect.left - panX) / zoom;
        const y = (rect.top + rect.height / 2 - surfaceRect.top - panY) / zoom;
        next[marker.id] = { x, y };
      }
      const obstacles: { x: number; y: number; width: number; height: number }[] = [];
      for (const element of surface.querySelectorAll(
        '.business-card, .container-label, .category-banner, small, h3, p, .overview-stats, .overview-hierarchy',
      )) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          for (const rect of range.getClientRects())
            if (rect.width && rect.height)
              obstacles.push({
                x: (rect.left - surfaceRect.left - panX) / zoom,
                y: (rect.top - surfaceRect.top - panY) / zoom,
                width: rect.width / zoom,
                height: rect.height / zoom,
              });
        }
      }
      setTextObstacles((previous) => (JSON.stringify(previous) === JSON.stringify(obstacles) ? previous : obstacles));
      setMeasuredMarkerPositions((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    });
    return () => cancelAnimationFrame(frame);
  }, [hotspotMarkers, canvasWidth, textMeasurementVersion]);
  const visibleTextObstacles = useMemo(
    () =>
      textObstacles.map((rect) => ({
        x: viewport.x + rect.x * viewport.zoom,
        y: viewport.y + rect.y * viewport.zoom,
        width: rect.width * viewport.zoom,
        height: rect.height * viewport.zoom,
      })),
    [textObstacles, viewport.x, viewport.y, viewport.zoom],
  );
  const markerLayout = useMemo(() => {
    const width = surfaceWidth || canvasWidth;
    const height = effectiveZoomMode === 'width' ? widthFrame?.height || minimumHeight : minimumHeight;
    const anchor = (marker: HotspotMarker) => measuredMarkerPositions[marker.id] || { x: marker.x, y: marker.y };
    const screen = (marker: HotspotMarker) => ({
      x: viewport.x + anchor(marker).x * viewport.zoom,
      y: viewport.y + anchor(marker).y * viewport.zoom,
      diameter: HOTSPOT_DIAMETERS[marker.severity],
      id: marker.id,
    });
    // Zoomed-out-of-frame anchors must not pull visible markers into unrelated groups.
    // They become visible again when their location re-enters the map surface.
    const visible = hotspotMarkers
      .map(screen)
      .filter((item) => item.x >= 0 && item.x <= width && item.y >= 0 && item.y <= height);
    const groups = layoutHotspots(visible, { width, height, obstacles: visibleTextObstacles });
    const markerById = new Map(hotspotMarkers.map((marker) => [marker.id, marker]));
    const markers = groups.map((group) => {
      const members = group.ids.flatMap((id) => {
        const marker = markerById.get(id);
        return marker ? [marker] : [];
      });
      return {
        ...members[0],
        id: group.id,
        hotspotIds: group.ids,
        count: group.ids.length,
        projectedElementIds: [...new Set(members.flatMap((marker) => marker.projectedElementIds))],
        position: { x: group.x, y: group.y },
        anchor: group.anchor,
      };
    });
    return { markers };
  }, [
    hotspotMarkers,
    measuredMarkerPositions,
    visibleTextObstacles,
    canvasWidth,
    surfaceWidth,
    effectiveZoomMode,
    widthFrame?.height,
    minimumHeight,
    viewport.x,
    viewport.y,
    viewport.zoom,
  ]);
  const lastMarkerLayout = useRef<typeof markerLayout | null>(null);
  useLayoutEffect(() => {
    if (!clusterExpanded) lastMarkerLayout.current = markerLayout;
  }, [markerLayout, clusterExpanded]);
  const displayedMarkerLayout = clusterExpanded && lastMarkerLayout.current ? lastMarkerLayout.current : markerLayout;
  const hoveredElementIds = new Set(
    hotspotRelatedElementIds(
      model,
      (props.hotspots || []).filter((item) => hoveredHotspotIds.includes(item.id)),
      hotspotMarkers
        .filter((marker) => hoveredHotspotIds.includes(marker.id))
        .flatMap((marker) => marker.projectedElementIds),
    ),
  );
  const displayedNodes = hoveredElementIds.size
    ? nodes.map((node) => ({
        ...node,
        data: { ...node.data, hotspotRelatedIds: [...hoveredElementIds] },
        className:
          `${node.className || ''}${hoveredElementIds.has(node.id.replace(/^group:/, '')) || hoveredElementIds.has((node.data.area as { id?: string } | undefined)?.id || '') ? ' hotspot-related' : ''}`.trim(),
      }))
    : nodes;
  const select = useCallback(
    (_event: unknown, node: Node) => {
      if (node.type === 'business') props.onSelect(node.id);
    },
    [props.onSelect],
  );
  const emptyScope = scopeId ? model.nodeById.get(scopeId) : undefined;
  const referenceCapabilities =
    emptyScope?.kind === 'reference'
      ? model.relations
          .filter((r) => r.type === 'documents-reference' && r.targetId === emptyScope.id)
          .map((r) => requiredNode(model, r.sourceId))
      : [];
  if (emptyScope && referenceCapabilities.length)
    return (
      <div className="graph-canvas empty-state">
        <NodeIcon node={emptyScope} size={38} />
        <h2>{emptyScope.name}</h2>
        <p>
          <ModelText text={emptyScope.definition} />
        </p>
        <h3>Capacités liées à ce référentiel</h3>
        <ul>
          {referenceCapabilities.map((capability) => (
            <li key={capability.id}>
              <button type="button" onClick={() => props.onSelect(capability.id)}>
                {capability.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  if (
    emptyScope &&
    ['group', 'area', 'business_area', 'reference'].includes(emptyScope.kind) &&
    !childrenOf(model, emptyScope.id).length
  )
    return (
      <div className="graph-canvas empty-state">
        <NodeIcon node={emptyScope} size={38} />
        <h2>{emptyScope.name}</h2>
        <p>Aucun élément publié dans ce périmètre.</p>
      </div>
    );
  if (error)
    return (
      <div className="empty-state" role="alert">
        Le placement a échoué : {error}
      </div>
    );
  // Page mode keeps a fixed viewport so fitView can frame the complete map.
  const canvasHeight = effectiveZoomMode === 'width' ? widthFrame?.height : minimumHeight;
  return (
    <div
      ref={container}
      className={`graph-canvas zoom-${effectiveZoomMode} ${fixedSlots ? 'fixed-placement' : ''} ${capabilityOverview ? 'capabilities-canvas' : ''} ${nativeTouchScroll ? 'touch-scroll' : ''}`}
      style={canvasHeight ? { height: canvasHeight } : undefined}
      data-testid="react-flow-canvas"
      data-layout-ms={layout.ms}
    >
      <div
        className="map-flow-surface"
        style={
          effectiveZoomMode === 'width' && widthFrame ? { height: widthFrame.height, width: surfaceWidth } : undefined
        }
      >
        <ReactFlow
          nodes={displayedNodes}
          edges={[]}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          onNodeClick={select}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          zoomOnPinch={effectiveZoomMode === 'page' && !nativeTouchScroll}
          zoomOnScroll={effectiveZoomMode === 'page' && !capabilityOverview}
          preventScrolling={effectiveZoomMode === 'page' && !capabilityOverview}
          minZoom={effectiveZoomMode === 'page' ? 0.01 : 0.2}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: fullscreen ? 0.04 : 0.01, maxZoom: 1 }}
          proOptions={{ hideAttribution: false }}
          ariaLabelConfig={{
            'controls.zoomIn.ariaLabel': 'Agrandir',
            'controls.zoomOut.ariaLabel': 'Réduire',
            'controls.fitView.ariaLabel': 'Centrer la carte',
          }}
        >
          <Background gap={24} size={1} color="#d8e3df" />
          {effectiveZoomMode === 'page' && <Controls showInteractive={false} />}
        </ReactFlow>
        {displayedMarkerLayout.markers.length > 0 && (
          <div className="hotspot-map-overlay">
            {displayedMarkerLayout.markers.map((marker) => (
              <HotspotMapMarker
                key={marker.id}
                id={marker.id}
                items={(props.hotspots || []).filter((item) => marker.hotspotIds.includes(item.id))}
                onExpansionChange={setClusterExpanded}
                x={marker.position.x}
                y={marker.position.y}
                model={model}
                onOpen={(id, ids) => props.onOpenHotspot?.(id, ids)}
                onHighlight={(active, ids) => setHoveredHotspotIds(active ? ids : [])}
              />
            ))}
          </div>
        )}
      </div>
      {!graph.nodes.length && (
        <div className="empty-state">
          <FileText />
          Ce périmètre est réservé.
        </div>
      )}
    </div>
  );
}
export function ReactFlowPane(props: ReactFlowPaneProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
