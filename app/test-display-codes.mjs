import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptPublication, childrenOf, rootsOf } from './src/model.ts';
import { searchPublication } from './src/search.ts';
import { routeHash, readRoute } from './src/navigation.ts';

const fixture = () => ({ space: 'release', version: '2026-09-26.99', display_policy: 'typed-tree-v1',
  nodes: [{id:'D01',kind:'area',fields:{name:'Inventory'}},{id:'D01.f',kind:'capability',fields:{name:'Tracking',nature:'action'}},{id:'D02.c',kind:'capability',fields:{name:'Reservation',nature:'action'}}],
  relations: [{id:'r1',type:'contains',source_id:'D01',target_id:'D02.c'},{id:'r2',type:'contains',source_id:'D01',target_id:'D01.f'}],
  display_index: {policy:'typed-tree-v1',roots:['D01'],children:{D01:['D01.f','D02.c'],'D01.f':[],'D02.c':[]},codes:{D01:'SUB-001','D01.f':'CAP-001','D02.c':'CAP-002'}} });

test('frozen order wins over transport order; searches and links preserve identity', () => {
  const model=adaptPublication(fixture());
  assert.deepEqual(childrenOf(model,'D01').map(n=>n.displayCode),['CAP-001','CAP-002']);
  assert.equal(rootsOf(model)[0].displayCode,'SUB-001');
  for(const query of ['CAP-002','D02.c']) assert.equal(searchPublication(model,query)[0].id,'D02.c');
  searchPublication(model,'Tracking');
  assert.equal(model.nodeById.get('D02.c').displayCode,'CAP-002');
  const route=readRoute('#version=2026-09-26.99&node=D02.c&view=sheet');
  assert.equal(readRoute(routeHash(route)).node,'D02.c');
  assert.equal(readRoute(routeHash(route)).version,'2026-09-26.99');
});

test('history without policy keeps its identifiers and previous reading order', () => {
  const raw=fixture(); delete raw.display_policy; delete raw.display_index;
  const model=adaptPublication(raw);
  assert.equal(model.nodeById.get('D02.c').displayCode,undefined);
  assert.deepEqual(childrenOf(model,'D01').map(n=>n.id),['D02.c','D01.f']);
});

test('missing, duplicated or inconsistent frozen codes and trees are refused', () => {
  const mutations=[raw=>delete raw.display_index, raw=>raw.display_index.codes['D02.c']='CAP-001',
    raw=>raw.display_index.children.D01.reverse(),raw=>raw.display_index.roots.push('D02.c'),raw=>raw.display_index.children['D02.c'].push('D01')];
  for(const mutate of mutations){const raw=fixture();mutate(raw);assert.throws(()=>adaptPublication(raw),/lecture|publication/);}
});

 test('code prefixes and mixed code/name queries find published objects without renumbering', () => {
  const model=adaptPublication(fixture());
  assert.deepEqual(searchPublication(model,'CAP-00').map(n=>n.id).sort(),['D01.f','D02.c']);
  assert.equal(searchPublication(model,'CAP-002 Reservation')[0].id,'D02.c');
  assert.deepEqual(childrenOf(model,'D01').map(n=>n.displayCode),['CAP-001','CAP-002']);
});
