"""Small, fail-closed validator for this project's JSON contracts.

This is NOT a complete JSON Schema implementation. It implements only the
keywords in SUPPORTED, with JSON Schema 2020-12 semantics where supported.
References are local JSON pointers starting with #/$defs/; $schema and $id
are root metadata only. Patterns use Python re, not full ECMA-262 syntax.
No external resolution, formats, coercion or default insertion.
The default keyword is a documentation annotation, never a mutation of input.
An unproductive reference cycle is rejected instead of recursing indefinitely.
Public functions return lists of errors; an empty list means success.
"""

import math
import re


SUPPORTED = frozenset({
    "$schema", "$id", "title", "description", "default", "$defs", "$ref", "type",
    "properties", "required", "additionalProperties", "items", "enum",
    "const", "minItems", "uniqueItems", "minLength", "pattern", "anyOf",
})
TYPES = frozenset({"null", "boolean", "object", "array", "number", "integer", "string"})
DIALECT = "https://json-schema.org/draft/2020-12/schema"


def _path(path, key):
    return path + "/" + str(key).replace("~", "~0").replace("/", "~1")


def _json_errors(value, path, active=None):
    """Reject Python-only values, non-finite numbers and non-string keys."""
    errors = []
    active = set() if active is None else active
    if value is None or type(value) in (bool, str, int):
        return errors
    if type(value) is float:
        if not math.isfinite(value):
            errors.append(f"{path}: non-finite number is not JSON")
    elif type(value) in (list, dict) and id(value) in active:
        errors.append(f"{path}: circular container is not JSON")
    elif type(value) is list:
        active.add(id(value))
        for i, item in enumerate(value):
            errors.extend(_json_errors(item, _path(path, i), active))
        active.remove(id(value))
    elif type(value) is dict:
        active.add(id(value))
        for key, item in value.items():
            if type(key) is not str:
                errors.append(f"{path}: object key {key!r} is not a string")
            errors.extend(_json_errors(item, _path(path, key), active))
        active.remove(id(value))
    else:
        errors.append(f"{path}: unsupported JSON type {type(value).__name__}")
    return errors


def _value_key(value):
    """JSON equality: true differs from 1; 1 and 1.0 are equal."""
    if value is None:
        return ("null",)
    if type(value) is bool:
        return ("boolean", value)
    if type(value) in (int, float):
        return ("number", value)
    if type(value) is str:
        return ("string", value)
    if type(value) is list:
        return ("array", tuple(_value_key(v) for v in value))
    return ("object", tuple(sorted((k, _value_key(v)) for k, v in value.items())))


def _resolve(root, ref):
    if type(ref) is not str or not ref.startswith("#/$defs/"):
        raise ValueError("$ref must be a local pointer beginning #/$defs/")
    target = root
    for token in ref[2:].split("/"):
        if re.search(r"~(?![01])", token) or "%" in token:
            raise ValueError("$ref requires plain JSON pointer tokens (~0/~1 escapes only)")
        token = token.replace("~1", "/").replace("~0", "~")
        if type(target) is not dict or token not in target:
            raise ValueError(f"unresolved $ref {ref!r}")
        target = target[token]
    if type(target) not in (dict, bool):
        raise ValueError(f"$ref {ref!r} does not target a schema")
    return target


