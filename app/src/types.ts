/** Read-only projections of one published snapshot. Renderers never own model truth. */
export type JsonRecord = Record<string, unknown>;

export interface MarketComparison {
  vendor: string;
  product: string;
  element_name: string;
  element_type: string;
  relationship: string;
  similarities: string;
  differences: string;
  flow_position: string;
  term_choice?: string;
  definition_choice?: string;
  concept_name?: string;
  scope_summary?: string;
  approach_summary?: string;
  source_title: string;
  source_url: string;
  source_version: string;
  consulted_on: string;
  source_locator: string;
  evidence_limits: string;
  source_refs: string[];
  status: 'proposed' | 'under_review' | 'validated';
}

export interface MarketGap {
  family: 'microsoft_dynamics' | 'sap_s4hana';
  reason: string;
  investigated_urls: string[];
  source_refs: string[];
}

export interface BusinessExample {
  title: string;
  situation: string;
  outcome?: string;
  lesson?: string;
  steps?: { title: string; description: string; contributions: { node_id: string; role: string }[]; outcome: string }[];
  validation_points?: string[];
  id?: string;
  trigger?: string;
  objective?: string;
  constraints?: string[];
  options?: { title: string; description: string }[];
  contributions?: { node_id: string; role: string }[];
  source_refs: string[];
}

export interface MarketInspiration {
  choice: string;
  flow_scope: string;
  flow_approach: string;
  synthesis: string[];
  examples: (BusinessExample & { source_title: string; source_url: string })[];
}

export interface BusinessInformation {
  id: string;
  name: string;
  label_fr: string;
  question: string;
  definition: string;
  context: string;
  essential_elements: string[];
  granularity_rationale: string;
  boundaries: string[];
  document_and_fact_boundary: string;
  capability_roles: { capability_ref: string; role: string; meaning: string; source_refs: string[] }[];
  examples: BusinessExample[];
  market_comparisons: MarketComparison[];
  source_refs: string[];
  review: Review;
  revision?: number;
  last_modified?: string;
}
export interface InformationLink {
  id: string;
  from_ref: string;
  to_ref: string;
  meaning: string;
  condition: string;
  effect: string;
  source_refs: string[];
  review: Review;
  revision?: number;
  last_modified?: string;
}
export interface InformationCatalogue {
  id: string;
  items: BusinessInformation[];
  links: InformationLink[];
  source_refs: string[];
  revision?: number;
  last_modified?: string;
}

