import { sortCapabilitiesByType } from './capabilityTypes.ts';
import { categorySections } from './categories.ts';
import { readDataExchange } from './dataSharing.ts';
import { validateDisplayIndex } from './displayCodes.ts';
import { resolveGlossaryTerm } from './glossary.ts';
import { plainInlineText } from './inlineLinks.ts';
import { readerPublication } from './readerContent.ts';
import { searchPublication } from './search.ts';
import type {
  AtlasNode,
  AtlasRelation,
  GraphProjection,
  NeighborhoodOptions,
  PublishedModel,
  RawPublication,
  StructuralRelationType,
} from './types.ts';
import { ui } from './ui.ts';

const structuralTypes = new Set<string>(['contains', 'presents']);
export const isStructural = (relation: AtlasRelation): boolean => structuralTypes.has(relation.type);

export function textField(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join('\n');
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
      throw new Error(ui('model.identifiant_absent_ou_duplique', { label: label, id: item.id }));
    }
    index.set(item.id, item);
  }
  return index;
}

/** Accept an API response or the raw snapshot loaded by load-publication.mjs. */
export function adaptPublication(input: RawPublication): PublishedModel {
  if (input?.space !== 'release' || !input.version || !Array.isArray(input.nodes) || !Array.isArray(input.relations)) {
    throw new Error(ui('model.une_publication_release_explicite_avec_nodes_et_relations_est_req'));
  }
  // Cloning prevents either renderer from altering the API response or another view.
  const normalized = readerPublication(input);
  // Published snapshots retain their original field names. Adapt older hotspots for current views.
  for (const hotspot of normalized.hotspot_catalog?.hotspots ?? []) {
    // Headings are plain text; glossary links remain available in the hotspot body.
    if (typeof hotspot.title === 'string') hotspot.title = plainInlineText(hotspot.title).replace(/ (?=:)/g, '\u00a0');
    const legacy = hotspot.complexity as typeof hotspot.complexity & {
      political?: string;
      political_rationale?: string;
    };
    if (legacy.arbitration === undefined && legacy.political !== undefined) legacy.arbitration = legacy.political;
    if (legacy.arbitration_rationale === undefined && legacy.political_rationale !== undefined)
      legacy.arbitration_rationale = legacy.political_rationale;
  }
  const axes = normalized.hotspot_catalog?.criticality_policy?.axes;
  if (axes?.political && !axes.arbitration) axes.arbitration = axes.political;
  const raw = freezeDeep(normalized);
  validateDisplayIndex(raw);
  const usesPurposes =
    Array.isArray(raw.principles) && raw.principles.some((p) => p?.id === 'PRINCIPLE-DOMAIN-PURPOSE');
  const usesSubdomains =
    Array.isArray(raw.principles) && raw.principles.some((p) => p?.id === 'PRINCIPLE-DOMAIN-SUBDOMAIN');
  const referenceParents = new Map(
    raw.nodes.filter((node) => node.kind === 'reference').map((node) => [node.id, textField(node.fields?.name)]),
  );
  const referenceByChild = new Map(
    raw.relations
      .filter((edge) => edge.type === 'contains' && referenceParents.has(edge.source_id))
      .map((edge) => [edge.target_id, referenceParents.get(edge.source_id)]),
  );
  for (const edge of raw.relations.filter((edge) => edge.type === 'documents-reference')) {
    referenceByChild.set(edge.source_id, referenceParents.get(edge.target_id));
  }
  const nodes: AtlasNode[] = raw.nodes.map((node) => {
    const fields = node.fields ?? {};
    const vocabulary = raw.metamodel?.vocabulary;
    const nature = typeof fields.nature === 'string' ? fields.nature : '';
    return freezeDeep({
      reading: {
        kind: raw.metamodel?.node_types?.find((type) => type.kind === node.kind)?.label,
        nature: (node.kind === 'behavior' ? vocabulary?.behavior_natures : vocabulary?.capability_natures)?.[nature]
          ?.label,
        vocabulary,
        icon: raw.presentation?.icons?.[node.id],
        neighborhood: raw.presentation?.flow_neighborhood,
      },
      id: node.id,
      displayCode: raw.display_index?.codes[node.id],
      name: plainInlineText(textField(fields.name)) || node.id,
      kind: node.kind,
      hierarchyKind:
        node.kind === 'area' ? (usesSubdomains ? 'subdomain' : usesPurposes ? 'purpose' : 'area') : undefined,
      hierarchyLabel:
        node.kind === 'area'
          ? usesSubdomains
            ? ui('model.sous_domaine')
            : usesPurposes
              ? ui('model.purpose')
              : ui('model.area')
          : undefined,
      referenceParentName: node.kind === 'capability' ? referenceByChild.get(node.id) : undefined,
      groupRole: node.group_role,
      levelRef: node.level_ref,
      revision: node.revision,
      lastModified: node.last_modified,
      purpose: textField(fields.finality),
      definition: textField(fields.definition),
      scope: textField(fields.scope),
      fields,
      review: node.review ?? {},
      lifecycle: node.lifecycle,
      status: node.review?.state ?? 'unknown',
      fieldStatus: node.field_status ?? node.field_review ?? {},
      approvedFields: node.approved_fields ?? [],
      proposedFields: node.proposed_fields ?? [],
      adoptionIds: node.adoption_ids ?? [],
      sourceRefs: node.source_refs ?? [],
      sourceLocator: node.source_locator,
      raw: node,
    });
  });
  const nodeById = uniqueMap(nodes, 'Nœud');
  const glossary = raw.glossary?.terms ?? [];
  if (!Array.isArray(glossary)) throw new Error(ui('model.glossaire_publie_invalide'));
  const glossaryById = uniqueMap(glossary, ui('model.terme'));
  for (const term of glossary) {
    if (
      term.alias_of &&
      (!resolveGlossaryTerm(glossaryById, term.id) || resolveGlossaryTerm(glossaryById, term.id)?.presentation)
    )
      throw new Error(ui('model.alias_de_glossaire_invalide', { id: term.id }));
    if (term.presentation && !['historical', 'method'].includes(term.presentation))
      throw new Error(ui('model.presentation_de_glossaire_invalide', { id: term.id }));
    if (
      (term.presentation === 'method' || term.guide_section) &&
      (term.presentation !== 'method' || term.guide_section !== 'method')
    )
      throw new Error(ui('model.destination_methodologique_invalide', { id: term.id }));
  }
  const catalogue = raw.information_catalog;
  if (catalogue !== undefined && (!catalogue || !Array.isArray(catalogue.items) || !Array.isArray(catalogue.links))) {
    throw new Error(ui('model.catalogue_d_informations_publie_invalide'));
  }
  const information = catalogue?.items ?? [],
    informationLinks = catalogue?.links ?? [];
  const informationById = uniqueMap(information, ui('model.information'));
  const informationLinkById = uniqueMap(informationLinks, ui('model.lien_d_information'));
  const allIds = new Set([...nodeById.keys(), ...raw.relations.map((r) => r.id)]);
  for (const id of [...(catalogue ? [catalogue.id] : []), ...informationById.keys(), ...informationLinkById.keys()]) {
    if (typeof id !== 'string' || !id.trim()) throw new Error(ui('model.identite_d_information_absente'));
    if (allIds.has(id)) throw new Error(ui('model.identite_partagee_par_une_information', { id: id }));
    allIds.add(id);
  }
  for (const item of information) {
    if (
      [
        'name',
        'label_fr',
        'definition',
        'question',
        'context',
        'granularity_rationale',
        'document_and_fact_boundary',
      ].some(
        (key) => typeof item[key as keyof typeof item] !== 'string' || !String(item[key as keyof typeof item]).trim(),
      ) ||
      ['essential_elements', 'boundaries', 'examples', 'market_comparisons', 'capability_roles'].some(
        (key) =>
          !Array.isArray(item[key as keyof typeof item]) || !(item[key as keyof typeof item] as unknown[]).length,
      )
    ) {
      throw new Error(ui('model.information_publiee_incomplete', { id: item.id }));
    }
    const roles = new Set<string>();
    for (const role of item.capability_roles) {
      if (nodeById.get(role.capability_ref)?.kind !== 'capability' || roles.has(role.capability_ref)) {
        throw new Error(ui('model.role_de_capacite_invalide_pour_l_information', { id: item.id }));
      }
      roles.add(role.capability_ref);
    }
  }
  for (const link of informationLinks) {
    if (!informationById.has(link.from_ref) || !informationById.has(link.to_ref) || link.from_ref === link.to_ref) {
      throw new Error(ui('model.extremite_inconnue_pour_le_lien_d_information', { id: link.id }));
    }
  }
  const relations: AtlasRelation[] = raw.relations.map((relation) => {
    if (!nodeById.has(relation.source_id) || !nodeById.has(relation.target_id)) {
      throw new Error(ui('model.extremite_inconnue_pour_la_relation', { id: relation.id }));
    }
    return freezeDeep({
      id: relation.id,
      sourceId: relation.source_id,
      targetId: relation.target_id,
      type: relation.type,
      revision: relation.revision,
      lastModified: relation.last_modified,
      label: textField(relation.fields?.label) || textField(relation.fields?.verb) || relation.type,
      qualification: relation.qualification ?? {},
      fields: relation.fields ?? {},
      dataExchange: readDataExchange(relation, new Set(raw.glossary?.terms.map((term) => term.id) || [])),
      review: relation.review ?? {},
      lifecycle: relation.lifecycle,
      status: relation.review?.state ?? 'unknown',
      fieldStatus: relation.field_status ?? relation.field_review ?? {},
      approvedFields: relation.approved_fields ?? [],
      proposedFields: relation.proposed_fields ?? [],
      adoptionIds: relation.adoption_ids ?? [],
      sourceRefs: relation.source_refs ?? [],
      sourceLocator: relation.source_locator,
      raw: relation,
    });
  });
  const relationById = uniqueMap(relations, ui('model.relation'));
  // An ambiguous/cyclic hierarchy cannot be resolved by guessing from identifiers.
  const parentByChild = new Map<string, string>();
  for (const relation of relations.filter(isStructural)) {
    if (parentByChild.has(relation.targetId))
      throw new Error(ui('model.plusieurs_parents_explicites_pour', { targetId: relation.targetId }));
    parentByChild.set(relation.targetId, relation.sourceId);
  }
  for (const node of nodes) {
    if (node.kind === 'behavior') {
      const parent = nodeById.get(parentByChild.get(node.id) ?? '');
      const relation = relations.find((edge) => isStructural(edge) && edge.targetId === node.id);
      if (parent?.kind !== 'capability' || relation?.type !== 'contains') {
        throw new Error(ui('model.comportement_sans_rattachement_unique_a_une_capacite', { id: node.id }));
      }
      if (relations.some((edge) => isStructural(edge) && edge.sourceId === node.id)) {
        throw new Error(ui('model.un_comportement_est_un_niveau_terminal', { id: node.id }));
      }
    }
    const seen = new Set<string>();
    let cursor: string | undefined = node.id;
    while (cursor !== undefined) {
      if (seen.has(cursor)) throw new Error(ui('model.cycle_de_navigation_explicite_a', { cursor: cursor }));
      seen.add(cursor);
      cursor = parentByChild.get(cursor);
    }
  }
  return Object.freeze({
    version: raw.version,
    revision: raw.revision,
    sourcePath: raw.sourcePath,
    publication: Object.freeze({ version: raw.version, revision: raw.revision, sourcePath: raw.sourcePath }),
    nodes: Object.freeze(nodes),
    relations: Object.freeze(relations),
    nodeById,
    relationById,
    glossary: Object.freeze(glossary),
    glossaryById,
    hasInformationCatalogue: catalogue !== undefined,
    information: Object.freeze(information),
    informationById,
    informationLinks: Object.freeze(informationLinks),
    sourceReferences: raw.sourceReferences ?? {},
    limitations: raw.limitations ?? [],
    raw,
  });
}

