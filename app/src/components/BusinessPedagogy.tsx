import { marketText } from '../marketContent';
import { resolvePedagogy } from '../pedagogy';
import { publicText } from '../publicText';
import type { AtlasNode, PublishedModel } from '../types';
import { ModelText, ReferenceLink } from './ModelLinks';
import './pedagogy.css';

export function BusinessPedagogy({ model, node }: { model: PublishedModel; node: AtlasNode }) {
  const { block, examples, comparisons } = resolvePedagogy(model, node);
  if (!block) return null;
  const gaps = node.fields.market_gaps as { family: string; reason: string }[] | undefined;
  return (
    <section id={`field-${node.id}-pedagogical_description`} tabIndex={-1} className="business-pedagogy">
      <h2>Comprendre ce périmètre</h2>
      <p>
        <ModelText text={publicText(block.explanation)} />
      </p>
      {examples.map((example) => (
        <article className="pedagogy-example" key={example.id}>
          <h3>{example.title}</h3>
          <p className="detail-muted">Illustration pédagogique fictive, sans fait Beaumanoir présumé.</p>
          <dl>
            <div>
              <dt>Situation</dt>
              <dd>
                <ModelText text={publicText(example.situation)} />
              </dd>
            </div>
            <div>
              <dt>Contribution de ce périmètre</dt>
              <dd>
                <ModelText text={publicText(example.contribution)} />
              </dd>
            </div>
            <div>
              <dt>Résultat</dt>
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
          <h3>À distinguer de</h3>
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
          <summary>Repères dans les outils du marché</summary>
          <p>
            {comparisons.length > 0
              ? 'Ces rapprochements illustrent une partie du périmètre. Ils ne prouvent ni une équivalence complète ni un outil installé chez Beaumanoir.'
              : 'Aucun rapprochement logiciel qualifié n’est documenté pour ce périmètre.'}
          </p>
          {comparisons.map((item) => (
            <article className="pedagogy-market" key={item.id}>
              <h3>
                {item.product} — {item.element_name}
              </h3>
              <p>
                <strong>Point commun. </strong>
                <ModelText text={marketText(item.similarities)} />
              </p>
              <p>
                <strong>Différences. </strong>
                <ModelText text={marketText(item.differences)} />
              </p>
              <p>
                <strong>Positionnement FLOW. </strong>
                <ModelText text={marketText(item.flow_position)} />
              </p>
              <p>
                <strong>Limites. </strong>
                <ModelText text={marketText(item.evidence_limits)} />
              </p>
              <p>
                <a href={item.source_url} target="_blank" rel="noreferrer">
                  {item.source_title}
                </a>{' '}
                · {item.source_version} · consulté le {item.consulted_on}
              </p>
              <p>
                <ModelText text={marketText(item.source_locator)} />
              </p>
            </article>
          ))}
          {gaps?.map((gap) => (
            <p key={gap.family}>
              <strong>Appui manquant : {gap.family === 'sap_s4hana' ? 'SAP S/4HANA' : 'Microsoft Dynamics'}. </strong>
              La couverture de ce périmètre reste à documenter.
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
