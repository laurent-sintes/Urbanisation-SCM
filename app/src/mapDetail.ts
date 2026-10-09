import type { CardChildList } from './model.ts';

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
