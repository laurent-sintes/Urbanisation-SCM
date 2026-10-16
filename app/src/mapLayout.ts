import { chooseLayoutCandidate } from './adaptiveLayout.ts';
import type { MapSlot } from './mapPlacement.ts';
import type { MapZoomMode } from './mapZoom';

export interface GridSection {
  heights: readonly number[];
  headingHeight: number;
  prominentIndex?: number;
}

export interface GridItem {
  index: number;
  column: number;
  span: number;
  height: number;
  displayHeight: number;
}

export interface MapGrid {
  columns: number;
  cardWidth: number;
  width: number;
  height: number;
  pageZoom: number;
  sections: readonly GridSection[];
  rows: readonly (readonly (readonly GridItem[])[])[];
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
  measure?: (cardWidth: number) => readonly GridSection[],
  slots?: readonly MapSlot[],
  stretchSpanningRows = false,
): MapGrid {
  if (slots && sections.length === 1) {
    const columns = 2;
    const usableWidth = Math.max(1, viewportWidth - 64 - (group ? 28 : 0));
    const cardWidth = Math.max(MIN_CARD_WIDTH, Math.min(1200, Math.floor((usableWidth - GAP) / columns)));
    const measuredSections = measure?.(cardWidth) || sections;
    const wideSection = measure?.(cardWidth * 2 + GAP)?.[0] || sections[0];
    const rows: GridItem[][] = [];
    for (const rowNumber of [...new Set(slots.map((slot) => slot.row))]) {
      const entries = slots
        .filter((slot) => slot.row === rowNumber)
        .map((slot) => {
          const height = (slot.span === 2 ? wideSection : measuredSections[0]).heights[slot.index];
          return { index: slot.index, column: slot.column, span: slot.span, height, displayHeight: height };
        });
      rows.push(entries);
    }
    const width = columns * cardWidth + GAP + 32 + (group ? 28 : 0);
    const height =
      4 +
      measuredSections[0].headingHeight +
      rows.reduce((total, row) => total + Math.max(...row.map((entry) => entry.height)) + GAP, 0) +
      (group ? 70 : 0);
    return {
      columns,
      cardWidth,
      width,
      height,
      pageZoom: Math.min(1, Math.max(1, viewportWidth - 32) / width, Math.max(1, viewportHeight - 32) / height),
      sections: measuredSections,
      rows: [rows],
    };
  }
  const itemCount = sections.reduce((count, section) => count + section.heights.length, 0);
  // Reserve the viewport padding and the optional container gutter before sizing cards.
  const usableWidth = Math.max(1, viewportWidth - 64 - (group ? 28 : 0));
  const maxColumns = Math.max(
    1,
    Math.min(MAX_COLUMNS, itemCount, Math.floor((usableWidth + GAP) / (MIN_CARD_WIDTH + GAP))),
  );
  const candidates: MapGrid[] = [];
  for (let columns = 1; columns <= maxColumns; columns++) {
    const maxCardWidth = 1200;
    const cardWidth = Math.max(
      MIN_CARD_WIDTH,
      Math.min(maxCardWidth, Math.floor((usableWidth - (columns - 1) * GAP) / columns)),
    );
    const width = columns * cardWidth + (columns - 1) * GAP + 32 + (group ? 28 : 0);
    const measuredSections = measure?.(cardWidth) || sections;
    for (const spanProminent of [false, true]) {
      if (spanProminent && (columns < 2 || !sections.some((section) => section.prominentIndex !== undefined))) continue;
      const wideSections = spanProminent ? measure?.(cardWidth * 2 + GAP) : undefined;
      const rows = measuredSections.map((section, sectionIndex) => {
        const result: GridItem[][] = [];
        let row: GridItem[] = [];
        let column = 0;
        section.heights.forEach((naturalHeight, index) => {
          const prominent = spanProminent && sections[sectionIndex].prominentIndex === index;
          const span = prominent ? 2 : 1;
          if (column + span > columns) {
            result.push(row);
            row = [];
            column = 0;
          }
          row.push({
            index,
            column,
            span,
            height: prominent ? wideSections?.[sectionIndex].heights[index] || naturalHeight : naturalHeight,
            displayHeight: naturalHeight,
          });
          column += span;
          if (column === columns) {
            result.push(row);
            row = [];
            column = 0;
          }
        });
        if (row.length) result.push(row);
        return result.map((entries) => {
          const rowHeight = Math.max(...entries.map((entry) => entry.height));
          return entries.map((entry) => ({
            ...entry,
            // Domain cards share a row height even when one spans two columns.
            displayHeight: !stretchSpanningRows && entries.some((item) => item.span > 1) ? entry.height : rowHeight,
          }));
        });
      });
      const rowsHeight = rows.reduce(
        (height, sectionRows, sectionIndex) =>
          height +
          measuredSections[sectionIndex].headingHeight +
          sectionRows.reduce((total, row) => total + Math.max(...row.map((entry) => entry.height)) + GAP, 0),
        16,
      );
      const height = Math.max(32, rowsHeight - 12) + (group ? 70 : 0);
      candidates.push({
        columns,
        cardWidth,
        width,
        height,
        pageZoom: Math.min(1, Math.max(1, viewportWidth - 32) / width, Math.max(1, viewportHeight - 32) / height),
        sections: measuredSections,
        rows,
      });
    }
  }
  return chooseLayoutCandidate(candidates, mode);
}
