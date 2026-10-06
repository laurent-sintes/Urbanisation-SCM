import type {
  AtlasNode, AtlasRelation, GraphProjection, JsonRecord, NeighborhoodOptions,
  PublishedModel, RawPublication, StructuralRelationType,
} from './types.ts';

import { plainInlineText } from './inlineLinks.ts';
import { sortCapabilitiesByType } from './capabilityTypes.ts';
import { categorySections } from './categories.ts';
import { searchPublication } from './search.ts';
import { validateDisplayIndex } from './displayCodes.ts';
const structuralTypes = new Set<string>(['contains', 'presents']);
export const isStructural = (relation: AtlasRelation): boolean => structuralTypes.has(relation.type);

export function textField(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string').join('\n');
  return '';
}

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}

function uniqueMap<T extends { id: string }>(items: readonly T[], label: string): Map<string, T> {
  const index = new Map<string, T>();
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id.trim() || index.has(item.id)) {
      throw new Error(`${label} : identifiant absent ou dupliqué (${item.id}).`);
    }
    index.set(item.id, item);
  }
  return index;
}

/** Accept an API response or the raw snapshot loaded by load-publication.mjs. */
export function adaptPublication(input: RawPublication): PublishedModel {
  if (!input || input.space !== 'release' || !input.version || !Array.isArray(input.nodes) || !Array.isArray(input.relations)) {
    throw new Error('Une publication release explicite avec nodes et relations est requise.');
  }
  // Cloning prevents either renderer from altering the API response or another view.
  const raw = freezeDeep(structuredClone(input));
  validateDisplayIndex(raw);
  const usesPurposes = Array.isArray(raw.principles) && raw.principles.some(p => p?.id === 'PRINCIPLE-DOMAIN-PURPOSE');
  const usesSubdomains = Array.isArray(raw.principles) && raw.principles.some(p => p?.id === 'PRINCIPLE-DOMAIN-SUBDOMAIN');
  const referenceParents = new Map(raw.nodes.filter(node => node.kind === 'reference').map(node => [node.id, textField(node.fields?.name)]));
  const referenceByChild = new Map(raw.relations.filter(edge => edge.type === 'contains' && referenceParents.has(edge.source_id)).map(edge => [edge.target_id, referenceParents.get(edge.source_id)]));
  for (const edge of raw.relations.filter(edge => edge.type === 'documents-reference')) {
    referenceByChild.set(edge.source_id, referenceParents.get(edge.target_id));
  }
  const nodes: AtlasNode[] = raw.nodes.map(node => {
    const fields = node.fields ?? {};
    return freezeDeep({
      id: node.id, displayCode: raw.display_index?.codes[node.id], name: plainInlineText(textField(fields.name)) || node.id, kind: node.kind,
      hierarchyLabel: node.kind === 'area' ? (usesSubdomains ? 'Sous-domaine' : usesPurposes ? 'Purpose' : 'Area') : undefined,
      referenceParentName: node.kind === 'capability' ? referenceByChild.get(node.id) : undefined,
      groupRole: node.group_role, levelRef: node.level_ref,
      revision: node.revision, lastModified: node.last_modified,
      purpose: textField(fields.finality), definition: textField(fields.definition), scope: textField(fields.scope),
      fields, review: node.review ?? {}, lifecycle: node.lifecycle,
      status: node.review?.state ?? 'unknown',
      fieldStatus: node.field_status ?? node.field_review ?? {},
      approvedFields: node.approved_fields ?? [], proposedFields: node.proposed_fields ?? [],
      adoptionIds: node.adoption_ids ?? [], sourceRefs: node.source_refs ?? [],
      sourceLocator: node.source_locator, raw: node,
    });
  });
  const nodeById = uniqueMap(nodes, 'Nœud');
  const glossary = raw.glossary?.terms ?? [];
  if (!Array.isArray(glossary)) throw new Error('Glossaire publié invalide.');
  const glossaryById = uniqueMap(glossary, 'Terme');
  const catalogue = raw.information_catalog;
  if (catalogue !== undefined && (!catalogue || !Array.isArray(catalogue.items) || !Array.isArray(catalogue.links))) {
    throw new Error('Catalogue d’informations publié invalide.');
  }
  const information = catalogue?.items ?? [], informationLinks = catalogue?.links ?? [];
  const informationById = uniqueMap(information, 'Information');
  const informationLinkById = uniqueMap(informationLinks, 'Lien d’information');
  const allIds = new Set([...nodeById.keys(), ...raw.relations.map(r => r.id)]);
  for (const id of [...(catalogue ? [catalogue.id] : []), ...informationById.keys(), ...informationLinkById.keys()]) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('Identité d’information absente.');
    if (allIds.has(id)) throw new Error(`Identité partagée par une information : ${id}.`);
    allIds.add(id);
  }
  for (const item of information) {
    if (['name', 'label_fr', 'definition', 'question', 'context', 'granularity_rationale', 'document_and_fact_boundary'].some(key => typeof item[key as keyof typeof item] !== 'string' || !String(item[key as keyof typeof item]).trim())
      || ['essential_elements', 'boundaries', 'examples', 'market_comparisons', 'capability_roles'].some(key => !Array.isArray(item[key as keyof typeof item]) || !(item[key as keyof typeof item] as unknown[]).length)) {
      throw new Error(`Information publiée incomplète : ${item.id}.`);
    }
    const roles = new Set<string>();
    for (const role of item.capability_roles) {
      if (nodeById.get(role.capability_ref)?.kind !== 'capability' || roles.has(role.capability_ref)) {
        throw new Error(`Rôle de capacité invalide pour l’information ${item.id}.`);
      }
      roles.add(role.capability_ref);
    }
  }
  for (const link of informationLinks) {
    if (!informationById.has(link.from_ref) || !informationById.has(link.to_ref) || link.from_ref === link.to_ref) {
      throw new Error(`Extrémité inconnue pour le lien d’information ${link.id}.`);
    }
  }
  const relations: AtlasRelation[] = raw.relations.map(relation => {
    if (!nodeById.has(relation.source_id) || !nodeById.has(relation.target_id)) {
      throw new Error(`Extrémité inconnue pour la relation ${relation.id}.`);
    }
    return freezeDeep({
      id: relation.id, sourceId: relation.source_id, targetId: relation.target_id,
      type: relation.type, revision: relation.revision, lastModified: relation.last_modified,
      label: textField(relation.fields?.label) || textField(relation.fields?.verb) || relation.type,
      qualification: relation.qualification ?? {}, fields: relation.fields ?? {},
      review: relation.review ?? {}, lifecycle: relation.lifecycle,
      status: relation.review?.state ?? 'unknown', fieldStatus: relation.field_status ?? relation.field_review ?? {},
      approvedFields: relation.approved_fields ?? [], proposedFields: relation.proposed_fields ?? [],
      adoptionIds: relation.adoption_ids ?? [], sourceRefs: relation.source_refs ?? [],
      sourceLocator: relation.source_locator, raw: relation,
    });
  });
  const relationById = uniqueMap(relations, 'Relation');
  // An ambiguous/cyclic hierarchy cannot be resolved by guessing from identifiers.
  const parentByChild = new Map<string, string>();
  for (const relation of relations.filter(isStructural)) {
    if (parentByChild.has(relation.targetId)) throw new Error(`Plusieurs parents explicites pour ${relation.targetId}.`);
    parentByChild.set(relation.targetId, relation.sourceId);
  }
  for (const node of nodes) {
    if (node.kind === 'behavior') {
      const parent = nodeById.get(parentByChild.get(node.id) ?? '');
      const relation = relations.find(edge => isStructural(edge) && edge.targetId === node.id);
      if (parent?.kind !== 'capability' || relation?.type !== 'contains') {
        throw new Error(`Comportement sans rattachement unique à une capacité : ${node.id}.`);
      }
      if (relations.some(edge => isStructural(edge) && edge.sourceId === node.id)) {
        throw new Error(`Un comportement est un niveau terminal : ${node.id}.`);
      }
    }
    const seen = new Set<string>();
    let cursor: string | undefined = node.id;
    while (cursor !== undefined) {
      if (seen.has(cursor)) throw new Error(`Cycle de navigation explicite à ${cursor}.`);
      seen.add(cursor);
      cursor = parentByChild.get(cursor);
    }
  }
  return Object.freeze({
    version: raw.version, revision: raw.revision, sourcePath: raw.sourcePath,
    publication: Object.freeze({ version: raw.version, revision: raw.revision, sourcePath: raw.sourcePath }),
    nodes: Object.freeze(nodes), relations: Object.freeze(relations), nodeById, relationById,
    glossary: Object.freeze(glossary), glossaryById,
    hasInformationCatalogue: catalogue !== undefined,
    information: Object.freeze(information), informationById, informationLinks: Object.freeze(informationLinks),
    sourceReferences: raw.sourceReferences ?? {}, limitations: raw.limitations ?? [], raw,
  });
}

