import { catalogOf, scenarioSearchText, valueStreamSearchText } from './scenarioCatalog.ts';
import { businessFields } from './businessContent.ts';
import { examplesForNode, readerExamplesSearchText } from './examples.ts';
import { plainInlineText } from './inlineLinks.ts';
import { publicText } from './publicText.ts';
import type { AtlasNode, GlossaryTerm, PublishedModel, MarketComparison, MarketInspiration } from './types.ts';
import { marketSearchText } from './marketContent.ts';
import { requestMetadataSearchText } from './requestMetadata.ts';
import type { ModelingGuide } from './modelingGuide.ts';

export interface SearchResult {
  id: string; kind: 'model' | 'glossary' | 'scenario' | 'value_stream' | 'method' | 'guide'; name: string; excerpt: string; score: number;
  node?: AtlasNode; term?: GlossaryTerm;
}
const normalize = (text: string) => plainInlineText(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
const words = (text: string) => normalize(text).match(/[a-z0-9]+(?:[._-][a-z0-9]+)*/g) ?? [];
const stopWords = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'd', 'l', 'the', 'of']);
const caches = new WeakMap<PublishedModel, SearchResult[]>();
function index(model: PublishedModel): SearchResult[] {
  const saved = caches.get(model);
  if (saved) return saved;
  const parents = new Map(model.relations.filter(r => ['contains', 'presents'].includes(r.type)).map(r => [r.targetId, r.sourceId]));
  const ancestry = (id: string): string => {
    const names: string[] = [];
    let parent = parents.get(id);
    while (parent) { names.push(model.nodeById.get(parent)?.name || ''); parent = parents.get(parent); }
    return names.join(' / ');
  };
  const catalog = catalogOf(model);
  const entries: SearchResult[] = [
    ...(catalog?.scenarios || []).map(s => ({id:s.id,kind:'scenario' as const,name:s.title,excerpt:scenarioSearchText(catalog!,s),score:0})),
    ...(catalog?.value_streams || []).map(s => ({id:s.id,kind:'value_stream' as const,name:s.label_fr,excerpt:valueStreamSearchText(s),score:0})),
    ...model.nodes.map(node => ({ id: node.id, kind: 'model' as const, name: node.name,
      excerpt: [Object.values(businessFields(node.fields)).join('\n'), requestMetadataSearchText(node), ancestry(node.id), readerExamplesSearchText(examplesForNode(model, node)), marketSearchText(node.fields.market_comparisons as readonly MarketComparison[] | undefined, node.fields.market_inspiration as MarketInspiration | undefined)].join('\n'), score: 0, node })),
    ...model.glossary.map(term => ({ id: term.id, kind: 'glossary' as const, name: plainInlineText(term.name),
      excerpt: [term.short_description, term.definition, term.context, marketSearchText(term.market_comparisons, term.market_inspiration)].filter(Boolean).map(text => publicText(String(text))).join('\n'), score: 0, term })),
  ];
  caches.set(model, entries);
  return entries;
}
function excerpt(text: string, queryWords: string[]): string {
  const plain = plainInlineText(text).replace(/\s+/g, ' ').trim();
  const normalized = normalize(plain);
  const at = queryWords.map(word => normalized.indexOf(word)).filter(i => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, at - 42);
  return `${start ? '…' : ''}${plain.slice(start, start + 175).trim()}${plain.length > start + 175 ? '…' : ''}`;
}
/** Search only content readable in this snapshot; no implicit synonyms or editorial metadata. */
export function searchPublication(model: PublishedModel, query: string, guide?: ModelingGuide): SearchResult[] {
  const needle = normalize(query).trim();
  const queryWords = words(query).filter(word => !stopWords.has(word));
  if (!needle || !queryWords.length) return [];
  const methodEntries: SearchResult[] = [
    ...(guide?.glossary?.terms ?? []).filter(t => t.status !== 'retired' && !t.parent_term && !t.guide_section).map(t => ({id:t.id,kind:'method' as const,name:t.label_fr || t.name,excerpt:[t.name,t.definition,t.short_description,...Object.entries(t.values || {}).flat()].filter(Boolean).join(' '),score:0})),
    ...(guide?.chapters ?? []).map(c => ({id:c.id,kind:'guide' as const,name:c.title,excerpt:[c.intro,...c.sections.map(s=>[s.title,s.text,s.detail,s.example].filter(Boolean).join(' '))].join(' '),score:0})),
    ...(guide?.lessons ?? []).map(l => ({id:l.id,kind:'guide' as const,name:l.title,excerpt:[l.rule,l.explanation].join(' '),score:0})),
  ];
  return [...index(model).filter(e => !guide?.glossary?.aliases?.[e.id]),...methodEntries].flatMap(entry => {
    const title = normalize(entry.name);
    const id = normalize(entry.id);
    const titleWords = words(entry.name), bodyWords = words(entry.excerpt);
    const has = (values: string[], word: string) => values.some(value => value === word || (word.length >= 3 && value.startsWith(word)));
    const code = normalize(entry.node?.displayCode ?? '');
    const codePrefix = needle.length >= 3 && Boolean(code) && code.startsWith(needle);
    const primaryText = entry.node?.definition || entry.term?.definition || '';
    const primary = words(primaryText).filter(word => !stopWords.has(word)).join(' ');
    const exact = id === needle || code === needle || title === needle;
    if (!exact && !codePrefix && !queryWords.every(word => has(titleWords, word) || has(bodyWords, word) || id === word || has(words(code), word))) return [];
    const phrase = queryWords.join(' ');
    const bodyPhrase = bodyWords.filter(word => !stopWords.has(word)).join(' ');
    const score = exact ? 10000 : codePrefix ? 9000 : title.startsWith(needle) ? 8000
      : queryWords.every(word => has(titleWords, word)) ? 6000
      : primary.startsWith(phrase) ? 5500 : primary.includes(phrase) ? 5200 : queryWords.every(word => has(words(primary), word)) ? 5000 : bodyPhrase.startsWith(phrase) ? 4500 : bodyPhrase.includes(phrase) ? 2000
      : queryWords.reduce((sum, word) => sum + (has(titleWords, word) ? 500 : 10), 0);
    return [{ ...entry, score, excerpt: excerpt((id === needle || codePrefix || queryWords.some(word => normalize(primaryText).includes(word))) && primaryText ? primaryText : entry.excerpt, queryWords) }];
  }).sort((a, b) => b.score - a.score);
}
