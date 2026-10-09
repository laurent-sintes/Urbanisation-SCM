import { useEffect, useState } from 'react';
import type { RouteState } from '../navigation';
import { catalogOf, filterScenarios, scenarioCapabilities } from '../scenarioCatalog';
import type { PublishedModel } from '../types';
import { CatalogLink, MethodLink, ModelText, ReferenceLink } from './ModelLinks';
import './scenario-catalog.css';

export function ScenarioCatalogPage({
  model,
  route,
  onChange,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (v: Partial<RouteState>) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(min-width: 701px)').matches,
  );
  useEffect(() => {
    const media = matchMedia('(min-width: 701px)');
    const update = () => setAdvancedOpen(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const catalog = catalogOf(model);
  if (!catalog)
    return (
      <article className="scenario-catalog">
        <h2>Catalogue absent de cette publication</h2>
        <p>Les illustrations historiques restent accessibles dans les fiches de cette version.</p>
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
  const cards = (items: typeof catalog.scenarios) => (
    <ul className="scenario-cards">
      {items.map((s) => (
        <li key={s.id}>
          <CatalogLink scenario={s.id}>{s.title}</CatalogLink>
          <p>
            <ModelText text={s.objective} />
          </p>
          <small>
            {s.nature === 'illustrative' ? 'Illustration métier' : 'Situation documentée'} ·{' '}
            {scenarioCapabilities(catalog, s.id).length} éléments mobilisés
          </small>
        </li>
      ))}
    </ul>
  );
  if ((route.scenario && !scenario) || (route.stream && !stream) || (route.path && !path))
    return (
      <article className="scenario-catalog">
        <h2>Élément absent de cette publication</h2>
        <CatalogLink>Revenir au catalogue</CatalogLink>
      </article>
    );
  return (
    <article className="scenario-catalog">
      <nav aria-label="Navigation des scénarios">
        <CatalogLink>Catalogue des scénarios</CatalogLink> ·{' '}
        <MethodLink term="MOD027">Comprendre scénario et parcours</MethodLink>
        {route.node && model.nodeById.has(route.node) && (
          <>
            {' '}
            ·{' '}
            <ReferenceLink target={route.node} anchor="examples">
              Revenir à la fiche
            </ReferenceLink>
          </>
        )}
      </nav>
      {scenario ? (
        <>
          <p className="section-kicker">
            {scenario.nature === 'illustrative' ? 'Illustration métier' : 'Situation documentée'}
          </p>
          <h2>{scenario.title}</h2>
          <p>
            <ModelText text={scenario.situation} />
          </p>
          <dl>
            <dt>Déclencheur</dt>
            <dd>
              <ModelText text={scenario.trigger} />
            </dd>
            <dt>Résultat recherché</dt>
            <dd>
              <ModelText text={scenario.objective} />
            </dd>
          </dl>
          <p>
            Flux de valeur :{' '}
            {scenario.value_stream_ids.map((id) => (
              <CatalogLink key={id} stream={id}>
                {catalog.value_streams.find((v) => v.id === id)?.label_fr || id}
              </CatalogLink>
            ))}
          </p>
          {!!scenario.conditions.length && (
            <section className="scenario-conditions">
              <h3>Conditions du scénario</h3>
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
              {paths.length} parcours de mobilisation
              <select
                aria-label="Parcours de mobilisation"
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
            <section aria-label="Parcours de mobilisation">
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
                    <p>
                      <strong>Résultat : </strong>
                      <ModelText text={step.outcome} />
                    </p>
                    {!!step.inputs.length && (
                      <section className="step-inputs">
                        <h5>Informations et conditions nécessaires</h5>
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
                          Dépend de « {path.steps.find((s) => s.id === d.from)?.title} » :{' '}
                          <ModelText text={d.condition} />
                        </p>
                      ))}
                  </li>
                ))}
              </ol>
              <p>
                <strong>Issue du parcours : </strong>
                <ModelText text={path.outcome} />
              </p>
            </section>
          )}
          <section>
            <h3>Ce que ce scénario permet de vérifier</h3>
            <ul>
              {scenario.validation_points.map((v) => (
                <li key={v}>
                  <ModelText text={v} />
                </li>
              ))}
            </ul>
            <p>Ces contributions ne prouvent ni une couverture exhaustive ni une réalisation installée.</p>
          </section>
        </>
      ) : (
        <>
          <h2>{stream ? stream.label_fr : 'Trouver un scénario'}</h2>
          <div className="scenario-filters">
            <label>
              Rechercher un scénario
              <input value={route.scenarioQuery || ''} onChange={(e) => change({ scenarioQuery: e.target.value })} />
            </label>
            <label>
              Flux de valeur
              <select
                aria-label="Flux de valeur"
                value={route.stream || ''}
                onChange={(e) => change({ stream: e.target.value })}
              >
                <option value="">Tous les flux</option>
                {catalog.value_streams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label_fr}
                  </option>
                ))}
              </select>
            </label>
            <p className="scenario-results-count" role="status">
              {filtered.length} scénario{filtered.length > 1 ? 's' : ''}
            </p>
            <details
              className="scenario-advanced-filters"
              open={advancedOpen}
              onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
            >
              <summary>
                Plus de filtres{advancedCount ? ` · ${advancedCount} actif${advancedCount > 1 ? 's' : ''}` : ''}
              </summary>
              <div className="scenario-advanced-grid">
                {(['events', 'objects', 'situations'] as const).map((facet, i) => {
                  const key = (['event', 'object', 'situation'] as const)[i];
                  return (
                    <label key={facet}>
                      {['Événement', 'Objet métier', 'Situation'][i]}
                      <select
                        aria-label={['Événement', 'Objet métier', 'Situation'][i]}
                        value={route[key] || ''}
                        onChange={(e) => change({ [key]: e.target.value })}
                      >
                        <option value="">Tous</option>
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
                  Capacité ou référentiel
                  <select
                    aria-label="Capacité ou référentiel"
                    value={route.capability || ''}
                    onChange={(e) => change({ capability: e.target.value })}
                  >
                    <option value="">Tous</option>
                    {model.nodes
                      .filter((n) => n.kind === 'capability' || n.kind === 'reference')
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    change({ stream: '', event: '', object: '', situation: '', capability: '', scenarioQuery: '' })
                  }
                >
                  Effacer les filtres
                </button>
              </div>
            </details>
          </div>
          {filtered.length ? (
            cards(filtered)
          ) : (
            <p>Aucun scénario ne correspond à ces filtres. Modifie-les ou efface-les pour élargir la recherche.</p>
          )}
          {stream ? (
            <section>
              <h2>Comprendre ce flux de valeur</h2>
              <p>{stream.name}</p>
              <p>
                <ModelText text={stream.description} />
              </p>
              <dl>
                <dt>Bénéficiaire</dt>
                <dd>
                  <ModelText text={stream.beneficiary} />
                </dd>
                <dt>Valeur attendue</dt>
                <dd>
                  <ModelText text={stream.value} />
                </dd>
                <dt>Déclencheur</dt>
                <dd>
                  <ModelText text={stream.trigger} />
                </dd>
                <dt>Frontières</dt>
                <dd>
                  <ModelText text={stream.boundary} />
                </dd>
              </dl>
              <h3>Étapes de valeur</h3>
              <ol>
                {stream.stages.map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong>
                    <p>
                      <ModelText text={s.outcome} />
                    </p>
                    <div className="stage-boundaries">
                      <p>
                        Entrée : <ModelText text={s.entry} />
                      </p>
                      <p>
                        Sortie : <ModelText text={s.exit} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <details>
                <summary>Positionnement et appuis méthodologiques / marché</summary>
                <p>
                  <ModelText text={stream.market_position} />
                </p>
                {stream.market_sources.map((s) => (
                  <p key={`${s.vendor}:${s.url}`}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.vendor}
                    </a>{' '}
                    — <ModelText text={s.support} /> <ModelText text={s.limit} />
                  </p>
                ))}
              </details>
            </section>
          ) : (
            <>
              <h2>Explorer par flux de valeur</h2>
              <p>Un scénario peut contribuer à plusieurs flux. Chaque résultat de recherche reste unique.</p>
              <ul className="value-stream-cards">
                {catalog.value_streams.map((s) => (
                  <li key={s.id}>
                    <CatalogLink stream={s.id}>{s.label_fr}</CatalogLink>
                    <p>
                      <ModelText text={s.value} />
                    </p>
                    <small>
                      {catalog.scenarios.filter((v) => v.value_stream_ids.includes(s.id)).length} scénarios associés
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
