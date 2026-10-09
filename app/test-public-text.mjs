import assert from 'node:assert/strict';
import { test } from 'node:test';
import { businessFields } from './src/businessContent.ts';
import { shortText } from './src/presentation.ts';
import { publicText } from './src/publicText.ts';

test('data governance and capability type remain independent explicit public fields', () => {
  assert.deepEqual(businessFields({ nature: 'knowledge', data_governance: 'Domain-View', internal: 'hidden' }), {
    nature: 'knowledge',
    data_governance: 'Domain-View',
  });
  assert.deepEqual(businessFields({ nature: 'policy' }), { nature: 'policy' });
});

test('Internal annotations are hidden without erasing business conditions', () => {
  assert.equal(publicText('Notion locale en cours de consolidation ; consulter les sources et les réserves.'), '');
  assert.equal(
    publicText(
      'Précision éditoriale U435 : Conserver le fait.\n\nU436 : Seule la réservation bloque les usages concurrents.',
    ),
    'Conserver le fait.\n\nSeule la réservation bloque les usages concurrents.',
  );
  assert.equal(
    publicText('Trois parcours sont adoptés U391 : Stock Procurement, Direct Delivery, Service Procurement.'),
    'Trois parcours : Stock Procurement, Direct Delivery, Service Procurement.',
  );
  assert.equal(
    publicText('Les cinq comportements adoptés U385 sont combinables.'),
    'Les cinq comportements sont combinables.',
  );
  assert.equal(
    publicText('Deux cas sont retenus U318. Conserver le besoin.'),
    'Deux cas sont retenus. Conserver le besoin.',
  );
  assert.equal(
    publicText(
      'Le nom et la composition sont adoptés U438 ; les descriptions développées et comparaisons sont proposées.\n\nLa fusion exige des conditions compatibles.',
    ),
    'La fusion exige des conditions compatibles.',
  );
});
test('Business reservation, proposed dates, approval of scenarios and links are preserved', () => {
  const text =
    'Sous réserve de sa disponibilité. Date proposée par le fournisseur. Valider un scénario puis conserver la décision adoptée.\n\n[Reservation](model:D02.c) protège le stock en réserve.';
  assert.equal(publicText(text), text);
});

test('frontier annotations retain business restrictions without contribution codes', () => {
  assert.equal(
    publicText('Frontière U673 : Le protocole reste dans la capacité.'),
    'Frontière : Le protocole reste dans la capacité.',
  );
});

test('map previews show glossary labels without technical references before shortening', () => {
  const text = 'Recevoir les échanges entre [Supply Chain](glossary:TER084) Orchestration et les autres domaines.';
  assert.equal(shortText(text), 'Recevoir les échanges entre Supply Chain Orchestration et les autres domaines.');
  assert.equal(shortText(text, 50), 'Recevoir les échanges entre Supply Chain…');
});
