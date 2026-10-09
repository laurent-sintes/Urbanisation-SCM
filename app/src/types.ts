/** Read-only projections of one published snapshot. Renderers never own model truth. */
export type JsonRecord = Record<string, unknown>;

export interface MarketComparison {
  vendor: string; product: string; element_name: string; element_type: string;
  relationship: string; similarities: string; differences: string; flow_position: string;
  term_choice?: string; definition_choice?: string;
  concept_name?: string; scope_summary?: string; approach_summary?: string;
  source_title: string; source_url: string; source_version: string; consulted_on: string;
  source_locator: string; evidence_limits: string; source_refs: string[];
  status: 'proposed' | 'under_review' | 'validated';
}

export interface MarketGap {
  family: 'microsoft_dynamics' | 'sap_s4hana';
  reason: string; investigated_urls: string[]; source_refs: string[];
}

export interface BusinessExample {
  title: string; situation: string; outcome?: string; lesson?: string;
  steps?: { title: string; description: string; contributions: { node_id: string; role: string }[]; outcome: string }[];
  validation_points?: string[];
  id?: string; trigger?: string; objective?: string; constraints?: string[];
  options?: { title: string; description: string }[];
  contributions?: { node_id: string; role: string }[];
  source_refs: string[];
}

export interface MarketInspiration {
  choice: string; flow_scope: string; flow_approach: string;
  synthesis: string[];
  examples: (BusinessExample & { source_title: string; source_url: string })[];
}

export interface BusinessInformation {
  id: string; name: string; label_fr: string; question: string; definition: string; context: string;
  essential_elements: string[]; granularity_rationale: string; boundaries: string[];
  document_and_fact_boundary: string;
  capability_roles: { capability_ref: string; role: string; meaning: string; source_refs: string[] }[];
  examples: BusinessExample[]; market_comparisons: MarketComparison[];
  source_refs: string[]; review: Review; revision?: number; last_modified?: string;
}
export interface InformationLink {
  id: string; from_ref: string; to_ref: string; meaning: string; condition: string; effect: string;
  source_refs: string[]; review: Review; revision?: number; last_modified?: string;
}
export interface InformationCatalogue {
  id: string; items: BusinessInformation[]; links: InformationLink[]; source_refs: string[];
  revision?: number; last_modified?: string;
}

