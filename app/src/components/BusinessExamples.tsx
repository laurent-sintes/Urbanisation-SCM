import type { ReactNode } from 'react';
import type { ReaderExample } from '../examples';
import { ui } from '../ui.ts';
import { MethodLink, ModelText, ReferenceLink } from './ModelLinks';
import './examples.css';

function ExampleDetail({ example, children }: { example: ReaderExample; children: ReactNode }) {
  const words = [
    example.trigger,
    example.objective,
    example.outcome,
    example.lesson,
    ...(example.constraints || []),
    ...(example.validation_points || []),
  ]
    .filter(Boolean)
    .join(' ')
    .split(/\s+/).length;
  return example.steps?.length || words > 120 ? (
    <details className="scenario-details">
      <summary>{ui('businessExamples.details_de_cet_exemple')}</summary>
      {children}
    </details>
  ) : (
    <div className="scenario-details">{children}</div>
  );
}

export function BusinessExamples({
  examples,
  id,
  illustrations = false,
}: {
  examples: readonly ReaderExample[];
  id: string;
  illustrations?: boolean;
}) {
  if (!examples.length) return null;
  return (
    <section
      id={id}
      tabIndex={-1}
      className="business-examples"
      aria-label={illustrations ? ui('businessExamples.illustrations_metier') : ui('businessExamples.scenarios_metier')}
    >
      <h2>{illustrations ? ui('businessExamples.illustrations_metier') : ui('businessExamples.scenarios_metier')}</h2>
      <p>
        <MethodLink term={illustrations ? 'MOD027' : 'MOD026'}>
          {illustrations
            ? ui('businessExamples.comprendre_scenarios_et_parcours')
            : ui('businessExamples.comprendre_les_cas_d_usage_et_leurs_parcours')}
        </MethodLink>
      </p>
      <div className="example-cards">
        {examples.map((example) => (
          <article className="example-card" key={`${example.sourceNode || id}:${example.title}:${example.situation}`}>
            <h3>{example.title}</h3>
            <p>
              <ModelText text={example.situation} />
            </p>
            {example.sourceNode && (
              <p>
                <ReferenceLink target={example.sourceNode} anchor="examples">
                  {ui('businessExamples.scenario_partage_fiche_d_origine')}
                </ReferenceLink>
              </p>
            )}
            {example.contribution && (
              <p>
                <strong>{ui('businessExamples.contribution_de_cette_fiche')}</strong>
                <ModelText text={example.contribution} />
              </p>
            )}
            {example.trigger ||
            example.objective ||
            example.constraints?.length ||
            example.options?.length ||
            example.steps?.length ||
            example.contributions?.length ||
            example.outcome ||
            example.lesson ||
            example.validation_points?.length ? (
              <ExampleDetail example={example}>
                {example.trigger && (
                  <p>
                    <strong>{ui('businessExamples.declencheur')}</strong>
                    <ModelText text={example.trigger} />
                  </p>
                )}
                {example.objective && (
                  <p>
                    <strong>{ui('businessExamples.resultat_recherche')}</strong>
                    <ModelText text={example.objective} />
                  </p>
                )}
                {!!example.constraints?.length && (
                  <>
                    <h4>{ui('businessExamples.contraintes')}</h4>
                    <ul>
                      {example.constraints.map((text) => (
                        <li key={text}>
                          <ModelText text={text} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {!!example.options?.length && (
                  <>
                    <h4>{ui('businessExamples.options_examinees')}</h4>
                    <ul>
                      {example.options.map((option) => (
                        <li key={`${option.title}:${option.description}`}>
                          <strong>{option.title}. </strong>
                          <ModelText text={option.description} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {!!example.steps?.length && (
                  <div className="scenario-story">
                    <h4>{ui('businessExamples.comment_ce_cas_est_resolu')}</h4>
                    <ol>
                      {example.steps.map((step) => (
                        <li key={`${step.title}:${step.description}`}>
                          <h5>{step.title}</h5>
                          <p>
                            <ModelText text={step.description} />
                          </p>
                          <ul
                            className="scenario-capabilities"
                            aria-label={ui('businessExamples.capacites_mobilisees', { title: step.title })}
                          >
                            {step.contributions.map((c) => (
                              <li key={`${c.node_id}:${c.role}`}>
                                <ReferenceLink target={c.node_id}>{c.name || c.node_id}</ReferenceLink>
                                <span>
                                  {' '}
                                  — <ModelText text={c.role} />
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="scenario-result">
                            <strong>{ui('businessExamples.resultat_de_cette_etape')}</strong>
                            <ModelText text={step.outcome} />
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {!!example.contributions?.length && (
                  <>
                    <h4>{ui('businessExamples.contributions_metier')}</h4>
                    <ul>
                      {example.contributions.map((c) => (
                        <li key={`${c.node_id}:${c.role}`}>
                          <ReferenceLink target={c.node_id}>{c.name || c.node_id}</ReferenceLink> —{' '}
                          <ModelText text={c.role} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {example.outcome && (
                  <p>
                    <strong>{ui('businessExamples.ce_qui_se_passe')}</strong>
                    <ModelText text={example.outcome} />
                  </p>
                )}
                {example.lesson && (
                  <p className="example-lesson">
                    <strong>{ui('businessExamples.ce_que_cela_illustre')}</strong>
                    <ModelText text={example.lesson} />
                  </p>
                )}
                {!!example.validation_points?.length && (
                  <>
                    <h4>{ui('businessExamples.ce_que_ce_cas_permet_de_verifier')}</h4>
                    <ul>
                      {example.validation_points.map((text) => (
                        <li key={text}>
                          <ModelText text={text} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </ExampleDetail>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
