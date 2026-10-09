/** Current published Atlas journeys, served from compiled static files. */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';

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
  const expectTooltip = async (target, expected, fullscreen = false) => {
    let tooltip;
    let actual = '';
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
        if (actual.includes(expected)) break;
        if (attempt === 2) throw new Error(`Unexpected tooltip: ${actual}`);
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    assert.ok(actual.includes(expected));
    if (fullscreen) {
      await page.waitForFunction(() => Boolean(document.fullscreenElement?.querySelector('[role="tooltip"]')));
      assert.equal(
        await page.evaluate(() => Boolean(document.fullscreenElement?.querySelector('[role="tooltip"]'))),
        true,
        'Tooltip stays visible inside the fullscreen map',
      );
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
    if (depth === 2)
      await expectTooltip(
        domainCard.locator(`[data-business-area-summary="${businessArea.id}"] button`),
        businessArea.fields.name,
      );
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
  await visit({ view: 'map', node: domain.id, scope: domain.id, mapDepth: '3' });
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
  if (areas.includes('subdomain-integration')) {
    const preview = await page.locator('.business-card[data-node-id="subdomain-integration"] > p').innerText();
    assert.match(preview, /Supply Chain Orchestration/);
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
  const detail = page.locator('.map-header-controls .detail-trigger');
  await detail.click();
  await page.getByRole('group', { name: 'Niveau de détail de la carte' }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('type')), 'range');
  await page.keyboard.press('Escape');
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
  assert.equal(await page.getByRole('tab', { name: 'Carte' }).getAttribute('aria-selected'), 'true');
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
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.graph-canvas');
    const cards = [...document.querySelectorAll('.graph-canvas .business-card')];
    if (!canvas || !cards.length) return false;
    const frame = canvas.getBoundingClientRect();
    return cards.every((card) => {
      const box = card.getBoundingClientRect();
      return (
        box.left >= frame.left - 2 &&
        box.right <= frame.right + 2 &&
        box.top >= frame.top - 2 &&
        box.bottom <= frame.bottom + 2
      );
    });
  });
  await page.getByRole('button', { name: 'Réduire la carte' }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  checks.push('Full screen controls and complete page framing');

  const sparseSystem = model.nodes.find(
    (node) =>
      node.kind === 'business_system' && children(node.id).filter((id) => byId.get(id)?.kind === 'domain').length === 1,
  );
  assert.ok(sparseSystem, 'A sparse Business System is needed to check card redistribution');
  await visit({ view: 'map', node: sparseSystem.id, scope: sparseSystem.id, mapDepth: '0' });
  await page.getByRole('button', { name: 'Pleine page' }).click();
  const sparseCard = page.locator('.graph-canvas .business-card').first();
  await sparseCard.waitFor();
  await page.waitForFunction(() => document.querySelector('.graph-canvas.zoom-page .business-card'));
  const cardLayoutWidth = () =>
    sparseCard.evaluate((element) => Number.parseFloat(element.closest('.react-flow__node')?.style.width || '0'));
  const pageCardWidth = await cardLayoutWidth();
  await page.locator('.graph-canvas').screenshot({ path: path.join(output, 'page-layout.png') });
  await page.getByRole('button', { name: 'Pleine largeur' }).click();
  await page.waitForFunction(
    (previous) =>
      Number.parseFloat(
        document.querySelector('.graph-canvas.zoom-width .business-card')?.closest('.react-flow__node')?.style.width ||
          '0',
      ) >
      previous + 30,
    pageCardWidth,
  );
  const widthCardWidth = await cardLayoutWidth();
  assert.ok(widthCardWidth > pageCardWidth + 300, 'Pleine largeur must use the available width for sparse maps');
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
  assert.ok((await domainCards.count()) >= 4, 'A multi-domain system is needed to check grid redistribution');
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
  await page.setViewportSize({ width: 1800, height: 1000 });
  await page.waitForFunction(
    (previous) =>
      new Set(
        [...document.querySelectorAll('.graph-canvas .business-card')].map(
          (card) => Math.round(card.getBoundingClientRect().left / 20) * 20,
        ),
      ).size > previous,
    narrowColumns,
  );
  assert.ok((await columnCount()) > narrowColumns, 'A wider canvas must create more card columns');
  await page.setViewportSize({ width: 1440, height: 1000 });
  checks.push('Width mode redistributes multi-domain cards into more columns when space grows');

  await visit({ node: capability.id, view: 'sheet' });
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('heading', { level: 1, name: capability.fields.name }).waitFor();
  await page.getByRole('tab', { name: 'Carte' }).click();
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
  await touchPage.locator('.graph-canvas.zoom-page').waitFor();
  await touchPage.getByRole('button', { name: 'Pleine largeur' }).tap();
  const touchPane = touchPage.locator('.graph-canvas.touch-scroll .react-flow__pane');
  await touchPane.waitFor();
  assert.match(await touchPane.evaluate((element) => getComputedStyle(element).touchAction), /\bpan-y\b/);
  await touchPage.close();
  checks.push('Touch emulation preserves vertical scrolling while changing map framing');
  assert.ok(
    !requests.some((request) => /DependenciesPane-[^/]+\.js$/.test(request)),
    'The Relations chunk remains deferred until Relations is opened',
  );
  assert.ok(
    !requests.some((request) => /cytoscape-(?:fcose|dagre)-[^/]+\.js$/.test(request)),
    'Layout engines remain deferred until Relations is opened',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const relationMeasurements = [];
  for (const graphLayout of ['organic', 'hierarchical']) {
    await visit({ view: 'relations', node: system.id, level: 'area', depth: '0', layout: graphLayout });
    const canvas = page.getByTestId('cytoscape-canvas');
    await page.waitForFunction(
      () => document.querySelector('[data-testid="cytoscape-canvas"]')?.getAttribute('data-status') === 'ready',
    );
    const measurement = await canvas.evaluate((element) => ({
      layout: new URLSearchParams(location.hash.split('?')[1]).get('layout'),
      nodes: Number(element.dataset.nodeCount),
      edges: Number(element.dataset.edgeCount),
      layoutMs: Number(element.dataset.layoutMs),
    }));
    assert.equal(measurement.layout, graphLayout);
    assert.ok(
      measurement.nodes > 0 && measurement.edges > 0,
      'Complete Relations projection contains published elements and links',
    );
    assert.ok(
      Number.isFinite(measurement.layoutMs) && measurement.layoutMs >= 0,
      'Relations layout time is observable',
    );
    assert.ok(
      measurement.layoutMs < 2000,
      `Relations ${graphLayout} placement exceeds the current-publication 2 s budget: ${measurement.layoutMs} ms`,
    );
    const expectedEngine = graphLayout === 'organic' ? 'fcose' : 'dagre';
    assert.ok(
      requests.some((request) => new RegExp(`cytoscape-${expectedEngine}-[^/]+\\.js$`).test(request)),
      `Relations loads the ${expectedEngine} engine on demand`,
    );
    if (graphLayout === 'organic')
      assert.ok(
        !requests.some((request) => /cytoscape-dagre-[^/]+\.js$/.test(request)),
        `The hierarchical engine is not loaded for the organic layout: ${requests.filter((request) => /cytoscape-(?:fcose|dagre)-[^/]+\.js$/.test(request)).join(', ')}`,
      );
    relationMeasurements.push(measurement);
  }
  checks.push('Complete Relations graph renders in both layouts without errors');
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
