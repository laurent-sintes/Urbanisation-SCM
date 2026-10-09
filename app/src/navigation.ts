import type { PublishedModel } from './types.ts';
export type View =
  | 'map'
  | 'sheet'
  | 'relations'
  | 'market'
  | 'glossary'
  | 'principles'
  | 'metamodel'
  | 'scenarios'
  | 'hotspots';
export interface GraphRoute {
  graphLevel?: 'capability' | 'business_area' | 'area' | 'domain' | 'business_system' | 'universe';
  graphDepth?: 0 | 1 | 2 | 3;
  graphDirection?: 'both' | 'incoming' | 'outgoing';
  graphFamily?: 'all' | 'needs' | 'other';
  graphLayout?: 'organic' | 'hierarchical';
  graphLabels?: 'focus' | 'all';
  graphNeighbors?: boolean;
}
export interface RouteState extends GraphRoute {
  node: string;
  scope: string;
  view?: View;
  version: string;
  mapDepth?: 0 | 1 | 2 | 3 | 4;
  mapFocus?: string;
  query: string;
  status: string;
  relation: string;
  source: string;
  anchor: string;
  sourceId: string;
  term?: string;
  section?: string;
  glossary?: 'model' | 'meta' | 'transformation';
  principle?: string;
  returnTo?: string;
  catalogReturn?: string;
  scroll?: string;
  scenario?: string;
  hotspot?: string;
  stream?: string;
  path?: string;
  event?: string;
  object?: string;
  situation?: string;
  capability?: string;
  scenarioQuery?: string;
}
export function readRoute(hash: string): RouteState {
  const fragment = hash.replace(/^#/, '');
  const [path, search = ''] = fragment.startsWith('/') ? fragment.slice(1).split('?', 2) : ['', ''];
  const p = new URLSearchParams(search);
  const node = p.get('node') || '';
  const depth = p.get('depth');
  const mapDepth = p.get('mapDepth');
  const scroll = p.get('scroll');
  const view = path === 'market' && !node ? 'map' : path;
  const graph: GraphRoute = {};
  if (p.get('level') === 'subdomain') p.set('level', 'area');
  if (['capability', 'business_area', 'area', 'domain', 'business_system', 'universe'].includes(p.get('level') || ''))
    graph.graphLevel = p.get('level') as GraphRoute['graphLevel'];
  if (depth !== null && ['0', '1', '2', '3'].includes(depth))
    graph.graphDepth = Number(depth) as GraphRoute['graphDepth'];
  if (['both', 'incoming', 'outgoing'].includes(p.get('direction') || ''))
    graph.graphDirection = p.get('direction') as GraphRoute['graphDirection'];
  if (['all', 'needs', 'other'].includes(p.get('qualification') || ''))
    graph.graphFamily = p.get('qualification') as GraphRoute['graphFamily'];
  if (['organic', 'hierarchical'].includes(p.get('layout') || ''))
    graph.graphLayout = p.get('layout') as GraphRoute['graphLayout'];
  if (['focus', 'all'].includes(p.get('labels') || ''))
    graph.graphLabels = p.get('labels') as GraphRoute['graphLabels'];
  if (p.get('neighbors') === 'all') graph.graphNeighbors = true;
  return {
    ...(view === 'relations' ? graph : {}),
    node: view === 'principles' || view === 'metamodel' ? '' : node,
    scope: view === 'principles' || view === 'metamodel' ? '' : p.get('scope') || '',
    ...(mapDepth !== null && ['0', '1', '2', '3', '4'].includes(mapDepth)
      ? { mapDepth: Number(mapDepth) as RouteState['mapDepth'] }
      : {}),
    ...(p.has('mapFocus') ? { mapFocus: p.get('mapFocus') || '' } : {}),
    view: [
      'map',
      'sheet',
      'relations',
      'market',
      'glossary',
      'principles',
      'metamodel',
      'scenarios',
      'hotspots',
    ].includes(view || '')
      ? (view as View)
      : undefined,
    ...((view === 'principles' || view === 'metamodel') && p.has('principle')
      ? { principle: p.get('principle') || '' }
      : {}),
    ...(p.has('term') ? { term: p.get('term') || '' } : {}),
    ...(['meta', 'transformation'].includes(p.get('glossary') || '')
      ? { glossary: p.get('glossary') as 'meta' | 'transformation' }
      : {}),
    ...(p.has('section') ? { section: p.get('section') || '' } : {}),
    ...Object.fromEntries(
      ['returnTo', 'catalogReturn'].flatMap((key) => {
        const value = p.get(key);
        return value?.startsWith('#') && value.length < 12000 ? [[key, value]] : [];
      }),
    ),
    ...(scroll !== null && /^\d{1,7}$/.test(scroll) ? { scroll } : {}),
    ...Object.fromEntries(
      ['scenario', 'stream', 'path', 'event', 'object', 'situation', 'capability', 'scenarioQuery']
        .filter((k) => p.has(k))
        .map((k) => [k, p.get(k) || '']),
    ),
    ...(view === 'hotspots' && p.has('hotspot') ? { hotspot: p.get('hotspot') || '' } : {}),
    version: p.get('version') || '',
    query: p.get('q') || '',
    status: p.get('status') || '',
    relation: p.get('relation') || '',
    source: p.get('source') || '',
    anchor: p.get('anchor') || '',
    sourceId: p.get('sourceId') || '',
  };
}
export function routePath(route: RouteState, model?: PublishedModel | null): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries({
    ...(route.view === 'scenarios'
      ? {
          scenario: route.scenario,
          stream: route.stream,
          path: route.path,
          event: route.event,
          object: route.object,
          situation: route.situation,
          capability: route.capability,
          scenarioQuery: route.scenarioQuery,
        }
      : {}),
    hotspot: route.view === 'hotspots' ? route.hotspot : undefined,
    version: route.version,
    node: route.node,
    scope: route.scope,
    ...(route.view === 'map' ? { mapDepth: route.mapDepth, mapFocus: route.mapFocus } : {}),
    q: route.query,
    status: route.status,
    relation: route.relation,
    source: route.source,
    anchor: route.anchor,
    sourceId: route.sourceId,
    term: route.term,
    section: route.section,
    returnTo: route.returnTo,
    catalogReturn: route.catalogReturn,
    scroll: route.scroll,
    glossary: route.view === 'glossary' ? route.glossary : undefined,
    principle: route.view === 'principles' || route.view === 'metamodel' ? route.principle : undefined,
    ...(route.view === 'relations'
      ? {
          level:
            model?.nodes.some((n) => n.hierarchyLabel === 'Sous-domaine') && route.graphLevel === 'area'
              ? 'subdomain'
              : model?.nodes.some((n) => n.kind === 'area') && route.graphLevel === 'universe'
                ? 'domain'
                : route.graphLevel,
          depth: route.graphDepth,
          direction: route.graphDirection,
          qualification: route.graphFamily,
          layout: route.graphLayout,
          labels: route.graphLabels,
          neighbors: route.graphNeighbors ? 'all' : undefined,
        }
      : {}),
  }))
    if (value !== undefined && value !== '') p.set(key, String(value));
  const path = `/${route.view || ''}`;
  return p.size ? `${path}?${p}` : path;
}
export const routeHash = (route: RouteState, model?: PublishedModel | null) => `#${routePath(route, model)}`;
export function preference<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`flow-atlas:${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function savePreference(key: string, value: unknown) {
  try {
    localStorage.setItem(`flow-atlas:${key}`, JSON.stringify(value));
  } catch {
    /* Navigation works without storage. */
  }
}
