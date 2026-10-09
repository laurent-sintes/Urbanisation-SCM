/** Isolated backlog fixture: never publishes data or changes the served catalog. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserOptions, chromium } from './browser-runtime.mjs';

const app = path.dirname(fileURLToPath(import.meta.url)),
  dist = path.join(app, 'dist');
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = catalog.current_version;
const generated = spawnSync(
  process.env.ATLAS_PYTHON || 'python',
  [
    '-c',
    "import json; from scripts.structured_io import read; from scripts.display_codes import build_display_index; m=read('modeles/backlog/model.yaml'); m['glossary']=read('modeles/backlog/glossary.yaml'); m['space']='release'; m['display_index']=build_display_index(m); print(json.dumps(m,ensure_ascii=True))",
  ],
  { cwd: path.dirname(app), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);
assert.equal(generated.status, 0, generated.stderr);
const raw = JSON.parse(generated.stdout);
raw.version = version;
catalog.versions.find((v) => v.version === version).model_sha256 = createHash('sha256')
  .update(JSON.stringify(raw))
  .digest('hex');
const groups = {
  'ba-partner-agreement-references': ['D09', 'D11', 'customer-credit-profile'],
  'ba-product-references': ['D08', 'product-price-book', 'D12', 'D16'],
  'ba-service-references': ['D13', 'D14', 'service-price-book'],
  'ba-packaging-references': ['packaging-material-reference', 'packaging-specification'],
  'ba-internal-supplies-equipment-references': ['internal-supplies-equipment-reference'],
};
const common = [],
  references = Object.values(groups).flat();
assert.equal(
  raw.nodes.length,
  new Set(raw.nodes.map((node) => node.id)).size,
  'Persistent identities must not be copied',
);
assert.equal(references.length, 13);
assert.deepEqual(
  new Set(raw.nodes.filter((node) => node.kind === 'reference').map((node) => node.id)),
  new Set(references),
);
for (const id of references) {
  const expected = common.includes(id)
    ? 'business-references'
    : Object.entries(groups).find(([, ids]) => ids.includes(id))[0];
  const parents = raw.relations.filter((edge) => edge.target_id === id && ['contains', 'presents'].includes(edge.type));
  assert.deepEqual(
    parents.map((edge) => [edge.source_id, edge.type]),
    [[expected, 'presents']],
    id + ' has exactly one documentary parent',
  );
}
assert.equal(raw.nodes.find((node) => node.id === 'ba-product-references').fields.name, 'Merchandise References');
const base = 'https://atlas.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } }),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    assert.ok(url.href.startsWith(base));
    const rel = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (rel === 'data/index.json') return route.fulfill({ json: catalog });
    if (rel === `data/${version}/model.json`) return route.fulfill({ json: raw });
    const target = path.resolve(dist, rel);
    assert.ok(target.startsWith(dist + path.sep));
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
    };
    await route.fulfill({
      body: await readFile(target),
      contentType: types[path.extname(target)] || 'application/octet-stream',
    });
  });
  await page.goto(base + `#version=${version}&node=business-references&view=map`);
  await page.locator('.category-banner').first().waitFor();
  assert.equal(await page.locator('.category-banner[data-business-area]').count(), 5);
  const displayed = await page.locator('.business-card').evaluateAll((cs) => cs.map((c) => c.dataset.nodeId));
  assert.equal(displayed.length, new Set(displayed).size, 'Common reference cards appear only once');
  assert.deepEqual(new Set(displayed), new Set(references));
  assert.equal(await page.locator('.business-card[data-kind="reference"]').count(), 13);
  for (const id of common)
    assert.equal(
      await page.locator(`.business-card[data-node-id="${id}"]`).count(),
      1,
      id + ' remains visible in the common foundation',
    );
  assert.deepEqual(await page.locator('.scope-statistics li').allTextContents(), [
    '5 Business Areas',
    '13 référentiels',
    '0 capacités',
    '0 comportements',
  ]);
  assert.equal(await page.locator('.business-card[data-kind="reference"] .card-child-list').count(), 0);
  assert.equal(await page.locator('.business-card .card-id,.category-banner .reading-code').count(), 0);
  const output = path.join(app, '.runtime/qa-reference-areas');
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, 'overview.png') });
  for (const [area, ids] of Object.entries(groups)) {
    await page.goto(base + `#version=${version}&node=${area}&view=map`);
    await page.locator(`.business-card[data-node-id="${ids[0]}"]`).waitFor();
    assert.deepEqual(
      new Set(await page.locator('.business-card').evaluateAll((cs) => cs.map((c) => c.dataset.nodeId))),
      new Set(ids),
    );
  }
  for (const id of [
    'D08',
    'product-price-book',
    'customer-credit-profile',
    'packaging-material-reference',
    'packaging-specification',
    'internal-supplies-equipment-reference',
  ]) {
    await page.goto(base + `#version=${version}&node=${id}&view=sheet`);
    await page.getByTestId('business-sheet').waitFor();
    await page
      .getByRole('heading', { name: raw.nodes.find((node) => node.id === id).fields.name, exact: true, level: 1 })
      .waitFor();
    assert.ok((await page.locator('.eyebrow').innerText()).includes('REF-'), id + ' is a reference');
    assert.equal(await page.locator('.workspace-content .unresolved-reference').count(), 0, id + ' links');
  }
  await page.goto(base + `#version=${version}&node=service-price-book&view=sheet`);
  await page.getByTestId('business-sheet').waitFor();
  await page.getByRole('heading', { name: 'Service Price Book', exact: true, level: 1 }).waitFor();
  assert.ok((await page.locator('.eyebrow').innerText()).includes('REF-'));
  await page.goto(base + `#version=${version}&node=subdomain-plans&view=map`);
  await page.getByRole('heading', { name: 'Plan Visibility', exact: true, level: 1 }).waitFor();
  await page.locator('.business-card[data-node-id="plans-visibility"]').waitFor();
  assert.ok((await page.locator('.eyebrow').innerText()).toLowerCase().includes('business area'));
  assert.equal(await page.locator('.business-card').count(), 2);
  await page.goto(base + `#version=${version}&node=D04.i&view=map`);
  await page.locator('.business-card[data-node-id="sales-order-preorder"]').waitFor();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      status: 'passed',
      fixture: true,
      areas: 5,
      references: 13,
      commonReferences: 0,
      checks: [
        'five banners',
        'thirteen documentary cards',
        'references grouped by business subject',
        'unique identities and parents',
        'area navigation',
        'new reference sheets and links',
        'header totals',
        'overview without codes',
      ],
    }),
  );
} finally {
  await browser.close();
}
