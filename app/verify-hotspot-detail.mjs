// Exercise the narrative against a published snapshot, missing data, and local workshop edits.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { downloadServer } from './browser-download-server.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { plainInlineText } from './src/inlineLinks.ts';
import { publicText } from './src/publicText.ts';

const dist = resolve(import.meta.dirname, process.env.ATLAS_QA_DIST || 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${index.current_version}/model.json`));
const model = JSON.parse(payload);
const original = model.hotspot_catalog.hotspots.find((item) => item.resolution_options.length >= 2);
assert.ok(original, 'the selected publication contains options to compare');
const output = resolve(import.meta.dirname, '.runtime/qa-hotspot-detail');
await mkdir(output, { recursive: true });
const browser = await chromium.launch(browserOptions);
const downloadFixture = await downloadServer(dist, '/Urbanisation-SCM/');
const base = downloadFixture.base;
const errors = [];
const posts = [];
let staging = null;
let servedModel = model;
const text = (value) => plainInlineText(publicText(value));

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative.endsWith('.pdf')) return route.continue();
    if (relative === '__atlas__/workshop/staging.json') {
      return staging ? route.fulfill({ json: staging }) : route.fulfill({ status: 404, body: '{}' });
    }
    if (relative === '__atlas__/workshop/hotspots/batch') {
      const request = route.request().postDataJSON();
      assert.equal(request.expected_revision, staging.revision);
      posts.push(request);
      for (const change of request.changes) {
        const current = staging.operations.findLast((operation) => operation.id === change.id).value;
        staging.operations.push({
          sequence: ++staging.revision,
          entity: 'hotspot',
          action: 'update',
          id: change.id,
          value: { ...current, ...change.fields },
        });
      }
      return route.fulfill({ json: staging });
    }
    const servedPayload = servedModel === model ? payload : Buffer.from(JSON.stringify(servedModel));
    if (relative === 'data/index.json') {
      return route.fulfill({
        json: {
          ...index,
          versions: index.versions.map((release) =>
            release.version === index.current_version
              ? { ...release, model_sha256: createHash('sha256').update(servedPayload).digest('hex') }
              : release,
          ),
        },
      });
    }
    if (relative === `data/${index.current_version}/model.json`)
      return route.fulfill({ body: servedPayload, contentType: 'application/json' });
    if (relative.startsWith('__atlas__/')) return route.fulfill({ status: 404, body: '{}' });
    const mime = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.pdf': 'application/pdf',
    };
    return route.fulfill({
      body: await readFile(resolve(dist, relative)),
      contentType: mime[extname(relative)] || 'application/octet-stream',
    });
  });
  let fixtureRead = 0;
  const open = async () => {
    await page.goto(`${base}?qa=${++fixtureRead}#/hotspots?version=${index.current_version}&hotspot=${original.id}`);
    await page.locator('.hotspot-detail').waitFor();
  };
  await open();
  const detail = page.locator('.hotspot-detail');
  const openDossier = async () => {
    const dossier = detail.locator('.hotspot-dossier');
    if ((await dossier.getAttribute('open')) === null) await dossier.locator('summary').click();
  };
  assert.equal(await page.locator('.workspace-header .page-heading').count(), 0, 'no duplicate visual title band');
  assert.equal(await page.getByRole('heading', { level: 1, name: 'Points chauds', exact: true }).count(), 1);
  const verifyPinnedHeader = async (fullscreen, screenshot) => {
    const scroller = page.locator(fullscreen ? '.hotspot-page' : '.workspace-content');
    const geometry = () =>
      scroller.evaluate((element) => {
        const header = element.querySelector('.hotspot-detail-header').getBoundingClientRect();
        const title = element.querySelector('#hotspot-detail-title').getBoundingClientRect();
        const viewport = element.getBoundingClientRect();
        return { header: header.toJSON(), title: title.toJSON(), viewport: viewport.toJSON() };
      });
    for (const progress of [0.4, 1]) {
      await scroller.evaluate((element, fraction) => {
        element.scrollTop = (element.scrollHeight - element.clientHeight) * fraction;
      }, progress);
      await page.waitForFunction(() => {
        const element = document.fullscreenElement || document.querySelector('.workspace-content');
        return element.scrollTop > 100;
      });
      const { header, title, viewport } = await geometry();
      assert.ok(
        title.top >= viewport.top - 1 && title.bottom <= viewport.bottom,
        `the entire title stays visible: ${JSON.stringify({ title, viewport })}`,
      );
      assert.ok(
        header.height < viewport.height * 0.6,
        `the pinned band leaves room to read the body: ${header.height}/${viewport.height}`,
      );
    }
    // Native keyboard scrolling must not put the focused control behind the title.
    await detail.locator('.hotspot-dossier summary').focus();
    for (let step = 0; step < 8; step++) {
      await page.keyboard.press('Shift+Tab');
      const focused = await detail.evaluate((element) => {
        const active = document.activeElement;
        if (!element.querySelector('.hotspot-detail-body').contains(active)) return null;
        return {
          rect: active.getBoundingClientRect().toJSON(),
          headerBottom: element.querySelector('.hotspot-detail-header').getBoundingClientRect().bottom,
        };
      });
      if (focused)
        assert.ok(
          focused.rect.top >= focused.headerBottom,
          `keyboard focus is below the pinned band: ${JSON.stringify(focused)}`,
        );
    }
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight * 0.5;
    });
    await page.screenshot({ path: resolve(output, screenshot) });
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
  };
  const documentHotspot = model.hotspot_catalog.hotspots.find((item) => item.document_ids?.length);
  assert.ok(documentHotspot, 'a hotspot links a published PDF');
  await page.goto(`${base}#/hotspots?version=${index.current_version}&hotspot=${documentHotspot.id}`);
  await detail.locator('.hotspot-dossier summary').click();
  const pdfLink = detail.getByRole('link', { name: /Télécharger.*PDF/i });
  await pdfLink.waitFor();
  const pdfPending = page.waitForEvent('download');
  await pdfLink.click();
  const pdf = await pdfPending;
  assert.equal(await pdf.failure(), null, 'PDF download completes');
  const documentId = documentHotspot.document_ids[0];
  assert.equal(pdf.suggestedFilename(), `flow-atlas-${documentId}.pdf`);
  const pdfBytes = await readFile(await pdf.path());
  assert.deepEqual(
    pdfBytes,
    await readFile(resolve(dist, `data/${index.current_version}/documents/${documentId}.pdf`)),
  );
  assert.equal(pdfBytes.subarray(0, 5).toString(), '%PDF-');
  await detail.locator('.hotspot-dossier summary').click();
  const wholesale = model.hotspot_catalog.hotspots.find((item) => item.id === 'HS-008');
  assert.ok(wholesale);
  await page.goto(`${base}#/hotspots?version=${index.current_version}&hotspot=${wholesale.id}`);
  assert.equal(await detail.locator('.hotspot-dossier').getAttribute('open'), null);
  assert.equal(await detail.locator('.hotspot-documents a[download] svg').count(), wholesale.document_ids.length);
  const criticality = detail.getByRole('group', { name: `Criticité · ${wholesale.severity}` });
  const questionIndex = detail.locator('.hotspot-question-index-item');
  assert.equal(await questionIndex.count(), 3, 'the three Wholesale questions are visible before the Options');
  assert.ok((await questionIndex.first().innerText()).includes('2 Options documentées'));
  assert.ok((await questionIndex.last().innerText()).includes('Aucune Option documentée'));
  await page.locator('.workspace-content').evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: resolve(output, 'wholesale-overview.png') });
  await detail.locator('.hotspot-dossier summary').click();
  await criticality.waitFor();
  assert.ok((await criticality.innerText()).includes(`Complexité d’arbitrage · ${wholesale.complexity.arbitration}`));
  assert.ok(
    (await criticality.innerText()).includes(`Complexité d’implémentation · ${wholesale.complexity.implementation}`),
  );
  assert.equal(await detail.getByText('Limites des preuves :').count(), 0);
  assert.equal(await detail.getByText('Sources et réserves détaillées').count(), 0);
  await criticality.screenshot({ path: resolve(output, 'wholesale-criticality.png') });
  assert.ok((await detail.locator('.hotspot-story-lead').innerText()).includes('couvertes ou non'));
  assert.equal(await detail.locator('.hotspot-question-index-item').count(), 3);
  assert.equal(await detail.locator('.hotspot-problem').count(), 3);
  assert.equal(await detail.locator('.hotspot-problem').first().locator('.hotspot-story-option').count(), 2);
  assert.ok((await detail.locator('.hotspot-problem').nth(1).innerText()).includes('Le PDF distingue'));
  assert.equal(await detail.locator('.hotspot-problem-document').count(), 2);
  assert.equal(await detail.locator('.hotspot-problem').last().locator('.hotspot-story-option').count(), 0);
  assert.ok(!(await detail.locator('.hotspot-problem').last().innerText()).includes('Options à définir'));
  await detail
    .locator('.hotspot-problem')
    .nth(1)
    .screenshot({ path: resolve(output, 'wholesale-tool-problem.png') });
  const visible = model.hotspot_catalog.hotspots.filter((item) => item.visible);
  assert.equal(visible.length, 9);
  for (const hotspot of visible.filter((item) => item.id !== 'HS-008')) {
    await page.goto(`${base}#/hotspots?version=${index.current_version}&hotspot=${hotspot.id}`);
    await detail.locator('.hotspot-problem').first().waitFor();
    assert.equal(await detail.locator('.hotspot-question-index-item').count(), hotspot.problems.length, hotspot.id);
    assert.equal(await detail.locator('.hotspot-problem').count(), hotspot.problems.length, hotspot.id);
    for (const [position, problem] of hotspot.problems.entries()) {
      const card = detail.locator('.hotspot-problem').nth(position);
      assert.ok((await card.innerText()).includes(text(problem.question)), `${hotspot.id}: question is visible`);
      assert.equal(await card.locator('.hotspot-story-option').count(), problem.option_ids.length, hotspot.id);
    }
  }
  const retail = visible.find((item) => item.id === 'HS-032');
  await page.goto(`${base}#/hotspots?version=${index.current_version}&hotspot=${retail.id}`);
  await page.screenshot({ path: resolve(output, 'retail-overview.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(output, 'retail-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 950 });
  servedModel = model;
  await open();
  await detail.locator('.hotspot-dossier summary').click();
  assert.equal(await detail.getByRole('heading', { level: 3 }).innerText(), text(original.title));
  for (const field of original.examples) {
    assert.ok((await detail.innerText()).includes(text(field)), 'the story retains the published content');
  }
  assert.equal(await detail.locator('.hotspot-story-option').count(), original.resolution_options.length);
  for (const option of original.resolution_options) {
    const body = await detail.innerText();
    for (const field of [
      option.title,
      option.principle,
      option.effect,
      ...(option.conditions || []),
      ...(option.tradeoffs || []),
    ].filter(Boolean)) {
      assert.ok(body.includes(text(field)), 'options retain their effects, conditions and tradeoffs');
    }
  }
  assert.equal(
    await detail.getByRole('button', { name: 'Compléter l’avancement' }).count(),
    0,
    'published data is read-only',
  );
  const market = detail.locator('.hotspot-story-support');
  if (original.market_view) {
    assert.ok((await market.innerText()).includes(text(original.market_view.limits)));
    assert.equal(await market.getByRole('link').count(), original.market_view.sources.length);
  }
  assert.ok(!(await detail.innerText()).includes(original.origin.path));
  assert.ok(!(await detail.innerText()).includes(original.review.note));

  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await verifyPinnedHeader(false, `pinned-${width}.png`);
    await detail.getByRole('button', { name: 'Étendre la fiche' }).click();
    await page.waitForFunction(() => document.fullscreenElement?.classList.contains('hotspot-page'));
    await detail.getByRole('button', { name: 'Réduire la fiche' }).waitFor();
    assert.equal(
      await page.evaluate(() => document.fullscreenElement.scrollWidth <= document.fullscreenElement.clientWidth + 1),
      true,
      `no horizontal overflow at ${width}px`,
    );
    await page.screenshot({ path: resolve(output, `fullscreen-${width}.png`) });
    await verifyPinnedHeader(true, `fullscreen-pinned-${width}.png`);
    await detail.getByRole('button', { name: 'Réduire la fiche' }).click();
    await page.waitForFunction(() => !document.fullscreenElement);
    assert.equal(await detail.getByRole('button', { name: 'Étendre la fiche' }).getAttribute('aria-pressed'), 'false');
  }
  await page.setViewportSize({ width: 1440, height: 950 });
  await detail.getByRole('button', { name: 'Étendre la fiche' }).click();
  await detail.getByRole('button', { name: 'Tous les points chauds' }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await page.locator('.hotspot-table').waitFor();
  assert.equal(await page.locator('.workspace-header .page-heading').count(), 1, 'the catalog keeps its heading');

  // Keep a long title in full, while the impact explanation belongs to the scrolling body.
  const longTitle = structuredClone(original);
  longTitle.title =
    'Garantir la cohérence des engagements de stock entre les différents systèmes et les équipes lors des changements de commande et des opérations logistiques';
  servedModel = { ...model, hotspot_catalog: { ...model.hotspot_catalog, hotspots: [longTitle] } };
  await open();
  assert.equal(await detail.locator('.hotspot-detail-header .hotspot-framing-description').count(), 0);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 840, height: 420 },
  ]) {
    await page.setViewportSize(viewport);
    await verifyPinnedHeader(false, `long-title-${viewport.width}.png`);
    assert.equal(await detail.getByRole('heading', { level: 3 }).innerText(), longTitle.title);
    await detail.getByRole('button', { name: 'Étendre la fiche' }).click();
    await page.waitForFunction(() => Boolean(document.fullscreenElement));
    await verifyPinnedHeader(true, `long-title-fullscreen-${viewport.width}.png`);
    await detail.getByRole('button', { name: 'Réduire la fiche' }).click();
    await page.waitForFunction(() => !document.fullscreenElement);
  }
  await page.setViewportSize({ width: 1440, height: 950 });

  // A legacy publication without progress must never gain a synthetic assessment or a timeline.
  const legacy = structuredClone(original);
  delete legacy.resolution;
  delete legacy.selected_option_id;
  delete legacy.resolution_note;
  delete legacy.framing_impact;
  legacy.status = 'validated';
  legacy.examples = [];
  legacy.resolution_options = [];
  delete legacy.problems;
  legacy.market_view = undefined;
  servedModel = { ...model, hotspot_catalog: { ...model.hotspot_catalog, hotspots: [legacy] } };
  await open();
  await openDossier();
  for (const missing of [
    'Avancement du cadrage non renseigné',
    'Aucun cas concret documenté.',
    'Aucune option documentée à ce stade.',
    'Prochaine étape non documentée.',
  ]) {
    assert.ok((await detail.innerText()).includes(missing), missing);
  }
  assert.equal(await detail.locator('.hotspot-option-tag').count(), 0);
  assert.equal(await detail.locator('.hotspot-story-caption').filter({ hasText: 'Évaluation du' }).count(), 0);

  // A published comparison renders its own observations, never facts from another snapshot.
  const compared = structuredClone(original);
  compared.visible = true;
  compared.framing_impact = {
    category: 'usage',
    targets: [],
    rationale: 'Manipulations manuelles à simplifier.',
    follow_up: 'product_design',
    evidence_state: 'hypothesis',
    source_refs: ['QA'],
  };
  compared.gap_analysis = [
    {
      id: 'qa-wholesale-gap',
      title: 'Deux politiques de gestion',
      subject_node_id: original.location.node_ids[0],
      natures: ['business_rule_divergence'],
      observations_by_context: [
        {
          context_id: 'beaumanoir-historique',
          handling: 'Contrôle du stock présent.',
          business_rules: ['Refus immédiat.'],
          evidence_kind: 'user_report',
          limits: 'Pratique rapportée.',
        },
        {
          context_id: 'boardriders',
          handling: 'Réexamen du carnet.',
          business_rules: ['Priorités évolutives.'],
          evidence_kind: 'source_document',
          limits: 'Support daté.',
        },
      ],
      comparison: 'Même responsabilité, deux règles.',
      convergence_question: 'Quel socle commun ?',
      business_effects: ['Conserver les besoins essentiels.'],
      open_questions: ['Quelle règle protéger ?'],
      resolution_option_ids: [],
      source_refs: ['QA'],
    },
  ];
  servedModel = { ...model, hotspot_catalog: { ...model.hotspot_catalog, hotspots: [compared] } };
  await open();
  await openDossier();
  const comparison = detail.locator('.hotspot-gap-analysis');
  assert.ok((await detail.innerText()).includes('Irritant d’usage · design produit'));
  assert.ok((await detail.innerText()).includes('Hypothèse'));
  await detail.getByRole('button', { name: 'Tous les points chauds' }).click();
  const markedRow = page.locator('.hotspot-table tbody tr').filter({ hasText: text(compared.title) });
  assert.ok((await markedRow.innerText()).includes('Irritant d’usage · design produit'));
  await page.getByRole('button', { name: 'Filtres', exact: true }).click();
  const subjectFilters = page.getByRole('group', { name: 'Filtres des points chauds', exact: true });
  await subjectFilters.getByRole('checkbox', { name: 'Hotspots modèle', exact: true }).uncheck();
  assert.equal(await markedRow.count(), 1, 'Usage stays visible when model subjects are hidden');
  await subjectFilters.getByRole('checkbox', { name: 'Hotspots usage', exact: true }).uncheck();
  await markedRow.waitFor({ state: 'detached' });
  assert.equal(await markedRow.count(), 0, 'Usage checkbox filters the table');
  await subjectFilters.getByRole('checkbox', { name: 'Hotspots usage', exact: true }).check();
  await markedRow.waitFor({ state: 'attached' });
  assert.equal(await markedRow.count(), 1);
  await open();
  await openDossier();
  for (const content of [
    'Deux politiques de gestion',
    'Marques Historiques',
    'Boardriders',
    'Contrôle du stock présent.',
    'Réexamen du carnet.',
    'Conserver les besoins essentiels.',
  ]) {
    assert.ok((await comparison.innerText()).includes(content), content);
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
  }
  await page.setViewportSize({ width: 1440, height: 950 });

  // Two observations in the same SI keep distinct scopes and explicit evidence states.
  const intra = compared.gap_analysis[0];
  intra.observations_by_context[0].observation_scope = {
    id: 'warehouse',
    label: 'Parcours entrepôt',
    description: 'Commandes servies depuis un entrepôt.',
  };
  intra.observations_by_context[1].context_id = 'beaumanoir-historique';
  intra.observations_by_context[1].observation_scope = {
    id: 'store',
    label: 'Parcours magasin',
    description: 'Commandes servies depuis un magasin.',
  };
  intra.observations_by_context[1].evidence_state = 'hypothesis';
  await open();
  await openDossier();
  for (const content of [
    'Écart dans un même SI',
    'Parcours entrepôt',
    'Parcours magasin',
    'Hypothèse',
    'Réexamen du carnet.',
  ]) {
    assert.ok((await comparison.innerText()).includes(content), content);
  }
  intra.observations_by_context.push({
    context_id: 'boardriders',
    handling: 'Parcours à décrire.',
    business_rules: [],
    evidence_kind: 'analysis',
    evidence_state: 'to_investigate',
    limits: 'Description absente.',
  });
  await open();
  await openDossier();
  assert.ok((await comparison.innerText()).includes('Écart entre SI et entre périmètres'));
  assert.ok((await comparison.innerText()).includes('À instruire'));
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
  }
  await page.setViewportSize({ width: 1440, height: 950 });

  // Use an unchanged base snapshot with a local overlay; credible and selected options stay independent.
  servedModel = model;
  const working = structuredClone(original);
  working.status = 'resolved';
  working.selected_option_id = working.resolution_options[1].id;
  working.resolution_note = 'Choix sous réserve de confirmer les volumes.';
  working.resolution = {
    stage: 'credible',
    summary: 'Deux pistes confrontées aux contraintes.',
    credible_option_ids: [working.resolution_options[0].id],
    credibility_note: 'Faisabilité documentée avec réserves.',
    blocked_reason: '',
    next_step: 'Confirmer les volumes.',
    assessed_on: '2026-10-11',
    assessment_source: 'Séance QA',
  };
  staging = {
    active: true,
    schema_version: 1,
    session_id: 'qa-narrative',
    base_version: index.current_version,
    base_model_sha256: createHash('sha256').update(payload).digest('hex'),
    revision: 1,
    operations: [{ sequence: 1, entity: 'hotspot', action: 'update', id: working.id, value: working }],
  };
  await open();
  await detail.getByRole('button', { name: 'Compléter l’avancement' }).waitFor();
  const options = detail.locator('.hotspot-story-option');
  assert.equal(await options.nth(0).getByText('Solution crédible', { exact: true }).count(), 1);
  assert.equal(await options.nth(0).getByText('Option retenue', { exact: true }).count(), 0);
  assert.equal(await options.nth(1).getByText('Option retenue', { exact: true }).count(), 1);
  assert.ok((await detail.locator('#hotspot-choice-title').innerText()).includes('Décision et prochaine étape'));
  assert.ok((await detail.innerText()).includes('Confirmer les volumes.'));
  await detail.getByRole('button', { name: 'Étendre la fiche' }).click();
  await detail.getByRole('button', { name: 'Compléter l’avancement' }).click();
  const dialog = page.getByRole('dialog', { name: /^Qualification et avancement/ });
  await dialog.waitFor();
  assert.equal(
    await dialog.evaluate((element) => document.fullscreenElement.contains(element)),
    true,
    'editor stays within fullscreen',
  );
  await dialog.getByLabel('Prochaine étape').fill('Vérifier les volumes avec les équipes.');
  await dialog.getByRole('button', { name: 'Terminer' }).click();
  assert.ok(
    (await detail.innerText()).includes('Vérifier les volumes avec les équipes.'),
    'draft reflected in the story before saving',
  );
  assert.ok((await detail.innerText()).includes('Modifications non enregistrées'));
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await page.waitForFunction(() => document.querySelector('.hotspot-save-message')?.textContent.includes('enregistré'));
  assert.equal(posts.length, 1);
  assert.equal(posts[0].changes[0].fields.resolution.next_step, 'Vérifier les volumes avec les équipes.');
  assert.ok(!(await detail.innerText()).includes('Modifications non enregistrées'));
  await detail.getByRole('button', { name: 'Réduire la fiche' }).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  const anchor = detail.locator('.hotspot-anchors button').first();
  await openDossier();
  await anchor.click();
  assert.match(page.url(), /#\/map/);
  assert.deepEqual(errors, []);
  assert.equal(JSON.stringify(model), JSON.stringify(JSON.parse(payload)), 'the publication has not been mutated');
  console.log(
    JSON.stringify({
      narrative: true,
      missingData: true,
      gapAnalysis: true,
      fullscreenWidths: [1440, 900, 390, 320],
      pinnedTitle: true,
      keyboardFocus: true,
      longTitleAndLandscape: true,
      workshopEdit: true,
      publicationUnchanged: true,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
  await downloadFixture.close();
}
