import { Info } from 'lucide-react';
import { type RefObject, useEffect, useState } from 'react';
import { RESOLUTION_STAGES, resolutionFor } from '../hotspotResolution';
import { NodeIcon } from '../icons';
import { kindLabel } from '../presentation';
import type { AtlasNode, Hotspot, PublishedModel } from '../types';
import { HotspotGlyph, HotspotResolutionGlyph, severityLabel } from './HotspotDisplay';
import { MapOverlayPanel } from './MapOverlayPanel';

export function MapLegend({
  hotspots,
  compact = false,
  flowTypes = [],
  flowIdentifiers = false,
  application,
  mapRef,
  model,
}: {
  hotspots: Hotspot[];
  compact?: boolean;
  flowTypes?: string[];
  flowIdentifiers?: boolean;
  application?: { name: string; documented: boolean };
  mapRef?: RefObject<HTMLElement | null>;
  model?: PublishedModel;
}) {
  const [levels, setLevels] = useState<AtlasNode[]>([]);
  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !model) return;
    const measure = () => {
      const seen = new Set<string>();
      const nodes: AtlasNode[] = [];
      for (const element of map.querySelectorAll<HTMLElement>(
        '[data-node-id], [data-map-item-id], [data-business-area-summary]',
      )) {
        const id = element.dataset.nodeId || element.dataset.mapItemId || element.dataset.businessAreaSummary;
        const node = id && model.nodeById.get(id);
        if (!node || seen.has(node.kind)) continue;
        seen.add(node.kind);
        nodes.push(node);
      }
      const order = [
        'universe',
        'business_system',
        'domain',
        'area',
        'group',
        'business_area',
        'reference',
        'capability',
        'behavior',
      ];
      nodes.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
      setLevels((previous) =>
        previous.map((node) => node.id).join('|') === nodes.map((node) => node.id).join('|') ? previous : nodes,
      );
    };
    const observer = new MutationObserver(measure);
    observer.observe(map, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-node-id', 'data-map-item-id', 'data-business-area-summary'],
    });
    measure();
    return () => observer.disconnect();
  }, [mapRef, model]);
  const severities = ['S', 'M', 'L', 'XL', 'unassessed'].filter((value) =>
    hotspots.some((item) => item.severity === value),
  );
  const stages = [...new Map(hotspots.map((item) => [resolutionFor(item).stage, item])).entries()];
  return (
    <MapOverlayPanel label="Légende" icon={<Info size={16} />} className="map-legend">
      {levels.length > 0 && (
        <section className="map-legend-section">
          <h3>Structure</h3>
          {levels.map((node) => (
            <div key={node.kind} className="map-legend-entry">
              <NodeIcon node={node} size={18} />
              {kindLabel(node).split(' · ')[0]}
            </div>
          ))}
        </section>
      )}
      {flowTypes.length > 0 && (
        <section className="map-legend-section">
          <h3>Flux</h3>
          {flowTypes.map((type) => (
            <div className="map-legend-entry" key={type}>
              <i className={`map-legend-flow${type === 'provides-knowledge' ? ' is-knowledge' : ''}`} />
              {type === 'shares-data' ? 'Partage de données' : 'Apport de connaissance'}
            </div>
          ))}
          {flowIdentifiers && (
            <p>Les numéros repèrent les flux. Survole un repère ou ouvre-le pour lire son libellé complet.</p>
          )}
        </section>
      )}
      {application && (
        <section className="map-legend-section">
          <h3>Applications</h3>
          <div className="map-legend-entry">
            <i className="map-legend-application" />
            <strong>{application.name}</strong>
          </div>
          <p>
            {application.documented
              ? 'Couverture documentée dans le SI sélectionné.'
              : 'Offre éditeur ; usage Beaumanoir non présumé.'}
          </p>
        </section>
      )}
      {hotspots.length > 0 && (
        <section className="map-legend-section">
          <h3>Points chauds</h3>
          <p>Criticité</p>
          {severities.map((severity) => (
            <div key={severity} className={`map-legend-entry hotspot-legend-level severity-${severity}`}>
              <span className={`map-legend-hotspot${compact ? ' is-compact' : ''}`} aria-hidden="true">
                {compact ? severity === 'unassessed' ? '?' : severity : <HotspotGlyph severity={severity} />}
              </span>
              {severityLabel(severity)}
            </div>
          ))}
          {compact ? (
            <p>Une lettre indique la criticité. Un nombre indique plusieurs points chauds regroupés.</p>
          ) : (
            <>
              <h3>Avancement du cadrage</h3>
              {stages.map(([stage, item]) => (
                <div key={stage} className={`map-legend-entry hotspot-legend-level severity-${item.severity}`}>
                  <span className="map-legend-hotspot" aria-hidden="true">
                    <HotspotResolutionGlyph item={item} />
                  </span>
                  {RESOLUTION_STAGES[stage]}
                </div>
              ))}
              {hotspots.some((item) => resolutionFor(item).blocked_reason.trim()) && <p>⏸ : cadrage bloqué.</p>}
              <p>Un nombre indique plusieurs points chauds regroupés.</p>
            </>
          )}
          {hotspots.some((item) => item.workshop) && <p>Contour discontinu : point chaud d’atelier.</p>}
        </section>
      )}
      {!levels.length && !hotspots.length && !flowTypes.length && !application && (
        <p>Aucun symbole supplémentaire affiché.</p>
      )}
    </MapOverlayPanel>
  );
}
