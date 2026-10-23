import { ArrowUpRight, BookOpen, MapPin, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NodeIcon } from '../icons';
import { lineageOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import { kindLabel } from '../presentation';
import { type SearchResult, searchPublication } from '../search';
import { filterSearchResults, searchExcerpt } from '../searchPresentation';
import type { PublishedModel } from '../types';

interface Props {
  model: PublishedModel;
  guide?: ModelingGuide;
  open: boolean;
  query: string;
  fixed: boolean;
  onQuery: (query: string) => void;
  onClose: () => void;
  onSelect: (result: SearchResult, map?: boolean) => void;
}
function resultLabel(result: SearchResult) {
  if (result.node) return kindLabel(result.node);
  return {
    glossary: 'Glossaire métier',
    method: 'Notion méthodologique',
    guide: result.document === 'design-principles' ? 'Guide de lecture' : 'Documentation',
    principle: 'Principe directeur',
    scenario: 'Scénario métier',
    value_stream: 'Flux de valeur',
    model: 'Objet métier',
    document: 'Document de la publication',
  }[result.kind];
}
export function GlobalSearch({ model, guide, open, query, fixed, onQuery, onClose, onSelect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const request = useRef(0);
  const latestQuery = useRef(query);
  latestQuery.current = query;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultContext, setResultContext] = useState('');
  const [pending, setPending] = useState(false);
  const [type, setType] = useState('all');
  const [scope, setScope] = useState('');
  const [limit, setLimit] = useState(40);
  useEffect(() => {
    const panel = dialog.current;
    if (!panel || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!panel.open) panel.showModal();
    input.current?.focus();
    return () => {
      panel.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  useEffect(() => {
    setScope('');
    setType('all');
    if (typeof Worker === 'undefined') return;
    const next = new Worker(new URL('../searchWorker.ts', import.meta.url), { type: 'module' });
    worker.current = next;
    next.postMessage({ type: 'init', model, guide, metaGuide: model.raw.metamodel?.documentation });
    next.onmessage = (event: MessageEvent<{ id: number; results: SearchResult[] }>) => {
      if (event.data.id !== request.current) return;
      setResults(event.data.results);
      setResultContext(`${model.version}:${latestQuery.current}`);
      setPending(false);
    };
    next.onerror = () => {
      if (worker.current !== next) return;
      worker.current = null;
      next.terminate();
      setResults(searchPublication(model, latestQuery.current, guide, model.raw.metamodel?.documentation));
      setResultContext(`${model.version}:${latestQuery.current}`);
      setPending(false);
    };
    return () => {
      worker.current = null;
      next.terminate();
    };
  }, [model, guide]);
  useEffect(() => {
    const id = ++request.current;
    if (!query.trim()) {
      setResults([]);
      setPending(false);
    } else if (worker.current) {
      setResults([]);
      setPending(true);
      worker.current.postMessage({ type: 'query', id, query });
    } else {
      setResults(searchPublication(model, query, guide, model.raw.metamodel?.documentation));
      setResultContext(`${model.version}:${query}`);
      setPending(false);
    }
  }, [query, model, guide]);
  // Each new query or filter starts with a bounded list; the count always includes all matches.
  // biome-ignore lint/correctness/useExhaustiveDependencies: These fields reset the visible result window.
  useEffect(() => setLimit(40), [query, type, scope, model]);
  const matches = useMemo(
    () => (resultContext === `${model.version}:${query}` ? filterSearchResults(model, results, type, scope) : []),
    [model, query, resultContext, results, type, scope],
  );
  const scopes = model.nodes.filter((node) => ['business_system', 'domain'].includes(node.kind));
  const revision = model.revision ? `v${String(model.revision).padStart(3, '0')}` : model.version;
  return (
    <dialog
      ref={dialog}
      className="global-search"
      aria-labelledby="global-search-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
        if (event.key === 'Tab') {
          const controls = [
            ...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,summary,a[href]') ||
              []),
          ].filter((element) => element.getClientRects().length > 0);
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div className="global-search-heading">
        <h2 id="global-search-title">Rechercher dans Atlas</h2>
        <button type="button" aria-label="Fermer la recherche" onClick={onClose}>
          <X size={19} />
          <span>Fermer</span>
        </button>
      </div>
      <div className="global-search-input search-box">
        <Search size={21} aria-hidden="true" />
        <input
          ref={input}
          id="fa-search"
          type="search"
          aria-label="Rechercher dans le modèle publié"
          placeholder="Un périmètre, une capacité, un principe…"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              dialog.current?.querySelector<HTMLButtonElement>('[data-search-result]')?.focus();
            }
          }}
        />
      </div>
      <div className="global-search-context">
        <p>
          {fixed ? 'Publication figée' : 'Publication courante'} · {revision} · {model.version}
        </p>
        <div className="global-search-filters">
          <label>
            Type
            <select aria-label="Type de résultat" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="all">Tous les résultats</option>
              <option value="universe">Enterprise Architecture</option>
              <option value="business_system">Systèmes métier</option>
              <option value="domain">Domaines</option>
              <option value="area">Sous-domaines</option>
              <option value="business_area">Business Areas</option>
              <option value="capability">Capacités</option>
              <option value="behavior">Comportements</option>
              <option value="reference">Référentiels</option>
              <option value="glossary">Glossaire métier</option>
              <option value="method">Notions méthodologiques</option>
              <option value="guide">Documentation</option>
              <option value="principle">Principes directeurs</option>
              <option value="document">Documents de la publication</option>
              <option value="scenario">Scénarios</option>
              <option value="value_stream">Flux de valeur</option>
            </select>
          </label>
          <label>
            Périmètre
            <select
              aria-label="Périmètre de recherche"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="">Tout le modèle</option>
              {scopes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {scope && <p>Le filtre de périmètre porte sur les objets de la hiérarchie métier.</p>}
      </div>
      <p className="global-search-count" role="status">
        {!query.trim()
          ? 'Saisis un nom, un mot métier ou un code.'
          : pending
            ? 'Recherche en cours…'
            : `${matches.length} résultat${matches.length > 1 ? 's' : ''}`}
      </p>
      <div
        className="global-search-results search-results"
        role="region"
        aria-label="Résultats de recherche"
        aria-busy={pending}
      >
        {matches.slice(0, limit).map((result) => {
          const path = result.node ? lineageOf(model, result.id).slice(0, -1) : [];
          const parent = path.at(-1);
          return (
            <div className="global-search-result" key={`${result.kind}:${result.id}`}>
              <button
                type="button"
                data-search-result={result.id}
                className="search-result-open"
                onClick={() => onSelect(result)}
                onKeyDown={(event) => {
                  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                  event.preventDefault();
                  const buttons = [
                    ...(dialog.current?.querySelectorAll<HTMLButtonElement>('[data-search-result]') || []),
                  ];
                  const target = buttons[buttons.indexOf(event.currentTarget) + (event.key === 'ArrowDown' ? 1 : -1)];
                  if (target) target.focus();
                  else if (event.key === 'ArrowUp') input.current?.focus();
                }}
              >
                {result.node ? <NodeIcon node={result.node} size={23} framed /> : <BookOpen size={22} />}
                <span>
                  <strong>{result.name}</strong>
                  <small>
                    {resultLabel(result)}
                    {parent && ` · ${parent.name}`}
                  </small>
                  <span className="search-excerpt">{searchExcerpt(result)}</span>
                </span>
              </button>
              {result.node && (
                <button
                  type="button"
                  className="search-result-map"
                  onClick={() => onSelect(result, true)}
                  aria-label={`Voir ${result.name} sur la carte`}
                >
                  <MapPin size={15} />
                  Voir sur la carte
                </button>
              )}
              <details className="search-result-details">
                <summary>Détails</summary>
                <p>
                  {path.map((node) => node.name).join(' › ')}
                  {path.length > 0 && ' · '}
                  {result.node?.displayCode || result.id}
                </p>
              </details>
            </div>
          );
        })}
        {!pending && query.trim() && !matches.length && <p>Aucun élément ne correspond dans cette publication.</p>}
        {matches.length > limit && (
          <button
            type="button"
            className="secondary-button search-more"
            onClick={() => setLimit((value) => value + 40)}
          >
            Afficher davantage de résultats <ArrowUpRight size={15} />
          </button>
        )}
      </div>
    </dialog>
  );
}
