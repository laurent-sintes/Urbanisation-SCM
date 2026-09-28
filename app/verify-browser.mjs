/** Current UI contracts, served from compiled files without a Python API. */
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
const capability = model.nodes.find(n => n.kind === 'capability' && children(n.id).some(id => byId.get(id)?.kind === 'behavior'));
const behavior = byId.get(children(capability.id).find(id => byId.get(id)?.kind === 'behavior'));
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [], requests = [], checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    assert.ok(url.href.startsWith(base), 'No external dependency or API required');
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    const target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep));
    const contentType = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }[path.extname(target)];
    await route.fulfill({ body: await readFile(target), contentType: contentType || 'application/octet-stream' });
  });
  const visit = async params => {
    await page.goto(base + '#' + new URLSearchParams({ version: model.version, ...params }));
    await page.locator(`#fa-version[data-version="${model.version}"]`).waitFor({ state: 'attached' });
    await page.locator('#page-title').waitFor();
  };
  const heading = name => page.getByRole('heading', { level: 1, name, exact: true }).waitFor();
  await visit({ view: 'map' });
  await heading('Cartographie');
  assert.equal(await page.getByRole('navigation', { name: 'Fil d’Ariane' }).getByRole('button', { name: 'Cartographie', exact: true }).count(), 0);
  const roots = model.nodes.filter(n => !model.relations.some(r => ['contains', 'presents'].includes(r.type) && r.target_id === n.id)).map(n => n.id);
  const rootCards = page.locator(model.nodes.some(n => n.kind === 'business_system') ? '.overview-system' : '.business-card');
  await rootCards.first().waitFor();
  assert.deepEqual((await rootCards.evaluateAll(items => items.map(el => el.dataset.nodeId))).sort(), roots.sort());
  assert.ok((await page.locator('.sidebar-stats').innerText()).includes(`${model.nodes.length} éléments`));
  assert.ok((await page.locator('.sidebar-stats').innerText()).includes(`${model.nodes.filter(n => n.kind === 'capability').length} capacités`));
  checks.push('Published systems and statistics');

  for (const node of model.nodes.filter(n => ['business_system', 'domain', 'area', 'reference'].includes(n.kind) && children(n.id).length)) {
    await visit({ node: node.id, view: 'map' });
    await heading(node.fields.name);
    await page.locator('.business-card').first().waitFor();
    const cards = await page.locator('.business-card').evaluateAll(items => items.map(el => el.dataset.nodeId));
    assert.deepEqual(cards.sort(), children(node.id).sort(), `Explicit children of ${node.id}`);
  }
  checks.push('All published system/domain/subdomain/reference maps');
  await visit({ node: capability.id, view: 'sheet' });
  await heading(capability.fields.name);
  await page.getByTestId('business-sheet').waitFor();
  assert.equal(await page.locator('.behavior-section a').count(), children(capability.id).filter(id => byId.get(id)?.kind === 'behavior').length);
  await page.locator(`[data-behavior-id="${behavior.id}"] p`).waitFor();
  await page.locator(`.behavior-section a[href*="node=${encodeURIComponent(behavior.id)}"]`).click();
  await heading(behavior.fields.name);
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('version'), model.version);
  await page.goBack();
  await heading(capability.fields.name);
  const search = page.getByRole('textbox', { name: 'Rechercher dans le modèle publié' });
  await search.fill(capability.fields.name);
  await page.locator(`[data-search-result="${capability.id}"]`).click();
  await heading(capability.fields.name);
  checks.push('Capability, behaviors, fixed deep links, back and search');
  await page.getByRole('navigation', { name: 'Fil d’Ariane' }).getByRole('button', { name: 'Cartographie', exact: true }).click();
  await heading('Cartographie');

  await visit({ view: 'map' });
  const tree = page.getByRole('tree', { name: 'Arbre de la cartographie' });
  const first = tree.getByRole('treeitem').first();
  await first.focus();
  await first.press('ArrowDown');
  assert.notEqual(await page.evaluate(() => document.activeElement?.getAttribute('data-tree-id')), await first.getAttribute('data-tree-id'));
  checks.push('Keyboard tree navigation');
  await visit({ view: 'glossary' });
  const guide = JSON.parse(await readFile(path.join(dist, `data/${catalog.current_version}/guide.json`), 'utf8'));
  const methodIds = new Set(guide.guide?.glossary?.model_term_ids || []);
  const term = model.glossary.terms.find(item => !methodIds.has(item.id));
  await page.getByRole('textbox', { name: 'Rechercher dans le glossaire' }).fill(term.name);
  await page.locator(`.glossary-index a[href*="term=${term.id}"]`).click();
  await page.locator('.glossary-term').waitFor();
  assert.ok((await page.locator('.glossary-term').innerText()).includes(term.name));
  checks.push('Published glossary search and definition');

  const market = model.nodes.find(n => n.kind === 'capability' && (n.fields.market_inspiration || n.fields.market_comparisons?.length));
  assert.ok(market);
  await visit({ node: market.id, view: 'market' });
  await heading(market.fields.name);
  await page.locator('.market-comparisons').waitFor();
  assert.ok((await page.locator('.market-comparisons').innerText()).length > 100);
  checks.push('Published market sources');
  await visit({ node: capability.id, view: 'relations' });
  await page.getByTestId('dependencies-pane').waitFor();
  await page.locator('.dependency-canvas canvas').first().waitFor();
  await page.locator('.dependency-options summary').click();
  const layout = page.getByRole('combobox', { name: 'Disposition', exact: true });
  await layout.selectOption('hierarchical');
  assert.ok(page.url().includes('layout=hierarchical'));
  await page.reload();
  await page.locator('.dependency-options summary').click();
  await layout.waitFor();
  assert.equal(await layout.inputValue(), 'hierarchical');
  checks.push('Cytoscape rendering, layout and reload');

  await page.setViewportSize({ width: 390, height: 844 });
  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  const opener = page.getByRole('button', { name: /Ouvrir l’arbre/ });
  await opener.click();
  await page.getByRole('dialog', { name: 'Navigation du modèle' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Navigation du modèle' }).waitFor({ state: 'hidden' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  checks.push('Mobile drawer, Escape and horizontal overflow');
  assert.deepEqual(errors, []);
  assert.ok(!requests.some(p => p.includes('/api/') || p.includes('backlog')));
  await page.screenshot({ path: path.join(output, 'mobile.png') });
  await writeFile(path.join(output, 'report.json'), JSON.stringify({ version: model.version, checks, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', version: model.version, checks }));
} finally {
  await browser.close();
}
