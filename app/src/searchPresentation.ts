import { plainInlineText } from './inlineLinks.ts';
import { mapRouteForNode } from './mapNavigation.ts';
import { lineageOf } from './model.ts';
import type { RouteState } from './navigation.ts';
import type { SearchResult } from './search.ts';
import type { PublishedModel } from './types.ts';

export function filterSearchResults(model: PublishedModel, results: SearchResult[], type: string, scope: string) {
  return results.filter((result) => {
    if (type !== 'all' && result.kind !== type && result.node?.kind !== type) return false;
    return !scope || (!!result.node && lineageOf(model, result.id).some((node) => node.id === scope));
  });
}

export function searchExcerpt(result: SearchResult) {
  const text = plainInlineText(result.node?.definition || result.term?.definition || result.excerpt)
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 190 ? `${text.slice(0, 187).replace(/\s+\S*$/, '')}…` : text;
}

export function searchResultRoute(model: PublishedModel, result: SearchResult, map = false): Partial<RouteState> {
  const reset: Partial<RouteState> = {
    query: '',
    section: '',
    relation: '',
    source: '',
    anchor: '',
    sourceId: '',
    returnTo: '',
    catalogReturn: '',
    scroll: '',
    term: '',
    principle: '',
    node: '',
    scope: '',
  };
  if (result.node) {
    const location = mapRouteForNode(model, result.id);
    return { ...reset, ...location, view: map ? 'map' : 'sheet', mapFocus: map ? location.mapFocus : '' };
  }
  if (result.kind === 'principle' || result.kind === 'guide')
    return {
      ...reset,
      view: result.document || (result.kind === 'principle' ? 'design-principles' : 'principles'),
      principle: result.id,
    };
  if (result.kind === 'scenario' || result.kind === 'value_stream')
    return {
      ...reset,
      view: 'scenarios',
      scenario: result.kind === 'scenario' ? result.id : '',
      stream: result.kind === 'value_stream' ? result.id : '',
      path: '',
    };
  if (result.kind === 'document') return { ...reset, view: 'documents', document: result.id };
  return { ...reset, view: 'glossary', term: result.id };
}
