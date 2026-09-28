import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Maximize2, Network } from 'lucide-react';
import { CytoscapeCanvas } from './CytoscapeCanvas';
import { dependencyLevel, dependencyLevels, projectDependencies, type DependencyOptions } from './dependencyGraph';
import { RelationDetails } from './components/BusinessSheet';
import { ReferenceLink } from './components/ModelLinks';
import { NodeIcon } from './icons';
import { kindLabel } from './presentation';
import { hasAreaLevels, parentRelationOf } from './model';
import { publicText } from './publicText';
import type { GraphRoute } from './navigation';
import type { PublishedModel, SourceLocator } from './types';
import './dependencies.css';

interface Props {
  model: PublishedModel; focusId?: string; relationId?: string; settings: GraphRoute;
  onSettings: (changes: GraphRoute) => void;
  onSelectRelation: (id: string) => void;
  onFocus: (id: string) => void;
  onRead: (id: string) => void;
}
type Selection = { kind: 'node' | 'edge'; id: string };

export function DependenciesPane({ model, focusId, relationId, settings, onSettings, onSelectRelation, onFocus, onRead }: Props) {
  const focus = focusId ? model.nodeById.get(focusId) : undefined;
  const defaultLevel = focus?.kind === 'business_system' ? 'business_system' : !focus || focus.levelRef === 'universe' || ['domain', 'area', 'reference'].includes(focus.kind) ? (hasAreaLevels(model) ? 'area' : 'domain') : 'capability';
  const options = useMemo<DependencyOptions>(() => ({
    focusId, level: dependencyLevel(model, settings.graphLevel || defaultLevel),
    depth: settings.graphDepth ?? (focusId ? 1 : 0), direction: settings.graphDirection || 'both', family: settings.graphFamily || 'all',
    includeNeighborLinks: settings.graphNeighbors ?? false,
  }), [model, focusId, defaultLevel, settings.graphLevel, settings.graphDepth, settings.graphDirection, settings.graphFamily, settings.graphNeighbors]);
  const projection = useMemo(() => projectDependencies(model, options), [model, options]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showGraph, setShowGraph] = useState(() => !matchMedia('(max-width: 600px)').matches);
  const [fullscreenError, setFullscreenError] = useState('');
  const pane = useRef<HTMLElement>(null);
  const relationEdge = relationId ? projection.edges.find(e => e.relationIds.includes(relationId)) : undefined;
  // A direct link/history change is authoritative over the previous local selection.
  const pickedNode = relationId ? projection.nodes.find(n => n.internalRelationIds.includes(relationId)) : selection?.kind === 'node' ? projection.nodes.find(n => n.id === selection.id) : undefined;
  const pickedEdge = relationId ? relationEdge : selection?.kind === 'edge' ? projection.edges.find(e => e.id === selection.id) : undefined;
  const active = pickedNode ? { kind: 'node' as const, id: pickedNode.id } : pickedEdge ? { kind: 'edge' as const, id: pickedEdge.id } : null;
  const relation = relationId ? model.relationById.get(relationId) : undefined;
  const inspectIds = new Set(pickedNode ? [
    ...pickedNode.internalRelationIds,
    ...projection.edges.filter(e => e.source === pickedNode.id || e.target === pickedNode.id).flatMap(e => e.relationIds),
  ] : pickedEdge?.relationIds || projection.relations.map(r => r.id));
  const shownRelations = projection.relations.filter(r => inspectIds.has(r.id));
  const selectedName = pickedNode?.item.name || (pickedEdge ? `${model.nodeById.get(pickedEdge.source)?.name || pickedEdge.source} → ${model.nodeById.get(pickedEdge.target)?.name || pickedEdge.target}` : 'Relations du périmètre');
  const select = (value: Selection | null) => {
    setSelection(value);
    onSelectRelation(value?.kind === 'edge' ? projection.edges.find(e => e.id === value.id)?.relationIds[0] || '' : '');
  };
  const changes = (next: GraphRoute) => { setSelection(null); onSelectRelation(''); onSettings(next); };
  const enter = (id: string) => { setSelection(null); onFocus(id); };
  const focusChoices = model.nodes.filter(n => n.kind !== 'behavior' || n.id === focusId).sort((a,b) => a.name.localeCompare(b.name, 'fr'));

  return <section ref={pane} className="map-panel dependencies-pane" data-testid="dependencies-pane" aria-label="Graphe des relations métier">
    <div className="map-toolbar"><div><strong>{focus && options.depth !== 0 ? `Autour de ${focus.name}` : 'Toutes les relations publiées'}</strong><span className="toolbar-note">Explore les interactions, puis ouvre le détail de chaque lien.</span></div>
      <button className="dependency-fullscreen" aria-label="Afficher le graphe en plein écran" title="Plein écran" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else { setShowGraph(true); void pane.current?.requestFullscreen().catch(() => setFullscreenError('Le plein écran est indisponible dans ce navigateur.')); } }}><Maximize2 size={17}/></button>
    </div>
    {fullscreenError && <p role="status" className="dependency-help">{fullscreenError}</p>}
    <details className="dependency-settings"><summary>Régler le niveau et la profondeur</summary><div className="dependency-controls">
      <label>Niveau de lecture<select aria-label="Niveau de lecture" value={options.level} onChange={e => changes({ graphLevel: e.target.value as GraphRoute['graphLevel'] })}>{dependencyLevels(model).map(level => <option key={level.value} value={level.value}>{level.label}</option>)}</select></label>
      <label>Profondeur<select aria-label="Profondeur" value={options.depth} onChange={e => changes({ graphDepth: Number(e.target.value) as GraphRoute['graphDepth'] })}><option value="1">Voisins directs</option><option value="2">À deux pas</option><option value="3">À trois pas</option><option value="0">Toute la publication</option></select></label>
    </div>
    </details>
    <details className="dependency-options"><summary>Affiner l’exploration</summary><div className="dependency-controls">
      <label>Liens entre voisins<select aria-label="Liens entre voisins" value={options.includeNeighborLinks ? 'all' : 'direct'} onChange={e => changes({ graphNeighbors: e.target.value === 'all' })}><option value="direct">Liens parcourus seulement</option><option value="all">Inclure les liens entre voisins</option></select></label>
      <label>Point de départ<select aria-label="Point de départ" value={focusId || ''} onChange={e => enter(e.target.value)}><option value="">Toute la publication</option>{focusChoices.map(n => <option key={n.id} value={n.id}>{n.name} · {n.displayCode ?? n.id}</option>)}</select></label>
      <label>Sens de parcours<select aria-label="Sens de parcours" value={options.direction} onChange={e => changes({ graphDirection: e.target.value as GraphRoute['graphDirection'] })}><option value="both">Dans les deux sens</option><option value="outgoing">Vers les cibles</option><option value="incoming">Vers les sources</option></select></label>
      <label>Qualification<select aria-label="Qualification" value={options.family} onChange={e => changes({ graphFamily: e.target.value as GraphRoute['graphFamily'] })}><option value="all">Tous les liens</option><option value="needs">Rôle « a besoin de » explicite</option><option value="other">Autres relations</option></select></label>
      <label>Disposition<select aria-label="Disposition" value={settings.graphLayout || 'organic'} onChange={e => changes({ graphLayout: e.target.value as GraphRoute['graphLayout'] })}><option value="organic">Organique</option><option value="hierarchical">Hiérarchique</option></select></label>
      <label>Libellés<select aria-label="Libellés" value={settings.graphLabels || 'focus'} onChange={e => changes({ graphLabels: e.target.value as GraphRoute['graphLabels'] })}><option value="focus">Autour de la sélection</option><option value="all">Tous</option></select></label>
    </div></details>
    <div className="dependency-summary" role="status"><span>{projection.nodes.length} éléments · {projection.stats.visibleRelations} relations affichées{projection.stats.internalRelations > 0 && ` · ${projection.stats.internalRelations} regroupées`}</span><span>Publication {model.version}</span></div>
    <button className="secondary-button graph-visibility" aria-expanded={showGraph} onClick={() => setShowGraph(!showGraph)}>{showGraph ? 'Masquer le graphe' : 'Afficher le graphe'}</button>
    {showGraph && <CytoscapeCanvas projection={projection} layout={settings.graphLayout || 'organic'} labels={settings.graphLabels || 'focus'} selectedId={active?.id} onSelect={select} onRead={onRead}/>}
    {!projection.relations.length && <p className="dependency-empty"><Network size={18}/>Aucune relation métier publiée avec ces critères.</p>}
    <div className="dependency-legend" hidden={!showGraph}><span><i/>A besoin de · rôle explicite</span><span><i className="other"/>Autre relation · voir sa qualification</span></div>
    <div className="map-footer" hidden={!showGraph}><span>Molette : zoom · Glisser : déplacer · Les liens des comportements sont regroupés avec leur capacité</span><span>Lecture seule</span></div>
    <div className="dependency-inspector" data-testid="dependency-inspector">
      <label className="dependency-picker">Inspecter un élément<select aria-label="Inspecter un élément" value={active ? `${active.kind}|${active.id}` : ''} onChange={e => { const [kind,...parts] = e.target.value.split('|'); select(kind ? {kind:kind as Selection['kind'],id:parts.join('|')} : null); }}>
        <option value="">Choisir un nœud ou un lien…</option>
        <optgroup label="Éléments">{projection.nodes.map(n => <option key={n.id} value={`node|${n.id}`}>{n.item.name} · {n.item.displayCode ?? n.id}</option>)}</optgroup>
        <optgroup label="Liens regroupés">{projection.edges.map(e => <option key={e.id} value={`edge|${e.id}`}>{model.nodeById.get(e.source)?.name || e.source} → {model.nodeById.get(e.target)?.name || e.target} · {e.label} · {e.count}</option>)}</optgroup>
      </select></label>
      {pickedNode && <div className="dependency-node-detail"><div className="dependency-node-heading"><NodeIcon node={pickedNode.item} size={24}/><div><strong>{pickedNode.item.name}</strong><span>{kindLabel(pickedNode.item)} · {pickedNode.item.displayCode ?? pickedNode.id} · {pickedNode.internalRelationIds.length} relation(s) interne(s)</span></div></div>
        <div className="dependency-node-actions"><button className="secondary-button" onClick={() => enter(pickedNode.id)}>Explorer depuis cet élément<ArrowRight size={14}/></button><button className="secondary-button" onClick={() => onRead(pickedNode.id)}>Ouvrir la fiche<ArrowUpRight size={14}/></button></div>
        {pickedNode.memberIds.length > 1 && <details><summary>Éléments regroupés ({pickedNode.memberIds.length})</summary><ul>{pickedNode.memberIds.map(id => <li key={id}><ReferenceLink target={id}>{model.nodeById.get(id)?.name || id}</ReferenceLink></li>)}</ul></details>}
      </div>}
      <details className="dependency-relations" key={active ? `${active.kind}:${active.id}` : 'all'} open={!showGraph || Boolean(active)}><summary>{selectedName} · {shownRelations.length} relation(s) d’origine</summary>
        <div className="accessible-relations" aria-label="Liste des relations">{shownRelations.map(link => <button key={link.id} data-relation-id={link.id} aria-pressed={relationId === link.id} onClick={() => onSelectRelation(link.id)}>
          <span>{model.nodeById.get(link.sourceId)?.name || link.sourceId}<span aria-hidden="true"> → </span>{model.nodeById.get(link.targetId)?.name || link.targetId}</span>
          <small>{publicText(link.qualification.meaning || (link.label === link.type ? 'Qualification non renseignée dans cette publication.' : link.label))}</small>
          {[link.sourceId,link.targetId].some(id => model.nodeById.get(id)?.kind === 'behavior') && <small>Comportement projeté sur sa capacité : {[link.sourceId,link.targetId].filter(id => model.nodeById.get(id)?.kind === 'behavior').map(id => model.nodeById.get(parentRelationOf(model,id)?.sourceId || '')?.name).join(', ')}</small>}
        </button>)}{!shownRelations.length && <p>Aucune relation métier publiée dans cette sélection.</p>}</div>
      </details>
      {relation && <><RelationDetails model={model} relation={relation}/>{!projection.relations.some(r => r.id === relation.id) && <p className="dependency-help">Cette relation appartient à la publication, mais reste hors du périmètre affiché.</p>}</>}
    </div>
  </section>;
}
