import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const model = JSON.parse(await readFile(resolve(dist, `data/${catalog.current_version}/model.json`), 'utf8'));
const parent = new Map(
  model.relations
    .filter((relation) => ['contains', 'presents'].includes(relation.type))
    .map((relation) => [relation.target_id, relation.source_id]),
);
const belongs = (node, scope) => !scope || node === scope || (parent.has(node) && belongs(parent.get(node), scope));
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
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const target = resolve(dist, decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html');
    if (!target.startsWith(dist + sep)) return route.abort();
    await route.fulfill({
      body: await readFile(target),
      contentType: mime[extname(target)] || 'application/octet-stream',
    });
  });
  for (const scope of [
    '',
    'system-business-operations',
    'supply-chain-orchestration',
    model.nodes.find((node) => node.kind === 'area' && belongs(node.id, 'supply-chain-orchestration')).id,
    'domain-logistics-execution',
    'system-design-development',
    'domain-finance',
  ]) {
    for (const depth of scope ? [0, 1, 2, 3, 4] : [0, 1, 2]) {
      await page.goto(
        `${base}#/map?version=${catalog.current_version}&mapDepth=${depth}${scope ? `&node=${scope}&scope=${scope}` : ''}`,
      );
      const trigger = page.locator('.map-hotspot-picker .detail-trigger');
      await trigger.click();
      const filter = page.getByRole('dialog', { name: 'Filtres des points chauds' });
      await filter.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
      await filter.getByRole('button', { name: 'Fermer les filtres' }).click();
      let actualScope = new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('scope');
      while (
        actualScope &&
        !['domain', 'business_system'].includes(model.nodes.find((node) => node.id === actualScope)?.kind)
      )
        actualScope = parent.get(actualScope);
      const expected = model.hotspot_catalog.hotspots
        .filter((item) => item.location.node_ids.some((node) => belongs(node, actualScope)))
        .map((item) => item.id)
        .sort();
      for (const width of [1440, 390, 900]) {
        await page.setViewportSize({ width, height: width === 390 ? 667 : 900 });
        await page.waitForTimeout(700);
        const geometry = await page.evaluate(() => {
          const circles = [
            ...document.querySelectorAll('.universe-overview .hotspot-map-marker, .graph-canvas .hotspot-map-marker'),
          ].map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              id: element.dataset.id,
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
              radius: rect.width / 2,
              parent: element.closest('.overview-system, .overview-global-hotspot, .map-flow-surface'),
            };
          });
          const failures = [];
          for (const [index, circle] of circles.entries()) {
            for (const other of circles.slice(index + 1)) {
              if (
                circle.parent === other.parent &&
                Math.hypot(circle.x - other.x, circle.y - other.y) < circle.radius + other.radius + 5.5
              )
                failures.push(`overlap:${circle.id}/${other.id}`);
            }
            const parent = circle.parent.getBoundingClientRect();
            if (
              circle.x - circle.radius < parent.left - 1 ||
              circle.x + circle.radius > parent.right + 1 ||
              circle.y - circle.radius < parent.top - 1 ||
              circle.y + circle.radius > parent.bottom + 1
            )
              failures.push(`clipped:${circle.id}`);
            for (const element of circle.parent.querySelectorAll(
              '.business-card, .container-label, .category-banner, small, h3, p, .overview-stats, .overview-hierarchy',
            )) {
              const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
              while (walker.nextNode()) {
                if (!walker.currentNode.textContent?.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(walker.currentNode);
                for (const rect of range.getClientRects()) {
                  const x = Math.max(rect.left, Math.min(circle.x, rect.right));
                  const y = Math.max(rect.top, Math.min(circle.y, rect.bottom));
                  if (Math.hypot(circle.x - x, circle.y - y) < circle.radius - 0.5)
                    failures.push(`text:${circle.id}/${walker.currentNode.textContent}`);
                }
              }
            }
          }
          return { markers: circles.length, ids: circles.map((circle) => circle.id), failures };
        });
        assert.deepEqual(geometry.failures, [], `${scope || 'overview'}/${depth}/${width}`);
        const represented = [
          ...new Set(geometry.ids.flatMap((id) => id.replace(/^hotspot:(cluster:)?/, '').split('|'))),
        ].sort();
        assert.deepEqual(represented, expected, `${scope}/${depth}/${width}: exact scope survives resize`);
        assert.equal(await page.locator('.hotspot-leader').count(), 0, 'no dotted leaders');
        if (width === 1440 && ((!scope && depth === 2) || (scope === 'supply-chain-orchestration' && depth === 4))) {
          const individuals = page.locator('.hotspot-map-marker[data-id]:not(:has(.hotspot-map-count))');
          for (const marker of await individuals.all()) {
            const id = (await marker.getAttribute('data-id')).slice('hotspot:'.length);
            const hotspot = model.hotspot_catalog.hotspots.find((item) => item.id === id);
            await marker.focus();
            const related = model.nodes
              .filter((node) => hotspot.location.node_ids.some((anchor) => belongs(node.id, anchor)))
              .map((node) => node.id);
            const missing = await page.evaluate(
              (ids) =>
                [
                  ...document.querySelectorAll(
                    '[data-node-id], [data-map-item-id], [data-business-area-summary], [data-business-area]',
                  ),
                ]
                  .filter((element) =>
                    ids.includes(
                      element.dataset.nodeId ||
                        element.dataset.mapItemId ||
                        element.dataset.businessAreaSummary ||
                        element.dataset.businessArea,
                    ),
                  )
                  .filter(
                    (element) =>
                      !element.classList.contains('hotspot-related-item') &&
                      !element.classList.contains('hotspot-related') &&
                      !element.closest('.react-flow__node.hotspot-related'),
                  )
                  .map(
                    (element) =>
                      element.dataset.nodeId ||
                      element.dataset.mapItemId ||
                      element.dataset.businessAreaSummary ||
                      element.dataset.businessArea,
                  ),
              related,
            );
            assert.deepEqual(missing, [], `${scope || 'overview'}/${id}: all visible descendants illuminate`);
            await page.keyboard.press('Escape');
          }
          await trigger.focus();
          assert.equal(
            await page.locator('.hotspot-related, .hotspot-related-item').count(),
            0,
            'illumination clears on blur',
          );
        }
        results.push({ scope: scope || 'overview', depth, width, markers: geometry.markers });
      }
    }
  }
  // Exercise real zoom controls, followed by fitView, with normal animation enabled.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(
    `${base}#/map?version=${catalog.current_version}&scope=system-business-operations&node=system-business-operations&mapDepth=0`,
  );
  await page.getByRole('button', { name: 'Pleine page', exact: true }).click();
  await page.locator('.map-hotspot-picker .detail-trigger').click();
  const filter = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  await filter.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
  const levels = ['S', 'M', 'L', 'XL'];
  for (const choice of [
    'exact:S',
    'exact:M',
    'exact:L',
    'exact:XL',
    'at_least:M',
    'at_least:L',
    'at_most:M',
    'at_most:L',
    'unassessed',
    'all',
  ]) {
    await filter.getByRole('combobox', { name: 'Criticité', exact: true }).selectOption(choice);
    const [mode, level] = choice.includes(':') ? choice.split(':') : ['exact', choice];
    const expected = model.hotspot_catalog.hotspots
      .filter(
        (item) =>
          belongs(item.location.node_ids[0], 'system-business-operations') ||
          item.location.node_ids.some((node) => belongs(node, 'system-business-operations')),
      )
      .filter(
        (item) =>
          choice === 'all' ||
          (mode === 'at_least'
            ? levels.indexOf(item.severity) >= levels.indexOf(level)
            : mode === 'at_most'
              ? levels.includes(item.severity) && levels.indexOf(item.severity) <= levels.indexOf(level)
              : item.severity === level),
      );
    await page.waitForFunction(
      (count) => document.querySelectorAll('.hotspot-filter-list > button').length === count,
      expected.length,
    );
    assert.deepEqual(
      (await filter.locator('.hotspot-filter-list > button strong').allTextContents()).sort(),
      expected.map((item) => item.title).sort(),
    );
  }
  for (const [label, field, values] of [
    ['Type', 'kind', ['scope', 'integration', 'all']],
    ['Statut', 'status', ['discovered', 'shared', 'validated', 'resolved', 'all']],
  ]) {
    for (const value of values) {
      await filter.getByRole('group', { name: label, exact: true }).locator(`button[data-value="${value}"]`).click();
      const expected = model.hotspot_catalog.hotspots.filter(
        (item) =>
          item.location.node_ids.some((node) => belongs(node, 'system-business-operations')) &&
          (value === 'all' || item[field] === value),
      );
      await page.waitForFunction(
        (count) => document.querySelectorAll('.hotspot-filter-list > button').length === count,
        expected.length,
      );
      assert.deepEqual(
        (await filter.locator('.hotspot-filter-list > button strong').allTextContents()).sort(),
        expected.map((item) => item.title).sort(),
      );
    }
  }
  await filter.getByRole('button', { name: 'Fermer les filtres' }).click();
  await page.waitForTimeout(700);
  for (let index = 0; index < 7; index++) {
    if (await page.getByRole('button', { name: 'Agrandir', exact: true }).isDisabled()) break;
    await page.getByRole('button', { name: 'Agrandir', exact: true }).click();
    await page.waitForTimeout(350);
    assert.ok(
      (
        await page
          .locator('.graph-canvas .hotspot-map-marker')
          .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width))
      ).every((diameter) => diameter >= 36 && diameter <= 48),
    );
    assert.equal(await page.locator('.hotspot-leader').count(), 0);
  }
  await page.getByRole('button', { name: 'Centrer la carte', exact: true }).click();
  await page.waitForTimeout(700);
  const fitted = await page
    .locator('.graph-canvas .hotspot-map-marker')
    .evaluateAll((elements) =>
      [
        ...new Set(elements.flatMap((element) => element.dataset.id.replace(/^hotspot:(cluster:)?/, '').split('|'))),
      ].sort(),
    );
  assert.deepEqual(
    fitted,
    model.hotspot_catalog.hotspots
      .filter((item) => item.location.node_ids.some((node) => belongs(node, 'system-business-operations')))
      .map((item) => item.id)
      .sort(),
    'fitView restores every scoped subject, including grouped markers',
  );
  await page.getByRole('button', { name: 'Étendre la carte' }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await page.locator('.map-hotspot-picker .detail-trigger').click();
  await filter.waitFor();
  assert.ok(await filter.evaluate((element) => document.fullscreenElement.contains(element)));
  await page.keyboard.press('Escape');
  assert.equal(await filter.count(), 0);
  if (await page.evaluate(() => Boolean(document.fullscreenElement)))
    await page.getByRole('button', { name: 'Réduire la carte' }).click();
  const historical = catalog.versions.at(-1).version;
  const historicalModel = JSON.parse(await readFile(resolve(dist, `data/${historical}/model.json`), 'utf8'));
  await page.goto(`${base}#/map?version=${historical}`);
  await page.locator('.urbanisation-overview, .graph-canvas').first().waitFor();
  await page.waitForTimeout(700);
  if (!historicalModel.hotspot_catalog?.hotspots?.length)
    assert.equal(
      await page.locator('.hotspot-map-marker').count(),
      0,
      'historical map does not inherit current hotspots',
    );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ cases: results.length, filters: 18, zoom: true, fullscreen: true, historical, results }, null, 2),
  );
} finally {
  await browser.close();
}
