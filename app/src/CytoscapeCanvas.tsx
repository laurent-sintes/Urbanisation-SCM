import cytoscape, { type Core, type ElementDefinition, type LayoutOptions, type Layouts } from 'cytoscape';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DependencyProjection } from './dependencyGraph';

const layoutModules = new Map<'organic' | 'hierarchical', Promise<void>>();
async function loadOrganicLayout() {
  const module = await import('cytoscape-fcose');
  cytoscape.use(module.default);
}
async function loadHierarchicalLayout() {
  const module = await import('cytoscape-dagre');
  cytoscape.use(module.default);
}
function ensureLayoutModule(layout: 'organic' | 'hierarchical'): Promise<void> {
  const cached = layoutModules.get(layout);
  if (cached) return cached;
  const pending = (layout === 'organic' ? loadOrganicLayout() : loadHierarchicalLayout()).catch((error: unknown) => {
    layoutModules.delete(layout);
    throw error;
  });
  layoutModules.set(layout, pending);
  return pending;
}

export interface CytoscapeCanvasProps {
  projection: DependencyProjection;
  layout: 'organic' | 'hierarchical';
  labels: 'focus' | 'all';
  selectedId?: string;
  onSelect: (selection: { kind: 'node' | 'edge'; id: string }) => void;
  onRead?: (id: string) => void;
}

interface Palette {
  paper: string;
  ink: string;
  line: string;
  needs: string;
  other: string;
  selection: string;
}
const isDependency = (family: string) => family === 'needs';
const shortLabel = (value: string) => {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > 118 ? `${text.slice(0, 117).replace(/\s+\S*$/, '')}…` : text;
};

function readPalette(element: HTMLElement): Palette {
  const css = getComputedStyle(element);
  const color = (property: string, fallback: string) => css.getPropertyValue(property).trim() || fallback;
  return {
    paper: color('--flow-paper', '#fcfdfd'),
    ink: color('--ink', '#203c39'),
    line: color('--line', '#dde6e3'),
    needs: color('--flow-green', '#236159'),
    other: color('--dependency-other', '#816435'),
    selection: color('--flow-green', '#236159'),
  };
}

function applyStyles(cy: Core, colors: Palette, labels: CytoscapeCanvasProps['labels']) {
  cy.style([
    {
      selector: 'node',
      style: {
        shape: 'round-rectangle',
        width: 186,
        height: 68,
        label: 'data(displayLabel)',
        color: colors.ink,
        'font-family': 'Aptos, Segoe UI, Arial, sans-serif',
        'font-size': 12,
        'font-weight': 'normal',
        'text-wrap': 'wrap',
        'text-max-width': '167px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': colors.paper,
        'background-opacity': 1,
        'border-width': 1.2,
        'border-color': colors.line,
        'overlay-opacity': 0,
      },
    },
    { selector: 'node[kind="domain"], node[kind="area"]', style: { width: 206, height: 82, 'border-width': 2 } },
    { selector: 'node[universe]', style: { width: 228, height: 90, 'border-width': 2 } },
    {
      selector: 'edge',
      style: {
        label: labels === 'all' ? 'data(displayLabel)' : '',
        color: colors.ink,
        width: 1.3,
        'line-color': 'data(edgeColor)',
        'target-arrow-color': 'data(edgeColor)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.9,
        'curve-style': 'bezier',
        'control-point-step-size': 62,
        'font-family': 'Aptos, Segoe UI, Arial, sans-serif',
        'font-size': 11,
        'text-wrap': 'wrap',
        'text-max-width': '184px',
        'text-rotation': 'none',
        'text-background-color': colors.paper,
        'text-background-opacity': 0.94,
        'text-background-padding': '3px',
        'text-margin-y': -8,
        'overlay-opacity': 0,
        opacity: 0.67,
      },
    },
    { selector: 'edge[other]', style: { 'line-style': 'dashed' } },
    { selector: '.dependency-muted', style: { opacity: 0.16, 'text-opacity': 0.18 } },
    { selector: 'node.dependency-related', style: { 'border-color': colors.selection, 'border-width': 2 } },
    {
      selector: 'edge.dependency-related',
      style: {
        label: 'data(displayLabel)',
        opacity: 0.98,
        width: 2,
        'z-index': 15,
      },
    },
    {
      selector: 'node.dependency-active',
      style: { 'border-color': colors.selection, 'border-width': 3.5, 'z-index': 20 },
    },
    {
      selector: 'edge.dependency-active',
      style: {
        label: 'data(displayLabel)',
        'line-color': colors.selection,
        'target-arrow-color': colors.selection,
        opacity: 1,
        width: 3,
        'z-index': 25,
      },
    },
  ]);
}

