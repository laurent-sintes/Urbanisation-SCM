"""Mutation tests using the actual extracted, frozen release as a fixture."""

from copy import deepcopy
from scripts.structured_io import read as read_document
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

try:
    from .validate_models import canonical_sha256, validate_release, validate_sources, validate_urbanism, validate_applicability
except ImportError:
    from validate_models import canonical_sha256, validate_release, validate_sources, validate_urbanism, validate_applicability


ROOT = Path(__file__).resolve().parents[1]


def read(relative):
    return read_document(ROOT / relative)


class ReleaseIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # These mutation cases intentionally exercise the original frozen fixture.
        cls.release = read("modeles/release/2026-09-13.2/model.json")
        cls.snapshot = read("modeles/revisions/2026-09-13.1/backlog.json")
        cls.decisions = read("modeles/decisions/2026-09-13.1.json")
        cls.source_doc = read("modeles/provenance/source-records.json")
        cls.sources = {r["id"]: r for r in cls.source_doc["records"]}

    def verify(self, release=None, decisions=None, snapshot=None, sources=None):
        return validate_release(self.release if release is None else release,
                                self.decisions if decisions is None else decisions,
                                self.snapshot if snapshot is None else snapshot,
                                self.sources if sources is None else sources)

    def test_actual_release_matches_accepted_decisions(self):
        self.assertEqual(self.verify(), [])
        self.assertEqual(validate_sources(self.source_doc), [])

    def test_candidate_is_published_without_becoming_validated(self):
        candidate = next(n for n in self.release["nodes"] if n["id"] == "D01.a")
        self.assertIn(candidate["review"]["state"], ("proposed", "under_review"))
        self.assertEqual(candidate["adoption_ids"], [])
        self.assertEqual(candidate["approved_fields"], [])
        self.assertEqual(self.verify(), [])

    def test_published_candidate_cannot_be_falsely_validated(self):
        mutated = deepcopy(self.release)
        candidate = next(n for n in mutated["nodes"] if n["id"] == "D01.a")
        candidate["review"]["state"] = "accepted"
        self.assertTrue(self.verify(release=mutated))

    def test_unapproved_published_value_is_also_frozen(self):
        mutated = deepcopy(self.release)
        candidate = next(n for n in mutated["nodes"] if n["id"] == "D01.a")
        candidate["fields"]["name"] = "Future candidate"
        self.assertTrue(any("published fields differ" in e for e in self.verify(release=mutated)))

    def test_adopted_name_cannot_change_without_new_adoption(self):
        mutated = deepcopy(self.release)
        mutated["nodes"][0]["fields"]["name"] = "Invented Name"
        self.assertTrue(any("adopted value hash mismatch" in e for e in self.verify(release=mutated)))

    def test_forged_adoption_hash_cannot_hide_changed_frozen_value(self):
        mutated, decisions = deepcopy(self.release), deepcopy(self.decisions)
        mutated["nodes"][0]["fields"]["name"] = "Invented Name"
        decisions["decisions"][0]["target"]["value_sha256"]["name"] = canonical_sha256("Invented Name")
        self.assertTrue(any("frozen value hash mismatch" in e for e in self.verify(release=mutated, decisions=decisions)))

    def test_duplicate_ids_rejected(self):
        mutated = deepcopy(self.release)
        mutated["nodes"].append(deepcopy(mutated["nodes"][0]))
        self.assertTrue(any("duplicate id" in e for e in self.verify(release=mutated)))

    def test_dangling_relation_rejected(self):
        mutated = deepcopy(self.release)
        mutated["relations"][0]["target_id"] = "missing"
        self.assertTrue(any("dangling" in e for e in self.verify(release=mutated)))

    def test_live_backlog_change_does_not_change_release(self):
        live_backlog = read("modeles/backlog/model.yaml")
        baseline_digest = canonical_sha256(self.release)
        live_backlog["nodes"][0]["fields"]["name"] = "Future Proposal"
        # Simulate a fresh legacy proposal, without claiming the old approval.
        live_backlog['nodes'][0].pop('lifecycle', None)
        live_backlog.pop('lifecycle_policy', None)
        module = sys.modules[validate_release.__module__]
        original_load = module._load

        def load_with_future_backlog(path):
            if path.resolve() == (ROOT / "modeles/backlog/model.yaml").resolve():
                return live_backlog
            return original_load(path)

        with patch.object(module, "_load", side_effect=load_with_future_backlog):
            self.assertEqual(module.validate_project(ROOT)["errors"], [])
        self.assertEqual(canonical_sha256(self.release), baseline_digest)

    def test_unknown_source_rejected(self):
        mutated = deepcopy(self.release)
        mutated["nodes"][0]["source_refs"].append("U999999")
        self.assertTrue(any("unknown source" in e for e in self.verify(release=mutated)))

    def test_proposed_relations_published_but_illustrations_excluded(self):
        self.assertTrue(any(r["review"]["state"] == "proposed" for r in self.release["relations"]))
        self.assertEqual(self.verify(), [])
        mutated = deepcopy(self.release)
        mutated["relations"][0]["review"]["state"] = "illustration"
        self.assertTrue(any("unpublishable" in e for e in self.verify(release=mutated)))

    def test_reservation_under_review_retains_adoption(self):
        relation = next(r for r in self.release["relations"] if r["id"] == "REL-MEMBER-D02.c")
        self.assertEqual(relation["review"]["state"], "under_review")
        self.assertEqual(self.verify(), [])
        decisions = deepcopy(self.decisions)
        adoption = next(d for d in decisions["decisions"] if d["id"] in relation["adoption_ids"])
        adoption["source_refs"].remove("U78")
        self.assertTrue(any("review evidence" in e for e in self.verify(decisions=decisions)))

    def test_decision_requires_author_date_and_source(self):
        for field, value in (("author", ""), ("decided_at", "tomorrow"), ("source_refs", [])):
            decisions = deepcopy(self.decisions)
            decisions["decisions"][0][field] = value
            self.assertTrue(self.verify(decisions=decisions))

    def test_field_and_relationship_kinds_are_checked(self):
        mutated = deepcopy(self.release)
        mutated["nodes"][0]["fields"]["unapproved"] = "extra"
        self.assertTrue(any("published fields differ" in e for e in self.verify(release=mutated)))
        mutated = deepcopy(self.snapshot)
        mutated["relations"][0]["type"] = "represents"
        self.assertTrue(any("endpoint kinds" in e for e in validate_urbanism(mutated, self.sources)))

    def test_containment_cycle_rejected(self):
        mutated = deepcopy(self.snapshot)
        mutated["relations"].extend([
            {"id": "cycle-a", "type": "contains", "source_id": "D03.a", "target_id": "D03.b"},
            {"id": "cycle-b", "type": "contains", "source_id": "D03.b", "target_id": "D03.a"},
        ])
        self.assertTrue(any("cycle" in e for e in validate_urbanism(mutated, self.sources)))

    def test_captured_source_hash_checked_without_live_markdown(self):
        mutated = deepcopy(self.source_doc)
        mutated["records"][0]["captured_text"] += " altered"
        self.assertTrue(validate_sources(mutated))

    def test_historical_partial_baseline_remains_valid(self):
        historical = read("modeles/release/2026-09-13.1/model.json")
        self.assertEqual(self.verify(release=historical), [])

    def test_group_level_is_explicit_and_distinct_from_presentation(self):
        model = deepcopy(self.snapshot)
        group = next(n for n in model["nodes"] if n["id"] == "business-references")
        group["group_role"] = "urbanism_level"
        self.assertTrue(any("level_ref" in e for e in validate_urbanism(model, self.sources)))
        group["level_ref"] = "LEVEL-UNIVERSE"
        self.assertEqual(validate_urbanism(model, self.sources), [])
        group["group_role"] = "presentation"
        self.assertTrue(any("level_ref" in e for e in validate_urbanism(model, self.sources)))
        group.pop("level_ref")
        group["kind"] = "domain"
        self.assertTrue(any("group_role" in e for e in validate_urbanism(model, self.sources)))

    def test_business_relationship_requires_qualified_meaning(self):
        model = deepcopy(self.snapshot)
        relation = {"id": "TEST-RELATES", "revision": 1, "type": "relates-to", "source_id": "D03.a",
                    "target_id": "ILL-OBJ-01", "source_refs": [], "review": {"state": "proposed"}}
        model["relations"].append(relation)
        self.assertTrue(any("qualification" in e for e in validate_urbanism(model, self.sources)))
        relation["qualification"] = {"meaning": "An explicit illustrative meaning", "conditions": [], "effects": []}
        self.assertEqual(validate_urbanism(model, self.sources), [])
        relation["qualification"]["meaning"] = " "
        self.assertTrue(any("meaning" in e for e in validate_urbanism(model, self.sources)))
        relation["qualification"]["meaning"] = "Meaning"
        relation["target_id"] = "D01"
        self.assertTrue(any("endpoint kinds" in e for e in validate_urbanism(model, self.sources)))

    def test_order_authorization_direction_is_opt_in_and_preserves_history(self):
        published = read("modeles/release/2026-10-16.4/model.yaml")
        authorization = next(r for r in published["relations"]
                             if r["id"] == "REL-U725-EXECUTION-AUTHORIZATIONS")
        self.assertEqual((authorization["type"], authorization["source_id"], authorization["target_id"]),
                         ("provides-knowledge", "D04", "D06"))
        self.assertEqual(authorization["qualification"]["role"], "needs")
        self.assertIn("fournissent les autorisations", authorization["qualification"]["meaning"])
        historical_hash = canonical_sha256(published)
        model = deepcopy(self.snapshot)
        model["relations"].append(deepcopy(authorization))
        # The actual U725 contradiction remains readable under its old contract.
        self.assertEqual(validate_urbanism(model, self.sources), [])
        model.setdefault("principles", []).append({"id": "PRINCIPLE-RELATION-DIRECTION"})
        errors = validate_urbanism(model, self.sources)
        self.assertEqual(errors, [
            "relations/REL-U725-EXECUTION-AUTHORIZATIONS: provides-knowledge is supplier-to-consumer; "
            "qualification role needs is consumer-to-supplier"
        ])
        # Keeping the supply direction and removing the conflicting role is enough.
        model["relations"][-1]["qualification"].pop("role")
        self.assertEqual(validate_urbanism(model, self.sources), [])
        self.assertEqual(canonical_sha256(published), historical_hash)

    def test_explicit_supplies_cannot_use_the_reverse_needs_role(self):
        endpoints = {
            "shares-data": ("D04", "D06"),
            "provides-knowledge": ("D04", "D06"),
            "provides-conditions": ("D11", "D03"),
            "supplies-reference": ("D03.a", "D11"),
        }
        for relation_type, (source, target) in endpoints.items():
            with self.subTest(relation_type=relation_type):
                model = deepcopy(self.snapshot)
                model.setdefault("principles", []).append({"id": "PRINCIPLE-RELATION-DIRECTION"})
                relation = {
                    "id": "TEST-DIRECTION", "revision": 1, "type": relation_type,
                    "source_id": source, "target_id": target,
                    "qualification": {"role": "needs", "meaning": "Fournir les informations autorisées.",
                                      "conditions": [], "effects": []},
                }
                if relation_type == "shares-data":
                    relation["fields"] = {
                        "label": "Authorized context",
                        "data_exchange": {"purpose": "Respecter le contexte autorisé.", "contents": [
                            {"name": "Authorized context", "description": "Contexte applicable.",
                             "glossary_refs": ["TER012"]}
                        ]},
                    }
                model["relations"].append(relation)
                errors = validate_urbanism(model, self.sources)
                self.assertEqual(len(errors), 1, errors)
                self.assertIn("qualification role needs is consumer-to-supplier", errors[0])
                relation["qualification"]["role"] = "context_supply"
                self.assertEqual(validate_urbanism(model, self.sources), [])

    def test_direction_policy_keeps_consumer_dependencies_and_reference_uses(self):
        for relation_type, target in (("relates-to", "D03.b"), ("uses-reference", "D11")):
            with self.subTest(relation_type=relation_type):
                model = deepcopy(self.snapshot)
                model.setdefault("principles", []).append({"id": "PRINCIPLE-RELATION-DIRECTION"})
                model["relations"].append({
                    "id": "TEST-NEEDS-DIRECTION", "revision": 1, "type": relation_type,
                    "source_id": "D03.a", "target_id": target,
                    "qualification": {"role": "needs", "meaning": "Utiliser le résultat fourni.",
                                      "conditions": [], "effects": []},
                })
                self.assertEqual(validate_urbanism(model, self.sources), [])

    def test_relation_qualification_is_frozen_and_bound_to_adoption(self):
        release, snapshot, decisions = deepcopy(self.release), deepcopy(self.snapshot), deepcopy(self.decisions)
        released = next(r for r in release["relations"] if r["id"] == "REL-MEMBER-D03.a")
        frozen = next(r for r in snapshot["relations"] if r["id"] == released["id"])
        qualification = {"meaning": "Meaning being reviewed", "conditions": [], "effects": []}
        released["qualification"] = deepcopy(qualification)
        frozen["qualification"] = deepcopy(qualification)
        self.assertTrue(any("approval of its qualification" in e for e in self.verify(release=release, snapshot=snapshot, decisions=decisions)))
        adoption = next(d for d in decisions["decisions"] if d["id"] in released["adoption_ids"])
        adoption["target"]["approved_fields"].append("qualification")
        adoption["target"]["value_sha256"]["qualification"] = canonical_sha256(qualification)
        self.assertEqual(self.verify(release=release, snapshot=snapshot, decisions=decisions), [])
        released["qualification"]["meaning"] = "Changed without approval"
        self.assertTrue(any("hash mismatch" in e for e in self.verify(release=release, snapshot=snapshot, decisions=decisions)))


