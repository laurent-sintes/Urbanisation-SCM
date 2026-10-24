type Resource = string | { one: string; other: string };

/** Format plain text without importing any catalog. React escapes the result. */
export function formatMessage(resource: Resource | undefined, parameters: Record<string, unknown>): string {
  if (resource === undefined || resource === null) throw new Error('ui.missingResource');
  if (typeof resource === 'object' && (typeof parameters.count !== 'number' || !Number.isFinite(parameters.count)))
    throw new Error('ui.invalidCount');
  const category =
    typeof resource === 'object' ? new Intl.PluralRules('fr').select(parameters.count as number) : undefined;
  const template = typeof resource === 'string' ? resource : resource[category === 'one' ? 'one' : 'other'];
  if (typeof template !== 'string') throw new Error('ui.missingResource');
  return template.replace(/\{\{|\}\}|\{([\w$]+)\}/g, (match, parameter: string | undefined) => {
    if (!parameter) return match === '{{' ? '{' : '}';
    if (!Object.hasOwn(parameters, parameter)) throw new Error('ui.missingParameter');
    return String(parameters[parameter]);
  });
}