export function structuralRelations(model: PublishedModel, type?: StructuralRelationType): AtlasRelation[] {
  return model.relations.filter(relation => type ? relation.type === type : isStructural(relation));
}

export function childrenOf(model: PublishedModel, id: string, type?: StructuralRelationType): AtlasNode[] {
  if (model.raw.display_index) return (model.raw.display_index.children[id] ?? [])
    .filter(child => !type || model.relations.some(r => r.sourceId === id && r.targetId === child && r.type === type))
    .map(child => model.nodeById.get(child)!);
  const children = structuralRelations(model, type).filter(relation => relation.sourceId === id).map(relation => model.nodeById.get(relation.targetId)!);
  const kind = model.nodeById.get(id)?.kind;
  if (kind === 'area') return categorySections(children).flatMap(section => sortCapabilitiesByType(section.items));
  return ['domain', 'reference', 'business_area'].includes(kind ?? '') ? sortCapabilitiesByType(children) : children;
}

export function parentsOf(model: PublishedModel, id: string, type?: StructuralRelationType): AtlasNode[] {
  return structuralRelations(model, type).filter(relation => relation.targetId === id).map(relation => model.nodeById.get(relation.sourceId)!);
}

export function parentRelationOf(model: PublishedModel, id: string): AtlasRelation | undefined {
  return model.relations.find(relation => isStructural(relation) && relation.targetId === id);
}

