import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { RelationDetails } from './components/BusinessSheet';
import { MetaTypeLabel, ReferenceLink } from './components/ModelLinks';
import { type DependencyOptions, dependencyLevel, dependencyLevels, projectDependencies } from './dependencyGraph';
import { NodeIcon } from './icons';
import { plainInlineText } from './inlineLinks';
import { hasAreaLevels, parentRelationOf } from './model';
import type { GraphRoute } from './navigation';
import { publicText } from './publicText';
import type { PublishedModel } from './types';
import './dependencies.css';

interface Props {
  model: PublishedModel;
  focusId?: string;
  relationId?: string;
  settings: GraphRoute;
  onSettings: (changes: GraphRoute) => void;
  onSelectRelation: (id: string) => void;
  onFocus: (id: string) => void;
  onRead: (id: string) => void;
}
type Selection = { kind: 'node' | 'edge'; id: string };
const searchable = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');

export function DependenciesPane({
  model,
  focusId,
  relationId,
  settings,
  onSettings,
  onSelectRelation,
  onFocus,
  onRead,
}: Props) {
  const focus = focusId ? model.nodeById.get(focusId) : undefined;
  const defaultLevel =
    (!focus && model.nodes.some((node) => node.kind === 'business_system')) || focus?.kind === 'business_system'
      ? 'business_system'
      : !focus || focus.levelRef === 'universe' || ['domain', 'area', 'reference'].includes(focus.kind)
        ? hasAreaLevels(model)
          ? 'area'
          : 'domain'
        : 'capability';
  const options = useMemo<DependencyOptions>(
    () => ({
      focusId,
      level: dependencyLevel(model, settings.graphLevel || defaultLevel),
      depth: settings.graphDepth ?? (focusId ? 1 : 0),
      direction: settings.graphDirection || 'both',
      family: settings.graphFamily || 'all',
      includeNeighborLinks: settings.graphNeighbors ?? false,
    }),
    [
      model,
      focusId,
      defaultLevel,
      settings.graphLevel,
      settings.graphDepth,
      settings.graphDirection,
      settings.graphFamily,
      settings.graphNeighbors,
    ],
  );
  const projection = useMemo(() => projectDependencies(model, options), [model, options]);
  const selectionContext = JSON.stringify([model.version, options]);
  const [selectionState, setSelection] = useState<{ context: string; value: Selection } | null>(null);
  const selection = selectionState?.context === selectionContext ? selectionState.value : null;
  const [search, setSearch] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLElement>(null);
  const relationTrigger = useRef<HTMLButtonElement>(null);
  const detailId = useId();
  const pickedNode = selection?.kind === 'node' ? projection.nodes.find((n) => n.id === selection.id) : undefined;
  const pickedEdge = selection?.kind === 'edge' ? projection.edges.find((e) => e.id === selection.id) : undefined;
  const active = pickedNode
    ? { kind: 'node' as const, id: pickedNode.id }
    : pickedEdge
      ? { kind: 'edge' as const, id: pickedEdge.id }
      : null;
  const relation = relationId ? model.relationById.get(relationId) : undefined;
  const inspectIds = new Set(
    pickedNode
      ? [
          ...pickedNode.internalRelationIds,
          ...projection.edges
            .filter((e) => e.source === pickedNode.id || e.target === pickedNode.id)
            .flatMap((e) => e.relationIds),
        ]
      : pickedEdge?.relationIds || projection.relations.map((r) => r.id),
  );
  const searchValue = searchable(search.trim());
  const shownRelations = projection.relations.filter((link) => {
    if (!inspectIds.has(link.id)) return false;
    const endpoints = [link.sourceId, link.targetId].flatMap((id) => {
      const node = model.nodeById.get(id);
      return [node?.name || id, node?.displayCode || ''];
    });
    return searchable(
      [...endpoints, link.id, link.label, publicText(link.qualification.meaning || '')].join(' '),
    ).includes(searchValue);
  });
  const selectedName =
    pickedNode?.item.name ||
    (pickedEdge
      ? `${model.nodeById.get(pickedEdge.source)?.name || pickedEdge.source} → ${model.nodeById.get(pickedEdge.target)?.name || pickedEdge.target}`
      : 'Relations du périmètre');
  const select = (value: Selection | null) => {
    setSelection(value ? { context: selectionContext, value } : null);
    onSelectRelation('');
  };
  const closeRelation = () => {
    onSelectRelation('');
    requestAnimationFrame(() => {
      const origin = relationTrigger.current;
      const currentRow = [...(list.current?.querySelectorAll<HTMLButtonElement>('[data-relation-id]') || [])].find(
        (button) => button.dataset.relationId === relationId,
      );
      const target =
        origin?.isConnected && origin.dataset.relationId === relationId ? origin : currentRow || searchInput.current;
      target?.focus();
    });
  };
  useEffect(() => {
    if (!relation) return;
    detail.current?.focus({ preventScroll: true });
    detail.current?.scrollIntoView({
      block: matchMedia('(max-width: 1150px)').matches ? 'start' : 'nearest',
      behavior: 'instant',
    });
  }, [relation]);
  const changes = (next: GraphRoute) => {
    setSelection(null);
    onSettings(next);
  };
  const enter = (id: string) => {
    setSelection(null);
    onFocus(id);
  };
  const focusChoices = model.nodes
    .filter((n) => n.kind !== 'behavior' || n.id === focusId)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <section className="map-panel dependencies-pane" data-testid="dependencies-pane" aria-label="Relations métier">
      <div className="map-toolbar">
        <div>
          <strong>{focus && options.depth !== 0 ? `Autour de ${focus.name}` : 'Toutes les relations publiées'}</strong>
          <span className="toolbar-note">Filtre les relations, puis ouvre leur qualification complète.</span>
        </div>
      </div>
      <details className="dependency-settings">
        <summary>Niveau et profondeur</summary>
        <div className="dependency-controls">
          <label>
            Niveau de lecture
            <select
              aria-label="Niveau de lecture"
              value={options.level}
              onChange={(e) => changes({ graphLevel: e.target.value as GraphRoute['graphLevel'] })}
            >
              {dependencyLevels(model).map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profondeur
            <select
              aria-label="Profondeur"
              value={options.depth}
              onChange={(e) => changes({ graphDepth: Number(e.target.value) as GraphRoute['graphDepth'] })}
            >
              <option value="1">Voisins directs</option>
              <option value="2">À deux pas</option>
              <option value="3">À trois pas</option>
              <option value="0">Toute la publication</option>
            </select>
          </label>
        </div>
      </details>
      <details className="dependency-options">
        <summary>Affiner l’exploration</summary>
        <div className="dependency-controls">
          <label>
            Liens entre voisins
            <select
              aria-label="Liens entre voisins"
              value={options.includeNeighborLinks ? 'all' : 'direct'}
              onChange={(e) => changes({ graphNeighbors: e.target.value === 'all' })}
            >
              <option value="direct">Liens parcourus seulement</option>
              <option value="all">Inclure les liens entre voisins</option>
            </select>
          </label>
          <label>
            Point de départ
            <select aria-label="Point de départ" value={focusId || ''} onChange={(e) => enter(e.target.value)}>
              <option value="">Toute la publication</option>
              {focusChoices.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} · {n.displayCode ?? n.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sens de parcours
            <select
              aria-label="Sens de parcours"
              value={options.direction}
              onChange={(e) => changes({ graphDirection: e.target.value as GraphRoute['graphDirection'] })}
            >
              <option value="both">Dans les deux sens</option>
              <option value="outgoing">Vers les cibles</option>
              <option value="incoming">Vers les sources</option>
            </select>
          </label>
          <label>
            Qualification
            <select
              aria-label="Qualification"
              value={options.family}
              onChange={(e) => changes({ graphFamily: e.target.value as GraphRoute['graphFamily'] })}
            >
              <option value="all">Tous les liens</option>
              <option value="needs">Rôle « a besoin de » explicite</option>
              <option value="other">Autres relations</option>
            </select>
          </label>
        </div>
      </details>
      <div className="dependency-summary" role="status">
        <span>
          {projection.nodes.length} éléments · {projection.stats.visibleRelations} relations publiées
          {projection.stats.internalRelations > 0 &&
            ` · ${projection.stats.internalRelations} au sein d’un même périmètre`}
        </span>
        <span>Publication {model.version}</span>
      </div>
      <div className="dependency-inspector" data-testid="dependency-inspector">
        <div className="dependency-list-controls">
          <label className="dependency-search">
            Rechercher dans les relations
            <input
              ref={searchInput}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Source, cible, sens ou identifiant…"
            />
          </label>
          <label className="dependency-picker">
            Restreindre la liste
            <select
              aria-label="Restreindre la liste"
              value={active ? `${active.kind}|${active.id}` : ''}
              onChange={(e) => {
                const [kind, ...parts] = e.target.value.split('|');
                select(kind ? { kind: kind as Selection['kind'], id: parts.join('|') } : null);
              }}
            >
              <option value="">Toutes les relations du périmètre</option>
              <optgroup label="Éléments">
                {projection.nodes.map((n) => (
                  <option key={n.id} value={`node|${n.id}`}>
                    {n.item.name} · {n.item.displayCode ?? n.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Interactions regroupées">
                {projection.edges.map((e) => (
                  <option key={e.id} value={`edge|${e.id}`}>
                    {model.nodeById.get(e.source)?.name || e.source} → {model.nodeById.get(e.target)?.name || e.target}{' '}
                    · {e.label} · {e.count}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
        {pickedNode && (
          <div className="dependency-node-detail">
            <div className="dependency-node-heading">
              <NodeIcon node={pickedNode.item} size={24} />
              <div>
                <strong>{pickedNode.item.name}</strong>
                <span>
                  <MetaTypeLabel node={pickedNode.item} /> · {pickedNode.item.displayCode ?? pickedNode.id} ·{' '}
                  {pickedNode.internalRelationIds.length} relation(s) interne(s)
                </span>
              </div>
            </div>
            <div className="dependency-node-actions">
              <button type="button" className="secondary-button" onClick={() => enter(pickedNode.id)}>
                Explorer depuis cet élément
                <ArrowRight size={14} />
              </button>
              <button type="button" className="secondary-button" onClick={() => onRead(pickedNode.id)}>
                Ouvrir la fiche
                <ArrowUpRight size={14} />
              </button>
            </div>
            {pickedNode.memberIds.length > 1 && (
              <details>
                <summary>Éléments regroupés ({pickedNode.memberIds.length})</summary>
                <ul>
                  {pickedNode.memberIds.map((id) => (
                    <li key={id}>
                      <ReferenceLink target={id}>{model.nodeById.get(id)?.name || id}</ReferenceLink>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        <div className={`dependency-content${relation ? ' has-detail' : ''}`}>
          <section className="dependency-relations" aria-label={selectedName}>
            <div className="dependency-list-heading">
              <h2>{selectedName}</h2>
              <span role="status">{shownRelations.length} relation(s)</span>
            </div>
            <div ref={list} className="accessible-relations" role="group" aria-label="Liste des relations">
              {shownRelations.map((link) => (
                <button
                  type="button"
                  key={link.id}
                  data-relation-id={link.id}
                  aria-pressed={relationId === link.id}
                  aria-controls={relationId === link.id ? detailId : undefined}
                  onClick={(event) => {
                    relationTrigger.current = event.currentTarget;
                    onSelectRelation(link.id);
                  }}
                >
                  <span>
                    {model.nodeById.get(link.sourceId)?.name || link.sourceId}
                    <span role="img" aria-label="vers">
                      {' '}
                      →{' '}
                    </span>
                    {model.nodeById.get(link.targetId)?.name || link.targetId}
                  </span>
                  <small>
                    {plainInlineText(
                      publicText(
                        link.qualification.meaning ||
                          (link.label === link.type
                            ? 'Qualification non renseignée dans cette publication.'
                            : link.label),
                      ),
                    )}
                  </small>
                  {[link.sourceId, link.targetId].some((id) => model.nodeById.get(id)?.kind === 'behavior') && (
                    <small>
                      Comportement de la capacité :{' '}
                      {[link.sourceId, link.targetId]
                        .filter((id) => model.nodeById.get(id)?.kind === 'behavior')
                        .map((id) => model.nodeById.get(parentRelationOf(model, id)?.sourceId || '')?.name)
                        .join(', ')}
                    </small>
                  )}
                </button>
              ))}
              {!shownRelations.length && (
                <p className="dependency-empty">
                  {searchValue
                    ? 'Aucune relation ne correspond à cette recherche.'
                    : 'Aucune relation métier publiée avec ces critères.'}
                </p>
              )}
            </div>
          </section>
          {relation && (
            <aside
              ref={detail}
              id={detailId}
              className="dependency-detail"
              aria-label="Relation sélectionnée"
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && !event.defaultPrevented) {
                  event.preventDefault();
                  closeRelation();
                }
              }}
            >
              <div className="dependency-detail-heading">
                <h2>Relation sélectionnée</h2>
                <button
                  type="button"
                  className="secondary-button"
                  aria-label="Retour à la liste des relations"
                  onClick={closeRelation}
                >
                  <X size={16} aria-hidden="true" />
                  Retour à la liste
                </button>
              </div>
              <RelationDetails model={model} relation={relation} />
              {!projection.relations.some((r) => r.id === relation.id) && (
                <p className="dependency-help">
                  Cette relation appartient à la publication, mais reste hors du périmètre affiché.
                </p>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
