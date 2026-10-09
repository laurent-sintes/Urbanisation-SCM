import { behaviorTypeLabel } from './behaviorTypes.ts';
import { capabilityTypeLabel } from './capabilityTypes.ts';
import { plainInlineText } from './inlineLinks.ts';
import type { AtlasNode, AtlasRelation } from './types';
export function kindLabel(node: AtlasNode) {
  if (node.kind === 'universe')
    return node.name === 'Enterprise Architecture' || node.name === 'Univers' ? node.name : 'Universe';
  if (node.kind === 'business_system') return 'Business System';
  if (node.groupRole === 'urbanism_level') return node.levelRef === 'universe' ? 'Universe' : 'Urbanism Level';
  if (node.kind === 'capability') return `Capability · ${capabilityTypeLabel(node)}`;
  if (node.kind === 'behavior') return `Behavior · ${behaviorTypeLabel(node)}`;
  if (node.kind === 'area') return node.hierarchyLabel === 'Sous-domaine' ? 'Subdomain' : node.hierarchyLabel || 'Area';
  return (
    (
      {
        domain: 'Domain',
        area: 'Area',
        business_area: 'Business Area',
        reference: 'Business Reference',
        group: 'Presentation Group',
        object: 'Business Object',
        document: 'Document',
        event: 'Event',
      } as Record<string, string>
    )[node.kind] || node.kind
  );
}
export function modelingDepthLabel(node: AtlasNode): string {
  if (node.kind === 'domain' && node.fields.modeling_depth === 'domains') return 'Vue de domaine';
  return (
    (
      { context: 'Vue de contexte', domains: 'Vue des domaines', behaviors: 'Capacités et comportements' } as Record<
        string,
        string
      >
    )[String(node.fields.modeling_depth)] || ''
  );
}
export function statusLabel(element: AtlasNode | AtlasRelation) {
  return (
    (
      {
        accepted: 'Validé dans sa portée',
        partial: 'Partiellement validé',
        proposed: 'Proposé',
        under_review: 'En réexamen',
      } as Record<string, string>
    )[element.status] || 'À qualifier'
  );
}
export function shortText(text: string, length = 145) {
  const readable = plainInlineText(text).replace(/\s+/g, ' ').trim();
  return readable.length > length ? `${readable.slice(0, length).replace(/\s+\S*$/, '')}…` : readable;
}
