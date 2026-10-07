import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptPublication } from './src/model.ts';
import { searchPublication } from './src/search.ts';
import { resolveGlossaryTerm, isCurrentGlossaryTerm, glossaryAliases } from './src/glossary.ts';

const term=(id,name,extra={})=>({id,name,definition:'Une notion utile.',short_description:'Notion.',source_refs:[],review:{state:'proposed'},...extra});
const fixture=terms=>adaptPublication({space:'release',version:'isolated',nodes:[],relations:[],glossary:{terms}});
test('aliases stay resolvable but search returns the canonical term once',()=>{
  const model=fixture([term('T1','Product Reference'),term('T2','Ancienne marchandise',{alias_of:'T1'}),term('T3','Marchandise retirée',{presentation:'historical'}),term('V1','Valider',{presentation:'method',guide_section:'method'})]);
  assert.equal(resolveGlossaryTerm(model.glossaryById,'T2').id,'T1');
  assert.deepEqual(model.glossary.filter(isCurrentGlossaryTerm).map(t=>t.id),['T1']);
  assert.deepEqual(glossaryAliases(model.glossary,'T1'),['Ancienne marchandise']);
  assert.deepEqual(searchPublication(model,'ancienne marchandise').map(r=>r.id),['T1']);
  assert.equal(searchPublication(model,'Valider').length,0);
  assert.equal(model.glossaryById.get('T3').definition,'Une notion utile.');
});
test('alias resolution belongs to each publication and rejects broken references',()=>{
  const old=fixture([term('T2','Ancienne marchandise')]);
  assert.equal(resolveGlossaryTerm(old.glossaryById,'T2').id,'T2');
  assert.deepEqual(searchPublication(old,'ancienne marchandise').map(r=>r.id),['T2']);
  assert.throws(()=>fixture([term('T1','Bad',{alias_of:'missing'})]),/Alias/);
  assert.throws(()=>fixture([term('T1','A',{alias_of:'T2'}),term('T2','B',{alias_of:'T1'})]),/Alias/);
  assert.throws(()=>fixture([term('T1','A',{alias_of:'T2'}),term('T2','B',{presentation:'historical'})]),/Alias/);
});
