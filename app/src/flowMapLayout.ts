import { type MapSlot, operationsMapSlots, systemMapSlots } from './mapPlacement.ts';
import { childrenOf, rootsOf, visibleAncestorId } from './model.ts';
import type { AtlasNode, AtlasRelation, PublishedModel } from './types.ts';

export interface FlowMapBox {
  id: string;
  node: AtlasNode;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Reserved world space for this territory's heading, independent of zoom. */
  headerHeight: number;
  depth: number;
  parentId?: string;
}

export interface FlowMapExchange {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  type: string;
  relations: readonly AtlasRelation[];
}

export interface FlowMapLayout {
  boxes: FlowMapBox[];
  exchanges: FlowMapExchange[];
  width: number;
  height: number;
}

interface Territory {
  node: AtlasNode;
  width: number;
  height: number;
  headerHeight: number;
  children: { territory: Territory; x: number; y: number; width: number; height: number }[];
}

const KINDS = new Set(['business_system', 'domain', 'area', 'business_area', 'group']);
const EXCHANGES = new Set(['shares-data', 'provides-knowledge']);
const PADDING = 14;
const CORRIDOR = 140;
const INNER_GAP = 12;
const MARGIN = 32;

/** A deterministic text estimate belongs to the publication, never to viewport, overlays or zoom. */
function titleLines(name: string, availableWidth = 260 - 2 * 10): number {
  // Approximate the UI font at its natural 16px size; count words against the real text column.
  const glyphWidth = (character: string) =>
    /[ilI1|.,:;!'`]/.test(character) ? 4 : /[MW@%&]/.test(character) ? 13 : /[A-Z]/.test(character) ? 9 : 8;
  const wordWidth = (word: string) => [...word].reduce((width, character) => width + glyphWidth(character), 0);
  let lines = 1;
  let width = 0;
  for (const word of name.trim().split(/\s+/)) {
    const measured = wordWidth(word);
    if (measured > availableWidth) {
      if (width) lines++;
      width = 0;
      for (const character of word) {
        const next = glyphWidth(character);
        if (width + next > availableWidth) {
          lines++;
          width = 0;
        }
        width += next;
      }
    } else if (width && width + 4 + measured > availableWidth) {
      lines++;
      width = measured;
    } else width += (width ? 4 : 0) + measured;
  }
  return lines;
}

function businessAreaHeight(node: AtlasNode): number {
  return titleLines(node.name) > 2 ? 80 : 60;
}

function headerHeight(node: AtlasNode): number {
  if (node.kind === 'business_system') return 200;
  if (node.kind === 'domain') return 88;
  if (node.kind === 'area' || node.kind === 'group') return titleLines(node.name) > 1 ? 72 : 64;
  return businessAreaHeight(node);
}

function leafSize(node: AtlasNode): { width: number; height: number } {
  if (node.kind === 'business_area') return { width: 260, height: businessAreaHeight(node) };
  if (node.kind === 'area' || node.kind === 'group') return { width: 288, height: headerHeight(node) + 16 };
  if (node.kind === 'domain') return { width: 288, height: titleLines(node.name) > 2 ? 128 : 104 };
  return { width: 320, height: titleLines(node.name) > 2 ? 144 : 120 };
}

/** Track choices belong to the territory, never to viewport dimensions or active overlays. */
function slotsFor(parent: AtlasNode | undefined, children: readonly AtlasNode[]): MapSlot[] {
  const ids = children.map((child) => child.id);
  const explicit = parent ? operationsMapSlots(parent.id, ids) : systemMapSlots(ids);
  if (explicit) return explicit;
  const limit =
    parent?.kind === 'business_area'
      ? 1
      : parent?.kind === 'area' || parent?.kind === 'group'
        ? children.length > 4
          ? 2
          : 1
        : 3;
  const columns = Math.max(1, Math.min(limit, Math.ceil(Math.sqrt(children.length))));
  return children.map((_, index) => ({ index, row: Math.floor(index / columns), column: index % columns, span: 1 }));
}

/**
 * The published Supply identities define a stable neighborhood, without assigning new business meaning.
 * Planning, Inventory and Availability form the core; references, policies and the other territories frame them.
 * Integration keeps its historical position only when the selected publication contains it.
 * Older publications without this neighborhood keep their own deterministic generic arrangement.
 */
function supplyNeighborhood(parent: AtlasNode | undefined, children: readonly Territory[]) {
  if (parent?.id !== 'supply-chain-orchestration') return undefined;
  const byId = new Map(children.map((territory) => [territory.node.id, territory]));
  if (!byId.has('domain-plan') || !byId.has('D01')) return undefined;
  const columns = [
    ['business-references', 'subdomain-service-orders'],
    ['subdomain-integration'],
    ['subdomain-policies', 'domain-plan'],
    ['D04', 'D01', 'D03'],
    ['subdomain-process-management', 'D06'],
  ].filter((ids) => ids.some((id) => byId.has(id)));
  const xById = new Map<string, number>();
  let x = 0;
  for (const ids of columns) {
    for (const id of ids) xById.set(id, x);
    x += Math.max(...ids.map((id) => byId.get(id)?.width || 0)) + CORRIDOR;
  }
  const positions = new Map<string, { x: number; y: number }>();
  const stack = (ids: string[], top = 0) => {
    let y = top;
    for (const id of ids) {
      const territory = byId.get(id);
      if (!territory) continue;
      positions.set(id, { x: xById.get(id) || 0, y });
      y += territory.height + CORRIDOR;
    }
  };
  stack(['business-references', 'subdomain-service-orders']);
  stack(['subdomain-process-management', 'D06']);
  stack(['subdomain-policies']);
  stack(['D04']);
  const upperHeight = Math.max(byId.get('subdomain-policies')?.height || 0, byId.get('D04')?.height || 0);
  const coreY = upperHeight ? upperHeight + CORRIDOR : 0;
  const integrationOffset = Math.max(
    0,
    ((byId.get('domain-plan')?.height || 0) - (byId.get('subdomain-integration')?.height || 0)) / 2,
  );
  stack(['subdomain-integration'], coreY + integrationOffset);
  stack(['domain-plan'], coreY);
  stack(['D01', 'D03'], coreY);
  const known = children.filter((child) => positions.has(child.node.id));
  const height = Math.max(...known.map((child) => (positions.get(child.node.id)?.y || 0) + child.height));
  const extra = children.filter((child) => !positions.has(child.node.id));
  // A newly published identity stays visible in a further band; it never takes a known identity's place.
  const extraLayout = arrange(undefined, extra);
  for (const item of extraLayout.children)
    positions.set(item.territory.node.id, { x: item.x, y: height + CORRIDOR + item.y });
  return {
    children: children.map((territory) => ({
      territory,
      ...(positions.get(territory.node.id) || { x: 0, y: 0 }),
      width: territory.width,
      height: territory.height,
    })),
    width: Math.max(x - CORRIDOR, extraLayout.width),
    height: extra.length ? height + CORRIDOR + extraLayout.height : height,
  };
}

function arrange(
  parent: AtlasNode | undefined,
  children: readonly Territory[],
): {
  children: Territory['children'];
  width: number;
  height: number;
} {
  if (!children.length) return { children: [], width: 0, height: 0 };
  const neighborhood = supplyNeighborhood(parent, children);
  if (neighborhood) return neighborhood;
  const slots = slotsFor(
    parent,
    children.map((child) => child.node),
  );
  const columns = Math.max(...slots.map((slot) => slot.column + slot.span));
  const panoramic = !parent || parent.kind === 'universe';
  const gap =
    parent?.kind === 'business_area'
      ? 0
      : parent?.kind === 'area' || parent?.kind === 'group'
        ? INNER_GAP
        : parent?.id === 'supply-chain-orchestration'
          ? CORRIDOR
          : Math.max(
              CORRIDOR,
              Math.min(
                panoramic ? 420 : 320,
                Math.ceil(Math.max(...children.map((child) => child.width)) * (panoramic ? 0.65 : 0.3)),
              ),
            );
  const trackWidths = Array.from({ length: columns }, () => 0);
  // Tracks reserve room, but each territory keeps its own width and height.
  for (const slot of slots.filter((item) => item.span === 1))
    trackWidths[slot.column] = Math.max(trackWidths[slot.column], children[slot.index].width);
  for (const slot of slots.filter((item) => item.span > 1)) {
    const current = trackWidths.slice(slot.column, slot.column + slot.span).reduce((sum, width) => sum + width, 0);
    const missing = children[slot.index].width - current - gap * (slot.span - 1);
    if (missing > 0)
      for (let column = slot.column; column < slot.column + slot.span; column++)
        trackWidths[column] += missing / slot.span;
  }
  const rowNumbers = [...new Set(slots.map((slot) => slot.row))].sort((a, b) => a - b);
  let y = 0;
  const positioned: Territory['children'] = [];
  for (const row of rowNumbers) {
    const entries = slots.filter((slot) => slot.row === row);
    const height = Math.max(...entries.map((slot) => children[slot.index].height));
    for (const slot of entries) {
      positioned.push({
        territory: children[slot.index],
        x: trackWidths.slice(0, slot.column).reduce((sum, width) => sum + width + gap, 0),
        y,
        width: children[slot.index].width,
        height: children[slot.index].height,
      });
    }
    y += height + gap;
  }
  return {
    children: positioned,
    width: Math.max(...positioned.map((child) => child.x + child.width)),
    height: y - gap,
  };
}

/** Project only published directed exchanges; keep the relation identity and original endpoints. */
export function projectFlowMapExchanges(model: PublishedModel, visibleIds: ReadonlySet<string>): FlowMapExchange[] {
  const parents = new Map(
    model.relations
      .filter((relation) => relation.type === 'contains' || relation.type === 'presents')
      .map((relation) => [relation.targetId, relation.sourceId]),
  );
  const visibleAncestor = (id: string): string | undefined => {
    const seen = new Set<string>();
    let current: string | undefined = id;
    while (current && !seen.has(current)) {
      if (visibleIds.has(current)) return current;
      seen.add(current);
      current = parents.get(current);
    }
    return undefined;
  };
  return model.relations.flatMap((relation) => {
    if (!EXCHANGES.has(relation.type)) return [];
    const sourceId = visibleAncestor(relation.sourceId);
    const targetId = visibleAncestor(relation.targetId);
    if (!sourceId || !targetId || sourceId === targetId) return [];
    return [{ id: relation.id, sourceId, targetId, label: relation.label, type: relation.type, relations: [relation] }];
  });
}

/** Fixed world geometry for one publication. Zoom reveals territories without moving their neighbors. */
export function buildFlowMap(model: PublishedModel, scopeId?: string): FlowMapLayout {
  const measure = (node: AtlasNode, ancestors = new Set<string>()): Territory => {
    const next = new Set([...ancestors, node.id]);
    const descendants =
      node.kind === 'business_area'
        ? []
        : childrenOf(model, node.id).filter((child) => KINDS.has(child.kind) && !next.has(child.id));
    if (!descendants.length) {
      const size = leafSize(node);
      return { node, ...size, headerHeight: Math.min(headerHeight(node), size.height), children: [] };
    }
    const content = arrange(
      node,
      descendants.map((child) => measure(child, next)),
    );
    const heading = headerHeight(node);
    return {
      node,
      width: content.width + PADDING * 2,
      height: content.height + heading + PADDING,
      headerHeight: heading,
      children: content.children.map((child) => ({
        ...child,
        x: child.x + PADDING,
        y: child.y + heading,
      })),
    };
  };
  const requestedScope = scopeId ? model.nodeById.get(scopeId) : undefined;
  if (scopeId && !requestedScope) return { boxes: [], exchanges: [], width: 0, height: 0 };
  const scope =
    requestedScope && requestedScope.kind !== 'universe' && !KINDS.has(requestedScope.kind)
      ? model.nodeById.get(
          visibleAncestorId(
            model,
            requestedScope.id,
            new Set(model.nodes.filter((node) => KINDS.has(node.kind)).map((node) => node.id)),
          ) || '',
        )
      : requestedScope;
  if (scopeId && !scope) return { boxes: [], exchanges: [], width: 0, height: 0 };
  let roots: AtlasNode[];
  if (scope && ['universe', 'business_system', 'domain'].includes(scope.kind)) {
    roots = childrenOf(model, scope.id).filter((node) => KINDS.has(node.kind));
    if (!roots.length && KINDS.has(scope.kind)) roots = [scope];
  } else if (scope) {
    roots = KINDS.has(scope.kind) ? [scope] : [];
  } else {
    const publishedRoots = rootsOf(model);
    const universe = publishedRoots.find((node) => node.kind === 'universe');
    roots = (universe ? childrenOf(model, universe.id) : publishedRoots).filter((node) => KINDS.has(node.kind));
  }
  if (!roots.length) return { boxes: [], exchanges: [], width: 0, height: 0 };
  const rootLayout = arrange(
    scope && ['universe', 'business_system', 'domain'].includes(scope.kind) ? scope : undefined,
    roots.map((node) => measure(node)),
  );
  const boxes: FlowMapBox[] = [];
  const emit = (
    territory: Territory,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number,
    parentId?: string,
  ) => {
    boxes.push({
      id: territory.node.id,
      node: territory.node,
      x,
      y,
      width,
      height,
      headerHeight: territory.headerHeight,
      depth,
      ...(parentId ? { parentId } : {}),
    });
    for (const child of territory.children)
      emit(child.territory, x + child.x, y + child.y, child.width, child.height, depth + 1, territory.node.id);
  };
  for (const root of rootLayout.children)
    emit(root.territory, root.x + MARGIN, root.y + MARGIN, root.width, root.height, 0);
  return {
    boxes,
    exchanges: projectFlowMapExchanges(model, new Set(boxes.map((box) => box.id))),
    width: rootLayout.width + MARGIN * 2,
    height: rootLayout.height + MARGIN * 2,
  };
}
