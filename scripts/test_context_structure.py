"""Adopted context boundaries preserve Supply capabilities and scenario mappings."""
from pathlib import Path
from collections import Counter
import unittest
from scripts.structured_io import read
from scripts.model_depth import context_business_area_ids
from scripts.display_codes import build_display_index

ROOT=Path(__file__).resolve().parents[1]


class ContextStructureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model=read(ROOT/'modeles/backlog/model.yaml')
        cls.nodes={n['id']:n for n in cls.model['nodes']}
        cls.index=build_display_index(cls.model)

    def descendants(self,ident,kind):
        todo=list(self.index['children'][ident]);result=[]
        while todo:
            current=todo.pop()
            if self.nodes[current]['kind']==kind:result.append(current)
            todo+=self.index['children'][current]
        return result

    def test_commerce_keeps_retail_responsibilities_under_one_subdomain(self):
        self.assertEqual(len(self.index['children']['domain-sales']),5)
        self.assertEqual(self.index['children']['subdomain-retail-commerce'],[
            'subdomain-retail-network-management','subdomain-sales-b2c-ecommerce',
            'subdomain-sales-b2c-store','subdomain-store-backoffice-operations',
            'ba-retail-customer-relationship-management'])
        self.assertEqual(len(self.descendants('domain-sales','business_area')),13)
        for ident in self.index['children']['subdomain-retail-commerce']:
            self.assertEqual(self.nodes[ident]['kind'],'business_area')
        self.assertIn('Wholesale Commerce',self.nodes['subdomain-sales-b2c-ecommerce']['fields']['scope'])

    def test_purchase_strategy_agreements_and_execution_stay_distinct(self):
        self.assertEqual(len(self.descendants('domain-sourcing-procurement','area')),4)
        self.assertEqual(len(self.descendants('domain-sourcing-procurement','business_area')),9)
        self.assertNotIn('ba-source-selection', self.nodes)  # Retired by U1089.
        self.assertIn('MAP',self.nodes['subdomain-operational-procurement']['fields']['scope'])
        self.assertIn('model:D04.j',self.nodes['ba-purchasing-execution-coordination']['fields']['scope'])
        self.assertIn('model:subdomain-commercial-settlement-management',
                      self.nodes['ba-supplier-rebate-incentive-management']['fields']['scope'])
        self.assertIn('subdomain-commercial-settlement-management',self.index['children']['domain-finance'])

    def test_logistics_has_operational_customs_without_duplicate_supply_order(self):
        self.assertEqual(set(self.index['children']['domain-logistics-execution']),{
            'domain-warehousing','domain-transportation','domain-customs-management'})
        self.assertEqual(len(self.descendants('domain-logistics-execution','area')),11)
        self.assertEqual(len(self.descendants('domain-logistics-execution','business_area')),21)
        self.assertIn('model:service-order-customs-clearance',self.nodes['domain-logistics-execution']['fields']['scope'])
        self.assertEqual(self.nodes['service-order-customs-clearance']['kind'],'capability')
        self.assertNotIn('service-order-customs-clearance',self.descendants('domain-logistics-execution','capability'))

    def test_returns_are_separate_from_added_processing_and_local_work_control(self):
        self.assertEqual(self.nodes['subdomain-value-added-returns']['fields']['name'],'Value-Added Operations')
        self.assertIn('subdomain-returns-operations',self.index['children']['domain-warehousing'])
        self.assertIn('subdomain-warehouse-operations-control',self.index['children']['domain-warehousing'])
        self.assertNotIn('model:ba-product-preparation-operations',self.nodes['subdomain-returns-operations']['fields']['scope'])

    def test_context_areas_are_terminal_and_supply_inventory_is_preserved(self):
        areas=context_business_area_ids(self.model)
        self.assertEqual(len(areas),21)
        self.assertTrue(all(not self.index['children'][ident] for ident in areas))
        published=read(ROOT/'modeles/release/2026-10-13.3/model.yaml')
        for kind in ('capability','behavior'):
            current={n['id'] for n in self.model['nodes'] if n['kind']==kind}
            historical={n['id'] for n in published['nodes'] if n['kind']==kind}
            self.assertLessEqual(historical,current)
            if kind=='behavior':self.assertEqual(current,historical)
            else:
                u1079={r['target_id'] for r in self.model['relations'] if r['type']=='contains'
                       and r['id'].startswith('REL-U1079-') and self.nodes[r['target_id']]['kind']=='capability'}
                moved_planning={'demand-forecast-development', 'supply-plan-development',
                                'planning-scenario-reconciliation'}
                self.assertEqual(len(u1079 | moved_planning),32)
                u1089={r['target_id'] for r in self.model['relations'] if r['type']=='contains'
                       and r['id'].startswith('REL-U1089-') and self.nodes[r['target_id']]['kind']=='capability'}
                self.assertEqual(len(u1089),5)
                self.assertEqual(current-historical, u1079 | moved_planning | u1089 |
                                 {'demand-plan-development', 'process-ledger'})
        contributions=lambda model:{p['id']:[c['node_id'] for s in p['steps'] for c in s['contributions']]
                                    for p in model['scenario_catalog']['paths']}
        current, historical=contributions(self.model), contributions(published)
        # U1087/U1091 enrich Commerce and Procurement chains without changing
        # the order of the existing Supply responsibilities.
        additions={
            'fashion-launch-path': ['cap-assortment-eligibility-management',
                                   'cap-commercial-catalog-publication', 'cap-sales-price-determination'],
            'pickup-or-direct-shipment-path': ['cap-digital-sales-journey-management',
                                               'cap-store-order-preparation-handover',
                                               'cap-store-order-preparation-handover',
                                               'cap-store-stock-operations-management'],
            'return-credit-refund-path': ['cap-store-checkout-management'],
            'seasonal-order-backlog-path': ['cap-wholesale-offer-preparation',
                                            'cap-wholesale-sales-engagement',
                                            'cap-purchasing-case-coordination'],
        }
        self.assertEqual(set(current)-set(historical), {'forecast-to-shortage-arbitration-path'})
        self.assertLessEqual(set(historical), set(current))
        for ident, previous in historical.items():
            with self.subTest(path=ident):
                if ident=='planning-actuals-feedback-path':
                    # Internal inventory facts feed the plan producers directly;
                    # Plan Ingestion is reserved for external contributions.
                    self.assertEqual(current[ident], ['D01.f', 'D01.c', 'planning-data-provision',
                                                      'D05.f', 'supply-plan-development'])
                else:
                    extra=additions.get(ident, [])
                    self.assertEqual(Counter(current[ident])-Counter(previous), Counter(extra))
                    self.assertEqual([node for node in current[ident] if node not in extra], previous)
        self.assertLessEqual({'demand-forecast-development', 'demand-plan-development',
                             'supply-plan-development', 'planning-scenario-reconciliation',
                             'D03.m', 'D03.o', 'D04.i', 'D04.j', 'D05.f', 'D02.e',
                             'delivery-release-decision', 'cap-supplier-commitment-follow-up',
                             'cap-purchasing-case-coordination', 'cap-wholesale-sales-engagement'},
                            set(current['forecast-to-shortage-arbitration-path']))


if __name__=='__main__':unittest.main()
