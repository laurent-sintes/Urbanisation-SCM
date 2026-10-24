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
import { ui } from './ui.ts';
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
      : ui('dependenciesPane.relations_du_perimetre'));
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
    <section
      className="map-panel dependencies-pane"
      data-testid="dependencies-pane"
      aria-label={ui('dependenciesPane.relations_metier')}
    >
      <div className="map-toolbar">
        <div>
          <strong>
            {focus && options.depth !== 0
              ? ui('dependenciesPane.autour_de', { name: focus.name })
              : ui('dependenciesPane.toutes_les_relations_publiees')}
          </strong>
          <span className="toolbar-note">
            {ui('dependenciesPane.filtre_les_relations_puis_ouvre_leur_qualification_complete')}
          </span>
        </div>
      </div>
      <details className="dependency-settings">
        <summary>{ui('dependenciesPane.niveau_et_profondeur')}</summary>
        <div className="dependency-controls">
          <label>
            {ui('dependenciesPane.niveau_de_lecture')}
            <select
              aria-label={ui('dependenciesPane.niveau_de_lecture')}
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
            {ui('dependenciesPane.profondeur')}
            <select
              aria-label={ui('dependenciesPane.profondeur')}
              value={options.depth}
              onChange={(e) => changes({ graphDepth: Number(e.target.value) as GraphRoute['graphDepth'] })}
            >
              <option value="1">{ui('dependenciesPane.voisins_directs')}</option>
              <option value="2">{ui('dependenciesPane.a_deux_pas')}</option>
              <option value="3">{ui('dependenciesPane.a_trois_pas')}</option>
              <option value="0">{ui('dependenciesPane.toute_la_publication')}</option>
            </select>
          </label>
        </div>
      </details>
      <details className="dependency-options">
        <summary>{ui('dependenciesPane.affiner_l_exploration')}</summary>
        <div className="dependency-controls">
          <label>
            {ui('dependenciesPane.liens_entre_voisins')}
            <select
              aria-label={ui('dependenciesPane.liens_entre_voisins')}
              value={options.includeNeighborLinks ? 'all' : 'direct'}
              onChange={(e) => changes({ graphNeighbors: e.target.value === 'all' })}
            >
              <option value="direct">{ui('dependenciesPane.liens_parcourus_seulement')}</option>
              <option value="all">{ui('dependenciesPane.inclure_les_liens_entre_voisins')}</option>
            </select>
          </label>
          <label>
            {ui('dependenciesPane.point_de_depart')}
            <select
              aria-label={ui('dependenciesPane.point_de_depart')}
              value={focusId || ''}
              onChange={(e) => enter(e.target.value)}
            >
              <option value="">{ui('dependenciesPane.toute_la_publication')}</option>
              {focusChoices.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} · {n.displayCode ?? n.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            {ui('dependenciesPane.sens_de_parcours')}
            <select
              aria-label={ui('dependenciesPane.sens_de_parcours')}
              value={options.direction}
              onChange={(e) => changes({ graphDirection: e.target.value as GraphRoute['graphDirection'] })}
            >
              <option value="both">{ui('dependenciesPane.dans_les_deux_sens')}</option>
              <option value="outgoing">{ui('dependenciesPane.vers_les_cibles')}</option>
              <option value="incoming">{ui('dependenciesPane.vers_les_sources')}</option>
            </select>
          </label>
          <label>
            {ui('dependenciesPane.qualification')}
            <select
              aria-label={ui('dependenciesPane.qualification')}
              value={options.family}
              onChange={(e) => changes({ graphFamily: e.target.value as GraphRoute['graphFamily'] })}
            >
              <option value="all">{ui('dependenciesPane.tous_les_liens')}</option>
              <option value="needs">{ui('dependenciesPane.role_a_besoin_de_explicite')}</option>
              <option value="other">{ui('dependenciesPane.autres_relations')}</option>
            </select>
          </label>
        </div>
      </details>
      <div className="dependency-summary" role="status">
        <span>
          {projection.nodes.length}
          {ui('dependenciesPane.elements')}
          {projection.stats.visibleRelations}
          {ui('dependenciesPane.relations_publiees')}
          {projection.stats.internalRelations > 0 &&
            ui('dependenciesPane.au_sein_d_un_meme_perimetre', {
              internalRelations: projection.stats.internalRelations,
            })}
        </span>
        <span>
          {ui('dependenciesPane.publication')}
          {model.version}
        </span>
      </div>
      <div className="dependency-inspector" data-testid="dependency-inspector">
        <div className="dependency-list-controls">
          <label className="dependency-search">
            {ui('dependenciesPane.rechercher_dans_les_relations')}
            <input
              ref={searchInput}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={ui('dependenciesPane.source_cible_sens_ou_identifiant')}
            />
          </label>
          <label className="dependency-picker">
            {ui('dependenciesPane.restreindre_la_liste')}
            <select
              aria-label={ui('dependenciesPane.restreindre_la_liste')}
              value={active ? `${active.kind}|${active.id}` : ''}
              onChange={(e) => {
                const [kind, ...parts] = e.target.value.split('|');
                select(kind ? { kind: kind as Selection['kind'], id: parts.join('|') } : null);
              }}
            >
              <option value="">{ui('dependenciesPane.toutes_les_relations_du_perimetre')}</option>
              <optgroup label={ui('dependenciesPane.elements_2')}>
                {projection.nodes.map((n) => (
                  <option key={n.id} value={`node|${n.id}`}>
                    {n.item.name} · {n.item.displayCode ?? n.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label={ui('dependenciesPane.interactions_regroupees')}>
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
                  {pickedNode.internalRelationIds.length}
                  {ui('dependenciesPane.relation_s_interne_s')}
                </span>
              </div>
            </div>
            <div className="dependency-node-actions">
              <button type="button" className="secondary-button" onClick={() => enter(pickedNode.id)}>
                {ui('dependenciesPane.explorer_depuis_cet_element')}
                <ArrowRight size={14} />
              </button>
              <button type="button" className="secondary-button" onClick={() => onRead(pickedNode.id)}>
                {ui('dependenciesPane.ouvrir_la_fiche')}
                <ArrowUpRight size={14} />
              </button>
            </div>
            {pickedNode.memberIds.length > 1 && (
              <details>
                <summary>
                  {ui('dependenciesPane.elements_regroupes')}
                  {pickedNode.memberIds.length})
                </summary>
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
              <span role="status">
                {shownRelations.length}
                {ui('dependenciesPane.relation_s')}
              </span>
            </div>
            <div
              ref={list}
              className="accessible-relations"
              role="group"
              aria-label={ui('dependenciesPane.liste_des_relations')}
            >
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
                    <span role="img" aria-label={ui('dependenciesPane.vers')}>
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
                            ? ui('dependenciesPane.qualification_non_renseignee_dans_cette_publication')
                            : link.label),
                      ),
                    )}
                  </small>
                  {[link.sourceId, link.targetId].some((id) => model.nodeById.get(id)?.kind === 'behavior') && (
                    <small>
                      {ui('dependenciesPane.comportement_de_la_capacite')}{' '}
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
                    ? ui('dependenciesPane.aucune_relation_ne_correspond_a_cette_recherche')
                    : ui('dependenciesPane.aucune_relation_metier_publiee_avec_ces_criteres')}
                </p>
              )}
            </div>
          </section>
          {relation && (
            <aside
              ref={detail}
              id={detailId}
              className="dependency-detail"
              aria-label={ui('dependenciesPane.relation_selectionnee')}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && !event.defaultPrevented) {
                  event.preventDefault();
                  closeRelation();
                }
              }}
            >
              <div className="dependency-detail-heading">
                <h2>{ui('dependenciesPane.relation_selectionnee')}</h2>
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={ui('dependenciesPane.retour_a_la_liste_des_relations')}
                  onClick={closeRelation}
                >
                  <X size={16} aria-hidden="true" />
                  {ui('dependenciesPane.retour_a_la_liste')}
                </button>
              </div>
              <RelationDetails model={model} relation={relation} />
              {!projection.relations.some((r) => r.id === relation.id) && (
                <p className="dependency-help">
                  {ui('dependenciesPane.cette_relation_appartient_a_la_publication_mais_reste_hors_du_per')}
                </p>
              )}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
