import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';
import { type RouteState, readRoute, routeHash, routePath, savePreference } from './navigation';
import type { PublishedModel } from './types';

/** Keep the URL authoritative while composing actions issued before React commits. */
export function useAtlasLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const route = useMemo(
    () => readRoute(`#${location.pathname}${location.search}`),
    [location.pathname, location.search],
  );
  const latestRoute = useRef(route);
  latestRoute.current = route;

  const changeRoute = useCallback(
    (changes: Partial<RouteState>, model: PublishedModel | null | undefined, scroll: number, replace = false) => {
      const next = { ...latestRoute.current, ...changes };
      latestRoute.current = next;
      history.replaceState({ ...history.state, atlasScroll: scroll }, '', window.location.href);
      navigate(routePath(next, model), { replace });
    },
    [navigate],
  );

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);
  useEffect(() => {
    savePreference(
      'selection',
      routeHash({ ...route, version: '', query: '', status: '', source: '', anchor: '', sourceId: '' }),
    );
  }, [route]);

  return { route, locationKey: location.key, navigationType, changeRoute };
}
