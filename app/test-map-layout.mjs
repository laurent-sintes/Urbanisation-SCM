import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseLayoutCandidate, overviewLayout, prominentChildIndex } from './src/adaptiveLayout.ts';
import { chooseMapGrid } from './src/mapLayout.ts';
import { widthFit } from './src/mapZoom.ts';

const panels = [{ heights: [420, 380, 360, 340, 320, 300], headingHeight: 52 }];

test('page layout rearranges panels to fit a wide, short canvas', () => {
  const wide = chooseMapGrid(panels, 1800, 680, 'page');
  const narrow = chooseMapGrid(panels, 760, 1100, 'page');
  assert.ok(wide.columns > narrow.columns);
  assert.ok(wide.height < narrow.height);
  assert.ok(wide.pageZoom > 0.6);
});

test('width layout expands cards and columns without enlarging the viewport', () => {
  const wide = chooseMapGrid(panels, 1800, 680, 'width');
  const narrow = chooseMapGrid(panels, 760, 680, 'width');
  assert.ok(wide.columns > narrow.columns);
  assert.ok(wide.cardWidth >= 300 && wide.cardWidth <= 1200);
  assert.ok(wide.width <= 1800);
  const sparse = chooseMapGrid([{ heights: [300, 240], headingHeight: 0 }], 1200, 600, 'width');
  assert.equal(sparse.columns, 2);
  assert.equal(sparse.cardWidth, 554);
  const single = chooseMapGrid([{ heights: [300], headingHeight: 0 }], 1060, 600, 'width', true);
  assert.equal(single.cardWidth, 968);
  assert.equal(widthFit(single.width, single.height, 1060, 600).zoom, 1);
});

test('section boundaries and card heights contribute to complete-page framing', () => {
  const separate = chooseMapGrid(
    [
      { heights: [420, 200], headingHeight: 64 },
      { heights: [380], headingHeight: 52 },
    ],
    1200,
    900,
    'page',
    true,
  );
  const together = chooseMapGrid([{ heights: [420, 200, 380], headingHeight: 0 }], 1200, 900, 'page', true);
  assert.ok(separate.height > together.height);
  assert.ok(separate.width > 0 && separate.pageZoom > 0);
});

test('a dominant card spans two tracks while a short neighbour keeps its own height', () => {
  const sections = [{ heights: [220, 220, 220, 1900, 220], headingHeight: 0, prominentIndex: 3 }];
  const measure = (width) => [{ ...sections[0], heights: [220, 220, 220, width > 500 ? 1100 : 1900, 220] }];
  const grid = chooseMapGrid(sections, 1100, 800, 'width', false, measure);
  const prominentRow = grid.rows[0].find((row) => row.some((item) => item.index === 3));
  const prominent = prominentRow.find((item) => item.index === 3);
  const neighbour = prominentRow.find((item) => item.index === 4);
  assert.equal(grid.columns, 3);
  assert.equal(prominent.span, 2);
  assert.equal(prominent.height, 1100);
  assert.equal(neighbour.height, 220);
  assert.equal(neighbour.displayHeight, 220);
  assert.equal(prominent.column + prominent.span, neighbour.column);
});

test('overview gives a clearly dominant system and nested domain more room', () => {
  assert.deepEqual(overviewLayout([3, 18, 4], 1100), { kind: 'featured', featuredIndex: 1 });
  assert.deepEqual(overviewLayout([3, 18, 4], 700), { kind: 'stack' });
  assert.deepEqual(overviewLayout([4, 5, 4], 1100), { kind: 'equal' });
  assert.equal(prominentChildIndex([1, 1, 10, 1]), 2);
  assert.equal(prominentChildIndex([2, 3, 2, 1]), undefined);
});

test('equally wide layouts choose the shorter arrangement even for a modest gain', () => {
  const dense = { width: 1280, height: 1900, pageZoom: 0.4 };
  const spread = { width: 1280, height: 1740, pageZoom: 0.4 };
  assert.equal(chooseLayoutCandidate([dense, spread], 'width'), spread);
});
