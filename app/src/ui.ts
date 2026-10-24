import messages from '../locales/fr/ui.json' with { type: 'json' };
import type { UiArguments } from './ui-schema.d.ts';

export type UiKey = keyof UiArguments;
export function hasUiKey(key: string): key is UiKey {
  return Object.hasOwn(messages, key);
}

export function apiErrorMessage(value: { code?: unknown; parameters?: unknown; error?: unknown }): string {
  if (typeof value.code === 'string' && hasUiKey(value.code)) {
    const parameters = value.parameters && typeof value.parameters === 'object' ? value.parameters : {};
    return formatMessage(value.code, parameters as Record<string, unknown>);
  }
  // Compatibility with a local server running the previous API contract.
  return typeof value.error === 'string' ? value.error : ui('errors.server_unavailable');
}

/** Text resources are plain strings; React remains responsible for escaping. */
export function ui<K extends UiKey>(
  key: K,
  ...args: keyof UiArguments[K] extends never ? [] : [parameters: UiArguments[K]]
): string {
  return formatMessage(key, (args[0] ?? {}) as Record<string, unknown>);
}

function formatMessage(key: UiKey, parameters: Record<string, unknown>): string {
  const resource = messages[key];
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
