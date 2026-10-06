import {childrenOf} from './model.ts';
import type {AtlasNode, PublishedModel} from './types';

/** Visual grouping only: explicit parents and frozen publication order stay intact. */
export function businessAreaSections(model: PublishedModel, scopeId?: string): {area?: AtlasNode; items: AtlasNode[]}[] | undefined {
  if (!scopeId || model.nodeById.get(scopeId)?.kind !== 'area') return;
  const children = childrenOf(model, scopeId);
  if (!children.some(child => child.kind === 'business_area')) return;
  const sections: {area?: AtlasNode; items: AtlasNode[]}[] = [];
  for (const child of children) {
    if (child.kind === 'business_area') sections.push({area: child, items: childrenOf(model, child.id)});
    else {
      if (!sections.length || sections.at(-1)!.area) sections.push({items: []});
      sections.at(-1)!.items.push(child);
    }
  }
  return sections;
}
