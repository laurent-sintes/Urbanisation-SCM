/** Exercise the future Process model in an isolated browser fixture, never publish backlog. */
import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chromium, browserOptions} from './browser-runtime.mjs';
import {adaptPublication, childrenOf, cardContentSummary} from './src/model.ts';
import {plainInlineText} from './src/inlineLinks.ts';

const app=import.meta.dirname, root=resolve(app,'..'), dist=resolve(app,'dist');
const generated=spawnSync(process.env.ATLAS_PYTHON||'python',['-X','utf8','-c',
  "import json; from pathlib import Path; from scripts.structured_io import read; from scripts.publish_release import compile_snapshot; from scripts.guide_candidate import load_draft; m=read(Path('modeles/backlog/model.yaml')); m['glossary']=read(Path('modeles/backlog/glossary.yaml')); print(json.dumps({'model':compile_snapshot(m,{'decisions':[]},'2026-10-07.999',[]),'guide':load_draft(Path.cwd(),Path('modeles/backlog/atlas-transformation-methodology.yaml'))},ensure_ascii=True))"],
  {cwd:root,encoding:'utf8',maxBuffer:30*1024*1024});
assert.equal(generated.status,0,generated.stderr);
const candidate=JSON.parse(generated.stdout),raw=candidate.model, model=adaptPublication(raw), version=raw.version;
const index=JSON.parse(await readFile(resolve(dist,'data/index.json'),'utf8'));
const current=index.current_version, entry=structuredClone(index.versions.find(x=>x.version===current));
const modelBody=JSON.stringify(raw);entry.version=version;entry.model_sha256=createHash('sha256').update(modelBody).digest('hex');
const guide=JSON.parse(await readFile(resolve(dist,`data/${current}/guide.json`),'utf8'));guide.publication_version=version;
guide.guide=candidate.guide;
const guideBody=JSON.stringify(guide);entry.guide_sha256=createHash('sha256').update(guideBody).digest('hex');
index.versions.push(entry);index.current_version=version;
const areas=childrenOf(model,'subdomain-process-management');
const caps=areas.flatMap(a=>childrenOf(model,a.id));
assert.equal(areas.length,4);assert.equal(caps.length,12);
assert.equal(cardContentSummary(model,model.nodeById.get('subdomain-process-management')),'12 capacités');
assert.ok(model.nodeById.get('BHV082').displayCode.startsWith('CAP-'));
const base='https://atlas.test/Urbanisation-SCM/';
const browser=await chromium.launch(browserOptions);
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(!url.href.startsWith(base))return route.abort();
  const rel=decodeURIComponent(url.pathname.slice(new URL(base).pathname.length))||'index.html';
  if(rel==='data/index.json')return route.fulfill({json:index});
  if(rel===`data/${version}/model.json`)return route.fulfill({body:modelBody,contentType:'application/json'});
  if(rel===`data/${version}/guide.json`)return route.fulfill({body:guideBody,contentType:'application/json'});
  const file=resolve(dist,rel);assert.ok(file.startsWith(dist+sep));
  return route.fulfill({body:await readFile(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'})[extname(file)]||'application/octet-stream'});
 });
 const visit=async params=>page.goto(base+'#'+new URLSearchParams({version,...params}));
 await visit({scope:'supply-chain-orchestration',node:'subdomain-process-management',view:'map',mapDepth:'3',mapFocus:'subdomain-process-management'});
 const processCard=page.locator('.business-card[data-node-id="subdomain-process-management"]');
 await processCard.waitFor();
 assert.equal(await processCard.locator('[data-business-area-summary]').count(),4);
 assert.equal(await processCard.locator('[data-map-item-id]').count(),12);
 const output=resolve(app,'.runtime/qa-process-management');await mkdir(output,{recursive:true});
 await page.screenshot({path:resolve(output,'overview.png')});
 const reviewed=[...caps,...['supply-chain-orchestration','subdomain-integration','D01','D03.i','D03.j','D03.k','D04.i','D07.d','operations-visibility'].map(id=>model.nodeById.get(id))];
 for(const cap of reviewed){
  await visit({node:cap.id,view:'sheet'});
  const sheet=page.getByTestId('business-sheet');await sheet.waitFor();
  await page.getByRole('heading',{level:1,name:cap.name,exact:true}).waitFor();
  await sheet.locator('details').evaluateAll(items=>items.forEach(x=>x.open=true));
  const body=await sheet.innerText();
  assert.ok(body.includes(plainInlineText(cap.fields.definition)),cap.id+' definition');
  assert.ok(await sheet.locator('.scenario-links a').count()>0,cap.id+' scenarios');
  assert.equal(await sheet.locator('.unresolved-reference').count(),0,cap.id+' references');
  if(cap.id==='D03.j') assert.ok(await sheet.locator('.scenario-links a[href*="scenario=preorder-future-availability"]').count()>0,'CTP preorder backlink');
 }
 for(const query of ['BHV082',model.nodeById.get('BHV082').displayCode,'Process Mining']){
  const target=query==='Process Mining'?'process-mining':'BHV082';
  const panelToggle=page.locator('#fa-tree-open');
  if(await panelToggle.getAttribute('aria-expanded')==='false')await panelToggle.click();
  await page.getByRole('textbox',{name:'Rechercher dans le modèle publié'}).fill(query);
  await page.locator(`[data-search-result="${target}"]`).click();
  await page.getByRole('heading',{level:1,name:model.nodeById.get(target).name,exact:true}).waitFor();
 }
 await visit({view:'scenarios',scenario:'process-approval-bottleneck'});
 await page.locator('.mobilization-steps').waitFor();
 assert.equal(await page.locator('.workspace-content .unresolved-reference').count(),0);
 for(const [scenario,path,title] of [
  ['customer-credit-hold','credit-review-no-response-path','Validation financière sans réponse'],
  ['remote-payment-ambiguous','payment-resumption-not-confirmed-path','Reprise refusée ou non confirmée']
 ]){
  await visit({view:'scenarios',scenario,path});
  await page.getByRole('heading',{level:3,name:title,exact:true}).waitFor();
  assert.equal(await page.locator('.workspace-content .unresolved-reference').count(),0,path);
 }
 await visit({view:'glossary',term:'TER031'});
 // This historical vocabulary ID intentionally redirects to the methodological type.
 await page.getByRole('heading',{name:'Type de capacité',exact:true}).waitFor();
 assert.equal(await page.locator('.workspace-content .unresolved-reference').count(),0);
 await visit({view:'glossary',glossary:'meta',term:'MOD015'});
 await page.getByRole('heading',{name:'Capacité',exact:true}).waitFor();
 assert.ok((await page.locator('.workspace-content').innerText()).includes('Process Management'));
 assert.equal(await page.locator('.workspace-content .unresolved-reference').count(),0);
 await page.setViewportSize({width:390,height:844});
 await visit({node:'subdomain-process-management',view:'sheet'});
 await page.getByTestId('business-sheet').waitFor();
 assert.deepEqual(await page.locator('.scope-statistics li').allTextContents(),['4 Business Areas','12 capacités','0 comportements']);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:resolve(output,'statistics-mobile.png')});
 await visit({node:'BHV082',view:'sheet'});await page.getByTestId('business-sheet').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:resolve(output,'mobile.png')});
 // Same persistent ID still resolves to its historical behavior in the real snapshot.
 await visit({version:'2026-10-07.2',node:'BHV082',view:'sheet'});
 await page.getByRole('heading',{level:1,name:'Process Visibility',exact:true}).waitFor();
 assert.ok((await page.locator('.eyebrow').innerText()).includes('BHV-'));
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'passed',fixture:true,areas:4,capabilities:12,checks:['banners','counts','all sheets','scenario links','references','identity and code search','mining scenario','methodology','mobile','historical behavior']}));
} finally {await browser.close();}
