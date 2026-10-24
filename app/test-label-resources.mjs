import assert from 'node:assert/strict';
import test from 'node:test';
import { checkLabels, scanBootstrap, scanLabels } from './check-labels.mjs';
import { contextName } from './src/applicationCatalog.ts';
import { capabilityTypeLabel } from './src/capabilityTypes.ts';
import { iconFor } from './src/iconRegistry.ts';
import { adaptPublication } from './src/model.ts';
import { kindLabel } from './src/presentation.ts';
import { readerPublication } from './src/readerContent.ts';
import { apiErrorMessage, ui } from './src/ui.ts';

test('production reader text is externalized and every resource call has the declared parameters', () => {
  assert.deepEqual(checkLabels(), []);
});

test('the guard rejects reader text in JSX, attributes, callbacks, templates and label tables', () => {
  for (const source of [
    '<p>Bonjour</p>',
    '<p>{"bonjour"}</p>',
    'const title = "bonjour";',
    'const error = new Error("bonjour");',
    'const text = input.replace("Commerce", "Sales");',
    '<input placeholder="rechercher" />',
    'const labels = { scope: ["périmètre", "domaines"] };',
    '<button onClick={() => setMessage("Lecture impossible")}/>',
    `const title = \`Résultat \${count}\`;`,
    '<div aria-label={node.name === "Supply Chain" ? "Ouvrir" : "Fermer"}/>',
  ])
    assert.ok(scanLabels('fixture.tsx', source).length, source);
  assert.deepEqual(
    scanLabels(
      'fixture.tsx',
      'const key = "Escape"; const path = "./model.json"; const kind = "domain"; const el = document.querySelector(".map-panel button");',
    ),
    [],
  );
});

test('French quantities use full resources with explicit plural forms', () => {
  assert.equal(ui('scenarioCatalogPage.scenario_count', { count: 0 }), '0 scénario');
  assert.equal(ui('scenarioCatalogPage.scenario_count', { count: 1 }), '1 scénario');
  assert.equal(ui('scenarioCatalogPage.scenario_count', { count: 2 }), '2 scénarios');
  assert.throws(() => ui('readingHelp.prefix', {}), /missingParameter/);
  assert.throws(() => ui('missing.resource'), /missingResource/);
  assert.throws(() => ui('scenarioCatalogPage.scenario_count', { count: 'two' }), /invalidCount/);
  assert.equal(apiErrorMessage({ code: 'server.requete_invalide', parameters: {} }), 'Requête invalide.');
  assert.equal(apiErrorMessage({ error: 'Legacy local message' }), 'Legacy local message');
});

test('bootstrap ownership includes metadata and accessible attribute text', () => {
  for (const source of ['<title>Bonjour</title>', '<meta name="description" content="bonjour">', '<img alt="bonjour">'])
    assert.ok(scanBootstrap(source).length);
  assert.deepEqual(scanBootstrap('<title>__ATLAS_TEXT_bootstrap.title__</title>'), []);
  assert.ok(scanBootstrap('<title>__ATLAS_TEXT_unknown.resource__</title>').length);
});

test('vocabulary is edition-owned; a rename does not change type, nature or assigned icon', () => {
  const raw = {
    space: 'release',
    version: 'edition-a',
    relations: [],
    nodes: [{ id: 'C', kind: 'capability', fields: { name: 'First name', nature: 'decision' } }],
    metamodel: {
      node_types: [{ kind: 'capability', label: 'Type de l’édition A' }],
      vocabulary: { capability_natures: { decision: { label: 'Nature A' } } },
    },
    presentation: { icons: { C: 'GitBranch' } },
  };
  const first = adaptPublication(raw).nodeById.get('C');
  raw.nodes[0].fields.name = 'Renamed';
  const renamed = adaptPublication(raw).nodeById.get('C');
  assert.equal(kindLabel(first), 'Type de l’édition A · Nature A');
  assert.equal(kindLabel(renamed), kindLabel(first));
  assert.equal(iconFor(renamed), iconFor(first));
  raw.version = 'edition-b';
  raw.metamodel.vocabulary.capability_natures.decision.label = 'Nature B';
  assert.equal(capabilityTypeLabel(adaptPublication(raw).nodeById.get('C')), 'Nature B');
  assert.equal(capabilityTypeLabel(first), 'Nature A');
  delete raw.metamodel;
  assert.equal(capabilityTypeLabel(adaptPublication(raw).nodeById.get('C')), 'Type non documenté');
});

test('explicit presentation patches preserve the source and cannot cross publication boundaries', () => {
  const raw = {
    space: 'release',
    version: 'fixed',
    nodes: [{ id: 'N', kind: 'domain', fields: { name: 'N', definition: 'Source wording' } }],
    relations: [],
    reader_projection: {
      schema_version: 1,
      publication_version: 'fixed',
      patches: [{ path: ['nodes', '0', 'fields', 'definition'], text: 'Declared public wording' }],
    },
  };
  const before = structuredClone(raw);
  const result = readerPublication(raw);
  assert.equal(result.nodes[0].fields.definition, 'Declared public wording');
  assert.deepEqual(raw, before);
  assert.throws(() => readerPublication({ ...raw, version: 'different' }), Error);
  raw.reader_projection.patches[0].path = ['__proto__', 'polluted'];
  assert.throws(() => readerPublication(raw), Error);
});

test('historical context labels remain available before the application catalog existed', () => {
  assert.equal(contextName(undefined, 'boardriders', '2026-10-23.6'), 'SI Boardriders');
  assert.equal(contextName(undefined, 'boardriders', 'future-edition'), 'Contexte non documenté');
  assert.equal(
    contextName({ contexts: [{ id: 'boardriders', name: 'Nom de cette édition' }] }, 'boardriders', '2026-10-23.6'),
    'Nom de cette édition',
  );
});
