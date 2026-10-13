import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectionMappings } from './src/applicationCatalog.ts';

test('editor coverage stays distinct from an unmapped SI and filters a module with its extensions', () => {
  const product = {
    id: 'product',
    kind: 'vendor_product',
    components: [
      { id: 'core', kind: 'product' },
      { id: 'module', parent_id: 'core', kind: 'module' },
      { id: 'extension', parent_id: 'module', kind: 'extension' },
    ],
    offering_mappings: [
      { component_id: 'core', node_id: 'commerce' },
      { component_id: 'module', node_id: 'orchestration' },
      { component_id: 'extension', node_id: 'logistics' },
    ],
  };
  const catalog = { products: [product], selections: [{ id: 'si', product_id: 'product', mappings: [] }] };
  assert.deepEqual(selectionMappings(catalog, 'si'), []);
  assert.deepEqual(selectionMappings(catalog, 'product'), product.offering_mappings);
  assert.deepEqual(selectionMappings(catalog, 'product', 'module'), product.offering_mappings.slice(1));
  assert.deepEqual(selectionMappings(catalog, 'product', 'unknown'), []);
  assert.deepEqual(selectionMappings(catalog, 'unknown'), []);
  assert.deepEqual(selectionMappings(undefined, 'product'), []);
});
