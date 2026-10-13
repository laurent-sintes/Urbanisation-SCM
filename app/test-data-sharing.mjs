import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPublication } from '../scripts/load-publication.mjs';
import { hotspotDataSharing, systemDataSharing } from './src/dataSharing.ts';
import { adaptPublication, childrenOf } from './src/model.ts';

const original = (await loadPublication({ version: '2026-10-12.6' })).raw;
const relation = (id, source, target, label = 'Définitions produit') => ({
  id,
  type: 'shares-data',
  source_id: source,
  target_id: target,
  fields: {
    label,
    data_exchange: {
      purpose: 'Partager les définitions.',
      contents: [{ name: 'Product definitions', description: 'Définitions approuvées.', glossary_refs: ['TER052'] }],
    },
  },
  qualification: { meaning: 'Fournir les définitions.', conditions: [], effects: [] },
});

test('historical publications never infer exchange arrows', () => {
  assert.deepEqual(systemDataSharing(adaptPublication(original)), []);
});

test('explicit arrows preserve direction, content, provenance and arbitrary endpoint levels', () => {
  const raw = structuredClone(original);
  raw.relations.push(relation('TEST-PRODUCT', 'domain-product-definition-lifecycle', 'master-data-ingestion'));
  raw.relations.push(relation('TEST-CREDIT', 'subdomain-credit-collections', 'domain-sales', 'Profil de crédit'));
  raw.relations.push(relation('TEST-INTERNAL', 'domain-sourcing-procurement', 'domain-sales'));
  const model = adaptPublication(raw);
  const arrows = systemDataSharing(model);
  assert.deepEqual(
    arrows.map((arrow) => [arrow.sourceId, arrow.targetId]),
    [
      ['system-design-development', 'system-business-operations'],
      ['system-enterprise-management-control', 'system-business-operations'],
    ],
  );
  assert.equal(arrows[0].relations[0].id, 'TEST-PRODUCT');
  assert.equal(arrows[0].relations[0].sourceId, 'domain-product-definition-lifecycle');
  assert.equal(arrows[0].relations[0].dataExchange.contents[0].name, 'Product definitions');
  assert.ok(
    !childrenOf(model, 'domain-product-definition-lifecycle').some((node) => node.id === 'master-data-ingestion'),
  );
  assert.ok(Object.isFrozen(arrows[0].relations[0].dataExchange));
  assert.equal(
    original.relations.some((r) => r.id === 'TEST-PRODUCT'),
    false,
  );
});

test('several detailed exchanges aggregate without losing relation identities and reverse direction stays separate', () => {
  const raw = structuredClone(original);
  raw.relations.push(relation('TEST-A', 'system-business-operations', 'domain-logistics-execution', 'Demandes'));
  raw.relations.push(relation('TEST-B', 'supply-chain-orchestration', 'domain-warehousing', 'Adaptations'));
  raw.relations.push(relation('TEST-C', 'domain-logistics-execution', 'system-business-operations', 'Résultats'));
  const arrows = systemDataSharing(adaptPublication(raw));
  assert.equal(arrows.length, 2);
  assert.deepEqual(
    arrows[0].relations.map((r) => r.id),
    ['TEST-A', 'TEST-B'],
  );
  assert.equal(arrows[0].label, 'Demandes · Adaptations');
  assert.equal(arrows[1].sourceId, 'domain-logistics-execution');
});

test('integration hotspots project onto the unique published exchange joining their two anchors', () => {
  const raw = structuredClone(original);
  raw.relations.push(
    relation('TEST-ACCOUNTING', 'accounting-data-provision', 'subdomain-financial-accounting', 'Faits de gestion'),
  );
  raw.relations.push(
    relation('TEST-OTHER', 'domain-sales', 'subdomain-financial-accounting', 'Conditions commerciales'),
  );
  const exchanges = systemDataSharing(adaptPublication(raw));
  const hotspot = {
    kind: 'integration',
    location: { node_ids: ['accounting-data-provision', 'subdomain-financial-accounting'] },
  };
  assert.equal(hotspotDataSharing(hotspot, exchanges)?.relations[0].id, 'TEST-ACCOUNTING');
  assert.equal(hotspotDataSharing({ ...hotspot, kind: 'scope' }, exchanges), undefined);
  assert.equal(
    hotspotDataSharing({ ...hotspot, location: { node_ids: ['accounting-data-provision'] } }, exchanges),
    undefined,
  );
  raw.relations.push(
    relation('TEST-REVERSE', 'subdomain-financial-accounting', 'accounting-data-provision', 'Retours'),
  );
  assert.equal(hotspotDataSharing(hotspot, systemDataSharing(adaptPublication(raw))), undefined);
});

test('malformed contents, missing glossary references and self exchanges are rejected', () => {
  for (const mutate of [
    (r) => {
      delete r.fields.data_exchange;
    },
    (r) => {
      r.fields.data_exchange.contents = [];
    },
    (r) => {
      r.fields.data_exchange.contents[0].glossary_refs = ['unknown'];
    },
    (r) => {
      r.target_id = r.source_id;
    },
    (r) => {
      r.fields.label = ' ';
    },
    (r) => {
      r.fields.summary_label = ' ';
    },
  ]) {
    const raw = structuredClone(original);
    const r = relation('TEST-INVALID', 'system-design-development', 'system-business-operations');
    mutate(r);
    raw.relations.push(r);
    assert.throws(() => adaptPublication(raw), /Contenu de partage de données invalide/);
  }
});

test('modeled summary stays short when detailed exchanges grow and retains tooltip content', () => {
  const raw = structuredClone(original);
  const anchor = relation(
    'SUMMARY',
    'system-business-operations',
    'system-enterprise-management-control',
    'Faits de gestion',
  );
  anchor.fields.summary_label = 'Faits et conditions de gestion';
  raw.relations.push(anchor);
  raw.relations.push(
    relation('DETAIL', 'domain-sales', 'subdomain-financial-accounting', 'Commercial benefit conditions'),
  );
  const arrow = systemDataSharing(adaptPublication(raw))[0];
  assert.equal(arrow.label, 'Faits et conditions de gestion');
  assert.equal(arrow.detailLabel, 'Faits de gestion · Commercial benefit conditions');
  assert.deepEqual(
    arrow.relations.map((r) => r.id),
    ['SUMMARY', 'DETAIL'],
  );
  const duplicate = structuredClone(anchor);
  duplicate.id = 'CONFLICT';
  duplicate.fields.summary_label = 'Other summary';
  raw.relations.push(duplicate);
  assert.throws(() => systemDataSharing(adaptPublication(raw)), /contradictoires/);
});
