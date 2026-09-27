import type { PublishedModel } from './types.ts';
export interface ValueStage { id: string; name: string; outcome: string; entry: string; exit: string }
export interface ValueStream { id: string; name: string; label_fr: string; description: string; beneficiary: string; value: string; trigger: string; boundary: string; stages: ValueStage[]; market_position: string; market_sources: { vendor: string; url: string; support: string; limit: string }[] }
export interface BusinessScenario { id: string; name: string; title: string; situation: string; trigger: string; objective: string; conditions: string[]; nature: string; value_stream_ids: string[]; events: string[]; objects: string[]; situations: string[]; validation_points: string[] }
export interface MobilizationStep { id: string; title: string; description: string; outcome: string; inputs: string[]; contributions: { node_id: string; role: string }[] }
export interface MobilizationPath { id: string; name: string; title: string; scenario_id: string; conditions: string[]; outcome: string; steps: MobilizationStep[]; dependencies: { from: string; to: string; condition: string }[]; sequence_note: string }
export interface ScenarioCatalog { value_streams: ValueStream[]; scenarios: BusinessScenario[]; paths: MobilizationPath[]; facets: Record<string,{ id: string; label: string }[]>; legacy_links: { owner_id: string; legacy_id: string; scenario_id: string; contribution?: string }[] }
export const catalogOf = (model: Pick<PublishedModel,'raw'>): ScenarioCatalog | undefined => model.raw.scenario_catalog as ScenarioCatalog | undefined;
export function scenarioCapabilities(catalog: ScenarioCatalog, id: string): string[] {
  return [...new Set(catalog.paths.filter(p => p.scenario_id === id).flatMap(p => p.steps.flatMap(s => s.contributions.map(c => c.node_id))))];
}
export function scenariosForNode(model: PublishedModel, id: string): BusinessScenario[] {
  const catalog = catalogOf(model); if (!catalog) return [];
  const descendants = new Set([id]);
  let changed = true;
  while (changed) { changed = false; for (const r of model.relations) if (['contains','presents'].includes(r.type) && descendants.has(r.sourceId) && !descendants.has(r.targetId)) { descendants.add(r.targetId); changed = true; } }
  return catalog.scenarios.filter(s => scenarioCapabilities(catalog,s.id).some(c => descendants.has(c)) || catalog.legacy_links.some(a => a.owner_id === id && a.scenario_id === s.id));
}
export function filterScenarios(catalog: ScenarioCatalog, filter: { stream?: string; event?: string; object?: string; situation?: string; capability?: string; query?: string }) {
  const normalized = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return catalog.scenarios.filter(s => (!filter.stream || s.value_stream_ids.includes(filter.stream)) && (!filter.event || s.events.includes(filter.event)) && (!filter.object || s.objects.includes(filter.object)) && (!filter.situation || s.situations.includes(filter.situation)) && (!filter.capability || scenarioCapabilities(catalog,s.id).includes(filter.capability)) && (!filter.query || normalized([s.title,s.situation,s.objective].join(' ')).includes(normalized(filter.query))));
}
