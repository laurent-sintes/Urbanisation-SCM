/** Read-only candidate acceptance: real backlog contents, isolated from the published catalog. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { candidateFixture } from './candidate-fixture.mjs';

const dist = resolve(import.meta.dirname, 'dist');
const output = resolve(import.meta.dirname, '.runtime/qa-data-sharing');
await mkdir(output, { recursive: true });
const fixture = await candidateFixture(dist);
const exchanges = fixture.raw.relations.filter((relation) => relation.type === 'shares-data');
assert.equal(exchanges.length, 7);
assert.ok(
  !fixture.raw.nodes.some((node) => ['accounting-interpretation', 'ba-accounting-translation'].includes(node.id)),
);
const expected = exchanges.map((relation) => relation.id).sort();
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [];
const cases = [];
const luminance = (color) => {
  const channels = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
const contrast = (first, second) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
let appearance;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === 'data/index.json') return route.fulfill({ json: fixture.index });
    if (relative === `data/${fixture.version}/model.json`)
      return route.fulfill({ body: fixture.bytes, contentType: 'application/json' });
    if (relative === `data/${fixture.version}/guide.json`)
      return route.fulfill({ body: fixture.guideBytes, contentType: 'application/json' });
    const target = resolve(dist, relative);
    assert.ok(target.startsWith(dist + sep));
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
  const visit = async (params = {}) => {
    await page.goto(`${base}#/map?${new URLSearchParams({ version: fixture.version, ...params })}`);
    await page.locator(`#fa-version[data-version="${fixture.version}"]`).waitFor({ state: 'attached' });
  };
  await visit();
  await page.locator('.data-sharing-ribbon').last().waitFor();
  appearance = await page.evaluate(() => {
    const svg = document.querySelector('.system-data-sharing-map');
    return {
      ink: getComputedStyle(svg.querySelector('text')).fill,
      stops: [...svg.querySelectorAll('stop')].map((stop) => getComputedStyle(stop).stopColor),
      outline: getComputedStyle(svg.querySelector('path')).stroke,
      shadowOpacity: Number(getComputedStyle(svg.querySelector('feDropShadow')).floodOpacity),
    };
  });
  appearance.minimumTextContrast = Math.min(...appearance.stops.map((stop) => contrast(appearance.ink, stop)));
  assert.ok(appearance.minimumTextContrast >= 4.5, 'Small arrow labels remain readable on both gradient endpoints');
  assert.ok(
    appearance.stops.every((stop) => luminance(stop) >= 0.65),
    'Arrow surfaces stay light',
  );
  assert.ok(appearance.shadowOpacity > 0 && appearance.shadowOpacity <= 0.15, 'Floating relief remains restrained');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const depth of [0, 1, 2]) {
      for (const hotspots of [true, false]) {
        await visit({ mapDepth: String(depth), hf: JSON.stringify({ enabled: hotspots }) });
        for (const mode of ['Auto', 'Pleine page', 'Pleine largeur']) {
          await page.getByRole('button', { name: mode, exact: true }).click();
          await page.waitForFunction(() => document.querySelectorAll('.system-data-sharing-map > g').length === 6);
          await page.waitForTimeout(60);
          const geometry = await page.evaluate(() => {
            const svg = document.querySelector('.system-data-sharing-map');
            const frame = svg.getBoundingClientRect();
            const cards = [...document.querySelectorAll('.overview-system')].map((card) => ({
              id: card.dataset.nodeId,
              rect: card.getBoundingClientRect().toJSON(),
            }));
            const labels = [...svg.querySelectorAll('text')].map((text) => ({
              label: text.textContent,
              rect: text.getBoundingClientRect().toJSON(),
            }));
            const paths = [...svg.querySelectorAll('.data-sharing-ribbon')].map((path) => ({
              ids: path.closest('[data-sharing-ids]').dataset.sharingIds,
              d: path.getAttribute('d'),
              fill: getComputedStyle(path).fill,
              shadow: path.parentElement.getAttribute('filter'),
              rect: path.getBoundingClientRect().toJSON(),
              source: path.closest('[data-sharing-ids]').dataset.sharingSource,
              target: path.closest('[data-sharing-ids]').dataset.sharingTarget,
            }));
            const contents = [
              ...document.querySelectorAll(
                '.overview-system small, .overview-system h3, .overview-system p, .overview-stats, .overview-hierarchy, .overview-system .hotspot-map-point',
              ),
            ].map((element) => element.getBoundingClientRect());
            const overlaps = (rect, other) =>
              rect.left < other.right - 1 &&
              rect.right > other.left + 1 &&
              rect.top < other.bottom - 1 &&
              rect.bottom > other.top + 1;
            const collisions = labels.filter(({ rect }) => contents.some((content) => overlaps(rect, content)));
            const coveredContents = paths.filter(({ rect }) => contents.some((content) => overlaps(rect, content)));
            const clipped = labels.filter(
              ({ rect }) =>
                rect.left < frame.left - 1 ||
                rect.right > frame.right + 1 ||
                rect.top < frame.top - 1 ||
                rect.bottom > frame.bottom + 1,
            );
            const bars = { horizontal: 0, vertical: 0 };
            for (const element of document.querySelectorAll('.workspace-content, .workspace-content *')) {
              const style = getComputedStyle(element);
              if (['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1)
                bars.horizontal++;
              if (['auto', 'scroll'].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 1)
                bars.vertical++;
            }
            const operations = cards.find((card) => card.id === 'system-business-operations').rect;
            const logistics = cards.find((card) => card.id === 'domain-logistics-execution').rect;
            return {
              paths,
              collisions,
              coveredContents,
              bridgeSystems: paths.every((path) =>
                [path.source, path.target].every((id) =>
                  overlaps(path.rect, cards.find((card) => card.id === id).rect),
                ),
              ),
              clipped,
              bars,
              dockGap: logistics.top - operations.bottom,
              dockLeft: Math.abs(logistics.left - operations.left),
              pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
          assert.deepEqual(geometry.paths.flatMap((path) => path.ids.split('|')).sort(), expected);
          assert.ok(
            geometry.paths.every(
              (path) =>
                path.d.endsWith(' Z') &&
                path.d.includes('Q') &&
                path.fill.startsWith('url(') &&
                path.shadow.startsWith('url('),
            ),
          );
          assert.ok(geometry.bridgeSystems, 'Each floating arrow straddles its source and destination systems');
          assert.deepEqual(geometry.collisions, [], 'Labels leave system content and hotspots readable');
          assert.deepEqual(geometry.coveredContents, [], 'Filled arrows leave system content and hotspots readable');
          assert.deepEqual(geometry.clipped, [], 'Every content label remains within the map');
          assert.ok(geometry.dockGap > 0 && geometry.dockGap <= 25 && geometry.dockLeft < 1);
          assert.ok(!geometry.pageOverflow && geometry.bars.horizontal <= 1 && geometry.bars.vertical <= 1);
          cases.push({ width, depth, hotspots, mode, bars: geometry.bars, dockGap: geometry.dockGap });
        }
      }
    }
  }
  await page.setViewportSize({ width: 1800, height: 1800 });
  await visit({ mapDepth: '1', hf: JSON.stringify({ enabled: false }) });
  await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
  await page.locator('.system-data-sharing-map > g').last().waitFor();
  await page.locator('.urbanisation-overview').screenshot({ path: resolve(output, 'enterprise-architecture.png') });
  await page.screenshot({ path: resolve(output, 'atlas-shell.png') });
  await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await page.getByRole('button', { name: 'Pleine page', exact: true }).click();
  assert.equal(await page.locator('.data-sharing-ribbon').count(), 6);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await page.locator('.system-data-sharing-details summary').click();
  assert.equal(await page.locator('[data-sharing-detail]').count(), 7);
  assert.ok(
    !(await page.locator('[data-node-id="system-enterprise-management-control"] .overview-stats').innerText()).includes(
      'capacité',
    ),
  );
  for (const relation of exchanges) {
    const detail = page.locator(`[data-sharing-detail="${relation.id}"]`);
    assert.ok((await detail.innerText()).includes(relation.fields.label));
    assert.ok((await detail.innerText()).includes(relation.fields.data_exchange.purpose));
  }
  for (const scope of ['system-business-operations', 'domain-logistics-execution', 'supply-chain-orchestration']) {
    await visit({ scope, node: scope, mapDepth: '1' });
    await page.locator('.graph-canvas').waitFor();
    assert.equal(await page.locator('.system-data-sharing-map, .system-data-sharing-details').count(), 0);
    if (scope === 'supply-chain-orchestration') {
      await page.locator('.business-card').first().waitFor();
      await page.screenshot({ path: resolve(output, 'orchestration-focus.png') });
    }
  }
  const published = fixture.index.versions.find(
    (version) => version.version !== fixture.version && version.version === '2026-10-12.6',
  );
  assert.ok(published);
  await page.goto(`${base}#/map?version=${published.version}&mapDepth=1`);
  await page.locator(`#fa-version[data-version="${published.version}"]`).waitFor({ state: 'attached' });
  await page.locator('.overview-system').last().waitFor();
  assert.equal(await page.locator('.system-data-sharing-map, .system-data-sharing-details').count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(output, 'report.json'),
    JSON.stringify(
      { status: 'passed', candidate: fixture.version, appearance, cases, published: published.version, errors },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({ status: 'passed', cases: cases.length, arrows: 6, exchanges: exchanges.length, report: output }),
  );
} catch (error) {
  await browser
    .contexts()[0]
    ?.pages()[0]
    ?.screenshot({ path: resolve(output, 'failure.png') });
  throw error;
} finally {
  await browser.close();
}
