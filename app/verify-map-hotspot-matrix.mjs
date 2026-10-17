/** Cross detail, framing and independent hotspot filters on the actual compiled publication. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const selectedCase = process.argv.find((arg) => arg.startsWith('--case='))?.slice(7);
const navigationOnly = process.argv.includes('--navigation-only');
const shardArgument = process.argv.find((arg) => arg.startsWith('--shard='))?.slice(8);
const shard = shardArgument ? shardArgument.split('/').map(Number) : null;
assert.ok(
  !shard ||
    (shard.length === 2 && shard.every(Number.isInteger) && shard[1] > 0 && shard[0] >= 0 && shard[0] < shard[1]),
);
const output = resolve(
  import.meta.dirname,
  '.runtime/qa-map-hotspot-matrix',
  navigationOnly ? 'navigation' : shard ? `shard-${shard[0]}-${shard[1]}` : selectedCase ? 'targeted' : '.',
);
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${catalog.current_version}/model.json`), 'utf8');
const model = JSON.parse(payload);
const parent = new Map(
  model.relations.filter((r) => ['contains', 'presents'].includes(r.type)).map((r) => [r.target_id, r.source_id]),
);
const belongs = (id, scope) => !scope || id === scope || (parent.has(id) && belongs(parent.get(id), scope));
const profiles = [
  { name: 'all', filters: {} },
  { name: 'disabled', filters: { enabled: false } },
  { name: 'model', impact: 'model' },
  { name: 'transition', impact: 'transition' },
  { name: 'usage', impact: 'usage' },
  { name: 'unqualified', impact: 'unqualified' },
  { name: 'xl-integration', filters: { severity: 'XL', kind: 'integration' } },
  { name: 'open', filters: { showResolved: false } },
];
const filtersFor = (profile) => ({
  enabled: true,
  showResolved: true,
  showModelHotspots: !profile.impact || profile.impact === 'model',
  showTransitionHotspots: !profile.impact || profile.impact === 'transition',
  showUsageHotspots: !profile.impact || profile.impact === 'usage',
  showUnqualifiedHotspots: !profile.impact || profile.impact === 'unqualified',
  ...profile.filters,
});
// Expected subjects come from the selected snapshot, independently of the rendered projections.
function expectedFor(scope, profile) {
  const filters = filtersFor(profile);
  if (!filters.enabled) return [];
  return model.hotspot_catalog.hotspots
    .filter((h) => {
      if (h.visible === false || !h.location.node_ids.some((id) => belongs(id, scope))) return false;
      const impacts =
        h.framing_impact?.scopes ??
        (h.framing_impact?.category === 'structuring'
          ? ['model']
          : h.framing_impact?.category === 'usage'
            ? ['usage']
            : []);
      if (profile.impact && !(profile.impact === 'unqualified' ? !impacts.length : impacts.includes(profile.impact)))
        return false;
      if (filters.severity && h.severity !== filters.severity) return false;
      if (filters.kind && h.kind !== filters.kind) return false;
      return (
        filters.showResolved || !(h.resolution?.stage === 'credible' || (!h.resolution && h.status === 'resolved'))
      );
    })
    .map((h) => h.id)
    .sort();
}
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const report = {
  version: model.version,
  publishedHotspots: model.hotspot_catalog.hotspots.length,
  cases: [],
  errors: [],
};
let currentCase;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(12000);
  page.on('pageerror', (error) => report.errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const target = resolve(dist, decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html');
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
  async function verify(expected) {
    await page.waitForFunction((ids) => {
      const actual = [
        ...new Set(
          [...document.querySelectorAll('.hotspot-map-marker[data-hotspot-ids]')].flatMap((e) =>
            e.dataset.hotspotIds.split('|'),
          ),
        ),
      ].sort();
      return JSON.stringify(actual) === JSON.stringify(ids);
    }, expected);
    // Deferred framing, font/card measurements and obstacle placement can finish on different frames.
    await page.evaluate(() => {
      window.mapQaStability = undefined;
    });
    await page.waitForFunction(
      () => {
        const boxes = [...document.querySelectorAll('.hotspot-map-marker, .business-card, .overview-system')].map(
          (e) => {
            const r = e.getBoundingClientRect();
            return [r.x, r.y, r.width, r.height];
          },
        );
        const signature = JSON.stringify(boxes);
        const now = performance.now();
        if (window.mapQaStability?.signature !== signature) window.mapQaStability = { signature, since: now };
        return document.fonts.status === 'loaded' && now - window.mapQaStability.since >= 220;
      },
      undefined,
      { polling: 'raf' },
    );
    const geometry = await page.evaluate((expectedIds) => {
      const markers = [...document.querySelectorAll('.hotspot-map-marker[data-hotspot-ids]')].map((e) => {
        const r = e.getBoundingClientRect();
        return {
          id: e.dataset.id,
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          radius: r.width / 2,
          parent: e.closest(
            '.overview-system, .overview-exchange-hotspots, .overview-global-hotspot, .map-flow-surface',
          ),
        };
      });
      const failures = [];
      const textByParent = new Map();
      for (const m of markers) {
        if (!m.parent) {
          failures.push(`no-parent:${m.id}`);
          continue;
        }
        const box = m.parent.getBoundingClientRect();
        if (m.radius < 17.9 || m.radius > 24.1) failures.push(`diameter:${m.id}`);
        if (
          m.x - m.radius < box.left - 1 ||
          m.x + m.radius > box.right + 1 ||
          m.y - m.radius < box.top - 1 ||
          m.y + m.radius > box.bottom + 1
        )
          failures.push(`clipped:${m.id}`);
        if (!textByParent.has(m.parent)) {
          const rectangles = [];
          for (const e of m.parent.querySelectorAll(
            '.business-card, .container-label, .category-banner, small, h3, p, .overview-stats, .overview-hierarchy, .overview-global-hotspot > button',
          )) {
            const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              if (!walker.currentNode.textContent?.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              rectangles.push(...range.getClientRects());
            }
          }
          textByParent.set(m.parent, rectangles);
        }
        if (
          textByParent
            .get(m.parent)
            .some(
              (r) =>
                Math.hypot(
                  m.x - Math.max(r.left, Math.min(m.x, r.right)),
                  m.y - Math.max(r.top, Math.min(m.y, r.bottom)),
                ) <
                m.radius - 0.5,
            )
        )
          failures.push(`text:${m.id}`);
      }
      for (const [index, m] of markers.entries())
        for (const other of markers.slice(index + 1)) {
          if (m.parent === other.parent && Math.hypot(m.x - other.x, m.y - other.y) < m.radius + other.radius + 5.5)
            failures.push(`overlap:${m.id}/${other.id}`);
        }
      const overview = document.querySelector('.urbanisation-overview.layout-fixed');
      if (overview) {
        const instances = [...overview.querySelectorAll('.hotspot-map-marker[data-hotspot-ids]')].flatMap((marker) =>
          marker.dataset.hotspotIds.split('|'),
        );
        for (const id of expectedIds) {
          const count = instances.filter((value) => value === id).length;
          if (count !== 1) failures.push(`hotspot-instances:${id}:${count}`);
        }
        if (overview.querySelector('.system-data-sharing-map, .overview-exchange-hotspots'))
          failures.push('catalogue-mixes-published-flows');
        for (const marker of overview.querySelectorAll('.hotspot-map-marker[data-hotspot-ids]'))
          if (!marker.closest('.overview-system'))
            failures.push(`catalogue-hotspot-outside-scope:${marker.dataset.hotspotIds}`);
        const ids = [
          'system-design-development',
          'system-business-operations',
          'system-enterprise-management-control',
          'domain-logistics-execution',
        ];
        const systems = ids.flatMap((id) => {
          const card = overview.querySelector(`.overview-system[data-node-id="${id}"]`);
          return card ? [card.getBoundingClientRect()] : [];
        });
        if (
          ![3, 4].includes(systems.length) ||
          !(
            systems[0].right < systems[1].left &&
            systems[1].right < systems[2].left &&
            systems.slice(0, 3).every((r) => Math.abs(r.top - systems[0].top) < 1) &&
            (systems.length === 3 ||
              (systems[3].top > systems[1].bottom &&
                Math.abs(systems[3].left - systems[1].left) < 1 &&
                Math.abs(systems[3].right - systems[1].right) < 1))
          )
        )
          failures.push('system-positions');
      }
      const operations =
        document.querySelector('.overview-system[data-node-id="system-business-operations"] .overview-domains-fixed') ||
        document.querySelector('.graph-canvas.fixed-placement');
      if (operations) {
        const ids = [
          'domain-plan',
          'domain-sourcing-procurement',
          'domain-sales',
          'supply-chain-orchestration',
          'domain-logistics-execution',
        ];
        const boxes = ids.map((id) => {
          const e =
            operations.querySelector(`.business-card[data-node-id="${id}"]`) ||
            operations.querySelector(`:scope > li > [data-map-item-id="${id}"]`)?.closest('li');
          return e?.getBoundingClientRect();
        });
        if (boxes.slice(1, 4).every(Boolean)) {
          const [p, s, sales, o, l] = boxes;
          if (
            !(
              (!p || p.bottom <= s.top + 1) &&
              Math.abs(s.top - sales.top) < 1 &&
              s.right < sales.left &&
              Math.max(s.bottom, sales.bottom) <= o.top + 1 &&
              (!l || o.bottom <= l.top + 1)
            )
          )
            failures.push('domain-positions');
        }
      }
      if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('page-overflow');
      return {
        failures,
        markers: markers.length,
        represented: [
          ...new Set(
            [...document.querySelectorAll('.hotspot-map-marker[data-hotspot-ids]')].flatMap((e) =>
              e.dataset.hotspotIds.split('|'),
            ),
          ),
        ].sort(),
        mode: document.querySelector('.graph-canvas')?.className || 'overview',
      };
    }, expected);
    assert.deepEqual(geometry.represented, expected, 'All filtered subjects remain represented after framing');
    assert.deepEqual(geometry.failures, [], `${JSON.stringify(currentCase)}: ${JSON.stringify(geometry.failures)}`);
    const nativeScroll = page.locator('.overview-map-scroll, .map-scroll-viewport').first();
    const overflow = (await nativeScroll.count())
      ? await nativeScroll.evaluate((e) => e.scrollWidth - e.clientWidth)
      : 0;
    const scrollbars = await page.evaluate(() => {
      const counts = { horizontal: 0, vertical: 0, toolbar: 0 };
      for (const e of document.querySelectorAll('.workspace-content, .workspace-content *')) {
        const style = getComputedStyle(e);
        if (e.matches('.map-actions')) {
          if (['auto', 'scroll'].includes(style.overflowX) && e.scrollWidth > e.clientWidth + 1) counts.toolbar++;
          continue;
        }
        if (['auto', 'scroll'].includes(style.overflowX) && e.scrollWidth > e.clientWidth + 1) counts.horizontal++;
        if (['auto', 'scroll'].includes(style.overflowY) && e.scrollHeight > e.clientHeight + 1) counts.vertical++;
      }
      return counts;
    });
    assert.ok(
      scrollbars.horizontal <= 1 && scrollbars.vertical <= 1 && scrollbars.toolbar <= 1,
      `Only one map-content scroll container per axis, plus its short-screen command strip: ${JSON.stringify(scrollbars)}`,
    );
    const scrollBox = await nativeScroll.boundingBox();
    assert.ok(
      scrollBox && scrollBox.height >= 50 && scrollBox.y + scrollBox.height <= page.viewportSize().height + 1,
      'Native bars stay at the visible viewport edge',
    );
    if (overflow > 1 && currentCase.profile === 'all') {
      await nativeScroll.focus();
      await nativeScroll.press('ArrowRight');
      await page.waitForFunction(() => {
        const e = document.querySelector('.overview-map-scroll, .map-scroll-viewport');
        return e && e.scrollLeft > 0;
      });
      // Native keyboard scrolling continues briefly after its first movement.
      await page.waitForTimeout(300);
      await nativeScroll.evaluate((e) => {
        e.scrollTo({ left: e.scrollWidth, top: e.scrollHeight, behavior: 'instant' });
      });
      assert.ok(
        await nativeScroll.evaluate((e) => {
          const surface = e.querySelector('.overview-map-frame, .map-flow-surface');
          return (
            e.scrollLeft > 0 && surface && surface.getBoundingClientRect().right <= e.getBoundingClientRect().right + 1
          );
        }),
        'The far edge of the map is reachable by native scrolling',
      );
      await nativeScroll.evaluate((e) => e.scrollTo({ left: 0, top: 0, behavior: 'instant' }));
    }
    report.cases.push({
      ...currentCase,
      subjects: expected.length,
      markers: geometry.markers,
      actualMode: geometry.mode,
      scrollbars,
    });
    if (
      currentCase.width === 390 &&
      currentCase.profile === 'all' &&
      currentCase.mode === 'Pleine largeur' &&
      !currentCase.fullscreen
    ) {
      if (currentCase.scope === 'overview' && currentCase.detail === 2)
        await page.screenshot({ path: resolve(output, 'overview-mobile.png') });
      if (currentCase.scope === 'system-business-operations' && currentCase.detail === 4)
        await page.screenshot({ path: resolve(output, 'operations-mobile.png') });
    }
  }
  let caseNumber = 0;
  for (const width of navigationOnly ? [] : [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 667 : 900 });
    for (const scope of ['', 'system-business-operations', 'supply-chain-orchestration']) {
      for (const detail of scope ? [0, 1, 2, 3, 4] : [0, 1, 2]) {
        for (const mode of ['Auto', 'Pleine page', 'Pleine largeur']) {
          for (const profile of profiles) {
            const position = caseNumber++;
            if (shard && position % shard[1] !== shard[0]) continue;
            currentCase = { width, scope: scope || 'overview', detail, mode, profile: profile.name, fullscreen: false };
            if (selectedCase && selectedCase !== `${width}/${currentCase.scope}/${detail}/${mode}/${profile.name}`)
              continue;
            const params = {
              version: model.version,
              mapDepth: String(detail),
              hf: JSON.stringify(filtersFor(profile)),
              ...(scope ? { node: scope, scope } : {}),
            };
            await page.goto(`${base}#/map?${new URLSearchParams(params)}`);
            await page.locator(`#fa-version[data-version="${model.version}"]`).waitFor({ state: 'attached' });
            await page.getByRole('button', { name: mode, exact: true }).click();
            const expected = expectedFor(scope, profile);
            await verify(expected);
            if (detail === (scope ? 4 : 2) && ['all', 'usage'].includes(profile.name)) {
              await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
              await page.waitForFunction(() => Boolean(document.fullscreenElement));
              currentCase = { ...currentCase, fullscreen: true };
              await verify(expected);
              await page.evaluate(() => document.exitFullscreen());
            }
          }
        }
        console.log(JSON.stringify({ progress: report.cases.length, width, scope: scope || 'overview', detail }));
      }
    }
  }
  if (!selectedCase && (!shard || shard[0] === 0)) {
    report.navigation = [];
    await page.setViewportSize({ width: 390, height: 844 });
    const subject = model.hotspot_catalog.hotspots.findLast(
      (h) =>
        h.visible !== false &&
        h.location.node_ids.some(
          (id) =>
            belongs(id, 'supply-chain-orchestration') &&
            model.nodes.some((node) => node.id === id && node.kind === 'capability'),
        ),
    );
    assert.ok(subject, 'A published Supply capability hotspot exercises deep-map navigation');
    for (const action of ['return-link', 'browser-back']) {
      currentCase = {
        scope: 'system-business-operations',
        detail: 4,
        profile: 'all',
        mode: 'Pleine largeur',
        navigation: action,
      };
      await page.goto(
        `${base}#/map?${new URLSearchParams({ version: model.version, scope: currentCase.scope, node: currentCase.scope, mapDepth: '4', hf: JSON.stringify(filtersFor(profiles[0])) })}`,
      );
      await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
      const marker = page.locator(`.hotspot-map-marker[data-hotspot-ids="${subject.id}"]`);
      await marker.waitFor();
      await page.waitForTimeout(700);
      await marker.scrollIntoViewIfNeeded();
      const scrolled = await page.locator('.map-scroll-viewport').evaluate((e) => Math.round(e.scrollTop));
      assert.ok(scrolled > 0, 'The deep Supply hotspot is reached by vertical map scrolling');
      await page.evaluate(() => {
        window.__atlasHotspotActivationScroll = null;
        document.addEventListener(
          'pointerdown',
          (event) => {
            if (event.target?.closest?.('.hotspot-map-marker'))
              window.__atlasHotspotActivationScroll = Math.round(
                document.querySelector('.map-scroll-viewport').scrollTop,
              );
          },
          { capture: true, once: true },
        );
      });
      await marker.click();
      // Clicking can scroll the marker again; the origin is the position at actual activation.
      const before = await page.evaluate(() => window.__atlasHotspotActivationScroll);
      assert.ok(Number.isFinite(before) && before > 0, 'The activation records a deep map scroll origin');
      const returnLink = page.getByRole('link', { name: /^Retour à la carte/ });
      await returnLink.waitFor();
      const returnHref = await returnLink.getAttribute('href');
      assert.ok(returnHref, 'The hotspot exposes its return reading origin');
      assert.equal(
        Number(new URLSearchParams(returnHref.split('?')[1]).get('scroll')),
        before,
        'The return link encodes the scroll position at actual marker activation',
      );
      if (action === 'return-link') await returnLink.click();
      else await page.goBack();
      await page.waitForFunction(
        (top) => Math.abs((document.querySelector('.map-scroll-viewport')?.scrollTop || 0) - top) < 2,
        before,
      );
      const restored = await page.locator('.map-scroll-viewport').evaluate((e) => Math.round(e.scrollTop));
      assert.equal(new URLSearchParams(page.url().split('?')[1]).get('mapDepth'), '4');
      report.navigation.push({ action, before, restored });
    }
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failedCase = currentCase;
  report.failure = String(error);
  const pages = browser.contexts().flatMap((context) => context.pages());
  report.scrollDiagnostic = await pages[0]?.evaluate(() =>
    [...document.querySelectorAll('.overview-map-scroll, .map-scroll-viewport')].map((e) => ({
      left: e.scrollLeft,
      top: e.scrollTop,
      width: e.clientWidth,
      scrollWidth: e.scrollWidth,
      height: e.clientHeight,
      scrollHeight: e.scrollHeight,
      box: e.getBoundingClientRect().toJSON(),
      html: e.outerHTML.slice(0, 300),
    })),
  );
  console.log(JSON.stringify(report.scrollDiagnostic));
  await pages[0]?.screenshot({ path: resolve(output, 'failure.png') });
  throw error;
} finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(
    JSON.stringify({ status: report.status, cases: report.cases.length, report: resolve(output, 'report.json') }),
  );
}
