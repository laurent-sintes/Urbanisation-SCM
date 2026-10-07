import { activeMethod, methodEntries, isTransformationGuide } from './methodNavigation';
import { staticUrl } from './publication';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Compass, Copy, FileText, GitBranch, LayoutGrid, Lightbulb, Maximize2, PanelLeft, RefreshCw, X } from 'lucide-react';
import { usePublication } from './usePublication';
import { useBuildUpdate } from './useBuildUpdate';
import { useModelingGuide } from './useModelingGuide';
import { childrenOf, hasCapabilityCards, lineageOf, parentRelationOf, relatedTo, scopeStatistics } from './model';
import { kindLabel } from './presentation';
import { NodeIcon } from './icons';
import { Overview } from './components/Overview';
import { revealSection } from './readerNavigation';
import { preference, readRoute, routeHash, savePreference, type RouteState, type View } from './navigation';
import { Sidebar } from './components/Sidebar';
import { BusinessSheet } from './components/BusinessSheet';
import { MarketComparisons } from './components/MarketComparisons';
import type { MarketComparison, MarketInspiration, MarketGap } from './types';
import { ScenarioCatalogPage } from './components/ScenarioCatalogPage';
import { GlossaryPage } from './components/GlossaryPage';
import { ModelLinksProvider, ModelText, ContextReturn } from './components/ModelLinks';

