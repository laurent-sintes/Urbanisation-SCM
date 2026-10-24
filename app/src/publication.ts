import { adaptPublication } from './model.ts';
import type { PublishedModel, RawPublication } from './types.ts';
import { ui } from './ui.ts';

export interface ReleaseEntry {
  readonly version: string;
  readonly revision?: number | null;
  readonly published_at?: string | null;
  readonly last_modified?: string | null;
  readonly release_notes?: string | null;
  readonly descriptor?: string | null;
  readonly model_sha256?: string;
  readonly model_yaml_sha256?: string;
  readonly guide_sha256?: string;
}
export interface PublicationCatalog {
  readonly current: string;
  /** Catalog ordering is authoritative: latest publication first. */
  readonly releases: readonly ReleaseEntry[];
}
export interface PublicationState {
  readonly model?: PublishedModel;
  readonly catalog?: PublicationCatalog;
  readonly loading: boolean;
  readonly error: string;
  readonly notice: string;
}
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchJson(
  url: string,
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
  timeoutMs = 15000,
  expectedSha256?: string,
): Promise<unknown> {
  if (signal?.aborted) throw signal.reason;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel = () => {};
  const interrupted = new Promise<never>((_, reject) => {
    cancel = () => {
      controller.abort();
      reject(signal?.reason ?? new Error(ui('publication.chargement_annule')));
    };
    signal?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(ui('publication.le_chargement_prend_trop_de_temps_reessaie_dans_quelques_instants')));
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      interrupted,
      (async () => {
        const response = await fetcher(url, { signal: controller.signal, cache: 'no-store' });
        let body: unknown;
        try {
          if (response.ok && expectedSha256) {
            const bytes = await response.arrayBuffer();
            const digest = await crypto.subtle.digest('SHA-256', bytes);
            const actual = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
            if (actual !== expectedSha256) throw new Error('integrity');
            body = JSON.parse(new TextDecoder().decode(bytes));
          } else body = await response.json();
        } catch (error) {
          if (error instanceof Error && error.message === 'integrity')
            throw new Error(ui('publication.le_contenu_recu_ne_correspond_pas_a_l_empreinte_publiee_reessaie_'));
          throw new Error(
            response.ok
              ? ui('publication.le_fichier_json_recu_est_invalide')
              : ui('publication.chargement_impossible_http', { status: response.status }),
          );
        }
        if (!response.ok) {
          const error = body && typeof body === 'object' ? (body as Record<string, unknown>).error : undefined;
          const message =
            typeof error === 'string'
              ? error
              : error && typeof error === 'object'
                ? (error as Record<string, unknown>).message
                : undefined;
          throw new Error(
            typeof message === 'string'
              ? message
              : ui('publication.le_serveur_repond_avec_une_erreur', { status: response.status }),
          );
        }
        return body;
      })(),
    ]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export function adaptCatalog(input: unknown): PublicationCatalog {
  if (!input || typeof input !== 'object') throw new Error(ui('publication.catalogue_des_publications_invalide'));
  const raw = input as { current_version?: unknown; versions?: unknown };
  if (typeof raw.current_version !== 'string' || !raw.current_version || !Array.isArray(raw.versions))
    throw new Error(ui('publication.catalogue_des_publications_invalide'));
  const entries = raw.versions.map((value) => {
    if (!value || typeof value !== 'object' || typeof value.version !== 'string' || !value.version)
      throw new Error(ui('publication.identite_de_publication_invalide'));
    for (const field of ['model_sha256', 'model_yaml_sha256', 'guide_sha256']) {
      if (value[field] !== undefined && (typeof value[field] !== 'string' || !/^[a-f0-9]{64}$/.test(value[field])))
        throw new Error(ui('publication.empreinte_de_publication_invalide'));
    }
    return Object.freeze({ ...value }) as ReleaseEntry;
  });
  if (new Set(entries.map((entry) => entry.version)).size !== entries.length)
    throw new Error(ui('publication.publication_dupliquee_dans_le_catalogue'));
  if (!entries.some((entry) => entry.version === raw.current_version))
    throw new Error(ui('publication.la_publication_courante_est_absente_du_catalogue'));
  return Object.freeze({ current: raw.current_version, releases: Object.freeze(entries) });
}

/** Relative URLs work at localhost and below a GitHub Pages project path. */
export function staticUrl(path: string): string {
  return (import.meta.env?.BASE_URL ?? './') + path;
}
export function publicationUrl(version: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(version) || version.includes('..'))
    throw new Error(ui('publication.version_invalide'));
  return staticUrl(`data/${version}/model.json`);
}
export function publicationYamlUrl(version: string): string {
  return publicationUrl(version).replace(/model\.json$/, 'model.yaml');
}
export function guideUrl(version: string): string {
  return publicationUrl(version).replace(/model\.json$/, 'guide.json');
}

