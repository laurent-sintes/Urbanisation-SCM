import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPublication } from '../scripts/load-publication.mjs';
import { dependencyLevel, dependencyLevels, projectDependencies } from './src/dependencyGraph.ts';
import {
  adaptPublication,
  cardChildListOf,
  childrenOf,
  hasCapabilityCards,
  isCapabilityContainer,
  isStructural,
} from './src/model.ts';
import { kindLabel } from './src/presentation.ts';

const options = { level: 'capability', depth: 0, direction: 'both', family: 'all' };
test('a shared reference and policy Purpose keeps both kinds of children visible', () => {
  const raw = {
    space: 'release',
    version: 'mixed-purpose',
    nodes: [
      { id: 'purpose', kind: 'area', fields: { name: 'Reference & Policy' } },
      { id: 'reference', kind: 'reference', fields: { name: 'Catalog' } },
      { id: 'policy', kind: 'capability', fields: { name: 'Policy', nature: 'policy' } },
    ],
    relations: [
      { id: 'ref', type: 'presents', source_id: 'purpose', target_id: 'reference' },
      { id: 'cap', type: 'contains', source_id: 'purpose', target_id: 'policy' },
    ],
  };
  const model = adaptPublication(raw);
  const list = cardChildListOf(model, model.nodeById.get('purpose'));
  assert.equal(list.kind, 'mixed');
  assert.deepEqual(
    list.items.map((item) => item.id),
    ['reference', 'policy'],
  );
});
test('Purpose labels follow the selected snapshot without relabeling historical Areas', () => {
  const old = {
    space: 'release',
    version: 'old-area',
    nodes: [{ id: 'a', kind: 'area', fields: { name: 'A' } }],
    relations: [],
  };
  const next = structuredClone(old);
  next.version = 'new-purpose';
  next.principles = [{ id: 'PRINCIPLE-DOMAIN-PURPOSE' }];
  const historical = adaptPublication(old),
    current = adaptPublication(next);
  assert.equal(kindLabel(historical.nodeById.get('a')), 'Area');
  assert.equal(kindLabel(current.nodeById.get('a')), 'Purpose');
  assert.equal(dependencyLevels(historical)[1].label, 'Areas et référentiels');
  assert.equal(dependencyLevels(current)[1].label, 'Purposes et référentiels');
  const subdomain = adaptPublication({ ...next, principles: [{ id: 'PRINCIPLE-DOMAIN-SUBDOMAIN' }] });
  assert.equal(dependencyLevels(subdomain)[1].label, 'Sous-domaines et référentiels');
  assert.equal(kindLabel(adaptPublication(old).nodeById.get('a')), 'Area');
});
const n = (id, kind, extra = {}) => ({ id, kind, layer: 'transactional', fields: { name: id }, ...extra });
const parent = (source_id, target_id, type = 'contains') => ({ id: `parent:${target_id}`, type, source_id, target_id });
const r = (id, source_id, target_id, extra = {}) => ({
  id,
  type: 'relates-to',
  source_id,
  target_id,
  qualification: { role: 'needs', meaning: `Sens de ${id}`, conditions: ['Selon le cas'], effects: ['Résultat utile'] },
  review: { state: 'partial' },
  lifecycle: { validated_fields: ['source_id', 'target_id'] },
  source_refs: ['U-test'],
  ...extra,
});
function rawFixture() {
  return {
    space: 'release',
    version: 'test-isolated-snapshot',
    nodes: [
      n('scope-one', 'group', { level_ref: 'universe' }),
      n('scope-empty', 'group', { level_ref: 'universe' }),
      n('business-references', 'group'),
      n('d1', 'domain'),
      n('d2', 'domain'),
      n('d-empty', 'domain'),
      n('reference', 'reference'),
      n('d-old.capability', 'capability'),
      n('b', 'capability'),
      n('c', 'capability'),
      n('d', 'capability'),
      n('isolated', 'capability'),
      n('reference-capability', 'capability'),
      n('behavior', 'behavior'),
      n('object', 'object'),
      n('document', 'document'),
      n('event', 'event'),
    ],
    relations: [
      parent('scope-one', 'd1', 'presents'),
      parent('scope-one', 'd2', 'presents'),
      parent('scope-one', 'd-empty', 'presents'),
      parent('scope-one', 'business-references', 'presents'),
      parent('business-references', 'reference', 'presents'),
      parent('d2', 'd-old.capability'),
      parent('d1', 'b'),
      parent('d1', 'c'),
      parent('d2', 'd'),
      parent('d1', 'isolated'),
      parent('reference', 'reference-capability'),
      parent('d-old.capability', 'behavior'),
      r('a-b', 'd-old.capability', 'b'),
      r('b-a', 'b', 'd-old.capability'),
      r('b-c', 'b', 'c'),
      r('c-d', 'c', 'd'),
      r('behavior-b', 'behavior', 'b'),
      r('b-behavior', 'b', 'behavior'),
      r('a-behavior', 'd-old.capability', 'behavior'),
      r('a-reference', 'd-old.capability', 'reference-capability'),
      r('other-a-b', 'd-old.capability', 'b', {
        qualification: { meaning: 'A besoin de : simple texte, rôle absent' },
      }),
      r('object-link', 'b', 'object', { type: 'confirms', qualification: {} }),
      r('document-link', 'document', 'object', {
        type: 'represents',
        qualification: {},
        fields: { label: 'Représente' },
      }),
      r('event-link', 'document', 'event', { type: 'records', qualification: {} }),
      r('historical-domain-link', 'd1', 'd2', { type: 'provides-knowledge', qualification: {} }),
    ],
  };
}
const fixture = () => adaptPublication(rawFixture());
const project = (model, overrides = {}) => projectDependencies(model, { ...options, ...overrides });
const nodeIds = (projection) => projection.nodes.map((node) => node.id);
const relationIds = (projection) => projection.relations.map((relation) => relation.id);
const accountedIds = (projection) => [
  ...projection.edges.flatMap((edge) => edge.relationIds),
  ...projection.nodes.flatMap((node) => node.internalRelationIds),
];

