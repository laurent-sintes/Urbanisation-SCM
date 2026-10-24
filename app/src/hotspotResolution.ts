import type { Hotspot, HotspotResolution } from './types.ts';
import { ui } from './ui.ts';

export const RESOLUTION_STAGES = {
  unassessed: ui('hotspotResolution.non_renseigne'),
  to_explore: ui('hotspotResolution.a_explorer'),
  identified: ui('hotspotResolution.pistes_identifiees'),
  qualifying: ui('hotspotResolution.options_en_qualification'),
  ready_for_arbitration: ui('hotspotResolution.option_recommandee_a_arbitrer'),
  credible: ui('hotspotResolution.solution_credible_cadrage_resolu'),
} as const;

export const emptyResolution = (): HotspotResolution => ({
  stage: 'unassessed',
  summary: '',
  credible_option_ids: [],
  credibility_note: '',
  recommended_option_id: '',
  recommendation_note: '',
  blocked_reason: '',
  next_step: '',
  assessment_source: '',
});
export const resolutionFor = (hotspot: Hotspot) => hotspot.resolution || emptyResolution();
export const isFramingResolved = (hotspot: Hotspot) => hotspot.resolution?.stage === 'credible';
export const isClosedHotspot = (hotspot: Hotspot) =>
  isFramingResolved(hotspot) || (!hotspot.resolution && hotspot.status === 'resolved');

const validDate = (value: string | undefined) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export function resolutionErrors(hotspot: Hotspot): string[] {
  const resolution = hotspot.resolution;
  if (!resolution) return [];
  const errors: string[] = [];
  if (!(resolution.stage in RESOLUTION_STAGES)) errors.push(ui('hotspotResolution.etape_de_resolution_inconnue'));
  if (resolution.stage !== 'unassessed') {
    if (!resolution.summary.trim()) errors.push(ui('hotspotResolution.synthese_d_avancement_requise'));
    if (!validDate(resolution.assessed_on)) errors.push(ui('hotspotResolution.date_d_evaluation_valide_requise'));
    if (!resolution.assessment_source.trim()) errors.push(ui('hotspotResolution.source_d_evaluation_requise'));
  }
  if (resolution.stage === 'unassessed' && resolution.assessed_on !== undefined && !validDate(resolution.assessed_on))
    errors.push(ui('hotspotResolution.date_d_evaluation_invalide'));
  if (
    ['identified', 'qualifying', 'ready_for_arbitration', 'credible'].includes(resolution.stage) &&
    !hotspot.resolution_options.length
  )
    errors.push(ui('hotspotResolution.au_moins_une_option_decrite_est_requise'));
  const recommended = resolution.recommended_option_id || '';
  const recommendationNote = resolution.recommendation_note || '';
  if (recommended && !hotspot.resolution_options.some((option) => option.id === recommended))
    errors.push(ui('hotspotResolution.option_recommandee_absente_des_options'));
  if (resolution.stage === 'ready_for_arbitration') {
    if (!recommended || !recommendationNote.trim())
      errors.push(ui('hotspotResolution.option_recommandee_et_justification_requises'));
    if (hotspot.status === 'resolved')
      errors.push(ui('hotspotResolution.une_option_a_arbitrer_ne_clot_pas_le_cadrage'));
    if (resolution.blocked_reason.trim())
      errors.push(ui('hotspotResolution.une_option_prete_a_arbitrer_ne_peut_pas_etre_bloquee'));
    if (hotspot.selected_option_id)
      errors.push(ui('hotspotResolution.une_option_a_arbitrer_ne_peut_pas_etre_deja_retenue'));
  } else if (resolution.stage !== 'credible' && (recommended || recommendationNote.trim())) {
    errors.push(ui('hotspotResolution.la_recommandation_exige_l_etape_prete_a_arbitrer_ou_resolue'));
  }
  if (resolution.stage === 'credible') {
    if (!resolution.credible_option_ids.length)
      errors.push(ui('hotspotResolution.au_moins_une_solution_credible_requise'));
    if (!resolution.credibility_note.trim()) errors.push(ui('hotspotResolution.justification_de_credibilite_requise'));
    if (hotspot.status !== 'resolved')
      errors.push(ui('hotspotResolution.une_solution_credible_exige_le_statut_resolu'));
    if (resolution.blocked_reason.trim())
      errors.push(ui('hotspotResolution.un_cadrage_resolu_ne_peut_pas_etre_bloque'));
    if (Boolean(recommended) !== Boolean(recommendationNote.trim()))
      errors.push(ui('hotspotResolution.recommandation_conservee_sans_option_ou_justification'));
    if (recommended && !resolution.credible_option_ids.includes(recommended))
      errors.push(ui('hotspotResolution.l_option_recommandee_conservee_doit_etre_credible'));
  } else {
    if (hotspot.status === 'resolved')
      errors.push(ui('hotspotResolution.le_statut_resolu_exige_une_solution_credible'));
    if (resolution.credible_option_ids.length)
      errors.push(ui('hotspotResolution.les_solutions_credibles_exigent_l_etape_solution_credible'));
  }
  if (new Set(resolution.credible_option_ids).size !== resolution.credible_option_ids.length)
    errors.push(ui('hotspotResolution.solutions_credibles_dupliquees'));
  if (resolution.credible_option_ids.some((id) => !hotspot.resolution_options.some((option) => option.id === id)))
    errors.push(ui('hotspotResolution.solution_credible_absente_des_options'));
  if (resolution.blocked_reason.trim() && !resolution.next_step.trim())
    errors.push(ui('hotspotResolution.prochaine_etape_requise_pour_un_blocage'));
  return errors;
}
