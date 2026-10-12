"""Fingerprint the transitive local imports of a tool, not unrelated scripts."""
import ast
from hashlib import sha256
from pathlib import Path


def dependency_files(root, seeds):
    root = Path(root).resolve()
    pending = [root / seed for seed in seeds]
    seen = set()
    while pending:
        path = pending.pop().resolve()
        if path in seen or not path.is_file() or not path.is_relative_to(root):
            continue
        seen.add(path)
        tree = ast.parse(path.read_bytes(), filename=str(path))
        for node in ast.walk(tree):
            names = []
            base = root
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                if node.level:
                    base = path.parent
                    for _ in range(node.level - 1):
                        base = base.parent
                prefix = node.module or ''
                names = [prefix] + [prefix + ('.' if prefix else '') + a.name for a in node.names]
            for name in names:
                if not name or '*' in name:
                    continue
                parts = name.split('.')
                # Also track package initialization, which can change import behavior.
                for directory in (base, path.parent) if base == root else (base,):
                    pending.append(directory.joinpath(*parts).with_suffix('.py'))
                    for count in range(1, len(parts) + 1):
                        pending.append(directory.joinpath(*parts[:count], '__init__.py'))
    return sorted(seen)


def signature(root, seeds, salt=b''):
    root = Path(root).resolve()
    digest = sha256(salt)
    for path in dependency_files(root, seeds):
        digest.update(path.relative_to(root).as_posix().encode())
        digest.update(sha256(path.read_bytes()).digest())
    return digest.hexdigest()
