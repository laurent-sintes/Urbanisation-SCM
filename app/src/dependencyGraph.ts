import type { AtlasNode, AtlasRelation, PublishedModel } from './types.ts';
import { hasAreaLevels, isStructural } from './model.ts';

export type DependencyLevel = 'capability' | 'area' | 'domain' | 'business_system' | 'universe';
export type DependencyFamily = 'needs' | 'other';

export interface DependencyOptions {
  level: DependencyLevel;
  focusId?: string;
  /** 0 displays the whole supplied publication; otherwise a breadth-first neighborhood. */
  depth: 0 | 1 | 2 | 3;
  direction: 'both' | 'incoming' | 'outgoing';
  family: 'all' | DependencyFamily;
  /** Include edges between neighbors in addition to the traversed relationships. */
  includeNeighborLinks?: boolean;
}

export interface DependencyNode {
  id: string;
  item: AtlasNode;
  /** Endpoint IDs after behavior-to-capability projection, before visual grouping. */
  memberIds: string[];
  internalRelationIds: string[];
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  family: DependencyFamily;
  count: number;
  relationIds: string[];
}

export interface DependencyProjection {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  /** Original objects from this publication, including their original behavior endpoints. */
  relations: AtlasRelation[];
  stats: {
    totalRelations: number;
    visibleRelations: number;
    internalRelations: number;
    /** Business endpoints before visual grouping, including isolated capabilities. */
    totalNodes: number;
    visibleNodes: number;
  };
  hiddenRelationCount: number;
}

type EndpointRelation = { relation: AtlasRelation; source: string; target: string; family: DependencyFamily };
const isUniverse = (node: AtlasNode): boolean => node.levelRef === 'universe';
const isGrouping = (node: AtlasNode): boolean => ['business_system', 'group', 'domain', 'area', 'reference'].includes(node.kind) || isUniverse(node);
const familyOf = (relation: AtlasRelation): DependencyFamily => relation.qualification.role === 'needs' ? 'needs' : 'other';

export function dependencyLevels(model: PublishedModel): { value: DependencyLevel; label: string }[] {
  const systems = model.nodes.some(node => node.kind === 'business_system');
  const purposeLabel = model.nodes.some(node => node.kind === 'area' && node.hierarchyLabel === 'Purpose')
    ? 'Purposes et référentiels' : model.nodes.some(node => node.kind === 'area' && node.hierarchyLabel === 'Sous-domaine') ? 'Sous-domaines et référentiels' : 'Areas et référentiels';
  return hasAreaLevels(model)
    ? [{ value: 'capability', label: 'Capacités' }, { value: 'area', label: purposeLabel }, { value: 'domain', label: 'Domaines' }, ...(systems ? [{ value: 'business_system' as const, label: 'Systèmes métier' }] : [])]
    : [{ value: 'capability', label: 'Capacités' }, { value: 'domain', label: 'Domaines et référentiels' }, { value: 'universe', label: 'Univers' }];
}

/** Retain shareable links when changing publication without relabeling its objects. */
export function dependencyLevel(model: PublishedModel, requested: DependencyLevel): DependencyLevel {
  if (requested === 'business_system') return model.nodes.some(node => node.kind === 'business_system') ? requested : hasAreaLevels(model) ? 'domain' : 'universe';
  if (hasAreaLevels(model)) return requested === 'universe' ? 'domain' : requested;
  return requested === 'area' ? 'domain' : requested;
}

/**
 * Pure read-only projection of one verified publication. No relation is inferred from
 * identifiers, names, layers, labels, or the backlog. Business cycles are permitted.
 * Direction restricts traversal. Only traversed original relations are shown by
 * default; additional links between neighbors require the explicit option.
 */
