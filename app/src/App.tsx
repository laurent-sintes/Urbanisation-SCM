import {
  ArrowLeft,
  ArrowRightLeft,
  BookOpen,
  ChevronRight,
  Compass,
  Copy,
  FileText,
  Flame,
  GitBranch,
  LayoutGrid,
  Lightbulb,
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  X,
} from 'lucide-react';
import { type CSSProperties, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApplicationCatalogPage } from './components/ApplicationCatalogPage';
import { BusinessSheet } from './components/BusinessSheet';
import { DocumentCatalogPage } from './components/DocumentCatalogPage';
import { GlossaryPage } from './components/GlossaryPage';
import { HelpPage } from './components/HelpPage';
import { HotspotCatalogPage } from './components/HotspotCatalogPage';
import { MapPanel } from './components/MapPanel';
import { MarketComparisons } from './components/MarketComparisons';
import {
  ContextReturn,
  MetaTypeLabel,
  ModelLinksProvider,
  ModelText,
  readingOrigin,
  readingViewport,
} from './components/ModelLinks';
import { Overview } from './components/Overview';
import { ScenarioCatalogPage } from './components/ScenarioCatalogPage';
import { Sidebar } from './components/Sidebar';
import {
  encodeHotspotFilters,
  type HotspotMapFilters,
  readHotspotFilters,
  updateHotspotMapFilters,
} from './hotspotMap';
import { NodeIcon } from './icons';
import { mapRouteForNode } from './mapNavigation';
import { defaultMapDepth, mapDepthLimit } from './mapProjection';
import { activeMethod, methodEntries } from './methodNavigation';
import { childrenOf, lineageOf, parentRelationOf, relatedTo, scopeStatistics } from './model';
import { preference, type RouteState, readRoute, routeHash, savePreference, type View } from './navigation';
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
const FlowMapPanel = lazy(() =>
  import('./components/FlowMapPanel').then((module) => ({ default: module.FlowMapPanel })),
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
  const [hotspotFilters, setHotspotFilters] = useState(() => readHotspotFilters(route.hotspotFilters));
  const hotspotFiltersRef = useRef(hotspotFilters);
  hotspotFiltersRef.current = hotspotFilters;
  useEffect(() => {
    // A prior navigation can commit after a newer checkbox change; keep the
    // optimistic filters until React catches up with the actual URL.
    if (route.hotspotFilters !== readRoute(window.location.hash).hotspotFilters) return;
    const next = readHotspotFilters(route.hotspotFilters);
    hotspotFiltersRef.current = next;
    setHotspotFilters(next);
  }, [route.hotspotFilters]);
  const onHotspotFiltersChange = useCallback(
    (changes: Partial<HotspotMapFilters>) => {
      const next = updateHotspotMapFilters(hotspotFiltersRef.current, changes);
      hotspotFiltersRef.current = next;
      setHotspotFilters(next);
      changeLocation(
        {
          hotspotFilters: encodeHotspotFilters(next),
        },
        model,
        0,
        true,
      );
    },
    [changeLocation, model],
  );
  const workshopRevision = displayModel?.raw.workshop?.revision;
  useEffect(() => {
    if (workshopRevision !== undefined && !route.hotspotFilters) onHotspotFiltersChange({ enabled: true });
  }, [workshopRevision, route.hotspotFilters, onHotspotFiltersChange]);
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
  const cartographicView = view === 'map' || view === 'flows';
  const previousView = useRef(view);
  const catalogueReturn = useRef(false);
  const [catalogueRestoreLocation, setCatalogueRestoreLocation] = useState('');
  const CartographyPanel = view === 'flows' ? FlowMapPanel : MapPanel;
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
  const viewParent =
    selected && model ? model.nodeById.get(parentRelationOf(model, selected.id)?.sourceId || '') : undefined;
  // Keep the map context stable on selection, including between double-clicks.
  const referenceView =
    view === 'scenarios' ||
    view === 'applications' ||
    view === 'hotspots' ||
    view === 'documents' ||
    view === 'glossary' ||
    view === 'principles' ||
    view === 'metamodel' ||
    view === 'help';
  const headingNode = referenceView ? undefined : cartographicView ? scope : selected;
  const hotspotDetail =
    view === 'hotspots' && displayModel?.raw.hotspot_catalog?.hotspots.some((item) => item.id === route.hotspot);
  const contentScope = cartographicView ? scopeId : route.node;
  useLayoutEffect(() => {
    catalogueReturn.current = navigationType !== 'POP' && previousView.current === 'flows' && view === 'map';
    previousView.current = view;
    setCatalogueRestoreLocation(catalogueReturn.current ? locationKey : '');
  }, [locationKey, navigationType, view]);
  useLayoutEffect(() => {
    if (lastLocationKey.current === locationKey) return;
    lastLocationKey.current = locationKey;
    restoreScroll.current = navigationType === 'POP' ? (history.state?.atlasScroll ?? null) : null;
    setDrawer(false);
  }, [locationKey, navigationType]);
  // The selected content changes the scroll context even when the effect only reads the target ref.
  // biome-ignore lint/correctness/useExhaustiveDependencies: These route fields intentionally reset reading position.
  useLayoutEffect(() => {
    // An explicit Flux → Catalogue switch restores its own viewport once the Catalogue has settled.
    if (view === 'map' && catalogueReturn.current) return;
    // A new view starts at the top; selecting a card in the same map does not jump.
    const top = restoreScroll.current ?? Number(route.scroll || 0);
    const target = readingViewport(content.current);
    const restore = () =>
      target?.scrollTo({
        top,
        left: 0,
        behavior: 'instant',
      });
    restore();
    restoreScroll.current = null;
    if (!route.section && !document.activeElement?.closest('.view-tabs'))
      heading.current?.focus({ preventScroll: true });
    // Lazy maps acquire their scrollable height after mounting and card measurement.
    if (top > 0 && target && target !== content.current) {
      let timer: ReturnType<typeof setTimeout>;
      const stop = () => observer.disconnect();
      const observer = new MutationObserver(() => {
        restore();
        clearTimeout(timer);
        timer = setTimeout(stop, 300);
      });
      observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
      timer = setTimeout(stop, 1000);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
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
      changeLocation(changes, model, readingViewport(content.current)?.scrollTop ?? 0, replace);
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
      changeRoute({ node: '', scope: '', view: view === 'flows' ? 'flows' : 'map', relation: '' }, true);
    } else if (model && route.scope && route.scope !== '@root' && !model.nodeById.has(route.scope)) {
      setAnnouncement(
        'Le périmètre de cette carte n’existe pas dans la publication. Le contexte de l’élément est rétabli.',
      );
      changeRoute({ scope: '' }, true);
    }
  }, [model, route.node, route.scope, view, changeRoute]);
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
        view: view === 'flows' ? 'flows' : undefined,
        ...(view === 'flows' ? {} : { mapDepth: depth as 0 | 1 | 2 | 3 }),
        mapFocus: view === 'flows' ? '' : depth === 3 ? businessArea?.id || '' : '',
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
    [changeRoute, model, view],
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
  const selectFlow = useCallback(
    (id: string) => {
      changeRoute({ node: id, scope: scopeId || '@root', view: 'flows', mapFocus: id, relation: '', section: '' });
    },
    [changeRoute, scopeId],
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
        view: view === 'flows' ? 'flows' : 'map',
        ...(view === 'flows' ? {} : { mapDepth: defaultMapDepth(model?.nodeById.get(id)?.kind) }),
        mapFocus: '',
        relation: '',
        section: '',
      }),
    [changeRoute, model, view],
  );
  const showSelectedOnMap = useCallback(() => {
    if (model) changeRoute(mapRouteForNode(model, selected?.id || ''));
    else changeRoute({ view: 'map', node: '', scope: '@root', mapDepth: 1, mapFocus: '', relation: '', section: '' });
  }, [changeRoute, model, selected]);
  const showApplicationOnMap = useCallback(
    (appSelection: string, appComponent = '') =>
      changeRoute({
        view: 'map',
        node: '',
        scope: '@root',
        mapDepth: 2,
        mapFocus: '',
        appSelection,
        appComponent,
        section: '',
        relation: '',
      }),
    [changeRoute],
  );
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
  const atMapHome = cartographicView && !headingNode;
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
                onClick={() => (cartographicView ? openMapLevel(node.id) : navigate(node.id))}
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
                : view === 'applications'
                  ? route.appView === 'products'
                    ? 'Produits logiciels du marché'
                    : 'Systèmes d’information à faire converger'
                  : view === 'documents'
                    ? 'Documents'
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
          onFocusCapture={(event) => {
            const target = event.target as HTMLElement;
            const controls = target.closest<HTMLElement>('.map-actions');
            if (!controls || !target.matches('button') || target.classList.contains('map-fullscreen-button')) return;
            requestAnimationFrame(() => {
              if (!target.isConnected) return;
              const button = target.getBoundingClientRect();
              const strip = controls.getBoundingClientRect();
              if (button.left < strip.left) controls.scrollLeft -= strip.left - button.left + 4;
              else if (button.right > strip.right) controls.scrollLeft += button.right - strip.right + 4;
            });
          }}
          id="fa-main"
          className={`workspace ${!model ? 'without-model' : ''} ${cartographicView ? 'map-workspace' : ''} ${view === 'relations' ? 'relations-workspace' : ''}`}
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
                      <strong>
                        <span className="publication-fixed-long">Publication figée</span>
                        <span className="publication-fixed-short">Figée</span> · {route.version}
                      </strong>
                      <span className="publication-explanation">
                        {' '}
                        —{' '}
                        {catalog?.current !== route.version
                          ? 'Une version plus récente est disponible.'
                          : 'Ce lien restera sur cette édition.'}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Suivre la version courante"
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
                      <span className="publication-follow-long">Suivre la version courante</span>
                      <span className="publication-follow-short" aria-hidden="true">
                        Suivre le courant
                      </span>
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
                {cartographicView || hotspotDetail || view === 'relations' ? (
                  <h1 id="page-title" className="sr-only" ref={heading} tabIndex={-1}>
                    {hotspotDetail
                      ? 'Points chauds'
                      : view === 'relations'
                        ? `Relations : ${headingNode?.name || rootName}`
                        : scope?.name || rootName}
                  </h1>
                ) : (
                  <header className="page-heading">
                    <div className="heading-icon">
                      {headingNode ? (
                        <NodeIcon node={headingNode} size={30} framed />
                      ) : (
                        <span className="node-icon framed tone-context">
                          {view === 'hotspots' ? (
                            <Flame size={30} />
                          ) : view === 'principles' || view === 'metamodel' || view === 'help' ? (
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
                                    : view === 'applications'
                                      ? 'LES APPLICATIONS PUBLIÉES'
                                      : view === 'documents'
                                        ? 'LES DOCUMENTS PUBLIÉS'
                                        : 'LE MODÈLE PUBLIÉ'}
                          </span>
                        )}
                        {headingNode && (
                          <span title={`Identifiant : ${headingNode.id}`}>
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
                            : view === 'applications'
                              ? route.appView === 'products'
                                ? 'Produits logiciels du marché'
                                : 'Systèmes d’information à faire converger'
                              : view === 'documents'
                                ? 'Documents'
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
                                  ? 'Un point chaud est un sujet qui demande une clarification ou un arbitrage. Il peut révéler un écart, une responsabilité à préciser ou une décision de convergence à prendre.'
                                  : view === 'applications'
                                    ? route.appView === 'products'
                                      ? 'Explorer les offres logicielles connues et leurs composants documentés.'
                                      : 'Parcourir les produits retenus dans chaque SI et leur positionnement métier connu.'
                                    : view === 'documents'
                                      ? 'Consulter et télécharger les documents associés à cette publication.'
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
                          { id: 'map', label: 'Catalogue', Icon: LayoutGrid },
                          { id: 'flows', label: 'Flux', Icon: ArrowRightLeft },
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
                              tab.id === 'map' && !cartographicView
                                ? showSelectedOnMap()
                                : tab.id === 'flows'
                                  ? changeRoute({ view: 'flows', scope: scopeId || '@root', relation: '', section: '' })
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
                    {selected && selected.kind !== 'universe' && (
                      <button
                        type="button"
                        className="view-parent-button"
                        onClick={() =>
                          cartographicView ? openMapLevel(parentScope?.id || '') : navigate(viewParent?.id || '')
                        }
                      >
                        <ArrowLeft size={14} /> Remonter vers{' '}
                        {cartographicView ? parentScope?.name || rootName : viewParent?.name || rootName}
                      </button>
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
                onScrollCapture={(event) => {
                  const target = event.target as HTMLElement;
                  if (target !== readingViewport(content.current)) return;
                  history.replaceState({ ...history.state, atlasScroll: target.scrollTop }, '', location.href);
                }}
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
                          hotspotGroup: '',
                        })
                      }
                    />
                  ) : view === 'hotspots' ? (
                    <HotspotCatalogPage
                      model={displayModel || model}
                      route={route}
                      onChange={changeRoute}
                      workshopStage={catalog?.current === model.version ? workshop.active : null}
                      filters={hotspotFilters}
                      onFiltersChange={onHotspotFiltersChange}
                      workshopMessage={
                        workshop.error ||
                        (workshop.stage && !workshop.active
                          ? `Séance sur ${workshop.stage.base_version} ; publication consultée ${model.version}. Conserve ou archive la séance avec Codex, puis ouvre une séance sur le courant.`
                          : 'Lecture seule : aucune séance active sur cette publication. Sur Atlas local, ouvre une séance via Aide → Mode atelier ; le site distant reste en lecture seule.')
                      }
                      onSaveWorkshopChanges={workshop.saveHotspotChanges}
                    />
                  ) : view === 'applications' ? (
                    <ApplicationCatalogPage
                      model={model}
                      mode={route.appView || 'systems'}
                      route={route}
                      onChange={changeRoute}
                      onShowOnMap={showApplicationOnMap}
                      onShowBusinessNode={(nodeId) =>
                        changeRoute({
                          ...mapRouteForNode(model, nodeId),
                          appSelection: '',
                          appComponent: '',
                        })
                      }
                    />
                  ) : view === 'documents' ? (
                    <DocumentCatalogPage model={displayModel || model} route={route} onChange={changeRoute} />
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
                    <BusinessSheet model={model} node={selected} />
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
                        onSettings={(changes) => changeRoute({ ...changes, relation: '' })}
                        onSelectRelation={(relation) => changeRoute({ relation }, true)}
                        onFocus={(node) =>
                          changeRoute({ node, scope: '', relation: '', view: 'relations', graphDepth: node ? 1 : 0 })
                        }
                        onRead={read}
                      />
                    </Suspense>
                  ) : view !== 'flows' && !scopeId && model.nodes.some((node) => node.kind === 'business_system') ? (
                    <Overview
                      model={displayModel || model}
                      detail={universeDepth}
                      restoreViewport={catalogueRestoreLocation === locationKey}
                      hotspotFilters={hotspotFilters}
                      onHotspotFiltersChange={onHotspotFiltersChange}
                      onDepthChange={(depth) =>
                        changeRoute({ view: 'map', mapDepth: depth as 0 | 1 | 2, mapFocus: '' }, true)
                      }
                      onAnnouncement={setAnnouncement}
                      onOpen={openOverviewNode}
                      applicationSelectionId={route.appSelection}
                      applicationComponentId={route.appComponent}
                      onApplicationChange={(appSelection, appComponent) =>
                        changeRoute({ view: 'map', appSelection, appComponent }, true)
                      }
                      onOpenHotspot={(hotspot, groupIds) =>
                        changeRoute({
                          view: 'hotspots',
                          returnTo: readingOrigin({ ...route, returnTo: undefined }, model.version),
                          hotspot,
                          hotspotGroup: groupIds?.join(',') || '',
                          node: '',
                          scope: '',
                        })
                      }
                    />
                  ) : (
                    <Suspense fallback={<div className="graph-canvas empty-state">Ouverture de la cartographie…</div>}>
                      <CartographyPanel
                        key={view === 'flows' ? `${model.version}:${scopeId || '@root'}` : 'catalogue'}
                        model={displayModel || model}
                        scope={scope}
                        scopeId={scopeId}
                        selectedId={selected?.id || ''}
                        rootName={rootName}
                        hotspotFilters={hotspotFilters}
                        onHotspotFiltersChange={onHotspotFiltersChange}
                        mapDepth={mapDepth}
                        mapMaxDepth={mapMaxDepth}
                        detailLabels={detailLabels}
                        focusId={route.mapFocus}
                        restoreViewport={view === 'map' && catalogueRestoreLocation === locationKey}
                        onDepthChange={(depth) =>
                          changeRoute({ view, mapDepth: depth as 0 | 1 | 2 | 3 | 4, mapFocus: '' }, true)
                        }
                        onSelect={view === 'flows' ? selectFlow : select}
                        onRead={read}
                        onOpenScope={openMapLevel}
                        onAnnouncement={setAnnouncement}
                        onOpenHotspot={(hotspot, groupIds) =>
                          changeRoute({
                            view: 'hotspots',
                            returnTo: readingOrigin({ ...route, returnTo: undefined }, model.version),
                            hotspot,
                            hotspotGroup: groupIds?.join(',') || '',
                            node: '',
                            scope: '',
                          })
                        }
                        applicationSelectionId={route.appSelection}
                        applicationComponentId={route.appComponent}
                        onApplicationChange={(appSelection, appComponent) =>
                          changeRoute({ view, appSelection, appComponent }, true)
                        }
                      />
                    </Suspense>
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
