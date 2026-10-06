"""Shared validation for market comparisons on nodes and business glossary terms."""
from datetime import date
from functools import lru_cache
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

try:
    from .json_contract import validate
except ImportError:
    from json_contract import validate

@lru_cache(maxsize=2)
def contract(name='marketComparisons'):
    path = Path(__file__).resolve().parents[1] / 'modeles/schemas/urbanism.schema.json'
    return json.loads(path.read_text(encoding='utf-8'))['$defs'][name]

def validate_comparisons(value, label):
    errors = [label + ': ' + error for error in validate(value, contract())]
    if errors:
        return errors
    for index, entry in enumerate(value):
        try:
            date.fromisoformat(entry['consulted_on'])
        except ValueError:
            errors.append(f'{label}/{index}: invalid consultation date')
    return errors

def validate_inspiration(value, entries, label):
    """The optional editorial view requires complete, explicitly authored rows."""
    errors = [label + ': ' + error for error in validate(value, contract('marketInspiration'))]
    if not isinstance(entries, list) or not entries:
        errors.append(label + ': market_comparisons required for the inspiration table')
        return errors
    for index, entry in enumerate(entries):
        for field in ('concept_name', 'scope_summary', 'approach_summary'):
            text = entry.get(field) if isinstance(entry, dict) else None
            if not isinstance(text, str) or not text.strip():
                errors.append(f'{label}/market_comparisons/{index}/{field}: nonempty summary required')
    return errors

def document_key(url):
    """An anchor, tracking query or alternate HTTP scheme is not another document."""
    parsed = urlsplit(url)
    return (parsed.netloc.lower(), parsed.path.rstrip('/'))

def validate_reference_policy(model):
    # Historical snapshots keep their original contract. New candidates opt in.
    if model.get('market_reference_policy') == 'microsoft_sap_or_gap_v1':
        return validate_vendor_policy(model)
    if model.get('market_reference_policy') != 'two_primary_sources':
        return []
    records = [(item['id'], item.get('fields', {}).get('market_comparisons', []))
               for item in model.get('nodes', []) + model.get('relations', [])
               if item.get('review', {}).get('state') != 'illustration']
    records += [('glossary/' + term['id'], term.get('market_comparisons', []))
                for term in model.get('glossary', {}).get('terms', [])]
    errors = []
    for label, entries in records:
        if entries and len({document_key(e.get('source_url', '')) for e in entries
                            if isinstance(e, dict) and e.get('source_url')}) < 2:
            errors.append(label + '/market_comparisons: at least two distinct primary source documents required')
    return errors


REFERENCE_FAMILIES = ('microsoft_dynamics', 'sap_s4hana')


def reference_family(entry):
    """Recognize product evidence, not its semantic adequacy (an authored comparison)."""
    url = urlsplit(entry.get('source_url', ''))
    vendor = entry.get('vendor', '').lower()
    if url.scheme != 'https':
        return None
    if vendor == 'microsoft' and url.hostname == 'learn.microsoft.com' and '/dynamics365/' in url.path:
        return 'microsoft_dynamics'
    if vendor == 'sap' and url.hostname in ('help.sap.com', 'learning.sap.com', 'www.sap.com'):
        if re.search(r's[ /_-]?4[ /_-]?hana', entry.get('product', '') + ' ' + url.path, re.I):
            return 'sap_s4hana'
    return None


def validate_vendor_policy(model):
    records = [(n['id'], n.get('fields', {})) for n in model.get('nodes', [])
               if n.get('review', {}).get('state') != 'illustration']
    records += [(r['id'], r.get('fields', {})) for r in model.get('relations', [])
                if r.get('fields', {}).get('market_comparisons')]
    records += [('glossary/' + t['id'], t) for t in model.get('glossary', {}).get('terms', [])
                if t.get('market_comparisons') or t.get('market_gaps')]
    errors = []
    for label, fields in records:
        entries = fields.get('market_comparisons', [])
        families = {reference_family(e) for e in entries if isinstance(e, dict)}
        gaps = fields.get('market_gaps', [])
        if not isinstance(gaps, list):
            errors.append(label + ': market_gaps must be a list')
            continue
        declared = set()
        for gap in gaps:
            family = gap.get('family') if isinstance(gap, dict) else None
            if family not in REFERENCE_FAMILIES or family in declared or family in families:
                errors.append(label + ': unknown, duplicate or obsolete market gap')
            if isinstance(family, str):
                declared.add(family)
            if not isinstance(gap, dict) or not all(gap.get(k) for k in ('reason', 'investigated_urls', 'source_refs')):
                errors.append(label + ': market gap requires reason, investigated sources and provenance')
        for family in REFERENCE_FAMILIES:
            if family not in families and family not in declared:
                errors.append(f'{label}: missing {family} primary product evidence or explicit market gap')
    return errors
