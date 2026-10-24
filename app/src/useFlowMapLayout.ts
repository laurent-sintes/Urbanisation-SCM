import type { ElkNode } from 'elkjs/lib/elk.bundled.js';
import ELK from 'elkjs/lib/elk-api.js';
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url';
import { useEffect, useState } from 'react';
import { flowLayoutsFor } from './flowMapCache';
import type { FlowMapLayout } from './flowMapLayout';
import type { PublishedModel } from './types';
import { ui } from './ui.ts';

const EMPTY: FlowMapLayout = { boxes: [], exchanges: [], width: 0, height: 0 };
export const savedFlowMap = (model: PublishedModel, scopeId?: string) => flowLayoutsFor(model).get(scopeId || '');

/** The browser stays responsive during layout; only completed, immutable publication geometry is cached. */
export function useFlowMapLayout(model: PublishedModel, scopeId?: string) {
  const layouts = flowLayoutsFor(model);
  const [result, setResult] = useState<{
    layouts: Map<string, FlowMapLayout>;
    scopeId?: string;
    layout?: FlowMapLayout;
    error?: string;
  }>();
  const saved = savedFlowMap(model, scopeId);
  const current = result?.layouts === layouts && result.scopeId === scopeId ? result : undefined;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Immutable structure, not the workshop overlay object, identifies the layout job.
  useEffect(() => {
    if (savedFlowMap(model, scopeId)) return;
    const worker = new Worker(new URL('./flowMapWorker.ts', import.meta.url), { type: 'module' });
    // Sibling workers keep both ELK and Atlas routing off the UI thread, with one lifecycle to cancel.
    const engine = new ELK({
      workerFactory: () => {
        const elkWorker = new Worker(elkWorkerUrl);
        elkWorker.onerror = () => fail(ui('useFlowMapLayout.le_moteur_de_placement_est_indisponible'));
        return elkWorker;
      },
    });
    let active = true;
    const fail = (message: string) => {
      if (active) setResult({ layouts, scopeId, error: message });
      worker.terminate();
      engine.terminateWorker();
    };
    worker.onmessage = (event: MessageEvent<{ layout?: FlowMapLayout; error?: string; elkGraph?: ElkNode }>) => {
      if (!active) return;
      if (event.data.elkGraph) {
        engine
          .layout(event.data.elkGraph)
          .then((elkResult) => {
            if (active) worker.postMessage({ elkResult });
          })
          .catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
        return;
      }
      if (event.data.error || !event.data.layout) {
        fail(event.data.error || ui('useFlowMapLayout.placement_indisponible'));
        return;
      }
      layouts.set(scopeId || '', event.data.layout);
      setResult({ layouts, scopeId, layout: event.data.layout });
      worker.terminate();
      engine.terminateWorker();
    };
    worker.onerror = () => fail(ui('useFlowMapLayout.le_calcul_de_la_carte_a_echoue'));
    worker.postMessage({ raw: model.raw, scopeId });
    return () => {
      active = false;
      worker.terminate();
      engine.terminateWorker();
    };
  }, [layouts, scopeId]);
  return {
    layout: saved || current?.layout || EMPTY,
    pending: !saved && !current?.layout && !current?.error,
    error: current?.error,
  };
}
