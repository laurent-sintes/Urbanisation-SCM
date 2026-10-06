import { behaviorTypeLabel } from '../behaviorTypes';
import { publicText } from '../publicText';
import { revealSection } from '../readerNavigation';
import { ArrowRight, ArrowUpRight, GitBranch } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import type { AtlasNode, AtlasRelation, PublishedModel } from '../types';
import { businessFields, businessQualification } from '../businessContent';
import { kindLabel } from '../presentation';
import './details.css';
import './ux-reading.css';
import { ModelText, ReferenceLink, MethodLink } from './ModelLinks';
import { NodeIcon } from '../icons';
import { childrenOf, relatedTo } from '../model';
import { capabilityTypeLabel, startsCapabilityTypeSection } from '../capabilityTypes';
import { scenariosForNode, catalogOf } from '../scenarioCatalog';
import { CatalogLink } from './ModelLinks';
import { examplesForNode } from '../examples';
import { BusinessExamples } from './BusinessExamples';
import { behaviorAspect, behaviorAspectLabels, behaviorReadingGroups, requestOrigins, requestOriginLabels } from '../requestMetadata';

const labels: Record<string, string> = {
  name: 'Libellé', finality: 'Finalité', definition: 'Définition', scope: 'Périmètre',
  nature: 'Nature', independence: 'Indépendance', mastership: 'Maîtrise des informations',
  decomposition_rationale: 'Pourquoi décomposer cette capacité',
  market_comparisons: 'Sources d’inspiration',
  label: 'Libellé', verb: 'Verbe de relation', meaning: 'Sens métier', role: 'Rôle',
  conditions: 'Conditions', effects: 'Effets', state: 'État', note: 'Réserve',
  source_refs: 'Sources', approved_fields: 'Champs adoptés', proposed_fields: 'Champs proposés',
  validated_fields: 'Champs validés dans le cycle', recorded_by: 'Enregistré par',
  recorded_at: 'Date d’enregistrement', author: 'Auteur', date: 'Date',
};
const fieldName = (key: string) => labels[key] || key;
function hasValue(value: unknown) { return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0); }
function Value({ value }: { value: unknown }): ReactNode {
  if (value === undefined || value === null || value === '') return <span className="detail-muted">Non renseigné.</span>;
  if (Array.isArray(value)) return value.length ? <ul>{value.map((item, i) => <li key={i}><Value value={item}/></li>)}</ul> : <span className="detail-muted">Aucun élément renseigné.</span>;
  if (typeof value === 'object') return <dl className="detail-values">{Object.entries(value).map(([key, item]) => <div key={key}><dt>{fieldName(key)}</dt><dd><Value value={item}/></dd></div>)}</dl>;
  return <span className="detail-text"><ModelText text={publicText(typeof value === 'boolean' ? value ? 'Oui' : 'Non' : String(value))}/></span>;
}
export function BusinessSheet({ model, node }: { model: PublishedModel; node: AtlasNode; onShowMarket: () => void }) {
  const parents = model.relations.filter(r => ['contains', 'presents'].includes(r.type) && r.targetId === node.id);
  const children = childrenOf(model, node.id);
  const behaviors = children.filter(child => child.kind === 'behavior');
  const behaviorGroups = behaviorReadingGroups(behaviors);
  const origins = requestOrigins(node);
  const aspect = behaviorAspect(node);
  const otherChildren = children.filter(child => child.kind !== 'behavior');
  const fields = businessFields(node.fields);
  const examples = examplesForNode(model, node);
  const scenarios = scenariosForNode(model,node.id);
  const scenarioSection = !!catalogOf(model) && ['domain', 'area', 'business_area', 'capability'].includes(node.kind);
  const relations = relatedTo(model, node.id);
  const [scopeSummary, ...scopeDetails] = (fields.scope || '').trim().split(/\n\s*\n/);
  const sections = [examples.length > 0 && ['illustrations', catalogOf(model) ? 'Illustrations métier' : 'Scénarios métier'], otherChildren.length > 0 && ['children','Explorer ce périmètre'], fields.scope && ['scope','Périmètre'], behaviors.length > 0 && ['behaviors','Comportements'], (scenarioSection || scenarios.length > 0) && ['scenarios','Scénarios mobilisant ce périmètre'], relations.length > 0 && ['interactions','Responsabilités liées']].filter(Boolean) as string[][];
  const jump = (field: string) => {
    const target = document.getElementById(`field-${node.id}-${field}`);
    if (target) revealSection(target);
  };
  const groups = [
    { label: 'A besoin de', items: relations.filter(r => r.qualification.role === 'needs' && r.sourceId === node.id) },
    { label: 'Est utilisée par', items: relations.filter(r => r.qualification.role === 'needs' && r.targetId === node.id) },
    { label: 'Autres interactions', items: relations.filter(r => r.qualification.role !== 'needs') },
  ];
  return <article key={node.id} className="business-sheet sheet" data-testid="business-sheet" aria-label={`Fiche métier de ${node.name}`}>
    {['capability', 'behavior'].includes(node.kind) && <p><MethodLink term={node.kind === 'capability' ? 'MOD015' : 'MOD006'}>{node.kind === 'capability' ? 'Qu’est-ce qu’une capacité ?' : 'Comprendre les comportements'}</MethodLink></p>}
    {node.kind === 'behavior' && <p className="behavior-context">Comportement de <ReferenceLink target={parents[0].sourceId}>{model.nodeById.get(parents[0].sourceId)?.name}</ReferenceLink> · Dernier niveau de détail</p>}
    {sections.length > 0 && <label className="sheet-mobile-toc">Dans cette fiche<select aria-label="Dans cette fiche" value="" onChange={e => jump(e.target.value)}><option value="">Aller à une section…</option>{sections.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>}
    {sections.length > 0 && <nav className="sheet-toc" aria-label="Dans cette fiche">{sections.map(([id, label]) => <button key={id} onClick={() => jump(id)}>{label}</button>)}</nav>}
    <div className="sheet-main">
      {fields.finality && fields.finality !== fields.definition ? <section id={`field-${node.id}-finality`} className="detail-finality"><h2>À quoi cela sert</h2><div className="business-copy"><Value value={fields.finality}/></div></section> : <span id={`field-${node.id}-finality`}/>}
      {origins.length > 0 && <section className="sheet-request-origins" aria-label="Origines possibles de la demande">
        <h2>Origines possibles de la demande</h2>
        <dl className="request-origin-list">{origins.map(origin => <div key={origin}>
          <dt><span className={`request-origin-badge request-origin-${origin}`}>{requestOriginLabels[origin].label}</span></dt>
          <dd>{requestOriginLabels[origin].description}</dd>
        </div>)}</dl>
      </section>}
      <section id={`field-${node.id}-definition`}><h2>Définition</h2><div className="business-copy"><Value value={fields.definition}/></div></section>
      {parents.length > 0 && <div className="sheet-parent">{parents.map(relation => <span key={relation.id}>{relation.type === 'presents' ? 'Présenté dans' : 'Rattaché à'} <ReferenceLink target={relation.sourceId}>{model.nodeById.get(relation.sourceId)?.name || relation.sourceId}</ReferenceLink></span>)}</div>}
    {otherChildren.length > 0 && <section id={`field-${node.id}-children`} tabIndex={-1} className="sheet-children"><h2>Explorer ce périmètre <span>{otherChildren.length}</span></h2><div className="detail-children-list">{otherChildren.map((child, index) => <Fragment key={child.id}>{startsCapabilityTypeSection(otherChildren, index) && <hr className="capability-type-divider" aria-label="Changement de type de capacité"/>}<ReferenceLink target={child.id}><NodeIcon node={child} size={22}/><span><small>{kindLabel(child)}</small><strong>{child.displayCode && <small className="reading-code">{child.displayCode} · </small>}{child.name}</strong></span><ArrowRight size={18} aria-hidden="true"/></ReferenceLink></Fragment>)}</div></section>}
      <BusinessExamples id={`field-${node.id}-illustrations`} examples={examples} illustrations={!!catalogOf(model)}/>
      {fields.scope && <section id={`field-${node.id}-scope`} tabIndex={-1} className="sheet-scope"><h2>Périmètre</h2>
        <div className="business-copy sheet-scope-summary"><Value value={scopeSummary}/></div>
        {scopeDetails.length > 0 && <div className="business-copy"><Value value={scopeDetails.join('\n\n')}/></div>}
      </section>}
      {(fields.nature || fields.data_governance || fields.mastership || fields.independence || aspect) && <dl className="sheet-facts">
        {fields.data_governance && <div><dt>Gouvernance des données</dt><dd>{fields.data_governance}</dd></div>}
        {fields.nature && <div><dt>{node.kind === 'behavior' ? 'Type de comportement' : 'Type de capacité'}</dt><dd>{node.kind === 'behavior' ? behaviorTypeLabel(node) : capabilityTypeLabel(node)}</dd></div>}
        {aspect && <div><dt>Angle de lecture</dt><dd>{behaviorAspectLabels[aspect]}</dd></div>}
        {fields.mastership && <div><dt>Autorité sur les informations</dt><dd><Value value={fields.mastership === 'external' ? 'Informations de référence maîtrisées à l’extérieur de Supply.' : fields.mastership}/></dd></div>}
        {fields.independence && <div><dt>Autonomie</dt><dd><Value value={fields.independence}/></dd></div>}
      </dl>}
      {behaviors.length > 0 && <section id={`field-${node.id}-behaviors`} tabIndex={-1} className="behavior-section" aria-label="Comportements de la capacité">
        <h2>Comportements <span>{behaviors.length}</span></h2>
        {behaviorGroups.map(group => <div className="behavior-reading-group" key={group.key}>
          {group.label && <h3>{group.label}</h3>}
          <div className="behavior-list">{group.behaviors.map(behavior => <article className="behavior-summary" key={behavior.id} data-behavior-id={behavior.id}>
            <h3><NodeIcon node={behavior} size={21}/><span>{behavior.displayCode && <small className="reading-code">{behavior.displayCode}</small>}<ReferenceLink target={behavior.id}>{behavior.name}</ReferenceLink><small>{behaviorTypeLabel(behavior)}</small></span></h3>
            <p><ModelText text={publicText(behavior.definition)}/></p>
          </article>)}</div>
        </div>)}
      </section>}
      <section id={`field-${node.id}-examples`} tabIndex={-1}>
        {(scenarioSection || scenarios.length > 0) && <section id={`field-${node.id}-scenarios`} tabIndex={-1} className="scenario-links"><h2>Scénarios mobilisant ce périmètre</h2>{scenarios.length ? <ul>{scenarios.map(s=><li key={s.id}><CatalogLink scenario={s.id}>{s.title}</CatalogLink>{catalogOf(model)?.legacy_links.filter(a=>a.owner_id===node.id && a.scenario_id===s.id && a.contribution).map((a,i)=><p key={i}><ModelText text={a.contribution!}/></p>)}</li>)}</ul> : <p>Aucun scénario documenté pour ce périmètre.</p>}</section>}

      </section>
      {relations.length > 0 && <section id={`field-${node.id}-interactions`} tabIndex={-1} className="sheet-interactions"><h2>Responsabilités liées <span>{relations.length}</span></h2><div className="interaction-groups">{groups.filter(group => group.items.length).map(group => <div key={group.label}><h3>{group.label}</h3>{[...new Set(group.items.map(r => r.sourceId === node.id ? r.targetId : r.sourceId))].map(other => <article className="interaction-item" key={other}>
        <h4><ReferenceLink target={other}>{model.nodeById.get(other)?.name || other}</ReferenceLink></h4>
        {group.items.filter(r => (r.sourceId === node.id ? r.targetId : r.sourceId) === other).map(relation => <div className="interaction-meaning" key={relation.id} data-relation-id={relation.id}><Value value={relation.qualification.meaning || relation.label}/>{Object.entries(businessQualification(relation.qualification)).filter(([key]) => !['meaning', 'role'].includes(key)).map(([key, value]) => <div key={key}><h5>{fieldName(key)}</h5><Value value={value}/></div>)}</div>)}
      </article>)}</div>)}</div></section>}
    </div>

  </article>;
}

export function RelationDetails({ model, relation }: { model: PublishedModel; relation: AtlasRelation }) {
  const fields = Object.entries(businessFields(relation.fields)).filter(([key, value]) => key !== 'name' && hasValue(value));
  const qualifications = Object.entries(businessQualification(relation.qualification)).filter(([key, value]) => key !== 'meaning' && hasValue(value));
  return <section className="relation-inspector relation-details" data-testid="relation-inspector" aria-label={`Détail de la relation ${relation.id}`}>
    <div className="section-kicker"><GitBranch size={16} aria-hidden="true"/>Comprendre la relation <span className="detail-identifiers">{relation.id}</span></div>
    <div className="relation-endpoints"><ReferenceLink target={relation.sourceId}>{model.nodeById.get(relation.sourceId)?.name || relation.sourceId}</ReferenceLink><ArrowRight size={21} aria-label="vers"/><ReferenceLink target={relation.targetId}>{model.nodeById.get(relation.targetId)?.name || relation.targetId}</ReferenceLink></div>
    <p className="relation-meaning"><ModelText text={publicText(relation.qualification.meaning || relation.label)}/></p>
    <div className="relation-description">{qualifications.map(([key, value]) => <section key={key}><h2>{fieldName(key)}</h2><Value value={key === 'role' && value === 'needs' ? 'A besoin de' : value}/></section>)}{fields.map(([key, value]) => <section key={key}><h2>{fieldName(key)}</h2><Value value={value}/></section>)}</div>
  </section>;
}
