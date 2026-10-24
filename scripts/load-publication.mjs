// Tools and fixtures use the same verified YAML/legacy JSON reader as Python.
// No second YAML dependency or editable JSON copy is introduced in the browser.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultRepoRoot = fileURLToPath(new URL('../', import.meta.url));
const run = promisify(execFile);
export async function loadPublication({ repoRoot = defaultRepoRoot, version, reader = true } = {}) {
  const bundled = process.env.USERPROFILE && path.join(process.env.USERPROFILE,
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
  const python = process.env.ATLAS_PYTHON || (bundled && existsSync(bundled) ? bundled : 'python');
  const args = ['-X', 'utf8', path.join(defaultRepoRoot, 'scripts/export_publication.py'), '--root', repoRoot];
  if (version) args.push('--version', version);
  if (reader) args.push('--reader');
  const { stdout } = await run(python, args, { windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  return JSON.parse(stdout);
}
