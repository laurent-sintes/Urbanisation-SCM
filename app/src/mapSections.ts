import { childrenOf } from './model.ts';
import type { AtlasNode, PublishedModel } from './types';

/** Direct references share a visible heading; historical capabilities keep theirs. */
export function directSectionCaption(items: AtlasNode[]): string {
  return items.length && items.every((item) => item.kind === 'reference')
    ? 'Référentiels communs'
    : 'Rattachement direct au sous-domaine';
}

export function startsDirectSection(items: AtlasNode[], index: number): boolean {
  const item = items[index],
    previous = items[index - 1];
  return Boolean(
    item &&
      item.kind !== 'business_area' &&
      (!previous ||
        previous.kind === 'business_area' ||
        (previous.kind === 'reference') !== (item.kind === 'reference')),
  );
}

/** Visual grouping only: explicit parents and frozen publication order stay intact. */
export function businessAreaSections(
  model: PublishedModel,
  scopeId?: string,
): { area?: AtlasNode; items: AtlasNode[] }[] | undefined {
  if (!scopeId || model.nodeById.get(scopeId)?.kind !== 'area') return;
  const children = childrenOf(model, scopeId);
  if (!children.some((child) => child.kind === 'business_area')) return;
  const sections: { area?: AtlasNode; items: AtlasNode[] }[] = [];
  for (const [index, child] of children.entries()) {
    if (child.kind === 'business_area') sections.push({ area: child, items: childrenOf(model, child.id) });
    else {
      if (startsDirectSection(children, index)) sections.push({ items: [] });
      let section = sections.at(-1);
      if (!section) {
        section = { items: [] };
        sections.push(section);
      }
      section.items.push(child);
    }
  }
  return sections;
}
