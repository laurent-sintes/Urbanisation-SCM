import { publicText } from './publicText.ts';
import type { JsonRecord, Qualification } from './types.ts';

/** Explicit reader-facing contract. New metadata is private until deliberately added. */
export const BUSINESS_FIELDS = [
  'name',
  'definition',
  'finality',
  'scope',
  'nature',
  'data_governance',
  'independence',
  'mastership',
] as const;
export function businessFields(fields: Readonly<JsonRecord>): Record<string, string> {
  return Object.fromEntries(
    BUSINESS_FIELDS.flatMap((key) =>
      typeof fields[key] === 'string' ? [[key, publicText(fields[key] as string)]] : [],
    ),
  );
}
export function businessQualification(qualification: Readonly<Qualification>): Qualification {
  return Object.fromEntries(
    ['meaning', 'role', 'conditions', 'effects', 'scope'].flatMap<[string, string | string[]]>((key) => {
      const value = qualification[key];
      if (typeof value === 'string') return [[key, publicText(value)]];
      if (Array.isArray(value))
        return [[key, value.filter((item) => typeof item === 'string').map((item) => publicText(item))]];
      return [];
    }),
  );
}
