import {
  BookOpen,
  ChevronDown,
  Compass,
  Download,
  HelpCircle,
  Lightbulb,
  PanelLeftClose,
  Search,
  X,
} from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { NodeIcon } from '../icons';
import { lineageOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import type { RouteState } from '../navigation';
import { kindLabel } from '../presentation';
import { publicationUrl, publicationYamlUrl, staticUrl } from '../publication';
import { catalogOf } from '../scenarioCatalog';
import { searchPublication } from '../search';
import type { PublishedModel } from '../types';
import { downloadWorkingModel, workshopUrl } from '../workshop';
import { MethodNavigation } from './MethodNavigation';
import { CatalogLink } from './ModelLinks';

interface Props {
  guide?: ModelingGuide;
  model: PublishedModel;
  route: RouteState;
  open: boolean;
  mobile: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onNavigate: (id: string, focusHeading?: boolean) => void;
  onSearch: (changes: Partial<RouteState>) => void;
  onOpenGlossary: (mode: 'model' | 'meta' | 'transformation') => void;
  onOpenMetamodel: () => void;
  onOpenTerm: (id: string) => void;
  onOpenPrinciples: () => void;
}
export function Sidebar({
  model,
  guide,
  route,
  open,
  mobile,
  searchRef,
  onClose,
  onNavigate,
  onSearch,
  onOpenGlossary,
  onOpenTerm,
  onOpenPrinciples,
  onOpenMetamodel,
}: Props) {
  const panel = useRef<HTMLElement>(null);
  const [resultType, setResultType] = useState('all');
  const searching = Boolean(route.query.trim());
  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const items = [
        ...(panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]),input,select,a[href],summary',
        ) || []),
      ].filter((el) => el.offsetParent !== null);
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
      previous?.focus();
    };
  }, [open, mobile, onClose]);
  const matches = searching
    ? searchPublication(model, route.query, guide, model.raw.metamodel?.documentation).filter(
        (result) =>
          resultType === 'all' ||
          (['glossary', 'scenario', 'value_stream', 'method', 'guide'].includes(resultType)
            ? result.kind === resultType
            : result.node?.kind === resultType),
      )
    : [];
  const revision = model.revision ? `v${String(model.revision).padStart(3, '0')}` : model.version;
  const publicationLabel = `Version du modèle complet : ${revision} · ${model.version}. ${route.version ? 'Publication fixe' : 'Publication courante, actualisée automatiquement'}.`;
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: The mobile aside becomes a modal dialog at runtime.
    <aside
      ref={panel}
      id="atlas-tree-panel"
      className={`sidebar ${open ? 'open' : ''} ${searching ? 'is-searching' : ''}`}
      aria-label="Navigation Atlas"
      aria-modal={mobile && open ? true : undefined}
      role={mobile && open ? 'dialog' : undefined}
    >
      <div className="sidebar-heading">
        <span className="root-link">Explorer</span>
        <button type="button" className="drawer-close" aria-label="Fermer le panneau" onClick={onClose}>
          <PanelLeftClose size={20} />
        </button>
      </div>
      <nav className="primary-spaces" aria-label="Espaces Atlas">
        <button
          type="button"
          aria-current={
            !['scenarios', 'hotspots', 'glossary', 'principles', 'metamodel', 'help'].includes(route.view || '')
              ? 'page'
              : undefined
          }
          onClick={() => onNavigate('')}
        >
          <Compass size={17} />
          Cartographie
        </button>
        {!!model.raw.scenario_catalog && (
          <button
            type="button"
            aria-current={route.view === 'scenarios' ? 'page' : undefined}
            onClick={() => {
              onSearch({
                view: 'scenarios',
                node: '',
                scope: '',
                query: '',
                scenario: '',
                stream: '',
                path: '',
                section: '',
                event: '',
                object: '',
                situation: '',
                capability: '',
                scenarioQuery: '',
                returnTo: '',
                catalogReturn: '',
                scroll: '',
              });
              onClose();
            }}
          >
            <Compass size={17} />
            Scénarios métier
          </button>
        )}
        {!!model.raw.hotspot_catalog && (
          <button
            type="button"
            aria-current={route.view === 'hotspots' ? 'page' : undefined}
            onClick={() => {
              onSearch({ view: 'hotspots', hotspot: '', node: '', scope: '', query: '', status: '', section: '' });
              onClose();
            }}
          >
            <Compass size={17} />
            Points chauds
          </button>
        )}
        <button
          type="button"
          onClick={() => onOpenGlossary('model')}
          aria-current={route.view === 'glossary' ? 'page' : undefined}
        >
          <BookOpen size={17} />
          Glossaire métier
        </button>
        <button
          type="button"
          onClick={onOpenPrinciples}
          aria-current={route.view === 'principles' ? 'page' : undefined}
        >
          <Lightbulb size={17} />
          {guide?.title || 'Transformation'}
        </button>
        <button
          type="button"
          onClick={() => {
            onSearch({ view: 'help', helpTopic: 'start', node: '', scope: '', query: '', section: '' });
            onClose();
          }}
          aria-current={route.view === 'help' || route.view === 'metamodel' ? 'page' : undefined}
        >
          <HelpCircle size={17} />
          Aide
        </button>
        <details className="download-menu">
          <summary>
            <Download size={17} />
            Télécharger
            <ChevronDown className="download-chevron" size={15} />
          </summary>
          <a
            href={publicationUrl(model.version)}
            download={`flow-atlas-model-${model.version}.json`}
            onClick={mobile ? onClose : undefined}
          >
            <span>Modèle (JSON compact)</span>
            <small>
              {revision} · {model.version}
            </small>
          </a>
          <a
            href={publicationYamlUrl(model.version)}
            download={`flow-atlas-model-${model.version}.yaml`}
            onClick={mobile ? onClose : undefined}
          >
            <span>Modèle (YAML lisible)</span>
            <small>
              {revision} · {model.version}
            </small>
          </a>
          {model.raw.workshop && (
            <>
              <a href={workshopUrl()} download={`flow-atlas-staging-${model.raw.workshop.session_id}.json`}>
                <span>Staging de l’atelier</span>
                <small>Séance {model.raw.workshop.session_id}</small>
              </a>
              <button type="button" className="workshop-download" onClick={() => downloadWorkingModel(model)}>
                Modèle de travail (JSON)
              </button>
            </>
          )}
        </details>
      </nav>
      <div className="search-box">
        <Search size={17} />
        <input
          ref={searchRef}
          id="fa-search"
          aria-label="Rechercher dans le modèle publié"
          placeholder="Un nom, une idée, un repère…"
          value={route.query}
          onChange={(e) => onSearch({ query: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              panel.current?.querySelector<HTMLButtonElement>('[data-search-result]')?.focus();
            }
            if (e.key === 'Escape') onSearch({ query: '', status: '' });
          }}
        />
        {route.query ? (
          <button type="button" aria-label="Effacer la recherche" onClick={() => onSearch({ query: '', status: '' })}>
            <X size={14} />
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </div>
      {searching ? (
        <div className="search-results" role="region" aria-label="Résultats de recherche">
          <label className="search-filter">
            Afficher
            <select aria-label="Type de résultat" value={resultType} onChange={(e) => setResultType(e.target.value)}>
              <option value="all">Tous les résultats</option>
              <option value="capability">Capacités</option>
              <option value="behavior">Comportements</option>
              <option value="domain">Domaines</option>
              <option value="area">Sous-domaines</option>
              <option value="business_area">Business Areas</option>
              <option value="reference">Référentiels</option>
              <option value="glossary">Glossaire métier</option>
              <option value="method">Notions documentaires</option>
              <option value="guide">Documentation</option>
              <option value="scenario">Scénarios</option>
              <option value="value_stream">Flux de valeur</option>
            </select>
          </label>
          <p role="status">
            {matches.length} résultat{matches.length > 1 ? 's' : ''}
          </p>
          {matches.map((result) => (
            <button
              type="button"
              key={`${result.kind}:${result.id}`}
              data-search-result={result.id}
              onClick={() => {
                if (['glossary', 'method'].includes(result.kind)) {
                  onOpenTerm(result.id);
                } else if (result.kind === 'guide') {
                  onSearch({
                    view: result.document || 'principles',
                    principle: result.id,
                    node: '',
                    query: '',
                    section: '',
                    returnTo: '',
                    scroll: '',
                  });
                  onClose();
                } else if (['scenario', 'value_stream'].includes(result.kind)) {
                  onSearch({
                    view: 'scenarios',
                    scenario: result.kind === 'scenario' ? result.id : '',
                    stream: result.kind === 'value_stream' ? result.id : '',
                    path: '',
                    node: '',
                    query: '',
                    section: '',
                  });
                  onClose();
                } else {
                  onNavigate(result.id, true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const previous = e.currentTarget.previousElementSibling;
                  previous?.tagName === 'BUTTON' ? (previous as HTMLElement).focus() : searchRef.current?.focus();
                }
              }}
            >
              {result.node ? <NodeIcon node={result.node} size={20} framed /> : <BookOpen size={22} />}
              <span>
                <strong>{result.name}</strong>
                <small>
                  {result.node
                    ? `${kindLabel(result.node)} · ${lineageOf(model, result.id)
                        .slice(0, -1)
                        .map((n) => n.name)
                        .join(' / ')}`
                    : result.kind === 'scenario'
                      ? 'Scénario métier'
                      : result.kind === 'value_stream'
                        ? 'Flux de valeur'
                        : result.kind === 'method'
                          ? 'Notion méthodologique'
                          : result.kind === 'guide'
                            ? 'Méthode'
                            : 'Terme du glossaire'}{' '}
                  · {result.node?.displayCode ?? result.id}
                </small>
                {result.excerpt && <span className="search-excerpt">{result.excerpt}</span>}
              </span>
            </button>
          ))}
          {!matches.length && <p>Aucun élément ne correspond dans cette publication.</p>}
        </div>
      ) : ['scenarios', 'glossary', 'principles', 'metamodel', 'help'].includes(route.view || '') ? (
        <nav
          className="space-navigation"
          aria-label={
            ['principles', 'metamodel'].includes(route.view || '')
              ? 'Rubriques de la documentation'
              : 'Navigation de cet espace'
          }
        >
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
      ) : (
        <div className="sidebar-spacer" />
      )}
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
