import assert from 'node:assert/strict';
import test from 'node:test';
import { businessExamples, exampleSearchText, examplesForNode } from './src/examples.ts';
import { marketComparisonsForReading, marketSearchText } from './src/marketContent.ts';
import { adaptPublication } from './src/model.ts';
import { searchPublication } from './src/search.ts';

test('shared scenarios resolve only direct definitions from the supplied snapshot and never mutate them', () => {
  const owner = {
    examples: [
      {
        id: 'partial',
        title: 'Commande partielle',
        situation: 'Illustration.',
        trigger: 'Commande reçue',
        objective: 'Promettre',
        constraints: ['Date demandée'],
        options: [{ title: 'Regrouper', description: 'Une palette unique' }],
        contributions: [{ node_id: 'C', role: 'Comparer les coûts' }],
        source_refs: ['secret'],
      },
    ],
  };
  const local = {
    examples: [],
    scenario_refs: [{ node_id: 'D', scenario_id: 'partial', contribution: 'Dossier contextuel' }],
  };
  const before = structuredClone(owner);
  const resolve = (id) => (id === 'D' ? owner : undefined);
  assert.equal(businessExamples(local, resolve).length, 1);
  assert.equal(businessExamples(local, resolve)[0].contribution, 'Dossier contextuel');
  assert.match(exampleSearchText(local, resolve), /Une palette unique/);
  assert.match(exampleSearchText(local, resolve), /Dossier contextuel/);
  assert.doesNotMatch(exampleSearchText(local, resolve), /secret/);
  businessExamples(local, resolve)[0].options[0].title = 'Mutated';
  assert.deepEqual(owner, before);
  assert.deepEqual(businessExamples(local), []);
  assert.deepEqual(
    businessExamples(local, () => local),
    [],
  );
});

test('shared scenario details are searchable on the referencing sheet in that publication only', () => {
  const model = adaptPublication({
    space: 'release',
    version: 'scenario',
    relations: [],
    nodes: [
      {
        id: 'D',
        kind: 'domain',
        fields: {
          name: 'Supply',
          examples: [
            {
              id: 's',
              title: 'Cas',
              situation: 'Situation',
              options: [{ title: 'Express', description: 'Transport accéléré' }],
            },
          ],
        },
      },
      {
        id: 'C',
        kind: 'capability',
        fields: { name: 'PTP', scenario_refs: [{ node_id: 'D', scenario_id: 's', contribution: 'Surcoût local' }] },
      },
    ],
  });
  assert.ok(searchPublication(model, 'transport accéléré').some((hit) => hit.id === 'C'));
  assert.equal(searchPublication(model, 'surcoût local')[0].id, 'C');
  const old = adaptPublication({ space: 'release', version: 'older', relations: [], nodes: [model.nodes[1]] });
  assert.deepEqual(searchPublication(old, 'transport accéléré'), []);
});

