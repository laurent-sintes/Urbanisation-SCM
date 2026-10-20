/** Verify the spatial Flux map against the compiled, selected publication. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { waitForCatalogueGeometry } from './catalogue-geometry.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_FLOW_DIST || 'dist');
const output = resolve(import.meta.dirname, '.runtime/qa-flow-map');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const version = process.argv.find((arg) => arg.startsWith('--version='))?.slice(10) || catalog.current_version;
const modelBytes = await readFile(resolve(dist, `data/${version}/model.json`));
const model = JSON.parse(modelBytes);
const byId = new Map(model.nodes.map((node) => [node.id, node]));
const relations = new Map(model.relations.map((relation) => [relation.id, relation]));
const parent = new Map(
  model.relations
    .filter((relation) => ['contains', 'presents'].includes(relation.type))
    .map((relation) => [relation.target_id, relation.source_id]),
);
const belongs = (id, scope) => !scope || id === scope || (parent.has(id) && belongs(parent.get(id), scope));
const domain = byId.get('supply-chain-orchestration') || model.nodes.find((node) => node.kind === 'domain');
assert.ok(domain, 'A published domain is required');
const nameOf = (node) => node.fields?.name || node.name || node.id;
const parseIds = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return value.split(/[\s,|]+/).filter(Boolean);
  }
};
const base = 'https://atlas.test/Urbanisation-SCM/';
const errors = [];
const checks = [];
const report = { version, checks, errors };
const browser = await chromium.launch(browserOptions);
let activePage;
const pageBases = new WeakMap();

async function preparePage({ workshop, ...options } = {}) {
  const pageBase = workshop ? 'http://127.0.0.1:18999/Urbanisation-SCM/' : base;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
  pageBases.set(page, pageBase);
  activePage = page;
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.context().route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(pageBase), `No external resource required: ${url.href}`);
    if (workshop && url.pathname.endsWith('/__atlas__/workshop/staging.json')) {
      workshop.requests++;
      return route.fulfill({
        json: {
          active: true,
          schema_version: 1,
          session_id: 'flow-regression',
          base_version: version,
          base_model_sha256: createHash('sha256').update(modelBytes).digest('hex'),
          revision: workshop.revision,
          operations: workshop.hotspot
            ? [
                {
                  sequence: 1,
                  entity: 'hotspot',
                  action: 'update',
                  id: workshop.hotspot.id,
                  value: { ...workshop.hotspot, title: `Audit atelier ${workshop.revision}` },
                },
              ]
            : [],
        },
      });
    }
    const relative = decodeURIComponent(url.pathname.slice(new URL(pageBase).pathname.length)) || 'index.html';
    const target = resolve(dist, relative);
    assert.ok(target.startsWith(dist + sep), 'Static requests stay inside dist');
    await route.fulfill({
      body: await readFile(target),
      contentType:
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.webmanifest': 'application/manifest+json',
        }[extname(target)] || 'application/octet-stream',
    });
  });
  return page;
}

async function visit(page, view, params = {}) {
  await page.goto(`${pageBases.get(page) || base}#/${view}?${new URLSearchParams({ version, ...params })}`);
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
}

async function world(page) {
  await page.waitForFunction(() => Boolean(document.querySelector('.flow-map-canvas')?.getAttribute('data-layout')));
  const layout = JSON.parse(await page.locator('.flow-map-canvas').getAttribute('data-layout'));
  assert.ok(Array.isArray(layout) && layout.length > 0, 'The complete spatial layout is inspectable');
  for (const item of layout) {
    assert.ok(byId.has(item.id), `Spatial object ${item.id} belongs to the selected publication`);
    assert.ok(
      !['capability', 'behavior', 'reference'].includes(byId.get(item.id).kind),
      'Flux stops at Business Areas; detailed objects remain in published exchange data',
    );
    for (const key of ['x', 'y', 'width', 'height'])
      assert.ok(Number.isFinite(item[key]), `${item.id}.${key} is finite`);
    assert.ok(item.width > 0 && item.height > 0, `${item.id} has positive dimensions`);
  }
  return layout.toSorted((a, b) => a.id.localeCompare(b.id));
}

async function assertMapText(page) {
  const result = await page.locator('.flow-map-canvas').evaluate((canvas) => {
    const titles = [...canvas.querySelectorAll('.spatial-object-title')];
    const captions = [...canvas.querySelectorAll('.flow-exchange-label')];
    return {
      captions: captions.length,
      objectCount: canvas.querySelectorAll('.spatial-map-object').length,
      flows: canvas.querySelectorAll('.flow-exchange').length,
      captionTexts: captions.map((element) => ({
        text: element.textContent,
        expected: element.dataset.flowCaption,
        badge: element.dataset.flowBadge,
      })),
      clipped: [...titles, ...captions]
        .filter(
          (element) => element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1,
        )
        .map((element) => element.textContent),
      titles: titles.map((element) => ({
        id: element.closest('[data-node-id]').dataset.nodeId,
        text: element.textContent,
        compact: element.dataset.titleDisplay === 'compact',
        detached: (() => {
          if (!element.classList.contains('is-external')) return false;
          const owner = [...canvas.querySelectorAll('.spatial-map-object')].find(
            (node) => node.dataset.nodeId === element.dataset.nodeId,
          );
          if (!owner) return true;
          const a = element.getBoundingClientRect(),
            b = owner.getBoundingClientRect();
          const gap = canvas.clientHeight < 220 ? 65 : 33;
          return (
            Math.max(b.left - a.right, a.left - b.right, 0) > gap ||
            Math.max(b.top - a.bottom, a.top - b.bottom, 0) > gap
          );
        })(),
        accessibleName: element.getAttribute('aria-label'),
        pixels:
          parseFloat(getComputedStyle(element).fontSize) *
          (element.closest('.react-flow') ? Number(canvas.dataset.zoom) : 1),
      })),
      collisions: [...captions, ...titles.filter((element) => element.classList.contains('is-external'))].flatMap(
        (element, index, elements) => {
          const a = element.getBoundingClientRect();
          const overlaps = (other) => {
            const b = other.getBoundingClientRect();
            return (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            );
          };
          const hud = [
            ...canvas.querySelectorAll('.flow-camera-tools, .map-overlay-tools, .react-flow__minimap, .flow-scrollbar'),
          ];
          return [...elements.slice(index + 1), ...hud]
            .filter(overlaps)
            .map((other) => [element.textContent, other.className.baseVal || other.className]);
        },
      ),
    };
  });
  assert.equal(result.captions, result.flows, 'Every visible flow retains its caption at reduced zoom');
  assert.deepEqual(result.clipped, [], 'Titles and captions fit without clipping');
  assert.equal(result.titles.length, result.objectCount, 'Every territory has a visible title or readable identifier');
  assert.deepEqual(result.collisions, [], 'Annotations do not overlap each other or floating controls');
  for (const caption of result.captionTexts) {
    assert.ok(caption.expected, 'Every caption carries its complete published display text');
    if (caption.badge) assert.equal(caption.text, caption.badge, 'A short identifier is explicitly numbered');
    else
      assert.equal(
        caption.text.replace(/\s/g, ''),
        caption.expected.replace(/\s/g, ''),
        'Every word of an unnumbered caption is visible; no silent truncation',
      );
  }
  for (const title of result.titles) {
    assert.equal(
      title.detached,
      false,
      'An external title stays near its own territory, including short landscape views',
    );
    assert.ok(title.pixels >= 10.99, 'Titles never shrink below 11 screen pixels');
    assert.equal(
      title.accessibleName,
      `Ouvrir ${nameOf(byId.get(title.id))}`,
      'Compact titles preserve the full accessible name',
    );
    if (!title.compact)
      assert.equal(
        title.text.replace(/\s/g, ''),
        nameOf(byId.get(title.id)).replace(/\s/g, ''),
        'Titles retain every word',
      );
  }
}

async function viewport(page) {
  return page.locator('.flow-map-canvas .react-flow__viewport').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.e, y: matrix.f, zoom: matrix.a };
  });
}

async function waitCameraIdle(page) {
  let previous = await viewport(page);
  let stable = 0;
  for (let poll = 0; poll < 30; poll++) {
    await page.waitForTimeout(50);
    const next = await viewport(page);
    stable =
      Math.hypot(next.x - previous.x, next.y - previous.y) < 0.01 && Math.abs(next.zoom - previous.zoom) < 0.0001
        ? stable + 1
        : 0;
    if (stable === 3) return;
    previous = next;
  }
  assert.fail('The Flux camera did not finish moving');
}

async function waitViewportChange(page, before, zoomOnly = false) {
  await page.waitForFunction(
    ({ before, zoomOnly }) => {
      const element = document.querySelector('.flow-map-canvas .react-flow__viewport');
      if (!element) return false;
      const matrix = new DOMMatrix(getComputedStyle(element).transform);
      return (
        Math.abs(matrix.a - before.zoom) > 0.001 ||
        (!zoomOnly && Math.hypot(matrix.e - before.x, matrix.f - before.y) > 2)
      );
    },
    { before, zoomOnly },
  );
  await waitCameraIdle(page);
}

async function assertWorld(page, expected, reason) {
  assert.deepEqual(await world(page), expected, reason);
}

async function assertNoPageOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}

async function selectFraming(page, mode) {
  const compact = page.getByRole('combobox', { name: 'Cadrage des flux', exact: true });
  if (await compact.isVisible()) await compact.selectOption(mode);
  else
    await page
      .getByRole('button', {
        name: { standard: 'Échelle standard', width: 'Cadrer la largeur', all: 'Tout cadrer' }[mode],
        exact: true,
      })
      .click();
  await waitCameraIdle(page);
}

async function assertFloatingTools(page) {
  const canvas = page.locator('.flow-map-canvas');
  const before = { camera: await viewport(page), bounds: await canvas.boundingBox() };
  assert.equal(
    await page.locator('.flow-map-panel > .flow-camera-tools,.flow-map-legend,.flow-map-panel > .map-footer').count(),
    0,
    'No permanent strips reduce the map',
  );
  await page.getByRole('button', { name: 'Légende', exact: true }).click();
  const legend = page.getByRole('dialog', { name: 'Légende', exact: true });
  await legend.waitFor();
  const bounds = await legend.boundingBox(),
    screen = page.viewportSize();
  assert.ok(
    bounds.x >= 0 &&
      bounds.y >= 0 &&
      bounds.x + bounds.width <= screen.width + 1 &&
      bounds.y + bounds.height <= screen.height + 1,
    'The floating legend stays within the screen',
  );
  const types = await page
    .locator('.flow-exchange')
    .evaluateAll((elements) => [
      ...new Set(
        elements.map((e) => (e.classList.contains('is-knowledge') ? 'Apport de connaissance' : 'Partage de données')),
      ),
    ]);
  for (const label of ['Partage de données', 'Apport de connaissance'])
    assert.equal(
      (await legend.innerText()).includes(label),
      types.includes(label),
      'The legend follows the displayed flow types',
    );
  assert.equal(await page.locator('.react-flow__minimap').count(), 0, 'Opening the legend folds the navigator');
  assert.deepEqual(
    { camera: await viewport(page), bounds: await canvas.boundingBox() },
    before,
    'Legend opening preserves map geometry and camera',
  );
  await page.keyboard.press('Escape');
  await legend.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Légende');
  assert.equal(await legend.count(), 0, 'Escape closes the legend and restores focus');
  const tools = await page.locator('.flow-camera-tools').boundingBox(),
    frame = await canvas.boundingBox();
  assert.ok(
    tools.x >= frame.x &&
      tools.y >= frame.y &&
      tools.x + tools.width <= frame.x + frame.width + 1 &&
      tools.y + tools.height <= frame.y + frame.height + 1,
    'Camera tools remain inside the map',
  );
  const dock = await page.locator('.flow-map-canvas > .map-overlay-tools').boundingBox();
  assert.ok(
    tools.x >= dock.x + dock.width ||
      tools.x + tools.width <= dock.x ||
      tools.y >= dock.y + dock.height ||
      tools.y + tools.height <= dock.y,
    'Floating tools do not overlap each other',
  );
}

async function assertFraming(page, mode, expectedWorld) {
  await waitCameraIdle(page);
  assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-framing'), mode);
  const overflow = await page.locator('.flow-map-canvas').evaluate((canvas, mode) => {
    const frame = canvas.getBoundingClientRect();
    return [...canvas.querySelectorAll('.spatial-map-object')].flatMap((element) => {
      const box = element.getBoundingClientRect();
      return box.left < frame.left - 1 ||
        box.right > frame.right + 1 ||
        (mode === 'all' && (box.top < frame.top - 1 || box.bottom > frame.bottom + 1))
        ? [element.dataset.nodeId]
        : [];
    });
  }, mode);
  assert.deepEqual(overflow, [], `${mode} fits the actual rendered territories`);
  assert.equal(await page.locator('.flow-scrollbar.is-horizontal').count(), 0, `${mode} needs no horizontal scrollbar`);
  if (mode === 'all')
    assert.equal(await page.locator('.flow-scrollbar').count(), 0, 'Whole-map framing needs no scrollbars');
  await assertWorld(page, expectedWorld, 'Framing transitions preserve the spatial world');
  await assertNoPageOverflow(page);
}

async function flowFilters(page, action) {
  await page.locator('.map-flow-picker > button').click();
  const dialog = page.getByRole('dialog', { name: 'Filtres des flux', exact: true });
  await dialog.waitFor();
  const result = await action(dialog);
  await dialog.getByRole('button', { name: 'Fermer les filtres des flux', exact: true }).click();
  return result;
}

async function setFlowVisibility(page, visible) {
  await flowFilters(page, (dialog) =>
    dialog.getByRole('checkbox', { name: 'Afficher les flux', exact: true }).setChecked(visible),
  );
}

async function flowVisibility(page) {
  return flowFilters(page, (dialog) =>
    dialog.getByRole('checkbox', { name: 'Afficher les flux', exact: true }).isChecked(),
  );
}

async function publishedEdges(page) {
  const edges = await page.locator('.flow-exchange').evaluateAll((elements) =>
    elements.map((element) => ({
      source: element.getAttribute('data-source-id'),
      target: element.getAttribute('data-target-id'),
      ids: element.getAttribute('data-relation-ids'),
    })),
  );
  assert.ok(edges.length > 0, 'The Flux view shows published exchanges');
  for (const edge of edges) {
    assert.ok(byId.has(edge.source) && byId.has(edge.target), 'Projected exchange ends are published objects');
    const ids = parseIds(edge.ids);
    assert.ok(ids.length > 0, 'Every projected exchange identifies its published relations');
    for (const id of ids) {
      const relation = relations.get(id);
      assert.ok(relation, `Exchange relation ${id} belongs to the selected publication`);
      assert.ok(!['contains', 'presents'].includes(relation.type), 'Hierarchy membership is not an exchange');
      assert.ok(belongs(relation.source_id, edge.source), 'The projected source contains the published source');
      assert.ok(belongs(relation.target_id, edge.target), 'The projected target contains the published target');
    }
  }
  return edges.length;
}

try {
  const staging = {
    revision: 1,
    requests: 0,
    hotspot: model.hotspot_catalog?.hotspots.find((hotspot) =>
      hotspot.location.node_ids.some((id) => belongs(id, domain.id)),
    ),
  };
  const workshopPage = await preparePage({ workshop: staging });
  let workshopWorkers = 0;
  workshopPage.on('worker', (worker) => {
    if (worker.url().includes('flowMapWorker-')) workshopWorkers++;
  });
  await visit(workshopPage, 'flows', { scope: domain.id, node: domain.id, hf: JSON.stringify({ enabled: true }) });
  const workshopWorld = await world(workshopPage);
  await waitCameraIdle(workshopPage);
  if (staging.hotspot) {
    await workshopPage.locator('.map-hotspot-picker > button').click();
    await workshopPage.getByText('Audit atelier 1', { exact: true }).waitFor();
    await workshopPage.keyboard.press('Escape');
  }
  const initialWorkers = workshopWorkers;
  await workshopPage.evaluate(() => {
    window.auditBusyTransitions = 0;
    window.auditWorkshopObserver = new MutationObserver(() => {
      if (document.querySelector('.flow-map-canvas[aria-busy="true"]')) window.auditBusyTransitions++;
    });
    window.auditWorkshopObserver.observe(document.querySelector('.flow-map-canvas'), {
      attributes: true,
      childList: true,
    });
  });
  staging.revision++;
  const requestsBefore = staging.requests;
  await workshopPage.waitForResponse(
    (response) => response.url().endsWith('/__atlas__/workshop/staging.json') && staging.requests > requestsBefore,
  );
  await workshopPage.waitForTimeout(500);
  if (staging.hotspot) {
    await workshopPage.locator('.map-hotspot-picker > button').click();
    await workshopPage.getByText('Audit atelier 2', { exact: true }).waitFor();
    await workshopPage.keyboard.press('Escape');
  }
  assert.equal(
    workshopWorkers,
    initialWorkers,
    'A hotspot-only workshop revision does not create another layout worker',
  );
  assert.equal(
    await workshopPage.evaluate(() => window.auditBusyTransitions),
    0,
    'Workshop changes do not replace the map with a loading state',
  );
  await assertWorld(workshopPage, workshopWorld, 'Workshop changes preserve geometry');
  await workshopPage.close();
  checks.push('Workshop revisions retain cached geometry without rebuilding or hiding the Flux map');
  if (process.argv.includes('--workshop-only')) {
    assert.deepEqual(errors, []);
    await browser.close();
    console.log(JSON.stringify({ status: 'passed', checks: checks.length, errors }));
    process.exit(0);
  }
  const page = await preparePage();
  await visit(page, 'map', { node: domain.id, scope: domain.id, mapDepth: '3' });
  await page.getByRole('tab', { name: 'Catalogue', exact: true }).waitFor();
  for (const label of ['Pleine page', 'Pleine largeur']) {
    const choice = page.getByRole('button', { name: label, exact: true });
    await choice.click();
    assert.equal(await choice.getAttribute('aria-pressed'), 'true');
  }
  checks.push('Catalogue retains its independent framing choices');

  await page.getByRole('tab', { name: 'Flux', exact: true }).click();
  await page.locator('.flow-map-panel .flow-map-canvas').waitFor();
  assert.ok(new URL(page.url()).hash.startsWith('#/flows?'));
  for (const label of ['Auto', 'Pleine page', 'Pleine largeur'])
    assert.equal(await page.locator('.flow-map-panel').getByRole('button', { name: label, exact: true }).count(), 0);
  assert.equal(
    await page
      .locator('.flow-map-panel')
      .getByRole('button', { name: /^Détail / })
      .count(),
    0,
  );
  await waitCameraIdle(page);
  const baseline = await world(page);
  assert.ok(
    baseline.every((box) => ['area', 'group', 'business_area'].includes(byId.get(box.id).kind)),
    'A domain map presents only its immediate published children',
  );
  await publishedEdges(page);
  checks.push('Flux is a distinct spatial view with published objects and exchanges');

  await selectFraming(page, 'standard');
  await waitCameraIdle(page);
  const standardCamera = await viewport(page);
  assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-framing'), 'standard');
  assert.ok(await page.locator('.flow-scrollbar').count(), 'Standard exposes overflowing axes');
  const surface = page.locator('.flow-map-canvas');
  const availableScrollDirection = () =>
    page.locator('.flow-scrollbar').evaluateAll((bars) => {
      const bar = bars.find((element) => element.classList.contains('is-vertical')) || bars[0];
      return Number(bar.getAttribute('aria-valuenow')) > Number(bar.getAttribute('aria-valuemax')) / 2 ? -1 : 1;
    });
  const surfaceBounds = await surface.boundingBox();
  await page.mouse.move(surfaceBounds.x + surfaceBounds.width / 2, surfaceBounds.y + surfaceBounds.height / 2);
  await page.mouse.wheel(0, 200 * (await availableScrollDirection()));
  await waitViewportChange(page, standardCamera);
  let moved = await viewport(page);
  assert.equal(moved.zoom, standardCamera.zoom, 'Ordinary wheel moves without zooming');
  await assertWorld(page, baseline, 'Wheel scrolling preserves geometry');
  await selectFraming(page, 'standard');
  moved = await viewport(page);
  await surface.focus();
  await page.keyboard.press((await availableScrollDirection()) > 0 ? 'PageDown' : 'PageUp');
  await waitViewportChange(page, moved);
  assert.equal((await viewport(page)).zoom, moved.zoom, 'PageDown preserves zoom');
  const scrollbar = page.locator('.flow-scrollbar.is-horizontal');
  const bar = (await scrollbar.count()) ? scrollbar : page.locator('.flow-scrollbar.is-vertical');
  const beforeBar = await viewport(page);
  await bar.evaluate((element) => {
    if (element.classList.contains('is-horizontal')) element.scrollLeft += element.scrollLeft > 100 ? -100 : 100;
    else element.scrollTop += element.scrollTop > 100 ? -100 : 100;
  });
  await waitViewportChange(page, beforeBar);
  moved = await viewport(page);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -100);
  await page.keyboard.up('Control');
  await waitViewportChange(page, moved, true);
  await assertWorld(page, baseline, 'Scrollbar and Ctrl-wheel preserve geometry');
  await selectFraming(page, 'standard');
  checks.push('Native scrollbars, wheel and PageDown move the camera; Ctrl-wheel zooms without moving territories');
  const captions = await page.evaluate(() => {
    const paths = [...document.querySelectorAll('.flow-exchange .flow-exchange-hit')].map((path) => ({
      ids: path.closest('[data-relation-ids]').dataset.relationIds,
      samples: Array.from({ length: Math.ceil(path.getTotalLength() / 4) + 1 }, (_, index) =>
        path.getPointAtLength(Math.min(path.getTotalLength(), index * 4)),
      ),
    }));
    const labels = [...document.querySelectorAll('.flow-exchange-caption')];
    const collisions = labels.flatMap((group) => {
      const label = group.querySelector('foreignObject');
      const x = label.x.baseVal.value,
        y = label.y.baseVal.value,
        width = label.width.baseVal.value,
        height = label.height.baseVal.value;
      return paths
        .filter(
          (path) =>
            path.ids !== group.dataset.relationIds &&
            path.samples.some(
              (point) => point.x > x - 4 && point.x < x + width + 4 && point.y > y - 4 && point.y < y + height + 4,
            ),
        )
        .map((path) => ({ label: group.dataset.relationIds, crossing: path.ids }));
    });
    return { labels: labels.length, paths: paths.length, collisions };
  });
  assert.equal(
    captions.labels,
    captions.paths,
    'Every current domain exchange has a readable caption at Standard scale',
  );
  assert.deepEqual(captions.collisions, [], 'No foreign arrow crosses a rendered caption');
  checks.push('Dense Standard captions remain attached to their own routes and protected from other arrows');
  for (const [label, framing] of [
    ['Cadrer la largeur', 'width'],
    ['Tout cadrer', 'all'],
  ]) {
    await selectFraming(page, framing);
    await waitCameraIdle(page);
    assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-framing'), framing);
    await assertWorld(page, baseline, `${label} changes only the camera`);
  }
  assert.ok(standardCamera.zoom > (await viewport(page)).zoom, 'Standard preserves a readable neighborhood');
  await selectFraming(page, 'standard');
  await waitCameraIdle(page);
  const returnedStandard = await viewport(page);
  assert.ok(Math.hypot(returnedStandard.x - standardCamera.x, returnedStandard.y - standardCamera.y) < 0.2);
  assert.ok(Math.abs(returnedStandard.zoom - standardCamera.zoom) < 0.0001);
  checks.push('Standard, width and whole-map framing preserve geography and restore the natural camera');

  let exchangeIds = await page.locator('.flow-exchange-label').evaluateAll((elements) => {
    const canvas = document.querySelector('.flow-map-canvas').getBoundingClientRect();
    return elements
      .find((element) => {
        const bounds = element.getBoundingClientRect();
        const x = bounds.x + bounds.width / 2;
        const y = bounds.y + bounds.height / 2;
        return (
          x > canvas.left &&
          x < canvas.right &&
          y > canvas.top &&
          y < canvas.bottom &&
          document.elementFromPoint(x, y) === element
        );
      })
      ?.closest('[data-relation-ids]')
      ?.getAttribute('data-relation-ids');
  });
  if (exchangeIds) {
    await page.locator(`[data-relation-ids="${exchangeIds}"] .flow-exchange-label`).click();
  } else {
    // Dense overviews may suppress labels; every exchange remains reachable by keyboard.
    const path = page.locator('.flow-exchange-hit[role="button"]').first();
    await path.focus();
    exchangeIds = await path.evaluate((element) =>
      element.closest('[data-relation-ids]').getAttribute('data-relation-ids'),
    );
    await path.press('Enter');
  }
  assert.ok(exchangeIds, 'A published exchange can be opened through its label or keyboard action');
  const exchangeDetail = page.getByRole('complementary', { name: 'Détail du flux' });
  await exchangeDetail.waitFor();
  const detailText = await exchangeDetail.innerText();
  for (const id of parseIds(exchangeIds)) {
    const relation = relations.get(id);
    assert.ok(
      detailText.includes(nameOf(byId.get(relation.source_id))),
      'The detail names the original published source',
    );
    assert.ok(
      detailText.includes(nameOf(byId.get(relation.target_id))),
      'The detail names the original published target',
    );
    for (const item of relation.data_exchange?.contents || [])
      assert.ok(detailText.includes(item.name), `Published content ${item.name} is readable`);
  }
  await page.getByRole('button', { name: 'Fermer le détail du flux', exact: true }).click();
  checks.push('Exchange details preserve published orientation and contents');

  const beforeMiniMapToggle = await viewport(page);
  await page.getByRole('button', { name: 'Réduire le navigateur de carte', exact: true }).click();
  assert.equal(await page.locator('.react-flow__minimap').count(), 0);
  await page.getByRole('button', { name: 'Afficher le navigateur de carte', exact: true }).click();
  await page.locator('.react-flow__minimap').waitFor();
  assert.deepEqual(await viewport(page), beforeMiniMapToggle, 'The miniature can fold without moving the map');
  await assertWorld(page, baseline, 'Folding the miniature preserves geography');
  checks.push('The desktop miniature folds without changing geography or camera');
  await assertFloatingTools(page);
  await page.getByRole('button', { name: 'Afficher le navigateur de carte', exact: true }).click();
  checks.push('Floating legend preserves camera, restores focus and follows the displayed flow types');

  const beforeZoom = await viewport(page);
  await page.getByRole('button', { name: 'Zoom avant', exact: true }).click();
  await waitViewportChange(page, beforeZoom, true);
  await assertWorld(page, baseline, 'Zoom does not change world geometry');
  const afterZoom = await viewport(page);
  assert.ok(afterZoom.zoom > beforeZoom.zoom, 'Zoom avant increases scale');
  assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-framing'), 'custom');
  await page.getByRole('button', { name: 'Zoom arrière', exact: true }).click();
  await waitViewportChange(page, afterZoom, true);
  await assertWorld(page, baseline, 'Zoom arrière does not change world geometry');
  checks.push('Zoom controls transform the viewport without rearranging objects');

  const initialObjects = await page.locator('.spatial-map-object').count();
  const projectedExchangeIndex = await page.locator('.flow-exchange').evaluateAll(
    (elements, published) =>
      elements.findIndex((element) =>
        element
          .getAttribute('data-relation-ids')
          .split('|')
          .some((id) => {
            const relation = published.find((item) => item.id === id);
            return (
              relation &&
              (relation.source_id !== element.getAttribute('data-source-id') ||
                relation.target_id !== element.getAttribute('data-target-id'))
            );
          }),
      ),
    model.relations,
  );
  assert.ok(projectedExchangeIndex >= 0, 'An overview exchange projects a more detailed published endpoint');
  const projectedExchange = page.locator('.flow-exchange-hit[role="button"]').nth(projectedExchangeIndex);
  await projectedExchange.focus();
  await projectedExchange.press('Enter');
  await exchangeDetail.waitFor();
  const detailBeforeSemanticZoom = await exchangeDetail.innerText();
  for (let step = 0; step < 18 && (await viewport(page)).zoom < 1.5; step++) {
    const previous = await viewport(page);
    await page.getByRole('button', { name: 'Zoom avant', exact: true }).click();
    await waitViewportChange(page, previous, true);
  }
  assert.equal(
    await page.locator('.spatial-map-object').count(),
    initialObjects,
    'Zoom enlarges the same hierarchy frontier without adding descendants',
  );
  assert.equal(
    await page
      .locator(
        '.spatial-map-object.kind-capability, .spatial-map-object.kind-behavior, .spatial-map-object.kind-reference',
      )
      .count(),
    0,
    'Even high zoom never turns Flux into a capability catalogue',
  );
  await assertWorld(page, baseline, 'Revealing hierarchy does not change world geometry');
  assert.equal(
    await exchangeDetail.innerText(),
    detailBeforeSemanticZoom,
    'Semantic zoom preserves the opened exchange and its original published details',
  );
  await page.getByRole('button', { name: 'Fermer le détail du flux', exact: true }).click();
  await page.waitForFunction(() =>
    document.activeElement?.matches('.flow-exchange-label, .flow-exchange-hit, .flow-camera-tools button'),
  );
  await selectFraming(page, 'all');
  await waitCameraIdle(page);
  checks.push('Semantic zoom reveals descendants while preserving territories, opened details and return focus');

  const canvasBox = await page.locator('.flow-map-canvas').boundingBox();
  assert.ok(canvasBox && canvasBox.width > 100 && canvasBox.height > 100);
  const labelPositions = await page.locator('.flow-exchange-caption').evaluateAll((elements) =>
    elements.map((element) => {
      const label = element.querySelector('foreignObject');
      return [element.getAttribute('data-relation-ids'), label.getAttribute('x'), label.getAttribute('y')];
    }),
  );
  const beforePan = await viewport(page);
  const dragStart = await page.locator('.flow-map-canvas').evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    for (const fy of [0.1, 0.2, 0.5, 0.7])
      for (const fx of [0.9, 0.7, 0.5, 0.3]) {
        const point = { x: bounds.x + bounds.width * fx, y: bounds.y + bounds.height * fy };
        if (document.elementFromPoint(point.x, point.y)?.classList.contains('react-flow__pane')) return point;
      }
    return null;
  });
  assert.ok(dragStart, 'Dragging starts on the background outside the readable annotations');
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragStart.x - 90, dragStart.y + 60, { steps: 10 });
  await page.mouse.up();
  await waitViewportChange(page, beforePan);
  await assertWorld(page, baseline, 'Dragging the map does not change world geometry');
  assert.deepEqual(
    await page.locator('.flow-exchange-caption').evaluateAll((elements) =>
      elements.map((element) => {
        const label = element.querySelector('foreignObject');
        return [element.getAttribute('data-relation-ids'), label.getAttribute('x'), label.getAttribute('y')];
      }),
    ),
    labelPositions,
    'Panning translates the same captions without hiding or repositioning them',
  );
  checks.push('The spatial map pans through pointer dragging');

  await page.setViewportSize({ width: 1100, height: 800 });
  await assertWorld(page, baseline, 'Resizing does not rearrange the spatial layout');
  await assertNoPageOverflow(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await assertWorld(page, baseline, 'Fullscreen does not rearrange the spatial layout');
  await page.screenshot({ path: resolve(output, 'flows-fullscreen.png') });
  await page.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await assertWorld(page, baseline, 'Leaving fullscreen preserves world geometry');
  checks.push('Window size and fullscreen preserve world coordinates');

  assert.equal(await flowVisibility(page), true);
  await setFlowVisibility(page, false);
  await page.waitForFunction(() => !document.querySelector('.flow-exchange'));
  await assertFloatingTools(page);
  await assertWorld(page, baseline, 'Hiding exchanges does not rearrange the map');
  await setFlowVisibility(page, true);
  await page.locator('.flow-exchange').first().waitFor({ state: 'attached' });
  await publishedEdges(page);
  await assertWorld(page, baseline, 'Showing exchanges preserves world geometry');
  checks.push('The exchange layer changes independently of layout');

  await flowFilters(page, async (dialog) => {
    await dialog.getByRole('checkbox', { name: 'Apport de connaissance', exact: true }).uncheck();
  });
  await page.waitForFunction(() => !document.querySelector('.flow-exchange.is-knowledge'));
  assert.ok(
    await page.locator('.flow-exchange:not(.is-knowledge)').count(),
    'Data exchanges remain after filtering knowledge',
  );
  await flowFilters(page, async (dialog) => {
    await dialog.getByRole('checkbox', { name: 'Partage de données', exact: true }).uncheck();
    await dialog.getByRole('checkbox', { name: 'Apport de connaissance', exact: true }).check();
  });
  await page.waitForFunction(() => !document.querySelector('.flow-exchange:not(.is-knowledge)'));
  await assertWorld(page, baseline, 'Flow type and presentation filters never change geography');
  await flowFilters(page, async (dialog) => {
    await dialog.getByRole('checkbox', { name: 'Partage de données', exact: true }).check();
  });
  checks.push('The Flux picker independently filters published data and knowledge exchanges and their presentation');

  const visibleHotspots = (model.hotspot_catalog?.hotspots || []).filter(
    (hotspot) => hotspot.visible !== false && hotspot.location.node_ids.some((id) => belongs(id, domain.id)),
  );
  if (visibleHotspots.length) {
    await page.locator('.flow-map-panel .map-hotspot-picker > button').click();
    await page.getByRole('checkbox', { name: 'Afficher les points chauds', exact: true }).check();
    await page.getByRole('button', { name: 'Fermer les filtres', exact: true }).click();
    await page
      .locator('.flow-hotspot-marker [data-hotspot-ids], .flow-hotspot-marker[data-hotspot-ids]')
      .first()
      .waitFor({ state: 'attached' });
    const hotspotIds = await page
      .locator('.flow-hotspot-marker [data-hotspot-ids], .flow-hotspot-marker[data-hotspot-ids]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-hotspot-ids')));
    const expected = new Set(visibleHotspots.map((hotspot) => hotspot.id));
    for (const ids of hotspotIds)
      for (const id of parseIds(ids)) assert.ok(expected.has(id), `${id} is a visible published hotspot in scope`);
    await assertWorld(page, baseline, 'Hotspots do not rearrange the spatial map');
    checks.push('Hotspot markers come from the selected publication and preserve geometry');
    await selectFraming(page, 'standard');
    await waitCameraIdle(page);
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.flow-map-canvas').getBoundingClientRect();
      const names = [...document.querySelectorAll('.spatial-object-title')].flatMap((element) => {
        const range = document.createRange();
        const content = element.querySelector('.spatial-object-name') || element;
        range.selectNodeContents(content);
        const button = content.getBoundingClientRect();
        return [...range.getClientRects()].flatMap((rect) => {
          const left = Math.max(rect.left, button.left, canvas.left);
          const top = Math.max(rect.top, button.top, canvas.top);
          const right = Math.min(rect.right, button.right, canvas.right);
          const bottom = Math.min(rect.bottom, button.bottom, canvas.bottom);
          return right > left && bottom > top ? [{ left, top, right, bottom }] : [];
        });
      });
      return [...document.querySelectorAll('.flow-map-hotspots .hotspot-map-marker')].every((element) => {
        const rect = element.getBoundingClientRect();
        const x = rect.x + rect.width / 2;
        const y = rect.y + rect.height / 2;
        return names.every(
          (name) =>
            Math.hypot(
              x - Math.max(name.left, Math.min(x, name.right)),
              y - Math.max(name.top, Math.min(y, name.bottom)),
            ) >=
            rect.width / 2 + 1.5,
        );
      });
    });
    checks.push('Hotspots leave actual rendered names unobstructed after semantic zoom');
  }

  const selection = model.application_catalog?.selections.find((item) =>
    item.mappings?.some((mapping) => belongs(mapping.node_id, domain.id)),
  );
  if (selection) {
    const product = model.application_catalog.products.find((item) => item.id === selection.product_id);
    const contextNames = {
      'beaumanoir-historique': 'SI Beaumanoir Marques Historiques',
      boardriders: 'SI Boardriders',
      sarenza: 'SI Sarenza',
      'flow-platform': 'SI Beaumanoir cible',
    };
    await page.locator('.flow-map-panel .map-application-picker > button').click();
    const section = page
      .getByRole('dialog', { name: 'Applications sur la carte' })
      .locator('section')
      .filter({
        has: page.getByRole('heading', {
          name: contextNames[selection.context_id] || selection.context_id,
          exact: true,
        }),
      });
    await section.getByRole('button', { name: product.name, exact: true }).click();
    await page.waitForFunction(
      (id) => new URLSearchParams(location.hash.split('?')[1]).get('app') === id,
      selection.id,
    );
    await page.locator('.spatial-application-mark').first().waitFor({ state: 'attached' });
    const marked = await page
      .locator('.spatial-application-mark')
      .evaluateAll((elements) =>
        elements.map((element) => element.closest('[data-node-id]')?.getAttribute('data-node-id')),
      );
    for (const id of marked)
      assert.ok(
        selection.mappings.some((mapping) => belongs(mapping.node_id, id)),
        `${id} contains an explicit published application mapping`,
      );
    await assertWorld(page, baseline, 'Application marks do not rearrange the map');
    checks.push('Application marks follow explicit published mappings without changing geometry');
  }

  await selectFraming(page, 'all');
  await waitCameraIdle(page);
  const candidate = await page.locator('.spatial-object-title').evaluateAll((elements, scopeId) => {
    const canvas = document.querySelector('.flow-map-canvas').getBoundingClientRect();
    return elements
      .find((element) => {
        const bounds = element.getBoundingClientRect();
        const id = element.closest('[data-node-id]')?.getAttribute('data-node-id');
        const x = bounds.x + bounds.width / 2;
        const y = bounds.y + bounds.height / 2;
        return (
          id !== scopeId &&
          bounds.width > 0 &&
          x > canvas.left &&
          x < canvas.right &&
          y > canvas.top &&
          y < canvas.bottom &&
          document.elementFromPoint(x, y)?.closest('.spatial-object-title') === element
        );
      })
      ?.closest('[data-node-id]')
      ?.getAttribute('data-node-id');
  }, domain.id);
  assert.ok(candidate && byId.has(candidate), 'A published spatial object is selectable');
  await page.locator(`.spatial-map-object[data-node-id="${candidate}"] .spatial-object-title`).click();
  await page.waitForFunction((id) => new URLSearchParams(location.hash.split('?')[1]).get('node') === id, candidate);
  if (
    model.nodes.some(
      (node) =>
        parent.get(node.id) === candidate &&
        ['business_system', 'domain', 'area', 'group', 'business_area'].includes(node.kind),
    )
  ) {
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('scope'), candidate);
    await page.locator('.flow-map-panel').waitFor();
  } else {
    assert.ok(new URL(page.url()).hash.startsWith('#/sheet?'), 'Clicking a terminal map object opens its sheet');
  }
  await page.goBack();
  await page.locator('.flow-map-panel').waitFor();
  await waitCameraIdle(page);
  await assertWorld(page, baseline, 'Back returns from the entered object to the original map');
  checks.push('A single object click enters its map or opens its terminal sheet, with working Back navigation');
  await visit(page, 'flows', { node: candidate, scope: domain.id, mapDepth: '3' });
  await page.locator('.flow-map-panel').waitFor();
  await waitCameraIdle(page);
  const selectedRoute = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  await page.getByRole('button', { name: 'Options de navigation', exact: true }).click();
  await page.getByRole('button', { name: 'Centrer la sélection', exact: true }).click();
  await page.keyboard.press('Escape');
  await waitCameraIdle(page);
  const centeredCamera = await viewport(page);
  await assertWorld(page, baseline, 'Centering the selection preserves world geometry');
  await page.getByRole('tab', { name: 'Catalogue', exact: true }).click();
  await page.locator('.map-panel, .universe-overview').first().waitFor();
  let route = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  assert.equal(route.get('node'), candidate, `Catalogue preserves selected object ${nameOf(byId.get(candidate))}`);
  assert.equal(route.get('scope'), selectedRoute.get('scope'), 'Catalogue preserves scope');
  assert.equal(route.get('version'), version, 'Catalogue preserves the selected publication');
  assert.equal(route.get('mapDepth'), '3', 'Catalogue preserves its explicitly chosen detail');
  assert.equal(
    await page.getByRole('button', { name: 'Pleine largeur', exact: true }).getAttribute('aria-pressed'),
    'true',
  );
  await page.getByRole('tab', { name: 'Flux', exact: true }).click();
  await page.locator('.flow-map-panel').waitFor();
  await waitCameraIdle(page);
  route = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  assert.equal(route.get('node'), candidate);
  assert.equal(route.get('scope'), selectedRoute.get('scope'));
  assert.equal(route.get('version'), version);
  const restoredCamera = await viewport(page);
  assert.ok(
    Math.hypot(restoredCamera.x - centeredCamera.x, restoredCamera.y - centeredCamera.y) < 0.2,
    'Returning to Flux restores its centered camera position',
  );
  assert.ok(Math.abs(restoredCamera.zoom - centeredCamera.zoom) < 0.0001, 'Returning to Flux restores its zoom');
  checks.push('Catalogue and Flux share selection, scope and publication while keeping catalogue controls');
  await page.screenshot({ path: resolve(output, 'flows-desktop.png') });

  const businessSystem = byId.get(parent.get(domain.id));
  if (businessSystem?.kind === 'business_system') {
    await setFlowVisibility(page, false);
    assert.equal(await flowVisibility(page), false);
    await page
      .locator('.breadcrumb')
      .getByRole('button', { name: nameOf(businessSystem), exact: true })
      .click();
    await page.waitForFunction(
      (id) => new URLSearchParams(location.hash.split('?')[1]).get('scope') === id,
      businessSystem.id,
    );
    await page.locator('.flow-map-panel').waitFor();
    await waitCameraIdle(page);
    assert.equal(await flowVisibility(page), true, 'A new scope reads its own exchange visibility');
    await page.goBack();
    await page.waitForFunction((id) => new URLSearchParams(location.hash.split('?')[1]).get('scope') === id, domain.id);
    await waitCameraIdle(page);
    assert.equal(await flowVisibility(page), false, 'Returning to a scope restores its hidden exchange layer');
    await assertWorld(page, baseline, 'Changing scope and returning keeps domain geometry');
    await setFlowVisibility(page, true);
    checks.push('Breadcrumb scope changes keep independent exchange layer state');
  }

  const commerce = byId.get('domain-sales');
  const procurement = byId.get('domain-sourcing-procurement');
  if (businessSystem?.id === 'system-business-operations' && commerce && procurement) {
    const exchangesWithSupply = model.relations.filter((relation) => {
      if (!['shares-data', 'provides-knowledge'].includes(relation.type)) return false;
      const supplySource = belongs(relation.source_id, domain.id);
      const supplyTarget = belongs(relation.target_id, domain.id);
      const neighborSource = belongs(relation.source_id, commerce.id) || belongs(relation.source_id, procurement.id);
      const neighborTarget = belongs(relation.target_id, commerce.id) || belongs(relation.target_id, procurement.id);
      return (supplySource && neighborTarget) || (neighborSource && supplyTarget);
    });
    if (exchangesWithSupply.length) {
      const originUrl = page.url();
      const originCamera = await viewport(page);
      for (let attempt = 0; attempt < 2; attempt++) {
        await page.locator('.map-flow-picker > button').click();
        const dialog = page.getByRole('dialog', { name: 'Filtres des flux', exact: true });
        await dialog
          .getByRole('button', { name: `Voir les échanges dans ${nameOf(businessSystem)}`, exact: true })
          .click();
        await page.waitForFunction(
          (id) => new URLSearchParams(location.hash.split('?')[1]).get('scope') === id,
          businessSystem.id,
        );
        await waitCameraIdle(page);
        const systemWorld = await world(page);
        assert.equal(systemWorld.length, 3, 'Business Operations presents its three Domains');
        assert.ok(systemWorld.every((box) => byId.get(box.id).kind === 'domain'));
        await page.waitForFunction(
          (ids) => {
            const displayed = new Set(
              [...document.querySelectorAll('.flow-exchange')].flatMap((element) =>
                element.getAttribute('data-relation-ids').split('|'),
              ),
            );
            return ids.every((id) => displayed.has(id));
          },
          exchangesWithSupply.map((relation) => relation.id),
        );
        const route = new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
        assert.equal(route.get('version'), version);
        assert.equal(route.get('node'), businessSystem.id);
        assert.equal(route.get('mapFocus'), null, 'The previous selection cannot hide the other neighbor');
        assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-exchange-mode'), 'main');
        assert.equal(await page.locator('.flow-map-canvas').getAttribute('data-framing'), 'standard');
        assert.ok(
          await page.locator('.flow-exchange-hit[tabindex="0"]').count(),
          'The Domain synthesis exchanges are visible at the initial Standard scale',
        );
        assert.equal(
          await page.locator('.flow-scope-note, .flow-presentation-note').count(),
          0,
          'No explanatory banner occupies the map',
        );
        if (attempt === 0) {
          await flowFilters(page, async (filters) => {
            await filters.getByRole('checkbox', { name: 'Afficher les flux', exact: true }).uncheck();
            await filters.getByRole('checkbox', { name: 'Partage de données', exact: true }).uncheck();
          });
        }
        await page.goBack();
        await page.waitForURL(originUrl);
        await waitCameraIdle(page);
        const restored = await viewport(page);
        assert.ok(Math.hypot(restored.x - originCamera.x, restored.y - originCamera.y) < 0.2);
        assert.ok(Math.abs(restored.zoom - originCamera.zoom) < 0.0001);
        await assertWorld(page, baseline, 'External exchange navigation preserves the original domain map');
      }
      checks.push(
        'The compact Flux menu opens every published Commerce/Procurement–Supply exchange despite cached filters, without a banner and with working Back navigation',
      );
    }
  }

  const rootPage = await preparePage();
  await visit(rootPage, 'flows', { scope: '@root' });
  await rootPage.locator('.flow-map-canvas').waitFor();
  await waitCameraIdle(rootPage);
  assert.ok(
    Math.abs(
      (await viewport(rootPage)).zoom - Number(await rootPage.locator('.flow-map-canvas').getAttribute('data-zoom')),
    ) < 0.001,
    'The initial enterprise camera agrees with the displayed zoom',
  );
  const rootWorld = await world(rootPage);
  const operations = rootWorld.find((box) => box.id === 'system-business-operations');
  const logistics = rootWorld.find((box) => box.id === 'domain-logistics-execution');
  if (operations && logistics) {
    assert.equal(logistics.x, operations.x, 'Logistics remains in the Business Operations column');
    assert.ok(logistics.y > operations.y + operations.height, 'Logistics remains below Business Operations');
  }
  assert.ok(
    rootWorld.length > 0 && rootWorld.every((box) => byId.get(box.id).kind === 'business_system'),
    'Enterprise Architecture synthesizes its published Business Systems',
  );
  await publishedEdges(rootPage);
  await assertNoPageOverflow(rootPage);
  await rootPage.screenshot({ path: resolve(output, 'flows-enterprise.png') });
  checks.push('Enterprise Architecture shows the published spatial territories and exchanges');

  const rootLabel = rootPage.locator('.flow-exchange-label').first();
  await rootLabel.focus();
  await rootPage.keyboard.press('Enter');
  await rootPage.getByRole('complementary', { name: 'Détail du flux' }).waitFor();
  await rootPage.keyboard.press('Escape');
  await rootPage.getByRole('complementary', { name: 'Détail du flux' }).waitFor({ state: 'detached' });
  await rootPage.waitForFunction(() => document.activeElement?.classList.contains('flow-exchange-label'));
  assert.ok(
    await rootLabel.evaluate((element) => element === document.activeElement),
    'Escape restores focus to the exchange label that opened its detail',
  );
  checks.push('Escape closes exchange detail opened from its label and restores keyboard focus');

  if (model.hotspot_catalog?.hotspots.some((hotspot) => hotspot.visible !== false)) {
    await rootPage.locator('.map-hotspot-picker > button').click();
    await rootPage.getByRole('checkbox', { name: 'Afficher les points chauds', exact: true }).check();
    const origin = new URLSearchParams(new URL(rootPage.url()).hash.split('?')[1]);
    const originCamera = await viewport(rootPage);
    await rootPage.locator('.hotspot-picker-open').first().click();
    await rootPage.locator('.hotspot-detail').waitFor();
    const returnLink = rootPage.getByRole('link', { name: /^Retour à la carte Flux/ });
    await returnLink.waitFor();
    assert.ok(
      (await returnLink.innerText()).includes(nameOf(model.nodes.find((node) => node.kind === 'universe'))),
      'The return link names Enterprise Architecture rather than the technical @root value',
    );
    assert.ok((await returnLink.getAttribute('href')).startsWith('#/flows?'));
    await returnLink.click();
    await rootPage.locator('.flow-map-panel').waitFor();
    await waitCameraIdle(rootPage);
    const restored = new URLSearchParams(new URL(rootPage.url()).hash.split('?')[1]);
    for (const parameter of ['version', 'scope', 'node', 'hf', 'app', 'component'])
      assert.equal(restored.get(parameter), origin.get(parameter), `Returning from a hotspot preserves ${parameter}`);
    const restoredViewport = await viewport(rootPage);
    assert.ok(Math.hypot(restoredViewport.x - originCamera.x, restoredViewport.y - originCamera.y) < 0.2);
    assert.ok(Math.abs(restoredViewport.zoom - originCamera.zoom) < 0.0001);
    await assertWorld(rootPage, rootWorld, 'Returning from a hotspot preserves the spatial world');
    checks.push('A hotspot sheet returns to the named Flux map with its publication, scope, filters and camera');
  }

  if (byId.has('domain-plan') && belongs('domain-plan', domain.id)) {
    const masterPage = await preparePage();
    await visit(masterPage, 'flows', { node: 'domain-plan', scope: domain.id });
    await masterPage.locator('.flow-map-canvas').waitFor();
    await waitCameraIdle(masterPage);
    await masterPage.locator('.spatial-map-object.is-active[data-node-id="domain-plan"]').waitFor();
    await assertWorld(masterPage, baseline, 'Focusing Master Plan keeps the same domain geometry');
    await assertNoPageOverflow(masterPage);
    await masterPage.screenshot({ path: resolve(output, 'flows-master-plan.png') });
    checks.push('A direct Master Plan link selects and frames the existing spatial territory');

    const masterBusinessAreas = model.nodes
      .filter((node) => node.kind === 'business_area' && parent.get(node.id) === 'domain-plan')
      .map((node) => node.id)
      .sort();
    if (masterBusinessAreas.length) {
      await masterPage.locator('[data-node-id="domain-plan"] .spatial-object-title').click();
      await masterPage.waitForFunction((ids) => {
        const canvas = document.querySelector('.flow-map-canvas');
        const boxes = JSON.parse(canvas?.getAttribute('data-layout') || '[]');
        return boxes.length === ids.length && boxes.every((box) => ids.includes(box.id));
      }, masterBusinessAreas);
      await waitCameraIdle(masterPage);
      assert.equal(new URLSearchParams(new URL(masterPage.url()).hash.split('?')[1]).get('scope'), 'domain-plan');
      await publishedEdges(masterPage);
      await masterPage.screenshot({ path: resolve(output, 'flows-master-plan-business-areas.png') });
      await masterPage.goBack();
      await masterPage.waitForFunction(
        (ids) => {
          const boxes = JSON.parse(document.querySelector('.flow-map-canvas')?.getAttribute('data-layout') || '[]');
          return boxes.length === ids.length && boxes.every((box) => ids.includes(box.id));
        },
        baseline.map((box) => box.id),
      );
      await waitCameraIdle(masterPage);
      await assertWorld(masterPage, baseline, 'Back from Master Plan restores the Domain frontier');
      checks.push('Entering Master Plan opens its published Business Areas and Back restores the Domain map');
    }
  }

  const mobile = await preparePage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await visit(mobile, 'flows', { node: domain.id, scope: domain.id, mapDepth: '3' });
  await mobile.locator('.flow-map-canvas').waitFor();
  await waitCameraIdle(mobile);
  assert.equal(await mobile.locator('.react-flow__minimap').count(), 0, 'The miniature does not cover a narrow map');
  const mobileWorld = await world(mobile);
  assert.deepEqual(mobileWorld, baseline, 'Mobile keeps the same spatial world as desktop');
  await assertNoPageOverflow(mobile);
  assert.ok(
    await mobile
      .locator('.spatial-map-object')
      .first()
      .evaluate((element) => element.getBoundingClientRect().width >= 150),
    'Mobile starts close enough to read a territory rather than shrinking the whole world',
  );
  await mobile.screenshot({ path: resolve(output, 'flows-mobile-initial.png') });
  const mobileBox = await mobile.locator('.flow-map-canvas').boundingBox();
  assert.ok(mobileBox && mobileBox.width >= 250 && mobileBox.height >= 180, 'Mobile retains a useful map viewport');
  const session = await mobile.context().newCDPSession(mobile);
  const touchStart = await mobile.locator('.flow-map-canvas').evaluate((canvas) => {
    const frame = canvas.getBoundingClientRect();
    for (const fy of [0.75, 0.6, 0.4, 0.2])
      for (const fx of [0.9, 0.7, 0.5, 0.3, 0.1]) {
        const point = { x: frame.x + frame.width * fx, y: frame.y + frame.height * fy };
        if (document.elementFromPoint(point.x, point.y)?.classList.contains('react-flow__pane')) return point;
      }
    return null;
  });
  assert.ok(touchStart, 'Touch panning starts on the map background, outside an object or exchange link');
  const mobileViewport = await viewport(mobile);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...touchStart, id: 1 }] });
  for (let step = 1; step <= 8; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: touchStart.x - step * 8, y: touchStart.y + step * 5, id: 1 }],
    });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await waitViewportChange(mobile, mobileViewport);
  await assertWorld(mobile, mobileWorld, 'Touch panning keeps the mobile world fixed');
  const mobileZoom = await viewport(mobile);
  await mobile.getByRole('button', { name: 'Zoom avant', exact: true }).click();
  await waitViewportChange(mobile, mobileZoom, true);
  await assertWorld(mobile, mobileWorld, 'Mobile zoom keeps the world fixed');
  await mobile.screenshot({ path: resolve(output, 'flows-mobile.png') });
  checks.push('Mobile keeps a spatial map with working touch pan and zoom');

  await mobile.setViewportSize({ width: 320, height: 480 });
  await mobile.getByRole('combobox', { name: 'Cadrage des flux', exact: true }).selectOption('standard');
  await waitCameraIdle(mobile);
  await assertWorld(mobile, mobileWorld, 'The smallest mobile viewport preserves geography');
  await assertNoPageOverflow(mobile);
  const tools = await mobile.locator('.flow-camera-tools').boundingBox();
  assert.ok(tools && tools.height <= 52, 'Short mobile camera controls occupy one row with accessible touch targets');
  assert.equal(
    await mobile.locator('.flow-scope-note, .flow-presentation-note').count(),
    0,
    'No boundary exchange banner occupies the mobile map',
  );
  const cameraBounds = await mobile.locator('.flow-map-canvas').boundingBox();
  assert.ok(
    tools.y >= cameraBounds.y && tools.y + tools.height <= cameraBounds.y + cameraBounds.height,
    'Camera controls float inside the map',
  );
  await assertFloatingTools(mobile);
  assert.ok(tools.x >= cameraBounds.x && tools.x + tools.width <= cameraBounds.x + cameraBounds.width);
  assert.ok(Math.abs((await viewport(mobile)).zoom - standardCamera.zoom) < 0.0001);
  await mobile.screenshot({ path: resolve(output, 'flows-mobile-short.png') });
  checks.push('Short mobile windows retain natural scale and compact one-row camera controls');

  for (const size of [
    { width: 320, height: 480 },
    { width: 390, height: 667 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await mobile.setViewportSize(size);
    await selectFraming(mobile, 'all');
    await assertMapText(mobile);
    for (const scrolled of [false, true]) {
      await mobile.locator('.flow-exchange-label').first().tap();
      const detail = mobile.getByRole('complementary', { name: 'Détail du flux', exact: true });
      await detail.waitFor();
      if (scrolled)
        await detail.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
      const close = detail.getByRole('button', { name: 'Fermer le détail du flux', exact: true });
      const bounds = await close.boundingBox();
      assert.ok(bounds.width >= 44 && bounds.height >= 44, 'The detail close target remains usable by touch');
      await close.tap();
      await detail.waitFor({ state: 'detached' });
    }
  }
  checks.push(
    'Touch closes the flow detail above all controls, before and after scrolling, on portrait and landscape phones',
  );
  await mobile.setViewportSize({ width: 390, height: 667 });
  await visit(mobile, 'map', {
    node: domain.id,
    scope: domain.id,
    mapDepth: '1',
    hf: JSON.stringify({ enabled: true }),
  });
  await mobile.locator('.business-card').first().waitFor();
  await waitForCatalogueGeometry(mobile);
  await mobile.locator('.catalogue-navigator.is-closed').waitFor();
  await mobile.getByRole('button', { name: 'Afficher le navigateur de carte', exact: true }).tap();
  await mobile.locator('.catalogue-navigator.is-open').waitFor();
  assert.ok(
    (await mobile.locator('.catalogue-navigator').boundingBox()).height <= 132,
    'An explicitly opened mobile navigator stays shallow',
  );
  await mobile.getByRole('button', { name: 'Réduire le navigateur de carte', exact: true }).tap();
  await mobile.locator('.catalogue-navigator.is-closed').waitFor();
  checks.push('The Catalogue mobile navigator starts folded and supports explicit touch opening and closing');

  for (const scope of ['@root', 'system-business-operations', domain.id, 'domain-plan']) {
    if (scope !== '@root' && !byId.has(scope)) continue;
    const framingPage = await preparePage();
    await visit(framingPage, 'flows', {
      scope,
      ...(scope === '@root' ? {} : { node: scope }),
      app: 'product-akolade',
      hf: JSON.stringify({ enabled: true }),
    });
    const expectedWorld = await world(framingPage);
    for (const mode of ['width', 'all']) {
      await selectFraming(framingPage, mode);
      for (const size of [
        { width: 1100, height: 720 },
        { width: 390, height: 667 },
        { width: 844, height: 390 },
        { width: 320, height: 480 },
        { width: 1440, height: 1000 },
      ]) {
        await framingPage.setViewportSize(size);
        await assertFraming(framingPage, mode, expectedWorld);
        await assertFloatingTools(framingPage);
        await assertMapText(framingPage);
      }
      await framingPage.getByRole('button', { name: 'Étendre la carte', exact: true }).click();
      await framingPage.waitForFunction(() => Boolean(document.fullscreenElement));
      await assertFraming(framingPage, mode, expectedWorld);
      await framingPage.getByRole('button', { name: 'Réduire la carte', exact: true }).click();
      await framingPage.waitForFunction(() => !document.fullscreenElement);
      await assertFraming(framingPage, mode, expectedWorld);
      await framingPage.getByRole('tab', { name: 'Catalogue', exact: true }).click();
      await framingPage.getByRole('tab', { name: 'Flux', exact: true }).click();
      await assertFraming(framingPage, mode, expectedWorld);
    }
    await selectFraming(framingPage, 'standard');
    const before = await viewport(framingPage);
    const oldBounds = await framingPage.locator('.flow-map-canvas').boundingBox();
    await framingPage.setViewportSize({ width: 1100, height: 720 });
    await waitCameraIdle(framingPage);
    const after = await viewport(framingPage);
    const newBounds = await framingPage.locator('.flow-map-canvas').boundingBox();
    assert.ok(Math.abs(before.zoom - after.zoom) < 0.0001, 'Standard retains its natural scale');
    for (const axis of ['x', 'y']) {
      const dimension = axis === 'x' ? 'width' : 'height';
      // ResizeObserver/clientWidth round to CSS pixels; a one-world-unit
      // tolerance becomes a fraction of a pixel at reduced zoom.
      const drift = Math.abs(oldBounds[dimension] / 2 - before[axis] - (newBounds[dimension] / 2 - after[axis]));
      assert.ok(drift < 1, `Standard retains its world center within one screen pixel (${scope}/${axis}: ${drift}px)`);
    }
    if (scope === 'system-business-operations' && byId.has('domain-sourcing-procurement')) {
      const arrival = await framingPage.evaluate(() => {
        const target = document.querySelector('.spatial-map-object[data-node-id="domain-sourcing-procurement"]');
        const path = document.querySelector(
          '.flow-exchange[data-source-id="supply-chain-orchestration"][data-target-id="domain-sourcing-procurement"] .flow-exchange-hit',
        );
        if (!path || !target) return null;
        const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(path.getScreenCTM());
        const lead = path.getPointAtLength(path.getTotalLength() - 12).matrixTransform(path.getScreenCTM());
        const box = target.getBoundingClientRect();
        return { end: { x: end.x, y: end.y }, lead: { x: lead.x, y: lead.y }, box: box.toJSON() };
      });
      assert.ok(arrival, 'The published Supply to Procurement exchange is rendered');
      assert.ok(Math.abs(arrival.end.y - arrival.box.bottom) < 1, 'The exchange reaches Procurement from the south');
      assert.ok(arrival.end.x > arrival.box.left && arrival.end.x < arrival.box.right);
      assert.ok(
        Math.abs(arrival.lead.x - arrival.end.x) < 1 && arrival.lead.y > arrival.end.y,
        'The last segment is perpendicular to the south border',
      );
      checks.push('The rendered Supply to Procurement arrow attaches to the south border');
    }
    checks.push(`${scope}: width/all fit after resize, fullscreen and tab return; Standard preserves its center`);
    await framingPage.close();
  }
  assert.deepEqual(errors, [], 'The browser reports no uncaught exception');
  report.status = 'passed';
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, checks: checks.length, output }));
} catch (error) {
  report.status = 'failed';
  report.failure = error.stack || String(error);
  report.url = activePage?.url();
  const failedPage = activePage;
  if (failedPage) {
    await failedPage.screenshot({ path: resolve(output, 'failure.png') });
    report.visibleObjects = await failedPage.locator('.spatial-object-title').evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        return { title: element.textContent, bounds: bounds.toJSON(), hit: hit?.outerHTML.slice(0, 300) };
      }),
    );
  }
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
