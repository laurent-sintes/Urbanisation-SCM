import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { build } from 'vite';

// Exercise the real dependency graph after bundling, not just direct imports.
// Budgets leave room for computation changes but reject the full UI dictionary.
for (const [worker, budget] of [
  ['searchWorker', 35000],
  ['flowMapWorker', 60000],
]) {
  test(`${worker} keeps only computation resources and stays within its size budget`, async () => {
    const result = await build({
      root: import.meta.dirname,
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        minify: true,
        lib: { entry: path.join(import.meta.dirname, `src/${worker}.ts`), name: 'AtlasWorker', formats: ['iife'] },
      },
    });
    const chunks = (Array.isArray(result) ? result : [result])
      .flatMap((output) => output.output)
      .filter((chunk) => chunk.type === 'chunk');
    const modules = chunks.flatMap((chunk) => Object.keys(chunk.modules)).map((id) => id.replaceAll('\\', '/'));
    assert.ok(modules.some((id) => id.endsWith('/locales/fr/core.json')));
    assert.deepEqual(
      modules.filter((id) => /\/locales\/fr\/(ui|server|export|bootstrap)\.json$/.test(id)),
      [],
    );
    const bytes = chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk.code), 0);
    assert.ok(bytes < budget, `${worker}: ${bytes} bytes exceeds ${budget}`);
  });
}
