import { ChevronDown, Flame, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { filterMapHotspots, type HotspotMapFilters } from '../hotspotMap';
import type { Hotspot } from '../types';
import { HotspotFilterFields } from './HotspotFilterFields';

export function MapHotspotPicker({
  filters,
  onChange,
  scopedHotspots,
  visibleHotspots,
  onOpenHotspot,
}: {
  filters: HotspotMapFilters;
  onChange: (changes: Partial<HotspotMapFilters>) => void;
  scopedHotspots: Hotspot[];
  visibleHotspots: Hotspot[];
  onOpenHotspot: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const matchingHotspots = filterMapHotspots(scopedHotspots, { ...filters, enabled: true });
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>('.detail-trigger')?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [open]);
  return (
    <div className="map-hotspot-picker" ref={root}>
      <button
        type="button"
        className="detail-trigger"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <Flame size={15} />
        <span>
          Points chauds{' '}
          <strong>{filters.enabled ? `${visibleHotspots.length}/${scopedHotspots.length}` : 'masqués'}</strong>
        </span>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <div id={id} className="hotspot-filter-popover" role="group" aria-label="Filtres des points chauds">
          <div className="hotspot-filter-header">
            <strong>Points chauds de cette carte</strong>
            <button type="button" aria-label="Fermer les filtres" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="hotspot-filter-layout">
            <HotspotFilterFields filters={filters} onChange={onChange} showDisplayToggle />
            <section className="hotspot-filter-results" aria-label="Liste des points chauds">
              <div className="hotspot-filter-results-heading">
                <strong>
                  {matchingHotspots.length} point{matchingHotspots.length > 1 ? 's' : ''} chaud
                  {matchingHotspots.length > 1 ? 's' : ''}
                </strong>
                <span>sur {scopedHotspots.length} dans ce périmètre</span>
              </div>
              <div className="hotspot-filter-list" role="group" aria-label="Points chauds visibles">
                {matchingHotspots.length ? (
                  matchingHotspots.map((hotspot) => (
                    <button type="button" key={hotspot.id} onClick={() => onOpenHotspot(hotspot.id)}>
                      <span className={`hotspot-filter-severity severity-${hotspot.severity}`} aria-hidden="true">
                        <Flame size={17} />
                      </span>
                      <span className="hotspot-filter-list-label">
                        <strong>{hotspot.title}</strong>
                        <small>Criticité {hotspot.severity === 'unassessed' ? 'non évaluée' : hotspot.severity}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>Aucun point chaud avec ces filtres.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
