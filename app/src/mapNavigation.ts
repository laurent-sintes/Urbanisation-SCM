import { defaultMapDepth, mapDepthLimit } from './mapProjection.ts';
import { lineageOf } from './model.ts';
import type { RouteState } from './navigation.ts';
import type { PublishedModel } from './types.ts';

/** Open an object's published map at the level that actually displays it. */
export function mapRouteForNode(model: PublishedModel, id: string): Partial<RouteState> {
  const node = model.nodeById.get(id);
  if (!node || node.kind === 'universe')
    return {
      view: 'map',
      node: '',
      scope: '@root',
      mapDepth: defaultMapDepth('universe'),
      mapFocus: '',
      relation: '',
      section: '',
    };
  const path = lineageOf(model, id);
  const domain = path.find((item) => item.kind === 'domain');
  const system = path.find((item) => item.kind === 'business_system');
  const scope = domain?.id || system?.id || id;
  const desired =
    node.kind === 'behavior'
      ? 4
      : node.kind === 'capability' || node.kind === 'reference'
        ? 3
        : node.kind === 'business_area'
          ? 2
          : node.kind === 'area'
            ? 1
            : defaultMapDepth(node.kind);
  const mapDepth = Math.min(desired, mapDepthLimit(model, scope)) as RouteState['mapDepth'];
  return {
    view: 'map',
    node: id,
    scope,
    mapDepth,
    mapFocus: node.kind === 'business_system' || node.kind === 'domain' ? '' : id,
    relation: '',
    section: '',
  };
}
