import { plainInlineText } from './inlineLinks.ts';
import type { AtlasNode, AtlasRelation } from './types';
import { ui } from './ui.ts';
export function kindLabel(node: AtlasNode) {
  if (node.groupRole === 'urbanism_level') {
    const role = node.levelRef === 'universe' ? 'universe' : 'urbanism_level';
    return node.reading?.vocabulary?.presentation_roles?.[role]?.label ?? ui('common.type_unavailable');
  }
  const label = node.reading?.kind ?? ui('common.type_unavailable');
  return node.reading?.nature ? [label, node.reading.nature].join(' · ') : label;
}
export function statusLabel(element: AtlasNode | AtlasRelation) {
  return (
    (
      {
        accepted: ui('presentation.valide_dans_sa_portee'),
        partial: ui('presentation.partiellement_valide'),
        proposed: ui('presentation.propose'),
        under_review: ui('presentation.en_reexamen'),
      } as Record<string, string>
    )[element.status] || ui('presentation.a_qualifier')
  );
}
export function shortText(text: string, length = 145) {
  const readable = plainInlineText(text).replace(/\s+/g, ' ').trim();
  return readable.length > length ? `${readable.slice(0, length).replace(/\s+\S*$/, '')}…` : readable;
}
