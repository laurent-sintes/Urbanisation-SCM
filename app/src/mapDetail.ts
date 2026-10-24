import { type CardChildList, cardListedItems } from './model.ts';
import type { AtlasNode } from './types.ts';
import { ui } from './ui.ts';

/** Count the objects actually shown, keeping Business Areas distinct from the entries they contain. */
export function cardListStatistics(
  list: CardChildList,
  detail: number,
  behaviorsByCapability: Record<string, AtlasNode[]> = {},
): { kind: string; count: number; label: string }[] {
  const listed = detail < 3 && list.businessAreaChildren ? list.items : cardListedItems(list);
  const visible = [
    ...(detail >= 3 && list.businessAreaChildren ? list.items.filter((item) => item.kind === 'business_area') : []),
    ...listed,
    ...(detail >= 4 ? listed.flatMap((item) => behaviorsByCapability[item.id] || []) : []),
  ];
  const areaKind = visible.find((item) => item.kind === 'area')?.hierarchyKind;
  const labels: Record<string, [string, string]> = {
    domain: [ui('mapDetail.domaine'), ui('mapDetail.domaines')],
    area:
      areaKind === 'purpose'
        ? [ui('mapDetail.purpose'), ui('mapDetail.purposes')]
        : areaKind === 'area'
          ? [ui('mapDetail.area'), ui('mapDetail.areas')]
          : [ui('mapDetail.sous_domaine'), ui('mapDetail.sous_domaines')],
    business_area: [ui('mapDetail.business_area'), ui('mapDetail.business_areas')],
    capability: [ui('mapDetail.capacite'), ui('mapDetail.capacites')],
    reference: [ui('mapDetail.referentiel'), ui('mapDetail.referentiels')],
    behavior: [ui('mapDetail.comportement'), ui('mapDetail.comportements')],
  };
  const counts = new Map<string, number>();
  for (const item of visible) counts.set(item.kind, (counts.get(item.kind) || 0) + 1);
  return Object.entries(labels).flatMap(([kind, names]) => {
    const count = counts.get(kind) || 0;
    return count ? [{ kind, count, label: names[count === 1 ? 0 : 1] }] : [];
  });
}

/** Keep the visible contents aligned with the chosen hierarchy level. */
export function areaListAtDetail(list: CardChildList, detail: number): CardChildList {
  if (detail !== 2) return list;
  return {
    ...list,
    items: list.items.filter((child) => child.kind === 'business_area'),
    businessAreaChildren: list.businessAreaChildren
      ? Object.fromEntries(Object.keys(list.businessAreaChildren).map((id) => [id, []]))
      : undefined,
  };
}
