import type { RawPublication } from './types.ts';
import { ui } from './ui.ts';

/** Apply edition-owned presentation data, never infer edits from prose or names. */
export function readerPublication(input: RawPublication): RawPublication {
  const copy = structuredClone(input);
  const projection = copy.reader_projection;
  if (!projection) return copy;
  if (projection.schema_version !== 1 || projection.publication_version !== copy.version)
    throw new Error(ui('readerContent.invalid_reader_projection_edition'));
  for (const patch of projection.patches) {
    if (
      !patch.path.length ||
      patch.path.some((key) =>
        [
          '__proto__',
          'constructor',
          'prototype',
          'id',
          'source_id',
          'target_id',
          'kind',
          'review',
          'lifecycle',
          'source_refs',
          'source_locator',
        ].includes(key),
      )
    )
      throw new Error(ui('readerContent.invalid_reader_projection_path'));
    let parent: Record<string, unknown> = copy;
    for (const key of patch.path.slice(0, -1)) {
      if (!Object.hasOwn(parent, key) || !parent[key] || typeof parent[key] !== 'object')
        throw new Error(ui('readerContent.missing_reader_projection_source'));
      parent = parent[key] as Record<string, unknown>;
    }
    const key = patch.path.at(-1) as string;
    if (!Object.hasOwn(parent, key) || typeof parent[key] !== 'string' || typeof patch.text !== 'string')
      throw new Error(ui('readerContent.invalid_reader_projection_text'));
    parent[key] = patch.text;
  }
  return copy;
}
