import type { PublishedModel } from './types.ts';
export type View = 'map' | 'sheet' | 'relations' | 'market' | 'glossary' | 'principles' | 'information' | 'scenarios';
export interface GraphRoute {
  graphLevel?: 'capability' | 'area' | 'domain' | 'business_system' | 'universe';
  graphDepth?: 0 | 1 | 2 | 3;
  graphDirection?: 'both' | 'incoming' | 'outgoing';
  graphFamily?: 'all' | 'needs' | 'other';
  graphLayout?: 'organic' | 'hierarchical';
  graphLabels?: 'focus' | 'all';
  graphNeighbors?: boolean;
}
export interface RouteState extends GraphRoute {
  node: string; scope: string; view?: View; version: string;
  query: string; status: string; relation: string;
  source: string; anchor: string; sourceId: string;
  term?: string; section?: string;
  glossary?: 'model' | 'meta';
  principle?: string;
  information?: string;
  returnTo?: string; catalogReturn?: string; scroll?: string;
  scenario?: string; stream?: string; path?: string; event?: string; object?: string; situation?: string; capability?: string; scenarioQuery?: string;
}
export function readRoute(hash: string): RouteState {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const legacyRoots = ['atlas', 'transactional', 'process', 'references', 'panorama', 'backlog'];
  const node = p.get('node') || '';
  // U470: old information links return to the model in the same publication.
  if (p.get('view') === 'information') p.set('view', node && !legacyRoots.includes(node) ? 'sheet' : 'map');
  const requestedView = p.get('view') === 'sheet' && p.get('section') === 'market_comparisons' ? 'market' : p.get('view');
  const view = requestedView === 'market' && (!node || legacyRoots.includes(node)) ? 'map' : requestedView;
  const graph: GraphRoute = {};
  if (p.get('level') === 'subdomain') p.set('level', 'area');
  if (['capability', 'area', 'domain', 'business_system', 'universe'].includes(p.get('level') || '')) graph.graphLevel = p.get('level') as GraphRoute['graphLevel'];
  if (p.has('depth') && ['0', '1', '2', '3'].includes(p.get('depth')!)) graph.graphDepth = Number(p.get('depth')) as GraphRoute['graphDepth'];
  if (['both', 'incoming', 'outgoing'].includes(p.get('direction') || '')) graph.graphDirection = p.get('direction') as GraphRoute['graphDirection'];
  if (['all', 'needs', 'other'].includes(p.get('qualification') || '')) graph.graphFamily = p.get('qualification') as GraphRoute['graphFamily'];
  if (['organic', 'hierarchical'].includes(p.get('layout') || '')) graph.graphLayout = p.get('layout') as GraphRoute['graphLayout'];
  if (['focus', 'all'].includes(p.get('labels') || '')) graph.graphLabels = p.get('labels') as GraphRoute['graphLabels'];
  if (p.get('neighbors') === 'all') graph.graphNeighbors = true;
  return {
    ...((view === 'relations' || view === 'links') ? graph : {}),
    node: view === 'principles' || legacyRoots.includes(node) ? '' : node,
    scope: view === 'principles' ? '' : p.get('scope') || '',
    view: view === 'links' ? 'relations' : ['map', 'sheet', 'relations', 'market', 'glossary', 'principles', 'information', 'scenarios'].includes(view || '') ? view as View : undefined,
    ...(view === 'principles' && p.has('principle') ? { principle: p.get('principle') || '' } : {}),
    ...(p.has('term') ? { term: p.get('term') || '' } : {}),
    ...(p.get('glossary') === 'meta' ? { glossary: 'meta' as const } : {}),
    ...(p.has('section') ? { section: p.get('section') || '' } : {}),
    ...Object.fromEntries(['returnTo','catalogReturn'].filter(k => p.get(k)?.startsWith('#') && p.get(k)!.length < 12000).map(k => [k,p.get(k)!])),
    ...(p.has('scroll') && /^\d{1,7}$/.test(p.get('scroll')!) ? {scroll:p.get('scroll')!} : {}),
    ...Object.fromEntries(['scenario','stream','path','event','object','situation','capability','scenarioQuery'].filter(k => p.has(k)).map(k => [k,p.get(k) || ''])),
    version: p.get('version') || '', query: p.get('q') || '',
    status: p.get('status') || '', relation: p.get('relation') || '',
    source: p.get('source') || '', anchor: p.get('anchor') || '', sourceId: p.get('sourceId') || '',
  };
}
export function routeHash(route: RouteState, model?: PublishedModel | null): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries({
    ...(route.view === 'scenarios' ? {scenario:route.scenario,stream:route.stream,path:route.path,event:route.event,object:route.object,situation:route.situation,capability:route.capability,scenarioQuery:route.scenarioQuery} : {}),
    version: route.version, node: route.node, scope: route.scope, view: route.view,
    q: route.query, status: route.status, relation: route.relation,
    source: route.source, anchor: route.anchor, sourceId: route.sourceId,
    term: route.term, section: route.section,
    returnTo: route.returnTo, catalogReturn: route.catalogReturn, scroll: route.scroll,
    glossary: route.view === 'glossary' ? route.glossary : undefined,
    principle: route.view === 'principles' ? route.principle : undefined,
    information: route.view === 'information' ? route.information : undefined,
    ...(route.view === 'relations' ? { level: model?.nodes.some(n => n.hierarchyLabel === 'Sous-domaine') && route.graphLevel === 'area' ? 'subdomain' : model?.nodes.some(n => n.kind === 'area') && route.graphLevel === 'universe' ? 'domain' : route.graphLevel, depth: route.graphDepth, direction: route.graphDirection, qualification: route.graphFamily, layout: route.graphLayout, labels: route.graphLabels, neighbors: route.graphNeighbors ? 'all' : undefined } : {}),
  })) if (value !== undefined && value !== '') p.set(key, String(value));
  return p.size ? `#${p}` : '#';
}
export function preference<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(`flow-atlas:${key}`); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}
export function savePreference(key: string, value: unknown) {
  try { localStorage.setItem(`flow-atlas:${key}`, JSON.stringify(value)); } catch { /* Navigation works without storage. */ }
}
