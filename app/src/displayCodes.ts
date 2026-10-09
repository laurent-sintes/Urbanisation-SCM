import type { RawPublication } from './types.ts';

/** Frozen order belongs to the snapshot, never to search/filter/layout state. */
export function validateDisplayIndex(raw: RawPublication): void {
  const index = raw.display_index;
  if (!raw.display_policy && !index) return;
  function fail(): never {
    throw new Error('Codes de lecture ou ordre de publication invalides.');
  }
  if (
    raw.display_policy !== 'typed-tree-v1' ||
    !index ||
    index.policy !== raw.display_policy ||
    !Array.isArray(index.roots) ||
    !index.children ||
    !index.codes
  )
    fail();
  const nodes = new Map(raw.nodes.map((node) => [node.id, node]));
  const prefixes: Record<string, string> = {
    universe: 'UNI',
    business_system: 'SYS',
    domain: 'DOM',
    area: 'SUB',
    business_area: 'BA',
    reference: 'REF',
    capability: 'CAP',
    behavior: 'BHV',
  };
  const links = raw.relations.filter((r) => ['contains', 'presents'].includes(r.type));
  const expectedRoots = raw.nodes.filter((n) => !links.some((r) => r.target_id === n.id)).map((n) => n.id);
  const same = (a: string[], b: string[]) =>
    a.length === b.length && [...a].sort().every((id, i) => id === [...b].sort()[i]);
  if (!same(index.roots, expectedRoots) || !same(Object.keys(index.children), [...nodes.keys()])) fail();
  const visited = new Set<string>(),
    codes = new Set<string>(),
    counts: Record<string, number> = {};
  const visit = (id: string) => {
    const node = nodes.get(id);
    if (!node || visited.has(id)) fail();
    visited.add(id);
    const children = index.children[id];
    if (
      !Array.isArray(children) ||
      !same(
        children,
        links.filter((r) => r.source_id === id).map((r) => r.target_id),
      )
    )
      fail();
    const prefix = prefixes[node.kind];
    if (prefix) {
      counts[prefix] = (counts[prefix] ?? 0) + 1;
      const code = `${prefix}-${String(counts[prefix]).padStart(3, '0')}`;
      if (index.codes[id] !== code || codes.has(code)) fail();
      codes.add(code);
    } else if (Object.hasOwn(index.codes, id)) fail();
    children.forEach(visit);
  };
  index.roots.forEach(visit);
  if (visited.size !== nodes.size || Object.keys(index.codes).length !== codes.size) fail();
}
