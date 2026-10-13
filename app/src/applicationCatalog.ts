import { lineageOf, visibleAncestorId } from './model.ts';
import type {
  ApplicationCatalog,
  ApplicationComponent,
  ApplicationMapping,
  ApplicationProduct,
  ApplicationSelection,
  PublishedModel,
} from './types';

export const contextName: Record<string, string> = {
  'beaumanoir-historique': 'SI Beaumanoir Marques Historiques',
  boardriders: 'SI Boardriders',
  sarenza: 'SI Sarenza',
  'flow-platform': 'SI Beaumanoir cible',
};

export function productFor(
  catalog: ApplicationCatalog,
  selection: ApplicationSelection,
): ApplicationProduct | undefined {
  return catalog.products.find((product) => product.id === selection.product_id);
}

export function componentBranch(product: ApplicationProduct, componentId?: string): ApplicationComponent[] {
  if (!componentId) return product.components;
  const ids = new Set([componentId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const component of product.components) {
      if (component.parent_id && ids.has(component.parent_id) && !ids.has(component.id)) {
        ids.add(component.id);
        changed = true;
      }
    }
  }
  return product.components.filter((component) => ids.has(component.id));
}

export function selectionMappings(
  catalog: ApplicationCatalog | undefined,
  selectionId?: string,
  componentId?: string,
): ApplicationMapping[] {
  if (!catalog) return [];
  const selection = catalog.selections.find((item) => item.id === selectionId);
  const product = selection
    ? productFor(catalog, selection)
    : catalog.products.find((item) => item.id === selectionId && item.kind === 'vendor_product');
  if (!product) return [];
  const ids = new Set(componentBranch(product, componentId).map((component) => component.id));
  // An editor's offering never fills gaps in the documented use of an SI.
  return (selection ? selection.mappings : product.offering_mappings || []).filter((mapping) =>
    ids.has(mapping.component_id),
  );
}

/** Project each exact business link to visible ancestors; never infer coverage of descendants. */
export function applicationMapIds(model: PublishedModel, mappings: ApplicationMapping[]): Set<string> {
  return new Set(
    mappings.flatMap((mapping) =>
      model.nodeById.has(mapping.node_id) ? lineageOf(model, mapping.node_id).map((node) => node.id) : [],
    ),
  );
}

/** Highlight the nearest displayed ancestor of each mapping, including a BA when its capability is hidden. */
export function projectedApplicationMapIds(
  model: PublishedModel,
  mappings: ApplicationMapping[],
  visibleIds: ReadonlySet<string>,
): Set<string> {
  return new Set(
    mappings.flatMap((mapping) => {
      if (!model.nodeById.has(mapping.node_id)) return [];
      const visible = visibleAncestorId(model, mapping.node_id, visibleIds);
      return visible ? [visible] : [];
    }),
  );
}
