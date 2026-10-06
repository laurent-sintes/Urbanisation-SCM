/** Content acceptance against the actual build, without injected backlog fixtures.
 * Run locally against dist, or against a served site with --url URL.
 */
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium, browserOptions} from './browser-runtime.mjs';
import {plainInlineText} from './src/inlineLinks.ts';
import {lessonForPublication} from './src/modelingGuide.ts';
import {adaptPublication} from './src/model.ts';

const dist=resolve(import.meta.dirname,'dist');
const output=resolve(import.meta.dirname,'.runtime/qa-published-content');
const urlIndex=process.argv.indexOf('--url');
const base=urlIndex<0 ? 'https://atlas.test/Urbanisation-SCM/' : process.argv[urlIndex+1].replace(/\/?$/, '/');
const index=JSON.parse(await readFile(resolve(dist,'data/index.json'),'utf8'));
const version=index.current_version;
const bytes=await readFile(resolve(dist,`data/${version}/model.json`));
const guideBytes=await readFile(resolve(dist,`data/${version}/guide.json`));
const entry=index.versions.find(v=>v.version===version);
assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.model_sha256);
assert.equal(createHash('sha256').update(guideBytes).digest('hex'),entry.guide_sha256);
const model=JSON.parse(bytes), guide=JSON.parse(guideBytes).guide, catalog=model.scenario_catalog;
assert.ok(catalog && guide?.chapters, 'Current publication must expose scenarios and methodology');
assert.deepEqual(guide.chapters.map(c=>c.id),['start','explore','decisions','transform','sustain','metamodel','method','references'],'The approved transformation journey must not regress to the old mapping-only guide');
const browser=await chromium.launch(browserOptions), errors=[], missing=[], counts={streams:0,scenarios:0,paths:0,steps:0,chapters:0,sections:0,visuals:0,sheets:0,lessons:0,terms:0};
// Ignore typographic case (CSS small labels are uppercase), never omit words.
const normalize=text=>plainInlineText(text).replace(/\s+/g,' ').trim().toLocaleLowerCase('fr');
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.setDefaultTimeout(12000);
  page.on('pageerror',error=>errors.push(error.message));
  if(urlIndex<0) await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(!url.href.startsWith(base)) return route.abort();
    const path=resolve(dist,decodeURIComponent(url.pathname.slice(new URL(base).pathname.length))||'index.html');
    if(!path.startsWith(dist+sep))return route.abort();
    try{return await route.fulfill({body:await readFile(path),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'})[extname(path)]||'application/octet-stream'});}
    catch{return route.fulfill({status:404,body:'Missing built artifact'});}
  });
  const visit=async params=>{
    await page.goto(base+'#'+new URLSearchParams(params));
    await page.locator(`#fa-version[data-version="${params.version||version}"]`).waitFor({state:'attached'});
  };
  const content=async selector=>{
    const area=page.locator(selector);
    await area.waitFor();
    await area.locator('details').evaluateAll(items=>items.forEach(item=>item.open=true));
    return normalize(await area.innerText());
  };
  const contains=(actual,expected,where)=>{
    if(expected && !actual.includes(normalize(expected))) missing.push({where,expected});
  };
  const cleanReferences=async where=>{
    const unresolved=await page.locator('.workspace-content .unresolved-reference').allTextContents();
    if(unresolved.length) missing.push({where,unresolved});
  };
  await visit({view:'scenarios'});
  await page.locator('.scenario-cards').waitFor();
  assert.equal(await page.locator('.scenario-cards>li').count(),catalog.scenarios.length);
  await page.getByLabel('Rechercher un scénario',{exact:true}).fill('Livraison fractionnée');
  await page.locator('.scenario-cards a').filter({hasText:'Livrer une commande B2B'}).waitFor();
  assert.equal(await page.locator('.scenario-cards>li').count(),1);
  for(const stream of catalog.value_streams){
    await visit({view:'scenarios',stream:stream.id});
    await page.getByRole('heading',{name:stream.label_fr,exact:true}).waitFor();
    const actual=await content('.scenario-catalog');
    for(const field of ['name','label_fr','description','beneficiary','value','trigger','boundary','market_position'])contains(actual,stream[field],`${stream.id}/${field}`);
    for(const stage of stream.stages)for(const field of ['name','outcome','entry','exit'])contains(actual,stage[field],`${stream.id}/${stage.id}/${field}`);
    for(const source of stream.market_sources)for(const field of ['vendor','support','limit'])contains(actual,source[field],`${stream.id}/market/${field}`);
    await cleanReferences(stream.id);counts.streams++;
  }
  for(const scenario of catalog.scenarios){
    for(const path of catalog.paths.filter(p=>p.scenario_id===scenario.id)){
      await visit({view:'scenarios',scenario:scenario.id,path:path.id});
      // A single-path scenario may share its title with its mobilization path.
      // Target the path region rather than assuming titles are globally unique.
      await page.getByRole('region',{name:'Parcours de mobilisation',exact:true})
        .getByRole('heading',{name:path.title,exact:true}).waitFor();
      const actual=await content('.scenario-catalog');
      for(const field of ['title','situation','trigger','objective'])contains(actual,scenario[field],`${scenario.id}/${field}`);
      for(const field of ['conditions','validation_points'])for(const value of scenario[field])contains(actual,value,`${scenario.id}/${field}`);
      for(const field of ['title','outcome','sequence_note'])contains(actual,path[field],`${path.id}/${field}`);
      for(const value of path.conditions)contains(actual,value,`${path.id}/conditions`);
      for(const step of path.steps){
        for(const field of ['title','description','outcome'])contains(actual,step[field],`${path.id}/${step.id}/${field}`);
        for(const value of step.inputs)contains(actual,value,`${path.id}/${step.id}/inputs`);
        for(const contribution of step.contributions){
          contains(actual,contribution.role,`${path.id}/${step.id}/${contribution.node_id}`);
          assert.ok(await page.locator(`.mobilization-steps a[href*="node=${encodeURIComponent(contribution.node_id)}"]`).count(),`Missing capability link ${contribution.node_id}`);
        }
        counts.steps++;
      }
      for(const dependency of path.dependencies)contains(actual,dependency.condition,`${path.id}/dependency`);
      await cleanReferences(path.id);counts.paths++;
    }counts.scenarios++;
  }
  // Every participating capability and its hierarchy parents retain scenario access.
  for(const node of model.nodes.filter(n=>['capability','business_area','area','domain'].includes(n.kind))){
    const descendants=new Set([node.id]);let size=-1;
    while(size!==descendants.size){size=descendants.size;for(const r of model.relations)if(['contains','presents'].includes(r.type)&&descendants.has(r.source_id))descendants.add(r.target_id);}
    const expected=catalog.scenarios.filter(s=>catalog.paths.some(p=>p.scenario_id===s.id&&p.steps.some(step=>step.contributions.some(c=>descendants.has(c.node_id))))||catalog.legacy_links.some(a=>a.owner_id===node.id&&a.scenario_id===s.id));
    await visit({view:'sheet',node:node.id});await page.getByTestId('business-sheet').waitFor();
    const links=page.locator('.scenario-links');await links.waitFor();
    assert.equal(await links.locator('li>a').count(),expected.length,`Scenario access for ${node.id}`);
    for(const s of expected)assert.ok(await links.locator(`a[href*="scenario=${s.id}"]`).count(),`Missing ${s.id} from ${node.id}`);
    if(!expected.length)await links.getByText('Aucun scénario documenté pour ce périmètre.',{exact:true}).waitFor();
    counts.sheets++;
  }
  for(const chapter of guide.chapters){
    await visit({view:'principles',principle:chapter.id});
    await page.getByRole('heading',{name:chapter.title,exact:true}).waitFor();
    const actual=await content('.method-chapter');
    contains(actual,chapter.intro,`${chapter.id}/intro`);
    for(const section of chapter.sections){
      for(const field of ['title','text','example','detail'])contains(actual,section[field],`${chapter.id}/${section.title}/${field}`);
      if(section.url)assert.ok(await page.locator(`.method-chapter a[href="${section.url}"]`).count());
      counts.sections++;
    }
    if(chapter.visual){await page.locator('.method-overview-image').evaluate(img=>img.decode());counts.visuals++;}
    await cleanReferences(chapter.id);counts.chapters++;
  }
  for(const original of guide.lessons){
    const lesson=lessonForPublication(original,adaptPublication(model));
    await visit({view:'principles',principle:lesson.id});
    await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
    const actual=await content('.guide-lesson');
    for(const field of ['title','rule','question','explanation'])contains(actual,lesson[field],`${lesson.id}/${field}`);
    for(const field of ['criterion','boundary'])contains(actual,lesson.contributor[field],`${lesson.id}/${field}`);
    for(const field of ['parent','connector','caption'])contains(actual,lesson.scene[field],`${lesson.id}/scene/${field}`);
    for(const item of lesson.scene.items)for(const field of ['label','text'])contains(actual,item[field],`${lesson.id}/scene/${field}`);
    for(const choice of lesson.choices){
      await page.getByRole('button',{name:choice.label,exact:true}).click();
      contains(normalize(await page.locator('.guide-answer').innerText()),choice.feedback,`${lesson.id}/feedback`);
    }
    await cleanReferences(lesson.id);counts.lessons++;
  }
  const visibleTerms=guide.glossary.groups?.flatMap(g=>g.term_ids) || guide.glossary.terms.filter(t=>t.status!=='retired'&&!t.parent_term&&!t.guide_section).map(t=>t.id);
  for(const id of visibleTerms){
    const term=guide.glossary.terms.find(t=>t.id===id)||model.glossary.terms.find(t=>t.id===id);
    assert.ok(term,`Missing published term ${id}`);
    await visit({view:'glossary',glossary:'meta',term:id});
    const actual=await content(`#term-${id}`);
    contains(actual,term.definition,`${id}/definition`);
    for(const value of term.examples||[])contains(actual,value,`${id}/example`);
    for(const value of Object.values(term.values||{}))contains(actual,value,`${id}/values`);
    await cleanReferences(id);counts.terms++;
  }
  // Reproduce the reported pinned URL, then recover through the visible UI.
  await visit({version:'2026-09-28.1',view:'principles',principle:'method'});
  await page.getByRole('heading',{name:'La méthode',exact:true}).waitFor();
  await page.getByRole('complementary',{name:'Publication consultée'}).waitFor();
  await page.getByRole('button',{name:'Suivre la version courante',exact:true}).click();
  await page.getByRole('heading',{name:guide.title,exact:true}).waitFor();
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('version'),false);
  // Current navigation must remain current, even through glossary detours.
  await page.locator('.method-chapters').getByRole('link',{name:'Glossaire méthodologique',exact:true}).click();
  await page.getByRole('heading',{name:'Glossaire méthodologique',exact:true}).waitFor();
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('version'),false);
  // Layout smoke checks include the actual publication on a narrow viewport.
  await mkdir(output,{recursive:true});
  for(const [name,params] of [['method',{view:'principles'}],['scenario',{view:'scenarios',scenario:catalog.scenarios[0].id}]]){
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:900});await visit(params);
      await page.locator(name==='method'?'.method-home':'.mobilization-steps').waitFor();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
      if(name==='method')assert.equal(await page.locator('.method-home-cards button').first().evaluate(e=>getComputedStyle(e).display),'block');
      await page.screenshot({path:resolve(output,`${name}-${width}.png`)});
    }
  }
  await writeFile(resolve(output,'result.json'),JSON.stringify({version,base,counts,missing,errors},null,2));
  assert.deepEqual(missing,[],'Published content absent from the reader (see result.json)');
  assert.deepEqual(errors,[],'Browser errors');
  console.log(JSON.stringify({status:'passed',version,counts}));
}finally{await browser.close();}
