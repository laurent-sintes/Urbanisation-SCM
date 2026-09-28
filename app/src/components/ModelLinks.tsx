import { createContext, useContext, useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PublishedModel } from '../types';
import type { RouteState } from '../navigation';
import { routeHash, readRoute } from '../navigation';
import { inlineParts, plainInlineText } from '../inlineLinks';
import { publicText } from '../publicText';
import { childrenOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import './glossary.css';

type Kind = 'model' | 'glossary' | 'method';
type LinksContext = { model: PublishedModel | null; metaGlossary?: ModelingGuide['glossary']; route: RouteState; onFollow: (kind: 'model' | 'glossary', id: string, section?: string) => void };
const Context = createContext<LinksContext | null>(null);
export const ModelLinksProvider = Context.Provider;

export function readingOrigin(route: RouteState, version: string) {
  return routeHash({...route,version:route.version ? version : '',scroll:String(Math.round(document.querySelector('.workspace-content')?.scrollTop || 0))});
}

export function CatalogLink({scenario = '',stream,children}:{scenario?:string;stream?:string;children?:ReactNode}) {
  const context=useContext(Context);
  if (!context?.model) return <>{children}</>;
  const route=context.route;
  const returning=!scenario && stream===undefined && !!route.scenario;
  const href=returning && route.catalogReturn && (!readRoute(route.catalogReturn).version || readRoute(route.catalogReturn).version===context.model.version) && route.catalogReturn || routeHash({...route,view:'scenarios',scenario,stream:stream ?? (scenario ? route.stream : ''),path:'',section:'',query:'',scroll:'',returnTo:'',
    catalogReturn:scenario && !route.scenario && route.view==='scenarios' ? readingOrigin({...route,catalogReturn:undefined},context.model.version) : route.catalogReturn});
  return <a href={href} onClick={event => {
    if(scenario && !route.scenario && route.view==='scenarios') {
      event.currentTarget.href=routeHash({...readRoute(href),catalogReturn:readingOrigin({...route,catalogReturn:undefined},context.model!.version)});
    }
  }}>{children || 'Scénarios métier'}</a>;
}

export function ContextReturn() {
  const context=useContext(Context);
  if(!context?.model || !context.route.returnTo) return null;
  const origin=readRoute(context.route.returnTo);
  if(origin.version && origin.version!==context.model.version) return null;
  const label=origin.view==='scenarios' ? (origin.scenario ? 'Retour au scénario' : 'Retour au catalogue') : origin.view==='principles' ? 'Retour à la méthode' : origin.view==='glossary' ? 'Retour au glossaire' : 'Retour à la fiche : '+(context.model.nodeById.get(origin.node)?.name || origin.node);
  return <p className="context-return"><a href={context.route.returnTo}>{label}</a></p>;
}

export function ReferenceLink({ kind = 'model', target, anchor, children, className, showBehaviors = false, fullDefinition = false }: { kind?: Kind; target: string; anchor?: string; children: ReactNode; className?: string; showBehaviors?: boolean; fullDefinition?: boolean }) {
  const context = useContext(Context);
  const model = context?.model;
  const alias = kind !== 'model' ? context?.metaGlossary?.aliases?.[target] : undefined;
  if (alias) { target = alias; kind = 'method'; }

  const method = kind === 'method' ? context?.metaGlossary?.terms.find(term => term.id === target) : undefined;
  const item = kind === 'method' ? method : kind === 'model' ? model?.nodeById.get(target) : model?.glossaryById.get(target);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const link = useRef<HTMLAnchorElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clear = () => clearTimeout(timer.current);
  const hide = () => { clear(); timer.current = setTimeout(() => setOpen(false), 100); };
  const show = () => {
    clear();
    const rect = link.current?.getBoundingClientRect();
    if (rect) setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 348)), top: rect.bottom + 8 });
    setOpen(true);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!open || !tooltip.current || !link.current) return;
    const rect = link.current.getBoundingClientRect();
    const height = tooltip.current.getBoundingClientRect().height;
    const below = rect.bottom + 8;
    setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 348)),
      top: below + height <= window.innerHeight - 8 ? below : Math.max(8, rect.top - height - 8) });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); close(); } };
    window.addEventListener('keydown', escape, true);
    const scroll = () => {
      if (tooltip.current?.matches(':hover')) return;
      if (document.activeElement !== link.current || !tooltip.current || !link.current) { close(); return; }
      const rect = link.current.getBoundingClientRect();
      const height = tooltip.current.getBoundingClientRect().height;
      setPosition({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 348)),
        top: rect.bottom + height + 16 <= window.innerHeight ? rect.bottom + 8 : Math.max(8, rect.top - height - 8) });
    };
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('keydown', escape, true); window.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', close); };
  }, [open]);
  if (!context) return <>{children}</>;
  if (!item || !model) return <span className="unresolved-reference" title={`Référence ${target} absente de cette publication`}>{children}<span className="sr-only"> (référence absente)</span></span>;
  const term = kind === 'glossary' ? model.glossaryById.get(target) : undefined;
  const node = kind === 'model' ? model.nodeById.get(target) : undefined;
  const behaviors = showBehaviors && node?.kind === 'capability' ? childrenOf(model, node.id).filter(child => child.kind === 'behavior') : [];
  const description = plainInlineText(publicText(method?.short_description || method?.definition || ((showBehaviors || fullDefinition) && node ? node.definition : term?.short_description || term?.definition || String(node?.fields.short_description || node?.purpose || node?.definition || 'Description non renseignée.'))));
  const href = routeHash({ ...context.route, node: kind === 'method' ? context.route.node : kind === 'model' ? target : '',
    view: method?.guide_section ? 'principles' : kind === 'model' ? 'sheet' : 'glossary', principle: method?.guide_section || '', glossary: kind === 'method' || context.metaGlossary?.model_term_ids.includes(target) ? 'meta' : 'model', term: method?.guide_section ? '' : kind !== 'model' ? method?.parent_term || target : '', section: anchor || '',
    returnTo: readingOrigin(context.route,model.version), scroll:'', scope: '', relation: '', source: '', anchor: '', sourceId: '', query: '', status: '' });
  return <><a ref={link} className={`model-reference ${className || ''}`} href={href} aria-describedby={open ? id : undefined}
    onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.currentTarget.href=routeHash({...readRoute(href),returnTo:readingOrigin(context.route,model.version)});
      setOpen(false);
    }}>{children}</a>{open && createPortal(<div ref={tooltip} id={id} role="tooltip" className="reference-tooltip" style={{ ...position, maxHeight: 'calc(100vh - 16px)' }} onMouseEnter={clear} onMouseLeave={hide}>
      <strong>{plainInlineText(item.name)}</strong><span>{description}</span>
      {behaviors.length > 0 && <div className="tooltip-behaviors"><b>Comportements</b><ul>{behaviors.map(behavior => <li key={behavior.id}>{behavior.name}</li>)}</ul></div>}
      <small>{node?.displayCode ?? target} · {kind === 'method' ? 'Glossaire méthodologique' : kind === 'glossary' ? 'Glossaire' : 'Fiche du modèle'}</small>
    </div>, document.body)}</>;
}

