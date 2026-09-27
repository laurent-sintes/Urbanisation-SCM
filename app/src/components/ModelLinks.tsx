import { createContext, useContext, useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PublishedModel } from '../types';
import type { RouteState } from '../navigation';
import { routeHash } from '../navigation';
import { inlineParts, plainInlineText } from '../inlineLinks';
import { publicText } from '../publicText';
import { childrenOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import './glossary.css';

type Kind = 'model' | 'glossary' | 'method';
type LinksContext = { model: PublishedModel | null; metaGlossary?: ModelingGuide['glossary']; route: RouteState; onFollow: (kind: 'model' | 'glossary', id: string, section?: string) => void };
const Context = createContext<LinksContext | null>(null);
export const ModelLinksProvider = Context.Provider;

export function CatalogLink({scenario = '',stream = '',children}:{scenario?:string;stream?:string;children?:ReactNode}) {
  const context=useContext(Context);
  if (!context?.model) return <>{children}</>;
  return <a href={routeHash({...context.route,version:context.model.version,view:'scenarios',scenario,stream,path:'',section:'',query:'',event:'',object:'',situation:'',capability:'',scenarioQuery:''})}>{children || 'Scénarios métier'}</a>;
}

export function ReferenceLink({ kind = 'model', target, anchor, children, className, showBehaviors = false, fullDefinition = false }: { kind?: Kind; target: string; anchor?: string; children: ReactNode; className?: string; showBehaviors?: boolean; fullDefinition?: boolean }) {
  const context = useContext(Context);
  const model = context?.model;
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
  const href = routeHash({ ...context.route, version: model.version, node: kind === 'method' ? context.route.node : kind === 'model' ? target : '',
    view: kind === 'model' ? 'sheet' : 'glossary', glossary: kind === 'method' ? 'meta' : 'model', term: kind !== 'model' ? target : '', section: anchor || '',
    scope: '', relation: '', source: '', anchor: '', sourceId: '', query: '', status: '' });
  return <><a ref={link} className={`model-reference ${className || ''}`} href={href} aria-describedby={open ? id : undefined}
    onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (kind === 'method') { setOpen(false); return; }
      event.preventDefault(); setOpen(false); context.onFollow(kind, target, anchor);
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
export function MethodLink({ term, children }: { term?: string; children: ReactNode }) {
  const context = useContext(Context);
  if (!context?.model) return null;
  if (term && context.metaGlossary?.terms.some(item => item.id === term)) return <ReferenceLink kind="method" target={term} className="method-link">{children}</ReferenceLink>;
  const href = routeHash({ ...context.route, version: context.model.version, view: term ? 'glossary' : 'principles',
    glossary: 'meta', term: term || '', principle: '', section: '', scope: '', query: '', relation: '' });
  return <a className="method-link" href={href}>{children}</a>;
}
export function MethodReturn() {
  const context = useContext(Context);
  const node = context?.model?.nodeById.get(context.route.node);
  return node ? <p className="method-return"><ReferenceLink target={node.id}>Retour à la fiche : {node.name}</ReferenceLink></p> : null;
}
