import type { Hotspot } from './types';

export function framingLabel(hotspot: Hotspot): string {
  switch (hotspot.framing_impact?.category) {
    case 'structuring':
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