function areaFixture() {
  const raw = rawFixture();
  for (const node of raw.nodes) {
    if (node.kind === 'domain') node.kind = 'area';
    else if (node.level_ref === 'universe') {
      node.kind = 'domain';
      delete node.level_ref;
    }
  }
  raw.nodes.find((node) => node.id === 'business-references').fields.name = 'Authoritative Data';
  return adaptPublication(raw);
}

test('Domain / Area groups each relation at its published level while preserving reference and presentation kinds', () => {
  const model = areaFixture();
  const before = JSON.stringify(model.raw);
  const originalIds = model.relations
    .filter((relation) => !isStructural(relation))
    .map((relation) => relation.id)
    .sort();
  const areas = project(model, { level: 'area' });
  assert.ok(areas.edges.some((edge) => edge.source === 'd2' && edge.target === 'd1'));
  assert.ok(areas.nodes.find((node) => node.id === 'd2').memberIds.includes('d-old.capability'));
  assert.equal(areas.nodes.find((node) => node.id === 'reference').item.kind, 'reference');
  assert.ok(nodeIds(areas).includes('d-empty'));
  assert.ok(!nodeIds(areas).includes('business-references'));
  const domains = project(model, { level: 'domain' });
  assert.ok(domains.nodes.find((node) => node.id === 'scope-one').memberIds.includes('reference-capability'));
  assert.ok(domains.nodes.find((node) => node.id === 'scope-one').internalRelationIds.includes('a-reference'));
  assert.ok(nodeIds(domains).includes('scope-empty'));
  assert.ok(!nodeIds(domains).includes('reference'));
  for (const level of ['capability', 'area', 'domain', 'universe']) {
    const graph = project(model, { level });
    assert.deepEqual(accountedIds(graph).sort(), originalIds);
    for (const kind of ['object', 'document', 'event']) assert.ok(graph.nodes.some((node) => node.item.kind === kind));
  }
  assert.deepEqual(project(model, { level: 'universe' }), domains);
  assert.equal(JSON.stringify(model.raw), before);
});