/** Preserve business names at every zoom level; the inspector provides the full detail. */
function updateZoomLabels(cy: Core) {
  if (cy.destroyed()) return;
  const zoom = Math.max(cy.zoom(), 0.05);
  cy.batch(() =>
    cy.nodes().forEach((node) => {
      // Literal values are intentional: style bypasses must not leave data(...) as visible text.
      node.style({
        label: node.data('displayLabel'),
        'font-size': Math.max(12, Math.min(16, 10 / zoom)),
        'text-wrap': 'wrap',
      });
    }),
  );
}

function fit(cy: Core) {
  if (cy.destroyed() || !cy.elements().length) return;
  cy.nodes().removeStyle('label font-size text-wrap');
  cy.fit(cy.elements(), 44);
  if (cy.zoom() > 1) {
    cy.zoom(1);
    cy.center();
  }
  updateZoomLabels(cy);
}

function select(cy: Core, id?: string) {
  if (cy.destroyed()) return;
  cy.batch(() => {
    cy.elements().removeClass('dependency-active dependency-related dependency-muted');
    if (!id) return;
    const selected = cy.getElementById(id);
    if (!selected.length) return;
    const related =
      selected.group() === 'nodes' ? selected.closedNeighborhood() : selected.union(selected.connectedNodes());
    cy.elements().not(related).addClass('dependency-muted');
    related.addClass('dependency-related');
    selected.addClass('dependency-active');
  });
}

