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
import { featuredPrinciples, principleTitle, readingGuides } from '../designPrinciples';
import type { ModelingGuide } from '../modelingGuide';
import type { RouteState } from '../navigation';
import { staticUrl } from '../publication';
import { catalogOf } from '../scenarioCatalog';
import type { AtlasNode, PublishedModel } from '../types';
import { MethodNavigation } from './MethodNavigation';
import { CatalogLink } from './ModelLinks';
import { SheetNavigation } from './SheetNavigation';

interface Props {
  guide?: ModelingGuide;
  model: PublishedModel;
  route: RouteState;
  open: boolean;
  mobile: boolean;
  sheetNode?: AtlasNode;
  onClose: () => void;
  onNavigate: (id: string, focusHeading?: boolean) => void;
  onSearch: (changes: Partial<RouteState>) => void;
  onOpenGlossary: (mode: 'model' | 'meta' | 'transformation') => void;
  onOpenMetamodel: () => void;
  onOpenPrinciples: () => void;
}
export function Sidebar({
  model,
  guide,
  route,
  open,
  mobile,
  sheetNode,
  onClose,
  onNavigate,
  onSearch,
  onOpenGlossary,
  onOpenPrinciples,
  onOpenMetamodel,
}: Props) {
  const panel = useRef<HTMLElement>(null);
  const apps = route.view === 'applications';
  const understand = ['documents', 'glossary', 'design-principles', 'principles', 'help', 'metamodel'].includes(
    route.view || '',
  );
  const [appsOpen, setAppsOpen] = useState(apps);
  const [understandOpen, setUnderstandOpen] = useState(understand);
  useEffect(() => {
    if (apps) setAppsOpen(true);
    if (understand) setUnderstandOpen(true);
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
  const publicationLabel = `Version du modèle complet : ${revision} · ${model.version}. ${route.version ? 'Publication fixe' : 'Publication courante, actualisée automatiquement'}.`;
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: The mobile aside becomes a modal dialog at runtime.
    <aside
      ref={panel}
      id="atlas-tree-panel"
      className={`sidebar ${open ? 'open' : ''}`}
      aria-label="Navigation Atlas"
      inert={mobile && !open}
      aria-hidden={mobile && !open ? true : undefined}
      aria-modal={mobile && open ? true : undefined}
      role={mobile && open ? 'dialog' : undefined}
    >
      <div className="sidebar-heading">
        <span className="root-link">Explorer</span>
        <button type="button" className="drawer-close" aria-label="Fermer le panneau" onClick={onClose}>
          <PanelLeftClose size={20} />
        </button>
      </div>
      <div className="sidebar-scroll">
        <nav className="primary-spaces" aria-label="Espaces Atlas">
          <button
            type="button"
            aria-current={
              !apps && !understand && route.view !== 'scenarios' && route.view !== 'hotspots' ? 'page' : undefined
            }
            onClick={() => onNavigate('')}
          >
            <Compass size={18} />
            Cartographie
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
              Scénarios métier
            </button>
          )}
          {!!model.raw.hotspot_catalog && (
            <button
              type="button"
              aria-current={route.view === 'hotspots' ? 'page' : undefined}
              onClick={() => visit({ view: 'hotspots', hotspot: '', hotspotGroup: '', status: '' })}
            >
              <Flame size={18} />
              Points chauds
            </button>
          )}
          {!!model.raw.application_catalog && (
            <details
              className="navigation-group"
              open={appsOpen}
              onToggle={(event) => setAppsOpen(event.currentTarget.open)}
            >
              <summary className={apps ? 'is-active' : ''}>
                <Boxes size={18} />
                Applications
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
                  Produits logiciels du marché
                </button>
                <button
                  type="button"
                  aria-current={apps && route.appView !== 'products' ? 'page' : undefined}
                  onClick={() =>
                    visit({ view: 'applications', appView: 'systems', appSelection: '', appComponent: '' })
                  }
                >
                  SI à faire converger
                </button>
              </div>
            </details>
          )}
          <details
            className="navigation-group"
            open={understandOpen}
            onToggle={(event) => setUnderstandOpen(event.currentTarget.open)}
          >
            <summary className={understand ? 'is-active' : ''}>
              <BookOpen size={18} />
              Comprendre
              <ChevronDown size={15} />
            </summary>
            <div className="navigation-submenu">
              <button
                type="button"
                aria-current={route.view === 'design-principles' ? 'page' : undefined}
                onClick={() => visit({ view: 'design-principles' })}
              >
                Principes directeurs
              </button>
              <button
                type="button"
                aria-current={route.view === 'glossary' ? 'page' : undefined}
                onClick={() => onOpenGlossary('model')}
              >
                Glossaire métier
              </button>
              <button
                type="button"
                aria-current={route.view === 'documents' ? 'page' : undefined}
                onClick={() => visit({ view: 'documents', document: '', hotspot: '' })}
              >
                <FileText size={15} />
                Documents et téléchargements
              </button>
              <button
                type="button"
                aria-current={route.view === 'principles' ? 'page' : undefined}
                onClick={onOpenPrinciples}
              >
                <Lightbulb size={15} />
                {guide?.title || 'Méthode de transformation'}
              </button>
              <button
                type="button"
                aria-current={route.view === 'help' || route.view === 'metamodel' ? 'page' : undefined}
                onClick={() => visit({ view: 'help', helpTopic: 'start' })}
              >
                <HelpCircle size={15} />
                Aide et repères de lecture
              </button>
            </div>
          </details>
        </nav>
        {sheetNode ? (
          <SheetNavigation model={model} node={sheetNode} onClose={onClose} />
        ) : ['scenarios', 'glossary', 'design-principles', 'principles', 'metamodel', 'help'].includes(
            route.view || '',
          ) ? (
          <nav className="space-navigation" aria-label="Navigation de cet espace">
            {route.view === 'glossary' && (
              <>
                <button
                  type="button"
                  aria-current={route.glossary === 'model' || !route.glossary ? 'page' : undefined}
                  onClick={() => onOpenGlossary('model')}
                >
                  Glossaire métier
                </button>
                <button
                  type="button"
                  aria-current={route.glossary === 'meta' ? 'page' : undefined}
                  onClick={() => onOpenGlossary('meta')}
                >
                  Glossaire du métamodèle
                </button>
                <button
                  type="button"
                  aria-current={route.glossary === 'transformation' ? 'page' : undefined}
                  onClick={() => onOpenGlossary('transformation')}
                >
                  Glossaire de transformation
                </button>
              </>
            )}
            {route.view === 'design-principles' && (
              <>
                <h2>Principes directeurs</h2>
                <button
                  type="button"
                  onClick={() => {
                    onSearch({ principle: '', scroll: '' });
                    onClose();
                  }}
                  aria-current={!route.principle ? 'page' : undefined}
                >
                  Tous les principes
                </button>
                {featuredPrinciples(model).map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    aria-current={route.principle === p.id ? 'page' : undefined}
                    onClick={() => {
                      onSearch({ principle: p.id, scroll: '' });
                      onClose();
                    }}
                  >
                    {principleTitle(p)}
                  </button>
                ))}
                {readingGuides(model).length > 0 && <h2>Repères de lecture</h2>}
                {readingGuides(model).map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    aria-current={
                      route.principle === p.id || p.reading_children?.includes(route.principle || '')
                        ? 'page'
                        : undefined
                    }
                    onClick={() => {
                      onSearch({ principle: p.id, scroll: '' });
                      onClose();
                    }}
                  >
                    Comment lire la cartographie
                  </button>
                ))}
              </>
            )}
            {route.view === 'principles' && (
              <MethodNavigation
                guide={guide}
                selected={route.principle}
                onSelect={(principle) => {
                  onSearch({ principle, scroll: '' });
                  onClose();
                }}
              />
            )}
            {(route.view === 'help' || route.view === 'metamodel') && (
              <>
                <h2>Aide</h2>
                <button
                  type="button"
                  aria-current={route.view === 'help' && route.helpTopic !== 'workshop' ? 'page' : undefined}
                  onClick={() => {
                    onSearch({ view: 'help', helpTopic: 'start', principle: '', section: '' });
                    onClose();
                  }}
                >
                  Par où commencer
                </button>
                <button
                  type="button"
                  aria-current={route.view === 'help' && route.helpTopic === 'workshop' ? 'page' : undefined}
                  onClick={() => {
                    onSearch({ view: 'help', helpTopic: 'workshop', principle: '', section: '' });
                    onClose();
                  }}
                >
                  Mode atelier
                </button>
                <button
                  type="button"
                  aria-current={route.view === 'metamodel' ? 'page' : undefined}
                  onClick={onOpenMetamodel}
                >
                  Métamodèle FLOW
                </button>
              </>
            )}
            {route.view === 'metamodel' && (
              <>
                <h2>Rubriques du métamodèle</h2>
                <MethodNavigation
                  guide={model.raw.metamodel?.documentation}
                  selected={route.principle}
                  onSelect={(principle) => {
                    onSearch({ principle, scroll: '' });
                    onClose();
                  }}
                />
              </>
            )}
            {route.view === 'scenarios' && (
              <>
                <h2>Flux de valeur</h2>
                <CatalogLink stream="">Tous les scénarios</CatalogLink>
                {catalogOf(model)?.value_streams.map((v) => (
                  <CatalogLink key={v.id} stream={v.id}>
                    {v.label_fr}
                  </CatalogLink>
                ))}
              </>
            )}
          </nav>
        ) : route.view === 'documents' ? (
          <nav className="space-navigation" aria-label="Dans les documents">
            <h2>Documents</h2>
            <button type="button" onClick={() => visit({ view: 'documents', document: '' })}>
              Études FLOW et publication
            </button>
          </nav>
        ) : null}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-stats">
          <span id="fa-version" className="model-version" data-version={model.version} title={publicationLabel}>
            <span className={`live-dot ${route.version ? 'fixed' : ''}`} aria-hidden="true" />
            Modèle · {revision}
            <span className="sr-only">{publicationLabel}</span>
          </span>
          <span>{model.nodes.length} éléments</span>
          <span>
            {model.nodes.filter((n) => n.kind === 'capability').length} capacités
            {model.nodes.some((n) => n.kind === 'behavior') && (
              <> · {model.nodes.filter((n) => n.kind === 'behavior').length} comportements</>
            )}
          </span>
        </div>
        <img
          className="beaumanoir-source-logo"
          src={staticUrl('assets/beaumanoir-original.png')}
          width="1564"
          height="605"
          alt="Groupe Beaumanoir"
        />
      </div>
    </aside>
  );
}