export function structuralRelations(model: PublishedModel, type?: StructuralRelationType): AtlasRelation[] {
  return model.relations.filter((relation) => (type ? relation.type === type : isStructural(relation)));
}

export function requiredNode(model: PublishedModel, id: string): AtlasNode {
  const node = model.nodeById.get(id);
  if (!node) throw new Error(ui('model.objet_publie_introuvable', { id: id }));
  return node;
}

export function childrenOf(model: PublishedModel, id: string, type?: StructuralRelationType): AtlasNode[] {
  if (model.raw.display_index)
    return (model.raw.display_index.children[id] ?? [])
      .filter(
        (child) => !type || model.relations.some((r) => r.sourceId === id && r.targetId === child && r.type === type),
      )
      .map((child) => requiredNode(model, child));
  const children = structuralRelations(model, type)
    .filter((relation) => relation.sourceId === id)
    .map((relation) => requiredNode(model, relation.targetId));
  const kind = model.nodeById.get(id)?.kind;
  if (kind === 'area') return categorySections(children).flatMap((section) => sortCapabilitiesByType(section.items));
  return ['domain', 'reference', 'business_area'].includes(kind ?? '') ? sortCapabilitiesByType(children) : children;
}

export function parentsOf(model: PublishedModel, id: string, type?: StructuralRelationType): AtlasNode[] {
  return structuralRelations(model, type)
    .filter((relation) => relation.targetId === id)
    .map((relation) => requiredNode(model, relation.sourceId));
}

