import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  defaultHotspotMapFilters,
  encodeHotspotFilters,
  filterMapHotspots,
  hotspotRelatedElementIds,
  hotspotsInScope,
  readHotspotFilters,
  severityForComplexities,
  updateHotspotMapFilters,
} from './src/hotspotMap.ts';
import { mapRouteForNode } from './src/mapNavigation.ts';
import { adaptPublication } from './src/model.ts';

const node = (id, kind) => ({ id, kind, fields: { name: id } });
test('shared filters round-trip safely without accepting malformed or unknown criteria', () => {
  const filters = updateHotspotMapFilters(defaultHotspotMapFilters, {
    enabled: true,
    showModelHotspots: false,
    severity: 'L',
  });
  assert.deepEqual(readHotspotFilters(encodeHotspotFilters(filters)), filters);
  assert.deepEqual(readHotspotFilters('{'), defaultHotspotMapFilters);
  assert.deepEqual(readHotspotFilters('[]'), defaultHotspotMapFilters);
  assert.deepEqual(
    readHotspotFilters(JSON.stringify({ status: 'arbitrary', enabled: 'yes', unknown: true })),
    defaultHotspotMapFilters,
  );
});
test('model and usage filters stay independent and keep unqualified and historical subjects explicit', () => {
  const cases = ['structuring', 'usage', 'to_assess', undefined].map((category, index) => ({
    id: `impact-${index}`,
    severity: 'unassessed',
    kind: 'scope',
    status: 'validated',
    complexity: { political: 'unassessed', implementation: 'unassessed' },
    ...(category ? { framing_impact: { category } } : {}),
  }));
  const filters = { ...defaultHotspotMapFilters, enabled: true };
  assert.deepEqual(
    filterMapHotspots(cases, filters).map((item) => item.id),
    cases.map((item) => item.id),
  );
  assert.deepEqual(
    filterMapHotspots(cases, { ...filters, showModelHotspots: false }).map((item) => item.id),
    ['impact-1', 'impact-2', 'impact-3'],
  );
  assert.deepEqual(
    filterMapHotspots(cases, { ...filters, showUsageHotspots: false, showUnqualifiedHotspots: false }).map(
      (item) => item.id,
    ),
    ['impact-0'],
  );
  assert.deepEqual(
    filterMapHotspots(cases, { ...filters, showModelHotspots: false, showUnqualifiedHotspots: false }).map(
      (item) => item.id,
    ),
    ['impact-1'],
  );
  assert.deepEqual(
    filterMapHotspots(cases, {
      ...filters,
      showModelHotspots: false,
      showUsageHotspots: false,
      showUnqualifiedHotspots: false,
    }),
    [],
  );
  assert.equal(updateHotspotMapFilters(filters, { severity: 'L' }).showUsageHotspots, true);
});
const relation = (id, source_id, target_id) => ({ id, type: 'contains', source_id, target_id });
const model = adaptPublication({
  space: 'release',
  version: 'fixture',
  nodes: [
    node('system', 'business_system'),
    node('domain', 'domain'),
    node('area', 'area'),
    node('ba', 'business_area'),
    node('cap', 'capability'),
    node('behavior', 'behavior'),
  ],
  relations: [
    relation('r1', 'system', 'domain'),
    relation('r2', 'domain', 'area'),
    relation('r3', 'area', 'ba'),
    relation('r4', 'ba', 'cap'),
    relation('r5', 'cap', 'behavior'),
  ],
  hotspot_catalog: {
    hotspots: [
      {
        id: 'h1',
        location: { node_ids: ['cap'] },
        severity: 'XL',
        kind: 'integration',
        status: 'shared',
        complexity: { political: 'XL', implementation: 'L' },
      },
      {
        id: 'h2',
        location: { node_ids: ['system'] },
        severity: 'S',
        kind: 'scope',
        status: 'resolved',
        complexity: { political: 'S', implementation: 'M' },
      },
    ],
  },
});

