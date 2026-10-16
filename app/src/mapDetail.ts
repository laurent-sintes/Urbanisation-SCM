import { type CardChildList, cardListedItems } from './model.ts';
import type { AtlasNode } from './types.ts';

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
  const areaLabel = visible.find((item) => item.kind === 'area')?.hierarchyLabel;
  const labels: Record<string, [string, string]> = {
    domain: ['domaine', 'domaines'],
    area:
      areaLabel === 'Purpose'
        ? ['Purpose', 'Purposes']
        : areaLabel === 'Area'
          ? ['Area', 'Areas']
          : ['sous-domaine', 'sous-domaines'],
    business_area: ['Business Area', 'Business Areas'],
    capability: ['capacité', 'capacités'],
    reference: ['référentiel', 'référentiels'],
    behavior: ['comportement', 'comportements'],
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
