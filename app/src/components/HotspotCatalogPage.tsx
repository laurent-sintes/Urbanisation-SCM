import { ChevronDown, Flame, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { documentsForHotspot, documentUrl } from '../documentCatalog';
import {
  defaultHotspotMapFilters,
  filterMapHotspots,
  severityForComplexities,
  updateHotspotMapFilters,
} from '../hotspotMap';
import { mapRouteForNode } from '../mapNavigation';
import type { RouteState } from '../navigation';
import { publicText } from '../publicText';
import type { Hotspot, PublishedModel } from '../types';
import type { WorkshopStage, WorkshopTableChange } from '../workshop';
import { HotspotFilterFields } from './HotspotFilterFields';
import './hotspots.css';

const STATUS: Record<Hotspot['status'], string> = {
  discovered: 'Découvert',
  shared: 'Partagé',
  validated: 'Validé',
  resolved: 'Résolu',
};
const LEVEL: Record<string, string> = {
  business_direction: 'Direction métier',
  flow_internal: 'Interne programme FLOW',
  flow_steering: 'Comité de pilotage FLOW',
  to_confirm: 'À confirmer',
};
const SIZE = (value: string) => (value === 'unassessed' ? 'Non évaluée' : value);
const SIZE_RANK = ['unassessed', 'S', 'M', 'L', 'XL'];
type SortKey =
  | 'title'
  | 'kind'
  | 'scope'
  | 'severity'
  | 'political'
  | 'implementation'
  | 'status'
  | 'arbitration_level';
const STATUS_RANK = ['discovered', 'shared', 'validated', 'resolved'];
type HotspotDraft = {
  title: string;
  political: string;
  implementation: string;
  status: Hotspot['status'];
  arbitration_level: string;
};
const draftFor = (item: Hotspot): HotspotDraft => ({
  title: item.title,
  political: item.complexity.political,
  implementation: item.complexity.implementation,
  status: item.status,
  arbitration_level: item.arbitration_level,
});

export function HotspotCatalogPage({
  model,
  route,
  onChange,
  workshopStage,
  onSaveWorkshopChanges,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (changes: Partial<RouteState>) => void;
  workshopStage: WorkshopStage | null;
  onSaveWorkshopChanges: (changes: WorkshopTableChange[]) => Promise<void>;
}) {
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  const workshopCount = hotspots.filter((item) => item.workshop).length;
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ ...defaultHotspotMapFilters, enabled: true });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'severity',
    direction: 'descending',
  });
  const [drafts, setDrafts] = useState<Record<string, HotspotDraft>>({});
  const [draftBases, setDraftBases] = useState<Record<string, HotspotDraft>>({});
  const [draftRevision, setDraftRevision] = useState<number | null>(null);
  const [restoredKey, setRestoredKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [tooltip, setTooltip] = useState<{ id: string; left: number; top: number } | null>(null);
  const groupIds = new Set((route.hotspotGroup || '').split(',').filter(Boolean));
  const groupHotspots = groupIds.size ? hotspots.filter((item) => groupIds.has(item.id)) : hotspots;
  const chosen = hotspots.find((item) => item.id === route.hotspot);
  const documents = chosen ? documentsForHotspot(model, chosen.document_ids || []) : [];
  const storageKey = workshopStage ? `atlas-hotspot-drafts:${model.version}:${workshopStage.session_id}` : '';
  useEffect(() => {
    if (!storageKey || restoredKey === storageKey) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      setDrafts(saved.drafts || {});
      setDraftBases(saved.bases || {});
      setDraftRevision(typeof saved.revision === 'number' ? saved.revision : null);
    } catch {
      setDrafts({});
      setDraftBases({});
      setDraftRevision(null);
    }
    setRestoredKey(storageKey);
  }, [storageKey, restoredKey]);
  useEffect(() => {
    if (!storageKey || restoredKey !== storageKey) return;
    if (Object.keys(drafts).length)
      sessionStorage.setItem(storageKey, JSON.stringify({ drafts, bases: draftBases, revision: draftRevision }));
    else sessionStorage.removeItem(storageKey);
  }, [storageKey, restoredKey, drafts, draftBases, draftRevision]);
  useEffect(() => {
    if (!Object.keys(drafts).length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [drafts]);
  const effective = (item: Hotspot) => {
    const draft = drafts[item.id];
    if (!draft) return item;
    return {
      ...item,
      title: draft.title,
      status: draft.status,
      arbitration_level: draft.arbitration_level,
      complexity: { ...item.complexity, political: draft.political, implementation: draft.implementation },
      severity: (severityForComplexities(draft.political, draft.implementation) ||
        item.severity) as Hotspot['severity'],
    };
  };
  const scoped = groupHotspots.map(effective);
  const filtered = filterMapHotspots(scoped, { ...filters, enabled: true })
    .filter((item) =>
      `${item.id} ${item.title} ${item.problem}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')),
    )
    .sort((a, b) => {
      const value = (item: Hotspot) => {
        switch (sort.key) {
          case 'kind':
            return item.kind === 'integration' ? 1 : 0;
          case 'scope':
            return item.location.node_ids.map((id) => model.nodeById.get(id)?.name || id).join(' · ');
          case 'severity':
            return SIZE_RANK.indexOf(item.severity);
          case 'political':
            return SIZE_RANK.indexOf(item.complexity.political);
          case 'implementation':
            return SIZE_RANK.indexOf(item.complexity.implementation);
          case 'status':
            return STATUS_RANK.indexOf(item.status);
          case 'arbitration_level':
            return LEVEL[item.arbitration_level] || item.arbitration_level;
          default:
            return item.title;
        }
      };
      const left = value(a);
      const right = value(b);
      const primary =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'fr');
      return (
        (sort.direction === 'ascending' ? primary : -primary) ||
        a.title.localeCompare(b.title, 'fr') ||
        a.id.localeCompare(b.id)
      );
    });
  const changes: WorkshopTableChange[] = Object.entries(drafts).flatMap(([id, draft]) => {
    const item = hotspots.find((hotspot) => hotspot.id === id);
    if (!item) return [];
    const base = draftBases[id] || draftFor(item);
    const fields: WorkshopTableChange['fields'] = {};
    if (draft.title.trim() !== base.title) fields.title = draft.title.trim();
    if (draft.political !== base.political || draft.implementation !== base.implementation)
      fields.complexity = {
        ...item.complexity,
        political: draft.political !== base.political ? draft.political : item.complexity.political,
        implementation:
          draft.implementation !== base.implementation ? draft.implementation : item.complexity.implementation,
      };
    if (draft.status !== base.status) fields.status = draft.status;
    if (draft.arbitration_level !== base.arbitration_level) fields.arbitration_level = draft.arbitration_level;
    return Object.keys(fields).length ? [{ id, fields }] : [];
  });
  const staleDrafts = changes.length > 0 && (!workshopStage || draftRevision !== workshopStage.revision);
  const conflicts = changes.flatMap((change) => {
    const item = hotspots.find((hotspot) => hotspot.id === change.id);
    const base = draftBases[change.id];
    if (!item || !base) return [change.id];
    const latest = draftFor(item);
    const draft = drafts[change.id];
    return (Object.keys(draft) as (keyof HotspotDraft)[])
      .filter((key) => draft[key] !== base[key] && latest[key] !== base[key] && latest[key] !== draft[key])
      .map(
        (key) =>
          `${item.title} · ${key === 'political' ? 'politique' : key === 'implementation' ? 'implémentation' : key === 'arbitration_level' ? 'arbitrage' : key === 'status' ? 'statut' : 'titre'}`,
      );
  });
  const invalidDrafts = Object.values(drafts).some((draft) => !draft.title.trim());
  const edit = (item: Hotspot, field: keyof HotspotDraft, value: string) => {
    if (!workshopStage) return;
    if (draftRevision === null) setDraftRevision(workshopStage.revision);
    setDraftBases((current) => (current[item.id] ? current : { ...current, [item.id]: draftFor(item) }));
    setDrafts((current) => ({ ...current, [item.id]: { ...(current[item.id] || draftFor(item)), [field]: value } }));
    setSaveMessage('');
  };
  const save = async () => {
    if (!changes.length || staleDrafts || invalidDrafts || saving) return;
    setSaving(true);
    setSaveMessage('');
    try {
      await onSaveWorkshopChanges(changes);
      setDrafts({});
      setDraftBases({});
      setDraftRevision(null);
      setSaveMessage(
        `${changes.length} point${changes.length > 1 ? 's' : ''} chaud${changes.length > 1 ? 's' : ''} enregistré${changes.length > 1 ? 's' : ''} dans le staging.`,
      );
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };
  const rebaseDrafts = () => {
    if (!workshopStage) return;
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).flatMap(([id, draft]) => {
          const item = hotspots.find((hotspot) => hotspot.id === id);
          if (!item) return [];
          const base = draftBases[id] || draftFor(item);
          const latest = draftFor(item);
          return [
            [
              id,
              Object.fromEntries(
                (Object.keys(draft) as (keyof HotspotDraft)[]).map((key) => [
                  key,
                  draft[key] !== base[key] ? draft[key] : latest[key],
                ]),
              ) as HotspotDraft,
            ],
          ];
        }),
      ),
    );
    setDraftBases(
      Object.fromEntries(
        Object.keys(drafts).flatMap((id) => {
          const item = hotspots.find((hotspot) => hotspot.id === id);
          return item ? [[id, draftFor(item)]] : [];
        }),
      ),
    );
    setDraftRevision(workshopStage.revision);
  };
  const showTooltip = (element: HTMLElement, id: string) => {
    const rect = element.getBoundingClientRect();
    setTooltip({
      id,
      left: Math.max(12, Math.min(rect.left, window.innerWidth - 380)),
      top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 200)),
    });
  };
  const sortHeader = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? sort.direction : 'none'}>
      <button
        type="button"
        className="hotspot-sort-button"
        onClick={() =>
          setSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
          }))
        }
      >
        {label}
        <span aria-hidden="true">{sort.key === key ? (sort.direction === 'ascending' ? ' ↑' : ' ↓') : ' ↕'}</span>
      </button>
    </th>
  );
  const anchorButton = (id: string) => {
    const node = model.nodeById.get(id);
    return (
      node && (
        <button type="button" key={id} onClick={() => onChange(mapRouteForNode(model, id))}>
          {node.name}
        </button>
      )
    );
  };
  return (
    <section className="hotspot-page" aria-label="Points chauds de la publication">
      <header className="hotspot-page-header">
        <div>
          <h2>Points chauds</h2>
          <p>
            {filtered.length} sur {groupHotspots.length} · Publication {model.version}
            {workshopCount ? ` · ${workshopCount} en atelier` : ''}
          </p>
        </div>
        {!chosen && (
          <div className="hotspot-page-tools">
            <label>
              <span className="sr-only">Rechercher un point chaud</span>
              <input
                type="search"
                value={query}
                placeholder="Rechercher un sujet…"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
              Filtres <ChevronDown size={15} className={filtersOpen ? 'is-open' : ''} />
            </button>
          </div>
        )}
      </header>
      {!chosen && filtersOpen && (
        <div className="hotspot-catalog-filters" role="group" aria-label="Filtres des points chauds">
          <HotspotFilterFields
            filters={filters}
            onChange={(updates) => setFilters((current) => updateHotspotMapFilters(current, updates))}
          />
        </div>
      )}
      {changes.length > 0 && (
        <div className="hotspot-edit-bar" role="status">
          <span>
            <strong>
              {changes.length} ligne{changes.length > 1 ? 's' : ''} modifiée{changes.length > 1 ? 's' : ''}
            </strong>
            {staleDrafts
              ? conflicts.length
                ? ` · Le staging a changé aussi sur : ${conflicts.join(', ')}.`
                : ' · Le staging a changé sur d’autres champs : tes saisies peuvent être reprises.'
              : ' · En attente de validation dans le staging.'}
          </span>
          {staleDrafts && workshopStage && (
            <button type="button" onClick={rebaseDrafts}>
              {conflicts.length ? 'Conserver mes valeurs sur ces champs' : 'Reprendre mes saisies'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setDrafts({});
              setDraftBases({});
              setDraftRevision(null);
              setSaveMessage('');
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            className="hotspot-save-button"
            disabled={staleDrafts || invalidDrafts || saving}
            onClick={() => void save()}
          >
            {saving ? 'Enregistrement…' : 'Valider les modifications'}
          </button>
        </div>
      )}
      {saveMessage && (
        <p className="hotspot-save-message" role="status">
          {saveMessage}
        </p>
      )}
      {!chosen && !workshopStage && (
        <p className="hotspot-workshop-note">
          Édition indisponible pour cette publication ou ce staging. Consulte Aide → Mode atelier pour le diagnostic.
        </p>
      )}
      {groupIds.size > 0 && (
        <div className="hotspot-group-filter" role="status">
          <strong>{groupHotspots.length} points chauds de ce groupe</strong>
          <button type="button" onClick={() => onChange({ hotspot: '', hotspotGroup: '' })}>
            Voir tous les points chauds
          </button>
        </div>
      )}
      {chosen ? (
        <article className="hotspot-detail">
          <button type="button" onClick={() => onChange({ hotspot: '' })}>
            ← {groupIds.size ? 'Retour au groupe' : 'Tous les points chauds'}
          </button>
          <p className="hotspot-kicker">
            {chosen.workshop ? 'Atelier · ' : ''}
            {chosen.kind === 'integration' ? 'Intégration' : 'Périmètre'} · {STATUS[chosen.status]}
          </p>
          <h3>{chosen.title}</h3>
          {chosen.status === 'validated' && !chosen.selected_option_id && (
            <p className="hotspot-status-note">Problème et périmètre validés ; aucune option de résolution retenue.</p>
          )}
          <p>{chosen.problem}</p>
          <div className="hotspot-anchors" role="group" aria-label="Localisation">
            {chosen.location.node_ids.map(anchorButton)}
          </div>
          <dl className="hotspot-facts">
            <div>
              <dt>Criticité</dt>
              <dd>{SIZE(chosen.severity)}</dd>
            </div>
            <div>
              <dt>Difficulté politique</dt>
              <dd>{SIZE(chosen.complexity.political)}</dd>
            </div>
            <div>
              <dt>Difficulté d’implémentation</dt>
              <dd>{SIZE(chosen.complexity.implementation)}</dd>
            </div>
            <div>
              <dt>Arbitrage</dt>
              <dd>{LEVEL[chosen.arbitration_level] || chosen.arbitration_level}</dd>
            </div>
          </dl>
          <p>{publicText(chosen.complexity.rationale)}</p>
          {chosen.arbitration_note && <p>{publicText(chosen.arbitration_note)}</p>}
          <h4>Lecture du marché</h4>
          {chosen.market_view ? (
            <section className="hotspot-market">
              <p>
                <strong>Pratiques documentées :</strong> {chosen.market_view.finding}
              </p>
              <p>
                <strong>Avis pour FLOW :</strong> {chosen.market_view.flow_assessment}
              </p>
              <p>
                <strong>Limites :</strong> {chosen.market_view.limits}
              </p>
              <ul>
                {chosen.market_view.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.publisher} — {source.title}
                    </a>
                    {' : '}
                    {source.relevance}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p>Comparaison marché non documentée pour ce point chaud.</p>
          )}
          {documents.length > 0 && (
            <section className="hotspot-documents">
              <h4>Documents</h4>
              <ul>
                {documents.map((document) => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => onChange({ view: 'documents', document: document.id, hotspot: '' })}
                    >
                      {document.title}
                    </button>
                    {' · '}
                    <a href={documentUrl(model, document)} download={`flow-atlas-${document.id}.pdf`}>
                      Télécharger le PDF
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <h4>Cas d’usage</h4>
          <ul>
            {chosen.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
          <h4>Options à instruire</h4>
          <div className="hotspot-options">
            {chosen.resolution_options.map((option) => (
              <section key={option.id}>
                <h5>{option.title}</h5>
                <p>{option.principle}</p>
                {option.effect && (
                  <p>
                    <strong>Effet attendu :</strong> {option.effect}
                  </p>
                )}
                {!!option.conditions?.length && (
                  <p>
                    <strong>À confirmer :</strong> {option.conditions.join(' · ')}
                  </p>
                )}
                {!!option.tradeoffs?.length && (
                  <p>
                    <strong>Compromis :</strong> {option.tradeoffs.join(' · ')}
                  </p>
                )}
                <small>
                  Implémentation : {SIZE(option.implementation_complexity)} ·{' '}
                  {option.evidence_state === 'hypothesis' ? 'Hypothèse' : option.evidence_state}
                </small>
              </section>
            ))}
          </div>
          <details className="hotspot-provenance">
            <summary>Sources et réserves détaillées</summary>
            <p>
              {chosen.origin.repository} · {chosen.origin.source_id}
            </p>
            <code>{chosen.origin.path}</code>
            <p>{chosen.origin.evidence_limit}</p>
            <small>{chosen.review.note}</small>
          </details>
        </article>
      ) : (
        <div className="hotspot-table-scroll" role="region" aria-label="Tableau des points chauds" tabIndex={0}>
          <table className="hotspot-table">
            <thead>
              <tr>
                {sortHeader('title', 'Point chaud')}
                {sortHeader('kind', 'Type')}
                {sortHeader('scope', 'Périmètre')}
                {sortHeader('severity', 'Criticité')}
                {sortHeader('political', 'Politique')}
                {sortHeader('implementation', 'Implémentation')}
                {sortHeader('status', 'Statut')}
                {sortHeader('arbitration_level', 'Arbitrage')}
                <th scope="col">
                  <span className="sr-only">Ouvrir la fiche</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const draft = drafts[item.id] || draftFor(item);
                const severity = severityForComplexities(draft.political, draft.implementation) || item.severity;
                const canEdit = Boolean(workshopStage);
                return (
                  <tr key={item.id} className={changes.some((change) => change.id === item.id) ? 'is-draft' : ''}>
                    <td className="hotspot-table-subject">
                      {canEdit ? (
                        <input
                          aria-label={`Titre de ${item.title}`}
                          value={draft.title}
                          onChange={(event) => edit(item, 'title', event.target.value)}
                        />
                      ) : (
                        <button
                          type="button"
                          className="hotspot-title-button"
                          aria-describedby={tooltip?.id === item.id ? `hotspot-summary-${item.id}` : undefined}
                          onClick={() => onChange({ hotspot: item.id })}
                          onMouseEnter={(event) => showTooltip(event.currentTarget, item.id)}
                          onMouseLeave={() => setTooltip(null)}
                          onFocus={(event) => showTooltip(event.currentTarget, item.id)}
                          onBlur={() => setTooltip(null)}
                        >
                          {item.title}
                        </button>
                      )}
                      <span className="hotspot-subject-tools">
                        {item.workshop && <small>Atelier</small>}
                        <span className="hotspot-subject-info">
                          <button
                            type="button"
                            aria-label={`Résumé de ${item.title}`}
                            aria-describedby={tooltip?.id === item.id ? `hotspot-summary-${item.id}` : undefined}
                            onMouseEnter={(event) => showTooltip(event.currentTarget, item.id)}
                            onMouseLeave={() => setTooltip(null)}
                            onFocus={(event) => showTooltip(event.currentTarget, item.id)}
                            onBlur={() => setTooltip(null)}
                          >
                            <Info size={15} aria-hidden="true" />
                          </button>
                          {tooltip?.id === item.id && (
                            <span
                              id={`hotspot-summary-${item.id}`}
                              role="tooltip"
                              className="hotspot-subject-tooltip"
                              style={{ left: tooltip.left, top: tooltip.top }}
                            >
                              <strong>Problème</strong>
                              {item.problem}
                              {item.examples[0] && (
                                <span>
                                  <strong>Exemple</strong>
                                  {item.examples[0]}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </span>
                    </td>
                    <td>{item.kind === 'integration' ? 'Intégration' : 'Périmètre'}</td>
                    <td className="hotspot-table-scope">
                      {item.location.node_ids.map((id) => model.nodeById.get(id)?.name || id).join(' · ')}
                    </td>
                    <td>
                      <span className={`hotspot-table-criticality severity-${severity}`}>
                        <Flame size={15} aria-hidden="true" /> {SIZE(severity)}
                      </span>
                    </td>
                    <td>
                      {canEdit ? (
                        <select
                          aria-label={`Complexité politique de ${item.title}`}
                          value={draft.political}
                          onChange={(event) => edit(item, 'political', event.target.value)}
                        >
                          {['S', 'M', 'L', 'XL', 'unassessed'].map((level) => (
                            <option key={level} value={level}>
                              {SIZE(level)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        SIZE(item.complexity.political)
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <select
                          aria-label={`Complexité d’implémentation de ${item.title}`}
                          value={draft.implementation}
                          onChange={(event) => edit(item, 'implementation', event.target.value)}
                        >
                          {['S', 'M', 'L', 'XL', 'unassessed'].map((level) => (
                            <option key={level} value={level}>
                              {SIZE(level)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        SIZE(item.complexity.implementation)
                      )}
                    </td>
                    <td>
                      {canEdit && ['discovered', 'shared'].includes(item.status) ? (
                        <select
                          aria-label={`Statut de ${item.title}`}
                          value={draft.status}
                          onChange={(event) => edit(item, 'status', event.target.value)}
                        >
                          <option value="discovered">Découvert</option>
                          <option value="shared">Partagé</option>
                        </select>
                      ) : (
                        STATUS[item.status]
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <select
                          aria-label={`Arbitrage de ${item.title}`}
                          value={draft.arbitration_level}
                          onChange={(event) => edit(item, 'arbitration_level', event.target.value)}
                        >
                          {Object.entries(LEVEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        LEVEL[item.arbitration_level] || item.arbitration_level
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="hotspot-table-open"
                        onClick={() => onChange({ hotspot: item.id })}
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="hotspot-table-empty">
                    Aucun point chaud avec ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