/** Request orchestration is independent of React so races and error retention can be tested. */
export function createPublicationClient(fetcher: FetchLike = fetch) {
  let state: PublicationState = { loading: false, error: '', notice: '' };
  let requestedVersion: string | undefined;
  let initialized = false;
  let disposed = false;
  let requestNumber = 0;
  let controller: AbortController | undefined;
  let pending: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const emit = (next: PublicationState) => {
    if (disposed) return;
    state = Object.freeze(next);
    listeners.forEach((listener) => {
      listener();
    });
  };
  const run = (force: boolean): Promise<void> => {
    if (disposed) return Promise.resolve();
    if (!force && pending) return pending;
    controller?.abort();
    const abort = new AbortController();
    controller = abort;
    const request = ++requestNumber;
    const selection = requestedVersion;
    const isLatest = () => !disposed && request === requestNumber && !abort.signal.aborted;
    if (force || !state.model) emit({ ...state, loading: true, error: '', notice: '' });
    const task = (async () => {
      let nextCatalog: PublicationCatalog | undefined;
      try {
        nextCatalog = adaptCatalog(await fetchJson(staticUrl('data/index.json'), abort.signal, fetcher));
        if (!isLatest()) return;
        const target = selection || nextCatalog.current;
        if (!nextCatalog.releases.some((entry) => entry.version === target))
          throw new Error(ui('publication.la_publication_est_absente_du_catalogue', { target: target }));
        if (!force && state.model?.version === target && !state.notice) {
          if (state.loading || state.error || JSON.stringify(state.catalog) !== JSON.stringify(nextCatalog)) {
            emit({ ...state, catalog: nextCatalog, loading: false, error: '', notice: '' });
          }
          return;
        }
        // Pin each read to the catalog identity. A concurrent publication cannot mix two versions.
        const raw = (await fetchJson(
          publicationUrl(target),
          abort.signal,
          fetcher,
          15000,
          nextCatalog.releases.find((entry) => entry.version === target)?.model_sha256,
        )) as RawPublication;
        if (!isLatest()) return;
        if (raw?.version !== target)
          throw new Error(ui('publication.le_modele_recu_ne_correspond_pas_a_la_publication', { target: target }));
        const model = adaptPublication(raw);
        emit({ model, catalog: nextCatalog, loading: false, error: '', notice: '' });
      } catch (error) {
        if (!isLatest()) return;
        const message = error instanceof Error ? error.message : String(error);
        const catalog = nextCatalog ?? state.catalog;
        if (state.model) {
          emit({
            ...state,
            catalog,
            loading: false,
            error: '',
            notice: ui('publication.actualisation_impossible_la_publication_reste_affichee_une_nouvel', {
              message: message,
              version: state.model.version,
            }),
          });
        } else {
          emit({ catalog, loading: false, error: message, notice: '' });
        }
      } finally {
        if (request === requestNumber) pending = undefined;
      }
    })();
    pending = task;
    return task;
  };
  return {
    getState: (): PublicationState => state,
    getVersion: (): string | undefined => requestedVersion,
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setVersion(version?: string): Promise<void> {
      const next = version || undefined;
      if (!initialized || next !== requestedVersion) {
        initialized = true;
        requestedVersion = next;
        // A newly requested historical version must never display the previous selection.
        emit({ catalog: state.catalog, loading: true, error: '', notice: '' });
        return run(true);
      }
      return pending ?? Promise.resolve();
    },
    reload: (): Promise<void> => run(true),
    check: (): Promise<void> => run(false),
    dispose(): void {
      disposed = true;
      ++requestNumber;
      controller?.abort();
      listeners.clear();
    },
  };
}
