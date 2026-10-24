import { BookOpen, CircleHelp, Download, FileText, Lightbulb, Maximize2, Minimize2, Scale } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';
import { contextName } from '../applicationCatalog';
import { documentDownloadName, documentFormat, documentsForHotspot, documentUrl } from '../documentCatalog';
import { framingLabel } from '../hotspotFraming';
import { RESOLUTION_STAGES, resolutionFor } from '../hotspotResolution';
import { mapRouteForNode } from '../mapNavigation';
import type { RouteState } from '../navigation';
import type { Hotspot, PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { ModelText } from './ModelLinks';

const STATUS: Record<Hotspot['status'], string> = {
  discovered: ui('hotspots.status.discovered'),
  shared: ui('hotspots.status.shared'),
  validated: ui('hotspots.status.validated'),
  resolved: ui('hotspots.status.resolved'),
};
const LEVEL: Record<string, string> = {
  business_direction: ui('hotspotDetail.direction_metier'),
  flow_internal: ui('hotspotDetail.interne_programme_flow'),
  flow_steering: ui('hotspotDetail.comite_de_pilotage_flow'),
  to_confirm: ui('hotspotDetail.a_confirmer'),
};
const EVIDENCE = {
  documented: ui('hotspotDetail.documentee'),
  hypothesis: ui('hotspotDetail.hypothese'),
  to_investigate: ui('hotspotDetail.a_investiguer'),
};
const size = (value: string) => (value === 'unassessed' ? ui('hotspotDetail.non_evaluee') : value);

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
  const recommended = hotspot.resolution_options.find((option) => option.id === resolution.recommended_option_id);
  const credibleIds = new Set(resolution.credible_option_ids);
  const optionById = new Map(hotspot.resolution_options.map((option) => [option.id, option]));
  const optionGroups = hotspot.problems?.map((problem) => ({
    id: problem.id,
    title: problem.title,
    question: problem.question,
    analysisSummary: problem.analysis_summary,
    documentIds: problem.document_ids || [],
    options: problem.option_ids.flatMap((id) => {
      const option = optionById.get(id);
      return option ? [option] : [];
    }),
  })) || [
    {
      id: 'legacy',
      title: '',
      question: '',
      analysisSummary: '',
      documentIds: [],
      options: hotspot.resolution_options,
    },
  ];
  const questions =
    hotspot.problems?.map((problem) => ({
      id: problem.id,
      title: problem.title,
      question: problem.question,
      optionCount: problem.option_ids.length,
    })) ||
    hotspot.gap_analysis?.map((gap) => ({
      id: gap.id,
      title: gap.title,
      question: gap.convergence_question,
      optionCount: gap.resolution_option_ids.length,
    })) ||
    [];
  const hasResolution = Boolean(hotspot.resolution);
  const signalSummary = hotspot.problem.match(/^.*?[.!?](?=\s|$)/s)?.[0] || hotspot.problem;
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    // Leave room for the pinned title when a body control receives keyboard focus.
    const observer = new ResizeObserver(() => {
      element.parentElement?.style.setProperty('--hotspot-header-height', `${element.offsetHeight}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const key = `${model.version}:${hotspot.id}`;
    if (element.dataset.scrollKey === key) return;
    element.dataset.scrollKey = key;
    element.closest<HTMLElement>('.workspace-content')?.scrollTo(0, 0);
    element.closest<HTMLElement>('.hotspot-page')?.scrollTo(0, 0);
  }, [hotspot.id, model.version]);

  return (
    <article className="hotspot-detail" aria-labelledby="hotspot-detail-title">
      <header className="hotspot-detail-header" ref={header}>
        <div className="hotspot-detail-toolbar">
          <button type="button" onClick={() => onChange({ hotspot: '' })}>
            ← {grouped ? ui('hotspotDetail.retour_au_groupe') : ui('hotspotDetail.tous_les_points_chauds')}
          </button>
          <button
            type="button"
            className="map-fullscreen-button"
            aria-label={expanded ? ui('hotspotDetail.reduire_la_fiche') : ui('hotspotDetail.etendre_la_fiche')}
            aria-pressed={expanded}
            onClick={onToggleFullscreen}
          >
            {expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
            <span className="hotspot-fullscreen-label">
              {expanded ? ui('hotspotDetail.reduire_la_fiche') : ui('hotspotDetail.etendre_la_fiche')}
            </span>
          </button>
        </div>
        <h3 id="hotspot-detail-title">
          <ModelText text={hotspot.title} />
        </h3>
      </header>
      <div className="hotspot-detail-body">
        <div className="hotspot-story-context">
          {hotspot.consolidated_into && (
            <p className="hotspot-story-caption">
              {ui('hotspotDetail.sujet_repris_dans_une_fiche_commune')}{' '}
              <button type="button" onClick={() => onChange({ hotspot: hotspot.consolidated_into })}>
                {ui('hotspotDetail.ouvrir')}
                {hotspot.consolidated_into}
              </button>{' '}
              {ui('hotspotDetail.cette_fiche_conserve_son_identite_et_ses_preuves_d_origine')}
            </p>
          )}
          <p className="hotspot-kicker">
            {model.raw.workshop ? ui('hotspotDetail.vue_de_travail') : ''}
            {ui('hotspotDetail.publication')}
            {model.version} ·{' '}
            {hotspot.kind === 'integration' ? ui('hotspotDetail.integration') : ui('hotspotDetail.perimetre')} ·{' '}
            {hasResolution && hotspot.status === 'resolved'
              ? ui('hotspotDetail.resolu_en_cadrage')
              : STATUS[hotspot.status]}
            {pending ? ui('hotspotDetail.modifications_non_enregistrees') : ''}
          </p>
        </div>

        <section className="hotspot-story-overview" aria-labelledby="hotspot-signal-title">
          <h4 id="hotspot-signal-title">{ui('hotspotDetail.le_signal_initial')}</h4>
          <p className="hotspot-story-lead">
            <ModelText text={signalSummary} />
          </p>
          <div className="hotspot-criticality" role="group" aria-labelledby="hotspot-criticality-title">
            <strong id="hotspot-criticality-title">
              {ui('hotspotDetail.criticite')}
              {size(hotspot.severity)}
            </strong>
            <span>
              {ui('hotspotDetail.complexite_d_arbitrage')}
              {size(hotspot.complexity.arbitration)}
            </span>
            <span>
              {ui('hotspotDetail.complexite_d_implementation')}
              {size(hotspot.complexity.implementation)}
            </span>
            {canEdit && (
              <button type="button" onClick={(event) => onEdit(event, 'complexity')}>
                {ui('hotspotDetail.completer_l_evaluation')}
              </button>
            )}
          </div>
          {questions.length > 0 && (
            <div className="hotspot-question-index">
              <h5>
                {questions.length === 1
                  ? ui('hotspotDetail.la_question_a_traiter')
                  : ui('hotspotDetail.questions_a_traiter', { length: questions.length })}
              </h5>
              <div className="hotspot-question-index-list">
                {questions.map((item, index) => (
                  <div key={item.id} className="hotspot-question-index-item">
                    <span className="hotspot-question-number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>
                      <strong>
                        <ModelText text={item.question} />
                      </strong>
                      <small>
                        {item.optionCount > 0
                          ? `${item.optionCount} ${item.optionCount > 1 ? ui('hotspotDetail.options_documentees') : ui('hotspotDetail.option_documentee')}`
                          : ui('hotspotDetail.aucune_option_documentee')}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="hotspot-progress-stage">
            <Scale size={16} aria-hidden="true" />
            {hasResolution
              ? RESOLUTION_STAGES[resolution.stage]
              : ui('hotspotDetail.avancement_du_cadrage_non_renseigne')}
          </p>
          {hotspot.visible === false && (
            <p className="hotspot-visibility-label">
              {ui('hotspotDetail.non_visible_dans_la_carte_et_les_filtres_le_sujet_reste_conserve_')}
            </p>
          )}
        </section>

        <section className="hotspot-story-section" aria-labelledby="hotspot-options-title">
          <h4 id="hotspot-options-title">
            <CircleHelp size={20} aria-hidden="true" />
            {ui('hotspotDetail.problemes_et_options')}
          </h4>
          {optionGroups.map((group, index) => (
            <section key={group.id} id={`hotspot-problem-${group.id}`} className="hotspot-problem">
              {group.title && (
                <h5>
                  <span className="hotspot-problem-number">
                    {ui('hotspotDetail.probleme')}
                    {index + 1}
                  </span>
                  <ModelText text={group.title} />
                </h5>
              )}
              {group.question && (
                <p className="hotspot-problem-question">
                  <ModelText text={group.question} />
                </p>
              )}
              {group.analysisSummary && (
                <p className="hotspot-problem-analysis">
                  <ModelText text={group.analysisSummary} />
                </p>
              )}
              {group.documentIds.map((id) => {
                const document = documents.find((item) => item.id === id);
                return document ? (
                  <button
                    key={id}
                    type="button"
                    className="hotspot-problem-document"
                    onClick={() => onChange({ view: 'documents', document: id, hotspot: '' })}
                  >
                    <FileText size={16} aria-hidden="true" />
                    {ui('hotspotDetail.lire_l_analyse')}
                    {documentFormat(document)})
                  </button>
                ) : null;
              })}
              {group.options.length > 0 && (
                <p className="hotspot-problem-option-count">
                  {group.options.length}{' '}
                  {group.options.length > 1
                    ? ui('hotspotDetail.options_documentees')
                    : ui('hotspotDetail.option_documentee')}
                </p>
              )}
              {group.options.length > 0 ? (
                <div className="hotspot-options">
                  {group.options.map((option) => (
                    <section
                      key={option.id}
                      className="hotspot-story-option"
                      data-selected={option.id === selected?.id}
                    >
                      <div className="hotspot-story-heading">
                        <h5>
                          <Lightbulb size={17} aria-hidden="true" />
                          <ModelText text={option.title} />
                        </h5>
                        <div className="hotspot-option-labels">
                          {option.id === selected?.id && (
                            <span className="hotspot-option-tag">{ui('hotspotDetail.option_retenue')}</span>
                          )}
                          {resolution.stage === 'ready_for_arbitration' && option.id === recommended?.id && (
                            <span className="hotspot-option-tag">{ui('hotspotDetail.a_arbitrer')}</span>
                          )}
                          {credibleIds.has(option.id) && (
                            <span className="hotspot-option-tag">{ui('hotspotDetail.solution_credible')}</span>
                          )}
                          <span className="hotspot-story-caption">{EVIDENCE[option.evidence_state]}</span>
                        </div>
                      </div>
                      <p>
                        {option.effect && <strong>{ui('hotspotDetail.effet_attendu')}</strong>}
                        <ModelText text={option.effect || option.principle} />
                      </p>
                    </section>
                  ))}
                </div>
              ) : !group.analysisSummary ? (
                <p className="hotspot-story-empty">
                  {group.id === 'legacy'
                    ? ui('hotspotDetail.aucune_option_documentee_a_ce_stade')
                    : ui('hotspotDetail.options_a_definir_pour_cette_question')}
                </p>
              ) : null}
            </section>
          ))}
        </section>

        <section className="hotspot-story-section" aria-labelledby="hotspot-choice-title">
          <div className="hotspot-story-heading">
            <h4 id="hotspot-choice-title">
              <Scale size={20} aria-hidden="true" />
              {ui('hotspotDetail.decision_et_prochaine_etape')}
            </h4>
            {canEdit && (
              <button type="button" onClick={(event) => onEdit(event, 'resolution')}>
                {ui('hotspotDetail.completer_l_avancement')}
              </button>
            )}
          </div>
          {selected && (
            <p>
              <strong>{ui('hotspotDetail.option_retenue_2')}</strong>
              <ModelText text={selected.title} />
            </p>
          )}
          {hotspot.resolution_note && (
            <p>
              <strong>{ui('hotspotDetail.pourquoi_ce_choix')}</strong>
              <ModelText text={hotspot.resolution_note} />
            </p>
          )}
          {resolution.stage === 'ready_for_arbitration' && recommended && (
            <p>
              <strong>{ui('hotspotDetail.option_proposee_a_l_arbitrage')}</strong>
              <ModelText text={recommended.title} />
            </p>
          )}
          <p className="hotspot-story-caption">
            {ui('hotspotDetail.arbitrage')}
            {LEVEL[hotspot.arbitration_level] || hotspot.arbitration_level}
          </p>
          <div className="hotspot-story-next">
            <h5>{ui('hotspotDetail.le_prochain_pas')}</h5>
            <p>
              {resolution.next_step ? (
                <ModelText text={resolution.next_step} />
              ) : (
                ui('hotspotDetail.prochaine_etape_non_documentee')
              )}
            </p>
            {resolution.blocked_reason && (
              <p>
                <strong>{ui('hotspotDetail.blocage_a_lever')}</strong>
                <ModelText text={resolution.blocked_reason} />
              </p>
            )}
          </div>
        </section>

        <details className="hotspot-dossier">
          <summary>
            <BookOpen size={20} aria-hidden="true" />
            <span>{ui('hotspotDetail.voir_les_constats_les_conditions_et_les_documents')}</span>
          </summary>
          <div className="hotspot-dossier-body">
            <section className="hotspot-story-section" aria-labelledby="hotspot-problem-title">
              <div className="hotspot-story-heading">
                <h4 id="hotspot-problem-title">
                  <BookOpen size={20} aria-hidden="true" />
                  {ui('hotspotDetail.constats_a_verifier')}
                </h4>
                {canEdit && (
                  <button type="button" onClick={(event) => onEdit(event, 'location')}>
                    {ui('hotspotDetail.preciser_le_perimetre')}
                  </button>
                )}
              </div>
              {hotspot.framing_impact && (
                <p className="hotspot-story-caption">
                  <span className="hotspot-framing-marker">{framingLabel(hotspot)}</span>
                  {hotspot.framing_impact.evidence_state === 'hypothesis' && ui('hotspotDetail.hypothese_2')}
                </p>
              )}
              <div className="hotspot-anchors" role="group" aria-label={ui('hotspotDetail.perimetres_concernes')}>
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
              <h5>{ui('hotspotDetail.cas_concrets')}</h5>
              {hotspot.examples.length > 0 ? (
                <ul className="hotspot-story-examples">
                  {hotspot.examples.map((example) => (
                    <li key={example}>
                      <ModelText text={example} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hotspot-story-empty">{ui('hotspotDetail.aucun_cas_concret_documente')}</p>
              )}
              {hotspot.gap_analysis?.map((gap) => (
                <article key={gap.id} className="hotspot-gap-analysis">
                  <p className="hotspot-story-caption">
                    {new Set(gap.observations_by_context.map((item) => item.context_id)).size === 1
                      ? ui('hotspotDetail.ecart_dans_un_meme_si')
                      : new Set(gap.observations_by_context.map((item) => item.context_id)).size <
                          gap.observations_by_context.length
                        ? ui('hotspotDetail.ecart_entre_si_et_entre_perimetres')
                        : ui('hotspotDetail.ecart_entre_si')}
                  </p>
                  <h5>
                    <ModelText text={gap.title} />
                  </h5>
                  <p>
                    <ModelText text={gap.comparison} />
                  </p>
                  <ul className="hotspot-gap-summary">
                    {gap.observations_by_context.map((observation) => (
                      <li key={`${observation.context_id}:${observation.observation_scope?.id || ''}`}>
                        <strong>
                          {contextName(model.raw.application_catalog, observation.context_id, model.version)}
                          {observation.observation_scope && (
                            <>
                              {' '}
                              · <ModelText text={observation.observation_scope.label} />
                            </>
                          )}
                          {' : '}
                        </strong>
                        <ModelText text={observation.handling} />
                        {observation.evidence_state === 'hypothesis' && (
                          <span className="hotspot-story-caption">{ui('hotspotDetail.hypothese_2')}</span>
                        )}
                        {observation.evidence_state === 'to_investigate' && (
                          <span className="hotspot-story-caption">{ui('hotspotDetail.a_instruire')}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {gap.business_effects[0] && (
                    <p className="hotspot-story-caption">
                      <strong>{ui('hotspotDetail.enjeu')}</strong>
                      <ModelText text={gap.business_effects[0]} />
                    </p>
                  )}
                </article>
              ))}
            </section>

            <section className="hotspot-story-section" aria-labelledby="hotspot-market-title">
              <h4 id="hotspot-market-title">
                <BookOpen size={20} aria-hidden="true" />
                {ui('hotspotDetail.reperes_du_marche')}
              </h4>
              {hotspot.market_view ? (
                <div className="hotspot-story-support">
                  <p>
                    <ModelText text={hotspot.market_view.flow_assessment} />
                  </p>
                  <p className="hotspot-story-caption">
                    <ModelText text={hotspot.market_view.limits} />
                  </p>
                  <ul className="hotspot-market-links">
                    {hotspot.market_view.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.publisher} — {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="hotspot-story-empty">
                  {ui('hotspotDetail.comparaison_marche_non_documentee_pour_ce_point_chaud')}
                </p>
              )}
            </section>

            {hotspot.resolution_options.length > 0 && (
              <section
                className="hotspot-story-section hotspot-option-details"
                aria-labelledby="hotspot-option-details-title"
              >
                <h4 id="hotspot-option-details-title">
                  <Lightbulb size={20} aria-hidden="true" />
                  {ui('hotspotDetail.conditions_et_compromis_des_options')}
                </h4>
                <div className="hotspot-option-detail-list">
                  {hotspot.resolution_options.map((option) => (
                    <article key={option.id}>
                      <h5>
                        <ModelText text={option.title} />
                      </h5>
                      <p>
                        <strong>{ui('hotspotDetail.principe')}</strong>
                        <ModelText text={option.principle} />
                      </p>
                      {option.effect && (
                        <p>
                          <strong>{ui('hotspotDetail.effet_attendu')}</strong>
                          <ModelText text={option.effect} />
                        </p>
                      )}
                      {!!option.conditions?.length && (
                        <p>
                          <strong>{ui('hotspotDetail.conditions')}</strong>
                          <ModelText text={option.conditions.join(' · ')} />
                        </p>
                      )}
                      {!!option.tradeoffs?.length && (
                        <p>
                          <strong>{ui('hotspotDetail.compromis')}</strong>
                          <ModelText text={option.tradeoffs.join(' · ')} />
                        </p>
                      )}
                      <p className="hotspot-story-caption">
                        {ui('hotspotDetail.difficulte_d_implementation')}
                        {size(option.implementation_complexity)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="hotspot-story-section" aria-labelledby="hotspot-evidence-title">
              <h4 id="hotspot-evidence-title">
                <FileText size={20} aria-hidden="true" />
                {ui('hotspotDetail.documents')}
              </h4>
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
                      <a href={documentUrl(model, document)} download={documentDownloadName(document)}>
                        <Download size={16} aria-hidden="true" />
                        {ui('hotspotDetail.telecharger_le')}
                        {documentFormat(document)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </details>
      </div>
    </article>
  );
}