export function parentRelationOf(model: PublishedModel, id: string): AtlasRelation | undefined {
  return model.relations.find((relation) => isStructural(relation) && relation.targetId === id);
}

export function rootsOf(model: PublishedModel): AtlasNode[] {
  if (model.raw.display_index) return model.raw.display_index.roots.map((id) => requiredNode(model, id));
  const children = new Set(structuralRelations(model).map((relation) => relation.targetId));
  return model.nodes.filter((node) => !children.has(node.id));
}

/** A publication opts into Domain / Area through its own explicit node kinds. */
export function hasAreaLevels(model: PublishedModel): boolean {
  return model.nodes.some((node) => node.kind === 'area');
}

export function isCapabilityContainer(model: PublishedModel, node: AtlasNode): boolean {
  return (
    node.kind === 'area' ||
    node.kind === 'business_area' ||
    node.kind === 'reference' ||
    (node.kind === 'domain' && !hasAreaLevels(model))
  );
}

/** Totals for the displayed scope, independent of card layout and search filters. */
export function scopeStatistics(
  model: PublishedModel,
  node: AtlasNode,
): { kind: string; count: number; label: string }[] {
  const areaKind = model.nodes.find((item) => item.kind === 'area')?.hierarchyKind;
  const labels: Record<string, [string, string]> = {
    business_system: [ui('model.systeme_metier'), ui('model.systemes_metier')],
    domain: [ui('model.domaine'), ui('model.domaines')],
    area:
      areaKind === 'subdomain'
        ? [ui('model.sous_domaine_2'), ui('model.sous_domaines')]
        : areaKind === 'purpose'
          ? [ui('model.purpose'), ui('model.purposes')]
          : [ui('model.area'), ui('model.areas')],
    business_area: [ui('model.business_area'), ui('model.business_areas')],
    reference: [ui('model.referentiel'), ui('model.referentiels')],
    capability: [ui('model.capacite'), ui('model.capacites')],
    behavior: [ui('model.comportement'), ui('model.comportements')],
  };
  const counts = new Map<string, number>();
  const seen = new Set([node.id]);
  const queue = childrenOf(model, node.id);
  for (let index = 0; index < queue.length; index++) {
    const child = queue[index];
    if (seen.has(child.id)) continue;
    seen.add(child.id);
    counts.set(child.kind, (counts.get(child.kind) ?? 0) + 1);
    queue.push(...childrenOf(model, child.id));
  }
  // Zero is useful for the expected levels, without inventing levels in old snapshots.
  const expected =
    node.kind === 'area'
      ? ['business_area', 'capability', 'behavior']
      : node.kind === 'business_area'
        ? ['capability', 'behavior']
        : node.kind === 'capability'
          ? ['behavior']
          : [];
  return Object.entries(labels).flatMap(([kind, names]) => {
    const count = counts.get(kind) ?? 0;
    return count || (expected.includes(kind) && model.nodes.some((item) => item.kind === kind))
      ? [{ kind, count, label: names[count === 1 ? 0 : 1] }]
      : [];
  });
}

