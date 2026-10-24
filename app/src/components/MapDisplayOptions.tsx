import { ChevronDown, Settings2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ui } from '../ui.ts';
import { DismissibleDetails } from './DismissibleDetails';
import { useHotspotFloating } from './HotspotDisplay';

export function MapDisplayOptions({ children, active }: { children: ReactNode; active: string[] }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles } = useHotspotFloating(open, setOpen, 0.75, {
    preferredMaxWidth: 640,
    reserveToolbar: false,
    placement: 'bottom-end',
  });
  return (
    <DismissibleDetails className="map-display-options" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary ref={refs.setReference}>
        <Settings2 size={15} />
        <span>
          {ui('mapDisplayOptions.affichage')}
          {active.length > 0 && (
            <>
              <b className="map-display-count">
                {active.length}
                <span className="sr-only">{ui('mapDisplayOptions.surcouches_actives')}</span>
              </b>
              <small> · {active.join(' · ')}</small>
            </>
          )}
        </span>
        <ChevronDown size={14} />
      </summary>
      {open && (
        <div ref={refs.setFloating} className="map-display-fields" style={floatingStyles}>
          {children}
        </div>
      )}
    </DismissibleDetails>
  );
}
