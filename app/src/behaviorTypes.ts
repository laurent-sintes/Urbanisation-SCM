import type { AtlasNode } from './types.ts';

export const behaviorTypes = {
  policy_strategy: { label: 'Policy / Strategy', icon: 'SlidersHorizontal' },
  process_variant: { label: 'Process Variant', icon: 'Route' },
  intervention_mechanism: { label: 'Intervention Mechanism', icon: 'Settings2' },
  business_scope: { label: 'Business Scope', icon: 'ScanLine' },
  decision_dimension: { label: 'Decision Dimension', icon: 'Compass' },
  business_effect: { label: 'Business Effect', icon: 'ArrowLeftRight' },
  planning_practice: { label: 'Planning Practice', icon: 'CalendarCheck' },
} as const;
export type BehaviorNature = keyof typeof behaviorTypes;
export function behaviorNature(node: AtlasNode): BehaviorNature | undefined {
  const value = node.fields.nature;
  return node.kind === 'behavior' && typeof value === 'string' && Object.hasOwn(behaviorTypes, value)
    ? value as BehaviorNature : undefined;
}
export function behaviorTypeLabel(node: AtlasNode): string {
  const nature = behaviorNature(node);
  return nature ? behaviorTypes[nature].label : 'Unspecified Type';
}
