"""Read a verified publication from disk and serialize it to JSON on stdout."""
import argparse
import json
from pathlib import Path
try:
    from .release_catalog import resolve_release, within
    from .structured_io import read
except ImportError:
    from release_catalog import resolve_release, within
    from structured_io import read


def export(root, version=None, *, reader=False):
    root = Path(root).resolve()
    folder = root / 'modeles/release'
    descriptor = resolve_release(folder, version)
    source = within(folder, descriptor['path'])
    raw = read(source)
    source_path = source.relative_to(root).as_posix()
    result = {**raw, 'sourcePath': source_path}
    if reader:
        import sys
        code_root = str(Path(__file__).resolve().parents[1])
        if code_root not in sys.path:
            sys.path.insert(0, code_root)
        from app.modeling_guide import _load_associated_guide
        from scripts.atlas_metamodel import describe_metamodel
        from scripts.atlas_documentation import separate_documentation
        from scripts.atlas_reader_content import reading_projection, reader_vocabulary, presentation_profile, application_contexts
        guide = _load_associated_guide(root, raw['version'])
        documentation, _ = separate_documentation(guide, raw)
        result['metamodel'] = describe_metamodel(raw, guide)
        result['metamodel']['vocabulary'] = reader_vocabulary(root, raw, guide)
        if documentation:
            result['metamodel']['documentation'] = documentation
        result['presentation'] = presentation_profile(root, raw)
        projection = reading_projection(root, raw, guide)
        if projection is not None:
            result['reader_projection'] = projection
        if raw.get('application_catalog'):
            result['application_catalog'] = {**raw['application_catalog'], 'contexts': application_contexts(root, raw)}
    return {'raw': result, 'descriptor': descriptor,
            'sourcePath': source_path,
            'descriptorPath': 'modeles/release/' + descriptor['descriptor'] if descriptor.get('descriptor') else None}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--version')
    parser.add_argument('--reader', action='store_true')
    args = parser.parse_args()
    print(json.dumps(export(args.root, args.version, reader=args.reader), ensure_ascii=True, allow_nan=False))
