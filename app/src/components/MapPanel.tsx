import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import type { MapZoomChoice } from '../mapZoom';
import { lineageOf } from '../model';
import { preference, savePreference } from '../navigation';
import type { AtlasNode, PublishedModel } from '../types';
import { MapDetailPicker } from './MapDetailPicker';

const ReactFlowPane = lazy(() => import('../ReactFlowPane').then((module) => ({ default: module.ReactFlowPane })));

export interface MapPanelProps {
  model: PublishedModel;
  scope?: AtlasNode;
  scopeId?: string;
  selectedId: string;
  rootName: string;
  parentName?: string;
  mapDepth: number;
  mapMaxDepth: number;
  detailLabels: string[];
  focusId?: string;
  onDepthChange: (depth: number) => void;
  onBack: () => void;
  onSelect: (id: string) => void;
  onAnnouncement: (message: string) => void;
  onOpenHotspot: (id: string) => void;
}

export function MapPanel({
  model,
  scope,
  scopeId,
  selectedId,
  rootName,
  parentName,
  mapDepth,
  mapMaxDepth,
  detailLabels,
  focusId,
  onDepthChange,
  onBack,
  onSelect,
  onAnnouncement,
  onOpenHotspot,
}: MapPanelProps) {
  const panel = useRef<HTMLElement>(null);
  const pageTooltipId = useId();
  const [expanded, setExpanded] = useState(false);
  const [pageFallback, setPageFallback] = useState(false);
  const scopedHotspots = (model.raw.hotspot_catalog?.hotspots || []).filter((hotspot) =>
    hotspot.location.node_ids.some(
      (anchor) => anchor === scopeId || (scopeId && lineageOf(model, anchor).some((node) => node.id === scopeId)),
    ),
  );
  const [showHotspots, setShowHotspots] = useState(false);
  const workshopRevision = model.raw.workshop?.revision;
  useEffect(() => {
    if (workshopRevision !== undefined) setShowHotspots(true);
  }, [workshopRevision]);
  const [hotspotSeverity, setHotspotSeverity] = useState('all');
  const visibleHotspots = scopedHotspots.filter(
    (hotspot) => hotspotSeverity === 'all' || hotspot.severity === hotspotSeverity,
  );
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
          {!!model.raw.hotspot_catalog?.hotspots.length && (
            <>
              <label className="hotspot-map-toggle">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(event) => setShowHotspots(event.target.checked)}
                />{' '}
                Points chauds
              </label>
              {showHotspots && (
                <label className="hotspot-map-filter">
                  Gravité{' '}
                  <select value={hotspotSeverity} onChange={(event) => setHotspotSeverity(event.target.value)}>
                    <option value="all">Toutes</option>
                    {['S', 'M', 'L', 'XL', 'unassessed'].map((value) => (
                      <option key={value} value={value}>
                        {value === 'unassessed' ? 'Non évaluée' : value}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          {expanded && scope && (
            <MapDetailPicker
              labels={detailLabels.slice(0, mapMaxDepth + 1)}
              value={mapDepth}
              onChange={onDepthChange}
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
          {scope && (
            <button
              type="button"
              className="map-back-button"
              aria-label={`Remonter vers ${parentName || 'la vue d’ensemble'}`}
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              <span>Remonter vers {parentName || 'la vue d’ensemble'}</span>
            </button>
          )}
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
      {showHotspots && (
        <div className="hotspot-map-summary" role="status">
          <strong>
            {visibleHotspots.length} point{visibleHotspots.length > 1 ? 's' : ''} chaud
            {visibleHotspots.length > 1 ? 's' : ''} sur cette vue
          </strong>
          {visibleHotspots.map((hotspot) => (
            <button type="button" key={hotspot.id} onClick={() => onOpenHotspot(hotspot.id)}>
              {hotspot.title} · Gravité {hotspot.severity === 'unassessed' ? 'non évaluée' : hotspot.severity}
            </button>
          ))}
          {scopedHotspots.length > visibleHotspots.length && (
            <span>{scopedHotspots.length - visibleHotspots.length} masqué par le filtre.</span>
          )}
        </div>
      )}
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
          showHotspots={showHotspots}
          hotspotSeverity={hotspotSeverity}
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
