import {
  BookOpen,
  ChevronRight,
  Compass,
  Copy,
  FileText,
  GitBranch,
  LayoutGrid,
  Lightbulb,
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  X,
} from 'lucide-react';
import { type CSSProperties, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BusinessSheet } from './components/BusinessSheet';
import { GlossaryPage } from './components/GlossaryPage';
import { HelpPage } from './components/HelpPage';
import { HotspotCatalogPage } from './components/HotspotCatalogPage';
import { MapDetailPicker } from './components/MapDetailPicker';
import { MapPanel } from './components/MapPanel';
import { MarketComparisons } from './components/MarketComparisons';
import { ContextReturn, MetaTypeLabel, ModelLinksProvider, ModelText } from './components/ModelLinks';
import { Overview } from './components/Overview';
import { ScenarioCatalogPage } from './components/ScenarioCatalogPage';
import { Sidebar } from './components/Sidebar';
import { NodeIcon } from './icons';
import { defaultMapDepth, mapDepthLimit } from './mapProjection';
import { activeMethod, methodEntries } from './methodNavigation';
import { childrenOf, lineageOf, parentRelationOf, relatedTo, scopeStatistics } from './model';
import { preference, type RouteState, routeHash, savePreference, type View } from './navigation';
import { staticUrl } from './publication';
import { revealSection } from './readerNavigation';
import type { MarketComparison, MarketGap, MarketInspiration } from './types';
import { useAtlasLocation } from './useAtlasLocation';
import { useBuildUpdate } from './useBuildUpdate';
import type { GuideState } from './useModelingGuide';
import { useModelingGuide } from './useModelingGuide';
import { usePublication } from './usePublication';
import { downloadWorkingModel, useWorkshop } from './workshop';

