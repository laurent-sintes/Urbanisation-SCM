import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { NodeIcon } from './icons';
import { startsCapabilityTypeSection } from './capabilityTypes';
import { categoryCaption, categoryOf, startsCategorySection } from './categories';
import { roleOf } from './subdomainRoles';
import { businessAreaSections, directSectionCaption, startsDirectSection } from './mapSections';
import { structuralMap } from './mapProjection';
import { widthFit, type MapZoomMode } from './mapZoom';
import { ModelText } from './components/ModelLinks';
import { childrenOf, rootsOf, parentRelationOf, cardChildListOf, cardListedItems, cardContentSummary, type CardChildList } from './model';
import { kindLabel, modelingDepthLabel, shortText } from './presentation';
import type { AtlasNode, PublishedModel } from './types';
import '@xyflow/react/dist/style.css';

type Card = Node<{ item: AtlasNode; count: number; summary: string; parentName?: string; childList?: CardChildList; detail: number; selectedId: string; behaviorsByCapability: Record<string, AtlasNode[]>; onHeight: (id: string, height: number) => void; onExplore: (id: string) => void; onRead: (id: string) => void; highlighted: boolean; muted: boolean }, 'business'>;
type Container = Node<{ item: AtlasNode }, 'container'>;
function OverviewName({ item }: { item: AtlasNode }) { return <>{item.name}</>; }
function BusinessCard({ data, selected }: NodeProps<Card>) {
  const dominantRole = roleOf(data.item);
  const presentation = data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level';
  const card = useRef<HTMLElement>(null);
  const expanded = data.childList !== undefined;
  const listed = data.childList ? cardListedItems(data.childList) : [];
  const visibleCount = data.childList?.businessAreaChildren && data.detail < 3 ? data.childList.items.length : listed.length;
  const listLabel = data.childList?.businessAreaChildren ? (data.detail >= 3 ? 'Business Areas et capacités' : 'Business Areas') : data.childList?.kind === 'domain' ? 'Domaines' : data.childList?.kind === 'mixed' ? 'Périmètres et éléments' : data.childList?.kind === 'reference' ? 'Référentiels' : data.childList?.kind === 'behavior' ? 'Comportements' : 'Capacités';
  const childLink = (child: AtlasNode) => <><button data-map-item-id={child.id} aria-current={data.selectedId === child.id ? 'true' : undefined} className={`card-child-link ${child.kind === 'reference' ? 'reference-link' : child.kind === 'behavior' ? 'behavior-link' : 'capacity-link'}`} onClick={() => data.onRead(child.id)}><NodeIcon node={child} size={16}/><span>{child.name}</span><ArrowUpRight size={12} className="child-arrow"/></button>{data.detail >= 4 && data.behaviorsByCapability[child.id]?.length ? <ul className="card-behavior-list" aria-label={`Comportements de ${child.name}`}>{data.behaviorsByCapability[child.id].map(behavior => <li key={behavior.id}><button data-map-item-id={behavior.id} aria-current={data.selectedId === behavior.id ? 'true' : undefined} className="card-child-link behavior-link" onClick={() => data.onRead(behavior.id)}><NodeIcon node={behavior} size={14}/><span>{behavior.name}</span><ArrowUpRight size={12} className="child-arrow"/></button></li>)}</ul> : null}</>;
  useLayoutEffect(() => {
    if (!card.current) return;
    // Measure the natural card height, not the equal height assigned to its row.
    const measure = () => {
      if (!card.current) return;
      const assignedHeight = card.current.style.height;
      card.current.style.height = 'auto';
      const naturalHeight = card.current.offsetHeight;
      card.current.style.height = assignedHeight;
      data.onHeight(data.item.id, naturalHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card.current);
    return () => observer.disconnect();
  }, [expanded, data.item, data.childList, data.detail, data.behaviorsByCapability, data.onHeight]);
  return <article ref={card} className={`business-card ${expanded ? 'has-child-list' : ''} ${selected ? 'is-selected' : ''} ${presentation ? 'is-presentation' : ''} ${data.highlighted ? 'is-highlighted' : ''} ${data.muted ? 'is-muted' : ''}`} style={{ height: '100%' }} data-node-id={data.item.id} data-kind={data.item.kind} data-depth={String(data.item.fields.modeling_depth || '')}>
    <div className="card-eyebrow"><NodeIcon node={data.item} size={22}/><span>{kindLabel(data.item)}</span></div>
    {data.parentName && <small className="map-card-parent">{data.parentName}</small>}
    <h3><button className="overview-name-link nodrag nopan" onClick={event => { event.stopPropagation(); data.onRead(data.item.id); }}>{data.item.name}</button></h3>
    {modelingDepthLabel(data.item) && <span className="modeling-depth">{modelingDepthLabel(data.item)}</span>}
    {dominantRole && <span className="subdomain-role" data-role={dominantRole.id} title="Finalité dominante ; les autres responsabilités du sous-domaine restent applicables.">{dominantRole.display_name}</span>}
    <p>{shortText(data.item.purpose || data.item.definition || 'Description non renseignée dans cette publication.', 115)}</p>
    {data.childList && <div className="card-child-list nodrag nopan nowheel" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()} onKeyDown={event => { if (['Enter', ' '].includes(event.key)) event.stopPropagation(); }}>
      <div className="child-list-heading">{listLabel} <span>{visibleCount}</span></div>
      {data.childList.items.length ? <ul aria-label={`${listLabel} de ${data.item.name}`}>
        {data.childList.items.map((child, index) => child.kind === 'business_area' && data.childList?.businessAreaChildren ? <li key={child.id} className="business-area-list-group"><div className="category-list-banner" data-business-area-summary={child.id}><button className="nodrag nopan" aria-current={data.selectedId === child.id ? 'true' : undefined} onClick={() => data.onRead(child.id)}>{child.name}</button></div>{data.detail >= 3 && <ul aria-label={`Capacités de ${child.name}`}>{data.childList.businessAreaChildren[child.id].map(capability => <li key={capability.id}>{childLink(capability)}</li>)}</ul>}</li> : <li key={child.id} className={startsCapabilityTypeSection(data.childList!.items, index) ? 'capability-type-section-start' : undefined}>{data.childList?.businessAreaChildren && startsDirectSection(data.childList.items, index) && <div className="category-list-banner">{directSectionCaption([child])}</div>}{data.item.kind === 'area' && startsCategorySection(data.childList!.items, index) && <div className="category-list-banner">{categoryCaption(child)}</div>}{childLink(child)}</li>)}
      </ul> : <p>Aucun élément publié.</p>}
    </div>}
    <div className="card-bottom"><span>{data.summary || kindLabel(data.item)}</span><button className="nodrag nopan" aria-label={`${data.count ? 'Explorer' : 'Sélectionner'} ${data.item.name}`} onClick={e => { e.stopPropagation(); (data.count ? data.onExplore : data.onRead)(data.item.id); }}>{data.count ? 'Explorer' : 'Sélectionner'}<ArrowUpRight size={13}/></button></div>
  </article>;
}
function GroupCard({ data }: NodeProps<Container>) {
  const role = roleOf(data.item);
  return <div className={`map-container ${data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level' ? 'presentation-container' : ''}`}><div className="container-label"><NodeIcon node={data.item} size={20}/><strong><OverviewName item={data.item}/></strong><span>{kindLabel(data.item)}</span>{role && <span className="subdomain-role" data-role={role.id}>{role.display_name}</span>}</div></div>;
}
function CapabilityTypeDivider() { return <div className="map-capability-type-divider" role="separator" aria-label="Changement de type de capacité"/>; }
function CategoryBanner({ data }: NodeProps<Node<{ caption: string; area?: AtlasNode }, 'categoryBanner'>>) {
  return <div className="category-banner" role="heading" aria-level={3} data-business-area={data.area?.id}>{data.caption}</div>;
}
const nodeTypes = { business: BusinessCard, container: GroupCard, capabilityTypeDivider: CapabilityTypeDivider, categoryBanner: CategoryBanner };

