import { Maximize2, Minimize2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { filterMapHotspots, type HotspotMapFilters, hotspotsInScope } from '../hotspotMap';
import type { MapZoomChoice } from '../mapZoom';
import { preference, savePreference } from '../navigation';
import type { AtlasNode, PublishedModel } from '../types';
import { HotspotLegend } from './HotspotDisplay';
import { MapDetailPicker } from './MapDetailPicker';
import { MapHotspotPicker } from './MapHotspotPicker';

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
  onDepthChange: (depth: number) => void;
  onSelect: (id: string) => void;
  onAnnouncement: (message: string) => void;
  onOpenHotspot: (id: string, groupIds?: string[]) => void;
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
  onDepthChange,
  onSelect,
  onAnnouncement,
  onOpenHotspot,
}: MapPanelProps) {
  const panel = useRef<HTMLElement>(null);
  const pageTooltipId = useId();
  const [expanded, setExpanded] = useState(false);
  const [pageFallback, setPageFallback] = useState(false);
  const scopedHotspots = hotspotsInScope(model, scopeId);
  const visibleHotspots = filterMapHotspots(scopedHotspots, hotspotFilters);
  const [zoomChoice, setZoomChoice] = useState<MapZoomChoice>(() => {
    const saved = preference<string>('map-zoom-choice', 'auto');
    return saved === 'page' || saved === 'width' ? saved : 'auto';
  });
  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === panel.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  useEffect(() => savePreference('map-zoom-choice', zoomChoice), [zoomChoice]);

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
            <span className="toolbar-note">Aucun sous-domaine publié pour ce domaine.</span>
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
            />
          )}
          <div className="map-zoom-choice" role="group" aria-label="Cadrage de la carte">
            {(
              [
                { id: 'auto', label: 'Auto' },
                { id: 'page', label: 'Pleine page' },
                { id: 'width', label: 'Pleine largeur' },
              ] as const
            ).map((option) => {
              const hasHelp = option.id === 'page' && zoomChoice === 'page' && pageFallback;
              return (
                <span key={option.id} className="map-zoom-option">
                  <button
                    type="button"
                    aria-pressed={zoomChoice === option.id}
                    aria-describedby={hasHelp ? pageTooltipId : undefined}
                    onClick={() => setZoomChoice(option.id)}
                  >
                    {option.label}
                    {hasHelp && (
                      <sup className="map-zoom-asterisk" aria-hidden="true">
                        *
                      </sup>
                    )}
                  </button>
                  {hasHelp && (
                    <span id={pageTooltipId} role="tooltip" className="map-zoom-tooltip">
                      Ce niveau ne tient pas lisiblement sur une page. Parcours vertical à taille de lecture.
                    </span>
                  )}
                </span>
              );
            })}
          </div>
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
          onOpenHotspot={onOpenHotspot}
        />
      </Suspense>
      <div className="map-footer">
        <span>Cliquer sur un élément pour parcourir la carte · La fiche reste accessible par son onglet</span>
        <span>Lecture seule</span>
      </div>
    </section>
  );
}