export interface CardChildList {
  kind: 'domain' | 'capability' | 'reference' | 'behavior' | 'mixed';
  items: AtlasNode[];
  businessAreaChildren?: Record<string, AtlasNode[]>;
}

/** Count listed entries, not the Business Area banners above them. */
export function cardListedItems(list: CardChildList): AtlasNode[] {
  return list.items.flatMap((item) => list.businessAreaChildren?.[item.id] ?? [item]);
}

export function cardContentSummary(model: PublishedModel, node: AtlasNode): string {
  const list = cardChildListOf(model, node);
  const items = list ? cardListedItems(list) : childrenOf(model, node.id);
  const labels: Record<string, [string, string]> = {
    domain: [ui('model.domaine'), ui('model.domaines')],
    area: [ui('model.sous_domaine_2'), ui('model.sous_domaines')],
    business_area: [ui('model.business_area'), ui('model.business_areas')],
    capability: [ui('model.capacite'), ui('model.capacites')],
    reference: [ui('model.referentiel'), ui('model.referentiels')],
    behavior: [ui('model.comportement'), ui('model.comportements')],
  };
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.kind, (counts.get(item.kind) || 0) + 1);
  return [...counts]
    .map(
      ([kind, count]) =>
        `${count} ${(labels[kind] || [ui('model.element'), ui('model.elements')])[count === 1 ? 0 : 1]}`,
    )
    .join(' · ');
}

