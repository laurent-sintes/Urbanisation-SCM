import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultHotspotMapFilters, filterMapHotspots, updateHotspotMapFilters } from './src/hotspotMap.ts';
import { emptyResolution, isFramingResolved, resolutionErrors } from './src/hotspotResolution.ts';

const hotspot = (stage = 'unassessed') => ({
  id: 'fixture',
  status: stage === 'credible' ? 'resolved' : 'validated',
  severity: 'XL',
  kind: 'scope',
  complexity: { political: 'XL', implementation: 'L' },
  resolution_options: [{ id: 'a' }, { id: 'b' }],
  resolution: {
    ...emptyResolution(),
    stage,
    summary: 'Deux solutions à qualifier',
    assessed_on: '2026-10-11',
    assessment_source: 'Séance de cadrage',
    ...(stage === 'credible'
      ? { credible_option_ids: ['a', 'b'], credibility_note: 'Hypothèses et réserves documentées' }
      : {}),
  },
});

test('credible framing accepts several options without a final choice or implementation evidence', () => {
  const item = hotspot('credible');
  assert.deepEqual(resolutionErrors(item), []);
  assert.equal(isFramingResolved(item), true);
  assert.equal(item.selected_option_id, undefined);
});
test('problem validation never assigns framing progress', () => {
  const item = hotspot();
  delete item.resolution;
  assert.equal(isFramingResolved(item), false);
  assert.deepEqual(resolutionErrors(item), []);
});
test('stages require evidence; a block requires a next step; impossible dates fail', () => {
  for (const stage of ['to_explore', 'identified', 'qualifying', 'credible']) {
    const item = hotspot(stage);
    item.resolution.assessed_on = '2026-02-30';
    assert.ok(resolutionErrors(item).some((error) => error.includes('date')));
  }
  const item = hotspot('qualifying');
  item.resolution.blocked_reason = 'Hypothèse à vérifier';
  assert.ok(resolutionErrors(item).some((error) => error.includes('prochaine')));
  item.resolution.next_step = 'Obtenir les volumes';
  assert.deepEqual(resolutionErrors(item), []);
});
test('map hides closed framing by default and permits explicit retrieval', () => {
  const closed = hotspot('credible'),
    open = { ...hotspot('qualifying'), id: 'open' };
  const filters = { ...defaultHotspotMapFilters, enabled: true };
  assert.deepEqual(
    filterMapHotspots([closed, open], filters).map((item) => item.id),
    ['open'],
  );
  assert.equal(filterMapHotspots([closed, open], { ...filters, showResolved: true }).length, 2);
  assert.deepEqual(filterMapHotspots([closed, open], { ...filters, resolutionStage: 'credible' }), [closed]);
  assert.deepEqual(filterMapHotspots([closed, open], { ...filters, status: 'resolved' }), [closed]);
});

test('explicit resolved filters keep the display checkbox consistent', () => {
  const current = { ...defaultHotspotMapFilters, enabled: true };
  const credible = updateHotspotMapFilters(current, { resolutionStage: 'credible' });
  assert.equal(credible.showResolved, true);
  const hidden = updateHotspotMapFilters(credible, { showResolved: false });
  assert.equal(hidden.resolutionStage, 'all');
  assert.deepEqual(filterMapHotspots([hotspot('credible')], hidden), []);
});
