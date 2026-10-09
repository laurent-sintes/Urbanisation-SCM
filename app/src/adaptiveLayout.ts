/** A readable map keeps text close to its native size before using vertical scroll. */
export const MIN_READABLE_ZOOM = 0.85;

export interface LayoutCandidate {
  width: number;
  height: number;
  pageZoom: number;
}

/** Rank measured layouts without letting a tiny fitted view win over readable content. */
export function chooseLayoutCandidate<T extends LayoutCandidate>(
  candidates: readonly T[],
  mode: 'page' | 'width',
  minimumZoom = MIN_READABLE_ZOOM,
): T {
  if (!candidates.length) throw new Error('A layout needs at least one candidate');
  const readable = mode === 'page' ? candidates.filter((candidate) => candidate.pageZoom >= minimumZoom) : [];
  const choices = readable.length ? readable : candidates;
  return choices.reduce((best, candidate) => {
    if (readable.length) {
      if (candidate.pageZoom > best.pageZoom + 0.01) return candidate;
      if (candidate.pageZoom < best.pageZoom - 0.01) return best;
    }
    if (Math.abs(candidate.width - best.width) <= Math.max(candidate.width, best.width) * 0.01)
      return candidate.height < best.height ? candidate : best;
    // A slightly taller result is worthwhile when its cards can show nested content at a readable width.
    if (candidate.height < best.height * 0.88) return candidate;
    if (candidate.height > best.height * 1.12) return best;
    return candidate.width > best.width ? candidate : best;
  });
}

/** Give a clearly denser middle or first panel room for its own nested columns. */
export function overviewLayout(
  weights: readonly number[],
  availableWidth: number,
): {
  kind: 'stack' | 'equal' | 'featured';
  featuredIndex?: number;
} {
  if (availableWidth < 850) return { kind: 'stack' };
  if (weights.length !== 3) return { kind: 'equal' };
  const heaviest = weights.indexOf(Math.max(...weights));
  const otherWeight = weights.reduce((total, weight, index) => total + (index === heaviest ? 0 : weight), 0);
  if (heaviest < 2 && weights[heaviest] >= Math.max(6, otherWeight * 1.5))
    return { kind: 'featured', featuredIndex: heaviest };
  return { kind: 'equal' };
}

/** A nested group may occupy two tracks only when it dominates its siblings. */
export function prominentChildIndex(weights: readonly number[]): number | undefined {
  if (weights.length < 3) return undefined;
  const heaviest = weights.indexOf(Math.max(...weights));
  const otherWeight = weights.reduce((total, weight, index) => total + (index === heaviest ? 0 : weight), 0);
  return weights[heaviest] >= Math.max(5, otherWeight * 1.2) ? heaviest : undefined;
}
