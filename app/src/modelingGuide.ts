import { type FetchLike, fetchJson, guideUrl } from './publication.ts';
import type { PublishedModel } from './types.ts';
import { ui } from './ui.ts';

export interface GuideSource {
  readonly id: string;
  readonly title: string;
  readonly excerpt: string;
  readonly scope: string;
}
export interface GuideLesson {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly rule: string;
  readonly established_at: string;
  readonly scene: {
    readonly kind: 'comparison' | 'decomposition' | 'dependency' | 'responsibilities' | 'objects' | 'evidence';
    readonly parent?: string;
    readonly connector?: string;
    readonly caption: string;
    readonly items: readonly { readonly label: string; readonly text: string }[];
    readonly variants?: readonly {
      readonly id: string;
      readonly label: string;
      readonly description: string;
      readonly realizations: readonly { readonly label: string; readonly capability_indexes: readonly number[] }[];
    }[];
  };
  readonly question: string;
  readonly choices: readonly { readonly label: string; readonly feedback: string }[];
  readonly explanation: string;
  readonly contributor: {
    readonly criterion: string;
    readonly boundary: string;
    readonly scope: string;
    readonly source_refs: readonly string[];
  };
  readonly model_links: readonly { readonly id: string; readonly label: string }[];
}
export interface GuideChapter {
  readonly visual?: {
    readonly kind: 'dimensions' | 'governance';
    readonly title: string;
    readonly description: string;
    readonly center: string;
    readonly items: readonly string[];
    readonly overview_svg?: string;
  };
  readonly id: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly { title: string; text: string; example?: string; detail?: string; url?: string }[];
}
export interface ModelingGuide {
  readonly chapters?: readonly GuideChapter[];
  readonly glossary?: {
    readonly aliases?: Readonly<Record<string, string>>;
    readonly groups?: readonly { id: string; label: string; term_ids: readonly string[] }[];
    readonly terms: readonly {
      id: string;
      name: string;
      status?: string;
      parent_term?: string;
      guide_section?: string;
      values?: Readonly<Record<string, string>>;
      label_fr?: string;
      short_description?: string;
      definition: string;
      role?: string;
      notes?: readonly string[];
      editorial_notes?: readonly string[];
      examples?: readonly string[];
    }[];
    readonly model_term_ids: readonly string[];
    readonly business_terms?: readonly import('./types.ts').GlossaryTerm[];
  };
  readonly id: string;
  readonly version: string;
  readonly as_of: string;
  readonly title: string;
  readonly subtitle: string;
  readonly source_refs: readonly string[];
  readonly lessons: readonly GuideLesson[];
  readonly sources: readonly GuideSource[];
}
export interface GuideResponse {
  readonly schema_version: '1.0.0';
  readonly publication_version: string;
  readonly status: 'available' | 'unavailable';
  readonly message: string;
  readonly association?: { readonly scope: string; readonly note: string };
  readonly guide?: ModelingGuide;
}

/** Lessons retain exactly the content of their associated frozen guide. */
export function lessonForPublication(lesson: GuideLesson, _model: PublishedModel): GuideLesson {
  return lesson;
}

/** Every read is pinned to the displayed publication, including live-current mode. */
export async function fetchModelingGuide(
  version: string,
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
  expectedSha256?: string,
): Promise<GuideResponse> {
  const raw = (await fetchJson(guideUrl(version), signal, fetcher, 15000, expectedSha256)) as GuideResponse;
  if (
    raw?.schema_version !== '1.0.0' ||
    raw.publication_version !== version ||
    !['available', 'unavailable'].includes(raw.status) ||
    typeof raw.message !== 'string' ||
    (raw.status === 'available' &&
      (!raw.guide?.version ||
        !raw.guide.id ||
        !raw.guide.title ||
        !Array.isArray(raw.guide.lessons) ||
        !Array.isArray(raw.guide.sources) ||
        !Array.isArray(raw.guide.glossary?.terms) ||
        !Array.isArray(raw.guide.glossary?.model_term_ids)))
  ) {
    throw new Error(ui('modelingGuide.le_guide_recu_ne_correspond_pas_a_cette_publication'));
  }
  return raw;
}
