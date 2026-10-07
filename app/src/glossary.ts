import type { GlossaryTerm } from './types.ts';

/** Resolve only aliases carried by the selected publication. */
export function resolveGlossaryTerm(terms: ReadonlyMap<string, GlossaryTerm>, id: string): GlossaryTerm | undefined {
  const seen = new Set<string>();
  let term = terms.get(id);
  while (term?.alias_of) {
    if (seen.has(term.id)) return undefined;
    seen.add(term.id);
    term = terms.get(term.alias_of);
  }
  return term;
}

export function isCurrentGlossaryTerm(term: GlossaryTerm): boolean {
  return !term.alias_of && !term.presentation;
}

export function glossaryAliases(terms: readonly GlossaryTerm[], id: string): string[] {
  const byId = new Map(terms.map(term => [term.id, term]));
  return terms.filter(term => term.alias_of && resolveGlossaryTerm(byId, term.id)?.id === id).map(term => term.name);
}
