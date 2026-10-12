import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { ChevronDown, Flame, X } from 'lucide-react';
import { useId, useState } from 'react';
import { framingLabel } from '../hotspotFraming';
import { filterMapHotspots, type HotspotMapFilters, isHotspotVisible } from '../hotspotMap';
import type { Hotspot } from '../types';
import { useHotspotFloating } from './HotspotDisplay';
import { HotspotFilterFields } from './HotspotFilterFields';
import { ModelText } from './ModelLinks';

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
  const id = useId();
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen);
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const matchingHotspots = filterMapHotspots(scopedHotspots, { ...filters, enabled: true });
  const displayedScope = scopedHotspots.filter(isHotspotVisible);
  const hiddenHotspots = scopedHotspots.filter((hotspot) => !isHotspotVisible(hotspot));
  return (
    <div className="map-hotspot-picker">
      <button
        type="button"
        className="detail-trigger"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <Flame size={15} />
        <span>
          Points chauds{' '}
          <strong>{filters.enabled ? `${visibleHotspots.length}/${displayedScope.length}` : 'masqués'}</strong>
        </span>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <FloatingPortal root={host}>
          <FloatingFocusManager context={context} modal={matchMedia('(max-width: 900px)').matches}>
            <div
              {...getFloatingProps()}
              ref={refs.setFloating}
              style={floatingStyles}
              id={id}
              className="hotspot-filter-popover"
              role="dialog"
              aria-label="Filtres des points chauds"
            >
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
                    <span>sur {displayedScope.length} visibles dans ce périmètre</span>
                  </div>
                  <div
                    className="hotspot-filter-list"
                    role="group"
                    aria-label="Points chauds correspondant aux filtres"
                  >
                    {matchingHotspots.length ? (
                      matchingHotspots.map((hotspot) => (
                        <button type="button" key={hotspot.id} onClick={() => onOpenHotspot(hotspot.id)}>
                          <span className={`hotspot-filter-severity severity-${hotspot.severity}`} aria-hidden="true">
                            <Flame size={17} />
                          </span>
                          <span className="hotspot-filter-list-label">
                            <strong>{hotspot.title}</strong>
                            <span className="hotspot-picker-summary">
                              <ModelText text={hotspot.problem} />
                            </span>
                            <small>
                              {framingLabel(hotspot)} · Criticité{' '}
                              {hotspot.severity === 'unassessed' ? 'non évaluée' : hotspot.severity}
                            </small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <p>Aucun point chaud avec ces filtres.</p>
                    )}
                    {hiddenHotspots.length > 0 && (
                      <>
                        <div className="hotspot-hidden-separator">Non visibles — hors des filtres et de la carte</div>
                        {hiddenHotspots.map((hotspot) => (
                          <button
                            type="button"
                            key={hotspot.id}
                            className="hotspot-is-hidden"
                            data-hotspot-id={hotspot.id}
                            onClick={() => onOpenHotspot(hotspot.id)}
                          >
                            <span className="hotspot-filter-list-label">
                              <strong>{hotspot.title}</strong>
                              <small>Non visible</small>
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
