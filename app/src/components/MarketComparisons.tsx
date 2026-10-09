import { marketComparisonsForReading, marketText } from '../marketContent';
import type { MarketComparison, MarketGap, MarketInspiration } from '../types';
import { ModelText } from './ModelLinks';
import './market-comparisons.css';

function SourceLink({ url, title }: { url: string; title: string }) {
  return /^https?:\/\//i.test(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${title} (nouvel onglet)`}>
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
        <h3 id={`${id}-synthesis-title`}>Ce qui nous rapproche et nous distingue</h3>
        {inspiration.synthesis.map((paragraph) => (
          <p key={marketText(paragraph)}>
            <ModelText text={marketText(paragraph)} />
          </p>
        ))}
      </section>
      <div className="inspiration-table-scroll" tabIndex={0} role="region" aria-labelledby={`${id}-table-caption`}>
        <table className="inspiration-table">
          <caption id={`${id}-table-caption`}>Comparer les sources d’inspiration et FLOW</caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Nom du concept</th>
              <th scope="col">Périmètre</th>
              <th scope="col">Approche</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.vendor}:${entry.concept_name}:${entry.source_url}`}>
                <th scope="row">
                  <SourceLink url={entry.source_url} title={entry.vendor} />
                  {entry.product !== entry.concept_name && <small>{entry.product}</small>}
                </th>
                <td data-label="Concept">
                  <ModelText text={marketText(entry.concept_name)} />
                </td>
                <td data-label="Périmètre">
                  <ModelText text={marketText(entry.scope_summary)} />
                </td>
                <td data-label="Approche">
                  <ModelText text={marketText(entry.approach_summary)} />
                </td>
              </tr>
            ))}
            <tr className="inspiration-flow">
              <th scope="row">Notre modèle FLOW</th>
              <td data-label="Concept">
                <ModelText text={modelName || ''} />
              </td>
              <td data-label="Périmètre">
                <ModelText text={marketText(inspiration.flow_scope)} />
              </td>
              <td data-label="Approche">
                <ModelText text={marketText(inspiration.flow_approach)} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {inspiration.examples.length > 0 && (
        <section className="inspiration-examples" aria-labelledby={`${id}-examples-title`}>
          <h3 id={`${id}-examples-title`}>Un exemple pour comprendre</h3>
          {inspiration.examples.map((example) => (
            <article className="inspiration-example" key={`${example.source_url}:${example.title}`}>
              <h4>{marketText(example.title)}</h4>
              <p className="market-source">
                Exemple inspiré de <SourceLink url={example.source_url} title={example.source_title} />
              </p>
              <p>
                <ModelText text={marketText(example.situation)} />
              </p>
              {example.outcome && (
                <p>
                  <strong>Ce qui se passe. </strong>
                  <ModelText text={marketText(example.outcome)} />
                </p>
              )}
              {example.lesson && (
                <p className="inspiration-lesson">
                  <strong>Lecture FLOW. </strong>
                  <ModelText text={marketText(example.lesson)} />
                </p>
              )}
            </article>
          ))}
        </section>
      )}
      <section className="inspiration-sources" aria-labelledby={`${id}-sources-title`}>
        <h3 id={`${id}-sources-title`}>Documents consultés</h3>
        {entries.map((entry) => (
          <div className="inspiration-source" key={`${entry.vendor}:${entry.element_name}:${entry.source_url}`}>
            <p className="market-source">
              <strong>{entry.vendor} — </strong>
              <SourceLink url={entry.source_url} title={entry.source_title} />
            </p>
            <details className="market-detail">
              <summary>Détails et limites de la référence</summary>
              <p>
                {entry.product} · {entry.element_type}
              </p>
              <p>
                <strong>Concept documenté : </strong>
                {entry.element_name} · {marketText(entry.relationship)}
              </p>
              <p>
                {entry.source_version} · Consultée le {entry.consulted_on}
              </p>
              <p>
                <strong>Passage : </strong>
                {entry.source_locator}
              </p>
              <dl className="market-content">
                <div>
                  <dt>Points communs avec FLOW</dt>
                  <dd>
                    <ModelText text={marketText(entry.similarities)} />
                  </dd>
                </div>
                <div>
                  <dt>Différences et limites</dt>
                  <dd>
                    <ModelText text={marketText(entry.differences)} />
                  </dd>
                </div>
              </dl>
              {entry.term_choice && (
                <p>
                  <strong>Choix du terme : </strong>
                  <ModelText text={marketText(entry.term_choice)} />
                </p>
              )}
              {entry.definition_choice && (
                <p>
                  <strong>Choix du périmètre : </strong>
                  <ModelText text={marketText(entry.definition_choice)} />
                </p>
              )}
              {entry.flow_position && ![entry.term_choice, entry.definition_choice].includes(entry.flow_position) && (
                <p>
                  <strong>Position FLOW : </strong>
                  <ModelText text={marketText(entry.flow_position)} />
                </p>
              )}
              {entry.evidence_limits && (
                <p>
                  <strong>Portée de la source : </strong>
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
    <section id={id} tabIndex={-1} className="market-comparisons" aria-label="Sources d’inspiration">
      <h2>Sources d’inspiration</h2>
      {!!gaps?.length && (
        <section className="market-gaps" aria-label="Limites de la comparaison">
          <h3>Appuis restant à établir</h3>
          <ul>
            {gaps.map((gap) => (
              <li key={gap.family}>
                <strong>{gap.family === 'microsoft_dynamics' ? 'Microsoft Dynamics' : 'SAP S/4HANA'} : </strong>
                <ModelText text={gap.reason} />
              </li>
            ))}
          </ul>
          <p>Cette limite documentaire ne signifie pas que la fonction est absente du produit.</p>
        </section>
      )}
      {inspiration ? (
        <InspirationOverview entries={entries || []} inspiration={inspiration} modelName={modelName} id={id} />
      ) : !entries?.length ? (
        <p className="market-intro">Positionnement non documenté dans cette publication.</p>
      ) : (
        <>
          <p className="market-intro">
            Pourquoi ces termes et ce périmètre : choix FLOW, appuis du marché et différences. Ces références éclairent
            le métier sans désigner une solution à implémenter.
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
                      <strong>Pourquoi ce terme. </strong>
                      <ModelText text={marketText(entry.term_choice)} />
                    </p>
                  )}
                  {entry.definition_choice && (
                    <p>
                      <strong>Pourquoi cette définition. </strong>
                      <ModelText text={marketText(entry.definition_choice)} />
                    </p>
                  )}
                  {entry.flow_position &&
                    ![entry.term_choice, entry.definition_choice].some(
                      (text) => marketText(text) === marketText(entry.flow_position),
                    ) && (
                      <p>
                        <strong>Position FLOW. </strong>
                        <ModelText text={marketText(entry.flow_position)} />
                      </p>
                    )}
                </div>
                <p className="market-source">
                  <strong>Source : </strong>
                  {/^https?:\/\//i.test(entry.source_url) ? (
                    <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
                      {entry.source_title} ↗
                    </a>
                  ) : (
                    <span>{entry.source_title}</span>
                  )}
                  <span>Consultée le {entry.consulted_on}</span>
                </p>
                <details className="market-detail">
                  <summary>Comparer les périmètres et examiner la source</summary>
                  <p className="market-relationship">Nature de la référence : {entry.element_type}</p>
                  <dl className="market-content">
                    <div>
                      <dt>Points communs</dt>
                      <dd>
                        <ModelText text={marketText(entry.similarities)} />
                      </dd>
                    </div>
                    <div>
                      <dt>Différences et limites de périmètre</dt>
                      <dd>
                        <ModelText text={marketText(entry.differences)} />
                      </dd>
                    </div>
                  </dl>
                  <div className="market-evidence">
                    <p>{entry.source_version}</p>
                    <p>
                      <strong>Passage :</strong> {entry.source_locator}
                    </p>
                    {entry.evidence_limits && (
                      <p>
                        <strong>Portée de la source :</strong> <ModelText text={marketText(entry.evidence_limits)} />
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
