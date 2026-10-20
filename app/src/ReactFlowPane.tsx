import {
  Background,
  Controls,
  getViewportForBounds,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prominentChildIndex } from './adaptiveLayout';
import { projectedApplicationMapIds } from './applicationCatalog';
import { startsCapabilityTypeSection } from './capabilityTypes';
import { categoryCaption, categoryOf, startsCategorySection } from './categories';
import { HotspotMapMarker } from './components/HotspotDisplay';
import { type MapChildList, nodeTypes } from './components/MapCards';
import { ModelText } from './components/ModelLinks';
import { hotspotRelatedElementIds } from './hotspotMap';
import {
  CATALOGUE_HOTSPOT_HEADROOM,
  catalogueHotspotDock,
  HOTSPOT_DIAMETERS,
  hotspotPlacementNeedsSpace,
  layoutHotspots,
} from './hotspotPlacement';
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
  visibleAncestorId,
} from './model';
import { kindLabel } from './presentation';
import type { ApplicationMapping, AtlasNode, Hotspot, PublishedModel } from './types';
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
  perspective: string;
  hotspots?: Hotspot[];
  selectedHotspotId?: string;
  applicationMappings?: ApplicationMapping[];
  onOpenHotspot?: (id: string, groupIds?: string[]) => void;
  onScopeHotspotHighlight?: (active: boolean) => void;
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
  arbitration: string;
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
  const [pageWidth, setPageWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [touch, setTouch] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [error, setError] = useState('');
  const { setViewport, viewportInitialized } = useReactFlow();
  const viewport = useViewport();
  const container = useRef<HTMLDivElement>(null);
  const capabilityOverview = detail >= 3;
  const reserveContext = `${model.version}:${scopeId}:${detail}:${zoomMode}:${canvasWidth}:${availableHeight}:${fullscreen}:${props.hotspots?.map((item) => item.id).join('|')}`;
  const [reservedContext, setReservedContext] = useState('');
  const hotspotHeadroom = reservedContext === reserveContext && props.hotspots?.length ? CATALOGUE_HOTSPOT_HEADROOM : 0;
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
        pageWidth || canvasWidth,
        minimumHeight,
        'page',
        false,
        measure,
        fixedSlots,
        graph.group?.kind === 'domain',
      );
      const mode = resolveMapZoom(zoomMode, detail, pageGrid.pageZoom);
      const grid =
        mode === 'page'
          ? pageGrid
          : chooseMapGrid(
              gridSections,
              canvasWidth,
              minimumHeight,
              'width',
              false,
              measure,
              fixedSlots,
              graph.group?.kind === 'domain',
            );
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
        width: grid.width,
        height: Math.max(32, top - 12),
        children: positioned,
      };
      const nodes: Node[] = [];
      banners.forEach((banner, index) => {
        nodes.push({
          id: `category-banner:${scopeId}:${index}`,
          type: 'categoryBanner',
          data: { caption: banner.caption, area: banner.area },
          position: { x: 16, y: banner.y },
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
          position: { x: 16, y: dividerY },
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
          position: { x: position.x || 0, y: position.y || 0 },
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
        width: result.width,
        height: result.height,
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
    pageWidth,
    detail,
    minimumHeight,
    zoomMode,
    fixedSlots,
  ]);
  const effectiveZoomMode = layout.mode;
  const nativeTouchScroll = effectiveZoomMode === 'width' && touch;
  const fittedWidth =
    layout.width && canvasWidth
      ? widthFit(layout.width, layout.height, canvasWidth, Math.max(1, minimumHeight - hotspotHeadroom))
      : undefined;
  const widthFrame = fittedWidth
    ? { ...fittedWidth, y: fittedWidth.y + hotspotHeadroom, height: fittedWidth.height + hotspotHeadroom }
    : undefined;
  const surfaceWidth = effectiveZoomMode === 'width' ? canvasWidth : undefined;
  const frameX = widthFrame?.x;
  const frameY = widthFrame?.y;
  const frameZoom = widthFrame?.zoom;
  useEffect(() => {
    if (!viewportInitialized || !layout.nodes.length || !canvasWidth) return;
    const id = setTimeout(() => {
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
      if (effectiveZoomMode === 'width' && frameX !== undefined && frameY !== undefined && frameZoom !== undefined)
        void setViewport({ x: frameX, y: frameY, zoom: frameZoom }, { duration });
      else {
        // Leave real pixels around the fit: fractional scrollport dimensions and
        // React Flow's rounded padding can otherwise clip the last row.
        const fitted = getViewportForBounds(
          { x: 0, y: 0, width: layout.width, height: layout.height },
          Math.max(1, canvasWidth - 4),
          Math.max(1, minimumHeight - hotspotHeadroom - 4),
          0,
          1,
          fullscreen ? 0.04 : 0.01,
        );
        void setViewport({ ...fitted, x: fitted.x + 2, y: Math.min(fitted.y + 2, 32) + hotspotHeadroom }, { duration });
      }
    }, 80);
    return () => clearTimeout(id);
  }, [
    viewportInitialized,
    layout,
    canvasWidth,
    minimumHeight,
    setViewport,
    fullscreen,
    effectiveZoomMode,
    frameX,
    frameY,
    frameZoom,
    hotspotHeadroom,
  ]);
  useEffect(() => {
    // A queued page fit can finish after a framing change. Width mode has one
    // fixed camera; reading moves through the outer native scrollport.
    if (
      effectiveZoomMode === 'width' &&
      viewportInitialized &&
      frameX !== undefined &&
      frameY !== undefined &&
      frameZoom !== undefined &&
      (Math.abs(viewport.x - frameX) > 0.01 ||
        Math.abs(viewport.y - frameY) > 0.01 ||
        Math.abs(viewport.zoom - frameZoom) > 0.001)
    )
      void setViewport({ x: frameX, y: frameY, zoom: frameZoom }, { duration: 0 });
  }, [
    effectiveZoomMode,
    viewportInitialized,
    frameX,
    frameY,
    frameZoom,
    viewport.x,
    viewport.y,
    viewport.zoom,
    setViewport,
  ]);
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
      // Use the visible scrollport, independently of the map surface's intrinsic size.
      setCanvasWidth(scroll?.clientWidth || target.clientWidth);
      setPageWidth(scroll ? scroll.getBoundingClientRect().width - scroll.clientLeft * 2 : target.clientWidth);
      const offset = scroll
        ? target.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - scroll.clientTop
        : 0;
      setAvailableHeight(Math.max(60, (scroll?.clientHeight || target.clientHeight) - offset));
    };
    const observer = new ResizeObserver(update);
    const observed = new Set<Element>();
    const observe = () => {
      const elements = new Set<Element>([target, ...(scroll ? [scroll, ...scroll.children] : [])]);
      for (const element of observed)
        if (!elements.has(element)) {
          observer.unobserve(element);
          observed.delete(element);
        }
      for (const element of elements)
        if (!observed.has(element)) {
          observer.observe(element);
          observed.add(element);
        }
      update();
    };
    // Observe the complete legend shell, including its compact toggle, and any
    // other header row. Changes of overlays must reframe the remaining space.
    const mutations = new MutationObserver(observe);
    if (scroll) mutations.observe(scroll, { childList: true });
    observe();
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
  const visibleElements = useMemo(() => {
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
    // The current scope remains a projection anchor for its published overlays,
    // even though its enclosing presentation card is no longer drawn.
    if (graph.group && layout.nodes.length)
      visible.set(graph.group.id, {
        id: graph.group.id,
        type: 'container',
        data: { item: graph.group },
        position: { x: 0, y: 0 },
        width: layout.width,
        height: layout.height,
      });
    return visible;
  }, [layout.nodes, layout.width, layout.height, graph.group, childLists, detail]);
  const applicationIds = projectedApplicationMapIds(
    model,
    props.applicationMappings || [],
    new Set(visibleElements.keys()),
  );
  const hotspotMarkers = useMemo(() => {
    if (!props.hotspots?.length) return [];
    const visibleIds = new Set(visibleElements.keys());
    const projected = (id: string): { node: Node; elementId: string } | undefined => {
      const elementId = visibleAncestorId(model, id, visibleIds);
      const node = elementId ? visibleElements.get(elementId) : undefined;
      return node && elementId ? { node, elementId } : undefined;
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
          arbitration: hotspot.complexity.arbitration,
          implementation: hotspot.complexity.implementation,
          workshop: Boolean(hotspot.workshop),
          projectedElementIds: distinct.map((anchor) => anchor.elementId),
        },
      ];
    });
    return markers;
  }, [model, visibleElements, props.hotspots]);
  const [textObstacles, setTextObstacles] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const [measuredMarkerPositions, setMeasuredMarkerPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [textMeasurementVersion, setTextMeasurementVersion] = useState(0);
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
    document.fonts.addEventListener('loadingdone', refresh);
    const flow = surface.querySelector('.react-flow__viewport');
    const mutations = new MutationObserver((records) => {
      // Zoom only transforms cached world-space rectangles. Rescan text when
      // card content or styling changes, rather than on each camera movement.
      if (records.some((record) => record.type !== 'attributes' || record.target !== flow)) refresh();
    });
    if (flow)
      mutations.observe(flow, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeFilter: ['style', 'class'],
      });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', refresh);
      document.fonts.removeEventListener('loadingdone', refresh);
      cancelAnimationFrame(frame);
    };
  }, [layout.nodes]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Resize measurements invalidate the DOM text geometry even when anchors remain unchanged.
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const surface = container.current?.querySelector<HTMLElement>('.map-flow-surface');
      const flowViewport = surface?.querySelector<HTMLElement>('.react-flow__viewport');
      if (!surface || !flowViewport) return;
      // The DOM can finish framing before React publishes its camera state. Read
      // the transform applied to the same rectangles to keep anchors in world space.
      const matrix = new DOMMatrix(getComputedStyle(flowViewport).transform);
      const panX = matrix.e,
        panY = matrix.f,
        zoom = matrix.a;
      if (!zoom) return;
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
        const targetsForMarker = marker.projectedElementIds.map((id) => targetById.get(id));
        if (!targetsForMarker.length || targetsForMarker.some((target) => !target)) continue;
        const targets = targetsForMarker as HTMLElement[];
        if (targets.length > 1) {
          const card = targets[0].closest('.business-card');
          if (!card || targets.some((target) => target.closest('.business-card') !== card)) continue;
        }
        const rects = targets.map((target) => target.getBoundingClientRect());
        const x = (Math.max(...rects.map((rect) => rect.right)) - surfaceRect.left - panX) / zoom - 16;
        const y = (rects[0].top + rects[0].height / 2 - surfaceRect.top - panY) / zoom;
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
    const groups = layoutHotspots(visible, {
      width,
      height,
      obstacles: visibleTextObstacles,
      fallbackPositions: catalogueHotspotDock(width),
    });
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
    return { markers, needsHeadroom: hotspotPlacementNeedsSpace(groups, visibleTextObstacles) };
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
  useEffect(() => {
    if (!clusterExpanded && !hotspotHeadroom && markerLayout.needsHeadroom) setReservedContext(reserveContext);
  }, [clusterExpanded, hotspotHeadroom, markerLayout.needsHeadroom, reserveContext]);
  const lastMarkerLayout = useRef<typeof markerLayout | null>(null);
  useLayoutEffect(() => {
    if (!clusterExpanded) lastMarkerLayout.current = markerLayout;
  }, [markerLayout, clusterExpanded]);
  const displayedMarkerLayout = clusterExpanded && lastMarkerLayout.current ? lastMarkerLayout.current : markerLayout;
  const activeHotspotIds = new Set([
    ...(props.selectedHotspotId ? [props.selectedHotspotId] : []),
    ...hoveredHotspotIds,
  ]);
  const hoveredElementIds = new Set(
    hotspotRelatedElementIds(
      model,
      (props.hotspots || []).filter((item) => activeHotspotIds.has(item.id)),
      hotspotMarkers
        .filter((marker) => activeHotspotIds.has(marker.id))
        .flatMap((marker) => marker.projectedElementIds),
    ),
  );
  const scopeHotspotHighlighted = Boolean(scopeId && hoveredElementIds.has(scopeId));
  useEffect(() => {
    props.onScopeHotspotHighlight?.(scopeHotspotHighlighted);
    return () => props.onScopeHotspotHighlight?.(false);
  }, [scopeHotspotHighlighted, props.onScopeHotspotHighlight]);
  const displayedNodes =
    hoveredElementIds.size || applicationIds.size
      ? nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            hotspotRelatedIds: [...hoveredElementIds],
            applicationRelatedIds: [...applicationIds],
          },
          className:
            `${node.className || ''}${hoveredElementIds.has(node.id.replace(/^group:/, '')) || hoveredElementIds.has((node.data.area as { id?: string } | undefined)?.id || '') ? ' hotspot-related' : ''}${applicationIds.has(node.id.replace(/^group:/, '')) ? ' application-related' : ''}`.trim(),
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
      <div ref={container} className="graph-canvas empty-state" style={{ height: 'auto', minHeight: minimumHeight }}>
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
      <div ref={container} className="graph-canvas empty-state" style={{ height: 'auto', minHeight: minimumHeight }}>
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
          nodesFocusable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          onNodeClick={select}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          zoomOnPinch={effectiveZoomMode === 'page' && !nativeTouchScroll}
          zoomOnScroll={false}
          zoomActivationKeyCode={effectiveZoomMode === 'page' && !capabilityOverview ? ['Control', 'Meta'] : null}
          preventScrolling={effectiveZoomMode === 'page' && !capabilityOverview}
          minZoom={0}
          maxZoom={2}
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
            <svg className="catalogue-hotspot-leaders" width="100%" height="100%" aria-hidden="true">
              {displayedMarkerLayout.markers.map((marker) =>
                Math.hypot(marker.position.x - marker.anchor.x, marker.position.y - marker.anchor.y) > 6 ? (
                  <line
                    key={marker.id}
                    data-hotspot-leader={marker.id}
                    x1={marker.anchor.x}
                    y1={marker.anchor.y}
                    x2={marker.position.x}
                    y2={marker.position.y}
                  />
                ) : null,
              )}
            </svg>
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
