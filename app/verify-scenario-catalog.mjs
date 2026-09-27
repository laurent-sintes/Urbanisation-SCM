// Test candidate data in a headless isolated browser. Never serve the backlog
// through Atlas or modify a publication to perform this verification.
import {execFileSync} from 'node:child_process';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
import {chromium,browserOptions} from './browser-runtime.mjs';
const root=resolve(import.meta.dirname,'..'), dist=resolve(root,'app/dist');
const fixture=JSON.parse(execFileSync('python',['-X','utf8','-c',`
import json
from scripts.structured_io import read
from scripts.export_publication import export
old=export('.','2026-09-27.1')['raw']; candidate=export('.')['raw']; backlog=read('modeles/backlog/model.yaml')
candidate['version']='editorial-candidate'; candidate['scenario_catalog']=backlog['scenario_catalog']
candidate['glossary']=read('modeles/backlog/glossary.yaml')
by_id={n['id']:n for n in backlog['nodes']}
for node in candidate['nodes']:
 for field in ['examples','scenario_refs','definition','finality','scope']:
  node['fields'].pop(field,None)
  if field in by_id[node['id']]['fields']: node['fields'][field]=by_id[node['id']]['fields'][field]
guide=read('modeles/backlog/atlas-methodology-U797.yaml')
print(json.dumps({'old':old,'candidate':candidate,'guide':guide},ensure_ascii=True))
`],{cwd:root,encoding:'utf8',maxBuffer:24*1024*1024,windowsHide:true}));
const browser=await chromium.launch(browserOptions);const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url()); if(url.origin!=='http://atlas.test')return route.abort();
  if(url.pathname==='/data/index.json')return route.fulfill({json:{current_version:fixture.candidate.version,versions:[fixture.candidate,fixture.old].map(m=>({version:m.version,revision:m.revision}))}});
  if(url.pathname.endsWith('/model.json')) return route.fulfill({json:url.pathname.includes(fixture.candidate.version)?fixture.candidate:fixture.old});
  if(url.pathname.endsWith('/guide.json')) return route.fulfill({json:{schema_version:'1.0.0',publication_version:fixture.candidate.version,status:'available',message:'',guide:fixture.guide}});
  const path=resolve(dist,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(dist+sep))return route.abort();
  try{return route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'Missing'});}
 });
 const visit=(params,version=fixture.candidate.version)=>page.goto('http://atlas.test/#'+new URLSearchParams({version,...params}));
 // Empty coverage is explicit; it does not become an invented business gap.
 await visit({view:'sheet',node:'domain-sales'});
 await page.getByRole('heading',{name:'Scénarios mobilisant ce périmètre',exact:true}).waitFor();
 await page.getByText('Aucun scénario documenté pour ce périmètre.',{exact:true}).waitFor();
 // Business and method tooltips use short definitions and work by keyboard.
 await visit({view:'sheet',node:'D11.b'});await page.getByTestId('business-sheet').waitFor();
 const agreement=page.getByTestId('business-sheet').locator('a[href*="term=TER048"]').first();
 await agreement.focus();await page.getByRole('tooltip').waitFor();
 assert.ok((await page.getByRole('tooltip').innerText()).includes('Contrat complet applicable, comprenant cadre, conditions particulières, périodes et engagements.'));
 assert.ok(!(await page.getByRole('tooltip').innerText()).includes('Sa projection dans la plateforme'));
 await page.keyboard.press('Escape');await page.getByRole('tooltip').waitFor({state:'hidden'});
 await visit({view:'scenarios'});
 const methodLink=page.getByRole('link',{name:'Comprendre scénario et parcours'});
 await methodLink.focus();await page.getByRole('tooltip').waitFor();
 assert.ok((await page.getByRole('tooltip').innerText()).includes('Situation métier décrite par son déclencheur'));
 await methodLink.click();assert.ok(page.url().includes('glossary=meta'));assert.ok(page.url().includes('version=editorial-candidate'));
 await visit({view:'scenarios'});await page.getByRole('heading',{name:'Explorer par flux de valeur'}).waitFor();
 assert.equal(await page.locator('.value-stream-cards>li').count(),5);
 assert.equal(await page.locator('.scenario-cards>li').count(),26);
 await page.getByLabel('Événement',{exact:true}).selectOption('shortage');assert.ok(await page.locator('.scenario-cards>li').count()<26);
 await page.getByRole('button',{name:'Effacer les filtres'}).click();
 await page.getByRole('link',{name:'Livrer une commande B2B avec un stock partiel',exact:true}).click();
 await page.getByRole('heading',{name:'Livrer une commande B2B avec un stock partiel',exact:true}).waitFor();
 await page.getByRole('combobox',{name:'Parcours de mobilisation',exact:true}).selectOption('b2b-partial-stock-split-path');
 await page.getByRole('heading',{name:'Livraison fractionnée',exact:true}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'Livraison fractionnée',exact:true}).waitFor();
 await page.locator('.mobilization-steps a').first().click();await page.getByTestId('business-sheet').waitFor();
 await page.locator('.scenario-links a').filter({hasText:'Livrer une commande B2B'}).click();await page.getByRole('link',{name:'Revenir à la fiche'}).waitFor();
 await page.getByRole('link',{name:'Revenir à la fiche'}).click();await page.getByTestId('business-sheet').waitFor();
 await visit({view:'scenarios',stream:'recover-value'});await page.getByRole('heading',{name:'Traiter un produit retourné ou non conforme',exact:true}).waitFor();
 await page.getByRole('link',{name:'Catalogue des scénarios',exact:true}).click();
 await page.getByLabel('Rechercher dans le modèle publié').fill('Livraison regroupée');
 // Global search identifies scenario titles and narrative, without duplicating
 // the scenario for each of its two value streams.
 await page.getByLabel('Rechercher dans le modèle publié').fill('Livrer une commande B2B');
 await page.getByLabel('Type de résultat').selectOption('scenario');assert.equal(await page.locator('[data-search-result="b2b-partial-stock"]').count(),1);
 await visit({view:'scenarios',scenario:'absent'});await page.getByRole('heading',{name:'Élément absent de cette publication'}).waitFor();
 await visit({view:'scenarios'},fixture.old.version);await page.getByRole('heading',{name:'Catalogue absent de cette publication'}).waitFor();
 await visit({view:'sheet',node:'universe-supply'},fixture.old.version);await page.getByTestId('business-sheet').waitFor();assert.ok(await page.locator('.example-card').count()>0);
 await page.setViewportSize({width:390,height:844});await visit({view:'scenarios'});await page.getByRole('heading',{name:'Explorer par flux de valeur'}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await mkdir(resolve(root,'app/.runtime/qa-scenarios'),{recursive:true});await page.screenshot({path:resolve(root,'app/.runtime/qa-scenarios/mobile.png')});
 await page.setViewportSize({width:1440,height:1050});await visit({view:'scenarios',scenario:'b2b-partial-stock'});await page.getByRole('heading',{name:'Livraison regroupée',exact:true}).waitFor();
 await page.screenshot({path:resolve(root,'app/.runtime/qa-scenarios/desktop.png')});
 assert.deepEqual(errors,[]);console.log('Scenario catalog browser checks passed: catalog, facets, paths, links, reload, search, history and mobile.');
} finally {await browser.close();}