export interface Review extends JsonRecord {
  state?: string;
  note?: string;
}
export interface Lifecycle extends JsonRecord {
  state?: string;
  note?: string;
  validated_fields?: string[];
  source_refs?: string[];
}
export interface SourceLocator extends JsonRecord {
  path?: string;
  anchor?: string;
  line?: number;
}
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
  market_comparisons?: MarketComparison[];
  market_gaps?: MarketGap[];
  market_inspiration?: MarketInspiration;
  id: string;
  name: string;
  short_description: string;
  definition: string;
  context?: string;
  notes?: string;
  source_refs: string[];
  historical?: boolean;
  alias_of?: string;
  presentation?: 'historical' | 'method';
  guide_section?: 'method';
  label_fr?: string;
  review: { state: 'proposed' | 'under_review' | 'accepted' | 'partial'; note?: string };
  revision?: number;
  last_modified?: string;
}
export interface RawPublication extends JsonRecord {
  workshop?: { active: true; session_id: string; base_version: string; revision: number };
  document_catalog?: { schema_version: 1; source_refs: string[]; documents: AtlasDocument[] };
  hotspot_catalog?: {
    schema_version: 1;
    hotspots: Hotspot[];
    source_refs: string[];
    criticality_policy?: {
      id: string;
      levels: string[];
      matrix: string[][];
      scope: string;
      unknown_rule: string;
      assessment_note: string;
      axes: Record<string, { definition: string; guidance: Record<string, string> }>;
    };
    sources?: { id: string; title: string; kind: string; access: string; date?: string }[];
  };
  metamodel?: {
    node_types?: { kind: string; label: string; definition?: string | null }[];
    documentation?: import('./modelingGuide').ModelingGuide;
  };
  display_policy?: 'typed-tree-v1';
  display_index?: {
    policy: 'typed-tree-v1';
    roots: string[];
    children: Record<string, string[]>;
    codes: Record<string, string>;
  };
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
export interface HotspotResolution {
  stage: 'unassessed' | 'to_explore' | 'identified' | 'qualifying' | 'credible';
  summary: string;
  credible_option_ids: string[];
  credibility_note: string;
  blocked_reason: string;
  next_step: string;
  assessed_on?: string;
  assessment_source: string;
}
export interface Hotspot {
  /** Technical display preference; historical publications default to true. */
  visible?: boolean;
  consolidated_into?: string;
  gap_analysis?: {
    id: string;
    title: string;
    subject_node_id: string;
    natures: ('system_support_gap' | 'realization_difference' | 'business_rule_divergence')[];
    observations_by_context: {
      context_id: 'beaumanoir-historique' | 'boardriders' | 'sarenza';
      observation_scope?: { id: string; label: string; description: string };
      business_need: string;
      system_coverage: 'covered' | 'partly_covered' | 'not_covered' | 'not_assessed' | 'not_applicable';
      handling: string;
      business_rules: string[];
      source_refs: string[];
      evidence_state: 'to_investigate' | 'hypothesis' | 'documented';
      evidence_kind: 'user_report' | 'source_document' | 'analysis';
      limits: string;
    }[];
    comparison: string;
    convergence_question: string;
    business_effects: string[];
    open_questions: string[];
    resolution_option_ids: string[];
    source_refs: string[];
  }[];
  resolution?: HotspotResolution;
  workshop?: { session_id: string; revision: number };
  id: string;
  title: string;
  kind: 'scope' | 'integration';
  framing_impact?: {
    category: 'structuring' | 'usage' | 'to_assess';
    targets: ('business_model' | 'core_system')[];
    scopes?: ('model' | 'transition' | 'usage')[];
    rationale: string;
    follow_up: 'framing' | 'product_design' | 'qualification';
    evidence_state: 'documented' | 'hypothesis' | 'to_investigate';
    source_refs: string[];
  };
  location: { node_ids: string[] };
  problem: string;
  examples: string[];
  document_ids?: string[];
  market_view?: {
    finding: string;
    flow_assessment: string;
    limits: string;
    sources: { publisher: string; title: string; url: string; relevance: string }[];
  };
  resolution_options: {
    id: string;
    title: string;
    principle: string;
    effect?: string;
    conditions?: string[];
    tradeoffs?: string[];
    implementation_complexity: 'S' | 'M' | 'L' | 'XL' | 'unassessed';
    evidence_state: 'documented' | 'hypothesis' | 'to_investigate';
  }[];
  complexity: {
    political: string;
    implementation: string;
    rationale: string;
    political_rationale?: string;
    implementation_rationale?: string;
  };
  severity: 'S' | 'M' | 'L' | 'XL' | 'unassessed';
  arbitration_level: string;
  arbitration_note?: string;
  status: 'discovered' | 'shared' | 'validated' | 'resolved';
  selected_option_id?: string;
  resolution_note?: string;
  source_status?: string;
  source_refs: string[];
  origin: { repository: string; path: string; id: string; source_id: string; evidence_limit: string };
  review: Review;
}
export interface AtlasDocument {
  id: string;
  title: string;
  summary: string;
  context: string;
  category: 'analysis' | 'source' | 'decision' | 'guide';
  asset: {
    path: string;
    sha256: string;
    media_type: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  };
  source_refs: string[];
  review: Review;
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
  readonly dataExchange?: DataExchange;
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
export interface DataExchange {
  readonly contents: readonly {
    readonly name: string;
    readonly description: string;
    readonly glossary_refs: readonly string[];
  }[];
  readonly purpose: string;
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
