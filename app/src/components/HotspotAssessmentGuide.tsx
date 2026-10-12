import type { PublishedModel } from '../types';
import { ModelText } from './ModelLinks';
export function HotspotAssessmentGuide({ model }: { model: PublishedModel }) {
  const policy = model.raw.hotspot_catalog?.criticality_policy;
  return (
    <details className="hotspot-assessment-guide">
      <summary>Comment qualifier et évaluer un Hotspot ?</summary>
      <dl className="hotspot-dimensions">
        <div>
          <dt>Sujet</dt>
          <dd>Découvert, partagé ou validé : reconnaissance du sujet, sans confirmer un dysfonctionnement.</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>
            Modèle métier / Core System, praticité d’usage ou impact à qualifier. Le classement garde sa justification
            et son niveau de preuve.
          </dd>
        </div>
        <div>
          <dt>Criticité</dt>
          <dd>
            Croisement des difficultés politique et d’implémentation ; distinct de l’urgence et de l’impact business.
          </dd>
        </div>
        <div>
          <dt>Cadrage</dt>
          <dd>
            À explorer, pistes identifiées, qualification, solution crédible. Une décision argumentée de non-convergence
            peut résoudre le cadrage.
          </dd>
        </div>
      </dl>
      <p>
        <ModelText text="[Point chaud](method:MOD044) · [Analyse des écarts](method:MOD045)" />
      </p>
      {policy ? (
        <>
          <p>
            {policy.scope} {policy.unknown_rule}
          </p>
          <div className="hotspot-matrix-scroll">
            <table className="hotspot-matrix">
              <caption>Grille publiée {policy.id} · politique en lignes, implémentation en colonnes</caption>
              <thead>
                <tr>
                  <th scope="col">Politique / implémentation</th>
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
          <p>Exemple : politique L × implémentation XL → criticité XL.</p>
          {Object.entries(policy.axes).map(([axis, value]) => (
            <section key={axis}>
              <h5>{axis === 'political' ? 'Complexité politique' : 'Complexité d’implémentation'}</h5>
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
        <p>
          La grille détaillée n’est pas fournie par cette publication. Aucun critère d’une édition plus récente ne lui
          est ajouté.
        </p>
      )}
    </details>
  );
}