export function rootsOf(model: PublishedModel): AtlasNode[] {
  if (model.raw.display_index) return model.raw.display_index.roots.map(id => model.nodeById.get(id)!);
  const children = new Set(structuralRelations(model).map(relation => relation.targetId));
  return model.nodes.filter(node => !children.has(node.id));
}

/** A publication opts into Domain / Area through its own explicit node kinds. */
export function hasAreaLevels(model: PublishedModel): boolean {
  return model.nodes.some(node => node.kind === 'area');
}

export function isCapabilityContainer(model: PublishedModel, node: AtlasNode): boolean {
  return node.kind === 'area' || node.kind === 'business_area' || node.kind === 'reference' || (node.kind === 'domain' && !hasAreaLevels(model));
}

export interface CardChildList {
  kind: 'domain' | 'capability' | 'reference' | 'behavior' | 'mixed';
  items: AtlasNode[];
  businessAreaChildren?: Record<string, AtlasNode[]>;
}

/** Preserve explicit reference boundaries inside an Area or a historical presentation group. */
export function cardChildListOf(model: PublishedModel, node: AtlasNode): CardChildList | undefined {
  const children = childrenOf(model, node.id);
  if (node.kind === 'business_system' && children.some(child => child.kind === 'domain')) {
    return { kind: 'domain', items: children.filter(child => child.kind === 'domain') };
  }
  const references = children.filter(child => child.kind === 'reference');
  if (node.kind === 'area' && children.some(child => child.kind === 'business_area')) {
    return { kind: 'mixed', items: children, businessAreaChildren: Object.fromEntries(children.filter(child => child.kind === 'business_area').map(child => [child.id, childrenOf(model, child.id)])) };
  }
  if (references.length && (node.kind === 'area' || (node.kind === 'group' && node.groupRole !== 'urbanism_level'))) {
    const capabilities = children.filter(child => child.kind === 'capability');
    if (capabilities.length) return { kind: 'mixed', items: [...references, ...capabilities] };
    return { kind: 'reference', items: references };
  }
  if (isCapabilityContainer(model, node)) {
    return { kind: 'capability', items: children.filter(child => child.kind === 'capability') };
  }
  const behaviors = children.filter(child => child.kind === 'behavior');
  if (node.kind === 'capability' && behaviors.length) return { kind: 'behavior', items: behaviors };
  return undefined;
}

