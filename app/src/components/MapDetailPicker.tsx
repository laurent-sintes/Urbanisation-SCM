import { FloatingFocusManager, FloatingPortal, useClick, useDismiss, useInteractions } from '@floating-ui/react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useHotspotFloating } from './HotspotDisplay';

export function MapDetailPicker({
  labels,
  value,
  onChange,
}: {
  labels: string[];
  value: number;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const optionsId = useId();
  const range = useRef<HTMLInputElement>(null);
  const max = labels.length - 1;
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen);
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context)]);
  useEffect(() => {
    if (!open) return;
    if (range.current?.disabled)
      range.current?.closest('.detail-popover')?.querySelector<HTMLButtonElement>('.detail-options button')?.focus();
    else range.current?.focus();
  }, [open]);
  return (
    <div className="map-detail-picker">
      <button
        type="button"
        className="detail-trigger"
        aria-expanded={open}
        aria-controls={open ? optionsId : undefined}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <SlidersHorizontal size={15} />
        <span>
          Détail <strong>{labels[value]}</strong>
        </span>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <FloatingPortal root={host}>
          <FloatingFocusManager context={context} modal={false}>
            <div
              {...getFloatingProps()}
              ref={refs.setFloating}
              style={floatingStyles}
              id={optionsId}
              className="detail-popover"
              role="group"
              aria-label="Niveau de détail de la carte"
            >
              <div className="detail-popover-heading">
                Niveau de détail <strong>{labels[value]}</strong>
              </div>
              <input
                ref={range}
                className="detail-range"
                type="range"
                min={0}
                max={max}
                step={1}
                value={value}
                aria-label="Niveau de détail de la carte"
                aria-valuetext={labels[value]}
                disabled={max === 0}
                style={{ '--detail-progress': `${max ? (value / max) * 100 : 0}%` } as React.CSSProperties}
                onChange={(event) => onChange(Number(event.target.value))}
              />
              <div className="detail-options">
                {labels.map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    aria-current={index === value ? 'step' : undefined}
                    onClick={() => onChange(index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {max === 0 && <p>Aucun niveau supplémentaire publié.</p>}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