/** Preserve explicit reference boundaries inside an Area or a historical presentation group. */
export function cardChildListOf(model: PublishedModel, node: AtlasNode): CardChildList | undefined {
  const children = childrenOf(model, node.id);
  if (node.kind === 'reference' && !children.length) return undefined;
  if (node.kind === 'business_system' && children.some((child) => child.kind === 'domain')) {
    return { kind: 'domain', items: children.filter((child) => child.kind === 'domain') };
  }
  const references = children.filter((child) => child.kind === 'reference');
  if (node.kind === 'area' && children.some((child) => child.kind === 'business_area')) {
    return {
      kind: 'mixed',
      items: children,
      businessAreaChildren: Object.fromEntries(
        children
          .filter((child) => child.kind === 'business_area')
          .map((child) => [child.id, childrenOf(model, child.id)]),
      ),
    };
  }
  if (
    references.length &&
    (node.kind === 'area' ||
      node.kind === 'business_area' ||
      (node.kind === 'group' && node.groupRole !== 'urbanism_level'))
  ) {
    const capabilities = children.filter((child) => child.kind === 'capability');
    if (capabilities.length) return { kind: 'mixed', items: [...references, ...capabilities] };
    return { kind: 'reference', items: references };
  }
  if (isCapabilityContainer(model, node)) {
    return { kind: 'capability', items: children.filter((child) => child.kind === 'capability') };
  }
  const behaviors = children.filter((child) => child.kind === 'behavior');
  if (node.kind === 'capability' && behaviors.length) return { kind: 'behavior', items: behaviors };
  return undefined;
}

