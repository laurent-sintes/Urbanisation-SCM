/** Catalogue framing, native overflow and overlay controls across the published hierarchy. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { catalogueTextIntegrity, waitForCatalogueGeometry } from './catalogue-geometry.mjs';
import { mapRouteForNode } from './src/mapNavigation.ts';
import { mapDepthLimit } from './src/mapProjection.ts';
import { adaptPublication, childrenOf } from './src/model.ts';

const dist = resolve(import.meta.dirname, 'dist');
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const model = adaptPublication(
  JSON.parse(await readFile(resolve(dist, `data/${catalog.current_version}/model.json`), 'utf8')),
);
const quick = process.argv.includes('--quick');
const navigationOnly = process.argv.includes('--navigation-only');
const widthMode = process.argv.includes('--width');
const ci = process.argv.includes('--ci');
const only = process.argv.filter((arg) => arg.startsWith('--only=')).map((arg) => arg.slice(7));
const shard = Number(process.argv.find((arg) => arg.startsWith('--shard='))?.slice(8) ?? -1);
const shards = Number(process.argv.find((arg) => arg.startsWith('--shards='))?.slice(9) ?? 2);
const output = resolve(
  import.meta.dirname,
  '.runtime/qa-catalogue-page',
  widthMode ? 'width' : navigationOnly ? 'navigation' : 'framing',
  only.length ? 'targeted' : quick ? 'quick' : shard < 0 ? 'all' : `shard-${shard}`,
);
await mkdir(output, { recursive: true });
const behavior = model.nodes.find((node) => node.kind === 'behavior');
const parent = (id) =>
  model.relations.find((edge) => ['contains', 'presents'].includes(edge.type) && edge.targetId === id)?.sourceId;
const capability = parent(behavior?.id);
const area = parent(capability);
const terminal = model.nodes.find((node) => node.kind === 'business_area' && !childrenOf(model, node.id).length);
const referenceScopes = [
  undefined,
  'system-business-operations',
  'supply-chain-orchestration',
  'domain-plan',
  area,
  capability,
  behavior?.id,
  terminal?.id,
].filter((id, index, all) => all.indexOf(id) === index);
const scopes = [
  ...referenceScopes,
  ...(widthMode
    ? model.nodes.filter((node) => ['business_system', 'domain'].includes(node.kind)).map((node) => node.id)
    : []),
].filter((id, index, all) => all.indexOf(id) === index);
const screens = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'short', width: 1440, height: 650 },
  { name: 'mobile', width: 390, height: 667 },
  { name: 'landscape', width: 844, height: 390 },
  ...(widthMode
    ? [
        { name: 'medium', width: 1280, height: 800 },
        { name: 'compact', width: 1100, height: 800 },
      ]
    : []),
];
const layers = [
  { name: 'none', application: false, hotspots: false },
  { name: 'applications', application: true, hotspots: false },
  { name: 'hotspots', application: false, hotspots: true },
  { name: 'both', application: true, hotspots: true },
];
const product =
  model.raw.application_catalog.products.find((item) => item.id === 'product-akolade') ||
  model.raw.application_catalog.products.find((item) => item.kind === 'vendor_product');
const views = scopes.flatMap((scope) => {
  const node = scope && model.nodeById.get(scope);
  if (node && !['business_system', 'domain'].includes(node.kind)) {
    const route = mapRouteForNode(model, scope);
    return [{ scope: route.scope, node: scope, depth: route.mapDepth, focus: route.mapFocus }];
  }
  return Array.from({ length: scope ? mapDepthLimit(model, scope) + 1 : 3 }, (_, depth) => ({
    scope,
    node: scope,
    depth,
  }));
});
const cases = views.flatMap((view) => screens.flatMap((screen) => layers.map((layer) => ({ ...view, screen, layer }))));
const eligible = cases.filter(
  (item) =>
    (!ci ||
      (item.screen.name === 'desktop' &&
        (item.layer.name === 'both' || (item.depth === 0 && item.layer.name !== 'both'))) ||
      (['mobile', 'landscape'].includes(item.screen.name) &&
        referenceScopes.includes(item.scope) &&
        item.layer.name === 'both')) &&
    (!only.length || only.includes(`${item.scope || '@root'}:${item.depth}:${item.screen.name}:${item.layer.name}`)) &&
    (!widthMode ||
      referenceScopes.includes(item.scope) ||
      (item.screen.name === 'desktop' && item.layer.name === 'both')) &&
    (navigationOnly
      ? item.focus
      : quick
        ? item.screen.name === 'short' && item.depth === 0 && item.layer.hotspots
        : true),
);
const selected = eligible.filter((_, index) => shard < 0 || index % shards === shard);
assert.ok(selected.length, 'The framing recipe must execute at least one case');
const report = { version: model.version, cases: [], errors: [] };
const browser = await chromium.launch(browserOptions);
const base = 'https://atlas.test/';
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.setDefaultTimeout(12000);
  page.on('pageerror', (error) => report.errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const target = resolve(dist, decodeURIComponent(url.pathname.slice(1)) || 'index.html');
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
  for (const [index, item] of selected.entries()) {
    await page.setViewportSize(item.screen);
    await page.goto(
      `${base}#/map?${new URLSearchParams({ version: model.version, scope: item.scope || '@root', node: item.node || model.nodes.find((node) => node.kind === 'universe').id, mapDepth: String(item.depth), mapFocus: item.focus || '', hf: JSON.stringify({ enabled: item.layer.hotspots }), app: item.layer.application ? product.id : '' })}`,
    );
    await page.locator('.business-card,.overview-system,.graph-canvas.empty-state h2').first().waitFor();
    await page.getByRole('button', { name: widthMode ? 'Pleine largeur' : 'Pleine page', exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const capture = () =>
      page.evaluate(() => {
        const viewport = document.querySelector('.map-scroll-viewport,.overview-map-scroll');
        const canvas = viewport.querySelector('.graph-canvas,.overview-map-frame');
        const surface = canvas.querySelector('.map-flow-surface,.urbanisation-overview');
        const origin =
          viewport.querySelector('.business-card,.overview-system')?.getBoundingClientRect() ||
          canvas.getBoundingClientRect();
        const rect = (element) => element.getBoundingClientRect().toJSON();
        const cards = [...viewport.querySelectorAll('.business-card,.overview-system')].map(rect);
        const markers = [...viewport.querySelectorAll('.hotspot-map-marker')]
          .filter((element) => element.getBoundingClientRect().width)
          .map(rect);
        let nativeRange;
        {
          const left = viewport.scrollLeft,
            top = viewport.scrollTop;
          viewport.scrollLeft = 1e6;
          viewport.scrollTop = 1e6;
          nativeRange = { x: viewport.scrollLeft, y: viewport.scrollTop };
          viewport.scrollLeft = left;
          viewport.scrollTop = top;
        }
        return {
          nativeRange,
          scale: Number(
            canvas.querySelector('.react-flow__viewport')?.style.transform.match(/scale\(([^)]+)\)/)?.[1] ||
              (canvas.querySelector('.urbanisation-overview') &&
                new DOMMatrix(getComputedStyle(canvas.querySelector('.urbanisation-overview')).transform).a) ||
              1,
          ),
          surfaceWidth: surface?.getBoundingClientRect().width || canvas.clientWidth,
          overflowingCards: [
            ...viewport.querySelectorAll(
              '.business-card,.overview-system > h3,.overview-definition,.overview-purpose,.overview-stats,.overview-hierarchy,.overview-hierarchy li',
            ),
          ]
            .filter((element) => element.scrollWidth > element.clientWidth + 2)
            .map((element) => ({
              id: element.dataset.nodeId || element.dataset.mapItemId,
              excess: element.scrollWidth - element.clientWidth,
            })),
          minimumWidth: canvas.matches('.overview-map-frame')
            ? Number.parseFloat(getComputedStyle(surface).minWidth) || 0
            : canvas.classList.contains('fixed-placement')
              ? 692
              : surface
                ? 364
                : 0,
          geometry: [...viewport.querySelectorAll('.business-card,.overview-system')].map((element) => {
            const box = element.getBoundingClientRect();
            return {
              id: element.dataset.nodeId,
              x: box.left - origin.left,
              y: box.top - origin.top,
              width: box.width,
              height: box.height,
            };
          }),
          className: canvas.className,
          viewport: rect(viewport),
          canvas: rect(canvas),
          width: viewport.clientWidth,
          height: viewport.clientHeight,
          scrollWidth: viewport.scrollWidth,
          scrollHeight: viewport.scrollHeight,
          cards,
          markers,
          overflowX: getComputedStyle(viewport).overflowX,
          overflowY: getComputedStyle(viewport).overflowY,
          navigator: document.querySelector('.catalogue-navigator')?.className,
        };
      });
    const verify = async (variant, mode = widthMode ? 'width' : 'page', baseline) => {
      await waitForCatalogueGeometry(page);
      // Framing follows card measurement and React Flow initialization; wait for the
      // observable result rather than assuming the next timer has already fired.
      await page
        .waitForFunction((mode) => {
          const viewport = document.querySelector('.map-scroll-viewport,.overview-map-scroll');
          const canvas = viewport.querySelector('.graph-canvas,.overview-map-frame');
          const flow = canvas.querySelector('.react-flow__viewport');
          if (mode === 'width')
            return (
              (!flow || canvas.classList.contains('zoom-width')) &&
              viewport.scrollWidth <= viewport.clientWidth + 1 &&
              [...viewport.querySelectorAll('.business-card,.overview-system')].every((element) => {
                const box = element.getBoundingClientRect();
                const frame = viewport.getBoundingClientRect();
                return box.left >= frame.left - 1 && box.right <= frame.left + viewport.clientWidth + 1;
              })
            );
          const frame = viewport.getBoundingClientRect();
          return (
            viewport.scrollWidth <= viewport.clientWidth + 1 &&
            viewport.scrollHeight <= viewport.clientHeight + 1 &&
            [...viewport.querySelectorAll('.business-card,.overview-system')].every((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.left >= frame.left - 1 &&
                box.right <= frame.right + 1 &&
                box.top >= frame.top - 1 &&
                box.bottom <= frame.bottom + 1
              );
            })
          );
        }, mode)
        .catch(() => {});
      const state = await capture();
      const integrity = await page.evaluate(catalogueTextIntegrity);
      const failures = [];
      if (integrity.collisions.length) failures.push(`hotspots cover text: ${JSON.stringify(integrity.collisions)}`);
      if (mode === 'width') {
        if (integrity.unreadable.length) failures.push(`unreadable titles: ${integrity.unreadable.join(', ')}`);
        if (state.scale <= 0 || state.scale > 1.001) failures.push('invalid width fit scale');
        if (state.width >= state.minimumWidth && Math.abs(state.scale - 1) > 0.001)
          failures.push('width mode reduces text despite sufficient space');
        if (state.overflowingCards.length) failures.push('content overflows its card');
        if (state.nativeRange.x || state.surfaceWidth > state.width + 1 || state.scrollWidth > state.width + 1)
          failures.push('horizontal scrolling in width mode');
        if (
          state.cards.some(
            (rect) => rect.left < state.viewport.left - 1 || rect.right > state.viewport.left + state.width + 1,
          )
        )
          failures.push('card outside visible width');
        if (Math.abs(state.canvas.width - state.width) > 1 && !state.className.includes('overview-map-frame'))
          failures.push('canvas uses a different viewport width');
        if (
          baseline &&
          (Math.abs(state.width - baseline.width) > 1 ||
            state.geometry.some((box, index) => {
              const previous = baseline.geometry[index];
              return (
                !previous ||
                box.id !== previous.id ||
                ['x', 'y', 'width', 'height'].some((key) => Math.abs(box[key] - previous[key]) > 1)
              );
            }))
        )
          failures.push('normal geometry not restored');
      } else {
        if (state.nativeRange.x || state.nativeRange.y) failures.push('page remains scrollable');
        if (state.scrollHeight > state.height + 1 || state.scrollWidth > state.width + 1)
          failures.push('native overflow in page mode');
        if (
          state.cards.some(
            (rect) =>
              rect.top < state.viewport.top - 1 ||
              rect.bottom > state.viewport.bottom + 1 ||
              rect.left < state.viewport.left - 1 ||
              rect.right > state.viewport.right + 1,
          )
        )
          failures.push('card outside page');
        if (
          state.markers.some(
            (rect) =>
              rect.top < state.viewport.top - 2 ||
              rect.bottom > state.viewport.bottom + 2 ||
              rect.left < state.viewport.left - 2 ||
              rect.right > state.viewport.right + 2,
          )
        )
          failures.push('hotspot outside page');
      }
      if (failures.length) {
        await page.screenshot({ path: resolve(output, `case-${index}-${variant}.png`) });
        console.log(
          JSON.stringify({
            scope: item.scope || '@root',
            depth: item.depth,
            screen: item.screen.name,
            variant,
            failures,
          }),
        );
      }
      report.cases.push({ ...item, variant, failures, ...state });
      return state;
    };
    const baseline = await verify('initial');
    if (index === 0) await page.screenshot({ path: resolve(output, 'initial.png') });
    if (widthMode) {
      // A classic scrollbar reserves horizontal space even when headless Chromium
      // normally uses overlay scrollbars. Framing must follow clientWidth again.
      await page.locator('.map-scroll-viewport,.overview-map-scroll').evaluate((viewport) => {
        viewport.style.scrollbarGutter = 'stable';
      });
      await verify('reserved-scrollbar');
      await page.locator('.map-scroll-viewport,.overview-map-scroll').evaluate((viewport) => {
        viewport.style.removeProperty('scrollbar-gutter');
      });
      await verify('after-scrollbar', 'width', baseline);
      await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
      await page.waitForFunction(() => Boolean(document.fullscreenElement));
      await verify('fullscreen');
      await page.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
      await page.waitForFunction(() => !document.fullscreenElement);
      await verify('after-fullscreen', 'width', baseline);
      await page.getByRole('button', { name: 'Pleine page', exact: true }).click();
      await verify('page-roundtrip', 'page');
      await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
      await verify('after-page', 'width', baseline);
      await page.setViewportSize({ width: item.screen.width + 360, height: item.screen.height + 140 });
      await verify('resized');
      await page.setViewportSize(item.screen);
      await verify('after-resize', 'width', baseline);
    } else if (ci && item.layer.name === 'both') {
      await page.setViewportSize({ width: 844, height: 390 });
      await verify('landscape-transition');
      await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
      await page.waitForFunction(() => Boolean(document.fullscreenElement));
      await verify('fullscreen-transition');
      await page.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
      await page.waitForFunction(() => !document.fullscreenElement);
      await verify('fullscreen-return-transition');
      await page.setViewportSize(item.screen);
      await verify('resize-return-transition');
    }
    if (item.focus)
      assert.ok(
        await page
          .locator(
            `[data-node-id="${item.focus}"], [data-map-item-id="${item.focus}"], [data-business-area-summary="${item.focus}"]`,
          )
          .count(),
        'The selected hierarchy level is actually rendered',
      );
    await page.keyboard.press('Escape');
    const legendToggle = page.getByRole('button', { name: 'Légende', exact: true });
    if (item.layer.hotspots && (await legendToggle.isVisible())) {
      const toggleBounds = await legendToggle.boundingBox();
      const beforeLegend = await page.locator('.map-scroll-viewport,.overview-map-scroll').evaluate((e) => ({
        width: e.clientWidth,
        height: e.clientHeight,
        left: e.scrollLeft,
        top: e.scrollTop,
        world: e.querySelector('.react-flow__viewport,.urbanisation-overview')?.getAttribute('style'),
      }));
      if ((await legendToggle.getAttribute('aria-expanded')) !== 'true') await legendToggle.click();
      await page.getByRole('dialog', { name: 'Légende', exact: true }).waitFor();
      assert.deepEqual(
        await legendToggle.boundingBox(),
        toggleBounds,
        'The legend trigger stays still when the navigator folds',
      );
      await verify('expanded-legend');
      const withLegend = await page.locator('.map-scroll-viewport,.overview-map-scroll').evaluate((e) => ({
        width: e.clientWidth,
        height: e.clientHeight,
        left: e.scrollLeft,
        top: e.scrollTop,
        world: e.querySelector('.react-flow__viewport,.urbanisation-overview')?.getAttribute('style'),
      }));
      assert.deepEqual(
        withLegend,
        beforeLegend,
        'The floating legend does not change map dimensions, scrolling or camera',
      );
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: 'Légende', exact: true }).waitFor({ state: 'detached' });
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Légende');
      assert.equal(
        await legendToggle.getAttribute('aria-expanded'),
        'false',
        'Escape folds the floating legend at every screen size',
      );
      await verify('legend-return');
    }
    if (item.screen.name === 'desktop' && item.depth === 0 && item.layer.name === 'both') {
      const surface = page.locator('.map-scroll-viewport,.overview-map-scroll');
      const state = () =>
        surface.evaluate((element) => ({
          top: element.scrollTop,
          range: element.scrollHeight - element.clientHeight,
          transform: element.querySelector('.react-flow__viewport,.urbanisation-overview')?.getAttribute('style'),
        }));
      const before = await state();
      const bounds = await surface.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      const delta = before.top > 60 ? -120 : 120;
      await page.mouse.wheel(0, delta);
      if (widthMode && before.range > 1)
        await page.waitForFunction(
          ({ top }) =>
            Math.abs(document.querySelector('.map-scroll-viewport,.overview-map-scroll').scrollTop - top) > 1,
          before,
        );
      else await page.waitForTimeout(100);
      const after = await state();
      assert.equal(after.transform, before.transform, 'Ordinary wheel never changes Catalogue zoom');
      if (!widthMode) assert.equal(after.top, 0, 'Whole-page Catalogue keeps the entire map visible');
      await surface.evaluate((element, top) => {
        element.scrollTop = top;
      }, before.top);
    }
    if (!widthMode && item.layer.name === 'both' && item.screen.name === 'desktop' && item.depth === 0) {
      await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
      await page.waitForFunction(() => Boolean(document.fullscreenElement));
      await verify('fullscreen');
      await page.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
      await page.waitForFunction(() => !document.fullscreenElement);
    }
    if ((index + 1) % 20 === 0) console.log(JSON.stringify({ done: index + 1, total: selected.length }));
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
}
const failures = report.cases.filter((item) => item.failures.length);
console.log(
  JSON.stringify({
    version: model.version,
    cases: report.cases.length,
    failures: failures.map((item) => ({
      scope: item.scope,
      depth: item.depth,
      screen: item.screen.name,
      layers: item.layer.name,
      variant: item.variant,
      overflow: item.scrollHeight - item.height,
      failures: item.failures,
    })),
    errors: report.errors,
    output,
  }),
);
if (failures.length || report.errors.length) process.exitCode = 1;
