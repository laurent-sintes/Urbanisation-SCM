import type { Hotspot } from './types.ts';
import { ui } from './ui.ts';

export function hotspotImpactScopes(hotspot: Hotspot): ('model' | 'transition' | 'usage')[] {
  const impact = hotspot.framing_impact;
  if (impact?.scopes) return impact.scopes;
  return impact?.category === 'structuring' ? ['model'] : impact?.category === 'usage' ? ['usage'] : [];
}

export function framingLabel(hotspot: Hotspot): string {
  switch (hotspot.framing_impact?.category) {
    case 'structuring':
      if (hotspotImpactScopes(hotspot).includes('transition')) {
        const scope = hotspotImpactScopes(hotspot).includes('model')
          ? ui('hotspotFraming.modele_et_transition')
          : 'transition';
        return hotspot.framing_impact?.evidence_state === 'hypothesis'
          ? ui('hotspotFraming.impact_propose', { scope: scope })
          : ui('hotspotFraming.structurant_pour', {
              value1:
                scope === 'transition'
                  ? ui('hotspotFraming.la_transition')
                  : ui('hotspotFraming.le_modele_et_la_transition'),
            });
      }
      return hotspot.framing_impact?.evidence_state === 'hypothesis'
        ? ui('hotspotFraming.impact_modele_propose')
        : ui('hotspotFraming.structurant_pour_le_cadrage');
    case 'usage':
      return ui('hotspotFraming.irritant_d_usage_design_produit');
    case 'to_assess':
      return ui('hotspotFraming.impact_a_qualifier');
    default:
      return ui('hotspotFraming.impact_non_renseigne');
  }
}
