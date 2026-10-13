import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  flip,
  offset,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Check, ChevronLeft, ChevronRight, Flame, Info, Pause, X } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { hotspotClusterLayout } from '../hotspotClusterLayout';
import { HOTSPOT_CLUSTER_MOTION_MS, hotspotClusterMotion } from '../hotspotClusterMotion';
import { framingLabel } from '../hotspotFraming';
import { isClosedHotspot, isFramingResolved, RESOLUTION_STAGES, resolutionFor } from '../hotspotResolution';
import type { Hotspot, PublishedModel } from '../types';
import { ModelText } from './ModelLinks';

const STATUS = { discovered: 'Découvert', shared: 'Partagé', validated: 'Sujet validé', resolved: 'Résolu' };
const FLAMES = ['first', 'second', 'third', 'fourth'];
export const severityLabel = (severity: string) => (severity === 'unassessed' ? 'non évaluée' : severity);

function useFloatingHost() {
  const subscribe = useCallback((changed: () => void) => {
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  return useSyncExternalStore(subscribe, () =>
    document.fullscreenElement instanceof HTMLElement ? document.fullscreenElement : document.body,
  );
}

// Portals avoid both map clipping and stacking contexts. Reserve the sticky header's area.
function safePadding(reserveClusterSpace = false) {
  const top = document.fullscreenElement
    ? 8
    : Math.max(8, (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) + 8);
  const heading = reserveClusterSpace
    ? document.querySelector('.hotspot-cluster-popover header')?.getBoundingClientRect()
    : undefined;
  const toolbar =
    reserveClusterSpace && !heading
      ? document.querySelector('.map-toolbar, .universe-toolbar')?.getBoundingClientRect()
      : undefined;
  const footer = reserveClusterSpace
    ? document.querySelector('.hotspot-cluster-pagination')?.getBoundingClientRect()
    : undefined;
  const sidebar = document.querySelector<HTMLElement>('.sidebar');
  const sidebarRight =
    !document.fullscreenElement &&
    sidebar &&
    getComputedStyle(sidebar).visibility === 'visible' &&
    getComputedStyle(sidebar).position !== 'fixed'
      ? sidebar.getBoundingClientRect().right
      : 0;
  return {
    top: Math.max(top, heading ? heading.bottom + 8 : toolbar ? toolbar.bottom + 8 : 0),
    left: Math.max(12, sidebarRight + 12),
    right: 12,
    bottom: footer ? window.innerHeight - footer.top + 8 : 12,
  };
}
export function useHotspotFloating(open: boolean, onOpenChange: (open: boolean) => void, maxHeightRatio?: number) {
  const host = useFloatingHost();
  const floating = useFloating({
    open,
    onOpenChange,
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(10),
      flip(() => ({ padding: safePadding(maxHeightRatio !== undefined) })),
      shift(() => ({ padding: safePadding(maxHeightRatio !== undefined) })),
      size(() => ({
        padding: safePadding(maxHeightRatio !== undefined),
        apply({ availableHeight, elements }) {
          const padding = safePadding(maxHeightRatio !== undefined);
          elements.floating.style.maxWidth = `${Math.max(0, window.innerWidth - padding.left - padding.right)}px`;
          elements.floating.style.maxHeight = `${Math.max(0, Math.min(availableHeight, maxHeightRatio ? window.innerHeight * maxHeightRatio : availableHeight))}px`;
        },
      })),
    ],
    whileElementsMounted: autoUpdate,
  });
  return { ...floating, host };
}

export function HotspotTooltipButton({
  tip,
  tooltipClass = 'hotspot-map-tooltip',
  previewOnTouch = false,
  pinOnClick = false,
  tooltipRoot,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tip: ReactNode;
  tooltipClass?: string;
  previewOnTouch?: boolean;
  pinOnClick?: boolean;
  tooltipRoot?: HTMLElement | null;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const touchPreview = useRef(false);
  const escapeDismissed = useRef(false);
  const [touchHint, setTouchHint] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!pinOnClick) return;
    const closeOtherInfo = (event: Event) => {
      if ((event as CustomEvent<string>).detail === id) return;
      setOpen(false);
      setPinned(false);
    };
    document.addEventListener('atlas-hotspot-info-open', closeOtherInfo);
    return () => document.removeEventListener('atlas-hotspot-info-open', closeOtherInfo);
  }, [pinOnClick, id]);
  useEffect(() => {
    if (pinOnClick && open) document.dispatchEvent(new CustomEvent('atlas-hotspot-info-open', { detail: id }));
  }, [pinOnClick, open, id]);
  const { refs, floatingStyles, context, host } = useHotspotFloating(
    open,
    (next) => {
      setOpen(next);
      if (!next) setPinned(false);
    },
    0.45,
  );
  const hover = useHover(context, { enabled: !pinned, handleClose: safePolygon(), delay: { open: 120, close: 100 } });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);
  return (
    <>
      <button
        {...getReferenceProps({
          ...props,
          onPointerDown(event: PointerEvent<HTMLButtonElement>) {
            touchPreview.current = previewOnTouch && event.pointerType === 'touch' && !open;
            setTouchHint(previewOnTouch && event.pointerType === 'touch');
            props.onPointerDown?.(event);
          },
          onClick(event: MouseEvent<HTMLButtonElement>) {
            escapeDismissed.current = false;
            if (pinOnClick) {
              setPinned(!pinned);
              setOpen(!pinned);
              return;
            }
            if (touchPreview.current) {
              touchPreview.current = false;
              setOpen(true);
              return;
            }
            props.onClick?.(event);
          },
          onFocus(event: FocusEvent<HTMLButtonElement>) {
            if (!escapeDismissed.current) setOpen(true);
            props.onFocus?.(event);
          },
          onBlur(event: FocusEvent<HTMLButtonElement>) {
            escapeDismissed.current = false;
            if (!pinned && !refs.floating.current?.contains(event.relatedTarget)) setOpen(false);
            props.onBlur?.(event);
          },
          onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
            if (event.key === 'Escape') {
              escapeDismissed.current = true;
              setOpen(false);
              setPinned(false);
              event.stopPropagation();
            }
            props.onKeyDown?.(event);
          },
        })}
        ref={refs.setReference}
        aria-describedby={open ? id : undefined}
        aria-expanded={pinOnClick ? open : undefined}
      />
      {open && (
        <FloatingPortal root={tooltipRoot || host}>
          <div {...getFloatingProps()} id={id} ref={refs.setFloating} className={tooltipClass} style={floatingStyles}>
            {touchHint && (
              <span className="hotspot-touch-hint">Touche à nouveau cette pastille pour ouvrir sa fiche.</span>
            )}
            {tip}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function HotspotGlyph({ severity }: { severity: string }) {
  const count = ({ S: 1, M: 2, L: 3, XL: 4 } as Record<string, number>)[severity] || 0;
  return (
    <span className="hotspot-map-flames" aria-hidden="true">
      {count ? FLAMES.slice(0, count).map((id) => <Flame key={id} />) : '·'}
    </span>
  );
}

export function HotspotResolutionGlyph({ item }: { item: Hotspot }) {
  const resolution = resolutionFor(item);
  const step = ['to_explore', 'identified', 'qualifying', 'ready_for_arbitration', 'credible'].indexOf(
    resolution.stage,
  );
  return (
    <>
      <svg className="hotspot-resolution-ring" viewBox="0 0 40 40" aria-hidden="true" data-stage={resolution.stage}>
        {(resolution.stage === 'unassessed' ? [0] : [0, 1, 2]).map((index) => (
          <circle
            key={index}
            cx="20"
            cy="20"
            r="17"
            fill="none"
            strokeWidth="2"
            strokeDasharray="31 76"
            transform={`rotate(${index * 120 - 85} 20 20)`}
            className={step > index ? 'is-complete' : ''}
          />
        ))}
      </svg>
      {isFramingResolved(item) ? (
        <Check className="hotspot-resolved-check" aria-hidden="true" />
      ) : (
        <HotspotGlyph severity={item.severity} />
      )}
      {resolution.blocked_reason.trim() && <Pause className="hotspot-blocked-symbol" aria-hidden="true" />}
    </>
  );
}

export function HotspotMapMarker({
  id,
  items,
  x,
  y,
  model,
  onOpen,
  onHighlight,
  onExpansionChange,
}: {
  id: string;
  items: Hotspot[];
  x: number;
  y: number;
  model: PublishedModel;
  onOpen: (id: string, groupIds?: string[]) => void;
  onHighlight?: (active: boolean, ids: string[]) => void;
  onExpansionChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [returnDuration, setReturnDuration] = useState(HOTSPOT_CLUSTER_MOTION_MS);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);
  const motion = useRef<Animation[]>([]);
  const closeGeneration = useRef(0);
  const [page, setPage] = useState(0);
  const pendingPageFocus = useRef<number | null>(null);
  const returnScope = useRef<{ reference: HTMLElement; scope: HTMLElement; ids: string[] } | null>(null);
  const host = useFloatingHost();
  const finishGroup = useCallback(
    (open: boolean) => {
      closingRef.current = false;
      setClosing(false);
      setExpanded(open);
      onExpansionChange?.(open);
      if (open) setPage(0);
      if (!open) {
        onHighlight?.(false, []);
        const origin = returnScope.current;
        requestAnimationFrame(() => {
          if (!origin?.scope.isConnected || document.querySelector('.hotspot-cluster-popover')) return;
          const panel = origin.scope.closest<HTMLElement>('.map-panel, .universe-overview') || origin.scope;
          let restored: HTMLElement | undefined;
          const restore = () => {
            if (!panel.isConnected || document.querySelector('.hotspot-cluster-popover')) return;
            if (![document.body, origin.reference, restored].includes(document.activeElement as HTMLElement)) return;
            const target = origin.reference.isConnected
              ? origin.reference
              : [...panel.querySelectorAll<HTMLElement>('[data-hotspot-ids]')].find((button) =>
                  button.dataset.hotspotIds?.split('|').some((member) => origin.ids.includes(member)),
                ) || panel.querySelector<HTMLButtonElement>('.detail-trigger');
            if (!target || target === document.activeElement) return;
            restored = target;
            target.focus({ preventScroll: true });
          };
          // Reframing can replace the marker after closing. Follow that replacement without stealing a new user focus.
          const observer = new MutationObserver(restore);
          observer.observe(panel, { childList: true, subtree: true });
          restore();
          setTimeout(() => observer.disconnect(), 1000);
        });
      }
    },
    [onHighlight, onExpansionChange],
  );
  const requestClose = useCallback(
    (afterClose?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      setClosing(true);
      const generation = ++closeGeneration.current;
      const complete = () => {
        if (closeGeneration.current !== generation) return;
        closeGeneration.current++;
        finishGroup(false);
        afterClose?.();
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !motion.current.length) {
        complete();
        return;
      }
      const animations = [...motion.current];
      const remaining = Math.max(1, ...animations.map((animation) => Number(animation.currentTime) || 0));
      setReturnDuration(remaining);
      for (const animation of animations) animation.reverse();
      const overlay = overlayRef.current;
      if (overlay) {
        animations.push(
          overlay.animate(
            [{ backgroundColor: getComputedStyle(overlay).backgroundColor }, { backgroundColor: 'rgb(13 35 38 / 0)' }],
            { duration: remaining, easing: 'ease-out', fill: 'forwards' },
          ),
        );
      }
      // Keep the modal and the frozen map alive until the pastilles have returned.
      // A bounded fallback also releases them if a browser interrupts an animation.
      const timeout = setTimeout(complete, remaining + 80);
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        clearTimeout(timeout);
        complete();
      });
    },
    [finishGroup],
  );
  const closeGroup = useCallback(
    (open: boolean) => {
      if (open) {
        if (!closingRef.current) finishGroup(true);
      } else requestClose();
    },
    [finishGroup, requestClose],
  );
  useEffect(
    () => () => {
      closeGeneration.current++;
    },
    [],
  );
  useEffect(() => {
    if (!expanded) return;
    return () => onExpansionChange?.(false);
  }, [expanded, onExpansionChange]);
  const { refs, context, elements } = useFloating({ open: expanded, onOpenChange: closeGroup });
  useEffect(() => {
    if (expanded && items.length < 2) closeGroup(false);
  }, [expanded, items.length, closeGroup]);
  const memberIds = items.map((item) => item.id).join('|');
  const [geometry, setGeometry] = useState(() => ({
    anchor: { x: 0, y: 0 },
    width: 0,
    height: 0,
    top: 0,
    headingHeight: 64,
  }));
  useLayoutEffect(() => {
    if (!expanded) return;
    const origin = refs.domReference.current;
    const scope = origin?.closest<HTMLElement>('.universe-overview, .graph-canvas');
    if (origin instanceof HTMLElement && scope)
      returnScope.current = { reference: origin, scope, ids: memberIds.split('|') };
    const floating = elements.floating;
    const update = () => {
      const rect = refs.domReference.current?.getBoundingClientRect();
      if (!rect) return;
      const height = Math.max(280, host === document.body ? window.innerHeight : host.clientHeight);
      const next = {
        anchor: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        width: host === document.body ? document.documentElement.clientWidth : host.clientWidth,
        height,
        top: height <= 420 ? 8 : safePadding().top,
        headingHeight: floating?.querySelector('header')?.getBoundingClientRect().height || 64,
      };
      setGeometry((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };
    update();
    const reference = refs.domReference.current;
    const cleanup = reference && floating ? autoUpdate(reference, floating, update) : undefined;
    const observer = new ResizeObserver(update);
    const heading = floating?.querySelector('header');
    if (heading) observer.observe(heading);
    return () => {
      cleanup?.();
      observer.disconnect();
    };
  }, [expanded, refs.domReference, elements.floating, host, memberIds]);
  const fullLayout = hotspotClusterLayout(
    items.length,
    geometry.anchor,
    geometry.width,
    geometry.height,
    geometry.top,
    geometry.headingHeight,
  );
  const pageCount = Math.max(1, Math.ceil(items.length / fullLayout.capacity));
  const activePage = Math.min(page, pageCount - 1);
  const visibleItems = items.slice(activePage * fullLayout.capacity, (activePage + 1) * fullLayout.capacity);
  const layout = hotspotClusterLayout(
    visibleItems.length,
    fullLayout.center,
    geometry.width,
    geometry.height,
    geometry.top,
    geometry.headingHeight,
    fullLayout.footerReserve,
  );
  const motionGeometry = JSON.stringify({
    anchor: geometry.anchor,
    center: layout.center,
    points: layout.points,
    ids: visibleItems.map((item) => item.id),
  });
  useLayoutEffect(() => {
    const floating = elements.floating;
    if (!expanded || !floating || !geometry.width || closingRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const positions = JSON.parse(motionGeometry) as {
      anchor: { x: number; y: number };
      center: { x: number; y: number };
      points: { x: number; y: number }[];
    };
    motion.current = [...floating.querySelectorAll<HTMLElement>('.hotspot-expanded-item')].map((element, index) =>
      element.animate(hotspotClusterMotion(positions.anchor, positions.center, positions.points[index]), {
        duration: HOTSPOT_CLUSTER_MOTION_MS,
        easing: 'cubic-bezier(0.2, 0.65, 0.25, 1)',
        fill: 'both',
      }),
    );
    const animations = motion.current;
    return () => {
      for (const animation of animations) animation.cancel();
      motion.current = [];
    };
  }, [expanded, elements.floating, geometry.width, motionGeometry]);
  useLayoutEffect(() => {
    if (pendingPageFocus.current !== activePage) return;
    pendingPageFocus.current = null;
    refs.floating.current?.querySelector<HTMLButtonElement>('.hotspot-expanded-item')?.focus({ preventScroll: true });
  }, [activePage, refs.floating]);
  const changePage = (next: number, keyboard = false) => {
    if (closingRef.current) return;
    if (next < 0 || next >= pageCount || next === activePage) return;
    pendingPageFocus.current = keyboard ? next : null;
    setPage(next);
  };
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  if (!items.length) return null;
  const openItems = items.filter((item) => !isClosedHotspot(item));
  const severityItems = openItems.length ? openItems : items;
  const severity =
    ['XL', 'L', 'M', 'S', 'unassessed'].find((level) => severityItems.some((item) => item.severity === level)) ||
    'unassessed';
  const grouped = items.length > 1;
  const title = grouped ? `${items.length} points chauds regroupés` : items[0].title;
  const locations = [
    ...new Set(items.flatMap((item) => item.location.node_ids).map((node) => model.nodeById.get(node)?.name || node)),
  ];
  const tip = (
    <>
      <strong>{title}</strong>
      {!grouped && (
        <span className="hotspot-tooltip-summary">
          <ModelText text={items[0].problem} />
        </span>
      )}
      {!grouped && items[0].gap_analysis?.[0]?.convergence_question && (
        <span>
          <strong>À arbitrer : </strong>
          <ModelText text={items[0].gap_analysis[0].convergence_question} />
        </span>
      )}
      {!grouped && <span>{framingLabel(items[0])}</span>}
      <span>
        Criticité {grouped ? 'maximale ' : ''}
        {severityLabel(severity)}
      </span>
      <span>{locations.join(' · ')}</span>
      {!grouped && (
        <span>
          {items[0].kind === 'integration' ? 'Intégration' : 'Périmètre'} · {STATUS[items[0].status]}
          {items[0].workshop ? ' · Atelier' : ''}
        </span>
      )}
      {!grouped && (
        <span>
          Arbitrage {severityLabel(items[0].complexity.arbitration)} · Implémentation{' '}
          {severityLabel(items[0].complexity.implementation)}
        </span>
      )}
      {!grouped && (
        <span>
          {RESOLUTION_STAGES[resolutionFor(items[0]).stage]}
          {resolutionFor(items[0]).blocked_reason ? ` · Bloqué : ${resolutionFor(items[0]).blocked_reason}` : ''}
        </span>
      )}
      {grouped && (
        <span>
          {openItems.length} ouverts / {items.length} au total
        </span>
      )}
      {grouped && <span>Cliquer pour déployer les points de ce groupe.</span>}
    </>
  );
  const markerProps = {
    type: 'button' as const,
    className: 'hotspot-map-marker',
    'data-id': `hotspot:${id}`,
    'data-hotspot-ids': items.map((item) => item.id).join('|'),
    'aria-label': `${title}, criticité ${grouped ? 'maximale ' : ''}${severityLabel(severity)}${grouped ? `, ${openItems.length} ouverts sur ${items.length}. Déployer le groupe.` : `, ${RESOLUTION_STAGES[resolutionFor(items[0]).stage]}${resolutionFor(items[0]).blocked_reason ? ', bloqué' : ''}`}`,
    onMouseEnter: () =>
      onHighlight?.(
        true,
        items.map((item) => item.id),
      ),
    onMouseLeave: () => onHighlight?.(false, []),
    onFocus: () =>
      onHighlight?.(
        true,
        items.map((item) => item.id),
      ),
    onBlur: () => onHighlight?.(false, []),
  };
  return (
    <div
      className={`hotspot-map-point severity-${severity}${!openItems.length ? ' is-framing-closed' : ''}${items.some((item) => item.workshop) ? ' is-workshop' : ''}${expanded ? ' is-expanded' : ''}`}
      style={{ left: x, top: y }}
    >
      <span className="hotspot-map-halo" aria-hidden="true" />
      {grouped ? (
        <button {...getReferenceProps(markerProps)} ref={refs.setReference} aria-expanded={expanded}>
          {openItems.length ? <HotspotGlyph severity={severity} /> : <HotspotResolutionGlyph item={items[0]} />}
          <span className="hotspot-map-count">
            {openItems.length === items.length ? items.length : `${openItems.length}/${items.length}`}
          </span>
        </button>
      ) : (
        <button {...markerProps} onClick={() => onOpen(items[0].id)}>
          <HotspotResolutionGlyph item={items[0]} />
        </button>
      )}
      <HotspotTooltipButton pinOnClick className="hotspot-info-button" aria-label={`Résumé de ${title}`} tip={tip}>
        <Info size={16} aria-hidden="true" />
      </HotspotTooltipButton>
      {expanded && (
        <FloatingPortal root={host}>
          <FloatingOverlay
            ref={overlayRef}
            lockScroll
            className="hotspot-cluster-backdrop"
            data-closing={closing}
            style={{ '--cluster-return-duration': `${returnDuration}ms` } as CSSProperties}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeGroup(false);
            }}
          >
            <FloatingFocusManager context={context} outsideElementsInert restoreFocus closeOnFocusOut={false}>
              <div
                {...getFloatingProps()}
                ref={refs.setFloating}
                style={{ '--cluster-top': `${geometry.top}px` } as CSSProperties}
                className="hotspot-cluster-popover"
                data-closing={closing}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                data-layout-width={geometry.width}
                data-layout-height={geometry.height}
                data-layout-top={geometry.top}
                data-layout-heading-height={geometry.headingHeight}
                onKeyDownCapture={(event) => {
                  if (closingRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    closeGroup(false);
                  } else if (
                    ['PageUp', 'PageDown'].includes(event.key) &&
                    !(event.target instanceof HTMLElement && event.target.closest('.hotspot-map-tooltip'))
                  ) {
                    event.preventDefault();
                    changePage(activePage + (event.key === 'PageDown' ? 1 : -1), true);
                  }
                }}
              >
                <header>
                  <div>
                    <strong>{title}</strong>
                    <p>Choisis un point · Échap ou clic hors des points pour fermer</p>
                  </div>
                  <button type="button" aria-label="Replier le groupe" onClick={() => closeGroup(false)}>
                    <X size={18} />
                  </button>
                </header>
                <span
                  className="hotspot-cluster-center"
                  aria-hidden="true"
                  style={{
                    left: layout.center.x,
                    top: layout.center.y,
                    width: layout.centerSize,
                    height: layout.centerSize,
                  }}
                  data-compact={layout.centerSize < 60}
                >
                  {layout.centerSize > 6 && items.length}
                  {layout.centerSize >= 60 && <small>points</small>}
                </span>
                <div
                  className="hotspot-expanded-grid"
                  role="group"
                  aria-label="Points chauds du groupe"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) closeGroup(false);
                  }}
                  onKeyDown={(event) => {
                    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                    const buttons = Array.from(
                      event.currentTarget.querySelectorAll<HTMLButtonElement>('.hotspot-expanded-item'),
                    );
                    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                    if (index < 0) return;
                    event.preventDefault();
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? buttons.length - 1
                          : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) %
                            buttons.length;
                    buttons[next]?.focus();
                  }}
                >
                  {visibleItems.map((item, index) => {
                    const point = layout.points[index];
                    const style = point
                      ? ({
                          left: point.x - layout.itemSize / 2,
                          top: point.y - layout.itemSize / 2,
                          width: layout.itemSize,
                          height: layout.itemSize,
                        } as CSSProperties)
                      : undefined;
                    return (
                      <Fragment key={item.id}>
                        <button
                          type="button"
                          className={`hotspot-expanded-item severity-${item.severity}${item.workshop ? ' is-workshop' : ''}${isClosedHotspot(item) ? ' is-framing-closed' : ''}`}
                          style={style}
                          onMouseEnter={() => onHighlight?.(true, [item.id])}
                          onMouseLeave={() => onHighlight?.(false, [])}
                          onFocus={() => onHighlight?.(true, [item.id])}
                          onBlur={() => onHighlight?.(false, [])}
                          aria-label={`${item.title}, criticité ${severityLabel(item.severity)}, ${RESOLUTION_STAGES[resolutionFor(item).stage]}${resolutionFor(item).blocked_reason ? ', bloqué' : ''}`}
                          onClick={() => {
                            requestClose(() => onOpen(item.id));
                          }}
                        >
                          <span className="hotspot-map-marker" aria-hidden="true">
                            <HotspotResolutionGlyph item={item} />
                          </span>
                        </button>
                        <HotspotTooltipButton
                          pinOnClick
                          tooltipRoot={elements.floating}
                          className="hotspot-info-button hotspot-expanded-info"
                          style={point ? { left: point.x + 5, top: point.y + 5 } : undefined}
                          aria-label={`Résumé de ${item.title}`}
                          tip={
                            <>
                              <strong>{item.title}</strong>
                              <span>
                                <ModelText text={item.problem} />
                              </span>
                              {item.gap_analysis?.[0]?.convergence_question && (
                                <span>
                                  À arbitrer : <ModelText text={item.gap_analysis[0].convergence_question} />
                                </span>
                              )}
                              <span>{framingLabel(item)}</span>
                              <span>
                                {STATUS[item.status]} · {RESOLUTION_STAGES[resolutionFor(item).stage]} · Criticité{' '}
                                {severityLabel(item.severity)}
                              </span>
                              {resolutionFor(item).blocked_reason && (
                                <span>Bloqué : {resolutionFor(item).blocked_reason}</span>
                              )}
                              <span>
                                {item.location.node_ids
                                  .map((node) => model.nodeById.get(node)?.name || node)
                                  .join(' · ')}
                              </span>
                            </>
                          }
                        >
                          <Info size={16} aria-hidden="true" />
                        </HotspotTooltipButton>
                      </Fragment>
                    );
                  })}
                </div>
                {pageCount > 1 && (
                  <div className="hotspot-cluster-pagination" role="group" aria-label="Parcourir les pastilles">
                    <button
                      type="button"
                      aria-label="Pastilles précédentes"
                      disabled={activePage === 0}
                      onClick={(event) => changePage(activePage - 1, event.detail === 0)}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span role="status" aria-live="polite" aria-atomic="true">
                      <span aria-hidden="true">
                        {activePage + 1} / {pageCount}
                      </span>
                      <span className="sr-only">
                        Page {activePage + 1} sur {pageCount}, pastilles {activePage * fullLayout.capacity + 1} à{' '}
                        {Math.min(items.length, (activePage + 1) * fullLayout.capacity)} sur {items.length}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Pastilles suivantes"
                      disabled={activePage === pageCount - 1}
                      onClick={(event) => changePage(activePage + 1, event.detail === 0)}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </div>
  );
}

export function HotspotLegend({ count, projections }: { count: number; projections?: number }) {
  return (
    <div className="hotspot-map-legend" role="group" aria-label="Légende des points chauds">
      <span>
        Anneau : à explorer / pistes / qualification / option à arbitrer / solution crédible. ✓ : cadrage résolu ; pause
        : bloqué. Anneau discontinu gris : non renseigné.
      </span>
      <span>Criticité</span>
      {['S', 'M', 'L', 'XL', 'unassessed'].map((severity) => (
        <span key={severity} className={`hotspot-legend-level severity-${severity}`}>
          <i aria-hidden="true" />
          {severityLabel(severity)}
        </span>
      ))}
      <span>
        {count} fiche{count > 1 ? 's' : ''}
        {projections !== undefined && projections !== count
          ? ` · ${projections} repères (un point peut concerner plusieurs systèmes)`
          : ''}
      </span>
    </div>
  );
}
