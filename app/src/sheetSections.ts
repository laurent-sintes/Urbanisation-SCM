import { businessFields } from './businessContent.ts';
import { principleGroupsForNode } from './designPrinciples.ts';
import { examplesForNode } from './examples.ts';
import { childrenOf, relatedTo } from './model.ts';
import { pedagogyOf, resolvePedagogy } from './pedagogy.ts';
import { catalogOf, scenariosForNode } from './scenarioCatalog.ts';
import { scmStudyDomainId } from './scmStudy.ts';
import type { AtlasNode, PublishedModel } from './types.ts';
import { ui } from './ui.ts';

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
    [!!fields.finality && fields.finality !== fields.definition, 'finality', ui('sheetSections.a_quoi_cela_sert')],
    [!!pedagogyOf(node), 'pedagogical_description', ui('sheetSections.comprendre_ce_perimetre')],
    [true, 'definition', ui('sheetSections.definition')],
    [direct.length + inherited.length > 0, 'principles', ui('sheetSections.principes_directeurs')],
    [node.id === scmStudyDomainId, 'study', ui('sheetSections.pour_approfondir')],
    [children.some((child) => child.kind !== 'behavior'), 'children', ui('sheetSections.explorer_ce_perimetre')],
    [
      examples.length > 0,
      'illustrations',
      catalogOf(model) ? ui('sheetSections.illustrations_metier') : ui('sheetSections.scenarios_metier'),
    ],
    [!!fields.scope, 'scope', ui('sheetSections.perimetre')],
    [children.some((child) => child.kind === 'behavior'), 'behaviors', ui('sheetSections.comportements')],
    [
      scenarioSection || scenariosForNode(model, node.id).length > 0,
      'scenarios',
      ui('sheetSections.scenarios_mobilises'),
    ],
    [relatedTo(model, node.id).length > 0, 'interactions', ui('sheetSections.responsabilites_liees')],
  ];
  return entries.filter(([visible]) => visible).map(([, id, label]) => [id, label]);
}
