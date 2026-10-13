/** Exercise product selection on the real published enterprise map. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { projectedApplicationMapIds, selectionMappings } from './src/applicationCatalog.ts';
import { adaptPublication } from './src/model.ts';

const dist = resolve(import.meta.dirname, 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const version = index.current_version;
const raw = JSON.parse(await readFile(resolve(dist, `data/${version}/model.json`), 'utf8'));
const model = adaptPublication(raw);
const catalog = raw.application_catalog;
const output = resolve(import.meta.dirname, '.runtime/qa-application-picker');
await mkdir(output, { recursive: true });
const browser = await chromium.launch(browserOptions);
const errors = [];
const cases = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== 'https://atlas.test') return route.abort();
    const path = resolve(dist, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
    if (!path.startsWith(dist + sep)) return route.abort();
    try {
      await route.fulfill({
        body: await readFile(path),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.svg': 'image/svg+xml',
          }[extname(path)] || 'application/octet-stream',
      });
    } catch {
      await route.fulfill({ status: 404, body: 'Missing' });
    }
  });
  // Start with the exact reported case before exercising the other products.
  const selections = [...catalog.selections].sort(
    (a, b) => Number(b.product_id === 'product-united-retail') - Number(a.product_id === 'product-united-retail'),
  );
  assert.ok(
    selections.some(
      (selection) => catalog.products.find((product) => product.id === selection.product_id)?.name === 'United Retail',
    ),
  );
  for (const selection of selections) {
    const product = catalog.products.find((item) => item.id === selection.product_id);
    const entryPoints =
      product.name === 'United Retail'
        ? ['', 'map'].flatMap((entry) => [1, 0, 2].map((depth) => ({ entry, depth })))
        : [{ entry: '', depth: 1 }];
    for (const { entry, depth } of entryPoints) {
      await page.goto(`https://atlas.test/#/${entry}?mapDepth=${depth}`);
      await page.locator('.overview-system').first().waitFor();
      const trigger = page.locator('.map-application-picker > button');
      await trigger.click();
      const section = page
        .getByRole('dialog', { name: 'Applications sur la carte' })
        .locator('section')
        .filter({
          has: page.getByRole('heading', {
            name: {
              'beaumanoir-historique': 'SI Beaumanoir Marques Historiques',
              boardriders: 'SI Boardriders',
              'flow-platform': 'SI Beaumanoir cible',
              sarenza: 'SI Sarenza',
            }[selection.context_id],
            exact: true,
          }),
        });
      await section.getByRole('button', { name: product.name, exact: true }).click();
      await page.waitForFunction(
        (id) => new URLSearchParams(location.hash.split('?')[1]).get('app') === id,
        selection.id,
      );
      await page.getByRole('button', { name: `Applications ${product.name}`, exact: true }).waitFor();
      assert.equal(
        await page.locator('.application-map-note').count(),
        0,
        'Application coverage does not add a banner',
      );
      // Let resize, focus restoration and route effects settle before checking persistence.
      await page.waitForTimeout(250);
      assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('app'), selection.id);
      const visibleIds = new Set(
        await page
          .locator('.overview-system, .overview-domain-link, .overview-subdomain-link')
          .evaluateAll((elements) => elements.map((element) => element.dataset.nodeId || element.dataset.mapItemId)),
      );
      const expected = [
        ...projectedApplicationMapIds(model, selectionMappings(catalog, selection.id), visibleIds),
      ].sort();
      const actual = await page
        .locator('.application-related-item, .overview-system.application-related')
        .evaluateAll((elements) =>
          [...new Set(elements.map((element) => element.dataset.nodeId || element.dataset.mapItemId))].sort(),
        );
      assert.deepEqual(actual, expected, `${product.name}: nearest visible coverage at detail ${depth}`);
      if (product.name === 'United Retail' && depth === 1) assert.deepEqual(actual, ['domain-sales']);
      await page.reload();
      await page.getByRole('button', { name: `Applications ${product.name}`, exact: true }).waitFor();
      assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('mapDepth'), String(depth));
      assert.deepEqual(
        await page
          .locator('.application-related-item, .overview-system.application-related')
          .evaluateAll((elements) =>
            [...new Set(elements.map((element) => element.dataset.nodeId || element.dataset.mapItemId))].sort(),
          ),
        expected,
        `${product.name}: coverage survives reload`,
      );
      await trigger.click();
      await page.getByRole('button', { name: 'Masquer les applications', exact: true }).click();
      await page.getByRole('button', { name: 'Applications masquées', exact: true }).waitFor();
      assert.equal(await page.locator('.application-related-item, .application-context-item').count(), 0);
      cases.push({ product: product.name, context: selection.context_id, entry, depth, coverage: expected });
    }
  }
  for (const product of catalog.products.filter((item) => item.kind === 'vendor_product')) {
    await page.goto('https://atlas.test/#/?mapDepth=1');
    await page.locator('.overview-system').first().waitFor();
    await page.locator('.map-application-picker > button').click();
    const market = page
      .getByRole('dialog', { name: 'Applications sur la carte' })
      .locator('section')
      .filter({
        has: page.getByRole('heading', { name: 'Produits du marché', exact: true }),
      });
    await market.getByRole('button', { name: product.name, exact: true }).click();
    await page.getByRole('button', { name: `Applications ${product.name} · Offre éditeur`, exact: true }).waitFor();
    const visibleIds = new Set(
      await page
        .locator('.overview-system, .overview-domain-link')
        .evaluateAll((elements) => elements.map((element) => element.dataset.nodeId || element.dataset.mapItemId)),
    );
    const expected = [...projectedApplicationMapIds(model, product.offering_mappings || [], visibleIds)].sort();
    const coverage = () =>
      page
        .locator('.application-related-item, .overview-system.application-related')
        .evaluateAll((elements) =>
          [...new Set(elements.map((element) => element.dataset.nodeId || element.dataset.mapItemId))].sort(),
        );
    assert.deepEqual(await coverage(), expected, `${product.name}: editor offering coverage`);
    assert.equal(await page.locator('.application-map-note').count(), 0);
    await page.reload();
    await page.getByRole('button', { name: `Applications ${product.name} · Offre éditeur`, exact: true }).waitFor();
    assert.deepEqual(await coverage(), expected);
    if (product.components.length > 1) {
      const component = product.components.find((item) => item.kind !== 'product');
      await page.locator('.map-application-picker > button').click();
      await page
        .getByRole('group', { name: 'Fonctionnalité affichée' })
        .getByRole('button', { name: component.name, exact: true })
        .click();
      await page.waitForFunction(
        (id) => new URLSearchParams(location.hash.split('?')[1]).get('component') === id,
        component.id,
      );
      await page
        .getByRole('button', { name: `Applications ${product.name} · Offre éditeur · ${component.name}`, exact: true })
        .waitFor();
      assert.deepEqual(
        await coverage(),
        [...projectedApplicationMapIds(model, selectionMappings(catalog, product.id, component.id), visibleIds)].sort(),
      );
    }
    cases.push({ product: product.name, context: 'market', coverage: expected });
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'passed', cases }));
} finally {
  await browser.close();
}
