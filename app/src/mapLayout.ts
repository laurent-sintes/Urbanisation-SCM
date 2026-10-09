import type { MapZoomMode } from './mapZoom';

export interface GridSection {
  heights: readonly number[];
  headingHeight: number;
}

export interface MapGrid {
  columns: number;
  cardWidth: number;
  width: number;
  height: number;
  pageZoom: number;
}

const GAP = 28;
const MIN_CARD_WIDTH = 300;
const MAX_COLUMNS = 6;

/** Choose the card geometry before the viewport is framed. Section boundaries remain intact. */
export function chooseMapGrid(
  sections: readonly GridSection[],
  viewportWidth: number,
  viewportHeight: number,
  mode: MapZoomMode,
  group = false,
): MapGrid {
  const itemCount = sections.reduce((count, section) => count + section.heights.length, 0);
  // Reserve the viewport padding and the optional container gutter before sizing cards.
  const usableWidth = Math.max(1, viewportWidth - 64 - (group ? 28 : 0));
  const maxColumns = Math.max(
    1,
    Math.min(MAX_COLUMNS, itemCount, Math.floor((usableWidth + GAP) / (MIN_CARD_WIDTH + GAP))),
  );
  const candidates: MapGrid[] = [];
  for (let columns = 1; columns <= maxColumns; columns++) {
    const maxCardWidth = mode === 'width' ? 1200 : 420;
    const cardWidth = Math.max(
      MIN_CARD_WIDTH,
      Math.min(maxCardWidth, Math.floor((usableWidth - (columns - 1) * GAP) / columns)),
    );
    const width = columns * cardWidth + (columns - 1) * GAP + 32 + (group ? 28 : 0);
    const rowsHeight = sections.reduce((height, section) => {
      let total = height + section.headingHeight;
      for (let index = 0; index < section.heights.length; index += columns) {
        total += Math.max(...section.heights.slice(index, index + columns)) + GAP;
      }
      return total;
    }, 16);
    const height = Math.max(32, rowsHeight - 12) + (group ? 70 : 0);
    candidates.push({
      columns,
      cardWidth,
      width,
      height,
      pageZoom: Math.min(1, Math.max(1, viewportWidth - 32) / width, Math.max(1, viewportHeight - 32) / height),
    });
  }
  if (mode === 'width') return candidates[candidates.length - 1];
  const viewportAspect = usableWidth / Math.max(1, viewportHeight - 32);
  return candidates.reduce((best, candidate) => {
    if (candidate.pageZoom > best.pageZoom + 0.01) return candidate;
    if (candidate.pageZoom < best.pageZoom - 0.01) return best;
    const aspectError = (grid: MapGrid) => Math.abs(Math.log(grid.width / grid.height / viewportAspect));
    return aspectError(candidate) < aspectError(best) ? candidate : best;
  });
}
