import { ChevronDown, ChevronUp, Map as MapIcon } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { MapZoomChoice } from '../mapZoom';
import { ui } from '../ui.ts';
import './catalogue-navigator.css';

export interface CatalogueNavigatorProps {
  viewportRef: RefObject<HTMLElement | null>;
  /** Publication, scope, detail and framing may be combined here; geometry is still read from the DOM. */
  geometryKey?: string | number;
  framing?: MapZoomChoice;
  label?: string;
  className?: string;
}

interface Block {
  id: string;
  label: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
}
interface Geometry {
  width: number;
  height: number;
  left: number;
  top: number;
  visibleWidth: number;
  visibleHeight: number;
  stageHeight: number;
  blocks: Block[];
}

const BLOCKS_SELECTOR =
  '.business-card[data-node-id], .overview-system[data-node-id], .overview-domain-link[data-map-item-id], .overview-subdomain-link[data-map-item-id]';
const CONTENT_SELECTOR =
  '.graph-canvas, .map-flow-surface, .react-flow__viewport, .overview-map-frame, .urbanisation-overview';
const MAJOR_KINDS = new Set(['business_system', 'domain', 'area', 'group']);
const EMPTY: Geometry = {
  width: 1,
  height: 1,
  left: 0,
  top: 0,
  visibleWidth: 1,
  visibleHeight: 1,
  stageHeight: 1,
  blocks: [],
};
const rounded = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, max: number) => Math.max(0, Math.min(Math.max(0, max), value));

function candidates(viewport: HTMLElement) {
  const items = [...viewport.querySelectorAll<HTMLElement>(BLOCKS_SELECTOR)].map((element) => ({
    element,
    kind:
      element.dataset.kind ||
      (element.classList.contains('overview-system')
        ? 'business_system'
        : element.classList.contains('overview-domain-link')
          ? 'domain'
          : 'area'),
  }));
  const major = items.filter((item) => MAJOR_KINDS.has(item.kind));
  const businessAreas = items.filter((item) => item.kind === 'business_area');
  // Lists of capabilities are not a second catalogue inside the navigator.
  return (major.length ? major : businessAreas.length ? businessAreas : items).slice(0, 180);
}

function measure(viewport: HTMLElement): Geometry {
  const bounds = viewport.getBoundingClientRect();
  const width = Math.max(1, viewport.scrollWidth, viewport.clientWidth);
  const height = Math.max(1, viewport.scrollHeight, viewport.clientHeight);
  const seen = new Set<string>();
  const blocks = candidates(viewport).flatMap(({ element, kind }) => {
    const id = element.dataset.nodeId || element.dataset.mapItemId || '';
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const target = element.classList.contains('overview-domain-link') ? element.closest('li') || element : element;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(target).visibility === 'hidden') return [];
    const left = rect.left - bounds.left - viewport.clientLeft + viewport.scrollLeft;
    const top = rect.top - bounds.top - viewport.clientTop + viewport.scrollTop;
    const x = clamp(left, width);
    const y = clamp(top, height);
    const blockWidth = clamp(left + rect.width, width) - x;
    const blockHeight = clamp(top + rect.height, height) - y;
    if (blockWidth <= 0 || blockHeight <= 0) return [];
    const name = element.querySelector('.overview-name-link, h3, h4') || element;
    return [
      {
        id,
        label: (name.textContent || id).trim().slice(0, 180),
        kind,
        x: rounded(x),
        y: rounded(y),
        width: rounded(blockWidth),
        height: rounded(blockHeight),
        selected:
          element.classList.contains('is-selected') ||
          element.getAttribute('aria-current') === 'page' ||
          element.getAttribute('aria-pressed') === 'true',
      },
    ];
  });
  // Draw enclosing systems first so the real nested domains remain visible.
  blocks.sort(
    (left, right) => right.width * right.height - left.width * left.height || left.id.localeCompare(right.id),
  );
  return {
    width,
    height,
    left: rounded(viewport.scrollLeft),
    top: rounded(viewport.scrollTop),
    visibleWidth: Math.max(1, viewport.clientWidth),
    visibleHeight: Math.max(1, viewport.clientHeight),
    stageHeight: Math.max(1, viewport.parentElement?.clientHeight ?? viewport.clientHeight),
    blocks,
  };
}

