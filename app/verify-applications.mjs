/** Browser audit of the unpublished application catalog, injected into a static publication. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'app/dist');
const output = resolve(root, 'app/.runtime/qa-applications');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const version = index.current_version;
const published = JSON.parse(await readFile(resolve(dist, `data/${version}/model.json`), 'utf8'));
// This isolated fixture exercises capability-to-BA projection with HS-016.
// Its production visibility remains unchanged; hidden hotspots stay outside the picker.
published.hotspot_catalog.hotspots.find((item) => item.id === 'HS-016').visible = true;
const applicationCatalog = JSON.parse(
  execFileSync(
    process.env.ATLAS_PYTHON || 'python',
    [
      '-X',
      'utf8',
      '-c',
      "import json; from scripts.structured_io import read; print(json.dumps(read('modeles/backlog/model.yaml')['application_catalog'], ensure_ascii=True))",
    ],
    { cwd: root, encoding: 'utf8', windowsHide: true },
  ),
);
await mkdir(output, { recursive: true });
const base = 'http://atlas.test/';
const browser = await chromium.launch(browserOptions);
const errors = [];

async function openFixture(viewport, withCatalog) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://atlas.test') return route.abort();
    if (url.pathname === '/data/index.json')
      return route.fulfill({ json: { current_version: version, versions: [{ version }] } });
    if (url.pathname.endsWith('/model.json'))
      return route.fulfill({
        json: withCatalog
          ? { ...published, application_catalog: applicationCatalog }
          : { ...published, application_catalog: undefined },
      });
    const path = resolve(dist, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
    if (!path.startsWith(dist + sep)) return route.abort();
    try {
      return route.fulfill({
        body: await readFile(path),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
          }[extname(path)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Missing' });
    }
  });
  await page.goto(`${base}#/map?scope=%40root&version=${version}`);
  await page.locator('.workspace-content').waitFor();
  return page;
}

try {
  const desktop = await openFixture({ width: 1440, height: 900 }, true);
  await desktop.locator('.map-application-picker > button').click();
  await desktop
    .getByRole('dialog', { name: 'Applications sur la carte' })
    .locator('section')
    .filter({ has: desktop.getByRole('heading', { name: 'SI Boardriders', exact: true }) })
    .getByRole('button', { name: 'NewStore' })
    .click();
  await desktop.getByRole('button', { name: 'Applications NewStore' }).waitFor();
  await desktop.waitForFunction(() => location.hash.includes('app=selection-newstore-boardriders'));
  assert.equal(await desktop.locator('.overview-system.application-context').count(), 1);
  await desktop.reload();
  await desktop.getByRole('button', { name: 'Applications NewStore' }).waitFor();
  assert.equal(await desktop.locator('.overview-system.application-context').count(), 1);
  await desktop.getByRole('button', { name: 'SI à faire converger' }).click();
  const systems = desktop.getByRole('navigation', { name: 'SI et produits' });
  await systems.getByRole('heading', { name: 'SI Boardriders' }).waitFor();
  assert.equal(await desktop.locator('.application-detail').count(), 1);
  assert.deepEqual(await systems.locator('.application-nav-group > h3').allTextContents(), [
    'SI Beaumanoir Marques Historiques',
    'SI Boardriders',
    'SI Beaumanoir cible',
  ]);
  const boardriders = systems.locator('.application-nav-group').filter({ hasText: 'SI Boardriders' });
  assert.equal(await boardriders.getByRole('button', { name: 'AllocationRun' }).count(), 0);
  await boardriders.getByRole('button', { name: 'SAP ECC' }).click();
  await desktop.locator('.application-detail').getByRole('heading', { name: 'SAP ECC' }).waitFor();
  assert.ok(
    (await desktop.locator('.application-detail').getByRole('button', { name: 'Voir sur la carte' }).count()) > 0,
  );
  await desktop
    .getByRole('navigation', { name: 'Modules de SAP ECC' })
    .getByRole('button', { name: /AllocationRun/ })
    .click();
  await desktop.locator('.application-component-detail').getByRole('heading', { name: 'AllocationRun' }).waitFor();
  assert.ok((await desktop.evaluate(() => location.hash)).includes('component=sap-allocation-run'));
  await desktop.reload();
  await desktop.locator('.application-component-detail').getByRole('heading', { name: 'AllocationRun' }).waitFor();
  await desktop.waitForFunction(() => {
    const rail = document.querySelector('.application-rail');
    const current = rail?.querySelector('[aria-current="true"]');
    if (!rail || !current) return false;
    const outer = rail.getBoundingClientRect(),
      inner = current.getBoundingClientRect();
    return inner.top >= outer.top && inner.bottom <= outer.bottom && inner.bottom <= innerHeight;
  });
  await desktop.screenshot({ path: resolve(output, 'desktop-si.png'), fullPage: true });

  const historique = systems.locator('.application-nav-group').filter({ hasText: 'SI Beaumanoir Marques Historiques' });
  await historique.getByRole('button', { name: 'Elastic Suite' }).click();
  const detail = desktop.locator('.application-detail');
  await detail.getByAltText('Logo Elastic Suite').waitFor();
  assert.ok(await detail.getByAltText('Logo Elastic Suite').isVisible());
  await detail.getByText('Fiche du produit').click();
  assert.ok(await detail.getByText('Non vérifiée').isVisible());
  await detail.getByText('Fiche du produit').focus();
  await desktop.keyboard.press('Enter');
  assert.equal(await detail.locator('details').getAttribute('open'), null);
  await detail
    .getByRole('navigation', { name: 'Modules de Elastic Suite' })
    .getByRole('button', { name: /B2B Order Entry/ })
    .click();
  await detail.getByRole('heading', { name: 'B2B Order Entry' }).waitFor();
  assert.ok(await detail.getByText('Wholesale Commerce', { exact: false }).isVisible());
  assert.ok(await detail.getByRole('heading', { name: 'Couverture métier dans ce SI' }).isVisible());
  assert.ok((await detail.locator('.application-mapping').count()) > 0);

  await desktop.getByRole('button', { name: 'Produits logiciels du marché' }).click();
  const products = desktop.getByRole('navigation', { name: 'Produits du marché' });
  await products.getByRole('button', { name: 'SoCloz' }).waitFor();
  assert.equal(await products.locator(':scope > ul > li').count(), 11);
  assert.equal(await products.getByRole('button', { name: 'Flow Core System' }).count(), 0);
  await products.getByRole('button', { name: 'Elastic Suite' }).click();
  await detail
    .getByRole('navigation', { name: 'Modules de Elastic Suite' })
    .getByRole('button', { name: /B2B Order Entry/ })
    .click();
  await detail.getByRole('heading', { name: 'Correspondances documentées par SI' }).waitFor();
  assert.ok(await detail.getByRole('heading', { name: 'Périmètre possible de l’offre éditeur' }).isVisible());
  assert.ok((await detail.getByRole('link', { name: 'Source éditeur' }).count()) > 0);
  assert.ok((await detail.locator('.application-mapping').count()) > 0);
  await detail.getByRole('button', { name: 'Voir dans la cartographie métier' }).first().click();
  await desktop.waitForFunction(() => location.hash.includes('mapFocus=ba-wholesale-sales'));
  assert.ok((await desktop.evaluate(() => location.hash)).includes('scope=domain-sales'));
  assert.ok(!(await desktop.evaluate(() => location.hash)).includes('app='));
  await desktop.getByRole('button', { name: 'Produits logiciels du marché' }).click();
  await products.getByRole('button', { name: 'SoCloz' }).waitFor();
  await products.getByRole('button', { name: 'SoCloz' }).click();
  await detail.getByRole('heading', { name: 'SoCloz' }).waitFor();
  assert.ok(await detail.getByText('Logo à documenter').isVisible());
  await desktop.screenshot({ path: resolve(output, 'desktop-produits.png'), fullPage: true });

  await desktop.getByRole('button', { name: 'SI à faire converger' }).click();
  await systems.getByRole('heading', { name: 'SI Boardriders' }).waitFor();
  await boardriders.getByRole('button', { name: 'NewStore' }).click();
  await detail
    .getByRole('navigation', { name: 'Modules de NewStore' })
    .getByRole('button', { name: /Order Routing/ })
    .waitFor();
  const routing = detail
    .getByRole('navigation', { name: 'Modules de NewStore' })
    .getByRole('button', { name: /Order Routing/ });
  assert.ok(await routing.getByText('Activation inconnue').isVisible());
  assert.ok(await routing.getByText('Non utilisé').isVisible());
  assert.equal(await boardriders.getByRole('button', { name: 'Order Routing' }).count(), 0);
  await boardriders.getByRole('button', { name: 'Elastic Suite' }).click();
  await detail.getByRole('button', { name: 'Voir sur la carte' }).first().click();
  await desktop.getByRole('button', { name: 'Applications Elastic Suite' }).waitFor();
  assert.ok((await desktop.locator('.application-related-item').count()) > 0);
  assert.ok((await desktop.locator('.application-context-item').count()) > 0);
  assert.equal(await desktop.locator('.overview-system.application-related').count(), 0);
  assert.equal(
    await desktop
      .locator('.application-related-item')
      .first()
      .evaluate((element) => getComputedStyle(element).outlineStyle),
    'solid',
  );
  assert.equal(
    await desktop
      .locator('.application-context-item')
      .first()
      .evaluate((element) => getComputedStyle(element).outlineStyle),
    'dashed',
  );
  await desktop.screenshot({ path: resolve(output, 'desktop-carte.png'), fullPage: true });
  await desktop.locator('.map-application-picker > button').click();
  await desktop
    .getByRole('dialog', { name: 'Applications sur la carte' })
    .getByRole('button', { name: 'Whiteboard' })
    .click();
  await desktop.getByRole('button', { name: 'Applications Elastic Suite · Whiteboard' }).waitFor();
  assert.equal(await desktop.locator('.application-related-item').count(), 0);
  assert.equal(await desktop.locator('.application-map-note').count(), 0);
  await desktop.locator('.map-application-picker > button').click();
  await desktop
    .getByRole('dialog', { name: 'Applications sur la carte' })
    .getByRole('button', { name: 'Flow Core System' })
    .click();
  await desktop.getByRole('button', { name: 'Applications Flow Core System' }).waitFor();
  await desktop.locator('.application-related-item').filter({ hasText: 'Supply Chain Orchestration' }).waitFor();
  assert.equal(await desktop.locator('.application-related-item').count(), 1);

  await desktop.goto(
    `${base}#/map?version=${version}&node=supply-chain-orchestration&scope=supply-chain-orchestration&mapDepth=2&app=selection-newstore-boardriders`,
  );
  await desktop.getByRole('button', { name: 'Applications NewStore' }).waitFor();
  const projectedArea = desktop.locator('[data-business-area-summary="ba-order-lifecycle-management"]');
  await projectedArea.waitFor();
  assert.ok(await projectedArea.evaluate((element) => element.classList.contains('application-related-item')));
  assert.equal(await desktop.locator('[data-map-item-id="D04.i"]').count(), 0);
  assert.equal(await projectedArea.evaluate((element) => getComputedStyle(element).outlineStyle), 'solid');
  await desktop.locator('.map-hotspot-picker .detail-trigger').click();
  const hotspotFilters = desktop.getByRole('dialog', { name: 'Filtres des points chauds' });
  await hotspotFilters.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
  await hotspotFilters.getByRole('button', { name: 'Fermer les filtres' }).click();
  const hotspotArea = desktop.locator('[data-business-area-summary="ba-service-planning"]');
  await hotspotArea.waitFor();
  const hotspotTitle = published.hotspot_catalog.hotspots.find((item) => item.id === 'HS-016').title;
  await desktop.locator('.map-hotspot-picker .detail-trigger').click();
  await hotspotFilters
    .locator('.hotspot-picker-row')
    .filter({ hasText: hotspotTitle })
    .locator('button')
    .first()
    .click();
  await desktop.waitForFunction(() =>
    document
      .querySelector('[data-business-area-summary="ba-service-planning"]')
      ?.classList.contains('hotspot-related-item'),
  );
  assert.equal(await desktop.locator('[data-map-item-id="D06.e"]').count(), 0);
  await desktop.mouse.move(0, 0);
  assert.ok(await hotspotArea.evaluate((element) => element.classList.contains('hotspot-related-item')));
  await desktop.locator('.map-hotspot-picker .detail-trigger').click();
  await hotspotFilters
    .locator('.hotspot-picker-row')
    .filter({ hasText: hotspotTitle })
    .locator('button')
    .first()
    .click();
  await desktop.waitForFunction(
    () =>
      !document
        .querySelector('[data-business-area-summary="ba-service-planning"]')
        ?.classList.contains('hotspot-related-item'),
  );
  await desktop.locator('.hotspot-map-marker[data-id*="HS-016"]').first().hover();
  assert.ok(await hotspotArea.evaluate((element) => element.classList.contains('hotspot-related-item')));

  const mobile = await openFixture({ width: 390, height: 844 }, true);
  await mobile.getByRole('button', { name: 'Ouvrir le panneau' }).click();
  await mobile.getByRole('button', { name: 'SI à faire converger' }).click();
  const mobileSystems = mobile.getByRole('navigation', { name: 'SI et produits' });
  await mobileSystems.getByRole('heading', { name: 'SI Boardriders' }).waitFor();
  assert.ok(await mobileSystems.isVisible());
  assert.equal(await mobile.locator('.application-detail').isVisible(), false);
  await mobile.screenshot({ path: resolve(output, 'mobile-si.png'), fullPage: true });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `Horizontal viewport overflow: ${overflow}px`);
  await mobileSystems.getByRole('button', { name: 'SAP ECC' }).click();
  await mobile
    .getByRole('navigation', { name: 'Modules de SAP ECC' })
    .getByRole('button', { name: /AllocationRun/ })
    .click();
  await mobile.locator('.application-detail').getByRole('heading', { name: 'AllocationRun' }).waitFor();
  assert.equal(await mobileSystems.isVisible(), false);
  assert.ok(await mobile.locator('.application-detail').isVisible());
  await mobile.waitForFunction(() => {
    const back = document.querySelector('.application-back');
    const box = back?.getBoundingClientRect();
    return Boolean(box && box.top >= 45 && box.top < innerHeight);
  });
  await mobile.screenshot({ path: resolve(output, 'mobile-detail.png'), fullPage: true });
  await mobile.getByRole('button', { name: 'Retour à la liste' }).click();
  await mobileSystems.waitFor({ state: 'visible' });
  assert.equal(await mobile.locator('.application-detail').isVisible(), false);
  await mobile.waitForFunction(() => document.activeElement?.textContent?.includes('Systèmes d’information'));
  await mobile.getByRole('button', { name: 'Ouvrir le panneau' }).click();
  await mobile.getByRole('button', { name: 'Produits logiciels du marché' }).click();
  const mobileProducts = mobile.getByRole('navigation', { name: 'Produits du marché' });
  await mobileProducts.getByRole('button', { name: 'SoCloz' }).waitFor();
  assert.equal(await mobileProducts.getByRole('button', { name: 'Flow Core System' }).count(), 0);
  await mobile.getByRole('button', { name: 'Ouvrir le panneau' }).click();
  await mobile.getByRole('button', { name: 'SI à faire converger' }).click();
  await mobileSystems.getByRole('heading', { name: 'SI Boardriders' }).waitFor();
  await mobileSystems.getByRole('button', { name: 'Elastic Suite' }).first().click();
  await mobile.locator('.application-detail').getByRole('button', { name: 'Voir sur la carte' }).first().click();
  await mobile.locator('.map-application-picker > button').click();
  const componentBounds = await mobile.getByRole('dialog', { name: 'Applications sur la carte' }).boundingBox();
  assert.ok(
    componentBounds && componentBounds.x + componentBounds.width <= 390,
    'The application selector stays in the mobile viewport',
  );
  await mobile.screenshot({ path: resolve(output, 'mobile-carte.png'), fullPage: true });

  const historical = await openFixture({ width: 1280, height: 800 }, false);
  assert.equal(await historical.getByRole('button', { name: 'SI à faire converger' }).count(), 0);
  assert.equal(await historical.getByRole('button', { name: 'Produits logiciels du marché' }).count(), 0);
  assert.equal(await historical.locator('.map-application-picker').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      result: 'ok',
      output,
      checks: ['split-view', 'product', 'deep-link', 'map', 'mobile-drilldown', 'historical'],
    }),
  );
} finally {
  await browser.close();
}
