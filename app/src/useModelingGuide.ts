import { useEffect, useState } from 'react';
import { fetchModelingGuide, type GuideResponse } from './modelingGuide';
export type GuideState = { status: 'loading'; version?: string } | { status: 'error'; version: string; message: string } | { status: 'ready'; version: string; response: GuideResponse };
export function useModelingGuide(version?: string, expectedSha256?: string) {
  const [state, setState] = useState<GuideState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!version) return;
    const controller = new AbortController();
    setState({ status: 'loading', version });
    fetchModelingGuide(version, controller.signal, fetch, expectedSha256).then(response => {
      if (!controller.signal.aborted) setState({ status: 'ready', version, response });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ status: 'error', version, message: error instanceof Error ? error.message : 'Méta modèle indisponible.' });
    });
    return () => controller.abort();
  }, [version, expectedSha256, attempt]);
  return { state: state.version === version ? state : { status: 'loading', version } as GuideState, retry: () => setAttempt(value => value + 1) };
}
