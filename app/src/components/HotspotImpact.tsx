import { framingLabel } from '../hotspotFraming';
import type { Hotspot } from '../types';
import { ModelText } from './ModelLinks';
export function HotspotImpact({ item }: { item: Hotspot }) {
  const impact = item.framing_impact;
  return (
    <details className="hotspot-impact-detail">
      <summary className="hotspot-framing-marker">{framingLabel(item)}</summary>
      <p>Qualification de l’impact, indépendante de la criticité et de l’avancement.</p>
      <p>
        Modèle : règle, responsabilité, donnée ou réalisation métier/Core System concernée. Usage : praticité de
        l’outil, sans changement métier établi.
      </p>
      {impact ? (
        <>
          <p>
            <strong>Justification : </strong>
            <ModelText text={impact.rationale} />
          </p>
          <p>
            Cible :{' '}
            {impact.targets
              .map((target) => (target === 'business_model' ? 'Modèle métier' : 'Core System FLOW'))
              .join(' · ') || (impact.category === 'usage' ? 'Usage de l’outil' : 'À qualifier')}
          </p>
          <p>
            Preuve :{' '}
            {impact.evidence_state === 'hypothesis'
              ? 'Hypothèse à éprouver'
              : impact.evidence_state === 'documented'
                ? 'Qualification documentée ; portée des sources à vérifier'
                : 'À investiguer'}
          </p>
        </>
      ) : (
        <p>Qualification non documentée dans cette publication.</p>
      )}
      <ModelText text="[Comprendre le Hotspot et ses dimensions](method:MOD044)" />
    </details>
  );
}
