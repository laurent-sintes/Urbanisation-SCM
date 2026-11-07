import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = path.resolve('dist'),
  output = path.resolve('.runtime/qa-scope-svg');
await mkdir(output, { recursive: true });
const index = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8')),
  version = index.current_version,
  model = JSON.parse(await readFile(path.join(dist, `data/${version}/model.json`), 'utf8'));
const browser = await chromium.launch(browserOptions),
  page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, reducedMotion: 'reduce' }),
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  const base = 'https://atlas.test/Urbanisation-SCM/';
  await page.route('https://atlas.test/**', async (route) => {
    const url = new URL(route.request().url()),
      relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html',
      target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep));
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
    }[path.extname(target)];
    await route.fulfill({ body: await readFile(target), contentType: contentType || 'application/octet-stream' });
  });
  await page.goto(`${base}#/map`);
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Schéma de contexte SVG', exact: true }).click();
  const download = await downloadEvent;
  const svgPath = path.join(output, 'cartographie.svg');
  await download.saveAs(svgPath);
  const svg = await readFile(svgPath, 'utf8');
  assert.match(svg, /Master Data \+ Supply Chain Management/);
  const expected = (id) => {
    const seen = new Set(),
      pending = [id];
    while (pending.length) {
      const next = pending.pop();
      if (seen.has(next)) continue;
      seen.add(next);
      pending.push(
        ...model.relations
          .filter((r) => (r.sourceId ?? r.source_id) === next && ['contains', 'presents'].includes(r.type))
          .map((r) => r.targetId ?? r.target_id),
      );
    }
    return model.nodes.filter((n) => seen.has(n.id) && n.kind === 'capability').length;
  };
  const metadata = await page.evaluate((value) => {
    const dom = new DOMParser().parseFromString(value, 'image/svg+xml');
    return JSON.parse(dom.querySelector('metadata').textContent);
  }, svg);
  assert.deepEqual(
    metadata.capabilities,
    ['domain-master-data', 'supply-chain-orchestration'].map((id) => ({ id, count: expected(id) })),
  );
  await page.screenshot({ path: path.join(output, 'atlas-context.png'), fullPage: true });
  await page.unrouteAll();
  await page.setContent(svg);
  const overflow = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).flatMap((a) => {
      const box = a.querySelector('rect');
      if (!box) return [];
      const b = box.getBBox();
      return Array.from(a.querySelectorAll('text'))
        .filter((t) => {
          const r = t.getBBox();
          return r.x < b.x || r.y < b.y || r.x + r.width > b.x + b.width || r.y + r.height > b.y + b.height;
        })
        .map((t) => ({ id: a.dataset.nodeId, text: t.textContent }));
    }),
  );
  assert.deepEqual(overflow, []);
  await page.screenshot({ path: path.join(output, 'cartographie.png'), fullPage: true });
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, 'report.json'),
    JSON.stringify(
      { status: 'passed', version, svgDownload: download.suggestedFilename(), svgTextBounds: 'passed', errors },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
console.log(JSON.stringify({ status: 'passed', output }));
