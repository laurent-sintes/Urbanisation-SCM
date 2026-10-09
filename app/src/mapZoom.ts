export type MapZoomChoice = 'auto' | 'page' | 'width';
export type MapZoomMode = 'page' | 'width';

export function resolveMapZoom(choice: MapZoomChoice, detail: number): MapZoomMode {
  return choice === 'auto' ? (detail >= 3 ? 'width' : 'page') : choice;
}

/** Fill the available width without making a sparse map comically large. */
export function widthFit(layoutWidth: number, layoutHeight: number, viewportWidth: number, minimumHeight: number) {
  const zoom = Math.max(0.2, Math.min(2, (viewportWidth - 32) / Math.max(1, layoutWidth)));
  return {
    zoom,
    x: Math.max(16, Math.round((viewportWidth - layoutWidth * zoom) / 2)),
    y: 16,
    height: Math.max(minimumHeight, Math.ceil(layoutHeight * zoom + 32)),
  };
}
