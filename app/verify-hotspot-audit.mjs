import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${index.current_version}/model.json`));
const model = JSON.parse(payload);
const base = 'http://localhost:9876/Urbanisation-SCM/';
const output = resolve(import.meta.dirname, '.runtime/qa-hotspot-audit-applied');
await mkdir(output, { recursive: true });
let staging = {
  active: true,
  schema_version: 1,
  session_id: 'qa-audit',
  base_version: 'obsolete-version',
  revision: 0,
  operations: [],
};
const posts = [],
  errors = [];
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === '__atlas__/workshop/staging.json') return route.fulfill({ json: staging });
    if (relative === '__atlas__/workshop/hotspots/batch') {
      const request = route.request().postDataJSON();
      posts.push(request);
      assert.equal(request.expected_revision, staging.revision);
      for (const change of request.changes) {
        const original = model.hotspot_catalog.hotspots.find((item) => item.id === change.id);
        staging.operations.push({
          sequence: ++staging.revision,
          entity: 'hotspot',
          action: 'update',
          id: change.id,
          value: { ...original, ...change.fields },
        });
      }
      return route.fulfill({ json: staging });
    }
    const target = resolve(dist, relative);
    if (!target.startsWith(dist + sep)) return route.abort();
    await route.fulfill({
      body: await readFile(target),
      contentType:
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.svg': 'image/svg+xml',
        }[extname(target)] || 'application/octet-stream',
    });
  });
  await page.goto(`${base}#/hotspots`);
  await page.locator('.hotspot-table').waitFor();
  assert.match(await page.locator('.hotspot-workshop-note').innerText(), /obsolete-version/);
  assert.equal(await page.getByRole('button', { name: /^Qualification et avancement de/ }).count(), 0);
  assert.equal(await page.locator('.hotspot-table th').count(), 4);
  assert.ok(
    await page
      .locator('.hotspot-list-summary')
      .first()
      .evaluate((element) => element.getBoundingClientRect().height <= 36.5),
    'description preview uses at most two lines',
  );
  assert.ok(
    await page
      .locator('.hotspot-table')
      .evaluate(
        (element) =>
          element.querySelector('th').getBoundingClientRect().width / element.getBoundingClientRect().width >= 0.4,
      ),
    'subject receives most of the available width',
  );
  const impact = page.locator('.hotspot-impact-detail').first();
  await impact.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert.match(await impact.innerText(), /Justification :/);
  assert.match(await impact.innerText(), /Preuve :/);
  await page.getByRole('button', { name: 'Filtres', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).uncheck();
  assert.equal(await page.locator('.hotspot-table tr[data-hotspot-id]').count(), 6);
  assert.ok(
    await page.locator('[data-hotspot-id="HS-001"]').isVisible(),
    'transition remains selectable independently of model',
  );
  await page.getByRole('checkbox', { name: 'Hotspots transition', exact: true }).uncheck();
  assert.equal(await page.locator('.hotspot-table tr[data-hotspot-id]').count(), 4);
  await page.getByRole('checkbox', { name: 'Hotspots transition', exact: true }).check();
  const shared = page.url();
  assert.ok(new URLSearchParams(new URL(shared).hash.split('?')[1]).has('hf'));
  await page.reload();
  await page.locator('.hotspot-table').waitFor();
  assert.equal(await page.locator('.hotspot-table tr[data-hotspot-id]').count(), 6);
  await page.goto(shared.replace('#/hotspots', '#/map'));
  await page.locator('.map-hotspot-picker .detail-trigger').click();
  const filters = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  assert.equal(await filters.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).isChecked(), false);
  assert.equal(await filters.locator('.hotspot-filter-list-label').count(), 6);
  await filters.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await filters.getByRole('button', { name: 'Fermer les filtres' }).click();
  const marker = page.locator('.hotspot-map-marker:not(:has(.hotspot-map-count))').first();
  await marker.waitFor();
  const id = (await marker.getAttribute('data-id')).replace('hotspot:', '');
  await marker.focus();
  const tooltip = page.locator('.hotspot-map-tooltip').last();
  await tooltip.waitFor();
  const subject = model.hotspot_catalog.hotspots.find((item) => item.id === id);
  assert.ok((await tooltip.innerText()).includes(subject.problem.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')));
  await page.keyboard.press('Escape');
  await page.mouse.move(0, 0);
  await page.locator('.map-hotspot-picker .detail-trigger').focus();
  await page.waitForTimeout(350);
  assert.ok(
    await page
      .locator('.hotspot-map-point:not(.is-framing-closed) .hotspot-map-halo')
      .first()
      .evaluate((element) => Number(getComputedStyle(element).opacity) >= 0.65),
  );
  await page.goto(`${base}#/hotspots`);
  await page.locator('.hotspot-table').waitFor();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    assert.equal(
      await page.locator('.hotspot-table-scroll').evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      true,
    );
    assert.equal(
      await page
        .locator('.hotspot-table tbody tr')
        .first()
        .evaluate((element) => getComputedStyle(element).display),
      'grid',
    );
  }
  await page.screenshot({ path: resolve(output, 'mobile-list.png') });
  assert.ok(
    await page
      .locator('.hotspot-table tbody tr')
      .first()
      .evaluate((element) => element.getBoundingClientRect().height < 380),
    'mobile attributes fit in a compact card',
  );
  staging = {
    ...staging,
    base_version: index.current_version,
    base_model_sha256: createHash('sha256').update(payload).digest('hex'),
  };
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.reload();
  const wholesale = model.hotspot_catalog.hotspots.find((item) => item.id === 'HS-008');
  await page.getByRole('button', { name: `Qualification et avancement de ${wholesale.title}`, exact: true }).waitFor();
  await page.getByRole('button', { name: `Criticité et complexités de ${wholesale.title}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /^Complexités/ });
  await dialog
    .getByRole('textbox', { name: 'Justification politique', exact: true })
    .fill('Compromis documenté pour le test.');
  await dialog
    .getByRole('textbox', { name: 'Justification d’implémentation', exact: true })
    .fill('Dépendances documentées pour le test.');
  assert.equal(posts.length, 0, 'editing a draft never submits it');
  await dialog.getByRole('button', { name: 'Terminer', exact: true }).click();
  await page.getByRole('button', { name: 'Enregistrer les modifications', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.hotspot-save-message')?.textContent.includes('enregistré'));
  assert.equal(posts.length, 1);
  assert.equal(posts[0].changes[0].fields.complexity.political_rationale, 'Compromis documenté pour le test.');
  assert.equal(posts[0].changes[0].fields.complexity.implementation_rationale, 'Dépendances documentées pour le test.');
  assert.equal(posts[0].changes[0].fields.complexity.political, wholesale.complexity.political);
  assert.equal(posts[0].changes[0].fields.complexity.implementation, wholesale.complexity.implementation);
  assert.deepEqual(errors, []);
  assert.deepEqual(model, JSON.parse(payload), 'frozen publication is unchanged');
  console.log(
    JSON.stringify({
      sharedFilters: true,
      mobileCards: true,
      explainedImpact: true,
      restoredSummary: true,
      visibleHalos: true,
      staleSessionDiagnostic: true,
      axisExplanationsSaved: true,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
