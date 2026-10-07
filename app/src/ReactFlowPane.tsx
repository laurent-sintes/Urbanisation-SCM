import { useEffect, useLayoutEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, Background, Controls, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { NodeIcon } from './icons';
import { startsCapabilityTypeSection } from './capabilityTypes';
import { categoryCaption, categoryOf, startsCategorySection } from './categories';
import { roleOf } from './subdomainRoles';
import { businessAreaSections, directSectionCaption, startsDirectSection } from './mapSections';
import { ReferenceLink, ModelText } from './components/ModelLinks';
import { childrenOf, rootsOf, hasCapabilityCards, cardChildListOf, cardListedItems, cardContentSummary, type CardChildList } from './model';
import { kindLabel, modelingDepthLabel, shortText } from './presentation';
import type { AtlasNode, PublishedModel } from './types';
import '@xyflow/react/dist/style.css';

type Card = Node<{ item: AtlasNode; count: number; summary: string; childList?: CardChildList; onHeight: (id: string, height: number) => void; onExplore: (id: string) => void; onRead: (id: string) => void; highlighted: boolean; muted: boolean }, 'business'>;
type Container = Node<{ item: AtlasNode }, 'container'>;
function OverviewName({ item }: { item: AtlasNode }) {
  if (item.kind !== 'business_system' && item.kind !== 'domain' && item.kind !== 'area' && item.kind !== 'business_area' && item.groupRole !== 'urbanism_level') return <>{item.name}</>;
  return <span className="nodrag nopan" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()} onKeyDown={event => { if (['Enter', ' '].includes(event.key)) event.stopPropagation(); }}><ReferenceLink target={item.id} fullDefinition className="overview-name-link">{item.name}</ReferenceLink></span>;
}
function BusinessCard({ data, selected }: NodeProps<Card>) {
  const dominantRole = roleOf(data.item);
  const presentation = data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level';
  const card = useRef<HTMLElement>(null);
  const expanded = data.childList !== undefined;
  const listed = data.childList ? cardListedItems(data.childList) : [];
  const listLabel = data.childList?.businessAreaChildren && listed.every(item => item.kind === 'capability') ? 'Capacités' : data.childList?.businessAreaChildren && listed.every(item => item.kind === 'reference') ? 'Référentiels' : data.childList?.kind === 'domain' ? 'Domaines' : data.childList?.kind === 'mixed' ? 'Périmètres et éléments' : data.childList?.kind === 'reference' ? 'Référentiels' : data.childList?.kind === 'behavior' ? 'Comportements' : 'Capacités';
  useLayoutEffect(() => {
    if (!card.current) return;
    // Measure unscaled content, including wrapped names, instead of clipping a growing list.
    const measure = () => { if (card.current) data.onHeight(data.item.id, card.current.offsetHeight); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card.current);
    return () => observer.disconnect();
  }, [expanded, data.item.id, data.onHeight]);
  return <article ref={card} className={`business-card ${expanded ? 'has-child-list' : ''} ${selected ? 'is-selected' : ''} ${presentation ? 'is-presentation' : ''} ${data.highlighted ? 'is-highlighted' : ''} ${data.muted ? 'is-muted' : ''}`} data-node-id={data.item.id} data-kind={data.item.kind} data-depth={String(data.item.fields.modeling_depth || '')}>
    <div className="card-eyebrow"><NodeIcon node={data.item} size={22}/><span>{kindLabel(data.item)}</span></div>
    <h3><OverviewName item={data.item}/></h3>
    {modelingDepthLabel(data.item) && <span className="modeling-depth">{modelingDepthLabel(data.item)}</span>}
    {dominantRole && <span className="subdomain-role" data-role={dominantRole.id} title="Finalité dominante ; les autres responsabilités du sous-domaine restent applicables.">{dominantRole.display_name}</span>}
    <p>{shortText(data.item.purpose || data.item.definition || 'Description non renseignée dans cette publication.', 115)}</p>
    {data.childList && <div className="card-child-list nodrag nopan nowheel" onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()} onKeyDown={event => { if (['Enter', ' '].includes(event.key)) event.stopPropagation(); }}>
      <div className="child-list-heading">{listLabel} <span>{listed.length}</span></div>
      {data.childList.items.length ? <ul aria-label={`${listLabel} de ${data.item.name}`}>
        {data.childList.items.map((child, index) => child.kind === 'business_area' && data.childList?.businessAreaChildren ? <li key={child.id} className="business-area-list-group"><div className="category-list-banner" data-business-area-summary={child.id}><ReferenceLink target={child.id} fullDefinition>{child.name}</ReferenceLink></div><ul>{data.childList.businessAreaChildren[child.id].map(capability => <li key={capability.id}><ReferenceLink target={capability.id} showBehaviors={capability.kind === 'capability'} className={`card-child-link ${capability.kind === 'reference' ? 'reference-link' : 'capacity-link'}`}><NodeIcon node={capability} size={16}/><span>{capability.name}</span><ArrowUpRight size={12}/></ReferenceLink></li>)}</ul></li> : <li key={child.id} className={startsCapabilityTypeSection(data.childList!.items, index) ? 'capability-type-section-start' : undefined}>{data.childList?.businessAreaChildren && startsDirectSection(data.childList.items, index) && <div className="category-list-banner">{directSectionCaption([child])}</div>}{data.item.kind === 'area' && startsCategorySection(data.childList!.items, index) && <div className="category-list-banner">{categoryCaption(child)}</div>}<ReferenceLink target={child.id} showBehaviors={child.kind === 'capability'} className={`card-child-link ${child.kind === 'reference' ? 'reference-link' : child.kind === 'behavior' ? 'behavior-link' : 'capacity-link'}`}><NodeIcon node={child} size={16}/><span>{child.name}</span><ArrowUpRight size={12} className="child-arrow"/></ReferenceLink>{data.childList?.kind === 'domain' && <span className="domain-card-summary">{shortText(child.purpose || child.definition, 120)}{child.fields.modeling_depth === 'behaviors' && <strong> · Capacités et comportements</strong>}</span>}</li>)}
      </ul> : <p>Aucune capacité publiée.</p>}
    </div>}
    <div className="card-bottom"><span>{data.summary || kindLabel(data.item)}</span><button className="nodrag nopan" aria-label={`${data.count ? 'Explorer' : 'Lire'} ${data.item.name}`} onClick={e => { e.stopPropagation(); (data.count ? data.onExplore : data.onRead)(data.item.id); }}>{data.count ? 'Explorer' : 'Fiche'}<ArrowUpRight size={13}/></button></div>
  </article>;
}
function GroupCard({ data }: NodeProps<Container>) {
  const role = roleOf(data.item);
  return <div className={`map-container ${data.item.kind === 'group' && data.item.groupRole !== 'urbanism_level' ? 'presentation-container' : ''}`}><div className="container-label"><NodeIcon node={data.item} size={20}/><strong><OverviewName item={data.item}/></strong><span>{kindLabel(data.item)}</span>{role && <span className="subdomain-role" data-role={role.id}>{role.display_name}</span>}</div></div>;
}
function CapabilityTypeDivider() { return <div className="map-capability-type-divider" role="separator" aria-label="Changement de type de capacité"/>; }
function CategoryBanner({ data }: NodeProps<Node<{ caption: string; area?: AtlasNode }, 'categoryBanner'>>) {
  return <div className="category-banner" role="heading" aria-level={3} data-business-area={data.area?.id}>{data.area ? <><ReferenceLink target={data.area.id} fullDefinition className="nodrag nopan">{data.caption}</ReferenceLink></> : data.caption}</div>;
}
const nodeTypes = { business: BusinessCard, container: GroupCard, capabilityTypeDivider: CapabilityTypeDivider, categoryBanner: CategoryBanner };

