/** Focused UI regression checks for published scenario paths and offer evidence. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const version = index.current_version;
const published = JSON.parse(await readFile(resolve(dist, `data/${version}/model.json`), 'utf8'));
const catalog = published.scenario_catalog;
const browser = await chromium.launch(browserOptions);
const errors = [];
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== 'https://atlas.test') return route.abort();
    const path = resolve(dist, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
    if (!path.startsWith(dist + sep)) return route.abort();
    try {
      return route.fulfill({
        body: await readFile(path),
        contentType: types[extname(path)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Missing static file' });
    }
  });

  for (const [node, scenarioId, expectedPath, irrelevantDefault] of [
    [
      'order-workflow-orchestration',
      'remote-payment-ambiguous',
      'payment-resumption-not-confirmed-path',
      'remote-payment-ambiguous-path',
    ],
    ['BHV082', 'customer-credit-hold', 'credit-review-no-response-path', 'customer-credit-hold-path'],
  ]) {
    const scenario = catalog.scenarios.find((item) => item.id === scenarioId);
    const expected = catalog.paths.find((item) => item.id === expectedPath);
    await page.goto(`https://atlas.test/#/sheet?version=${version}&node=${node}`);
    const section = page.locator('.scenario-links');
    await section.getByRole('link', { name: scenario.title, exact: true }).waitFor();
    const item = section
      .locator(':scope > ul > li')
      .filter({ has: page.getByRole('link', { name: scenario.title, exact: true }) });
    assert.equal(await item.count(), 1, 'The scenario remains unique on the sheet');
    const pathLinks = item.locator('ul a');
    const routes = await pathLinks.evaluateAll((links) =>
      links.map((link) => new URLSearchParams(link.hash.split('?')[1]).get('path')),
    );
    assert.equal(new Set(routes).size, routes.length, 'Paths are not repeated for multiple contributions');
    assert.ok(routes.includes(expectedPath));
    assert.ok(!routes.includes(irrelevantDefault));
    const main = item.getByRole('link', { name: scenario.title, exact: true });
    assert.ok(new URLSearchParams((await main.getAttribute('href')).split('?')[1]).get('path'));
    await item.getByRole('link', { name: expected.title, exact: true }).click();
    await page.getByRole('heading', { name: expected.title, exact: true }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Parcours de mobilisation' }).inputValue(), expectedPath);
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('version'), version);
  }

  const counts = { candidate: 0, documented: 0 };
  const labels = { candidate: 'Correspondance à vérifier', documented: 'Correspondance documentée' };
  for (const product of published.application_catalog.products.filter((item) => item.kind === 'vendor_product')) {
    const root = product.components.find((item) => !item.parent_id);
    await page.goto(`https://atlas.test/#/applications?version=${version}&catalog=products&component=${root.id}`);
    await page.locator('.application-identity h2').filter({ hasText: product.name }).waitFor();
    const mappings = page.locator('[data-offering-mapping]');
    assert.equal(await mappings.count(), (product.offering_mappings || []).length, product.id);
    for (const mapping of product.offering_mappings || []) {
      const item = page.locator(`[data-offering-mapping="${mapping.id}"]`);
      assert.ok(await item.getByText(labels[mapping.evidence_state], { exact: false }).isVisible(), mapping.id);
      counts[mapping.evidence_state]++;
    }
  }
  assert.deepEqual(counts, { candidate: 25, documented: 86 });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'ok', version, scenarioCases: 2, offeringMappings: counts }));
} finally {
  await browser.close();
}
