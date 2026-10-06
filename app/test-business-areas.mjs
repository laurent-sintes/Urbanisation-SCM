import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptPublication, cardChildListOf, childrenOf, lineageOf, parentRelationOf } from './src/model.ts';
import { kindLabel } from './src/presentation.ts';
import { scenariosForNode } from './src/scenarioCatalog.ts';
import { projectDependencies, dependencyLevels, dependencyLevel } from './src/dependencyGraph.ts';
import { readRoute } from './src/navigation.ts';
import { businessAreaSections } from './src/mapSections.ts';
const raw = () => ({ space:'release',version:'fixture',nodes:[
  {id:'sub',kind:'area',fields:{name:'Subdomain'}},
  {id:'ba',kind:'business_area',fields:{name:'Responsibility'}},
  {id:'cap',kind:'capability',fields:{name:'Ability',nature:'decision'}},
  {id:'direct',kind:'capability',fields:{name:'Direct',nature:'knowledge'}},
  {id:'ref',kind:'reference',fields:{name:'Reference'}},
],relations:[
  {id:'a',type:'contains',source_id:'sub',target_id:'ba'},
  {id:'b',type:'contains',source_id:'ba',target_id:'cap'},
  {id:'c',type:'contains',source_id:'sub',target_id:'direct'},
  {id:'d',type:'presents',source_id:'sub',target_id:'ref'},
  {id:'doc',type:'documents-reference',source_id:'direct',target_id:'ref'},
  {id:'cooperation',type:'relates-to',source_id:'cap',target_id:'direct',qualification:{meaning:'Uses'}},
],scenario_catalog:{scenarios:[{id:'s',title:'Scenario'}],paths:[{id:'p',scenario_id:'s',steps:[{contributions:[{node_id:'cap'},{node_id:'direct'}]}]}],legacy_links:[]}});
test('optional responsibility level remains visible in cards, lineage and labels',()=>{
  const m=adaptPublication(raw());
  assert.equal(kindLabel(m.nodeById.get('ba')),'Business Area');
  assert.deepEqual(new Set(cardChildListOf(m,m.nodeById.get('sub')).items.map(n=>n.id)),new Set(['ba','direct','ref']));
  assert.deepEqual(childrenOf(m,'ba').map(n=>n.id),['cap']);
  assert.deepEqual(lineageOf(m,'cap').map(n=>n.id),['sub','ba','cap']);
  assert.equal(parentRelationOf(m,'direct').sourceId,'sub');
  assert.equal(m.nodeById.get('direct').referenceParentName,'Reference');
  assert.equal(childrenOf(m,'ref').length,0);
});
test('scenarios aggregate across Business Areas without duplicates',()=>{
  const m=adaptPublication(raw());
  assert.deepEqual(scenariosForNode(m,'ba').map(s=>s.id),['s']);
  assert.deepEqual(scenariosForNode(m,'sub').map(s=>s.id),['s']);
});
test('map banners group actual children without changing parents or losing direct nodes',()=>{
  const m=adaptPublication(raw());
  const sections=businessAreaSections(m,'sub');
  assert.equal(sections[0].area.id,'ba');
  assert.deepEqual(sections[0].items.map(n=>n.id),['cap']);
  assert.deepEqual(new Set(sections.flatMap(s=>s.items.map(n=>n.id))),new Set(['cap','direct','ref']));
  assert.equal(parentRelationOf(m,'cap').sourceId,'ba');
  assert.equal(businessAreaSections(m,'ba'),undefined);
});
test('relationship projection retains direct capabilities and reference links',()=>{
  const m=adaptPublication(raw());
  assert.ok(dependencyLevels(m).some(x=>x.value==='business_area'));
  const p=projectDependencies(m,{level:'business_area',depth:0,direction:'both',family:'all'});
  assert.ok(p.nodes.some(n=>n.id==='ba'));assert.ok(p.nodes.some(n=>n.id==='direct'));
  assert.ok(p.relations.some(r=>r.id==='doc'));
  assert.equal(readRoute('#view=relations&level=business_area').graphLevel,'business_area');
  const old=raw();old.nodes=old.nodes.filter(n=>n.id!=='ba');old.relations=old.relations.filter(r=>r.id!=='a');old.relations.find(r=>r.id==='b').source_id='sub';
  assert.equal(dependencyLevel(adaptPublication(old),'business_area'),'capability');
});
