import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  adaptPublication, cardChildListOf, childrenOf, descendantsOf, focusGraph, hasCapabilityCards, isStructural,
  lineageOf, neighborhood, parentRelationOf, parentsOf, rootsOf, searchModel,
} from './src/model.ts';

import { loadPublication } from '../scripts/load-publication.mjs';
import { readRoute, routeHash } from './src/navigation.ts';
import { kindLabel } from './src/presentation.ts';

const current = await loadPublication({ version: '2026-09-13.5' });
const model = adaptPublication(current.raw);
const relationId = 'REL-EXECUTION-FACTS-ORDER-RECONCILIATION';
const ids = nodes => nodes.map(node => node.id);

test('subdomain naming is selected by the snapshot without changing historical labels', () => {
  const raw = structuredClone(current.raw);
  const area = raw.nodes.find(node => node.kind === 'domain');
  area.kind = 'area';
  raw.principles = (raw.principles || []).filter(p => !['PRINCIPLE-DOMAIN-PURPOSE', 'PRINCIPLE-DOMAIN-SUBDOMAIN'].includes(p.id));
  assert.equal(adaptPublication(raw).nodeById.get(area.id).hierarchyLabel, 'Area');
  raw.principles.push({ id: 'PRINCIPLE-DOMAIN-PURPOSE', statement: 'Historical fixture', source_refs: [] });
  assert.equal(adaptPublication(raw).nodeById.get(area.id).hierarchyLabel, 'Purpose');
  raw.principles.push({ id: 'PRINCIPLE-DOMAIN-SUBDOMAIN', statement: 'Current fixture', source_refs: [] });
  assert.equal(adaptPublication(raw).nodeById.get(area.id).hierarchyLabel, 'Sous-domaine');
  assert.equal(model.nodeById.get(area.id).kind, 'domain');
});

test('visible market comparisons are searchable only in their own immutable publication', () => {
  const raw = structuredClone(current.raw);
  const id = raw.nodes[0].id;
  raw.nodes[0].fields.market_comparisons = [{ vendor: 'RELEX', element_name: 'In-season fill-in', differences: 'SeuilsCapsulesTest' }];
  const enriched = adaptPublication(raw);
  assert.deepEqual(ids(searchModel(enriched, 'RELEX SeuilsCapsulesTest')), [id]);
  assert.equal(searchModel(model, 'SeuilsCapsulesTest').length, 0);
  assert.equal(enriched.nodeById.get(id).fields.market_comparisons[0].vendor, 'RELEX');
  assert.ok(Object.isFrozen(enriched.nodeById.get(id).fields.market_comparisons[0]));
});

function behaviorFixture() {
  const raw = structuredClone(current.raw);
  // This historical fixture predates ATP; use an existing capability as a test parent.
  raw.nodes.find(n => n.id === 'D03.a').fields.name = 'Available-to-Promise (ATP)';
  raw.nodes.push({ id: 'UNRELATED_ID', kind: 'behavior', layer: 'transactional', fields: {
    name: 'Operational Availability Timing', definition: 'Prendre en compte les délais réels de mobilisation, magasin et réserve.'
  }, review: { state: 'partial' } });
  raw.relations.push({ id: 'EXPLICIT_BEHAVIOR_PARENT', source_id: 'D03.a', target_id: 'UNRELATED_ID', type: 'contains' });
  return raw;
}
test('behavior has explicit lineage, searchable content and stays out of capability counts', () => {
  const withBehavior = adaptPublication(behaviorFixture());
  assert.equal(withBehavior.nodes.filter(n => n.kind === 'capability').length, model.nodes.filter(n => n.kind === 'capability').length);
  assert.equal(lineageOf(withBehavior, 'UNRELATED_ID').at(-2).id, 'D03.a');
  assert.deepEqual(ids(childrenOf(withBehavior, 'UNRELATED_ID')), []);
  assert.ok(ids(searchModel(withBehavior, 'ATP mobilisation')).includes('UNRELATED_ID'));
  assert.ok(ids(focusGraph(withBehavior, 'D03.a').nodes).includes('UNRELATED_ID'));
  assert.equal(neighborhood(withBehavior, 'D03.a').relations.some(r => r.id === 'EXPLICIT_BEHAVIOR_PARENT'), false);
});
test('behavior rejects orphan, domain parent and recursive children', () => {
  for (const mutate of [
    raw => raw.relations.pop(),
    raw => { raw.relations.at(-1).source_id = 'D03'; },
    raw => raw.relations.push({ id: 'CHILD', type: 'contains', source_id: 'UNRELATED_ID', target_id: 'D01.f' }),
  ]) {
    const raw = behaviorFixture(); mutate(raw);
    assert.throws(() => adaptPublication(raw));
  }
});

