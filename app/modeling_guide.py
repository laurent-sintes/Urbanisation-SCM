"""Versioned methodology guides, explicitly associated with a publication.

The guide owns frozen editorial content and source excerpts. It never reads the
business backlog or resolves a live source, and cannot change a model response.
"""

from __future__ import annotations

from scripts.atlas_text import ReaderError, text as ui_text

import hashlib
from contextlib import contextmanager
from contextvars import ContextVar
from copy import deepcopy
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
from scripts.structured_io import read as read_document

VERSION = re.compile(r"\d{4}-\d{2}-\d{2}\.[1-9]\d*\Z")
SCENES = {"comparison", "decomposition", "dependency", "responsibilities", "objects", "evidence"}
_guide_batch = ContextVar('atlas_guide_validation_batch', default=None)


@contextmanager
def guide_validation_batch():
    """Share guide validation only inside one operation; each read still checks bytes."""
    token = _guide_batch.set({})
    try:
        yield
    finally:
        _guide_batch.reset(token)


class ModelingGuideError(ValueError):
    """A guide or its publication cannot be safely and faithfully read."""


def _require(condition, message=ui_text('guideApi.structure_du_guide_invalide')):
    if not condition:
        raise ModelingGuideError(message)


def _texts(value, *fields):
    _require(isinstance(value, dict))
    for field in fields:
        _require(isinstance(value.get(field), str) and bool(value[field].strip()))


def _read(folder: Path, relative: str, sha256: str | None = None):
    # Only these two shapes are accepted; no arbitrary path, symlink or junction.
    _require(relative == "index.yaml" or bool(re.fullmatch(r"versions/\d{4}-\d{2}-\d{2}\.[1-9]\d*\.yaml", relative)),
             ui_text('guideApi.chemin_de_guide_non_autorise'))
    path = folder / relative
    _require(folder.resolve() == folder and path.resolve() == path, ui_text('guideApi.chemin_de_guide_non_autorise'))
    if sha256 is not None:
        _require(bool(re.fullmatch(r"[a-f0-9]{64}", sha256)), ui_text('guideApi.empreinte_de_guide_invalide'))
    # The structured reader checks source bytes on every call while sharing
    # parsing across the many publications associated with the same guide.
    try:
        return read_document(path, expected_sha256=sha256)
    except ValueError as error:
        raise ModelingGuideError(ui_text('guideApi.le_guide_est_invalide_ou_son_empreinte_ne_correspond_pas_au_fichi')) from error


