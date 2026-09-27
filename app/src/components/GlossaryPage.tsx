import { ReadingHelp } from './ReadingHelp';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { PublishedModel } from '../types';
import type { GuideState } from '../useModelingGuide';
import { ModelText } from './ModelLinks';
import { plainInlineText } from '../inlineLinks';
import { publicText } from '../publicText';
import { MarketComparisons } from './MarketComparisons';

export function GlossaryPage({ model, selected, mode, guideState, onSelect, onRetry }: {
  model: PublishedModel; selected?: string; mode: 'model' | 'meta'; guideState: GuideState;
  onSelect: (id: string) => void; onRetry: () => void;
}) {
  const [query, setQuery] = useState('');
  const detail = useRef<HTMLElement>(null);
  const glossary = guideState.status === 'ready' ? guideState.response.guide?.glossary : undefined;
  const methodIds = new Set(glossary?.model_term_ids ?? []);
  const modelTerms = model.glossary.filter(term => mode === 'meta' ? methodIds.has(term.id) : !methodIds.has(term.id));
  const terms = [
    ...modelTerms.map(term => ({ ...term, label_fr: '', role: '', examples: [] as readonly string[] })),
    ...(mode === 'meta' ? (glossary?.terms ?? []).map(term => ({ ...term, short_description: term.role ?? '', context: '', notes: '', historical: false, market_comparisons: undefined, market_inspiration: undefined })) : []),
  ].sort((a, b) => (a.label_fr || a.name).localeCompare(b.label_fr || b.name, 'fr'));
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  const showReadingHelp = mode === 'meta' && Boolean(model.raw.display_index) && (!query || ['code', 'identifiant', 'identite', 'ordre', 'lecture', 'prefixe'].some(word => word.includes(normalize(query)) || normalize(query).includes(word)));
  const matches = terms.filter(term => normalize(`${term.label_fr} ${plainInlineText(term.name)} ${plainInlineText(term.definition)}`).includes(normalize(query)));
  const term = selected ? terms.find(term => term.id === selected) : matches[0];
  useEffect(() => setQuery(''), [mode, model.version]);
  useEffect(() => {
    if (detail.current) { detail.current.scrollTop = 0; if (selected) detail.current.focus({ preventScroll: true }); }
  }, [term?.id, model.version]);
  if (guideState.status === 'loading') return <p role="status">Chargement des glossaires…</p>;
  if (guideState.status === 'error') return <section className="glossary-empty"><h2>Les glossaires ne sont pas accessibles</h2><p>{guideState.message}</p><button onClick={onRetry}>Réessayer</button></section>;
  if (mode === 'meta' && !glossary) return <section className="glossary-empty"><BookOpen size={30}/><h2>Glossaire du méta modèle indisponible pour cette version</h2></section>;
  if (!terms.length) return <section className="glossary-empty"><BookOpen size={30}/><h2>Aucun terme dans cette version</h2></section>;
  return <div className="glossary-page" data-glossary={mode}>
    <section className="glossary-index" aria-label="Termes du glossaire">
      <label className="glossary-search"><Search size={17}/><input aria-label="Rechercher dans le glossaire" placeholder="Un terme, une définition…" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <p role="status">{matches.length} termes{showReadingHelp ? ' · aide sur les codes disponible' : ''}</p>
      <ul tabIndex={0} aria-label="Liste des termes">{matches.map(item => <li key={item.id}>
        <a href={`#version=${model.version}&view=glossary&glossary=${mode}&term=${item.id}`} className={item.id === term?.id ? 'selected' : ''} aria-current={item.id === term?.id ? 'true' : undefined}
          onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onSelect(item.id); } }}>{plainInlineText(item.label_fr || item.name)}{terms.filter(other => (other.label_fr || other.name) === (item.label_fr || item.name)).length > 1 && <small> — {item.id.startsWith('MOD') ? 'notion méthodologique' : 'vocabulaire du modèle'}</small>}</a>
      </li>)}</ul>
      {showReadingHelp && !query && <details><summary>Comprendre les codes et identifiants</summary><ReadingHelp model={model}/></details>}
    </section>
    {showReadingHelp && query ? <ReadingHelp model={model}/> : term ? <article className="glossary-term" id={`term-${term.id}`} ref={detail} tabIndex={0} aria-label={`Définition de ${term.label_fr || term.name}`}>
      <h2>{plainInlineText(term.label_fr || term.name)}</h2>
      {term.label_fr && term.label_fr !== term.name && <p className="glossary-english">{term.name}</p>}
      <section id={`term-${term.id}-definition`}><h3>Définition</h3><p><ModelText text={term.definition}/></p></section>
      {publicText(term.context) && <section><h3>Contexte</h3><p><ModelText text={publicText(term.context)}/></p></section>}
      {term.examples && term.examples.length > 0 && <section><h3>Exemples</h3><ul>{term.examples.map(example => <li key={example}><ModelText text={example}/></li>)}</ul></section>}
      {(mode === 'model' || term.market_comparisons?.length) && <MarketComparisons id={`term-${term.id}-market_comparisons`} entries={term.market_comparisons} inspiration={term.market_inspiration} modelName={term.name}/>}
    </article> : <section className="glossary-empty"><h2>{selected ? 'Terme absent de ce glossaire' : 'Aucun résultat'}</h2><p>{matches.length ? 'Choisis un terme dans la liste.' : 'Essaie un autre terme ou efface la recherche.'}</p></section>}
  </div>;
}
