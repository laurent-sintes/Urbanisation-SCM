import {
  ArrowLeft,
  ChevronRight,
  Compass,
  Copy,
  Flame,
  Lightbulb,
  PanelLeft,
  PanelLeftClose,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { type CSSProperties, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApplicationCatalogPage } from './components/ApplicationCatalogPage';
import { BusinessSheet } from './components/BusinessSheet';
import { DesignPrinciplesPage } from './components/DesignPrinciplesPage';
import { DismissibleDetails } from './components/DismissibleDetails';
import { DocumentCatalogPage } from './components/DocumentCatalogPage';
import { GlobalSearch } from './components/GlobalSearch';
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
import { ModelViewTabs } from './components/ModelViewTabs';
import { Overview } from './components/Overview';
import { ScenarioCatalogPage } from './components/ScenarioCatalogPage';
import { Sidebar } from './components/Sidebar';
import { principleDestination } from './designPrinciples';
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
import {
  drawerNavigationKey,
  preference,
  type RouteState,
  readRoute,
  routeHash,
  savePreference,
  type View,
} from './navigation';
import { staticUrl } from './publication';
import { revealSection } from './readerNavigation';
import { searchResultRoute } from './searchPresentation';
import type { MarketComparison, MarketGap, MarketInspiration } from './types';
import { ui } from './ui.ts';
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
const clampWidth = (width: number) => Math.min(340, Math.max(220, Number.isFinite(width) ? width : 240));
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
  const selectedReadingGuide =
    model && route.view === 'design-principles'
      ? principleDestination(model, route.principle || '')?.principle
      : undefined;
  const isReadingGuide = Boolean(selectedReadingGuide?.reading_children?.length);
  const directingPrinciplesTitle = isReadingGuide
    ? ui('app.comment_lire_la_cartographie')
    : ui('app.principes_directeurs');
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
            message: ui('app.aucun_document_de_metamodele_associe_a_cette_publication'),
          },
        };
  const methodTitle = activeGuide?.title || ui('app.methodologie');
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
      ? ui('app.glossaire_du_metamodele')
      : glossaryMode === 'transformation'
        ? ui('app.glossaire_de_transformation')
        : ui('app.glossaire_metier');
  const mobile = useMobile();
  const [drawer, setDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => preference('sidebar-open', true));
  const [width, setWidth] = useState(() => clampWidth(Number(preference('navigation-width', 240))));
  const [searchOpen, setSearchOpen] = useState(Boolean(route.query.trim()));
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
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const restoreScroll = useRef<number | null>(null);
  const lastLocationKey = useRef(locationKey);
  const drawerDestination = drawerNavigationKey(route);
  const previousDrawerDestination = useRef(drawerDestination);
  const [fullPath, setFullPath] = useState(false);
  const universeNode = model?.nodes.find((node) => node.kind === 'universe');
  const rootName = universeNode?.name || ui('app.univers');
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
  const explicitFlowScope =
    view === 'flows' &&
    validScope &&
    ['business_system', 'domain', 'area', 'group', 'business_area'].includes(
      model?.nodeById.get(validScope)?.kind || '',
    )
      ? validScope
      : undefined;
  const scopeId =
    explicitFlowScope ||
    (model && requestedScope
      ? [...lineageOf(model, requestedScope)]
          .reverse()
          .find((node) => node.kind === 'domain' || node.kind === 'business_system')?.id ||
        validScope ||
        (selected &&
          (childrenOf(model, selected.id).length ||
          ['group', 'area', 'business_area', 'reference'].includes(selected.kind)
            ? selected.id
            : parentRelationOf(model, selected.id)?.sourceId))
      : undefined);
  const scope = scopeId ? model?.nodeById.get(scopeId) : undefined;
  const mapMaxDepth = model ? mapDepthLimit(model, scopeId) : 0;
  const mapDepth = Math.min(route.mapDepth ?? defaultMapDepth(scope?.kind), mapMaxDepth);
  const universeDepth = Math.min(route.mapDepth ?? defaultMapDepth('universe'), 2);
  const detailLabels =
    scope?.kind === 'domain'
      ? [
          ui('app.domaine'),
          ui('app.sous_domaines'),
          ui('app.business_areas'),
          ui('app.capacites'),
          ui('app.comportements'),
        ]
      : [
          ui('app.domaines'),
          ui('app.sous_domaines'),
          ui('app.business_areas'),
          ui('app.capacites'),
          ui('app.comportements'),
        ];
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
    view === 'design-principles' ||
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
    if (previousDrawerDestination.current !== drawerDestination) setDrawer(false);
    previousDrawerDestination.current = drawerDestination;
  }, [locationKey, navigationType, drawerDestination]);
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
  useEffect(() => savePreference('navigation-width', width), [width]);
  useEffect(() => savePreference('sidebar-open', sidebarOpen), [sidebarOpen]);
  useEffect(() => {
    if (model && route.node && !model.nodeById.has(route.node)) {
      setAnnouncement(
        ui('app.l_element_n_existe_pas_dans_cette_publication_retour_a_la_cartogr', { node: route.node }),
      );
      changeRoute({ node: '', scope: '', view: view === 'flows' ? 'flows' : 'map', relation: '' }, true);
    } else if (model && route.scope && route.scope !== '@root' && !model.nodeById.has(route.scope)) {
      setAnnouncement(ui('app.le_perimetre_de_cette_carte_n_existe_pas_dans_la_publication_le_c'));
      changeRoute({ scope: '' }, true);
    }
  }, [model, route.node, route.scope, view, changeRoute]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setDrawer(false);
        setSearchOpen(true);
        document.querySelector<HTMLInputElement>('.global-search[open] input')?.focus();
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  useEffect(() => {
    if (route.query.trim()) setSearchOpen(true);
  }, [route.query]);
  const navigate = useCallback(
    (id: string, focusHeading = true) => {
      const item = model?.nodeById.get(id);
      const domain = item && model ? lineageOf(model, id).find((node) => node.kind === 'domain') : undefined;
      const businessArea =
        item && model ? [...lineageOf(model, id)].reverse().find((node) => node.kind === 'business_area') : undefined;
      const depth = item?.kind === 'area' ? 2 : item?.kind === 'business_area' ? 3 : defaultMapDepth(item?.kind);
      const flowScope =
        view === 'flows' && item && ['business_system', 'domain', 'area', 'group'].includes(item.kind) ? id : undefined;
      changeRoute({
        returnTo: '',
        catalogReturn: '',
        scroll: '',
        node: id,
        scope: flowScope || domain?.id || (item?.kind === 'business_system' ? id : ''),
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
      setAnnouncement(ui('app.lien_copie_vers_cette_publication'));
    } catch {
      setAnnouncement(ui('app.la_copie_est_indisponible_tu_peux_copier_l_adresse_dans_le_naviga'));
    }
  };
  const atMapHome = cartographicView && !headingNode;
  const statistics = model && headingNode ? scopeStatistics(model, headingNode) : [];
  const referenceLabel =
    view === 'help'
      ? ui('app.aide_a_la_lecture')
      : view === 'hotspots'
        ? ui('app.points_chauds')
        : view === 'applications'
          ? route.appView === 'products'
            ? ui('app.logiciels_du_marche')
            : ui('app.si_a_faire_converger')
          : view === 'documents'
            ? ui('app.documents')
            : view === 'scenarios'
              ? ui('app.scenarios_metier')
              : view === 'metamodel'
                ? ui('app.metamodele_flow')
                : view === 'design-principles'
                  ? directingPrinciplesTitle
                  : view === 'principles'
                    ? `${methodTitle}${methodCrumb ? ` / ${methodCrumb}` : ''}`
                    : glossaryTitle;
  const breadcrumbs = (
    <nav className="breadcrumb" aria-label={ui('app.fil_d_ariane')}>
      {referenceView ? (
        <>
          <button type="button" onClick={() => navigate('')}>
            {ui('app.atlas')}
          </button>
          {['documents', 'glossary', 'design-principles', 'principles', 'help', 'metamodel', 'applications'].includes(
            view,
          ) && (
            <span>
              <ChevronRight size={12} />
              <span>{view === 'applications' ? ui('app.applications') : ui('app.comprendre')}</span>
            </span>
          )}
          <span>
            <ChevronRight size={12} />
            <span aria-current="page">{referenceLabel}</span>
          </span>
        </>
      ) : (
        <>
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
        </>
      )}
    </nav>
  );
  const shareButton = (
    <button
      type="button"
      className="share-button"
      aria-label={ui('app.copier_le_lien')}
      title={ui('app.copier_le_lien')}
      onClick={copyLink}
    >
      <Copy size={16} />
      <span>{ui('app.copier_le_lien')}</span>
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
                aria-label={mobile || !sidebarOpen ? ui('app.ouvrir_le_panneau') : ui('app.replier_le_panneau')}
                title={mobile || !sidebarOpen ? ui('app.ouvrir_le_panneau') : ui('app.replier_le_panneau')}
                aria-expanded={mobile ? drawer : sidebarOpen}
                aria-controls="atlas-tree-panel"
                onClick={() => (mobile ? setDrawer(true) : setSidebarOpen((open) => !open))}
              >
                {mobile || !sidebarOpen ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
              </button>
            )}
            <button
              type="button"
              className="brand"
              onClick={() => navigate('')}
              aria-label={ui('app.flow_atlas_accueil')}
            >
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
                {ui('app.flow')}
                <b>{ui('app.atlas')}</b>
              </strong>
            </button>
          </div>
          {model && (
            <button
              type="button"
              className="global-search-trigger"
              aria-label={ui('app.rechercher_dans_atlas')}
              aria-haspopup="dialog"
              onClick={() => {
                setDrawer(false);
                setSearchOpen(true);
              }}
            >
              <Search size={18} />
              <span>{ui('app.rechercher_dans_atlas_2')}</span>
              <kbd>{ui('app.ctrl_k')}</kbd>
            </button>
          )}
          {model && (
            <DismissibleDetails className="publication-picker">
              <summary>
                <span className="publication-mode">
                  {route.version ? ui('app.modele_fige') : ui('app.modele_courant')}
                </span>
                <span>
                  {model.revision
                    ? ui('common.publication_revision', { revision: String(model.revision).padStart(3, '0') })
                    : model.version}
                </span>
              </summary>
              <div>
                <label>
                  {ui('app.publication_consultee')}
                  <select
                    aria-label={ui('app.choisir_la_publication')}
                    value={route.version || ''}
                    onChange={(event) => {
                      changeRoute({
                        version: event.target.value,
                        returnTo: '',
                        catalogReturn: '',
                        scroll: '',
                        section: '',
                      });
                      event.currentTarget.closest('details')?.removeAttribute('open');
                    }}
                  >
                    <option value="">{ui('app.courante_actualisee_automatiquement')}</option>
                    {catalog?.releases.map((entry) => (
                      <option key={entry.version} value={entry.version}>
                        {entry.revision ? ui('app.v', { value1: String(entry.revision).padStart(3, '0') }) : ''}
                        {entry.version}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  {route.version
                    ? ui('app.cette_edition_est_fixe')
                    : ui('app.la_derniere_publication_est_suivie_automatiquement')}
                </p>
                <p className="publication-statistics">
                  {model.nodes.length}
                  {ui('app.elements')}
                  {model.nodes.filter((node) => node.kind === 'capability').length} {ui('app.capacites_2')}
                  {model.nodes.some((node) => node.kind === 'behavior') && (
                    <>
                      {' '}
                      · {model.nodes.filter((node) => node.kind === 'behavior').length}
                      {ui('app.comportements_2')}
                    </>
                  )}
                </p>
                <button type="button" className="publication-refresh" onClick={reload} disabled={loading}>
                  <RefreshCw size={15} />
                  {ui('app.actualiser_la_publication')}
                </button>
              </div>
            </DismissibleDetails>
          )}
          <button
            type="button"
            id="fa-refresh"
            className={`topbar-icon ${loading ? 'loading' : ''}`}
            aria-label={ui('app.actualiser_la_publication')}
            title={ui('app.actualiser')}
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
            onClose={closeDrawer}
            onNavigate={navigate}
            onOpenGlossary={openGlossary}
            onOpenPrinciples={openPrinciples}
            onSearch={(changes) => {
              changeRoute(changes);
              setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
            }}
          />
        )}
        {model && sidebarOpen && (
          <div
            className="rail-resizer"
            role="separator"
            tabIndex={0}
            aria-label={ui('app.largeur_du_panneau')}
            aria-orientation="vertical"
            aria-valuemin={220}
            aria-valuemax={340}
            aria-valuenow={width}
            onKeyDown={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                setWidth((value) =>
                  e.key === 'Home'
                    ? 220
                    : e.key === 'End'
                      ? 340
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
            aria-label={ui('app.fermer_le_panneau')}
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
                aria-label={ui('app.masquer_le_message')}
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
              <h1>{loading ? ui('app.ouverture_du_modele') : ui('app.publication_indisponible')}</h1>
              <p>
                {loading
                  ? ui('app.chargement_de_la_cartographie_publiee')
                  : ui('app.reessaie_de_charger_la_publication')}
              </p>
              {!loading && (
                <button type="button" className="secondary-button" onClick={reload}>
                  {ui('app.reessayer')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="workspace-header">
                {!mobile && (
                  <div className="breadcrumb-row desktop-path">
                    {breadcrumbs}
                    {shareButton}
                  </div>
                )}
                {softwareUpdate && (
                  <aside className="publication-selection" role="status">
                    <span>{ui('app.une_nouvelle_version_de_l_interface_atlas_est_disponible')}</span>
                    <button type="button" onClick={() => window.location.reload()}>
                      {ui('app.recharger_l_application')}
                    </button>
                  </aside>
                )}
                {route.version && (
                  <aside className="publication-selection" aria-label={ui('app.publication_consultee')}>
                    <span>
                      <strong>
                        <span className="publication-fixed-long">{ui('app.publication_figee')}</span>
                        <span className="publication-fixed-short">{ui('app.figee')}</span> · {route.version}
                      </strong>
                      <span className="publication-explanation">
                        {' '}
                        —{' '}
                        {catalog?.current !== route.version
                          ? ui('app.une_version_plus_recente_est_disponible')
                          : ui('app.ce_lien_restera_sur_cette_edition')}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={ui('app.suivre_la_version_courante')}
                      onClick={() =>
                        changeRoute({
                          version: '',
                          returnTo: '',
                          catalogReturn: '',
                          scroll: '',
                          ...(['design-principles', 'principles', 'metamodel'].includes(view) ? { principle: '' } : {}),
                        })
                      }
                    >
                      <span className="publication-follow-long">{ui('app.suivre_la_version_courante')}</span>
                      <span className="publication-follow-short" aria-hidden="true">
                        {ui('app.suivre_le_courant')}
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
                        {ui('app.chemin')}
                        {fullPath ? '−' : '…'}
                      </button>
                      {breadcrumbs}
                    </div>
                    {shareButton}
                  </div>
                )}
                {cartographicView || hotspotDetail || view === 'relations' ? (
                  <h1 id="page-title" className="sr-only" ref={heading} tabIndex={-1}>
                    {hotspotDetail
                      ? ui('app.points_chauds')
                      : view === 'relations'
                        ? ui('app.relations', { value1: headingNode?.name || rootName })
                        : scope?.name || rootName}
                  </h1>
                ) : (
                  <header className={`page-heading${referenceView ? ' reference-heading' : ''}`}>
                    <div className="heading-icon">
                      {headingNode ? (
                        <NodeIcon node={headingNode} size={30} framed />
                      ) : (
                        <span className="node-icon framed tone-context">
                          {view === 'hotspots' ? (
                            <Flame size={30} />
                          ) : view === 'design-principles' ||
                            view === 'principles' ||
                            view === 'metamodel' ||
                            view === 'help' ? (
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
                              ? ui('app.aide_a_la_lecture_2')
                              : view === 'metamodel'
                                ? ui('app.le_metamodele')
                                : view === 'design-principles'
                                  ? isReadingGuide
                                    ? ui('app.reperes_de_lecture')
                                    : ui('app.les_choix_de_conception')
                                  : view === 'principles'
                                    ? ui('app.la_demarche_de_transformation')
                                    : view === 'glossary'
                                      ? ui('app.le_vocabulaire_publie')
                                      : view === 'applications'
                                        ? ui('app.les_applications_publiees')
                                        : view === 'documents'
                                          ? ui('app.les_documents_publies')
                                          : ui('app.le_modele_publie')}
                          </span>
                        )}
                        {headingNode && (
                          <span title={ui('app.identifiant', { id: headingNode.id })}>
                            {headingNode.displayCode ?? headingNode.id}
                          </span>
                        )}
                      </div>
                      <h1 id="page-title" ref={heading} tabIndex={-1}>
                        {view === 'help'
                          ? route.helpTopic === 'workshop'
                            ? ui('app.mode_atelier')
                            : ui('app.par_ou_commencer')
                          : view === 'hotspots'
                            ? ui('app.points_chauds')
                            : view === 'applications'
                              ? route.appView === 'products'
                                ? ui('app.logiciels_du_marche')
                                : ui('app.si_a_faire_converger')
                              : view === 'documents'
                                ? ui('app.documents')
                                : view === 'scenarios'
                                  ? ui('app.scenarios_metier')
                                  : view === 'metamodel'
                                    ? ui('app.metamodele_flow')
                                    : view === 'design-principles'
                                      ? directingPrinciplesTitle
                                      : view === 'principles'
                                        ? methodTitle
                                        : view === 'glossary'
                                          ? glossaryTitle
                                          : headingNode?.name || ui('app.cartographie')}
                      </h1>
                      {view !== 'sheet' && (
                        <p>
                          <ModelText
                            text={
                              view === 'help'
                                ? route.helpTopic === 'workshop'
                                  ? ui('app.preparer_une_seance_de_travail_collective_autour_de_la_cartograph')
                                  : ui('app.un_parcours_rapide_pour_explorer_le_modele_publie')
                                : view === 'hotspots'
                                  ? ui('app.un_point_chaud_est_un_sujet_qui_demande_une_clarification_ou_un_a')
                                  : view === 'applications'
                                    ? route.appView === 'products'
                                      ? ui('app.choisis_un_logiciel_pour_explorer_son_offre_et_ses_modules_docume')
                                      : ui('app.explore_les_usages_documentes_par_si_la_presence_d_un_produit_ne_')
                                    : view === 'documents'
                                      ? ui('app.consulter_les_etudes_flow_et_les_documents_associes_a_cette_publi')
                                      : view === 'scenarios'
                                        ? ui('app.explorer_les_situations_metier_leurs_flux_de_valeur_et_les_capaci')
                                        : view === 'metamodel'
                                          ? metaGuide?.subtitle || ui('app.comprendre_les_objets_et_regles_du_modele')
                                          : view === 'design-principles'
                                            ? isReadingGuide
                                              ? ui(
                                                  'app.bonnes_pratiques_pour_comprendre_les_responsabilites_les_frontier',
                                                  { value1: selectedReadingGuide?.reading_children?.length },
                                                )
                                              : ui(
                                                  'app.comprendre_les_choix_qui_structurent_la_cartographie_leurs_raison',
                                                )
                                            : view === 'principles'
                                              ? activeGuide?.subtitle || ui('app.comprendre_la_demarche_et_ses_reperes')
                                              : view === 'glossary'
                                                ? ui(
                                                    'app.les_notions_et_leurs_definitions_dans_la_publication_consultee',
                                                  )
                                                : headingNode?.purpose ||
                                                  (headingNode
                                                    ? ui(
                                                        'app.explore_cet_element_et_ses_relations_dans_le_modele_publie',
                                                      )
                                                    : ui(
                                                        'app.parcours_le_modele_explore_les_capacites_et_decouvre_les_liens_qu',
                                                      ))
                            }
                          />
                        </p>
                      )}
                      {statistics.length > 0 && (
                        <ul
                          className="scope-statistics"
                          aria-label={ui('app.contenu_du_perimetre')}
                          title={ui('app.totaux_des_objets_contenus_dans_ce_perimetre_tous_niveaux_confond')}
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
                    <ModelViewTabs
                      view={view}
                      mobile={mobile}
                      hasNode={!!selected}
                      parentLabel={
                        selected && selected.kind !== 'universe'
                          ? cartographicView
                            ? parentScope?.name || rootName
                            : viewParent?.name || rootName
                          : undefined
                      }
                      onParent={() =>
                        cartographicView ? openMapLevel(parentScope?.id || '') : navigate(viewParent?.id || '')
                      }
                      relationCount={
                        selected &&
                        ![
                          'universe',
                          'business_system',
                          'group',
                          'domain',
                          'area',
                          'business_area',
                          'reference',
                        ].includes(selected.kind)
                          ? links.length
                          : undefined
                      }
                      onChange={(next) =>
                        next === 'map' && !cartographicView
                          ? showSelectedOnMap()
                          : next === 'flows'
                            ? changeRoute({
                                view: 'flows',
                                scope: validScope || scopeId || '@root',
                                relation: '',
                                section: '',
                              })
                            : next === 'relations' && cartographicView
                              ? changeRoute({ view: next, node: scopeId || '', relation: '', section: '' })
                              : changeRoute({ view: next, relation: '', section: '' })
                      }
                    />
                    {!mobile && selected && selected.kind !== 'universe' && (
                      <button
                        type="button"
                        className="view-parent-button"
                        onClick={() =>
                          cartographicView ? openMapLevel(parentScope?.id || '') : navigate(viewParent?.id || '')
                        }
                      >
                        <ArrowLeft size={14} />
                        {ui('app.remonter_vers')}{' '}
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
                aria-label={ui('app.contenu_de_la_vue')}
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
                      supplyDomainName={displayModel?.nodeById.get('supply-chain-orchestration')?.name}
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
                    <Suspense fallback={<p role="status">{ui('app.ouverture_du_metamodele')}</p>}>
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
                  ) : view === 'design-principles' ? (
                    <DesignPrinciplesPage
                      key={model.version}
                      model={model}
                      route={route}
                      onSelect={(principle) => changeRoute({ principle, section: '', scroll: '' })}
                    />
                  ) : view === 'principles' ? (
                    <Suspense fallback={<p role="status">{ui('app.ouverture_de_la_methodologie')}</p>}>
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
                    <Suspense
                      fallback={<div className="graph-canvas empty-state">{ui('app.ouverture_des_relations')}</div>}
                    >
                      <DependenciesPane
                        key={`${model.version}:${route.node}`}
                        model={model}
                        focusId={selected?.kind === 'universe' ? undefined : selected?.id}
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
                    <Suspense
                      fallback={
                        <div className="graph-canvas empty-state">{ui('app.ouverture_de_la_cartographie')}</div>
                      }
                    >
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
                  {ui('app.cartographie_2')}{' '}
                  {route.version
                    ? ui('app.publication_fixe')
                    : ui('app.publication_courante_actualisee_automatiquement')}
                </footer>
              </div>
            </>
          )}
        </main>
      </div>
      {model && (
        <GlobalSearch
          model={displayModel || model}
          guide={activeGuide}
          open={searchOpen}
          query={route.query}
          fixed={Boolean(route.version)}
          onQuery={(query) => changeRoute({ query }, true)}
          onClose={() => {
            setSearchOpen(false);
            changeRoute({ query: '' }, true);
          }}
          onSelect={(result, map) => {
            setSearchOpen(false);
            if (result.kind === 'glossary' || result.kind === 'method') followReference('glossary', result.id);
            else changeRoute(searchResultRoute(model, result, map));
            setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
          }}
        />
      )}
    </ModelLinksProvider>
  );
}
