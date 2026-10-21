import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import { setTimeout } from 'node:timers/promises';

test('recipe JSON reaches a slow pipe reader completely before process exit', { timeout: 15000 }, async () => {
  const moduleUrl = new URL('./recipe-output.mjs', import.meta.url).href;
  const child = spawn(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
    import { writeRecipeJson } from ${JSON.stringify(moduleUrl)};
    await writeRecipeJson({ cases: Array.from({ length: 20000 }, (_, index) => ({ index, title: 'Pleine largeur — géométrie complète' })) });
    process.exit(0);
  `,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const closed = once(child, 'close');
  let errors = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    errors += chunk;
  });
  const chunks = [];
  try {
    for await (const chunk of child.stdout) {
      chunks.push(chunk);
      await setTimeout(2);
    }
    const [code] = await closed;
    assert.equal(code, 0, errors);
    const output = Buffer.concat(chunks).toString('utf8');
    assert.ok(Buffer.byteLength(output) > 1_000_000, 'The manifest exceeds the pipe buffer');
    const { cases } = JSON.parse(output);
    assert.equal(cases.length, 20000);
    assert.ok(
      cases.every((item, index) => item.index === index && item.title === 'Pleine largeur — géométrie complète'),
    );
  } finally {
    if (child.exitCode === null) child.kill();
  }
});
