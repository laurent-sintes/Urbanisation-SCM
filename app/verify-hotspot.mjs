/** Reproduce the published C-LOG hotspot on the Business Operations map. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, '.runtime/qa-hotspot');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const preview = process.env.HOTSPOT_PREVIEW === '1';
let previewBody;
let previewSha;
if (preview) {
  const model = JSON.parse(await readFile(path.join(dist, 'data', catalog.current_version, 'model.json'), 'utf8'));
  const hotspot = model.hotspot_catalog.hotspots.find((item) => item.id === 'HS-002');
  hotspot.complexity.political = 'XL';
  hotspot.complexity.implementation = 'L';
  hotspot.severity = 'XL';
  previewBody = Buffer.from(JSON.stringify(model));
  previewSha = createHash('sha256').update(previewBody).digest('hex');
}
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  assert.ok(url.href.startsWith(base));
  const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
  const target = path.resolve(dist, relative);
  assert.ok(target.startsWith(dist + path.sep));
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  try {
    let body = await readFile(target);
    if (preview && relative === 'data/index.json') {
      const index = JSON.parse(body.toString('utf8'));
      index.versions.find((item) => item.version === catalog.current_version).model_sha256 = previewSha;
      body = Buffer.from(JSON.stringify(index));
    }
    if (preview && relative === `data/${catalog.current_version}/model.json`) {
      body = previewBody;
    }
    await route.fulfill({
      status: 200,
      body,
      contentType: types[path.extname(target)] || 'application/octet-stream',
    });
  } catch {
    await route.fulfill({ status: 404, body: 'Not found' });
  }
});
try {
  await page.goto(
    `${base}#/map?version=${catalog.current_version}&node=system-business-operations&scope=system-business-operations`,
  );
  await page.locator('.map-panel').waitFor({ timeout: 20000 });
  const toggle = page.getByRole('checkbox', { name: 'Points chauds' });
  await toggle.waitFor({ timeout: 10000 });
  await toggle.check();
  await page.getByText('1 point chaud sur cette vue').waitFor();
  await page.locator('.hotspot-map-marker').waitFor({ timeout: 10000 });
  await page.waitForTimeout(700);
  const markerCount = await page.locator('.hotspot-map-marker').count();
  const positions = await page.evaluate(() =>
    Object.fromEntries(
      [
        'supply-chain-orchestration',
        'domain-logistics-execution',
        'hotspot:HS-002',
        'group:system-business-operations',
      ].map((id) => {
        const node = document.querySelector(`[data-id="${id}"]`);
        const rect = node?.getBoundingClientRect();
        return [
          id,
          rect
            ? {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                transform: node.style.transform,
              }
            : null,
        ];
      }),
    ),
  );
  const left = positions['supply-chain-orchestration'];
  const right = positions['domain-logistics-execution'];
  const marker = positions['hotspot:HS-002'];
  assert.ok(right.x > left.x && Math.abs(right.y - left.y) < 20, 'The two domains should be visible side by side');
  const expectedX = (left.x + left.width / 2 + right.x + right.width / 2) / 2;
  const expectedY = Math.max(left.y, right.y) + 10;
  assert.ok(Math.abs(marker.x + marker.width / 2 - expectedX) < 20, 'Halo must sit between the domains horizontally');
  assert.ok(Math.abs(marker.y + marker.height / 2 - expectedY) < 20, 'Halo must sit beside the card headers');
  const layer = await page.evaluate(() => {
    const overlay = document.querySelector('.hotspot-map-overlay');
    const marker = document.querySelector('.hotspot-map-marker');
    const rect = marker.getBoundingClientRect();
    return {
      zIndex: Number(getComputedStyle(overlay).zIndex),
      centerHitsMarker: marker.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)),
      haloHitsMarker: marker.contains(
        document.elementFromPoint(rect.x + rect.width / 2 + 65, rect.y + rect.height / 2),
      ),
      centerColor: getComputedStyle(marker).color,
      flameColor: getComputedStyle(marker.querySelector('svg')).color,
      flameFill: getComputedStyle(marker.querySelector('svg')).fill,
      haloSize: getComputedStyle(document.querySelector('.hotspot-map-halo')).width,
    };
  });
  assert.ok(
    layer.zIndex > 0 && layer.centerHitsMarker && !layer.haloHitsMarker,
    'Only the center of the halo must be clickable',
  );
  assert.ok(
    !(await page.locator('.hotspot-map-marker').innerText()).includes('HS-002'),
    'The map center must not display the hotspot code',
  );
  await page.locator('.hotspot-map-marker').hover();
  await page.getByRole('tooltip').getByText('C-LOG — partage des décisions de fulfillment').waitFor();
  if (preview) {
    assert.equal(await page.locator('.hotspot-map-flames svg').count(), 4, 'XL preview needs four flames');
    assert.equal(
      await page
        .locator('.hotspot-map-flames svg')
        .first()
        .evaluate((node) => getComputedStyle(node).animationDuration),
      '0.72s',
    );
  }
  await page.screenshot({ path: path.join(output, 'business-operations.png'), fullPage: true });
  const sticky = await page.evaluate(() => {
    const scroller = document.querySelector('.workspace-content');
    scroller.scrollTop = 320;
    const toolbar = document.querySelector('.map-toolbar').getBoundingClientRect();
    const viewport = scroller.getBoundingClientRect();
    return { scrollTop: scroller.scrollTop, toolbarTop: toolbar.top, viewportTop: viewport.top };
  });
  assert.ok(
    sticky.scrollTop > 0 && Math.abs(sticky.toolbarTop - sticky.viewportTop) < 3,
    'Map toolbar must remain docked while the workspace scrolls',
  );
  assert.ok(await toggle.isVisible(), 'Hotspot control must remain visible while scrolling');
  await page.evaluate(() => {
    document.querySelector('.workspace-content').scrollTop = 0;
  });
  await page.getByRole('button', { name: 'Agrandir' }).click();
  await page.waitForTimeout(300);
  const zoomAlignment = await page.evaluate(() => {
    const center = (id) => {
      const rect = document.querySelector(`[data-id="${id}"]`).getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, top: rect.y };
    };
    const left = center('supply-chain-orchestration');
    const right = center('domain-logistics-execution');
    const marker = center('hotspot:HS-002');
    return { dx: marker.x - (left.x + right.x) / 2, dy: marker.y - Math.max(left.top, right.top) };
  });
  assert.ok(
    Math.abs(zoomAlignment.dx) < 20 && zoomAlignment.dy >= 0 && zoomAlignment.dy < 30,
    'Halo must follow map zoom',
  );
  await page.locator('.hotspot-map-marker').click();
  await page.getByRole('heading', { name: 'C-LOG — partage des décisions de fulfillment' }).waitFor();
  console.log(
    JSON.stringify({
      version: catalog.current_version,
      preview,
      markers: markerCount,
      positions,
      layer,
      zoomAlignment,
      errors,
    }),
  );
  assert.equal(errors.length, 0);
} finally {
  await browser.close();
}
