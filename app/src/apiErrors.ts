import messages from '../locales/fr/server.json' with { type: 'json' };
import { formatMessage } from './formatMessage.ts';
import { ui } from './ui.ts';

export function apiErrorMessage(value: { code?: unknown; parameters?: unknown; error?: unknown }): string {
  if (typeof value.code === 'string' && Object.hasOwn(messages, value.code)) {
    const parameters = value.parameters && typeof value.parameters === 'object' ? value.parameters : {};
    return formatMessage(messages[value.code as keyof typeof messages], parameters as Record<string, unknown>);
  }
  // Compatibility with a local server running the previous API contract.
  return typeof value.error === 'string' ? value.error : ui('errors.server_unavailable');
}
