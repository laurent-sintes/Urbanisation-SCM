"""Framing resolution is an argued credible option, independent of implementation."""
from datetime import date

STAGES = ('unassessed', 'to_explore', 'identified', 'qualifying', 'credible')
TEXTS = ('summary', 'credibility_note', 'blocked_reason', 'next_step', 'assessment_source')


def empty_resolution():
    return dict(stage='unassessed', summary='', credible_option_ids=[], credibility_note='',
                blocked_reason='', next_step='', assessment_source='')


def validate_resolution(hotspot):
    resolution = hotspot.get('resolution')
    if 'resolution' not in hotspot:
        return []  # Historical contracts retain their own meaning.
    if not isinstance(resolution, dict) or set(resolution) - set((*TEXTS, 'stage', 'credible_option_ids', 'assessed_on')):
        return ['invalid framing resolution fields']
    if resolution.get('stage') not in STAGES or any(not isinstance(resolution.get(key), str) for key in TEXTS):
        return ['invalid framing resolution stage or text']
    ids = resolution.get('credible_option_ids')
    if not isinstance(ids, list) or any(not isinstance(identifier, str) for identifier in ids):
        return ['invalid credible options']
    errors = []
    stage = resolution['stage']
    if stage != 'unassessed':
        if not resolution['summary'].strip() or not resolution['assessment_source'].strip():
            errors.append('assessed resolution requires summary and assessment source')
        try:
            assessed_on = resolution.get('assessed_on')
            if not isinstance(assessed_on, str) or date.fromisoformat(assessed_on).isoformat() != assessed_on:
                raise ValueError()
        except ValueError:
            errors.append('assessed resolution requires a valid assessment date')
    elif 'assessed_on' in resolution:
        try:
            if date.fromisoformat(resolution['assessed_on']).isoformat() != resolution['assessed_on']:
                raise ValueError()
        except (ValueError, TypeError):
            errors.append('invalid assessment date')
    options = {option['id'] for option in hotspot['resolution_options']}
    if stage in ('identified', 'qualifying', 'credible') and not options:
        errors.append('identified resolution requires an option')
    if len(ids) != len(set(ids)) or set(ids) - options:
        errors.append('credible options must be distinct existing options')
    if stage == 'credible':
        if not ids or not resolution['credibility_note'].strip():
            errors.append('resolved hotspot requires a credible option and credibility rationale')
        if hotspot['status'] != 'resolved':
            errors.append('credible resolution requires resolved status')
        if resolution['blocked_reason'].strip():
            errors.append('credible resolution cannot be blocked')
    elif hotspot['status'] == 'resolved' or ids:
        errors.append('resolved status and credible options require credible resolution stage')
    if resolution['blocked_reason'].strip() and not resolution['next_step'].strip():
        errors.append('blocked resolution requires a next step')
    return errors
