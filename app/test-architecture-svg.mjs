import assert from 'node:assert/strict';
import { test } from 'node:test';
import { architectureSvg } from './src/architectureSvg.ts';

const labels = {
  title: 'Titre & carte',
  focus: 'Périmètre',
  domains: 'domaines',
  capabilities: 'capacités',
  capability: 'capacité',
  subdomains: 'sous-domaines',
  published: 'Versions publiées',
  receipt: 'Retours de réception',
  provenance: 'Version',
};
const nodes = [
  { id: 'u', kind: 'universe', name: 'FLOW' },
  { id: 'system-business-operations', kind: 'business_system', name: 'Business Operations' },
  { id: 'supply-chain-orchestration', kind: 'domain', name: 'Supply Chain Management' },
  { id: 'domain-master-data', kind: 'domain', name: 'Master Data' },
  { id: 'business-references', kind: 'area', name: 'Operational References' },
  { id: 'mdm-area', kind: 'area', name: '<script> & " Références' },
  { id: 'mdm-cap', kind: 'capability', name: 'Capacité' },
  { id: 'master-data-ingestion', kind: 'capability', name: 'Reference Ingestion' },
];
const relations = [
  ['system-business-operations', 'supply-chain-orchestration'],
  ['system-business-operations', 'domain-master-data'],
  ['domain-master-data', 'mdm-area'],
  ['supply-chain-orchestration', 'business-references'],
  ['mdm-area', 'mdm-cap'],
  ['business-references', 'master-data-ingestion'],
].map(([sourceId, targetId]) => ({ sourceId, targetId, type: 'contains' }));
test('SVG follows native parents, counts capabilities and escapes every business label', () => {
  const input = { version: '2026-11-05', nodes, relations };
  const before = JSON.stringify(input);
  const svg = architectureSvg(input, labels, 'https://atlas.test/');
  assert.equal(JSON.stringify(input), before);
  assert.ok(
    svg.indexOf('data-domain-id="domain-master-data"') < svg.indexOf('data-domain-id="supply-chain-orchestration"'),
  );
  assert.ok(svg.includes('&lt;script&gt; &amp; &quot;'));
  assert.ok(!svg.includes('<script>'));
  assert.match(svg, /scope=business-references/);
  assert.match(svg, /&quot;id&quot;:&quot;domain-master-data&quot;,&quot;count&quot;:1/);
  assert.match(svg, /C640/);
  assert.ok(svg.includes('1 capacité</tspan>'));
});
test('a historical map does not invent a Master Data domain or exchange', () => {
  const filtered = nodes.filter((n) => !['domain-master-data', 'mdm-area', 'mdm-cap'].includes(n.id));
  const ids = new Set(filtered.map((n) => n.id));
  const svg = architectureSvg(
    {
      version: 'historic',
      nodes: filtered,
      relations: relations.filter((r) => ids.has(r.sourceId) && ids.has(r.targetId)),
    },
    labels,
    'https://atlas.test/',
  );
  assert.ok(!svg.includes('data-domain-id="domain-master-data"'));
  assert.ok(!svg.includes('Versions publiées'));
});
