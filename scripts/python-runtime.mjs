import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join } from 'node:path';
import { delimiter } from 'node:path';

export function pythonRuntime() {
  const candidates = ['python', 'python3'];
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    candidates.push(join(process.env.LOCALAPPDATA, 'Python', 'bin', 'python.exe'));
  }
  if (process.platform === 'win32' && process.env.USERPROFILE) {
    candidates.push(join(process.env.USERPROFILE, 'AppData', 'Local', 'Python', 'bin', 'python.exe'));
  }
  const command = candidates.find((candidate) => {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8', windowsHide: true });
    const version = /^Python 3\.(\d+)/.exec(probe.stdout || probe.stderr || '');
    return probe.status === 0 && version && Number(version[1]) >= 12;
  });
  if (!command) throw new Error('Python 3.12 ou supérieur est nécessaire pour FLOW Atlas.');
  return {
    command,
    env: {
      ...process.env,
      PYTHONUTF8: '1',
      ...(isAbsolute(command) ? { PATH: dirname(command) + delimiter + process.env.PATH } : {}),
    },
  };
}
