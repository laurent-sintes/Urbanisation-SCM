// Isolated workshop fixture: no write to a publication, staging file or user server.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const output = resolve(import.meta.dirname, '.runtime/qa-hotspot-clusters', browserOptions.channel || 'chromium');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${catalog.current_version}/model.json`));
const model = JSON.parse(payload);
const prototype = model.hotspot_catalog.hotspots[0];
const severities = ['S', 'M', 'L', 'XL', 'unassessed'];
const stages = ['to_explore', 'identified', 'qualifying', 'credible', 'unassessed'];
const subjects = Array.from({ length: 45 }, (_, index) => ({
  ...structuredClone(prototype),
  id: `qa-cluster-${index}`,
  title: `Sujet ${index + 1} — ${index === 20 ? 'TitreSansEspaces'.repeat(30) : ''}`,
  problem: `[Périmètre de recette](model:domain-logistics-execution). Problème ${index + 1}. ${'Description longue pour tester les aperçus. '.repeat(60)}`,
  kind: 'scope',
  status: stages[Math.floor(index / 5) % 5] === 'credible' ? 'resolved' : 'validated',
  severity: severities[index % 5],
  visible: true,
  location: { ...prototype.location, node_ids: ['domain-logistics-execution'] },
  resolution: {
    stage: stages[Math.floor(index / 5) % 5],
    blocked_reason: index % 7 === 2 ? 'Blocage de recette' : '',
    summary: 'Recette',
    next_step: '',
    credible_option_ids: [],
    credibility_note: '',
    assessment_source: 'QA',
  },
}));
const stage = {
  active: true,
  schema_version: 1,
  session_id: 'qa-clusters',
  base_version: model.version,
  base_model_sha256: createHash('sha256').update(payload).digest('hex'),
  revision: 1,
  operations: [
    ...model.hotspot_catalog.hotspots.map((item, index) => ({
      sequence: index + 1,
      entity: 'hotspot',
      action: 'remove',
      id: item.id,
    })),
    ...subjects.map((item, index) => ({
      sequence: model.hotspot_catalog.hotspots.length + index + 1,
      entity: 'hotspot',
      action: 'create',
      id: item.id,
      value: item,
    })),
  ],
};
const base = 'http://localhost:9876/Urbanisation-SCM/';
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};
const browser = await chromium.launch(browserOptions);
const results = [];
const errors = [];
function translation(transform) {
  const values = transform
    .slice(transform.indexOf('(') + 1, -1)
    .split(',')
    .map(Number);
  return { x: values[4], y: values[5] };
}
async function setup(width = 390, height = 900, touch = false, view = 'overview') {
  let localStage = structuredClone(stage);
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: 'reduce',
    hasTouch: touch,
    isMobile: touch,
  });
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === '__atlas__/workshop/staging.json') return route.fulfill({ json: localStage });
    if (relative.startsWith('__atlas__/')) return route.fulfill({ status: 404, body: '{}' });
    const target = resolve(dist, relative);
    assert.ok(target.startsWith(dist + sep));
    await route.fulfill({
      body: await readFile(target),
      contentType: mime[extname(target)] || 'application/octet-stream',
    });
  });
  const params = new URLSearchParams({
    version: model.version,
    mapDepth: '1',
    hf: JSON.stringify({ enabled: true, showResolved: true }),
  });
  if (view === 'system') {
    params.set('node', 'system-business-operations');
    params.set('scope', 'system-business-operations');
    params.set('mapFocus', 'domain-logistics-execution');
  }
  await page.goto(`${base}#/map?${params}`);
  if (view === 'system') {
    await page.getByRole('button', { name: 'Pleine page', exact: true }).click();
    // Let the initial framing and focus finish before testing an already open group.
    await page.waitForTimeout(400);
  }
  const cluster = page.locator('.hotspot-map-marker[aria-expanded]').first();
  try {
    await cluster.waitFor();
    await cluster.click();
  } catch (error) {
    await page.screenshot({ path: resolve(output, `setup-${view}-${width}x${height}.png`) });
    await page.close();
    throw error;
  }
  await page.locator('.hotspot-cluster-popover').waitFor();
  const members = (await cluster.getAttribute('data-hotspot-ids')).split('|');
  return {
    page,
    cluster,
    members,
    dialog: page.locator('.hotspot-cluster-popover'),
    removeMembers() {
      localStage = {
        ...localStage,
        revision: localStage.revision + 1,
        operations: [
          ...localStage.operations,
          ...members.map((id, index) => ({
            sequence: localStage.operations.length + index + 1,
            entity: 'hotspot',
            action: 'remove',
            id,
          })),
        ],
      };
    },
  };
}
async function check(name, action) {
  if (process.env.ATLAS_CLUSTER_CASE && !new RegExp(process.env.ATLAS_CLUSTER_CASE).test(name)) return;
  try {
    await action();
    results.push({ name, passed: true });
    console.log(`OK ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`);
  }
}
async function geometry(page, dialog) {
  await page.waitForFunction(() => {
    const element = document.querySelector('.hotspot-cluster-popover');
    const heading = element?.querySelector('header')?.getBoundingClientRect();
    if (!element || !heading) return false;
    const host = document.fullscreenElement || document.documentElement;
    const height = Math.max(280, document.fullscreenElement ? host.clientHeight : window.innerHeight);
    const top =
      height <= 420 || document.fullscreenElement
        ? 8
        : Math.max(8, (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) + 8);
    return (
      Number(element.dataset.layoutWidth) === host.clientWidth &&
      Number(element.dataset.layoutTop) === top &&
      Math.abs(Number(element.dataset.layoutHeadingHeight) - heading.height) < 0.1
    );
  });
  const viewport = page.viewportSize();
  const data = await dialog.evaluate((element) => {
    const rect = (target) => {
      const r = target.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return {
      header: rect(element.querySelector('header')),
      center: rect(element.querySelector('.hotspot-cluster-center')),
      items: [...element.querySelectorAll('.hotspot-expanded-item')].map(rect),
      footer: element.querySelector('.hotspot-cluster-pagination')
        ? rect(element.querySelector('.hotspot-cluster-pagination'))
        : null,
    };
  });
  for (const item of [data.header, data.center, data.footer, ...data.items].filter(Boolean)) {
    assert.ok(
      item.x >= -0.1 &&
        item.y >= -0.1 &&
        item.x + item.width <= viewport.width + 0.1 &&
        item.y + item.height <= viewport.height + 0.1,
      `out of frame: ${JSON.stringify(item)}`,
    );
  }
  for (const [index, item] of data.items.entries()) {
    assert.ok(item.y >= data.header.y + data.header.height + 4, 'pastille overlaps heading');
    if (data.footer) assert.ok(item.y + item.height <= data.footer.y - 4, 'pastille overlaps paging');
    assert.ok(
      Math.hypot(
        item.x + item.width / 2 - data.center.x - data.center.width / 2,
        item.y + item.height / 2 - data.center.y - data.center.height / 2,
      ) >=
        (item.width + data.center.width) / 2 + 4 - 0.1,
      'pastille overlaps center',
    );
    for (const other of data.items.slice(index + 1))
      assert.ok(Math.hypot(item.x - other.x, item.y - other.y) >= 63.9, 'pastilles overlap');
  }
}
try {
  for (const [width, height] of [
    [1440, 950],
    [900, 700],
    [390, 844],
    [844, 390],
    [667, 320],
    [320, 480],
  ]) {
    await check(`bounds-${width}x${height}`, async () => {
      const { page, dialog } = await setup(width, height);
      try {
        await geometry(page, dialog);
        await page.screenshot({ path: resolve(output, `${width}x${height}.png`) });
      } finally {
        await page.close();
      }
    });
  }
  for (const view of ['overview', 'system']) {
    await check(`resize-keeps-group-${view}`, async () => {
      const { page, dialog } = await setup(900, 900, false, view);
      try {
        const title = await dialog.getAttribute('aria-label');
        await page.setViewportSize({ width: 390, height: 700 });
        await dialog.waitFor();
        await page
          .waitForFunction(
            () =>
              Number(document.querySelector('.hotspot-cluster-popover')?.dataset.layoutWidth) ===
              document.documentElement.clientWidth,
          )
          .catch((error) => {
            throw new Error(`resize geometry: ${error.message}`);
          });
        assert.equal(await dialog.getAttribute('aria-label'), title);
        await geometry(page, dialog);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        await page
          .waitForFunction(() =>
            document.activeElement?.matches('.hotspot-map-marker[data-hotspot-ids], .map-toolbar .detail-trigger'),
          )
          .catch((error) => {
            throw new Error(`resize focus return: ${error.message}`);
          });
        await page.waitForTimeout(350);
        assert.equal(
          await page.evaluate(() =>
            document.activeElement?.matches('.hotspot-map-marker[data-hotspot-ids], .map-toolbar .detail-trigger'),
          ),
          true,
        );
      } finally {
        await page.close();
      }
    });
  }
  await check('touch-preview-before-opening', async () => {
    const { page, dialog } = await setup(390, 844, true);
    try {
      const item = dialog.locator('.hotspot-expanded-item').first();
      await item.tap();
      await page.getByRole('tooltip').waitFor();
      assert.ok(await dialog.count(), 'first tap keeps the circle and identifies the hotspot');
      await item.tap();
      await page.locator('.hotspot-detail').waitFor();
    } finally {
      await page.close();
    }
  });
  await check('keyboard-pages-and-restores-focus', async () => {
    const { page, cluster, dialog } = await setup(390, 844);
    try {
      const next = dialog.getByRole('button', { name: 'Pastilles suivantes' });
      await next.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.activeElement?.matches('.hotspot-expanded-item'));
      const first = dialog.locator('.hotspot-expanded-item').first();
      await first.focus();
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await cluster.evaluate((element) => element === document.activeElement), true);
    } finally {
      await page.close();
    }
  });
  await check('every-page-every-subject-and-keyboard-shortcuts', async () => {
    const { page, dialog, members } = await setup(320, 480);
    try {
      const seen = [];
      const center = await dialog.locator('.hotspot-cluster-center').boundingBox();
      const next = dialog.getByRole('button', { name: 'Pastilles suivantes' });
      assert.ok(await dialog.getByRole('button', { name: 'Pastilles précédentes' }).isDisabled());
      for (let index = 1; index <= subjects.length; index++) {
        await geometry(page, dialog);
        const names = await dialog
          .locator('.hotspot-expanded-item')
          .evaluateAll((items) => items.map((item) => item.getAttribute('aria-label')));
        seen.push(...names);
        assert.match(await dialog.getByRole('status').textContent(), new RegExp(`Page ${index} sur`));
        assert.deepEqual(await dialog.locator('.hotspot-cluster-center').boundingBox(), center);
        if (await next.isDisabled()) break;
        await next.click();
      }
      assert.equal(seen.length, members.length);
      assert.equal(new Set(seen).size, members.length, 'no omitted or repeated subjects');
      for (const subject of subjects.filter((item) => members.includes(item.id)))
        assert.ok(seen.some((name) => name.startsWith(`${subject.title}, criticité`)));
      const first = dialog.locator('.hotspot-expanded-item').first();
      await first.focus();
      const lastNames = await first.getAttribute('aria-label');
      await page.keyboard.press('PageUp');
      await page.waitForFunction(() => document.activeElement?.matches('.hotspot-expanded-item'));
      assert.notEqual(await first.getAttribute('aria-label'), lastNames);
      // Dismiss the preview so PageDown changes the circle rather than scrolling preview text.
      await dialog.getByRole('button', { name: 'Replier le groupe' }).focus();
      await page.keyboard.press('PageDown');
      assert.equal(await first.getAttribute('aria-label'), lastNames);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.locator('.hotspot-map-tooltip').count(), 0);
    } finally {
      await page.close();
    }
  });
  await check('long-preview-is-bounded-scrollable-and-readable', async () => {
    const { page, dialog } = await setup(390, 844);
    try {
      await dialog.locator('.hotspot-expanded-item').first().focus();
      const tooltip = page.getByRole('tooltip');
      await tooltip.waitFor();
      const rect = await tooltip.boundingBox();
      assert.ok(rect.height <= 844 * 0.45 + 1);
      assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= 390 && rect.y + rect.height <= 844);
      assert.ok(await tooltip.evaluate((element) => element.scrollHeight > element.clientHeight));
      await tooltip.hover();
      await page.mouse.wheel(0, 400);
      await page.waitForFunction(() => document.querySelector('.hotspot-map-tooltip')?.scrollTop > 0);
      await page.screenshot({ path: resolve(output, 'long-preview.png') });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
    } finally {
      await page.close();
    }
  });
  await check('touch-selection-paging-and-outside-dismiss', async () => {
    const { page, cluster, dialog } = await setup(390, 844, true);
    try {
      await dialog.locator('.hotspot-expanded-item').nth(0).tap();
      await dialog.locator('.hotspot-expanded-item').nth(1).tap();
      await page.getByRole('tooltip').waitFor();
      assert.equal(await page.locator('.hotspot-detail').count(), 0);
      assert.equal(await page.getByRole('tooltip').count(), 1);
      await dialog.getByRole('button', { name: 'Pastilles suivantes' }).tap();
      assert.equal(await page.getByRole('tooltip').count(), 0);
      await page.touchscreen.tap(2, 2);
      await dialog.waitFor({ state: 'detached' });
      await cluster.tap();
      await dialog.waitFor();
      assert.match(await dialog.getByRole('status').textContent(), /Page 1 sur/);
    } finally {
      await page.close();
    }
  });
  for (const view of ['overview', 'system']) {
    await check(`background-inert-and-repeated-close-${view}`, async () => {
      const { page, cluster, dialog } = await setup(900, 700, false, view);
      try {
        const url = page.url();
        const mapTransform = () =>
          page.evaluate(() => document.querySelector('.react-flow__viewport')?.style.transform || null);
        const viewport = await mapTransform();
        const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
        await page.mouse.move(2, 2);
        await page.mouse.wheel(0, 700);
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await page.waitForFunction(() =>
          document.querySelector('.hotspot-cluster-popover')?.contains(document.activeElement),
        );
        assert.deepEqual(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })), scroll);
        assert.equal(await mapTransform(), viewport);
        const background = page.getByRole('button', { name: 'Étendre la carte', includeHidden: true });
        const box = await background.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await dialog.waitFor({ state: 'detached' });
        assert.equal(
          await page.evaluate(() => Boolean(document.fullscreenElement)),
          false,
          'dismiss must not click through',
        );
        assert.equal(page.url(), url);
        for (let cycle = 0; cycle < 3; cycle++) {
          await cluster.click();
          await dialog.waitFor();
          await page.keyboard.press('Escape');
          await dialog.waitFor({ state: 'detached' });
        }
        assert.equal(await page.locator('.hotspot-cluster-backdrop, .hotspot-map-tooltip').count(), 0);
        assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      } finally {
        await page.close();
      }
    });
  }
  await check('fullscreen-resize-and-exit', async () => {
    const { page, cluster, dialog } = await setup(900, 700, false, 'system');
    try {
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      await page.getByRole('button', { name: 'Étendre la carte' }).click();
      await page.waitForFunction(() => Boolean(document.fullscreenElement));
      await cluster.click();
      await dialog.waitFor();
      assert.equal(await dialog.evaluate((element) => document.fullscreenElement.contains(element)), true);
      await geometry(page, dialog);
      await page.evaluate(() => document.exitFullscreen());
      await page.waitForFunction(
        () => !document.fullscreenElement && Boolean(document.querySelector('.hotspot-cluster-popover')),
      );
      await geometry(page, dialog);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
    } finally {
      await page.close();
    }
  });
  await check('animation-is-visible-and-fast-clicks-do-not-open-a-random-subject', async () => {
    const { page, cluster, dialog } = await setup(900, 700);
    try {
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const box = await cluster.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await dialog.locator('.hotspot-expanded-item').evaluateAll((elements) => {
        for (const element of elements) {
          const animation = element.getAnimations()[0];
          animation.pause();
          animation.currentTime = 180;
        }
      });
      await page.screenshot({ path: resolve(output, 'spiral-opening.png') });
      const sample = await dialog
        .locator('.hotspot-expanded-item')
        .first()
        .evaluate(async (element) => {
          const animation = element.getAnimations()[0];
          const duration = animation.effect.getTiming().duration;
          animation.pause();
          animation.currentTime = 0;
          const start = getComputedStyle(element).transform;
          animation.currentTime = duration / 2;
          const middle = getComputedStyle(element).transform;
          animation.currentTime = duration;
          const end = getComputedStyle(element).transform;
          animation.currentTime = duration - 1;
          animation.play();
          return { start, middle, end, duration };
        });
      assert.notEqual(sample.start, sample.end);
      assert.ok(sample.duration >= 350 && sample.duration <= 500);
      const start = translation(sample.start);
      const middle = translation(sample.middle);
      assert.ok(
        Math.abs(start.x * middle.y - start.y * middle.x) > 100,
        'the path must curve away from a straight deployment',
      );
      await page.keyboard.press('Escape');
      assert.equal(await dialog.getAttribute('data-closing'), 'true');
      const reverse = await dialog
        .locator('.hotspot-expanded-item')
        .first()
        .evaluate((element) => {
          const animation = element.getAnimations()[0];
          const state = animation.playState;
          animation.pause();
          animation.currentTime = animation.effect.getTiming().duration / 2;
          const transform = getComputedStyle(element).transform;
          animation.play();
          return { rate: animation.playbackRate, state, transform };
        });
      assert.equal(reverse.rate, -1);
      assert.equal(reverse.state, 'running');
      assert.equal(reverse.transform, sample.middle, 'collapse follows the exact same spiral backwards');
      await dialog.waitFor({ state: 'detached' });
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 });
      assert.equal(
        await page.locator('.hotspot-detail').count(),
        0,
        'rapid clicks on the group must not select an unidentifiable moving item',
      );
    } finally {
      await page.close();
    }
  });
  await check('interrupted-opening-reverses-without-jump-and-selection-waits-for-collapse', async () => {
    const { page, cluster, dialog } = await setup(900, 700);
    try {
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await cluster.click();
      const leaf = dialog.locator('.hotspot-expanded-item').first();
      const before = await leaf.evaluate((element) => {
        const animation = element.getAnimations()[0];
        animation.pause();
        animation.currentTime = 200;
        return getComputedStyle(element).transform;
      });
      await page.keyboard.press('Escape');
      const interrupted = await leaf.evaluate((element) => {
        const animation = element.getAnimations()[0];
        animation.pause();
        animation.currentTime = 200;
        const transform = getComputedStyle(element).transform;
        animation.play();
        return { transform, rate: animation.playbackRate };
      });
      assert.equal(interrupted.transform, before, 'reversal uses the existing trajectory and current position');
      assert.equal(interrupted.rate, -1);
      await dialog.waitFor({ state: 'detached' });
      await cluster.click();
      await page.waitForTimeout(500);
      await leaf.click();
      assert.equal(await dialog.getAttribute('data-closing'), 'true');
      assert.equal(await page.locator('.hotspot-detail').count(), 0, 'the detail waits for the return motion');
      await dialog.waitFor({ state: 'detached' });
      await page.locator('.hotspot-detail').waitFor();
    } finally {
      await page.close();
    }
  });
  for (const view of ['overview', 'system']) {
    await check(`spiral-collapse-all-dismiss-methods-${view}`, async () => {
      const { page, cluster, dialog } = await setup(390, 844, false, view);
      try {
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        for (const method of ['button', 'outside', 'escape']) {
          await cluster.click();
          await page.waitForTimeout(500);
          if (method === 'button') await dialog.getByRole('button', { name: 'Replier le groupe' }).click();
          else if (method === 'outside') await page.mouse.click(2, 2);
          else await page.keyboard.press('Escape');
          assert.equal(await dialog.getAttribute('data-closing'), 'true');
          const leaf = dialog.locator('.hotspot-expanded-item').first();
          await leaf.evaluate(async (element) => {
            await element.getAnimations()[0].ready;
          });
          assert.equal(await leaf.evaluate((element) => element.getAnimations()[0].playbackRate), -1);
          await page.keyboard.press('Escape');
          await dialog.waitFor({ state: 'detached' });
          assert.equal(await cluster.evaluate((element) => element === document.activeElement), true);
          assert.equal(await page.locator('.hotspot-cluster-backdrop').count(), 0);
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await cluster.click();
        assert.equal(
          await dialog
            .locator('.hotspot-expanded-item')
            .first()
            .evaluate((element) => element.getAnimations().length),
          0,
        );
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
      } finally {
        await page.close();
      }
    });
  }
  await check('preview-links-are-accessible-inside-the-modal', async () => {
    const { page, dialog } = await setup(390, 844);
    try {
      await dialog.locator('.hotspot-expanded-item').first().focus();
      const link = page.locator('.hotspot-map-tooltip a.model-reference');
      await link.waitFor();
      assert.equal(await link.evaluate((element) => Boolean(element.closest('[inert]'))), false);
      await link.focus();
      assert.equal(await link.evaluate((element) => document.activeElement === element), true);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.locator('.hotspot-map-tooltip, .reference-tooltip').count(), 0);
    } finally {
      await page.close();
    }
  });
  await check('high-contrast-keeps-circles-and-focus-visible', async () => {
    const { page, dialog } = await setup(390, 844);
    try {
      await page.emulateMedia({ forcedColors: 'active' });
      await geometry(page, dialog);
      const first = dialog.locator('.hotspot-expanded-item').first();
      await first.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(
        await dialog
          .locator('.hotspot-expanded-item')
          .nth(1)
          .evaluate((element) => getComputedStyle(element).outlineStyle),
        'solid',
      );
      assert.ok(
        await first
          .locator('.hotspot-map-marker')
          .evaluate((element) => parseFloat(getComputedStyle(element).borderWidth) > 0),
      );
      await page.screenshot({ path: resolve(output, 'high-contrast.png') });
    } finally {
      await page.close();
    }
  });
  await check('long-unbroken-title-does-not-overflow-the-preview', async () => {
    const { page, dialog } = await setup(390, 844);
    try {
      const item = dialog.getByRole('button', { name: /^Sujet 21 —/ });
      while (!(await item.count()) && !(await dialog.getByRole('button', { name: 'Pastilles suivantes' }).isDisabled()))
        await dialog.getByRole('button', { name: 'Pastilles suivantes' }).click();
      await item.focus();
      const tooltip = page.locator('.hotspot-map-tooltip');
      await tooltip.waitFor();
      assert.equal(await tooltip.evaluate((element) => element.scrollWidth <= element.clientWidth + 1), true);
      const box = await tooltip.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= 390 && box.height <= 844 * 0.45 + 1);
    } finally {
      await page.close();
    }
  });
  for (const view of ['overview', 'system']) {
    await check(`removed-group-releases-the-map-${view}`, async () => {
      const { page, dialog, removeMembers } = await setup(900, 700, false, view);
      try {
        removeMembers();
        await dialog.waitFor({ state: 'detached' });
        assert.equal(await page.locator('.hotspot-cluster-backdrop').count(), 0);
        const remaining = page.locator('.hotspot-map-marker').first();
        await remaining.waitFor();
        assert.equal(await remaining.evaluate((element) => Boolean(element.closest('[inert]'))), false);
        const individual = page.locator('.hotspot-map-marker:not([aria-expanded])').first();
        if (await individual.count()) {
          await individual.hover();
          const preview = page.locator('.hotspot-map-tooltip').first();
          await preview.waitFor();
          await page.waitForFunction(() => {
            const preview = document.querySelector('.hotspot-map-tooltip')?.getBoundingClientRect();
            const toolbar = document.querySelector('.map-toolbar, .universe-toolbar')?.getBoundingClientRect();
            return preview && toolbar && preview.top >= toolbar.bottom;
          });
        }
        await page.getByRole('button', { name: 'Étendre la carte' }).click();
        await page.waitForFunction(() => Boolean(document.fullscreenElement));
      } finally {
        await page.close();
      }
    });
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(
    resolve(output, 'report.json'),
    `${JSON.stringify({ browser: browserOptions.channel || 'chromium', version: model.version, fixtureCount: subjects.length, results, errors }, null, 2)}\n`,
  );
}
console.log(JSON.stringify(results, null, 2));
assert.ok(results.length > 0 && results.every((result) => result.passed), 'cluster audit must pass every journey');
