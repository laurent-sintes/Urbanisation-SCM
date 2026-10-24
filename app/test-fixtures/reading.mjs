import fixture from './reading-data.json' with { type: 'json' };

/** Explicit test data: synthetic publications declare their own reading contract. */
export function readingFixture(raw) {
  const copy = structuredClone(raw);
  const principles = new Set(copy.principles?.map((principle) => principle.id));
  const labels = {
    universe: 'Universe',
    business_system: 'Business System',
    domain: 'Domain',
    area: principles.has('PRINCIPLE-DOMAIN-SUBDOMAIN')
      ? 'Subdomain'
      : principles.has('PRINCIPLE-DOMAIN-PURPOSE')
        ? 'Purpose'
        : 'Area',
    business_area: 'Business Area',
    capability: 'Capability',
    behavior: 'Behavior',
    reference: 'Business Reference',
    group: 'Presentation Group',
  };
  copy.metamodel ??= {
    node_types: [...new Set(copy.nodes.map((node) => node.kind))].map((kind) => ({ kind, label: labels[kind] })),
    vocabulary: fixture.vocabulary,
  };
  copy.presentation ??= { flow_neighborhood: fixture.profile };
  return copy;
}

export const fixtureNeighborhood = fixture.profile;
export const fixtureVocabulary = fixture.vocabulary;
