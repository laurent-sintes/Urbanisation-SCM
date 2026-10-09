import { childrenOf, descendantsOf } from './model.ts';
import type { AtlasNode, PublishedModel } from './types.ts';

export interface StructuralMap {
  nodes: AtlasNode[];
  group?: AtlasNode;
}

export function mapDepthLimit(model: PublishedModel, scopeId?: string): number {
  const scope = model.nodeById.get(scopeId || '');
  if (!scope || !['business_system', 'domain'].includes(scope.kind)) return 0;
  const direct = childrenOf(model, scope.id);
  if (direct.some(node => node.kind !== (scope.kind === 'domain' ? 'area' : 'domain'))) return 0;
  const descendants = descendantsOf(model, scope.id);
  if (scope.kind === 'business_system' && !descendants.some(node => node.kind === 'area')) return 0;
  if (descendants.some(node => node.kind === 'behavior')) return 4;
  if (descendants.some(node => ['capability', 'reference'].includes(node.kind))) return 3;
  if (descendants.some(node => node.kind === 'business_area')) return 2;
  return descendants.some(node => node.kind === 'area') ? 1 : 0;
}

export function structuralMap(model: PublishedModel, scopeId: string | undefined, detail: number): StructuralMap | undefined {
  const scope = model.nodeById.get(scopeId || '');
  if (!scope) return undefined;
  if (scope.kind === 'business_system') {
    if (childrenOf(model, scope.id).some(node => node.kind !== 'domain')) return undefined;
    const domains = childrenOf(model, scope.id).filter(node => node.kind === 'domain');
  const items = domains.flatMap(domain => [domain, ...(detail ? domainDetail(model, domain, detail) : [])]);
    return { nodes: items.length ? [scope, ...items] : [scope], group: items.length ? scope : undefined };
  }
  if (scope.kind !== 'domain') return undefined;
  if (childrenOf(model, scope.id).some(node => node.kind !== 'area')) return undefined;
  if (detail === 0) return { nodes: [scope] };
  // The domain map keeps one panel per subdomain. Deeper levels live inside
  // those panels, preserving their explicit Business Area parents.
  return { nodes: [scope, ...childrenOf(model, scope.id)], group: scope };
}

function domainDetail(model: PublishedModel, scope: AtlasNode, detail: number): AtlasNode[] {
  const areas = childrenOf(model, scope.id).filter(node => node.kind === 'area');
  const nodes: AtlasNode[] = [];
  for (const area of areas) {
    nodes.push(area);
    if (detail < 2) continue;
    for (const businessArea of childrenOf(model, area.id).filter(node => node.kind === 'business_area')) {
      nodes.push(businessArea);
      if (detail >= 3) nodes.push(...childrenOf(model, businessArea.id).filter(node => ['capability','reference'].includes(node.kind)));
    }
  }
  return nodes;
}