const DependenciesPane = lazy(() =>
  import('./DependenciesPane').then((module) => ({ default: module.DependenciesPane })),
);
const ModelingGuidePage = lazy(() =>
  import('./components/ModelingGuidePage').then((module) => ({ default: module.ModelingGuidePage })),
);
const clampWidth = (width: number) => Math.min(420, Math.max(240, Number.isFinite(width) ? width : 300));
function useMobile() {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 1000px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 1000px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}
export function App() {
  const softwareUpdate = useBuildUpdate();
  const { route, locationKey, navigationType, changeRoute: changeLocation } = useAtlasLocation();
  const { model, catalog, loading, error, notice, reload } = usePublication(route.version || undefined);
  const workshop = useWorkshop(
    model,
    catalog?.releases.find((entry) => entry.version === model?.version)?.model_sha256,
  );
  const displayModel = workshop.displayModel || model;
  const { state: guideState, retry: retryGuide } = useModelingGuide(
    model?.version,
    catalog?.releases.find((entry) => entry.version === model?.version)?.guide_sha256,
  );
  const activeGuide = guideState.status === 'ready' ? guideState.response.guide : undefined;
  const metaGuide = model?.raw.metamodel?.documentation;
  const metaState: GuideState =
    model && metaGuide
      ? {
          status: 'ready',
          version: model.version,
          response: {
            schema_version: '1.0.0',
            publication_version: model.version,
            status: 'available',
            message: '',
            guide: metaGuide,
          },
        }
      : {
          status: 'ready',
          version: model?.version || '',
          response: {
            schema_version: '1.0.0',
            publication_version: model?.version || '',
            status: 'unavailable',
            message: 'Aucun document de métamodèle associé à cette publication.',
          },
        };
  const methodTitle = activeGuide?.title || 'Méthodologie';
  const methodCrumb = methodEntries(activeGuide).find(
    (item) => item.id === activeMethod(activeGuide, route.principle),
  )?.title;
  const metaGlossary =
    metaGuide?.glossary || (guideState.status === 'ready' ? guideState.response.guide?.glossary : undefined);
  const transformationGlossary = activeGuide?.glossary;
  const isMetaTerm = (id: string) =>
    metaGlossary?.model_term_ids.includes(id) || metaGlossary?.terms.some((term) => term.id === id);
  const isTransformationTerm = (id: string) => transformationGlossary?.terms.some((term) => term.id === id);
  const glossaryMode = route.term
    ? isMetaTerm(route.term)
      ? 'meta'
      : isTransformationTerm(route.term)
        ? 'transformation'
        : 'model'
    : route.glossary || 'model';
  const glossaryTitle =
    glossaryMode === 'meta'
      ? 'Glossaire du métamodèle'
      : glossaryMode === 'transformation'
        ? 'Glossaire de transformation'
        : 'Glossaire métier';
  const mobile = useMobile();
  const [drawer, setDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => preference('sidebar-open', true));
  const [width, setWidth] = useState(() => clampWidth(Number(preference('tree-width', 300))));
  const [announcement, setAnnouncement] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const restoreScroll = useRef<number | null>(null);
  const lastLocationKey = useRef(locationKey);
  const [fullPath, setFullPath] = useState(false);
  const universeNode = model?.nodes.find((node) => node.kind === 'universe');
  const rootName = universeNode?.name || 'Univers';
  const selected = model?.nodeById.get(route.node) || (!route.node ? universeNode : undefined);
  const view: View =
    route.view ||
    (selected &&
    model &&
    !childrenOf(model, selected.id).length &&
    !['domain', 'business_system'].includes(selected.kind)
      ? 'sheet'
      : 'map');
  const validScope = route.scope && model?.nodeById.has(route.scope) ? route.scope : '';
  const requestedScope =
    route.scope === '@root' || selected?.kind === 'universe'
      ? undefined
      : validScope || (selected ? selected.id : undefined);
  const scopeId =
    model && requestedScope
      ? [...lineageOf(model, requestedScope)]
          .reverse()
          .find((node) => node.kind === 'domain' || node.kind === 'business_system')?.id ||
        validScope ||
        (selected &&
          (childrenOf(model, selected.id).length ||
          ['group', 'area', 'business_area', 'reference'].includes(selected.kind)
            ? selected.id
            : parentRelationOf(model, selected.id)?.sourceId))
      : undefined;
  const scope = scopeId ? model?.nodeById.get(scopeId) : undefined;
  const mapMaxDepth = model ? mapDepthLimit(model, scopeId) : 0;
  const mapDepth = Math.min(route.mapDepth ?? defaultMapDepth(scope?.kind), mapMaxDepth);
  const universeDepth = Math.min(route.mapDepth ?? defaultMapDepth('universe'), 2);
  const detailLabels =
    scope?.kind === 'domain'
      ? ['Domaine', 'Sous-domaines', 'Business Areas', 'Capacités', 'Comportements']
      : ['Domaines', 'Sous-domaines', 'Business Areas', 'Capacités', 'Comportements'];
  const parentScope =
    scope && model ? model.nodeById.get(parentRelationOf(model, scope.id)?.sourceId || '') : undefined;
  // Keep the map context stable on selection, including between double-clicks.
  const referenceView =
    view === 'scenarios' ||
    view === 'hotspots' ||
    view === 'glossary' ||
    view === 'principles' ||
    view === 'metamodel' ||
    view === 'help';
  const headingNode = referenceView ? undefined : view === 'map' ? scope : selected;
  const contentScope = view === 'map' ? scopeId : route.node;
  useLayoutEffect(() => {
    if (lastLocationKey.current === locationKey) return;
    lastLocationKey.current = locationKey;
    restoreScroll.current = navigationType === 'POP' ? (history.state?.atlasScroll ?? null) : null;
    setDrawer(false);
  }, [locationKey, navigationType]);
  // The selected content changes the scroll context even when the effect only reads the target ref.
  // biome-ignore lint/correctness/useExhaustiveDependencies: These route fields intentionally reset reading position.
  useLayoutEffect(() => {
    // A new view starts at the top; selecting a card in the same map does not jump.
    content.current?.scrollTo({
      top: restoreScroll.current ?? Number(route.scroll || 0),
      left: 0,
      behavior: 'instant',
    });
    restoreScroll.current = null;
    if (!route.section) heading.current?.focus({ preventScroll: true });
  }, [
    model?.version,
    view,
    contentScope,
    glossaryMode,
    route.principle,
    route.scenario,
    route.stream,
    route.path,
    route.helpTopic,
    route.scroll,
  ]);
  const changeRoute = useCallback(
    (changes: Partial<RouteState>, replace = false) => {
      changeLocation(changes, model, content.current?.scrollTop ?? 0, replace);
    },
    [changeLocation, model],
  );
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const followReference = useCallback(
    (kind: 'glossary' | 'model', id: string, section = '') => {
      changeRoute({
        view: kind === 'glossary' ? 'glossary' : section === 'market_comparisons' ? 'market' : 'sheet',
        glossary:
          metaGlossary?.model_term_ids.includes(id) || metaGlossary?.terms.some((term) => term.id === id)
            ? 'meta'
            : transformationGlossary?.terms.some((term) => term.id === id)
              ? 'transformation'
              : 'model',
        node: kind === 'model' ? id : '',
        term: kind === 'glossary' ? id : '',
        section,
        principle: '',
        scope: '',
        relation: '',
        source: '',
        anchor: '',
        sourceId: '',
        query: '',
        status: '',
      });
      setDrawer(false);
      if (!section && kind === 'model') setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
    },
    [changeRoute, metaGlossary, transformationGlossary],
  );
  const openGlossary = useCallback(
    (glossary: 'model' | 'meta' | 'transformation' = 'model') => {
      changeRoute({
        returnTo: '',
        catalogReturn: '',
        scroll: '',
        view: 'glossary',
        glossary,
        node: '',
        term: '',
        principle: '',
        section: '',
        scope: '',
        relation: '',
        source: '',
        anchor: '',
        sourceId: '',
      });
      setDrawer(false);
      setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
    },
    [changeRoute],
  );
  const openPrinciples = useCallback(() => {
    changeRoute({
      returnTo: '',
      catalogReturn: '',
      scroll: '',
      view: 'principles',
      principle: '',
      node: '',
      term: '',
      section: '',
      scope: '',
      relation: '',
      source: '',
      anchor: '',
      sourceId: '',
      query: '',
      status: '',
    });
    setDrawer(false);
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute]);
  const openMetamodel = useCallback(() => {
    changeRoute({
      returnTo: '',
      catalogReturn: '',
      scroll: '',
      view: 'metamodel',
      principle: '',
      node: '',
      term: '',
      section: '',
      scope: '',
      relation: '',
      source: '',
      anchor: '',
      sourceId: '',
      query: '',
      status: '',
    });
    setDrawer(false);
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute]);
  useEffect(() => {
    if (!route.section || !model || view === 'principles' || view === 'metamodel') return;
    const timer = requestAnimationFrame(() => {
      const section = view === 'glossary' && route.section === 'short-description' ? 'definition' : route.section;
      const target = document.getElementById(
        view === 'glossary' ? `term-${route.term}-${section}` : `field-${route.node}-${section}`,
      );
      if (target) revealSection(target);
    });
    return () => cancelAnimationFrame(timer);
  }, [route.section, route.term, route.node, model, view]);
  useEffect(() => savePreference('tree-width', width), [width]);
  useEffect(() => savePreference('sidebar-open', sidebarOpen), [sidebarOpen]);
  useEffect(() => {
    if (model && route.node && !model.nodeById.has(route.node)) {
      setAnnouncement(`L’élément ${route.node} n’existe pas dans cette publication. Retour à la cartographie.`);
      changeRoute({ node: '', scope: '', view: 'map', relation: '' }, true);
    } else if (model && route.scope && route.scope !== '@root' && !model.nodeById.has(route.scope)) {
      setAnnouncement(
        'Le périmètre de cette carte n’existe pas dans la publication. Le contexte de l’élément est rétabli.',
      );
      changeRoute({ scope: '' }, true);
    }
  }, [model, route.node, route.scope, changeRoute]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (mobile) setDrawer(true);
        else setSidebarOpen(true);
        setTimeout(() => search.current?.focus(), 30);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [mobile]);
  const navigate = useCallback(
    (id: string, focusHeading = true) => {
      const item = model?.nodeById.get(id);
      const domain = item && model ? lineageOf(model, id).find((node) => node.kind === 'domain') : undefined;
      const businessArea =
        item && model ? [...lineageOf(model, id)].reverse().find((node) => node.kind === 'business_area') : undefined;
      const depth = item?.kind === 'area' ? 2 : item?.kind === 'business_area' ? 3 : defaultMapDepth(item?.kind);
      changeRoute({
        returnTo: '',
        catalogReturn: '',
        scroll: '',
        node: id,
        scope: domain?.id || (item?.kind === 'business_system' ? id : ''),
        view: undefined,
        mapDepth: depth as 0 | 1 | 2 | 3,
        mapFocus: depth === 3 ? businessArea?.id || '' : '',
        term: '',
        principle: '',
        section: '',
        query: '',
        status: '',
        relation: '',
        source: '',
        anchor: '',
        sourceId: '',
      });
      setDrawer(false);
      if (focusHeading) setTimeout(() => heading.current?.focus({ preventScroll: true }), 50);
    },
    [changeRoute, model],
  );
  const read = useCallback(
    (id: string) => {
      changeRoute({ node: id, view: 'sheet', relation: '', section: '' });
      setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
    },
    [changeRoute],
  );
  const select = useCallback(
    (id: string) => {
      const item = model?.nodeById.get(id);
      if (item?.kind === 'domain') {
        changeRoute({
          node: id,
          scope: id,
          view: 'map',
          mapDepth: defaultMapDepth('domain'),
          mapFocus: '',
          relation: '',
        });
        return;
      }
      if (item?.kind === 'area') {
        const domain = model && lineageOf(model, id).find((node) => node.kind === 'domain');
        if (domain) {
          changeRoute({
            node: id,
            scope: domain.id,
            view: 'map',
            mapDepth: Math.max(1, mapDepth) as 1 | 2 | 3 | 4,
            mapFocus: id,
            relation: '',
          });
          return;
        }
      }
      changeRoute({ node: id, scope: scopeId || '@root', view: 'map', mapFocus: id, relation: '' });
    },
    [changeRoute, model, scopeId, mapDepth],
  );
  const openOverviewNode = useCallback(
    (id: string) => {
      if (model?.nodeById.get(id)?.kind === 'business_system')
        changeRoute({
          node: id,
          scope: id,
          view: 'map',
          mapDepth: defaultMapDepth('business_system'),
          mapFocus: '',
          relation: '',
          section: '',
        });
      else select(id);
    },
    [changeRoute, model, select],
  );
  const openMapLevel = useCallback(
    (id: string) =>
      changeRoute({
        node: id,
        scope: id || '@root',
        view: 'map',
        mapDepth: defaultMapDepth(model?.nodeById.get(id)?.kind),
        mapFocus: '',
        relation: '',
        section: '',
      }),
    [changeRoute, model],
  );
  const showSelectedOnMap = useCallback(() => {
    if (selected?.kind === 'universe') {
      changeRoute({
        view: 'map',
        node: '',
        scope: '@root',
        mapDepth: defaultMapDepth('universe'),
        mapFocus: '',
        relation: '',
        section: '',
      });
      return;
    }
    if (!model || !selected) {
      changeRoute({
        view: 'map',
        node: '',
        scope: '@root',
        mapDepth: defaultMapDepth('universe'),
        mapFocus: '',
        relation: '',
        section: '',
      });
      return;
    }
    const path = lineageOf(model, selected.id);
    const domain = path.find((node) => node.kind === 'domain');
    const system = path.find((node) => node.kind === 'business_system');
    const businessArea = [...path].reverse().find((node) => node.kind === 'business_area');
    const depth =
      selected.kind === 'behavior'
        ? 4
        : ['capability', 'reference', 'business_area'].includes(selected.kind) && businessArea
          ? 3
          : defaultMapDepth(domain ? 'domain' : system ? 'business_system' : 'universe');
    changeRoute({
      view: 'map',
      scope: domain?.id || system?.id || selected.id,
      mapDepth: depth as 0 | 1 | 3 | 4,
      mapFocus: depth >= 3 ? selected.id : '',
      relation: '',
      section: '',
    });
  }, [changeRoute, model, selected]);
  const links = selected && model ? relatedTo(model, selected.id) : [];
  const copyLink = async () => {
    try {
      const pinned = { ...route, version: model?.version || route.version };
      const hash = routeHash(pinned, model);
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${hash}`);
      setAnnouncement('Lien copié vers cette publication.');
    } catch {
      setAnnouncement('La copie est indisponible. Tu peux copier l’adresse dans le navigateur.');
    }
  };
  const atMapHome = view === 'map' && !headingNode;
  const statistics = model && headingNode ? scopeStatistics(model, headingNode) : [];
  const breadcrumbs = (
    <nav className="breadcrumb" aria-label="Fil d’Ariane">
      {atMapHome || (view === 'sheet' && selected?.kind === 'universe') ? (
        <span aria-current="page">{rootName}</span>
      ) : (
        <button type="button" onClick={() => navigate('')}>
          {rootName}
        </button>
      )}
      {headingNode &&
        model &&
        lineageOf(model, headingNode.id)
          .filter((node) => node.kind !== 'universe')
          .map((node) => (
            <span key={node.id}>
              <ChevronRight size={12} />
              <button
                type="button"
                title={node.name}
                onClick={() => (view === 'map' ? openMapLevel(node.id) : navigate(node.id))}
                aria-current={headingNode.id === node.id ? 'page' : undefined}
              >
                {node.name}
              </button>
            </span>
          ))}
      {referenceView && (
        <span>
          <ChevronRight size={12} />
          <span aria-current="page">
            {view === 'help'
              ? 'Aide'
              : view === 'hotspots'
                ? 'Points chauds'
                : view === 'scenarios'
                  ? 'Scénarios métier'
                  : view === 'metamodel'
                    ? 'Métamodèle FLOW'
                    : view === 'principles'
                      ? `${methodTitle}${methodCrumb ? ` / ${methodCrumb}` : ''}`
                      : glossaryTitle}
          </span>
        </span>
      )}
    </nav>
  );
  const shareButton = (
    <button
      type="button"
      className="share-button"
      aria-label="Copier le lien"
      title="Copier le lien"
      onClick={copyLink}
    >
      <Copy size={16} />
      <span>Copier le lien</span>
    </button>
  );
  return (
    <ModelLinksProvider
      value={{ model: model || null, metaGlossary, metaGuide, guide: activeGuide, route, onFollow: followReference }}
    >
      <div
        className={`atlas-shell ${!sidebarOpen && !mobile ? 'sidebar-collapsed' : ''}`}
        style={{ '--sidebar': `${sidebarOpen ? width : 0}px` } as CSSProperties}
      >
        <header className="topbar" inert={mobile && drawer}>
          <div className="app-brand-area">
            {model && (
              <button
                type="button"
                id="fa-tree-open"
                className="mobile-menu"
                aria-label={mobile || !sidebarOpen ? 'Ouvrir le panneau' : 'Replier le panneau'}
                title={mobile || !sidebarOpen ? 'Ouvrir le panneau' : 'Replier le panneau'}
                aria-expanded={mobile ? drawer : sidebarOpen}
                aria-controls="atlas-tree-panel"
                onClick={() => (mobile ? setDrawer(true) : setSidebarOpen((open) => !open))}
              >
                {mobile || !sidebarOpen ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
              </button>
            )}
            <button type="button" className="brand" onClick={() => navigate('')} aria-label="FLOW Atlas, accueil">
              <span className="brand-symbol" aria-hidden="true">
                <img
                  className="flow-source-mark"
                  src={staticUrl('assets/flow-original.png')}
                  width="1024"
                  height="1024"
                  alt=""
                />
              </span>
              <strong>
                FLOW <b>Atlas</b>
              </strong>
            </button>
          </div>
          {model && !mobile && (
            <div className="topbar-navigation">
              {breadcrumbs}
              {shareButton}
            </div>
          )}
          <button
            type="button"
            id="fa-refresh"
            className={`topbar-icon ${loading ? 'loading' : ''}`}
            aria-label="Actualiser la publication"
            title="Actualiser"
            disabled={loading}
            onClick={reload}
          >
            <RefreshCw size={17} />
          </button>
        </header>
        {model && (
          <Sidebar
            model={displayModel || model}
            route={{ ...route, glossary: glossaryMode }}
            open={drawer}
            mobile={mobile}
            guide={guideState.status === 'ready' ? guideState.response.guide : undefined}
            searchRef={search}
            onClose={closeDrawer}
            onNavigate={navigate}
            onOpenGlossary={openGlossary}
            onOpenTerm={(id) => followReference('glossary', id)}
            onOpenPrinciples={openPrinciples}
            onOpenMetamodel={openMetamodel}
            onSearch={(changes) => changeRoute(changes, true)}
          />
        )}
        {model && sidebarOpen && (
          <div
            className="rail-resizer"
            role="separator"
            tabIndex={0}
            aria-label="Largeur du panneau"
            aria-orientation="vertical"
            aria-valuemin={240}
            aria-valuemax={420}
            aria-valuenow={width}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                setWidth((value) =>
                  e.key === 'Home'
                    ? 240
                    : e.key === 'End'
                      ? 420
                      : clampWidth(value + (e.key === 'ArrowRight' ? 10 : -10)),
                );
              }
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) setWidth(clampWidth(e.clientX));
            }}
            onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
          />
        )}
        {drawer && mobile && (
          <button
            type="button"
            className="drawer-scrim"
            tabIndex={-1}
            aria-label="Fermer le panneau"
            onClick={closeDrawer}
          />
        )}
        <main
          id="fa-main"
          className={`workspace ${!model ? 'without-model' : ''} ${view === 'map' ? 'map-workspace' : ''}`}
          inert={mobile && drawer}
          aria-busy={loading}
        >
          {(error || notice || announcement) && (
            <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>
              {error || notice || announcement}
              <button
                type="button"
                aria-label="Masquer le message"
                onClick={() => setAnnouncement('')}
                hidden={!announcement}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {!model ? (
            <div className="empty-state">
              <Compass size={34} />
              <h1>{loading ? 'Ouverture du modèle…' : 'Publication indisponible'}</h1>
              <p>{loading ? 'Chargement de la cartographie publiée.' : 'Réessaie de charger la publication.'}</p>
              {!loading && (
                <button type="button" className="secondary-button" onClick={reload}>
                  Réessayer
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="workspace-header">
                {softwareUpdate && (
                  <aside className="publication-selection" role="status">
                    <span>Une nouvelle version de l’interface Atlas est disponible.</span>
                    <button type="button" onClick={() => window.location.reload()}>
                      Recharger l’application
                    </button>
                  </aside>
                )}
                {route.version && (
                  <aside className="publication-selection" aria-label="Publication consultée">
                    <span>
                      <strong>Publication figée · {route.version}</strong> —{' '}
                      {catalog?.current !== route.version
                        ? 'Une version plus récente est disponible.'
                        : 'Ce lien restera sur cette édition.'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        changeRoute({
                          version: '',
                          returnTo: '',
                          catalogReturn: '',
                          scroll: '',
                          ...(['principles', 'metamodel'].includes(view) ? { principle: '' } : {}),
                        })
                      }
                    >
                      Suivre la version courante
                    </button>
                  </aside>
                )}
                {mobile && (
                  <div className="breadcrumb-row">
                    <div className={`mobile-path ${fullPath ? 'expanded' : ''}`}>
                      <button
                        type="button"
                        className="path-toggle"
                        aria-expanded={fullPath}
                        onClick={() => setFullPath(!fullPath)}
                      >
                        Chemin {fullPath ? '−' : '…'}
                      </button>
                      {breadcrumbs}
                    </div>
                    {shareButton}
                  </div>
                )}
                {view === 'map' ? (
                  <h1 id="page-title" className="sr-only" ref={heading} tabIndex={-1}>
                    {scope?.name || rootName}
                  </h1>
                ) : (
                  <header className="page-heading">
                    <div className="heading-icon">
                      {headingNode ? (
                        <NodeIcon node={headingNode} size={30} framed />
                      ) : (
                        <span className="node-icon framed tone-context">
                          {view === 'principles' || view === 'metamodel' || view === 'help' ? (
                            <Lightbulb size={30} />
                          ) : (
                            <Compass size={30} />
                          )}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="eyebrow">
                        {headingNode ? (
                          <MetaTypeLabel node={headingNode} />
                        ) : (
                          <span>
                            {view === 'help'
                              ? 'AIDE À LA LECTURE'
                              : view === 'metamodel'
                                ? 'LE MÉTAMODÈLE'
                                : view === 'principles'
                                  ? 'LA DÉMARCHE DE TRANSFORMATION'
                                  : view === 'glossary'
                                    ? 'LE VOCABULAIRE PUBLIÉ'
                                    : 'LE MODÈLE PUBLIÉ'}
                          </span>
                        )}
                        {headingNode && (
                          <span title={`Identité persistante : ${headingNode.id}`}>
                            {headingNode.displayCode ?? headingNode.id}
                          </span>
                        )}
                      </div>
                      <h1 id="page-title" ref={heading} tabIndex={-1}>
                        {view === 'help'
                          ? route.helpTopic === 'workshop'
                            ? 'Mode atelier'
                            : 'Par où commencer ?'
                          : view === 'hotspots'
                            ? 'Points chauds'
                            : view === 'scenarios'
                              ? 'Scénarios métier'
                              : view === 'metamodel'
                                ? 'Métamodèle FLOW'
                                : view === 'principles'
                                  ? methodTitle
                                  : view === 'glossary'
                                    ? glossaryTitle
                                    : headingNode?.name || 'Cartographie'}
                      </h1>
                      {view !== 'sheet' && (
                        <p>
                          <ModelText
                            text={
                              view === 'help'
                                ? route.helpTopic === 'workshop'
                                  ? 'Préparer une séance de travail collective autour de la cartographie.'
                                  : 'Un parcours rapide pour explorer le modèle publié.'
                                : view === 'hotspots'
                                  ? 'Explorer les sujets localisés sur la cartographie et leurs options de résolution.'
                                  : view === 'scenarios'
                                    ? 'Explorer les situations métier, leurs flux de valeur et les capacités mobilisées.'
                                    : view === 'metamodel'
                                      ? metaGuide?.subtitle || 'Comprendre les objets et règles du modèle.'
                                      : view === 'principles'
                                        ? activeGuide?.subtitle || 'Comprendre la démarche et ses repères.'
                                        : view === 'glossary'
                                          ? 'Les notions et leurs définitions dans la publication consultée.'
                                          : headingNode?.purpose ||
                                            (headingNode
                                              ? 'Explore cet élément et ses relations dans le modèle publié.'
                                              : 'Parcours le modèle, explore les capacités et découvre les liens qui les relient.')
                            }
                          />
                        </p>
                      )}
                      {statistics.length > 0 && (
                        <ul
                          className="scope-statistics"
                          aria-label="Contenu du périmètre"
                          title="Totaux des objets contenus dans ce périmètre, tous niveaux confondus, dans la publication consultée."
                        >
                          {statistics.map((stat) => (
                            <li key={stat.kind}>
                              <strong>{stat.count}</strong> {stat.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </header>
                )}
                {!referenceView && (
                  <div className="view-bar">
                    <div className="view-tabs" role="tablist" aria-label="Vue du modèle">
                      {(
                        [
                          { id: 'map', label: 'Carte', Icon: LayoutGrid },
                          { id: 'sheet', label: 'Fiche', Icon: FileText },
                          { id: 'relations', label: 'Relations', Icon: GitBranch },
                          { id: 'market', label: 'Sources d’inspiration', Icon: BookOpen },
                        ] as const
                      )
                        .filter((tab) => selected || !['sheet', 'market'].includes(tab.id))
                        .map((tab) => (
                          <button
                            type="button"
                            key={tab.id}
                            role="tab"
                            id={`tab-${tab.id}`}
                            aria-controls="atlas-view"
                            tabIndex={view === tab.id ? 0 : -1}
                            aria-selected={view === tab.id}
                            onClick={() =>
                              tab.id === 'map' && view !== 'map'
                                ? showSelectedOnMap()
                                : changeRoute({ view: tab.id, relation: '', section: '' })
                            }
                            onKeyDown={(e) => {
                              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                              e.preventDefault();
                              const items = [
                                ...(e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button') || []),
                              ];
                              if (!items.length) return;
                              const next =
                                items[
                                  (items.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : items.length - 1)) %
                                    items.length
                                ];
                              next.click();
                              next.focus();
                            }}
                          >
                            <tab.Icon size={16} />
                            {tab.label}
                            {tab.id === 'relations' &&
                              selected &&
                              !['business_system', 'group', 'domain', 'area', 'business_area', 'reference'].includes(
                                selected.kind,
                              ) && <span className="count">{links.length}</span>}
                          </button>
                        ))}
                    </div>
                    {view === 'map' && (
                      <div className="map-header-controls">
                        <MapDetailPicker
                          labels={
                            scope ? detailLabels.slice(0, mapMaxDepth + 1) : ['Systèmes', 'Domaines', 'Sous-domaines']
                          }
                          value={scope ? mapDepth : universeDepth}
                          onChange={(depth) =>
                            changeRoute({ view: 'map', mapDepth: depth as 0 | 1 | 2 | 3 | 4, mapFocus: '' }, true)
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div
                className="workspace-content"
                ref={content}
                tabIndex={0}
                role="region"
                aria-label="Contenu de la vue"
                onScroll={(event) =>
                  history.replaceState(
                    { ...history.state, atlasScroll: event.currentTarget.scrollTop },
                    '',
                    location.href,
                  )
                }
              >
                <ContextReturn />
                {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: Both runtime roles, region and tabpanel, support aria-labelledby. */}
                <div
                  id="atlas-view"
                  role={referenceView ? 'region' : 'tabpanel'}
                  aria-labelledby={
                    referenceView
                      ? 'page-title'
                      : `tab-${['sheet', 'market'].includes(view) && !selected ? 'map' : view}`
                  }
                >
                  {view === 'help' ? (
                    <HelpPage
                      topic={route.helpTopic === 'workshop' ? 'workshop' : 'start'}
                      stage={workshop.stage}
                      stageMatchesPublication={Boolean(workshop.active)}
                      stageError={workshop.error}
                      onDownloadWorkingModel={() => displayModel && downloadWorkingModel(displayModel)}
                      onNavigate={(target, topic) =>
                        changeRoute({
                          view: target,
                          helpTopic: topic,
                          node: '',
                          scope: '',
                          query: '',
                          section: '',
                          principle: '',
                          hotspot: '',
                        })
                      }
                    />
                  ) : view === 'hotspots' ? (
                    <HotspotCatalogPage model={displayModel || model} route={route} onChange={changeRoute} />
                  ) : view === 'scenarios' ? (
                    <ScenarioCatalogPage model={model} route={route} onChange={changeRoute} />
                  ) : view === 'metamodel' ? (
                    <Suspense fallback={<p role="status">Ouverture du métamodèle…</p>}>
                      <ModelingGuidePage
                        key={`${model.version}:metamodel`}
                        model={model}
                        selected={route.principle}
                        routeVersion={route.version}
                        state={metaState}
                        retry={retryGuide}
                        onSelect={(principle) => changeRoute({ principle })}
                      />
                    </Suspense>
                  ) : view === 'principles' ? (
                    <Suspense fallback={<p role="status">Ouverture de la méthodologie…</p>}>
                      <ModelingGuidePage
                        key={model.version}
                        model={model}
                        selected={route.principle}
                        routeVersion={route.version}
                        state={guideState}
                        retry={retryGuide}
                        onSelect={(principle) => changeRoute({ principle })}
                      />
                    </Suspense>
                  ) : view === 'glossary' ? (
                    <GlossaryPage
                      model={model}
                      routeVersion={route.version}
                      selected={route.term}
                      mode={glossaryMode}
                      guideState={guideState}
                      metaGlossary={metaGlossary}
                      onRetry={retryGuide}
                      onSelect={(term) => changeRoute({ view: 'glossary', glossary: glossaryMode, term, section: '' })}
                    />
                  ) : view === 'sheet' && selected ? (
                    <BusinessSheet
                      model={model}
                      node={selected}
                      onShowMarket={() => changeRoute({ view: 'market', relation: '', section: '' })}
                    />
                  ) : view === 'market' && selected ? (
                    <article className="market-page" key={selected.id}>
                      <MarketComparisons
                        id={`field-${selected.id}-market_comparisons`}
                        entries={selected.fields.market_comparisons as readonly MarketComparison[] | undefined}
                        inspiration={selected.fields.market_inspiration as MarketInspiration | undefined}
                        modelName={selected.name}
                        gaps={selected.fields.market_gaps as readonly MarketGap[] | undefined}
                      />
                    </article>
                  ) : view === 'relations' ? (
                    <Suspense fallback={<div className="graph-canvas empty-state">Ouverture des relations…</div>}>
                      <DependenciesPane
                        key={`${model.version}:${route.node}`}
                        model={model}
                        focusId={selected?.id}
                        relationId={route.relation}
                        settings={route}
                        onSettings={(changes) => changeRoute(changes)}
                        onSelectRelation={(relation) => changeRoute({ relation }, true)}
                        onFocus={(node) =>
                          changeRoute({ node, scope: '', relation: '', view: 'relations', graphDepth: node ? 1 : 0 })
                        }
                        onRead={read}
                      />
                    </Suspense>
                  ) : !scopeId && model.nodes.some((node) => node.kind === 'business_system') ? (
                    <Overview
                      model={displayModel || model}
                      detail={universeDepth}
                      onOpen={openOverviewNode}
                      onOpenHotspot={(hotspot) => changeRoute({ view: 'hotspots', hotspot, node: '', scope: '' })}
                    />
                  ) : (
                    <MapPanel
                      model={displayModel || model}
                      scope={scope}
                      scopeId={scopeId}
                      selectedId={selected?.id || ''}
                      rootName={rootName}
                      parentName={parentScope?.name}
                      mapDepth={mapDepth}
                      mapMaxDepth={mapMaxDepth}
                      detailLabels={detailLabels}
                      focusId={route.mapFocus}
                      onDepthChange={(depth) =>
                        changeRoute({ view: 'map', mapDepth: depth as 0 | 1 | 2 | 3 | 4, mapFocus: '' }, true)
                      }
                      onBack={() => navigate(parentScope?.id || '')}
                      onSelect={select}
                      onAnnouncement={setAnnouncement}
                      onOpenHotspot={(hotspot) => changeRoute({ view: 'hotspots', hotspot, node: '', scope: '' })}
                    />
                  )}
                </div>
                <footer className="workspace-footer">
                  Cartographie ·{' '}
                  {route.version ? 'Publication fixe' : 'Publication courante, actualisée automatiquement'}
                </footer>
              </div>
            </>
          )}
        </main>
      </div>
    </ModelLinksProvider>
  );
}
