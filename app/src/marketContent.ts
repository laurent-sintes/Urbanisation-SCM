import type { MarketComparison, MarketInspiration } from './types.ts';

/** The comparison is public; adoption history and review annotations stay internal. */
export function marketText(text = ''): string {
  return text;
}

export function marketSearchText(entries?: readonly MarketComparison[], inspiration?: MarketInspiration): string {
  const comparisons = (entries || []).flatMap((entry) => [
    entry.vendor,
    entry.product,
    entry.element_name,
    entry.element_type,
    entry.relationship,
    entry.similarities,
    entry.differences,
    entry.flow_position,
    entry.term_choice,
    entry.definition_choice,
    ...(inspiration ? [entry.concept_name, entry.scope_summary, entry.approach_summary] : []),
    entry.source_title,
  ]);
  const overview = inspiration
    ? [
        inspiration.choice,
        inspiration.flow_scope,
        inspiration.flow_approach,
        ...inspiration.synthesis,
        ...inspiration.examples.flatMap((example) => [
          example.title,
          example.situation,
          example.outcome,
          example.lesson,
          example.source_title,
        ]),
      ]
    : [];
  return [...comparisons, ...overview]
    .map((value) => marketText(value))
    .filter(Boolean)
    .join('\n');
}

/** Put explanations of the actual vocabulary first, preserving order within each group. */
export function marketComparisonsForReading(entries: readonly MarketComparison[] = []): readonly MarketComparison[] {
  const hasChoice = (entry: MarketComparison) => Boolean(entry.term_choice || entry.definition_choice);
  return [...entries.filter(hasChoice), ...entries.filter((entry) => !hasChoice(entry))];
}