test('the live current pointer projects exactly the published file it designates', async () => {
  const live = await loadPublication();
  const projected = adaptPublication(live.raw);
  assert.equal(projected.version, live.descriptor.version);
  assert.deepEqual(ids(projected.nodes), live.raw.nodes.map(node => node.id));
  assert.deepEqual(projected.relations.map(relation => relation.id), live.raw.relations.map(relation => relation.id));
});

test('real v003 is resolved through its index and descriptor, with source identity', () => {
  assert.equal(model.version, '2026-09-13.5');
  assert.equal(model.revision, 3);
  assert.equal(current.descriptor.version, model.version);
  assert.equal(model.publication.version, model.version);
  assert.equal(model.nodes.length, 51);
  assert.equal(model.relations.length, 50);
  assert.equal(model.sourcePath, 'modeles/release/2026-09-13.5/model.json');
  assert.deepEqual(ids(model.nodes), current.raw.nodes.map(node => node.id));
  assert.deepEqual(model.relations.map(relation => relation.id), current.raw.relations.map(relation => relation.id));
  assert.equal(model.nodes.filter(node => ['object', 'document', 'event'].includes(node.kind)).length, 0);
});

test('navigation uses explicit edges even when identifiers suggest another domain', () => {
  assert.deepEqual(ids(parentsOf(model, 'D02.b')), ['D01']);
  assert.deepEqual(ids(parentsOf(model, 'D02.c')), ['D01']);
  assert.deepEqual(ids(parentsOf(model, 'D02.e')), ['D03']);
  assert.deepEqual(ids(lineageOf(model, 'D02.c')), ['universe-supply', 'D01', 'D02.c']);
  assert.deepEqual(new Set(ids(rootsOf(model))), new Set(['universe-case', 'universe-supply']));
  assert.equal(childrenOf(model, 'universe-case').length, 0);
  assert.equal(parentRelationOf(model, 'D01').type, 'presents');
  assert.equal(parentRelationOf(model, 'D02.c').type, 'contains');
});

test('presentation groups remain distinct from semantic urbanism levels', () => {
  // Legacy publication omits the optional role; it must never become a semantic level.
  assert.equal(model.nodeById.get('business-references').kind, 'group');
  assert.equal(model.nodeById.get('business-references').groupRole, undefined);
  assert.equal(model.nodeById.get('universe-supply').groupRole, 'urbanism_level');
  assert.equal(model.nodeById.get('universe-supply').levelRef, 'universe');
  assert.equal(childrenOf(model, 'business-references', 'presents').length, 5);
  assert.equal(childrenOf(model, 'business-references', 'contains').length, 0);
});

for (const kind of ['area', 'group']) test(`${kind} preserves six reference cards, twelve capabilities and their direct links`, () => {
  const referenceNames = ['Product Reference', 'Party / Role', 'Agreement', 'Catalog', 'Fulfillment Network', 'Service Catalog'];
  const raw = {
    space: 'release', version: `reference-cards-${kind}`,
    nodes: [
      { id: 'supply', kind: 'domain', fields: { name: 'Supply Chain Orchestration' } },
      { id: 'reference-scope', kind, fields: { name: 'Authoritative Data' } },
    ],
    relations: [{ id: 'scope-parent', type: 'presents', source_id: 'supply', target_id: 'reference-scope' }],
  };
  referenceNames.forEach((name, index) => {
    const id = `reference-${index}`;
    raw.nodes.push({ id, kind: 'reference', fields: { name } });
    raw.relations.push({ id: `presents-${index}`, type: 'presents', source_id: 'reference-scope', target_id: id });
    for (const [suffix, nature] of [['Ingestion', 'action'], ['Visibility', 'knowledge']]) {
      const capabilityId = `${id}-${suffix}`;
      raw.nodes.push({ id: capabilityId, kind: 'capability', fields: { name: `${name} ${suffix}`, nature } });
      raw.relations.push({ id: `contains-${capabilityId}`, type: 'contains', source_id: id, target_id: capabilityId });
    }
  });
  const publication = adaptPublication(raw);
  const scope = publication.nodeById.get('reference-scope');
  assert.equal(kindLabel(scope), kind === 'area' ? 'Area' : 'Presentation Group');
  assert.equal(parentRelationOf(publication, scope.id).type, 'presents');
  assert.equal(hasCapabilityCards(publication, 'supply'), true);
  assert.equal(hasCapabilityCards(publication, scope.id), true);
  const references = cardChildListOf(publication, scope);
  assert.equal(references.kind, 'reference', 'An Area presenting references must not show an empty capability list.');
  assert.deepEqual(references.items.map(item => item.name), referenceNames);
  const capabilities = references.items.flatMap(reference => {
    assert.equal(parentRelationOf(publication, reference.id).type, 'presents');
    const list = cardChildListOf(publication, reference);
    assert.equal(list.kind, 'capability');
    assert.equal(list.items.length, 2);
    for (const capability of list.items) {
      assert.equal(capability.referenceParentName, reference.name);
      assert.deepEqual(ids(lineageOf(publication, capability.id)), ['supply', scope.id, reference.id, capability.id]);
      const directLink = readRoute(routeHash({ ...readRoute(''), version: publication.version, node: capability.id, view: 'sheet' }));
      assert.equal(directLink.version, publication.version);
      assert.equal(publication.nodeById.get(directLink.node), capability);
      assert.equal(cardChildListOf(publication, capability), undefined);
    }
    return list.items;
  });
  assert.equal(new Set(ids(capabilities)).size, 12);
  assert.deepEqual(ids(focusGraph(publication, scope.id).nodes), [scope.id, ...ids(references.items)]);
  assert.equal(descendantsOf(publication, scope.id).length, 18);
  assert.deepEqual(publication.raw, raw, 'Rendering must preserve historical types and relation kinds.');
});