test('hotspot illumination includes actual descendants without extending a projected ancestor to other branches', () => {
  const [capabilityHotspot, systemHotspot] = model.raw.hotspot_catalog.hotspots;
  assert.deepEqual(hotspotRelatedElementIds(model, [capabilityHotspot]).sort(), ['behavior', 'cap']);
  assert.deepEqual(hotspotRelatedElementIds(model, [capabilityHotspot], ['domain']).sort(), [
    'behavior',
    'cap',
    'domain',
  ]);
  assert.deepEqual(hotspotRelatedElementIds(model, [systemHotspot]).sort(), [
    'area',
    'ba',
    'behavior',
    'cap',
    'domain',
    'system',
  ]);
  assert.equal(new Set(hotspotRelatedElementIds(model, [capabilityHotspot, systemHotspot])).size, 6);
  assert.deepEqual(hotspotRelatedElementIds(model, []), []);
});

test('hotspot anchor opens a map level containing its published object', () => {
  assert.deepEqual(mapRouteForNode(model, 'ba'), {
    view: 'map',
    node: 'ba',
    scope: 'domain',
    mapDepth: 2,
    mapFocus: 'ba',
    relation: '',
    section: '',
  });
  assert.equal(mapRouteForNode(model, 'cap').mapDepth, 3);
  assert.equal(mapRouteForNode(model, 'behavior').mapDepth, 4);
  assert.equal(mapRouteForNode(model, 'domain').scope, 'domain');
});

test('same filters apply to scoped and overview hotspots without mutating publication data', () => {
  const all = model.raw.hotspot_catalog.hotspots;
  assert.deepEqual(
    hotspotsInScope(model, 'domain').map((item) => item.id),
    ['h1'],
  );
  const filters = {
    enabled: true,
    severity: 'XL',
    severityMode: 'exact',
    kind: 'all',
    status: 'all',
    political: 'all',
    implementation: 'all',
  };
  assert.deepEqual(
    filterMapHotspots(all, filters).map((item) => item.id),
    ['h1'],
  );
  assert.deepEqual(filterMapHotspots(all, { ...filters, enabled: false }), []);
  assert.deepEqual(
    filterMapHotspots(all, { ...filters, political: 'XL', implementation: 'L' }).map((item) => item.id),
    ['h1'],
  );
  assert.deepEqual(filterMapHotspots(all, { ...filters, political: 'S' }), []);
  assert.deepEqual(
    filterMapHotspots(all, { ...filters, status: 'resolved', severity: 'all' }).map((item) => item.id),
    ['h2'],
  );
  assert.equal(all.length, 2);
  const graduated = ['S', 'M', 'L', 'XL', 'unassessed'].map((severity, index) => ({
    ...all[0],
    id: `g${index}`,
    severity,
  }));
  assert.deepEqual(
    filterMapHotspots(graduated, { ...filters, severity: 'L' }).map((item) => item.id),
    ['g2'],
  );
  assert.deepEqual(
    filterMapHotspots(graduated, { ...filters, severity: 'L', severityMode: 'at_most' }).map((item) => item.id),
    ['g0', 'g1', 'g2'],
  );
  assert.deepEqual(
    filterMapHotspots(graduated, { ...filters, severity: 'L', severityMode: 'at_least' }).map((item) => item.id),
    ['g2', 'g3'],
  );
  assert.deepEqual(
    filterMapHotspots(graduated, { ...filters, severity: 'unassessed', severityMode: 'at_most' }).map(
      (item) => item.id,
    ),
    ['g4'],
  );
});

test('severity result and complexity components are alternative filters', () => {
  const political = updateHotspotMapFilters(defaultHotspotMapFilters, { political: 'XL', enabled: true });
  const axes = updateHotspotMapFilters(political, { implementation: 'L' });
  assert.equal(axes.political, 'XL');
  assert.equal(axes.implementation, 'L');
  assert.equal(axes.severity, 'all');
  const result = updateHotspotMapFilters(axes, { severity: 'XL' });
  assert.equal(result.political, 'all');
  assert.equal(result.implementation, 'all');
  assert.equal(result.severity, 'XL');
  const range = updateHotspotMapFilters(axes, { severityMode: 'at_most' });
  assert.equal(range.political, 'all');
  assert.equal(range.implementation, 'all');
  assert.equal(severityForComplexities('XL', 'L'), 'XL');
  assert.equal(severityForComplexities('M', 'M'), 'L');
  assert.equal(severityForComplexities('L', 'L'), 'XL');
  assert.equal(severityForComplexities('all', 'L'), undefined);
});
