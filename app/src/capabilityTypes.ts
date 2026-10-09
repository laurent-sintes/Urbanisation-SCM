import type { AtlasNode } from './types.ts';

/** Explicit published nature only; names and identifiers never determine the type. */
export const capabilityTypes = {
  integration: { label: 'Integration', icon: 'ArrowLeftRight' },
  action: { label: 'Action', icon: 'Zap' },
  management: { label: 'Management', icon: 'SlidersHorizontal' },
  ledger: { label: 'Ledger', icon: 'BookOpen' },
  knowledge: { label: 'Knowledge / Visibility', icon: 'Eye' },
  orchestration: { label: 'Orchestration', icon: 'Workflow' },
  planning: { label: 'Planning', icon: 'CalendarCheck' },
  policy: { label: 'Policy', icon: 'ShieldCheck' },
  evaluation: { label: 'Evaluation', icon: 'Calculator' },
  decision: { label: 'Decision', icon: 'GitBranch' },
} as const;
export type CapabilityNature = keyof typeof capabilityTypes;

export function capabilityNature(node: AtlasNode): CapabilityNature | undefined {
  const nature = node.fields.nature;
  return node.kind === 'capability' && typeof nature === 'string' && Object.hasOwn(capabilityTypes, nature)
    ? (nature as CapabilityNature)
    : undefined;
}

export function capabilityTypeLabel(node: AtlasNode): string {
  const nature = capabilityNature(node);
  return nature ? capabilityTypes[nature].label : 'Unspecified Type';
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
