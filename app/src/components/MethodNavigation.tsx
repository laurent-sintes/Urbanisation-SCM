import { activeMethod, methodEntries } from '../methodNavigation';
import type { ModelingGuide } from '../modelingGuide';
import { ui } from '../ui.ts';
import { MethodLink } from './ModelLinks';

export function MethodNavigation({
  guide,
  selected,
  onSelect,
  compact = false,
  resourcesOnly = false,
}: {
  guide?: ModelingGuide;
  selected?: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  resourcesOnly?: boolean;
}) {
  const entries = methodEntries(guide);
  if (compact)
    return (
      <div className="method-compact-navigation">
        <label>
          {ui('methodNavigation.rubrique')}
          <select
            aria-label={ui('methodNavigation.rubrique_de_la_methode')}
            value={activeMethod(guide, selected)}
            onChange={(event) => onSelect(event.target.value)}
          >
            {[ui('methodNavigation.parcours_de_lecture'), ui('methodNavigation.ressources')].map((group) => (
              <optgroup label={group} key={group}>
                {entries
                  .filter((item) => item.group === group && item.id !== 'glossary')
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <MethodLink index>{entries.find((item) => item.id === 'glossary')?.title}</MethodLink>
      </div>
    );
  return (
    <>
      {(resourcesOnly
        ? [ui('methodNavigation.ressources')]
        : [ui('methodNavigation.parcours_de_lecture'), ui('methodNavigation.ressources')]
      ).map((group) => (
        <div className="method-nav-group" key={group}>
          <strong>{group}</strong>
          {entries
            .filter((item) => item.group === group)
            .map((item) =>
              item.id === 'glossary' ? (
                <MethodLink key={item.id} index>
                  {item.title}
                </MethodLink>
              ) : (
                <button
                  type="button"
                  key={item.id}
                  aria-current={activeMethod(guide, selected) === item.id ? 'page' : undefined}
                  onClick={() => onSelect(item.id)}
                >
                  {item.title}
                </button>
              ),
            )}
        </div>
      ))}
    </>
  );
}
