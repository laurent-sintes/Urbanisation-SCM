import { Info } from 'lucide-react';
import { type RefObject, useEffect, useState } from 'react';
import { RESOLUTION_STAGES, resolutionFor } from '../hotspotResolution';
import { NodeIcon } from '../icons';
import { kindLabel } from '../presentation';
import type { AtlasNode, Hotspot, PublishedModel } from '../types';
import { ui } from '../ui.ts';
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
  const [compactMarkers, setCompactMarkers] = useState(compact);
  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !model) return;
    const measure = () => {
      setCompactMarkers(compact || !!map.querySelector('.hotspot-map-point.is-compact'));
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
      attributeFilter: ['data-node-id', 'data-map-item-id', 'data-business-area-summary', 'class'],
    });
    measure();
    return () => observer.disconnect();
  }, [mapRef, model, compact]);
  const severities = ['S', 'M', 'L', 'XL', 'unassessed'].filter((value) =>
    hotspots.some((item) => item.severity === value),
  );
  const stages = [...new Map(hotspots.map((item) => [resolutionFor(item).stage, item])).entries()];
  return (
    <MapOverlayPanel label={ui('mapLegend.legende')} icon={<Info size={16} />} className="map-legend">
      {levels.length > 0 && (
        <section className="map-legend-section">
          <h3>{ui('mapLegend.structure')}</h3>
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
          <h3>{ui('mapLegend.flux')}</h3>
          {flowTypes.map((type) => (
            <div className="map-legend-entry" key={type}>
              <i className={`map-legend-flow${type === 'provides-knowledge' ? ' is-knowledge' : ''}`} />
              {type === 'shares-data' ? ui('mapLegend.partage_de_donnees') : ui('mapLegend.apport_de_connaissance')}
            </div>
          ))}
          {flowIdentifiers && (
            <p>{ui('mapLegend.les_numeros_reperent_les_flux_survole_un_repere_ou_ouvre_le_pour_')}</p>
          )}
        </section>
      )}
      {application && (
        <section className="map-legend-section">
          <h3>{ui('mapLegend.applications')}</h3>
          <div className="map-legend-entry">
            <i className="map-legend-application" />
            <strong>{application.name}</strong>
          </div>
          <p>
            {application.documented
              ? ui('mapLegend.couverture_documentee_dans_le_si_selectionne')
              : ui('mapLegend.offre_editeur_usage_beaumanoir_non_presume')}
          </p>
        </section>
      )}
      {hotspots.length > 0 && (
        <section className="map-legend-section">
          <h3>{ui('mapLegend.points_chauds')}</h3>
          <p>{ui('mapLegend.criticite')}</p>
          {severities.map((severity) => (
            <div key={severity} className={`map-legend-entry hotspot-legend-level severity-${severity}`}>
              <span className={`map-legend-hotspot${compactMarkers ? ' is-compact' : ''}`} aria-hidden="true">
                {compactMarkers ? severity === 'unassessed' ? '?' : severity : <HotspotGlyph severity={severity} />}
              </span>
              {severityLabel(severity)}
            </div>
          ))}
          {compactMarkers ? (
            <p>{ui('mapLegend.une_lettre_indique_la_criticite_un_nombre_indique_plusieurs_point')}</p>
          ) : (
            <>
              <h3>{ui('mapLegend.avancement_du_cadrage')}</h3>
              {stages.map(([stage, item]) => (
                <div key={stage} className={`map-legend-entry hotspot-legend-level severity-${item.severity}`}>
                  <span className="map-legend-hotspot" aria-hidden="true">
                    <HotspotResolutionGlyph item={item} />
                  </span>
                  {RESOLUTION_STAGES[stage]}
                </div>
              ))}
              {hotspots.some((item) => resolutionFor(item).blocked_reason.trim()) && (
                <p>{ui('mapLegend.cadrage_bloque')}</p>
              )}
              <p>{ui('mapLegend.un_nombre_indique_plusieurs_points_chauds_regroupes')}</p>
            </>
          )}
          {hotspots.some((item) => item.workshop) && <p>{ui('mapLegend.contour_discontinu_point_chaud_d_atelier')}</p>}
        </section>
      )}
      {!levels.length && !hotspots.length && !flowTypes.length && !application && (
        <p>{ui('mapLegend.aucun_symbole_supplementaire_affiche')}</p>
      )}
    </MapOverlayPanel>
  );
}
