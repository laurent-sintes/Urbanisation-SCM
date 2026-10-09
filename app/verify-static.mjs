/** Exercise the built SPA under a Pages project prefix, with only static files. */
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, browserOptions } from './browser-runtime.mjs';
const directory = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(directory, 'dist');
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = catalog.current_version;
const historical = catalog.versions.find(item => item.version !== version).version;
const prefix = '/Urbanisation/';
const base = 'https://atlas.test' + prefix;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' };
const browser = await chromium.launch(browserOptions);
const errors = [], requests = [], unexpected = [];
let releaseModel;
const gate = new Promise(resolve => { releaseModel = resolve; });
let failModel = true;
let failGuideModule = false;
let newerBuild = false;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    if (url.origin !== 'https://atlas.test' || !url.pathname.startsWith(prefix) || url.pathname.includes('/api/')) {
      unexpected.push(url.pathname); return route.abort();
    }
    const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
    const target = path.resolve(dist, relative);
    if (!target.startsWith(dist + path.sep)) return route.abort();
    if(relative === 'delivery.json' && newerBuild) return route.fulfill({json:{schema_version:1,files:{'index.html':'new-build'}}});
    if (failGuideModule && /ModelingGuidePage-.*\.js$/.test(relative)) return route.fulfill({status:503,body:'Stale lazy module'});
    if (relative === `data/${version}/model.json`) {
      await gate;
      if (failModel) return route.fulfill({ status: 503, contentType: 'text/html', body: '<h1>Temporarily unavailable</h1>' });
    }
    try { await route.fulfill({ body: await readFile(target), contentType: types[path.extname(target)] || 'application/octet-stream' }); }
    catch { unexpected.push(relative); await route.fulfill({ status: 404, body: 'Missing static file' }); }
  });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Ouverture du modèle…' }).waitFor();
  assert.equal(requests.some(url => url.includes(historical)), false, 'History is not preloaded');
  releaseModel();
  await page.getByRole('heading', { name: 'Publication indisponible' }).waitFor();
  assert.match(await page.getByRole('alert').innerText(), /HTTP 503/);
  failModel = false;
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  await page.getByText('Business Operations', { exact: true }).first().waitFor();
  assert.equal(new URL(page.url()).pathname, prefix);
  await page.goto(base + '#version=' + historical + '&view=glossary');
  await page.locator(`#fa-version[data-version="${historical}"]`).waitFor({ state: 'attached' });
  await page.getByRole('button', { name: 'FLOW Atlas, accueil', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, prefix);
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('version'), historical);
  // Trigger a catalog check while a historical selection is fixed.
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  assert.equal(await page.locator('#fa-version').getAttribute('data-version'), historical);
  failGuideModule = true;
  await page.goto(base + '#view=principles');
  await page.getByRole('heading', {name:'La lecture d’Atlas a été interrompue',exact:true}).waitFor();
  failGuideModule = false;
  await page.getByRole('button', {name:'Recharger Atlas',exact:true}).click();
  await page.locator('.method-chapters').waitFor();
  await page.goto(base);
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  await page.getByRole('button', { name: 'FLOW Atlas, accueil', exact: true }).click();
  await page.getByRole('heading', { name: 'Univers', exact: true }).waitFor();
  newerBuild = true;
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await page.getByText('Une nouvelle version de l’interface Atlas est disponible.',{exact:true}).waitFor();
  const currentAddress=page.url();
  newerBuild = false;
  await page.getByRole('button',{name:'Recharger l’application',exact:true}).click();
  await page.getByRole('heading',{name:'Univers',exact:true}).waitFor();
  assert.equal(page.url(),currentAddress,'Updating software must preserve the reading URL');
  await mkdir(path.join(directory, '.runtime/qa-static'), { recursive: true });
  await page.screenshot({ path: path.join(directory, '.runtime/qa-static/overview.png') });
  assert.deepEqual(unexpected, []);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'passed', version, historical, checks: ['project prefix', 'visible loading', 'HTML error', 'retry', 'current model', 'fixed history', 'home links', 'guide', 'no API'], requests: requests.length }));
} finally {
  releaseModel();
  await browser.close();
}
