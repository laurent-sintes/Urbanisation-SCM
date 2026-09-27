/** Isolated future-policy fixture; never changes a published snapshot or catalog. */
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium, browserOptions } from './browser-runtime.mjs';
import { adaptPublication, childrenOf } from './src/model.ts';

const app = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(app, 'dist');
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = catalog.current_version;
const source = await readFile(path.join(dist, `data/${version}/model.json`), 'utf8');
const generated = spawnSync(process.env.ATLAS_PYTHON || 'python', ['-c',
  "import sys,json; from scripts.display_codes import build_display_index; m=json.load(sys.stdin); m['display_policy']='typed-tree-v1'; m['display_index']=build_display_index(m); print(json.dumps(m,ensure_ascii=True))"],
  { cwd: path.dirname(app), input: source, encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 20 * 1024 * 1024 });
assert.equal(generated.status, 0, generated.stderr || generated.error?.message);
const raw = JSON.parse(generated.stdout), model = adaptPublication(raw);
assert.deepEqual(raw.nodes, JSON.parse(source).nodes, 'The fixture preserves all French text and persistent IDs');
const area = model.nodes.find(n => n.kind === 'area' && childrenOf(model, n.id).some(c => c.kind === 'capability'));
const capacity = childrenOf(model, area.id).find(n => n.kind === 'capability');
const base = 'http://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === `data/${version}/model.json`) return route.fulfill({ json: raw });
    const target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep));
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' };
    await route.fulfill({ body: await readFile(target), contentType: types[path.extname(target)] || 'application/octet-stream' });
  });
  await page.goto(base + `#version=${version}&node=${area.id}&view=map`);
  await page.locator('.business-card').first().waitFor();
  const expected = childrenOf(model, area.id).map(n => n.displayCode);
  assert.deepEqual(await page.locator('.business-card .card-id').allTextContents(), expected);
  assert.equal(await page.locator(`[data-tree-id="${area.id}"]`).getAttribute('aria-description'), area.displayCode);
  assert.ok((await page.locator(`[data-tree-id="${area.id}"] .tree-label`).first().getAttribute('title')).includes(area.displayCode));
  assert.equal(await page.locator(`[data-tree-id="${area.id}"] > .tree-row .reading-code`).count(), 0);
  const search = page.getByRole('textbox', { name: 'Rechercher dans le modèle publié' });
  for (const query of [capacity.displayCode, capacity.id]) {
    await search.fill(query);
    await page.locator(`[data-search-result="${capacity.id}"]`).click();
    await page.getByRole('heading', {level:1, name:capacity.name, exact:true}).waitFor();
    assert.ok((await page.locator('.eyebrow').innerText()).includes(capacity.displayCode));
    assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('node'), capacity.id);
    assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('version'), version);
  }
  await page.goto(base + `#version=${version}&view=principles&principle=codes`);
  await page.getByRole('heading', { name: 'Identité et codes de lecture', exact:true }).waitFor();
  assert.ok((await page.getByRole('region', {name:'Identité et codes de lecture'}).innerText()).includes('CAP-025'));
  await page.setViewportSize({width:390,height:844});
  await page.goto(base + `#version=${version}&node=${capacity.id}&view=sheet`);
  await page.getByTestId('business-sheet').waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  assert.deepEqual(errors, []);
  const output = path.join(app,'.runtime/qa-display-codes');
  await mkdir(output,{recursive:true});
  await page.screenshot({path:path.join(output,'mobile.png')});
  console.log(JSON.stringify({status:'passed',fixture:true,policy:raw.display_policy,codes:Object.keys(raw.display_index.codes).length,checks:['frozen card order','tree codes','search code and identity','stable versioned links','meta-model rules','mobile']}));
} finally { await browser.close(); }
