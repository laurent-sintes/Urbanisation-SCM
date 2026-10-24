import assert from 'node:assert/strict';
import { test } from 'node:test';
import { businessFields } from './src/businessContent.ts';
import { shortText } from './src/presentation.ts';
import { publicText } from './src/publicText.ts';

test('the reader retains source wording including annotations instead of applying editorial rules', () => {
  for (const text of [
    'Quelles précisions des récits U02/U10/U30/U31 restent actuelles au regard de U953, limité aux commandes avant engagement ferme ?',
    'Notion locale en cours de consolidation ; consulter les sources et les réserves.',
    'Frontière U673 : Le protocole reste dans la capacité.',
    'Le nom et la composition sont adoptés U438 ; les descriptions développées et comparaisons sont proposées.',
    '  Sous réserve de sa disponibilité. Date proposée par le fournisseur.\n\n[Reservation](model:D02.c) protège le stock en réserve.  ',
  ])
    assert.equal(publicText(text), text);
});

test('data governance and capability type remain independent explicit public fields', () => {
  assert.deepEqual(businessFields({ nature: 'knowledge', data_governance: 'Domain-View', internal: 'hidden' }), {
    nature: 'knowledge',
    data_governance: 'Domain-View',
  });
  assert.deepEqual(businessFields({ nature: 'policy' }), { nature: 'policy' });
});

test('map previews show glossary labels without technical references before shortening', () => {
  const text = 'Recevoir les échanges entre [Supply Chain](glossary:TER084) Orchestration et les autres domaines.';
  assert.equal(shortText(text), 'Recevoir les échanges entre Supply Chain Orchestration et les autres domaines.');
  assert.equal(shortText(text, 50), 'Recevoir les échanges entre Supply Chain…');
});
