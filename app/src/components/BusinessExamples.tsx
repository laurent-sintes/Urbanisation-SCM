import type { ReaderExample } from '../examples';
import type { ReactNode } from 'react';
import { ModelText, ReferenceLink, MethodLink } from './ModelLinks';
import './examples.css';

function ExampleDetail({example,children}:{example:ReaderExample;children:ReactNode}) {
  const words=[example.trigger,example.objective,example.outcome,example.lesson,...(example.constraints || []),...(example.validation_points || [])].filter(Boolean).join(' ').split(/\s+/).length;
  return example.steps?.length || words > 120 ? <details className="scenario-details"><summary>Détails de cet exemple</summary>{children}</details> : <div className="scenario-details">{children}</div>;
}

export function BusinessExamples({ examples, id, illustrations = false }: { examples: readonly ReaderExample[]; id: string; illustrations?: boolean }) {
  if (!examples.length) return null;
  return <section id={id} tabIndex={-1} className="business-examples" aria-label={illustrations ? "Illustrations métier" : "Scénarios métier"}>
    <h2>{illustrations ? "Illustrations métier" : "Scénarios métier"}</h2>
    <p><MethodLink term={illustrations ? "MOD027" : "MOD026"}>{illustrations ? "Comprendre scénarios et parcours" : "Comprendre les cas d’usage et leurs parcours"}</MethodLink></p>
    <div className="example-cards">{examples.map((example, index) => <article className="example-card" key={index}>
      <h3>{example.title}</h3>
      <p><ModelText text={example.situation}/></p>
      {example.sourceNode && <p><ReferenceLink target={example.sourceNode} anchor="examples">Scénario partagé — fiche d’origine</ReferenceLink></p>}
      {example.contribution && <p><strong>Contribution de cette fiche. </strong><ModelText text={example.contribution}/></p>}
      {(example.trigger || example.objective || example.constraints?.length || example.options?.length || example.steps?.length || example.contributions?.length || example.outcome || example.lesson || example.validation_points?.length) ? <ExampleDetail example={example}>
      {example.trigger && <p><strong>Déclencheur. </strong><ModelText text={example.trigger}/></p>}
      {example.objective && <p><strong>Résultat recherché. </strong><ModelText text={example.objective}/></p>}
      {!!example.constraints?.length && <><h4>Contraintes</h4><ul>{example.constraints.map((text, i) => <li key={i}><ModelText text={text}/></li>)}</ul></>}
      {!!example.options?.length && <><h4>Options examinées</h4><ul>{example.options.map((option, i) => <li key={i}><strong>{option.title}. </strong><ModelText text={option.description}/></li>)}</ul></>}
      {!!example.steps?.length && <div className="scenario-story"><h4>Comment ce cas est résolu</h4><ol>{example.steps.map((step, i) => <li key={i}>
        <h5>{step.title}</h5><p><ModelText text={step.description}/></p>
        <ul className="scenario-capabilities" aria-label={`Capacités mobilisées : ${step.title}`}>{step.contributions.map((c, j) => <li key={j}>
          <ReferenceLink target={c.node_id}>{c.name || c.node_id}</ReferenceLink><span> — <ModelText text={c.role}/></span>
        </li>)}</ul><p className="scenario-result"><strong>Résultat de cette étape. </strong><ModelText text={step.outcome}/></p>
      </li>)}</ol></div>}
      {!!example.contributions?.length && <><h4>Contributions métier</h4><ul>{example.contributions.map((c, i) => <li key={i}><ReferenceLink target={c.node_id}>{c.name || c.node_id}</ReferenceLink> — <ModelText text={c.role}/></li>)}</ul></>}
      {example.outcome && <p><strong>Ce qui se passe. </strong><ModelText text={example.outcome}/></p>}
      {example.lesson && <p className="example-lesson"><strong>Ce que cela illustre. </strong><ModelText text={example.lesson}/></p>}
      {!!example.validation_points?.length && <><h4>Ce que ce cas permet de vérifier</h4><ul>{example.validation_points.map((text, i) => <li key={i}><ModelText text={text}/></li>)}</ul></>}
      </ExampleDetail> : null}
    </article>)}</div>
  </section>;
}
