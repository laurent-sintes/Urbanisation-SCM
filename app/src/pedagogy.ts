import { ui } from './coreUi.ts';
import type { AtlasNode, BusinessExample, MarketComparison, PublishedModel } from './types.ts';

export interface PedagogicalDescription {
  explanation: string;
  example_refs?: { node_id: string; example_id: string; contribution: string }[];
  distinctions?: { node_id: string; explanation: string }[];
  market_comparison_refs?: { node_id: string; comparison_id: string }[];
  source_refs: string[];
}

/** The short description is always the definition of this published instance. */
export function shortNodeDescription(node: AtlasNode): string {
  return node.definition || ui('pedagogy.description_non_renseignee_dans_cette_publication');
}

export function pedagogyOf(node: AtlasNode): PedagogicalDescription | undefined {
  const block = node.fields.pedagogical_description;
  return block && typeof block === 'object' && !Array.isArray(block)
    ? (block as unknown as PedagogicalDescription)
    : undefined;
}

/** Resolve only from the supplied snapshot; a missing reference is never guessed. */
export function resolvePedagogy(model: PublishedModel, node: AtlasNode) {
  const publishedNode = model.nodeById.get(node.id);
  const block = publishedNode ? pedagogyOf(publishedNode) : undefined;
  const examples = (block?.example_refs || []).flatMap((ref) => {
    const items = model.nodeById.get(ref.node_id)?.fields.examples as BusinessExample[] | undefined;
    const matches = (items || []).filter((item) => item.id === ref.example_id);
    if (matches.length !== 1) return [];
    const example = matches[0];
    const contribution = ref.contribution;
    return contribution ? [{ ...example, contribution }] : [];
  });
  const comparisons = (block?.market_comparison_refs || []).flatMap((ref) => {
    const items = model.nodeById.get(ref.node_id)?.fields.market_comparisons as MarketComparison[] | undefined;
    const matches = (items || []).filter((item) => item.id === ref.comparison_id);
    return matches.length === 1 ? matches : [];
  });
  return { block, examples, comparisons };
}

export function pedagogySearchText(node: AtlasNode): string {
  const block = pedagogyOf(node);
  return [
    block?.explanation,
    ...(block?.distinctions || []).map((item) => item.explanation),
    ...(block?.example_refs || []).map((item) => item.contribution),
  ]
    .filter(Boolean)
    .join('\n');
}