/** Cards expose their explicit references, capabilities or terminal behaviors. */
export function hasCapabilityCards(model: PublishedModel, scopeId?: string): boolean {
  const visible = scopeId ? childrenOf(model, scopeId) : rootsOf(model);
  return visible.some((node) => cardChildListOf(model, node) !== undefined);
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

/** The closest ancestor that is actually drawn at the current map detail. */
export function visibleAncestorId(
  model: PublishedModel,
  id: string,
  visibleIds: ReadonlySet<string>,
): string | undefined {
  return [...lineageOf(model, id)].reverse().find((node) => visibleIds.has(node.id))?.id;
}

export function descendantsOf(model: PublishedModel, id: string): AtlasNode[] {
  const result: AtlasNode[] = [];
  const queue = childrenOf(model, id);
  while (queue.length) {
    const node = queue.shift();
    if (!node) break;
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
  return searchPublication(model, query).flatMap((result) => (result.node ? [result.node] : []));
}

export function relatedTo(model: PublishedModel, id: string, includeStructural = false): AtlasRelation[] {
  return model.relations.filter(
    (relation) =>
      (includeStructural || !isStructural(relation)) && (relation.sourceId === id || relation.targetId === id),
  );
}

/** Breadth-first local exploration. Traversing an edge never changes its published direction. */
export function neighborhood(model: PublishedModel, id: string, options: NeighborhoodOptions = {}): GraphProjection {
  if (!model.nodeById.has(id)) throw new Error(ui('model.n_ud_de_focalisation_absent', { id: id }));
  const depth = options.depth ?? 1;
  const direction = options.direction ?? 'both';
  if (![1, 2].includes(depth)) throw new Error(ui('model.la_profondeur_du_voisinage_doit_etre_1_ou_2'));
  const eligible = model.relations.filter(
    (relation) =>
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
    next.forEach((nodeId) => {
      visible.add(nodeId);
    });
    frontier = next;
  }
  const relations = eligible.filter((relation) => traversed.has(relation.id));
  const hiddenRelationCount = eligible.filter(
    (relation) => !traversed.has(relation.id) && (visible.has(relation.sourceId) || visible.has(relation.targetId)),
  ).length;
  return {
    focusId: id,
    mode: 'neighborhood',
    nodes: model.nodes.filter((node) => visible.has(node.id)),
    relations,
    hiddenRelationCount,
  };
}

/** A semantic step displays only explicit children, or the local business links of a leaf. */
export function focusGraph(model: PublishedModel, id?: string, options: NeighborhoodOptions = {}): GraphProjection {
  if (!id) return { mode: 'hierarchy', nodes: rootsOf(model), relations: [], hiddenRelationCount: 0 };
  const relation = model.relationById.get(id);
  if (relation) {
    return {
      focusId: id,
      mode: 'neighborhood',
      nodes: [requiredNode(model, relation.sourceId), requiredNode(model, relation.targetId)],
      relations: [relation],
      hiddenRelationCount: 0,
    };
  }
  const children = childrenOf(model, id);
  if (!children.length) return neighborhood(model, id, options);
  const ids = new Set([id, ...children.map((node) => node.id)]);
  const relations = model.relations.filter((edge) => ids.has(edge.sourceId) && ids.has(edge.targetId));
  return {
    focusId: id,
    mode: 'hierarchy',
    nodes: [requiredNode(model, id), ...children],
    relations,
    hiddenRelationCount: model.relations.filter(
      (edge) =>
        !isStructural(edge) &&
        (ids.has(edge.sourceId) || ids.has(edge.targetId)) &&
        !(ids.has(edge.sourceId) && ids.has(edge.targetId)),
    ).length,
  };
}
