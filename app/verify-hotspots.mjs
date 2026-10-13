// Check actual hit targets, clipping, grouping and keyboard use against the built publication.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { hotspotImpactScopes } from './src/hotspotFraming.ts';
import { hotspotsInScope } from './src/hotspotMap.ts';
import { adaptPublication } from './src/model.ts';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const output = resolve(import.meta.dirname, '.runtime/qa-hotspots');
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const model = JSON.parse(await readFile(resolve(dist, `data/${catalog.current_version}/model.json`), 'utf8'));
const hotspots = model.hotspot_catalog.hotspots;
const base = 'https://atlas.test/Urbanisation-SCM/';
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};
const browser = await chromium.launch(browserOptions);
const results = [];
await mkdir(output, { recursive: true });
let deploymentChecked = false;
try {
  for (const width of [1440, 900, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (!url.href.startsWith(base)) return route.abort();
      const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
      const target = resolve(dist, relative);
      if (!target.startsWith(dist + sep)) return route.abort();
      await route.fulfill({
        body: await readFile(target),
        contentType: mime[extname(target)] || 'application/octet-stream',
      });
    });
    for (const view of ['overview', 'system']) {
      const hash = `#/map?version=${catalog.current_version}&mapDepth=1${view === 'system' ? '&node=system-business-operations&scope=system-business-operations' : ''}`;
      await page.goto(`${base}${hash}`);
      const trigger = page.locator('.map-hotspot-picker .detail-trigger');
      await trigger.click();
      const filter = page.getByRole('dialog', { name: 'Filtres des points chauds' });
      await filter.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
      await filter.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).uncheck();
      await filter.getByRole('checkbox', { name: 'Hotspots transition', exact: true }).uncheck();
      await filter.getByRole('checkbox', { name: 'Impact à qualifier', exact: true }).uncheck();
      const scopedHotspots =
        view === 'overview' ? hotspots : hotspotsInScope(adaptPublication(model), 'system-business-operations');
      const usageTitles = scopedHotspots
        .filter((item) => item.visible !== false && hotspotImpactScopes(item).includes('usage'))
        .map((item) => item.title);
      assert.deepEqual(
        await filter.locator('.hotspot-filter-list > button:not(.hotspot-is-hidden) strong').allTextContents(),
        usageTitles,
        'Map picker follows usage filter',
      );
      await filter.getByRole('checkbox', { name: 'Hotspots usage', exact: true }).uncheck();
      await page.waitForFunction(
        () => !document.querySelector('.overview-system .hotspot-map-marker, .graph-canvas .hotspot-map-marker'),
      );
      await filter.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).check();
      await filter.getByRole('checkbox', { name: 'Hotspots transition', exact: true }).check();
      await filter.getByRole('checkbox', { name: 'Hotspots usage', exact: true }).check();
      await filter.getByRole('checkbox', { name: 'Impact à qualifier', exact: true }).check();
      await filter.getByRole('combobox', { name: 'Criticité', exact: true }).selectOption('exact:S');
      await page.waitForFunction(
        () => !document.querySelector('.overview-system .hotspot-map-marker, .graph-canvas .hotspot-map-marker'),
      );
      await filter.getByRole('combobox', { name: 'Criticité', exact: true }).selectOption('all');
      await filter.getByRole('checkbox', { name: 'Afficher les points chauds' }).uncheck();
      await page.waitForFunction(
        () => !document.querySelector('.overview-system .hotspot-map-marker, .graph-canvas .hotspot-map-marker'),
      );
      await filter.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
      await assertWithinViewport(filter, page);
      await filter.getByRole('button', { name: 'Fermer les filtres' }).click();
      assert.equal(await filter.count(), 0, 'mouse closes filters without header interception');
      await trigger.click();
      await page.keyboard.press('Escape');
      assert.equal(await filter.count(), 0);
      assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
      const markerSelector =
        view === 'overview' ? '.universe-overview .hotspot-map-marker' : '.graph-canvas .hotspot-map-marker';
      const markers = page.locator(markerSelector);
      await markers.first().waitFor();
      await page.waitForTimeout(500);
      const geometry = await page.evaluate((selector) => {
        const markers = [...document.querySelectorAll(selector)];
        const circles = markers.map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            id: element.getAttribute('data-id'),
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
            diameter: rect.width,
            parent: element.closest(
              '.overview-system, .overview-exchange-hotspots, .overview-global-hotspot, .map-flow-surface',
            ),
          };
        });
        let overlaps = 0,
          textCollisions = 0,
          interceptedTargets = 0;
        const collisions = [];
        const interceptions = [];
        for (let i = 0; i < circles.length; i++)
          for (let j = i + 1; j < circles.length; j++) {
            const a = circles[i],
              b = circles[j];
            if (a.parent === b.parent && Math.hypot(a.x - b.x, a.y - b.y) < (a.diameter + b.diameter) / 2 + 5.5)
              overlaps++;
          }
        for (const circle of circles) {
          const headerBottom = document.querySelector('.topbar').getBoundingClientRect().bottom;
          let insideScrollports = true;
          for (let ancestor = circle.parent; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            const box = ancestor.getBoundingClientRect();
            if (
              style.overflowX !== 'visible' &&
              (circle.x < box.left + ancestor.clientLeft ||
                circle.x > box.left + ancestor.clientLeft + ancestor.clientWidth)
            )
              insideScrollports = false;
            if (
              style.overflowY !== 'visible' &&
              (circle.y < box.top + ancestor.clientTop ||
                circle.y > box.top + ancestor.clientTop + ancestor.clientHeight)
            )
              insideScrollports = false;
          }
          if (
            insideScrollports &&
            circle.y > headerBottom &&
            circle.y < innerHeight &&
            circle.x > 0 &&
            circle.x < innerWidth
          ) {
            const hit = document.elementFromPoint(circle.x, circle.y)?.closest('.hotspot-map-marker');
            if (hit?.getAttribute('data-id') !== circle.id) {
              interceptedTargets++;
              const blocker = document.elementFromPoint(circle.x, circle.y);
              interceptions.push({
                id: circle.id,
                x: circle.x,
                y: circle.y,
                blocker: blocker?.className,
                text: blocker?.textContent?.slice(0, 100),
              });
            }
          }
          const regions = circle.parent.querySelectorAll(
            '.business-card, .container-label, .category-banner, small, h3, p, .overview-stats, .overview-hierarchy, .overview-global-hotspot > button',
          );
          for (const element of regions) {
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              if (!walker.currentNode.textContent?.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              for (const rect of range.getClientRects()) {
                const nearestX = Math.max(rect.left, Math.min(circle.x, rect.right));
                const nearestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
                if (Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.diameter / 2 - 0.5) {
                  textCollisions++;
                  collisions.push({
                    id: circle.id,
                    text: walker.currentNode.textContent,
                    x: circle.x,
                    y: circle.y,
                    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                  });
                }
              }
            }
          }
        }
        return {
          overlaps,
          textCollisions,
          interceptedTargets,
          collisions,
          interceptions,
          diameters: circles.map((circle) => circle.diameter),
          ids: circles.map((circle) => circle.id),
        };
      }, markerSelector);
      if (geometry.interceptedTargets || geometry.textCollisions || geometry.overlaps) {
        await page.screenshot({ path: resolve(output, `failure-${width}-${view}.png`) });
        console.error(JSON.stringify({ width, view, ...geometry }));
      }
      assert.equal(geometry.overlaps, 0, `${width}/${view}: marker clearance`);
      assert.equal(geometry.interceptedTargets, 0, `${width}/${view}: every visible center is clickable`);
      assert.equal(
        geometry.textCollisions,
        0,
        `${width}/${view}: protected text remains readable ${JSON.stringify(geometry.collisions)}`,
      );
      assert.ok(
        geometry.diameters.every((diameter) => diameter >= 36),
        'hit targets stay readable at every zoom',
      );
      const represented = new Set(geometry.ids.flatMap((id) => id.replace(/^hotspot:(cluster:)?/, '').split('|')));
      const expectedIds = (
        view === 'overview' ? hotspots : hotspotsInScope(adaptPublication(model), 'system-business-operations')
      )
        .filter((item) => item.visible !== false)
        .map((item) => item.id);
      assert.deepEqual(
        [...represented].sort(),
        expectedIds.sort(),
        `${width}/${view}: every subject in this scope remains visible`,
      );
      // A center outside a native scrollport is hidden until scrolled into view, not intercepted.
      // Check the rightmost/lower markers through the actual pointer journey as well.
      for (const marker of [markers.first(), markers.last()]) {
        await marker.hover();
        await page.keyboard.press('Escape');
        await page.mouse.move(0, 0);
      }
      const individual = page.locator(`${markerSelector}:not(:has(.hotspot-map-count))`).first();
      await individual.hover();
      assert.equal(await page.locator('.hotspot-map-tooltip').count(), 0, 'pastille hover only highlights coverage');
      const info = individual.locator('xpath=..').locator('.hotspot-info-button');
      const iconPlacement = await info.evaluate((button) => {
        const icon = button.getBoundingClientRect();
        const marker = button.parentElement.querySelector('.hotspot-map-marker').getBoundingClientRect();
        return {
          distance: Math.hypot(
            icon.x + icon.width / 2 - (marker.x + marker.width / 2),
            icon.y + icon.height / 2 - (marker.y + marker.height / 2),
          ),
          radius: marker.width / 2,
        };
      });
      assert.ok(iconPlacement.distance <= iconPlacement.radius + 6, 'information icon stays on the hotspot edge');
      await info.hover();
      const tooltip = page
        .getByRole('tooltip')
        .filter({ has: page.locator('strong') })
        .last();
      await tooltip.waitFor();
      await assertWithinViewport(tooltip, page);
      assert.equal(await tooltip.evaluate((element) => getComputedStyle(element).fontSize), '13px');
      await tooltip.hover();
      assert.equal(await tooltip.isVisible(), true, 'tooltip remains open when hovered');
      await info.click();
      await page.mouse.move(0, 0);
      assert.equal(await tooltip.isVisible(), true, 'click pins the tooltip');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.hotspot-map-tooltip').count(), 0);
      await page.mouse.move(0, 0);
      await trigger.focus();
      await individual.focus();
      assert.equal(await page.locator('.hotspot-map-tooltip').count(), 0, 'pastille focus only highlights coverage');
      await info.focus();
      await page.getByRole('tooltip').last().waitFor();
      await page.keyboard.press('Escape');
      await individual.click();
      await page.locator('.hotspot-detail').waitFor();
      if (width === 1440 && view === 'overview') {
        await page.getByRole('button', { name: /Tous les points chauds/ }).click();
        const summary = page.getByRole('button', { name: /^Criticité et complexités de / }).first();
        await summary.focus();
        const catalogTip = page.locator('.hotspot-map-tooltip');
        await catalogTip.waitFor();
        await assertWithinViewport(catalogTip, page);
        await page.keyboard.press('Escape');
        assert.equal(await catalogTip.count(), 0);
      }
      await page.getByRole('link', { name: /^Retour à la carte/ }).click();
      const restored = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
      const original = new URLSearchParams(hash.split('?')[1]);
      for (const [key, value] of original) assert.equal(restored.get(key), value);
      await markers.first().waitFor();
      const cluster = page.locator(`${markerSelector}:has(.hotspot-map-count)`).first();
      if (await cluster.count()) {
        await cluster.click();
        const expanded = page.getByRole('dialog', { name: /points chauds regroupés/ });
        await expanded.waitFor();
        await assertWithinViewport(expanded.locator('header'), page);
        for (const item of await expanded.locator('.hotspot-expanded-item').all())
          await assertWithinViewport(item, page);
        assert.equal(await expanded.locator('.hotspot-expanded-title').count(), 0, 'only pastilles are deployed');
        assert.equal(
          await expanded
            .locator('.hotspot-expanded-item')
            .first()
            .evaluate((button) => button.getAnimations().length),
          0,
        );
        await page.screenshot({ path: resolve(output, `${width}-${view}-cluster.png`) });
        assert.ok((await expanded.locator('.hotspot-expanded-item').count()) > 1);
        assert.equal(await expanded.getAttribute('aria-modal'), 'true');
        const clusterGeometry = await expanded.locator('.hotspot-expanded-item').evaluateAll((buttons) =>
          buttons.map((button) => {
            const marker = button.querySelector('.hotspot-map-marker').getBoundingClientRect();
            const ring = button.querySelector('.hotspot-resolution-ring').getBoundingClientRect();
            return {
              marker: marker.width,
              ring: ring.width,
              halo: getComputedStyle(button.querySelector('.hotspot-map-marker')).boxShadow,
            };
          }),
        );
        assert.ok(clusterGeometry.every(({ marker, ring }) => marker >= 36 && marker <= 48 && ring <= marker));
        assert.ok(
          clusterGeometry.every(({ halo }) => halo.includes('rgb(252, 253, 253)')),
          'the light outline separates every severity from the dark backdrop',
        );
        await expanded.locator('.hotspot-expanded-item').first().focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(
          await expanded
            .locator('.hotspot-expanded-item')
            .nth(1)
            .evaluate((button) => button === document.activeElement),
          true,
        );
        await page.keyboard.press('End');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.waitForFunction(() =>
          document.querySelector('.hotspot-cluster-popover')?.contains(document.activeElement),
        );
        assert.equal(
          await expanded.evaluate((dialog) => dialog.contains(document.activeElement)),
          true,
          'focus stays in the group',
        );
        await page.keyboard.press('Escape');
        await expanded.waitFor({ state: 'detached' });
        assert.equal(await expanded.count(), 0);
        assert.equal(await cluster.evaluate((button) => button === document.activeElement), true);
        await cluster.click();
        await page.mouse.click(2, 2);
        await expanded.waitFor({ state: 'detached' });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await cluster.click();
        assert.ok(
          await expanded
            .locator('.hotspot-expanded-item')
            .first()
            .evaluate((button) => button.getAnimations().length > 0),
        );
        await page.keyboard.press('Escape');
        await expanded.waitFor({ state: 'detached' });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.getByRole('button', { name: 'Étendre la carte' }).click();
        await page.waitForFunction(() => Boolean(document.fullscreenElement));
        await cluster.click();
        assert.equal(await expanded.evaluate((dialog) => document.fullscreenElement.contains(dialog)), true);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Réduire la carte' }).click();
        await page.waitForFunction(() => !document.fullscreenElement);
        await cluster.click();
        await expanded.locator('.hotspot-expanded-item').first().click();
        await page.locator('.hotspot-detail').waitFor();
        await page.getByRole('link', { name: /^Retour à la carte/ }).click();
        deploymentChecked = true;
      }
      await page.mouse.move(0, 0);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await page.screenshot({ path: resolve(output, `${width}-${view}.png`) });
      if (width === 1440 && view === 'overview') {
        await page.getByRole('button', { name: 'Étendre la carte' }).click();
        await page.waitForFunction(() => Boolean(document.fullscreenElement));
        await trigger.click();
        await filter.waitFor();
        assert.equal(await filter.evaluate((element) => document.fullscreenElement.contains(element)), true);
        await filter.getByRole('button', { name: 'Fermer les filtres' }).click();
        await page.getByRole('button', { name: 'Réduire la carte' }).click();
      }
      results.push({
        width,
        view,
        markers: geometry.ids.length,
        overlaps: geometry.overlaps,
        textCollisions: geometry.textCollisions,
      });
      assert.deepEqual(errors, []);
    }
    await page.close();
  }
  // The isolated cluster fixture covers deployment when the current publication has no visible group.
  console.log(JSON.stringify({ results, deploymentChecked, screenshots: output }, null, 2));
} finally {
  await browser.close();
}

async function assertWithinViewport(locator, page) {
  const rect = await locator.boundingBox();
  const header = await page.locator('.topbar').boundingBox();
  const viewport = page.viewportSize();
  assert.ok(rect.x >= 11 && rect.x + rect.width <= viewport.width - 11, 'popup stays inside horizontal viewport');
  assert.ok(
    rect.y >= Math.max(0, header.y + header.height) + 7 && rect.y + rect.height <= viewport.height - 10,
    'popup stays below header and above bottom edge',
  );
}