/** Native scroll navigation. Mount beside the scroll container inside .catalogue-navigation-stage. */
export function CatalogueNavigator({
  viewportRef,
  geometryKey,
  framing = 'auto',
  label = ui('catalogueNavigator.navigateur_de_carte'),
  className = '',
}: CatalogueNavigatorProps) {
  const [geometry, setGeometry] = useState(EMPTY);
  const [visibility, setVisibility] = useState<{ context: string; open: boolean } | null>(null);
  const [compact, setCompact] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; left: number; top: number } | null>(null);
  const id = useId();
  const mapFits =
    (geometry.width <= geometry.visibleWidth + 1 && geometry.height <= geometry.visibleHeight + 1) ||
    (geometry.blocks.length > 0 &&
      geometry.blocks.every(
        (block) =>
          block.x + block.width <= geometry.visibleWidth + 1 && block.y + block.height <= geometry.visibleHeight + 1,
      ));
  const defaultOpen = !compact && geometry.stageHeight > 260 && (framing === 'width' || !mapFits);
  const visibilityContext = `${geometryKey ?? ''}:${framing}:${defaultOpen}`;
  const open = visibility?.context === visibilityContext ? visibility.open : defaultOpen;
  const setOpen = (value: boolean) => setVisibility({ context: visibilityContext, open: value });
  // biome-ignore lint/correctness/useExhaustiveDependencies: Context changes intentionally remeasure DOM, not model geometry.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    let active = true;
    const observed = new Set<Element>();
    const update = () => {
      frame = 0;
      if (!active) return;
      const next = measure(viewport);
      setGeometry((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
      const small =
        viewport.clientWidth <= 700 ||
        next.stageHeight <= 260 ||
        matchMedia('(pointer: coarse) and (max-width: 1000px)').matches;
      setCompact(small);
    };
    const schedule = () => {
      if (!frame && active) frame = requestAnimationFrame(update);
    };
    const sizes = new ResizeObserver(schedule);
    const observeContent = () => {
      const next = new Set<Element>([
        viewport,
        ...viewport.children,
        ...viewport.querySelectorAll(CONTENT_SELECTOR),
        ...candidates(viewport).map((item) => item.element),
      ]);
      for (const element of observed)
        if (!next.has(element)) {
          sizes.unobserve(element);
          observed.delete(element);
        }
      for (const element of next)
        if (!observed.has(element)) {
          observed.add(element);
          sizes.observe(element);
        }
    };
    const mutations = new MutationObserver((entries) => {
      if (entries.some((entry) => entry.type === 'childList')) observeContent();
      schedule();
    });
    mutations.observe(viewport, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'style',
        'class',
        'data-node-id',
        'data-map-item-id',
        'data-kind',
        'aria-current',
        'aria-pressed',
      ],
    });
    viewport.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('fullscreenchange', schedule);
    document.fonts.addEventListener('loadingdone', schedule);
    void document.fonts.ready.then(schedule);
    observeContent();
    update();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      sizes.disconnect();
      mutations.disconnect();
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('fullscreenchange', schedule);
      document.fonts.removeEventListener('loadingdone', schedule);
    };
  }, [viewportRef, geometryKey]);

  const scrollTo = (left: number, top: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Cancel a pending session scroll restoration before a deliberate action from this sibling control.
    viewport.dispatchEvent(new Event('catalogue:navigate'));
    viewport.scrollTo({
      left: clamp(left, viewport.scrollWidth - viewport.clientWidth),
      top: clamp(top, viewport.scrollHeight - viewport.clientHeight),
      behavior: 'instant',
    });
  };
  const point = (clientX: number, clientY: number) => {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : undefined;
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const position = point(event.clientX, event.clientY);
    if (!position) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const inside =
      position.x >= geometry.left &&
      position.x <= geometry.left + geometry.visibleWidth &&
      position.y >= geometry.top &&
      position.y <= geometry.top + geometry.visibleHeight;
    const offset = {
      id: event.pointerId,
      left: inside ? position.x - geometry.left : geometry.visibleWidth / 2,
      top: inside ? position.y - geometry.top : geometry.visibleHeight / 2,
    };
    drag.current = offset;
    scrollTo(position.x - offset.left, position.y - offset.top);
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const offset = drag.current;
    if (!offset || offset.id !== event.pointerId) return;
    const position = point(event.clientX, event.clientY);
    if (position) scrollTo(position.x - offset.left, position.y - offset.top);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.metaKey) return;
    const horizontal = Math.max(40, geometry.visibleWidth * 0.25),
      vertical = Math.max(40, geometry.visibleHeight * 0.25);
    let left = geometry.left,
      top = geometry.top;
    switch (event.key) {
      case 'ArrowLeft':
        left -= horizontal;
        break;
      case 'ArrowRight':
        left += horizontal;
        break;
      case 'ArrowUp':
        top -= vertical;
        break;
      case 'ArrowDown':
        top += vertical;
        break;
      case 'PageUp':
        if (event.shiftKey) left -= geometry.visibleWidth * 0.85;
        else top -= geometry.visibleHeight * 0.85;
        break;
      case 'PageDown':
        if (event.shiftKey) left += geometry.visibleWidth * 0.85;
        else top += geometry.visibleHeight * 0.85;
        break;
      case 'Home':
        top = 0;
        if (event.ctrlKey) left = 0;
        break;
      case 'End':
        top = geometry.height;
        if (event.ctrlKey) left = geometry.width;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    scrollTo(left, top);
  };
  const verticalPosition = Math.round(
    clamp(geometry.top / Math.max(1, geometry.height - geometry.visibleHeight), 1) * 100,
  );
  const horizontalPosition = Math.round(
    clamp(geometry.left / Math.max(1, geometry.width - geometry.visibleWidth), 1) * 100,
  );
  if (compact) return null;
  // Opening the overlay leaves the scroll viewport and its geometry unchanged.
  const previewHeight = Math.max(32, Math.min(112, geometry.stageHeight - 160));

  return (
    <aside
      className={`catalogue-navigator${open ? ' is-open' : ' is-closed'} ${className}`.trim()}
      aria-label={label}
      style={{ '--catalogue-navigator-height': `${previewHeight}px` } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          drag.current = null;
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="catalogue-navigator-toggle"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        aria-label={ui('catalogueNavigator.le_navigateur_de_carte', {
          value1: open ? ui('catalogueNavigator.reduire') : ui('catalogueNavigator.afficher'),
        })}
        title={ui('catalogueNavigator.le_navigateur_de_carte', {
          value1: open ? ui('catalogueNavigator.reduire') : ui('catalogueNavigator.afficher'),
        })}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <MapIcon size={16} aria-hidden="true" />
        <span>{ui('catalogueNavigator.navigateur')}</span>
        {open ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronUp size={14} aria-hidden="true" />}
      </button>
      {open && (
        <div id={`${id}-panel`} className="catalogue-navigator-panel">
          <div
            className="catalogue-navigator-surface"
            role="region"
            tabIndex={0}
            aria-label={ui('catalogueNavigator.deplacer_la_zone_visible_de_la_carte')}
            aria-describedby={`${id}-help ${id}-position`}
            onKeyDown={keyboard}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
          >
            <svg
              ref={svg}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {geometry.blocks.map((block) => (
                <rect
                  key={block.id}
                  className={`catalogue-navigator-block kind-${block.kind}${block.selected ? ' is-selected' : ''}`}
                  x={block.x}
                  y={block.y}
                  width={block.width}
                  height={block.height}
                  rx={2}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{block.label}</title>
                </rect>
              ))}
              <rect
                className="catalogue-navigator-window"
                x={clamp(geometry.left, geometry.width)}
                y={clamp(geometry.top, geometry.height)}
                width={Math.min(geometry.visibleWidth, geometry.width)}
                height={Math.min(geometry.visibleHeight, geometry.height)}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <small aria-hidden="true">{ui('catalogueNavigator.cliquer_ou_glisser')}</small>
          <span className="catalogue-navigator-sr" id={`${id}-help`}>
            {ui('catalogueNavigator.fleches_pour_deplacer_la_carte_page_precedente_et_suivante_pour_a')}
          </span>
          <span className="catalogue-navigator-sr" id={`${id}-position`}>
            {ui('catalogueNavigator.position_verticale')}
            {verticalPosition}
            {ui('catalogueNavigator.horizontale')}
            {horizontalPosition} %.
          </span>
        </div>
      )}
    </aside>
  );
}
