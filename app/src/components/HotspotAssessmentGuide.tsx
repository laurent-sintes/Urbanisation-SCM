import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { ModelText } from './ModelLinks';
export function HotspotAssessmentGuide({ model }: { model: PublishedModel }) {
  const policy = model.raw.hotspot_catalog?.criticality_policy;
  return (
    <details className="hotspot-assessment-guide">
      <summary>{ui('hotspotAssessmentGuide.comment_qualifier_et_evaluer_un_hotspot')}</summary>
      <dl className="hotspot-dimensions">
        <div>
          <dt>{ui('hotspotAssessmentGuide.sujet')}</dt>
          <dd>{ui('hotspotAssessmentGuide.decouvert_partage_ou_valide_reconnaissance_du_sujet_sans_confirme')}</dd>
        </div>
        <div>
          <dt>{ui('hotspotAssessmentGuide.impact')}</dt>
          <dd>{ui('hotspotAssessmentGuide.modele_metier_core_system_praticite_d_usage_ou_impact_a_qualifier')}</dd>
        </div>
        <div>
          <dt>{ui('hotspotAssessmentGuide.criticite')}</dt>
          <dd>{ui('hotspotAssessmentGuide.croisement_des_difficultes_d_arbitrage_et_d_implementation_distin')}</dd>
        </div>
        <div>
          <dt>{ui('hotspotAssessmentGuide.cadrage')}</dt>
          <dd>{ui('hotspotAssessmentGuide.a_explorer_pistes_identifiees_qualification_solution_credible_une')}</dd>
        </div>
      </dl>
      <p>
        <ModelText text={ui('hotspotAssessmentGuide.point_chaud_method_mod044_analyse_des_ecarts_method_mod045')} />
      </p>
      {policy ? (
        <>
          <p>
            {policy.scope} {policy.unknown_rule}
          </p>
          <div className="hotspot-matrix-scroll">
            <table className="hotspot-matrix">
              <caption>
                {ui('hotspotAssessmentGuide.grille_de_criticite_arbitrage_en_lignes_implementation_en_colonne')}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{ui('hotspotAssessmentGuide.arbitrage_implementation')}</th>
                  {policy.levels.map((level) => (
                    <th scope="col" key={level}>
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policy.levels.map((level, row) => (
                  <tr key={level}>
                    <th scope="row">{level}</th>
                    {policy.matrix[row].map((result, column) => (
                      <td key={policy.levels[column]}>{result}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{ui('hotspotAssessmentGuide.exemple_arbitrage_l_implementation_xl_criticite_xl')}</p>
          {Object.entries(policy.axes)
            .filter(([axis]) => axis !== 'political')
            .map(([axis, value]) => (
              <section key={axis}>
                <h5>
                  {axis === 'arbitration'
                    ? ui('hotspotAssessmentGuide.complexite_d_arbitrage')
                    : ui('hotspotAssessmentGuide.complexite_d_implementation')}
                </h5>
                <p>{value.definition}</p>
                <dl>
                  {Object.entries(value.guidance).map(([level, description]) => (
                    <div key={level}>
                      <dt>{level}</dt>
                      <dd>{description}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          <p>{policy.assessment_note}</p>
        </>
      ) : (
        <p>{ui('hotspotAssessmentGuide.cette_version_ne_contient_pas_de_grille_detaillee')}</p>
      )}
    </details>
  );
}
