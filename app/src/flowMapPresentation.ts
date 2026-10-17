import { flowMapDetailBoxes } from './flowMapDetail.ts';
import type { FlowMapBox } from './flowMapLayout.ts';
import { descendantsOf, lineageOf, visibleAncestorId } from './model.ts';
import type { AtlasRelation, PublishedModel } from './types.ts';

export interface FlowMapPresentationOptions {
  zoom: number;
  scopeId?: string;
  selectedId?: string;
  mode?: 'main' | 'all';
  types?: readonly string[];
}

export interface FlowMapPresentation {
  /** Exchange anchors only; applications, hotspots and object rendering keep their own readable detail. */
  boxes: FlowMapBox[];
  /** Original published relations, including the details supporting a retained principal exchange. */
  relations: AtlasRelation[];
  mode: 'main' | 'all' | 'focus';
  focusId?: string;
  /** Original, BA-projectable relations inside this world that the chosen presentation leaves aside. */
  omittedRelationCount: number;
}

const DISPLAY_KINDS = new Set(['business_system', 'domain', 'area', 'business_area', 'group']);
const FLOW_TYPES = new Set(['shares-data', 'provides-knowledge']);

export interface FlowBoundaryDestination {
  /** Empty identifies the architecture view, including publications without a universe node. */
  scopeId: string;
  name: string;
  relations: AtlasRelation[];
}

/** Keep each external exchange with the closest published scope containing both endpoints. */
export function flowMapBoundaryDestinations(
  model: PublishedModel,
  relations: readonly AtlasRelation[],
): FlowBoundaryDestination[] {
  const destinations = new Map<string, FlowBoundaryDestination & { depth: number }>();
  for (const relation of relations) {
    const targetIds = new Set(lineageOf(model, relation.targetId).map((node) => node.id));
    const sourceLineage = lineageOf(model, relation.sourceId);
    const common = [...sourceLineage]
      .reverse()
      .find((node) => ['universe', 'business_system', 'domain'].includes(node.kind) && targetIds.has(node.id));
    const scopeId = common && common.kind !== 'universe' ? common.id : '';
    const destination = destinations.get(scopeId) || {
      scopeId,
      name: common?.name || model.nodes.find((node) => node.kind === 'universe')?.name || 'Enterprise Architecture',
      relations: [],
      depth: common ? sourceLineage.findIndex((node) => node.id === common.id) : -1,
    };
    destination.relations.push(relation);
    destinations.set(scopeId, destination);
  }
  return [...destinations.values()]
    .sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name))
    .map(({ depth: _depth, ...destination }) => destination);
}

function projectRelation(model: PublishedModel, relation: AtlasRelation, ids: ReadonlySet<string>) {
  const source = visibleAncestorId(model, relation.sourceId, ids);
  const target = visibleAncestorId(model, relation.targetId, ids);
  return source && target && source !== target
    ? { source, target, key: `${source}/${target}/${relation.type}` }
    : undefined;
}

/**
 * Choose one exchange presentation without reading the camera's pan, viewport or overlays.
 * Principal exchanges use one hierarchy frontier; their underlying published IDs remain available in the detail.
 */
export function flowMapPresentation(
  model: PublishedModel,
  boxes: readonly FlowMapBox[],
  options: FlowMapPresentationOptions,
): FlowMapPresentation {
  const territories = boxes.filter((box) => DISPLAY_KINDS.has(box.node.kind));
  const allIds = new Set(territories.map((box) => box.id));
  const types = options.types ? new Set(options.types) : FLOW_TYPES;
  const eligible = model.relations.filter(
    (relation) => FLOW_TYPES.has(relation.type) && types.has(relation.type) && projectRelation(model, relation, allIds),
  );
  const detailBoxes = flowMapDetailBoxes(territories, options.zoom);
  const detailIds = new Set(detailBoxes.map((box) => box.id));
  const finish = (
    anchors: FlowMapBox[],
    relations: AtlasRelation[],
    mode: FlowMapPresentation['mode'],
    focusId?: string,
  ): FlowMapPresentation => ({
    boxes: anchors,
    relations,
    mode,
    ...(focusId ? { focusId } : {}),
    omittedRelationCount: eligible.length - relations.length,
  });

  if (options.mode === 'all')
    return finish(
      detailBoxes,
      eligible.filter((relation) => projectRelation(model, relation, detailIds)),
      'all',
    );

  const selected = options.selectedId ? model.nodeById.get(options.selectedId) : undefined;
  if (
    selected &&
    selected.kind !== 'universe' &&
    selected.id !== options.scopeId &&
    visibleAncestorId(model, selected.id, allIds)
  ) {
    const incident = new Set([selected.id, ...descendantsOf(model, selected.id).map((node) => node.id)]);
    return finish(
      detailBoxes,
      eligible.filter(
        (relation) =>
          (incident.has(relation.sourceId) || incident.has(relation.targetId)) &&
          projectRelation(model, relation, detailIds),
      ),
      'focus',
      selected.id,
    );
  }

  const roots = territories.filter((box) => !box.parentId || !allIds.has(box.parentId));
  const scopedChildren =
    roots.length === 1 && roots[0].id === options.scopeId
      ? territories.filter((box) => box.parentId === roots[0].id)
      : [];
  const frontier = scopedChildren.length ? scopedChildren : roots;
  const frontierIds = new Set(frontier.map((box) => box.id));
  const groups = new Map<string, AtlasRelation[]>();
  for (const relation of eligible) {
    const projection = projectRelation(model, relation, frontierIds);
    if (!projection) continue;
    const group = groups.get(projection.key) || [];
    group.push(relation);
    groups.set(projection.key, group);
  }
  // A native summary names its own directed pair and type. Other pairs keep their documented detail.
  const retained = new Set([...groups.values()].flatMap((group) => group.map((relation) => relation.id)));
  return finish(
    frontier,
    eligible.filter((relation) => retained.has(relation.id)),
    'main',
  );
}
