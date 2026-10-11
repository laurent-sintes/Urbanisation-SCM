import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';

const dist = resolve(import.meta.dirname, process.env.ATLAS_HOTSPOT_DIST || 'dist');
const index = JSON.parse(await readFile(resolve(dist, 'data/index.json'), 'utf8'));
const payload = await readFile(resolve(dist, `data/${index.current_version}/model.json`));
const model = JSON.parse(payload);
const stages = ['unassessed', 'to_explore', 'identified', 'qualifying', 'credible'];
const stage = {
  active: true,
  schema_version: 1,
  session_id: 'qa-resolution',
  base_version: index.current_version,
  base_model_sha256: createHash('sha256').update(payload).digest('hex'),
  revision: 1,
  operations: model.hotspot_catalog.hotspots.map((item, position) => {
    const progress = stages[position % stages.length];
    return {
      sequence: position + 1,
      entity: 'hotspot',
      action: 'update',
      id: item.id,
      value: {
        ...item,
        status: progress === 'credible' ? 'resolved' : 'validated',
        kind: 'scope',
        location: { ...item.location, node_ids: ['domain-logistics-execution'] },
        complexity: { political: progress === 'credible' ? 'XL' : 'M', implementation: 'S', rationale: 'Fixture' },
        severity: progress === 'credible' ? 'XL' : 'M',
        resolution: {
          stage: progress,
          summary: progress === 'unassessed' ? '' : 'Hypothèses de cadrage',
          credible_option_ids: progress === 'credible' ? [item.resolution_options[0].id] : [],
          credibility_note: progress === 'credible' ? 'Crédibilité avec réserves' : '',
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
    assert.equal(await ring.locator('circle.is-complete').count(), Math.max(0, stages.indexOf(progress) - 1));
    if (progress === 'credible') {
      const marker = ring.locator('..');
      assert.equal(await marker.locator('.hotspot-map-flames').count(), 0);
      assert.equal(await marker.locator('.hotspot-resolved-check').count(), 1);
    }
  }
  assert.ok((await rings.count()) >= 5);
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
  await page.getByRole('button', { name: 'Replier le groupe' }).click();
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
  const item = model.hotspot_catalog.hotspots[0];
  const edit = page.getByRole('button', { name: `Avancement du cadrage de ${item.title}`, exact: true });
  await edit.click();
  const dialog = page.locator('.hotspot-dialog');
  await dialog.getByLabel('Avancement du cadrage').selectOption('credible');
  await dialog.getByLabel('Synthèse d’avancement').fill('Deux solutions crédibles en cadrage');
  const save = page.getByRole('button', { name: 'Valider les modifications' });
  assert.equal(await save.isDisabled(), true, 'a stage alone cannot resolve framing');
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByLabel('Crédibilité, hypothèses et réserves').fill('Contrat possible sous réserve de volumes');
  assert.equal(await dialog.getByLabel('Option retenue (choix définitif facultatif)').inputValue(), '');
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
  await save.click();
  await page.getByText('enregistré dans le staging.', { exact: false }).waitFor();
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
