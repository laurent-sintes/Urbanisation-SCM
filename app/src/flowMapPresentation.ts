import { flowMapDetailBoxes } from './flowMapDetail.ts';
import type { FlowMapBox } from './flowMapLayout.ts';
import { descendantsOf, visibleAncestorId } from './model.ts';
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
  const groups = new Map<string, { native: boolean; relations: AtlasRelation[] }>();
  for (const relation of eligible) {
    const projection = projectRelation(model, relation, frontierIds);
    if (!projection) continue;
    const group = groups.get(projection.key) || { native: false, relations: [] };
    group.native ||= relation.sourceId === projection.source && relation.targetId === projection.target;
    group.relations.push(relation);
    groups.set(projection.key, group);
  }
  const hasNative = [...groups.values()].some((group) => group.native);
  const retained = new Set(
    [...groups.values()]
      .filter((group) => !hasNative || group.native)
      .flatMap((group) => group.relations.map((relation) => relation.id)),
  );
  return finish(
    frontier,
    eligible.filter((relation) => retained.has(relation.id)),
    'main',
  );
}
