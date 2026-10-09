import { useCallback, useEffect, useRef, useState } from 'react';
import { createPublicationClient, type PublicationState } from './publication.ts';

export function usePublication(version?: string): PublicationState & { reload: () => void } {
  const clientRef = useRef<ReturnType<typeof createPublicationClient> | null>(null);
  const versionRef = useRef(version);
  versionRef.current = version;
  const [state, setState] = useState<PublicationState>({ loading: true, error: '', notice: '' });
  // Render cannot leak the previous model while the version-change effect is pending.
  const stateVersion = useRef<string | undefined>(version);
  useEffect(() => {
    const client = createPublicationClient();
    clientRef.current = client;
    const unsubscribe = client.subscribe(() => {
      stateVersion.current = client.getVersion();
      setState(client.getState());
    });
    void client.setVersion(versionRef.current);
    const check = () => {
      if (!document.hidden) void client.check();
    };
    const timer = window.setInterval(check, 60000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('online', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('online', check);
      unsubscribe();
      client.dispose();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, []);
  useEffect(() => {
    void clientRef.current?.setVersion(version);
  }, [version]);
  const reload = useCallback(() => {
    void clientRef.current?.reload();
  }, []);
  const visibleState =
    stateVersion.current === version ? state : { catalog: state.catalog, loading: true, error: '', notice: '' };
  return { ...visibleState, reload };
}
