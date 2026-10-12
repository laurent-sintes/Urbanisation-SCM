/** Spatial reading rules use persistent identities, never names or display codes. */
export interface MapSlot {
  index: number;
  row: number;
  column: number;
  span: number;
}

const systems = [
  'system-design-development',
  'system-business-operations',
  'system-enterprise-management-control',
] as const;

const operationsDomains: Record<string, Omit<MapSlot, 'index'>> = {
  'domain-plan': { row: 0, column: 0, span: 2 },
  'domain-sourcing-procurement': { row: 1, column: 0, span: 1 },
  'domain-sales': { row: 1, column: 1, span: 1 },
  'supply-chain-orchestration': { row: 2, column: 0, span: 2 },
  'domain-logistics-execution': { row: 3, column: 0, span: 2 },
};

export function systemMapSlots(ids: readonly string[]): MapSlot[] | undefined {
  const logisticsId = 'domain-logistics-execution';
  const hasLogistics = ids.includes(logisticsId);
  if (ids.length !== systems.length + Number(hasLogistics) || !systems.every((id) => ids.includes(id)))
    return undefined;
  const slots = systems.map((id, column) => ({ index: ids.indexOf(id), row: 0, column, span: 1 }));
  // Logistics keeps its persistent identity when promoted from domain to system.
  if (hasLogistics) slots.push({ index: ids.indexOf(logisticsId), row: 1, column: 1, span: 1 });
  return slots;
}

/** Absent published domains stay absent; unrecognized children remain visible below the known rows. */
export function operationsMapSlots(scopeId: string | undefined, ids: readonly string[]): MapSlot[] | undefined {
  if (scopeId !== 'system-business-operations' || !ids.some((id) => Object.hasOwn(operationsDomains, id)))
    return undefined;
  let nextRow = 4;
  return ids
    .map((id, index) => ({
      index,
      ...(operationsDomains[id] || { row: nextRow++, column: 0, span: 2 }),
    }))
    .sort((a, b) => a.row - b.row || a.column - b.column);
}