export interface ReactFlowPaneProps {
  model: PublishedModel; selectedId: string; scopeId?: string;
  onSelect: (id: string) => void; onExplore: (id: string) => void; onRead: (id: string) => void;
  perspective: string;
}
function Canvas(props: ReactFlowPaneProps) {
  const { model, selectedId, scopeId, perspective } = props;
  const [layout, setLayout] = useState<{nodes: Node[]; ms: number; width: number; height: number}>({ nodes: [], ms: 0, width: 0, height: 0 });
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [touch, setTouch] = useState(() => matchMedia('(pointer: coarse)').matches);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [error, setError] = useState('');
  const { fitView } = useReactFlow();
  const container = useRef<HTMLDivElement>(null);
  const capabilityOverview = hasCapabilityCards(model, scopeId);
  const nativeTouchScroll = capabilityOverview && touch && !fullscreen;
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
  const areaSections = useMemo(() => businessAreaSections(model, scopeId), [model, scopeId]);
  const graph = useMemo(() => {
    if (!scopeId) return { nodes: rootsOf(model), group: undefined };
    const scope = model.nodeById.get(scopeId);
    if (!scope) return { nodes: [], group: undefined };
    const children = areaSections ? areaSections.flatMap(section => section.items) : childrenOf(model, scopeId);
    // Cards only express explicit structure. A leaf never expands into business neighbours here.
    return children.length ? { nodes: [scope, ...children], group: scope } : { nodes: [scope], group: undefined };
  }, [model, scopeId, areaSections]);
  useEffect(() => {
    let current = true;
    const start = performance.now();
    setError('');
    const group = graph.group;
    const items = graph.nodes.filter(n => n.id !== group?.id);
    const childLists = new Map<string, CardChildList>();
    if (capabilityOverview) for (const item of items) {
      const list = cardChildListOf(model, item);
      if (list) childLists.set(item.id, list);
    }
    const inputs = items.map(n => ({ id: n.id, width: 300, height: cardHeights[n.id] || (childLists.has(n.id) ? 260 + childLists.get(n.id)!.items.length * 34 : n.fields.modeling_depth ? 280 : 220) }));
    // A bounded grid keeps cards readable; it does not create model relationships.
    const columns = Math.min(items.length, capabilityOverview ? Math.max(1, Math.min(3, Math.floor((canvasWidth - 60 + 28) / 328))) : items.length > 4 ? 3 : 2) || 1;
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
        row.forEach((item, column) => positioned.push({ ...item, x: 16 + column * 328, y: top }));
        top += Math.max(...row.map(item => item.height)) + 28;
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
        nodes.push({ id: item.id, type: 'business', data: { item, childList: childLists.get(item.id) }, position: { x: (position.x || 0) + (group ? 14 : 0), y: (position.y || 0) + (group ? 54 : 0) }, ...(group ? { parentId: `group:${group.id}`, extent: 'parent' as const } : {}), width: 300, height: position.height, style: { width: 300, height: position.height }, draggable: false, ariaLabel: `${kindLabel(item)} ${item.name}` });
      }
      setLayout({ nodes, ms: Math.round(performance.now() - start), width: (result.width || 380) + (group ? 28 : 0), height: (result.height || 250) + (group ? 70 : 0) });
    }).catch(e => current && setError(String(e)));
    return () => { current = false; };
  }, [graph, model, scopeId, areaSections, capabilityOverview, cardHeights, capabilityOverview ? canvasWidth : 0]);
  useEffect(() => { const id = setTimeout(() => fitView({ padding: 0.06, maxZoom: 1, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220 }), 80); return () => clearTimeout(id); }, [layout, fitView]);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(() => {
      setCanvasWidth(container.current!.clientWidth);
      void fitView({ padding: .06, maxZoom: 1, duration: 0 });
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [fitView, scopeId]);
  const nodes = useMemo(() => layout.nodes.map(n => n.type !== 'business' ? n : { ...n, selected: n.id === selectedId, data: { ...n.data, onHeight, count: childrenOf(model, n.id).length, summary: cardContentSummary(model, model.nodeById.get(n.id)!), onExplore: props.onExplore, onRead: props.onRead, highlighted: Boolean(perspective && model.nodeById.get(n.id)?.status === perspective), muted: Boolean(perspective && model.nodeById.get(n.id)?.status !== perspective) } }), [layout, selectedId, model, props.onExplore, props.onRead, perspective, onHeight]);
  const select = useCallback((_event: unknown, node: Node) => { if (node.type === 'business') props.onSelect(node.id); }, [props.onSelect]);
  const emptyScope = scopeId ? model.nodeById.get(scopeId) : undefined;
  const referenceCapabilities = emptyScope?.kind === 'reference' ? model.relations.filter(r => r.type === 'documents-reference' && r.targetId === emptyScope.id).map(r => model.nodeById.get(r.sourceId)!) : [];
  if (emptyScope && referenceCapabilities.length) return <div className="graph-canvas empty-state"><NodeIcon node={emptyScope} size={38}/><h2>{emptyScope.name}</h2><p><ModelText text={emptyScope.definition}/></p><h3>Capacités liées à ce référentiel</h3><ul>{referenceCapabilities.map(capability => <li key={capability.id}><ReferenceLink target={capability.id}>{capability.name}</ReferenceLink></li>)}</ul></div>;
  if (emptyScope && ['group', 'domain', 'area', 'business_area', 'reference'].includes(emptyScope.kind) && !childrenOf(model, emptyScope.id).length) return <div className="graph-canvas empty-state"><NodeIcon node={emptyScope} size={38}/><h2>{emptyScope.name}</h2><p>Aucun élément publié dans ce périmètre.</p></div>;
  if (error) return <div className="empty-state" role="alert">Le placement a échoué : {error}</div>;
  // Size the map to its content so a small scope does not leave a large empty canvas.
  const canvasHeight = layout.width && canvasWidth ? Math.max(240, Math.ceil(layout.height * Math.min(1, canvasWidth / layout.width)) + 40) : undefined;
  return <div ref={container} className={`graph-canvas ${capabilityOverview ? 'capabilities-canvas' : ''} ${nativeTouchScroll ? 'touch-scroll' : ''}`} style={canvasHeight ? { height: canvasHeight } : undefined} data-testid="react-flow-canvas" data-layout-ms={layout.ms}>
    <ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} onNodeClick={select} onNodeDoubleClick={(_e, node) => node.type === 'business' && (childrenOf(model, node.id).length ? props.onExplore : props.onRead)(node.id)} zoomOnDoubleClick={false} panOnDrag={false} zoomOnPinch={!nativeTouchScroll} zoomOnScroll={!capabilityOverview} preventScrolling={!capabilityOverview} minZoom={0.2} maxZoom={1.6} fitView proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'controls.zoomIn.ariaLabel': 'Agrandir', 'controls.zoomOut.ariaLabel': 'Réduire', 'controls.fitView.ariaLabel': 'Centrer la carte' }}>
      <Background gap={24} size={1} color="#d8e3df"/>
      <Controls showInteractive={false}/>
    </ReactFlow>
    {!graph.nodes.length && <div className="empty-state"><FileText/>Ce périmètre est réservé.</div>}
  </div>;
}
export function ReactFlowPane(props: ReactFlowPaneProps) { return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>; }
