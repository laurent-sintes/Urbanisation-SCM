import { ArrowRight, Download, GitBranch } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { behaviorTypeLabel } from '../behaviorTypes';
import { businessFields, businessQualification } from '../businessContent';
import { principleGroupsForNode, principlesForRelation, principleTitle } from '../designPrinciples';
import { pedagogyOf, resolvePedagogy } from '../pedagogy';
import { kindLabel } from '../presentation';
import { publicText } from '../publicText';
import { revealSection } from '../readerNavigation';
import {
  scmStudyAuthor,
  scmStudyDate,
  scmStudyDescription,
  scmStudyDomainId,
  scmStudyFilename,
  scmStudyFullTitle,
  scmStudyPages,
  scmStudyTemporalLabel,
  scmStudyUrl,
} from '../scmStudy';
import { sheetSections } from '../sheetSections';
import type { AtlasNode, AtlasRelation, PublishedModel } from '../types';
import { ui } from '../ui.ts';
import './details.css';
import './ux-reading.css';
import { capabilityTypeLabel, startsCapabilityTypeSection } from '../capabilityTypes';
import { examplesForNode } from '../examples';
import { NodeIcon } from '../icons';
import { childrenOf, relatedTo } from '../model';
import {
  behaviorAspect,
  behaviorAspectLabel,
  behaviorReadingGroups,
  requestOrigin,
  requestOrigins,
} from '../requestMetadata';
import { catalogOf, pathsForNode, scenariosForNode } from '../scenarioCatalog';
import { BusinessExamples } from './BusinessExamples';
import { BusinessPedagogy } from './BusinessPedagogy';
import {
  CatalogLink,
  DesignPrincipleLink,
  MethodLink,
  ModelText,
  ReferenceLink,
  useReadingVocabulary,
} from './ModelLinks';

const labels: Record<string, string> = {
  name: ui('businessSheet.libelle'),
  finality: ui('businessSheet.finalite'),
  definition: ui('businessSheet.definition'),
  scope: ui('businessSheet.perimetre'),
  nature: ui('businessSheet.nature'),
  independence: ui('businessSheet.independance'),
  mastership: ui('businessSheet.maitrise_des_informations'),
  decomposition_rationale: ui('businessSheet.pourquoi_decomposer_cette_capacite'),
  market_comparisons: ui('businessSheet.sources_d_inspiration'),
  label: ui('businessSheet.libelle'),
  verb: ui('businessSheet.verbe_de_relation'),
  meaning: ui('businessSheet.sens_metier'),
  role: ui('businessSheet.role'),
  conditions: ui('businessSheet.conditions'),
  effects: ui('businessSheet.effets'),
  state: ui('businessSheet.etat'),
  note: ui('businessSheet.reserve'),
  source_refs: ui('businessSheet.sources'),
  approved_fields: ui('businessSheet.champs_adoptes'),
  proposed_fields: ui('businessSheet.champs_proposes'),
  validated_fields: ui('businessSheet.champs_valides_dans_le_cycle'),
  recorded_by: ui('businessSheet.enregistre_par'),
  recorded_at: ui('businessSheet.date_d_enregistrement'),
  author: ui('businessSheet.auteur'),
  date: ui('businessSheet.date'),
};
function useFieldName() {
  const vocabulary = useReadingVocabulary();
  return (key: string) => vocabulary?.field_labels?.[key] ?? labels[key] ?? ui('common.field_unavailable');
}
function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
}
function keyedValues(values: readonly unknown[]) {
  const occurrences = new Map<string, number>();
  return values.map((item) => {
    const signature = JSON.stringify(item) ?? String(item);
    const occurrence = occurrences.get(signature) ?? 0;
    occurrences.set(signature, occurrence + 1);
    return { item, key: `${signature}:${occurrence}` };
  });
}

