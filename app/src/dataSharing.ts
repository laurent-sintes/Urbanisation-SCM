import { ui } from './coreUi.ts';
import type { MapSlot } from './mapPlacement.ts';
import type { AtlasRelation, DataExchange, Hotspot, PublishedModel, RawRelation } from './types.ts';

export function readDataExchange(relation: RawRelation, glossaryIds: ReadonlySet<string>): DataExchange | undefined {
  const raw = relation.fields?.data_exchange;
  if (relation.type !== 'shares-data') {
    if (raw !== undefined)
      throw new Error(ui('dataSharing.partage_de_donnees_sur_une_relation_incompatible', { id: relation.id }));
    if (relation.fields?.summary_label !== undefined)
      throw new Error(ui('dataSharing.synthese_de_partage_sur_une_relation_incompatible', { id: relation.id }));
    return undefined;
  }
  const exchange = raw as DataExchange | undefined;
  if (
    relation.source_id === relation.target_id ||
    typeof relation.fields?.label !== 'string' ||
    !relation.fields.label.trim() ||
    (relation.fields.summary_label !== undefined &&
      (typeof relation.fields.summary_label !== 'string' || !relation.fields.summary_label.trim())) ||
    !exchange ||
    typeof exchange.purpose !== 'string' ||
    !exchange.purpose.trim() ||
    !Array.isArray(exchange.contents) ||
    !exchange.contents.length ||
    exchange.contents.some(
      (content) =>
        !content ||
        typeof content.name !== 'string' ||
        !content.name.trim() ||
        typeof content.description !== 'string' ||
        !content.description.trim() ||
        !Array.isArray(content.glossary_refs) ||
        !content.glossary_refs.length ||
        content.glossary_refs.some((id: string) => !glossaryIds.has(id)),
    ) ||
    new Set(exchange.contents.map((content) => content.name)).size !== exchange.contents.length
  )
    throw new Error(ui('dataSharing.contenu_de_partage_de_donnees_invalide', { id: relation.id }));
  return exchange;
}

export interface SystemDataSharing {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  detailLabel: string;
  relations: readonly AtlasRelation[];
}

/** An integration hotspot belongs on a published exchange only when it names both ends. */
export function hotspotDataSharing(
  hotspot: Hotspot,
  exchanges: readonly SystemDataSharing[],
): SystemDataSharing | undefined {
  if (hotspot.kind !== 'integration') return undefined;
  const anchors = new Set(hotspot.location.node_ids);
  const matches = exchanges.filter((exchange) =>
    exchange.relations.some((relation) => anchors.has(relation.sourceId) && anchors.has(relation.targetId)),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/** Floating ribbons straddle card borders; only their shadow needs space above the map. */
export function dataSharingHeadroom(exchanges: readonly SystemDataSharing[]): number {
  return exchanges.length ? 32 : 0;
}

/** Keep card text clear of the floating ribbons, without pushing Logistics away from Operations. */
export function dataSharingCardInsets(
  exchanges: readonly SystemDataSharing[],
  slots: readonly MapSlot[] | undefined,
  ids: readonly string[],
): Map<string, { top: number; bottom: number }> {
  const insets = new Map(ids.map((id) => [id, { top: 0, bottom: 0 }]));
  const columns = new Map(slots?.map((slot) => [ids[slot.index], slot.column]) || []);
  const rows = new Map(slots?.map((slot) => [ids[slot.index], slot.row]) || []);
  const lanes: { left: number; right: number }[][] = [];
  for (const exchange of exchanges) {
    const source = columns.get(exchange.sourceId);
    const target = columns.get(exchange.targetId);
    const sourceInset = insets.get(exchange.sourceId);
    const targetInset = insets.get(exchange.targetId);
    if (!sourceInset || !targetInset) continue;
    if (source === undefined || target === undefined) {
      sourceInset.top = targetInset.top = 124;
      sourceInset.bottom = targetInset.bottom = 92;
      continue;
    }
    if (source === target) {
      const down = (rows.get(exchange.sourceId) || 0) < (rows.get(exchange.targetId) || 0);
      const upper = down ? sourceInset : targetInset;
      const lower = down ? targetInset : sourceInset;
      upper.bottom = Math.max(upper.bottom, 124);
      lower.top = Math.max(lower.top, 124);
      continue;
    }
    const extent = { left: Math.min(source, target) + 0.75, right: Math.max(source, target) + 0.25 };
    let lane = lanes.findIndex((items) => items.every((item) => extent.right < item.left || extent.left > item.right));
    if (lane < 0) lane = lanes.length;
    lanes[lane] ||= [];
    lanes[lane].push(extent);
    sourceInset.top = Math.max(sourceInset.top, 48 + lane * 76);
    targetInset.top = Math.max(targetInset.top, 48 + lane * 76);
  }
  return insets;
}

/** Project published relations through explicit parents; never infer a reverse exchange. */
export function systemDataSharing(model: PublishedModel): SystemDataSharing[] {
  const parents = new Map(
    model.relations.filter((r) => r.type === 'contains' || r.type === 'presents').map((r) => [r.targetId, r.sourceId]),
  );
  const systemOf = (id: string): string | undefined => {
    const visited = new Set<string>();
    let current: string | undefined = id;
    while (current && !visited.has(current)) {
      visited.add(current);
      if (model.nodeById.get(current)?.kind === 'business_system') return current;
      current = parents.get(current);
    }
    return undefined;
  };
  const groups = new Map<string, SystemDataSharing>();
  for (const relation of model.relations) {
    if (relation.type !== 'shares-data' || !relation.dataExchange) continue;
    const sourceId = systemOf(relation.sourceId);
    const targetId = systemOf(relation.targetId);
    if (!sourceId || !targetId || sourceId === targetId) continue;
    const id = `${sourceId}/${targetId}`;
    const group = groups.get(id);
    const relations = group ? [...group.relations, relation] : [relation];
    const summaries = [
      ...new Set(
        relations
          .filter((r) => r.sourceId === sourceId && r.targetId === targetId)
          .map((r) => r.fields.summary_label)
          .filter((label): label is string => typeof label === 'string'),
      ),
    ];
    if (summaries.length > 1) throw new Error(ui('dataSharing.libelles_de_synthese_contradictoires', { id: id }));
    const detailLabel = [...new Set(relations.map((r) => r.label))].join(' · ');
    groups.set(id, {
      id,
      sourceId,
      targetId,
      relations,
      label: summaries[0] || detailLabel,
      detailLabel,
    });
  }
  return [...groups.values()];
}