test('cards and navigation retain the terminology and rank of the selected publication', () => {
  const modern = areaFixture(),
    historical = fixture();
  assert.deepEqual(
    dependencyLevels(modern).map((level) => level.value),
    ['capability', 'area', 'domain'],
  );
  assert.deepEqual(
    dependencyLevels(historical).map((level) => level.value),
    ['capability', 'domain', 'universe'],
  );
  assert.equal(dependencyLevel(historical, 'area'), 'domain');
  assert.equal(dependencyLevel(modern, 'universe'), 'domain');
  assert.equal(kindLabel(modern.nodeById.get('scope-one')), 'Domain');
  assert.equal(kindLabel(modern.nodeById.get('d1')), 'Area');
  assert.equal(kindLabel(historical.nodeById.get('d1')), 'Domain');
  assert.equal(kindLabel({ ...historical.nodeById.get('scope-one'), groupRole: 'urbanism_level' }), 'Universe');
  assert.equal(isCapabilityContainer(modern, modern.nodeById.get('scope-one')), false);
  assert.equal(isCapabilityContainer(modern, modern.nodeById.get('d1')), true);
  assert.equal(isCapabilityContainer(historical, historical.nodeById.get('d1')), true);
  assert.equal(hasCapabilityCards(modern, 'scope-one'), true);
  assert.equal(hasCapabilityCards(modern), false);
  assert.deepEqual(
    childrenOf(modern, 'business-references').map((node) => node.kind),
    ['reference'],
  );
  assert.equal(modern.nodeById.get('business-references').kind, 'group');
});

test('opposite directions, parallel semantic families and business cycles stay distinct', () => {
  const graph = project(fixture());
  const forward = graph.edges.find(
    (edge) => edge.source === 'd-old.capability' && edge.target === 'b' && edge.family === 'needs',
  );
  const reverse = graph.edges.find((edge) => edge.source === 'b' && edge.target === 'd-old.capability');
  assert.deepEqual(forward.relationIds, ['a-b', 'behavior-b']);
  assert.deepEqual(reverse.relationIds, ['b-a', 'b-behavior']);
  assert.equal(graph.edges.find((edge) => edge.relationIds.includes('other-a-b')).family, 'other');
  assert.equal(new Set(graph.edges.map((edge) => edge.id)).size, graph.edges.length);
});

test('only an explicit role defines needs; text and historical types are not reclassified', () => {
  const model = fixture();
  const needs = project(model, { family: 'needs' });
  assert.ok(!relationIds(needs).includes('other-a-b'));
  assert.ok(!relationIds(needs).includes('historical-domain-link'));
  const other = project(model, { family: 'other' });
  assert.equal(other.edges.find((edge) => edge.relationIds.includes('other-a-b')).label, 'Relation métier');
  assert.equal(other.edges.find((edge) => edge.relationIds.includes('document-link')).label, 'Représente');
  assert.equal(
    needs.relations.length + other.relations.length,
    model.relations.filter((relation) => !isStructural(relation)).length,
  );
});

test('explicit needs labels and verbs describe the original direction, with a safe fallback for mixed aggregates', () => {
  for (const fields of [{ label: 'Consomme le scénario retenu' }, { verb: 'Consomme le scénario retenu' }]) {
    const raw = rawFixture();
    for (const id of ['a-b', 'behavior-b']) raw.relations.find((relation) => relation.id === id).fields = fields;
    const model = adaptPublication(raw);
    const edge = project(model).edges.find((item) => item.relationIds.includes('a-b'));
    assert.equal(edge.label, 'Consomme le scénario retenu');
    assert.equal(edge.family, 'needs');
    assert.equal(edge.source, 'd-old.capability');
    assert.equal(edge.target, 'b');
    assert.deepEqual(edge.relationIds, ['a-b', 'behavior-b']);
    assert.equal(project(model).edges.find((item) => item.relationIds.includes('b-a')).label, 'A besoin de');
  }
  for (const secondFields of [undefined, { label: 'Consomme un autre résultat' }]) {
    const raw = rawFixture();
    raw.relations.find((relation) => relation.id === 'a-b').fields = { label: 'Consomme le scénario retenu' };
    if (secondFields) raw.relations.find((relation) => relation.id === 'behavior-b').fields = secondFields;
    const model = adaptPublication(raw);
    const edge = project(model).edges.find((item) => item.relationIds.includes('a-b'));
    assert.equal(edge.label, 'A besoin de');
    assert.deepEqual(edge.relationIds, ['a-b', 'behavior-b']);
    assert.equal(model.relationById.get('a-b').label, 'Consomme le scénario retenu');
  }
});

