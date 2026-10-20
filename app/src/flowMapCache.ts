import type { FlowMapLayout } from './flowMapLayout';
import type { PublishedModel } from './types';

const cache = new WeakMap<
  PublishedModel['nodes'],
  WeakMap<PublishedModel['relations'], Map<string, Map<string, FlowMapLayout>>>
>();

/** Workshop overlays share these immutable structural arrays; hotspot revisions do not invalidate geometry. */
export function flowLayoutsFor(model: PublishedModel): Map<string, FlowMapLayout> {
  let relations = cache.get(model.nodes);
  if (!relations) {
    relations = new WeakMap();
    cache.set(model.nodes, relations);
  }
  let versions = relations.get(model.relations);
  if (!versions) {
    versions = new Map();
    relations.set(model.relations, versions);
  }
  let layouts = versions.get(model.version);
  if (!layouts) {
    layouts = new Map();
    versions.set(model.version, layouts);
  }
  return layouts;
}
