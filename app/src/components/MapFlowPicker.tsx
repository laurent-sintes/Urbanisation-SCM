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
import { ui } from '../ui.ts';
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
    ? ui('mapFlowPicker.masques')
    : !types.length
      ? ui('mapFlowPicker.none')
      : types.length === 1
        ? types[0] === 'shares-data'
          ? ui('mapFlowPicker.donnees')
          : ui('mapFlowPicker.knowledge')
        : ui('mapFlowPicker.all');
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
          {ui('mapFlowPicker.flux')}
          <strong>{state}</strong>
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
              aria-label={ui('mapFlowPicker.filtres_des_flux')}
            >
              <div className="flow-filter-heading">
                <strong>{ui('mapFlowPicker.flux_de_cette_carte')}</strong>
                <button
                  type="button"
                  aria-label={ui('mapFlowPicker.fermer_les_filtres_des_flux')}
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <label className="flow-display-toggle">
                <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} />
                {ui('mapFlowPicker.afficher_les_flux')}
              </label>
              <fieldset>
                <legend>{ui('mapFlowPicker.types_de_flux')}</legend>
                {(
                  [
                    [
                      'shares-data',
                      ui('mapFlowPicker.partage_de_donnees'),
                      ui('mapFlowPicker.transmettre_des_informations_entre_deux_perimetres'),
                    ],
                    [
                      'provides-knowledge',
                      ui('mapFlowPicker.apport_de_connaissance'),
                      ui('mapFlowPicker.eclairer_une_decision_ou_un_calcul'),
                    ],
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
                  <legend>{ui('mapFlowPicker.explorer_les_echanges_externes')}</legend>
                  {destinations.map((destination) => (
                    <button
                      key={destination.scopeId}
                      type="button"
                      className="flow-external-destination"
                      aria-label={ui('mapFlowPicker.voir_les_echanges_dans', { name: destination.name })}
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
              {enabled && !types.length && <p>{ui('mapFlowPicker.aucun_type_de_flux_selectionne')}</p>}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
