"""Versioned methodology guides, explicitly associated with a publication.

The guide owns frozen editorial content and source excerpts. It never reads the
business backlog or resolves a live source, and cannot change a model response.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts.release_catalog import resolve_release
from scripts.structured_io import loads

VERSION = re.compile(r"\d{4}-\d{2}-\d{2}\.[1-9]\d*\Z")
SCENES = {"comparison", "decomposition", "dependency", "responsibilities", "objects", "evidence"}


class ModelingGuideError(ValueError):
    """A guide or its publication cannot be safely and faithfully read."""


def _require(condition, message="Structure du guide invalide."):
    if not condition:
        raise ModelingGuideError(message)


def _texts(value, *fields):
    _require(isinstance(value, dict))
    for field in fields:
        _require(isinstance(value.get(field), str) and bool(value[field].strip()))


def _read(folder: Path, relative: str, sha256: str | None = None):
    # Only these two shapes are accepted; no arbitrary path, symlink or junction.
    _require(relative == "index.yaml" or bool(re.fullmatch(r"versions/\d{4}-\d{2}-\d{2}\.[1-9]\d*\.yaml", relative)),
             "Chemin de guide non autorisé.")
    path = folder / relative
    _require(folder.resolve() == folder and path.resolve() == path, "Chemin de guide non autorisé.")
    content = path.read_bytes()
    if sha256 is not None:
        _require(bool(re.fullmatch(r"[a-f0-9]{64}", sha256)), "Empreinte de guide invalide.")
        _require(hashlib.sha256(content).hexdigest() == sha256, "L’empreinte du guide ne correspond pas au fichier.")
    # Parse exactly the bytes whose hash was checked.
    return loads(content.decode("utf-8-sig"), ".yaml")


def _validate_guide(guide, version):
    _texts(guide, "id", "version", "as_of", "title", "subtitle")
    _require(guide["version"] == version, "La version du guide ne correspond pas à son association.")
    _require(isinstance(guide.get("sources"), list) and bool(guide["sources"]))
    source_ids = set()
    for source in guide["sources"]:
        _texts(source, "id", "title", "excerpt", "scope")
        _require(source["id"] not in source_ids, "Source de guide dupliquée.")
        source_ids.add(source["id"])

    def refs(value):
        _require(isinstance(value, list) and bool(value))
        _require(all(isinstance(item, str) and item in source_ids for item in value), "Source de guide non résolue.")

    refs(guide.get("source_refs"))
    if 'chapters' in guide:
        chapters = guide['chapters']
        _require(isinstance(chapters, list) and len(chapters) in (4, 8), 'Rubriques de méthode invalides.')
        _require([c.get('id') for c in chapters if isinstance(c, dict)] ==
                 (['start', 'metamodel', 'method', 'references'] if len(chapters) == 4 else
                  ['start', 'explore', 'decisions', 'transform', 'sustain', 'metamodel', 'method', 'references']), 'Ordre des rubriques invalide.')
        for chapter in chapters:
            _texts(chapter, 'id', 'title', 'intro')
            if 'visual' in chapter:
                visual = chapter['visual']
                _texts(visual, 'kind', 'title', 'description', 'center')
                _require(visual['kind'] in ('dimensions', 'governance'), 'Schéma de méthode invalide.')
                _require(isinstance(visual.get('items'), list) and
                         len(visual['items']) == (6 if visual['kind'] == 'dimensions' else 3) and
                         all(isinstance(item, str) and item.strip() for item in visual['items']),
                         'Éléments de schéma invalides.')
                if 'overview_svg' in visual:
                    _texts(visual, 'overview_svg')
                    svg = visual['overview_svg']
                    _require('<!DOCTYPE' not in svg.upper() and '<!ENTITY' not in svg.upper(), 'SVG autonome requis.')
                    try:
                        tree = ET.fromstring(svg)
                    except ET.ParseError as error:
                        raise ModelingGuideError('SVG invalide.') from error
                    allowed = {'svg', 'title', 'desc', 'defs', 'style', 'marker', 'path', 'rect', 'text', 'tspan', 'g', 'line', 'circle'}
                    _require(tree.tag == '{http://www.w3.org/2000/svg}svg', 'SVG invalide.')
                    for element in tree.iter():
                        _require(element.tag in {'{http://www.w3.org/2000/svg}' + tag for tag in allowed}, 'Élément SVG interdit.')
                        _require(all(not key.lower().startswith('on') and key not in ('href', '{http://www.w3.org/1999/xlink}href') for key in element.attrib), 'Attribut SVG interdit.')
                    _require(not re.search(r'@import|https?:|javascript:|data:', svg.replace('http://www.w3.org/2000/svg', ''), re.I), 'Ressource SVG externe interdite.')
                    _require(all(value.strip().startswith('#') for value in re.findall(r'url\(([^)]+)\)', svg)), 'Ressource SVG externe interdite.')
            _require(isinstance(chapter.get('sections'), list) and bool(chapter['sections']))
            for section in chapter['sections']:
                _texts(section, 'title', 'text')
                for field in ('example', 'detail', 'url'):
                    if field in section:
                        _texts(section, field)
                if 'url' in section:
                    url = urlparse(section['url'])
                    _require(url.scheme == 'https' and bool(url.hostname), 'Lien de référence invalide.')
    if 'glossary' in guide:
        glossary = guide['glossary']
        _require(isinstance(glossary, dict) and isinstance(glossary.get('terms'), list)
                 and isinstance(glossary.get('model_term_ids'), list), 'Glossaire du méta modèle invalide.')
        ids = set()
        for term in glossary['terms']:
            _texts(term, 'id', 'name', 'definition')
            if 'short_description' in term:
                _texts(term, 'short_description')
            _require(bool(re.fullmatch(r'MOD\d+', term['id'])) and term['id'] not in ids, 'Identité de terme méthodologique invalide.')
            ids.add(term['id'])
            if 'examples' in term:
                _require(isinstance(term['examples'], list) and all(isinstance(value, str) for value in term['examples']))
            if 'notes' in term:
                _require(isinstance(term['notes'], list) and all(isinstance(value, str) for value in term['notes']))
            if 'editorial_notes' in term:
                _require(isinstance(term['editorial_notes'], list) and all(isinstance(value, str) for value in term['editorial_notes']))
        _require(all(isinstance(value, str) and bool(re.fullmatch(r'TER\d+', value)) for value in glossary['model_term_ids']))
        _require(len(set(glossary['model_term_ids'])) == len(glossary['model_term_ids']), 'Classement lexical dupliqué.')
        aliases = glossary.get('aliases', {})
        _require(isinstance(aliases, dict) and all(k in glossary['model_term_ids'] and v in ids for k, v in aliases.items()), 'Renvoi méthodologique invalide.')
        groups = glossary.get('groups', [])
        grouped = []
        for group in groups:
            _texts(group, 'id', 'label')
            _require(isinstance(group.get('term_ids'), list), 'Groupe méthodologique invalide.')
            grouped.extend(group['term_ids'])
        for term in glossary['terms']:
            if 'parent_term' in term:
                _require(term['parent_term'] in ids and term['parent_term'] != term['id'], 'Type méthodologique non résolu.')
            if 'guide_section' in term:
                _require(term['guide_section'] in ('method', 'codes'), 'Destination méthodologique invalide.')
            if 'values' in term:
                _require(isinstance(term['values'], dict) and all(isinstance(k, str) and isinstance(v, str) and k.strip() and v.strip() for k, v in term['values'].items()), 'Valeurs méthodologiques invalides.')
        if groups:
            visible = {t['id'] for t in glossary['terms'] if t.get('status') != 'retired' and not t.get('parent_term') and not t.get('guide_section')} | (set(glossary['model_term_ids']) - set(aliases))
            _require(len(set(grouped)) == len(grouped) and set(grouped) == visible, 'Groupes méthodologiques incomplets ou dupliqués.')
        def method_links(value):
            if isinstance(value, str):
                for chapter_id, section in re.findall(r'\]\(guide:([^#)]+)(?:#([^)]*))?\)', value):
                    chapter = next((c for c in guide.get('chapters', []) if c['id'] == chapter_id), None)
                    _require(chapter is not None, 'Rubrique méthodologique non résolue : ' + chapter_id)
                    if section:
                        match = re.fullmatch(r'method-section-(\d+)', section)
                        _require(match is not None and int(match[1]) < len(chapter['sections']), 'Section méthodologique non résolue : ' + section)
                for ident in re.findall(r'\]\(method:([^)#]+)(?:#[^)]*)?\)', value):
                    _require(ident in ids, 'Notion méthodologique non résolue : ' + ident)
            elif isinstance(value, list):
                for item in value:
                    method_links(item)
            elif isinstance(value, dict):
                for item in value.values():
                    method_links(item)
        method_links(guide.get('chapters', []))
        method_links(glossary.get('terms', []))
        method_links(guide.get('lessons', []))
    _require(isinstance(guide.get("lessons"), list) and len(guide["lessons"]) == 6)
    lesson_ids = set()
    for lesson in guide["lessons"]:
        _texts(lesson, "id", "label", "title", "rule", "established_at", "question", "explanation")
        _require(lesson["id"] not in lesson_ids, "Clé de guide dupliquée.")
        lesson_ids.add(lesson["id"])
        scene = lesson.get("scene")
        _texts(scene, "kind", "caption")
        _require(scene["kind"] in SCENES)
        for field in ("parent", "connector"):
            if field in scene:
                _texts(scene, field)
        _require(isinstance(scene.get("items"), list) and bool(scene["items"]))
        for item in scene["items"]:
            _texts(item, "label", "text")
        if "variants" in scene:
            _require(scene["kind"] == "comparison" and isinstance(scene["variants"], list) and bool(scene["variants"]))
            variant_ids = set()
            for variant in scene["variants"]:
                _texts(variant, "id", "label", "description")
                _require(variant["id"] not in variant_ids)
                variant_ids.add(variant["id"])
                _require(isinstance(variant.get("realizations"), list) and bool(variant["realizations"]))
                for realization in variant["realizations"]:
                    _texts(realization, "label")
                    indexes = realization.get("capability_indexes")
                    _require(isinstance(indexes, list) and bool(indexes))
                    _require(all(type(index) is int and 0 <= index < len(scene["items"]) for index in indexes))
        _require(isinstance(lesson.get("choices"), list) and len(lesson["choices"]) == 2)
        for choice in lesson["choices"]:
            _texts(choice, "label", "feedback")
        contributor = lesson.get("contributor")
        _texts(contributor, "criterion", "boundary", "scope")
        refs(contributor.get("source_refs"))
        _require(isinstance(lesson.get("model_links"), list))
        for link in lesson["model_links"]:
            _texts(link, "id", "label")
    return guide


def load_modeling_guide(root=REPOSITORY_ROOT, version=None):
    """Read only the association for the exact, verified publication selected.

    A known publication without an association is a normal unavailable result.
    Unknown publications or invalid guide files fail this endpoint exclusively.
    """
    root = Path(root).resolve()
    if version is not None and (not isinstance(version, str) or not VERSION.fullmatch(version)):
        raise ValueError("Version de publication invalide.")
    try:
        publication = resolve_release(root / "modeles/release", version)
    except (ValueError, KeyError, TypeError, OSError) as exc:
        raise ModelingGuideError("Publication inconnue ou non vérifiable pour ce guide.") from exc
    return _load_associated_guide(root, publication['version'])


def _load_associated_guide(root, publication_version):
    """Internal bulk-export path, called only after verifying the publication.

    The public loader above always resolves and verifies a selected publication.
    This helper keeps all association, guide hash and guide content checks.
    """
    response = {
        "schema_version": "1.0.0", "publication_version": publication_version,
        "status": "unavailable", "message": "Aucun guide n’est associé à cette publication.",
    }
    folder = root / "modeles/modeling-guides"
    if not (folder / "index.yaml").exists():
        return response
    try:
        index = _read(folder, "index.yaml")
        _require(isinstance(index, dict) and index.get("schema_version") == "1.0.0")
        _require(isinstance(index.get("guides"), list) and isinstance(index.get("associations"), list))
        guides = {}
        for item in index["guides"]:
            _texts(item, "version", "path", "sha256")
            _require(bool(VERSION.fullmatch(item["version"])) and item["version"] not in guides)
            _require(item["path"] == "versions/" + item["version"] + ".yaml", "Chemin de guide non autorisé.")
            guides[item["version"]] = item
        associations = {}
        for item in index["associations"]:
            _texts(item, "publication_version", "guide_version", "scope", "note")
            _require(bool(VERSION.fullmatch(item["publication_version"])) and item["publication_version"] not in associations)
            _require(item["guide_version"] in guides, "Guide associé absent de l’index.")
            associations[item["publication_version"]] = item
        association = associations.get(publication_version)
        if association is None:
            return response
        entry = guides[association["guide_version"]]
        guide = _validate_guide(_read(folder, entry["path"], entry["sha256"]), entry["version"])
        return {
            **response, "status": "available", "message": "Guide méthodologique associé à cette publication.",
            "association": {key: association[key] for key in ("scope", "note")}, "guide": guide,
        }
    except ModelingGuideError:
        raise
    except (ValueError, KeyError, TypeError, OSError, UnicodeError) as exc:
        raise ModelingGuideError("Le guide associé est indisponible ou invalide.") from exc
