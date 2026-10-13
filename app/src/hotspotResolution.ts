import type { Hotspot, HotspotResolution } from './types.ts';

export const RESOLUTION_STAGES = {
  unassessed: 'Non renseigné',
  to_explore: 'À explorer',
  identified: 'Pistes identifiées',
  qualifying: 'Options en qualification',
  ready_for_arbitration: 'Option recommandée — à arbitrer',
  credible: 'Solution crédible — cadrage résolu',
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
  if (!(resolution.stage in RESOLUTION_STAGES)) errors.push('étape de résolution inconnue');
  if (resolution.stage !== 'unassessed') {
    if (!resolution.summary.trim()) errors.push('synthèse d’avancement requise');
    if (!validDate(resolution.assessed_on)) errors.push('date d’évaluation valide requise');
    if (!resolution.assessment_source.trim()) errors.push('source d’évaluation requise');
  }
  if (resolution.stage === 'unassessed' && resolution.assessed_on !== undefined && !validDate(resolution.assessed_on))
    errors.push('date d’évaluation invalide');
  if (
    ['identified', 'qualifying', 'ready_for_arbitration', 'credible'].includes(resolution.stage) &&
    !hotspot.resolution_options.length
  )
    errors.push('au moins une option décrite est requise');
  const recommended = resolution.recommended_option_id || '';
  const recommendationNote = resolution.recommendation_note || '';
  if (recommended && !hotspot.resolution_options.some((option) => option.id === recommended))
    errors.push('option recommandée absente des options');
  if (resolution.stage === 'ready_for_arbitration') {
    if (!recommended || !recommendationNote.trim()) errors.push('option recommandée et justification requises');
    if (hotspot.status === 'resolved') errors.push('une option à arbitrer ne clôt pas le cadrage');
    if (resolution.blocked_reason.trim()) errors.push('une option prête à arbitrer ne peut pas être bloquée');
    if (hotspot.selected_option_id) errors.push('une option à arbitrer ne peut pas être déjà retenue');
  } else if (resolution.stage !== 'credible' && (recommended || recommendationNote.trim())) {
    errors.push('la recommandation exige l’étape prête à arbitrer ou résolue');
  }
  if (resolution.stage === 'credible') {
    if (!resolution.credible_option_ids.length) errors.push('au moins une solution crédible requise');
    if (!resolution.credibility_note.trim()) errors.push('justification de crédibilité requise');
    if (hotspot.status !== 'resolved') errors.push('une solution crédible exige le statut résolu');
    if (resolution.blocked_reason.trim()) errors.push('un cadrage résolu ne peut pas être bloqué');
    if (Boolean(recommended) !== Boolean(recommendationNote.trim()))
      errors.push('recommandation conservée sans option ou justification');
    if (recommended && !resolution.credible_option_ids.includes(recommended))
      errors.push('l’option recommandée conservée doit être crédible');
  } else {
    if (hotspot.status === 'resolved') errors.push('le statut résolu exige une solution crédible');
    if (resolution.credible_option_ids.length) errors.push('les solutions crédibles exigent l’étape solution crédible');
  }
  if (new Set(resolution.credible_option_ids).size !== resolution.credible_option_ids.length)
    errors.push('solutions crédibles dupliquées');
  if (resolution.credible_option_ids.some((id) => !hotspot.resolution_options.some((option) => option.id === id)))
    errors.push('solution crédible absente des options');
  if (resolution.blocked_reason.trim() && !resolution.next_step.trim())
    errors.push('prochaine étape requise pour un blocage');
  return errors;
}
