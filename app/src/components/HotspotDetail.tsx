import { Maximize2, Minimize2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { documentsForHotspot, documentUrl } from '../documentCatalog';
import { RESOLUTION_STAGES, resolutionFor } from '../hotspotResolution';
import { mapRouteForNode } from '../mapNavigation';
import type { RouteState } from '../navigation';
import type { Hotspot, PublishedModel } from '../types';
import { ModelText } from './ModelLinks';

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
const EVIDENCE = { documented: 'Documentée', hypothesis: 'Hypothèse', to_investigate: 'À investiguer' };
const size = (value: string) => (value === 'unassessed' ? 'Non évaluée' : value);

export function HotspotDetail({
  hotspot,
  model,
  grouped,
  expanded,
  canEdit,
  pending,
  onChange,
  onToggleFullscreen,
  onEdit,
}: {
  hotspot: Hotspot;
  model: PublishedModel;
  grouped: boolean;
  expanded: boolean;
  canEdit: boolean;
  pending: boolean;
  onChange: (changes: Partial<RouteState>) => void;
  onToggleFullscreen: () => void;
  onEdit: (event: MouseEvent<HTMLElement>, mode: 'location' | 'resolution' | 'complexity') => void;
}) {
  const resolution = resolutionFor(hotspot);
  const documents = documentsForHotspot(model, hotspot.document_ids || []);
  const selected = hotspot.resolution_options.find((option) => option.id === hotspot.selected_option_id);
  const credibleIds = new Set(resolution.credible_option_ids);
  const hasResolution = Boolean(hotspot.resolution);

  return (
    <article className="hotspot-detail" aria-labelledby="hotspot-detail-title">
      <div className="hotspot-detail-toolbar">
        <button type="button" onClick={() => onChange({ hotspot: '' })}>
          ← {grouped ? 'Retour au groupe' : 'Tous les points chauds'}
        </button>
        <button type="button" className="map-fullscreen-button" aria-pressed={expanded} onClick={onToggleFullscreen}>
          {expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
          {expanded ? 'Réduire la fiche' : 'Étendre la fiche'}
        </button>
      </div>
      <header className="hotspot-story-header">
        <p className="hotspot-kicker">
          {model.raw.workshop ? 'Vue de travail · ' : ''}Publication {model.version} ·{' '}
          {hotspot.kind === 'integration' ? 'Intégration' : 'Périmètre'} ·{' '}
          {hasResolution && hotspot.status === 'resolved' ? 'Résolu en cadrage' : STATUS[hotspot.status]}
          {pending ? ' · Modifications non enregistrées' : ''}
        </p>
        <h3 id="hotspot-detail-title">
          <ModelText text={hotspot.title} />
        </h3>
      </header>

      <section className="hotspot-resolution-summary hotspot-story-overview" aria-labelledby="hotspot-progress-title">
        <div className="hotspot-story-heading">
          <h4 id="hotspot-progress-title">Où en sommes-nous ?</h4>
          {canEdit && (
            <button type="button" onClick={(event) => onEdit(event, 'resolution')}>
              Compléter l’avancement
            </button>
          )}
        </div>
        <p className="hotspot-progress-stage">
          {hasResolution ? RESOLUTION_STAGES[resolution.stage] : 'Avancement du cadrage non renseigné'}
        </p>
        {resolution.summary && (
          <p>
            <ModelText text={resolution.summary} />
          </p>
        )}
        {hotspot.status === 'validated' && !hotspot.selected_option_id && (
          <p>Problème et périmètre validés ; aucune option de résolution retenue.</p>
        )}
        {credibleIds.size > 0 && (
          <p>
            <strong>Solutions crédibles : </strong>
            <ModelText
              text={hotspot.resolution_options
                .filter((option) => credibleIds.has(option.id))
                .map((option) => option.title)
                .join(' · ')}
            />
          </p>
        )}
        {resolution.blocked_reason && (
          <p className="hotspot-story-blocked">
            <strong>Ce qui bloque : </strong>
            <ModelText text={resolution.blocked_reason} />
          </p>
        )}
        <p>
          <strong>Prochain pas : </strong>
          {resolution.next_step ? <ModelText text={resolution.next_step} /> : 'Prochaine étape non documentée.'}
        </p>
        <p className="hotspot-story-caption">
          Une solution crédible résout le cadrage. Le choix définitif, la mise en œuvre et le résultat sur le terrain
          restent distincts.
        </p>
        {resolution.assessed_on && (
          <p className="hotspot-story-caption">
            Évaluation du {resolution.assessed_on}
            {resolution.assessment_source && (
              <>
                {' '}
                · <ModelText text={resolution.assessment_source} />
              </>
            )}
          </p>
        )}
      </section>

      <section className="hotspot-story-section" aria-labelledby="hotspot-problem-title">
        <div className="hotspot-story-heading">
          <h4 id="hotspot-problem-title">
            <span className="hotspot-story-step" aria-hidden="true">
              1
            </span>
            Le problème à traiter
          </h4>
          {canEdit && (
            <button type="button" onClick={(event) => onEdit(event, 'location')}>
              Préciser le périmètre
            </button>
          )}
        </div>
        <p className="hotspot-story-lead">
          <ModelText text={hotspot.problem} />
        </p>
        <div className="hotspot-anchors" role="group" aria-label="Périmètres concernés">
          {hotspot.location.node_ids.map((id) => {
            const node = model.nodeById.get(id);
            return (
              node && (
                <button type="button" key={id} onClick={() => onChange(mapRouteForNode(model, id))}>
                  {node.name}
                </button>
              )
            );
          })}
        </div>
        <h5>Les cas concrets</h5>
        {hotspot.examples.length > 0 ? (
          <ul className="hotspot-story-examples">
            {hotspot.examples.map((example) => (
              <li key={example}>
                <ModelText text={example} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="hotspot-story-empty">Aucun cas concret documenté.</p>
        )}
      </section>

      <section className="hotspot-story-section" aria-labelledby="hotspot-difficulty-title">
        <div className="hotspot-story-heading">
          <h4 id="hotspot-difficulty-title">
            <span className="hotspot-story-step" aria-hidden="true">
              2
            </span>
            Ce qui rend le sujet difficile
          </h4>
          {canEdit && (
            <button type="button" onClick={(event) => onEdit(event, 'complexity')}>
              Compléter l’évaluation
            </button>
          )}
        </div>
        {hotspot.complexity.rationale ? (
          <p>
            <ModelText text={hotspot.complexity.rationale} />
          </p>
        ) : (
          <p className="hotspot-story-empty">Difficultés encore à documenter.</p>
        )}
        <dl className="hotspot-facts">
          <div>
            <dt>Criticité</dt>
            <dd>{size(hotspot.severity)}</dd>
          </div>
          <div>
            <dt>Difficulté politique</dt>
            <dd>{size(hotspot.complexity.political)}</dd>
          </div>
          <div>
            <dt>Difficulté d’implémentation</dt>
            <dd>{size(hotspot.complexity.implementation)}</dd>
          </div>
        </dl>
        {hotspot.market_view ? (
          <details className="hotspot-story-support">
            <summary>Ce que les références marché apportent à l’analyse</summary>
            <div className="hotspot-market">
              <p>
                <strong>Pratiques documentées : </strong>
                <ModelText text={hotspot.market_view.finding} />
              </p>
              <p>
                <strong>Avis pour FLOW : </strong>
                <ModelText text={hotspot.market_view.flow_assessment} />
              </p>
              <p>
                <strong>Limites : </strong>
                <ModelText text={hotspot.market_view.limits} />
              </p>
              <ul>
                {hotspot.market_view.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.publisher} — {source.title}
                    </a>
                    {' : '}
                    <ModelText text={source.relevance} />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ) : (
          <p className="hotspot-story-empty">Comparaison marché non documentée pour ce point chaud.</p>
        )}
      </section>

      <section className="hotspot-story-section" aria-labelledby="hotspot-options-title">
        <h4 id="hotspot-options-title">
          <span className="hotspot-story-step" aria-hidden="true">
            3
          </span>
          Les chemins possibles
        </h4>
        {hotspot.resolution_options.length > 0 ? (
          <div className="hotspot-options">
            {hotspot.resolution_options.map((option) => (
              <section key={option.id} className="hotspot-story-option" data-selected={option.id === selected?.id}>
                <div className="hotspot-story-heading">
                  <h5>
                    <ModelText text={option.title} />
                  </h5>
                  <div className="hotspot-option-labels">
                    {option.id === selected?.id && <span className="hotspot-option-tag">Option retenue</span>}
                    {credibleIds.has(option.id) && <span className="hotspot-option-tag">Solution crédible</span>}
                    <span className="hotspot-story-caption">{EVIDENCE[option.evidence_state]}</span>
                  </div>
                </div>
                <p>
                  <ModelText text={option.principle} />
                </p>
                {option.effect && (
                  <p>
                    <strong>Effet attendu : </strong>
                    <ModelText text={option.effect} />
                  </p>
                )}
                {!!option.conditions?.length && (
                  <div>
                    <h6>Conditions à réunir</h6>
                    <ul>
                      {option.conditions.map((condition) => (
                        <li key={condition}>
                          <ModelText text={condition} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!option.tradeoffs?.length && (
                  <div>
                    <h6>Compromis</h6>
                    <ul>
                      {option.tradeoffs.map((tradeoff) => (
                        <li key={tradeoff}>
                          <ModelText text={tradeoff} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="hotspot-story-caption">
                  Difficulté d’implémentation : {size(option.implementation_complexity)}
                </p>
              </section>
            ))}
          </div>
        ) : (
          <p className="hotspot-story-empty">Aucune option documentée à ce stade.</p>
        )}
      </section>

      <section className="hotspot-story-section" aria-labelledby="hotspot-choice-title">
        <h4 id="hotspot-choice-title">
          <span className="hotspot-story-step" aria-hidden="true">
            4
          </span>
          Le choix et la suite
        </h4>
        {selected ? (
          <p>
            <strong>Option retenue : </strong>
            <ModelText text={selected.title} />
          </p>
        ) : (
          <p className="hotspot-story-empty">Aucune option retenue n’est documentée.</p>
        )}
        {hotspot.resolution_note && (
          <p>
            <strong>Pourquoi ce choix : </strong>
            <ModelText text={hotspot.resolution_note} />
          </p>
        )}
        {resolution.credibility_note && (
          <p>
            <strong>Pourquoi ces pistes sont crédibles : </strong>
            <ModelText text={resolution.credibility_note} />
          </p>
        )}
        <p>
          <strong>Niveau d’arbitrage : </strong>
          {LEVEL[hotspot.arbitration_level] || hotspot.arbitration_level}
        </p>
        {hotspot.arbitration_note && (
          <p>
            <ModelText text={hotspot.arbitration_note} />
          </p>
        )}
        <div className="hotspot-story-next">
          <h5>Le prochain pas</h5>
          <p>{resolution.next_step ? <ModelText text={resolution.next_step} /> : 'Prochaine étape non documentée.'}</p>
          {resolution.blocked_reason && (
            <p>
              <strong>Blocage à lever : </strong>
              <ModelText text={resolution.blocked_reason} />
            </p>
          )}
        </div>
      </section>

      <section className="hotspot-story-section" aria-labelledby="hotspot-evidence-title">
        <h4 id="hotspot-evidence-title">Les documents et les sources</h4>
        {documents.length > 0 && (
          <ul className="hotspot-documents">
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
        )}
        {hotspot.origin.evidence_limit && (
          <p>
            <strong>Limites des preuves : </strong>
            <ModelText text={hotspot.origin.evidence_limit} />
          </p>
        )}
        <details className="hotspot-provenance">
          <summary>Sources et réserves détaillées</summary>
          <p>
            {hotspot.origin.repository} · {hotspot.origin.source_id}
          </p>
          <code>{hotspot.origin.path}</code>
          <p>
            <strong>Références : </strong>
            {hotspot.source_refs.join(' · ') || 'Non renseignées'}
          </p>
          <p>{hotspot.review.note}</p>
        </details>
      </section>
    </article>
  );
}