export function ModelText({ text }: { text: string }) {
  return <>{inlineParts(publicText(text)).map((part, index) => part.kind && part.target
    ? <ReferenceLink key={index} kind={part.kind} target={part.target} anchor={part.anchor}>{part.text}</ReferenceLink>
    : <span key={index}>{part.text}</span>)}</>;
}

/** Contextual methodology links keep the publication and originating sheet. */
export function MethodLink({ term, index, children }: { term?: string; index?: boolean; children: ReactNode }) {
  const context = useContext(Context);
  if (!context?.model) return null;
  if (term && context.metaGlossary?.terms.some(item => item.id === term)) return <ReferenceLink kind="method" target={term} className="method-link">{children}</ReferenceLink>;
  const href = routeHash({ ...context.route, view: term || index ? 'glossary' : 'principles',
    glossary: 'meta', term: term || '', principle: '', section: '', scope: '', query: '', relation: '' });
  return <a className="method-link" href={href}>{children}</a>;
}
export function MethodReturn() {
  const context = useContext(Context);
  if(context?.route.returnTo) return null;
  const node = context?.model?.nodeById.get(context.route.node);
  return node ? <p className="method-return"><ReferenceLink target={node.id}>Retour à la fiche : {node.name}</ReferenceLink></p> : null;
}
