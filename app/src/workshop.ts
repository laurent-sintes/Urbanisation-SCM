import { useEffect, useMemo, useState } from 'react';
import { staticUrl } from './publication.ts';
import type { Hotspot, PublishedModel, RawPublication } from './types.ts';

export interface WorkshopOperation {
  sequence: number;
  entity: 'hotspot';
  action: 'add' | 'update' | 'remove';
  id: string;
  value?: Hotspot;
}

export interface WorkshopStage {
  active: true;
  schema_version: 1;
  session_id: string;
  base_version: string;
  base_model_sha256: string;
  revision: number;
  operations: WorkshopOperation[];
}

export const workshopUrl = () => staticUrl('__atlas__/workshop/staging.json');

export function overlayWorkshop(raw: RawPublication, stage: WorkshopStage): RawPublication {
  if (stage.base_version !== raw.version) return raw;
  const items = new Map((raw.hotspot_catalog?.hotspots || []).map((item) => [item.id, item]));
  for (const operation of stage.operations) {
    if (operation.entity !== 'hotspot') continue;
    if (operation.action === 'remove') items.delete(operation.id);
    else if (operation.value?.id === operation.id) items.set(operation.id, operation.value);
  }
  return {
    ...raw,
    hotspot_catalog: {
      schema_version: 1,
      source_refs: raw.hotspot_catalog?.source_refs || [],
      hotspots: [...items.values()],
    },
    workshop: {
      active: true,
      session_id: stage.session_id,
      base_version: stage.base_version,
      revision: stage.revision,
    },
  };
}

export function useWorkshop(model?: PublishedModel | null, modelSha?: string) {
  const [stage, setStage] = useState<WorkshopStage | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!['127.0.0.1', 'localhost'].includes(window.location.hostname)) return;
    let stopped = false;
    let pending = false;
    const poll = async () => {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch(workshopUrl(), { cache: 'no-store' });
        if (response.status === 404) {
          if (!stopped) {
            setStage(null);
            setError('');
          }
          return;
        }
        if (!response.ok) throw new Error(`Staging indisponible (HTTP ${response.status}).`);
        const value = await response.json();
        if (value.active && (!Array.isArray(value.operations) || typeof value.base_version !== 'string'))
          throw new Error('Staging d’atelier invalide.');
        if (!stopped) {
          setStage((previous) =>
            value.active && previous?.session_id === value.session_id && previous?.revision === value.revision
              ? previous
              : value.active
                ? value
                : null,
          );
          setError('');
        }
      } catch (cause) {
        if (!stopped) {
          setStage(null);
          setError(cause instanceof Error ? cause.message : 'Staging indisponible.');
        }
      } finally {
        pending = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);
  const active = stage?.base_version === model?.version && stage?.base_model_sha256 === modelSha ? stage : null;
  const displayModel = useMemo(
    () => (model && active ? ({ ...model, raw: overlayWorkshop(model.raw, active) } as PublishedModel) : model),
    [model, active],
  );
  return { stage, active, displayModel, error };
}

export function downloadWorkingModel(model: PublishedModel) {
  if (!model.raw.workshop) return;
  const workingDocument = { ...model.raw, space: 'workshop' };
  const payload = new Blob([JSON.stringify(workingDocument, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(payload);
  const link = document.createElement('a');
  link.href = url;
  link.download = `flow-atlas-atelier-${model.raw.workshop.session_id}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
