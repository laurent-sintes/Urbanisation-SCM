import { ArrowUpRight, BookOpen, MapPin, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NodeIcon } from '../icons';
import { lineageOf } from '../model';
import type { ModelingGuide } from '../modelingGuide';
import { kindLabel } from '../presentation';
import { type SearchResult, searchPublication } from '../search';
import { filterSearchResults, searchExcerpt } from '../searchPresentation';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';

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
    glossary: ui('globalSearch.glossaire_metier'),
    method: ui('globalSearch.notion_methodologique'),
    guide:
      result.document === 'design-principles' ? ui('globalSearch.guide_de_lecture') : ui('globalSearch.documentation'),
    principle: ui('globalSearch.principe_directeur'),
    scenario: ui('globalSearch.scenario_metier'),
    value_stream: ui('globalSearch.flux_de_valeur'),
    model: ui('globalSearch.objet_metier'),
    document: ui('globalSearch.document_de_la_publication'),
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
  const revision = model.revision
    ? ui('common.publication_revision', { revision: String(model.revision).padStart(3, '0') })
    : model.version;
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
        <h2 id="global-search-title">{ui('globalSearch.rechercher_dans_atlas')}</h2>
        <button type="button" aria-label={ui('globalSearch.fermer_la_recherche')} onClick={onClose}>
          <X size={19} />
          <span>{ui('globalSearch.fermer')}</span>
        </button>
      </div>
      <div className="global-search-input search-box">
        <Search size={21} aria-hidden="true" />
        <input
          ref={input}
          id="fa-search"
          type="search"
          aria-label={ui('globalSearch.rechercher_dans_le_modele_publie')}
          placeholder={ui('globalSearch.un_perimetre_une_capacite_un_principe')}
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
          {fixed ? ui('globalSearch.publication_figee') : ui('globalSearch.publication_courante')} · {revision} ·{' '}
          {model.version}
        </p>
        <div className="global-search-filters">
          <label>
            {ui('globalSearch.type')}
            <select
              aria-label={ui('globalSearch.type_de_resultat')}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="all">{ui('globalSearch.tous_les_resultats')}</option>
              <option value="universe">{ui('globalSearch.enterprise_architecture')}</option>
              <option value="business_system">{ui('globalSearch.systemes_metier')}</option>
              <option value="domain">{ui('globalSearch.domaines')}</option>
              <option value="area">{ui('globalSearch.sous_domaines')}</option>
              <option value="business_area">{ui('globalSearch.business_areas')}</option>
              <option value="capability">{ui('globalSearch.capacites')}</option>
              <option value="behavior">{ui('globalSearch.comportements')}</option>
              <option value="reference">{ui('globalSearch.referentiels')}</option>
              <option value="glossary">{ui('globalSearch.glossaire_metier')}</option>
              <option value="method">{ui('globalSearch.notions_methodologiques')}</option>
              <option value="guide">{ui('globalSearch.documentation')}</option>
              <option value="principle">{ui('globalSearch.principes_directeurs')}</option>
              <option value="document">{ui('globalSearch.documents_de_la_publication')}</option>
              <option value="scenario">{ui('globalSearch.scenarios')}</option>
              <option value="value_stream">{ui('globalSearch.flux_de_valeur')}</option>
            </select>
          </label>
          <label>
            {ui('globalSearch.perimetre')}
            <select
              aria-label={ui('globalSearch.perimetre_de_recherche')}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="">{ui('globalSearch.tout_le_modele')}</option>
              {scopes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {scope && <p>{ui('globalSearch.le_filtre_de_perimetre_porte_sur_les_objets_de_la_hierarchie_meti')}</p>}
      </div>
      <p className="global-search-count" role="status">
        {!query.trim()
          ? ui('globalSearch.saisis_un_nom_un_mot_metier_ou_un_code')
          : pending
            ? ui('globalSearch.recherche_en_cours')
            : ui('globalSearch.resultat', { count: matches.length })}
      </p>
      <div
        className="global-search-results search-results"
        role="region"
        aria-label={ui('globalSearch.resultats_de_recherche')}
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
                  aria-label={ui('globalSearch.voir_sur_la_carte', { name: result.name })}
                >
                  <MapPin size={15} />
                  {ui('globalSearch.voir_sur_la_carte_2')}
                </button>
              )}
              <details className="search-result-details">
                <summary>{ui('globalSearch.details')}</summary>
                <p>
                  {path.map((node) => node.name).join(' › ')}
                  {path.length > 0 && ' · '}
                  {result.node?.displayCode || result.id}
                </p>
              </details>
            </div>
          );
        })}
        {!pending && query.trim() && !matches.length && (
          <p>{ui('globalSearch.aucun_element_ne_correspond_dans_cette_publication')}</p>
        )}
        {matches.length > limit && (
          <button
            type="button"
            className="secondary-button search-more"
            onClick={() => setLimit((value) => value + 40)}
          >
            {ui('globalSearch.afficher_davantage_de_resultats')}
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>
    </dialog>
  );
}
