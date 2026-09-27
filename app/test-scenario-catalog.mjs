import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogOf, filterScenarios, scenariosForNode } from './src/scenarioCatalog.ts';
import { readRoute, routeHash } from './src/navigation.ts';
import { adaptPublication } from './src/model.ts';
import { searchPublication } from './src/search.ts';
const catalog={value_streams:[{id:'v',label_fr:'Recevoir des produits',name:'Receive Products',value:'Produits obtenus',beneficiary:'Client',boundary:'Livraison'}],scenarios:[{id:'s',title:'Livraison partielle',situation:'Stock partiel',objective:'Livrer',trigger:'Commande',value_stream_ids:['v','w'],events:['shortage'],objects:['order'],situations:['exception']}],paths:[{id:'p',scenario_id:'s',steps:[{description:'Expédier',contributions:[{node_id:'c',role:'Préparer'}]}]}],legacy_links:[]};
const model=()=>adaptPublication({space:'release',version:'fixture',nodes:[{id:'d',kind:'domain',fields:{name:'Supply'}},{id:'c',kind:'capability',fields:{name:'Preparation'}}],relations:[{id:'r',type:'contains',source_id:'d',target_id:'c'}],scenario_catalog:catalog});
test('catalog filters intersect, keep unique scenarios and do not infer historical data',()=>{
 assert.equal(filterScenarios(catalog,{stream:'v',event:'shortage',capability:'c'}).length,1);
 assert.equal(filterScenarios(catalog,{stream:'w'}).length,1);
 assert.equal(filterScenarios(catalog,{event:'other'}).length,0);
 assert.equal(catalogOf({raw:{}}),undefined);
});
test('scenario links derive from explicit contributions in same snapshot',()=>{
 assert.equal(scenariosForNode(model(),'c').length,1);
 assert.equal(scenariosForNode(model(),'d').length,1);
 assert.equal(scenariosForNode(model(),'absent').length,0);
});
test('search returns a unique scenario and a value stream, never review metadata',()=>{
 const m=model();assert.equal(searchPublication(m,'Livraison partielle').filter(r=>r.kind==='scenario').length,1);
 assert.equal(searchPublication(m,'Recevoir des produits')[0].kind,'value_stream');
});
test('deep links pin version, path, origin and filters across reload',()=>{
 const route=readRoute('#version=fixed&view=scenarios&scenario=s&path=p&node=c&event=shortage');
 assert.equal(route.scenario,'s');assert.equal(route.path,'p');assert.equal(route.node,'c');
 assert.deepEqual(readRoute(routeHash(route)),route);
 assert.ok(!routeHash({...route,view:'sheet'}).includes('scenario='));
});