/** Cards expose their explicit references, capabilities or terminal behaviors. */
export function hasCapabilityCards(model: PublishedModel, scopeId?: string): boolean {
  const visible = scopeId ? childrenOf(model, scopeId) : rootsOf(model);
  return visible.some(node => cardChildListOf(model, node) !== undefined);
}

/** Returns explicit ancestors followed by the selected node. A presentation group stays a group. */
export function lineageOf(model: PublishedModel, id: string): AtlasNode[] {
  const result: AtlasNode[] = [];
  let node = model.nodeById.get(id);
  while (node) {
    result.unshift(node);
    node = parentsOf(model, node.id)[0];
  }
  return result;
}

export function descendantsOf(model: PublishedModel, id: string): AtlasNode[] {
  const result: AtlasNode[] = [];
  const queue = childrenOf(model, id);
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    queue.push(...childrenOf(model, node.id));
  }
  return result;
}

export function searchableText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(searchableText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(searchableText).join(' ');
  return '';
}

export function searchModel(model: PublishedModel, query: string): AtlasNode[] {
  if (!query.trim()) return [...model.nodes];
  return searchPublication(model, query).flatMap(result => result.node ? [result.node] : []);
}

export function relatedTo(model: PublishedModel, id: string, includeStructural = false): AtlasRelation[] {
  return model.relations.filter(relation => (includeStructural || !isStructural(relation)) && (relation.sourceId === id || relation.targetId === id));
}

/** Breadth-first local exploration. Traversing an edge never changes its published direction. */
export function neighborhood(model: PublishedModel, id: string, options: NeighborhoodOptions = {}): GraphProjection {
  if (!model.nodeById.has(id)) throw new Error(`Nœud de focalisation absent : ${id}.`);
  const depth = options.depth ?? 1;
  const direction = options.direction ?? 'both';
  if (![1, 2].includes(depth)) throw new Error('La profondeur du voisinage doit être 1 ou 2.');
  const eligible = model.relations.filter(relation =>
    (options.includeStructural || !isStructural(relation)) &&
    (!options.relationTypes?.length || options.relationTypes.includes(relation.type)),
  );
  const visible = new Set([id]);
  const traversed = new Set<string>();
  let frontier = new Set([id]);
  for (let step = 0; step < depth; step++) {
    const next = new Set<string>();
    for (const relation of eligible) {
      if (direction !== 'incoming' && frontier.has(relation.sourceId)) {
        traversed.add(relation.id);
        if (!visible.has(relation.targetId)) next.add(relation.targetId);
      }
      if (direction !== 'outgoing' && frontier.has(relation.targetId)) {
        traversed.add(relation.id);
        if (!visible.has(relation.sourceId)) next.add(relation.sourceId);
      }
    }
    next.forEach(nodeId => visible.add(nodeId));
    frontier = next;
  }
  const relations = eligible.filter(relation => traversed.has(relation.id));
  const hiddenRelationCount = eligible.filter(relation => !traversed.has(relation.id) && (visible.has(relation.sourceId) || visible.has(relation.targetId))).length;
  return { focusId: id, mode: 'neighborhood', nodes: model.nodes.filter(node => visible.has(node.id)), relations, hiddenRelationCount };
}

/** A semantic step displays only explicit children, or the local business links of a leaf. */
export function focusGraph(model: PublishedModel, id?: string, options: NeighborhoodOptions = {}): GraphProjection {
  if (!id) return { mode: 'hierarchy', nodes: rootsOf(model), relations: [], hiddenRelationCount: 0 };
  const relation = model.relationById.get(id);
  if (relation) {
    return { focusId: id, mode: 'neighborhood', nodes: [model.nodeById.get(relation.sourceId)!, model.nodeById.get(relation.targetId)!], relations: [relation], hiddenRelationCount: 0 };
  }
  const children = childrenOf(model, id);
  if (!children.length) return neighborhood(model, id, options);
  const ids = new Set([id, ...children.map(node => node.id)]);
  const relations = model.relations.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId));
  return {
    focusId: id, mode: 'hierarchy', nodes: [model.nodeById.get(id)!, ...children], relations,
    hiddenRelationCount: model.relations.filter(edge => !isStructural(edge) && (ids.has(edge.sourceId) || ids.has(edge.targetId)) && !(ids.has(edge.sourceId) && ids.has(edge.targetId))).length,
  };
}
