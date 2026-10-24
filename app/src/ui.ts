import core from '../locales/fr/core.json' with { type: 'json' };
import interfaceMessages from '../locales/fr/ui.json' with { type: 'json' };
import { formatMessage } from './formatMessage.ts';
import type { UiArguments } from './ui-schema.d.ts';

const messages = { ...core, ...interfaceMessages };
export type UiKey = keyof typeof messages;

/** Text resources are plain strings; React remains responsible for escaping. */
export function ui<K extends UiKey>(
  key: K,
  ...args: keyof UiArguments[K] extends never ? [] : [parameters: UiArguments[K]]
): string {
  return formatMessage(messages[key], (args[0] ?? {}) as Record<string, unknown>);
}
