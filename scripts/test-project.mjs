import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pythonRuntime } from './python-runtime.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const python = pythonRuntime();
const result = spawnSync(python.command, ['scripts/project_tests.py', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  windowsHide: true,
  env: python.env,
});
process.exit(result.status ?? 1);
