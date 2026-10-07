import test from 'node:test';
import assert from 'node:assert/strict';
import {adaptPublication, scopeStatistics} from './src/model.ts';

function fixture() {
  const nodes = [['domain','domain'],['sub','area'],['a','business_area'],['b','business_area'],['c1','capability'],['c2','capability'],['h1','behavior'],['h2','behavior'],['outside','capability']].map(([id,kind])=>({id,kind,fields:{name:id}}));
  const relations = [['domain','sub'],['sub','a'],['sub','b'],['a','c1'],['b','c2'],['c1','h1'],['c1','h2']].map(([source_id,target_id],i)=>({id:`r${i}`,type:'contains',source_id,target_id}));
  relations.push({id:'dependency',type:'depends_on',source_id:'c1',target_id:'outside'});
  return {space:'release',version:'test',nodes,relations};
}
const stats = (model,id) => scopeStatistics(model,model.nodeById.get(id));
test('header totals traverse all contained levels and exclude dependencies and the object itself',()=>{
  const model=adaptPublication(fixture());
  assert.deepEqual(stats(model,'sub'),[
    {kind:'business_area',count:2,label:'Business Areas'},
    {kind:'capability',count:2,label:'capacités'},
    {kind:'behavior',count:2,label:'comportements'},
  ]);
  assert.equal(stats(model,'domain')[0].count,1);
  assert.deepEqual(stats(model,'c1'),[{kind:'behavior',count:2,label:'comportements'}]);
  assert.deepEqual(stats(model,'h1'),[]);
});
test('singletons and zero behaviors remain readable',()=>{
  const model=adaptPublication(fixture());
  assert.deepEqual(stats(model,'b'),[{kind:'capability',count:1,label:'capacité'},{kind:'behavior',count:0,label:'comportements'}]);
});
test('historical publications do not inherit Business Areas from newer publications',()=>{
  const raw=fixture();
  raw.nodes=raw.nodes.filter(n=>n.kind!=='business_area');
  raw.relations=raw.relations.filter(r=>!['a','b'].includes(r.target_id)).map(r=>({...r,source_id:['a','b'].includes(r.source_id)?'sub':r.source_id}));
  const historical=adaptPublication(raw);
  assert.deepEqual(stats(historical,'sub').map(x=>x.kind),['capability','behavior']);
  assert.equal(stats(adaptPublication(fixture()),'sub')[0].kind,'business_area');
});
test('scope statistics keep the hierarchy vocabulary of the selected publication',()=>{
  for (const [principle,singular,plural] of [
    ['PRINCIPLE-DOMAIN-SUBDOMAIN','sous-domaine','sous-domaines'],
    ['PRINCIPLE-DOMAIN-PURPOSE','Purpose','Purposes'],
    [undefined,'Area','Areas'],
  ]) {
    const raw=fixture();
    raw.principles=principle?[{id:principle}]:[];
    assert.deepEqual(stats(adaptPublication(raw),'domain').find(item=>item.kind==='area'),
      {kind:'area',count:1,label:singular});
    raw.nodes.push({id:'sub2',kind:'area',fields:{name:'second area'}});
    raw.relations.push({id:'second-area',type:'contains',source_id:'domain',target_id:'sub2'});
    assert.deepEqual(stats(adaptPublication(raw),'domain').find(item=>item.kind==='area'),
      {kind:'area',count:2,label:plural});
  }
});
