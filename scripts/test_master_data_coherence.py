"""Reference authority, certification and correction boundaries of Master Data."""
from pathlib import Path
import re
import unittest

from scripts.structured_io import read

ROOT = Path(__file__).resolve().parents[1]


class MasterDataCoherenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')
        cls.nodes = {n['id']: n for n in cls.model['nodes']}
        cls.sharing = [r for r in cls.model['relations'] if r['type'] == 'shares-data']
        cls.terms = {t['id']: t for t in read(ROOT / 'modeles/backlog/glossary.yaml')['terms']}
        cls.application = read(ROOT / 'modeles/backlog/master-data-coherence-application-U1168.yaml')
        cls.feedback_terms = {'TER467', 'TER468', 'TER469'}

    def carries_only_feedback(self, relation):
        contents = relation['fields']['data_exchange']['contents']
        return all(self.feedback_terms.intersection(c['glossary_refs']) for c in contents)

    def reaches(self, source, target, blocked=(), reference_values_only=True):
        remaining, visited = [source], set(blocked)
        while remaining:
            current = remaining.pop()
            if current in visited:
                continue
            if current == target:
                return True
            visited.add(current)
            remaining.extend(r['target_id'] for r in self.sharing if r['source_id'] == current
                             and (not reference_values_only or not self.carries_only_feedback(r)))
        return False

    def test_source_contributions_reach_consumers_without_skipping_certification(self):
        # Reachability here describes information contributions, not an execution sequence.
        for target in ['domain-sales', 'domain-sourcing-procurement', 'master-data-ingestion']:
            with self.subTest(target=target):
                self.assertTrue(self.reaches('cap-mdm-ingestion', target))
                for gate in ['cap-mdm-certification', 'cap-mdm-publication']:
                    self.assertFalse(self.reaches('cap-mdm-ingestion', target, [gate]))

    def test_enrichment_is_optional_and_object_changes_use_common_authorization(self):
        self.assertTrue(self.reaches('cap-mdm-ingestion', 'cap-mdm-distribution', ['cap-mdm-enrichment']))
        object_changes = [r for r in self.sharing
                          if r['id'].startswith('REL-U1168-OBJECT-CHANGE-')]
        self.assertTrue(object_changes)
        for relation in object_changes:
            source = relation['source_id']
            with self.subTest(source=source):
                self.assertTrue(self.reaches(source, 'cap-mdm-distribution'))
                self.assertFalse(self.reaches(source, 'cap-mdm-distribution', ['cap-mdm-certification']))
                self.assertFalse(self.reaches(source, 'cap-mdm-distribution', ['cap-mdm-publication']))

    def test_distribution_combines_published_data_with_explicit_access_scope(self):
        incoming = {r['source_id']: r for r in self.sharing if r['target_id'] == 'cap-mdm-distribution'}
        self.assertIn('cap-mdm-publication', incoming)
        self.assertIn('cap-mdm-access-subscription', incoming)
        rights = incoming['cap-mdm-access-subscription']['fields']['data_exchange']['contents']
        self.assertTrue(any('TER411' in c['glossary_refs'] for c in rights))
        for relation in self.sharing:
            if relation['source_id'] == 'cap-mdm-distribution':
                conditions = ' '.join(relation['qualification']['conditions']).casefold()
                self.assertIn('autorisé', conditions)
                self.assertIn('version', conditions)

    def test_direct_reference_exceptions_require_recorded_justification(self):
        finding = next(f for f in self.application['finding_resolutions'] if f['id'] == 'MDM-U1167-03')
        exceptions = {r['relation_id']: r for r in finding['retained_direct_exceptions']}
        for relation in self.sharing:
            if relation['target_id'] == 'master-data-ingestion' and relation['source_id'] != 'cap-mdm-distribution':
                with self.subTest(relation=relation['id']):
                    self.assertIn(relation['id'], exceptions)
                    self.assertGreaterEqual(len(exceptions[relation['id']]['reason']), 20)
        for record in finding['rerouted']:
            relation = next(r for r in self.sharing if r['id'] == record['relation_id'])
            self.assertEqual(relation['target_id'], 'cap-mdm-ingestion')
        # Sources keep their identity; rerouting does not transfer their authority.
        self.assertEqual(next(r for r in self.sharing if r['id'] == 'REL-U1113-design-product-reference')['source_id'],
                         'system-design-development')
        self.assertEqual(next(r for r in self.sharing if r['id'] == 'REL-U1113-finance-credit-reference')['source_id'],
                         'domain-finance')

    def test_consumers_report_content_errors_to_common_remediation(self):
        for consumer in ['domain-sales', 'domain-sourcing-procurement', 'supply-chain-orchestration']:
            with self.subTest(consumer=consumer):
                reports = [r for r in self.sharing if r['source_id'] == consumer
                           and r['target_id'] == 'cap-mdm-quality-remediation']
                self.assertTrue(reports)
                self.assertTrue(any('TER397' in c['glossary_refs'] for r in reports
                                    for c in r['fields']['data_exchange']['contents']))
        self.assertFalse(any(r['source_id'] == 'master-data-ingestion'
                             and r['target_id'] == 'cap-mdm-publication' for r in self.sharing))

    def test_homonymous_internal_reference_areas_remain_distinct_in_glossary(self):
        shared = self.terms['TER184']
        areas = ['ba-mdm-internal-supplies', 'ba-internal-supplies-equipment-references']
        for identifier in areas:
            self.assertEqual(self.nodes[identifier]['fields']['name'], shared['name'])
            self.assertIn('model:' + identifier, shared['context'])
            self.assertIn('glossary:TER184', self.nodes[identifier]['fields']['scope'])

    def test_payload_labels_do_not_alias_treatment_definitions(self):
        # Valid glossary IDs alone cannot detect the semantic regression found by U1169.
        for relation in self.sharing:
            if not relation['id'].startswith(('REL-U1168-', 'REL-U1170-')):
                continue
            for content in relation['fields']['data_exchange']['contents']:
                with self.subTest(relation=relation['id'], content=content['name']):
                    self.assertNotRegex(content['name'], r'Management (candidates|change proposals)$')
                    match = re.match(r'^\[([^\]]+)\]\(glossary:(TER\d+)\)', content['description'])
                    if match:
                        term = self.terms[match[2]]
                        self.assertNotRegex(term['name'], r'Management|Remediation|Assessment|Ingestion')
        assortment = next(r for r in self.sharing if r['id'] == 'REL-U1168-SOURCE-assortment')
        content = assortment['fields']['data_exchange']['contents'][0]
        self.assertIn('glossary:TER087', content['description'])
        self.assertIn('TER087', content['glossary_refs'])

    def test_every_documented_source_can_receive_and_answer_a_correction_request(self):
        producers = {r['source_id'] for r in self.sharing
                     if r['target_id'] == 'cap-mdm-ingestion'
                     and not r['source_id'].startswith('cap-mdm-')}
        self.assertTrue(producers)
        for producer in producers:
            with self.subTest(producer=producer):
                requests = [r for r in self.sharing if r['source_id'] == 'cap-mdm-source-contribution'
                            and r['target_id'] == producer]
                answers = [r for r in self.sharing if r['source_id'] == producer
                           and r['target_id'] == 'cap-mdm-source-contribution']
                self.assertTrue(any('TER467' in c['glossary_refs'] for r in requests
                                    for c in r['fields']['data_exchange']['contents']))
                self.assertTrue(any('TER468' in c['glossary_refs'] for r in answers
                                    for c in r['fields']['data_exchange']['contents']))
                for relation in answers:
                    self.assertTrue(self.carries_only_feedback(relation))
                    conditions = ' '.join(relation['qualification']['conditions'])
                    self.assertIn('Master Data Ingestion', conditions)
        incoming_resolution = {r['source_id'] for r in self.sharing
                               if r['target_id'] == 'cap-mdm-quality-remediation'
                               and any('TER468' in c['glossary_refs']
                                       for c in r['fields']['data_exchange']['contents'])}
        self.assertIn('cap-mdm-source-contribution', incoming_resolution)
        self.assertIn('cap-mdm-ingestion', incoming_resolution)

    def test_every_reference_recipient_can_report_receipt_or_rejection(self):
        deliveries = [r for r in self.sharing if r['source_id'] == 'cap-mdm-distribution']
        for delivery in deliveries:
            recipient = delivery['target_id']
            with self.subTest(recipient=recipient):
                statuses = [r for r in self.sharing if r['source_id'] == recipient
                            and r['target_id'] == 'cap-mdm-distribution'
                            and all('TER469' in c['glossary_refs']
                                    for c in r['fields']['data_exchange']['contents'])]
                self.assertTrue(statuses)
                self.assertFalse(self.carries_only_feedback(delivery))
                self.assertTrue(any('TER469' in c['glossary_refs']
                                    for c in delivery['fields']['data_exchange']['contents']))
                for status in statuses:
                    self.assertTrue(self.carries_only_feedback(status))
                    conditions = ' '.join(status['qualification']['conditions'])
                    self.assertIn('Une réception réussie ne prouve pas la prise en compte métier', conditions)

    def test_feedback_loops_do_not_count_as_paths_for_reference_values(self):
        # Information can return via a status without carrying a publishable value.
        self.assertTrue(self.reaches('cap-mdm-ingestion', 'cap-mdm-distribution',
                                     ['cap-mdm-certification'], reference_values_only=False))
        self.assertFalse(self.reaches('cap-mdm-ingestion', 'cap-mdm-distribution',
                                      ['cap-mdm-certification']))


if __name__ == '__main__':
    unittest.main()
