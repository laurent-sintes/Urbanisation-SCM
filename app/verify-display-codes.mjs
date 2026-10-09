/** Isolated future-policy fixture; never changes a published snapshot or catalog. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { adaptPublication, childrenOf } from './src/model.ts';

const app = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(app, 'dist');
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = catalog.current_version;
const source = await readFile(path.join(dist, `data/${version}/model.json`), 'utf8');
const generated = spawnSync(
  process.env.ATLAS_PYTHON || 'python',
  [
    '-c',
    "import sys,json; from scripts.display_codes import build_display_index; m=json.load(sys.stdin); m['display_policy']='typed-tree-v1'; m['display_index']=build_display_index(m); print(json.dumps(m,ensure_ascii=True))",
  ],
  {
    cwd: path.dirname(app),
    input: source,
    encoding: 'utf8',
    env: { ...process.env, PYTHONUTF8: '1' },
    maxBuffer: 20 * 1024 * 1024,
  },
);
assert.equal(generated.status, 0, generated.stderr || generated.error?.message);
const raw = JSON.parse(generated.stdout),
  model = adaptPublication(raw);
// The isolated candidate has its own payload fingerprint, not the source file's.
catalog.versions.find((item) => item.version === version).model_sha256 = createHash('sha256')
  .update(JSON.stringify(raw))
  .digest('hex');
assert.deepEqual(raw.nodes, JSON.parse(source).nodes, 'The fixture preserves all French text and persistent IDs');
// Exercise a real capability container: current Business Area or historical Subdomain.
const area = model.nodes.find(
  (n) =>
    ['business_area', 'area'].includes(n.kind) &&
    childrenOf(model, n.id).some((c) => c.kind === 'capability') &&
    !childrenOf(model, n.id).some((c) => c.kind === 'business_area'),
);
assert.ok(area, 'The publication must provide a container with capabilities to verify reading codes');
const capacity = childrenOf(model, area.id).find((n) => n.kind === 'capability');
const parentOf = (id) => model.nodes.find((node) => childrenOf(model, node.id).some((child) => child.id === id));
const subdomain = parentOf(area.id);
const domain = subdomain && parentOf(subdomain.id);
assert.equal(domain?.kind, 'domain');
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === 'data/index.json') return route.fulfill({ json: catalog });
    if (relative === `data/${version}/model.json`) return route.fulfill({ json: raw });
    const target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep));
    const types = {
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.html': 'text/html',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    await route.fulfill({
      body: await readFile(target),
      contentType: types[path.extname(target)] || 'application/octet-stream',
    });
  });
  await page.goto(`${base}#/map?version=${version}&scope=${domain.id}&node=${area.id}&mapDepth=3&mapFocus=${area.id}`);
  await page.locator(`[data-business-area-summary="${area.id}"]`).waitFor();
  await page.locator(`[data-map-item-id="${capacity.id}"]`).first().waitFor();
  assert.equal(
    await page.locator('.business-card .card-id, .business-card .reading-code, .category-banner .reading-code').count(),
    0,
  );
  const overviewOutput = path.join(app, '.runtime/qa-display-codes');
  await mkdir(overviewOutput, { recursive: true });
  await page.screenshot({ path: path.join(overviewOutput, 'overview.png') });
  const panelToggle = page.locator('#fa-tree-open');
  if ((await panelToggle.getAttribute('aria-expanded')) === 'false') await panelToggle.click();
  const search = page.getByRole('textbox', { name: 'Rechercher dans le modèle publié' });
  for (const query of [capacity.displayCode, capacity.id]) {
    await search.fill(query);
    await page.locator(`[data-search-result="${capacity.id}"]`).waitFor();
    await search.fill('');
    await page.goto(`${base}#/sheet?version=${version}&node=${capacity.id}`);
    await page.getByTestId('business-sheet').waitFor();
    assert.ok((await page.locator('.eyebrow').innerText()).includes(capacity.displayCode));
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('node'), capacity.id);
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('version'), version);
  }
  await page.goto(`${base}#/principles?version=${version}&principle=codes`);
  await page.getByRole('heading', { name: 'Identité et codes de lecture', exact: true }).waitFor();
  assert.ok((await page.getByRole('region', { name: 'Identité et codes de lecture' }).innerText()).includes('CAP-025'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}#/sheet?version=${version}&node=${capacity.id}`);
  await page.getByTestId('business-sheet').waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  assert.deepEqual(errors, []);
  const output = path.join(app, '.runtime/qa-display-codes');
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, 'mobile.png') });
  console.log(
    JSON.stringify({
      status: 'passed',
      fixture: true,
      policy: raw.display_policy,
      codes: Object.keys(raw.display_index.codes).length,
      checks: [
        'hierarchical map without reading codes',
        'search code and identity',
        'stable versioned links',
        'meta-model rules',
        'mobile',
      ],
    }),
  );
} finally {
  await browser.close();
}
