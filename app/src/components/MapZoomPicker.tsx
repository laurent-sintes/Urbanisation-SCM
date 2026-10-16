import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MapZoomChoice } from '../mapZoom';
import { preference, savePreference } from '../navigation';

export function useMapZoomChoice() {
  const [choice, setChoice] = useState<MapZoomChoice>(() => {
    const saved = preference<string>('map-zoom-choice', 'auto');
    return saved === 'page' || saved === 'width' ? saved : 'auto';
  });
  useEffect(() => savePreference('map-zoom-choice', choice), [choice]);
  return [choice, setChoice] as const;
}

export function MapZoomPicker({
  choice,
  onChange,
  pageFallback,
}: {
  choice: MapZoomChoice;
  onChange: (choice: MapZoomChoice) => void;
  pageFallback: boolean;
}) {
  const tooltipId = useId();
  const helpReference = useRef<HTMLButtonElement | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpEnabled = choice === 'page' && pageFallback;
  const { refs, context, floatingStyles } = useFloating({
    open: helpEnabled && helpOpen,
    onOpenChange: (open, _event, reason) => {
      // Reframing may move the button away from the pointer while it still owns keyboard focus.
      if (!open && reason === 'hover' && document.activeElement === helpReference.current) return;
      setHelpOpen(open);
    },
    strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { enabled: helpEnabled }),
    useFocus(context, { enabled: helpEnabled }),
    useDismiss(context),
  ]);
  const setHelpReference = useCallback(
    (button: HTMLButtonElement | null) => {
      helpReference.current = button;
      refs.setReference(button);
    },
    [refs.setReference],
  );
  useEffect(() => {
    // The layout can discover its readable fallback after the button has already received focus.
    if (helpEnabled && document.activeElement === helpReference.current) setHelpOpen(true);
  }, [helpEnabled]);
  return (
    <div className="map-zoom-choice" role="group" aria-label="Cadrage de la carte">
      {(
        [
          { id: 'auto', label: 'Auto' },
          { id: 'page', label: 'Pleine page' },
          { id: 'width', label: 'Pleine largeur' },
        ] as const
      ).map((option) => {
        const help = option.id === 'page' && choice === 'page' && pageFallback;
        return (
          <span key={option.id} className="map-zoom-option">
            <button
              {...(option.id === 'page' ? getReferenceProps() : {})}
              ref={option.id === 'page' ? setHelpReference : undefined}
              type="button"
              aria-pressed={choice === option.id}
              aria-describedby={help && helpOpen ? tooltipId : undefined}
              onClick={() => {
                onChange(option.id);
                setHelpOpen(option.id === 'page');
              }}
            >
              {option.label}
              {help && (
                <sup className="map-zoom-asterisk" aria-hidden="true">
                  *
                </sup>
              )}
            </button>
          </span>
        );
      })}
      {helpEnabled && helpOpen && (
        <FloatingPortal
          root={document.fullscreenElement instanceof HTMLElement ? document.fullscreenElement : document.body}
        >
          <span
            {...getFloatingProps()}
            ref={refs.setFloating}
            style={floatingStyles}
            id={tooltipId}
            role="tooltip"
            className="map-zoom-tooltip is-floating"
          >
            Ce niveau ne tient pas lisiblement sur une page. Parcours à taille de lecture, avec défilement si
            nécessaire.
          </span>
        </FloatingPortal>
      )}
    </div>
  );
}
