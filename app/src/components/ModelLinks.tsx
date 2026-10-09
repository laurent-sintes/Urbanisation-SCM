import { autoUpdate, FloatingPortal, flip, offset, shift, useFloating } from '@floating-ui/react';
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { inlineParts, plainInlineText } from '../inlineLinks';
import { childrenOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import type { RouteState } from '../navigation';
import { readRoute, routeHash } from '../navigation';
import { publicText } from '../publicText';
import type { AtlasNode, PublishedModel } from '../types';
import './glossary.css';
import { resolveGlossaryTerm } from '../glossary';
import { kindLabel } from '../presentation';

type Kind = 'model' | 'glossary' | 'method' | 'guide';
type LinksContext = {
  model: PublishedModel | null;
  metaGlossary?: ModelingGuide['glossary'];
  metaGuide?: ModelingGuide;
  guide?: ModelingGuide;
  route: RouteState;
  onFollow: (kind: 'model' | 'glossary', id: string, section?: string) => void;
};
const Context = createContext<LinksContext | null>(null);
export const ModelLinksProvider = Context.Provider;

function useTooltipHost(open: boolean): Element {
  const subscribe = useCallback(
    (changed: () => void) => {
      if (!open) return () => {};
      document.addEventListener('fullscreenchange', changed);
      return () => document.removeEventListener('fullscreenchange', changed);
    },
    [open],
  );
  return useSyncExternalStore(subscribe, () => document.fullscreenElement || document.body);
}

/** Position a short help bubble and close it on navigation gestures. */
function useAnchoredTooltip<T extends HTMLElement>() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const host = useTooltipHost(open);
  const { refs, floatingStyles } = useFloating<T>({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const reference = refs.domReference;
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      close();
      (reference.current as HTMLElement | null)?.focus();
    };
    window.addEventListener('keydown', onEscape, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onEscape, true);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open, reference]);
  return { id, anchor: refs.setReference, tooltip: refs.setFloating, open, setOpen, host, position: floatingStyles };
}

export function readingOrigin(route: RouteState, version: string) {
  return routeHash({
    ...route,
    version: route.version ? version : '',
    scroll: String(Math.round(document.querySelector('.workspace-content')?.scrollTop || 0)),
  });
}

export function CatalogLink({
  scenario = '',
  stream,
  children,
}: {
  scenario?: string;
  stream?: string;
  children?: ReactNode;
}) {
  const context = useContext(Context);
  if (!context?.model) return <>{children}</>;
  const model = context.model;
  const route = context.route;
  const returning = !scenario && stream === undefined && !!route.scenario;
  const href =
    (returning &&
      route.catalogReturn &&
      (!readRoute(route.catalogReturn).version || readRoute(route.catalogReturn).version === context.model.version) &&
      route.catalogReturn) ||
    routeHash({
      ...route,
      view: 'scenarios',
      scenario,
      stream: stream ?? (scenario ? route.stream : ''),
      path: '',
      section: '',
      query: '',
      scroll: '',
      returnTo: '',
      catalogReturn:
        scenario && !route.scenario && route.view === 'scenarios'
          ? readingOrigin({ ...route, catalogReturn: undefined }, context.model.version)
          : route.catalogReturn,
    });
  return (
    <a
      href={href}
      onClick={(event) => {
        if (scenario && !route.scenario && route.view === 'scenarios') {
          event.currentTarget.href = routeHash({
            ...readRoute(href),
            catalogReturn: readingOrigin({ ...route, catalogReturn: undefined }, model.version),
          });
        }
      }}
    >
      {children || 'Scénarios métier'}
    </a>
  );
}