def _validate_guide(guide, version):
    _texts(guide, "id", "version", "as_of", "title", "subtitle")
    _require(guide["version"] == version, ui_text('guideApi.la_version_du_guide_ne_correspond_pas_a_son_association'))
    if 'reader_vocabulary' in guide:
        vocabulary = guide['reader_vocabulary']
        _require(isinstance(vocabulary, dict), ui_text('guideApi.valeurs_methodologiques_invalides'))
        for group, entries in vocabulary.items():
            _require(isinstance(entries, dict), ui_text('guideApi.valeurs_methodologiques_invalides'))
            for key, entry in entries.items():
                _require(isinstance(key, str) and bool(key), ui_text('guideApi.valeurs_methodologiques_invalides'))
                if group == 'field_labels':
                    _require(isinstance(entry, str) and bool(entry.strip()), ui_text('guideApi.valeurs_methodologiques_invalides'))
                else:
                    _require(isinstance(entry, dict) and isinstance(entry.get('label'), str) and bool(entry['label'].strip()), ui_text('guideApi.valeurs_methodologiques_invalides'))
    if 'reader_content' in guide:
        content = guide['reader_content']
        _require(isinstance(content, dict) and content.get('schema_version') == 1 and isinstance(content.get('entries'), list), ui_text('guideApi.valeurs_methodologiques_invalides'))
        for entry in content['entries']:
            _require(isinstance(entry, dict) and entry.get('collection') in {'nodes', 'relations', 'terms', 'principles'}, ui_text('guideApi.valeurs_methodologiques_invalides'))
            _require(isinstance(entry.get('id'), str) and isinstance(entry.get('text'), str), ui_text('guideApi.valeurs_methodologiques_invalides'))
            _require(isinstance(entry.get('field_path'), list) and bool(entry['field_path']) and all(isinstance(key, str) and key for key in entry['field_path']), ui_text('guideApi.valeurs_methodologiques_invalides'))
            _require(isinstance(entry.get('source_sha256'), str) and re.fullmatch(r'[a-f0-9]{64}', entry['source_sha256']), ui_text('guideApi.valeurs_methodologiques_invalides'))
    _require(isinstance(guide.get("sources"), list) and bool(guide["sources"]))
    source_ids = set()
    for source in guide["sources"]:
        _texts(source, "id", "title", "excerpt", "scope")
        _require(source["id"] not in source_ids, ui_text('guideApi.source_de_guide_dupliquee'))
        source_ids.add(source["id"])

    def refs(value):
        _require(isinstance(value, list) and bool(value))
        _require(all(isinstance(item, str) and item in source_ids for item in value), ui_text('guideApi.source_de_guide_non_resolue'))

    refs(guide.get("source_refs"))
    if 'chapters' in guide:
        chapters = guide['chapters']
        _require(isinstance(chapters, list) and len(chapters) in (4, 8), ui_text('guideApi.rubriques_de_methode_invalides'))
        _require([c.get('id') for c in chapters if isinstance(c, dict)] ==
                 (['start', 'metamodel', 'method', 'references'] if len(chapters) == 4 else
                  ['start', 'explore', 'decisions', 'transform', 'sustain', 'metamodel', 'method', 'references']), ui_text('guideApi.ordre_des_rubriques_invalide'))
        for chapter in chapters:
            _texts(chapter, 'id', 'title', 'intro')
            if 'visual' in chapter:
                visual = chapter['visual']
                _texts(visual, 'kind', 'title', 'description', 'center')
                _require(visual['kind'] in ('dimensions', 'governance'), ui_text('guideApi.schema_de_methode_invalide'))
                _require(isinstance(visual.get('items'), list) and
                         len(visual['items']) == (6 if visual['kind'] == 'dimensions' else 3) and
                         all(isinstance(item, str) and item.strip() for item in visual['items']),
                         ui_text('guideApi.elements_de_schema_invalides'))
                if 'overview_svg' in visual:
                    _texts(visual, 'overview_svg')
                    svg = visual['overview_svg']
                    _require('<!DOCTYPE' not in svg.upper() and '<!ENTITY' not in svg.upper(), ui_text('guideApi.svg_autonome_requis'))
                    try:
                        tree = ET.fromstring(svg)
                    except ET.ParseError as error:
                        raise ModelingGuideError(ui_text('guideApi.svg_invalide')) from error
                    allowed = {'svg', 'title', 'desc', 'defs', 'style', 'marker', 'path', 'rect', 'text', 'tspan', 'g', 'line', 'circle'}
                    _require(tree.tag == '{http://www.w3.org/2000/svg}svg', ui_text('guideApi.svg_invalide'))
                    for element in tree.iter():
                        _require(element.tag in {'{http://www.w3.org/2000/svg}' + tag for tag in allowed}, ui_text('guideApi.element_svg_interdit'))
                        _require(all(not key.lower().startswith('on') and key not in ('href', '{http://www.w3.org/1999/xlink}href') for key in element.attrib), ui_text('guideApi.attribut_svg_interdit'))
                    _require(not re.search(r'@import|https?:|javascript:|data:', svg.replace('http://www.w3.org/2000/svg', ''), re.I), ui_text('guideApi.ressource_svg_externe_interdite'))
                    _require(all(value.strip().startswith('#') for value in re.findall(r'url\(([^)]+)\)', svg)), ui_text('guideApi.ressource_svg_externe_interdite'))
            _require(isinstance(chapter.get('sections'), list) and bool(chapter['sections']))
            for section in chapter['sections']:
                _texts(section, 'title', 'text')
                for field in ('example', 'detail', 'url'):
                    if field in section:
                        _texts(section, field)
                if 'url' in section:
                    url = urlparse(section['url'])
                    _require(url.scheme == 'https' and bool(url.hostname), ui_text('guideApi.lien_de_reference_invalide'))
    if 'glossary' in guide:
        glossary = guide['glossary']
        _require(isinstance(glossary, dict) and isinstance(glossary.get('terms'), list)
                 and isinstance(glossary.get('model_term_ids'), list), ui_text('guideApi.glossaire_du_meta_modele_invalide'))
        ids = set()
        for term in glossary['terms']:
            _texts(term, 'id', 'name', 'definition')
            if 'short_description' in term:
                _texts(term, 'short_description')
            _require(bool(re.fullmatch(r'MOD\d+', term['id'])) and term['id'] not in ids, ui_text('guideApi.identite_de_terme_methodologique_invalide'))
            ids.add(term['id'])
            if 'examples' in term:
                _require(isinstance(term['examples'], list) and all(isinstance(value, str) for value in term['examples']))
            if 'notes' in term:
                _require(isinstance(term['notes'], list) and all(isinstance(value, str) for value in term['notes']))
            if 'editorial_notes' in term:
                _require(isinstance(term['editorial_notes'], list) and all(isinstance(value, str) for value in term['editorial_notes']))
        _require(all(isinstance(value, str) and bool(re.fullmatch(r'TER\d+', value)) for value in glossary['model_term_ids']))
        _require(len(set(glossary['model_term_ids'])) == len(glossary['model_term_ids']), ui_text('guideApi.classement_lexical_duplique'))
        aliases = glossary.get('aliases', {})
        _require(isinstance(aliases, dict) and all(k in glossary['model_term_ids'] and v in ids for k, v in aliases.items()), ui_text('guideApi.renvoi_methodologique_invalide'))
        groups = glossary.get('groups', [])
        grouped = []
        for group in groups:
            _texts(group, 'id', 'label')
            _require(isinstance(group.get('term_ids'), list), ui_text('guideApi.groupe_methodologique_invalide'))
            grouped.extend(group['term_ids'])
        for term in glossary['terms']:
            if 'parent_term' in term:
                _require(term['parent_term'] in ids and term['parent_term'] != term['id'], ui_text('guideApi.type_methodologique_non_resolu'))
            if 'guide_section' in term:
                _require(term['guide_section'] in ('method', 'codes'), ui_text('guideApi.destination_methodologique_invalide'))
            if 'values' in term:
                _require(isinstance(term['values'], dict) and all(isinstance(k, str) and isinstance(v, str) and k.strip() and v.strip() for k, v in term['values'].items()), ui_text('guideApi.valeurs_methodologiques_invalides'))
        if groups:
            visible = {t['id'] for t in glossary['terms'] if t.get('status') != 'retired' and not t.get('parent_term') and not t.get('guide_section')} | (set(glossary['model_term_ids']) - set(aliases))
            _require(len(set(grouped)) == len(grouped) and set(grouped) == visible, ui_text('guideApi.groupes_methodologiques_incomplets_ou_dupliques'))
        def method_links(value):
            if isinstance(value, str):
                for chapter_id, section in re.findall(r'\]\(guide:([^#)]+)(?:#([^)]*))?\)', value):
                    chapter = next((c for c in guide.get('chapters', []) if c['id'] == chapter_id), None)
                    _require(chapter is not None, ui_text('guideApi.rubrique_methodologique_non_resolue') + chapter_id)
                    if section:
                        match = re.fullmatch(r'method-section-(\d+)', section)
                        _require(match is not None and int(match[1]) < len(chapter['sections']), ui_text('guideApi.section_methodologique_non_resolue') + section)
                for ident in re.findall(r'\]\(method:([^)#]+)(?:#[^)]*)?\)', value):
                    _require(ident in ids, ui_text('guideApi.notion_methodologique_non_resolue') + ident)
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
        _require(lesson["id"] not in lesson_ids, ui_text('guideApi.cle_de_guide_dupliquee'))
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
        raise ReaderError('guideApi.version_de_publication_invalide')
    try:
        publication = resolve_release(root / "modeles/release", version)
    except (ValueError, KeyError, TypeError, OSError) as exc:
        raise ModelingGuideError(ui_text('guideApi.publication_inconnue_ou_non_verifiable_pour_ce_guide')) from exc
    return _load_associated_guide(root, publication['version'])


