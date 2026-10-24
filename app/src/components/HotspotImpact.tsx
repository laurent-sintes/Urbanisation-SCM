import { framingLabel, hotspotImpactScopes } from '../hotspotFraming';
import type { Hotspot } from '../types';
import { ui } from '../ui.ts';
import { ModelText } from './ModelLinks';
export function HotspotImpact({ item }: { item: Hotspot }) {
  const impact = item.framing_impact;
  return (
    <details className="hotspot-impact-detail">
      <summary className="hotspot-framing-marker">{framingLabel(item)}</summary>
      <p>{ui('hotspotImpact.qualification_de_l_impact_independante_de_la_criticite_et_de_l_av')}</p>
      <p>{ui('hotspotImpact.modele_regle_responsabilite_donnee_ou_realisation_metier_core_sys')}</p>
      {impact ? (
        <>
          <p>
            <strong>{ui('hotspotImpact.justification')}</strong>
            <ModelText text={impact.rationale} />
          </p>
          <p>
            {ui('hotspotImpact.modele_concerne')}{' '}
            {impact.targets
              .map((target) =>
                target === 'business_model' ? ui('hotspotImpact.modele_metier') : ui('hotspotImpact.core_system_flow'),
              )
              .join(' · ') ||
              (hotspotImpactScopes(item).includes('transition')
                ? ui('hotspotImpact.impact_durable_non_etabli')
                : impact.category === 'usage'
                  ? ui('hotspotImpact.usage_de_l_outil')
                  : ui('hotspotImpact.a_qualifier'))}
          </p>
          <p>
            {ui('hotspotImpact.preuve')}{' '}
            {impact.evidence_state === 'hypothesis'
              ? ui('hotspotImpact.hypothese_a_eprouver')
              : impact.evidence_state === 'documented'
                ? ui('hotspotImpact.qualification_documentee_portee_des_sources_a_verifier')
                : ui('hotspotImpact.a_investiguer')}
          </p>
        </>
      ) : (
        <p>{ui('hotspotImpact.qualification_non_documentee_dans_cette_publication')}</p>
      )}
      <ModelText text={ui('hotspotImpact.comprendre_le_hotspot_et_ses_dimensions_method_mod044')} />
    </details>
  );
}
