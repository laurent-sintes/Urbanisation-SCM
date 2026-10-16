import type { FlowMapBox } from './flowMapLayout.ts';
import { descendantsOf } from './model.ts';
import type { AtlasRelation, PublishedModel } from './types.ts';

/** A scoped map omits published exchanges whose other endpoint is outside its hierarchy. */
export function flowMapBoundaryRelations(model: PublishedModel, scopeId?: string): AtlasRelation[] {
  if (!scopeId || !model.nodeById.has(scopeId)) return [];
  const inside = new Set([scopeId, ...descendantsOf(model, scopeId).map((node) => node.id)]);
  return model.relations.filter(
    (relation) =>
      ['shares-data', 'provides-knowledge'].includes(relation.type) &&
      model.nodeById.has(relation.sourceId) &&
      model.nodeById.has(relation.targetId) &&
      inside.has(relation.sourceId) !== inside.has(relation.targetId),
  );
}

/** Preserve business restrictions and avoid repeating a purpose that already states the meaning. */
export function flowExchangeContract(relation: AtlasRelation): { label: string; texts: string[] }[] {
  const normalize = (text: string) => text.trim().replace(/\s+/g, ' ');
  const meaning = relation.qualification.meaning?.trim();
  const purpose = relation.dataExchange?.purpose.trim();
  const sections: { label: string; texts: string[] }[] = [];
  if (meaning) sections.push({ label: 'Sens métier', texts: [meaning] });
  if (purpose && normalize(purpose) !== normalize(meaning || ''))
    sections.push({ label: 'Finalité', texts: [purpose] });
  for (const [key, label] of [
    ['conditions', 'Conditions'],
    ['effects', 'Effets'],
    ['scope', 'Périmètre'],
  ] as const) {
    const value = relation.qualification[key];
    const texts = (Array.isArray(value) ? value : [value])
      .filter((text): text is string => typeof text === 'string' && !!text.trim())
      .map((text) => text.trim());
    if (texts.length) sections.push({ label, texts: [...new Set(texts)] });
  }
  return sections;
}

function median(values: number[]): number {
  const sorted = values.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Choose a readable, uniform exchange depth without moving or resizing any territory. */
export function flowMapDetailBoxes(boxes: readonly FlowMapBox[], zoom: number): FlowMapBox[] {
  const scale = Number.isFinite(zoom) ? Math.max(0, zoom) : 0;
  const depths = new Map<number, FlowMapBox[]>();
  for (const box of boxes) {
    const group = depths.get(box.depth) || [];
    group.push(box);
    depths.set(box.depth, group);
  }
  let maxDepth = 0;
  for (let depth = 1; depths.has(depth); depth++) {
    const group = depths.get(depth) || [];
    if (median(group.map((box) => box.width)) * scale < 150 || median(group.map((box) => box.height)) * scale < 36)
      break;
    maxDepth = depth;
  }
  const allowed = new Set<string>();
  for (let depth = 0; depth <= maxDepth; depth++) {
    for (const box of depths.get(depth) || []) {
      if (
        depth === 0 ||
        (box.width * scale >= 85 && box.height * scale >= 32 && (!box.parentId || allowed.has(box.parentId)))
      )
        allowed.add(box.id);
    }
  }
  return boxes.filter((box) => allowed.has(box.id));
}
