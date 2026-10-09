import { Background, Controls, type Node, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prominentChildIndex } from './adaptiveLayout';
import { startsCapabilityTypeSection } from './capabilityTypes';
import { categoryCaption, categoryOf, startsCategorySection } from './categories';
import { type MapChildList, nodeTypes } from './components/MapCards';
import { ModelText } from './components/ModelLinks';
import { NodeIcon } from './icons';
import { measureMapCards } from './mapCardMeasure';
import { areaListAtDetail } from './mapDetail';
import { chooseMapGrid } from './mapLayout';
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
import type { AtlasNode, PublishedModel } from './types';
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
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [touch, setTouch] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [error, setError] = useState('');
  const { fitView, setViewport } = useReactFlow();
  const container = useRef<HTMLDivElement>(null);
  const capabilityOverview = detail >= 3;
  const minimumHeight = fullscreen
    ? Math.max(120, availableHeight)
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
      const pageGrid = chooseMapGrid(gridSections, canvasWidth, minimumHeight, 'page', Boolean(group), measure);
      const mode = resolveMapZoom(zoomMode, detail, pageGrid.pageZoom);
      const grid =
        mode === 'page'
          ? pageGrid
          : chooseMapGrid(gridSections, canvasWidth, minimumHeight, 'width', Boolean(group), measure);
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
  ]);
  const effectiveZoomMode = layout.mode;
  useEffect(() => {
    props.onPageFallbackChange(zoomMode === 'page' && effectiveZoomMode === 'width' && layout.nodes.length > 0);
  }, [zoomMode, effectiveZoomMode, layout.nodes.length, props.onPageFallbackChange]);
  const nativeTouchScroll = (effectiveZoomMode === 'width' || capabilityOverview) && touch;
  const widthFrame =
    layout.width && canvasWidth ? widthFit(layout.width, layout.height, canvasWidth, minimumHeight) : undefined;
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
    container.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [effectiveZoomMode, scopeId, detail]);
  useEffect(() => {
    const target = container.current;
    if (!target) return;
    const observer = new ResizeObserver(() => {
      setCanvasWidth(target.clientWidth);
      if (fullscreen) setAvailableHeight(target.clientHeight);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fullscreen]);
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
      className={`graph-canvas zoom-${effectiveZoomMode} ${capabilityOverview ? 'capabilities-canvas' : ''} ${nativeTouchScroll ? 'touch-scroll' : ''}`}
      style={!fullscreen && canvasHeight ? { height: canvasHeight } : undefined}
      data-testid="react-flow-canvas"
      data-layout-ms={layout.ms}
    >
      <div
        className="map-flow-surface"
        style={effectiveZoomMode === 'width' && widthFrame ? { height: widthFrame.height } : undefined}
      >
        <ReactFlow
          nodes={nodes}
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