def _load_associated_guide(root, publication_version):
    """Internal bulk-export path, called only after verifying the publication.

    The public loader above always resolves and verifies a selected publication.
    This helper keeps all association, guide hash and guide content checks.
    """
    response = {
        "schema_version": "1.0.0", "publication_version": publication_version,
        "status": "unavailable", "message": ui_text('guideApi.aucun_guide_n_est_associe_a_cette_publication'),
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
            _require(item["path"] == "versions/" + item["version"] + ".yaml", ui_text('guideApi.chemin_de_guide_non_autorise'))
            guides[item["version"]] = item
        associations = {}
        for item in index["associations"]:
            _texts(item, "publication_version", "guide_version", "scope", "note")
            _require(bool(VERSION.fullmatch(item["publication_version"])) and item["publication_version"] not in associations)
            _require(item["guide_version"] in guides, ui_text('guideApi.guide_associe_absent_de_l_index'))
            associations[item["publication_version"]] = item
        association = associations.get(publication_version)
        if association is None:
            return response
        entry = guides[association["guide_version"]]
        document = _read(folder, entry["path"], entry["sha256"])
        cache = _guide_batch.get()
        key = (str(folder.resolve()), entry['sha256'], entry['version'])
        if cache is not None and key in cache:
            guide = deepcopy(cache[key])
        else:
            guide = _validate_guide(document, entry["version"])
            if cache is not None:
                cache[key] = deepcopy(guide)
        return {
            **response, "status": "available", "message": ui_text('guideApi.guide_methodologique_associe_a_cette_publication'),
            "association": {key: association[key] for key in ("scope", "note")}, "guide": guide,
        }
    except ModelingGuideError:
        raise
    except (ValueError, KeyError, TypeError, OSError, UnicodeError) as exc:
        raise ModelingGuideError(ui_text('guideApi.le_guide_associe_est_indisponible_ou_invalide')) from exc
