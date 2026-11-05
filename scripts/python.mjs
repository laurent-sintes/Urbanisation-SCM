import { spawnSync } from 'node:child_process';
import { pythonRuntime } from './python-runtime.mjs';

const python = pythonRuntime();
const result = spawnSync(python.command, process.argv.slice(2), {
  stdio: 'inherit', windowsHide: true, env: python.env,
});
process.exit(result.status ?? 1);
