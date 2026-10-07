"""Read retired artifacts from exact Git commits; never restore a shadow tree."""
import json
from pathlib import Path
import re
import subprocess
import os
from functools import lru_cache
from contextlib import contextmanager
from contextvars import ContextVar

_batch = ContextVar('git_blob_batch', default=None)


@contextmanager
def batch_reader(root):
    """One Git process per operation; each blob still names an exact commit."""
    root = str(Path(root).resolve())
    active = _batch.get()
    if active is not None and active[0] == root:
        yield
        return
    process = subprocess.Popen(['git', '-C', root, 'cat-file', '--batch'],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                               creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    token = _batch.set((root, process))
    try:
        yield
    finally:
        _batch.reset(token)
        process.stdin.close()
        process.stdout.close()
        process.wait()

INDEX = 'modeles/git-history.json'


def git(root, *args):
    result = subprocess.run(['git', '-C', str(root), *args], capture_output=True)
    if result.returncode:
        raise ValueError('Git history unavailable: ' + result.stderr.decode('utf-8', 'replace').strip())
    return result.stdout


@lru_cache(maxsize=8)
def blob(root, commit, relative):
    if not re.fullmatch(r'[a-f0-9]{40,64}', commit):
        raise ValueError('History requires an exact Git commit')
    if relative.startswith('/') or any(p in ('', '.', '..') for p in relative.split('/')) or any(c in relative for c in ('\\', ':', '\0', '\n', '\r')):
        raise ValueError('Invalid Git artifact path')
    active = _batch.get()
    if active is not None and active[0] == str(Path(root).resolve()):
        process = active[1]
        process.stdin.write((commit + ':' + relative + '\n').encode('utf-8'))
        process.stdin.flush()
        header = process.stdout.readline().split()
        if len(header) != 3 or header[1] != b'blob' or not header[2].isdigit():
            raise ValueError('Git history unavailable: ' + relative)
        content = process.stdout.read(int(header[2]))
        if len(content) != int(header[2]) or process.stdout.read(1) != b'\n':
            raise ValueError('Incomplete Git artifact: ' + relative)
        return content
    return git(root, 'show', commit + ':' + relative)


def read_bytes(path):
    path = Path(path).resolve()
    if path.is_file():
        return path.read_bytes()
    for root in path.parents:
        index = root / INDEX
        if index.is_file():
            relative = path.relative_to(root).as_posix()
            records = json.loads(index.read_text(encoding='utf-8'))['archives']
            matches = [r for r in records if relative == r['path'] or relative.startswith(r['path'].rstrip('/') + '/')]
            if not matches:
                break
            record = max(matches, key=lambda r: len(r['path']))
            return blob(str(root), record['commit'], relative)
    raise FileNotFoundError(path)


def enabled(root):
    return (Path(root) / INDEX).is_file()
