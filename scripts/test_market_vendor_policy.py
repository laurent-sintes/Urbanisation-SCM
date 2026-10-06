import unittest
from scripts.market_comparison import validate_reference_policy, reference_family


class MarketVendorPolicyTests(unittest.TestCase):
    def model(self, entries=(), gaps=()):
        return {'market_reference_policy': 'microsoft_sap_or_gap_v1', 'nodes': [
            {'id': 'test', 'fields': {'market_comparisons': list(entries), 'market_gaps': list(gaps)}}]}

    def source(self, vendor, url, product=''):
        return dict(vendor=vendor, source_url=url, product=product)

    def test_two_documents_from_same_vendor_do_not_pass(self):
        rows = [self.source('Microsoft', 'https://learn.microsoft.com/en-us/dynamics365/'+x) for x in ('a','b')]
        self.assertTrue(any('sap_s4hana' in e for e in validate_reference_policy(self.model(rows))))

    def test_product_and_primary_host_are_required(self):
        self.assertIsNone(reference_family(self.source('SAP','https://help.sap.com/docs/IBP','SAP IBP')))
        self.assertIsNone(reference_family(self.source('SAP','https://example.com/s4hana','SAP S/4HANA')))
        self.assertIsNone(reference_family(self.source('Microsoft','https://learn.microsoft.com/en-us/azure/')))

    def test_missing_comparison_is_not_silently_ignored(self):
        self.assertEqual(len(validate_reference_policy(self.model())), 2)

    def test_pair_passes(self):
        rows=[self.source('Microsoft','https://learn.microsoft.com/en-us/dynamics365/a'),
              self.source('SAP','https://learning.sap.com/course','SAP S/4HANA')]
        self.assertEqual(validate_reference_policy(self.model(rows)), [])

    def test_explicit_gaps_require_evidence_and_cannot_hide_a_present_source(self):
        gaps=[dict(family=f, reason='Correspondance précise restant à établir', investigated_urls=['https://example.com'], source_refs=['U853'])
              for f in ('microsoft_dynamics','sap_s4hana')]
        self.assertEqual(validate_reference_policy(self.model(gaps=gaps)), [])
        gaps[0]['source_refs']=[]
        self.assertTrue(validate_reference_policy(self.model(gaps=gaps)))
        gaps[0]['source_refs']=['U853']
        self.assertTrue(validate_reference_policy(self.model([self.source('SAP','https://learning.sap.com/course','SAP S/4HANA')], gaps)))

    def test_historical_contract_is_unchanged(self):
        model=self.model();model['market_reference_policy']='two_primary_sources'
        self.assertEqual(validate_reference_policy(model), [])
