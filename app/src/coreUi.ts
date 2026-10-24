import messages from '../locales/fr/core.json' with { type: 'json' };
import { formatMessage } from './formatMessage.ts';
import type { UiArguments } from './ui-schema.d.ts';

/** Small catalog shared by publication, search and map computations, including workers. */
export function ui<K extends keyof typeof messages>(
  key: K,
  ...args: keyof UiArguments[K] extends never ? [] : [parameters: UiArguments[K]]
): string {
  return formatMessage(messages[key], (args[0] ?? {}) as Record<string, unknown>);
}
