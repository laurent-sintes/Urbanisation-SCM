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
import { filterMapHotspots, type HotspotMapFilters } from '../hotspotMap';
import type { Hotspot } from '../types';
import { useHotspotFloating } from './HotspotDisplay';
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
  const id = useId();
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen);
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const matchingHotspots = filterMapHotspots(scopedHotspots, { ...filters, enabled: true });
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
          <strong>{filters.enabled ? `${visibleHotspots.length}/${scopedHotspots.length}` : 'masqués'}</strong>
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
                    <span>sur {scopedHotspots.length} dans ce périmètre</span>
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
