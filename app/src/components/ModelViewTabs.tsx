import { ArrowLeft, ArrowRightLeft, BookOpen, ChevronDown, FileText, GitBranch, LayoutGrid } from 'lucide-react';
import { useRef } from 'react';
import type { View } from '../navigation';
import { DismissibleDetails } from './DismissibleDetails';

export function ModelViewTabs({
  view,
  mobile,
  hasNode,
  relationCount,
  onChange,
  parentLabel,
  onParent,
}: {
  view: View;
  mobile: boolean;
  hasNode: boolean;
  relationCount?: number;
  onChange: (view: View) => void;
  parentLabel?: string;
  onParent?: () => void;
}) {
  const more = useRef<HTMLDetailsElement>(null);
  const tabs = [
    { id: 'map', label: 'Carte', Icon: LayoutGrid },
    { id: 'sheet', label: 'Fiche', Icon: FileText },
    { id: 'flows', label: 'Flux', Icon: ArrowRightLeft },
    { id: 'relations', label: 'Relations', Icon: GitBranch },
    { id: 'market', label: 'Sources d’inspiration', Icon: BookOpen },
  ] as const;
  const available = tabs.filter((tab) => hasNode || !['sheet', 'market'].includes(tab.id));
  const primary = available.filter((tab) => !mobile || !['market', 'relations'].includes(tab.id));
  const secondary = available.filter((tab) => !primary.includes(tab));
  const activeMore = secondary.find((tab) => tab.id === view);
  return (
    <div className="model-view-navigation">
      <div className="view-tabs" role="tablist" aria-label="Vue du modèle">
        {primary.map((tab, index) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls="atlas-view"
            aria-selected={view === tab.id}
            tabIndex={view === tab.id || (activeMore && index === 0) ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const buttons = [
                ...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []),
              ];
              const target =
                event.key === 'Home'
                  ? buttons[0]
                  : event.key === 'End'
                    ? buttons.at(-1)
                    : buttons[(index + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
              target?.click();
              target?.focus();
            }}
          >
            <tab.Icon size={16} />
            {tab.label}
            {tab.id === 'relations' && relationCount !== undefined && <span className="count">{relationCount}</span>}
          </button>
        ))}
      </div>
      {secondary.length > 0 && (
        <DismissibleDetails
          ref={more}
          className="view-more"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && more.current?.open) {
              event.preventDefault();
              more.current.open = false;
              more.current.querySelector('summary')?.focus();
            }
          }}
        >
          <summary id="view-more-label" className={activeMore ? 'is-active' : ''}>
            {activeMore?.label || 'Plus'}
            <ChevronDown size={14} />
          </summary>
          <div className="view-more-options">
            {secondary.map((tab) => (
              <button
                type="button"
                id={`tab-${tab.id}`}
                key={tab.id}
                aria-current={view === tab.id ? 'page' : undefined}
                onClick={() => {
                  if (more.current) more.current.open = false;
                  onChange(tab.id);
                }}
              >
                <tab.Icon size={16} />
                {tab.label}
              </button>
            ))}
            {mobile && parentLabel && onParent && (
              <button
                type="button"
                onClick={() => {
                  if (more.current) more.current.open = false;
                  onParent();
                }}
              >
                <ArrowLeft size={16} />
                Remonter vers {parentLabel}
              </button>
            )}
          </div>
        </DismissibleDetails>
      )}
    </div>
  );
}