export interface ReactFlowPaneProps {
  model: PublishedModel; selectedId: string; scopeId?: string;
  detail?: number; zoomMode?: MapZoomMode; focusId?: string;
  onSelect: (id: string) => void; onExplore: (id: string) => void; onRead: (id: string) => void;
  perspective: string;
}
function Canvas(props: ReactFlowPaneProps) {
  const { model, selectedId, scopeId, perspective, detail = 0, zoomMode = 'page', focusId } = props;
  const [layout, setLayout] = useState<{nodes: Node[]; ms: number; width: number; height: number}>({ nodes: [], ms: 0, width: 0, height: 0 });
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [touch, setTouch] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [error, setError] = useState('');
  const { fitView, setViewport } = useReactFlow();
  const container = useRef<HTMLDivElement>(null);
  const capabilityOverview = detail >= 3;
  const nativeTouchScroll = (zoomMode === 'width' || capabilityOverview) && touch;
  useEffect(() => {
    const pointer = matchMedia('(pointer: coarse)');
    const updatePointer = () => setTouch(pointer.matches);
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    pointer.addEventListener('change', updatePointer);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => { pointer.removeEventListener('change', updatePointer); document.removeEventListener('fullscreenchange', updateFullscreen); };
  }, []);
  const onHeight = useCallback((id: string, height: number) => {
    setCardHeights(previous => previous[id] === height ? previous : { ...previous, [id]: height });
  }, []);
  const areaSections = useMemo(() => detail === 0 ? businessAreaSections(model, scopeId) : undefined, [model, scopeId, detail]);
  const graph = useMemo(() => {
    if (!scopeId) return { nodes: rootsOf(model), group: undefined };
    const projection = structuralMap(model, scopeId, detail);
    if (projection) return projection;
    const scope = model.nodeById.get(scopeId);
    if (!scope) return { nodes: [], group: undefined };
    const children = areaSections ? areaSections.flatMap(section => section.items) : childrenOf(model, scopeId);
    // Cards only express explicit structure. A leaf never expands into business neighbours here.
    return children.length ? { nodes: [scope, ...children], group: scope } : { nodes: [scope], group: undefined };
  }, [model, scopeId, areaSections, detail]);
  useEffect(() => {
    let current = true;
    const start = performance.now();
    setError('');
    const group = graph.group;
    const items = graph.nodes.filter(n => n.id !== group?.id);
    const childLists = new Map<string, CardChildList>();
    if (detail >= 2) for (const item of items) {
      const list = cardChildListOf(model, item);
      if (!list) continue;
      if (item.kind === 'area' && list.businessAreaChildren && detail === 2) {
        childLists.set(item.id, { ...list, businessAreaChildren: Object.fromEntries(Object.keys(list.businessAreaChildren).map(id => [id, []])) });
      } else childLists.set(item.id, list);
    }
    const inputs = items.map(n => ({ id: n.id, width: 300, height: cardHeights[n.id] || (childLists.has(n.id) ? 260 + childLists.get(n.id)!.items.length * 34 : n.fields.modeling_depth ? 280 : 220) }));
    // A bounded grid keeps cards readable; it does not create model relationships.
    const availableColumns = Math.max(1, Math.floor((canvasWidth - 60 + 28) / 328));
    const columns = Math.min(items.length, capabilityOverview ? Math.min(fullscreen ? 4 : 3, availableColumns) : items.length > 4 ? Math.min(fullscreen ? 4 : 3, availableColumns) : Math.min(2, availableColumns)) || 1;
    const categorized = group?.kind === 'area' && items.some(categoryOf);
    const sectionByItem = new Map(areaSections?.flatMap(section => section.items.map(item => [item.id, section] as const)));
    const startsArea = (index: number) => !!areaSections && (index === 0 || sectionByItem.get(items[index].id) !== sectionByItem.get(items[index - 1].id));
    const boundaries = [0, ...items.flatMap((_, index) => index > 0 && (startsArea(index) || categorized && startsCategorySection(items, index) || startsCapabilityTypeSection(items, index)) ? [index] : []), items.length];
    const sections = boundaries.slice(0, -1).map((start, index) => inputs.slice(start, boundaries[index + 1]));
    const positioned: (typeof inputs[number] & { x: number; y: number })[] = [];
    let top = 16;
    const dividerPositions: number[] = [];
    const banners: { caption: string; y: number; area?: AtlasNode }[] = [];
    sections.forEach((section, sectionIndex) => {
      const start = boundaries[sectionIndex];
      if (startsArea(start)) {
        const businessSection = sectionByItem.get(items[start].id);
        const area = businessSection?.area;
        banners.push({caption: area?.name || directSectionCaption(businessSection?.items || []), area, y: top}); top += 64;
      } else if (categorized && startsCategorySection(items, start)) {
        banners.push({ caption: categoryCaption(items[start]), y: top }); top += 52;
      } else if (sectionIndex) { dividerPositions.push(top - 7); top += 14; }
      for (let offset = 0; offset < section.length; offset += columns) {
        const row = section.slice(offset, offset + columns);
        const rowHeight = Math.max(...row.map(item => item.height));
        row.forEach((item, column) => positioned.push({ ...item, height: rowHeight, x: 16 + column * 328, y: top }));
        top += rowHeight + 28;
      }
    });
    const placement = Promise.resolve({
      id: 'canvas', width: columns * 300 + (columns - 1) * 28 + 32,
      height: Math.max(32, top - 12), children: positioned,
    });
    placement.then(result => {
      if (!current) return;
      const nodes: Node[] = [];
      if (group) nodes.push({ id: `group:${group.id}`, type: 'container', data: { item: group }, position: { x: 0, y: 0 }, width: (result.width || 380) + 28, height: (result.height || 250) + 70, style: { width: (result.width || 380) + 28, height: (result.height || 250) + 70 }, selectable: false, draggable: false, focusable: false });
      banners.forEach((banner, index) => nodes.push({ id: `category-banner:${scopeId}:${index}`, type: 'categoryBanner', data: { caption: banner.caption, area: banner.area },
        position: { x: 16 + (group ? 14 : 0), y: banner.y + (group ? 54 : 0) },
        ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}),
        width: result.width - 32, height: areaSections ? 52 : 40, style: { width: result.width - 32, height: areaSections ? 52 : 40 }, selectable: false, draggable: false, focusable: false }));
      dividerPositions.forEach((dividerY, index) => nodes.push({ id: `capability-type-divider:${scopeId}:${index}`, type: 'capabilityTypeDivider', data: {},
        position: { x: 16 + (group ? 14 : 0), y: dividerY + (group ? 54 : 0) },
        ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}),
        width: result.width - 32, height: 1, style: { width: result.width - 32, height: 1 },
        selectable: false, draggable: false, focusable: false }));
      for (const position of result.children || []) {
        const item = model.nodeById.get(position.id)!;
        // Explicit dimensions keep a controlled node measurable during selection updates.
        // CSS sizes alone briefly hide it between the two clicks of a double-click.
        const childList = childLists.get(item.id);
        const behaviorsByCapability = detail >= 4 && childList ? Object.fromEntries(cardListedItems(childList).filter(child => child.kind === 'capability').map(child => [child.id, childrenOf(model, child.id).filter(behavior => behavior.kind === 'behavior')])) : {};
        nodes.push({ id: item.id, type: 'business', data: { item, childList, detail, behaviorsByCapability }, position: { x: (position.x || 0) + (group ? 14 : 0), y: (position.y || 0) + (group ? 54 : 0) }, ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}), width: 300, height: position.height, style: { width: 300, height: position.height }, draggable: false, ariaLabel: `${kindLabel(item)} ${item.name}` });
      }
      setLayout({ nodes, ms: Math.round(performance.now() - start), width: (result.width || 380) + (group ? 28 : 0), height: (result.height || 250) + (group ? 70 : 0) });
    }).catch(e => current && setError(String(e)));
    return () => { current = false; };
  }, [graph, model, scopeId, areaSections, capabilityOverview, cardHeights, canvasWidth, detail, fullscreen]);
  const minimumHeight = fullscreen ? Math.max(120, availableHeight) : matchMedia('(max-width: 600px)').matches ? 420 : 600;
  const widthFrame = layout.width && canvasWidth ? widthFit(layout.width, layout.height, canvasWidth, minimumHeight) : undefined;
  useEffect(() => {
    if (!layout.nodes.length || !canvasWidth) return;
    const id = setTimeout(() => {
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
      if (zoomMode === 'width' && widthFrame) void setViewport({ x: widthFrame.x, y: widthFrame.y, zoom: widthFrame.zoom }, { duration });
      else void fitView({ padding: fullscreen ? 0.04 : 0.01, maxZoom: fullscreen ? 1.6 : 1, duration });
    }, 80);
    return () => clearTimeout(id);
  }, [layout, canvasWidth, availableHeight, fitView, setViewport, fullscreen, zoomMode]);
  useEffect(() => {
    if (!focusId) return;
    const timer = setTimeout(() => {
      const target = [...(container.current?.querySelectorAll<HTMLElement>('[data-node-id], [data-business-area-summary], [data-map-item-id]') || [])].find(element => element.dataset.nodeId === focusId || element.dataset.businessAreaSummary === focusId || element.dataset.mapItemId === focusId);
      target?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, 160);
    return () => clearTimeout(timer);
  }, [focusId, layout]);
  useEffect(() => { container.current?.scrollTo({ top: 0, behavior: 'instant' }); }, [zoomMode, scopeId, detail]);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(() => {
      setCanvasWidth(container.current!.clientWidth);
      if (fullscreen) setAvailableHeight(container.current!.clientHeight);
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [scopeId, fullscreen]);
  const canExplore = useCallback((id: string) => {
    const item = model.nodeById.get(id);
    return item?.kind === 'domain' && scopeId !== id;
  }, [model, scopeId]);
  const nodes = useMemo(() => layout.nodes.map(n => n.type !== 'business' ? n : { ...n, selected: n.id === selectedId, data: { ...n.data, selectedId, onHeight, count: canExplore(n.id) ? Math.max(1, childrenOf(model, n.id).length) : 0, parentName: ['area','business_area'].includes(model.nodeById.get(n.id)?.kind || '') ? model.nodeById.get(parentRelationOf(model, n.id)?.sourceId || '')?.name : undefined, summary: cardContentSummary(model, model.nodeById.get(n.id)!), onExplore: props.onExplore, onRead: props.onRead, highlighted: Boolean(perspective && model.nodeById.get(n.id)?.status === perspective), muted: Boolean(perspective && model.nodeById.get(n.id)?.status !== perspective) } }), [layout, selectedId, model, canExplore, props.onExplore, props.onRead, perspective, onHeight]);
  const select = useCallback((_event: unknown, node: Node) => { if (node.type === 'business') props.onSelect(node.id); }, [props.onSelect]);
  const emptyScope = scopeId ? model.nodeById.get(scopeId) : undefined;
  const referenceCapabilities = emptyScope?.kind === 'reference' ? model.relations.filter(r => r.type === 'documents-reference' && r.targetId === emptyScope.id).map(r => model.nodeById.get(r.sourceId)!) : [];
  if (emptyScope && referenceCapabilities.length) return <div className="graph-canvas empty-state"><NodeIcon node={emptyScope} size={38}/><h2>{emptyScope.name}</h2><p><ModelText text={emptyScope.definition}/></p><h3>Capacités liées à ce référentiel</h3><ul>{referenceCapabilities.map(capability => <li key={capability.id}><button onClick={() => props.onSelect(capability.id)}>{capability.name}</button></li>)}</ul></div>;
  if (emptyScope && ['group', 'area', 'business_area', 'reference'].includes(emptyScope.kind) && !childrenOf(model, emptyScope.id).length) return <div className="graph-canvas empty-state"><NodeIcon node={emptyScope} size={38}/><h2>{emptyScope.name}</h2><p>Aucun élément publié dans ce périmètre.</p></div>;
  if (error) return <div className="empty-state" role="alert">Le placement a échoué : {error}</div>;
  // Page mode keeps a fixed viewport so fitView can frame the complete map.
  const canvasHeight = zoomMode === 'width' ? widthFrame?.height : minimumHeight;
  return <div ref={container} className={`graph-canvas zoom-${zoomMode} ${capabilityOverview ? 'capabilities-canvas' : ''} ${nativeTouchScroll ? 'touch-scroll' : ''}`} style={!fullscreen && canvasHeight ? { height: canvasHeight } : undefined} data-testid="react-flow-canvas" data-layout-ms={layout.ms}>
    <div className="map-flow-surface" style={zoomMode === 'width' && widthFrame ? { height: widthFrame.height } : undefined}>
    <ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} onNodeClick={select} zoomOnDoubleClick={false} panOnDrag={false} zoomOnPinch={zoomMode === 'page' && !nativeTouchScroll} zoomOnScroll={zoomMode === 'page' && !capabilityOverview} preventScrolling={zoomMode === 'page' && !capabilityOverview} minZoom={zoomMode === 'page' ? 0.01 : 0.2} maxZoom={2} fitView fitViewOptions={{ padding: fullscreen ? 0.04 : 0.01, maxZoom: fullscreen ? 1.6 : 1 }} proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'controls.zoomIn.ariaLabel': 'Agrandir', 'controls.zoomOut.ariaLabel': 'Réduire', 'controls.fitView.ariaLabel': 'Centrer la carte' }}>
      <Background gap={24} size={1} color="#d8e3df"/>
      {zoomMode === 'page' && <Controls showInteractive={false}/>}
    </ReactFlow>
    </div>
    {!graph.nodes.length && <div className="empty-state"><FileText/>Ce périmètre est réservé.</div>}
  </div>;
}
export function ReactFlowPane(props: ReactFlowPaneProps) { return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>; }
