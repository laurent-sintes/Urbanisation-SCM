import assert from 'node:assert/strict';
import { test } from 'node:test';
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
