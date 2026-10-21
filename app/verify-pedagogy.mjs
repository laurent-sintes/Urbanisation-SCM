/** Exercise pedagogical sheets in an isolated browser fixture, never publish backlog. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { plainInlineText } from './src/inlineLinks.ts';
import { adaptPublication } from './src/model.ts';

const app = import.meta.dirname,
  root = resolve(app, '..'),
  dist = resolve(app, 'dist');
const generated = spawnSync(
  process.env.ATLAS_PYTHON || 'python',
  [
    '-X',
    'utf8',
    '-c',
    "import json; from pathlib import Path; from scripts.structured_io import read; from scripts.publish_release import compile_snapshot; from scripts.guide_candidate import load_draft; m=read(Path('modeles/backlog/model.yaml')); m['glossary']=read(Path('modeles/backlog/glossary.yaml')); print(json.dumps({'model':compile_snapshot(m,{'decisions':[]},'2026-10-21.999',[]),'guide':load_draft(Path.cwd(),Path('modeles/backlog/atlas-transformation-methodology.yaml'))},ensure_ascii=True))",
  ],
  { cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 },
);
assert.equal(generated.status, 0, generated.stderr);
const candidate = JSON.parse(generated.stdout),
  raw = candidate.model,
  model = adaptPublication(raw),
  version = raw.version;
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const current = index.current_version,
  entry = structuredClone(index.versions.find((x) => x.version === current));
const modelBody = JSON.stringify(raw);
entry.version = version;
entry.model_sha256 = createHash('sha256').update(modelBody).digest('hex');
const guide = JSON.parse(await readFile(resolve(dist, `data/${current}/guide.json`), 'utf8'));
guide.publication_version = version;
guide.guide = candidate.guide;
const guideBody = JSON.stringify(guide);
entry.guide_sha256 = createHash('sha256').update(guideBody).digest('hex');
index.versions.push(entry);
index.current_version = version;
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const rel = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (rel === 'data/index.json') return route.fulfill({ json: index });
    if (rel === `data/${version}/model.json`)
      return route.fulfill({ body: modelBody, contentType: 'application/json' });
    if (rel === `data/${version}/guide.json`)
      return route.fulfill({ body: guideBody, contentType: 'application/json' });
    const file = resolve(dist, rel);
    assert.ok(file.startsWith(dist + sep));
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
  });
  const visit = async (params) => {
    const { view = '', ...query } = { version, ...params };
    return page.goto(`${base}#/${view}?${new URLSearchParams(query)}`);
  };

  const output = resolve(root, '.runtime/business-sheet-pedagogy-U1131/screenshots');
  await mkdir(output, { recursive: true });
  const pilots = [
    'supply-chain-orchestration',
    'D01',
    'ba-inventory-position-management',
    'D08',
    'process-ledger',
    'process-mining',
    'D03.j',
    'BHV004',
  ];
  const expanded = model.nodes.filter((node) =>
    ['business_system', 'domain', 'area', 'business_area'].includes(node.kind),
  );
  const ids = [...new Set([...pilots, ...expanded.map((node) => node.id)])];
  assert.equal(expanded.length, 137);
  for (const id of ids) {
    await visit({ node: id, view: 'sheet', section: 'pedagogical_description' });
    const block = page.locator('.business-pedagogy');
    await block.waitFor();
    const refs = model.nodeById.get(id).fields.pedagogical_description.example_refs || [];
    assert.ok(refs.length > 0, `${id}: exemples déclarés`);
    const expectedTitles = refs.map((ref) => {
      const source = model.nodeById.get(ref.node_id);
      assert.ok(source, `${id}: source ${ref.node_id}`);
      const matches = (source.fields.examples || []).filter(
        (example) => example && typeof example === 'object' && example.id === ref.example_id,
      );
      assert.equal(matches.length, 1, `${id}: référence unique ${ref.node_id}/${ref.example_id}`);
      assert.ok(ref.contribution?.trim(), `${id}: contribution ${ref.example_id}`);
      return matches[0].title.trim();
    });
    assert.equal(await block.locator('.pedagogy-example').count(), refs.length, `${id}: nombre d’exemples`);
    assert.deepEqual(
      (await block.locator('.pedagogy-example > h3').allTextContents()).map((title) => title.trim()),
      expectedTitles,
      `${id}: titres et ordre des exemples`,
    );
    assert.ok((await block.innerText()).includes('Contribution de ce périmètre'), id);
    assert.equal(await block.locator('.unresolved-reference').count(), 0, id);
    const expectedComparisons =
      model.nodeById.get(id).fields.pedagogical_description.market_comparison_refs?.length || 0;
    if (await block.locator('summary').count()) {
      await block.locator('summary').click();
      assert.equal(await block.locator('.pedagogy-market').count(), expectedComparisons, id);
      assert.ok(
        (await block.innerText()).includes(
          expectedComparisons ? 'équivalence complète' : 'Aucun rapprochement logiciel qualifié',
        ),
        id,
      );
    }
    assert.equal(await block.locator('.unresolved-reference').count(), 0, id);
  }
  await visit({ node: 'D01', view: 'sheet', section: 'pedagogical_description' });
  await page.locator('.business-pedagogy').waitFor();
  await page.screenshot({ path: resolve(output, 'desktop.png') });
  for (const id of [
    'system-business-operations',
    'domain-finance',
    'ba-receiving-operations',
    'subdomain-strategy-objectives',
  ]) {
    await visit({ node: id, view: 'sheet', section: 'pedagogical_description' });
    await page.locator('.business-pedagogy').waitFor();
    assert.equal(await page.locator('.understand-link').count(), 0);
    await page.screenshot({ path: resolve(output, `${id}-desktop.png`) });
  }
  // Reading uses the usual sheet tab; the map keeps only short help on names.
  await visit({ view: 'map', scope: '@root', mapDepth: '1' });
  const scmName = page.getByRole('button', { name: 'Supply Chain Management', exact: true }).first();
  assert.equal(await page.locator('.understand-link').count(), 0);
  await scmName.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await scmName.hover();
  const scmHelp = page.locator('.map-node-tooltip');
  await scmHelp.waitFor();
  assert.ok(
    (await scmHelp.innerText()).includes(plainInlineText(model.nodeById.get('supply-chain-orchestration').definition)),
  );
  await scmName.focus();
  await page.keyboard.press('Escape');
  await scmHelp.waitFor({ state: 'hidden' });
  await scmName.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('tab', { name: 'Fiche', exact: true }).click();
  const scmBlock = page.locator('.business-pedagogy');
  await scmBlock.waitFor();
  assert.ok((await scmBlock.innerText()).includes('cent tee-shirts'));
  assert.equal(await scmBlock.locator('.pedagogy-boundaries').count(), 1);
  assert.notEqual(
    await scmBlock.locator(':scope > p').first().innerText(),
    plainInlineText(model.nodeById.get('supply-chain-orchestration').definition),
  );
  await page.getByRole('tab', { name: 'Catalogue', exact: true }).click();
  assert.ok(page.url().includes('/map?'));
  assert.ok(page.url().includes(version));
  await visit({ view: 'map', scope: 'supply-chain-orchestration', node: 'D01', mapDepth: '1' });
  await page.getByRole('button', { name: 'Inventory Management', exact: true }).first().waitFor();
  assert.equal(await page.locator('.understand-link').count(), 0);
  // Short model help is the definition, never the long explanation.
  const name = page.getByRole('button', { name: 'Inventory Management', exact: true }).first();
  await name.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await name.hover();
  await name.focus();
  const help = page.locator('.map-node-tooltip');
  await help.waitFor();
  assert.ok((await help.innerText()).includes(plainInlineText(model.nodeById.get('D01').definition)));
  assert.ok(!(await help.innerText()).includes('Ce sous-domaine tient'));
  await page.keyboard.press('Escape');
  await help.waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 390, height: 844 });
  await visit({ view: 'sheet', node: 'process-ledger', section: 'pedagogical_description' });
  await page.locator('.business-pedagogy').waitFor();
  await page.locator('.business-pedagogy summary').click();
  assert.ok((await page.locator('.business-pedagogy').innerText()).includes('Appui manquant : SAP S/4HANA'));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: resolve(output, 'mobile.png') });
  for (const id of ['system-business-operations', 'ba-receiving-operations', 'subdomain-strategy-objectives']) {
    await visit({ node: id, view: 'sheet', section: 'pedagogical_description' });
    await page.locator('.business-pedagogy').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id);
    await page.screenshot({ path: resolve(output, `${id}-mobile.png`) });
  }
  // The pre-pilot publication stays the reference after a new release becomes current.
  await visit({ version: '2026-10-17.1', view: 'sheet', node: 'D01' });
  await page.getByTestId('business-sheet').waitFor();
  assert.equal(await page.locator('.business-pedagogy').count(), 0);
  assert.equal(await page.locator('.understand-link').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      status: 'passed',
      pilotSheets: pilots.length,
      scopedSheets: expanded.length,
      totalEnrichedSheets: ids.length,
      checks: [
        'examples',
        'boundaries',
        'qualified market',
        'snapshot references',
        'keyboard',
        'short help',
        'map return',
        'mobile',
        'historical absence',
      ],
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
