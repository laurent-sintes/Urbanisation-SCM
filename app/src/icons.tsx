import { behaviorNature } from './behaviorTypes';
import { capabilityNature } from './capabilityTypes';
import { iconFor } from './iconRegistry';
import type { AtlasNode } from './types';

export { iconFor } from './iconRegistry';

export function NodeIcon({ node, size = 18, framed = false }: { node: AtlasNode; size?: number; framed?: boolean }) {
  const Icon = iconFor(node);
  const tone = node.groupRole === 'urbanism_level' ? 'universe' : node.kind;
  return (
    <span
      className={`node-icon tone-${tone} ${framed ? 'framed' : ''}`}
      aria-hidden="true"
      data-icon-kind={tone}
      data-capability-type={capabilityNature(node)}
      data-behavior-type={behaviorNature(node)}
      data-reference-icon={node.referenceParentName}
    >
      <Icon size={size} strokeWidth={1.7} />
    </span>
  );
}
