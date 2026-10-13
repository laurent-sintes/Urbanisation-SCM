/** Read-only search latency sample against the current exported publication. */
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { adaptPublication } from './src/model.ts';
import { searchPublication } from './src/search.ts';

const catalog = JSON.parse(readFileSync(new URL('./public/data/index.json', import.meta.url), 'utf8'));
const version = catalog.current_version;
const raw = JSON.parse(readFileSync(new URL(`./public/data/${version}/model.json`, import.meta.url), 'utf8'));
const model = adaptPublication(raw);
const queries = ['supply', 'commande', 'transport', 'prix', 'CAP-001', 'logistics'];
const measurements = [];
for (const query of queries) {
  const started = performance.now();
  const count = searchPublication(model, query).length;
  measurements.push({ query, count, milliseconds: Math.round((performance.now() - started) * 100) / 100 });
}
const repeat = [];
for (let run = 0; run < 3; run += 1) {
  const started = performance.now();
  for (const query of queries) searchPublication(model, query);
  repeat.push(Math.round((performance.now() - started) * 100) / 100);
}
console.log(JSON.stringify({ version, first_queries: measurements, repeated_batch_ms: repeat }));
