import { isClosedHotspot, resolutionFor } from './hotspotResolution.ts';
import { descendantsOf, lineageOf } from './model.ts';
import type { Hotspot, PublishedModel } from './types.ts';

const LEVELS = ['S', 'M', 'L', 'XL'];

/** Actual locations include their descendants; a projected ancestor does not include siblings. */
export function hotspotRelatedElementIds(
  model: PublishedModel,
  hotspots: Hotspot[],
  projectedIds: string[] = [],
): string[] {
  return [
    ...new Set([
      ...projectedIds,
      ...hotspots.flatMap((hotspot) =>
        hotspot.location.node_ids.flatMap((id) => [id, ...descendantsOf(model, id).map((node) => node.id)]),
      ),
    ]),
  ];
}
const MATRIX_V1 = [
  ['S', 'M', 'L', 'XL'],
  ['M', 'L', 'L', 'XL'],
  ['L', 'L', 'XL', 'XL'],
  ['XL', 'XL', 'XL', 'XL'],
];

/** Mirror the published matrix-v1 rule for the filter preview; the snapshot keeps its own severity. */
export function severityForComplexities(political: string, implementation: string): string | undefined {
  if (political === 'all' || implementation === 'all') return undefined;
  if (political === 'unassessed' || implementation === 'unassessed') return 'unassessed';
  const row = LEVELS.indexOf(political);
  const column = LEVELS.indexOf(implementation);
  return row >= 0 && column >= 0 ? MATRIX_V1[row][column] : undefined;
}

export interface HotspotMapFilters {
  enabled: boolean;
  resolutionStage?: string;
  showResolved?: boolean;
  severity: string;
  severityMode: 'exact' | 'at_most' | 'at_least';
  kind: string;
  status: string;
  political: string;
  implementation: string;
  showModelHotspots?: boolean;
  showUsageHotspots?: boolean;
  showUnqualifiedHotspots?: boolean;
}

export const defaultHotspotMapFilters: HotspotMapFilters = {
  enabled: false,
  resolutionStage: 'all',
  showResolved: false,
  severity: 'all',
  severityMode: 'exact',
  kind: 'all',
  status: 'all',
  political: 'all',
  implementation: 'all',
  showModelHotspots: true,
  showUsageHotspots: true,
  showUnqualifiedHotspots: true,
};

/** Result severity and its input axes are alternative ways to filter the same classification. */
export function updateHotspotMapFilters(
  current: HotspotMapFilters,
  changes: Partial<HotspotMapFilters>,
): HotspotMapFilters {
  if (changes.resolutionStage === 'credible' || changes.status === 'resolved')
    return { ...current, ...changes, showResolved: true };
  if (changes.showResolved === false)
    return {
      ...current,
      ...changes,
      resolutionStage: current.resolutionStage === 'credible' ? 'all' : current.resolutionStage,
      status: current.status === 'resolved' ? 'all' : current.status,
    };
  if (changes.severity !== undefined || changes.severityMode !== undefined)
    return { ...current, ...changes, political: 'all', implementation: 'all' };
  if (changes.political !== undefined || changes.implementation !== undefined)
    return { ...current, ...changes, severity: 'all' };
  return { ...current, ...changes };
}

export function filterMapHotspots(hotspots: Hotspot[], filters: HotspotMapFilters): Hotspot[] {
  if (!filters.enabled) return [];
  const selectedRank = LEVELS.indexOf(filters.severity);
  return hotspots.filter(
    (hotspot) =>
      (hotspot.framing_impact?.category === 'structuring'
        ? filters.showModelHotspots !== false
        : hotspot.framing_impact?.category === 'usage'
          ? filters.showUsageHotspots !== false
          : filters.showUnqualifiedHotspots !== false) &&
      (filters.severity === 'all' ||
        (filters.severityMode === 'at_most' && selectedRank >= 0
          ? LEVELS.indexOf(hotspot.severity) >= 0 && LEVELS.indexOf(hotspot.severity) <= selectedRank
          : filters.severityMode === 'at_least' && selectedRank >= 0
            ? LEVELS.indexOf(hotspot.severity) >= selectedRank
            : hotspot.severity === filters.severity)) &&
      (filters.showResolved !== false ||
        filters.status === 'resolved' ||
        filters.resolutionStage === 'credible' ||
        !isClosedHotspot(hotspot)) &&
      (!filters.resolutionStage ||
        filters.resolutionStage === 'all' ||
        resolutionFor(hotspot).stage === filters.resolutionStage) &&
      (filters.kind === 'all' || hotspot.kind === filters.kind) &&
      (filters.status === 'all' || hotspot.status === filters.status) &&
      (filters.political === 'all' || hotspot.complexity.political === filters.political) &&
      (filters.implementation === 'all' || hotspot.complexity.implementation === filters.implementation),
  );
}

export function hotspotsInScope(model: PublishedModel, scopeId?: string): Hotspot[] {
  const hotspots = model.raw.hotspot_catalog?.hotspots || [];
  if (!scopeId) return hotspots;
  return hotspots.filter((hotspot) =>
    hotspot.location.node_ids.some(
      (anchor) => anchor === scopeId || lineageOf(model, anchor).some((node) => node.id === scopeId),
    ),
  );
}