test('relation qualification, sources and partial validations survive projection intact', () => {
  const relation = model.relationById.get(relationId);
  const rawRelation = current.raw.relations.find(item => item.id === relationId);
  assert.deepEqual(relation.qualification, rawRelation.qualification);
  assert.deepEqual(relation.lifecycle, rawRelation.lifecycle);
  assert.deepEqual(relation.sourceRefs, rawRelation.source_refs);
  assert.equal(relation.status, 'proposed');
  assert.equal(relation.sourceId, 'D07.c');
  assert.equal(relation.targetId, 'D04.h');
  assert.ok(relation.qualification.conditions[0].includes('prestation'));
  assert.ok(relation.qualification.effects[0].includes('reliquat Order'));
  const supply = model.nodeById.get('universe-supply');
  assert.equal(supply.status, 'partial');
  assert.equal(supply.lifecycle.state, 'urbanist_validated');
  assert.deepEqual(supply.approvedFields, ['name']);
  assert.deepEqual(supply.proposedFields, ['definition']);
});

test('search uses published fields and published ancestry without backlog completion', () => {
  assert.ok(ids(searchModel(model, 'Order Reconciliation')).includes('D04.h'));
  assert.ok(ids(searchModel(model, 'D02.c')).includes('D02.c'));
  assert.equal(searchModel(model, 'ILL-OBJ-01').length, 0);
  const raw = structuredClone(current.raw);
  raw.backlogAliases = { 'D04.h': 'synonyme-interdit-backlog' };
  raw.excluded_nodes.push({ id: 'synonyme-interdit-backlog' });
  assert.equal(searchModel(adaptPublication(raw), 'synonyme-interdit-backlog').length, 0);
});

test('real local graph follows published direction without adding structural dependencies', () => {
  assert.deepEqual(ids(neighborhood(model, 'D07.c').nodes).sort(), ['D04.h', 'D07.c']);
  assert.deepEqual(neighborhood(model, 'D07.c').relations.map(relation => relation.id), [relationId]);
  assert.equal(neighborhood(model, 'D07.c').relations.some(isStructural), false);
  assert.deepEqual(ids(neighborhood(model, 'D07.c', { direction: 'incoming' }).nodes), ['D07.c']);
  assert.equal(neighborhood(model, 'D04.h', { direction: 'incoming' }).relations[0].sourceId, 'D07.c');
  assert.equal(neighborhood(model, 'D04.h', { direction: 'outgoing' }).relations.length, 0);
  assert.equal(focusGraph(model, relationId).relations[0].id, relationId);
});

test('helpers and attempted renderer edits cannot mutate the input publication', () => {
  const input = structuredClone(current.raw);
  const before = JSON.stringify(input);
  const projection = adaptPublication(input);
  childrenOf(projection, 'D01').reverse();
  descendantsOf(projection, 'universe-supply').reverse();
  neighborhood(projection, 'D07.c', { depth: 2 });
  focusGraph(projection, 'D04');
  searchModel(projection, 'Supply');
  assert.throws(() => { projection.nodeById.get('D04').fields.name = 'changed'; }, TypeError);
  assert.throws(() => { projection.relationById.get(relationId).qualification.conditions.push('changed'); }, TypeError);
  assert.equal(JSON.stringify(input), before);
});

