import type { AtlasNode } from './types.ts';
import { ui } from './ui.ts';

const originKeys = ['frontoffice', 'backoffice'] as const;
export type RequestOrigin = (typeof originKeys)[number];
const aspectKeys = ['trigger', 'activity'] as const;
export type BehaviorAspect = (typeof aspectKeys)[number];
export function requestOrigin(node: AtlasNode, origin: RequestOrigin) {
  return (
    node.reading?.vocabulary?.request_origins?.[origin] ?? { label: ui('common.type_unavailable'), description: '' }
  );
}
export function behaviorAspectLabel(node: AtlasNode, aspect: BehaviorAspect) {
  return node.reading?.vocabulary?.behavior_aspects?.[aspect]?.label ?? ui('common.type_unavailable');
}

/** Origins are non-exclusive, explicit metadata; absence never means an external request. */
export function requestOrigins(node: AtlasNode): RequestOrigin[] {
  const values = node.fields.request_origins;
  if (node.kind !== 'capability' || !Array.isArray(values)) return [];
  return originKeys.filter((origin) => values.includes(origin));
}

/** A reading angle is separate from the behavior's nature and its structural parent. */
export function behaviorAspect(node: AtlasNode): BehaviorAspect | undefined {
  const value = node.fields.behavior_aspect;
  return node.kind === 'behavior' && typeof value === 'string' && aspectKeys.includes(value as BehaviorAspect)
    ? (value as BehaviorAspect)
    : undefined;
}

export interface BehaviorReadingGroup {
  key: BehaviorAspect | 'other';
  label?: string;
  behaviors: readonly AtlasNode[];
}

/** Presentation only: preserve each behavior and its order within a reading group. */
export function behaviorReadingGroups(behaviors: readonly AtlasNode[]): BehaviorReadingGroup[] {
  if (!behaviors.length) return [];
  if (!behaviors.some((behavior) => behaviorAspect(behavior))) return [{ key: 'other', behaviors }];
  const groups: BehaviorReadingGroup[] = aspectKeys.map((aspect) => ({
    key: aspect,
    label: behaviorAspectLabel(behaviors[0], aspect),
    behaviors: behaviors.filter((behavior) => behaviorAspect(behavior) === aspect),
  }));
  groups.push({
    key: 'other',
    label: ui('common.other_behaviors'),
    behaviors: behaviors.filter((behavior) => !behaviorAspect(behavior)),
  });
  return groups.filter((group) => group.behaviors.length > 0);
}

/** Only the explicit labels and definitions shown on the sheet enter public search. */
export function requestMetadataSearchText(node: AtlasNode): string {
  const aspect = behaviorAspect(node);
  return [
    ...requestOrigins(node).map(
      (origin) => `${requestOrigin(node, origin).label} : ${requestOrigin(node, origin).description}`,
    ),
    ...(aspect ? [behaviorAspectLabel(node, aspect)] : []),
  ].join('\n');
}
