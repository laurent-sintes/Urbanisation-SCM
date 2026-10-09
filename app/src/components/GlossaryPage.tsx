import { ReadingHelp } from './ReadingHelp';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { PublishedModel } from '../types';
import type { GuideState } from '../useModelingGuide';
import type { ModelingGuide } from '../modelingGuide';
import { ModelText, MethodLink, MethodReturn } from './ModelLinks';
import { plainInlineText } from '../inlineLinks';
import { publicText } from '../publicText';
import { MarketComparisons } from './MarketComparisons';
import { resolveGlossaryTerm, glossaryAliases } from '../glossary';

export function GlossaryPage({ model, selected, mode, routeVersion, guideState, metaGlossary, onSelect, onRetry }: {
  model: PublishedModel; selected?: string; routeVersion?: string; mode: 'model' | 'meta' | 'transformation'; guideState: GuideState; metaGlossary?: ModelingGuide['glossary'];
  onSelect: (id: string) => void; onRetry: () => void;
}) {
  const [query, setQuery] = useState('');
  const detail = useRef<HTMLElement>(null);
  const glossary = mode === 'meta' ? metaGlossary : guideState.status === 'ready' ? guideState.response.guide?.glossary : undefined;
  if (mode === 'model' && selected) selected = resolveGlossaryTerm(model.glossaryById, selected)?.id || selected;
  if (mode !== 'model' && selected) {
    selected = glossary?.aliases?.[selected] || selected;
    selected = glossary?.terms.find(t => t.id === selected)?.parent_term || selected;
  }
  const methodIds = new Set(metaGlossary?.model_term_ids ?? []);
  const modelTerms = mode === 'transformation' ? [] : mode === 'meta'
    ? (metaGlossary?.business_terms ?? model.glossary.filter(term => methodIds.has(term.id))).filter(term => !metaGlossary?.aliases?.[term.id])
    : model.glossary.filter(term => !methodIds.has(term.id));
  const terms = [
    ...modelTerms.map(term => ({ ...term, label_fr: term.label_fr || '', historical: term.presentation === 'historical', role: '', examples: [] as readonly string[] })),
    ...(mode !== 'model' ? (glossary?.terms ?? []).filter(term => (!term.parent_term && !term.guide_section && term.status !== 'retired') || term.id === selected).map(term => ({ ...term, alias_of: undefined, presentation: undefined, short_description: term.short_description ?? '', context: '', notes: '', historical: term.status === 'retired', market_comparisons: undefined, market_gaps: undefined, market_inspiration: undefined })) : []),
  ].sort((a, b) => (a.label_fr || a.name).localeCompare(b.label_fr || b.name, 'fr'));
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
  const showReadingHelp = mode === 'meta' && Boolean(model.raw.display_index) && (!query || ['code', 'identifiant', 'identite', 'ordre', 'lecture', 'prefixe'].some(word => word.includes(normalize(query)) || normalize(query).includes(word)));
  const matches = terms.filter(term => !term.historical && !term.alias_of && !term.presentation && normalize(`${term.label_fr} ${plainInlineText(term.name)} ${plainInlineText(term.definition)} ${glossaryAliases(model.glossary, term.id).join(' ')}`).includes(normalize(query)));
  const relocated = glossary?.terms.find(t=>t.id===selected)?.guide_section;
  const groupedMatches = mode === 'meta' && glossary?.groups
    ? [...glossary.groups.map(group => ({ label: group.label, items: matches.filter(term => group.term_ids.includes(term.id)) })),
      { label: 'Notions métier nécessaires à la lecture du modèle', items: matches.filter(term => !glossary.groups?.some(group => group.term_ids.includes(term.id))) }].filter(group => group.items.length)
    : [{ label: '', items: matches }];
  const term = selected ? terms.find(term => term.id === selected) : groupedMatches[0]?.items[0] || matches[0];
  useEffect(() => setQuery(''), [mode, model.version]);
  useEffect(() => {
    if (detail.current) { detail.current.scrollTop = 0; if (selected) { detail.current.focus({ preventScroll: true }); if (matchMedia('(max-width: 760px)').matches) detail.current.scrollIntoView({ block: 'start' }); } }
  }, [term?.id, model.version]);
  if (mode === 'transformation' && guideState.status === 'loading') return <p role="status">Chargement du glossaire de transformation…</p>;
  if (mode === 'transformation' && guideState.status === 'error') return <section className="glossary-empty"><h2>Le glossaire de transformation n’est pas accessible</h2><p>{guideState.message}</p><button onClick={onRetry}>Réessayer</button></section>;
  if (mode !== 'model' && !glossary) return <section className="glossary-empty"><BookOpen size={30}/><h2>Glossaire indisponible pour cette version</h2></section>;
  if (!terms.length) return <section className="glossary-empty"><BookOpen size={30}/><h2>Aucun terme dans cette version</h2></section>;
  return <><nav className="glossary-switch" aria-label="Choisir un glossaire"><a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=glossary&glossary=model`} aria-current={mode==='model' ? 'page' : undefined}>Métier</a><a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=glossary&glossary=meta`} aria-current={mode==='meta' ? 'page' : undefined}>Métamodèle</a><a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=glossary&glossary=transformation`} aria-current={mode==='transformation' ? 'page' : undefined}>Transformation</a></nav>{mode !== 'model' && <div className="method-glossary-nav"><a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=${mode === 'meta' ? 'metamodel' : 'principles'}`}>Retour {mode === 'meta' ? 'au métamodèle' : 'à la transformation'}</a><MethodReturn/></div>}<a className="glossary-mobile-jump" href="#glossary-index">Choisir un terme</a><div className="glossary-page" data-glossary={mode}>
    <section className="glossary-index" id="glossary-index" aria-label="Termes du glossaire">
      <label className="glossary-search"><Search size={17}/><input aria-label="Rechercher dans le glossaire" placeholder="Un terme, une définition…" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <p role="status">{matches.length} termes{showReadingHelp ? ' · aide sur les codes disponible' : ''}</p>
      {groupedMatches.map(group=><section key={group.label}>
        {group.label && <h3>{group.label}</h3>}
        <ul tabIndex={0} aria-label={group.label || 'Liste des termes'}>{group.items.map(item => <li key={item.id}>
          <a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=glossary&glossary=${mode}&term=${item.id}`} className={item.id===term?.id?'selected':''} aria-current={item.id===term?.id?'true':undefined}
            onClick={event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onSelect(item.id);}}}>{plainInlineText(item.label_fr || item.name)}</a>
        </li>)}</ul></section>)}
      {showReadingHelp && !query && <details><summary>Comprendre les codes et identifiants</summary><ReadingHelp model={model}/></details>}
    </section>
    {relocated ? <section className="glossary-empty"><h2>Cette règle appartient à la méthode</h2><MethodLink term={selected}>Consulter cette règle</MethodLink></section> : showReadingHelp && query ? <ReadingHelp model={model}/> : term ? <article className="glossary-term" id={`term-${term.id}`} ref={detail} tabIndex={0} aria-label={`Définition de ${term.label_fr || term.name}`}>
      <h2>{plainInlineText(term.label_fr || term.name)}</h2>
      {term.historical && <p className="historical-notice">Notion historique : elle est conservée pour les anciens liens et retirée de la liste courante de cette publication.</p>}
      {'presentation' in term && term.presentation === 'method' && <p>Ce verbe appartient aux conseils de rédaction. <a href={`#${routeVersion ? `version=${routeVersion}&` : ''}view=principles&principle=method`}>Consulter la méthode de modélisation</a>.</p>}
      {mode === 'model' && glossaryAliases(model.glossary, term.id).length > 0 && <p className="term-origin">Également recherché sous : {glossaryAliases(model.glossary, term.id).join(', ')}.</p>}
      {mode !== 'model' && <p className="term-origin">{mode === 'meta' ? 'Métamodèle' : 'Transformation'} · {term.id}</p>}
      {term.label_fr && term.label_fr !== term.name && <p className="glossary-english">{term.name}</p>}
      <section id={`term-${term.id}-definition`}><h3>Définition</h3><p><ModelText text={term.definition}/></p></section>
      {publicText(term.context) && <section><h3>Contexte</h3><p><ModelText text={publicText(term.context)}/></p></section>}
      {mode === 'meta' && glossary?.terms.find(item => item.id === term.id)?.notes?.filter(note => !/scenario_catalog|fields\.|notion retirée du métamodèle actif/.test(note)).map((note, i) => <p key={i}><ModelText text={note}/></p>)}
      {mode === 'meta' && ['MOD026', 'MOD027', 'MOD028'].includes(term.id) && <nav aria-label="Notions associées">{glossary?.terms.find(t=>t.id==='MOD026')?.status !== 'retired' && <><MethodLink term="MOD026">Cas d’usage</MethodLink> · </>}<MethodLink term="MOD027">Scénario</MethodLink> · <MethodLink term="MOD028">Parcours de mobilisation</MethodLink></nav>}
      {mode === 'meta' && glossary?.terms.find(t=>t.id===term.id)?.values && <section><h3>Valeurs</h3><dl>{Object.entries(glossary.terms.find(t=>t.id===term.id)!.values!).map(([label,definition])=><div key={label}><dt>{label}</dt><dd><ModelText text={definition}/></dd></div>)}</dl></section>}
      {term.examples && term.examples.length > 0 && <section><h3>Exemples</h3><ul>{term.examples.map(example => <li key={example}><ModelText text={example}/></li>)}</ul></section>}
      {(mode === 'model' || term.market_comparisons?.length) && <MarketComparisons id={`term-${term.id}-market_comparisons`} entries={term.market_comparisons} inspiration={term.market_inspiration} modelName={term.name} gaps={term.market_gaps}/>}
    </article> : <section className="glossary-empty"><h2>{selected ? 'Terme absent de ce glossaire' : 'Aucun résultat'}</h2><p>{matches.length ? 'Choisis un terme dans la liste.' : 'Essaie un autre terme ou efface la recherche.'}</p></section>}
  </div></>;
}
