/** Capture every experimental layout in the real compiled Atlas renderer, without changing dist. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { browserOptions, chromium } from './browser-runtime.mjs';
import { projectFlowMapExchanges } from './src/flowMapLayout.ts';
import { adaptPublication } from './src/model.ts';

const dist = resolve(import.meta.dirname, 'dist');
const output = resolve(import.meta.dirname, '.runtime/elk-comparison/results');
const reportPath = resolve(output, 'report.json');
const report = JSON.parse(await readFile(reportPath, 'utf8'));
const modelBytes = await readFile(resolve(dist, `data/${report.version}/model.json`));
assert.equal(createHash('sha256').update(modelBytes).digest('hex'), report.modelSha256);
const raw = JSON.parse(modelBytes);
const model = adaptPublication(raw);
report.buildSha256 = createHash('sha256')
  .update(await readFile(resolve(dist, 'index.html')))
  .digest('hex');
const cache = await readFile(resolve(output, 'captures-cache.json'), 'utf8')
  .then(JSON.parse)
  .catch(() => null);
const base = 'https://atlas-benchmark.test/Urbanisation-SCM/';
const browser = await chromium.launch(browserOptions);
const errors = [];
try {
  for (const scope of report.scopes)
    for (const variant of scope.variants) {
      const saved =
        cache?.modelSha256 === report.modelSha256 && cache.buildSha256 === report.buildSha256
          ? cache.scopes.find((item) => item.id === scope.id)?.variants.find((item) => item.id === variant.id)
          : undefined;
      if (saved?.rendered && JSON.stringify(saved.layout) === JSON.stringify(variant.layout)) {
        variant.rendered = saved.rendered;
        continue;
      }
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      });
      page.setDefaultTimeout(20000);
      page.on('pageerror', (error) => errors.push(error.message));
      const geometry = variant.layout;
      const layout = {
        ...geometry,
        boxes: geometry.boxes.map((box) => ({
          ...box,
          node: model.nodeById.get(box.id),
        })),
        exchanges: projectFlowMapExchanges(model, new Set(geometry.boxes.map((box) => box.id))),
      };
      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        assert.ok(url.href.startsWith(base), 'The comparison uses local static assets only');
        const relative = decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)) || 'index.html';
        const path = resolve(dist, relative);
        assert.ok(path.startsWith(dist + sep));
        if (relative.includes('/flowMapWorker-')) {
          await route.fulfill({
            contentType: 'text/javascript',
            body: `self.onmessage = () => self.postMessage(${JSON.stringify({ layout })});`,
          });
        } else
          await route.fulfill({
            body: await readFile(path),
            contentType:
              {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.svg': 'image/svg+xml',
                '.png': 'image/png',
              }[extname(path)] || 'application/octet-stream',
          });
      });
      const scopeId = scope.id === '@root' ? undefined : scope.id;
      const params = new URLSearchParams({
        version: report.version,
        scope: scopeId || '@root',
        node: scopeId || model.nodes.find((node) => node.kind === 'universe').id,
        hf: JSON.stringify({ enabled: true }),
        app: 'product-akolade',
      });
      await page.goto(`${base}#/flows?${params}`);
      const canvas = page.locator('.flow-map-canvas');
      await canvas.waitFor();
      await page.waitForFunction(() =>
        Boolean(document.querySelector('.flow-map-canvas')?.getAttribute('data-layout')),
      );
      await page.evaluate(() => document.fonts.ready);
      variant.rendered = {};
      for (const mode of ['standard', 'all']) {
        await page.getByRole('combobox', { name: 'Cadrage des flux', exact: true }).selectOption(mode);
        await page.waitForTimeout(400);
        const metrics = await canvas.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const inside = (r) =>
            r.left >= bounds.left - 1 &&
            r.right <= bounds.right + 1 &&
            r.top >= bounds.top - 1 &&
            r.bottom <= bounds.bottom + 1;
          const intersects = (r) =>
            r.right > bounds.left && r.left < bounds.right && r.bottom > bounds.top && r.top < bounds.bottom;
          const titles = [...element.querySelectorAll('.spatial-object-name')];
          const labels = [...element.querySelectorAll('.flow-exchange-caption foreignObject')];
          const paths = [...element.querySelectorAll('.flow-exchange-hit')].map((path) => {
            const length = path.getTotalLength();
            return {
              id: path.closest('[data-relation-ids]').dataset.relationIds,
              samples: Array.from({ length: Math.ceil(length / 3) + 1 }, (_, index) =>
                path.getPointAtLength(Math.min(length, index * 3)),
              ),
            };
          });
          const collisions = [];
          for (const label of labels)
            for (const path of paths) {
              if (path.id === label.closest('[data-relation-ids]').dataset.relationIds) continue;
              const x = label.x.baseVal.value,
                y = label.y.baseVal.value,
                w = label.width.baseVal.value,
                h = label.height.baseVal.value;
              for (const point of path.samples) {
                if (point.x > x + 1 && point.x < x + w - 1 && point.y > y + 1 && point.y < y + h - 1) {
                  collisions.push([path.id, label.closest('[data-relation-ids]').dataset.relationIds]);
                  break;
                }
              }
            }
          return {
            zoom: Number(element.dataset.zoom),
            fullTitles: titles.filter((title) => inside(title.getBoundingClientRect())).length,
            visibleTitles: titles.filter((title) => intersects(title.getBoundingClientRect())).length,
            clippedTitles: titles
              .filter(
                (title) => intersects(title.getBoundingClientRect()) && title.scrollHeight > title.clientHeight + 1,
              )
              .map((title) => title.textContent),
            renderedCaptions: labels.length,
            fullCaptions: labels.filter((label) => inside(label.getBoundingClientRect())).length,
            visibleCaptions: labels.filter((label) => intersects(label.getBoundingClientRect())).length,
            actualCaptionCrossings: collisions.length,
            hotspots: element.querySelectorAll('.hotspot-map-marker').length,
            applicationMarks: element.querySelectorAll('.spatial-application-mark').length,
            horizontalBars: element.querySelectorAll('.flow-scrollbar.is-horizontal').length,
            verticalBars: element.querySelectorAll('.flow-scrollbar.is-vertical').length,
          };
        });
        if (mode === 'all') assert.equal(metrics.horizontalBars + metrics.verticalBars, 0);
        const name = `${scope.id === '@root' ? 'enterprise' : 'supply'}-${variant.id}-${mode}.png`;
        await canvas.screenshot({ path: resolve(output, name) });
        variant.rendered[mode] = { ...metrics, screenshot: name };
      }
      console.log(
        JSON.stringify({
          scope: scope.id,
          engine: variant.id,
          standard: variant.rendered.standard,
          all: variant.rendered.all,
        }),
      );
      await page.close();
    }
} finally {
  await browser.close();
}
assert.deepEqual(errors, [], 'No browser error in the actual Atlas renderer');
report.renderErrors = errors;
await writeFile(reportPath, JSON.stringify(report, null, 2));
await writeFile(resolve(output, 'captures-cache.json'), JSON.stringify(report));

const escape = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const names = {
  atlas: 'Atlas actuel',
  'elk-free-right': 'ELK libre →',
  'elk-free-down': 'ELK libre ↓',
  'elk-guided': 'ELK interactif',
  'elk-partition': 'ELK partitions',
  'elk-guided-ports': 'ELK interactif + faces Atlas',
  'elk-partition-ports': 'ELK partitions + faces Atlas',
};
for (const [id, label] of Object.entries({ ...names }).filter(([id]) => id !== 'atlas'))
  names[id.replace('elk-', 'elk-compact-')] = label + ' · espacement ajusté';
const n = (value) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Atlas · comparaison ELK</title>
<style>body{margin:0;background:#f5f9f7;color:#214c42;font:15px/1.5 Aptos,Segoe UI,sans-serif}main{max-width:1600px;margin:auto;padding:24px}h1{font-size:26px}h2{margin-top:36px}h3{font-size:16px;margin:0}p{max-width:1100px}a{color:#176a59}small{color:#52675f}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px;background:white}th,td{padding:9px 12px;text-align:right;border-bottom:1px solid #dce6df;white-space:nowrap}th:first-child,td:first-child{text-align:left}thead{background:#e4eee8}tr.bad{color:#9a4939}.compare{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.picture{display:block;width:100%;height:auto;background:white}.tools{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:12px 0}button,select{font:inherit;color:inherit;background:white;border:1px solid #adcabd;border-radius:6px;padding:7px 10px}button[aria-pressed=true]{background:#235f51;color:white}.caption{min-height:42px;margin:6px 0;font-size:13px}.method{border-top:1px solid #c7d8cd;margin-top:36px;padding-top:16px}@media(max-width:800px){.compare{grid-template-columns:1fr}main{padding:16px}}</style>
<main><h1>Atlas actuel / ELK ${escape(report.elkVersion)}</h1><p>Publication figée ${escape(report.version)} · Enterprise Architecture et Supply Chain Orchestration (nom publié : ${escape(report.scopes[1].name)}).</p>
<p><strong>ELK simplifie fortement les tracés et calcule plus vite. L’étendue et la stabilité spatiale dépendent des contraintes retenues.</strong> ${report.configs.length} configurations testées : espacement généreux, puis ajusté en tenant compte des réserves de libellés propres à ELK. Les variantes à faces imposées sont moins favorables sur Supply : certaines routes entrent dans la réserve d’un autre libellé.</p>
${report.scopes
  .map(
    (
      scope,
      index,
    ) => `<section id="scope-${index}"><h2>${index === 0 ? 'Enterprise Architecture' : 'Supply Chain Orchestration'}</h2><details><summary>Mesures détaillées des 12 configurations</summary><div class="scroll"><table><thead><tr><th>Moteur</th><th>Croisements</th><th>Contacts</th><th>Cassures</th><th>Médiane</th><th>Étendue / Atlas</th><th>Réserves libellés traversées</th><th>Ordres inversés / alignements perdus</th></tr></thead><tbody>${scope.variants.map((v) => `<tr class="${v.metrics.labelHits ? 'bad' : ''}"><td>${escape(names[v.id])}</td><td>${v.metrics.crossings}</td><td>${v.metrics.contacts}</td><td>${v.metrics.bends}</td><td>${n(v.timing.medianMs)} ms</td><td>× ${n(v.metrics.area / scope.variants[0].metrics.area)}</td><td>${v.metrics.labelHits}</td><td>${v.metrics.reversals} / ${v.metrics.lostAlignments}</td></tr>`).join('')}</tbody></table></div></details>
<div class="tools"><div role="group" aria-label="Cadrage ${index}"><button data-mode="all" aria-pressed="true">Tout cadrer</button> <button data-mode="standard" aria-pressed="false">Standard</button></div><label>Variante ELK <select aria-label="Variante ELK ${index}">${scope.variants
      .filter((v) => v.id !== 'atlas')
      .map(
        (v) =>
          `<option value="${v.id}" ${v.id === (index === 0 ? 'elk-compact-partition-ports' : 'elk-compact-free-right') ? 'selected' : ''}>${escape(names[v.id])}</option>`,
      )
      .join('')}</select></label></div>
<div class="compare"><div><h3>Atlas actuel</h3><p class="caption" data-caption="atlas"></p><a data-image-link="atlas"><img class="picture" data-picture="atlas" alt="Carte Atlas actuelle"></a></div><div><h3 data-engine-title>ELK</h3><p class="caption" data-caption="elk"></p><a data-image-link="elk"><img class="picture" data-picture="elk" alt="Carte calculée par ELK"></a></div></div></section>`,
  )
  .join('')}
<div class="method"><h2>Protocole et limites</h2><ul><li>Mêmes nœuds, paires orientées, types et libellés publiés : 4 blocs / 10 flux à la racine ; 9 blocs / 26 flux dans Supply. Aucun échange retiré ni inversé.</li><li>Dimensions Atlas comme minimum ; ELK peut agrandir les blocs pour espacer les ports. Attaches distinctes, portion droite minimale de 64 unités, espacement des ports 44, fusion des arêtes désactivée.</li><li>Croisements géométriques orthogonaux hors contacts et segments communs, comptés séparément. Cassures après suppression des points colinéaires. Tolérance géométrique 0,01 unité pour les coordonnées décimales ELK.</li><li>Étendue : enveloppe des blocs, tracés et réserves de libellés, avec la même marge de 32 unités. La carte d’ensemble exige davantage de zoom arrière quand l’étendue augmente.</li><li>Alignements perdus : paires de blocs initialement alignées, décalées de plus de 32 unités. Ordres inversés : inversion d’un ordre horizontal ou vertical initial. Ces nombres sont des comparaisons avec la géographie Atlas, pas des croisements.</li><li>Temps de placement et routage sous ${escape(report.runtime.node)}, ${escape(report.runtime.cpu.trim())}, ${report.runs} répétitions après une première exécution. Médiane après chargement ; hors données réseau, chargement du moteur et rendu React. Ce ne sont pas des temps sur téléphone. Import Node ELK : ${n(report.engineLoad.importMs)} ms ; bibliothèque : ${n(report.engineLoad.gzipBytes / 1024)} Kio gzip, ${n(report.engineLoad.bytes / 1024 / 1024)} Mio brute.</li><li>Captures dans le véritable build Atlas, 1440 × 1000, applications Akolade et hotspots activés. Seule la réponse du worker de placement est remplacée par la géométrie mesurée. Les filtres, titres, flèches, libellés, couleurs et cadrages sont ceux d’Atlas. La production et ses dépendances restent inchangées.</li></ul><p>Sources : <a href="https://github.com/kieler/elkjs">elkjs</a> · <a href="https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html">ELK Layered</a> · <a href="https://eclipse.dev/elk/blog/posts/2023/23-01-09-constraining-the-model.html">Contraintes et positions interactives</a> · <a href="report.json">Mesures et géométries JSON</a>.</p></div></main>
<script>const data=${JSON.stringify(report).replaceAll('<', '\\u003c')};const names=${JSON.stringify(names)};
data.scopes.forEach((scope,index)=>{const root=document.getElementById('scope-'+index);let mode='all';const select=root.querySelector('select');function update(){root.querySelector('[data-engine-title]').textContent=names[select.value];for(const which of ['atlas','elk']){const variant=scope.variants.find(v=>v.id===(which==='atlas'?'atlas':select.value));const r=variant.rendered[mode];const image=root.querySelector('[data-picture='+which+']');image.src=r.screenshot;root.querySelector('[data-image-link='+which+']').href=r.screenshot;root.querySelector('[data-caption='+which+']').textContent=variant.metrics.crossings+' croisements · '+variant.metrics.bends+' cassures · '+Math.round(variant.timing.medianMs)+' ms · surface × '+(variant.metrics.area/scope.variants[0].metrics.area).toFixed(2)+'. Zoom '+Math.round(r.zoom*100)+' % · '+r.fullCaptions+' libellés de flux entièrement visibles · '+r.fullTitles+'/'+variant.metrics.nodes+' titres entièrement dans la fenêtre · '+r.actualCaptionCrossings+' croisements avec une zone de libellé affichée';}}select.addEventListener('change',update);for(const button of root.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{mode=button.dataset.mode;for(const peer of root.querySelectorAll('[data-mode]'))peer.setAttribute('aria-pressed',String(peer===button));update()});update()});</script></html>`;
await writeFile(resolve(output, 'comparison.html'), html);
console.log(
  JSON.stringify({
    status: 'passed',
    captures: report.scopes.reduce((n, scope) => n + scope.variants.length * 2, 0),
    output,
  }),
);
