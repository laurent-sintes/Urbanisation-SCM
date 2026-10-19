import { MIN_READABLE_ZOOM } from './adaptiveLayout.ts';

export type MapZoomChoice = 'auto' | 'page' | 'width';
export type MapZoomMode = 'page' | 'width';

/** Stop subpixel rounding and constant-size overlays from repeatedly changing the fit. */
export function stablePageFitZoom(fittedZoom: number): number {
  const step = 10 ** (Math.floor(Math.log10(fittedZoom)) - 2);
  return Math.floor(fittedZoom / step) * step;
}

export function resolveMapZoom(choice: MapZoomChoice, detail: number, pageFitZoom = 1): MapZoomMode {
  if (choice === 'width') return 'width';
  if (choice === 'page') return 'page';
  if (pageFitZoom < MIN_READABLE_ZOOM) return 'width';
  return choice === 'auto' && detail >= 3 ? 'width' : 'page';
}

/** Keep native size when possible, shrinking a minimum-width grid to the visible scrollport. */
export function widthFit(layoutWidth: number, layoutHeight: number, viewportWidth: number, minimumHeight: number) {
  const zoom = Math.min(1, Math.max(1, viewportWidth - 32) / Math.max(1, layoutWidth));
  return {
    zoom,
    x: Math.max(16, Math.round((viewportWidth - layoutWidth * zoom) / 2)),
    y: 16,
    height: Math.max(minimumHeight, Math.ceil(layoutHeight * zoom + 32)),
  };
}
