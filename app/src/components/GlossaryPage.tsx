import { BookOpen, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { glossaryAliases, resolveGlossaryTerm } from '../glossary';
import { plainInlineText } from '../inlineLinks';
import type { ModelingGuide } from '../modelingGuide';
import { readRoute, routeHash } from '../navigation';
import { publicText } from '../publicText';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import type { GuideState } from '../useModelingGuide';
import { MarketComparisons } from './MarketComparisons';
import { MethodLink, MethodReturn, ModelText } from './ModelLinks';
import { ReadingHelp } from './ReadingHelp';

export function GlossaryPage({
  model,
  selected,
  mode,
  routeVersion,
  guideState,
  metaGlossary,
  onSelect,
  onRetry,
}: {
  model: PublishedModel;
  selected?: string;
  routeVersion?: string;
  mode: 'model' | 'meta' | 'transformation';
  guideState: GuideState;
  metaGlossary?: ModelingGuide['glossary'];
  onSelect: (id: string) => void;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState('');
  const detail = useRef<HTMLElement>(null);
  const glossary =
    mode === 'meta' ? metaGlossary : guideState.status === 'ready' ? guideState.response.guide?.glossary : undefined;
  if (mode === 'model' && selected) selected = resolveGlossaryTerm(model.glossaryById, selected)?.id || selected;
  if (mode !== 'model' && selected) {
    selected = glossary?.aliases?.[selected] || selected;
    selected = glossary?.terms.find((t) => t.id === selected)?.parent_term || selected;
  }
  const methodIds = new Set(metaGlossary?.model_term_ids ?? []);
  const modelTerms =
    mode === 'transformation'
      ? []
      : mode === 'meta'
        ? (metaGlossary?.business_terms ?? model.glossary.filter((term) => methodIds.has(term.id))).filter(
            (term) => !metaGlossary?.aliases?.[term.id],
          )
        : model.glossary.filter((term) => !methodIds.has(term.id));
  const terms = [
    ...modelTerms.map((term) => ({
      ...term,
      label_fr: term.label_fr || '',
      historical: term.presentation === 'historical',
      role: '',
      examples: [] as readonly string[],
    })),
    ...(mode !== 'model'
      ? (glossary?.terms ?? [])
          .filter(
            (term) => (!term.parent_term && !term.guide_section && term.status !== 'retired') || term.id === selected,
          )
          .map((term) => ({
            ...term,
            alias_of: undefined,
            presentation: undefined,
            short_description: term.short_description ?? '',
            context: '',
            notes: '',
            historical: term.status === 'retired',
            market_comparisons: undefined,
            market_gaps: undefined,
            market_inspiration: undefined,
          }))
      : []),
  ].sort((a, b) => (a.label_fr || a.name).localeCompare(b.label_fr || b.name, 'fr'));
  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr');
  const showReadingHelp =
    mode === 'meta' &&
    Boolean(model.raw.display_index) &&
    (!query ||
      ['code', 'identifiant', 'identite', 'ordre', 'lecture', 'prefixe'].some(
        (word) => word.includes(normalize(query)) || normalize(query).includes(word),
      ));
  const matches = terms.filter(
    (term) =>
      !term.historical &&
      !term.alias_of &&
      !term.presentation &&
      normalize(
        `${term.label_fr} ${plainInlineText(term.name)} ${plainInlineText(term.definition)} ${glossaryAliases(model.glossary, term.id).join(' ')}`,
      ).includes(normalize(query)),
  );
  const relocated = glossary?.terms.find((t) => t.id === selected)?.guide_section;
  const groupedMatches =
    mode === 'meta' && glossary?.groups
      ? [
          ...glossary.groups.map((group) => ({
            label: group.label,
            items: matches.filter((term) => group.term_ids.includes(term.id)),
          })),
          {
            label: ui('glossaryPage.notions_metier_necessaires_a_la_lecture_du_modele'),
            items: matches.filter((term) => !glossary.groups?.some((group) => group.term_ids.includes(term.id))),
          },
        ].filter((group) => group.items.length)
      : [{ label: '', items: matches }];
  const term = selected ? terms.find((term) => term.id === selected) : groupedMatches[0]?.items[0] || matches[0];
  const termValues =
    mode === 'meta' && term ? glossary?.terms.find((entry) => entry.id === term.id)?.values : undefined;
  // A different glossary or publication starts with an unfiltered index.
  // biome-ignore lint/correctness/useExhaustiveDependencies: Mode and publication are reset triggers.
  useEffect(() => setQuery(''), [mode, model.version]);
  useEffect(() => {
    if (!term) return;
    if (detail.current) {
      detail.current.scrollTop = 0;
      if (selected) {
        detail.current.focus({ preventScroll: true });
        if (matchMedia('(max-width: 760px)').matches) detail.current.scrollIntoView({ block: 'start' });
      }
    }
  }, [term, selected]);
  if (mode === 'transformation' && guideState.status === 'loading')
    return <p role="status">{ui('glossaryPage.chargement_du_glossaire_de_transformation')}</p>;
  if (mode === 'transformation' && guideState.status === 'error')
    return (
      <section className="glossary-empty">
        <h2>{ui('glossaryPage.le_glossaire_de_transformation_n_est_pas_accessible')}</h2>
        <p>{guideState.message}</p>
        <button type="button" onClick={onRetry}>
          {ui('glossaryPage.reessayer')}
        </button>
      </section>
    );
  if (mode !== 'model' && !glossary)
    return (
      <section className="glossary-empty">
        <BookOpen size={30} />
        <h2>{ui('glossaryPage.glossaire_indisponible_pour_cette_version')}</h2>
      </section>
    );
  if (!terms.length)
    return (
      <section className="glossary-empty">
        <BookOpen size={30} />
        <h2>{ui('glossaryPage.aucun_terme_dans_cette_version')}</h2>
      </section>
    );
  const href = (view: 'glossary' | 'metamodel' | 'principles', changes = {}) =>
    routeHash({ ...readRoute(''), version: routeVersion || '', view, ...changes });
  return (
    <>
      <nav className="glossary-switch" aria-label={ui('glossaryPage.choisir_un_glossaire')}>
        <a href={href('glossary', { glossary: 'model' })} aria-current={mode === 'model' ? 'page' : undefined}>
          {ui('glossaryPage.metier')}
        </a>
        <a href={href('glossary', { glossary: 'meta' })} aria-current={mode === 'meta' ? 'page' : undefined}>
          {ui('glossaryPage.metamodele')}
        </a>
        <a
          href={href('glossary', { glossary: 'transformation' })}
          aria-current={mode === 'transformation' ? 'page' : undefined}
        >
          {ui('glossaryPage.transformation')}
        </a>
      </nav>
      {mode !== 'model' && (
        <div className="method-glossary-nav">
          <a href={href(mode === 'meta' ? 'metamodel' : 'principles')}>
            {ui('glossaryPage.retour')}
            {mode === 'meta' ? ui('glossaryPage.au_metamodele') : ui('glossaryPage.a_la_transformation')}
          </a>
          <MethodReturn />
        </div>
      )}
      <button
        type="button"
        className="glossary-mobile-jump"
        onClick={() => document.getElementById('glossary-index')?.scrollIntoView({ block: 'start' })}
      >
        {ui('glossaryPage.choisir_un_terme')}
      </button>
      <div className="glossary-page" data-glossary={mode}>
        <section className="glossary-index" id="glossary-index" aria-label={ui('glossaryPage.termes_du_glossaire')}>
          <label className="glossary-search">
            <Search size={17} />
            <input
              aria-label={ui('glossaryPage.rechercher_dans_le_glossaire')}
              placeholder={ui('glossaryPage.un_terme_une_definition')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <p role="status">
            {matches.length}
            {ui('glossaryPage.termes')}
            {showReadingHelp ? ui('glossaryPage.aide_sur_les_codes_disponible') : ''}
          </p>
          {groupedMatches.map((group) => (
            <section key={group.label}>
              {group.label && <h3>{group.label}</h3>}
              <ul tabIndex={0} aria-label={group.label || ui('glossaryPage.liste_des_termes')}>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={href('glossary', { glossary: mode, term: item.id })}
                      className={item.id === term?.id ? 'selected' : ''}
                      aria-current={item.id === term?.id ? 'true' : undefined}
                      onClick={(event) => {
                        if (
                          event.button === 0 &&
                          !event.metaKey &&
                          !event.ctrlKey &&
                          !event.shiftKey &&
                          !event.altKey
                        ) {
                          event.preventDefault();
                          onSelect(item.id);
                        }
                      }}
                    >
                      {plainInlineText(item.label_fr || item.name)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {showReadingHelp && !query && (
            <details>
              <summary>{ui('glossaryPage.comprendre_les_codes_et_identifiants')}</summary>
              <ReadingHelp model={model} />
            </details>
          )}
        </section>
        {relocated ? (
          <section className="glossary-empty">
            <h2>{ui('glossaryPage.cette_regle_appartient_a_la_methode')}</h2>
            <MethodLink term={selected}>{ui('glossaryPage.consulter_cette_regle')}</MethodLink>
          </section>
        ) : showReadingHelp && query ? (
          <ReadingHelp model={model} />
        ) : term ? (
          <article
            className="glossary-term"
            id={`term-${term.id}`}
            ref={detail}
            tabIndex={0}
            aria-label={ui('glossaryPage.definition_de', { value1: term.label_fr || term.name })}
          >
            <h2>{plainInlineText(term.label_fr || term.name)}</h2>
            {term.historical && (
              <p className="historical-notice">
                {ui('glossaryPage.notion_historique_elle_est_conservee_pour_les_anciens_liens_et_re')}
              </p>
            )}
            {'presentation' in term && term.presentation === 'method' && (
              <p>
                {ui('glossaryPage.ce_verbe_appartient_aux_conseils_de_redaction')}{' '}
                <a href={href('principles', { principle: 'method' })}>
                  {ui('glossaryPage.consulter_la_methode_de_modelisation')}
                </a>
                .
              </p>
            )}
            {mode === 'model' && glossaryAliases(model.glossary, term.id).length > 0 && (
              <p className="term-origin">
                {ui('glossaryPage.egalement_recherche_sous')}
                {glossaryAliases(model.glossary, term.id).join(', ')}.
              </p>
            )}
            {mode !== 'model' && (
              <p className="term-origin">
                {mode === 'meta' ? ui('glossaryPage.metamodele') : ui('glossaryPage.transformation')} · {term.id}
              </p>
            )}
            {term.label_fr && term.label_fr !== term.name && <p className="glossary-english">{term.name}</p>}
            <section id={`term-${term.id}-definition`}>
              <h3>{ui('glossaryPage.definition')}</h3>
              <p>
                <ModelText text={term.definition} />
              </p>
            </section>
            {publicText(term.context) && (
              <section>
                <h3>{ui('glossaryPage.contexte')}</h3>
                <p>
                  <ModelText text={publicText(term.context)} />
                </p>
              </section>
            )}
            {mode === 'meta' &&
              glossary?.terms
                .find((item) => item.id === term.id)
                ?.notes?.filter((note) => !/scenario_catalog|fields\.|notion retirée du métamodèle actif/.test(note))
                .map((note) => (
                  <p key={note}>
                    <ModelText text={note} />
                  </p>
                ))}
            {mode === 'meta' && ['MOD026', 'MOD027', 'MOD028'].includes(term.id) && (
              <nav aria-label={ui('glossaryPage.notions_associees')}>
                {glossary?.terms.find((t) => t.id === 'MOD026')?.status !== 'retired' && (
                  <>
                    <MethodLink term="MOD026">{ui('glossaryPage.cas_d_usage')}</MethodLink> ·{' '}
                  </>
                )}
                <MethodLink term="MOD027">{ui('glossaryPage.scenario')}</MethodLink> ·{' '}
                <MethodLink term="MOD028">{ui('glossaryPage.parcours_de_mobilisation')}</MethodLink>
              </nav>
            )}
            {termValues && (
              <section>
                <h3>{ui('glossaryPage.valeurs')}</h3>
                <dl>
                  {Object.entries(termValues).map(([label, definition]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        <ModelText text={definition} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {term.examples && term.examples.length > 0 && (
              <section>
                <h3>{ui('glossaryPage.exemples')}</h3>
                <ul>
                  {term.examples.map((example) => (
                    <li key={example}>
                      <ModelText text={example} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(mode === 'model' || term.market_comparisons?.length) && (
              <MarketComparisons
                id={`term-${term.id}-market_comparisons`}
                entries={term.market_comparisons}
                inspiration={term.market_inspiration}
                modelName={term.name}
                gaps={term.market_gaps}
              />
            )}
          </article>
        ) : (
          <section className="glossary-empty">
            <h2>{selected ? ui('glossaryPage.terme_absent_de_ce_glossaire') : ui('glossaryPage.aucun_resultat')}</h2>
            <p>
              {matches.length
                ? ui('glossaryPage.choisis_un_terme_dans_la_liste')
                : ui('glossaryPage.essaie_un_autre_terme_ou_efface_la_recherche')}
            </p>
          </section>
        )}
      </div>
    </>
  );
}
