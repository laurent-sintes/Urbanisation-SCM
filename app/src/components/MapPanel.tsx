import { Maximize2, Minimize2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { selectionMappings } from '../applicationCatalog';
import { filterMapHotspots, type HotspotMapFilters, hotspotsInScope } from '../hotspotMap';
import type { AtlasNode, PublishedModel } from '../types';
import { useCatalogueScrollMemory } from '../useCatalogueScrollMemory';
import { HotspotLegend } from './HotspotDisplay';
import { MapApplicationPicker } from './MapApplicationPicker';
import { MapDetailPicker } from './MapDetailPicker';
import { MapHotspotPicker } from './MapHotspotPicker';
import { MapZoomPicker, useMapZoomChoice } from './MapZoomPicker';
import './applications.css';

const ReactFlowPane = lazy(() => import('../ReactFlowPane').then((module) => ({ default: module.ReactFlowPane })));

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
  useCatalogueScrollMemory(
    scroll,
    model.version,
    scopeId,
    restoreViewport,
    '[data-testid="react-flow-canvas"] .react-flow__node-business',
  );
  const [expanded, setExpanded] = useState(false);
  const [pageFallback, setPageFallback] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState('');
  const scopedHotspots = hotspotsInScope(model, scopeId);
  const visibleHotspots = filterMapHotspots(scopedHotspots, hotspotFilters);
  const catalog = model.raw.application_catalog;
  const applicationMappings = selectionMappings(catalog, applicationSelectionId, applicationComponentId);
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
      onAnnouncement('Le plein écran est indisponible dans ce navigateur.');
    });
  };

  return (
    <section className="map-panel" ref={panel} aria-label="Carte du modèle">
      <div className="map-toolbar">
        <div>
          <strong>{scope?.name || rootName}</strong>
          {scope?.kind === 'domain' && mapMaxDepth === 0 && (
            <span className="toolbar-note">Aucun sous-domaine décrit dans cette version.</span>
          )}
        </div>
        <div className="map-actions">
          <MapDetailPicker
            labels={scope ? detailLabels.slice(0, mapMaxDepth + 1) : ['Systèmes', 'Domaines', 'Sous-domaines']}
            value={mapDepth}
            onChange={onDepthChange}
          />
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
          <MapZoomPicker choice={zoomChoice} onChange={setZoomChoice} pageFallback={pageFallback} />
          <button
            type="button"
            className="map-fullscreen-button"
            aria-label={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            title={expanded ? 'Réduire la carte' : 'Étendre la carte'}
            onClick={toggleFullscreen}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      <div ref={scroll} className="map-scroll-viewport" role="region" aria-label="Défilement de la carte" tabIndex={0}>
        {hotspotFilters.enabled && <HotspotLegend count={visibleHotspots.length} />}
        <Suspense fallback={<div className="graph-canvas empty-state">Ouverture de la carte…</div>}>
          <ReactFlowPane
            model={model}
            selectedId={selectedId}
            scopeId={scopeId}
            detail={mapDepth}
            zoomMode={zoomChoice}
            focusId={focusId}
            onSelect={onSelect}
            onRead={onSelect}
            onPageFallbackChange={setPageFallback}
            perspective=""
            hotspots={visibleHotspots}
            selectedHotspotId={selectedHotspotId}
            applicationMappings={applicationMappings}
            onOpenHotspot={onOpenHotspot}
          />
        </Suspense>
      </div>
      <div className="map-footer">
        <span>Cliquer sur un élément pour parcourir la carte · La fiche reste accessible par son onglet</span>
        <span>Lecture seule</span>
      </div>
    </section>
  );
}
