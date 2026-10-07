/** In-memory acceptance preview; never writes publications or served data. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

export async function candidateFixture(dist) {
  const root=resolve(import.meta.dirname,'..');
  const generated=spawnSync(process.env.ATLAS_PYTHON||'python',['-X','utf8','-c',
    "import json; from pathlib import Path; from scripts.structured_io import read; from scripts.publish_release import compile_snapshot; from scripts.guide_candidate import load_draft; m=read(Path('modeles/backlog/model.yaml')); m['glossary']=read(Path('modeles/backlog/glossary.yaml')); print(json.dumps({'model':compile_snapshot(m,{'decisions':[]},'2026-10-07.999',[]),'guide':load_draft(Path.cwd(),Path('modeles/backlog/atlas-transformation-methodology.yaml'))},ensure_ascii=True))"],
    {cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:30*1024*1024});
  assert.equal(generated.status,0,generated.stderr);
  const candidate=JSON.parse(generated.stdout),raw=candidate.model,version=raw.version;
  const index=JSON.parse(await readFile(resolve(dist,'data/index.json'),'utf8'));
  const current=index.current_version,entry=structuredClone(index.versions.find(x=>x.version===current));
  const bytes=Buffer.from(JSON.stringify(raw));
  const response=JSON.parse(await readFile(resolve(dist,`data/${current}/guide.json`),'utf8'));
  response.publication_version=version;response.guide=candidate.guide;
  const guideBytes=Buffer.from(JSON.stringify(response));
  entry.version=version;
  entry.model_sha256=createHash('sha256').update(bytes).digest('hex');
  entry.guide_sha256=createHash('sha256').update(guideBytes).digest('hex');
  index.versions.push(entry);index.current_version=version;
  return {index,version,bytes,guideBytes,raw};
}