test('explicit examples preserve situation, result and lesson without exposing their provenance', () => {
  const fields = {
    examples: [
      {
        title: 'Réception partielle',
        situation: '60 reçues sur 100.',
        outcome: '40 restantes.',
        lesson: 'Annonce et réception diffèrent.',
        source_refs: ['sourceprivee'],
        review: 'secret',
      },
    ],
  };
  assert.deepEqual(businessExamples(fields), [
    {
      title: 'Réception partielle',
      situation: '60 reçues sur 100.',
      outcome: '40 restantes.',
      lesson: 'Annonce et réception diffèrent.',
    },
  ]);
  assert.doesNotMatch(exampleSearchText(fields), /sourceprivee|secret/);
});
test('old scopes expose only explicit example paragraphs and retain their business caveats', () => {
  const fields = {
    scope:
      'Frontière. Exemple fictif : 60 puis 40. Sous réserve de capacité.\n\nUn accord ne vaut pas réception.\n\nExemple simplifié : A vers B.\n\nExemples fictifs : scinder ou regrouper.',
  };
  assert.deepEqual(
    businessExamples(fields).map((e) => e.situation),
    ['60 puis 40. Sous réserve de capacité.', 'A vers B.', 'scinder ou regrouper.'],
  );
});
test('definitions and editorial evidence do not invent examples; identical excerpts are not duplicated', () => {
  assert.deepEqual(
    businessExamples({ definition: 'Exemple : ne pas récupérer la définition.', review: 'Exemple : privé.' }),
    [],
  );
  assert.equal(businessExamples({ scope: 'Exemple : 40 pièces.\n\nExemple : 40 pièces.' }).length, 1);
  assert.deepEqual(businessExamples({ scope: 'La définition emploie des exemples dans sa méthode.' }), []);
});
test('discussed and formatted historical examples remain visible without their editorial labels', () => {
  const scope =
    'Exemple discuté : 60 autorisées et 40 en attente.\n\nExemple illustratif FLOW : contrôle ciblé.\n\n**Exemple métier fictif.** Une révision est préparée.\n\nExemple fictif textile : comparer revente et retour.';
  assert.deepEqual(
    businessExamples({ scope }).map((e) => e.situation),
    ['60 autorisées et 40 en attente.', 'contrôle ciblé.', 'Une révision est préparée.', 'comparer revente et retour.'],
  );
});
test('naming choices come first without rewriting or reclassifying the comparison records', () => {
  const a = Object.freeze({ element_name: 'A' }),
    b = Object.freeze({ element_name: 'B', term_choice: 'Terme' }),
    c = Object.freeze({ element_name: 'C', definition_choice: 'Définition' });
  const records = Object.freeze([a, b, c]);
  assert.deepEqual(marketComparisonsForReading(records), [b, c, a]);
  assert.deepEqual(records, [a, b, c]);
});
test('structured examples take precedence over their historic inline wording without mixing versions', () => {
  assert.equal(
    businessExamples({ examples: [{ title: 'Nouveau', situation: 'Publié ici.' }], scope: 'Exemple : Ancien.' })[0]
      .situation,
    'Publié ici.',
  );
  assert.deepEqual(businessExamples({ examples: [] }), []);
});
test('example contents and naming reasons are searchable, internal sources are not', () => {
  const model = adaptPublication({
    space: 'release',
    version: 'fixture',
    nodes: [
      {
        id: 'C',
        kind: 'capability',
        fields: {
          name: 'Purchase Order',
          definition: 'Achats',
          examples: [{ title: 'Réception partielle', situation: 'Manquant illustratif', source_refs: ['ultrasecret'] }],
          market_comparisons: [
            {
              term_choice: 'Choix lexical explicite',
              definition_choice: 'Frontière économique',
              source_refs: ['ultrasecret'],
            },
          ],
        },
      },
    ],
    relations: [],
  });
  assert.equal(searchPublication(model, 'manquant illustratif')[0].id, 'C');
  assert.equal(searchPublication(model, 'frontière économique')[0].id, 'C');
  assert.deepEqual(searchPublication(model, 'ultrasecret'), []);
  assert.match(marketSearchText(model.nodes[0].fields.market_comparisons), /Choix lexical explicite/);
});
test('step mappings yield snapshot-local capability links, reverse stories and searchable roles', () => {
  const data = {
    space: 'release',
    version: 'mapped',
    relations: [],
    nodes: [
      {
        id: 'D',
        kind: 'domain',
        fields: {
          name: 'Supply',
          examples: [
            {
              id: 's',
              title: 'Robe',
              situation: 'Cas fictif',
              steps: [
                {
                  title: 'Restaurer',
                  description: 'Couture ouverte',
                  outcome: 'Robe vendable',
                  contributions: [{ node_id: 'C', role: 'Réparation ciblée' }],
                },
              ],
              validation_points: ['Preuve de conformité'],
            },
          ],
        },
      },
      {
        id: 'C',
        kind: 'capability',
        fields: { name: 'Repair Order', scenario_refs: [{ node_id: 'D', scenario_id: 's', contribution: 'Réparer' }] },
      },
    ],
  };
  const before = structuredClone(data),
    model = adaptPublication(data);
  const examples = examplesForNode(model, model.nodeById.get('C'));
  assert.equal(examples.length, 1);
  assert.equal(examples[0].steps[0].contributions[0].name, 'Repair Order');
  assert.ok(searchPublication(model, 'preuve de conformité').some((n) => n.id === 'C'));
  data.nodes[1].fields.scenario_refs = [];
  const reverse = adaptPublication(data);
  assert.equal(examplesForNode(reverse, reverse.nodeById.get('C')).length, 1);
  const older = adaptPublication({ ...data, nodes: [data.nodes[1]] });
  assert.deepEqual(examplesForNode(older, older.nodeById.get('C')), []);
  examples[0].steps[0].contributions[0].role = 'Changed';
  assert.deepEqual(data.nodes[0], before.nodes[0]);
});
