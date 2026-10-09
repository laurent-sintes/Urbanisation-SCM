/** Check map panel boundaries against every exported publication, including legacy shapes. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapDepthLimit, structuralMap } from './src/mapProjection.ts';
import { adaptPublication } from './src/model.ts';

const data = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist', 'data');
const catalog = JSON.parse(await readFile(path.join(data, 'index.json'), 'utf8'));
let scopes = 0,
  projections = 0,
  legacyFallbacks = 0;
for (const entry of catalog.versions) {
  const model = adaptPublication(JSON.parse(await readFile(path.join(data, entry.version, 'model.json'), 'utf8')));
  for (const scope of model.nodes.filter((node) => node.kind === 'business_system' || node.kind === 'domain')) {
    scopes++;
    for (let detail = 0; detail <= mapDepthLimit(model, scope.id); detail++) {
      const map = structuralMap(model, scope.id, detail);
      if (!map) {
        legacyFallbacks++;
        continue;
      }
      projections++;
      assert.equal(
        new Set(map.nodes.map((node) => node.id)).size,
        map.nodes.length,
        `${entry.version}: duplicate panel in ${scope.id}`,
      );
      assert.equal(map.nodes[0]?.id, scope.id, `${entry.version}: missing map scope ${scope.id}`);
      const expected = scope.kind === 'business_system' ? 'domain' : 'area';
      if (scope.kind === 'business_system' || detail > 0) {
        assert.ok(
          map.nodes.slice(1).every((node) => node.kind === expected),
          `${entry.version}: descendants became sibling panels in ${scope.id}`,
        );
      }
    }
  }
}
assert.ok(scopes > 0 && projections > 0);
console.log(
  JSON.stringify({ status: 'passed', versions: catalog.versions.length, scopes, projections, legacyFallbacks }),
);
