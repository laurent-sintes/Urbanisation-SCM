import type { ModelingGuide } from '../modelingGuide';
import { activeMethod, methodEntries } from '../methodNavigation';
import { MethodLink } from './ModelLinks';

export function MethodNavigation({ guide, selected, onSelect }: { guide?: ModelingGuide; selected?: string; onSelect: (id: string) => void }) {
  const entries = methodEntries(guide);
  return <>{['Parcours de lecture', 'Ressources'].map(group => <div className="method-nav-group" key={group}><strong>{group}</strong>{entries.filter(item => item.group === group).map(item => item.id === 'glossary'
    ? <MethodLink key={item.id} index>{item.title}</MethodLink>
    : <button key={item.id} aria-current={activeMethod(guide, selected) === item.id ? 'page' : undefined} onClick={() => onSelect(item.id)}>{item.title}</button>)}</div>)}</>;
}