test('moved capability and reference use explicit parents, with no ID-prefix grouping', () => {
  const graph = project(fixture(), { level: 'domain' });
  assert.ok(graph.nodes.find((node) => node.id === 'd2').memberIds.includes('d-old.capability'));
  assert.equal(graph.nodes.find((node) => node.id === 'reference').item.kind, 'reference');
  assert.ok(!nodeIds(graph).includes('business-references'));
  assert.ok(graph.edges.some((edge) => edge.source === 'd2' && edge.target === 'd1'));
  assert.ok(graph.edges.some((edge) => edge.source === 'd1' && edge.target === 'd2'));
});

test('behavior projection keeps original endpoint, scope, sources and object identity', () => {
  const model = fixture();
  const graph = project(model);
  const original = model.relationById.get('behavior-b');
  assert.equal(
    graph.relations.find((relation) => relation.id === 'behavior-b'),
    original,
  );
  assert.equal(original.sourceId, 'behavior');
  assert.deepEqual(original.lifecycle.validated_fields, ['source_id', 'target_id']);
  assert.deepEqual(original.sourceRefs, ['U-test']);
  assert.ok(!nodeIds(graph).includes('behavior'));
  assert.ok(graph.nodes.find((node) => node.id === 'd-old.capability').internalRelationIds.includes('a-behavior'));
});

test('three levels preserve every original relation exactly once, including internal relations and other endpoint kinds', () => {
  const model = fixture();
  const originalIds = model.relations
    .filter((relation) => !isStructural(relation))
    .map((relation) => relation.id)
    .sort();
  for (const level of ['capability', 'domain', 'universe']) {
    const graph = project(model, { level });
    assert.deepEqual(accountedIds(graph).sort(), originalIds);
    assert.equal(new Set(accountedIds(graph)).size, originalIds.length);
    assert.equal(
      graph.stats.visibleRelations,
      graph.edges.reduce((sum, edge) => sum + edge.count, 0) + graph.stats.internalRelations,
    );
    for (const kind of ['object', 'document', 'event']) assert.ok(graph.nodes.some((node) => node.item.kind === kind));
    assert.equal(graph.hiddenRelationCount, 0);
  }
});

test('business depth is progressive, direction keeps arrows, and no transitive relation is generated', () => {
  const model = fixture();
  const settings = { focusId: 'd-old.capability', direction: 'outgoing', family: 'needs' };
  const one = project(model, { ...settings, depth: 1 });
  const two = project(model, { ...settings, depth: 2 });
  const three = project(model, { ...settings, depth: 3 });
  assert.ok(!nodeIds(one).includes('c'));
  assert.ok(nodeIds(two).includes('c'));
  assert.ok(!nodeIds(two).includes('d'));
  assert.ok(nodeIds(three).includes('d'));
  assert.ok(!three.edges.some((edge) => edge.source === 'd-old.capability' && edge.target === 'd'));
  assert.ok(!relationIds(one).includes('b-a'), 'The default outgoing view shows traversed links only.');
  const expanded = project(model, { ...settings, depth: 1, includeNeighborLinks: true });
  assert.ok(relationIds(expanded).includes('b-a'), 'The expanded view preserves the opposite original relation.');
  const incoming = project(model, { focusId: 'c', depth: 1, direction: 'incoming', family: 'needs' });
  assert.deepEqual(nodeIds(incoming).sort(), ['b', 'c']);
  assert.equal(incoming.edges[0].source, 'b');
  assert.equal(incoming.edges[0].target, 'c');
});

