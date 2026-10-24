import { Maximize2, Minimize2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { productFor, selectionMappings } from '../applicationCatalog';
import { filterMapHotspots, type HotspotMapFilters, hotspotsInScope } from '../hotspotMap';
import { NodeIcon } from '../icons';
import { lineageOf } from '../model';
import type { AtlasNode, PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { useCatalogueScrollMemory } from '../useCatalogueScrollMemory';
import { CatalogueNavigator } from './CatalogueNavigator';
import { MapApplicationPicker } from './MapApplicationPicker';
import { MapDetailPicker } from './MapDetailPicker';
import { MapDisplayOptions } from './MapDisplayOptions';
import { MapHotspotPicker } from './MapHotspotPicker';
import { MapLegend } from './MapLegend';
import { MapZoomPicker, useMapZoomChoice } from './MapZoomPicker';
import { MapNodeButton } from './ModelLinks';
import './applications.css';

const ReactFlowPane = lazy(() => import('../ReactFlowPane').then((module) => ({ default: module.ReactFlowPane })));
const MAP_CARDS_SELECTOR = '[data-testid="react-flow-canvas"] .react-flow__node-business';

export interface MapPanelProps {
  model: PublishedModel;
  scope?: AtlasNode;
  scopeId?: string;
  selectedId: string;
  rootName: string;
  hotspotFilters: HotspotMapFilters;
  onHotspotFiltersChange: (changes: Partial<HotspotMapFilters>) => void;
  mapDepth: number;
  mapMaxDepth: number;
  detailLabels: string[];
  focusId?: string;
  restoreViewport?: boolean;
  onDepthChange: (depth: number) => void;
  onSelect: (id: string) => void;
  onRead?: (id: string) => void;
  onOpenScope?: (id: string) => void;
  onAnnouncement: (message: string) => void;
  onOpenHotspot: (id: string, groupIds?: string[]) => void;
  applicationSelectionId?: string;
  applicationComponentId?: string;
  onApplicationChange: (selectionId: string, componentId: string) => void;
}

export function MapPanel({
  model,
  scope,
  scopeId,
  selectedId,
  rootName,
  hotspotFilters,
  onHotspotFiltersChange,
  mapDepth,
  mapMaxDepth,
  detailLabels,
  focusId,
  restoreViewport = false,
  onDepthChange,
  onSelect,
  onAnnouncement,
  onOpenHotspot,
  applicationSelectionId,
  applicationComponentId,
  onApplicationChange,
}: MapPanelProps) {
  const panel = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  useCatalogueScrollMemory(scroll, model.version, scopeId, restoreViewport, MAP_CARDS_SELECTOR);
  const [expanded, setExpanded] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState('');
  const [scopeHotspotHighlighted, setScopeHotspotHighlighted] = useState(false);
  const scopedHotspots = hotspotsInScope(model, scopeId);
  const visibleHotspots = filterMapHotspots(scopedHotspots, hotspotFilters);
  const catalog = model.raw.application_catalog;
  const applicationMappings = selectionMappings(catalog, applicationSelectionId, applicationComponentId);
  const applicationAtScope = applicationMappings.some((mapping) => mapping.node_id === scopeId);
  const legendSelection = catalog?.selections.find((item) => item.id === applicationSelectionId);
  const legendProduct =
    legendSelection && catalog
      ? productFor(catalog, legendSelection)
      : catalog?.products.find((item) => item.id === applicationSelectionId);
  const titleNode = scope || model.nodes.find((node) => node.kind === 'universe');
  const [zoomChoice, setZoomChoice] = useMapZoomChoice();
  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === panel.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const toggleFullscreen = () => {
    if (expanded) {
      void document.exitFullscreen();
      return;
    }
    void panel.current?.requestFullscreen().catch(() => {
      onAnnouncement(ui('mapPanel.le_plein_ecran_est_indisponible_dans_ce_navigateur'));
    });
  };

  return (
    <section className="map-panel" ref={panel} aria-label={ui('mapPanel.carte_du_modele')}>
      <div className="map-toolbar">
        <div>
          <strong>
            {titleNode ? (
              <MapNodeButton
                node={titleNode}
                className={`map-scope-title${scopeHotspotHighlighted ? ' hotspot-related-item' : ''}${applicationAtScope ? ' application-related-item' : ''}`}
              >
                <NodeIcon node={titleNode} size={18} />
                {titleNode.name}
              </MapNodeButton>
            ) : (
              rootName
            )}
          </strong>
          {scope?.kind === 'domain' && mapMaxDepth === 0 && (
            <span className="toolbar-note">{ui('mapPanel.aucun_sous_domaine_decrit_dans_cette_version')}</span>
          )}
        </div>
        <div className="map-actions">
          <MapDetailPicker
            labels={
              scope
                ? detailLabels.slice(0, mapMaxDepth + 1)
                : [ui('mapPanel.systemes'), ui('mapPanel.domaines'), ui('mapPanel.sous_domaines')]
            }
            value={mapDepth}
            onChange={onDepthChange}
          />
          <MapDisplayOptions
            active={[
              ...(hotspotFilters.enabled ? ['Points chauds'] : []),
              ...(applicationSelectionId ? ['Application'] : []),
            ]}
          >
            {!!model.raw.hotspot_catalog?.hotspots.length && (
              <MapHotspotPicker
                filters={hotspotFilters}
                onChange={onHotspotFiltersChange}
                scopedHotspots={scopedHotspots}
                visibleHotspots={visibleHotspots}
                onOpenHotspot={onOpenHotspot}
                selectedHotspotId={selectedHotspotId}
                onSelectHotspot={(id) => {
                  onHotspotFiltersChange({ enabled: true });
                  setSelectedHotspotId((current) => (current === id ? '' : id));
                }}
              />
            )}
            {!!(catalog?.selections.length || catalog?.products.some((item) => item.kind === 'vendor_product')) && (
              <MapApplicationPicker
                catalog={catalog}
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
            aria-label={expanded ? ui('mapPanel.reduire_la_carte') : ui('mapPanel.etendre_la_carte')}
            title={expanded ? ui('mapPanel.reduire_la_carte') : ui('mapPanel.etendre_la_carte')}
            onClick={toggleFullscreen}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div className="catalogue-navigation-stage">
        <div
          ref={scroll}
          className="map-scroll-viewport"
          data-framing={zoomChoice}
          role="region"
          aria-label={ui('mapPanel.defilement_de_la_carte')}
          tabIndex={0}
        >
          <Suspense fallback={<div className="graph-canvas empty-state">{ui('mapPanel.ouverture_de_la_carte')}</div>}>
            <ReactFlowPane
              model={model}
              selectedId={selectedId}
              scopeId={scopeId}
              detail={mapDepth}
              zoomMode={zoomChoice}
              focusId={focusId}
              onSelect={onSelect}
              onRead={onSelect}
              onScopeHotspotHighlight={setScopeHotspotHighlighted}
              perspective=""
              hotspots={visibleHotspots}
              selectedHotspotId={selectedHotspotId}
              applicationMappings={applicationMappings}
              onOpenHotspot={onOpenHotspot}
            />
          </Suspense>
        </div>
        <div className="map-overlay-tools">
          <MapLegend
            model={model}
            mapRef={scroll}
            hotspots={visibleHotspots}
            application={
              legendProduct &&
              applicationMappings.some(
                (mapping) =>
                  !scopeId ||
                  mapping.node_id === scopeId ||
                  lineageOf(model, mapping.node_id).some((node) => node.id === scopeId),
              )
                ? { name: legendProduct.name, documented: !!legendSelection }
                : undefined
            }
          />
        </div>
        <CatalogueNavigator
          viewportRef={scroll}
          geometryKey={`${model.version}:${scopeId || '@root'}:${mapDepth}:${zoomChoice}`}
          framing={zoomChoice}
        />
      </div>
    </section>
  );
}
