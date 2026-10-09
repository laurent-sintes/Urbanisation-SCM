import assert from 'node:assert/strict';
import test from 'node:test';
import {
  capabilityNature,
  capabilityTypeLabel,
  capabilityTypes,
  sortCapabilitiesByType,
  startsCapabilityTypeSection,
} from './src/capabilityTypes.ts';
import { adaptPublication, childrenOf } from './src/model.ts';

const node = (id, nature, kind = 'capability') => ({ id, name: id, kind, fields: { nature } });
test('explicit types drive labels and ten distinct icons; never names or IDs', () => {
  assert.equal(Object.keys(capabilityTypes).length, 10);
  assert.equal(new Set(Object.values(capabilityTypes).map((type) => type.icon)).size, 10);
  assert.equal(capabilityTypeLabel(node('ingestion', 'integration')), 'Integration');
  assert.equal(capabilityTypeLabel(node('register', 'ledger')), 'Ledger');
  assert.equal(capabilityTypeLabel(node('ATP', 'evaluation')), 'Evaluation');
  assert.equal(capabilityTypeLabel(node('ATP', 'decision')), 'Decision');
  assert.equal(capabilityTypeLabel(node('rules', 'policy')), 'Policy');
  assert.equal(capabilityNature(node('Decision by name only', undefined)), undefined);
  assert.equal(capabilityNature(node('Supply Policy', undefined)), undefined);
  assert.equal(capabilityTypeLabel(node('Supply Policy', undefined)), 'Unspecified Type');
  assert.equal(capabilityNature(node('D05.e', 'unsupported')), undefined);
  assert.equal(capabilityNature(node('rules', 'policy_strategy')), undefined);
  assert.equal(capabilityNature(node('toString', 'toString')), undefined);
  assert.equal(capabilityNature(node('behavior', 'decision', 'behavior')), undefined);
  assert.equal(capabilityNature(node('behavior', 'policy', 'behavior')), undefined);
});
test('stable type grouping preserves the snapshot and separates every type', () => {
  const input = Object.freeze([
    node('d1', 'decision'),
    node('a', 'action'),
    node('p', 'planning'),
    node('d2', 'decision'),
    node('rules', 'policy'),
    node('old', undefined),
  ]);
  const output = sortCapabilitiesByType(input);
  assert.deepEqual(
    output.map((n) => n.id),
    ['a', 'p', 'rules', 'd1', 'd2', 'old'],
  );
  assert.deepEqual(
    input.map((n) => n.id),
    ['d1', 'a', 'p', 'd2', 'rules', 'old'],
  );
  assert.deepEqual(
    output.map((_, i) => startsCapabilityTypeSection(output, i)),
    [false, true, true, true, false, true],
  );
  for (const homogeneous of [
    [],
    [node('d', 'decision')],
    [node('d1', 'decision'), node('d2', 'decision')],
    [node('a', 'action')],
  ]) {
    assert.equal(
      homogeneous.some((_, i) => startsCapabilityTypeSection(homogeneous, i)),
      false,
    );
  }
});
test('all ten types group stably; unknown types stay neutral and non-capabilities retain order', () => {
  const types = Object.keys(capabilityTypes);
  const input = types.toReversed().flatMap((type) => [node(`${type}1`, type), node(`${type}2`, type)]);
  input.splice(2, 0, node('ref', undefined, 'reference'), node('area', undefined, 'area'));
  input.unshift(node('unknown', 'future'), node('missing', undefined));
  const output = sortCapabilitiesByType(input);
  assert.deepEqual(
    output.map((n) => n.id),
    ['ref', 'area', ...types.flatMap((type) => [`${type}1`, `${type}2`]), 'unknown', 'missing'],
  );
  assert.equal(output.filter((_, i) => startsCapabilityTypeSection(output, i)).length, 10);
  assert.equal(startsCapabilityTypeSection(output, 2), false);
  assert.equal(startsCapabilityTypeSection(output, output.length), false);
});
test('only domain and reference children are sorted, behaviors and raw edges stay intact', () => {
  const raw = {
    space: 'release',
    version: 'fixture',
    nodes: [
      { id: 'domain', kind: 'domain' },
      { id: 'a', kind: 'capability', fields: { name: 'Renamed decision', nature: 'policy' } },
      { id: 'd', kind: 'capability', fields: { name: 'ATP', nature: 'decision' } },
      { id: 'b2', kind: 'behavior', fields: { name: 'Second', nature: 'decision' } },
      { id: 'b1', kind: 'behavior', fields: { name: 'First', nature: 'action' } },
    ],
    relations: [
      { id: '1', type: 'contains', source_id: 'domain', target_id: 'd' },
      { id: '2', type: 'contains', source_id: 'domain', target_id: 'a' },
      { id: '3', type: 'contains', source_id: 'a', target_id: 'b2' },
      { id: '4', type: 'contains', source_id: 'a', target_id: 'b1' },
    ],
  };
  const model = adaptPublication(raw);
  assert.equal(capabilityNature(model.nodeById.get('a')), 'policy');
  assert.deepEqual(
    childrenOf(model, 'domain').map((n) => n.id),
    ['a', 'd'],
  );
  assert.deepEqual(
    childrenOf(model, 'a').map((n) => n.id),
    ['b2', 'b1'],
  );
  assert.deepEqual(model.raw, raw);
});