const ReactFlowPane = lazy(() => import('./ReactFlowPane').then(module => ({ default: module.ReactFlowPane })));
const DependenciesPane = lazy(() => import('./DependenciesPane').then(module => ({ default: module.DependenciesPane })));
const ModelingGuidePage = lazy(() => import('./components/ModelingGuidePage').then(module => ({ default: module.ModelingGuidePage })));
const clampWidth = (width: number) => Math.min(420, Math.max(240, Number.isFinite(width) ? width : 300));
function initialRoute() {
  const saved = preference<string>('selection', '');
  return readRoute(location.hash || (typeof saved === 'string' ? saved : ''));
}
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
  const softwareUpdate=useBuildUpdate();
  const [route, setRoute] = useState(initialRoute);
  const { model, catalog, loading, error, notice, reload } = usePublication(route.version || undefined);
  const { state: guideState, retry: retryGuide } = useModelingGuide(model?.version, catalog?.releases.find(entry => entry.version === model?.version)?.guide_sha256);
  const activeGuide = guideState.status === 'ready' ? guideState.response.guide : undefined;
  const methodTitle = activeGuide?.title || 'Méthodologie';
  const methodCrumb = methodEntries(activeGuide).find(item=>item.id===activeMethod(activeGuide,route.principle))?.title;
  const metaGlossary = guideState.status === 'ready' ? guideState.response.guide?.glossary : undefined;
  const isMetaTerm = (id: string) => metaGlossary?.model_term_ids.includes(id) || metaGlossary?.terms.some(term => term.id === id);
  const glossaryMode = route.term && isMetaTerm(route.term) ? 'meta' : route.glossary || 'model';
  const glossaryTitle = glossaryMode === 'meta' ? 'Glossaire méthodologique' : 'Glossaire métier';
  const mobile = useMobile();
  const [drawer, setDrawer] = useState(false);
  const [width, setWidth] = useState(() => clampWidth(Number(preference('tree-width', 300))));
  const [announcement, setAnnouncement] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const mapPanel = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const restoreScroll = useRef<number | null>(null);
  const [fullPath, setFullPath] = useState(false);
  const selected = model?.nodeById.get(route.node);
  const view: View = route.view || (selected && !childrenOf(model!, selected.id).length ? 'sheet' : 'map');
  const validScope = route.scope && model?.nodeById.has(route.scope) ? route.scope : '';
  const scopeId = route.scope === '@root' ? undefined : validScope || (selected ? (childrenOf(model!, selected.id).length || ['business_system', 'group', 'domain', 'area', 'business_area', 'reference'].includes(selected.kind) ? selected.id : parentRelationOf(model!, selected.id)?.sourceId) : undefined);
  const scope = scopeId ? model?.nodeById.get(scopeId) : undefined;
  // Keep the map context stable on selection, including between double-clicks.
  const referenceView = view === 'scenarios' || view === 'glossary' || view === 'principles';
  const headingNode = referenceView ? undefined : view === 'map' ? scope : selected;
  const contentScope = view === 'map' ? scopeId : route.node;
  useLayoutEffect(() => {
    // A new view starts at the top; selecting a card in the same map does not jump.
    content.current?.scrollTo({ top: restoreScroll.current ?? Number(route.scroll || 0), left: 0, behavior: 'instant' });
    restoreScroll.current = null;
    if(!route.section) heading.current?.focus({preventScroll:true});
  }, [model?.version, view, contentScope, glossaryMode, route.principle, route.scenario, route.stream, route.path, route.scroll]);
  const changeRoute = useCallback((changes: Partial<RouteState>, replace = false) => {
    setRoute(previous => {
      const next = { ...previous, ...changes };
      history.replaceState({ ...history.state, atlasScroll: content.current?.scrollTop ?? 0 }, '', location.href);
      history[replace ? 'replaceState' : 'pushState']({}, '', routeHash(next, model));
      return next;
    });
  }, [model]);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const followReference = useCallback((kind: 'glossary' | 'model', id: string, section = '') => {
    changeRoute({ view: kind === 'glossary' ? 'glossary' : section === 'market_comparisons' ? 'market' : 'sheet', glossary: isMetaTerm(id) ? 'meta' : 'model',
      node: kind === 'model' ? id : '', term: kind === 'glossary' ? id : '', section, principle: '',
      scope: '', relation: '', source: '', anchor: '', sourceId: '', query: '', status: '' });
    setDrawer(false);
    if (!section && kind === 'model') setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute, model?.version, route.version, metaGlossary]);
  const openGlossary = useCallback((glossary: 'model' | 'meta' = 'model') => {
    changeRoute({ returnTo:'',catalogReturn:'',scroll:'', view: 'glossary', glossary, node: '', term: '', principle: '', section: '', scope: '', relation: '', source: '', anchor: '', sourceId: '' });
    setDrawer(false);
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute]);
  const openPrinciples = useCallback(() => {
    changeRoute({ returnTo:'',catalogReturn:'',scroll:'',view: 'principles', principle: '', node: '', term: '', section: '', scope: '', relation: '', source: '', anchor: '', sourceId: '', query: '', status: '' });
    setDrawer(false);
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute]);
  useEffect(() => {
    if (!route.section || !model || view === 'principles') return;
    const timer = requestAnimationFrame(() => {
      const section = view === 'glossary' && route.section === 'short-description' ? 'definition' : route.section;
      const target = document.getElementById(view === 'glossary' ? `term-${route.term}-${section}` : `field-${route.node}-${section}`);
      if (target) revealSection(target);
    });
    return () => cancelAnimationFrame(timer);
  }, [route.section, route.term, route.node, model, view]);
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const back = () => { restoreScroll.current = history.state?.atlasScroll ?? null; setRoute(readRoute(location.hash)); setDrawer(false); };
    window.addEventListener('hashchange', back);
    return () => { window.removeEventListener('hashchange', back); history.scrollRestoration = previousRestoration; };
  }, []);
  useEffect(() => {
    // Remember only the selected location. There is no visit history.
    savePreference('selection', routeHash({ ...route, version: '', query: '', status: '', source: '', anchor: '', sourceId: '' }));
    history.replaceState(history.state, '', routeHash(route, model));
  }, [route, model]);
  useEffect(() => savePreference('tree-width', width), [width]);
  useEffect(() => {
    if (model && route.node && !model.nodeById.has(route.node)) {
      setAnnouncement(`L’élément ${route.node} n’existe pas dans cette publication. Retour à la cartographie.`);
      changeRoute({ node: '', scope: '', view: 'map', relation: '' }, true);
    } else if (model && route.scope && route.scope !== '@root' && !model.nodeById.has(route.scope)) {
      setAnnouncement('Le périmètre de cette carte n’existe pas dans la publication. Le contexte de l’élément est rétabli.');
      changeRoute({ scope: '' }, true);
    }
  }, [model, route.node, route.scope, changeRoute]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); if (mobile) setDrawer(true);
        setTimeout(() => search.current?.focus(), 30);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [mobile]);
  const navigate = useCallback((id: string, focusHeading = true) => {
    changeRoute({ returnTo:'',catalogReturn:'',scroll:'', node: id, scope: '', view: undefined, term: '', principle: '', section: '', query: '', status: '', relation: '', source: '', anchor: '', sourceId: '' });
    setDrawer(false);
    if (focusHeading) setTimeout(() => heading.current?.focus({ preventScroll: true }), 50);
  }, [changeRoute]);
  const explore = useCallback((id: string) => {
    changeRoute({ node: id, scope: id, view: 'map', relation: '', section: '' });
  }, [changeRoute]);
  const read = useCallback((id: string) => {
    changeRoute({ node: id, view: 'sheet', relation: '', section: '' });
    setTimeout(() => heading.current?.focus({ preventScroll: true }), 30);
  }, [changeRoute]);
  const select = useCallback((id: string) => changeRoute({ node: id, scope: scopeId || '@root', relation: '' }), [changeRoute, scopeId]);
  const links = selected && model ? relatedTo(model, selected.id) : [];
  const copyLink = async () => {
    try {
      const pinned = { ...route, version: model?.version || route.version };
      const hash = routeHash(pinned, model);
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${hash}`);
      setAnnouncement('Lien copié vers cette publication.');
    } catch { setAnnouncement('La copie est indisponible. Tu peux copier l’adresse dans le navigateur.'); }
  };
  const atMapHome = view === 'map' && !headingNode;
  const statistics = model && headingNode ? scopeStatistics(model, headingNode) : [];
  const breadcrumbs = <nav className="breadcrumb" aria-label="Fil d’Ariane"><>{atMapHome ? <span aria-current="page">Cartographie</span> : <button onClick={() => navigate('')}>Cartographie</button>}</>{headingNode && model && lineageOf(model, headingNode.id).map(node => <span key={node.id}><ChevronRight size={12} /><button title={node.name} onClick={() => navigate(node.id)} aria-current={headingNode.id === node.id ? 'page' : undefined}>{node.name}</button></span>)}{referenceView && <span><ChevronRight size={12}/><span aria-current="page">{view === 'scenarios' ? 'Scénarios métier' : view === 'principles' ? `${methodTitle}${methodCrumb ? ' / ' + methodCrumb : ''}` : glossaryTitle}</span></span>}</nav>;
  const shareButton = <button className="share-button" aria-label="Copier le lien" title="Copier le lien" onClick={copyLink}><Copy size={16} /><span>Copier le lien</span></button>;
  return <ModelLinksProvider value={{ model: model || null, metaGlossary, guide: activeGuide, route, onFollow: followReference }}><div className="atlas-shell" style={{ '--sidebar': `${width}px` } as CSSProperties}>
    <header className="topbar" inert={mobile && drawer}>
      <div className="app-brand-area">
        {model && mobile && <button id="fa-tree-open" className="mobile-menu" aria-label="Ouvrir l’arbre" title="Ouvrir l’arbre" aria-expanded={drawer} aria-controls="atlas-tree-panel" onClick={() => setDrawer(true)}><PanelLeft size={20} /></button>}
        <button className="brand" onClick={() => navigate('')} aria-label="FLOW Atlas, accueil"><span className="brand-symbol" aria-hidden="true"><img className="flow-source-mark" src={staticUrl('assets/flow-original.png')} width="1024" height="1024" alt="" /></span><strong>FLOW <b>Atlas</b></strong></button>
      </div>
      {model && !mobile && <div className="topbar-navigation">{breadcrumbs}{shareButton}</div>}
      <button id="fa-refresh" className={`topbar-icon ${loading ? 'loading' : ''}`} aria-label="Actualiser la publication" title="Actualiser" disabled={loading} onClick={reload}><RefreshCw size={17} /></button>
    </header>
    {model && <Sidebar model={model} route={{ ...route, glossary: glossaryMode }} open={drawer} mobile={mobile} guide={guideState.status === 'ready' ? guideState.response.guide : undefined} searchRef={search} onClose={closeDrawer} onNavigate={navigate} onOpenGlossary={openGlossary} onOpenTerm={id => followReference('glossary', id)} onOpenPrinciples={openPrinciples} onSearch={changes => changeRoute(changes, true)} />}
    {model && <div className="rail-resizer" role="separator" tabIndex={0} aria-label="Largeur de l’arbre" aria-orientation="vertical" aria-valuemin={240} aria-valuemax={420} aria-valuenow={width}
      onKeyDown={e => { if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) { e.preventDefault(); setWidth(value => e.key === 'Home' ? 240 : e.key === 'End' ? 420 : clampWidth(value + (e.key === 'ArrowRight' ? 10 : -10))); } }}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) setWidth(clampWidth(e.clientX)); }}
      onPointerUp={e => e.currentTarget.releasePointerCapture(e.pointerId)} />}
    {drawer && mobile && <button className="drawer-scrim" tabIndex={-1} aria-label="Fermer l’arbre" onClick={closeDrawer} />}
    <main id="fa-main" className={`workspace ${!model ? 'without-model' : ''}`} inert={mobile && drawer} aria-busy={loading}>
      {(error || notice || announcement) && <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{error || notice || announcement}<button aria-label="Masquer le message" onClick={() => setAnnouncement('')} hidden={!announcement}><X size={14} /></button></div>}
      {!model ? <div className="empty-state"><Compass size={34} /><h1>{loading ? 'Ouverture du modèle…' : 'Publication indisponible'}</h1><p>{loading ? 'Chargement de la cartographie publiée.' : 'Réessaie de charger la publication.'}</p>{!loading && <button className="secondary-button" onClick={reload}>Réessayer</button>}</div> : <>
        <div className="workspace-header">
        {softwareUpdate && <aside className="publication-selection" role="status"><span>Une nouvelle version de l’interface Atlas est disponible.</span><button onClick={()=>window.location.reload()}>Recharger l’application</button></aside>}
        {route.version && <aside className="publication-selection" aria-label="Publication consultée"><span><strong>Publication figée · {route.version}</strong> — {catalog?.current !== route.version ? 'Une version plus récente est disponible.' : 'Ce lien restera sur cette édition.'}</span><button onClick={() => changeRoute({version:'',returnTo:'',catalogReturn:'',scroll:'',...(view === 'principles' ? {principle:''} : {})})}>Suivre la version courante</button></aside>}
        {mobile && <div className="breadcrumb-row"><div className={`mobile-path ${fullPath ? 'expanded' : ''}`}><button className="path-toggle" aria-expanded={fullPath} onClick={() => setFullPath(!fullPath)}>Chemin {fullPath ? '−' : '…'}</button>{breadcrumbs}</div>{shareButton}</div>}
        <header className="page-heading"><div className="heading-icon">{headingNode ? <NodeIcon node={headingNode} size={30} framed /> : <span className="node-icon framed tone-context">{view === 'principles' ? <Lightbulb size={30} /> : <Compass size={30} />}</span>}</div><div>
          <div className="eyebrow"><span>{headingNode ? kindLabel(headingNode) : view === 'principles' ? (isTransformationGuide(activeGuide) ? 'LA DÉMARCHE DE TRANSFORMATION' : 'LES REPÈRES MÉTHODOLOGIQUES') : view === 'glossary' ? 'LE VOCABULAIRE PUBLIÉ' : 'LE MODÈLE PUBLIÉ'}</span>{headingNode && view !== 'map' && <span title={`Identité persistante : ${headingNode.id}`}>{headingNode.displayCode ?? headingNode.id}</span>}</div>
          <h1 id="page-title" ref={heading} tabIndex={-1}>{view === 'scenarios' ? 'Scénarios métier' : view === 'principles' ? methodTitle : view === 'glossary' ? glossaryTitle : headingNode?.name || 'Cartographie'}</h1>
          {view !== 'sheet' && <p><ModelText text={view === 'scenarios' ? 'Explorer les situations métier, leurs flux de valeur et les capacités mobilisées.' : view === 'principles' ? activeGuide?.subtitle || 'Comprendre la démarche et ses repères.' : view === 'glossary' ? 'Les notions et leurs définitions dans la publication consultée.' : headingNode?.purpose || (headingNode ? 'Explore cet élément et ses relations dans le modèle publié.' : 'Parcours le modèle, explore les capacités et découvre les liens qui les relient.')}/></p>}
          {statistics.length > 0 && <ul className="scope-statistics" aria-label="Contenu du périmètre" title="Totaux des objets contenus dans ce périmètre, tous niveaux confondus, dans la publication consultée.">{statistics.map(stat => <li key={stat.kind}><strong>{stat.count}</strong> {stat.label}</li>)}</ul>}
        </div></header>
        {!referenceView && <div className="view-bar"><div className="view-tabs" role="tablist" aria-label="Vue du modèle">{([{ id: 'map', label: 'Carte', Icon: LayoutGrid }, { id: 'sheet', label: 'Fiche', Icon: FileText }, { id: 'relations', label: 'Relations', Icon: GitBranch }, { id: 'market', label: 'Sources d’inspiration', Icon: BookOpen }] as const).filter(tab => selected || !['sheet', 'market'].includes(tab.id)).map(tab => <button key={tab.id} role="tab" id={`tab-${tab.id}`} aria-controls="atlas-view" tabIndex={view === tab.id ? 0 : -1} aria-selected={view === tab.id} onClick={() => changeRoute({ view: tab.id, relation: '', section: '' })} onKeyDown={e => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault(); const items = [...e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('button')];
          items[(items.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length].click();
          items[(items.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length].focus();
        }}><tab.Icon size={16} />{tab.label}{tab.id === 'relations' && selected && !['business_system', 'group', 'domain', 'area', 'business_area', 'reference'].includes(selected.kind) && <span className="count">{links.length}</span>}</button>)}</div>{view === 'map' && selected && selected.id !== headingNode?.id && <div className="view-context"><span className="view-selection" title={`Sélection : ${selected.name}`}>Sélection : {selected.name}</span></div>}</div>}
        </div>
        <div className="workspace-content" ref={content} tabIndex={0} role="region" aria-label="Contenu de la vue" onScroll={event => history.replaceState({ ...history.state, atlasScroll: event.currentTarget.scrollTop }, '', location.href)}>
          <ContextReturn/>
        <div id="atlas-view" role={referenceView ? 'region' : 'tabpanel'} aria-labelledby={referenceView ? 'page-title' : `tab-${['sheet', 'market'].includes(view) && !selected ? 'map' : view}`}>
          {view === 'scenarios' ? <ScenarioCatalogPage model={model} route={route} onChange={changeRoute}/> : view === 'principles' ? <Suspense fallback={<p role="status">Ouverture de la méthodologie…</p>}><ModelingGuidePage key={model.version} model={model} selected={route.principle} routeVersion={route.version} state={guideState} retry={retryGuide} onSelect={principle => changeRoute({ principle })} /></Suspense> : view === 'glossary' ? <GlossaryPage model={model} routeVersion={route.version} selected={route.term} mode={glossaryMode} guideState={guideState} onRetry={retryGuide} onSelect={term => changeRoute({ view: 'glossary', glossary: glossaryMode, term, section: '' })}/> : view === 'sheet' && selected ? <BusinessSheet model={model} node={selected} onShowMarket={() => changeRoute({ view: 'market', relation: '', section: '' })} /> : view === 'market' && selected ? <article className="market-page" key={selected.id}><MarketComparisons id={`field-${selected.id}-market_comparisons`} entries={selected.fields.market_comparisons as readonly MarketComparison[] | undefined} inspiration={selected.fields.market_inspiration as MarketInspiration | undefined} modelName={selected.name} gaps={selected.fields.market_gaps as readonly MarketGap[] | undefined}/></article> : view === 'relations' ? <Suspense fallback={<div className="graph-canvas empty-state">Ouverture des relations…</div>}><DependenciesPane key={`${model.version}:${route.node}`} model={model} focusId={selected?.id} relationId={route.relation} settings={route} onSettings={changes => changeRoute(changes)} onSelectRelation={relation => changeRoute({ relation }, true)} onFocus={node => changeRoute({ node, scope: '', relation: '', view: 'relations', graphDepth: node ? 1 : 0 })} onRead={read}/></Suspense> : <>
            {!scopeId && model.nodes.some(node => node.kind === 'business_system') ? <Overview model={model} onExplore={explore} onRead={read}/> : <section className="map-panel" ref={mapPanel} aria-label="Carte du modèle">
              <div className="map-toolbar"><div><strong>{scope?.name || 'Vue d’ensemble'}</strong><span className="toolbar-note">Entre dans une carte pour explorer son contenu.</span></div>
                <div className="map-actions">
                  {scope && <button onClick={() => navigate(parentRelationOf(model, scope.id)?.sourceId || '')}><ArrowLeft size={14} />Remonter</button>}
                <button aria-label="Afficher la carte en plein écran" title="Plein écran" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void mapPanel.current?.requestFullscreen().catch(() => setAnnouncement('Le plein écran est indisponible dans ce navigateur.')); }}><Maximize2 size={16} /></button></div>
              </div>
              <Suspense fallback={<div className="graph-canvas empty-state">Ouverture de la carte…</div>}><ReactFlowPane model={model} selectedId={selected?.id || ''} scopeId={scopeId} onSelect={select} onExplore={explore} onRead={read} perspective="" /></Suspense>
              <div className="map-footer"><span>{hasCapabilityCards(model, scopeId) ? 'Cliquer sur un lien pour lire sa fiche · Faire défiler pour parcourir' : 'Molette pour zoomer · Glisser pour parcourir'}</span><span>Lecture seule</span></div>
            </section>}
          </>}
        </div>
        <footer className="workspace-footer">Cartographie · {route.version ? 'Publication fixe' : 'Publication courante, actualisée automatiquement'}</footer>
        </div>
      </>}
    </main>
  </div></ModelLinksProvider>;
}
