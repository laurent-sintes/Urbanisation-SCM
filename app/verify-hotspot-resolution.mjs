import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { openMapDisplay } from './browser-navigation.mjs';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${index.current_version}/model.json`));
const model = JSON.parse(payload);
const stages = ['unassessed', 'to_explore', 'identified', 'qualifying', 'ready_for_arbitration', 'credible'];
const stage = {
  active: true,
  schema_version: 1,
  session_id: 'qa-resolution',
  base_version: index.current_version,
  base_model_sha256: createHash('sha256').update(payload).digest('hex'),
  revision: 1,
  operations: model.hotspot_catalog.hotspots.map((item, position) => {
    const progress = stages[position % stages.length];
    const options = item.resolution_options.length
      ? item.resolution_options
      : structuredClone(
          model.hotspot_catalog.hotspots
            .find((subject) => subject.resolution_options.length)
            .resolution_options.slice(0, 1),
        );
    return {
      sequence: position + 1,
      entity: 'hotspot',
      action: 'update',
      id: item.id,
      value: {
        ...item,
        visible: true,
        resolution_options: options,
        status: progress === 'credible' ? 'resolved' : 'validated',
        kind: 'scope',
        location: { ...item.location, node_ids: ['domain-logistics-execution'] },
        complexity: { arbitration: progress === 'credible' ? 'XL' : 'M', implementation: 'S', rationale: 'Fixture' },
        severity: progress === 'credible' ? 'XL' : 'M',
        resolution: {
          stage: progress,
          summary: progress === 'unassessed' ? '' : 'Hypothèses de cadrage',
          credible_option_ids: progress === 'credible' ? [options[0].id] : [],
          credibility_note: progress === 'credible' ? 'Crédibilité avec réserves' : '',
          recommended_option_id: progress === 'ready_for_arbitration' ? options[0].id : '',
          recommendation_note: progress === 'ready_for_arbitration' ? 'Option proposée avec réserves' : '',
          blocked_reason: progress === 'qualifying' ? 'Volumes inconnus' : '',
          next_step: progress === 'qualifying' ? 'Obtenir les volumes' : '',
          assessment_source: progress === 'unassessed' ? '' : 'Séance QA',
          ...(progress !== 'unassessed' ? { assessed_on: '2026-10-11' } : {}),
        },
      },
    };
  }),
};
const browser = await chromium.launch(browserOptions);
const errors = [],
  posts = [];
const base = 'http://localhost:9876/Urbanisation-SCM/';
const output = resolve(import.meta.dirname, '.runtime/qa-resolution');
await mkdir(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (!url.href.startsWith(base)) return route.abort();
    const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
    if (relative === '__atlas__/workshop/staging.json') return route.fulfill({ json: stage });
    if (relative === '__atlas__/workshop/hotspots/batch') {
      const request = route.request().postDataJSON();
      posts.push(request);
      assert.equal(request.expected_revision, stage.revision);
      for (const change of request.changes) {
        const current = stage.operations.findLast((operation) => operation.id === change.id).value;
        stage.operations.push({
          sequence: ++stage.revision,
          entity: 'hotspot',
          action: 'update',
          id: change.id,
          value: { ...current, ...change.fields },
        });
      }
      return route.fulfill({ json: stage });
    }
    if (relative.startsWith('__atlas__/')) return route.fulfill({ status: 404, body: '{}' });
    const mime = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
    };
    return route.fulfill({
      body: await readFile(resolve(dist, relative)),
      contentType: mime[extname(relative)] || 'application/octet-stream',
    });
  });
  await page.goto(`${base}#/map?version=${index.current_version}&mapDepth=1`);
  const trigger = page.locator('.map-hotspot-picker .detail-trigger');
  await openMapDisplay(page);
  await trigger.click();
  const filters = page.getByRole('dialog', { name: 'Filtres des points chauds' });
  await filters.getByRole('checkbox', { name: 'Afficher les points chauds' }).check();
  await filters.getByRole('checkbox', { name: 'Inclure les cadrages résolus' }).check();
  await filters.getByRole('button', { name: 'Fermer les filtres' }).click();
  await page.locator('.hotspot-resolution-ring[data-stage="credible"]').first().waitFor();
  const rings = page.locator('.overview-system .hotspot-resolution-ring');
  for (const progress of stages) {
    const ring = page.locator(`.overview-system .hotspot-resolution-ring[data-stage="${progress}"]`).first();
    assert.ok(await ring.count(), progress);
    assert.equal(
      await ring.locator('circle.is-complete').count(),
      Math.min(3, Math.max(0, stages.indexOf(progress) - 1)),
    );
    if (progress === 'credible') {
      const marker = ring.locator('..');
      assert.equal(await marker.locator('.hotspot-map-flames').count(), 0);
      assert.equal(await marker.locator('.hotspot-resolved-check').count(), 1);
    }
  }
  assert.ok((await rings.count()) >= 5);
  await openMapDisplay(page);
  await trigger.click();
  await filters.getByLabel('Avancement du cadrage').selectOption('ready_for_arbitration');
  await filters.getByRole('button', { name: 'Fermer les filtres' }).click();
  await page.locator('.overview-system .hotspot-resolution-ring[data-stage="ready_for_arbitration"]').first().waitFor();
  assert.equal(
    await page
      .locator('.overview-system .hotspot-resolution-ring')
      .evaluateAll((elements) =>
        elements.every((element) => element.getAttribute('data-stage') === 'ready_for_arbitration'),
      ),
    true,
  );
  await openMapDisplay(page);
  await trigger.click();
  await filters.getByLabel('Avancement du cadrage').selectOption('all');
  await filters.getByRole('button', { name: 'Fermer les filtres' }).click();
  await page.screenshot({ path: resolve(output, 'desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  const group = page.locator('.overview-system .hotspot-map-marker[aria-expanded]').first();
  await group.waitFor();
  assert.match(await group.getAttribute('aria-label'), /ouverts sur/);
  const groupClass = await group.locator('..').getAttribute('class');
  assert.ok(groupClass.includes('severity-M'), 'closed XL never conceals the severity of open M');
  assert.match(await group.locator('.hotspot-map-count').innerText(), /\d+\/\d+/);
  await group.click();
  assert.ok(await page.locator('.hotspot-cluster-popover .hotspot-resolution-ring[data-stage="credible"]').count());
  assert.equal(
    await page.locator('.hotspot-cluster-popover .hotspot-resolution-ring').evaluateAll((rings) =>
      rings.every((ring) => {
        const bounds = ring.getBoundingClientRect();
        const marker = ring.parentElement.getBoundingClientRect();
        return bounds.width <= marker.width && bounds.height <= marker.height && bounds.width <= 48;
      }),
    ),
    true,
    'each ring stays inside its own marker in a deployed group',
  );
  await page.screenshot({ path: resolve(output, 'mobile-cluster.png') });
  const clusterDialog = page.locator('.hotspot-cluster-popover');
  await page.getByRole('button', { name: 'Replier le groupe' }).click();
  await page.setViewportSize({ width: 240, height: 700 });
  await group.click();
  const groupTotal = Number((await clusterDialog.getAttribute('aria-label')).match(/^\d+/)[0]);
  const seen = new Set();
  for (let turn = 0; turn < groupTotal; turn++) {
    for (const label of await clusterDialog
      .locator('.hotspot-expanded-item')
      .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label'))))
      seen.add(label);
    const next = clusterDialog.getByRole('button', { name: 'Pastilles suivantes' });
    if (!(await next.count()) || (await next.isDisabled())) break;
    await next.click();
  }
  assert.equal(seen.size, groupTotal, 'paging keeps every hotspot reachable as a pastille');
  await page.getByRole('button', { name: 'Replier le groupe' }).click();
  await page.setViewportSize({ width: 390, height: 900 });
  await openMapDisplay(page);
  await trigger.click();
  await filters.getByRole('combobox', { name: 'Avancement du cadrage' }).selectOption('credible');
  await filters.getByRole('button', { name: 'Fermer les filtres' }).click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('.overview-system .hotspot-map-marker')].length > 0 &&
      [...document.querySelectorAll('.overview-system .hotspot-map-marker')].every((marker) =>
        marker.querySelector('.hotspot-resolved-check'),
      ),
  );
  await page.screenshot({ path: resolve(output, 'mobile-resolved.png'), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(`${base}#/hotspots?version=${index.current_version}`);
  const credibleInList = stage.operations.find((operation) => operation.value.resolution.stage === 'credible').value;
  const credibleRow = page.locator(`[data-hotspot-id="${credibleInList.id}"]`);
  await credibleRow.getByText(`Solutions crédibles : ${credibleInList.resolution_options[0].title}`).waitFor();
  const recommendedInList = stage.operations.find(
    (operation) => operation.value.resolution.stage === 'ready_for_arbitration',
  ).value;
  await page
    .locator(`[data-hotspot-id="${recommendedInList.id}"]`)
    .getByText(`À arbitrer : ${recommendedInList.resolution_options[0].title}`)
    .waitFor();
  await page.getByRole('button', { name: 'Filtres', exact: false }).click();
  const listFilter = page.locator('.hotspot-catalog-filters').getByLabel('Avancement du cadrage');
  await listFilter.selectOption('ready_for_arbitration');
  assert.ok(await page.locator('.hotspot-table tr[data-hotspot-id]:not(.hotspot-is-hidden)').count());
  assert.equal(
    await page
      .locator('.hotspot-table tr[data-hotspot-id]:not(.hotspot-is-hidden)')
      .evaluateAll((rows) => rows.every((row) => Boolean(row.querySelector('.stage-ready_for_arbitration')))),
    true,
  );
  await listFilter.selectOption('all');
  await page.screenshot({ path: resolve(output, 'catalog.png'), fullPage: true });
  const item = model.hotspot_catalog.hotspots[0];
  const edit = page.getByRole('button', { name: `Qualification et avancement de ${item.title}`, exact: true });
  await edit.click();
  const dialog = page.locator('.hotspot-dialog');
  await dialog.getByLabel('Avancement du cadrage').selectOption('credible');
  await dialog.getByLabel('Synthèse d’avancement').fill('Deux solutions crédibles en cadrage');
  const save = page.getByRole('button', { name: 'Enregistrer les modifications' });
  assert.equal(await save.isDisabled(), true, 'a stage alone cannot resolve framing');
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByLabel('Crédibilité, hypothèses et réserves').fill('Contrat possible sous réserve de volumes');
  assert.equal(await dialog.getByLabel('Option retenue (choix définitif facultatif)').inputValue(), '');
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  await save.click();
  await page.getByText('enregistré dans la séance', { exact: false }).waitFor();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].changes[0].fields.status, 'resolved');
  assert.equal(posts[0].changes[0].fields.resolution.stage, 'credible');
  assert.equal(posts[0].changes[0].fields.selected_option_id, undefined);
  await edit.click();
  await dialog.getByLabel('Avancement du cadrage').selectOption('qualifying');
  await dialog.getByLabel('Raison du blocage (facultative)').fill('Volume inconnu');
  assert.equal(await save.isDisabled(), true);
  await dialog.getByLabel('Prochaine étape').fill('Demander les volumes');
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  await save.click();
  await page.waitForFunction(() => document.querySelector('.hotspot-save-message')?.textContent.includes('enregistré'));
  assert.equal(posts.length, 2);
  assert.equal(posts[1].changes[0].fields.status, 'validated');
  assert.deepEqual(posts[1].changes[0].fields.resolution.credible_option_ids, []);
  await edit.click();
  await dialog.getByLabel('Avancement du cadrage').selectOption('ready_for_arbitration');
  await dialog.locator('fieldset select').selectOption(item.resolution_options[0].id);
  await dialog.getByLabel('Pourquoi cette option ? Hypothèses et réserves').fill('Préférée sous réserve d’arbitrage.');
  assert.equal(await save.isDisabled(), false);
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  await save.click();
  await page.waitForFunction(() => document.querySelector('.hotspot-save-message')?.textContent.includes('enregistré'));
  assert.equal(posts.length, 3);
  assert.equal(posts[2].changes[0].fields.resolution.stage, 'ready_for_arbitration');
  assert.equal(posts[2].changes[0].fields.resolution.recommended_option_id, item.resolution_options[0].id);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      stages,
      mixedGroup: true,
      explicitResolvedFilter: true,
      saveWithoutFinalChoice: true,
      blockedReopening: true,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
