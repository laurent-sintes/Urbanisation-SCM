import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { defaultHotspotMapFilters, type HotspotMapFilters, severityForComplexities } from '../hotspotMap';
import { RESOLUTION_STAGES } from '../hotspotResolution';

const sizeOptions = [
  { value: 'all', label: 'Toutes' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'unassessed', label: 'Non évaluée' },
];
const typeOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'scope', label: 'Périmètre' },
  { value: 'integration', label: 'Intégration' },
];
const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'discovered', label: 'Découvert' },
  { value: 'shared', label: 'Partagé' },
  { value: 'validated', label: 'Validé' },
  { value: 'resolved', label: 'Résolu' },
];

function FilterChoices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="hotspot-filter-choice-row" role="group" aria-label={label}>
      <span className="hotspot-filter-choice-label">{label}</span>
      <div className="hotspot-filter-options">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            data-value={option.value}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HotspotFilterFields({
  filters,
  onChange,
  showDisplayToggle = false,
}: {
  filters: HotspotMapFilters;
  onChange: (changes: Partial<HotspotMapFilters>) => void;
  showDisplayToggle?: boolean;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(
    () => filters.arbitration !== 'all' || filters.implementation !== 'all',
  );
  const computedSeverity = severityForComplexities(filters.arbitration, filters.implementation);
  const active = [
    !filters.showModelHotspots && 'Modèle masqué',
    !filters.showTransitionHotspots && 'Transition masquée',
    !filters.showUsageHotspots && 'Usage masqué',
    !filters.showUnqualifiedHotspots && 'Impact à qualifier masqué',
    !filters.showResolved && 'Cadrages résolus masqués',
    filters.resolutionStage !== 'all' &&
      `Cadrage : ${RESOLUTION_STAGES[(filters.resolutionStage || 'unassessed') as keyof typeof RESOLUTION_STAGES]}`,
    filters.status !== 'all' && `Sujet : ${statusOptions.find((option) => option.value === filters.status)?.label}`,
    filters.kind !== 'all' && `Type : ${typeOptions.find((option) => option.value === filters.kind)?.label}`,
    filters.severity !== 'all' &&
      `Criticité : ${filters.severityMode === 'at_least' ? 'au moins ' : filters.severityMode === 'at_most' ? 'au plus ' : ''}${filters.severity === 'unassessed' ? 'Non évaluée' : filters.severity}`,
    filters.arbitration !== 'all' && `Arbitrage : ${filters.arbitration}`,
    filters.implementation !== 'all' && `Implémentation : ${filters.implementation}`,
  ].filter(Boolean);
  const severityChoice =
    filters.severity === 'all' || filters.severity === 'unassessed'
      ? filters.severity
      : `${filters.severityMode}:${filters.severity}`;
  return (
    <div className="hotspot-filter-controls">
      <div className="hotspot-filter-summary" role="status">
        <span>Filtres communs à la liste et à la carte · inclus dans le lien partagé.</span>
        <button type="button" onClick={() => onChange({ ...defaultHotspotMapFilters, enabled: true })}>
          Réinitialiser
        </button>
      </div>
      <p className="hotspot-active-filters">
        {active.length ? `Critères actifs : ${active.join(' · ')}` : 'Aucun critère restrictif.'}
      </p>
      {showDisplayToggle && (
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
          Afficher les points chauds
        </label>
      )}
      <fieldset className="hotspot-impact-filters">
        <legend>Impact du sujet</legend>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showModelHotspots !== false}
            onChange={(event) => onChange({ showModelHotspots: event.target.checked, enabled: true })}
          />
          Hotspots modèle
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showTransitionHotspots !== false}
            onChange={(event) => onChange({ showTransitionHotspots: event.target.checked, enabled: true })}
          />
          Hotspots transition
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showUsageHotspots !== false}
            onChange={(event) => onChange({ showUsageHotspots: event.target.checked, enabled: true })}
          />
          Hotspots usage
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showUnqualifiedHotspots !== false}
            onChange={(event) => onChange({ showUnqualifiedHotspots: event.target.checked, enabled: true })}
          />
          Impact à qualifier
        </label>
        <p>
          Modèle métier ou Core System FLOW · Trajectoire et bascule · Usage de l’outil. Un sujet peut avoir plusieurs
          impacts.
        </p>
      </fieldset>
      <label className="hotspot-filter-select">
        Avancement du cadrage
        <select
          value={filters.resolutionStage || 'all'}
          onChange={(event) => onChange({ resolutionStage: event.target.value, enabled: true })}
        >
          <option value="all">Tous</option>
          {Object.entries(RESOLUTION_STAGES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="hotspot-map-toggle">
        <input
          type="checkbox"
          checked={filters.showResolved !== false}
          onChange={(event) => onChange({ showResolved: event.target.checked, enabled: true })}
        />
        Inclure les cadrages résolus
      </label>
      <div className="hotspot-filter-grid">
        <div className="hotspot-filter-section">
          <label className="hotspot-filter-select">
            Criticité
            <select
              value={severityChoice}
              onChange={(event) => {
                const [mode, level] = event.target.value.includes(':')
                  ? event.target.value.split(':')
                  : ['exact', event.target.value];
                onChange({ severity: level, severityMode: mode as HotspotMapFilters['severityMode'], enabled: true });
              }}
            >
              <option value="all">Toutes</option>
              <optgroup label="Un niveau précis">
                <option value="exact:S">S uniquement</option>
                <option value="exact:M">M uniquement</option>
                <option value="exact:L">L uniquement</option>
                <option value="exact:XL">XL uniquement</option>
              </optgroup>
              <optgroup label="Ce niveau et plus critiques">
                <option value="at_least:M">M à XL</option>
                <option value="at_least:L">L à XL</option>
              </optgroup>
              <optgroup label="Ce niveau et moins critiques">
                <option value="at_most:M">S à M</option>
                <option value="at_most:L">S à L</option>
              </optgroup>
              <option value="unassessed">Non évaluée</option>
            </select>
          </label>
        </div>
        <div className="hotspot-filter-section">
          <FilterChoices
            label="Type"
            options={typeOptions}
            value={filters.kind}
            onChange={(kind) => onChange({ kind, enabled: true })}
          />
          <FilterChoices
            label="Statut"
            options={statusOptions}
            value={filters.status}
            onChange={(status) => onChange({ status, enabled: true })}
          />
        </div>
      </div>
      <button
        type="button"
        className="hotspot-filter-disclosure"
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((value) => !value)}
      >
        Affiner par complexité
        {(filters.arbitration !== 'all' || filters.implementation !== 'all') && (
          <strong>
            Arbitrage {filters.arbitration} · Implémentation {filters.implementation}
          </strong>
        )}
        <ChevronDown size={14} className={advancedOpen ? 'is-open' : ''} />
      </button>
      {advancedOpen && (
        <div className="hotspot-filter-advanced" role="group" aria-label="Composantes de la criticité">
          <p>La criticité résulte de ces deux complexités. Leur choix remplace le filtre de criticité.</p>
          <FilterChoices
            label="Complexité d’arbitrage"
            options={sizeOptions}
            value={filters.arbitration}
            onChange={(arbitration) => onChange({ arbitration, enabled: true })}
          />
          <FilterChoices
            label="Complexité d’implémentation"
            options={sizeOptions}
            value={filters.implementation}
            onChange={(implementation) => onChange({ implementation, enabled: true })}
          />
          {computedSeverity && (
            <p className="hotspot-filter-result" role="status">
              Criticité résultante :{' '}
              <strong>{computedSeverity === 'unassessed' ? 'Non évaluée' : computedSeverity}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