test('family filters apply before traversal and depth zero deliberately selects the complete publication', () => {
  const model = fixture();
  const filtered = project(model, { focusId: 'd-old.capability', depth: 3, direction: 'outgoing', family: 'other' });
  assert.ok(!nodeIds(filtered).includes('c'));
  assert.ok(!relationIds(filtered).includes('b-c'));
  assert.equal(filtered.hiddenRelationCount, filtered.stats.totalRelations - filtered.stats.visibleRelations);
  assert.deepEqual(project(model, { focusId: 'b', depth: 0 }), project(model));
  assert.ok(nodeIds(project(model)).includes('isolated'));
});

test('domain and presentation-group focus start from their own explicit descendants, including reference capabilities', () => {
  const model = fixture();
  const domain = project(model, { focusId: 'd1', depth: 1, direction: 'outgoing' });
  assert.ok(nodeIds(domain).includes('isolated'));
  assert.ok(
    relationIds(domain).includes('historical-domain-link'),
    'An original direct domain relation must not disappear.',
  );
  const references = project(model, { focusId: 'business-references', depth: 1, direction: 'outgoing' });
  assert.deepEqual(nodeIds(references), ['reference-capability']);
  const behavior = project(model, { focusId: 'behavior', depth: 1, direction: 'outgoing', family: 'needs' });
  assert.deepEqual(
    behavior,
    project(model, { focusId: 'd-old.capability', depth: 1, direction: 'outgoing', family: 'needs' }),
  );
});

test('universe identity follows levelRef, and empty groups remain inspectable', () => {
  const model = fixture();
  const full = project(model, { level: 'universe' });
  assert.ok(nodeIds(full).includes('scope-one'));
  assert.ok(nodeIds(full).includes('scope-empty'));
  assert.equal(full.nodes.find((node) => node.id === 'scope-empty').memberIds.length, 0);
  assert.ok(!nodeIds(full).includes('business-references'));
  const empty = project(model, { focusId: 'd-empty', depth: 1 });
  assert.deepEqual(nodeIds(empty), ['d-empty']);
  assert.equal(empty.relations.length, 0);
});

test('an unknown focus or option fails explicitly, with no fallback to another publication', () => {
  const model = fixture();
  assert.throws(() => project(model, { focusId: 'backlog-only-id' }), /absent/);
  assert.throws(() => project(model, { level: 'application' }), /Niveau/);
  assert.throws(() => project(model, { depth: 4 }), /profondeur/);
  assert.throws(() => project(model, { family: 'inferred' }), /Famille/);
  assert.throws(() => project(model, { direction: 'reversed' }), /Sens/);
});

test('all projections leave frozen publication data and source objects unchanged', () => {
  const model = fixture();
  const before = JSON.stringify(model.raw);
  for (const level of ['capability', 'domain', 'universe']) {
    for (const depth of [0, 1, 2, 3]) project(model, { level, depth, focusId: 'b' });
  }
  assert.equal(JSON.stringify(model.raw), before);
  assert.ok(Object.isFrozen(model.raw));
  assert.ok(Object.isFrozen(model.relationById.get('behavior-b').qualification));
});

test('real historical and current publications retain their own direct links, nodes and original qualifications', async () => {
  for (const version of ['2026-09-13.5', '2026-09-16.2']) {
    const publication = await loadPublication({ version });
    const model = adaptPublication(publication.raw);
    const before = JSON.stringify(model.raw);
    const business = model.relations.filter((relation) => !isStructural(relation));
    for (const level of ['capability', 'domain', 'universe']) {
      const graph = project(model, { level });
      assert.deepEqual(accountedIds(graph).sort(), business.map((relation) => relation.id).sort());
      for (const relation of graph.relations) assert.equal(relation, model.relationById.get(relation.id));
      for (const node of graph.nodes) assert.equal(node.item, model.nodeById.get(node.id));
      assert.equal(graph.stats.totalRelations, business.length);
      assert.ok(
        graph.edges.every((edge) => edge.family !== 'needs'),
        'These historical publications have no explicit needs role.',
      );
    }
    assert.equal(JSON.stringify(model.raw), before);
    assert.equal(model.version, version);
  }
});
