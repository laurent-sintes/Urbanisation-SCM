import { businessFields } from './businessContent.ts';
import { principleGroupsForNode } from './designPrinciples.ts';
import { examplesForNode } from './examples.ts';
import { childrenOf, relatedTo } from './model.ts';
import { pedagogyOf, resolvePedagogy } from './pedagogy.ts';
import { catalogOf, scenariosForNode } from './scenarioCatalog.ts';
import { scmStudyDomainId } from './scmStudy.ts';
import type { AtlasNode, PublishedModel } from './types.ts';

export function sheetSections(model: PublishedModel, node: AtlasNode): [string, string][] {
  const fields = businessFields(node.fields);
  const children = childrenOf(model, node.id);
  const pedagogy = resolvePedagogy(model, node);
  const examples = examplesForNode(model, node).filter(
    (example) => !pedagogy.examples.some((item) => item.id === example.id),
  );
  const { direct, inherited } = principleGroupsForNode(model, node.id);
  const scenarioSection =
    !!catalogOf(model) && ['domain', 'area', 'business_area', 'capability', 'reference'].includes(node.kind);
  const entries: [boolean, string, string][] = [
    [!!fields.finality && fields.finality !== fields.definition, 'finality', 'À quoi cela sert'],
    [!!pedagogyOf(node), 'pedagogical_description', 'Comprendre ce périmètre'],
    [true, 'definition', 'Définition'],
    [direct.length + inherited.length > 0, 'principles', 'Principes directeurs'],
    [node.id === scmStudyDomainId, 'study', 'Pour approfondir'],
    [children.some((child) => child.kind !== 'behavior'), 'children', 'Explorer ce périmètre'],
    [examples.length > 0, 'illustrations', catalogOf(model) ? 'Illustrations métier' : 'Scénarios métier'],
    [!!fields.scope, 'scope', 'Périmètre'],
    [children.some((child) => child.kind === 'behavior'), 'behaviors', 'Comportements'],
    [scenarioSection || scenariosForNode(model, node.id).length > 0, 'scenarios', 'Scénarios mobilisés'],
    [relatedTo(model, node.id).length > 0, 'interactions', 'Responsabilités liées'],
  ];
  return entries.filter(([visible]) => visible).map(([, id, label]) => [id, label]);
}
