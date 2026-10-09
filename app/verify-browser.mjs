/** Current published Atlas journeys, served from compiled static files. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, browserOptions } from './browser-runtime.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, '.runtime/qa-browser');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const model = JSON.parse(await readFile(path.join(dist, `data/${catalog.current_version}/model.json`), 'utf8'));
const byId = new Map(model.nodes.map(node => [node.id, node]));
const children = id => model.relations.filter(r => ['contains', 'presents'].includes(r.type) && r.source_id === id).map(r => r.target_id);
const parent = id => byId.get(model.relations.find(r => ['contains', 'presents'].includes(r.type) && r.target_id === id)?.source_id);
const universe = model.nodes.find(node => node.kind === 'universe');
const businessArea = model.nodes.find(node => node.kind === 'business_area' && children(node.id).some(id => byId.get(id)?.kind === 'capability'));
const domain = businessArea && parent(parent(businessArea.id)?.id);
const system = domain && parent(domain.id);
assert.ok(universe && businessArea && domain?.kind === 'domain' && system?.kind === 'business_system', 'A published Universe and detailed domain are required');
const areas = children(domain.id).filter(id => byId.get(id)?.kind === 'area');
const capability = byId.get(children(businessArea.id).find(id => byId.get(id)?.kind === 'capability'));
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [], requests = [], checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    assert.ok(url.href.startsWith(base), 'No external dependency or API required');
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    const target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep), 'Static request stays inside dist');
    const contentType = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }[path.extname(target)];
    await route.fulfill({ body: await readFile(target), contentType: contentType || 'application/octet-stream' });
  });
  const visit = async params => {
    await page.goto(base + '#' + new URLSearchParams({ version: model.version, ...params }));
    await page.locator(`#fa-version[data-version="${model.version}"]`).waitFor({ state: 'attached' });
  };
  const route = () => new URLSearchParams(new URL(page.url()).hash.slice(1));

  await visit({ view: 'map' });
  await page.getByRole('heading', { level: 1, name: universe.fields.name }).waitFor();
  assert.deepEqual((await page.locator('.overview-system').evaluateAll(items => items.map(item => item.dataset.nodeId))).sort(), children(universe.id).sort());
  assert.ok((await page.locator('.sidebar-stats').textContent()).includes(`${model.nodes.length} éléments`));
  await page.locator(`.overview-system[data-node-id="${system.id}"] h3 button`).click();
  await page.locator(`.business-card[data-node-id="${domain.id}"]`).waitFor();
  assert.equal(route().get('scope'), system.id);
  checks.push('Published root, systems, hierarchy and statistics');

  await page.locator(`.business-card[data-node-id="${domain.id}"] h3 button`).click();
  await page.locator(`.business-card[data-node-id="${areas[0]}"]`).waitFor();
  assert.equal(route().get('scope'), domain.id);
  if (areas.includes('subdomain-integration')) {
    const preview = await page.locator('.business-card[data-node-id="subdomain-integration"] > p').innerText();
    assert.match(preview, /Supply Chain Orchestration/);
    assert.doesNotMatch(preview, /glossary:|TER084|\]\(/);
  }
  await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '2' });
  await page.locator('.graph-canvas.zoom-width .business-card').first().waitFor();
  await page.waitForFunction(() => Number(document.querySelector('.react-flow__viewport')?.getAttribute('style')?.match(/scale\(([^)]+)\)/)?.[1] || 0) >= 0.8);
  const detail = page.locator('.map-header-controls .detail-trigger');
  await detail.click();
  await page.getByRole('group', { name: 'Niveau de détail de la carte' }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('type')), 'range');
  await page.keyboard.press('Escape');
  assert.equal(await detail.evaluate(el => document.activeElement === el), true);
  await detail.click();
  await page.getByRole('group', { name: 'Niveau de détail de la carte' }).getByRole('button', { name: 'Capacités' }).click();
  await page.locator(`[data-business-area-summary="${businessArea.id}"]`).waitFor();
  assert.equal(route().get('mapDepth'), '3');
  checks.push('Domain hierarchy, detail picker and keyboard focus');

  const capabilityLink = page.locator(`[data-map-item-id="${capability.id}"]`).first();
  await capabilityLink.click();
  assert.equal(route().get('node'), capability.id);
  assert.equal(await capabilityLink.getAttribute('aria-current'), 'true');
  assert.equal(await page.getByRole('tab', { name: 'Carte' }).getAttribute('aria-selected'), 'true');
  await visit({ view: 'map', node: businessArea.id, scope: domain.id, mapDepth: '3', mapFocus: businessArea.id });
  const areaLink = page.locator(`[data-business-area-summary="${businessArea.id}"] button`).first();
  await areaLink.waitFor();
  assert.equal(await areaLink.getAttribute('aria-current'), 'true');
  checks.push('Capability selection remains visible on the map; Business Area focus is addressable');

  await page.getByRole('button', { name: 'Étendre la carte' }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await page.getByRole('button', { name: 'Pleine page' }).click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.graph-canvas');
    const cards = [...document.querySelectorAll('.graph-canvas .business-card')];
    if (!canvas || !cards.length) return false;
    const frame = canvas.getBoundingClientRect();
    return cards.every(card => {
      const box = card.getBoundingClientRect();
      return box.left >= frame.left - 2 && box.right <= frame.right + 2 && box.top >= frame.top - 2 && box.bottom <= frame.bottom + 2;
    });
  });
  await page.getByRole('button', { name: 'Réduire la carte' }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  checks.push('Full screen controls and complete page framing');

  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('heading', { level: 1, name: capability.fields.name }).waitFor();
  await page.getByRole('tab', { name: 'Carte' }).click();
  await page.locator(`[data-map-item-id="${capability.id}"][aria-current="true"]`).first().waitFor();
  checks.push('Sheet and return to selected map object');

  await page.setViewportSize({ width: 390, height: 844 });
  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('button', { name: 'Ouvrir le panneau' }).click();
  await page.getByRole('dialog', { name: 'Navigation Atlas' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Navigation Atlas' }).waitFor({ state: 'hidden' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  checks.push('Mobile navigation, Escape and no page overflow');
  assert.deepEqual(errors, []);
  assert.ok(!requests.some(request => request.includes('/api/') || request.includes('backlog')));
  await writeFile(path.join(output, 'report.json'), JSON.stringify({ version: model.version, checks, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', version: model.version, checks }));
} finally {
  await browser.close();
}
