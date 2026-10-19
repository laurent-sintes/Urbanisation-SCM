import { useEffect, useState } from 'react';
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
}: {
  choice: MapZoomChoice;
  onChange: (choice: MapZoomChoice) => void;
}) {
  return (
    <div className="map-zoom-choice" role="group" aria-label="Cadrage de la carte">
      {(
        [
          { id: 'auto', label: 'Auto' },
          { id: 'page', label: 'Pleine page' },
          { id: 'width', label: 'Pleine largeur' },
        ] as const
      ).map((option) => (
        <span key={option.id} className="map-zoom-option">
          <button type="button" aria-pressed={choice === option.id} onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
