import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { announceMapPanel, MAP_PANEL_EVENT } from '../mapOverlayEvents';
import { useHotspotFloating } from './HotspotDisplay';
import './map-overlays.css';

/** A disclosure outside the map's layout and camera, including in fullscreen. */
export function MapOverlayPanel({
  label,
  icon,
  children,
  className = '',
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const shell = useRef<HTMLDivElement>(null);
  const { refs, context, floatingStyles, host } = useHotspotFloating(open, setOpen, 0.65, {
    preferredMaxWidth: 360,
    reserveToolbar: false,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  useEffect(() => {
    const scope = shell.current?.closest('.map-panel, .universe-overview');
    const close = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false);
    };
    scope?.addEventListener(MAP_PANEL_EVENT, close);
    return () => scope?.removeEventListener(MAP_PANEL_EVENT, close);
  }, [id]);
  useEffect(() => {
    if (open) announceMapPanel(shell.current, id);
  }, [open, id]);
  useEffect(() => {
    if (!open) return;
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      shell.current?.querySelector('button')?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', dismissWithEscape, true);
    return () => document.removeEventListener('keydown', dismissWithEscape, true);
  }, [open]);
  return (
    <div ref={shell} className={`map-overlay-disclosure ${className}`}>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="button"
        className="map-overlay-toggle"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        title={label}
      >
        {icon}
        <span>{label}</span>
      </button>
      {open && (
        <FloatingPortal root={host}>
          <FloatingFocusManager context={context} modal={false} returnFocus>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              id={id}
              className="map-overlay-panel"
              style={floatingStyles}
              role="dialog"
              aria-label={label}
            >
              <header>
                <strong>{label}</strong>
                <button
                  type="button"
                  aria-label={`Fermer le panneau ${label.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </header>
              <div className="map-overlay-content">{children}</div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
