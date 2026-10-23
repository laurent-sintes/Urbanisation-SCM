/** Exercise the built SPA under a Pages project prefix, with only static files. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadServer } from './browser-download-server.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(directory, 'dist');
const catalog = JSON.parse(await readFile(path.join(dist, 'data/index.json'), 'utf8'));
const version = catalog.current_version;
const currentModel = JSON.parse(await readFile(path.join(dist, 'data', version, 'model.json'), 'utf8'));
const rootName = currentModel.nodes.find((node) => node.kind === 'universe')?.fields?.name;
assert.ok(rootName, 'The selected publication has a named root');
const historical = catalog.versions.find((item) => item.version !== version).version;
const prefix = '/Urbanisation/';
const downloadFixture = await downloadServer(dist, prefix);
const base = downloadFixture.base;
const types = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.html': 'text/html',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};
const browser = await chromium.launch(browserOptions);
const errors = [],
  requests = [],
  unexpected = [];
let releaseModel;
const gate = new Promise((resolve) => {
  releaseModel = resolve;
});
let failModel = true;
let failGuideModule = false;
let newerBuild = false;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname);
    if (url.origin !== new URL(base).origin || !url.pathname.startsWith(prefix) || url.pathname.includes('/api/')) {
      unexpected.push(url.pathname);
      return route.abort();
    }
    const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
    if (relative === '__atlas__/workshop/staging.json') return route.fulfill({ status: 404, body: '{}' });
    const target = path.resolve(dist, relative);
    if (!target.startsWith(dist + path.sep)) return route.abort();
    if (route.request().isNavigationRequest() && /(?:\/model\.(?:json|yaml)|\.pdf)$/.test(relative))
      return route.continue();
    if (relative === 'delivery.json' && newerBuild)
      return route.fulfill({ json: { schema_version: 1, files: { 'index.html': 'new-build' } } });
    if (failGuideModule && /ModelingGuidePage-.*\.js$/.test(relative))
      return route.fulfill({ status: 503, body: 'Stale lazy module' });
    if (relative === `data/${version}/model.json`) {
      await gate;
      if (failModel)
        return route.fulfill({ status: 503, contentType: 'text/html', body: '<h1>Temporarily unavailable</h1>' });
    }
    try {
      await route.fulfill({
        body: await readFile(target),
        contentType: types[path.extname(target)] || 'application/octet-stream',
      });
    } catch {
      unexpected.push(relative);
      await route.fulfill({ status: 404, body: 'Missing static file' });
    }
  });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Ouverture du modèle…' }).waitFor();
  assert.equal(
    requests.some((url) => url.includes(historical)),
    false,
    'History is not preloaded',
  );
  releaseModel();
  await page.getByRole('heading', { name: 'Publication indisponible' }).waitFor();
  assert.match(await page.getByRole('alert').innerText(), /HTTP 503/);
  failModel = false;
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  await page.getByText('Business Operations', { exact: true }).first().waitFor();
  const panelToggle = page.locator('#fa-tree-open');
  assert.equal(await panelToggle.getAttribute('aria-expanded'), 'true', 'Explorer opens by default on desktop');
  await panelToggle.click();
  assert.equal(await panelToggle.getAttribute('aria-expanded'), 'false');
  await page.reload();
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  assert.equal(await panelToggle.getAttribute('aria-expanded'), 'false', 'A saved collapse is respected');
  await panelToggle.click();
  await page.goto(`${base}#/documents?version=${version}`);
  await page.locator('.publication-downloads summary').click();
  assert.equal(await page.locator('.publication-downloads a[download$=".json"]').count(), 0);
  const yamlPending = page.waitForEvent('download');
  const yamlLink = page.getByRole('link', { name: /Modèle complet \(YAML\)/ });
  assert.equal(new URL(await yamlLink.getAttribute('href'), base).pathname, `${prefix}data/${version}/model.yaml`);
  await yamlLink.click();
  const yamlDownload = await yamlPending;
  assert.equal(yamlDownload.suggestedFilename(), `flow-atlas-model-${version}.yaml`);
  assert.equal(new URL(yamlDownload.url()).pathname, `${prefix}data/${version}/model.yaml`);
  assert.equal(await yamlDownload.failure(), null, 'YAML download completes');
  const downloadedYaml = await readFile(await yamlDownload.path());
  assert.deepEqual(
    downloadedYaml,
    await readFile(path.join(dist, 'data', version, 'model.yaml')),
    'Actual YAML download preserves every byte',
  );
  assert.match(downloadedYaml.toString('utf8'), /^schema_version:/);
  assert.equal(new URL(page.url()).pathname, prefix);
  const menuStudyLink = page.getByRole('link', { name: 'Télécharger « Piloter la supply chain » (PDF)', exact: true });
  await menuStudyLink.waitFor({ state: 'visible' });
  const menuStudyHref = await menuStudyLink.getAttribute('href');
  const studySource = await readFile(
    path.join(directory, '../output/pdf/FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf'),
  );
  await mkdir(path.join(directory, '.runtime/qa-static'), { recursive: true });
  await page.screenshot({ path: path.join(directory, '.runtime/qa-static/download-menu-study.png') });
  const menuStudyPending = page.waitForEvent('download');
  await menuStudyLink.click();
  const menuStudyDownload = await menuStudyPending;
  assert.equal(await menuStudyDownload.failure(), null, 'Study PDF download from the menu completes');
  assert.equal(menuStudyDownload.suggestedFilename(), 'FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf');
  assert.deepEqual(
    await readFile(await menuStudyDownload.path()),
    studySource,
    'Actual menu download preserves the complete current source PDF',
  );
  await page.goto(`${base}#/documents`);
  await page.getByRole('heading', { name: 'Études FLOW', exact: true }).waitFor();
  await mkdir(path.join(directory, '.runtime/qa-static'), { recursive: true });
  await page.screenshot({ path: path.join(directory, '.runtime/qa-static/documents-study.png') });
  const studyLink = page.getByRole('link', { name: 'Télécharger « Piloter la supply chain » (PDF)', exact: true });
  const studyHref = await studyLink.getAttribute('href');
  assert.equal(studyHref, menuStudyHref, 'The menu and Documents provide the same PDF');
  assert.match(
    new URL(studyHref, base).pathname,
    /\/assets\/FLOW-Piloter-la-supply-chain-indicateurs-et-decisions-[\w-]+\.pdf$/,
  );
  const studyPending = page.waitForEvent('download');
  await studyLink.click();
  const studyDownload = await studyPending;
  assert.equal(await studyDownload.failure(), null, 'Study PDF download completes');
  assert.equal(studyDownload.suggestedFilename(), 'FLOW-Piloter-la-supply-chain-indicateurs-et-decisions.pdf');
  assert.deepEqual(
    await readFile(await studyDownload.path()),
    studySource,
    'Actual study download preserves the complete current source PDF',
  );
  for (const selectedVersion of [version, historical]) {
    await page.setViewportSize({ width: selectedVersion === version ? 1440 : 390, height: 1000 });
    await page.goto(`${base}#/sheet?node=supply-chain-orchestration&version=${selectedVersion}`);
    const sheet = page.getByRole('article', { name: 'Fiche métier de Supply Chain Management', exact: true });
    await sheet.waitFor();
    const study = sheet.locator('.sheet-study');
    await study.getByRole('heading', { name: 'Pour approfondir', exact: true }).waitFor();
    assert.match(await study.innerText(), /PDF · 27 pages · 22 octobre 2026 · Laurent Sintès/);
    assert.match(await study.innerText(), /Étude FLOW courante, commune aux versions du modèle/);
    await study.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(directory, `.runtime/qa-static/scm-study-${selectedVersion}.png`) });
    const link = study.getByRole('link', { name: 'Télécharger le dossier (PDF)', exact: true });
    assert.equal(await link.getAttribute('href'), studyHref, 'All three study links use the same current asset');
    // Tab from the section must reach the native download link.
    await study.focus();
    await page.keyboard.press('Tab');
    assert.ok(await link.evaluate((element) => element === document.activeElement));
    const pending = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    const download = await pending;
    assert.equal(await download.failure(), null);
    assert.deepEqual(await readFile(await download.path()), studySource);
    const selectedModel = JSON.parse(await readFile(path.join(dist, 'data', selectedVersion, 'model.json'), 'utf8'));
    const definition = selectedModel.nodes.find((node) => node.id === 'supply-chain-orchestration').fields.definition;
    const plainDefinition = definition.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const definitionPanel = sheet.locator('#field-supply-chain-orchestration-definition');
    if (await definitionPanel.evaluate((element) => element.tagName === 'DETAILS' && !element.open))
      await definitionPanel.locator('summary').click();
    assert.equal(
      await sheet.locator('#field-supply-chain-orchestration-definition .business-copy').innerText(),
      plainDefinition,
    );
    await page.goto(`${base}#/sheet?node=D01&version=${selectedVersion}`);
    await page.getByRole('article', { name: 'Fiche métier de Inventory Management', exact: true }).waitFor();
    assert.equal(await page.locator('.sheet-study').count(), 0, 'The study card belongs only to the SCM domain');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}#/documents?version=${historical}`);
  await page.locator(`#fa-version[data-version="${historical}"]`).waitFor({ state: 'attached' });
  assert.equal(await studyLink.getAttribute('href'), studyHref, 'The study is separate from historical publications');
  await page.goto(`${base}#/glossary?version=${historical}`);
  await page.locator(`#fa-version[data-version="${historical}"]`).waitFor({ state: 'attached' });
  await page.goto(`${base}#/documents?version=${historical}`);
  await page.locator('.publication-downloads summary').click();
  assert.equal(await page.locator('.publication-downloads a[download$=".json"]').count(), 0);
  assert.equal(
    await menuStudyLink.getAttribute('href'),
    studyHref,
    'The download menu keeps the same study when browsing a historical publication',
  );
  const historicYamlPending = page.waitForEvent('download');
  const historicYamlLink = page.getByRole('link', { name: /Modèle complet \(YAML\)/ });
  assert.equal(
    new URL(await historicYamlLink.getAttribute('href'), base).pathname,
    `${prefix}data/${historical}/model.yaml`,
  );
  await historicYamlLink.click();
  const historicYaml = await historicYamlPending;
  assert.equal(historicYaml.suggestedFilename(), `flow-atlas-model-${historical}.yaml`);
  assert.equal(new URL(historicYaml.url()).pathname, `${prefix}data/${historical}/model.yaml`);
  assert.equal(await historicYaml.failure(), null);
  assert.deepEqual(
    await readFile(await historicYaml.path()),
    await readFile(path.join(dist, 'data', historical, 'model.yaml')),
    'Historic YAML downloads its selected snapshot',
  );
  await page.getByRole('button', { name: 'FLOW Atlas, accueil', exact: true }).click();
  assert.equal(new URL(page.url()).pathname, prefix);
  assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('version'), historical);
  // Trigger a catalog check while a historical selection is fixed.
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  assert.equal(await page.locator('#fa-version').getAttribute('data-version'), historical);
  failGuideModule = true;
  await page.goto(`${base}#/principles`);
  await page.getByRole('heading', { name: 'La lecture d’Atlas a été interrompue', exact: true }).waitFor();
  failGuideModule = false;
  await page.getByRole('button', { name: 'Recharger Atlas', exact: true }).click();
  await page.locator('.method-chapters').waitFor();
  await page.goto(base);
  await page.locator(`#fa-version[data-version="${version}"]`).waitFor({ state: 'attached' });
  await page.getByRole('button', { name: 'FLOW Atlas, accueil', exact: true }).click();
  await page.getByRole('heading', { name: rootName, exact: true, level: 1 }).waitFor();
  newerBuild = true;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.getByText('Une nouvelle version de l’interface Atlas est disponible.', { exact: true }).waitFor();
  const currentAddress = page.url();
  newerBuild = false;
  await page.getByRole('button', { name: 'Recharger l’application', exact: true }).click();
  await page.getByRole('heading', { name: rootName, exact: true, level: 1 }).waitFor();
  assert.equal(page.url(), currentAddress, 'Updating software must preserve the reading URL');
  await mkdir(path.join(directory, '.runtime/qa-static'), { recursive: true });
  await page.screenshot({ path: path.join(directory, '.runtime/qa-static/overview.png') });
  assert.deepEqual(unexpected, []);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      status: 'passed',
      version,
      historical,
      checks: [
        'project prefix',
        'visible loading',
        'HTML error',
        'retry',
        'current model',
        'Explorer default and saved collapse',
        'no public JSON download action',
        'current and historical YAML downloads',
        'study PDF downloads from the menu, Documents and domain sheet preserve the source bytes',
        'domain study link is keyboard accessible and historical definitions remain frozen',
        'same study URL in the menu, Documents and historical publications',
        'fixed history',
        'home links',
        'guide',
        'no API',
      ],
      requests: requests.length,
    }),
  );
} finally {
  releaseModel();
  await browser.close();
  await downloadFixture.close();
}
