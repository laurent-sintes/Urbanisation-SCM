import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { defaultHotspotMapFilters, type HotspotMapFilters, severityForComplexities } from '../hotspotMap';
import { RESOLUTION_STAGES } from '../hotspotResolution';
import { ui } from '../ui.ts';

const sizeOptions = [
  { value: 'all', label: ui('hotspotFilterFields.toutes') },
  { value: 'S', label: ui('hotspotFilterFields.s') },
  { value: 'M', label: ui('hotspotFilterFields.m') },
  { value: 'L', label: ui('hotspotFilterFields.l') },
  { value: 'XL', label: ui('hotspotFilterFields.xl') },
  { value: 'unassessed', label: ui('hotspotFilterFields.non_evaluee') },
];
const typeOptions = [
  { value: 'all', label: ui('hotspotFilterFields.tous') },
  { value: 'scope', label: ui('hotspotFilterFields.perimetre') },
  { value: 'integration', label: ui('hotspotFilterFields.integration') },
];
const statusOptions = [
  { value: 'all', label: ui('hotspotFilterFields.tous') },
  { value: 'discovered', label: ui('hotspots.status.discovered') },
  { value: 'shared', label: ui('hotspots.status.shared') },
  { value: 'validated', label: ui('hotspots.status.validated') },
  { value: 'resolved', label: ui('hotspots.status.resolved') },
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
    !filters.showModelHotspots && ui('hotspotFilterFields.modele_masque'),
    !filters.showTransitionHotspots && ui('hotspotFilterFields.transition_masquee'),
    !filters.showUsageHotspots && ui('hotspotFilterFields.usage_masque'),
    !filters.showUnqualifiedHotspots && ui('hotspotFilterFields.impact_a_qualifier_masque'),
    !filters.showResolved && ui('hotspotFilterFields.cadrages_resolus_masques'),
    filters.resolutionStage !== 'all' &&
      ui('hotspotFilterFields.cadrage', {
        value1: RESOLUTION_STAGES[(filters.resolutionStage || 'unassessed') as keyof typeof RESOLUTION_STAGES],
      }),
    filters.status !== 'all' &&
      ui('hotspotFilterFields.sujet', {
        value1: statusOptions.find((option) => option.value === filters.status)?.label,
      }),
    filters.kind !== 'all' &&
      ui('hotspotFilterFields.type', { value1: typeOptions.find((option) => option.value === filters.kind)?.label }),
    filters.severity !== 'all' &&
      ui('hotspotFilterFields.criticite', {
        value1:
          filters.severityMode === 'at_least'
            ? ui('hotspotFilterFields.au_moins')
            : filters.severityMode === 'at_most'
              ? ui('hotspotFilterFields.au_plus')
              : '',
        value2: filters.severity === 'unassessed' ? ui('hotspotFilterFields.non_evaluee') : filters.severity,
      }),
    filters.arbitration !== 'all' && ui('hotspotFilterFields.arbitrage', { arbitration: filters.arbitration }),
    filters.implementation !== 'all' &&
      ui('hotspotFilterFields.implementation', { implementation: filters.implementation }),
  ].filter(Boolean);
  const severityChoice =
    filters.severity === 'all' || filters.severity === 'unassessed'
      ? filters.severity
      : `${filters.severityMode}:${filters.severity}`;
  return (
    <div className="hotspot-filter-controls">
      <div className="hotspot-filter-summary" role="status">
        <span>{ui('hotspotFilterFields.filtres_communs_a_la_liste_et_a_la_carte_inclus_dans_le_lien_part')}</span>
        <button type="button" onClick={() => onChange({ ...defaultHotspotMapFilters, enabled: true })}>
          {ui('hotspotFilterFields.reinitialiser')}
        </button>
      </div>
      <p className="hotspot-active-filters">
        {active.length
          ? ui('hotspotFilterFields.criteres_actifs', { value1: active.join(' · ') })
          : ui('hotspotFilterFields.aucun_critere_restrictif')}
      </p>
      {showDisplayToggle && (
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.enabled}
            onChange={(event) => onChange({ enabled: event.target.checked })}
          />
          {ui('hotspotFilterFields.afficher_les_points_chauds')}
        </label>
      )}
      <fieldset className="hotspot-impact-filters">
        <legend>{ui('hotspotFilterFields.impact_du_sujet')}</legend>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showModelHotspots !== false}
            onChange={(event) => onChange({ showModelHotspots: event.target.checked, enabled: true })}
          />
          {ui('hotspotFilterFields.hotspots_modele')}
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showTransitionHotspots !== false}
            onChange={(event) => onChange({ showTransitionHotspots: event.target.checked, enabled: true })}
          />
          {ui('hotspotFilterFields.hotspots_transition')}
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showUsageHotspots !== false}
            onChange={(event) => onChange({ showUsageHotspots: event.target.checked, enabled: true })}
          />
          {ui('hotspotFilterFields.hotspots_usage')}
        </label>
        <label className="hotspot-map-toggle">
          <input
            type="checkbox"
            checked={filters.showUnqualifiedHotspots !== false}
            onChange={(event) => onChange({ showUnqualifiedHotspots: event.target.checked, enabled: true })}
          />
          {ui('hotspotFilterFields.impact_a_qualifier')}
        </label>
        <p>{ui('hotspotFilterFields.modele_metier_ou_core_system_flow_trajectoire_et_bascule_usage_de')}</p>
      </fieldset>
      <label className="hotspot-filter-select">
        {ui('hotspotFilterFields.avancement_du_cadrage')}
        <select
          value={filters.resolutionStage || 'all'}
          onChange={(event) => onChange({ resolutionStage: event.target.value, enabled: true })}
        >
          <option value="all">{ui('hotspotFilterFields.tous')}</option>
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
        {ui('hotspotFilterFields.inclure_les_cadrages_resolus')}
      </label>
      <div className="hotspot-filter-grid">
        <div className="hotspot-filter-section">
          <label className="hotspot-filter-select">
            {ui('hotspotFilterFields.criticite_2')}
            <select
              value={severityChoice}
              onChange={(event) => {
                const [mode, level] = event.target.value.includes(':')
                  ? event.target.value.split(':')
                  : ['exact', event.target.value];
                onChange({ severity: level, severityMode: mode as HotspotMapFilters['severityMode'], enabled: true });
              }}
            >
              <option value="all">{ui('hotspotFilterFields.toutes')}</option>
              <optgroup label={ui('hotspotFilterFields.un_niveau_precis')}>
                <option value="exact:S">{ui('hotspotFilterFields.s_uniquement')}</option>
                <option value="exact:M">{ui('hotspotFilterFields.m_uniquement')}</option>
                <option value="exact:L">{ui('hotspotFilterFields.l_uniquement')}</option>
                <option value="exact:XL">{ui('hotspotFilterFields.xl_uniquement')}</option>
              </optgroup>
              <optgroup label={ui('hotspotFilterFields.ce_niveau_et_plus_critiques')}>
                <option value="at_least:M">{ui('hotspotFilterFields.m_a_xl')}</option>
                <option value="at_least:L">{ui('hotspotFilterFields.l_a_xl')}</option>
              </optgroup>
              <optgroup label={ui('hotspotFilterFields.ce_niveau_et_moins_critiques')}>
                <option value="at_most:M">{ui('hotspotFilterFields.s_a_m')}</option>
                <option value="at_most:L">{ui('hotspotFilterFields.s_a_l')}</option>
              </optgroup>
              <option value="unassessed">{ui('hotspotFilterFields.non_evaluee')}</option>
            </select>
          </label>
        </div>
        <div className="hotspot-filter-section">
          <FilterChoices
            label={ui('hotspotFilterFields.type_2')}
            options={typeOptions}
            value={filters.kind}
            onChange={(kind) => onChange({ kind, enabled: true })}
          />
          <FilterChoices
            label={ui('hotspotFilterFields.statut')}
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
        {ui('hotspotFilterFields.affiner_par_complexite')}
        {(filters.arbitration !== 'all' || filters.implementation !== 'all') && (
          <strong>
            {ui('hotspotFilterFields.arbitrage_2')}
            {filters.arbitration}
            {ui('hotspotFilterFields.implementation_2')}
            {filters.implementation}
          </strong>
        )}
        <ChevronDown size={14} className={advancedOpen ? 'is-open' : ''} />
      </button>
      {advancedOpen && (
        <div
          className="hotspot-filter-advanced"
          role="group"
          aria-label={ui('hotspotFilterFields.composantes_de_la_criticite')}
        >
          <p>{ui('hotspotFilterFields.la_criticite_resulte_de_ces_deux_complexites_leur_choix_remplace_')}</p>
          <FilterChoices
            label={ui('hotspotFilterFields.complexite_d_arbitrage')}
            options={sizeOptions}
            value={filters.arbitration}
            onChange={(arbitration) => onChange({ arbitration, enabled: true })}
          />
          <FilterChoices
            label={ui('hotspotFilterFields.complexite_d_implementation')}
            options={sizeOptions}
            value={filters.implementation}
            onChange={(implementation) => onChange({ implementation, enabled: true })}
          />
          {computedSeverity && (
            <p className="hotspot-filter-result" role="status">
              {ui('hotspotFilterFields.criticite_resultante')}{' '}
              <strong>
                {computedSeverity === 'unassessed' ? ui('hotspotFilterFields.non_evaluee') : computedSeverity}
              </strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