function syntheticFixture() {
  const node = (id, kind = 'capability', fields = {}) => ({ id, kind, fields: { name: id, ...fields }, review: { state: 'proposed' } });
  const edge = (id, source_id, target_id, type) => ({ id, source_id, target_id, type, review: { state: 'proposed' } });
  return {
    space: 'release', version: 'synthetic-test-only',
    nodes: [
      { ...node('universe', 'group'), group_role: 'urbanism_level', level_ref: 'universe' },
      node('domain', 'domain'), node('level-three'), node('deep-leaf', 'object', { name: 'Événement de contrôle' }),
      { ...node('presentation', 'group'), group_role: 'presentation' },
      node('reference', 'reference'), node('event', 'event'), node('document', 'document'),
    ],
    relations: [
      edge('u-d', 'universe', 'domain', 'contains'), edge('d-l3', 'domain', 'level-three', 'contains'),
      edge('l3-l4', 'level-three', 'deep-leaf', 'contains'), edge('u-p', 'universe', 'presentation', 'presents'),
      edge('p-r', 'presentation', 'reference', 'presents'),
      { ...edge('one', 'deep-leaf', 'event', 'relates-to'), qualification: { meaning: 'Synthetic link only', role: 'synthetic', conditions: ['one'], effects: ['two'], scope: 'test' } },
      edge('two', 'event', 'document', 'relates-to'), edge('three', 'reference', 'event', 'relates-to'),
    ],
  };
}

test('synthetic deeper model keeps arbitrary depth, actual types and explicit presentation', () => {
  const fixture = adaptPublication(syntheticFixture());
  assert.deepEqual(ids(lineageOf(fixture, 'deep-leaf')), ['universe', 'domain', 'level-three', 'deep-leaf']);
  assert.equal(descendantsOf(fixture, 'universe').length, 5);
  assert.equal(fixture.nodeById.get('deep-leaf').kind, 'object');
  assert.deepEqual(ids(childrenOf(fixture, 'universe', 'contains')), ['domain']);
  assert.deepEqual(ids(childrenOf(fixture, 'universe', 'presents')), ['presentation']);
  assert.deepEqual(ids(searchModel(fixture, 'evenement controle')), ['deep-leaf']);
  assert.equal(focusGraph(fixture, 'domain').mode, 'hierarchy');
  assert.deepEqual(ids(focusGraph(fixture, 'domain').nodes), ['domain', 'level-three']);
});

test('synthetic 1/2 hop traversal handles direction, branching and filtered edge types', () => {
  const fixture = adaptPublication(syntheticFixture());
  assert.deepEqual(new Set(ids(neighborhood(fixture, 'deep-leaf').nodes)), new Set(['deep-leaf', 'event']));
  assert.equal(neighborhood(fixture, 'deep-leaf').hiddenRelationCount, 2);
  assert.deepEqual(new Set(ids(neighborhood(fixture, 'deep-leaf', { depth: 2 }).nodes)), new Set(['deep-leaf', 'event', 'document', 'reference']));
  assert.deepEqual(new Set(ids(neighborhood(fixture, 'deep-leaf', { depth: 2, direction: 'outgoing' }).nodes)), new Set(['deep-leaf', 'event', 'document']));
  assert.equal(neighborhood(fixture, 'deep-leaf', { relationTypes: ['unknown'] }).relations.length, 0);
  assert.throws(() => neighborhood(fixture, 'absent'), /absent/);
  assert.throws(() => neighborhood(fixture, 'event', { depth: 3 }), /profondeur/);
});

test('invalid topology is rejected instead of silently repairing or inferring parents', () => {
  const mutate = change => { const fixture = syntheticFixture(); change(fixture); return () => adaptPublication(fixture); };
  assert.throws(mutate(fixture => { fixture.space = 'backlog'; }), /release/);
  assert.throws(mutate(fixture => fixture.nodes.push(fixture.nodes[0])), /dupliqué/);
  assert.throws(mutate(fixture => fixture.relations.push(fixture.relations[0])), /dupliqué/);
  assert.throws(mutate(fixture => { fixture.relations[0].target_id = 'absent'; }), /Extrémité/);
  assert.throws(mutate(fixture => fixture.relations.push({ id: 'second-parent', source_id: 'domain', target_id: 'reference', type: 'contains' })), /Plusieurs parents/);
  assert.throws(mutate(fixture => fixture.relations.push({ id: 'cycle', source_id: 'deep-leaf', target_id: 'universe', type: 'contains' })), /Cycle/);
});

test('historical publication is selected explicitly and never filled from current', async () => {
  const historical = await loadPublication({ version: '2026-09-13.4' });
  const older = adaptPublication(historical.raw);
  assert.equal(older.version, '2026-09-13.4');
  assert.equal(older.nodeById.has('universe-supply'), false);
  assert.equal(older.nodeById.has('D04.h'), false);
  assert.equal(older.relationById.has(relationId), false);
  await assert.rejects(loadPublication({ version: 'unknown-publication' }), /Unknown publication version/);
});
