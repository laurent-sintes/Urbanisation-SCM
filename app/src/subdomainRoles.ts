import type { AtlasNode } from './types.ts';

export interface SubdomainRole {
  id: string;
  display_name: string;
}
export function roleOf(node: AtlasNode): SubdomainRole | undefined {
  const value = node.fields.dominant_role;
  if (node.kind !== 'area' || !value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const role = value as Record<string, unknown>;
  return typeof role.id === 'string' &&
    /^[a-z][a-z0-9-]*$/.test(role.id) &&
    typeof role.display_name === 'string' &&
    role.display_name.trim()
    ? { id: role.id, display_name: role.display_name }
    : undefined;
}
