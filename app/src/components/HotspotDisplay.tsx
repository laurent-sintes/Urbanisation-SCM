import {
  autoUpdate,
  FloatingFocusManager,
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
import { Check, Flame, Pause, X } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type FocusEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
  useSyncExternalStore,
} from 'react';
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
function safePadding() {
  const top = document.fullscreenElement
    ? 8
    : Math.max(8, (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) + 8);
  return { top, left: 12, right: 12, bottom: 12 };
}
export function useHotspotFloating(open: boolean, onOpenChange: (open: boolean) => void) {
  const host = useFloatingHost();
  const floating = useFloating({
    open,
    onOpenChange,
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(10),
      flip(() => ({ padding: safePadding() })),
      shift(() => ({ padding: safePadding() })),
      size(() => ({
        padding: safePadding(),
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
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
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tip: ReactNode;
  tooltipClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { refs, floatingStyles, context, host } = useHotspotFloating(open, setOpen);
  const hover = useHover(context, { handleClose: safePolygon(), delay: { open: 120, close: 100 } });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);
  return (
    <>
      <button
        {...getReferenceProps({
          ...props,
          onFocus(event: FocusEvent<HTMLButtonElement>) {
            setOpen(true);
            props.onFocus?.(event);
          },
          onBlur(event: FocusEvent<HTMLButtonElement>) {
            if (!refs.floating.current?.contains(event.relatedTarget)) setOpen(false);
            props.onBlur?.(event);
          },
        })}
        ref={refs.setReference}
        aria-describedby={open ? id : undefined}
      />
      {open && (
        <FloatingPortal root={host}>
          <div {...getFloatingProps()} id={id} ref={refs.setFloating} className={tooltipClass} style={floatingStyles}>
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
  const step = ['to_explore', 'identified', 'qualifying', 'credible'].indexOf(resolution.stage);
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
}: {
  id: string;
  items: Hotspot[];
  x: number;
  y: number;
  model: PublishedModel;
  onOpen: (id: string, groupIds?: string[]) => void;
  onHighlight?: (active: boolean, ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { refs, floatingStyles, context, host } = useHotspotFloating(expanded, setExpanded);
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
          Politique {severityLabel(items[0].complexity.political)} · Implémentation{' '}
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
        <HotspotTooltipButton {...markerProps} tip={tip} onClick={() => onOpen(items[0].id)}>
          <HotspotResolutionGlyph item={items[0]} />
        </HotspotTooltipButton>
      )}
      {expanded && (
        <FloatingPortal root={host}>
          <FloatingFocusManager context={context} modal={false}>
            <div
              {...getFloatingProps()}
              ref={refs.setFloating}
              style={floatingStyles}
              className="hotspot-cluster-popover"
              role="dialog"
              aria-label={title}
            >
              <header>
                <strong>{title}</strong>
                <button type="button" aria-label="Replier le groupe" onClick={() => setExpanded(false)}>
                  <X size={18} />
                </button>
              </header>
              <p>{locations.join(' · ')}</p>
              <div className="hotspot-expanded-grid">
                {items.map((item) => (
                  <div key={item.id} className={`hotspot-expanded-item severity-${item.severity}`}>
                    <HotspotTooltipButton
                      className="hotspot-map-marker"
                      onMouseEnter={() => onHighlight?.(true, [item.id])}
                      onMouseLeave={() => onHighlight?.(false, [])}
                      onFocus={() => onHighlight?.(true, [item.id])}
                      onBlur={() => onHighlight?.(false, [])}
                      aria-label={`${item.title}, criticité ${severityLabel(item.severity)}`}
                      onClick={() => onOpen(item.id)}
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
                          <span>
                            {item.location.node_ids.map((node) => model.nodeById.get(node)?.name || node).join(' · ')}
                          </span>
                        </>
                      }
                    >
                      <HotspotResolutionGlyph item={item} />
                    </HotspotTooltipButton>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="hotspot-group-list"
                onClick={() =>
                  onOpen(
                    '',
                    items.map((item) => item.id),
                  )
                }
              >
                Ouvrir les {items.length} fiches du groupe
              </button>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}

export function HotspotLegend({ count, projections }: { count: number; projections?: number }) {
  return (
    <div className="hotspot-map-legend" role="group" aria-label="Légende des points chauds">
      <span>
        Anneau : 0 / 1 / 2 / 3 jalons — à explorer / pistes / qualification / solution crédible. ✓ : cadrage résolu ;
        pause : bloqué. Anneau discontinu gris : non renseigné.
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
