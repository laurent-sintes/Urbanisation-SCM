import { renderMethodPreview } from './method-preview.mjs';
// Isolated candidate review: real built UI, no server or publication mutation.
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium, browserOptions } from './browser-runtime.mjs';
import { loadPublication } from '../scripts/load-publication.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'app/dist');
const output = resolve(root, 'app/.runtime/qa-transformation-method');
const current = (await loadPublication()).raw;
const guide = JSON.parse(execFileSync(process.env.ATLAS_PYTHON || 'python', ['-X','utf8','-c',
  "import json;from scripts.structured_io import read;from app.modeling_guide import _validate_guide;g=read('modeles/backlog/atlas-transformation-methodology.yaml');_validate_guide(g,g['version']);print(json.dumps(g))"],
  {cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024}));
const published = JSON.parse(execFileSync(process.env.ATLAS_PYTHON || 'python', ['-X','utf8','-c',
  "import json;from app.modeling_guide import load_modeling_guide;print(json.dumps(load_modeling_guide(version='2026-09-28.2')))"],
  {cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024}));
let responseGuide=guide;
await mkdir(output,{recursive:true});
const browser = await chromium.launch(browserOptions);
const errors=[];
const visuals = {};
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on('pageerror', e=>errors.push(e.message));
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!=='http://atlas.test')return route.abort();
    if(url.pathname==='/data/index.json')return route.fulfill({json:{current_version:current.version,versions:[{version:current.version,revision:current.revision}]}});
    if(url.pathname===`/data/${current.version}/model.json`)return route.fulfill({json:current});
    if(url.pathname===`/data/${current.version}/guide.json`)return route.fulfill({json:{schema_version:'1.0.0',publication_version:current.version,status:'available',message:'Fixture isolée de la nouvelle édition',guide:responseGuide}});
    const path=resolve(dist,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
    if(!path.startsWith(dist+sep))return route.abort();
    try{return route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});}
    catch{return route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto(`http://atlas.test/#version=${current.version}&view=principles`);
  await page.getByRole('heading',{name:'Une démarche, plusieurs portes d’entrée',exact:true}).waitFor();
  assert.equal(await page.getByRole('heading',{level:1}).innerText(),guide.title);
  assert.deepEqual(await page.locator('.method-chapters button').allTextContents(),await page.locator('.space-navigation button').allTextContents());
  await page.locator('.method-chapters').getByRole('button',{name:'Codes et identifiants',exact:true}).click();
  assert.equal(await page.locator('.method-chapters button[aria-current="page"]').innerText(),'Codes et identifiants');
  await page.locator('.method-chapters').getByRole('button',{name:'Métamodèle FLOW',exact:true}).click();
  await page.locator('.guide-topics button').first().click();
  assert.equal(await page.locator('.method-chapters button[aria-current="page"]').innerText(),'Métamodèle FLOW');
  for(const chapter of guide.chapters){
    await page.locator('.sidebar').getByRole('button',{name:chapter.title,exact:true}).click();
    await page.getByRole('heading',{name:chapter.title,exact:true}).waitFor();
    if(chapter.visual){
      const overview=page.locator('.method-overview-image');
      await overview.waitFor();
      assert.ok(await overview.getAttribute('alt'));
      await overview.evaluate(img=>img.decode());
      visuals[chapter.id]=chapter.visual.overview_svg;
      await page.getByText('Lire le schéma en grand format',{exact:true}).click();
      await page.getByRole('region',{name:`Vue agrandie : ${chapter.visual.title}`}).waitFor();
      await page.getByRole('region',{name:`Vue agrandie : ${chapter.visual.title}`}).focus();
      await page.keyboard.press('ArrowRight');
      await page.getByText('Lire le schéma en grand format',{exact:true}).click();
      await writeFile(resolve(output,`${chapter.id}.svg`),visuals[chapter.id]);
      await page.locator('.method-visual').screenshot({path:resolve(output,`${chapter.id}.png`)});
    }
  }
  await page.locator('.sidebar').getByRole('button',{name:'Explorer et concevoir',exact:true}).click();
  const ddd=page.getByRole('link',{name:'Domain-Driven Design ou DDD',exact:true});
  await ddd.focus();
  await page.getByRole('tooltip').waitFor();
  await page.keyboard.press('Escape');
  await ddd.click();
  await page.getByRole('heading',{name:'Glossaire méthodologique',exact:true}).waitFor();
  await page.setViewportSize({width:390,height:844});
  await page.goto(`http://atlas.test/#version=${current.version}&view=principles&principle=start`);
  await page.getByRole('heading',{name:'Comprendre la démarche',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'No page-level horizontal overflow');
  await page.locator('.method-chapters').getByRole('button',{name:'Préparer et prendre les décisions',exact:true}).click();
  await page.getByRole('heading',{name:'Préparer et prendre les décisions',exact:true}).waitFor();
  await page.screenshot({path:resolve(output,'mobile.png')});
  assert.equal(await page.locator('.method-overview-image').isVisible(),true);
  await page.getByText('Lire le schéma en grand format',{exact:true}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await page.goto('http://atlas.test/#view=principles');
  await page.getByRole('heading',{name:'Une démarche, plusieurs portes d’entrée',exact:true}).waitFor();
  await page.getByRole('link',{name:'Explorer la cartographie',exact:true}).click();
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('version'),false);
  await page.goto('http://atlas.test/#view=principles');
  await page.locator('.method-chapters').getByRole('link',{name:'Glossaire méthodologique',exact:true}).click();
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('version'),false);
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('term'),false);
  responseGuide=published.guide;
  await page.goto(`http://atlas.test/#version=${current.version}&view=principles`);
  await page.reload();
  await page.locator('.method-chapters').waitFor();
  assert.equal(await page.locator('.method-chapters').getByRole('button').count(),published.guide.chapters.length+1);
  assert.equal(await page.locator('.method-visual').count(),0,'Published guide must not acquire candidate visuals');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }

await renderMethodPreview(guide,output);
const previewBrowser=await chromium.launch(browserOptions);
try {
  const page=await previewBrowser.newPage({viewport:{width:1440,height:1000}});
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    const file=resolve(output,'.'+decodeURIComponent(url.pathname));
    if(url.origin!=='http://preview.test'||!file.startsWith(output+sep))return route.abort();
    try{return route.fulfill({body:await readFile(file),contentType:'text/html'});}
    catch{return route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto('http://preview.test/methodologie-transformation.html');
  await page.screenshot({path:resolve(output,'sommaire.png'),fullPage:true});
  await page.getByRole('link',{name:'Commencer par la vue d’ensemble →'}).click();
  await page.getByRole('heading',{name:'Comprendre la démarche',exact:true}).waitFor();
  assert.ok(!(await page.locator('body').innerText()).includes('deux semaines'));
  await page.getByRole('link',{name:'Continuer : Explorer et concevoir →'}).click();
  await page.getByRole('link',{name:'Domain-Driven Design ou DDD',exact:true}).click();
  await page.locator('#MOD033').waitFor();
  await page.goBack();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await page.screenshot({path:resolve(output,'lecture-mobile.png'),fullPage:true});
} finally { await previewBrowser.close(); }
console.log('Transformation candidate and split reading preview generated.');
