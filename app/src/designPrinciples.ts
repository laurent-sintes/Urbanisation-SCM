import { inlineParts, plainInlineText } from './inlineLinks.ts';
import type { ArchitecturePrinciple, PublishedModel } from './types.ts';

export const principleCategories: Record<string, string> = {
  architecture: 'Structure métier',
  information: 'Informations et faits',
  decision: 'Décisions et engagements',
  scope: 'Périmètre de la carte',
  convention: 'Convention',
};
export const principleTitle = (p: ArchitecturePrinciple) => p.label_fr || p.name || p.id;
export function designPrinciples(model: PublishedModel) {
  return [...(model.raw.principles || [])].sort(
    (a, b) =>
      (a.display_order ?? 999) - (b.display_order ?? 999) || principleTitle(a).localeCompare(principleTitle(b), 'fr'),
  );
}
/** Reading links are explicit. Global applicability alone does not flood every sheet. */
export function principlesForNode(model: PublishedModel, id: string) {
  const ancestors = new Set([id]);
  let pending = [id];
  while (pending.length) {
    const next: string[] = [];
    for (const edge of model.relations)
      if (
        ['contains', 'presents'].includes(edge.type) &&
        pending.includes(edge.targetId) &&
        !ancestors.has(edge.sourceId)
      ) {
        ancestors.add(edge.sourceId);
        next.push(edge.sourceId);
      }
    pending = next;
  }
  return designPrinciples(model).filter(
    (p) => p.featured && p.scope?.targets.some((t) => t.collection === 'nodes' && ancestors.has(t.id)),
  );
}
export function principlesForRelation(model: PublishedModel, id: string) {
  return designPrinciples(model).filter(
    (p) => p.featured && p.scope?.targets.some((t) => t.collection === 'relations' && t.id === id),
  );
}
export function principleSearchText(p: ArchitecturePrinciple) {
  return [
    p.statement,
    p.summary,
    p.rationale,
    p.implications,
    p.tradeoffs,
    ...(p.examples || []).map((x) => x.text),
    ...(p.references || []).map((r) => [r.publisher, r.title, r.observed, r.role, r.limits].join(' ')),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Resolve jargon against this edition only, preserving explicit authored links. */
export function annotatePrincipleText(model: PublishedModel, text: string) {
  const terms = new Map<string, { kind: string; id: string }>();
  const ordinaryWords = new Set(['gestion', 'activité', 'résultat', 'valeur', 'besoin', 'rôle']);
  const add = (label: string | undefined, kind: string, id: string) => {
    const plain = plainInlineText(label || '').trim();
    if (
      plain.length >= 4 &&
      !ordinaryWords.has(plain.toLocaleLowerCase('fr')) &&
      !terms.has(plain.toLocaleLowerCase('fr'))
    )
      terms.set(plain.toLocaleLowerCase('fr'), { kind, id });
  };
  for (const term of model.glossary) {
    if (term.historical || term.alias_of) continue;
    add(term.name, 'glossary', term.id);
    add(term.label_fr, 'glossary', term.id);
    if (/[a-rt-wy]$/i.test(term.name)) add(`${term.name}s`, 'glossary', term.id);
    if (term.label_fr && /^[\p{L}-]+[a-rt-wy]$/iu.test(term.label_fr)) add(`${term.label_fr}s`, 'glossary', term.id);
  }
  if (model.glossaryById.has('TER035')) terms.set('scm', { kind: 'glossary', id: 'TER035' });
  const method = model.raw.metamodel?.documentation?.glossary?.terms || [];
  for (const term of method) {
    add(term.name, 'method', term.id);
    add(term.label_fr, 'method', term.id);
  }
  for (const [label, id] of [
    ['capacité', 'MOD015'],
    ['capacités', 'MOD015'],
    ['comportement', 'MOD006'],
    ['comportements', 'MOD006'],
  ])
    if (method.some((t) => t.id === id)) add(label, 'method', id);
  const keys = [...terms.keys()]
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!keys.length) return text;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${keys.join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
  return inlineParts(text)
    .map((part) =>
      part.kind
        ? `[${part.text}](${part.kind}:${part.target}${part.anchor ? `#${part.anchor}` : ''})`
        : part.text.replace(pattern, (label) => {
            const term = terms.get(label.toLocaleLowerCase('fr'));
            return term ? `[${label}](${term.kind}:${term.id})` : label;
          }),
    )
    .join('');
}
