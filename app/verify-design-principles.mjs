/** Candidate-only acceptance; no publication, listener or served data is changed. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { candidateFixture } from './candidate-fixture.mjs';
import { inlineParts, plainInlineText } from './src/inlineLinks.ts';

const root = resolve(import.meta.dirname, '..'),
  dist = resolve(root, 'app/dist');
const candidate = await candidateFixture(dist),
  base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions),
  errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const rel = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (rel === 'data/index.json') return route.fulfill({ json: candidate.index });
    if (rel === `data/${candidate.version}/model.json`)
      return route.fulfill({ body: candidate.bytes, contentType: 'application/json' });
    if (rel === `data/${candidate.version}/guide.json`)
      return route.fulfill({ body: candidate.guideBytes, contentType: 'application/json' });
    const file = resolve(dist, rel);
    assert.ok(file.startsWith(dist + sep));
    try {
      return route.fulfill({
        body: await readFile(file),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
          }[extname(file)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Missing' });
    }
  });
  const visit = async (view, params = {}) => {
    await page.goto(`${base}#/${view}?${new URLSearchParams({ version: candidate.version, ...params })}`);
    await page.locator('.workspace-content').waitFor();
  };
  await visit('design-principles');
  await page.getByRole('heading', { name: 'Principes directeurs', exact: true, level: 1 }).waitFor();
  assert.equal(await page.locator('.principle-cards').first().locator(':scope > li').count(), 14);
  const featured = candidate.raw.principles.filter((p) => p.featured);
  const cited = (value) => [
    ...new Set(
      inlineParts(JSON.stringify(value ?? ''))
        .filter((p) => p.kind === 'principle')
        .map((p) => p.target),
    ),
  ];
  const linkedNodes = candidate.raw.nodes.filter((n) => cited(n.fields).length);
  const linkedTerms = candidate.raw.glossary.terms.filter((t) => cited(t.context).length);
  const linkedRelations = candidate.raw.relations.filter((r) => cited(r.fields?.data_exchange?.purpose).length);
  assert.equal(linkedNodes.length, 32);
  assert.equal(linkedTerms.length, 9);
  assert.equal(linkedRelations.length, 9);
  for (const p of featured) {
    await visit('design-principles', { principle: p.id });
    await page.getByRole('heading', { name: p.label_fr, exact: true, level: 2 }).waitFor();
    for (const section of [
      'Le principe',
      'Pourquoi ce choix',
      'Ce que cela change dans la carte',
      'Limites et compromis',
      'Recherche et marché',
    ])
      assert.ok(await page.getByRole('heading', { name: section, exact: true }).isVisible(), `${p.id}: ${section}`);
    for (const ref of p.references || [])
      assert.equal(await page.locator(`.principle-references a[href="${ref.url}"]`).count(), 1);
    const readings = page.locator('.principle-readings');
    for (const [collection, items] of [
      ['nodes', linkedNodes],
      ['terms', linkedTerms],
      ['relations', linkedRelations],
    ])
      for (const item of items.filter((x) =>
        cited(
          collection === 'nodes' ? x.fields : collection === 'terms' ? x.context : x.fields.data_exchange.purpose,
        ).includes(p.id),
      ))
        assert.equal(
          await readings
            .locator('a')
            .evaluateAll(
              (anchors, { key, id }) =>
                anchors.filter((a) => new URLSearchParams(a.hash.split('?')[1]).get(key) === id).length,
              { key: collection === 'nodes' ? 'node' : collection === 'terms' ? 'term' : 'relation', id: item.id },
            ),
          1,
          `${p.id} reverse ${collection}/${item.id}`,
        );
  }
  for (const node of linkedNodes) {
    await visit('sheet', { node: node.id });
    await page.locator('[data-testid="business-sheet"]').waitFor();
    for (const id of cited(node.fields)) {
      assert.ok(
        await page
          .locator(`.business-copy a[href*="principle=${id}"], .business-pedagogy a[href*="principle=${id}"]`)
          .count(),
        `${node.id}: prose ${id}`,
      );
      assert.equal(
        await page.locator(`.sheet-principles > ul a[href*="principle=${id}"]`).count(),
        1,
        `${node.id}: direct ${id}`,
      );
    }
    const inherited = page.locator('.inherited-principles');
    if (await inherited.count()) assert.equal(await inherited.getAttribute('open'), null);
  }
  for (const term of linkedTerms) {
    await visit('glossary', { glossary: 'model', term: term.id });
    await page.locator(`#term-${term.id}`).waitFor();
    for (const id of cited(term.context))
      assert.ok(await page.locator(`#term-${term.id} a[href*="principle=${id}"]`).count());
  }
  for (const relation of linkedRelations) {
    await visit('relations', { relation: relation.id });
    const inspector = page.locator('[data-testid="relation-inspector"]');
    await inspector.waitFor();
    for (const id of cited(relation.fields.data_exchange.purpose))
      assert.ok(
        await inspector.locator(`.relation-description a[href*="principle=${id}"]`).count(),
        `${relation.id} purpose ${id}`,
      );
  }
  // A long description links to its rationale and returns to its reading position.
  await visit('sheet', { node: 'D08' });
  const variantLink = page.locator('.business-pedagogy a[href*="principle=PRINCIPLE-PRODUCT-VARIANTS"]');
  await variantLink.scrollIntoViewIfNeeded();
  const originScroll = await page.locator('.workspace-content').evaluate((e) => Math.round(e.scrollTop));
  await variantLink.focus();
  await variantLink.press('Enter');
  await page.locator('.principle-detail').waitFor();
  const origin = new URLSearchParams(page.url().split('?')[1]).get('returnTo');
  assert.ok(origin.includes(`version=${candidate.version}`));
  assert.ok(origin.includes(`scroll=${originScroll}`));
  await page.getByRole('link', { name: 'Retour à la fiche : Product Reference', exact: true }).click();
  await page.locator('[data-testid="business-sheet"]').waitFor();
  await page.waitForFunction(
    (top) => Math.abs(document.querySelector('.workspace-content').scrollTop - top) < 3,
    originScroll,
  );
  // Glossary → principle → glossary keeps the selected term and edition.
  await visit('glossary', { glossary: 'model', term: 'TER386' });
  await page.locator('#term-TER386 a.principle-reference').click();
  await page.locator('.principle-detail').waitFor();
  await page.getByRole('link', { name: 'Retour au glossaire', exact: true }).click();
  await page.locator('#term-TER386').waitFor();
  assert.ok(page.url().includes(`version=${candidate.version}`));
  // Existing help stays short; a principle link adds no hover panel.
  await visit('sheet', { node: 'supply-chain-orchestration' });
  const termHelp = page.locator('.business-pedagogy a.model-reference[href*="term=TER011"]').first();
  await termHelp.focus();
  const tooltip = page.getByRole('tooltip');
  await tooltip.waitFor();
  const term = candidate.raw.glossary.terms.find((t) => t.id === 'TER011');
  assert.equal(await tooltip.locator(':scope > span').textContent(), plainInlineText(term.short_description));
  assert.equal(await tooltip.getByRole('link').count(), 0);
  await termHelp.press('Escape');
  await page.locator('.business-pedagogy a.principle-reference').first().focus();
  assert.equal(await page.getByRole('tooltip').count(), 0);
  await visit('sheet', { node: 'D04.i' });
  const sheetLink = page.locator('.sheet-principles a').filter({ hasText: 'Un SCM décisionnel' });
  await sheetLink.click();
  await page
    .getByRole('heading', {
      name: 'Un SCM décisionnel fondé sur le cycle complet des commandes',
      exact: true,
      level: 2,
    })
    .waitFor();
  assert.ok(new URLSearchParams(page.url().split('?')[1]).get('returnTo').includes('D04.i'));
  const orderName = candidate.raw.nodes.find((n) => n.id === 'D04.i').fields.name;
  await page.getByRole('link', { name: `Retour à la fiche : ${orderName}`, exact: true }).click();
  await page.locator('[data-testid="business-sheet"]').waitFor();
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 600 },
    { width: 390, height: 700 },
  ]) {
    await page.setViewportSize(size);
    if (size.width < 1001) await page.getByRole('button', { name: 'Ouvrir le panneau', exact: true }).click();
    const input = page.locator('#fa-search');
    await input.fill('saison');
    await page.locator('[data-search-result="PRINCIPLE-CONFIGURABLE-CONTEXTS"]').waitFor();
    const inputBox = await input.boundingBox(),
      resultBox = await page.locator('.search-results').boundingBox();
    assert.ok(inputBox.y < 160, `search stays at top: ${JSON.stringify(size)}`);
    assert.ok(
      resultBox.height > size.height * 0.5,
      `results get more than half height: ${JSON.stringify(size)} ${resultBox.height}`,
    );
    assert.ok(await page.locator('.primary-spaces').isHidden());
    await page.getByRole('combobox', { name: 'Type de résultat', exact: true }).selectOption('principle');
    await input.press('ArrowDown');
    assert.ok(await page.locator('[data-search-result]:focus').count());
    await page.locator('[data-search-result="PRINCIPLE-CONFIGURABLE-CONTEXTS"]').click();
    await page.getByRole('heading', { name: 'Des contextes configurables', exact: true, level: 2 }).waitFor();
    assert.ok(page.url().includes(`version=${candidate.version}`));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  const output = resolve(root, '.runtime/principles-U1160');
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: resolve(output, 'mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit('design-principles');
  await page.screenshot({ path: resolve(output, 'index.png'), fullPage: true });
  // Actual old publication retains its own minimal principles and method route.
  const old = candidate.index.versions.find((x) => x.version === '2026-09-13.5');
  assert.ok(old);
  await page.goto(`${base}#/design-principles?version=${old.version}`);
  await page.locator('.principle-conventions').waitFor();
  assert.equal(await page.locator('.principle-filters').count(), 0);
  assert.equal(await page.getByText('Des contextes configurables', { exact: true }).count(), 0);
  await page.goto(`${base}#/principles?version=${old.version}`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  assert.notEqual(await page.getByRole('heading', { level: 1 }).textContent(), 'Principes directeurs');
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      status: 'passed',
      principles: 14,
      linkedNodes: linkedNodes.length,
      linkedTerms: linkedTerms.length,
      linkedRelations: linkedRelations.length,
      viewportChecks: 3,
      historicalVersion: old.version,
    }),
  );
} finally {
  await browser.close();
}
