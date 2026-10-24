import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FetchLike, fetchJson, staticUrl } from './publication.ts';
import type { Hotspot, PublishedModel, RawPublication } from './types.ts';
import { apiErrorMessage, ui } from './ui.ts';

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

export interface WorkshopTableChange {
  id: string;
  fields: Partial<
    Pick<
      Hotspot,
      | 'visible'
      | 'title'
      | 'kind'
      | 'location'
      | 'complexity'
      | 'arbitration_level'
      | 'status'
      | 'selected_option_id'
      | 'resolution_note'
      | 'resolution'
    >
  >;
}

export const workshopUrl = () => staticUrl('__atlas__/workshop/staging.json');

export async function readWorkshopStage(
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
  timeoutMs = 15000,
): Promise<WorkshopStage | null> {
  const value = await fetchJson(
    workshopUrl(),
    signal,
    async (url, init) => {
      const response = await fetcher(url, init);
      return response.status === 404 ? Response.json({ active: false }) : response;
    },
    timeoutMs,
  );
  if (!value || typeof value !== 'object') throw new Error(ui('workshop.fichier_de_seance_invalide'));
  const stage = value as WorkshopStage;
  if (!stage.active) return null;
  if (!Array.isArray(stage.operations) || typeof stage.base_version !== 'string')
    throw new Error(ui('workshop.fichier_de_seance_invalide'));
  return stage;
}

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
    const controller = new AbortController();
    const poll = async () => {
      if (stopped || pending) return;
      pending = true;
      try {
        const value = await readWorkshopStage(controller.signal);
        if (!stopped) {
          setStage((previous) =>
            value && previous?.session_id === value.session_id && (previous?.revision ?? -1) >= value.revision
              ? previous
              : value,
          );
          setError('');
        }
      } catch (cause) {
        if (!stopped) {
          setStage(null);
          setError(cause instanceof Error ? cause.message : ui('workshop.seance_indisponible'));
        }
      } finally {
        pending = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2000);
    return () => {
      stopped = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);
  const active = stage?.base_version === model?.version && stage?.base_model_sha256 === modelSha ? stage : null;
  const displayModel = useMemo(
    () => (model && active ? ({ ...model, raw: overlayWorkshop(model.raw, active) } as PublishedModel) : model),
    [model, active],
  );
  const saveHotspotChanges = useCallback(
    async (changes: WorkshopTableChange[]) => {
      if (!active) throw new Error(ui('workshop.aucun_atelier_actif_sur_cette_publication'));
      const response = await fetch(staticUrl('__atlas__/workshop/hotspots/batch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Atlas-Workshop': '1' },
        body: JSON.stringify({
          session_id: active.session_id,
          expected_revision: active.revision,
          changes,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(result));
      setStage(result as WorkshopStage);
    },
    [active],
  );
  return { stage, active, displayModel, error, saveHotspotChanges };
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
