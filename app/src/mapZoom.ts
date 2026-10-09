export type MapZoomChoice = 'auto' | 'page' | 'width';
export type MapZoomMode = 'page' | 'width';

export function resolveMapZoom(choice: MapZoomChoice, detail: number, pageFitZoom = 1): MapZoomMode {
  return choice === 'auto' ? (detail >= 3 || pageFitZoom < 0.8 ? 'width' : 'page') : choice;
}

/** Frame a width-oriented grid at native size; the grid itself uses the available width. */
export function widthFit(layoutWidth: number, layoutHeight: number, viewportWidth: number, minimumHeight: number) {
  const zoom = Math.max(0.2, Math.min(1, (viewportWidth - 32) / Math.max(1, layoutWidth)));
  return {
    zoom,
    x: Math.max(16, Math.round((viewportWidth - layoutWidth * zoom) / 2)),
    y: 16,
    height: Math.max(minimumHeight, Math.ceil(layoutHeight * zoom + 32)),
  };
}
