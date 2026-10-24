"""Check resource ownership in the Python parts of the Atlas reader."""
import ast
from pathlib import Path
import re
try:
    from .atlas_reader_content import verify_legacy_inputs
    from .atlas_text import load_resources
except ImportError:
    from atlas_reader_content import verify_legacy_inputs
    from atlas_text import load_resources

ROOT = Path(__file__).resolve().parents[1]
FILES = ('app/server.py', 'app/modeling_guide.py', 'scripts/atlas_metamodel.py',
         'scripts/atlas_documentation.py', 'scripts/atlas_workshop.py')


def check(root=ROOT):
    resources = load_resources(root)
    errors = []
    try:
        verify_legacy_inputs(root, required=True)
    except ValueError as error:
        errors.append(str(error))
    for relative in FILES:
        tree = ast.parse((root / relative).read_text('utf-8-sig'))
        docs = {id(node.body[0].value) for node in ast.walk(tree)
                if isinstance(node, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))
                and node.body and isinstance(node.body[0], ast.Expr)}
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, str) and id(node) not in docs:
                value = node.value
                technical = value.startswith(('http', 'application/', 'text/', 'default-src', 'style-src', 'img-src', 'object-src'))
                if not technical and (re.search('[À-ÿ’]', value) or re.search(r'[A-Za-z] [A-Za-z]', value)):
                    errors.append(f'{relative}:{node.lineno}: embedded reader text: {value}')
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in {
                    'ui_text', 'ReaderError', 'StageConflictError', 'SourceAccessError'} and node.args and isinstance(node.args[0], ast.Constant):
                key = node.args[0].value
                if key not in resources:
                    errors.append(f'{relative}:{node.lineno}: unknown resource: {key}')
                    continue
                value = resources[key]
                templates = value.values() if isinstance(value, dict) else [value]
                expected = set(re.findall(r'(?<!\{)\{([\w$]+)\}(?!\})', ''.join(templates)))
                if isinstance(value, dict):
                    expected.add('count')
                if expected != {keyword.arg for keyword in node.keywords}:
                    errors.append(f'{relative}:{node.lineno}: resource parameters differ: {key}')
    return errors


if __name__ == '__main__':
    failures = check()
    for failure in failures:
        print(failure)
    raise SystemExit(bool(failures))
