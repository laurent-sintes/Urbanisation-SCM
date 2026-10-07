"""Semantic regressions for the accepted presentation-readiness corrections U889."""
from pathlib import Path
import re
import unittest

from scripts.glossary import references
from scripts.structured_io import read

ROOT = Path(__file__).resolve().parents[1]


def texts(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from texts(item)
    elif isinstance(value, list):
        for item in value:
            yield from texts(item)


class PresentationBusinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = read(ROOT / 'modeles/backlog/model.yaml')
        cls.nodes = {x['id']: x for x in cls.model['nodes']}
        cls.terms = {x['id']: x for x in read(ROOT / 'modeles/backlog/glossary.yaml')['terms']}
        cls.paths = {x['id']: x for x in cls.model['scenario_catalog']['paths']}
        cls.scenarios = {x['id']: x for x in cls.model['scenario_catalog']['scenarios']}

    def test_firming_never_implies_supplier_confirmation_in_atp(self):
        coverage = next(s for s in self.paths['preorder-future-availability-path']['steps']
                        if s['id'] == 'coverage')
        descriptions = [
            self.nodes['D03.i']['fields']['scope'],
            self.nodes['D03.i']['fields']['market_inspiration']['flow_approach'],
            self.terms['TER044']['context'],
            self.terms['TER044']['market_inspiration']['flow_approach'],
            coverage['description'],
        ]
        for description in descriptions:
            with self.subTest(description=description[:40]):
                self.assertNotIn('celle de l’achat confirmé', description)
                self.assertIn('ne confirme pas automatiquement', description)
                self.assertIn('confirmation fournisseur réels', description)
                self.assertIn('conditions d’admissibilité', description)
                self.assertIn('sans double compte', description)
                self.assertIn(('glossary', 'TER070'), references(description))
                self.assertIn(('glossary', 'TER045'), references(description))
        # U903 links Firming to its definition without changing the ATP rule.
        plain = lambda text: re.sub(r'\[([^\]]+)\]\((?:model|glossary):[^)]+\)', r'\1', text)
        self.assertEqual(plain(descriptions[0]), plain(descriptions[2]))
        self.assertEqual(plain(descriptions[1]), plain(descriptions[3]))
        self.assertIn(('glossary', 'TER197'), references(descriptions[0]))

    def test_current_reference_explanations_have_no_stale_manual_count(self):
        current = [self.nodes[x]['fields'] for x in [
            'business-references', 'master-data-ingestion', 'master-data-ingestion-commerce',
            'master-data-ingestion-finance', 'master-data-ingestion-design']]
        current.append(self.terms['TER123'])
        obsolete = re.compile(r'\b(?:sept|huit)\s+(?:référentiels|références|sujets|regroupements)')
        for item in current:
            for text in texts(item):
                self.assertIsNone(obsolete.search(text), text)
        self.assertIn('maîtrise d’entreprise externe', self.nodes['business-references']['fields']['mastership'])
        self.assertIn('restent à qualifier', self.nodes['master-data-ingestion-finance']['fields']['scope'])

    def test_pickup_names_the_actual_responsibility_boundaries(self):
        node = self.nodes['D04.t']['fields']
        descriptions = [node['scope'], node['market_inspiration']['flow_approach'], self.terms['TER092']['notes']]
        expected = {('model', 'D04'), ('model', 'subdomain-process-management'), ('model', 'D06.d')}
        for description in descriptions:
            self.assertLessEqual(expected, set(references(description)))
            self.assertNotIn('Demand suit', description)
            self.assertIn('exécutants', description.lower())
        self.assertEqual(self.terms['TER092']['notes'],
                         self.terms['TER092']['market_inspiration']['examples'][0]['outcome'])

    def test_repacking_is_a_modality_and_its_retired_identity_is_not_reused(self):
        self.assertNotIn('vas-repacking', self.nodes)
        node = self.nodes['service-order-packing']['fields']
        descriptions = [node['scope'], node['market_inspiration']['flow_approach'],
                        node['market_inspiration']['synthesis'][0]]
        for description in descriptions:
            self.assertIn('modalité', description)
            self.assertNotIn('vas-repacking', description)
            self.assertNotIn('clarifier la frontière avec [Packing Order]', description)
            self.assertNotIn('son identifiant est conservé', description)
        # The old notice is historical evidence, not the current state of the sheet.
        self.assertTrue(any('U711' in x and 'vas-repacking' in x and 'identifiants non réutilisables' in x
                            for x in self.model['limitations']))

    def test_customer_return_resolutions_are_discoverable_from_recovery(self):
        for ident in ['return-credit-refund', 'return-customer-replacement']:
            streams = self.scenarios[ident]['value_stream_ids']
            self.assertIn('recover-value', streams)
            self.assertIn('obtain-products', streams)
            self.assertEqual(len(streams), len(set(streams)))
            self.assertEqual(sum(p['scenario_id'] == ident for p in self.paths.values()), 1)

    def test_transport_adaptation_transmits_to_coordination(self):
        step = next(x for x in self.paths['transport-loads-six-stores-path']['steps'] if x['id'] == 'step-4')
        role = next(x['role'] for x in step['contributions'] if x['node_id'] == 'D06.f')
        self.assertIn('Choisir', role)
        self.assertIn('transmettre', role)
        self.assertNotIn('et coordonner', role)
        self.assertIn(('model', 'D06.d'), references(role))
        self.assertEqual([x['node_id'] for x in step['contributions']], ['D07.d', 'D06.f', 'transport-plan-decision'])

    def test_demonstration_inputs_are_readable_prerequisites(self):
        demo_paths = [
            'b2b-partial-stock-path', 'b2b-partial-stock-split-path', 'b2b-release-deadline-path',
            'intercompany-direct-delivery-path', 'preorder-future-availability-path',
            'customer-credit-hold-path', 'credit-review-no-response-path', 'remote-payment-ambiguous-path',
            'payment-resumption-not-confirmed-path', 'process-approval-bottleneck-path',
            'transport-missed-connection-path', 'workflow-version-change-path',
            'service-policy-deactivation-path', 'transport-loads-six-stores-path',
        ]
        for ident in demo_paths:
            for step in self.paths[ident]['steps']:
                with self.subTest(path=ident, step=step['id']):
                    self.assertTrue(step['inputs'])
                    self.assertNotIn(step['description'], step['inputs'])
                    for item in step['inputs']:
                        self.assertLessEqual(len(item), 240)
                        self.assertNotIn('Contexte, informations et autorisations décrits', item)
                        self.assertNotIn('prérequis détaillés non documentés', item)
                        self.assertNotIn('Conditions décrites dans le scénario', item)
        credit = self.paths['credit-review-no-response-path']
        self.assertIn('reste effectif', credit['outcome'])
        payment = self.paths['payment-resumption-not-confirmed-path']
        self.assertIn('aucun effet métier', payment['outcome'])
        self.assertIn('absente', ' '.join(payment['steps'][0]['inputs']))
        mining = self.paths['process-approval-bottleneck-path']
        self.assertIn('limites de couverture', ' '.join(mining['steps'][0]['inputs']))
        self.assertIn('autres facteurs', ' '.join(mining['steps'][-1]['inputs']))


if __name__ == '__main__':
    unittest.main()
