import { Maximize2, Minimize2 } from 'lucide-react';
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { overviewLayout, prominentChildIndex } from '../adaptiveLayout';
import { applicationMapIds, productFor, projectedApplicationMapIds, selectionMappings } from '../applicationCatalog';
import { filterMapHotspots, type HotspotMapFilters, hotspotRelatedElementIds } from '../hotspotMap';
import {
  CATALOGUE_HOTSPOT_HEADROOM,
  catalogueHotspotDiameter,
  catalogueHotspotDock,
  catalogueHotspotsCompact,
  type HotspotPlacementGroup,
  hotspotPlacementNeedsSpace,
  layoutHotspots,
} from '../hotspotPlacement';
import { NodeIcon } from '../icons';
import { operationsMapSlots, systemMapSlots } from '../mapPlacement';
import { resolveMapZoom, stablePageFitZoom } from '../mapZoom';
import { childrenOf, descendantsOf, lineageOf, rootsOf, visibleAncestorId } from '../model';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { useCatalogueScrollMemory } from '../useCatalogueScrollMemory';
import { CatalogueNavigator } from './CatalogueNavigator';
import { HotspotMapMarker } from './HotspotDisplay';
import { MapApplicationPicker } from './MapApplicationPicker';
import { MapDetailPicker } from './MapDetailPicker';
import { MapDisplayOptions } from './MapDisplayOptions';
import { MapHotspotPicker } from './MapHotspotPicker';
import { MapLegend } from './MapLegend';
import { MapZoomPicker, useMapZoomChoice } from './MapZoomPicker';
import { MapNodeButton, MetaTypeLabel, ModelText } from './ModelLinks';
import { OverviewColumns } from './OverviewColumns';
import './hotspots.css';

const plainDefinition = (text: string) => text.replace(/^\[[^\]]+\]\([^)]*\)\s*:\s*/, '');
type OverviewPlacement = {
  groups: HotspotPlacementGroup[];
};

