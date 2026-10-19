/** Current published Atlas journeys, served from compiled static files. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { projectDependencies } from './src/dependencyGraph.ts';
import { adaptPublication } from './src/model.ts';

async function expectCompletePage(page) {
  await page.waitForFunction(() => {
    const viewport = document.querySelector('.map-scroll-viewport');
    const cards = [...document.querySelectorAll('.graph-canvas.zoom-page .business-card')];
    if (!viewport || !cards.length) return false;
    const frame = viewport.getBoundingClientRect();
    return (
      viewport.scrollHeight <= viewport.clientHeight + 1 &&
      viewport.scrollWidth <= viewport.clientWidth + 1 &&
      cards.every((card) => {
        const box = card.getBoundingClientRect();
        return (
          box.left >= frame.left - 1 &&
          box.right <= frame.right + 1 &&
          box.top >= frame.top - 1 &&
          box.bottom <= frame.bottom + 1
        );
      })
    );
  });
}

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, '.runtime/qa-browser');
await mkdir(output, { recursive: true });
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const model = JSON.parse(await readFile(path.join(dist, `data/${catalog.current_version}/model.json`), 'utf8'));
const byId = new Map(model.nodes.map((node) => [node.id, node]));
const children = (id) =>
  model.relations
    .filter((r) => ['contains', 'presents'].includes(r.type) && r.source_id === id)
    .map((r) => r.target_id);
const parent = (id) =>
  byId.get(model.relations.find((r) => ['contains', 'presents'].includes(r.type) && r.target_id === id)?.source_id);
const universe = model.nodes.find((node) => node.kind === 'universe');
const businessArea = model.nodes.find(
  (node) => node.kind === 'business_area' && children(node.id).some((id) => byId.get(id)?.kind === 'capability'),
);
const domain = businessArea && parent(parent(businessArea.id)?.id);
const system = domain && parent(domain.id);
assert.ok(
  universe && businessArea && domain?.kind === 'domain' && system?.kind === 'business_system',
  'A published Universe and detailed domain are required',
);
const areas = children(domain.id).filter((id) => byId.get(id)?.kind === 'area');
const capability = byId.get(children(businessArea.id).find((id) => byId.get(id)?.kind === 'capability'));
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [],
  requests = [],
  checks = [];
const mapMeasurements = [];
const serveStatic = async (route) => {
  const url = new URL(route.request().url());
  requests.push(url.pathname);
  assert.ok(url.href.startsWith(base), 'No external dependency or API required');
  const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
  const target = path.resolve(dist, relative);
  assert.ok(target.startsWith(dist + path.sep), 'Static request stays inside dist');
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
  }[path.extname(target)];
  await route.fulfill({ body: await readFile(target), contentType: contentType || 'application/octet-stream' });
};
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', serveStatic);
  const visit = async (params) => {
    const { view = '', ...query } = { version: model.version, ...params };
    await page.goto(`${base}#/${view}?${new URLSearchParams(query)}`);
    await page.locator(`#fa-version[data-version="${params.version || model.version}"]`).waitFor({ state: 'attached' });
  };
  const route = () => new URLSearchParams(new URL(page.url()).hash.split('?')[1] || '');
  const expectInputValue = async (locator, expected) => {
    for (let poll = 0; poll < 40 && (await locator.inputValue()) !== expected; poll++) {
      await page.waitForTimeout(50);
    }
    assert.equal(await locator.inputValue(), expected);
  };
  const expectTooltip = async (target, expected, fullscreen = false) => {
    let tooltip;
    let actual = '';
    let insideFullscreen = !fullscreen;
    // A map panel can finish measuring and replace the hovered node once.
    // Bind the help to the hovered node's aria-describedby, not another lingering tooltip.
    for (let attempt = 0; attempt < 3; attempt++) {
      await target.hover();
      try {
        let tooltipId = await target.getAttribute('aria-describedby');
        for (let poll = 0; !tooltipId && poll < 20; poll++) {
          await page.waitForTimeout(50);
          tooltipId = await target.getAttribute('aria-describedby');
        }
        if (!tooltipId) throw new Error('Hovered node has no tooltip');
        tooltip = page.locator(`[id="${tooltipId}"]`);
        await tooltip.waitFor({ timeout: 2000 });
        actual = await tooltip.innerText({ timeout: 2000 });
        if (fullscreen) {
          insideFullscreen = await tooltip.evaluate((element) =>
            Boolean(document.fullscreenElement?.contains(element)),
          );
        }
        if (actual.includes(expected) && insideFullscreen) break;
        if (attempt === 2) {
          throw new Error(
            actual.includes(expected) ? 'Tooltip outside fullscreen map' : `Unexpected tooltip: ${actual}`,
          );
        }
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    assert.ok(actual.includes(expected));
    if (fullscreen) {
      assert.equal(insideFullscreen, true, 'Tooltip stays visible inside the fullscreen map');
    }
    await page.mouse.move(0, 0);
    await tooltip.waitFor({ state: 'hidden' });
  };

  await visit({ view: 'map' });
  await page.getByRole('heading', { level: 1, name: universe.fields.name }).waitFor();
  assert.deepEqual(
    (await page.locator('.overview-system').evaluateAll((items) => items.map((item) => item.dataset.nodeId))).sort(),
    children(universe.id).sort(),
  );
  assert.ok((await page.locator('.sidebar-stats').textContent()).includes(`${model.nodes.length} éléments`));
  await expectTooltip(page.locator(`.overview-system[data-node-id="${system.id}"] h3 button`), system.fields.name);
  const historyBefore = await page.evaluate(() => history.length);
  await page.locator(`.overview-system[data-node-id="${system.id}"] h3 button`).click();
  await page.locator(`.business-card[data-node-id="${domain.id}"]`).waitFor();
  assert.ok(new URL(page.url()).hash.startsWith('#/map?'), 'Atlas navigation uses the React Router map path');
  assert.equal(
    await page.evaluate(() => history.length),
    historyBefore + 1,
    'One navigation adds exactly one browser history entry',
  );
  assert.equal(route().get('scope'), system.id);
  await page.goBack();
  await page.getByRole('heading', { level: 1, name: universe.fields.name }).waitFor();
  assert.equal(route().get('scope'), null, 'Back restores the Universe route');
  await page.goForward();
  await page.locator(`.business-card[data-node-id="${domain.id}"]`).waitFor();
  assert.equal(route().get('scope'), system.id, 'Forward restores the Business System route');
  checks.push('Published root, systems, hierarchy and statistics');

  await visit({ view: 'map' });
  assert.equal(await page.locator('.universe-toolbar .map-detail-picker').count(), 1);
  assert.equal(await page.locator('.universe-toolbar .map-hotspot-picker').count(), 1);
  await page.locator('.universe-toolbar .map-hotspot-picker .detail-trigger').click();
  const hotspotFilters = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  await hotspotFilters.getByLabel('Afficher les points chauds').check();
  const severityChoices = hotspotFilters.getByRole('combobox', { name: 'Criticité' });
  await severityChoices.selectOption('exact:L');
  await expectInputValue(severityChoices, 'exact:L');
  await severityChoices.selectOption('at_most:L');
  await expectInputValue(severityChoices, 'at_most:L');
  await severityChoices.selectOption('at_least:L');
  await expectInputValue(severityChoices, 'at_least:L');
  assert.equal(await hotspotFilters.locator('.hotspot-filter-list').count(), 1);
  await hotspotFilters.getByRole('button', { name: /Affiner par complexité/ }).click();
  await hotspotFilters
    .getByRole('group', { name: 'Complexité d’arbitrage' })
    .getByRole('button', { name: 'XL', exact: true })
    .click();
  await hotspotFilters
    .getByRole('group', { name: 'Complexité d’implémentation' })
    .getByRole('button', { name: 'L', exact: true })
    .click();
  assert.equal(await severityChoices.inputValue(), 'all');
  await page.locator('.universe-toolbar .map-hotspot-picker .detail-trigger').click();
  await page.locator(`.overview-system[data-node-id="${system.id}"] h3 button`).click();
  await page.locator('.map-toolbar .map-detail-picker').waitFor();
  assert.equal(await page.locator('.map-toolbar .map-detail-picker').count(), 1);
  assert.equal(await page.locator('.map-toolbar .map-hotspot-picker').count(), 1);
  await page.getByRole('tab', { name: 'Fiche' }).click();
  await page.getByRole('tab', { name: 'Catalogue' }).click();
  await page.locator('.map-toolbar .map-hotspot-picker .detail-trigger').click();
  const scopedFilters = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  assert.equal(
    await scopedFilters
      .getByRole('group', { name: 'Complexité d’arbitrage' })
      .getByRole('button', { name: 'XL', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  assert.equal(
    await scopedFilters
      .getByRole('group', { name: 'Complexité d’implémentation' })
      .getByRole('button', { name: 'L', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  await scopedFilters.getByRole('combobox', { name: 'Criticité' }).selectOption('exact:XL');
  assert.equal(
    await scopedFilters
      .getByRole('group', { name: 'Complexité d’arbitrage' })
      .getByRole('button', { name: 'Toutes' })
      .getAttribute('aria-pressed'),
    'true',
  );
  checks.push('Overview and scoped maps share compact controls and keep hotspot filters across tabs');

  await visit({ view: 'hotspots' });
  const hotspotTable = page.getByRole('table');
  assert.equal(await hotspotTable.count(), 1);
  assert.equal(await hotspotTable.getByRole('columnheader').count(), 4);
  for (const column of ['Sujet et impact', 'Périmètre', 'Criticité', 'Qualification et avancement']) {
    assert.equal(await hotspotTable.getByRole('columnheader', { name: column, exact: true }).count(), 1);
  }
  await page.getByRole('button', { name: 'Filtres' }).click();
  const catalogFilters = page.getByRole('group', { name: 'Filtres des points chauds' });
  const catalogSeverity = catalogFilters.getByRole('combobox', { name: 'Criticité' });
  await catalogSeverity.selectOption('at_most:L');
  assert.equal(await catalogSeverity.inputValue(), 'at_most:L');
  checks.push(
    'Hotspot catalog uses the map filters and four semantic columns for subject, scope, severity and progress',
  );

  for (const depth of [0, 1, 2]) {
    await visit({ view: 'map', mapDepth: String(depth) });
    assert.equal(
      await page.locator('.overview-system').count(),
      children(universe.id).filter((id) => byId.get(id)?.kind === 'business_system').length,
      'Universe keeps one panel per Business System',
    );
    const systemCard = page.locator(`.overview-system[data-node-id="${system.id}"]`);
    assert.equal(
      (await systemCard.locator('.overview-domain-link').count()) > 0,
      depth >= 1,
      'Domains expand inside their Business System',
    );
    assert.equal(
      (await systemCard.locator('.overview-subdomain-link').count()) > 0,
      depth >= 2,
      'Subdomains expand inside their Domain',
    );
    if (depth === 1) {
      const link = systemCard.locator('.overview-domain-link').first();
      await expectTooltip(link, await link.innerText());
    }
    if (depth === 2) {
      const link = systemCard.locator('.overview-subdomain-link').first();
      await expectTooltip(link, await link.innerText());
    }
  }
  checks.push('Universe detail preserves nested Business System panels');

  for (const depth of [0, 1, 2, 3, 4]) {
    await visit({ view: 'map', node: system.id, scope: system.id, mapDepth: String(depth) });
    await page.locator(`.business-card[data-node-id="${domain.id}"]`).waitFor();
    mapMeasurements.push(
      await page.getByTestId('react-flow-canvas').evaluate(
        (element, level) => ({
          scope: 'system',
          depth: level,
          cards: element.querySelectorAll('.business-card').length,
          layoutMs: Number(element.dataset.layoutMs),
        }),
        depth,
      ),
    );
    assert.deepEqual(
      (
        await page
          .locator('.graph-canvas .business-card')
          .evaluateAll((cards) => cards.map((card) => card.dataset.kind))
      ).filter(Boolean),
      children(system.id)
        .filter((id) => byId.get(id)?.kind === 'domain')
        .map(() => 'domain'),
      'Only Domains become panels in the Business System map',
    );
    const domainCard = page.locator(`.business-card[data-node-id="${domain.id}"]`);
    if (depth === 0) {
      await expectTooltip(domainCard.locator('.metamodel-type'), 'Domain');
      await expectTooltip(domainCard.locator('h3 button'), domain.fields.name);
      const name = domainCard.locator('h3 button');
      await name.focus();
      await page.getByRole('tooltip').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'hidden' });
      assert.equal(await name.getAttribute('aria-describedby'), null);
      const cdp = await page.context().newCDPSession(page);
      const accessibility = await cdp.send('Accessibility.getFullAXTree');
      assert.ok(
        accessibility.nodes.some(
          (node) => node.role?.value === 'button' && node.name?.value === 'Définition du type Domain' && !node.ignored,
        ),
        'The model type help has a named button in the accessibility tree',
      );
      await cdp.detach();
    }
    assert.equal(
      (await domainCard.locator(`[data-map-item-id="${areas[0]}"]`).count()) > 0,
      depth >= 1,
      'Subdomains stay inside their Domain',
    );
    if (depth === 1)
      await expectTooltip(domainCard.locator(`[data-map-item-id="${areas[0]}"]`), byId.get(areas[0]).fields.name);
    assert.equal(
      (await domainCard.locator(`[data-business-area-summary="${businessArea.id}"]`).count()) > 0,
      depth >= 2,
      'Business Areas stay inside their Subdomain',
    );
    if (depth === 2) {
      assert.equal(
        await domainCard
          .locator(`[data-business-area-summary="${businessArea.id}"]`)
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        'rgba(0, 0, 0, 0)',
        'Business Area headings remain plain within their Subdomain',
      );
      await expectTooltip(
        domainCard.locator(`[data-business-area-summary="${businessArea.id}"] button`),
        businessArea.fields.name,
      );
    }
    assert.equal(
      (await domainCard.locator(`[data-map-item-id="${capability.id}"]`).count()) > 0,
      depth >= 3,
      'Capabilities stay inside their Business Area',
    );
    if (depth === 3)
      await expectTooltip(domainCard.locator(`[data-map-item-id="${capability.id}"]`), capability.fields.name);
    if (depth === 4) {
      await page.locator('.graph-canvas.zoom-width').waitFor();
      await page.waitForFunction(
        () =>
          Number(
            document
              .querySelector('.react-flow__viewport')
              ?.getAttribute('style')
              ?.match(/scale\(([^)]+)\)/)?.[1] || 0,
          ) >= 0.8,
      );
    }
  }
  const behavior = model.nodes.find((node) => node.kind === 'behavior' && parent(node.id)?.kind === 'capability');
  if (behavior) {
    const behaviorCapability = parent(behavior.id);
    const behaviorArea = parent(parent(behaviorCapability.id)?.id);
    const behaviorDomain = parent(behaviorArea?.id);
    const behaviorSystem = parent(behaviorDomain?.id);
    if (
      behaviorArea?.kind === 'area' &&
      behaviorDomain?.kind === 'domain' &&
      behaviorSystem?.kind === 'business_system'
    ) {
      for (const scope of [behaviorDomain, behaviorSystem]) {
        await visit({ view: 'map', node: scope.id, scope: scope.id, mapDepth: '4' });
        const panelId = scope.kind === 'domain' ? behaviorArea.id : behaviorDomain.id;
        assert.equal(
          await page.locator(`.business-card[data-node-id="${panelId}"] [data-map-item-id="${behavior.id}"]`).count(),
          1,
          'Behavior appears beneath its Capability in the existing panel',
        );
        await expectTooltip(
          page.locator(`.business-card[data-node-id="${panelId}"] [data-map-item-id="${behavior.id}"]`),
          behavior.fields.name,
        );
      }
    }
  }
  checks.push('System detail expands content within Domain panels at every level');

  await visit({ view: 'map', node: system.id, scope: system.id, mapDepth: '1' });
  await page.locator(`.business-card[data-node-id="${domain.id}"] [data-map-item-id="${areas[0]}"]`).click();
  assert.equal(route().get('scope'), domain.id, 'Selecting a nested Subdomain opens its Domain map');
  assert.equal(route().get('mapFocus'), areas[0], 'The chosen Subdomain remains in focus');
  await visit({ view: 'map', node: system.id, scope: system.id, mapDepth: '0' });

  await page.locator(`.business-card[data-node-id="${domain.id}"] h3 button`).click();
  await page.locator(`.business-card[data-node-id="${areas[0]}"]`).waitFor();
  assert.equal(route().get('scope'), domain.id);
  for (const depth of [0, 1, 2, 3, 4]) {
    await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: String(depth) });
    const cards = page.locator('.graph-canvas .business-card');
    await cards.first().waitFor();
    mapMeasurements.push(
      await page.getByTestId('react-flow-canvas').evaluate(
        (element, level) => ({
          scope: 'domain',
          depth: level,
          cards: element.querySelectorAll('.business-card').length,
          layoutMs: Number(element.dataset.layoutMs),
        }),
        depth,
      ),
    );
    assert.deepEqual(
      (await cards.evaluateAll((items) => items.map((item) => item.dataset.kind))).filter(Boolean),
      depth === 0 ? ['domain'] : areas.map(() => 'area'),
      'Domain keeps one panel per Subdomain',
    );
    const areaCard = page.locator(`.business-card[data-node-id="${parent(businessArea.id)?.id}"]`);
    assert.equal(
      (await areaCard.locator(`[data-business-area-summary="${businessArea.id}"]`).count()) > 0,
      depth >= 2,
      'Business Areas expand inside their Subdomain',
    );
    assert.equal(
      (await areaCard.locator(`[data-map-item-id="${capability.id}"]`).count()) > 0,
      depth >= 3,
      'Capabilities expand inside their Business Area',
    );
    if (depth === 4) await page.locator('.graph-canvas.zoom-width').waitFor();
  }
  assert.equal(
    await page.locator('.react-flow__node-container').count(),
    0,
    'The scope has no duplicate enclosing card',
  );
  if (domain.id === 'supply-chain-orchestration') {
    for (const [height, enabled] of [
      [900, false],
      [1000, true],
    ]) {
      await page.setViewportSize({ width: 1440, height });
      await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '1', hf: JSON.stringify({ enabled }) });
      await page.getByRole('button', { name: 'Pleine page', exact: true }).click();
      await page.locator('.graph-canvas.zoom-page').waitFor();
      await page.waitForFunction(() => {
        const viewport = document.querySelector('.map-scroll-viewport');
        if (
          !viewport ||
          viewport.scrollHeight > viewport.clientHeight + 1 ||
          viewport.scrollWidth > viewport.clientWidth + 1
        )
          return false;
        const bounds = viewport.getBoundingClientRect();
        const cards = [...viewport.querySelectorAll('.business-card')];
        return (
          cards.length > 0 &&
          cards.every((card) => {
            const rect = card.getBoundingClientRect();
            return (
              rect.top >= bounds.top - 1 &&
              rect.bottom <= bounds.bottom + 1 &&
              rect.left >= bounds.left - 1 &&
              rect.right <= bounds.right + 1
            );
          })
        );
      });
      await page.locator('.catalogue-navigator.is-closed').waitFor();
    }
    checks.push(
      'Subdomain page framing uses natural card heights and fits without scrolling, with or without hotspots',
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await visit({
      view: 'map',
      node: domain.id,
      scope: domain.id,
      mapDepth: '4',
      hf: JSON.stringify({ enabled: false }),
    });
    await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
    await page.locator('.graph-canvas.zoom-width').waitFor();
  }
  const scopeTitle = page.locator('.map-toolbar .map-scope-title');
  await expectTooltip(scopeTitle, domain.fields.name);
  const titleRoute = page.url();
  await scopeTitle.click();
  await page.locator('.map-node-tooltip').waitFor();
  assert.equal(page.url(), titleRoute, 'Reading the scope definition preserves the detail level and selection');
  await page.keyboard.press('Escape');
  await page.locator('.map-node-tooltip').waitFor({ state: 'hidden' });
  assert.ok(await scopeTitle.evaluate((element) => document.activeElement === element));
  const catalogueViewport = page.locator('.map-scroll-viewport');
  const openViewport = await catalogueViewport.boundingBox();
  const navigatorBounds = await page.locator('.catalogue-navigator').boundingBox();
  assert.ok(
    navigatorBounds.y < openViewport.y + openViewport.height && navigatorBounds.y >= openViewport.y,
    'The navigator overlays the map',
  );
  await page.getByRole('button', { name: 'Réduire le navigateur de carte', exact: true }).click();
  const foldedViewport = await catalogueViewport.boundingBox();
  assert.ok(
    Math.abs(foldedViewport.height - openViewport.height) < 1,
    'Folding the overlay never changes the map viewport height',
  );
  await page.getByRole('button', { name: 'Afficher le navigateur de carte', exact: true }).click();
  const catalogueNavigator = page.getByRole('region', { name: 'Déplacer la zone visible de la carte', exact: true });
  await catalogueNavigator.focus();
  await catalogueNavigator.press('End');
  await page.waitForFunction(() => document.querySelector('.map-scroll-viewport')?.scrollTop > 100);
  await page.waitForFunction(
    () => Number(document.querySelector('.catalogue-navigator-window')?.getAttribute('y')) > 100,
  );
  assert.equal(page.url(), titleRoute, 'The navigator scrolls without changing the route or framing');
  await catalogueNavigator.press('Home');
  await page.waitForFunction(() => document.querySelector('.map-scroll-viewport')?.scrollTop === 0);
  checks.push('Catalogue scope help replaces its enclosing card and its navigator controls native scrolling');
  await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '3' });
  await page.locator('.business-card[data-kind="area"] .category-list-banner').first().waitFor();
  const domainCardHierarchy = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.graph-canvas .business-card[data-kind="area"]')];
    const rows = new Map();
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      const row = Math.round(box.top);
      rows.set(row, [...(rows.get(row) || []), box.height]);
    }
    const card = cards.find((item) => item.querySelector('.category-list-banner'));
    const title = card?.querySelector('.subdomain-card-heading h3');
    const area = card?.querySelector('.category-list-banner');
    return {
      rows: [...rows.values()],
      titleSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0,
      areaSize: area ? Number.parseFloat(getComputedStyle(area).fontSize) : 0,
      areaBackground: area ? getComputedStyle(area).backgroundColor : '',
    };
  });
  assert.ok(
    domainCardHierarchy.rows.some((row) => row.length > 1),
    'Domain map has adjacent Subdomain cards',
  );
  assert.ok(
    domainCardHierarchy.rows.every((row) => Math.max(...row) - Math.min(...row) < 2),
    'Subdomain cards on one row share their height',
  );
  assert.ok(domainCardHierarchy.titleSize > domainCardHierarchy.areaSize);
  assert.equal(domainCardHierarchy.areaBackground, 'rgba(0, 0, 0, 0)');
  await page.locator('.graph-canvas').screenshot({ path: path.join(output, 'domain-detail.png') });
  assert.equal(
    await page
      .locator('.business-card > p')
      .evaluateAll((items) => items.filter((item) => getComputedStyle(item).webkitLineClamp !== 'none').length),
    0,
    'Card descriptions with links are not visually clamped',
  );
  const clippedHelp = await page
    .locator('.business-card > p .model-reference')
    .evaluateAll((links) =>
      links
        .filter((link) => link.getBoundingClientRect().bottom > link.closest('p').getBoundingClientRect().bottom + 1)
        .map((link) => link.textContent),
    );
  assert.deepEqual(clippedHelp, [], 'Glossary links in card descriptions must remain visible');
  checks.push('Domain detail preserves nested Subdomain panels at every level');
  for (const scope of [parent(businessArea.id), businessArea, capability]) {
    await visit({ view: 'map', node: scope.id, scope: scope.id, mapDepth: '0' });
    await page.locator('.graph-canvas .business-card').first().waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  checks.push('Subdomain, Business Area and Capability maps keep their scoped cards');
  await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '3' });
  if (areas.includes('subdomain-integration')) {
    const preview = await page.locator('.business-card[data-node-id="subdomain-integration"] > p').innerText();
    assert.ok(preview.trim().length > 0, 'The Subdomain preview keeps its published description');
    assert.doesNotMatch(preview, /glossary:|TER084|\]\(/);
  }
  await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '2' });
  await page.locator('.graph-canvas.zoom-width .business-card').first().waitFor();
  await page.waitForFunction(
    () =>
      Number(
        document
          .querySelector('.react-flow__viewport')
          ?.getAttribute('style')
          ?.match(/scale\(([^)]+)\)/)?.[1] || 0,
      ) >= 0.8,
  );
  const detail = page.locator('.map-toolbar .map-detail-picker .detail-trigger');
  await detail.click();
  await page.getByRole('group', { name: 'Niveau de détail de la carte' }).waitFor();
  await page.waitForFunction(() => document.activeElement?.matches('.detail-popover .detail-range'));
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('type')), 'range');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.matches('.map-toolbar .map-detail-picker .detail-trigger'));
  assert.equal(await detail.evaluate((el) => document.activeElement === el), true);
  await detail.click();
  await page
    .getByRole('group', { name: 'Niveau de détail de la carte' })
    .getByRole('button', { name: 'Capacités' })
    .click();
  await page.locator(`[data-business-area-summary="${businessArea.id}"]`).waitFor();
  assert.equal(route().get('mapDepth'), '3');
  checks.push('Domain hierarchy, detail picker and keyboard focus');

  const capabilityLink = page.locator(`[data-map-item-id="${capability.id}"]`).first();
  await capabilityLink.click();
  assert.equal(route().get('node'), capability.id);
  await page.locator(`[data-map-item-id="${capability.id}"][aria-current="true"]`).first().waitFor();
  assert.equal(await capabilityLink.getAttribute('aria-current'), 'true');
  assert.equal(await page.getByRole('tab', { name: 'Catalogue' }).getAttribute('aria-selected'), 'true');
  await visit({ view: 'map', node: businessArea.id, scope: domain.id, mapDepth: '3', mapFocus: businessArea.id });
  const areaLink = page.locator(`[data-business-area-summary="${businessArea.id}"] button`).first();
  await areaLink.waitFor();
  assert.equal(await areaLink.getAttribute('aria-current'), 'true');
  checks.push('Capability selection remains visible on the map; Business Area focus is addressable');

  await page.getByRole('button', { name: 'Étendre la carte' }).click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await expectTooltip(
    page.locator(`.business-card[data-node-id="${parent(businessArea.id)?.id}"] .metamodel-type`),
    'Subdomain',
    true,
  );
  if (areas.includes('subdomain-integration')) {
    const term = page.locator('.business-card[data-node-id="subdomain-integration"] .model-reference').first();
    if (await term.count()) await expectTooltip(term, 'Supply Chain', true);
  }
  await page.getByRole('button', { name: 'Pleine page' }).click();
  await expectCompletePage(page);
  await page.getByRole('button', { name: 'Réduire la carte' }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  checks.push('Full screen controls and complete page framing');

  const freshFraming = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  freshFraming.on('pageerror', (error) => errors.push(error.message));
  await freshFraming.route('**/*', serveStatic);
  await freshFraming.goto(
    `${base}#/map?${new URLSearchParams({ version: model.version, node: domain.id, scope: domain.id, mapDepth: '4' })}`,
  );
  await freshFraming.locator('#fa-version').waitFor({ state: 'attached' });
  await freshFraming.locator('.graph-canvas .business-card').first().waitFor();
  await freshFraming.waitForTimeout(1000);
  await freshFraming.getByRole('button', { name: 'Auto', exact: true }).click();
  const pageFraming = freshFraming.getByRole('button', { name: 'Pleine page' });
  await pageFraming.click();
  await expectCompletePage(freshFraming);
  assert.ok(
    await freshFraming
      .locator('.react-flow__viewport')
      .evaluate((element) => Number(element.style.transform.match(/scale\(([^)]+)\)/)?.[1]) < 0.85),
  );
  assert.equal(await freshFraming.locator('.map-zoom-asterisk,.map-zoom-tooltip').count(), 0);
  await freshFraming.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
  await freshFraming.waitForFunction(() => {
    const viewport = document.querySelector('.map-scroll-viewport');
    return (
      document.querySelector('.graph-canvas.zoom-width') &&
      viewport.scrollHeight > viewport.clientHeight + 1 &&
      document.querySelector('.react-flow__viewport')?.style.transform.includes('scale(1)')
    );
  });
  await freshFraming.close();
  checks.push('Dense page fits below 85 percent; width restores native scale and scrolling');

  const sparseScope = model.nodes.find(
    (node) =>
      ['business_system', 'domain', 'area', 'business_area'].includes(node.kind) && children(node.id).length === 1,
  );
  assert.ok(sparseScope, 'A published scope with one card is needed to check card redistribution');
  await visit({ view: 'map', node: sparseScope.id, scope: sparseScope.id, mapDepth: '0' });
  await page.getByRole('button', { name: 'Pleine page' }).click();
  const sparseCard = page.locator('.graph-canvas .business-card').first();
  await sparseCard.waitFor();
  await page.waitForFunction(() => document.querySelector('.graph-canvas.zoom-page .business-card'));
  await page.evaluate(() => {
    window.originalTreeWalker = document.createTreeWalker.bind(document);
    window.mapTextWalks = 0;
    document.createTreeWalker = (...args) => {
      window.mapTextWalks++;
      return window.originalTreeWalker(...args);
    };
  });
  const zoomBefore = await page.locator('.react-flow__viewport').getAttribute('style');
  await page.locator('.react-flow__controls-zoomin').click();
  await page.waitForFunction(
    (before) => document.querySelector('.react-flow__viewport')?.getAttribute('style') !== before,
    zoomBefore,
  );
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const mapTextWalks = await page.evaluate(() => {
    document.createTreeWalker = window.originalTreeWalker;
    return window.mapTextWalks;
  });
  assert.equal(mapTextWalks, 0, 'zoom must reuse text measurements instead of scanning every card');
  const cardLayoutWidth = () =>
    sparseCard.evaluate((element) => Number.parseFloat(element.closest('.react-flow__node')?.style.width || '0'));
  const pageCardWidth = await cardLayoutWidth();
  await page.locator('.graph-canvas').screenshot({ path: path.join(output, 'page-layout.png') });
  await page.getByRole('button', { name: 'Pleine largeur' }).click();
  await page.locator('.graph-canvas.zoom-width .business-card').first().waitFor();
  const widthCardWidth = await cardLayoutWidth();
  assert.ok(widthCardWidth >= pageCardWidth, 'Pleine largeur must preserve the available width for sparse maps');
  assert.ok(widthCardWidth >= 900, 'A sparse card should not remain narrow in Pleine largeur');
  await page.waitForFunction(
    () =>
      Number(
        document
          .querySelector('.react-flow__viewport')
          ?.getAttribute('style')
          ?.match(/scale\(([^)]+)\)/)?.[1],
      ) === 1,
  );
  const widthZoom = await page
    .locator('.react-flow__viewport')
    .evaluate((element) => Number(element.getAttribute('style')?.match(/scale\(([^)]+)\)/)?.[1] || 0));
  assert.equal(widthZoom, 1, 'Pleine largeur should reflow at native zoom on a desktop canvas');
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.graph-canvas.zoom-width');
    const card = canvas?.querySelector('.business-card');
    if (!canvas || !card) return false;
    const frame = canvas.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    return box.left >= frame.left - 2 && box.right <= frame.right + 2;
  });
  const widthPlacement = await page.evaluate(() => {
    const canvas = document.querySelector('.graph-canvas.zoom-width');
    const card = canvas?.querySelector('.business-card');
    const frame = canvas?.getBoundingClientRect();
    const box = card?.getBoundingClientRect();
    return {
      canvasWidth: canvas?.clientWidth,
      frameLeft: frame?.left,
      frameRight: frame?.right,
      cardLeft: box?.left,
      cardRight: box?.right,
      transform: document.querySelector('.react-flow__viewport')?.getAttribute('style'),
    };
  });
  assert.ok(
    widthPlacement.cardLeft >= widthPlacement.frameLeft - 2 &&
      widthPlacement.cardRight <= widthPlacement.frameRight + 2,
    `Pleine largeur card must stay inside the canvas: ${JSON.stringify(widthPlacement)}`,
  );
  await page.locator('.graph-canvas').screenshot({ path: path.join(output, 'width-layout.png') });
  checks.push('Page and width modes redistribute cards before framing');

  await visit({ view: 'map', node: system.id, scope: system.id, mapDepth: '0' });
  await page.getByRole('button', { name: 'Pleine largeur' }).click();
  const domainCards = page.locator('.graph-canvas .business-card');
  assert.ok((await domainCards.count()) >= 3, 'A multi-domain system is needed to check grid redistribution');
  const columnCount = () =>
    domainCards.evaluateAll(
      (cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().left / 20) * 20)).size,
    );
  await page.setViewportSize({ width: 1080, height: 1000 });
  await page.waitForFunction(
    () =>
      new Set(
        [...document.querySelectorAll('.graph-canvas .business-card')].map(
          (card) => Math.round(card.getBoundingClientRect().left / 20) * 20,
        ),
      ).size <= 3,
  );
  const narrowColumns = await columnCount();
  const narrowCanvasWidth = await page.locator('.graph-canvas').evaluate((element) => element.clientWidth);
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.waitForFunction(
    (previous) => (document.querySelector('.graph-canvas')?.clientWidth || 0) > previous + 500,
    narrowCanvasWidth,
  );
  await page.waitForFunction(
    (previous) =>
      new Set(
        [...document.querySelectorAll('.graph-canvas .business-card')].map(
          (card) => Math.round(card.getBoundingClientRect().left / 20) * 20,
        ),
      ).size >= previous,
    narrowColumns,
  );
  const wideColumns = await columnCount();
  assert.ok(
    wideColumns >= narrowColumns,
    `A wider canvas must preserve or add card columns (narrow ${narrowColumns}, wide ${wideColumns})`,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  checks.push('Width mode preserves multi-domain cards as the canvas grows');

  for (const params of [
    { scope: '@root', node: '', mapDepth: '2' },
    { scope: domain.id, node: domain.id, mapDepth: '4' },
  ]) {
    await page.setViewportSize({ width: params.scope === '@root' ? 600 : 980, height: 800 });
    await visit({ view: 'map', ...params });
    await page.getByRole('button', { name: 'Pleine largeur', exact: true }).click();
    await page.waitForFunction(() => {
      const viewport = document.querySelector('.overview-map-scroll, .map-scroll-viewport');
      return viewport && viewport.scrollHeight - viewport.clientHeight > 200;
    });
    // Let the opening focus and framing finish before establishing the reader's own position.
    await page.waitForTimeout(500);
    const saved = await page.locator('.overview-map-scroll, .map-scroll-viewport').evaluate((viewport) => {
      viewport.scrollTo({ top: 320, left: 180, behavior: 'instant' });
      return { top: viewport.scrollTop, left: viewport.scrollLeft };
    });
    assert.ok(saved.top > 100, 'The Catalogue must have a real reading position to restore');
    if (params.scope === '@root') assert.ok(saved.left > 100, 'The root Catalogue must exercise horizontal memory');
    const framingName = params.scope === '@root' ? 'root' : 'domain';
    await page.screenshot({ path: path.join(output, `catalogue-${framingName}-before-flux.png`) });
    await page.getByRole('tab', { name: 'Flux', exact: true }).click();
    await page.locator('#tab-flows[aria-selected="true"]').waitFor();
    await page.locator('.flow-map-panel').waitFor();
    await page.getByRole('tab', { name: 'Catalogue', exact: true }).click();
    await page.waitForFunction((expected) => {
      const viewport = document.querySelector('.overview-map-scroll, .map-scroll-viewport');
      return (
        viewport &&
        Math.abs(viewport.scrollTop - expected.top) <= 1 &&
        Math.abs(viewport.scrollLeft - expected.left) <= 1
      );
    }, saved);
    await page.screenshot({ path: path.join(output, `catalogue-${framingName}-after-flux.png`) });
    const moved = await page.locator('.overview-map-scroll, .map-scroll-viewport').evaluate((viewport) => {
      viewport.scrollTo({ top: 130, left: 30, behavior: 'instant' });
      return { top: viewport.scrollTop, left: viewport.scrollLeft };
    });
    await page.waitForTimeout(700);
    assert.deepEqual(
      await page
        .locator('.overview-map-scroll, .map-scroll-viewport')
        .evaluate((viewport) => ({ top: viewport.scrollTop, left: viewport.scrollLeft })),
      moved,
      'The restored Catalogue must stop adjusting once reading resumes',
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  checks.push('Catalogue framing survives Flux round trips and leaves subsequent scrolling alone');

  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('heading', { level: 1, name: capability.fields.name }).waitFor();
  await page.getByRole('tab', { name: 'Catalogue' }).click();
  await page.locator(`[data-map-item-id="${capability.id}"][aria-current="true"]`).first().waitFor();
  checks.push('Sheet and return to selected map object');

  await page.setViewportSize({ width: 390, height: 844 });
  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('button', { name: 'Ouvrir le panneau' }).click();
  await page.getByRole('dialog', { name: 'Navigation Atlas' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Navigation Atlas' }).waitFor({ state: 'hidden' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const scope of [system, domain]) {
      await visit({ view: 'map', node: scope.id, scope: scope.id, mapDepth: '4' });
      await page.locator('.graph-canvas .business-card').first().waitFor();
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `No page overflow at ${width}px in ${scope.kind} detail`,
      );
    }
  }
  checks.push('Mobile navigation, Escape and no page overflow');
  const touchPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  touchPage.on('pageerror', (error) => errors.push(error.message));
  await touchPage.route('**/*', serveStatic);
  await touchPage.goto(
    `${base}#/map?${new URLSearchParams({ version: model.version, node: domain.id, scope: domain.id, mapDepth: '4' })}`,
  );
  await touchPage.locator('.graph-canvas.touch-scroll .react-flow__pane').waitFor();
  await touchPage.getByRole('button', { name: 'Pleine page' }).tap();
  await expectCompletePage(touchPage);
  await touchPage.getByRole('button', { name: 'Pleine largeur' }).tap();
  const touchPane = touchPage.locator('.graph-canvas.touch-scroll .react-flow__pane');
  await touchPane.waitFor();
  const touchAction = await touchPane.evaluate((element) => getComputedStyle(element).touchAction);
  assert.match(touchAction, /\bpan-y\b|\bmanipulation\b/);
  assert.match(touchAction, /\bpan-x\b|\bmanipulation\b/);
  await touchPage.close();
  checks.push('Touch emulation preserves scrolling in both axes while changing map framing');
  assert.ok(
    !requests.some((request) => /DependenciesPane-[^/]+\.js$/.test(request)),
    'The Relations chunk remains deferred until Relations is opened',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const relationMeasurements = [];
  const relationModel = adaptPublication(model);
  await visit({
    view: 'relations',
    node: system.id,
    level: 'capability',
    depth: '0',
    layout: 'hierarchical',
    labels: 'all',
  });
  const relationList = page.getByRole('group', { name: 'Liste des relations', exact: true });
  const relationButtons = relationList.locator('button[data-relation-id]');
  await relationButtons.first().waitFor();
  const idsInList = () => relationButtons.evaluateAll((buttons) => buttons.map((button) => button.dataset.relationId));
  const expectedRelations = (family) =>
    projectDependencies(relationModel, {
      focusId: system.id,
      level: 'capability',
      depth: 0,
      direction: 'both',
      family,
    })
      .relations.map((relation) => relation.id)
      .sort();
  assert.deepEqual((await idsInList()).sort(), expectedRelations('all'));
  assert.equal(await page.getByTestId('cytoscape-canvas').count(), 0);
  assert.equal(await page.getByRole('button', { name: /(?:Afficher|Masquer) le graphe/ }).count(), 0);
  assert.equal(await page.getByLabel('Disposition', { exact: true }).count(), 0);
  const beforeSelection = await idsInList();
  const firstRelationId = beforeSelection[0];
  await relationButtons.first().click();
  const relationDetail = page.getByRole('complementary', { name: 'Relation sélectionnée' });
  await relationDetail.waitFor();
  assert.deepEqual(await idsInList(), beforeSelection, 'Inspecting a relation retains the filtered list');
  assert.equal(route().get('relation'), firstRelationId);
  await relationDetail.getByRole('button', { name: 'Retour à la liste des relations' }).click();
  await relationDetail.waitFor({ state: 'hidden' });
  await page.waitForFunction((id) => document.activeElement?.getAttribute('data-relation-id') === id, firstRelationId);
  assert.equal(await relationButtons.first().evaluate((element) => element === document.activeElement), true);
  const relationSearch = page.getByLabel('Rechercher dans les relations', { exact: true });
  await relationSearch.fill(firstRelationId);
  await page.waitForFunction(
    () => document.querySelectorAll('.accessible-relations button[data-relation-id]').length < 2,
  );
  assert.deepEqual(await idsInList(), [firstRelationId]);
  await relationSearch.fill('aucun résultat attendu zzz987');
  await page.waitForFunction(
    () => document.querySelectorAll('.accessible-relations button[data-relation-id]').length === 0,
  );
  await relationSearch.fill('');
  const advanced = page.locator('.dependency-options');
  if ((await advanced.getAttribute('open')) === null) await advanced.locator('summary').click();
  await relationButtons.first().click();
  await relationDetail.waitFor();
  await page.getByLabel('Qualification', { exact: true }).selectOption('needs');
  await page.waitForFunction(() => new URLSearchParams(location.hash.split('?')[1]).get('qualification') === 'needs');
  await relationDetail.waitFor({ state: 'hidden' });
  assert.equal(route().has('relation'), false, 'Changing filters clears the selected relation in the same navigation');
  assert.deepEqual((await idsInList()).sort(), expectedRelations('needs'));
  relationMeasurements.push({ all: beforeSelection.length, needs: await relationButtons.count() });
  await page.getByLabel('Qualification', { exact: true }).selectOption('all');
  await page.waitForFunction(
    (count) => document.querySelectorAll('.accessible-relations button[data-relation-id]').length === count,
    beforeSelection.length,
  );
  assert.deepEqual(await idsInList(), beforeSelection);
  await page.setViewportSize({ width: 390, height: 667 });
  const mobileRelationId = await relationButtons.first().getAttribute('data-relation-id');
  await relationButtons.first().click();
  await relationDetail.waitFor();
  assert.ok(
    await relationDetail.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth + 1 && rect.top < innerHeight;
    }),
  );
  // The mobile scroll can place a glossary term under the mouse; close that hover help before testing the detail.
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => !document.querySelector('.reference-tooltip'));
  await page.waitForFunction(() => document.activeElement?.matches('.dependency-detail'));
  await page.keyboard.press('Escape');
  await relationDetail.waitFor({ state: 'hidden' });
  await page.waitForFunction((id) => document.activeElement?.getAttribute('data-relation-id') === id, mobileRelationId);
  assert.equal(await relationButtons.first().evaluate((element) => element === document.activeElement), true);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  assert.ok(!requests.some((request) => /cytoscape[^/]*-[^/]+\.js$/.test(request)), 'No graph engine is requested');
  checks.push('Relations list preserves published links, filters, search and keyboard detail on desktop and mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const oldest = catalog.versions.at(-1);
  const historical = JSON.parse(await readFile(path.join(dist, `data/${oldest.version}/model.json`), 'utf8'));
  const oldDomain = historical.nodes.find(
    (node) =>
      node.kind === 'domain' &&
      historical.relations.some(
        (relation) =>
          relation.type === 'contains' &&
          relation.source_id === node.id &&
          historical.nodes.some((child) => child.id === relation.target_id && child.kind === 'capability'),
      ),
  );
  assert.ok(oldDomain, 'A historical Domain with direct Capabilities is available for fallback verification');
  await visit({ version: oldest.version, view: 'map', node: oldDomain.id, scope: oldDomain.id, mapDepth: '3' });
  const directCapabilityIds = historical.relations
    .filter((relation) => relation.type === 'contains' && relation.source_id === oldDomain.id)
    .map((relation) => relation.target_id)
    .filter((id) => historical.nodes.some((node) => node.id === id && node.kind === 'capability'));
  await page.locator(`.business-card[data-node-id="${directCapabilityIds[0]}"]`).waitFor();
  assert.deepEqual(
    (
      await page
        .locator('.graph-canvas .business-card')
        .evaluateAll((cards) => cards.map((card) => card.dataset.nodeId))
    )
      .filter((id) => directCapabilityIds.includes(id))
      .sort(),
    directCapabilityIds.sort(),
    'Historical direct Capabilities remain in their own snapshot',
  );
  checks.push('Historical Domain fallback keeps direct published Capabilities');
  // The earliest publication has no business links; this fixed historical sample does.
  const historicalRelationVersion = '2026-10-12.6';
  assert.ok(catalog.versions.some((entry) => entry.version === historicalRelationVersion));
  const historicalRelationModel = adaptPublication(
    JSON.parse(await readFile(path.join(dist, `data/${historicalRelationVersion}/model.json`), 'utf8')),
  );
  const historicalRelations = projectDependencies(historicalRelationModel, {
    level: 'capability',
    depth: 0,
    direction: 'both',
    family: 'all',
  }).relations;
  assert.ok(historicalRelations.length > 0, 'The historical publication retains its business relations');
  await visit({
    version: historicalRelationVersion,
    view: 'relations',
    node: '',
    level: 'capability',
    depth: '0',
    relation: historicalRelations[0].id,
  });
  await page
    .getByRole('region', {
      name: `Relation entre ${historicalRelationModel.nodeById.get(historicalRelations[0].sourceId)?.name} et ${historicalRelationModel.nodeById.get(historicalRelations[0].targetId)?.name}`,
      exact: true,
    })
    .waitFor();
  assert.deepEqual((await idsInList()).sort(), historicalRelations.map((relation) => relation.id).sort());
  assert.equal(route().get('version'), historicalRelationVersion);
  assert.equal(await page.getByTestId('cytoscape-canvas').count(), 0);
  checks.push('Historical relation deep links retain the original publication and complete list');
  assert.deepEqual(errors, []);
  assert.ok(!requests.some((request) => request.includes('/api/') || request.includes('backlog')));
  await writeFile(
    path.join(output, 'report.json'),
    JSON.stringify({ version: model.version, checks, mapMeasurements, relationMeasurements, errors }, null, 2),
  );
  console.log(JSON.stringify({ status: 'passed', version: model.version, checks }));
} finally {
  await browser.close();
}
