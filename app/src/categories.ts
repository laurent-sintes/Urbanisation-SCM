import type { AtlasNode } from './types.ts';

export interface DisplayCategory {
  id: string;
  display_name: string;
  order?: number;
}
export interface CategorySection {
  category?: DisplayCategory;
  items: AtlasNode[];
}

/** Presentation metadata only. Never infer a category from an identifier or a name. */
export function categoryOf(node: AtlasNode): DisplayCategory | undefined {
  const value = node.fields.category;
  if (node.kind !== 'capability' || !value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const category = value as Record<string, unknown>;
  if (
    typeof category.id !== 'string' ||
    !category.id.trim() ||
    typeof category.display_name !== 'string' ||
    !category.display_name.trim()
  )
    return undefined;
  return {
    id: category.id,
    display_name: category.display_name,
    ...(typeof category.order === 'number' && Number.isFinite(category.order) ? { order: category.order } : {}),
  };
}

export function categorySections(nodes: readonly AtlasNode[]): CategorySection[] {
  if (!nodes.some(categoryOf)) return [{ items: [...nodes] }];
  const sections = new Map<string | undefined, CategorySection>();
  for (const item of nodes) {
    const category = categoryOf(item);
    const section = sections.get(category?.id);
    if (section) section.items.push(item);
    else sections.set(category?.id, { category, items: [item] });
  }
  return [...sections.values()].sort((a, b) =>
    a.category === undefined ? 1 : b.category === undefined ? -1 : (a.category.order ?? 0) - (b.category.order ?? 0),
  );
}

export function startsCategorySection(nodes: readonly AtlasNode[], index: number): boolean {
  return nodes.some(categoryOf) && (index === 0 || categoryOf(nodes[index])?.id !== categoryOf(nodes[index - 1])?.id);
}

export function categoryCaption(node: AtlasNode): string {
  return categoryOf(node)?.display_name ?? 'Autres capacités';
}
