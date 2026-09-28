import type { ModelingGuide } from '../modelingGuide';
import { CatalogLink } from './ModelLinks';
import { catalogOf } from '../scenarioCatalog';
import { staticUrl } from '../publication';
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { ChevronDown, ChevronRight, Search, X, PanelLeftClose, Compass, BookOpen, Lightbulb } from 'lucide-react';
import type { AtlasNode, PublishedModel } from '../types';
import { childrenOf, lineageOf, parentRelationOf, rootsOf } from '../model';
import { searchPublication } from '../search';
import { kindLabel } from '../presentation';
import { NodeIcon } from '../icons';
import { startsCapabilityTypeSection } from '../capabilityTypes';
import { preference, savePreference, type RouteState } from '../navigation';

interface Props {
  guide?: ModelingGuide; model: PublishedModel; route: RouteState; open: boolean; mobile: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onClose: () => void; onNavigate: (id: string, focusHeading?: boolean) => void;
  onSearch: (changes: Partial<RouteState>) => void;
  onOpenGlossary: (mode: 'model' | 'meta') => void;
  onOpenTerm: (id: string) => void;
  onOpenPrinciples: () => void;
}
export function Sidebar({ model, guide, route, open, mobile, searchRef, onClose, onNavigate, onSearch, onOpenGlossary, onOpenTerm, onOpenPrinciples }: Props) {
  const tree = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const revealed = useRef('');
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const saved = preference<unknown>('expanded', []);
    return new Set(Array.isArray(saved) ? saved.filter(x => typeof x === 'string') : []);
  });
  const [focused, setFocused] = useState(route.node);
  const [resultType, setResultType] = useState('all');
  const searching = Boolean(route.query.trim());
  useEffect(() => {
    const ancestors = lineageOf(model, route.node).map(n => n.id);
    setExpanded(previous => new Set([...previous, ...ancestors]));
    setFocused(route.node);
  }, [model, route.node]);
  useEffect(() => savePreference('expanded', [...expanded]), [expanded]);
  useEffect(() => {
    const key = `${model.version}:${route.node}`;
    if (searching || revealed.current === key || !tree.current) return;
    const item = [...tree.current.querySelectorAll<HTMLElement>('[data-tree-id]')].find(el => el.dataset.treeId === route.node);
    const row = item?.firstElementChild as HTMLElement | undefined;
    if (!row) return;
    const bounds = tree.current.getBoundingClientRect(), rect = row.getBoundingClientRect();
    if (rect.bottom > bounds.bottom) tree.current.scrollTop += rect.bottom - bounds.bottom + 14;
    if (rect.top < bounds.top) tree.current.scrollTop -= bounds.top - rect.top + 14;
    revealed.current = key;
  }, [expanded, model.version, route.node, searching]);
  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('.drawer-close')?.focus();
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]),input,select,a[href],[role="treeitem"][tabindex="0"]') || [])].filter(el => el.offsetParent !== null);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); previous?.focus(); };
  }, [open, mobile, onClose]);
  const toggle = (id: string, value = !expanded.has(id)) => {
    if (!value && lineageOf(model, focused).some(node => node.id === id)) setFocused(id);
    setExpanded(previous => {
      const next = new Set(previous); value ? next.add(id) : next.delete(id); return next;
    });
  };
  const visibleIds: string[] = [];
  const visit = (node: AtlasNode) => { visibleIds.push(node.id); if (expanded.has(node.id)) childrenOf(model, node.id).forEach(visit); };
  rootsOf(model).filter(n => !['object','document','event'].includes(n.kind)).forEach(visit);
  const tabStop = visibleIds.includes(focused) ? focused : lineageOf(model, focused).reverse().find(node => visibleIds.includes(node.id))?.id || visibleIds[0];
  const focus = (id?: string) => {
    if (!id) return;
    setFocused(id);
    [...(tree.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') || [])].find(el => el.dataset.treeId === id)?.focus();
  };
  const keydown = (event: KeyboardEvent<HTMLElement>, node: AtlasNode) => {
    if (event.target !== event.currentTarget) return;
    const items = [...(tree.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') || [])];
    const index = items.indexOf(event.currentTarget);
    const ids = childrenOf(model, node.id).map(n => n.id);
    if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (event.key === 'ArrowDown') focus(items[index + 1]?.dataset.treeId);
    if (event.key === 'ArrowUp') focus(items[index - 1]?.dataset.treeId);
    if (event.key === 'Home') focus(items[0]?.dataset.treeId);
    if (event.key === 'End') focus(items.at(-1)?.dataset.treeId);
    if (event.key === 'ArrowRight' && ids.length) expanded.has(node.id) ? focus(ids[0]) : toggle(node.id, true);
    if (event.key === 'ArrowLeft') expanded.has(node.id) && ids.length ? toggle(node.id, false) : focus(parentRelationOf(model, node.id)?.sourceId);
    if (event.key === 'Enter' || event.key === ' ') onNavigate(node.id, mobile);
  };
  const renderNode = (node: AtlasNode, depth: number, typeStart = false) => {
    const children = childrenOf(model, node.id);
    const isExpanded = expanded.has(node.id);
    return <li key={node.id} role="treeitem" data-tree-id={node.id} className={typeStart ? 'capability-type-section-start' : undefined} aria-label={`${node.name} · ${kindLabel(node)}`}
      aria-description={node.displayCode} aria-level={depth} aria-expanded={children.length ? isExpanded : undefined} aria-selected={route.node === node.id}
      tabIndex={tabStop === node.id ? 0 : -1}
      onFocus={e => e.target === e.currentTarget && setFocused(node.id)} onKeyDown={e => keydown(e, node)}>
      <div className={`tree-row ${route.node === node.id ? 'selected' : ''}`} style={{ paddingLeft: (depth - 1) * 14 + 4 }} onClick={() => onNavigate(node.id)}>
        {children.length ? <button className="tree-toggle" tabIndex={-1} aria-label={`${isExpanded ? 'Replier' : 'Déplier'} ${node.name}`} data-tree-toggle={node.id} onClick={e => { e.stopPropagation(); toggle(node.id); }}>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button> : <span className="tree-spacer" />}
        <NodeIcon node={node} size={17} />
        <span className="tree-label" title={`${node.displayCode ?? node.id} · ${kindLabel(node)}`}><span className="sr-only">{node.displayCode} </span>{node.name}</span>
        {children.length > 0 && <small>{children.length}</small>}
      </div>
      {children.length > 0 && isExpanded && <ul role="group">{children.map((child, index) => renderNode(child, depth + 1, startsCapabilityTypeSection(children, index)))}</ul>}
    </li>;
  };
  const matches = searching ? searchPublication(model, route.query, guide).filter(result => resultType === 'all' || (['glossary','scenario','value_stream','method','guide'].includes(resultType) ? result.kind === resultType : result.node?.kind === resultType)) : [];
  const revision = model.revision ? `v${String(model.revision).padStart(3, '0')}` : model.version;
  const publicationLabel = `Version du modèle complet : ${revision} · ${model.version}. ${route.version ? 'Publication fixe' : 'Publication courante, actualisée automatiquement'}.`;
  return <aside ref={panel} id="atlas-tree-panel" className={`sidebar ${open ? 'open' : ''} ${searching ? 'is-searching' : ''}`} aria-label="Navigation du modèle" aria-modal={mobile && open ? true : undefined} role={mobile && open ? 'dialog' : undefined}>
    <div className="sidebar-heading"><span className="root-link">Parcourir</span>
      <button className="drawer-close" aria-label="Fermer l’arbre" onClick={onClose}><PanelLeftClose size={20} /></button></div>
    <nav className="primary-spaces" aria-label="Espaces Atlas">
      <button aria-current={!['scenarios','glossary','principles'].includes(route.view || '') ? 'page' : undefined} onClick={() => onNavigate('')}><Compass size={17}/>Cartographie</button>
      {!!model.raw.scenario_catalog && <button aria-current={route.view==='scenarios' ? 'page' : undefined} onClick={() => {onSearch({view:'scenarios',node:'',scope:'',query:'',scenario:'',stream:'',path:'',section:'',event:'',object:'',situation:'',capability:'',scenarioQuery:'',returnTo:'',catalogReturn:'',scroll:''});onClose();}}><Compass size={17}/>Scénarios métier</button>}
      <button onClick={() => onOpenGlossary('model')} aria-current={route.view==='glossary' ? 'page' : undefined}><BookOpen size={17}/>Glossaires</button>
      <button onClick={onOpenPrinciples} aria-current={route.view==='principles' ? 'page' : undefined}><Lightbulb size={17}/>Méthode & métamodèle</button>
    </nav>
    <div className="search-box"><Search size={17} /><input ref={searchRef} id="fa-search" aria-label="Rechercher dans le modèle publié" placeholder="Un nom, une idée, un repère…" value={route.query} onChange={e => onSearch({ query: e.target.value })} onKeyDown={e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); panel.current?.querySelector<HTMLButtonElement>('[data-search-result]')?.focus(); }
      if (e.key === 'Escape') onSearch({ query: '', status: '' });
    }} />{route.query ? <button aria-label="Effacer la recherche" onClick={() => onSearch({ query: '', status: '' })}><X size={14} /></button> : <kbd>Ctrl K</kbd>}</div>
    {searching ? <div className="search-results" aria-label="Résultats de recherche"><label className="search-filter">Afficher<select aria-label="Type de résultat" value={resultType} onChange={e => setResultType(e.target.value)}><option value="all">Tous les résultats</option><option value="capability">Capacités</option><option value="behavior">Comportements</option><option value="domain">Domaines</option><option value="area">Sous-domaines</option><option value="reference">Référentiels</option><option value="glossary">Glossaire métier</option><option value="method">Notions méthodologiques</option><option value="guide">Méthode</option><option value="scenario">Scénarios</option><option value="value_stream">Flux de valeur</option></select></label><p role="status">{matches.length} résultat{matches.length > 1 ? 's' : ''}</p>{matches.map(result => <button key={`${result.kind}:${result.id}`} data-search-result={result.id} onClick={() => ['glossary','method'].includes(result.kind) ? onOpenTerm(result.id) : result.kind === 'guide' ? (onSearch({view:'principles',principle:result.id,node:'',query:'',section:'',returnTo:'',scroll:''}),onClose()) : ['scenario','value_stream'].includes(result.kind) ? (onSearch({view:'scenarios',scenario:result.kind === 'scenario' ? result.id : '',stream:result.kind === 'value_stream' ? result.id : '',path:'',node:'',query:'',section:''}),onClose()) : onNavigate(result.id, true)} onKeyDown={e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLElement)?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); const previous = e.currentTarget.previousElementSibling; previous?.tagName === 'BUTTON' ? (previous as HTMLElement).focus() : searchRef.current?.focus(); }
    }}>{result.node ? <NodeIcon node={result.node} size={20} framed /> : <BookOpen size={22}/>}<span><strong>{result.name}</strong><small>{result.node ? `${kindLabel(result.node)} · ${lineageOf(model, result.id).slice(0, -1).map(n => n.name).join(' / ')}` : result.kind === 'scenario' ? 'Scénario métier' : result.kind === 'value_stream' ? 'Flux de valeur' : result.kind === 'method' ? 'Notion méthodologique' : result.kind === 'guide' ? 'Méthode' : 'Terme du glossaire'} · {result.node?.displayCode ?? result.id}</small>{result.excerpt && <span className="search-excerpt">{result.excerpt}</span>}</span></button>)}{!matches.length && <p>Aucun élément ne correspond dans cette publication.</p>}</div>
       : ['scenarios','glossary','principles'].includes(route.view || '') ? <nav className="space-navigation" aria-label={route.view==='principles' ? 'Rubriques de la méthode' : 'Navigation de cet espace'}>
        {route.view==='glossary' && <><button aria-current={route.glossary!=='meta' ? 'page' : undefined} onClick={()=>onOpenGlossary('model')}>Glossaire métier</button><button aria-current={route.glossary==='meta' ? 'page' : undefined} onClick={()=>onOpenGlossary('meta')}>Glossaire méthodologique</button></>}
        {route.view==='principles' && <>{guide?.chapters?.map(ch=><button key={ch.id} aria-current={(route.principle || 'start')===ch.id ? 'page' : undefined} onClick={()=>{onSearch({principle:ch.id,scroll:''});onClose();}}>{ch.title}</button>)}<button onClick={()=>{onSearch({principle:'codes',scroll:''});onClose();}}>Codes et identifiants</button></>}
        {route.view==='scenarios' && <><h2>Flux de valeur</h2><CatalogLink stream="">Tous les scénarios</CatalogLink>{catalogOf(model)?.value_streams.map(v=><CatalogLink key={v.id} stream={v.id}>{v.label_fr}</CatalogLink>)}</>}
      </nav> : <div className="model-tree" ref={tree} role="tree" aria-label="Arbre de la cartographie"><ul role="group">{rootsOf(model).filter(n => !['object','document','event'].includes(n.kind)).map(n => renderNode(n, 1))}</ul></div>}
    <div className="sidebar-bottom"><div className="sidebar-stats"><span id="fa-version" className="model-version" data-version={model.version} title={publicationLabel} aria-label={publicationLabel}><span className={`live-dot ${route.version ? 'fixed' : ''}`} aria-hidden="true"/>Modèle · {revision}</span><span>{model.nodes.length} éléments</span><span>{model.nodes.filter(n => n.kind === 'capability').length} capacités{model.nodes.some(n => n.kind === 'behavior') && <> · {model.nodes.filter(n => n.kind === 'behavior').length} comportements</>}</span></div><img className="beaumanoir-source-logo" src={staticUrl('assets/beaumanoir-original.png')} width="1564" height="605" alt="Groupe Beaumanoir" /></div>
  </aside>;
}
