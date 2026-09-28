import test from 'node:test';
import assert from 'node:assert/strict';
import {buildHasChanged} from './src/buildUpdate.ts';

test('software updates are detected independently of changing published content',()=>{
 const assets=['assets/index-old.js','assets/index-old.css'];
 const manifest={schema_version:1,current_version:'v2',files:{'index.html':'hash','assets/index-old.js':'hash','assets/index-old.css':'hash'}};
 assert.equal(buildHasChanged(manifest,assets),false);
 assert.equal(buildHasChanged({...manifest,current_version:'v3'},assets),false);
 delete manifest.files['assets/index-old.js'];manifest.files['assets/index-new.js']='hash';
 assert.equal(buildHasChanged(manifest,assets),true);
 assert.equal(buildHasChanged(null,assets),false);
 assert.equal(buildHasChanged({schema_version:1,files:{}},assets),false);
});
