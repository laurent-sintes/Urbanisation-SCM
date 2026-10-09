import assert from 'node:assert/strict';
// Headless, isolated browser fixture using the real immutable publication and guide loader.
// No listener is started and no publication or production server is modified.
import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPublication } from '../scripts/load-publication.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { plainInlineText } from './src/inlineLinks.ts';
import { lessonForPublication } from './src/modelingGuide.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'app/dist');
const output = resolve(root, 'app/.runtime/qa-modeling-guide');
const python = process.env.ATLAS_PYTHON || 'python';
const current = (await loadPublication()).raw;
const old = (await loadPublication({ version: '2026-09-13.5' })).raw;
const loadGuide = (version) =>
  JSON.parse(
    execFileSync(
      python,
      [
        '-X',
        'utf8',
        '-c',
        "import json,sys;sys.path.insert(0,'app');from modeling_guide import load_modeling_guide;print(json.dumps(load_modeling_guide(version=sys.argv[1]),ensure_ascii=True))",
        version,
      ],
      { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
    ),
  );
const guideResponse = loadGuide(current.version);
const unavailable = loadGuide(old.version);
assert.equal(guideResponse.status, 'available');
assert.equal(unavailable.status, 'unavailable');
const guide = guideResponse.guide;
assert.equal(guide.lessons.length, 6);
const first = guide.lessons[0];
const ids = new Set(current.nodes.map((node) => node.id));
await mkdir(output, { recursive: true });
const browser = await chromium.launch(browserOptions);
const errors = [],
  checks = [],
  requests = [];
let holdGuide;
let injectMissingLink = false;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.pathname + url.search);
    if (url.origin !== 'http://atlas.test') return route.abort();
    if (url.pathname === '/data/index.json')
      return route.fulfill({
        json: {
          current_version: current.version,
          versions: [current, old].map((model) => ({ version: model.version, revision: model.revision })),
        },
      });
    if (url.pathname.endsWith('/model.json')) {
      assert.ok([current.version, old.version].includes(url.pathname.split('/').at(-2)), 'Model reads must be pinned.');
      return route.fulfill({ json: url.pathname.split('/').at(-2) === old.version ? old : current });
    }
    if (url.pathname.endsWith('/guide.json')) {
      const version = url.pathname.split('/').at(-2);
      assert.ok([current.version, old.version].includes(version), 'Guide reads must be pinned.');
      const response = structuredClone(version === old.version ? unavailable : guideResponse);
      if (injectMissingLink && response.guide)
        response.guide.lessons[0].model_links.push({
          id: 'QA_NOT_IN_PUBLICATION',
          label: 'Référence absente de cette publication',
        });
      const held = holdGuide?.version === version ? holdGuide : null;
      if (held) {
        holdGuide = null;
        held.entered();
        await held.wait;
        // An aborted request may no longer be fulfillable after a version switch.
        try {
          await route.fulfill({ json: response });
        } catch {
          /* Abort is expected. */
        }
        held.completed();
        return;
      }
      return route.fulfill({ json: response });
    }
    if (url.pathname.startsWith('/data/'))
      return route.fulfill({ status: 404, json: { error: 'Unexpected fixture endpoint' } });
    const path = resolve(dist, `.${url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)}`);
    if (!path.startsWith(dist + sep)) return route.abort();
    try {
      return await route.fulfill({
        body: await readFile(path),
        contentType:
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.webmanifest': 'application/manifest+json',
          }[extname(path)] || 'application/octet-stream',
      });
    } catch {
      return route.fulfill({ status: 404, body: 'Not found' });
    }
  });

  const visit = async (params) => {
    const { view = '', ...query } = { version: current.version, ...params };
    return page.goto(`http://atlas.test/#/${view}?${new URLSearchParams(query)}`);
  };
  const nav = page.getByRole('navigation', { name: 'Choisir un principe' });
  const currentLesson = (lesson) => page.getByRole('heading', { name: lesson.title, exact: true });
  await visit({ view: 'sheet', node: current.nodes.find((node) => node.kind === 'capability').id });
  await page.getByTestId('business-sheet').waitFor();
  const panelToggle = page.locator('#fa-tree-open');
  if ((await panelToggle.getAttribute('aria-expanded')) === 'false') await panelToggle.click();
  await page.getByRole('button', { name: guide.title, exact: true }).click();
  if (guide.chapters) {
    const chapters = page.locator('.method-chapters');
    await chapters.waitFor();
    assert.equal(
      (await chapters.getByRole('button').allTextContents()).filter((title) =>
        guide.chapters.some((chapter) => chapter.title === title),
      ).length,
      guide.chapters.length,
    );
    for (const chapter of guide.chapters) {
      await chapters.getByRole('button', { name: chapter.title, exact: true }).click();
      await page.getByRole('heading', { name: chapter.title, exact: true }).waitFor();
      assert.ok((await page.locator('.method-chapter').innerText()).includes(plainInlineText(chapter.intro)));
    }
    await chapters
      .getByRole('button', { name: guide.chapters.find((c) => c.id === 'metamodel').title, exact: true })
      .click();
    await nav.getByRole('button').first().click();
    checks.push('Rubriques de l’édition figée, sans nombre imposé.');
  }
  await currentLesson(first).waitFor();
  assert.equal(await nav.getByRole('button').count(), 6);
  assert.equal(new URL(page.url()).hash.startsWith('#/principles?'), true);
  assert.equal(await page.getByRole('heading', { level: 1, name: guide.title, exact: true }).count(), 1);
  checks.push('Entrée depuis la fiche : six clés, vue dédiée et publication conservée.');

  for (let i = 0; i < guide.lessons.length; i++) {
    const lesson = guide.lessons[i];
    await nav.getByRole('button').nth(i).click();
    await currentLesson(lesson).waitFor();
    assert.equal(await nav.getByRole('button').nth(i).getAttribute('aria-pressed'), 'true');
    assert.ok(page.url().includes(`principle=${lesson.id}`));
    const feedback = page.locator('.guide-answer');
    assert.equal(await feedback.innerText(), '');
    assert.ok((await page.locator('.guide-explanation').innerText()).includes(lesson.explanation));
    await page.getByText('Tester ma compréhension', { exact: true }).click();
    for (let choice = 0; choice < lesson.choices.length; choice++) {
      await page.locator('.guide-choices button').nth(choice).click();
      assert.ok((await feedback.innerText()).includes(lesson.choices[choice].feedback));
    }
    const contribution = await page.locator('.guide-contributor-content').innerText();
    assert.ok(contribution.includes(lesson.contributor.criterion));
    assert.ok(contribution.includes(lessonForPublication(lesson, current).contributor.boundary));
    for (const link of lesson.model_links.filter((link) => ids.has(link.id))) {
      const href = await page
        .locator('.guide-model-links a')
        .filter({ hasText: current.nodes.find((node) => node.id === link.id).fields.name })
        .first()
        .getAttribute('href');
      assert.ok(href.includes(`version=${current.version}`));
    }
  }
  checks.push('Six principes, exercices, explications et liens de la même publication.');
  if (guide.chapters) {
    const cap = current.nodes.find((node) => node.kind === 'capability');
    await visit({ view: 'sheet', node: cap.id });
    await page.getByRole('link', { name: 'Qu’est-ce qu’une capacité ?', exact: true }).click();
    await page.getByRole('heading', { name: 'Capacité', exact: true }).waitFor();
    assert.ok(page.url().includes('term=MOD015'));
    assert.ok(page.url().includes(`version=${current.version}`));
    await page.getByRole('link', { name: `Retour à la fiche : ${cap.fields.name}`, exact: true }).click();
    await page.getByTestId('business-sheet').waitFor();
    await visit({ view: 'glossary', glossary: 'meta', term: 'MOD026', node: cap.id });
    await page.getByRole('link', { name: 'Parcours de mobilisation', exact: true }).click();
    const mobilizationPath = guide.glossary.terms.find((term) => term.id === 'MOD028');
    assert.ok(mobilizationPath, 'La publication doit définir le parcours de mobilisation.');
    await page.getByRole('heading', { name: mobilizationPath.label_fr, exact: true }).waitFor();
    assert.equal(new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get('term'), 'MOD028');
    assert.ok((await page.locator('.glossary-term').innerText()).includes('couverture des situations examinées'));
    await page.setViewportSize({ width: 390, height: 844 });
    await visit({ view: 'principles', principle: 'start' });
    await page
      .getByRole('heading', { name: guide.chapters.find((c) => c.id === 'start').title, exact: true })
      .waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: resolve(output, 'method-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1100 });
    checks.push('Liens contextuels, retour fiche, notions associées et lecture mobile.');
  }
  await visit({ version: old.version, view: 'principles' });
  await page.getByRole('heading', { name: 'Guide non associé à cette publication' }).waitFor();
  await visit({ view: 'principles', principle: 'missing' });
  await page.getByRole('heading', { name: 'Principe absent de ce guide' }).waitFor();
  checks.push('Historique sans guide et principe inconnu : absence explicite sans repli.');
  let entered, complete, release;
  const waiting = new Promise((resolve) => {
    entered = resolve;
  });
  const completed = new Promise((resolve) => {
    complete = resolve;
  });
  holdGuide = {
    version: current.version,
    entered,
    completed: complete,
    wait: new Promise((resolve) => {
      release = resolve;
    }),
  };
  await page.goto(`http://atlas.test/#/principles?version=${current.version}`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await Promise.race([
    waiting,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Guide request not started')), 10000)),
  ]);
  await page.getByText(`Chargement de la méthodologie pour ${current.version}…`).waitFor();
  await page.goto(`http://atlas.test/#/principles?version=${old.version}`);
  await page.getByRole('heading', { name: 'Guide non associé à cette publication' }).waitFor();
  release();
  await Promise.race([
    completed,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Late guide did not settle')), 10000)),
  ]);
  assert.equal(await page.locator('.guide-lesson').count(), 0);
  checks.push('Chargement visible et réponse tardive ignorée après changement de publication.');
  injectMissingLink = true;
  await visit({ view: 'principles', principle: first.id });
  await currentLesson(first).waitFor();
  assert.ok((await page.locator('.guide-unpublished').innerText()).includes('Référence absente de cette publication'));
  assert.equal(await page.getByRole('link', { name: 'Référence absente de cette publication' }).count(), 0);
  assert.ok(!requests.some((url) => url.includes('/api/') || url.includes('backlog')));
  assert.deepEqual(errors, []);
  await page.screenshot({ path: resolve(output, 'guide.png'), fullPage: true });
  console.log(JSON.stringify({ status: 'passed', publication: current.version, checks }));
} finally {
  await browser.close();
}
