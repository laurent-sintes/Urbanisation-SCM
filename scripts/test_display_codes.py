from copy import deepcopy
import unittest
from scripts.display_codes import build_display_index, validate_display_index
from scripts.publish_release import compile_snapshot


def fixture():
    def node(id, kind, **fields):
        return dict(id=id, kind=kind, fields=dict(name=id, **fields), revision=1,
                    source_refs=[], review=dict(state='proposed', note='fixture'))
    nodes = [node('root', 'domain'), node('area', 'area'),
             node('decision', 'capability', nature='decision'), node('action', 'capability', nature='action'),
             node('activity', 'behavior', behavior_aspect='activity'), node('trigger', 'behavior', behavior_aspect='trigger')]
    edges = [('root','area'), ('area','decision'), ('area','action'), ('action','activity'), ('action','trigger')]
    relations = [dict(id=str(i),type='contains',source_id=a,target_id=b,revision=1,source_refs=[],review=dict(state='proposed',note='fixture')) for i,(a,b) in enumerate(edges)]
    return dict(space='backlog', display_policy='typed-tree-v1', nodes=nodes, relations=relations)


class DisplayCodeTests(unittest.TestCase):
    def test_universe_receives_its_own_stable_code(self):
        model = fixture()
        model['nodes'].insert(0, dict(id='universe', kind='universe', fields=dict(name='Univers'), revision=1,
                                      source_refs=[], review=dict(state='proposed', note='fixture')))
        model['relations'].append(dict(id='universe-root', type='contains', source_id='universe', target_id='root',
                                       revision=1, source_refs=[], review=dict(state='proposed', note='fixture')))
        index = build_display_index(model)
        self.assertEqual(index['roots'], ['universe'])
        self.assertEqual(index['codes']['universe'], 'UNI-001')
        self.assertEqual(index['codes']['root'], 'DOM-001')

    def test_compilation_freezes_order_without_changing_identity(self):
        model = fixture(); before = deepcopy(model)
        result = compile_snapshot(model, {'decisions': []}, '2026-09-26.99', [])
        index = result['display_index']
        self.assertEqual(index['children']['area'], ['action', 'decision'])
        self.assertEqual(index['children']['action'], ['trigger', 'activity'])
        self.assertEqual(index['codes']['action'], 'CAP-001')
        self.assertEqual(index['codes']['trigger'], 'BHV-001')
        self.assertEqual(validate_display_index(result), [])
        self.assertEqual(model, before)
        self.assertEqual([n['id'] for n in result['nodes']], [n['id'] for n in model['nodes']])

    def test_history_unchanged_and_illustrations_not_numbered(self):
        model = fixture(); model['nodes'][-1]['review']['state'] = 'illustration'
        result = compile_snapshot(model, {'decisions': []}, 'new', [])
        self.assertNotIn('trigger', result['display_index']['codes'])
        self.assertEqual(result['display_index']['codes']['activity'], 'BHV-001')
        del model['display_policy']
        self.assertNotIn('display_index', compile_snapshot(model, {'decisions': []}, 'old', []))

    def test_corruption_and_ambiguous_parent_rejected(self):
        result = compile_snapshot(fixture(), {'decisions': []}, 'new', [])
        for section, key, value in [('codes', 'action', 'CAP-002'), ('children','area',['decision','action'])]:
            changed = deepcopy(result); changed['display_index'][section][key] = value
            self.assertTrue(validate_display_index(changed))
        model = fixture(); model['relations'].append(dict(model['relations'][0], id='duplicate'))
        with self.assertRaises(ValueError): build_display_index(model)

    def test_category_order_and_insertion_change_only_new_codes(self):
        model = fixture()
        model['nodes'][2]['fields']['category'] = dict(id='first', display_name='First', order=0)
        old = build_display_index(model)
        self.assertEqual(old['codes']['decision'], 'CAP-001')
        model['nodes'][3]['fields']['category'] = dict(id='earlier', display_name='Earlier', order=-1)
        new = build_display_index(model)
        self.assertEqual(new['codes']['action'], 'CAP-001')
        self.assertEqual(old['codes']['decision'], 'CAP-001')

    def test_explicit_sibling_order_overrides_nature_without_changing_old_snapshots(self):
        model = fixture()
        model['nodes'][1]['kind'] = 'business_area'
        self.assertEqual(build_display_index(model)['children']['area'], ['action', 'decision'])
        model['nodes'][2]['fields']['reading_order'] = 1
        model['nodes'][3]['fields']['reading_order'] = 2
        self.assertEqual(build_display_index(model)['children']['area'], ['decision', 'action'])
        del model['nodes'][3]['fields']['reading_order']
        with self.assertRaisesRegex(ValueError, 'incomplete reading order'):
            build_display_index(model)