class ApplicabilityTests(unittest.TestCase):
    def setUp(self):
        self.document = read("modeles/backlog/applicability.yaml")
        self.schema = read("modeles/schemas/applicability.schema.json")
        self.sources = {r["id"]: r for r in read("modeles/provenance/source-records.json")["records"]}
        release = read("modeles/release/2026-09-13.2/model.json")
        self.models = {("release", release["model_id"], release["version"]): release}
        self.realizations = {"beaumanoir-historique": {"APP-STR"}, "boardriders": {"APP-ECC"}, "sarenza": set(), "shared": {"APP-XRD"}}

    def verify(self):
        return validate_applicability(self.document, self.sources, self.models, self.realizations, self.schema)

    def add_assessment(self):
        item = {"id": "TEST-ASSESS", "subject": {"space": "release", "model_id": "flow-urbanism", "version": "2026-09-13.2", "node_id": "D01"},
                "context_id": "beaumanoir-historique", "perspective": "as_is", "assessment_status": "not_assessed",
                "applicability": "unknown", "coverage": "unknown", "realization_responsibility": "unknown",
                "source_refs": [], "realization_refs": [], "rationale": "Test only; no assessment claimed."}
        self.document["assessments"].append(item)
        return item

    def test_empty_assessments_mean_no_assessment_without_fabricating_rows(self):
        self.assertEqual(self.document["assessments"], [])
        self.assertEqual(self.verify(), [])
        self.document["contexts"].append(deepcopy(self.document["contexts"][0]))
        self.assertTrue(self.verify())

    def test_unassessed_does_not_imply_gap_or_non_applicability(self):
        item = self.add_assessment()
        self.assertEqual(self.verify(), [])
        item["coverage"] = "gap_identified"
        self.assertTrue(any("unknown applicability/coverage" in e for e in self.verify()))

    def test_area_is_a_valid_subject_without_changing_its_assessment(self):
        item = self.add_assessment()
        model = next(iter(self.models.values()))
        next(n for n in model['nodes'] if n['id'] == item['subject']['node_id'])['kind'] = 'area'
        self.assertEqual(self.verify(), [])

    def test_context_perspective_and_version_are_checked(self):
        item = self.add_assessment()
        item["perspective"] = "target"
        self.assertTrue(any("perspective mismatch" in e for e in self.verify()))
        item["perspective"] = "as_is"
        item["subject"]["space"] = "backlog"
        self.assertTrue(any("referenced model version" in e for e in self.verify()))

    def test_realization_must_be_known_in_context_and_flow_responsibility_is_separate(self):
        item = self.add_assessment()
        item.update(assessment_status="assessed", applicability="applicable", coverage="described", source_refs=["U03"], realization_refs=["APP-STR"])
        self.assertEqual(self.verify(), [])
        item["realization_refs"] = ["APP-ECC"]
        self.assertTrue(any("resolved As Is identity" in e for e in self.verify()))
        item["realization_refs"] = []
        item["realization_responsibility"] = "platform"
        self.assertTrue(any("FLOW target responsibility" in e for e in self.verify()))


if __name__ == "__main__":
    unittest.main()
