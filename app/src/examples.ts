import { publicText } from './publicText.ts';
import type { AtlasNode, JsonRecord, PublishedModel } from './types.ts';

export interface ScenarioContribution {
  node_id: string;
  role: string;
  name?: string;
}
export interface ScenarioStep {
  title: string;
  description: string;
  contributions: ScenarioContribution[];
  outcome: string;
}
export interface ReaderExample {
  id?: string;
  title: string;
  situation: string;
  outcome?: string;
  lesson?: string;
  trigger?: string;
  objective?: string;
  constraints?: string[];
  options?: { title: string; description: string }[];
  contributions?: ScenarioContribution[];
  steps?: ScenarioStep[];
  validation_points?: string[];
  sourceNode?: string;
  contribution?: string;
}
type ResolveFields = (id: string) => Readonly<JsonRecord> | undefined;

function structuredExample(value: unknown): ReaderExample[] {
  if (!value || typeof value !== 'object') return [];
  const item = value as JsonRecord;
  if (typeof item.title !== 'string' || typeof item.situation !== 'string') return [];
  const result: ReaderExample = { title: publicText(item.title), situation: publicText(item.situation) };
  if (typeof item.id === 'string') result.id = item.id;
  for (const key of ['outcome', 'lesson', 'trigger', 'objective'] as const) {
    if (typeof item[key] === 'string') result[key] = publicText(item[key]);
  }
  if (Array.isArray(item.constraints))
    result.constraints = item.constraints.filter((v): v is string => typeof v === 'string').map(publicText);
  if (Array.isArray(item.options))
    result.options = item.options.flatMap((v) =>
      v && typeof v.title === 'string' && typeof v.description === 'string'
        ? [{ title: publicText(v.title), description: publicText(v.description) }]
        : [],
    );
  if (Array.isArray(item.contributions))
    result.contributions = item.contributions.flatMap((v) =>
      v && typeof v.node_id === 'string' && typeof v.role === 'string'
        ? [{ node_id: v.node_id, role: publicText(v.role) }]
        : [],
    );
  if (Array.isArray(item.steps))
    result.steps = item.steps.flatMap((step) => {
      if (
        !step ||
        typeof step.title !== 'string' ||
        typeof step.description !== 'string' ||
        typeof step.outcome !== 'string'
      )
        return [];
      const contributions = Array.isArray(step.contributions)
        ? step.contributions.flatMap((v: ScenarioContribution) =>
            v && typeof v.node_id === 'string' && typeof v.role === 'string'
              ? [{ node_id: v.node_id, role: publicText(v.role) }]
              : [],
          )
        : [];
      return [
        {
          title: publicText(step.title),
          description: publicText(step.description),
          outcome: publicText(step.outcome),
          contributions,
        },
      ];
    });
  if (Array.isArray(item.validation_points))
    result.validation_points = item.validation_points.filter((v): v is string => typeof v === 'string').map(publicText);
  return [result];
}

/** Read this snapshot only. Explicit examples in old scopes remain readable;
 * never manufacture a scenario from a definition or fetch one from the backlog. */
export function businessExamples(fields: Readonly<JsonRecord>, resolve?: ResolveFields): ReaderExample[] {
  const local = localExamples(fields);
  const shared = Array.isArray(fields.scenario_refs)
    ? fields.scenario_refs.flatMap((ref) => {
        if (!ref || typeof ref.node_id !== 'string' || typeof ref.scenario_id !== 'string') return [];
        const source = resolve?.(ref.node_id);
        const example = Array.isArray(source?.examples)
          ? source.examples.find((item) => item?.id === ref.scenario_id)
          : undefined;
        return structuredExample(example).map((item) => ({
          ...item,
          sourceNode: ref.node_id,
          ...(typeof ref.contribution === 'string' ? { contribution: publicText(ref.contribution) } : {}),
        }));
      })
    : [];
  const names = (c: ScenarioContribution): ScenarioContribution => {
    const name = resolve?.(c.node_id)?.name;
    return { ...c, ...(typeof name === 'string' ? { name: publicText(name) } : {}) };
  };
  return [...local, ...shared].map((e) => ({
    ...e,
    ...(e.contributions ? { contributions: e.contributions.map(names) } : {}),
    ...(e.steps ? { steps: e.steps.map((s) => ({ ...s, contributions: s.contributions.map(names) })) } : {}),
  }));
}
/** Reverse links are derived from the same snapshot's explicit mappings, never inferred from prose. */
export function examplesForNode(model: Pick<PublishedModel, 'nodes' | 'nodeById'>, node: AtlasNode): ReaderExample[] {
  const resolve = (id: string) => model.nodeById.get(id)?.fields;
  const result = businessExamples(node.fields, resolve);
  if (node.kind !== 'capability') return result;
  for (const owner of model.nodes) {
    if (owner.id === node.id) continue;
    for (const example of businessExamples({ examples: owner.fields.examples || [] }, resolve)) {
      const roles = [...(example.contributions || []), ...(example.steps || []).flatMap((s) => s.contributions)].filter(
        (c) => c.node_id === node.id,
      );
      if (!example.id || !roles.length || result.some((e) => e.id === example.id && e.sourceNode === owner.id))
        continue;
      result.push({ ...example, sourceNode: owner.id, contribution: [...new Set(roles.map((c) => c.role))].join(' ') });
    }
  }
  return result;
}

function localExamples(fields: Readonly<JsonRecord>): ReaderExample[] {
  if (Array.isArray(fields.examples)) return fields.examples.flatMap(structuredExample);
  const scope = typeof fields.scope === 'string' ? publicText(fields.scope) : '';
  const examples = scope.split(/\n\s*\n/).flatMap((paragraph) => {
    const marker =
      /\bExemples?(?:\s+(?:métier|fictifs?|simplifi[ée]s?|illustratifs?|concrets?|discut[ée]s?)){0,3}(?:\s+(?:FLOW|textile))?\s*(?::|\.\*\*)\s*/i.exec(
        paragraph,
      );
    if (!marker) return [];
    const situation = paragraph.slice(marker.index + marker[0].length).trim();
    return situation ? [{ title: 'Exemple illustratif', situation }] : [];
  });
  return examples.filter(
    (example, index) => examples.findIndex((other) => other.situation === example.situation) === index,
  );
}

export function exampleSearchText(fields: Readonly<JsonRecord>, resolve?: ResolveFields): string {
  return readerExamplesSearchText(businessExamples(fields, resolve));
}
export function readerExamplesSearchText(examples: readonly ReaderExample[]): string {
  return examples
    .map((e) =>
      [
        e.title,
        e.situation,
        e.outcome,
        e.lesson,
        e.trigger,
        e.objective,
        ...(e.constraints || []),
        ...(e.options || []).map((o) => `${o.title} ${o.description}`),
        ...(e.contributions || []).map((c) => `${c.name || ''} ${c.role}`),
        ...(e.steps || []).map((s) =>
          [s.title, s.description, s.outcome, ...s.contributions.map((c) => `${c.name || ''} ${c.role}`)].join(' '),
        ),
        ...(e.validation_points || []),
        e.contribution,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');
}
