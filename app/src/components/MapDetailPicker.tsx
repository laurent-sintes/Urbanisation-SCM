import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export function MapDetailPicker({ labels, value, onChange }: { labels: string[]; value: number; onChange: (value: number) => void }) {
  const [open, setOpen] = useState(false);
  const optionsId = useId();
  const root = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const max = labels.length - 1;
  useEffect(() => {
    if (!open) return;
    if (range.current?.disabled) root.current?.querySelector<HTMLButtonElement>('.detail-options button')?.focus();
    else range.current?.focus();
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector<HTMLButtonElement>('.detail-trigger')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [open]);
  return <div className="map-detail-picker" ref={root}>
    <button type="button" className="detail-trigger" aria-expanded={open} aria-controls={open ? optionsId : undefined} onClick={() => setOpen(value => !value)}><SlidersHorizontal size={15}/><span>Détail <strong>{labels[value]}</strong></span><ChevronDown size={14} className={open ? 'is-open' : ''}/></button>
    {open && <div id={optionsId} className="detail-popover" role="group" aria-label="Niveau de détail de la carte">
      <div className="detail-popover-heading">Niveau de détail <strong>{labels[value]}</strong></div>
      <input ref={range} className="detail-range" type="range" min={0} max={max} step={1} value={value} aria-label="Niveau de détail de la carte" aria-valuetext={labels[value]} disabled={max === 0} style={{ '--detail-progress': `${max ? value / max * 100 : 0}%` } as React.CSSProperties} onChange={event => onChange(Number(event.target.value))}/>
      <div className="detail-options">{labels.map((label, index) => <button type="button" key={label} aria-current={index === value ? 'step' : undefined} onClick={() => onChange(index)}>{label}</button>)}</div>
      {max === 0 && <p>Aucun niveau supplémentaire publié.</p>}
    </div>}
  </div>;
}
