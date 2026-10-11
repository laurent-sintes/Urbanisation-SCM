import { useState } from 'react';
import { documentsForHotspot, documentUrl } from '../documentCatalog';
import type { RouteState } from '../navigation';
import { publicText } from '../publicText';
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
  const workshopCount = hotspots.filter((item) => item.workshop).length;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const groupIds = new Set((route.hotspotGroup || '').split(',').filter(Boolean));
  const groupHotspots = groupIds.size ? hotspots.filter((item) => groupIds.has(item.id)) : hotspots;
  const chosen = hotspots.find((item) => item.id === route.hotspot);
  const documents = chosen ? documentsForHotspot(model, chosen.document_ids || []) : [];
  const filtered = groupHotspots.filter(
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
          {hotspots.length} sujet{hotspots.length > 1 ? 's' : ''} affiché{hotspots.length > 1 ? 's' : ''} pour{' '}
          {model.version}
          {workshopCount ? `, dont ${workshopCount} en atelier` : ''}.
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
      {groupIds.size > 0 && (
        <div className="hotspot-group-filter" role="status">
          <strong>{groupHotspots.length} points chauds de ce groupe</strong>
          <button type="button" onClick={() => onChange({ hotspot: '', hotspotGroup: '' })}>
            Voir tous les points chauds
          </button>
        </div>
      )}
      {chosen ? (
        <article className="hotspot-detail">
          <button type="button" onClick={() => onChange({ hotspot: '' })}>
            ← {groupIds.size ? 'Retour au groupe' : 'Tous les points chauds'}
          </button>
          <p className="hotspot-kicker">
            {chosen.workshop ? 'Atelier · ' : ''}
            {chosen.kind === 'integration' ? 'Intégration' : 'Périmètre'} · {STATUS[chosen.status]}
          </p>
          <h3>{chosen.title}</h3>
          {chosen.status === 'validated' && !chosen.selected_option_id && (
            <p className="hotspot-status-note">Problème et périmètre validés ; aucune option de résolution retenue.</p>
          )}
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
          <p>{publicText(chosen.complexity.rationale)}</p>
          {chosen.arbitration_note && <p>{publicText(chosen.arbitration_note)}</p>}
          <h4>Lecture du marché</h4>
          {chosen.market_view ? (
            <section className="hotspot-market">
              <p>
                <strong>Pratiques documentées :</strong> {chosen.market_view.finding}
              </p>
              <p>
                <strong>Avis pour FLOW :</strong> {chosen.market_view.flow_assessment}
              </p>
              <p>
                <strong>Limites :</strong> {chosen.market_view.limits}
              </p>
              <ul>
                {chosen.market_view.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.publisher} — {source.title}
                    </a>
                    {' : '}
                    {source.relevance}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p>Comparaison marché non documentée pour ce point chaud.</p>
          )}
          {documents.length > 0 && (
            <section className="hotspot-documents">
              <h4>Documents</h4>
              <ul>
                {documents.map((document) => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => onChange({ view: 'documents', document: document.id, hotspot: '' })}
                    >
                      {document.title}
                    </button>
                    {' · '}
                    <a href={documentUrl(model, document)} download={`flow-atlas-${document.id}.pdf`}>
                      Télécharger le PDF
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
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
          <details className="hotspot-provenance">
            <summary>Sources et réserves détaillées</summary>
            <p>
              {chosen.origin.repository} · {chosen.origin.source_id}
            </p>
            <code>{chosen.origin.path}</code>
            <p>{chosen.origin.evidence_limit}</p>
            <small>{chosen.review.note}</small>
          </details>
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
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {groupHotspots.length}.
          </p>
          <div className="hotspot-list">
            {filtered.map((item) => (
              <button type="button" key={item.id} onClick={() => onChange({ hotspot: item.id })}>
                <span className={`hotspot-dot severity-${item.severity}`} aria-hidden="true" />
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.workshop ? 'Atelier · ' : ''}
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
