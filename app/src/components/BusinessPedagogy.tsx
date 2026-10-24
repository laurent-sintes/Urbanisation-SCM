import { marketText } from '../marketContent';
import { resolvePedagogy } from '../pedagogy';
import { publicText } from '../publicText';
import type { AtlasNode, PublishedModel } from '../types';
import { ui } from '../ui.ts';
import { ModelText, ReferenceLink } from './ModelLinks';
import './pedagogy.css';

export function BusinessPedagogy({ model, node }: { model: PublishedModel; node: AtlasNode }) {
  const { block, examples, comparisons } = resolvePedagogy(model, node);
  if (!block) return null;
  const gaps = node.fields.market_gaps as { family: string; reason: string }[] | undefined;
  return (
    <section id={`field-${node.id}-pedagogical_description`} tabIndex={-1} className="business-pedagogy">
      <h2>{ui('businessPedagogy.comprendre_ce_perimetre')}</h2>
      {block.explanation.split(/\n\s*\n/).map((paragraph) => (
        <p key={paragraph}>
          <ModelText text={publicText(paragraph)} />
        </p>
      ))}
      {examples.map((example) => (
        <article className="pedagogy-example" key={example.id}>
          <h3>{example.title}</h3>
          <p className="detail-muted">
            {ui('businessPedagogy.illustration_pedagogique_fictive_sans_fait_beaumanoir_presume')}
          </p>
          <dl>
            <div>
              <dt>{ui('businessPedagogy.situation')}</dt>
              <dd>
                <ModelText text={publicText(example.situation)} />
              </dd>
            </div>
            <div>
              <dt>{ui('businessPedagogy.contribution_de_ce_perimetre')}</dt>
              <dd>
                <ModelText text={publicText(example.contribution)} />
              </dd>
            </div>
            <div>
              <dt>{ui('businessPedagogy.resultat')}</dt>
              <dd>
                <ModelText text={publicText(example.outcome || '')} />
              </dd>
            </div>
          </dl>
          {example.lesson && (
            <p>
              <ModelText text={publicText(example.lesson)} />
            </p>
          )}
        </article>
      ))}
      {!!block.distinctions?.length && (
        <div className="pedagogy-boundaries">
          <h3>{ui('businessPedagogy.a_distinguer_de')}</h3>
          {block.distinctions.map((item) => (
            <p key={item.node_id}>
              <ReferenceLink target={item.node_id}>
                {model.nodeById.get(item.node_id)?.name || item.node_id}
              </ReferenceLink>
              {' — '}
              <ModelText text={publicText(item.explanation)} />
            </p>
          ))}
        </div>
      )}
      {(comparisons.length > 0 || !!gaps?.length) && (
        <details>
          <summary>{ui('businessPedagogy.reperes_dans_les_outils_du_marche')}</summary>
          <p>
            {comparisons.length > 0
              ? ui('businessPedagogy.ces_rapprochements_illustrent_une_partie_du_perimetre_ils_ne_prou')
              : ui('businessPedagogy.aucun_rapprochement_logiciel_qualifie_n_est_documente_pour_ce_per')}
          </p>
          {comparisons.map((item) => (
            <article className="pedagogy-market" key={item.id}>
              <h3>
                {item.product} — {item.element_name}
              </h3>
              <p>
                <strong>{ui('businessPedagogy.point_commun')}</strong>
                <ModelText text={marketText(item.similarities)} />
              </p>
              <p>
                <strong>{ui('businessPedagogy.differences')}</strong>
                <ModelText text={marketText(item.differences)} />
              </p>
              <p>
                <strong>{ui('businessPedagogy.positionnement_flow')}</strong>
                <ModelText text={marketText(item.flow_position)} />
              </p>
              <p>
                <strong>{ui('businessPedagogy.limites')}</strong>
                <ModelText text={marketText(item.evidence_limits)} />
              </p>
              <p>
                <a href={item.source_url} target="_blank" rel="noreferrer">
                  {item.source_title}
                </a>{' '}
                · {item.source_version}
                {ui('businessPedagogy.consulte_le')}
                {item.consulted_on}
              </p>
              <p>
                <ModelText text={marketText(item.source_locator)} />
              </p>
            </article>
          ))}
          {gaps?.map((gap) => (
            <p key={gap.family}>
              <strong>
                {ui('businessPedagogy.appui_manquant')}
                {gap.family === 'sap_s4hana'
                  ? ui('businessPedagogy.sap_s_4hana')
                  : ui('businessPedagogy.microsoft_dynamics')}
                .{' '}
              </strong>
              {ui('businessPedagogy.la_couverture_de_ce_perimetre_reste_a_documenter')}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