export interface Review extends JsonRecord { state?: string; note?: string }
export interface Lifecycle extends JsonRecord {
  state?: string;
  note?: string;
  validated_fields?: string[];
  source_refs?: string[];
}
export interface SourceLocator extends JsonRecord { path?: string; anchor?: string; line?: number }
export interface Qualification extends JsonRecord {
  meaning?: string;
  role?: string;
  conditions?: string[];
  effects?: string[];
  scope?: string;
}
export interface RawNode extends JsonRecord {
  id: string;
  kind: string;
  revision?: number;
  layer?: string;
  group_role?: string;
  level_ref?: string;
  fields?: JsonRecord;
  review?: Review;
  lifecycle?: Lifecycle;
  source_refs?: string[];
  source_locator?: SourceLocator;
  approved_fields?: string[];
  proposed_fields?: string[];
  adoption_ids?: string[];
  field_status?: JsonRecord;
  field_review?: JsonRecord;
  last_modified?: string;
}
export interface RawRelation extends JsonRecord {
  id: string;
  type: string;
  source_id: string;
  target_id: string;
  revision?: number;
  fields?: JsonRecord;
  qualification?: Qualification;
  review?: Review;
  lifecycle?: Lifecycle;
  source_refs?: string[];
  source_locator?: SourceLocator;
  approved_fields?: string[];
  proposed_fields?: string[];
  adoption_ids?: string[];
  field_status?: JsonRecord;
  field_review?: JsonRecord;
  last_modified?: string;
}
export interface GlossaryTerm extends JsonRecord {
  market_comparisons?: MarketComparison[]; market_gaps?: MarketGap[];
  market_inspiration?: MarketInspiration;
  id: string; name: string; short_description: string; definition: string;
  context?: string; notes?: string; source_refs: string[]; historical?: boolean;
  alias_of?: string; presentation?: 'historical' | 'method'; guide_section?: 'method'; label_fr?: string;
  review: { state: 'proposed' | 'under_review' | 'accepted' | 'partial'; note?: string };
  revision?: number; last_modified?: string;
}
export interface RawPublication extends JsonRecord {
  metamodel?: { node_types?: { kind: string; label: string; definition?: string | null }[]; documentation?: import('./modelingGuide').ModelingGuide };
  display_policy?: 'typed-tree-v1';
  display_index?: { policy: 'typed-tree-v1'; roots: string[]; children: Record<string, string[]>; codes: Record<string, string> };
  information_catalog?: InformationCatalogue;
  glossary?: { terms: GlossaryTerm[] };
  space: string;
  model_id?: string;
  version: string;
  revision?: number;
  nodes: RawNode[];
  relations: RawRelation[];
  sourcePath?: string;
  sourceReferences?: Record<string, unknown>;
  limitations?: string[];
  last_modified?: string;
  published_at?: string;
}
export interface AtlasNode {
  readonly displayCode?: string;
  readonly hierarchyLabel?: string;
  readonly referenceParentName?: string;
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly groupRole?: string;
  readonly levelRef?: string;
  readonly revision?: number;
  readonly lastModified?: string;
  readonly purpose: string;
  readonly definition: string;
  readonly scope: string;
  readonly fields: Readonly<JsonRecord>;
  readonly review: Readonly<Review>;
  readonly lifecycle?: Readonly<Lifecycle>;
  readonly status: string;
  readonly fieldStatus: Readonly<JsonRecord>;
  readonly approvedFields: readonly string[];
  readonly proposedFields: readonly string[];
  readonly adoptionIds: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly sourceLocator?: Readonly<SourceLocator>;
  readonly raw: Readonly<RawNode>;
}
export interface AtlasRelation {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly type: string;
  readonly revision?: number;
  readonly lastModified?: string;
  readonly label: string;
  readonly qualification: Readonly<Qualification>;
  readonly fields: Readonly<JsonRecord>;
  readonly review: Readonly<Review>;
  readonly lifecycle?: Readonly<Lifecycle>;
  readonly status: string;
  readonly fieldStatus: Readonly<JsonRecord>;
  readonly approvedFields: readonly string[];
  readonly proposedFields: readonly string[];
  readonly adoptionIds: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly sourceLocator?: Readonly<SourceLocator>;
  readonly raw: Readonly<RawRelation>;
}
export interface PublishedModel {
  readonly hasInformationCatalogue: boolean;
  readonly information: readonly BusinessInformation[];
  readonly informationById: ReadonlyMap<string, BusinessInformation>;
  readonly informationLinks: readonly InformationLink[];
  readonly glossary: readonly GlossaryTerm[];
  readonly glossaryById: ReadonlyMap<string, GlossaryTerm>;
  readonly version: string;
  readonly revision?: number;
  readonly sourcePath?: string;
  readonly publication: { readonly version: string; readonly revision?: number; readonly sourcePath?: string };
  readonly nodes: readonly AtlasNode[];
  readonly relations: readonly AtlasRelation[];
  readonly nodeById: ReadonlyMap<string, AtlasNode>;
  readonly relationById: ReadonlyMap<string, AtlasRelation>;
  readonly sourceReferences: Readonly<Record<string, unknown>>;
  readonly limitations: readonly string[];
  readonly raw: Readonly<RawPublication>;
}
export type StructuralRelationType = 'contains' | 'presents';
export interface NeighborhoodOptions {
  depth?: 1 | 2;
  direction?: 'incoming' | 'outgoing' | 'both';
  /** Defaults to business relations only. Structural relations must be opted in. */
  includeStructural?: boolean;
  relationTypes?: readonly string[];
}
export interface GraphProjection {
  readonly focusId?: string;
  readonly mode: 'hierarchy' | 'neighborhood';
  readonly nodes: readonly AtlasNode[];
  /** Every edge is an original relation; no implicit or aggregate edges. */
  readonly relations: readonly AtlasRelation[];
  readonly hiddenRelationCount: number;
}
