import { useEffect, useId, useState } from 'react';
import type { MapZoomChoice } from '../mapZoom';
import { preference, savePreference } from '../navigation';

export function useMapZoomChoice() {
  const [choice, setChoice] = useState<MapZoomChoice>(() => {
    const saved = preference<string>('map-zoom-choice', 'auto');
    return saved === 'page' || saved === 'width' ? saved : 'auto';
  });
  useEffect(() => savePreference('map-zoom-choice', choice), [choice]);
  return [choice, setChoice] as const;
}

export function MapZoomPicker({
  choice,
  onChange,
  pageFallback,
}: {
  choice: MapZoomChoice;
  onChange: (choice: MapZoomChoice) => void;
  pageFallback: boolean;
}) {
  const tooltipId = useId();
  return (
    <div className="map-zoom-choice" role="group" aria-label="Cadrage de la carte">
      {(
        [
          { id: 'auto', label: 'Auto' },
          { id: 'page', label: 'Pleine page' },
          { id: 'width', label: 'Pleine largeur' },
        ] as const
      ).map((option) => {
        const help = option.id === 'page' && choice === 'page' && pageFallback;
        return (
          <span key={option.id} className="map-zoom-option">
            <button
              type="button"
              aria-pressed={choice === option.id}
              aria-describedby={help ? tooltipId : undefined}
              onClick={() => onChange(option.id)}
            >
              {option.label}
              {help && (
                <sup className="map-zoom-asterisk" aria-hidden="true">
                  *
                </sup>
              )}
            </button>
            {help && (
              <span id={tooltipId} role="tooltip" className="map-zoom-tooltip">
                Ce niveau ne tient pas lisiblement sur une page. Parcours à taille de lecture, avec défilement si
                nécessaire.
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
