/** Candidate-only acceptance; no publication, listener or served data is changed. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { candidateFixture } from './candidate-fixture.mjs';

const root = resolve(import.meta.dirname, '..'),
  dist = resolve(root, 'app/dist');
const candidate = await candidateFixture(dist),
  base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions),
  errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const rel = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (rel === 'data/index.json') return route.fulfill({ json: candidate.index });
    if (rel === `data/${candidate.version}/model.json`)
      return route.fulfill({ body: candidate.bytes, contentType: 'application/json' });
    if (rel === `data/${candidate.version}/guide.json`)
      return route.fulfill({ body: candidate.guideBytes, contentType: 'application/json' });
    const file = resolve(dist, rel);
    assert.ok(file.startsWith(dist + sep));
    try {
      return route.fulfill({
        body: await readFile(file),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
          }[extname(file)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Missing' });
    }
  });
  const visit = async (view, params = {}) => {
    await page.goto(`${base}#/${view}?${new URLSearchParams({ version: candidate.version, ...params })}`);
    await page.locator('.workspace-content').waitFor();
  };
  await visit('design-principles');
  await page.getByRole('heading', { name: 'Principes directeurs', exact: true, level: 1 }).waitFor();
  assert.equal(await page.locator('.principle-cards').first().locator(':scope > li').count(), 14);
  const featured = candidate.raw.principles.filter((p) => p.featured);
  for (const p of featured) {
    await visit('design-principles', { principle: p.id });
    await page.getByRole('heading', { name: p.label_fr, exact: true, level: 2 }).waitFor();
    for (const section of [
      'Le principe',
      'Pourquoi ce choix',
      'Ce que cela change dans la carte',
      'Limites et compromis',
      'Recherche et marché',
    ])
      assert.ok(await page.getByRole('heading', { name: section, exact: true }).isVisible(), `${p.id}: ${section}`);
    for (const ref of p.references || [])
      assert.equal(await page.locator(`.principle-references a[href="${ref.url}"]`).count(), 1);
  }
  await visit('sheet', { node: 'D04.i' });
  const sheetLink = page.locator('.sheet-principles a').filter({ hasText: 'Un SCM décisionnel' });
  await sheetLink.click();
  await page
    .getByRole('heading', {
      name: 'Un SCM décisionnel fondé sur le cycle complet des commandes',
      exact: true,
      level: 2,
    })
    .waitFor();
  assert.ok(new URLSearchParams(page.url().split('?')[1]).get('returnTo').includes('D04.i'));
  const orderName = candidate.raw.nodes.find((n) => n.id === 'D04.i').fields.name;
  await page.getByRole('link', { name: `Retour à la fiche : ${orderName}`, exact: true }).click();
  await page.locator('[data-testid="business-sheet"]').waitFor();
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 600 },
    { width: 390, height: 700 },
  ]) {
    await page.setViewportSize(size);
    if (size.width < 1001) await page.getByRole('button', { name: 'Ouvrir le panneau', exact: true }).click();
    const input = page.locator('#fa-search');
    await input.fill('saison');
    await page.locator('[data-search-result="PRINCIPLE-CONFIGURABLE-CONTEXTS"]').waitFor();
    const inputBox = await input.boundingBox(),
      resultBox = await page.locator('.search-results').boundingBox();
    assert.ok(inputBox.y < 160, `search stays at top: ${JSON.stringify(size)}`);
    assert.ok(
      resultBox.height > size.height * 0.5,
      `results get more than half height: ${JSON.stringify(size)} ${resultBox.height}`,
    );
    assert.ok(await page.locator('.primary-spaces').isHidden());
    await page.getByRole('combobox', { name: 'Type de résultat', exact: true }).selectOption('principle');
    await input.press('ArrowDown');
    assert.ok(await page.locator('[data-search-result]:focus').count());
    await page.locator('[data-search-result="PRINCIPLE-CONFIGURABLE-CONTEXTS"]').click();
    await page.getByRole('heading', { name: 'Des contextes configurables', exact: true, level: 2 }).waitFor();
    assert.ok(page.url().includes(`version=${candidate.version}`));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  const output = resolve(root, '.runtime/principles-U1158');
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: resolve(output, 'mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit('design-principles');
  await page.screenshot({ path: resolve(output, 'index.png'), fullPage: true });
  // Actual old publication retains its own minimal principles and method route.
  const old = candidate.index.versions.find((x) => x.version === '2026-09-13.5');
  assert.ok(old);
  await page.goto(`${base}#/design-principles?version=${old.version}`);
  await page.locator('.principle-conventions').waitFor();
  assert.equal(await page.locator('.principle-filters').count(), 0);
  assert.equal(await page.getByText('Des contextes configurables', { exact: true }).count(), 0);
  await page.goto(`${base}#/principles?version=${old.version}`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  assert.notEqual(await page.getByRole('heading', { level: 1 }).textContent(), 'Principes directeurs');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'passed', principles: 14, viewportChecks: 3, historicalVersion: old.version }));
} finally {
  await browser.close();
}
