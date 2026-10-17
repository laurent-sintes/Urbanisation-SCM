import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { ChevronDown, Route, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useHotspotFloating } from './HotspotDisplay';

export type FlowType = 'shares-data' | 'provides-knowledge';
export const FLOW_TYPES: FlowType[] = ['shares-data', 'provides-knowledge'];

export function MapFlowPicker({
  enabled,
  onEnabledChange,
  types,
  onTypesChange,
  destinations = [],
  onOpenDestination,
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  types: readonly FlowType[];
  onTypesChange: (types: FlowType[]) => void;
  destinations?: readonly { scopeId: string; name: string; count: number }[];
  onOpenDestination?: (scopeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen, 0.75, { reserveToolbar: false });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' }),
  ]);
  const state = !enabled
    ? 'masqués'
    : !types.length
      ? 'aucun'
      : types.length === 1
        ? types[0] === 'shares-data'
          ? 'données'
          : 'connaissance'
        : 'tous';
  return (
    <div className="map-flow-picker">
      <button
        type="button"
        className="detail-trigger"
        ref={refs.setReference}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        {...getReferenceProps()}
      >
        <Route size={15} />
        <span>
          Flux <strong>{state}</strong>
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
              className="flow-filter-popover"
              role="dialog"
              aria-label="Filtres des flux"
            >
              <div className="flow-filter-heading">
                <strong>Flux de cette carte</strong>
                <button type="button" aria-label="Fermer les filtres des flux" onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <label className="flow-display-toggle">
                <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} />
                Afficher les flux
              </label>
              <fieldset>
                <legend>Types de flux</legend>
                {(
                  [
                    ['shares-data', 'Partage de données', 'Transmettre des informations entre deux périmètres.'],
                    ['provides-knowledge', 'Apport de connaissance', 'Éclairer une décision ou un calcul.'],
                  ] as const
                ).map(([type, label, description]) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      aria-label={label}
                      checked={types.includes(type)}
                      onChange={(event) =>
                        onTypesChange(event.target.checked ? [...types, type] : types.filter((item) => item !== type))
                      }
                    />
                    <span>
                      {label}
                      <small>{description}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {!!destinations.length && onOpenDestination && (
                <fieldset className="flow-external-destinations">
                  <legend>Explorer les échanges externes</legend>
                  {destinations.map((destination) => (
                    <button
                      key={destination.scopeId}
                      type="button"
                      className="flow-external-destination"
                      aria-label={`Voir les échanges dans ${destination.name}`}
                      onClick={() => {
                        setOpen(false);
                        onOpenDestination(destination.scopeId);
                      }}
                    >
                      <span>{destination.name}</span>
                      <span>{destination.count}</span>
                    </button>
                  ))}
                </fieldset>
              )}
              {enabled && !types.length && <p>Aucun type de flux sélectionné.</p>}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
