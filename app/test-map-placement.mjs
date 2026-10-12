import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseMapGrid } from './src/mapLayout.ts';
import { operationsMapSlots, systemMapSlots } from './src/mapPlacement.ts';
import { resolveMapZoom, widthFit } from './src/mapZoom.ts';

const domains = [
  'domain-sourcing-procurement',
  'domain-sales',
  'domain-plan',
  'supply-chain-orchestration',
  'domain-logistics-execution',
];
const idsByRow = (grid, ids = domains) => grid.rows[0].map((row) => row.map((item) => ids[item.index]));
const expectedRows = [
  ['domain-plan'],
  ['domain-sourcing-procurement', 'domain-sales'],
  ['supply-chain-orchestration'],
  ['domain-logistics-execution'],
];

test('system positions follow persistent identities without mutating the published order', () => {
  const ids = ['system-enterprise-management-control', 'system-design-development', 'system-business-operations'];
  const original = [...ids];
  const slots = systemMapSlots(ids);
  assert.deepEqual(
    slots.map((slot) => ids[slot.index]),
    [ids[1], ids[2], ids[0]],
  );
  assert.deepEqual(
    slots.map((slot) => [slot.row, slot.column]),
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  );
  assert.deepEqual(ids, original);
  assert.equal(systemMapSlots(['design', 'operations', 'control']), undefined);
  assert.equal(systemMapSlots(ids.slice(1)), undefined);
});

test('Logistics is a separate system directly below Business Operations in the four-system map', () => {
  const ids = [
    'domain-logistics-execution',
    'system-enterprise-management-control',
    'system-business-operations',
    'system-design-development',
  ];
  const original = [...ids];
  const slots = systemMapSlots(ids);
  assert.deepEqual(
    slots.map((slot) => [ids[slot.index], slot.row, slot.column, slot.span]),
    [
      ['system-design-development', 0, 0, 1],
      ['system-business-operations', 0, 1, 1],
      ['system-enterprise-management-control', 0, 2, 1],
      ['domain-logistics-execution', 1, 1, 1],
    ],
  );
  assert.deepEqual(ids, original);
  assert.equal(systemMapSlots([...ids, 'another-system']), undefined);
  assert.equal(systemMapSlots(ids.slice(0, 3)), undefined);
});

test('Business Operations keeps four rows in every framing mode and canvas size', () => {
  const slots = operationsMapSlots('system-business-operations', domains);
  for (const width of [320, 768, 1100, 1800]) {
    for (const height of [420, 1000]) {
      for (const mode of ['page', 'width']) {
        for (const heights of [
          [280, 280, 280, 280, 280],
          [300, 420, 350, 4000, 220],
        ]) {
          const sections = [{ heights, headingHeight: 0, prominentIndex: 3 }];
          const grid = chooseMapGrid(sections, width, height, mode, true, undefined, slots);
          assert.deepEqual(idsByRow(grid), expectedRows);
          assert.equal(grid.columns, 2);
          assert.deepEqual(
            grid.rows[0].map((row) => row.map((item) => item.span)),
            [[2], [1, 1], [2], [2]],
          );
          assert.deepEqual(
            grid.rows[0][1].map((item) => item.column),
            [0, 1],
          );
          assert.ok(grid.height > Math.max(...heights));
        }
      }
    }
  }
});

test('fixed full-width domains use measured heights at their actual width', () => {
  const slots = operationsMapSlots('system-business-operations', domains);
  const sections = [{ heights: [300, 300, 300, 300, 300], headingHeight: 0 }];
  const measure = (width) => [
    { heights: width > 500 ? [200, 200, 180, 900, 150] : [300, 350, 360, 1500, 220], headingHeight: 0 },
  ];
  const grid = chooseMapGrid(sections, 1100, 600, 'width', true, measure, slots);
  assert.deepEqual(
    grid.rows[0].map((row) => row.map((item) => item.height)),
    [[180], [300, 350], [900], [150]],
  );
  assert.equal(grid.height, 1766);
});

test('historical omissions remain absent and additional published domains are preserved', () => {
  const ids = ['domain-sales', 'additional-domain', 'domain-plan'];
  const slots = operationsMapSlots('system-business-operations', ids);
  const grid = chooseMapGrid(
    [{ heights: [280, 280, 280], headingHeight: 0 }],
    1200,
    600,
    'width',
    true,
    undefined,
    slots,
  );
  assert.deepEqual(idsByRow(grid, ids), [['domain-plan'], ['domain-sales'], ['additional-domain']]);
  assert.equal(operationsMapSlots('system-business-operations', ['legacy-domain']), undefined);
});

test('domain focus keeps the standard automatic placement, even for the same identifiers', () => {
  assert.equal(operationsMapSlots('supply-chain-orchestration', domains), undefined);
  const sections = [{ heights: [280, 280, 280, 280, 280], headingHeight: 0 }];
  const narrow = chooseMapGrid(sections, 700, 600, 'width', true);
  const wide = chooseMapGrid(sections, 1800, 600, 'width', true);
  assert.ok(wide.columns > narrow.columns);
});

test('narrow fixed maps fall back to scrolling while preserving native reading size', () => {
  const slots = operationsMapSlots('system-business-operations', domains);
  const grid = chooseMapGrid(
    [{ heights: [280, 280, 280, 280, 280], headingHeight: 0 }],
    320,
    420,
    'page',
    true,
    undefined,
    slots,
  );
  assert.equal(resolveMapZoom('page', 0, grid.pageZoom), 'width');
  const frame = widthFit(grid.width, grid.height, 320, 420, true);
  assert.equal(frame.zoom, 1);
  assert.ok(grid.width + 32 > 320);
  assert.ok(frame.height > grid.height);
  assert.ok(widthFit(grid.width, grid.height, 320, 420).zoom < 1);
});
