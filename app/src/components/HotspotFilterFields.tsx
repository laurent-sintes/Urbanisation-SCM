import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { type HotspotMapFilters, severityForComplexities } from '../hotspotMap';

const sizeOptions = [
  { value: 'all', label: 'Toutes' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'unassessed', label: 'Non évaluée' },
];
const rankedSizes = ['S', 'M', 'L', 'XL'];
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
    () => filters.political !== 'all' || filters.implementation !== 'all',
  );
  const id = useId();
  const computedSeverity = severityForComplexities(filters.political, filters.implementation);
  const severityLimit = rankedSizes.indexOf(filters.severity);
  const severityRange = filters.severityMode === 'at_most' && severityLimit >= 0;
  const selectSeverity = (severity: string) => {
    const severityMode =
      severity === filters.severity && rankedSizes.indexOf(severity) > 0 && filters.severityMode === 'exact'
        ? 'at_most'
        : 'exact';
    onChange({ severity, severityMode, enabled: true });
  };
  return (
    <div className="hotspot-filter-controls">
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
      <div className="hotspot-filter-grid">
        <div className="hotspot-filter-section">
          <div
            className="hotspot-filter-choice-row"
            role="group"
            aria-label="Criticité"
            aria-describedby={`${id}-severity-hint`}
          >
            <span className="hotspot-filter-choice-label">Criticité</span>
            <div className="hotspot-filter-options">
              {sizeOptions.map((option) => {
                const rank = rankedSizes.indexOf(option.value);
                const included = severityRange && rank >= 0 && rank <= severityLimit;
                const boundary = option.value === filters.severity;
                return (
                  <button
                    type="button"
                    key={option.value}
                    data-value={option.value}
                    data-boundary={boundary}
                    data-included={included}
                    aria-pressed={boundary || included}
                    aria-label={included && boundary ? `${option.label} et moins critiques` : option.label}
                    onClick={() => selectSeverity(option.value)}
                  >
                    {included && boundary ? `≤ ${option.label}` : option.label}
                  </button>
                );
              })}
            </div>
            <p id={`${id}-severity-hint`} className="hotspot-filter-hint">
              Sélectionne un niveau, puis sélectionne-le à nouveau pour inclure les niveaux inférieurs.
            </p>
          </div>
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
        {(filters.political !== 'all' || filters.implementation !== 'all') && (
          <strong>
            Politique {filters.political} · Implémentation {filters.implementation}
          </strong>
        )}
        <ChevronDown size={14} className={advancedOpen ? 'is-open' : ''} />
      </button>
      {advancedOpen && (
        <div className="hotspot-filter-advanced" role="group" aria-label="Composantes de la criticité">
          <p>La criticité résulte de ces deux complexités. Leur choix remplace le filtre de criticité.</p>
          <FilterChoices
            label="Complexité politique"
            options={sizeOptions}
            value={filters.political}
            onChange={(political) => onChange({ political, enabled: true })}
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
