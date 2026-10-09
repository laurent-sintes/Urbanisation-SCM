import assert from 'node:assert/strict';
import test from 'node:test';
import { dependencyLevel, dependencyLevels, projectDependencies } from './src/dependencyGraph.ts';
import { businessAreaSections, directSectionCaption, startsDirectSection } from './src/mapSections.ts';
import {
  adaptPublication,
  cardChildListOf,
  cardContentSummary,
  cardListedItems,
  childrenOf,
  lineageOf,
  parentRelationOf,
} from './src/model.ts';
import { readRoute } from './src/navigation.ts';
import { kindLabel } from './src/presentation.ts';
import { scenariosForNode } from './src/scenarioCatalog.ts';

const raw = () => ({
  space: 'release',
  version: 'fixture',
  nodes: [
    { id: 'sub', kind: 'area', fields: { name: 'Subdomain' } },
    { id: 'ba', kind: 'business_area', fields: { name: 'Responsibility' } },
    { id: 'cap', kind: 'capability', fields: { name: 'Ability', nature: 'decision' } },
    { id: 'direct', kind: 'capability', fields: { name: 'Direct', nature: 'knowledge' } },
    { id: 'ref', kind: 'reference', fields: { name: 'Reference' } },
  ],
  relations: [
    { id: 'a', type: 'contains', source_id: 'sub', target_id: 'ba' },
    { id: 'b', type: 'contains', source_id: 'ba', target_id: 'cap' },
    { id: 'c', type: 'contains', source_id: 'sub', target_id: 'direct' },
    { id: 'd', type: 'presents', source_id: 'sub', target_id: 'ref' },
    { id: 'doc', type: 'documents-reference', source_id: 'direct', target_id: 'ref' },
    {
      id: 'cooperation',
      type: 'relates-to',
      source_id: 'cap',
      target_id: 'direct',
      qualification: { meaning: 'Uses' },
    },
  ],
  scenario_catalog: {
    scenarios: [{ id: 's', title: 'Scenario' }],
    paths: [{ id: 'p', scenario_id: 's', steps: [{ contributions: [{ node_id: 'cap' }, { node_id: 'direct' }] }] }],
    legacy_links: [],
  },
});
test('overview counts listed content including direct nodes, excluding Area banners', () => {
  const source = raw();
  source.nodes.push({ id: 'second', kind: 'capability', fields: { name: 'Second' } });
  source.relations.push({ id: 'extra', type: 'contains', source_id: 'ba', target_id: 'second' });
  const m = adaptPublication(source),
    sub = m.nodeById.get('sub');
  assert.deepEqual(
    new Set(cardListedItems(cardChildListOf(m, sub)).map((n) => n.id)),
    new Set(['cap', 'second', 'direct', 'ref']),
  );
  assert.equal(cardContentSummary(m, sub), '3 capacités · 1 référentiel');
  assert.equal(cardContentSummary(m, m.nodeById.get('ba')), '2 capacités');
  assert.equal(cardContentSummary(m, m.nodeById.get('cap')), '');
});
test('optional responsibility level remains visible in cards, lineage and labels', () => {
  const m = adaptPublication(raw());
  assert.equal(kindLabel(m.nodeById.get('ba')), 'Business Area');
  assert.deepEqual(
    new Set(cardChildListOf(m, m.nodeById.get('sub')).items.map((n) => n.id)),
    new Set(['ba', 'direct', 'ref']),
  );
  assert.deepEqual(
    childrenOf(m, 'ba').map((n) => n.id),
    ['cap'],
  );
  assert.deepEqual(
    lineageOf(m, 'cap').map((n) => n.id),
    ['sub', 'ba', 'cap'],
  );
  assert.equal(parentRelationOf(m, 'direct').sourceId, 'sub');
  assert.equal(m.nodeById.get('direct').referenceParentName, 'Reference');
  assert.equal(childrenOf(m, 'ref').length, 0);
});
test('scenarios aggregate across Business Areas without duplicates', () => {
  const m = adaptPublication(raw());
  assert.deepEqual(
    scenariosForNode(m, 'ba').map((s) => s.id),
    ['s'],
  );
  assert.deepEqual(
    scenariosForNode(m, 'sub').map((s) => s.id),
    ['s'],
  );
});
test('reference Areas retain documentary cards, grouping and navigation', () => {
  const source = raw();
  source.relations.find((r) => r.id === 'd').source_id = 'ba';
  source.relations = source.relations.filter((r) => r.id !== 'b' && r.id !== 'cooperation');
  source.nodes = source.nodes.filter((n) => n.id !== 'cap');
  const m = adaptPublication(source);
  const list = cardChildListOf(m, m.nodeById.get('ba'));
  assert.equal(list.kind, 'reference');
  assert.deepEqual(
    list.items.map((n) => n.id),
    ['ref'],
  );
  assert.equal(list.items[0].kind, 'reference');
  assert.equal(cardChildListOf(m, m.nodeById.get('ref')), undefined);
  assert.deepEqual(
    lineageOf(m, 'ref').map((n) => n.id),
    ['sub', 'ba', 'ref'],
  );
  assert.deepEqual(
    businessAreaSections(m, 'sub')[0].items.map((n) => n.id),
    ['ref'],
  );
  assert.deepEqual(
    cardChildListOf(m, m.nodeById.get('sub')).businessAreaChildren.ba.map((n) => n.id),
    ['ref'],
  );
});
test('map banners group actual children without changing parents or losing direct nodes', () => {
  const m = adaptPublication(raw());
  const sections = businessAreaSections(m, 'sub');
  assert.equal(sections[0].area.id, 'ba');
  assert.deepEqual(
    sections[0].items.map((n) => n.id),
    ['cap'],
  );
  assert.deepEqual(new Set(sections.flatMap((s) => s.items.map((n) => n.id))), new Set(['cap', 'direct', 'ref']));
  assert.equal(parentRelationOf(m, 'cap').sourceId, 'ba');
  assert.equal(businessAreaSections(m, 'ba'), undefined);
});
test('common reference headings coexist with Business Areas without hiding or duplicating references', () => {
  const source = raw();
  source.nodes = source.nodes.filter((n) => n.id !== 'direct');
  source.relations = source.relations.filter((r) => !['c', 'doc', 'cooperation'].includes(r.id));
  source.nodes.push({ id: 'price', kind: 'reference', fields: { name: 'Product Price Book' } });
  source.relations.push({ id: 'price-parent', type: 'presents', source_id: 'sub', target_id: 'price' });
  const m = adaptPublication(source),
    sub = m.nodeById.get('sub');
  const sections = businessAreaSections(m, 'sub');
  assert.deepEqual(
    sections.map((s) => s.area?.name || directSectionCaption(s.items)),
    ['Responsibility', 'Référentiels communs'],
  );
  assert.deepEqual(
    sections[1].items.map((n) => n.id),
    ['ref', 'price'],
  );
  const list = cardChildListOf(m, sub);
  const headings = list.items.flatMap((item, i) =>
    startsDirectSection(list.items, i) ? [directSectionCaption([item])] : [],
  );
  assert.deepEqual(headings, ['Référentiels communs']);
  assert.deepEqual(
    cardListedItems(list).map((n) => n.id),
    ['cap', 'ref', 'price'],
  );
  assert.equal(cardContentSummary(m, sub), '1 capacité · 2 référentiels');
  assert.deepEqual(
    lineageOf(m, 'ref').map((n) => n.id),
    ['sub', 'ref'],
  );
});
test('historical direct capabilities keep their label beside common references', () => {
  const m = adaptPublication(raw()),
    list = cardChildListOf(m, m.nodeById.get('sub'));
  const sections = businessAreaSections(m, 'sub');
  assert.deepEqual(
    sections.map((s) => s.area?.name || directSectionCaption(s.items)),
    ['Responsibility', 'Référentiels communs', 'Rattachement direct au sous-domaine'],
  );
  const headings = list.items.flatMap((item, i) =>
    startsDirectSection(list.items, i) ? [directSectionCaption([item])] : [],
  );
  assert.deepEqual(headings, ['Référentiels communs', 'Rattachement direct au sous-domaine']);
  assert.deepEqual(
    sections.flatMap((s) => s.items.map((n) => n.id)),
    ['cap', 'ref', 'direct'],
  );
  assert.equal(parentRelationOf(m, 'direct').sourceId, 'sub');
});
test('relationship projection retains direct capabilities and reference links', () => {
  const m = adaptPublication(raw());
  assert.ok(dependencyLevels(m).some((x) => x.value === 'business_area'));
  const p = projectDependencies(m, { level: 'business_area', depth: 0, direction: 'both', family: 'all' });
  assert.ok(p.nodes.some((n) => n.id === 'ba'));
  assert.ok(p.nodes.some((n) => n.id === 'direct'));
  assert.ok(p.relations.some((r) => r.id === 'doc'));
  assert.equal(readRoute('#/relations?level=business_area').graphLevel, 'business_area');
  const old = raw();
  old.nodes = old.nodes.filter((n) => n.id !== 'ba');
  old.relations = old.relations.filter((r) => r.id !== 'a');
  old.relations.find((r) => r.id === 'b').source_id = 'sub';
  assert.equal(dependencyLevel(adaptPublication(old), 'business_area'), 'capability');
});