def check_schema(schema):
    """Check the explicit supported subset, including unused definitions."""
    errors = _json_errors(schema, "schema#")
    if errors:
        return errors
    schema_nodes = set()
    references = []

    def walk(node, path):
        if type(node) is bool:
            return
        if type(node) is not dict:
            errors.append(f"{path}: schema must be an object or boolean")
            return
        schema_nodes.add(id(node))
        for key in node:
            if key not in SUPPORTED:
                errors.append(f"{_path(path, key)}: unsupported schema keyword")
        for key in ("$schema", "$id", "title", "description"):
            if key in node and type(node[key]) is not str:
                errors.append(f"{_path(path, key)}: expected string")
        for key in ("$schema", "$id"):
            if key in node and path != "schema#":
                errors.append(f"{_path(path, key)}: root metadata only in this subset")
        if "$schema" in node and node["$schema"] not in (DIALECT, DIALECT + "#"):
            errors.append(f"{_path(path, '$schema')}: unsupported schema dialect")
        if "$ref" in node:
            try:
                target = _resolve(schema, node["$ref"])
                references.append((target, _path(path, "$ref")))
            except ValueError as exc:
                errors.append(f"{_path(path, '$ref')}: {exc}")
        if "type" in node:
            kinds = node["type"] if type(node["type"]) is list else [node["type"]]
            if (not kinds or any(type(k) is not str or k not in TYPES for k in kinds)
                    or len(set(k for k in kinds if type(k) is str)) != len(kinds)):
                errors.append(f"{_path(path, 'type')}: expected known type or unique nonempty type list")
        if "required" in node:
            required = node["required"]
            if (type(required) is not list or any(type(k) is not str for k in required)
                    or len(set(k for k in required if type(k) is str)) != len(required)):
                errors.append(f"{_path(path, 'required')}: expected unique string list")
        if "enum" in node and (type(node["enum"]) is not list or not node["enum"]):
            errors.append(f"{_path(path, 'enum')}: expected nonempty list")
        for key in ("minItems", "minLength"):
            if key in node and (type(node[key]) is not int or node[key] < 0):
                errors.append(f"{_path(path, key)}: expected nonnegative integer")
        if "uniqueItems" in node and type(node["uniqueItems"]) is not bool:
            errors.append(f"{_path(path, 'uniqueItems')}: expected boolean")
        if "pattern" in node:
            try:
                if type(node["pattern"]) is not str:
                    raise ValueError("expected string")
                re.compile(node["pattern"])
            except (re.error, ValueError) as exc:
                errors.append(f"{_path(path, 'pattern')}: invalid Python-compatible pattern: {exc}")
        for key in ("$defs", "properties"):
            if key in node:
                if type(node[key]) is not dict:
                    errors.append(f"{_path(path, key)}: expected object of schemas")
                else:
                    for name, child in node[key].items():
                        walk(child, _path(_path(path, key), name))
        for key in ("items", "additionalProperties"):
            if key in node:
                walk(node[key], _path(path, key))
        if "anyOf" in node:
            if type(node["anyOf"]) is not list or not node["anyOf"]:
                errors.append(f"{_path(path, 'anyOf')}: expected nonempty list of schemas")
            else:
                for i, child in enumerate(node["anyOf"]):
                    walk(child, _path(_path(path, "anyOf"), i))

    walk(schema, "schema#")
    for target, path in references:
        if type(target) is dict and id(target) not in schema_nodes:
            errors.append(f"{path}: target is a JSON value, not a schema location")
    return errors


def _matches(value, kind):
    return {
        "null": lambda: value is None,
        "boolean": lambda: type(value) is bool,
        "object": lambda: type(value) is dict,
        "array": lambda: type(value) is list,
        "number": lambda: type(value) in (int, float),
        "integer": lambda: type(value) is int or (type(value) is float and value.is_integer()),
        "string": lambda: type(value) is str,
    }[kind]()


def validate(instance, schema):
    """Return schema or instance errors, with JSON pointer paths."""
    errors = check_schema(schema)
    if errors:
        return errors
    errors = _json_errors(instance, "#")
    if errors:
        return errors
    active = set()

    def visit(value, node, path):
        if node is True:
            return []
        if node is False:
            return [f"{path}: rejected by false schema"]
        marker = (id(value), id(node))
        if marker in active:
            return [f"{path}: unproductive schema reference cycle"]
        active.add(marker)
        found = []
        try:
            if "$ref" in node:
                found.extend(visit(value, _resolve(schema, node["$ref"]), path))
            if "type" in node:
                kinds = node["type"] if type(node["type"]) is list else [node["type"]]
                if not any(_matches(value, kind) for kind in kinds):
                    found.append(f"{path}: expected type {' or '.join(kinds)}")
            if "enum" in node and _value_key(value) not in [_value_key(v) for v in node["enum"]]:
                found.append(f"{path}: value is not in enum")
            if "const" in node and _value_key(value) != _value_key(node["const"]):
                found.append(f"{path}: value differs from const")
            if "anyOf" in node and not any(not visit(value, child, path) for child in node["anyOf"]):
                found.append(f"{path}: no anyOf branch matched")
            if type(value) is dict:
                for key in node.get("required", []):
                    if key not in value:
                        found.append(f"{_path(path, key)}: required property is missing")
                properties = node.get("properties", {})
                extra = node.get("additionalProperties", True)
                for key, child in value.items():
                    found.extend(visit(child, properties.get(key, extra), _path(path, key)))
            if type(value) is list:
                if len(value) < node.get("minItems", 0):
                    found.append(f"{path}: fewer than minItems {node['minItems']}")
                if node.get("uniqueItems", False):
                    keys = [_value_key(v) for v in value]
                    if len(set(keys)) != len(keys):
                        found.append(f"{path}: duplicate items")
                if "items" in node:
                    for i, child in enumerate(value):
                        found.extend(visit(child, node["items"], _path(path, i)))
            if type(value) is str:
                if len(value) < node.get("minLength", 0):
                    found.append(f"{path}: shorter than minLength {node['minLength']}")
                if "pattern" in node and re.search(node["pattern"], value) is None:
                    found.append(f"{path}: does not match pattern {node['pattern']!r}")
            return found
        finally:
            active.remove(marker)

    return visit(instance, schema, "#")