/** Renderer only: every endpoint, family and relation ID comes from one published projection. */
export function CytoscapeCanvas(props: CytoscapeCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<Core | null>(null);
  const activeLayout = useRef<Layouts | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const generation = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [layoutMs, setLayoutMs] = useState(0);
  // A parent may rebuild its projection object on selection. Selection alone must not relayout.
  const projectionKey = useMemo(
    () =>
      JSON.stringify([
        props.projection.nodes.map((n) => [
          n.id,
          n.item.name,
          n.item.kind,
          n.item.groupRole,
          n.item.levelRef,
          n.memberIds,
          n.internalRelationIds,
        ]),
        props.projection.edges.map((e) => [e.id, e.source, e.target, e.label, e.family, e.count, e.relationIds]),
      ]),
    [props.projection],
  );

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let observer: ResizeObserver | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const cy = cytoscape({
        container: host,
        elements: [],
        layout: { name: 'preset' },
        minZoom: 0.05,
        maxZoom: 2.8,
        wheelSensitivity: 0.2,
        selectionType: 'single',
        boxSelectionEnabled: false,
        autounselectify: true,
        autoungrabify: true,
        userPanningEnabled: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        hideEdgesOnViewport: false,
        textureOnViewport: false,
      });
      instance.current = cy;
      applyStyles(cy, readPalette(host), latest.current.labels);
      cy.on('tap', 'node, edge', (event) => {
        const element = event.target;
        select(cy, element.id());
        latest.current.onSelect({ kind: element.isNode() ? 'node' : 'edge', id: element.id() });
      });
      cy.on('dbltap', 'node', (event) => latest.current.onRead?.(event.target.id()));
      cy.on('zoom', () => updateZoomLabels(cy));
      observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (cy.destroyed() || !host.clientWidth || !host.clientHeight) return;
          cy.resize();
          fit(cy);
        }, 100);
      });
      observer.observe(host);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setStatus('error');
    }
    return () => {
      generation.current++;
      clearTimeout(resizeTimer);
      observer?.disconnect();
      activeLayout.current?.stop();
      activeLayout.current = null;
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  // Rebuild only when graph content or layout changes; selection is handled separately.
  // biome-ignore lint/correctness/useExhaustiveDependencies: The signature is the stable dependency for the latest projection.
  useEffect(() => {
    const cy = instance.current;
    const host = container.current;
    if (!cy || !host) return;
    const currentGeneration = ++generation.current;
    let cancelled = false;
    activeLayout.current?.stop();
    activeLayout.current = null;
    setStatus('loading');
    setError('');
    // Yield once so loading state is paintable before the synchronous layout algorithms run.
    const timer = setTimeout(async () => {
      if (cancelled || cy.destroyed() || currentGeneration !== generation.current) return;
      try {
        const { projection, layout } = latest.current;
        if (projection.nodes.length >= 2) await ensureLayoutModule(layout);
        if (cancelled || cy.destroyed() || currentGeneration !== generation.current) return;
        const colors = readPalette(host);
        const nodes = [...projection.nodes].sort((a, b) => a.id.localeCompare(b.id));
        const edges = [...projection.edges].sort((a, b) => a.id.localeCompare(b.id));
        const ids = new Set<string>();
        const nodeIds = new Set(nodes.map((n) => n.id));
        for (const item of [...nodes, ...edges]) {
          if (!item.id || ids.has(item.id)) throw new Error(`Identifiant de graphe absent ou dupliqué : ${item.id}`);
          ids.add(item.id);
        }
        for (const edge of edges) {
          if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target))
            throw new Error(`Extrémité absente pour ${edge.id}`);
        }
        const columns = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
        const elements: ElementDefinition[] = [
          ...nodes.map(
            (node, index): ElementDefinition => ({
              group: 'nodes',
              data: {
                id: node.id,
                label: node.item.name,
                kind: node.item.kind,
                ...(node.item.kind === 'universe' ||
                (node.item.groupRole === 'urbanism_level' && node.item.levelRef === 'universe')
                  ? { universe: true }
                  : {}),
                displayLabel:
                  node.item.name +
                  (node.internalRelationIds.length ? `\n${node.internalRelationIds.length} liens internes` : ''),
                memberIds: [...node.memberIds],
                internalRelationIds: [...node.internalRelationIds],
              },
              position: { x: (index % columns) * 270, y: Math.floor(index / columns) * 160 },
            }),
          ),
          ...edges.map(
            (edge): ElementDefinition => ({
              group: 'edges',
              data: {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                family: edge.family,
                label: edge.label,
                displayLabel: shortLabel(edge.label),
                count: edge.count,
                relationIds: [...edge.relationIds],
                edgeColor: isDependency(edge.family) ? colors.needs : colors.other,
                ...(!isDependency(edge.family) ? { other: true } : {}),
              },
            }),
          ),
        ];
        cy.batch(() => {
          cy.elements().remove();
          cy.add(elements);
          applyStyles(cy, colors, latest.current.labels);
        });
        cy.resize();
        const started = performance.now();
        const finished = () => {
          if (cancelled || cy.destroyed() || currentGeneration !== generation.current) return;
          activeLayout.current = null;
          setLayoutMs(Math.round(performance.now() - started));
          fit(cy);
          select(cy, latest.current.selectedId);
          setStatus('ready');
        };
        if (nodes.length < 2) {
          finished();
          return;
        }
        const options =
          layout === 'organic'
            ? {
                name: 'fcose',
                quality: 'proof',
                randomize: false,
                animate: false,
                fit: false,
                padding: 45,
                nodeDimensionsIncludeLabels: true,
                nodeRepulsion: () => 60000,
                idealEdgeLength: () => 220,
                edgeElasticity: () => 0.1,
                nestingFactor: 0.1,
                numIter: 1600,
                tile: true,
                packComponents: false,
                gravity: 0.12,
                stop: finished,
              }
            : {
                name: 'dagre',
                rankDir: 'LR',
                ranker: 'network-simplex',
                nodeSep: 38,
                edgeSep: 24,
                rankSep: 165,
                animate: false,
                fit: false,
                nodeDimensionsIncludeLabels: true,
                stop: finished,
              };
        const nextLayout = cy.layout(options as LayoutOptions);
        activeLayout.current = nextLayout;
        nextLayout.run();
      } catch (reason) {
        if (cancelled || cy.destroyed() || currentGeneration !== generation.current) return;
        activeLayout.current = null;
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus('error');
      }
    }, 20);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      activeLayout.current?.stop();
      activeLayout.current = null;
    };
  }, [projectionKey, props.layout]);

  useEffect(() => {
    const cy = instance.current;
    const host = container.current;
    if (!cy || !host) return;
    applyStyles(cy, readPalette(host), props.labels);
    updateZoomLabels(cy);
    select(cy, props.selectedId);
  }, [props.labels, props.selectedId]);

  const zoom = (factor: number) => {
    const cy = instance.current;
    if (!cy || cy.destroyed()) return;
    cy.zoom({
      level: Math.max(cy.minZoom(), Math.min(cy.maxZoom(), cy.zoom() * factor)),
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };

  return (
    <div className="dependency-canvas-shell">
      <div
        ref={container}
        className="dependency-canvas"
        data-testid="cytoscape-canvas"
        data-status={status}
        data-node-count={props.projection.nodes.length}
        data-edge-count={props.projection.edges.length}
        data-layout-ms={layoutMs}
        role="img"
        aria-label={`Graphe de ${props.projection.nodes.length} éléments et ${props.projection.edges.length} liens. Les éléments et leurs détails sont aussi disponibles dans le panneau de sélection.`}
      />
      <div className="dependency-canvas-controls" role="group" aria-label="Navigation dans le graphe">
        <button type="button" onClick={() => zoom(1.3)} aria-label="Agrandir" title="Agrandir">
          <Plus size={16} />
        </button>
        <button type="button" onClick={() => zoom(1 / 1.3)} aria-label="Réduire" title="Réduire">
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={() => instance.current && fit(instance.current)}
          aria-label="Centrer le graphe"
          title="Centrer le graphe"
        >
          <Maximize2 size={16} />
        </button>
      </div>
      {status === 'loading' && (
        <div className="dependency-canvas-status" role="status">
          Placement du graphe…
        </div>
      )}
      {status === 'error' && (
        <div className="dependency-canvas-status" role="alert">
          Le placement a échoué : {error}
        </div>
      )}
      {status === 'ready' && !props.projection.nodes.length && (
        <div className="dependency-canvas-note">Aucun élément dans ce périmètre.</div>
      )}
    </div>
  );
}
