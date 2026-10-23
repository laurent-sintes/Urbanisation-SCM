import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { openMapDisplay } from './browser-navigation.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { defaultHotspotMapFilters, filterMapHotspots } from './src/hotspotMap.ts';
import { adaptPublication } from './src/model.ts';

const dist = resolve(import.meta.dirname, 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const modelPath = `data/${index.current_version}/model.json`;
const model = JSON.parse(await readFile(resolve(dist, modelPath), 'utf8'));
for (const item of model.hotspot_catalog.hotspots) item.visible = !['HS-008', 'HS-011'].includes(item.id);
const hidden = model.hotspot_catalog.hotspots.find((h) => h.id === 'HS-008');
hidden.visible = false;
const historicDefault = model.hotspot_catalog.hotspots.find((h) => h.id === 'HS-002');
delete historicDefault.visible;
const visibleCount = model.hotspot_catalog.hotspots.filter((item) => item.visible !== false).length;
const nonModelCount = filterMapHotspots(model.hotspot_catalog.hotspots, {
  ...defaultHotspotMapFilters,
  enabled: true,
  showModelHotspots: false,
}).length;
const hiddenTitle = adaptPublication(model).raw.hotspot_catalog.hotspots.find((item) => item.id === hidden.id).title;
const payload = Buffer.from(JSON.stringify(model));
index.versions.find((entry) => entry.version === index.current_version).model_sha256 = createHash('sha256')
  .update(payload)
  .digest('hex');
let staging = {
  active: true,
  schema_version: 1,
  session_id: 'qa-visibility',
  base_version: index.current_version,
  base_model_sha256: createHash('sha256').update(payload).digest('hex'),
  revision: 0,
  operations: [],
};
const posts = [],
  errors = [];
const base = 'http://localhost:9876/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === 'data/index.json') return route.fulfill({ json: index });
    if (relative === modelPath) return route.fulfill({ body: payload, contentType: 'application/json' });
    if (relative === '__atlas__/workshop/staging.json') return route.fulfill({ json: staging });
    if (relative === '__atlas__/workshop/hotspots/batch') {
      const request = route.request().postDataJSON();
      assert.equal(request.session_id, staging.session_id);
      assert.equal(request.expected_revision, staging.revision);
      posts.push(request);
      staging = {
        ...staging,
        revision: staging.revision + request.changes.length,
        operations: request.changes.map((change) => ({
          sequence: 1,
          entity: 'hotspot',
          action: 'update',
          id: change.id,
          value: { ...model.hotspot_catalog.hotspots.find((h) => h.id === change.id), ...change.fields },
        })),
      };
      return route.fulfill({ json: staging });
    }
    const target = resolve(dist, relative);
    if (!target.startsWith(dist + sep)) return route.abort();
    return route.fulfill({
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
  const hiddenRow = page.locator('[data-hotspot-id="HS-008"]');
  await hiddenRow.waitFor();
  assert.ok((await hiddenRow.getAttribute('class')).includes('hotspot-is-hidden'));
  assert.ok(
    (await page.locator('.hotspot-table tbody tr:last-child').getAttribute('class')).includes('hotspot-is-hidden'),
  );
  assert.match(await page.locator('.hotspot-hidden-separator').innerText(), /Non visibles/);
  await page.getByRole('button', { name: 'Sujet et impact', exact: false }).click();
  assert.ok(
    (await page.locator('.hotspot-table tbody tr:last-child').getAttribute('class')).includes('hotspot-is-hidden'),
  );
  await page.getByRole('button', { name: 'Filtres', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).uncheck();
  await hiddenRow.waitFor();
  assert.equal(
    await page.locator('.hotspot-table tr[data-hotspot-id]').count(),
    nonModelCount + 2,
    'matching visible subjects plus two separately retained hidden subjects',
  );
  await page.setViewportSize({ width: 390, height: 950 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.ok(await page.locator('.hotspot-hidden-separator').isVisible());
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(`${base}#/map`);
  await openMapDisplay(page);
  await page.locator('.map-hotspot-picker .detail-trigger').click();
  const picker = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  await picker.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  const hiddenChoice = picker.locator('[data-hotspot-id="HS-008"]');
  await hiddenChoice.waitFor();
  assert.deepEqual(
    (
      await picker
        .locator('.hotspot-filter-list > button')
        .evaluateAll((items) => items.slice(-2).map((item) => item.getAttribute('data-hotspot-id')))
    ).sort(),
    ['HS-008', 'HS-011'],
  );
  assert.ok(await picker.locator('.hotspot-hidden-separator').isVisible());
  assert.match(
    await picker.locator('.hotspot-filter-results-heading').innerText(),
    new RegExp(`\\b${visibleCount}\\b`),
  );
  await picker.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).uncheck();
  await hiddenChoice.waitFor();
  assert.match(
    await picker.locator('.hotspot-filter-results-heading').innerText(),
    new RegExp(`\\b${nonModelCount}\\b`),
  );
  await picker.getByRole('button', { name: 'Fermer les filtres' }).click();
  assert.equal(await page.locator('[data-id="hotspot:HS-008"]').count(), 0, 'hidden hotspot has no halo');
  await page.goto(`${base}#/hotspots`);
  await page.getByRole('button', { name: `Modifier le périmètre de ${hiddenTitle}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /^Type et périmètre/ });
  const visible = dialog.getByRole('checkbox', { name: 'Visible dans la carte et les filtres', exact: true });
  assert.equal(await visible.isChecked(), false);
  await visible.check();
  await dialog.getByRole('button', { name: 'Terminer', exact: true }).click();
  await page.getByRole('button', { name: 'Enregistrer les modifications', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.hotspot-save-message')?.textContent.includes('enregistré'));
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0].changes, [{ id: hidden.id, fields: { visible: true } }]);
  assert.equal(hidden.visible, false, 'frozen publication is unchanged');
  assert.equal(
    await page.locator('.hotspot-hidden-separator').count(),
    1,
    'the second hidden subject retains its separate access',
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      defaultTrue: true,
      hiddenHalosExcluded: true,
      filtersSeparateHidden: true,
      orderingAndSeparators: true,
      mobile: true,
      visibilitySavedAtomically: true,
    }),
  );
} finally {
  await browser.close();
}
