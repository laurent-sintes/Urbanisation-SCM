import type { AtlasNode } from './types.ts';

export const requestOriginLabels = {
  frontoffice: { label: 'Frontoffice', description: 'Sollicitation initiée à l’extérieur du Domain.' },
  backoffice: { label: 'Backoffice', description: 'Sollicitation initiée à l’intérieur du Domain.' },
} as const;
export type RequestOrigin = keyof typeof requestOriginLabels;

export const behaviorAspectLabels = {
  trigger: 'Déclenchement',
  activity: 'Activité',
} as const;
export type BehaviorAspect = keyof typeof behaviorAspectLabels;

/** Origins are non-exclusive, explicit metadata; absence never means an external request. */
export function requestOrigins(node: AtlasNode): RequestOrigin[] {
  const values = node.fields.request_origins;
  if (node.kind !== 'capability' || !Array.isArray(values)) return [];
  return (Object.keys(requestOriginLabels) as RequestOrigin[]).filter((origin) => values.includes(origin));
}

/** A reading angle is separate from the behavior's nature and its structural parent. */
export function behaviorAspect(node: AtlasNode): BehaviorAspect | undefined {
  const value = node.fields.behavior_aspect;
  return node.kind === 'behavior' && typeof value === 'string' && Object.hasOwn(behaviorAspectLabels, value)
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
  const groups: BehaviorReadingGroup[] = (Object.keys(behaviorAspectLabels) as BehaviorAspect[]).map((aspect) => ({
    key: aspect,
    label: behaviorAspectLabels[aspect],
    behaviors: behaviors.filter((behavior) => behaviorAspect(behavior) === aspect),
  }));
  groups.push({
    key: 'other',
    label: 'Autres comportements',
    behaviors: behaviors.filter((behavior) => !behaviorAspect(behavior)),
  });
  return groups.filter((group) => group.behaviors.length > 0);
}

/** Only the explicit labels and definitions shown on the sheet enter public search. */
export function requestMetadataSearchText(node: AtlasNode): string {
  const aspect = behaviorAspect(node);
  return [
    ...requestOrigins(node).map(
      (origin) => `${requestOriginLabels[origin].label} : ${requestOriginLabels[origin].description}`,
    ),
    ...(aspect ? [behaviorAspectLabels[aspect]] : []),
  ].join('\n');
}
