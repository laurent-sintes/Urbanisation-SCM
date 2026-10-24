import type { AtlasNode } from './types.ts';
import { ui } from './ui.ts';

/** Explicit published nature only; names and identifiers never determine the type. */
export const capabilityTypes = {
  integration: { icon: 'ArrowLeftRight' },
  action: { icon: 'Zap' },
  management: { icon: 'SlidersHorizontal' },
  ledger: { icon: 'BookOpen' },
  knowledge: { icon: 'Eye' },
  orchestration: { icon: 'Workflow' },
  planning: { icon: 'CalendarCheck' },
  policy: { icon: 'ShieldCheck' },
  evaluation: { icon: 'Calculator' },
  decision: { icon: 'GitBranch' },
} as const;
export type CapabilityNature = keyof typeof capabilityTypes;

export function capabilityNature(node: AtlasNode): CapabilityNature | undefined {
  const nature = node.fields.nature;
  return node.kind === 'capability' && typeof nature === 'string' && Object.hasOwn(capabilityTypes, nature)
    ? (nature as CapabilityNature)
    : undefined;
}

export function capabilityTypeLabel(node: AtlasNode): string {
  return node.reading?.nature ?? ui('common.type_unavailable');
}

export const isDecision = (node: AtlasNode): boolean => capabilityNature(node) === 'decision';

/** Display order only: keep published order within each type and never mutate it. */
export function sortCapabilitiesByType(nodes: readonly AtlasNode[]): AtlasNode[] {
  const types = Object.keys(capabilityTypes) as CapabilityNature[];
  const rank = (node: AtlasNode) => {
    if (node.kind !== 'capability') return -1;
    const nature = capabilityNature(node);
    return nature ? types.indexOf(nature) : types.length;
  };
  return [...nodes].sort((a, b) => rank(a) - rank(b));
}

/** Separate adjacent capability types, including the historical untyped group. */
export function startsCapabilityTypeSection(nodes: readonly AtlasNode[], index: number): boolean {
  return (
    index > 0 &&
    nodes[index]?.kind === 'capability' &&
    nodes[index - 1]?.kind === 'capability' &&
    capabilityNature(nodes[index]) !== capabilityNature(nodes[index - 1])
  );
}
