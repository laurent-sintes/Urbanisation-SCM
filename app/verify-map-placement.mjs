/** Verify spatial reading rules and native scrolling against the compiled publication. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, '.runtime/qa-map-placement');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = process.argv.find((arg) => arg.startsWith('--version='))?.slice(10) || catalog.current_version;
const model = JSON.parse(await readFile(path.join(dist, `data/${version}/model.json`), 'utf8'));
const systemId = 'system-business-operations';
const domainId = 'supply-chain-orchestration';
const systems = ['system-design-development', systemId, 'system-enterprise-management-control'];
const logisticsId = 'domain-logistics-execution';
const logisticsSystem = model.nodes.find((node) => node.id === logisticsId)?.kind === 'business_system';
if (logisticsSystem) systems.push(logisticsId);
const domainIds = new Set(model.nodes.filter((node) => node.kind === 'domain').map((node) => node.id));
const domains = ['domain-plan', 'domain-sourcing-procurement', 'domain-sales', domainId].filter((id) =>
  domainIds.has(id),
);
if (!logisticsSystem && domainIds.has(logisticsId)) domains.push(logisticsId);
assert.ok([...systems, ...domains].every((id) => model.nodes.some((node) => node.id === id)));
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [];
let checks = 0;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    const target = path.resolve(dist, relative);
    assert.ok(target.startsWith(dist + path.sep));
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
    }[path.extname(target)];
    await route.fulfill({ body: await readFile(target), contentType: contentType || 'application/octet-stream' });
  });
  const visit = async (params) => {
    await page.goto(`${base}#/map?${new URLSearchParams({ version: model.version, ...params })}`);
    await page.locator(`#fa-version[data-version="${model.version}"]`).waitFor({ state: 'attached' });
  };
  const noPageOverflow = async () => {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  };
  const checkRows = async (overview) => {
    await page.waitForFunction(
      ({ ids, overview, systemId }) => {
        const scope = overview
          ? document.querySelector(`.overview-system[data-node-id="${systemId}"]`)
          : document.querySelector('.graph-canvas');
        const boxes = ids.map((id) => {
          const element = overview
            ? scope?.querySelector(`[data-map-item-id="${id}"]`)?.closest('li')
            : scope?.querySelector(`.business-card[data-node-id="${id}"]`);
          return element?.getBoundingClientRect();
        });
        if (boxes.some((box) => !box?.height)) return false;
        const byId = Object.fromEntries(ids.map((id, index) => [id, boxes[index]]));
        const plan = byId['domain-plan'];
        const sourcing = byId['domain-sourcing-procurement'];
        const sales = byId['domain-sales'];
        const orchestration = byId['supply-chain-orchestration'];
        const logistics = byId['domain-logistics-execution'];
        return (
          (!plan || plan.bottom <= sourcing.top + 1) &&
          Math.abs(sourcing.top - sales.top) < 1 &&
          sourcing.right <= sales.left + 1 &&
          Math.max(sourcing.bottom, sales.bottom) <= orchestration.top + 1 &&
          (!logistics || orchestration.bottom <= logistics.top + 1) &&
          Math.abs((plan || orchestration).left - sourcing.left) < 1 &&
          Math.abs((plan || orchestration).right - sales.right) < 1 &&
          (!logistics || Math.abs(logistics.right - orchestration.right) < 1)
        );
      },
      { ids: domains, overview, systemId },
    );
    checks++;
  };
  for (const width of [320, 1440, 1800]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const depth of [0, 1, 2]) {
      await visit({ mapDepth: String(depth) });
      await page.locator('.urbanisation-overview[data-layout="fixed"]').waitFor();
      const boxes = await page.locator('.overview-system').evaluateAll(
        (items, ids) =>
          ids.map((id) => {
            const item = items.find((element) => element.dataset.nodeId === id);
            const box = item.getBoundingClientRect();
            return { id: item.dataset.nodeId, x: box.left, y: box.top, right: box.right, bottom: box.bottom };
          }),
        systems,
      );
      assert.deepEqual(
        boxes.map((box) => box.id),
        systems,
      );
      assert.ok(boxes[0].right < boxes[1].x && boxes[1].right < boxes[2].x);
      assert.ok(boxes.slice(0, 3).every((box) => Math.abs(box.y - boxes[0].y) < 1));
      if (logisticsSystem) {
        assert.ok(boxes[3].y > boxes[1].bottom);
        assert.ok(boxes[3].y - boxes[1].bottom < 150, 'Logistics is docked to Business Operations');
        assert.ok(Math.abs(boxes[3].x - boxes[1].x) < 1);
        assert.ok(Math.abs(boxes[3].right - boxes[1].right) < 1);
      }
      if (depth > 0) await checkRows(true);
      await noPageOverflow();
      if (width === 320) {
        const scroll = page.locator('.overview-map-scroll');
        assert.ok(await scroll.evaluate((element) => element.scrollWidth > element.clientWidth));
        await scroll.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
        });
        assert.ok(await scroll.evaluate((element) => element.scrollLeft > 0));
      }
      checks++;
    }
  }
  await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await checkRows(true);
  await page.locator('.universe-overview').screenshot({ path: path.join(output, 'overview.png') });
  await page.evaluate(() => document.exitFullscreen());
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const depth of [0, 1, 2, 3, 4]) {
      await visit({ node: systemId, scope: systemId, mapDepth: String(depth) });
      for (const mode of ['Auto', 'Pleine page', 'Pleine largeur']) {
        await page.getByRole('button', { name: mode, exact: true }).click();
        await checkRows(false);
        await noPageOverflow();
        if (width === 320) {
          const canvas = page.locator('.map-scroll-viewport:has(.graph-canvas.fixed-placement.zoom-width)');
          await canvas.waitFor();
          assert.ok(await canvas.evaluate((element) => element.scrollWidth > element.clientWidth));
          await page.waitForFunction(() => {
            const viewport = document.querySelector('.react-flow__viewport');
            return viewport && Math.abs(new DOMMatrix(getComputedStyle(viewport).transform).a - 1) < 0.01;
          });
          await canvas.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
          assert.ok(await canvas.evaluate((element) => element.scrollLeft > 0));
        }
      }
    }
  }
  const logisticsScope = logisticsSystem ? logisticsId : systemId;
  await visit({ node: logisticsScope, scope: logisticsScope, mapDepth: '0' });
  if (logisticsSystem) {
    await page.locator('.business-card[data-node-id="domain-warehousing"]').waitFor();
    await page.locator('.business-card[data-node-id="domain-transportation"]').waitFor();
    assert.equal(await page.locator('.business-card[data-node-id="supply-chain-orchestration"]').count(), 0);
  } else {
    await page.locator('.business-card[data-node-id="domain-logistics-execution"]').scrollIntoViewIfNeeded();
    const logisticsBox = await page.locator('.business-card[data-node-id="domain-logistics-execution"]').boundingBox();
    assert.ok(logisticsBox && logisticsBox.y >= 0 && logisticsBox.y + logisticsBox.height <= 1000);
  }
  checks++;
  // Give the complete four-row map enough height for an uncropped review capture.
  await page.setViewportSize({ width: 1440, height: 1800 });
  await visit({ node: systemId, scope: systemId, mapDepth: '0' });
  await checkRows(false);
  await page.locator('.graph-canvas').screenshot({ path: path.join(output, 'operations.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await checkRows(false);
  assert.ok(
    await page.locator('.map-scroll-viewport').evaluate((element) => element.scrollWidth > element.clientWidth),
  );
  await page.evaluate(() => document.exitFullscreen());
  await page.setViewportSize({ width: 840, height: 420 });
  await visit({ node: systemId, scope: systemId, mapDepth: '0' });
  await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  const shortScreenTitle = page.locator('.map-toolbar > div:first-child > strong');
  assert.equal(await shortScreenTitle.innerText(), 'Business Operations');
  assert.equal(await shortScreenTitle.isVisible(), true);
  await page.evaluate(() => document.exitFullscreen());
  const columns = [];
  for (const width of [768, 1800]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit({ node: domainId, scope: domainId, mapDepth: '1' });
    await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
    await page.locator('.graph-canvas:not(.fixed-placement) .business-card').first().waitFor();
    await page.waitForTimeout(250);
    columns.push(
      await page
        .locator('.business-card')
        .evaluateAll((cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().left))).size),
    );
    await noPageOverflow();
  }
  assert.ok(columns[1] > columns[0], `Domain focus redistributes its cards: ${columns}`);
  checks++;
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ status: 'passed', version: model.version, checks, domainColumns: columns, screenshots: output }),
  );
} finally {
  await browser.close();
}