export function projectDependencies(model: PublishedModel, options: DependencyOptions): DependencyProjection {
  if (!['capability', 'area', 'domain', 'business_system', 'universe'].includes(options.level)) throw new Error('Niveau de dépendances inconnu.');
  if (![0, 1, 2, 3].includes(options.depth)) throw new Error('La profondeur doit être 0, 1, 2 ou 3.');
  if (!['both', 'incoming', 'outgoing'].includes(options.direction)) throw new Error('Sens de parcours inconnu.');
  if (!['all', 'needs', 'other'].includes(options.family)) throw new Error('Famille de relations inconnue.');
  if (options.focusId && !model.nodeById.has(options.focusId)) throw new Error(`Nœud de focalisation absent : ${options.focusId}.`);
  const level = dependencyLevel(model, options.level);
  const areaLevels = hasAreaLevels(model);
  const atLevel = (item: AtlasNode): boolean => level === 'area' ? item.kind === 'area' || item.kind === 'reference'
    : level === 'domain' ? item.kind === 'domain' || (!areaLevels && item.kind === 'reference')
    : level === 'business_system' ? item.kind === 'business_system' : level === 'universe' && isUniverse(item);

  // adaptPublication already guarantees an unambiguous, acyclic structural hierarchy.
  const parents = new Map<string, AtlasRelation>();
  const children = new Map<string, string[]>();
  for (const relation of model.relations.filter(isStructural)) {
    parents.set(relation.targetId, relation);
    const siblings = children.get(relation.sourceId) ?? [];
    siblings.push(relation.targetId);
    children.set(relation.sourceId, siblings);
  }

  function node(id: string): AtlasNode {
    const item = model.nodeById.get(id);
    if (!item) throw new Error(`Extrémité absente de la publication : ${id}.`);
    return item;
  }

  function endpoint(id: string): string {
    if (node(id).kind !== 'behavior') return id;
    const parent = parents.get(id);
    if (parent?.type !== 'contains' || node(parent.sourceId).kind !== 'capability') {
      throw new Error(`Comportement sans parent capacité explicite : ${id}.`);
    }
    return parent.sourceId;
  }

  function ancestor(id: string, predicate: (item: AtlasNode) => boolean): string | undefined {
    let cursor: string | undefined = id;
    const seen = new Set<string>();
    while (cursor !== undefined) {
      if (seen.has(cursor)) throw new Error(`Cycle de rattachement explicite : ${cursor}.`);
      seen.add(cursor);
      if (predicate(node(cursor))) return cursor;
      cursor = parents.get(cursor)?.sourceId;
    }
    return undefined;
  }

  function displayedId(id: string): string {
    if (level === 'capability') return id;
    // Unattached objects/documents/events never acquire a containing domain or area.
    return ancestor(id, atLevel) ?? id;
  }

  const allRelations: EndpointRelation[] = model.relations.filter(relation => !isStructural(relation)).map(relation => ({
    relation, source: endpoint(relation.sourceId), target: endpoint(relation.targetId), family: familyOf(relation),
  }));
  const endpointIds = new Set(allRelations.flatMap(relation => [relation.source, relation.target]));
  // Direct historical links between domains/references retain those endpoints. They
  // must never be copied onto their capabilities. Other leaf kinds retain their nature.
  const allNodeIds = new Set(model.nodes.filter(item => item.kind !== 'behavior'
    && (!isGrouping(item) || endpointIds.has(item.id))).map(item => item.id));
  const filtered = allRelations.filter(relation => options.family === 'all' || relation.family === options.family);
  let visible = new Set(allNodeIds);
  const traversed = new Set<string>();
  const focus = options.focusId ? node(options.focusId) : undefined;
  const full = options.depth === 0 || !focus;

  if (!full && focus) {
    const seeds = new Set<string>();
    if (isGrouping(focus)) {
      const pending = [focus.id];
      const seen = new Set<string>();
      while (pending.length) {
        const id = pending.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        if (allNodeIds.has(id)) seeds.add(id);
        pending.push(...children.get(id) ?? []);
      }
      // Selecting an empty group still gives a visible, inspectable focus.
      if (!seeds.size) seeds.add(focus.id);
    } else {
      seeds.add(endpoint(focus.id));
    }
    visible = seeds;
    let frontier = new Set(seeds);
    for (let step = 0; step < options.depth; step += 1) {
      const next = new Set<string>();
      for (const relation of filtered) {
        if ((options.direction !== 'incoming' && frontier.has(relation.source))
          || (options.direction !== 'outgoing' && frontier.has(relation.target))) traversed.add(relation.relation.id);
        if (options.direction !== 'incoming' && frontier.has(relation.source) && !visible.has(relation.target)) next.add(relation.target);
        if (options.direction !== 'outgoing' && frontier.has(relation.target) && !visible.has(relation.source)) next.add(relation.source);
      }
      next.forEach(id => visible.add(id));
      frontier = next;
      if (!frontier.size) break;
    }
  }

  const chosen = filtered.filter(relation => visible.has(relation.source) && visible.has(relation.target)
    && (full || options.includeNeighborLinks || traversed.has(relation.relation.id)));
  const display = new Map<string, DependencyNode>();
  function ensureNode(id: string): DependencyNode {
    const current = display.get(id);
    if (current) return current;
    const item = { id, item: node(id), memberIds: [], internalRelationIds: [] };
    display.set(id, item);
    return item;
  }
  // The publication's order provides a deterministic projection for every renderer.
  for (const item of model.nodes) {
    if (visible.has(item.id)) ensureNode(displayedId(item.id)).memberIds.push(item.id);
  }
  if (full && level !== 'capability') {
    for (const item of model.nodes.filter(atLevel)) ensureNode(item.id);
  }
  if (!full && focus && isGrouping(focus) && !display.size) ensureNode(focus.id);

  const buckets = new Map<string, { edge: DependencyEdge; relations: AtlasRelation[] }>();
  let internalRelations = 0;
  for (const entry of chosen) {
    const source = displayedId(entry.source);
    const target = displayedId(entry.target);
    if (source === target) {
      ensureNode(source).internalRelationIds.push(entry.relation.id);
      internalRelations += 1;
      continue;
    }
    const key = JSON.stringify([source, target, entry.family]);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        edge: {
          id: `dependency:${encodeURIComponent(source)}|${encodeURIComponent(target)}|${entry.family}`,
          source, target, family: entry.family,
          label: entry.family === 'needs' ? 'A besoin de' : 'Relation métier',
          count: 0, relationIds: [],
        },
        relations: [],
      };
      buckets.set(key, bucket);
    }
    bucket.edge.relationIds.push(entry.relation.id);
    bucket.edge.count += 1;
    bucket.relations.push(entry.relation);
  }
  const edges = [...buckets.values()].map(({ edge, relations }) => {
    // A normalized label is not invented from the prose qualification. Multiple
    // distinct descriptions remain in the original relations available to the UI.
    // An explicit business expression also describes a needs relation without
    // changing its consumer-to-provider direction or its semantic family.
    const label = relations[0].label;
    if (label && relations.every(relation => relation.label === label && relation.label !== relation.type)) edge.label = label;
    return edge;
  });
  return {
    nodes: [...display.values()],
    edges,
    relations: chosen.map(entry => entry.relation),
    stats: {
      totalRelations: allRelations.length,
      visibleRelations: chosen.length,
      internalRelations,
      totalNodes: allNodeIds.size,
      visibleNodes: [...visible].filter(id => allNodeIds.has(id)).length,
    },
    hiddenRelationCount: allRelations.length - chosen.length,
  };
}
