import type { ModelingGuide } from './modelingGuide';

export const isTransformationGuide = (guide?: ModelingGuide) => !!guide?.chapters?.some(c => c.id === 'explore');
export function methodEntries(guide?: ModelingGuide) {
  return [
    ...(isTransformationGuide(guide) ? [{ id: 'home', title: 'Accueil de la démarche', group: 'Parcours de lecture' }] : []),
    ...(guide?.chapters ?? []).map(c => ({ id: c.id, title: c.title, group: ['metamodel', 'method', 'references'].includes(c.id) ? 'Ressources' : 'Parcours de lecture' })),
    { id: 'codes', title: 'Codes et identifiants', group: 'Ressources' },
    { id: 'glossary', title: 'Glossaire méthodologique', group: 'Ressources' },
  ];
}
export function activeMethod(guide?: ModelingGuide, selected?: string) {
  return guide?.lessons.some(l => l.id === selected) ? 'metamodel' : selected || (isTransformationGuide(guide) ? 'home' : 'start');
}
