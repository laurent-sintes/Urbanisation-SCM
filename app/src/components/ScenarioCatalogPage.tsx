import { useState } from 'react';
import type { RouteState } from '../navigation';
import { catalogOf, filterScenarios, scenarioCapabilities } from '../scenarioCatalog';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { CatalogLink, MethodLink, ModelText, ReferenceLink } from './ModelLinks';
import './scenario-catalog.css';

function marketSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export function ScenarioCatalogPage({
  model,
  route,
  onChange,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (v: Partial<RouteState>) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const catalog = catalogOf(model);
  if (!catalog)
    return (
      <article className="scenario-catalog">
        <h2>{ui('scenarioCatalogPage.catalogue_absent_de_cette_publication')}</h2>
        <p>{ui('scenarioCatalogPage.les_illustrations_historiques_restent_accessibles_dans_les_fiches')}</p>
      </article>
    );
  const scenario = catalog.scenarios.find((s) => s.id === route.scenario);
  const stream = catalog.value_streams.find((s) => s.id === route.stream);
  const paths = catalog.paths.filter((p) => p.scenario_id === scenario?.id);
  const path = route.path ? paths.find((p) => p.id === route.path) : paths[0];
  const change = (v: Partial<RouteState>) => onChange({ ...v, section: '' });
  const filtered = filterScenarios(catalog, {
    stream: route.stream,
    event: route.event,
    object: route.object,
    situation: route.situation,
    capability: route.capability,
    query: route.scenarioQuery,
  });
  const advancedCount = [route.event, route.object, route.situation, route.capability].filter(Boolean).length;
  const activeFilters = [
    ...(['events', 'objects', 'situations'] as const).map((facet, index) => {
      const key = (['event', 'object', 'situation'] as const)[index];
      return {
        key,
        label: [
          ui('scenarioCatalogPage.evenement'),
          ui('scenarioCatalogPage.objet_metier'),
          ui('scenarioCatalogPage.situation'),
        ][index],
        value: route[key],
        text: catalog.facets[facet].find((item) => item.id === route[key])?.label || route[key],
      };
    }),
    {
      key: 'capability',
      label: ui('scenarioCatalogPage.capacite'),
      value: route.capability,
      text: model.nodeById.get(route.capability || '')?.name || route.capability,
    },
  ].filter((filter) => filter.value);
  const cards = (items: typeof catalog.scenarios) => (
    <ul className="scenario-cards">
      {items.map((s) => (
        <li key={s.id}>
          <CatalogLink scenario={s.id}>{s.title}</CatalogLink>
          <p>
            <ModelText text={s.objective} />
          </p>
          <small>
            {s.nature === 'illustrative'
              ? ui('scenarioCatalogPage.illustration_metier')
              : ui('scenarioCatalogPage.situation_documentee')}{' '}
            · {scenarioCapabilities(catalog, s.id).length}
            {ui('scenarioCatalogPage.elements_mobilises')}
          </small>
        </li>
      ))}
    </ul>
  );
  if ((route.scenario && !scenario) || (route.stream && !stream) || (route.path && !path))
    return (
      <article className="scenario-catalog">
        <h2>{ui('scenarioCatalogPage.element_absent_de_cette_publication')}</h2>
        <CatalogLink>{ui('scenarioCatalogPage.revenir_au_catalogue')}</CatalogLink>
      </article>
    );
  return (
    <article className="scenario-catalog">
      <nav aria-label={ui('scenarioCatalogPage.navigation_des_scenarios')}>
        <CatalogLink>{ui('scenarioCatalogPage.catalogue_des_scenarios')}</CatalogLink> ·{' '}
        <MethodLink term="MOD027">{ui('scenarioCatalogPage.comprendre_scenario_et_parcours')}</MethodLink>
        {route.node && model.nodeById.has(route.node) && (
          <>
            {' '}
            ·{' '}
            <ReferenceLink target={route.node} anchor="examples">
              {ui('scenarioCatalogPage.revenir_a_la_fiche')}
            </ReferenceLink>
          </>
        )}
      </nav>
      {scenario ? (
        <>
          <p className="section-kicker">
            {scenario.nature === 'illustrative'
              ? ui('scenarioCatalogPage.illustration_metier')
              : ui('scenarioCatalogPage.situation_documentee')}
          </p>
          <h2>{scenario.title}</h2>
          <p>
            <ModelText text={scenario.situation} />
          </p>
          <dl>
            <dt>{ui('scenarioCatalogPage.declencheur')}</dt>
            <dd>
              <ModelText text={scenario.trigger} />
            </dd>
            <dt>{ui('scenarioCatalogPage.resultat_recherche')}</dt>
            <dd>
              <ModelText text={scenario.objective} />
            </dd>
          </dl>
          <p>
            {ui('scenarioCatalogPage.flux_de_valeur')}{' '}
            {scenario.value_stream_ids.map((id) => (
              <CatalogLink key={id} stream={id}>
                {catalog.value_streams.find((v) => v.id === id)?.label_fr || id}
              </CatalogLink>
            ))}
          </p>
          {!!scenario.conditions.length && (
            <section className="scenario-conditions">
              <h3>{ui('scenarioCatalogPage.conditions_du_scenario')}</h3>
              <ul>
                {scenario.conditions.map((c) => (
                  <li key={c}>
                    <ModelText text={c} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {paths.length > 1 && (
            <label className="scenario-path-select">
              {paths.length}
              {ui('scenarioCatalogPage.parcours_de_mobilisation')}
              <select
                aria-label={ui('scenarioCatalogPage.parcours_de_mobilisation_2')}
                value={path?.id || ''}
                onChange={(e) => change({ path: e.target.value })}
              >
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {path && (
            <section aria-label={ui('scenarioCatalogPage.parcours_de_mobilisation_2')}>
              <h3>{path.title}</h3>
              <p>
                <ModelText text={path.sequence_note} />
              </p>
              {!!path.conditions.length && (
                <ul>
                  {path.conditions.map((c) => (
                    <li key={c}>
                      <ModelText text={c} />
                    </li>
                  ))}
                </ul>
              )}
              <ol className="mobilization-steps">
                {path.steps.map((step) => (
                  <li key={step.id}>
                    <h4>{step.title}</h4>
                    <p>
                      <ModelText text={step.description} />
                    </p>
                    <ul>
                      {step.contributions.map((c) => (
                        <li key={c.node_id}>
                          <ReferenceLink target={c.node_id}>
                            {model.nodeById.get(c.node_id)?.name || c.node_id}
                          </ReferenceLink>{' '}
                          — <ModelText text={c.role} />
                        </li>
                      ))}
                    </ul>
                    {!!step.context_participants?.length && (
                      <section className="step-context-participants">
                        <h5>{ui('scenarioCatalogPage.participants_de_contexte')}</h5>
                        <ul>
                          {step.context_participants.map((participant) => (
                            <li key={participant.node_id}>
                              <ReferenceLink target={participant.node_id}>
                                {model.nodeById.get(participant.node_id)?.name || participant.node_id}
                              </ReferenceLink>{' '}
                              — <ModelText text={participant.role} />
                              <ul>
                                {participant.conditions.map((condition) => (
                                  <li key={condition}>
                                    <ModelText text={condition} />
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    <p>
                      <strong>{ui('scenarioCatalogPage.resultat')}</strong>
                      <ModelText text={step.outcome} />
                    </p>
                    {!!step.inputs.length && (
                      <section className="step-inputs">
                        <h5>{ui('scenarioCatalogPage.informations_et_conditions_necessaires')}</h5>
                        <ul>
                          {step.inputs.map((v) => (
                            <li key={v}>
                              <ModelText text={v} />
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {path.dependencies
                      .filter((d) => d.to === step.id)
                      .map((d) => (
                        <p className="step-dependency" key={`${d.from}:${d.to}:${d.condition}`}>
                          {ui('scenarioCatalogPage.depend_de')}
                          {path.steps.find((s) => s.id === d.from)?.title} » : <ModelText text={d.condition} />
                        </p>
                      ))}
                  </li>
                ))}
              </ol>
              <p>
                <strong>{ui('scenarioCatalogPage.issue_du_parcours')}</strong>
                <ModelText text={path.outcome} />
              </p>
            </section>
          )}
          <section>
            <h3>{ui('scenarioCatalogPage.ce_que_ce_scenario_permet_de_verifier')}</h3>
            <ul>
              {scenario.validation_points.map((v) => (
                <li key={v}>
                  <ModelText text={v} />
                </li>
              ))}
            </ul>
            <p>{ui('scenarioCatalogPage.ces_contributions_ne_prouvent_ni_une_couverture_exhaustive_ni_une')}</p>
          </section>
        </>
      ) : (
        <>
          <h2>{stream ? stream.label_fr : ui('scenarioCatalogPage.trouver_un_scenario')}</h2>
          <div className="scenario-filters">
            <label>
              {ui('scenarioCatalogPage.rechercher_un_scenario')}
              <input value={route.scenarioQuery || ''} onChange={(e) => change({ scenarioQuery: e.target.value })} />
            </label>
            <label>
              {ui('scenarioCatalogPage.flux_de_valeur_2')}
              <select
                aria-label={ui('scenarioCatalogPage.flux_de_valeur_2')}
                value={route.stream || ''}
                onChange={(e) => change({ stream: e.target.value })}
              >
                <option value="">{ui('scenarioCatalogPage.tous_les_flux')}</option>
                {catalog.value_streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label_fr}
                  </option>
                ))}
              </select>
            </label>
            <p className="scenario-results-count" role="status">
              {ui('scenarioCatalogPage.scenario_count', { count: filtered.length })}
            </p>
            <details
              className="scenario-advanced-filters"
              open={advancedOpen}
              onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
            >
              <summary>
                {ui('scenarioCatalogPage.affiner')}
                {advancedCount ? ui('scenarioCatalogPage.filtre_actif', { count: advancedCount }) : ''}
              </summary>
              <div className="scenario-advanced-grid">
                {(['events', 'objects', 'situations'] as const).map((facet, i) => {
                  const key = (['event', 'object', 'situation'] as const)[i];
                  return (
                    <label key={facet}>
                      {
                        [
                          ui('scenarioCatalogPage.evenement'),
                          ui('scenarioCatalogPage.objet_metier'),
                          ui('scenarioCatalogPage.situation'),
                        ][i]
                      }
                      <select
                        aria-label={
                          [
                            ui('scenarioCatalogPage.evenement'),
                            ui('scenarioCatalogPage.objet_metier'),
                            ui('scenarioCatalogPage.situation'),
                          ][i]
                        }
                        value={route[key] || ''}
                        onChange={(e) => change({ [key]: e.target.value })}
                      >
                        <option value="">{ui('scenarioCatalogPage.tous')}</option>
                        {catalog.facets[facet].map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
                <label>
                  {ui('scenarioCatalogPage.capacite_ou_referentiel')}
                  <select
                    aria-label={ui('scenarioCatalogPage.capacite_ou_referentiel')}
                    value={route.capability || ''}
                    onChange={(e) => change({ capability: e.target.value })}
                  >
                    <option value="">{ui('scenarioCatalogPage.tous')}</option>
                    {model.nodes
                      .filter((n) => n.kind === 'capability' || n.kind === 'reference')
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </details>
            {(activeFilters.length > 0 || route.stream || route.scenarioQuery) && (
              <div
                className="scenario-active-filters"
                role="group"
                aria-label={ui('scenarioCatalogPage.filtres_actifs')}
              >
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    aria-label={ui('scenarioCatalogPage.retirer_le_filtre', { label: filter.label })}
                    onClick={() => change({ [filter.key]: '' })}
                  >
                    {filter.label} : {filter.text} ×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    change({ stream: '', event: '', object: '', situation: '', capability: '', scenarioQuery: '' })
                  }
                >
                  {ui('scenarioCatalogPage.effacer_les_filtres')}
                </button>
              </div>
            )}
          </div>
          {filtered.length ? (
            cards(filtered)
          ) : (
            <p>{ui('scenarioCatalogPage.aucun_scenario_ne_correspond_a_ces_filtres_modifie_les_ou_efface_')}</p>
          )}
          {stream ? (
            <section>
              <h2>{ui('scenarioCatalogPage.comprendre_ce_flux_de_valeur')}</h2>
              <p>{stream.name}</p>
              <p>
                <ModelText text={stream.description} />
              </p>
              <dl>
                <dt>{ui('scenarioCatalogPage.beneficiaire')}</dt>
                <dd>
                  <ModelText text={stream.beneficiary} />
                </dd>
                <dt>{ui('scenarioCatalogPage.valeur_attendue')}</dt>
                <dd>
                  <ModelText text={stream.value} />
                </dd>
                <dt>{ui('scenarioCatalogPage.declencheur')}</dt>
                <dd>
                  <ModelText text={stream.trigger} />
                </dd>
                <dt>{ui('scenarioCatalogPage.frontieres')}</dt>
                <dd>
                  <ModelText text={stream.boundary} />
                </dd>
              </dl>
              <h3>{ui('scenarioCatalogPage.etapes_de_valeur')}</h3>
              <ol>
                {stream.stages.map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong>
                    <p>
                      <ModelText text={s.outcome} />
                    </p>
                    <div className="stage-boundaries">
                      <p>
                        {ui('scenarioCatalogPage.entree')}
                        <ModelText text={s.entry} />
                      </p>
                      <p>
                        {ui('scenarioCatalogPage.sortie')}
                        <ModelText text={s.exit} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <details>
                <summary>{ui('scenarioCatalogPage.positionnement_et_appuis_methodologiques_marche')}</summary>
                <p>
                  <ModelText text={stream.market_position} />
                </p>
                {stream.market_sources.map((s) => {
                  const url = marketSourceUrl(s.url);
                  return (
                    <p key={`${s.vendor}:${s.url}`}>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          {s.vendor}
                        </a>
                      ) : (
                        s.vendor
                      )}{' '}
                      — <ModelText text={s.support} /> <ModelText text={s.limit} />
                    </p>
                  );
                })}
              </details>
            </section>
          ) : (
            <>
              <h2>{ui('scenarioCatalogPage.explorer_par_flux_de_valeur')}</h2>
              <p>{ui('scenarioCatalogPage.un_scenario_peut_contribuer_a_plusieurs_flux_chaque_resultat_de_r')}</p>
              <ul className="value-stream-cards">
                {catalog.value_streams.map((s) => (
                  <li key={s.id}>
                    <CatalogLink stream={s.id}>{s.label_fr}</CatalogLink>
                    <p>
                      <ModelText text={s.value} />
                    </p>
                    <small>
                      {catalog.scenarios.filter((v) => v.value_stream_ids.includes(s.id)).length}
                      {ui('scenarioCatalogPage.scenarios_associes')}
                    </small>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </article>
  );
}