function Value({ value }: { value: unknown }): ReactNode {
  const fieldName = useFieldName();
  if (value === undefined || value === null || value === '')
    return <span className="detail-muted">{ui('businessSheet.non_renseigne')}</span>;
  if (Array.isArray(value))
    return value.length ? (
      <ul>
        {keyedValues(value).map(({ item, key }) => (
          <li key={key}>
            <Value value={item} />
          </li>
        ))}
      </ul>
    ) : (
      <span className="detail-muted">{ui('businessSheet.aucun_element_renseigne')}</span>
    );
  if (typeof value === 'object')
    return (
      <dl className="detail-values">
        {Object.entries(value).map(([key, item]) => (
          <div key={key}>
            <dt>{fieldName(key)}</dt>
            <dd>
              <Value value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <span className="detail-text">
      <ModelText
        text={publicText(
          typeof value === 'boolean' ? (value ? ui('businessSheet.oui') : ui('businessSheet.non')) : String(value),
        )}
      />
    </span>
  );
}
export function BusinessSheet({ model, node }: { model: PublishedModel; node: AtlasNode }) {
  const fieldName = useFieldName();
  const parents = model.relations.filter((r) => ['contains', 'presents'].includes(r.type) && r.targetId === node.id);
  const children = childrenOf(model, node.id);
  const behaviors = children.filter((child) => child.kind === 'behavior');
  const behaviorGroups = behaviorReadingGroups(behaviors);
  const origins = requestOrigins(node);
  const aspect = behaviorAspect(node);
  const otherChildren = children.filter((child) => child.kind !== 'behavior');
  const fields = businessFields(node.fields);
  const featuredExamples = resolvePedagogy(model, node).examples;
  const examples = examplesForNode(model, node).filter(
    (example) => !featuredExamples.some((featured) => featured.id === example.id),
  );
  const scenarios = scenariosForNode(model, node.id);
  const scenarioPaths = pathsForNode(model, node.id);
  const scenarioSection =
    !!catalogOf(model) && ['domain', 'area', 'business_area', 'capability', 'reference'].includes(node.kind);
  const relations = relatedTo(model, node.id);
  const [scopeSummary, ...scopeDetails] = (fields.scope || '').trim().split(/\n\s*\n/);
  const hasScmStudy = node.id === scmStudyDomainId;
  const { direct: principles, inherited: inheritedPrinciples } = principleGroupsForNode(model, node.id);
  const hasPrinciples = principles.length > 0 || inheritedPrinciples.length > 0;
  const sections = sheetSections(model, node);
  const jump = (field: string) => {
    const target = document.getElementById(`field-${node.id}-${field}`);
    if (target) revealSection(target);
  };
  const groups = [
    {
      label: ui('businessSheet.a_besoin_de'),
      items: relations.filter((r) => r.qualification.role === 'needs' && r.sourceId === node.id),
    },
    {
      label: ui('businessSheet.est_utilisee_par'),
      items: relations.filter((r) => r.qualification.role === 'needs' && r.targetId === node.id),
    },
    {
      label: ui('businessSheet.autres_interactions'),
      items: relations.filter((r) => r.qualification.role !== 'needs'),
    },
  ];
  return (
    <article
      key={node.id}
      className="business-sheet sheet"
      data-testid="business-sheet"
      aria-label={ui('businessSheet.fiche_metier_de', { name: node.name })}
    >
      {['capability', 'behavior'].includes(node.kind) && (
        <p>
          <MethodLink term={node.kind === 'capability' ? 'MOD015' : 'MOD006'}>
            {node.kind === 'capability'
              ? ui('businessSheet.qu_est_ce_qu_une_capacite')
              : ui('businessSheet.comprendre_les_comportements')}
          </MethodLink>
        </p>
      )}
      {node.kind === 'behavior' && (
        <p className="behavior-context">
          {ui('businessSheet.comportement_de')}{' '}
          <ReferenceLink target={parents[0].sourceId}>{model.nodeById.get(parents[0].sourceId)?.name}</ReferenceLink>
        </p>
      )}
      {sections.length > 0 && (
        <label className="sheet-mobile-toc">
          {ui('businessSheet.dans_cette_fiche')}
          <select aria-label={ui('businessSheet.dans_cette_fiche')} value="" onChange={(e) => jump(e.target.value)}>
            <option value="">{ui('businessSheet.aller_a_une_section')}</option>
            {sections.map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="sheet-main">
        {fields.finality && fields.finality !== fields.definition ? (
          <section id={`field-${node.id}-finality`} className="detail-finality">
            <h2>{ui('businessSheet.a_quoi_cela_sert')}</h2>
            <div className="business-copy">
              <Value value={fields.finality} />
            </div>
          </section>
        ) : (
          <span id={`field-${node.id}-finality`} />
        )}
        {origins.length > 0 && (
          <section className="sheet-request-origins" aria-label={ui('businessSheet.origines_possibles_de_la_demande')}>
            <h2>{ui('businessSheet.origines_possibles_de_la_demande')}</h2>
            <dl className="request-origin-list">
              {origins.map((origin) => (
                <div key={origin}>
                  <dt>
                    <span className={`request-origin-badge request-origin-${origin}`}>
                      {requestOrigin(node, origin).label}
                    </span>
                  </dt>
                  <dd>{requestOrigin(node, origin).description}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        <BusinessPedagogy model={model} node={node} />
        {pedagogyOf(node) ? (
          <details id={`field-${node.id}-definition`} className="sheet-definition">
            <summary>{ui('businessSheet.definition_de_reference')}</summary>
            <div className="business-copy">
              <Value value={fields.definition} />
            </div>
          </details>
        ) : (
          <section id={`field-${node.id}-definition`}>
            <h2>{ui('businessSheet.definition')}</h2>
            <div className="business-copy">
              <Value value={fields.definition} />
            </div>
          </section>
        )}
        {hasPrinciples && (
          <section id={`field-${node.id}-principles`} tabIndex={-1} className="sheet-principles">
            <h2>{ui('businessSheet.principes_expliquant_ce_perimetre')}</h2>
            {principles.length > 0 && (
              <ul>
                {principles.map((p) => (
                  <li key={p.id}>
                    <DesignPrincipleLink id={p.id}>{principleTitle(p)}</DesignPrincipleLink>
                  </li>
                ))}
              </ul>
            )}
            {inheritedPrinciples.length > 0 && (
              <details key={node.id} className="inherited-principles">
                <summary>
                  {ui('businessSheet.principes_herites')}
                  {inheritedPrinciples.length})
                </summary>
                <p>{ui('businessSheet.ces_principes_concernent_les_perimetres_qui_englobent_cette_fiche')}</p>
                <ul>
                  {inheritedPrinciples.map((p) => (
                    <li key={p.id}>
                      <DesignPrincipleLink id={p.id}>{principleTitle(p)}</DesignPrincipleLink>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )}
        {hasScmStudy && (
          <section id={`field-${node.id}-study`} tabIndex={-1} className="sheet-study">
            <h2>{ui('businessSheet.pour_approfondir')}</h2>
            <h3>{scmStudyFullTitle}</h3>
            <p>{scmStudyDescription}</p>
            <p className="detail-muted">
              {ui('businessSheet.pdf')}
              {scmStudyPages}
              {ui('businessSheet.pages')}
              {scmStudyDate} · {scmStudyAuthor}
            </p>
            <a className="sheet-study-download" href={scmStudyUrl} download={scmStudyFilename}>
              <Download size={17} aria-hidden="true" />
              {ui('businessSheet.telecharger_le_dossier_pdf')}
            </a>
            <p className="detail-muted">{scmStudyTemporalLabel}</p>
          </section>
        )}
        {parents.length > 0 && (
          <div className="sheet-parent">
            {parents.map((relation) => (
              <span key={relation.id}>
                {relation.type === 'presents' ? ui('businessSheet.presente_dans') : ui('businessSheet.rattache_a')}{' '}
                <ReferenceLink target={relation.sourceId}>
                  {model.nodeById.get(relation.sourceId)?.name || relation.sourceId}
                </ReferenceLink>
              </span>
            ))}
          </div>
        )}
        {otherChildren.length > 0 && (
          <section id={`field-${node.id}-children`} tabIndex={-1} className="sheet-children">
            <h2>
              {ui('businessSheet.explorer_ce_perimetre')}
              <span>{otherChildren.length}</span>
            </h2>
            <div className="detail-children-list">
              {otherChildren.map((child, index) => (
                <Fragment key={child.id}>
                  {startsCapabilityTypeSection(otherChildren, index) && (
                    <hr
                      className="capability-type-divider"
                      aria-label={ui('businessSheet.changement_de_type_de_capacite')}
                    />
                  )}
                  <ReferenceLink target={child.id}>
                    <NodeIcon node={child} size={22} />
                    <span>
                      <small>{kindLabel(child)}</small>
                      <strong>
                        {child.displayCode && <small className="reading-code">{child.displayCode} · </small>}
                        {child.name}
                      </strong>
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </ReferenceLink>
                </Fragment>
              ))}
            </div>
          </section>
        )}
        <BusinessExamples
          id={`field-${node.id}-illustrations`}
          examples={examples}
          illustrations={!!catalogOf(model)}
        />
        {fields.scope && (
          <section id={`field-${node.id}-scope`} tabIndex={-1} className="sheet-scope">
            <h2>{ui('businessSheet.perimetre')}</h2>
            <div className="business-copy sheet-scope-summary">
              <Value value={scopeSummary} />
            </div>
            {scopeDetails.length > 0 && (
              <div className="business-copy">
                <Value value={scopeDetails.join('\n\n')} />
              </div>
            )}
          </section>
        )}
        {(fields.nature || fields.data_governance || fields.mastership || fields.independence || aspect) && (
          <dl className="sheet-facts">
            {fields.data_governance && (
              <div>
                <dt>{ui('businessSheet.gouvernance_des_donnees')}</dt>
                <dd>{fields.data_governance}</dd>
              </div>
            )}
            {fields.nature && (
              <div>
                <dt>
                  {node.kind === 'behavior'
                    ? ui('businessSheet.type_de_comportement')
                    : ui('businessSheet.type_de_capacite')}
                </dt>
                <dd>{node.kind === 'behavior' ? behaviorTypeLabel(node) : capabilityTypeLabel(node)}</dd>
              </div>
            )}
            {aspect && (
              <div>
                <dt>{ui('businessSheet.angle_de_lecture')}</dt>
                <dd>{behaviorAspectLabel(node, aspect)}</dd>
              </div>
            )}
            {fields.mastership && (
              <div>
                <dt>{ui('businessSheet.autorite_sur_les_informations')}</dt>
                <dd>
                  <Value
                    value={
                      fields.mastership === 'external'
                        ? 'Informations de référence maîtrisées à l’extérieur de Supply.'
                        : fields.mastership
                    }
                  />
                </dd>
              </div>
            )}
            {fields.independence && (
              <div>
                <dt>{ui('businessSheet.autonomie')}</dt>
                <dd>
                  <Value value={fields.independence} />
                </dd>
              </div>
            )}
          </dl>
        )}
        {behaviors.length > 0 && (
          <section
            id={`field-${node.id}-behaviors`}
            tabIndex={-1}
            className="behavior-section"
            aria-label={ui('businessSheet.comportements_de_la_capacite')}
          >
            <h2>
              {ui('businessSheet.comportements')}
              <span>{behaviors.length}</span>
            </h2>
            {behaviorGroups.map((group) => (
              <div className="behavior-reading-group" key={group.key}>
                {group.label && <h3>{group.label}</h3>}
                <div className="behavior-list">
                  {group.behaviors.map((behavior) => (
                    <article className="behavior-summary" key={behavior.id} data-behavior-id={behavior.id}>
                      <h3>
                        <NodeIcon node={behavior} size={21} />
                        <span>
                          {behavior.displayCode && <small className="reading-code">{behavior.displayCode}</small>}
                          <ReferenceLink target={behavior.id}>{behavior.name}</ReferenceLink>
                          <small>{behaviorTypeLabel(behavior)}</small>
                        </span>
                      </h3>
                      <p>
                        <ModelText text={publicText(behavior.definition)} />
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
        <section id={`field-${node.id}-examples`} tabIndex={-1}>
          {(scenarioSection || scenarios.length > 0) && (
            <section id={`field-${node.id}-scenarios`} tabIndex={-1} className="scenario-links">
              <h2>{ui('businessSheet.scenarios_mobilisant_ce_perimetre')}</h2>
              {scenarios.length ? (
                <ul>
                  {scenarios.map((s) => (
                    <li key={s.id}>
                      <CatalogLink scenario={s.id} path={scenarioPaths.find((path) => path.scenario_id === s.id)?.id}>
                        {s.title}
                      </CatalogLink>
                      {scenarioPaths.some((path) => path.scenario_id === s.id) && (
                        <ul aria-label={ui('businessSheet.parcours_mobilisant_ce_perimetre', { title: s.title })}>
                          {scenarioPaths
                            .filter((path) => path.scenario_id === s.id)
                            .map((path) => (
                              <li key={path.id}>
                                <CatalogLink scenario={s.id} path={path.id}>
                                  {path.title}
                                </CatalogLink>
                              </li>
                            ))}
                        </ul>
                      )}
                      {catalogOf(model)
                        ?.legacy_links.filter((a) => a.owner_id === node.id && a.scenario_id === s.id && a.contribution)
                        .map((a) => (
                          <p key={`${a.owner_id}:${a.scenario_id}:${a.contribution}`}>
                            <ModelText text={a.contribution ?? ''} />
                          </p>
                        ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{ui('businessSheet.aucun_scenario_documente_pour_ce_perimetre')}</p>
              )}
            </section>
          )}
        </section>
        {relations.length > 0 && (
          <section id={`field-${node.id}-interactions`} tabIndex={-1} className="sheet-interactions">
            <h2>
              {ui('businessSheet.responsabilites_liees')}
              <span>{relations.length}</span>
            </h2>
            <div className="interaction-groups">
              {groups
                .filter((group) => group.items.length)
                .map((group) => (
                  <div key={group.label}>
                    <h3>{group.label}</h3>
                    {[...new Set(group.items.map((r) => (r.sourceId === node.id ? r.targetId : r.sourceId)))].map(
                      (other) => (
                        <article className="interaction-item" key={other}>
                          <h4>
                            <ReferenceLink target={other}>{model.nodeById.get(other)?.name || other}</ReferenceLink>
                          </h4>
                          {group.items
                            .filter((r) => (r.sourceId === node.id ? r.targetId : r.sourceId) === other)
                            .map((relation) => (
                              <div className="interaction-meaning" key={relation.id} data-relation-id={relation.id}>
                                <Value value={relation.qualification.meaning || relation.label} />
                                {Object.entries(businessQualification(relation.qualification))
                                  .filter(([key]) => !['meaning', 'role'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key}>
                                      <h5>{fieldName(key)}</h5>
                                      <Value value={value} />
                                    </div>
                                  ))}
                              </div>
                            ))}
                        </article>
                      ),
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export function RelationDetails({ model, relation }: { model: PublishedModel; relation: AtlasRelation }) {
  const fieldName = useFieldName();
  const principles = principlesForRelation(model, relation.id);
  const fields = Object.entries(businessFields(relation.fields)).filter(
    ([key, value]) => key !== 'name' && hasValue(value),
  );
  const qualifications = Object.entries(businessQualification(relation.qualification)).filter(
    ([key, value]) => key !== 'meaning' && hasValue(value),
  );
  return (
    <section
      className="relation-inspector relation-details"
      data-testid="relation-inspector"
      aria-label={ui('businessSheet.relation_entre_et', {
        value1: model.nodeById.get(relation.sourceId)?.name || ui('businessSheet.le_perimetre_source'),
        value2: model.nodeById.get(relation.targetId)?.name || ui('businessSheet.le_perimetre_destinataire'),
      })}
    >
      <div className="section-kicker">
        <GitBranch size={16} aria-hidden="true" />
        {ui('businessSheet.comprendre_la_relation')}
      </div>
      <div className="relation-endpoints">
        <ReferenceLink target={relation.sourceId}>
          {model.nodeById.get(relation.sourceId)?.name || relation.sourceId}
        </ReferenceLink>
        <ArrowRight size={21} aria-label={ui('businessSheet.vers')} />
        <ReferenceLink target={relation.targetId}>
          {model.nodeById.get(relation.targetId)?.name || relation.targetId}
        </ReferenceLink>
      </div>
      <p className="relation-meaning">
        <ModelText text={publicText(relation.qualification.meaning || relation.label)} />
      </p>
      {principles.length > 0 && (
        <section className="sheet-principles">
          <h2>{ui('businessSheet.principes_expliquant_cette_relation')}</h2>
          <ul>
            {principles.map((p) => (
              <li key={p.id}>
                <DesignPrincipleLink id={p.id}>{principleTitle(p)}</DesignPrincipleLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="relation-description">
        {relation.dataExchange && (
          <section>
            <h2>{ui('businessSheet.finalite_du_partage')}</h2>
            <Value value={relation.dataExchange.purpose} />
          </section>
        )}
        {qualifications.map(([key, value]) => (
          <section key={key}>
            <h2>{fieldName(key)}</h2>
            <Value value={key === 'role' && value === 'needs' ? 'A besoin de' : value} />
          </section>
        ))}
        {fields.map(([key, value]) => (
          <section key={key}>
            <h2>{fieldName(key)}</h2>
            <Value value={value} />
          </section>
        ))}
      </div>
    </section>
  );
}
