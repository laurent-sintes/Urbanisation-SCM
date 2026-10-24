import {
  BookOpen,
  Boxes,
  ChevronDown,
  Compass,
  FileText,
  Flame,
  HelpCircle,
  Lightbulb,
  PanelLeftClose,
  Route,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { RouteState } from '../navigation';
import { staticUrl } from '../publication';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';

interface Props {
  model: PublishedModel;
  route: RouteState;
  open: boolean;
  mobile: boolean;
  onClose: () => void;
  onNavigate: (id: string, focusHeading?: boolean) => void;
  onSearch: (changes: Partial<RouteState>) => void;
  onOpenGlossary: (mode: 'model' | 'meta' | 'transformation') => void;
  onOpenPrinciples: () => void;
}
export function Sidebar({
  model,
  route,
  open,
  mobile,
  onClose,
  onNavigate,
  onSearch,
  onOpenGlossary,
  onOpenPrinciples,
}: Props) {
  const panel = useRef<HTMLElement>(null);
  const apps = route.view === 'applications';
  const understand = ['documents', 'glossary', 'design-principles', 'principles', 'help', 'metamodel'].includes(
    route.view || '',
  );
  const [expanded, setExpanded] = useState<'apps' | 'understand' | null>(
    apps ? 'apps' : understand ? 'understand' : null,
  );
  useEffect(() => {
    setExpanded(apps ? 'apps' : understand ? 'understand' : null);
    panel.current?.querySelector('.sidebar-scroll')?.scrollTo(0, 0);
  }, [apps, understand]);
  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const items = [
        ...(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],summary,select') || []),
      ].filter((el) => el.getClientRects().length > 0);
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      previous?.focus({ preventScroll: true });
    };
  }, [open, mobile, onClose]);
  const visit = (changes: Partial<RouteState>) => {
    onSearch({
      returnTo: '',
      catalogReturn: '',
      scroll: '',
      node: '',
      scope: '',
      query: '',
      section: '',
      term: '',
      principle: '',
      ...changes,
    });
    onClose();
  };
  const revision = model.revision ? `v${String(model.revision).padStart(3, '0')}` : model.version;
  const publicationLabel = ui('sidebar.version_du_modele_complet', {
    revision: revision,
    version: model.version,
    value3: route.version
      ? ui('sidebar.publication_fixe')
      : ui('sidebar.publication_courante_actualisee_automatiquement'),
  });
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: The mobile aside becomes a modal dialog at runtime.
    <aside
      ref={panel}
      id="atlas-tree-panel"
      className={`sidebar ${open ? 'open' : ''}`}
      aria-label={ui('sidebar.navigation_atlas')}
      inert={mobile && !open}
      aria-hidden={mobile && !open ? true : undefined}
      aria-modal={mobile && open ? true : undefined}
      role={mobile && open ? 'dialog' : undefined}
    >
      <div className="sidebar-heading">
        <span className="root-link">{ui('sidebar.explorer')}</span>
        <button type="button" className="drawer-close" aria-label={ui('sidebar.fermer_le_panneau')} onClick={onClose}>
          <PanelLeftClose size={20} />
        </button>
      </div>
      <div className="sidebar-scroll">
        <nav className="primary-spaces" aria-label={ui('sidebar.espaces_atlas')}>
          <button
            type="button"
            aria-current={
              !apps && !understand && route.view !== 'scenarios' && route.view !== 'hotspots' ? 'page' : undefined
            }
            onClick={() => onNavigate('')}
          >
            <Compass size={18} />
            {ui('sidebar.cartographie')}
          </button>
          {!!model.raw.scenario_catalog && (
            <button
              type="button"
              aria-current={route.view === 'scenarios' ? 'page' : undefined}
              onClick={() =>
                visit({
                  view: 'scenarios',
                  scenario: '',
                  stream: '',
                  path: '',
                  event: '',
                  object: '',
                  situation: '',
                  capability: '',
                  scenarioQuery: '',
                })
              }
            >
              <Route size={18} />
              {ui('sidebar.scenarios_metier')}
            </button>
          )}
          {!!model.raw.hotspot_catalog && (
            <button
              type="button"
              aria-current={route.view === 'hotspots' ? 'page' : undefined}
              onClick={() => visit({ view: 'hotspots', hotspot: '', hotspotGroup: '', status: '' })}
            >
              <Flame size={18} />
              {ui('sidebar.points_chauds')}
            </button>
          )}
          {!!model.raw.application_catalog && (
            <details
              className="navigation-group"
              name="atlas-navigation"
              open={expanded === 'apps'}
              onToggle={(event) => {
                const next = event.currentTarget.open;
                setExpanded((current) => (next ? 'apps' : current === 'apps' ? null : current));
              }}
            >
              <summary className={apps ? 'is-active' : ''}>
                <Boxes size={18} />
                {ui('sidebar.applications')}
                <ChevronDown size={15} />
              </summary>
              <div className="navigation-submenu">
                <button
                  type="button"
                  aria-current={apps && route.appView === 'products' ? 'page' : undefined}
                  onClick={() =>
                    visit({ view: 'applications', appView: 'products', appSelection: '', appComponent: '' })
                  }
                >
                  {ui('sidebar.logiciels_du_marche')}
                </button>
                <button
                  type="button"
                  aria-current={apps && route.appView !== 'products' ? 'page' : undefined}
                  onClick={() =>
                    visit({ view: 'applications', appView: 'systems', appSelection: '', appComponent: '' })
                  }
                >
                  {ui('sidebar.si_a_faire_converger')}
                </button>
              </div>
            </details>
          )}
          <details
            className="navigation-group"
            name="atlas-navigation"
            open={expanded === 'understand'}
            onToggle={(event) => {
              const next = event.currentTarget.open;
              setExpanded((current) => (next ? 'understand' : current === 'understand' ? null : current));
            }}
          >
            <summary className={understand ? 'is-active' : ''}>
              <BookOpen size={18} />
              {ui('sidebar.comprendre')}
              <ChevronDown size={15} />
            </summary>
            <div className="navigation-submenu">
              <button
                type="button"
                aria-current={route.view === 'design-principles' ? 'page' : undefined}
                onClick={() => visit({ view: 'design-principles' })}
              >
                {ui('sidebar.principes_directeurs')}
              </button>
              <button
                type="button"
                aria-current={route.view === 'glossary' ? 'page' : undefined}
                onClick={() => onOpenGlossary('model')}
              >
                {ui('sidebar.glossaire_metier')}
              </button>
              <button
                type="button"
                aria-current={route.view === 'documents' ? 'page' : undefined}
                onClick={() => visit({ view: 'documents', document: '', hotspot: '' })}
              >
                <FileText size={15} />
                {ui('sidebar.documents')}
              </button>
              <button
                type="button"
                aria-current={route.view === 'principles' ? 'page' : undefined}
                onClick={onOpenPrinciples}
              >
                <Lightbulb size={15} />
                {ui('sidebar.methode_de_transformation')}
              </button>
              <button
                type="button"
                aria-current={route.view === 'help' || route.view === 'metamodel' ? 'page' : undefined}
                onClick={() => visit({ view: 'help', helpTopic: 'start' })}
              >
                <HelpCircle size={15} />
                {ui('sidebar.aide_a_la_lecture')}
              </button>
            </div>
          </details>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-stats">
          <span id="fa-version" className="model-version" data-version={model.version} title={publicationLabel}>
            <span className={`live-dot ${route.version ? 'fixed' : ''}`} aria-hidden="true" />
            {ui('sidebar.modele')}
            {revision}
            <span className="sr-only">{publicationLabel}</span>
          </span>
        </div>
        <img
          className="beaumanoir-source-logo"
          src={staticUrl('assets/beaumanoir-original.png')}
          width="1564"
          height="605"
          alt={ui('sidebar.groupe_beaumanoir')}
        />
      </div>
    </aside>
  );
}
