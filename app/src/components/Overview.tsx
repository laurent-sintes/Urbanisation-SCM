import { Maximize2, Minimize2 } from 'lucide-react';
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MIN_READABLE_ZOOM, overviewLayout, prominentChildIndex } from '../adaptiveLayout';
import { applicationMapIds, projectedApplicationMapIds, selectionMappings } from '../applicationCatalog';
import { dataSharingCardInsets, dataSharingHeadroom, hotspotDataSharing, systemDataSharing } from '../dataSharing';
import { filterMapHotspots, type HotspotMapFilters, hotspotRelatedElementIds } from '../hotspotMap';
import { HOTSPOT_DIAMETERS, type HotspotPlacementGroup, layoutHotspots } from '../hotspotPlacement';
import { operationsMapSlots, systemMapSlots } from '../mapPlacement';
import { childrenOf, descendantsOf, lineageOf, rootsOf, visibleAncestorId } from '../model';
import type { PublishedModel } from '../types';
import { HotspotLegend, HotspotMapMarker } from './HotspotDisplay';
import { MapApplicationPicker } from './MapApplicationPicker';
import { MapDetailPicker } from './MapDetailPicker';
import { MapHotspotPicker } from './MapHotspotPicker';
import { MapZoomPicker, useMapZoomChoice } from './MapZoomPicker';
import { MapNodeButton, MetaTypeLabel, ModelText } from './ModelLinks';
import { OverviewColumns } from './OverviewColumns';
import { type ExchangeMarkerAnchor, SystemDataSharingMap } from './SystemDataSharingMap';
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
  const grid = useRef<HTMLDivElement>(null);
  const [zoomChoice, setZoomChoice] = useMapZoomChoice();
  const [frame, setFrame] = useState({ width: 1232, height: 0, pageZoom: 1 });
  const scale = zoomChoice !== 'width' && frame.pageZoom >= MIN_READABLE_ZOOM ? frame.pageZoom : 1;
  const pageFallback = frame.pageZoom < MIN_READABLE_ZOOM;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Detail and framing intentionally reset the map viewport.
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [detail, zoomChoice]);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const [exchangeAnchors, setExchangeAnchors] = useState<ExchangeMarkerAnchor[]>([]);
  const exchangeGeometryChanged = useCallback((anchors: ExchangeMarkerAnchor[]) => {
    setExchangeAnchors((previous) => (JSON.stringify(previous) === JSON.stringify(anchors) ? previous : anchors));
    setMeasurementVersion((version) => version + 1);
  }, []);
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
  const dataSharing = useMemo(() => systemDataSharing(model), [model]);
  const exchangeHotspots = useMemo(
    () =>
      visibleHotspots.flatMap((hotspot) => {
        const exchange = hotspotDataSharing(hotspot, dataSharing);
        return exchange ? [{ hotspot, exchangeId: exchange.id }] : [];
      }),
    [visibleHotspots, dataSharing],
  );
  const exchangeHotspotIds = useMemo(
    () => new Set(exchangeHotspots.map(({ hotspot }) => hotspot.id)),
    [exchangeHotspots],
  );
  const markedExchangeIds = useMemo(
    () => new Set(exchangeHotspots.map(({ exchangeId }) => exchangeId)),
    [exchangeHotspots],
  );
  const cardHotspots = useMemo(
    () => visibleHotspots.filter((hotspot) => !exchangeHotspotIds.has(hotspot.id)),
    [visibleHotspots, exchangeHotspotIds],
  );
  const exchangeInsets = useMemo(
    () =>
      dataSharingCardInsets(
        dataSharing,
        systemSlots,
        systems.map((system) => system.id),
      ),
    [dataSharing, systemSlots, systems],
  );
  const displayedSystems = systemSlots ? systemSlots.map((slot) => systems[slot.index]) : systems;
  // Framing changes only the scale, preserving the logical system/domain positions.
  useLayoutEffect(() => {
    const target = scroll.current;
    const content = grid.current;
    if (!target || !content) return;
    const measure = () => {
      const offset = content.getBoundingClientRect().top - target.getBoundingClientRect().top + target.scrollTop;
      const height = Math.max(1, target.clientHeight - offset - 24);
      const next = {
        width: systemSlots ? Math.max(1232, target.clientWidth) : target.clientWidth,
        height: content.offsetHeight,
        pageZoom: Math.min(
          1,
          target.clientWidth / Math.max(1, content.offsetWidth),
          height / Math.max(1, content.offsetHeight),
        ),
      };
      setFrame((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [systemSlots]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Detail and width change the measured DOM layout.
  useLayoutEffect(() => {
    if (clusterExpanded) return;
    const next: Record<string, OverviewPlacement> = {};
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
      const obstacles = [
        ...article.querySelectorAll<HTMLElement>('small, h3, p, .overview-stats, .overview-hierarchy'),
      ].flatMap((element) => {
        const rects = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          for (const rect of range.getClientRects())
            rects.push({
              x: rect.left - articleRect.left,
              y: rect.top - articleRect.top,
              width: rect.width,
              height: rect.height,
            });
        }
        return rects;
      });
      for (const ribbon of section.current?.querySelectorAll('.data-sharing-ribbon') || []) {
        const rect = ribbon.getBoundingClientRect();
        if (
          rect.right < borderRect.left ||
          rect.left > borderRect.right ||
          rect.bottom < borderRect.top ||
          rect.top > borderRect.bottom
        )
          continue;
        obstacles.push({
          x: rect.left - articleRect.left - 10 * scale,
          y: rect.top - articleRect.top - 10 * scale,
          width: rect.width + 20 * scale,
          height: rect.height + 20 * scale,
        });
      }
      const markers = cardHotspots.filter((hotspot) =>
        hotspot.location.node_ids.some(
          (id) => id === system.id || lineageOf(model, id).some((node) => node.id === system.id),
        ),
      );
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
        return { id: hotspot.id, x, y, diameter: HOTSPOT_DIAMETERS[hotspot.severity] };
      });
      const bounds = { width: articleRect.width, height: articleRect.height, obstacles };
      next[system.id] = { groups: layoutHotspots(anchors, bounds) };
    }
    setMarkerPlacement((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
  }, [systems, cardHotspots, model, detail, availableWidth, measurementVersion, clusterExpanded, scale]);
  return (
    <section
      ref={section}
      className="universe-overview"
      aria-label={`${universe?.name || 'Univers'} des systèmes métier`}
    >
      <div className="universe-toolbar">
        <h2>Systèmes métier</h2>
        <div className="map-actions">
          <MapDetailPicker labels={['Systèmes', 'Domaines', 'Sous-domaines']} value={detail} onChange={onDepthChange} />
          {!!hotspots.length && (
            <MapHotspotPicker
              filters={hotspotFilters}
              onChange={onHotspotFiltersChange}
              scopedHotspots={hotspots}
              visibleHotspots={visibleHotspots}
              onOpenHotspot={onOpenHotspot}
            />
          )}
          {!!applicationCatalog?.selections.length && (
            <MapApplicationPicker
              catalog={applicationCatalog}
              selectionId={applicationSelectionId}
              componentId={applicationComponentId}
              onChange={onApplicationChange}
            />
          )}
          <MapZoomPicker choice={zoomChoice} onChange={setZoomChoice} pageFallback={pageFallback} />
          <button
            type="button"
            className="map-fullscreen-button"
            aria-label={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            title={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            onClick={() => {
              if (expanded) void document.exitFullscreen();
              else
                void section.current
                  ?.requestFullscreen()
                  .catch(() => onAnnouncement('Le plein écran est indisponible dans ce navigateur.'));
            }}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div
        ref={scroll}
        className="overview-map-scroll"
        role="region"
        aria-label="Carte des systèmes métier"
        tabIndex={0}
      >
        {hotspotFilters.enabled && (
          <HotspotLegend
            count={visibleHotspots.length}
            projections={systems.reduce(
              (total, system) =>
                total +
                cardHotspots.filter((hotspot) =>
                  hotspot.location.node_ids.some(
                    (id) => id === system.id || lineageOf(model, id).some((node) => node.id === system.id),
                  ),
                ).length,
              rootHotspots.length + exchangeHotspots.length,
            )}
          />
        )}
        {rootHotspots.length > 0 && (
          <div
            className="overview-global-hotspots"
            role="group"
            aria-label="Sujets transversaux à Enterprise Architecture"
          >
            <p>Sujets transversaux · {universe?.name}</p>
            {rootHotspots.map((item) => (
              <div className="overview-global-hotspot" key={item.id}>
                <div className="overview-global-marker">
                  <HotspotMapMarker
                    id={item.id}
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
        <div
          className="overview-map-frame"
          style={{ width: frame.width * scale, height: frame.height * scale || undefined }}
        >
          <div
            ref={grid}
            className={`urbanisation-overview ${dataSharing.length ? 'has-data-sharing ' : ''}${systemSlots ? 'layout-fixed' : `layout-${layout.kind} ${layout.featuredIndex === 0 ? 'featured-first' : 'featured-middle'}`}`}
            style={
              {
                width: frame.width,
                zoom: scale,
                '--overview-scale': scale,
                '--exchange-headroom': `${dataSharingHeadroom(dataSharing)}px`,
              } as CSSProperties
            }
            data-layout={systemSlots ? 'fixed' : layout.kind}
          >
            <SystemDataSharingMap
              model={model}
              exchanges={dataSharing}
              markedExchangeIds={markedExchangeIds}
              detail={detail}
              onGeometryChange={exchangeGeometryChanged}
            />
            {exchangeHotspots.length > 0 && (
              <div
                className="overview-exchange-hotspots"
                role="group"
                aria-label="Points chauds sur les échanges entre systèmes"
              >
                {exchangeAnchors.map(({ exchangeId, x, y }) => {
                  const items = exchangeHotspots
                    .filter((entry) => entry.exchangeId === exchangeId)
                    .map((entry) => entry.hotspot);
                  if (!items.length) return null;
                  return (
                    <HotspotMapMarker
                      key={exchangeId}
                      id={items.length === 1 ? items[0].id : `exchange:${exchangeId}`}
                      items={items}
                      x={x}
                      y={y}
                      model={model}
                      onOpen={onOpenHotspot}
                      onHighlight={(active, ids) => setHoveredHotspotIds(active ? ids : [])}
                      onExpansionChange={setClusterExpanded}
                    />
                  );
                })}
              </div>
            )}
            <OverviewColumns slots={systemSlots}>
              {displayedSystems.map((system, index) => {
                const systemSlot = systemSlots?.[index];
                const systemHotspots = cardHotspots.filter((hotspot) =>
                  hotspot.location.node_ids.some(
                    (anchor) => anchor === system.id || lineageOf(model, anchor).some((node) => node.id === system.id),
                  ),
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
                      childrenOf(model, domain.id).filter((node) => node.kind === 'area').length * (detail > 1 ? 2 : 1),
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
                        '--exchange-top-inset': `${exchangeInsets.get(system.id)?.top || 0}px`,
                        '--exchange-bottom-inset': `${exchangeInsets.get(system.id)?.bottom || 0}px`,
                      } as CSSProperties
                    }
                    className={`overview-system${systemHotspots.length ? ' has-map-hotspots' : ''}${relatedIds.has(system.id) ? ' hotspot-related' : ''}${applicationExactIds.has(system.id) ? ' application-related' : applicationIds.has(system.id) ? ' application-context' : ''}`}
                  >
                    {groups.map((group) => (
                      <HotspotMapMarker
                        key={group.id}
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
                    <div className="overview-stats" role="group" aria-label={`Contenu publié de ${system.name}`}>
                      <span>
                        <strong>{domains.length}</strong> domaine{domains.length > 1 ? 's' : ''}
                      </span>
                      <span>
                        <strong>{subdomains.length}</strong> sous-domaine{subdomains.length > 1 ? 's' : ''}
                      </span>
                      {capabilities.length > 0 && (
                        <span>
                          <strong>{capabilities.length}</strong> capacité{capabilities.length > 1 ? 's' : ''}
                        </span>
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
                                      ? { gridRow: slot.row + 1, gridColumn: `${slot.column + 1} / span ${slot.span}` }
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
                          <p>Aucun domaine détaillé dans cette publication.</p>
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
    </section>
  );
}
