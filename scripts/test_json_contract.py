"""Regression tests for the project's deliberately limited JSON contracts."""

import unittest

try:
    from .json_contract import check_schema, validate
except ImportError:
    from json_contract import check_schema, validate


class JsonContractTests(unittest.TestCase):
    def test_unknown_keywords_fail_even_in_unused_definitions(self):
        schema = {"$defs": {"unused": {"format": "date"}}, "type": "object"}
        self.assertIn("unsupported schema keyword", check_schema(schema)[0])
        self.assertTrue(validate({}, schema))

    def test_object_required_and_closed_properties(self):
        schema = {"type": "object", "properties": {"id": {"type": "string"}},
                  "required": ["id"], "additionalProperties": False}
        self.assertEqual(validate({"id": "D01"}, schema), [])
        self.assertIn("#/id: required", validate({}, schema)[0])
        self.assertIn("#/extra:", validate({"id": "D01", "extra": 1}, schema)[0])
        self.assertTrue(validate({"id": 7}, schema))

    def test_additional_properties_can_be_a_schema(self):
        schema = {"properties": {"label": {"type": "string"}},
                  "additionalProperties": {"type": "integer"}}
        self.assertEqual(validate({"label": "Stock", "count": 2}, schema), [])
        self.assertTrue(validate({"count": "two"}, schema))

    def test_boolean_and_number_types_are_distinct(self):
        for kind in ("integer", "number"):
            self.assertTrue(validate(True, {"type": kind}))
        self.assertEqual(validate(1.0, {"type": "integer"}), [])
        self.assertTrue(validate(1.2, {"type": "integer"}))
        self.assertEqual(validate(None, {"type": ["string", "null"]}), [])
        self.assertTrue(validate(2, {"type": "boolean"}))

    def test_default_is_documented_without_inserting_values(self):
        schema = {'type': 'object', 'properties': {'visible': {'type': 'boolean', 'default': True}}}
        document = {}
        self.assertEqual(check_schema(schema), [])
        self.assertEqual(validate(document, schema), [])
        self.assertEqual(document, {})
        self.assertTrue(validate({'visible': 'false'}, schema))

    def test_references_and_sibling_constraints(self):
        schema = {"$defs": {"id": {"type": "string", "pattern": "^D[0-9]+$"}},
                  "$ref": "#/$defs/id", "minLength": 3}
        self.assertEqual(validate("D01", schema), [])
        self.assertTrue(validate("D1", schema))
        self.assertTrue(validate("CAP001", schema))
        self.assertTrue(check_schema({"$ref": "#/$defs/missing"}))
        self.assertTrue(check_schema({"$ref": "https://example.test/schema"}))
        self.assertEqual(validate(1, {"$defs": {"a/b": True}, "$ref": "#/$defs/a~1b"}), [])

    def test_anyof_including_boolean_schemas(self):
        schema = {"anyOf": [{"type": "string"}, {"const": 42}]}
        self.assertEqual(validate("yes", schema), [])
        self.assertEqual(validate(42, schema), [])
        self.assertTrue(validate(1, schema))
        self.assertEqual(validate({}, {"anyOf": [False, True]}), [])
        self.assertTrue(validate({}, False))

    def test_invalid_schema_shapes_fail_closed(self):
        invalid = [None, [], {"type": []}, {"type": ["string", "string"]},
                   {"type": "date"}, {"type": [1]}, {"required": "id"},
                   {"required": ["id", "id"]}, {"properties": []},
                   {"properties": {"id": 5}}, {"items": []}, {"anyOf": []},
                   {"anyOf": [5]}, {"enum": []}, {"uniqueItems": 1},
                   {"minItems": True}, {"minLength": -1}, {"pattern": "["},
                   {"$defs": []}, {"$schema": "draft-07"}]
        for schema in invalid:
            with self.subTest(schema=schema):
                self.assertTrue(check_schema(schema))
                self.assertTrue(validate({}, schema))

    def test_json_equality_for_uniqueness_enum_and_const(self):
        schema = {"uniqueItems": True}
        self.assertEqual(validate([True, 1, "1"], schema), [])
        self.assertTrue(validate([1, 1.0], schema))
        self.assertTrue(validate([{"a": 1, "b": 2}, {"b": 2, "a": 1}], schema))
        self.assertTrue(validate(True, {"enum": [1]}))
        self.assertTrue(validate(True, {"const": 1}))
        self.assertEqual(validate(1.0, {"const": 1}), [])

    def test_non_json_values_rejected_even_with_true_schema(self):
        for value in ({1: "bad key"}, {"a": object()}, (1, 2), float("nan"), float("inf")):
            with self.subTest(value=value):
                self.assertTrue(validate(value, True))
        circular = []
        circular.append(circular)
        self.assertTrue(validate(circular, True))
        self.assertTrue(check_schema({"const": circular}))

    def test_ref_cannot_interpret_const_payload_as_schema(self):
        schema = {"$defs": {"payload": {"const": {"unsupported": True}}},
                  "$ref": "#/$defs/payload/const"}
        self.assertTrue(check_schema(schema))
        self.assertTrue(validate({}, schema))

    def test_arrays_strings_and_pointer_paths(self):
        schema = {"properties": {"a/b": {"type": "array", "minItems": 1,
                  "items": {"type": "string", "minLength": 2, "pattern": "^D"}}}}
        self.assertEqual(validate({"a/b": ["D01"]}, schema), [])
        self.assertIn("#/a~1b/0:", validate({"a/b": ["x"]}, schema)[0])
        self.assertTrue(validate({"a/b": []}, schema))

    def test_productive_recursion_and_unproductive_cycle(self):
        node = {"anyOf": [{"type": "null"}, {"type": "object", "required": ["next"],
                "properties": {"next": {"$ref": "#/$defs/node"}}}]}
        schema = {"$defs": {"node": node}, "$ref": "#/$defs/node"}
        self.assertEqual(validate({"next": {"next": None}}, schema), [])
        self.assertTrue(validate({"next": 5}, schema))
        cyclic = {"$defs": {"loop": {"$ref": "#/$defs/loop"}}, "$ref": "#/$defs/loop"}
        self.assertTrue(validate({}, cyclic))


if __name__ == "__main__":
    unittest.main()
