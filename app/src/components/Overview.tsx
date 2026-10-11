import { Flame, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { overviewLayout, prominentChildIndex } from '../adaptiveLayout';
import { filterMapHotspots, type HotspotMapFilters } from '../hotspotMap';
import { childrenOf, descendantsOf, lineageOf, rootsOf } from '../model';
import type { PublishedModel } from '../types';
import { MapDetailPicker } from './MapDetailPicker';
import { MapHotspotPicker } from './MapHotspotPicker';
import { MapNodeButton, MetaTypeLabel, ModelText } from './ModelLinks';
import './hotspots.css';

const plainDefinition = (text: string) => text.replace(/^\[[^\]]+\]\([^)]*\)\s*:\s*/, '');
const FLAMES = ['first', 'second', 'third', 'fourth'];

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
}: {
  model: PublishedModel;
  detail: number;
  hotspotFilters: HotspotMapFilters;
  onHotspotFiltersChange: (changes: Partial<HotspotMapFilters>) => void;
  onDepthChange: (depth: number) => void;
  onAnnouncement: (message: string) => void;
  onOpen: (id: string) => void;
  onOpenHotspot: (id: string, groupIds?: string[]) => void;
}) {
  const universe = rootsOf(model).find((node) => node.kind === 'universe');
  const systems = universe
    ? childrenOf(model, universe.id).filter((node) => node.kind === 'business_system')
    : rootsOf(model).filter((node) => node.kind === 'business_system');
  const section = useRef<HTMLElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === section.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  const visibleHotspots = filterMapHotspots(hotspots, hotspotFilters);
  useEffect(() => {
    const target = section.current;
    if (!target) return;
    const observer = new ResizeObserver(() => setAvailableWidth(target.clientWidth));
    observer.observe(target);
    return () => observer.disconnect();
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
        className={`urbanisation-overview layout-${layout.kind} ${layout.featuredIndex === 0 ? 'featured-first' : 'featured-middle'}`}
        data-layout={layout.kind}
      >
        {systems.map((system) => {
          const systemHotspots = visibleHotspots.filter((hotspot) =>
            hotspot.location.node_ids.some(
              (anchor) => anchor === system.id || lineageOf(model, anchor).some((node) => node.id === system.id),
            ),
          );
          const systemMarkers =
            systemHotspots.length > 1
              ? [
                  {
                    ...systemHotspots[0],
                    id: `cluster-${system.id}`,
                    title: `${systemHotspots.length} points chauds sur ${system.name}`,
                    severity:
                      (['XL', 'L', 'M', 'S', 'unassessed'] as const).find((level) =>
                        systemHotspots.some((hotspot) => hotspot.severity === level),
                      ) || 'unassessed',
                  },
                ]
              : systemHotspots;
          const domains = childrenOf(model, system.id).filter((node) => node.kind === 'domain');
          const subdomains = domains.flatMap((domain) =>
            childrenOf(model, domain.id).filter((node) => node.kind === 'area'),
          );
          const capabilities = descendantsOf(model, system.id).filter((node) => node.kind === 'capability');
          const prominentDomain = prominentChildIndex(
            domains.map(
              (domain) =>
                1 + childrenOf(model, domain.id).filter((node) => node.kind === 'area').length * (detail > 1 ? 2 : 1),
            ),
          );
          return (
            <article data-node-id={system.id} key={system.id} className="overview-system">
              {systemMarkers.map((hotspot, index) => (
                <div
                  key={hotspot.id}
                  className={`hotspot-map-point severity-${hotspot.severity}${hotspot.workshop ? ' is-workshop' : ''}`}
                  style={{ right: 46 + index * 52, top: 48 }}
                >
                  <span className="hotspot-map-halo" aria-hidden="true" />
                  <button
                    type="button"
                    className="hotspot-map-marker"
                    aria-label={
                      systemHotspots.length > 1
                        ? `${hotspot.title}, criticité maximale ${hotspot.severity}. Ouvrir la liste.`
                        : `${hotspot.workshop ? 'Atelier · ' : ''}${hotspot.title}, criticité ${hotspot.severity}`
                    }
                    aria-describedby={`overview-hotspot-tip-${system.id}-${hotspot.id}`}
                    onClick={() =>
                      onOpenHotspot(
                        systemHotspots.length > 1 ? '' : hotspot.id,
                        systemHotspots.length > 1 ? systemHotspots.map((item) => item.id) : undefined,
                      )
                    }
                  >
                    <span className="hotspot-map-flames" aria-hidden="true">
                      {FLAMES.slice(0, { S: 1, M: 2, L: 3, XL: 4, unassessed: 0 }[hotspot.severity]).map((flame) => (
                        <Flame key={flame} />
                      ))}
                    </span>
                    {systemHotspots.length > 1 && <span className="hotspot-map-count">{systemHotspots.length}</span>}
                  </button>
                  <span
                    id={`overview-hotspot-tip-${system.id}-${hotspot.id}`}
                    className="hotspot-map-tooltip"
                    role="tooltip"
                  >
                    <strong>{hotspot.title}</strong>
                    <span>
                      {systemHotspots.length > 1 ? 'Ouvrir la liste pour choisir un sujet. ' : ''}
                      Criticité {hotspot.severity === 'unassessed' ? 'non évaluée' : hotspot.severity}
                    </span>
                  </span>
                </div>
              ))}
              <small>
                <MetaTypeLabel node={system} />
              </small>
              <h3>
                <MapNodeButton node={system} onClick={() => onOpen(system.id)}>
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
                    <ul>
                      {domains.map((domain, domainIndex) => {
                        const areas = childrenOf(model, domain.id).filter((node) => node.kind === 'area');
                        return (
                          <li
                            key={domain.id}
                            className={domainIndex === prominentDomain ? 'overview-domain-prominent' : undefined}
                          >
                            <MapNodeButton
                              node={domain}
                              className="overview-domain-link"
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
                                      className="overview-subdomain-link"
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
      </div>
    </section>
  );
}
