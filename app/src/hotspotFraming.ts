import type { Hotspot } from './types.ts';

export function hotspotImpactScopes(hotspot: Hotspot): ('model' | 'transition' | 'usage')[] {
  const impact = hotspot.framing_impact;
  if (impact?.scopes) return impact.scopes;
  return impact?.category === 'structuring' ? ['model'] : impact?.category === 'usage' ? ['usage'] : [];
}

export function framingLabel(hotspot: Hotspot): string {
  switch (hotspot.framing_impact?.category) {
    case 'structuring':
      if (hotspotImpactScopes(hotspot).includes('transition')) {
        const scope = hotspotImpactScopes(hotspot).includes('model') ? 'modèle et transition' : 'transition';
        return hotspot.framing_impact?.evidence_state === 'hypothesis'
          ? `Impact ${scope} proposé`
          : `Structurant pour ${scope === 'transition' ? 'la transition' : 'le modèle et la transition'}`;
      }
      return hotspot.framing_impact?.evidence_state === 'hypothesis'
        ? 'Impact modèle proposé'
        : 'Structurant pour le cadrage';
    case 'usage':
      return 'Irritant d’usage · design produit';
    case 'to_assess':
      return 'Impact à qualifier';
    default:
      return 'Impact non renseigné';
  }
}