export function ContextReturn() {
  const context = useContext(Context);
  if (!context?.model || !context.route.returnTo) return null;
  const origin = readRoute(context.route.returnTo);
  if (origin.version && origin.version !== context.model.version) return null;
  const label =
    origin.view === 'scenarios'
      ? origin.scenario
        ? 'Retour au scénario'
        : 'Retour au catalogue'
      : origin.view === 'metamodel'
        ? 'Retour au métamodèle'
        : origin.view === 'principles'
          ? context.metaGuide
            ? 'Retour à la transformation'
            : 'Retour à la méthode'
          : origin.view === 'glossary'
            ? 'Retour au glossaire'
            : `Retour à la fiche : ${context.model.nodeById.get(origin.node)?.name || origin.node}`;
  return (
    <p className="context-return">
      <a href={context.route.returnTo}>{label}</a>
    </p>
  );
}

const metamodelTermNames: Record<string, string> = {
  universe: 'Enterprise Architecture',
  business_system: 'Business System',
  domain: 'Domain',
  area: 'Subdomain',
  business_area: 'Business Area',
  capability: 'Capability',
  behavior: 'Capability Behavior',
  reference: 'Business Reference',
};

/** Explain the type from the selected publication, on hover and keyboard focus. */
export function MetaTypeLabel({ node }: { node: AtlasNode }) {
  const context = useContext(Context);
  const { id, anchor, tooltip, open, setOpen, host, position } = useAnchoredTooltip<HTMLButtonElement>();
  const historicalArea = node.kind === 'area' && node.hierarchyLabel !== 'Sous-domaine';
  const published = historicalArea
    ? undefined
    : context?.model?.raw.metamodel?.node_types?.find((type) => type.kind === node.kind);
  const methodName =
    node.kind === 'universe' && node.name !== 'Enterprise Architecture' ? node.name : metamodelTermNames[node.kind];
  const fallback = historicalArea ? undefined : context?.metaGlossary?.terms.find((term) => term.name === methodName);
  const definition = published?.definition || fallback?.short_description || fallback?.definition;
  const label = kindLabel(node);
  return (
    <>
      {definition ? (
        <button
          type="button"
          ref={anchor}
          className="metamodel-type"
          aria-label={`Définition du type ${label}`}
          aria-describedby={open ? id : undefined}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
        >
          {label}
        </button>
      ) : (
        <span>{label}</span>
      )}
      {open && definition && (
        <FloatingPortal root={host as HTMLElement}>
          <div ref={tooltip} id={id} role="tooltip" className="reference-tooltip metamodel-tooltip" style={position}>
            <strong>{label}</strong>
            <span>{plainInlineText(publicText(definition))}</span>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

/** A map item remains a map navigation button while exposing its published description. */
export function MapNodeButton({
  node,
  children,
  onClick,
  className,
  selected,
  itemId,
}: {
  node: AtlasNode;
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  selected?: boolean;
  itemId?: string;
}) {
  const { id, anchor, tooltip, open, setOpen, host, position } = useAnchoredTooltip<HTMLButtonElement>();
  const description = plainInlineText(
    publicText(node.purpose || node.definition || 'Description non renseignée dans cette publication.'),
  );
  return (
    <>
      <button
        type="button"
        ref={anchor}
        className={className}
        data-map-item-id={itemId}
        aria-current={selected ? 'true' : undefined}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          setOpen(false);
          onClick(event);
        }}
      >
        {children}
      </button>
      {open && (
        <FloatingPortal root={host as HTMLElement}>
          <div ref={tooltip} id={id} role="tooltip" className="reference-tooltip map-node-tooltip" style={position}>
            <strong>{node.name}</strong>
            <span>{description}</span>
            <small>{kindLabel(node)}</small>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function ReferenceLink({
  kind = 'model',
  target,
  anchor,
  children,
  className,
  showBehaviors = false,
  fullDefinition = false,
}: {
  kind?: Kind;
  target: string;
  anchor?: string;
  children: ReactNode;
  className?: string;
  showBehaviors?: boolean;
  fullDefinition?: boolean;
}) {
  const context = useContext(Context);
  const model = context?.model;
  const alias = kind !== 'model' ? context?.metaGlossary?.aliases?.[target] : undefined;
  if (alias) {
    target = alias;
    kind = 'method';
  }
  if (kind === 'glossary' && model) target = resolveGlossaryTerm(model.glossaryById, target)?.id || target;

  const metaTerm = kind === 'method' ? context?.metaGlossary?.terms.find((term) => term.id === target) : undefined;
  const method =
    metaTerm || (kind === 'method' ? context?.guide?.glossary?.terms.find((term) => term.id === target) : undefined);
  const metaChapter = kind === 'guide' ? context?.metaGuide?.chapters?.find((item) => item.id === target) : undefined;
  const chapter =
    metaChapter || (kind === 'guide' ? context?.guide?.chapters?.find((item) => item.id === target) : undefined);
  const sectionIndex = /^method-section-(\d+)$/.exec(anchor || '')?.[1];
  const notice = chapter && sectionIndex !== undefined ? chapter.sections[Number(sectionIndex)] : undefined;
  const guideItem = notice
    ? { name: notice.title, definition: notice.text }
    : chapter && !anchor
      ? { name: chapter.title, definition: chapter.intro }
      : undefined;
  const item =
    kind === 'guide'
      ? guideItem
      : kind === 'method'
        ? method
        : kind === 'model'
          ? model?.nodeById.get(target)
          : model?.glossaryById.get(target);
  const id = useId();
  const [open, setOpen] = useState(false);
  const tooltipHost = useTooltipHost(open);
  const { refs, floatingStyles } = useFloating<HTMLAnchorElement>({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const link = useRef<HTMLAnchorElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const setLink = useCallback(
    (node: HTMLAnchorElement | null) => {
      link.current = node;
      refs.setReference(node);
    },
    [refs.setReference],
  );
  const setTooltip = useCallback(
    (node: HTMLDivElement | null) => {
      tooltip.current = node;
      refs.setFloating(node);
    },
    [refs.setFloating],
  );
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dismissed = useRef(false);
  const clear = useCallback(() => clearTimeout(timer.current), []);
  const hide = () => {
    clear();
    timer.current = setTimeout(() => setOpen(false), 100);
  };
  const show = () => {
    clear();
    if (dismissed.current) return;
    setOpen(true);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // Install before paint: a visible tooltip must already respond to Escape.
    // Keep it dismissed until a new intentional focus/hover interaction.
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissed.current = true;
        clear();
        event.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onEscape, true);
    const scroll = () => {
      if (tooltip.current?.matches(':hover')) return;
      if (document.activeElement !== link.current) close();
    };
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onEscape, true);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open, clear]);
  if (!context) return <>{children}</>;
  if (!item || !model)
    return (
      <span className="unresolved-reference" title={`Référence ${target} absente de cette publication`}>
        {children}
        <span className="sr-only"> (référence absente)</span>
      </span>
    );
  const term = kind === 'glossary' ? model.glossaryById.get(target) : undefined;
  const node = kind === 'model' ? model.nodeById.get(target) : undefined;
  const behaviors =
    showBehaviors && node?.kind === 'capability'
      ? childrenOf(model, node.id).filter((child) => child.kind === 'behavior')
      : [];
  const description = plainInlineText(
    publicText(
      guideItem?.definition ||
        method?.short_description ||
        method?.definition ||
        ((showBehaviors || fullDefinition) && node
          ? node.definition
          : term?.short_description ||
            term?.definition ||
            String(
              node?.fields.short_description || node?.purpose || node?.definition || 'Description non renseignée.',
            )),
    ),
  );
  const href = routeHash({
    ...context.route,
    node: kind === 'method' ? context.route.node : kind === 'model' ? target : '',
    view:
      kind === 'guide' || method?.guide_section || term?.guide_section
        ? context.metaGuide && (metaChapter || metaTerm)
          ? 'metamodel'
          : 'principles'
        : kind === 'model'
          ? 'sheet'
          : 'glossary',
    principle: kind === 'guide' ? target : method?.guide_section || term?.guide_section || '',
    glossary:
      kind === 'method'
        ? metaTerm
          ? 'meta'
          : 'transformation'
        : context.metaGlossary?.model_term_ids.includes(target)
          ? 'meta'
          : 'model',
    term:
      kind === 'guide' || method?.guide_section || term?.guide_section
        ? ''
        : kind !== 'model'
          ? method?.parent_term || target
          : '',
    section: anchor || '',
    returnTo: readingOrigin(context.route, model.version),
    scroll: '',
    scope: '',
    relation: '',
    source: '',
    anchor: '',
    sourceId: '',
    query: '',
    status: '',
  });
  return (
    <>
      <a
        ref={setLink}
        className={`model-reference ${className || ''}`}
        href={href}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={() => {
          dismissed.current = false;
          hide();
        }}
        onFocus={() => {
          dismissed.current = false;
          show();
        }}
        onBlur={() => {
          dismissed.current = false;
          hide();
        }}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.currentTarget.href = routeHash({
            ...readRoute(href),
            returnTo: readingOrigin(context.route, model.version),
          });
          setOpen(false);
        }}
      >
        {children}
      </a>
      {open && (
        <FloatingPortal root={tooltipHost as HTMLElement}>
          <div
            ref={setTooltip}
            id={id}
            role="tooltip"
            className="reference-tooltip"
            style={{ ...floatingStyles, maxHeight: 'calc(100vh - 16px)' }}
            onMouseEnter={clear}
            onMouseLeave={hide}
          >
            <strong>{plainInlineText(item.name)}</strong>
            <span>{description}</span>
            {behaviors.length > 0 && (
              <div className="tooltip-behaviors">
                <b>Comportements</b>
                <ul>
                  {behaviors.map((behavior) => (
                    <li key={behavior.id}>{behavior.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <small>
              {node?.displayCode ?? target} ·{' '}
              {kind === 'guide'
                ? 'Référence méthodologique'
                : kind === 'method'
                  ? 'Glossaire méthodologique'
                  : kind === 'glossary'
                    ? 'Glossaire'
                    : 'Fiche du modèle'}
            </small>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function ModelText({ text }: { text: string }) {
  let offset = 0;
  return (
    <>
      {inlineParts(publicText(text)).map((part) => {
        const key = `${offset}:${part.kind || 'text'}:${part.target || ''}`;
        offset += part.text.length + 1;
        return part.kind && part.target ? (
          <ReferenceLink key={key} kind={part.kind} target={part.target} anchor={part.anchor}>
            {part.text}
          </ReferenceLink>
        ) : (
          <span key={key}>{part.text}</span>
        );
      })}
    </>
  );
}

/** Contextual methodology links keep the publication and originating sheet. */
export function MethodLink({ term, index, children }: { term?: string; index?: boolean; children: ReactNode }) {
  const context = useContext(Context);
  if (!context?.model) return null;
  if (
    term &&
    (context.metaGlossary?.terms.some((item) => item.id === term) ||
      context.guide?.glossary?.terms.some((item) => item.id === term))
  )
    return (
      <ReferenceLink kind="method" target={term} className="method-link">
        {children}
      </ReferenceLink>
    );
  const owner = context.route.view === 'principles' && context.metaGuide ? 'transformation' : 'meta';
  const href = routeHash({
    ...context.route,
    view: term || index ? 'glossary' : owner === 'meta' ? 'metamodel' : 'principles',
    glossary: owner,
    term: term || '',
    principle: '',
    section: '',
    scope: '',
    query: '',
    relation: '',
  });
  return (
    <a className="method-link" href={href}>
      {children}
    </a>
  );
}
export function MethodReturn() {
  const context = useContext(Context);
  if (context?.route.returnTo) return null;
  const node = context?.model?.nodeById.get(context.route.node);
  return node ? (
    <p className="method-return">
      <ReferenceLink target={node.id}>Retour à la fiche : {node.name}</ReferenceLink>
    </p>
  ) : null;
}
