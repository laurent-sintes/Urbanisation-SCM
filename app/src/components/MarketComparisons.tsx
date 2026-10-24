import { marketComparisonsForReading, marketText } from '../marketContent';
import type { MarketComparison, MarketGap, MarketInspiration } from '../types';
import { ui } from '../ui.ts';
import { ModelText } from './ModelLinks';
import './market-comparisons.css';

function SourceLink({ url, title }: { url: string; title: string }) {
  return /^https?:\/\//i.test(url) ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ui('marketComparisons.nouvel_onglet', { title: title })}
    >
      {title} ↗
    </a>
  ) : (
    <span>{title}</span>
  );
}

function InspirationOverview({
  entries,
  inspiration,
  modelName,
  id,
}: {
  entries: readonly MarketComparison[];
  inspiration: MarketInspiration;
  modelName?: string;
  id: string;
}) {
  return (
    <div className="market-inspiration">
      <p className="inspiration-choice">
        <ModelText
          text={
            marketText(inspiration.choice) === modelName
              ? marketText(inspiration.flow_scope)
              : marketText(inspiration.choice)
          }
        />
      </p>
      <section className="inspiration-synthesis" aria-labelledby={`${id}-synthesis-title`}>
        <h3 id={`${id}-synthesis-title`}>{ui('marketComparisons.ce_qui_nous_rapproche_et_nous_distingue')}</h3>
        {inspiration.synthesis.map((paragraph) => (
          <p key={marketText(paragraph)}>
            <ModelText text={marketText(paragraph)} />
          </p>
        ))}
      </section>
      <div className="inspiration-table-scroll" tabIndex={0} role="region" aria-labelledby={`${id}-table-caption`}>
        <table className="inspiration-table">
          <caption id={`${id}-table-caption`}>
            {ui('marketComparisons.comparer_les_sources_d_inspiration_et_flow')}
          </caption>
          <thead>
            <tr>
              <th scope="col">{ui('marketComparisons.source')}</th>
              <th scope="col">{ui('marketComparisons.nom_du_concept')}</th>
              <th scope="col">{ui('marketComparisons.perimetre')}</th>
              <th scope="col">{ui('marketComparisons.approche')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.vendor}:${entry.concept_name}:${entry.source_url}`}>
                <th scope="row">
                  <SourceLink url={entry.source_url} title={entry.vendor} />
                  {entry.product !== entry.concept_name && <small>{entry.product}</small>}
                </th>
                <td data-label={ui('marketComparisons.concept')}>
                  <ModelText text={marketText(entry.concept_name)} />
                </td>
                <td data-label={ui('marketComparisons.perimetre')}>
                  <ModelText text={marketText(entry.scope_summary)} />
                </td>
                <td data-label={ui('marketComparisons.approche')}>
                  <ModelText text={marketText(entry.approach_summary)} />
                </td>
              </tr>
            ))}
            <tr className="inspiration-flow">
              <th scope="row">{ui('marketComparisons.notre_modele_flow')}</th>
              <td data-label={ui('marketComparisons.concept')}>
                <ModelText text={modelName || ''} />
              </td>
              <td data-label={ui('marketComparisons.perimetre')}>
                <ModelText text={marketText(inspiration.flow_scope)} />
              </td>
              <td data-label={ui('marketComparisons.approche')}>
                <ModelText text={marketText(inspiration.flow_approach)} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {inspiration.examples.length > 0 && (
        <section className="inspiration-examples" aria-labelledby={`${id}-examples-title`}>
          <h3 id={`${id}-examples-title`}>{ui('marketComparisons.un_exemple_pour_comprendre')}</h3>
          {inspiration.examples.map((example) => (
            <article className="inspiration-example" key={`${example.source_url}:${example.title}`}>
              <h4>{marketText(example.title)}</h4>
              <p className="market-source">
                {ui('marketComparisons.exemple_inspire_de')}
                <SourceLink url={example.source_url} title={example.source_title} />
              </p>
              <p>
                <ModelText text={marketText(example.situation)} />
              </p>
              {example.outcome && (
                <p>
                  <strong>{ui('marketComparisons.ce_qui_se_passe')}</strong>
                  <ModelText text={marketText(example.outcome)} />
                </p>
              )}
              {example.lesson && (
                <p className="inspiration-lesson">
                  <strong>{ui('marketComparisons.lecture_flow')}</strong>
                  <ModelText text={marketText(example.lesson)} />
                </p>
              )}
            </article>
          ))}
        </section>
      )}
      <section className="inspiration-sources" aria-labelledby={`${id}-sources-title`}>
        <h3 id={`${id}-sources-title`}>{ui('marketComparisons.documents_consultes')}</h3>
        {entries.map((entry) => (
          <div className="inspiration-source" key={`${entry.vendor}:${entry.element_name}:${entry.source_url}`}>
            <p className="market-source">
              <strong>{entry.vendor} — </strong>
              <SourceLink url={entry.source_url} title={entry.source_title} />
            </p>
            <details className="market-detail">
              <summary>{ui('marketComparisons.details_et_limites_de_la_reference')}</summary>
              <p>
                {entry.product} · {entry.element_type}
              </p>
              <p>
                <strong>{ui('marketComparisons.concept_documente')}</strong>
                {entry.element_name} · {marketText(entry.relationship)}
              </p>
              <p>
                {entry.source_version}
                {ui('marketComparisons.consultee_le')}
                {entry.consulted_on}
              </p>
              <p>
                <strong>{ui('marketComparisons.passage')}</strong>
                {entry.source_locator}
              </p>
              <dl className="market-content">
                <div>
                  <dt>{ui('marketComparisons.points_communs_avec_flow')}</dt>
                  <dd>
                    <ModelText text={marketText(entry.similarities)} />
                  </dd>
                </div>
                <div>
                  <dt>{ui('marketComparisons.differences_et_limites')}</dt>
                  <dd>
                    <ModelText text={marketText(entry.differences)} />
                  </dd>
                </div>
              </dl>
              {entry.term_choice && (
                <p>
                  <strong>{ui('marketComparisons.choix_du_terme')}</strong>
                  <ModelText text={marketText(entry.term_choice)} />
                </p>
              )}
              {entry.definition_choice && (
                <p>
                  <strong>{ui('marketComparisons.choix_du_perimetre')}</strong>
                  <ModelText text={marketText(entry.definition_choice)} />
                </p>
              )}
              {entry.flow_position && ![entry.term_choice, entry.definition_choice].includes(entry.flow_position) && (
                <p>
                  <strong>{ui('marketComparisons.position_flow')}</strong>
                  <ModelText text={marketText(entry.flow_position)} />
                </p>
              )}
              {entry.evidence_limits && (
                <p>
                  <strong>{ui('marketComparisons.portee_de_la_source')}</strong>
                  <ModelText text={marketText(entry.evidence_limits)} />
                </p>
              )}
            </details>
          </div>
        ))}
      </section>
    </div>
  );
}

export function MarketComparisons({
  entries,
  inspiration,
  modelName,
  id,
  gaps,
}: {
  entries?: readonly MarketComparison[];
  inspiration?: MarketInspiration;
  modelName?: string;
  id: string;
  gaps?: readonly MarketGap[];
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className="market-comparisons"
      aria-label={ui('marketComparisons.sources_d_inspiration')}
    >
      <h2>{ui('marketComparisons.sources_d_inspiration')}</h2>
      {!!gaps?.length && (
        <section className="market-gaps" aria-label={ui('marketComparisons.limites_de_la_comparaison')}>
          <h3>{ui('marketComparisons.appuis_restant_a_etablir')}</h3>
          <ul>
            {gaps.map((gap) => (
              <li key={gap.family}>
                <strong>
                  {gap.family === 'microsoft_dynamics'
                    ? ui('marketComparisons.microsoft_dynamics')
                    : ui('marketComparisons.sap_s_4hana')}{' '}
                  :{' '}
                </strong>
                <ModelText text={gap.reason} />
              </li>
            ))}
          </ul>
          <p>{ui('marketComparisons.cette_limite_documentaire_ne_signifie_pas_que_la_fonction_est_abs')}</p>
        </section>
      )}
      {inspiration ? (
        <InspirationOverview entries={entries || []} inspiration={inspiration} modelName={modelName} id={id} />
      ) : !entries?.length ? (
        <p className="market-intro">{ui('marketComparisons.positionnement_non_documente_dans_cette_publication')}</p>
      ) : (
        <>
          <p className="market-intro">
            {ui('marketComparisons.pourquoi_ces_termes_et_ce_perimetre_choix_flow_appuis_du_marche_e')}
          </p>
          <div className="market-cards">
            {marketComparisonsForReading(entries).map((entry) => (
              <article className="market-card" key={`${entry.vendor}:${entry.element_name}:${entry.source_url}`}>
                <header>
                  <div>
                    <p className="market-vendor">
                      {entry.vendor} · {entry.product}
                    </p>
                    <h3>{entry.element_name}</h3>
                  </div>
                  <span className="market-relationship">{marketText(entry.relationship)}</span>
                </header>
                <div className="market-choice">
                  {entry.term_choice && (
                    <p>
                      <strong>{ui('marketComparisons.pourquoi_ce_terme')}</strong>
                      <ModelText text={marketText(entry.term_choice)} />
                    </p>
                  )}
                  {entry.definition_choice && (
                    <p>
                      <strong>{ui('marketComparisons.pourquoi_cette_definition')}</strong>
                      <ModelText text={marketText(entry.definition_choice)} />
                    </p>
                  )}
                  {entry.flow_position &&
                    ![entry.term_choice, entry.definition_choice].some(
                      (text) => marketText(text) === marketText(entry.flow_position),
                    ) && (
                      <p>
                        <strong>{ui('marketComparisons.position_flow_2')}</strong>
                        <ModelText text={marketText(entry.flow_position)} />
                      </p>
                    )}
                </div>
                <p className="market-source">
                  <strong>{ui('marketComparisons.source_2')}</strong>
                  {/^https?:\/\//i.test(entry.source_url) ? (
                    <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
                      {entry.source_title} ↗
                    </a>
                  ) : (
                    <span>{entry.source_title}</span>
                  )}
                  <span>
                    {ui('marketComparisons.consultee_le_2')}
                    {entry.consulted_on}
                  </span>
                </p>
                <details className="market-detail">
                  <summary>{ui('marketComparisons.comparer_les_perimetres_et_examiner_la_source')}</summary>
                  <p className="market-relationship">
                    {ui('marketComparisons.nature_de_la_reference')}
                    {entry.element_type}
                  </p>
                  <dl className="market-content">
                    <div>
                      <dt>{ui('marketComparisons.points_communs')}</dt>
                      <dd>
                        <ModelText text={marketText(entry.similarities)} />
                      </dd>
                    </div>
                    <div>
                      <dt>{ui('marketComparisons.differences_et_limites_de_perimetre')}</dt>
                      <dd>
                        <ModelText text={marketText(entry.differences)} />
                      </dd>
                    </div>
                  </dl>
                  <div className="market-evidence">
                    <p>{entry.source_version}</p>
                    <p>
                      <strong>{ui('marketComparisons.passage_2')}</strong> {entry.source_locator}
                    </p>
                    {entry.evidence_limits && (
                      <p>
                        <strong>{ui('marketComparisons.portee_de_la_source_2')}</strong>{' '}
                        <ModelText text={marketText(entry.evidence_limits)} />
                      </p>
                    )}
                  </div>
                </details>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
