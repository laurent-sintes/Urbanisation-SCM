import assert from 'node:assert/strict';
import { test } from 'node:test';
import { areaListAtDetail } from './src/mapDetail.ts';

test('Business Area detail does not reveal directly attached capabilities or references', () => {
  const businessArea = { id: 'ba', kind: 'business_area' };
  const capability = { id: 'cap', kind: 'capability' };
  const reference = { id: 'ref', kind: 'reference' };
  const list = {
    kind: 'mixed',
    items: [businessArea, capability, reference],
    businessAreaChildren: { ba: [capability] },
  };
  assert.deepEqual(areaListAtDetail(list, 2).items, [businessArea]);
  assert.deepEqual(areaListAtDetail(list, 2).businessAreaChildren, { ba: [] });
  assert.equal(areaListAtDetail(list, 3), list);
});
