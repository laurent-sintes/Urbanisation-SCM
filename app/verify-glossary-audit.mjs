/** Validate every glossary route against an in-memory candidate, including old links. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium,browserOptions} from './browser-runtime.mjs';
import {candidateFixture} from './candidate-fixture.mjs';
import {plainInlineText} from './src/inlineLinks.ts';
import {publicText} from './src/publicText.ts';
import {resolveGlossaryTerm,isCurrentGlossaryTerm} from './src/glossary.ts';
const dist=resolve(import.meta.dirname,'dist'), fixture=await candidateFixture(dist);
const {version,raw}=fixture,guide=JSON.parse(fixture.guideBytes).guide;
const terms=raw.glossary.terms,byId=new Map(terms.map(t=>[t.id,t]));
const methodIds=new Set(guide.glossary.model_term_ids),business=terms.filter(t=>!methodIds.has(t.id));
const visible=business.filter(isCurrentGlossaryTerm),base='https://atlas.test/Urbanisation-SCM/';
const browser=await chromium.launch(browserOptions),errors=[];
const normalize=t=>plainInlineText(t).replace(/\s+/g,' ').trim();
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(!url.href.startsWith(base))return route.abort();
  const rel=decodeURIComponent(url.pathname.slice(new URL(base).pathname.length));
  if(rel==='data/index.json')return route.fulfill({json:fixture.index});
  if(rel===`data/${version}/model.json`)return route.fulfill({body:fixture.bytes,contentType:'application/json'});
  if(rel===`data/${version}/guide.json`)return route.fulfill({body:fixture.guideBytes,contentType:'application/json'});
  const path=resolve(dist,rel||'index.html');if(!path.startsWith(dist+sep))return route.abort();
  try{return route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'Missing artifact'});}
 });
 const visit=async params=>{await page.goto(base+'#'+new URLSearchParams({version,...params}));};
 for(const source of business){
  const target=resolveGlossaryTerm(byId,source.id);assert.ok(target);
  await visit({view:'glossary',glossary:'model',term:source.id});
  const detail=page.locator(`#term-${target.id}`);await detail.waitFor();
  assert.ok(normalize(await detail.innerText()).includes(normalize(target.definition)),source.id+' definition');
  if(publicText(target.context))assert.ok(normalize(await detail.innerText()).includes(normalize(publicText(target.context))),source.id+' context');
  assert.equal(await page.locator('.glossary-index li').count(),visible.length,source.id+' index count');
  assert.equal(await page.locator('.glossary-term .unresolved-reference').count(),0,source.id+' unresolved');
 }
 await visit({view:'glossary',glossary:'model'});
 await page.getByLabel('Rechercher dans le glossaire').fill('Merchandise Reference');
 assert.equal(await page.locator('.glossary-index a[href*="term=TER052"]').count(),1);
 assert.equal(await page.locator('.glossary-index a[href*="term=TER188"]').count(),0);
 for(const id of ['MOD041','MOD042']){
  await visit({view:'glossary',glossary:'meta',term:id});await page.locator(`#term-${id}`).waitFor();
 }
 // Keyboard tooltip and source notice navigation stay in the selected candidate.
 await visit({view:'principles',principle:'explore'});
 await page.locator('.method-chapter').waitFor();
 await page.locator('.method-chapter details').evaluateAll(items=>items.forEach(item=>item.open=true));
 const reference=page.locator('a.model-reference').filter({hasText:'TOGAF'}).first();
 await reference.focus();await page.getByRole('tooltip').waitFor();
 assert.match(await page.getByRole('tooltip').innerText(),/Cohérence/);
 await reference.press('Enter');await page.locator('#method-section-1').waitFor();
 assert.match(page.url(),/principle=references/);assert.match(page.url(),new RegExp(`version=${version}`));
 // Historical snapshot retains its own visible entries and wording.
 const historic=fixture.index.versions.find(v=>v.version!==version && v.version==='2026-10-07.4');
 if(historic){
  const old=JSON.parse(await readFile(resolve(dist,`data/${historic.version}/model.json`),'utf8'));
  const entry=old.glossary.terms.find(t=>t.id==='TER161');
  await page.goto(base+`#version=${historic.version}&view=glossary&glossary=model&term=TER161`);
  const detail=page.locator('#term-TER161');await detail.waitFor();
  assert.ok(normalize(await detail.innerText()).includes(normalize(entry.definition)));
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({businessRoutes:business.length,visibleBusiness:visible.length,aliases:business.filter(t=>t.alias_of).length,historical:business.filter(t=>t.presentation==='historical').length,methodVerbs:business.filter(t=>t.presentation==='method').length,keyboardTooltip:true,publicationIsolation:true,errors}));
} finally {await browser.close();}