/** The overview follows the publication's explicit hierarchy and frozen order. */
export function Overview({
  model,
  detail,
  hotspotFilters,
  onHotspotFiltersChange,
  onDepthChange,
  onAnnouncement,
  onOpen,
  onOpenHotspot,
  applicationSelectionId,
  applicationComponentId,
  onApplicationChange,
  restoreViewport = false,
}: {
  model: PublishedModel;
  detail: number;
  hotspotFilters: HotspotMapFilters;
  onHotspotFiltersChange: (changes: Partial<HotspotMapFilters>) => void;
  onDepthChange: (depth: number) => void;
  onAnnouncement: (message: string) => void;
  onOpen: (id: string) => void;
  onOpenHotspot: (id: string, groupIds?: string[]) => void;
  applicationSelectionId?: string;
  applicationComponentId?: string;
  onApplicationChange: (selectionId: string, componentId: string) => void;
  restoreViewport?: boolean;
}) {
  const universe = rootsOf(model).find((node) => node.kind === 'universe');
  const systems = useMemo(
    () =>
      universe
        ? childrenOf(model, universe.id).filter((node) => node.kind === 'business_system')
        : rootsOf(model).filter((node) => node.kind === 'business_system'),
    [model, universe],
  );
  const section = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  useCatalogueScrollMemory(scroll, model.version, undefined, restoreViewport, '.overview-system');
  const grid = useRef<HTMLDivElement>(null);
  const [zoomChoice, setZoomChoice] = useMapZoomChoice();
  const [frame, setFrame] = useState({ width: 0, height: 0, pageZoom: 1, widthZoom: 1 });
  const effectiveZoomMode = resolveMapZoom(zoomChoice, detail, frame.pageZoom);
  const scale = effectiveZoomMode === 'page' ? frame.pageZoom : frame.widthZoom;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Detail and framing intentionally reset the map viewport.
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [detail, zoomChoice]);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const compact = effectiveZoomMode === 'width' && availableWidth > 0 && availableWidth < 812;
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const [markerPlacement, setMarkerPlacement] = useState<Record<string, OverviewPlacement>>({});
  const [clusterExpanded, setClusterExpanded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoveredHotspotIds, setHoveredHotspotIds] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === section.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  const applicationCatalog = model.raw.application_catalog;
  const legendSelection = applicationCatalog?.selections.find((item) => item.id === applicationSelectionId);
  const legendProduct =
    legendSelection && applicationCatalog
      ? productFor(applicationCatalog, legendSelection)
      : applicationCatalog?.products.find((item) => item.id === applicationSelectionId);

  const applicationMappings = useMemo(
    () => selectionMappings(applicationCatalog, applicationSelectionId, applicationComponentId),
    [applicationCatalog, applicationSelectionId, applicationComponentId],
  );
  const applicationIds = applicationMapIds(model, applicationMappings);
  const visibleHotspots = useMemo(() => filterMapHotspots(hotspots, hotspotFilters), [hotspots, hotspotFilters]);
  const rootHotspots = universe ? visibleHotspots.filter((item) => item.location.node_ids.includes(universe.id)) : [];
  const visibleIds = useMemo(
    () =>
      new Set(
        systems.flatMap((system) => [
          system.id,
          ...(detail > 0
            ? childrenOf(model, system.id)
                .filter((node) => node.kind === 'domain')
                .flatMap((domain) => [
                  domain.id,
                  ...(detail > 1
                    ? childrenOf(model, domain.id)
                        .filter((node) => node.kind === 'area')
                        .map((node) => node.id)
                    : []),
                ])
            : []),
        ]),
      ),
    [systems, detail, model],
  );
  const applicationExactIds = projectedApplicationMapIds(model, applicationMappings, visibleIds);
  useEffect(() => {
    if (!applicationSelectionId || !applicationMappings.length) return;
    const visibleTarget = applicationMappings
      .map((mapping) => visibleAncestorId(model, mapping.node_id, visibleIds))
      .find((id) => id);
    if (!visibleTarget) return;
    const frame = requestAnimationFrame(() => {
      const container = scroll.current;
      const target = [...(container?.querySelectorAll<HTMLElement>('[data-map-item-id]') || [])].find(
        (element) => element.dataset.mapItemId === visibleTarget,
      );
      if (!container || !target) return;
      const bounds = container.getBoundingClientRect();
      const item = target.getBoundingClientRect();
      container.scrollTo({
        top: container.scrollTop + item.top - bounds.top - (container.clientHeight - item.height) / 2,
        left: container.scrollLeft + item.left - bounds.left - (container.clientWidth - item.width) / 2,
        behavior: 'instant',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [applicationSelectionId, applicationMappings, model, visibleIds]);
  const activeHotspots = visibleHotspots.filter((item) => hoveredHotspotIds.includes(item.id));
  const relatedIds = new Set(
    hotspotRelatedElementIds(
      model,
      activeHotspots,
      activeHotspots.flatMap((hotspot) =>
        hotspot.location.node_ids.flatMap((id) => visibleAncestorId(model, id, visibleIds) || []),
      ),
    ),
  );
  useEffect(() => {
    const target = section.current;
    if (!target) return;
    const update = () => {
      setAvailableWidth(target.clientWidth);
      setAvailableHeight(target.clientHeight);
      setMeasurementVersion((version) => version + 1);
    };
    const observer = new ResizeObserver(update);
    observer.observe(target);
    for (const article of target.querySelectorAll('.overview-system')) observer.observe(article);
    // Breakpoint changes can move text without changing an observed box's size.
    let resizeFrame = 0;
    const resized = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(update);
    };
    window.addEventListener('resize', resized);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) update();
    });
    return () => {
      active = false;
      window.removeEventListener('resize', resized);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
    };
  }, []);
  const weights = systems.map((system) => {
    const domains = childrenOf(model, system.id).filter((node) => node.kind === 'domain');
    return (
      1 +
      (detail > 0 ? domains.length * 2 : 0) +
      (detail > 1
        ? domains.reduce(
            (total, domain) => total + childrenOf(model, domain.id).filter((node) => node.kind === 'area').length,
            0,
          )
        : 0)
    );
  });
  const layout = overviewLayout(weights, availableWidth);
  const systemSlots = useMemo(() => systemMapSlots(systems.map((system) => system.id)), [systems]);
  const cardHotspots = useMemo(
    () => visibleHotspots.filter((hotspot) => !hotspot.location.node_ids.includes(universe?.id || '')),
    [visibleHotspots, universe],
  );
  const reserveContext = `${model.version}:${detail}:${zoomChoice}:${availableWidth}:${availableHeight}:${expanded}:${cardHotspots.map((item) => item.id).join('|')}`;
  const [reservedContext, setReservedContext] = useState('');
  const hotspotHeadroom = reservedContext === reserveContext && cardHotspots.length ? CATALOGUE_HOTSPOT_HEADROOM : 0;
  const cardHotspotSystems = useMemo(
    () =>
      new Map(
        cardHotspots.flatMap((hotspot) => {
          const candidates = hotspot.location.node_ids.flatMap((id, index) => {
            const lineage = lineageOf(model, id);
            const system = systems.find((item) => lineage.some((node) => node.id === item.id));
            return system ? [{ systemId: system.id, depth: lineage.length, index }] : [];
          });
          candidates.sort((left, right) => right.depth - left.depth || left.index - right.index);
          return candidates[0] ? [[hotspot.id, candidates[0].systemId] as const] : [];
        }),
      ),
    [cardHotspots, model, systems],
  );
  const displayedSystems = systemSlots ? systemSlots.map((slot) => systems[slot.index]) : systems;
  // Page framing preserves the spatial composition; width framing may stack columns.
  useLayoutEffect(() => {
    const target = scroll.current;
    const content = grid.current;
    if (!target || !content) return;
    const measure = () => {
      const offset = content.getBoundingClientRect().top - target.getBoundingClientRect().top + target.scrollTop;
      const height = Math.max(1, target.clientHeight - offset - 24);
      const pageWidth = target.getBoundingClientRect().width - target.clientLeft * 2;
      const style = getComputedStyle(content);
      const minimumWidth = Math.max(
        Number.parseFloat(style.minWidth) || 0,
        zoomChoice === 'page' ? Number.parseFloat(style.getPropertyValue('--overview-page-min-width')) || 0 : 0,
      );
      const next = {
        width: Math.max(minimumWidth, target.clientWidth),
        height: content.offsetHeight,
        widthZoom: Math.min(1, target.clientWidth / Math.max(1, content.offsetWidth)),
        pageZoom: stablePageFitZoom(
          Math.min(1, pageWidth / Math.max(1, content.offsetWidth), height / Math.max(1, content.offsetHeight)),
        ),
      };
      setFrame((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };
    const observer = new ResizeObserver(measure);
    const observed = new Set<Element>();
    const observe = () => {
      const elements = new Set<Element>([target, content, ...target.children]);
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
      measure();
    };
    const mutations = new MutationObserver(observe);
    mutations.observe(target, { childList: true });
    observe();
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [zoomChoice]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Detail and width change the measured DOM layout.
  useLayoutEffect(() => {
    if (clusterExpanded) return;
    const next: Record<string, OverviewPlacement> = {};
    const mapFrame = grid.current?.parentElement;
    if (!mapFrame || !grid.current) return;
    const frameRect = mapFrame.getBoundingClientRect();
    const obstacles: { x: number; y: number; width: number; height: number }[] = [];
    for (const element of grid.current.querySelectorAll('small, h3, p, .overview-stats, .overview-hierarchy')) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects())
          obstacles.push({
            x: rect.left - frameRect.left,
            y: rect.top - frameRect.top,
            width: rect.width,
            height: rect.height,
          });
      }
    }
    const occupied: typeof obstacles = [];
    for (const system of systems) {
      const article = [...(section.current?.querySelectorAll<HTMLElement>('.overview-system') || [])].find(
        (element) => element.dataset.nodeId === system.id,
      );
      if (!article) continue;
      const borderRect = article.getBoundingClientRect();
      const articleRect = {
        left: borderRect.left + article.clientLeft * scale,
        top: borderRect.top + article.clientTop * scale,
        width: article.clientWidth * scale,
        height: article.clientHeight * scale,
      };
      const origin = { x: articleRect.left - frameRect.left, y: articleRect.top - frameRect.top };
      const otherSystems = [...grid.current.querySelectorAll('.overview-system')]
        .filter((element) => element !== article)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { x: rect.left - frameRect.left, y: rect.top - frameRect.top, width: rect.width, height: rect.height };
        });
      const markers = cardHotspots.filter((hotspot) => cardHotspotSystems.get(hotspot.id) === system.id);
      const targetsById = new Map(
        [...article.querySelectorAll<HTMLElement>('[data-map-item-id]')].flatMap((element) => {
          const id = element.dataset.mapItemId;
          return id ? [[id, element] as const] : [];
        }),
      );
      const targetIds = new Set(targetsById.keys());
      const anchors = markers.map((hotspot) => {
        const targets = hotspot.location.node_ids
          .filter((id) => id === system.id || lineageOf(model, id).some((node) => node.id === system.id))
          .map((id) => {
            const visibleId = visibleAncestorId(model, id, targetIds);
            const target = visibleId ? targetsById.get(visibleId) : undefined;
            if (target) return { rect: target.getBoundingClientRect(), id: visibleId };
            const rect = article.querySelector('h3')?.getBoundingClientRect();
            return rect ? { rect, id: system.id } : undefined;
          })
          .filter((target): target is { rect: DOMRect; id: string } => Boolean(target));
        const x = targets.length
          ? targets.reduce(
              (sum, target) =>
                sum +
                (target.id === system.id
                  ? articleRect.width / 2
                  : Math.min(articleRect.width - 24, target.rect.right - articleRect.left - 20)),
              0,
            ) / targets.length
          : articleRect.width / 2;
        const y = targets.length
          ? targets.reduce(
              (sum, target) => sum + (target.id === system.id ? 26 : target.rect.top - articleRect.top + 2),
              0,
            ) / targets.length
          : 26;
        return {
          id: hotspot.id,
          x: x + origin.x,
          y: y + origin.y,
          diameter: catalogueHotspotDiameter(hotspot.severity, scale, matchMedia('(pointer: coarse)').matches),
        };
      });
      const bounds = {
        width: mapFrame.clientWidth,
        height: mapFrame.clientHeight,
        obstacles: [...obstacles, ...otherSystems, ...occupied],
        fallbackPositions: catalogueHotspotDock(mapFrame.clientWidth),
      };
      const groups = layoutHotspots(anchors, bounds);
      if (!hotspotHeadroom && hotspotPlacementNeedsSpace(groups, bounds.obstacles)) setReservedContext(reserveContext);
      for (const group of groups)
        occupied.push({
          x: group.x - group.diameter / 2 - 3,
          y: group.y - group.diameter / 2 - 3,
          width: group.diameter + 6,
          height: group.diameter + 6,
        });
      next[system.id] = {
        groups: groups.map((group) => ({
          ...group,
          x: group.x - origin.x,
          y: group.y - origin.y,
          anchor: { x: group.anchor.x - origin.x, y: group.anchor.y - origin.y },
        })),
      };
    }
    setMarkerPlacement((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
  }, [
    systems,
    cardHotspots,
    cardHotspotSystems,
    model,
    detail,
    availableWidth,
    measurementVersion,
    clusterExpanded,
    scale,
    hotspotHeadroom,
    reserveContext,
  ]);
  return (
    <section
      ref={section}
      className="universe-overview"
      aria-label={ui('overview.des_systemes_metier', { value1: universe?.name || ui('overview.univers') })}
    >
      <div className="universe-toolbar">
        <h2>
          {universe ? (
            <MapNodeButton node={universe} className="map-scope-title">
              <NodeIcon node={universe} size={18} />
              {universe.name}
            </MapNodeButton>
          ) : (
            ui('overview.systemes_metier')
          )}
        </h2>
        <div className="map-actions">
          <MapDetailPicker
            labels={[ui('overview.systemes'), ui('overview.domaines'), ui('overview.sous_domaines')]}
            value={detail}
            onChange={onDepthChange}
          />
          <MapDisplayOptions
            active={[
              ...(hotspotFilters.enabled ? ['Points chauds'] : []),
              ...(applicationSelectionId ? ['Application'] : []),
            ]}
          >
            {!!hotspots.length && (
              <MapHotspotPicker
                filters={hotspotFilters}
                onChange={onHotspotFiltersChange}
                scopedHotspots={hotspots}
                visibleHotspots={visibleHotspots}
                onOpenHotspot={onOpenHotspot}
              />
            )}
            {!!(
              applicationCatalog?.selections.length ||
              applicationCatalog?.products.some((item) => item.kind === 'vendor_product')
            ) && (
              <MapApplicationPicker
                catalog={applicationCatalog}
                selectionId={applicationSelectionId}
                componentId={applicationComponentId}
                onChange={onApplicationChange}
              />
            )}
            <MapZoomPicker choice={zoomChoice} onChange={setZoomChoice} />
          </MapDisplayOptions>
          <button
            type="button"
            className="map-fullscreen-button"
            aria-label={expanded ? ui('overview.reduire_la_carte') : ui('overview.etendre_la_carte')}
            title={expanded ? ui('overview.reduire_la_carte') : ui('overview.etendre_la_carte')}
            onClick={() => {
              if (expanded) void document.exitFullscreen();
              else
                void section.current
                  ?.requestFullscreen()
                  .catch(() => onAnnouncement(ui('overview.le_plein_ecran_est_indisponible_dans_ce_navigateur')));
            }}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div className="catalogue-navigation-stage">
        <div
          ref={scroll}
          className="overview-map-scroll"
          data-framing={zoomChoice}
          role="region"
          aria-label={ui('overview.carte_des_systemes_metier')}
          tabIndex={0}
        >
          {rootHotspots.length > 0 && (
            <div
              className="overview-global-hotspots"
              role="group"
              aria-label={ui('overview.sujets_transversaux_a_enterprise_architecture')}
            >
              <p>
                {ui('overview.sujets_transversaux')}
                {universe?.name}
              </p>
              {rootHotspots.map((item) => (
                <div className="overview-global-hotspot" key={item.id}>
                  <div className="overview-global-marker">
                    <HotspotMapMarker
                      id={item.id}
                      variant={catalogueHotspotsCompact(scale) ? 'compact' : 'default'}
                      items={[item]}
                      x={32}
                      y={32}
                      model={model}
                      onOpen={onOpenHotspot}
                      onHighlight={(active, ids) => setHoveredHotspotIds(active ? ids : [])}
                    />
                  </div>
                  <button type="button" onClick={() => onOpenHotspot(item.id)}>
                    <ModelText text={item.title} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="overview-map-frame" style={{ height: frame.height * scale + hotspotHeadroom || undefined }}>
            <div
              ref={grid}
              className={`urbanisation-overview ${systemSlots ? 'layout-fixed' : `layout-${layout.kind} ${layout.featuredIndex === 0 ? 'featured-first' : 'featured-middle'}`}${compact ? ' is-narrow' : ''}`}
              style={
                {
                  width: frame.width,
                  position: 'relative',
                  top: hotspotHeadroom,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  '--overview-scale': scale,
                } as CSSProperties
              }
              data-layout={systemSlots ? 'fixed' : layout.kind}
            >
              <OverviewColumns slots={systemSlots} compact={compact}>
                {displayedSystems.map((system, index) => {
                  const systemSlot = systemSlots?.[index];
                  const systemHotspots = cardHotspots.filter(
                    (hotspot) => cardHotspotSystems.get(hotspot.id) === system.id,
                  );
                  const groups = markerPlacement[system.id]?.groups || [];
                  const domains = childrenOf(model, system.id).filter((node) => node.kind === 'domain');
                  const subdomains = domains.flatMap((domain) =>
                    childrenOf(model, domain.id).filter((node) => node.kind === 'area'),
                  );
                  const capabilities = descendantsOf(model, system.id).filter((node) => node.kind === 'capability');
                  const prominentDomain = prominentChildIndex(
                    domains.map(
                      (domain) =>
                        1 +
                        childrenOf(model, domain.id).filter((node) => node.kind === 'area').length *
                          (detail > 1 ? 2 : 1),
                    ),
                  );
                  const domainSlots = operationsMapSlots(
                    system.id,
                    domains.map((domain) => domain.id),
                  );
                  const displayedDomains = domainSlots ? domainSlots.map((slot) => domains[slot.index]) : domains;
                  return (
                    <article
                      data-node-id={system.id}
                      key={system.id}
                      style={
                        {
                          ...(systemSlot
                            ? {
                                gridRow: systemSlot.row + 1,
                                gridColumn: `${systemSlot.column + 1} / span ${systemSlot.span}`,
                              }
                            : {}),
                        } as CSSProperties
                      }
                      className={`overview-system${systemHotspots.length ? ' has-map-hotspots' : ''}${relatedIds.has(system.id) ? ' hotspot-related' : ''}${applicationExactIds.has(system.id) ? ' application-related' : applicationIds.has(system.id) ? ' application-context' : ''}`}
                    >
                      <svg className="catalogue-hotspot-leaders" width="100%" height="100%" aria-hidden="true">
                        {groups.map((group) =>
                          Math.hypot(group.x - group.anchor.x, group.y - group.anchor.y) > 6 ? (
                            <line
                              key={group.id}
                              data-hotspot-leader={group.id}
                              x1={group.anchor.x / scale}
                              y1={group.anchor.y / scale}
                              x2={group.x / scale}
                              y2={group.y / scale}
                              vectorEffect="non-scaling-stroke"
                            />
                          ) : null,
                        )}
                      </svg>
                      {groups.map((group) => (
                        <HotspotMapMarker
                          key={group.id}
                          variant={catalogueHotspotsCompact(scale) ? 'compact' : 'default'}
                          id={group.id}
                          items={systemHotspots.filter((item) => group.ids.includes(item.id))}
                          onExpansionChange={setClusterExpanded}
                          x={group.x / scale}
                          y={group.y / scale}
                          model={model}
                          onOpen={onOpenHotspot}
                          onHighlight={(active, ids) => setHoveredHotspotIds(active ? ids : [])}
                        />
                      ))}
                      <small>
                        <MetaTypeLabel node={system} />
                      </small>
                      <h3>
                        <MapNodeButton
                          node={system}
                          itemId={system.id}
                          className={
                            `${relatedIds.has(system.id) ? 'hotspot-related-item ' : ''}${applicationExactIds.has(system.id) ? 'application-related-item' : applicationIds.has(system.id) ? 'application-context-item' : ''}`.trim() ||
                            undefined
                          }
                          onClick={() => onOpen(system.id)}
                        >
                          {system.name}
                        </MapNodeButton>
                      </h3>
                      <p>
                        <ModelText text={system.purpose || system.definition} />
                      </p>
                      {system.purpose && system.definition && (
                        <p className="overview-definition">
                          <ModelText text={plainDefinition(system.definition)} />
                        </p>
                      )}
                      <div
                        className="overview-stats"
                        role="group"
                        aria-label={ui('overview.contenu_publie_de', { name: system.name })}
                      >
                        <span>{ui('overview.domains_count', { count: domains.length })}</span>
                        <span>{ui('overview.subdomains_count', { count: subdomains.length })}</span>
                        {capabilities.length > 0 && (
                          <span>{ui('overview.capabilities_count', { count: capabilities.length })}</span>
                        )}
                      </div>
                      {detail > 0 && (
                        <div className="overview-hierarchy">
                          {domains.length ? (
                            <ul className={domainSlots ? 'overview-domains-fixed' : undefined}>
                              {displayedDomains.map((domain, domainIndex) => {
                                const slot = domainSlots?.[domainIndex];
                                const areas = childrenOf(model, domain.id).filter((node) => node.kind === 'area');
                                return (
                                  <li
                                    key={domain.id}
                                    className={
                                      !domainSlots && domainIndex === prominentDomain
                                        ? 'overview-domain-prominent'
                                        : undefined
                                    }
                                    style={
                                      slot
                                        ? {
                                            gridRow: slot.row + 1,
                                            gridColumn: `${slot.column + 1} / span ${slot.span}`,
                                          }
                                        : undefined
                                    }
                                  >
                                    <MapNodeButton
                                      node={domain}
                                      itemId={domain.id}
                                      className={`overview-domain-link${relatedIds.has(domain.id) ? ' hotspot-related-item' : ''}${applicationExactIds.has(domain.id) ? ' application-related-item' : applicationIds.has(domain.id) ? ' application-context-item' : ''}`}
                                      onClick={() => onOpen(domain.id)}
                                    >
                                      {domain.name}
                                    </MapNodeButton>
                                    {domain.purpose && (
                                      <span className="overview-domain-purpose">
                                        <ModelText text={domain.purpose} />
                                      </span>
                                    )}
                                    {detail > 1 && areas.length > 0 && (
                                      <ul>
                                        {areas.map((area) => (
                                          <li key={area.id}>
                                            <MapNodeButton
                                              node={area}
                                              itemId={area.id}
                                              className={`overview-subdomain-link${relatedIds.has(area.id) ? ' hotspot-related-item' : ''}${applicationExactIds.has(area.id) ? ' application-related-item' : applicationIds.has(area.id) ? ' application-context-item' : ''}`}
                                              onClick={() => onOpen(area.id)}
                                            >
                                              {area.name}
                                            </MapNodeButton>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p>{ui('overview.aucun_domaine_detaille_dans_cette_publication')}</p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </OverviewColumns>
            </div>
          </div>
        </div>
        <div className="map-overlay-tools">
          <MapLegend
            model={model}
            mapRef={scroll}
            hotspots={visibleHotspots}
            application={
              legendProduct && applicationMappings.length
                ? { name: legendProduct.name, documented: !!legendSelection }
                : undefined
            }
          />
        </div>
        <CatalogueNavigator
          viewportRef={scroll}
          geometryKey={`${model.version}:@root:${detail}:${zoomChoice}`}
          framing={zoomChoice}
        />
      </div>
    </section>
  );
}
