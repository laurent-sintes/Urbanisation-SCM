import type { ModelingGuide } from './modelingGuide';
import { ui } from './ui.ts';

export const isTransformationGuide = (guide?: ModelingGuide) => !!guide?.chapters?.some((c) => c.id === 'explore');
export function methodEntries(guide?: ModelingGuide) {
  return [
    ...(isTransformationGuide(guide)
      ? [
          {
            id: 'home',
            title: ui('methodNavigation.accueil_de_la_demarche'),
            group: ui('methodNavigation.parcours_de_lecture'),
          },
        ]
      : []),
    ...(guide?.chapters ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      group: ['metamodel', 'method', 'references'].includes(c.id)
        ? ui('methodNavigation.ressources')
        : ui('methodNavigation.parcours_de_lecture'),
    })),
    { id: 'codes', title: ui('methodNavigation.codes_et_identifiants'), group: ui('methodNavigation.ressources') },
    {
      id: 'glossary',
      title:
        guide?.id === 'flow-atlas-metamodel'
          ? ui('methodNavigation.glossaire_du_metamodele')
          : isTransformationGuide(guide)
            ? ui('methodNavigation.glossaire_de_transformation')
            : ui('methodNavigation.glossaire_methodologique'),
      group: ui('methodNavigation.ressources'),
    },
  ];
}
export function activeMethod(guide?: ModelingGuide, selected?: string) {
  return guide?.lessons.some((l) => l.id === selected)
    ? 'metamodel'
    : selected ||
        (guide?.id === 'flow-atlas-metamodel' ? 'metamodel' : isTransformationGuide(guide) ? 'home' : 'start');
}
