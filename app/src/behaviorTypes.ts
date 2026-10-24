import type { AtlasNode } from './types.ts';
import { ui } from './ui.ts';

export const behaviorTypes = {
  policy_strategy: { icon: 'SlidersHorizontal' },
  process_variant: { icon: 'Route' },
  intervention_mechanism: { icon: 'Settings2' },
  business_scope: { icon: 'ScanLine' },
  decision_dimension: { icon: 'Compass' },
  business_effect: { icon: 'ArrowLeftRight' },
  planning_practice: { icon: 'CalendarCheck' },
} as const;
export type BehaviorNature = keyof typeof behaviorTypes;
export function behaviorNature(node: AtlasNode): BehaviorNature | undefined {
  const value = node.fields.nature;
  return node.kind === 'behavior' && typeof value === 'string' && Object.hasOwn(behaviorTypes, value)
    ? (value as BehaviorNature)
    : undefined;
}
export function behaviorTypeLabel(node: AtlasNode): string {
  return node.reading?.nature ?? ui('common.type_unavailable');
}
