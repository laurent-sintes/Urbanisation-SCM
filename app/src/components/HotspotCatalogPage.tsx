import { useState } from 'react';
import type { RouteState } from '../navigation';
import type { Hotspot, PublishedModel } from '../types';
import './hotspots.css';

const STATUS: Record<Hotspot['status'], string> = {
  discovered: 'Découvert',
  shared: 'Partagé',
  validated: 'Validé',
  resolved: 'Résolu',
};
const LEVEL: Record<string, string> = {
  business_direction: 'Direction métier',
  flow_internal: 'Interne programme FLOW',
  flow_steering: 'Comité de pilotage FLOW',
  to_confirm: 'À confirmer',
};
const SIZE = (value: string) => (value === 'unassessed' ? 'Non évaluée' : value);

export function HotspotCatalogPage({
  model,
  route,
  onChange,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (changes: Partial<RouteState>) => void;
}) {
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const chosen = hotspots.find((item) => item.id === route.hotspot);
  const filtered = hotspots.filter(
    (item) =>
      (status === 'all' || item.status === status) &&
      (severity === 'all' || item.severity === severity) &&
      `${item.id} ${item.title} ${item.problem}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')),
  );
  const anchorButton = (id: string) => {
    const node = model.nodeById.get(id);
    return (
      node && (
        <button
          type="button"
          key={id}
          onClick={() => onChange({ view: 'map', node: id, scope: id, mapDepth: 0, mapFocus: '' })}
        >
          {node.name}
        </button>
      )
    );
  };
  return (
    <section className="hotspot-page" aria-label="Points chauds de la publication">
      <header>
        <h2>Points chauds</h2>
        <p>
          {hotspots.length} sujet{hotspots.length > 1 ? 's' : ''} dans la publication {model.version}.
        </p>
        <div className="hotspot-scale" role="group" aria-label="Échelle de criticité, de S à XL">
          {(['S', 'M', 'L', 'XL'] as const).map((level) => (
            <span key={level}>
              <i className={`hotspot-scale-color severity-${level}`} aria-hidden="true" />
              {level}
            </span>
          ))}
        </div>
      </header>
      {chosen ? (
        <article className="hotspot-detail">
          <button type="button" onClick={() => onChange({ hotspot: '' })}>
            ← Tous les points chauds
          </button>
          <p className="hotspot-kicker">
            {chosen.kind === 'integration' ? 'Intégration' : 'Périmètre'} · {STATUS[chosen.status]}
          </p>
          <h3>{chosen.title}</h3>
          <p>{chosen.problem}</p>
          <div className="hotspot-anchors" role="group" aria-label="Localisation">
            {chosen.location.node_ids.map(anchorButton)}
          </div>
          <dl className="hotspot-facts">
            <div>
              <dt>Gravité</dt>
              <dd>{SIZE(chosen.severity)}</dd>
            </div>
            <div>
              <dt>Difficulté politique</dt>
              <dd>{SIZE(chosen.complexity.political)}</dd>
            </div>
            <div>
              <dt>Difficulté d’implémentation</dt>
              <dd>{SIZE(chosen.complexity.implementation)}</dd>
            </div>
            <div>
              <dt>Arbitrage</dt>
              <dd>{LEVEL[chosen.arbitration_level] || chosen.arbitration_level}</dd>
            </div>
          </dl>
          <p>{chosen.complexity.rationale}</p>
          {chosen.arbitration_note && <p>{chosen.arbitration_note}</p>}
          <h4>Cas d’usage</h4>
          <ul>
            {chosen.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          <h4>Options à instruire</h4>
          <div className="hotspot-options">
            {chosen.resolution_options.map((option) => (
              <section key={option.id}>
                <h5>{option.title}</h5>
                <p>{option.principle}</p>
                {option.effect && (
                  <p>
                    <strong>Effet attendu :</strong> {option.effect}
                  </p>
                )}
                {!!option.conditions?.length && (
                  <p>
                    <strong>À confirmer :</strong> {option.conditions.join(' · ')}
                  </p>
                )}
                {!!option.tradeoffs?.length && (
                  <p>
                    <strong>Compromis :</strong> {option.tradeoffs.join(' · ')}
                  </p>
                )}
                <small>
                  Implémentation : {SIZE(option.implementation_complexity)} ·{' '}
                  {option.evidence_state === 'hypothesis' ? 'Hypothèse' : option.evidence_state}
                </small>
              </section>
            ))}
          </div>
          <h4>Source et réserves</h4>
          <p>
            {chosen.origin.repository} · {chosen.origin.source_id}
          </p>
          <code>{chosen.origin.path}</code>
          <p>{chosen.origin.evidence_limit}</p>
          <small>{chosen.review.note}</small>
        </article>
      ) : (
        <>
          <div className="hotspot-filters">
            <label>
              Rechercher <input value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label>
              Statut{' '}
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">Tous</option>
                {Object.entries(STATUS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Gravité{' '}
              <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
                <option value="all">Toutes</option>
                {['S', 'M', 'L', 'XL', 'unassessed'].map((value) => (
                  <option key={value} value={value}>
                    {SIZE(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {hotspots.length}.
          </p>
          <div className="hotspot-list">
            {filtered.map((item) => (
              <button type="button" key={item.id} onClick={() => onChange({ hotspot: item.id })}>
                <span className={`hotspot-dot severity-${item.severity}`} aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.kind === 'integration' ? 'Intégration' : 'Périmètre'} · {STATUS[item.status]} · Gravité{' '}
                    {SIZE(item.severity)}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
