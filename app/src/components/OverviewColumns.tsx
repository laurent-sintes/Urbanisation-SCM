import type { ReactNode } from 'react';
import type { MapSlot } from '../mapPlacement';

/** Columns dock their systems independently; visual stacking never changes their business parent. */
export function OverviewColumns({
  slots,
  children,
  compact = false,
}: {
  slots?: readonly MapSlot[];
  children: ReactNode[];
  compact?: boolean;
}) {
  if (!slots) return children;
  return [...new Set(slots.map((slot) => slot.column))].map((column) => (
    <div className="overview-system-column" key={column} style={{ gridColumn: compact ? 1 : column + 1 }}>
      {slots.flatMap((slot, index) => (slot.column === column ? [children[index]] : []))}
    </div>
  ));
}
