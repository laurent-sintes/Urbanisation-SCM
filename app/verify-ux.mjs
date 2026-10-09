// Exercise the reader and a prepared guide without changing a frozen publication.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const root = resolve(import.meta.dirname, '..'),
  dist = resolve(root, 'app/dist'),
  output = resolve(root, 'app/.runtime/qa-ux');
const fixture = JSON.parse(
  execFileSync(
    process.env.ATLAS_PYTHON || 'python',
    [
      '-X',
      'utf8',
      '-c',
      "import json; from scripts.structured_io import read; from scripts.export_publication import export; print(json.dumps({'model':export('.')['raw'],'guide':read('modeles/modeling-guides/versions/2026-09-28.1.yaml'),'domainId':next(n['id'] for n in read('modeles/backlog/model.yaml')['nodes'] if n['kind']=='domain' and n['fields']['name']=='Supply Chain Orchestration')},ensure_ascii=True))",
    ],
    { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 24 * 1024 * 1024 },
  ),
);
// Preview the requested identity change in an isolated fixture; production stays publication-only.
const priorDomain = fixture.model.nodes.find(
  (n) => n.kind === 'domain' && n.fields.name === 'Supply Chain Orchestration',
);
fixture.model = JSON.parse(JSON.stringify(fixture.model).replaceAll(priorDomain.id, fixture.domainId));
await mkdir(output, { recursive: true });
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
    errors = [];
  page.setDefaultTimeout(10000);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://atlas.test') return route.abort();
    if (url.pathname === '/data/index.json')
      return route.fulfill({
        json: { current_version: fixture.model.version, versions: [{ version: fixture.model.version }] },
      });
    if (url.pathname.endsWith('/model.json')) return route.fulfill({ json: fixture.model });
    if (url.pathname.endsWith('/guide.json'))
      return route.fulfill({
        json: {
          schema_version: '1.0.0',
          publication_version: fixture.model.version,
          status: 'available',
          message: '',
          guide: fixture.guide,
        },
      });
    const path = resolve(dist, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
    if (!path.startsWith(dist + sep)) return route.abort();
    try {
      return route.fulfill({
        body: await readFile(path),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
          }[extname(path)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Missing' });
    }
  });
  const visit = async (v) => {
    const { view = '', ...query } = { version: fixture.model.version, ...v };
    await page.goto(`http://atlas.test/#/${view}?${new URLSearchParams(query)}`);
    await page.locator('.workspace-content').waitFor();
  };
  const params = () => new URLSearchParams(new URL(page.url()).hash.split('?')[1]);
  const supply = fixture.model.nodes.find((n) => n.kind === 'domain' && n.fields.name === 'Supply Chain Orchestration');
  await visit({ view: 'sheet', node: supply.id, section: 'definition' });
  await page.getByTestId('business-sheet').waitFor();
  assert.equal(params().get('node'), fixture.domainId);
  assert.equal(await page.locator('a[href*="node=universe-supply"]').count(), 0);
  await page.reload();
  await page.getByRole('heading', { name: supply.fields.name, exact: true }).first().waitFor();
  await page.waitForFunction((id) => document.activeElement?.id === `field-${id}-definition`, supply.id);
  await visit({ view: 'relations', node: supply.id, level: 'universe' });
  await page.locator('.dependency-settings summary').click();
  await page.getByLabel('Niveau de lecture').waitFor();
  assert.equal(await page.getByLabel('Niveau de lecture').inputValue(), 'domain');
  const system = fixture.model.nodes.find((n) => n.kind === 'business_system');
  await visit({ view: 'relations', node: system.id });
  await page.locator('.dependency-settings summary').click();
  await page.getByLabel('Niveau de lecture').waitFor();
  assert.equal(await page.getByLabel('Niveau de lecture').inputValue(), 'business_system');

  await visit({ view: 'glossary', glossary: 'meta', term: 'MOD007' });
  await page.getByRole('heading', { name: 'Type de capacité', exact: true }).waitFor();
  for (const label of ['Objets et liens', 'Qualificatifs', 'Notions connexes'])
    await page.getByRole('heading', { name: label, exact: true }).waitFor();
  assert.equal(await page.locator('.glossary-index a').count(), 21);
  for (const id of [
    'MOD004',
    'MOD001',
    'MOD002',
    'MOD003',
    'MOD005',
    'MOD017',
    'MOD019',
    'MOD020',
    'MOD021',
    'MOD023',
    'MOD024',
    'MOD025',
    'TER001',
    'TER030',
    'TER026',
    'TER027',
    'TER028',
    'TER029',
    'TER031',
  ])
    assert.equal(await page.locator(`.glossary-index a[href*="term=${id}"]`).count(), 0, id);
  assert.equal(await page.locator('.glossary-term dt').count(), 10);
  await visit({ view: 'glossary', glossary: 'meta', term: 'TER001' });
  await page.locator('.glossary-term h2').filter({ hasText: 'Capacité' }).waitFor();
  await visit({ view: 'glossary', glossary: 'meta', term: 'MOD017' });
  await page.getByRole('link', { name: 'Consulter cette règle' }).click();
  await page.getByRole('heading', { name: 'Termes à ne pas confondre', exact: true }).waitFor();
  await visit({ view: 'principles', principle: 'start' });
  await page.locator('.method-chapter').waitFor();
  assert.equal(
    await page.locator('.method-chapter details').count(),
    fixture.guide.chapters.find((c) => c.id === 'start').sections.filter((s) => s.detail).length,
  );
  const detail = page.locator('.method-chapter details').first();
  await detail.locator('summary').click();
  assert.equal(await detail.getAttribute('open'), '');
  await detail.locator('summary').click();
  assert.ok((await page.locator('.method-chapter a[href*="term=MOD"]').count()) >= 7);
  assert.equal(await page.locator('.model-tree').count(), 0);
  const panelToggle = page.locator('#fa-tree-open');
  if ((await panelToggle.getAttribute('aria-expanded')) === 'false') await panelToggle.click();
  const atlasSpaces = page.getByRole('navigation', { name: 'Espaces Atlas' });
  assert.equal(await atlasSpaces.getByRole('button').count(), 6);
  assert.equal(await atlasSpaces.getByRole('button', { name: 'Points chauds' }).count(), 1);
  const cap = page.locator('.method-chapter a[href*="term=MOD015"]').first();
  await page.mouse.move(0, 0);
  for (let attempt = 0; attempt < 3; attempt++) {
    await cap.focus();
    await page.waitForFunction(() => !!document.activeElement?.getAttribute('aria-describedby'));
    const tooltipId = await cap.getAttribute('aria-describedby');
    await page.locator(`[id="${tooltipId}"]`).waitFor();
    await page.keyboard.press('Escape');
    await page.locator(`[id="${tooltipId}"]`).waitFor({ state: 'hidden' });
    assert.equal(await cap.getAttribute('aria-describedby'), null);
    await cap.evaluate((el) => el.blur());
  }
  await cap.click();
  await page.getByRole('heading', { name: 'Capacité', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Retour à la méthode', exact: true }).click();
  await page.locator('.method-chapter').waitFor();
  await page.screenshot({ path: resolve(output, 'start.png') });
  await page.getByLabel('Rechercher dans le modèle publié').fill('MOD028');
  await page.locator('[data-search-result="MOD028"]').click();
  await page.locator('.glossary-term').waitFor();
  assert.equal(params().get('term'), 'MOD028');
  assert.equal(await page.getByRole('link', { name: 'Cas d’usage', exact: true }).count(), 0);
  await visit({ view: 'sheet', node: 'D05.e' });
  await page.getByTestId('business-sheet').waitFor();
  assert.equal(await page.locator('.business-sheet details').count(), 0);
  assert.equal(await page.locator('.behavior-summary').count(), 3);
  const relationIds = await page
    .locator('[data-relation-id]')
    .evaluateAll((els) => els.map((el) => el.dataset.relationId));
  assert.ok(relationIds.length > 10);
  assert.equal(new Set(relationIds).size, relationIds.length);
  await page.locator('.sheet-toc').getByRole('button', { name: 'Comportements', exact: true }).click();
  await page.screenshot({ path: resolve(output, 'behaviors.png') });
  await visit({ view: 'scenarios', capability: 'D05.e' });
  await page.locator('.scenario-cards').waitFor();
  assert.equal(
    await page.getByRole('combobox', { name: 'Capacité ou référentiel', exact: true }).inputValue(),
    'D05.e',
  );
  await page.locator('.scenario-cards a').last().scrollIntoViewIfNeeded();
  const scroll = await page.locator('.workspace-content').evaluate((el) => el.scrollTop);
  await page.locator('.scenario-cards > li > a').last().click();
  await page.locator('.mobilization-steps').waitFor();
  assert.equal(await page.getByRole('combobox', { name: 'Parcours de mobilisation', exact: true }).count(), 0);
  await page.getByRole('link', { name: 'Catalogue des scénarios', exact: true }).click();
  await page.locator('.scenario-cards').waitFor();
  assert.equal(params().get('capability'), 'D05.e');
  assert.ok(
    Math.abs((await page.locator('.workspace-content').evaluate((el) => el.scrollTop)) - scroll) < 5,
    'Restore catalogue scroll',
  );
  await visit({ view: 'scenarios', scenario: 'b2b-partial-stock', path: 'b2b-partial-stock-split-path' });
  await page.getByRole('heading', { name: 'Livraison fractionnée', exact: true }).waitFor();
  assert.equal(await page.locator('.scenario-catalog details').count(), 0);
  await page.locator('.mobilization-steps .model-reference').first().click();
  await page.getByTestId('business-sheet').waitFor();
  await page.reload();
  await page.getByRole('link', { name: 'Retour au scénario', exact: true }).click();
  await page.getByRole('heading', { name: 'Livraison fractionnée', exact: true }).waitFor();
  assert.equal(params().get('path'), 'b2b-partial-stock-split-path');
  await visit({ view: 'scenarios', stream: 'recover-value' });
  await page.getByRole('heading', { name: 'Comprendre ce flux de valeur', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Catalogue des scénarios', exact: true }).click();
  await page.getByRole('heading', { name: 'Trouver un scénario', exact: true }).waitFor();
  assert.equal(params().get('stream'), null);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const view of [
    { view: 'scenarios' },
    { view: 'principles', principle: 'start' },
    { view: 'sheet', node: 'D05.e' },
    { view: 'glossary', glossary: 'meta', term: 'MOD027' },
  ]) {
    await visit(view);
    await page.waitForTimeout(100);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      JSON.stringify(view),
    );
  }
  await visit({ view: 'scenarios' });
  const advanced = page.locator('.scenario-advanced-filters');
  assert.equal(await advanced.getAttribute('open'), null, 'Mobile scenarios start with compact filters');
  await advanced.locator('summary').click();
  assert.equal(await advanced.getAttribute('open'), '', 'Mobile advanced filters expand');
  await visit({ view: 'glossary', glossary: 'meta' });
  assert.equal(
    await page.locator('.glossary-term h2').innerText(),
    await page.locator('.glossary-index li a').first().innerText(),
  );
  assert.equal(await page.locator('.glossary-term').evaluate((el) => getComputedStyle(el).overflowY), 'visible');
  await page.getByRole('button', { name: 'Ouvrir le panneau', exact: true }).click();
  await page.locator('.sidebar.open').waitFor();
  const last = page.locator('.sidebar.open button:visible,.sidebar.open a:visible').last();
  await last.focus();
  await page.keyboard.press('Tab');
  assert.ok(await page.locator('.sidebar.open').evaluate((el) => el.contains(document.activeElement)));
  await page.keyboard.press('Escape');
  await page.locator('.sidebar.open').waitFor({ state: 'hidden' });
  await visit({ view: 'principles', principle: 'start' });
  await page.locator('.method-chapter').waitFor();
  await page.screenshot({ path: resolve(output, 'mobile.png') });
  assert.deepEqual(errors, []);
  console.log(
    'UX checks passed: direct reading, method links, keyboard help, active notions, all relations, filters/scroll, scenario return/reload, mobile and drawer focus.',
  );
} finally {
  await browser.close();
}
