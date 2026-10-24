/** Real published-data journeys; no listener, workshop edit, or publication is changed. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { openMapDisplay } from './browser-navigation.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';

const root = resolve(import.meta.dirname, '..'),
  dist = resolve(root, 'app/dist');
const out = resolve(root, '.runtime/atlas-navigation-ux');
await mkdir(out, { recursive: true });
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const version = index.current_version,
  base = 'https://atlas.test/Urbanisation-SCM/';
const raw = JSON.parse(await readFile(resolve(dist, `data/${version}/model.json`), 'utf8'));
const browser = await chromium.launch(browserOptions),
  errors = [],
  checks = [],
  measurements = [];
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
  acceptDownloads: true,
});
page.setDefaultTimeout(12000);
page.on('pageerror', (error) => errors.push(error.message));
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (!url.href.startsWith(base)) return route.abort();
  const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
  const file = resolve(dist, relative);
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
          '.pdf': 'application/pdf',
        }[extname(file)] || 'application/octet-stream',
    });
  } catch {
    return route.fulfill({ status: 404, body: 'Missing' });
  }
});
const visit = async (view, params = {}) => {
  await page.goto(`${base}#/${view}?${new URLSearchParams(params)}`);
  await page.locator(`#fa-version[data-version="${params.version || version}"]`).waitFor({ state: 'attached' });
  await page.locator('.workspace-content').waitFor();
};
const search = async (query) => {
  await page.getByRole('button', { name: 'Rechercher dans Atlas', exact: true }).click();
  await page.locator('#fa-search:focus').waitFor();
  await page.locator('#fa-search').fill(query);
  if (query) await page.locator('[data-search-result]').first().waitFor();
};
const group = async (label) => {
  const summary = page.locator('.navigation-group > summary').filter({ hasText: new RegExp(`^${label}$`) });
  if (!(await summary.evaluate((element) => element.parentElement.open))) await summary.click();
};
try {
  for (const height of [720, 650]) {
    await page.setViewportSize({ width: 1280, height });
    for (const view of ['design-principles', 'glossary', 'documents', 'principles', 'metamodel', 'help']) {
      await visit(view);
      await page.waitForFunction(() => document.querySelectorAll('.navigation-group[open]').length === 1);
      assert.equal(await page.locator('.sidebar .space-navigation').count(), 0);
      const nav = await page.locator('.sidebar-scroll').boundingBox();
      const last = await page.locator('.navigation-submenu').last().getByRole('button').last().boundingBox();
      assert.ok(last.y + last.height <= nav.y + nav.height + 1, `${view}: all destinations fit at 1280 × ${height}`);
      assert.ok((await page.locator('.sidebar-bottom').boundingBox()).height <= 56);
      assert.match(await page.locator('.breadcrumb').innerText(), /Atlas.*Comprendre/s);
    }
  }
  await visit('applications', { catalog: 'products' });
  await group('Comprendre');
  assert.equal(await page.locator('.navigation-group[open]').count(), 1);
  await page.getByRole('button', { name: 'Principes directeurs', exact: true }).click();
  await page.locator('.principle-list').waitFor();
  await page.setViewportSize({ width: 1280, height: 720 });
  const principles = await page.locator('.principle-list > li').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    }),
  );
  assert.ok(principles.filter((box) => box.top >= 0 && box.bottom <= 720).length >= 3);
  measurements.push({ page: 'principles', width: 1280, height: 720, entries: principles });
  await page.screenshot({ path: resolve(out, 'principles-1280.png') });
  await visit('sheet', { node: 'domain-plan' });
  await page.waitForFunction(() => document.querySelectorAll('.navigation-group[open]').length === 0);
  checks.push(
    'Comprendre has no appended lists; one group opens at a time; destinations fit at 720px and 650px high; three principles are visible',
  );

  await visit('scenarios');
  await page.locator('.scenario-cards').waitFor();
  assert.equal(await page.locator('.scenario-advanced-filters').getAttribute('open'), null);
  const firstScenario = await page.locator('.scenario-cards > li').first().boundingBox();
  assert.ok(firstScenario.y + 80 < 720, 'A scenario and its purpose are visible before scrolling');
  await page.locator('.scenario-advanced-filters > summary').click();
  const eventFacet = raw.scenario_catalog.facets.events[0];
  await page.getByRole('combobox', { name: 'Événement', exact: true }).selectOption(eventFacet.id);
  await page.locator('.scenario-advanced-filters > summary').click();
  await page.getByRole('button', { name: 'Retirer le filtre Événement', exact: true }).waitFor();
  assert.match(await page.locator('.scenario-advanced-filters > summary').textContent(), /1 filtre actif/);
  await page.getByRole('button', { name: 'Effacer les filtres', exact: true }).click();
  await page.locator('.scenario-active-filters').waitFor({ state: 'detached' });
  await page.screenshot({ path: resolve(out, 'scenarios-1280.png') });
  checks.push('Scenario filters start collapsed, keep active values visible, and clear without reopening');

  await page.setViewportSize({ width: 1024, height: 768 });
  await visit('applications', { catalog: 'products' });
  await page.locator('.application-rail').getByRole('button', { name: 'Elastic Suite', exact: true }).click();
  await page.locator('.application-component-detail').waitFor();
  const moduleGeometry = await page.locator('.application-component-detail').evaluate((element) => {
    const pane = document.querySelector('.workspace-content');
    return {
      width: element.getBoundingClientRect().width,
      scroll: element.scrollWidth,
      client: element.clientWidth,
      paneScroll: pane.scrollWidth,
      paneClient: pane.clientWidth,
    };
  });
  assert.ok(moduleGeometry.width >= 320, 'Module detail has a readable width');
  assert.ok(moduleGeometry.scroll <= moduleGeometry.client + 1, 'Module content fits internally');
  assert.ok(moduleGeometry.paneScroll <= moduleGeometry.paneClient + 1, 'Application page has no horizontal scrollbar');
  measurements.push({ page: 'applications', width: 1024, ...moduleGeometry });
  await page
    .getByRole('navigation', { name: 'Modules de Elastic Suite', exact: true })
    .getByRole('button', { name: /^Whiteboard/ })
    .click();
  await page.locator('.application-component-detail:focus').waitFor();
  const moduleTop = await page.locator('.application-component-detail').boundingBox();
  assert.ok(moduleTop.y < 500, 'Selecting a stacked module brings its detail into view');
  await page.screenshot({ path: resolve(out, 'applications-1024.png') });
  await page.getByRole('button', { name: '← Retour à la liste', exact: true }).click();
  await page.locator('.application-rail').waitFor({ state: 'visible' });
  checks.push('Application modules use readable width at 1024px and return to the product list');

  await page.setViewportSize({ width: 1280, height: 720 });
  await visit('flows');
  await page.locator('.flow-exchange[data-relation-ids]').first().waitFor();
  const flowIds = await page
    .locator('.flow-exchange[data-relation-ids]')
    .evaluateAll((elements) => [...new Set(elements.flatMap((element) => element.dataset.relationIds.split('|')))]);
  assert.ok(flowIds.length > 0);
  await page.getByRole('tab', { name: 'Relations', exact: true }).click();
  await page.locator('.accessible-relations [data-relation-id]').first().waitFor();
  const relationIds = await page
    .locator('.accessible-relations [data-relation-id]')
    .evaluateAll((elements) => elements.map((element) => element.dataset.relationId));
  for (const id of flowIds) assert.ok(relationIds.includes(id), `Flux relation ${id} is available in Relations`);
  assert.match(await page.locator('.dependency-summary').textContent(), /[1-9]\d* relations publiées/);
  await page.screenshot({ path: resolve(out, 'root-relations.png') });
  checks.push('Root Flux → Relations retains every represented original relation in the selected publication');

  await visit('map');
  await openMapDisplay(page);
  await page.locator('.map-display-fields').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('.map-display-options:not([open])').waitFor();
  assert.equal(await page.locator('.map-display-options > summary:focus').count(), 1);
  await openMapDisplay(page);
  await page.locator('.map-hotspot-picker > button').click();
  await page.locator('.hotspot-filter-popover').waitFor();
  await page.locator('.hotspot-filter-popover input').first().click();
  assert.equal(await page.locator('.map-display-options[open]').count(), 1);
  await page.keyboard.press('Escape');
  await page.locator('.hotspot-filter-popover').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('.map-display-options[open]').count(), 1);
  await page.keyboard.press('Escape');
  await page.locator('.map-display-options:not([open])').waitFor();
  await openMapDisplay(page);
  await page.locator('.breadcrumb').click();
  await page.locator('.map-display-options:not([open])').waitFor();
  await page.locator('.publication-picker > summary').click();
  await page.keyboard.press('Escape');
  await page.locator('.publication-picker:not([open])').waitFor();
  assert.equal(await page.locator('.publication-picker > summary:focus').count(), 1);
  await page.locator('.publication-picker > summary').click();
  await search('stock');
  await page.locator('.publication-picker:not([open])').waitFor();
  assert.equal(await page.locator('#fa-search:focus').count(), 1);
  await page.keyboard.press('Escape');
  checks.push('Temporary panels close on Escape and outside press, preserve focus, and allow nested portalled filters');

  await page.setViewportSize({ width: 1440, height: 900 });
  await visit('map');
  await page.locator('.universe-toolbar .map-display-options > summary').click();
  await page.locator('.universe-toolbar .map-application-picker > button').waitFor();
  await page.screenshot({ path: resolve(out, 'desktop-navigation.png') });
  await visit('sheet', { node: 'domain-plan' });
  await page.getByRole('combobox', { name: 'Dans cette fiche', exact: true }).waitFor();
  assert.equal(await page.locator('.primary-spaces > button, .primary-spaces > details').count(), 5);
  assert.equal(await page.locator('.sidebar input').count(), 0);
  assert.equal(await page.locator('.sidebar .space-navigation').count(), 0);
  const workspace = await page.locator('.workspace').boundingBox();
  await search('stock');
  const opened = await page.locator('.workspace').boundingBox();
  assert.equal(workspace.width, opened.width);
  assert.equal(workspace.x, opened.x);
  await page.locator('#fa-search').press('ArrowDown');
  await page.locator('[data-search-result]:focus').waitFor();
  await page.keyboard.press('Control+k');
  await page.locator('#fa-search:focus').waitFor();
  await page.locator('.global-search').evaluate((dialog) => {
    const controls = [...dialog.querySelectorAll('button,input,select,summary')].filter(
      (element) => element.getClientRects().length > 0,
    );
    controls.at(-1).focus();
  });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog[open]')), true);
  await page.keyboard.press('Escape');
  await page.locator('.global-search').waitFor({ state: 'hidden' });
  await page.locator('.global-search-trigger:focus').waitFor();
  checks.push('Global search keeps workspace geometry, traps Tab, handles Escape, and returns focus');

  await search('Master Plan');
  await page.getByRole('combobox', { name: 'Type de résultat', exact: true }).selectOption('area');
  await page.locator('[data-search-result="domain-plan"]').click();
  await page.getByRole('tab', { name: 'Fiche', exact: true }).waitFor();
  assert.equal(await page.getByRole('tab', { name: 'Fiche', exact: true }).getAttribute('aria-selected'), 'true');
  assert.equal(new URLSearchParams(page.url().split('?')[1]).get('node'), 'domain-plan');
  await search('Master Plan');
  await page
    .locator('.global-search-result')
    .filter({ has: page.locator('[data-search-result="domain-plan"]') })
    .getByRole('button', { name: 'Voir Master Plan sur la carte', exact: true })
    .click();
  await page.locator('.map-panel').waitFor();
  assert.equal(await page.getByRole('tab', { name: 'Carte', exact: true }).getAttribute('aria-selected'), 'true');
  checks.push('Search results open a sheet or explicitly locate the same object on its map');

  await search('stock');
  await page.getByRole('combobox', { name: 'Type de résultat', exact: true }).selectOption('all');
  await page
    .getByRole('combobox', { name: 'Périmètre de recherche', exact: true })
    .selectOption('supply-chain-orchestration');
  const ids = await page
    .locator('[data-search-result]')
    .evaluateAll((elements) => elements.map((element) => element.dataset.searchResult));
  const parents = new Map(
    raw.relations
      .filter((relation) => ['contains', 'presents'].includes(relation.type))
      .map((relation) => [relation.target_id, relation.source_id]),
  );
  for (const id of ids) {
    let current = id;
    while (current && current !== 'supply-chain-orchestration') current = parents.get(current);
    assert.equal(current, 'supply-chain-orchestration');
  }
  await page.screenshot({ path: resolve(out, 'desktop-search.png') });
  await page.keyboard.press('Escape');
  checks.push('Perimeter filtering follows explicit snapshot hierarchy');

  await visit('sheet', { node: 'domain-plan' });
  await page.getByRole('combobox', { name: 'Dans cette fiche', exact: true }).selectOption('definition');
  await page.locator('.sheet-definition[open]').waitFor();
  await visit('sheet', { node: 'domain-plan', section: 'definition' });
  await page.locator('.sheet-definition[open]').waitFor();
  await page.screenshot({ path: resolve(out, 'desktop-sheet.png') });
  checks.push('Contextual sheet navigation and direct definition links open and reveal the reference definition');

  await visit('relations', { node: 'supply-chain-orchestration', scope: 'supply-chain-orchestration' });
  await page.locator('[data-testid="dependencies-pane"]').waitFor();
  assert.equal((await page.locator('.accessible-relations').textContent()).includes('](glossary:'), false);
  await visit('map', { node: 'supply-chain-orchestration', scope: 'supply-chain-orchestration' });
  await page.locator('.map-display-options > summary').click();
  await page.locator('.map-hotspot-picker > button').click();
  await page
    .locator('.hotspot-filter-popover')
    .first()
    .waitFor()
    .catch(async () => {
      assert.ok(await page.locator('.map-hotspot-picker > button[aria-expanded="true"]').count());
    });
  await page.keyboard.press('Escape');
  checks.push('Relations show readable text and grouped map settings keep their controls available');

  await group('Applications');
  await page.getByRole('button', { name: 'Logiciels du marché', exact: true }).click();
  await page.locator('.application-explorer').waitFor();
  await page.getByRole('button', { name: 'SI à faire converger', exact: true }).click();
  assert.equal(new URLSearchParams(page.url().split('?')[1]).get('catalog'), null);
  await group('Comprendre');
  await page.getByRole('button', { name: 'Documents', exact: true }).click();
  await page.locator('.documents-page').waitFor();
  await page.locator('.publication-downloads > summary').click();
  assert.equal(await page.locator('.publication-downloads a[download$=".json"]').count(), 0);
  const yaml = page.getByRole('link', { name: /Modèle complet \(YAML\)/ });
  assert.equal(new URL(await yaml.getAttribute('href'), base).pathname.endsWith(`/data/${version}/model.yaml`), true);
  const pdf = page.getByRole('link', { name: 'Télécharger « Piloter la supply chain » (PDF)', exact: true });
  // Actual transfers are exercised by verify-static.mjs through its HTTP server.
  const asset = new URL(await pdf.getAttribute('href'), base).pathname.slice(new URL(base).pathname.length);
  assert.deepEqual(
    await readFile(resolve(dist, asset)),
    await readFile(resolve(root, 'output/pdf/FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf')),
  );
  checks.push('Application groups retain both catalogs; Documents retain YAML and the unchanged downloadable SCM PDF');

  const historical = '2026-09-13.5';
  await page.locator('.publication-picker > summary').click();
  await page.getByRole('combobox', { name: 'Choisir la publication', exact: true }).selectOption(historical);
  await page.locator(`#fa-version[data-version="${historical}"]`).waitFor({ state: 'attached' });
  await search('stock');
  assert.ok((await page.locator('.global-search-context').textContent()).includes(historical));
  assert.ok((await page.locator('.global-search-context').textContent()).includes('Publication figée'));
  await page.keyboard.press('Escape');
  assert.ok(page.url().includes(`version=${historical}`));
  checks.push('Publication selection pins historical content, search and downloads to that edition');

  for (const size of [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(size);
    await visit('sheet', { node: 'domain-plan' });
    await page.locator('.detail-finality').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const headingBox = await page.locator('.detail-finality').boundingBox();
    measurements.push({ ...size, firstSectionTop: headingBox.y });
    const commands = await page
      .locator('.view-tabs button, .view-more > summary, .view-parent-button')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label: element.textContent.trim(),
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            };
          }),
      );
    for (let first = 0; first < commands.length; first++)
      for (let second = first + 1; second < commands.length; second++) {
        const a = commands[first],
          b = commands[second];
        assert.ok(
          a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1,
          `View commands overlap: ${a.label} / ${b.label} at ${size.width}px`,
        );
      }
    if (size.width > 1000) {
      await page.getByRole('tab', { name: 'Sources d’inspiration', exact: true }).waitFor();
      assert.equal(await page.locator('.view-more').count(), 0, 'Desktop displays every available view directly');
      await page.getByRole('tab', { name: 'Sources d’inspiration', exact: true }).click();
      await page.locator('.market-page').waitFor();
      assert.equal(
        await page.getByRole('tab', { name: 'Sources d’inspiration', exact: true }).getAttribute('aria-selected'),
        'true',
      );
      await page.getByRole('tab', { name: 'Fiche', exact: true }).click();
      await page.getByTestId('business-sheet').waitFor();
      const sidebar = await page.locator('.sidebar-scroll').boundingBox();
      const last = await page.locator('.primary-spaces > details').last().boundingBox();
      assert.ok(last.y + last.height <= sidebar.y + sidebar.height);
    } else {
      assert.equal(await page.locator('.sidebar').isVisible(), false);
      await page.getByRole('button', { name: 'Ouvrir le panneau', exact: true }).click();
      await group('Comprendre');
      await page.getByRole('button', { name: 'Documents', exact: true }).click();
      await page.locator('.documents-page').waitFor();
      assert.equal(await page.locator('.sidebar').isVisible(), false);
      await visit('sheet', { node: 'domain-plan' });
      await page.locator('.view-more > summary').click();
      await page
        .locator('.view-more-options')
        .getByRole('button', { name: /Remonter vers Supply Chain Management/ })
        .click();
      await page.waitForURL(
        (url) => new URLSearchParams(url.hash.split('?')[1]).get('node') === 'supply-chain-orchestration',
      );
      await visit('sheet', { node: 'domain-plan' });
      await page.locator('.view-more > summary').click();
      await page.locator('.view-more-options').getByRole('button', { name: 'Relations', exact: true }).click();
      await page.locator('[data-testid="dependencies-pane"]').waitFor();
    }
    await search('Master Plan');
    assert.equal(
      await page.locator('.global-search').evaluate((element) => element.scrollWidth > element.clientWidth),
      false,
    );
    await page.screenshot({ path: resolve(out, `search-${size.width}.png`) });
    await page.keyboard.press('Escape');
    await visit('sheet', { node: 'domain-plan' });
    await page.screenshot({ path: resolve(out, `sheet-${size.width}.png`) });
  }
  checks.push('Navigation, sheet, mobile overflow menu and global search work at five viewport sizes');
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await visit('map');
    const stage = page.locator('.catalogue-navigation-stage');
    await stage.waitFor();
    const before = await stage.boundingBox();
    await openMapDisplay(page);
    await page.locator('.map-display-fields').waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const box = document.querySelector('.map-display-fields')?.getBoundingClientRect();
      return box && box.x >= 0 && box.right <= innerWidth + 1 && box.y >= 0 && box.bottom <= innerHeight + 1;
    });
    const fields = await page.locator('.map-display-fields').boundingBox();
    const after = await stage.boundingBox();
    assert.ok(
      Math.abs(before.y - after.y) < 1 && Math.abs(before.height - after.height) < 1,
      `Display settings preserve the map viewport at ${size.width}px`,
    );
    assert.ok(
      fields.x >= 0 &&
        fields.x + fields.width <= size.width + 1 &&
        fields.y >= 0 &&
        fields.y + fields.height <= size.height + 1,
      `Display settings remain inside the screen at ${size.width}px`,
    );
    await page.screenshot({ path: resolve(out, `map-settings-${size.width}.png`) });
  }
  checks.push('Display settings preserve the map viewport and stay inside desktop, mobile and landscape screens');
  assert.deepEqual(errors, []);
  const report = { status: 'passed', version, historical, checks, measurements, errors };
  await writeFile(resolve(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  await page.screenshot({ path: resolve(out, 'failure.png'), fullPage: true });
  await writeFile(
    resolve(out, 'failure.json'),
    JSON.stringify({ message: error.message, url: page.url(), checks, errors }, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
