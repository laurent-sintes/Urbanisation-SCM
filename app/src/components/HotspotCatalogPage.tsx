import { BadgeCheck, ChevronDown, CircleDot, Compass, Flame, Info, Lightbulb, ListChecks, Share2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { filterMapHotspots, type HotspotMapFilters, isHotspotVisible, severityForComplexities } from '../hotspotMap';
import { emptyResolution, RESOLUTION_STAGES, resolutionErrors, resolutionFor } from '../hotspotResolution';
import type { RouteState } from '../navigation';
import type { Hotspot, HotspotResolution, PublishedModel } from '../types';
import type { WorkshopStage, WorkshopTableChange } from '../workshop';
import { HotspotAssessmentGuide } from './HotspotAssessmentGuide';
import { HotspotDetail } from './HotspotDetail';
import { HotspotTooltipButton } from './HotspotDisplay';
import { HotspotFilterFields } from './HotspotFilterFields';
import { HotspotImpact } from './HotspotImpact';
import { ModelText } from './ModelLinks';
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
  | 'arbitration'
  | 'implementation'
  | 'status'
  | 'resolution'
  | 'arbitration_level';
const STATUS_RANK = ['discovered', 'shared', 'validated', 'resolved'];
const STATUS_ICON = {
  discovered: CircleDot,
  shared: Share2,
  validated: BadgeCheck,
  resolved: ListChecks,
};
const STAGE_ICON = {
  unassessed: CircleDot,
  to_explore: Compass,
  identified: Lightbulb,
  qualifying: ListChecks,
  ready_for_arbitration: BadgeCheck,
  credible: BadgeCheck,
};
type HotspotDraft = {
  visible: boolean;
  title: string;
  kind: Hotspot['kind'];
  node_ids: string[];
  arbitration: string;
  implementation: string;
  rationale: string;
  arbitration_rationale: string;
  implementation_rationale: string;
  status: Hotspot['status'];
  resolution: HotspotResolution;
  selected_option_id: string;
  resolution_note: string;
  arbitration_level: string;
};
const draftFor = (item: Hotspot): HotspotDraft => ({
  visible: isHotspotVisible(item),
  title: item.title,
  kind: item.kind,
  node_ids: [...item.location.node_ids],
  arbitration: item.complexity.arbitration,
  implementation: item.complexity.implementation,
  rationale: item.complexity.rationale,
  arbitration_rationale: item.complexity.arbitration_rationale || '',
  implementation_rationale: item.complexity.implementation_rationale || '',
  status: item.status,
  resolution: structuredClone(resolutionFor(item)),
  selected_option_id: item.selected_option_id || '',
  resolution_note: item.resolution_note || '',
  arbitration_level: item.arbitration_level,
});
const sameDraftValue = (a: HotspotDraft[keyof HotspotDraft], b: HotspotDraft[keyof HotspotDraft]) =>
  typeof a === 'object' && typeof b === 'object' ? JSON.stringify(a) === JSON.stringify(b) : a === b;

export function HotspotCatalogPage({
  model,
  route,
  onChange,
  workshopStage,
  filters,
  onFiltersChange,
  workshopMessage,
  onSaveWorkshopChanges,
}: {
  model: PublishedModel;
  route: RouteState;
  onChange: (changes: Partial<RouteState>) => void;
  workshopStage: WorkshopStage | null;
  filters: HotspotMapFilters;
  onFiltersChange: (changes: Partial<HotspotMapFilters>) => void;
  workshopMessage: string;
  onSaveWorkshopChanges: (changes: WorkshopTableChange[]) => Promise<void>;
}) {
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  const workshopCount = hotspots.filter((item) => item.workshop).length;
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'severity',
    direction: 'descending',
  });
  const [drafts, setDrafts] = useState<Record<string, HotspotDraft>>({});
  const [draftBases, setDraftBases] = useState<Record<string, HotspotDraft>>({});
  const [draftRevision, setDraftRevision] = useState<number | null>(null);
  const draftEditSequence = useRef(0);
  const [restoredKey, setRestoredKey] = useState('');
  const [storageReadFailedKey, setStorageReadFailedKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [dialog, setDialog] = useState<{ id: string; mode: 'location' | 'resolution' | 'complexity' } | null>(null);
  const [nodeQuery, setNodeQuery] = useState('');
  const dialogReturnFocus = useRef<HTMLElement | null>(null);
  const dialogFocus = useRef<HTMLElement | null>(null);
  const groupIds = new Set((route.hotspotGroup || '').split(',').filter(Boolean));
  const groupHotspots = groupIds.size ? hotspots.filter((item) => groupIds.has(item.id)) : hotspots;
  const chosen = hotspots.find((item) => item.id === route.hotspot);
  const page = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const fullscreenRoute = useRef('');
  const detailRoute = `${model.version}:${route.hotspot || ''}`;
  useEffect(() => {
    const owner = page.current;
    const update = () => setExpanded(document.fullscreenElement === page.current);
    document.addEventListener('fullscreenchange', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      if (owner && document.fullscreenElement === owner) void document.exitFullscreen().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (expanded && fullscreenRoute.current !== detailRoute && document.fullscreenElement === page.current) {
      void document.exitFullscreen().catch(() => {});
    }
  }, [expanded, detailRoute]);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === page.current) await document.exitFullscreen();
      else {
        fullscreenRoute.current = detailRoute;
        await page.current?.requestFullscreen();
      }
    } catch {
      setSaveMessage('Le plein écran est indisponible dans ce navigateur.');
    }
  };
  const storageKey = workshopStage ? `atlas-hotspot-drafts:${model.version}:${workshopStage.session_id}` : '';
  useEffect(() => {
    if (!storageKey) {
      setStorageWarning('');
      return;
    }
    if (restoredKey === storageKey) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      const restore = (entries: Record<string, Partial<HotspotDraft>> | undefined) =>
        Object.fromEntries(
          Object.entries(entries || {}).flatMap(([id, value]) => {
            const item = hotspots.find((hotspot) => hotspot.id === id);
            return item ? [[id, { ...draftFor(item), ...value }]] : [];
          }),
        ) as Record<string, HotspotDraft>;
      setDrafts(restore(saved.drafts));
      setDraftBases(restore(saved.bases));
      setDraftRevision(typeof saved.revision === 'number' ? saved.revision : null);
      setStorageReadFailedKey('');
    } catch {
      setDrafts({});
      setDraftBases({});
      setDraftRevision(null);
      setStorageReadFailedKey(storageKey);
      setStorageWarning(
        'Le stockage local est indisponible. Les brouillons restent accessibles jusqu’à ce que tu quittes ce tableau.',
      );
    }
    setRestoredKey(storageKey);
  }, [storageKey, restoredKey, hotspots]);
  useEffect(() => {
    if (!storageKey || restoredKey !== storageKey || storageReadFailedKey === storageKey) return;
    try {
      if (Object.keys(drafts).length)
        sessionStorage.setItem(storageKey, JSON.stringify({ drafts, bases: draftBases, revision: draftRevision }));
      else sessionStorage.removeItem(storageKey);
      setStorageWarning('');
    } catch {
      setStorageWarning(
        'Le stockage local est indisponible. Les brouillons restent accessibles jusqu’à ce que tu quittes ce tableau.',
      );
    }
  }, [storageKey, restoredKey, storageReadFailedKey, drafts, draftBases, draftRevision]);
  useEffect(() => {
    if (!Object.keys(drafts).length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [drafts]);
  useEffect(() => {
    if (!dialog) return;
    dialogFocus.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDialog(null);
        dialogReturnFocus.current?.focus();
      }
      if (event.key === 'Tab') {
        const elements = [
          ...document.querySelectorAll<HTMLElement>(
            '.hotspot-dialog button, .hotspot-dialog input, .hotspot-dialog select, .hotspot-dialog textarea',
          ),
        ].filter((element) => !element.hasAttribute('disabled'));
        if (!elements.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog]);
  const effective = (item: Hotspot) => {
    const draft = drafts[item.id];
    if (!draft) return item;
    return {
      ...item,
      visible: draft.visible,
      title: draft.title,
      kind: draft.kind,
      location: { ...item.location, node_ids: draft.node_ids },
      status: draft.status,
      resolution:
        item.resolution ||
        !sameDraftValue(draft.resolution, emptyResolution()) ||
        draft.selected_option_id !== (item.selected_option_id || '')
          ? draft.resolution
          : undefined,
      selected_option_id: draft.selected_option_id || undefined,
      resolution_note: draft.resolution_note || undefined,
      arbitration_level: draft.arbitration_level,
      complexity: {
        ...item.complexity,
        arbitration: draft.arbitration,
        implementation: draft.implementation,
        rationale: draft.rationale,
        arbitration_rationale: draft.arbitration_rationale,
        implementation_rationale: draft.implementation_rationale,
      },
      severity: (severityForComplexities(draft.arbitration, draft.implementation) ||
        item.severity) as Hotspot['severity'],
    };
  };
  const scoped = groupHotspots.map(effective);
  const hiddenScope = scoped.filter((item) => !isHotspotVisible(item));
  const filtered = [...filterMapHotspots(scoped, { ...filters, enabled: true }), ...hiddenScope]
    .filter((item) =>
      `${item.id} ${item.title} ${item.problem}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')),
    )
    .sort((a, b) => {
      const visibilityOrder = Number(isHotspotVisible(b)) - Number(isHotspotVisible(a));
      if (visibilityOrder) return visibilityOrder;
      const value = (item: Hotspot) => {
        switch (sort.key) {
          case 'kind':
            return item.kind === 'integration' ? 1 : 0;
          case 'scope':
            return item.location.node_ids.map((id) => model.nodeById.get(id)?.name || id).join(' · ');
          case 'severity':
            return SIZE_RANK.indexOf(item.severity);
          case 'arbitration':
            return SIZE_RANK.indexOf(item.complexity.arbitration);
          case 'implementation':
            return SIZE_RANK.indexOf(item.complexity.implementation);
          case 'resolution':
            return Object.keys(RESOLUTION_STAGES).indexOf(resolutionFor(item).stage);
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
      const leastAdvancedFirst =
        sort.key === 'severity'
          ? Object.keys(RESOLUTION_STAGES).indexOf(resolutionFor(a).stage) -
              Object.keys(RESOLUTION_STAGES).indexOf(resolutionFor(b).stage) ||
            STATUS_RANK.indexOf(a.status) - STATUS_RANK.indexOf(b.status)
          : 0;
      return (
        (sort.direction === 'ascending' ? primary : -primary) ||
        leastAdvancedFirst ||
        a.title.localeCompare(b.title, 'fr') ||
        a.id.localeCompare(b.id)
      );
    });
  const displayedCount = filtered.filter(isHotspotVisible).length;
  const displayedHiddenCount = filtered.length - displayedCount;
  const changes: WorkshopTableChange[] = Object.entries(drafts).flatMap(([id, draft]) => {
    const item = hotspots.find((hotspot) => hotspot.id === id);
    if (!item) return [];
    const base = draftBases[id] || draftFor(item);
    const fields: WorkshopTableChange['fields'] = {};
    if (draft.visible !== base.visible) fields.visible = draft.visible;
    if (draft.title.trim() !== base.title) fields.title = draft.title.trim();
    if (draft.kind !== base.kind) fields.kind = draft.kind;
    if (!sameDraftValue(draft.node_ids, base.node_ids))
      fields.location = { ...item.location, node_ids: draft.node_ids };
    if (
      draft.arbitration !== base.arbitration ||
      draft.implementation !== base.implementation ||
      draft.rationale !== base.rationale ||
      draft.arbitration_rationale !== base.arbitration_rationale ||
      draft.implementation_rationale !== base.implementation_rationale
    )
      fields.complexity = {
        ...item.complexity,
        arbitration: draft.arbitration,
        implementation: draft.implementation,
        rationale: draft.rationale.trim(),
        arbitration_rationale: draft.arbitration_rationale.trim(),
        implementation_rationale: draft.implementation_rationale.trim(),
      };
    if (draft.status !== base.status) fields.status = draft.status;
    if (!sameDraftValue(draft.resolution, base.resolution)) fields.resolution = draft.resolution;
    if (
      draft.status === 'resolved' ||
      item.resolution ||
      draft.resolution.stage !== 'unassessed' ||
      draft.selected_option_id !== base.selected_option_id
    ) {
      if (!item.resolution && draft.selected_option_id !== base.selected_option_id)
        fields.resolution = draft.resolution;
      if (draft.selected_option_id !== base.selected_option_id) fields.selected_option_id = draft.selected_option_id;
      if (draft.resolution_note.trim() !== base.resolution_note) fields.resolution_note = draft.resolution_note.trim();
    }
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
      .filter(
        (key) =>
          !sameDraftValue(draft[key], base[key]) &&
          !sameDraftValue(latest[key], base[key]) &&
          !sameDraftValue(latest[key], draft[key]),
      )
      .map(
        (key) =>
          `${item.title} · ${key === 'arbitration' ? 'd’arbitrage' : key === 'implementation' ? 'implémentation' : key === 'arbitration_level' ? 'arbitrage' : key === 'status' ? 'statut' : key === 'kind' ? 'type' : key === 'node_ids' ? 'périmètre' : key === 'rationale' ? 'justification' : key === 'selected_option_id' ? 'option retenue' : key === 'resolution_note' ? 'note de résolution' : key === 'resolution' ? 'avancement du cadrage' : 'titre'}`,
      );
  });
  const draftErrors = Object.entries(drafts).flatMap(([id, draft]) => {
    const item = hotspots.find((hotspot) => hotspot.id === id);
    if (!item) return [];
    const errors: string[] = [];
    if (!draft.title.trim()) errors.push('titre requis');
    if (draft.kind === 'integration' && draft.node_ids.length !== 2)
      errors.push('deux objets requis pour une intégration');
    if (draft.kind === 'scope' && draft.node_ids.length < 1) errors.push('un objet requis pour un périmètre');
    if ((draft.arbitration !== 'unassessed' || draft.implementation !== 'unassessed') && !draft.rationale.trim())
      errors.push('justification des complexités requise');
    errors.push(...resolutionErrors(effective(item)));
    if (draft.status === 'resolved' && !effective(item).resolution) {
      if (!item.resolution_options.some((option) => option.id === draft.selected_option_id))
        errors.push('option retenue requise');
      if (!draft.resolution_note.trim()) errors.push('note de résolution requise');
    }
    return errors.map((error) => `${item.title} : ${error}`);
  });
  const invalidDrafts = draftErrors.length > 0;
  const editFields = (item: Hotspot, updates: Partial<HotspotDraft>) => {
    if (!workshopStage) return;
    draftEditSequence.current += 1;
    if (draftRevision === null) setDraftRevision(workshopStage.revision);
    setDraftBases((current) => (current[item.id] ? current : { ...current, [item.id]: draftFor(item) }));
    setDrafts((current) => ({ ...current, [item.id]: { ...(current[item.id] || draftFor(item)), ...updates } }));
    setSaveMessage('');
  };
  const edit = (item: Hotspot, field: keyof HotspotDraft, value: string) => editFields(item, { [field]: value });
  const editResolution = (item: Hotspot, updates: Partial<HotspotResolution>) => {
    const draft = drafts[item.id] || draftFor(item);
    const resolution = { ...draft.resolution, ...updates };
    if (resolution.stage !== 'unassessed') {
      resolution.assessed_on ||= new Date().toLocaleDateString('sv-SE');
      resolution.assessment_source ||= `Atelier Atlas ${workshopStage?.session_id || ''}`;
    }
    if (resolution.stage !== 'credible') resolution.credible_option_ids = [];
    if (resolution.stage !== 'ready_for_arbitration' && resolution.stage !== 'credible') {
      resolution.recommended_option_id = '';
      resolution.recommendation_note = '';
    }
    editFields(item, {
      resolution,
      status: resolution.stage === 'credible' ? 'resolved' : draft.status === 'resolved' ? 'validated' : draft.status,
    });
  };
  const openDialog = (
    event: MouseEvent<HTMLElement>,
    item: Hotspot,
    mode: 'location' | 'resolution' | 'complexity',
  ) => {
    dialogReturnFocus.current = event.currentTarget;
    setNodeQuery('');
    setDialog({ id: item.id, mode });
  };
  const closeDialog = () => {
    setDialog(null);
    dialogReturnFocus.current?.focus();
  };
  const save = async () => {
    if (!changes.length || staleDrafts || invalidDrafts || saving) return;
    const submittedSequence = draftEditSequence.current;
    setSaving(true);
    setSaveMessage('');
    try {
      await onSaveWorkshopChanges(changes);
      // Edits made while the request is in flight must remain available for review.
      const hasLaterEdits = draftEditSequence.current !== submittedSequence;
      if (!hasLaterEdits) {
        setDrafts({});
        setDraftBases({});
        setDraftRevision(null);
      }
      setSaveMessage(
        `${changes.length} point${changes.length > 1 ? 's' : ''} chaud${changes.length > 1 ? 's' : ''} enregistré${changes.length > 1 ? 's' : ''} dans la séance${hasLaterEdits ? '. Des modifications plus récentes restent à examiner avant un nouvel enregistrement.' : ' — à intégrer au modèle en préparation.'}`,
      );
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };
  const rebaseDrafts = () => {
    if (!workshopStage) return;
    draftEditSequence.current += 1;
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
                  !sameDraftValue(draft[key], base[key]) ? draft[key] : latest[key],
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
  return (
    <section className="hotspot-page" ref={page} aria-label="Points chauds de la publication">
      {!chosen && (
        <header className="hotspot-page-header">
          <div>
            <p className="hotspot-list-count">
              <strong>{displayedCount}</strong>{' '}
              {`point${displayedCount > 1 ? 's' : ''} chaud${displayedCount > 1 ? 's' : ''} affiché${displayedCount > 1 ? 's' : ''}`}
              {displayedHiddenCount ? ` · ${displayedHiddenCount} masqué${displayedHiddenCount > 1 ? 's' : ''}` : ''}
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
      )}
      {!chosen && filtersOpen && (
        <div className="hotspot-catalog-filters" role="group" aria-label="Filtres des points chauds">
          <HotspotFilterFields filters={filters} onChange={onFiltersChange} />
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
                ? ` · La séance a changé aussi sur : ${conflicts.join(', ')}.`
                : ' · La séance a changé sur d’autres champs : tes saisies peuvent être reprises.'
              : ' · Saisies non enregistrées dans la séance.'}
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
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      )}
      {draftErrors.length > 0 && (
        <p className="hotspot-draft-errors" role="alert">
          {draftErrors.join(' · ')}
        </p>
      )}
      {saveMessage && (
        <p className="hotspot-save-message" role="status">
          {saveMessage}
        </p>
      )}
      {storageWarning && (
        <p className="hotspot-save-message" role="status">
          {storageWarning}
        </p>
      )}
      {!workshopStage && (
        <p className="hotspot-workshop-note">
          {workshopMessage}{' '}
          <button type="button" onClick={() => onChange({ view: 'help', helpTopic: 'workshop' })}>
            Aide mode atelier
          </button>
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
        <HotspotDetail
          hotspot={effective(chosen)}
          model={model}
          grouped={groupIds.size > 0}
          expanded={expanded}
          canEdit={Boolean(workshopStage)}
          pending={Boolean(drafts[chosen.id])}
          onChange={onChange}
          onToggleFullscreen={() => void toggleFullscreen()}
          onEdit={(event, mode) => openDialog(event, chosen, mode)}
        />
      ) : (
        <div className="hotspot-table-scroll" role="region" aria-label="Tableau des points chauds" tabIndex={0}>
          <table className="hotspot-table">
            <thead>
              <tr>
                {sortHeader('title', 'Sujet et impact')}
                {sortHeader('scope', 'Périmètre')}
                {sortHeader('severity', 'Criticité')}
                {sortHeader('resolution', 'Qualification et avancement')}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => {
                const draft = drafts[item.id] || draftFor(item);
                const severity = severityForComplexities(draft.arbitration, draft.implementation) || item.severity;
                const canEdit = Boolean(workshopStage);
                const StatusIcon = STATUS_ICON[draft.status];
                const StageIcon = STAGE_ICON[draft.resolution.stage];
                const credibleOptions = item.resolution_options.filter((option) =>
                  draft.resolution.credible_option_ids.includes(option.id),
                );
                const recommendedOption = item.resolution_options.find(
                  (option) => option.id === draft.resolution.recommended_option_id,
                );
                const progress = (
                  <>
                    <span className={`hotspot-progress-badge status-${draft.status}`}>
                      <StatusIcon size={15} aria-hidden="true" /> Sujet {STATUS[draft.status]}
                    </span>
                    <span className={`hotspot-progress-badge stage-${draft.resolution.stage}`}>
                      <StageIcon size={15} aria-hidden="true" /> {RESOLUTION_STAGES[draft.resolution.stage]}
                    </span>
                    {draft.resolution.stage === 'ready_for_arbitration' && recommendedOption && (
                      <span className="hotspot-option-to-arbitrate">À arbitrer : {recommendedOption.title}</span>
                    )}
                    {draft.resolution.stage === 'credible' &&
                      credibleOptions.length > 0 &&
                      !draft.selected_option_id && (
                        <span className="hotspot-option-to-arbitrate">
                          Solutions crédibles : {credibleOptions.map((option) => option.title).join(' · ')}
                        </span>
                      )}
                    {draft.resolution.blocked_reason && <span>Bloqué : {draft.resolution.blocked_reason}</span>}
                  </>
                );
                return (
                  <Fragment key={item.id}>
                    {!isHotspotVisible(item) && (index === 0 || isHotspotVisible(filtered[index - 1])) && (
                      <tr className="hotspot-hidden-separator">
                        <td colSpan={4}>Non visibles — hors des filtres et de la carte</td>
                      </tr>
                    )}
                    <tr
                      data-hotspot-id={item.id}
                      className={`${changes.some((change) => change.id === item.id) ? 'is-draft' : ''} ${!isHotspotVisible(item) ? 'hotspot-is-hidden' : ''}`}
                    >
                      <td className="hotspot-table-subject" data-label="Sujet et impact">
                        <div className="hotspot-list-heading">
                          <button
                            type="button"
                            className="hotspot-title-button"
                            onClick={() => onChange({ hotspot: item.id })}
                          >
                            {item.title}
                          </button>
                          {!isHotspotVisible(item) && <span className="hotspot-visibility-label">Non visible</span>}
                          <HotspotTooltipButton
                            type="button"
                            className="hotspot-summary-trigger"
                            aria-label={`Résumé de ${item.title}`}
                            tip={
                              <>
                                <strong>{item.title}</strong>
                                <span>
                                  <ModelText text={item.problem} />
                                </span>
                              </>
                            }
                          >
                            <Info size={16} aria-hidden="true" />
                          </HotspotTooltipButton>
                        </div>
                        <p className="hotspot-list-summary">
                          <ModelText text={item.problem} />
                        </p>
                        <HotspotImpact item={item} />
                        {item.workshop && <small>Atelier</small>}
                      </td>
                      <td className="hotspot-table-scope" data-label="Périmètre">
                        <small>{draft.kind === 'integration' ? 'Intégration' : 'Sujet de périmètre'}</small>
                        {canEdit ? (
                          <button
                            type="button"
                            className="hotspot-cell-edit"
                            aria-label={`Modifier le périmètre de ${item.title}`}
                            onClick={(event) => openDialog(event, item, 'location')}
                          >
                            {draft.node_ids.map((id) => model.nodeById.get(id)?.name || id).join(' · ')}
                          </button>
                        ) : (
                          draft.node_ids.map((id) => model.nodeById.get(id)?.name || id).join(' · ')
                        )}
                      </td>
                      <td data-label="Criticité">
                        <HotspotTooltipButton
                          type="button"
                          className={`hotspot-table-criticality severity-${severity}`}
                          aria-label={`Criticité et complexités de ${item.title}`}
                          onClick={canEdit ? (event) => openDialog(event, item, 'complexity') : undefined}
                          tip={
                            <>
                              <strong>Criticité : {SIZE(severity)}</strong>
                              <span>
                                Arbitrage : {SIZE(draft.arbitration)} · Implémentation : {SIZE(draft.implementation)}
                              </span>
                              <span>
                                <ModelText text={draft.rationale || 'Justification non documentée.'} />
                              </span>
                            </>
                          }
                        >
                          <Flame size={15} aria-hidden="true" /> {SIZE(severity)}
                        </HotspotTooltipButton>
                        <dl className="hotspot-list-complexities">
                          <div>
                            <dt>Arbitrage</dt>
                            <dd>{SIZE(draft.arbitration)}</dd>
                          </div>
                          <div>
                            <dt>Implémentation</dt>
                            <dd>{SIZE(draft.implementation)}</dd>
                          </div>
                        </dl>
                      </td>
                      <td data-label="Qualification et avancement">
                        {canEdit ? (
                          <button
                            type="button"
                            className="hotspot-qualification"
                            aria-label={`Qualification et avancement de ${item.title}`}
                            onClick={(event) => openDialog(event, item, 'resolution')}
                          >
                            {progress}
                          </button>
                        ) : (
                          <div className="hotspot-qualification">{progress}</div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="hotspot-table-empty">
                    Aucun point chaud avec ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {dialog &&
        (() => {
          const item = hotspots.find((hotspot) => hotspot.id === dialog.id);
          if (!item) return null;
          const draft = drafts[item.id] || draftFor(item);
          const nodes = [...model.nodeById.values()]
            .filter(
              (node) =>
                node.kind !== 'universe' &&
                `${node.name} ${node.displayCode || ''}`
                  .toLocaleLowerCase('fr')
                  .includes(nodeQuery.toLocaleLowerCase('fr')),
            )
            .slice(0, 80);
          return createPortal(
            <div className="hotspot-dialog-backdrop">
              <section
                className="hotspot-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hotspot-dialog-title"
              >
                <header>
                  <div>
                    <h3 id="hotspot-dialog-title">
                      {dialog.mode === 'location'
                        ? 'Type et périmètre'
                        : dialog.mode === 'resolution'
                          ? 'Qualification et avancement'
                          : 'Complexités'}{' '}
                      · {item.title}
                    </h3>
                    <p>Modifications en attente du bouton « Enregistrer les modifications ».</p>
                  </div>
                  <button type="button" onClick={closeDialog} aria-label="Fermer">
                    ×
                  </button>
                </header>
                {dialog.mode === 'location' && (
                  <div className="hotspot-dialog-body">
                    <label className="hotspot-visible-control">
                      <input
                        type="checkbox"
                        checked={draft.visible}
                        onChange={(event) => editFields(item, { visible: event.target.checked })}
                      />
                      Visible dans la carte et les filtres
                    </label>
                    <p>
                      Un sujet non visible reste accessible en fin de liste, grisé. Cette préférence ne change ni sa
                      qualification ni sa résolution.
                    </p>
                    <label>
                      Intitulé du sujet
                      <input value={draft.title} onChange={(event) => edit(item, 'title', event.target.value)} />
                    </label>
                    <label>
                      Type{' '}
                      <select
                        ref={(element) => {
                          dialogFocus.current = element;
                        }}
                        value={draft.kind}
                        onChange={(event) => editFields(item, { kind: event.target.value as Hotspot['kind'] })}
                      >
                        <option value="scope">Périmètre</option>
                        <option value="integration">Intégration</option>
                      </select>
                    </label>
                    <p>
                      {draft.kind === 'integration'
                        ? 'Choisis exactement deux objets entre lesquels se situe le sujet.'
                        : 'Choisis au moins un objet concerné.'}
                    </p>
                    <div className="hotspot-selected-nodes">
                      {draft.node_ids.map((id) => (
                        <button
                          type="button"
                          key={id}
                          onClick={() => editFields(item, { node_ids: draft.node_ids.filter((value) => value !== id) })}
                          aria-label={`Retirer ${model.nodeById.get(id)?.name || id}`}
                        >
                          {model.nodeById.get(id)?.name || id} ×
                        </button>
                      ))}
                    </div>
                    <label>
                      Rechercher un objet{' '}
                      <input
                        type="search"
                        value={nodeQuery}
                        onChange={(event) => setNodeQuery(event.target.value)}
                        placeholder="Nom ou code…"
                      />
                    </label>
                    <div className="hotspot-node-options" role="group" aria-label="Objets du modèle">
                      {nodes.map((node) => (
                        <label key={node.id}>
                          <input
                            type="checkbox"
                            checked={draft.node_ids.includes(node.id)}
                            onChange={() =>
                              editFields(item, {
                                node_ids: draft.node_ids.includes(node.id)
                                  ? draft.node_ids.filter((id) => id !== node.id)
                                  : [...draft.node_ids, node.id],
                              })
                            }
                          />{' '}
                          <span>
                            {node.name}
                            <small>
                              {node.kind} · {node.displayCode || node.id}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {dialog.mode === 'resolution' && (
                  <div className="hotspot-dialog-body hotspot-resolution-fields">
                    <p>
                      Une option recommandée attend l’arbitrage ; une solution crédible clôt le cadrage. Le choix
                      définitif reste distinct.
                    </p>
                    <label>
                      Qualification du sujet
                      <select
                        aria-label="Qualification du sujet"
                        value={draft.status}
                        onChange={(event) => {
                          const status = event.target.value as Hotspot['status'];
                          if (status === 'resolved') editResolution(item, { stage: 'credible', blocked_reason: '' });
                          else
                            editFields(item, {
                              status,
                              ...(draft.resolution.stage === 'credible'
                                ? {
                                    resolution: {
                                      ...draft.resolution,
                                      stage: 'qualifying',
                                      credible_option_ids: [],
                                      recommended_option_id: '',
                                      recommendation_note: '',
                                    },
                                  }
                                : {}),
                            });
                        }}
                      >
                        {Object.entries(STATUS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Instance d’arbitrage
                      <select
                        value={draft.arbitration_level}
                        onChange={(event) => edit(item, 'arbitration_level', event.target.value)}
                      >
                        {Object.entries(LEVEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Avancement du cadrage
                      <select
                        ref={(element) => {
                          dialogFocus.current = element;
                        }}
                        value={draft.resolution.stage}
                        onChange={(event) =>
                          editResolution(item, {
                            stage: event.target.value as HotspotResolution['stage'],
                            ...(['ready_for_arbitration', 'credible'].includes(event.target.value)
                              ? { blocked_reason: '' }
                              : {}),
                          })
                        }
                      >
                        {Object.entries(RESOLUTION_STAGES).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Synthèse d’avancement
                      <textarea
                        value={draft.resolution.summary}
                        onChange={(event) => editResolution(item, { summary: event.target.value })}
                      />
                    </label>
                    {draft.resolution.stage === 'ready_for_arbitration' && (
                      <fieldset>
                        <legend>Proposition à soumettre à l’arbitrage</legend>
                        <label>
                          Option recommandée
                          <select
                            value={draft.resolution.recommended_option_id || ''}
                            onChange={(event) => editResolution(item, { recommended_option_id: event.target.value })}
                          >
                            <option value="">Choisir une option</option>
                            {item.resolution_options.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Pourquoi cette option ? Hypothèses et réserves
                          <textarea
                            value={draft.resolution.recommendation_note || ''}
                            onChange={(event) => editResolution(item, { recommendation_note: event.target.value })}
                          />
                        </label>
                      </fieldset>
                    )}
                    {draft.resolution.stage === 'credible' && (
                      <fieldset>
                        <legend>Solutions crédibles (au moins une)</legend>
                        {item.resolution_options.map((option) => (
                          <label key={option.id}>
                            <input
                              type="checkbox"
                              checked={draft.resolution.credible_option_ids.includes(option.id)}
                              onChange={(event) =>
                                editResolution(item, {
                                  credible_option_ids: event.target.checked
                                    ? [...draft.resolution.credible_option_ids, option.id]
                                    : draft.resolution.credible_option_ids.filter((id) => id !== option.id),
                                })
                              }
                            />
                            {option.title}
                          </label>
                        ))}
                        <label>
                          Crédibilité, hypothèses et réserves
                          <textarea
                            value={draft.resolution.credibility_note}
                            onChange={(event) => editResolution(item, { credibility_note: event.target.value })}
                          />
                        </label>
                      </fieldset>
                    )}
                    <label>
                      Raison du blocage (facultative)
                      <textarea
                        disabled={
                          draft.resolution.stage === 'credible' || draft.resolution.stage === 'ready_for_arbitration'
                        }
                        value={draft.resolution.blocked_reason}
                        onChange={(event) => editResolution(item, { blocked_reason: event.target.value })}
                      />
                    </label>
                    <label>
                      Prochaine étape
                      <textarea
                        value={draft.resolution.next_step}
                        onChange={(event) => editResolution(item, { next_step: event.target.value })}
                      />
                    </label>
                    <label>
                      Date d’évaluation
                      <input
                        type="date"
                        value={draft.resolution.assessed_on || ''}
                        onChange={(event) => editResolution(item, { assessed_on: event.target.value })}
                      />
                    </label>
                    <label>
                      Source d’évaluation
                      <input
                        value={draft.resolution.assessment_source}
                        onChange={(event) => editResolution(item, { assessment_source: event.target.value })}
                      />
                    </label>
                    <label>
                      Option retenue (choix définitif facultatif){' '}
                      <select
                        value={draft.selected_option_id}
                        disabled={draft.resolution.stage === 'ready_for_arbitration'}
                        onChange={(event) => edit(item, 'selected_option_id', event.target.value)}
                      >
                        <option value="">Aucun choix définitif</option>
                        {item.resolution_options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    {item.resolution_options.length === 0 && (
                      <p>Aucune option n’est documentée. Ajoute d’abord une option avec Codex.</p>
                    )}
                    <label>
                      Note du choix définitif (facultative){' '}
                      <textarea
                        value={draft.resolution_note}
                        onChange={(event) => edit(item, 'resolution_note', event.target.value)}
                        placeholder="Décision, portée et conditions retenues…"
                        rows={5}
                      />
                    </label>
                  </div>
                )}
                {dialog.mode === 'complexity' && (
                  <div className="hotspot-dialog-body">
                    <HotspotAssessmentGuide model={model} />
                    <label>
                      Justification d’arbitrage
                      <textarea
                        value={draft.arbitration_rationale}
                        onChange={(event) => edit(item, 'arbitration_rationale', event.target.value)}
                      />
                    </label>
                    <label>
                      Justification d’implémentation
                      <textarea
                        value={draft.implementation_rationale}
                        onChange={(event) => edit(item, 'implementation_rationale', event.target.value)}
                      />
                    </label>
                    <p>La criticité est calculée à partir des deux complexités.</p>
                    <label>
                      Complexité d’arbitrage{' '}
                      <select
                        ref={(element) => {
                          dialogFocus.current = element;
                        }}
                        value={draft.arbitration}
                        onChange={(event) => edit(item, 'arbitration', event.target.value)}
                      >
                        {SIZE_RANK.map((level) => (
                          <option key={level} value={level}>
                            {SIZE(level)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Complexité d’implémentation{' '}
                      <select
                        value={draft.implementation}
                        onChange={(event) => edit(item, 'implementation', event.target.value)}
                      >
                        {SIZE_RANK.map((level) => (
                          <option key={level} value={level}>
                            {SIZE(level)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Justification{' '}
                      <textarea
                        value={draft.rationale}
                        onChange={(event) => edit(item, 'rationale', event.target.value)}
                        rows={5}
                      />
                    </label>
                  </div>
                )}
                <footer>
                  <button type="button" onClick={closeDialog}>
                    Terminer
                  </button>
                </footer>
              </section>
            </div>,
            document.fullscreenElement || document.body,
          );
        })()}
    </section>
  );
}
