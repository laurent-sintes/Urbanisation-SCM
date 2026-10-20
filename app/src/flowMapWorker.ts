import type { ElkNode } from 'elkjs/lib/elk.bundled.js';
import { layoutElkFlowMap } from './flowMapElk';
import { buildFlowMap } from './flowMapLayout';
import { adaptPublication } from './model';
import type { PublishedModel } from './types';

let complete: ((graph: ElkNode) => void) | undefined;
const engine = {
  layout: (graph: ElkNode) =>
    new Promise<ElkNode>((resolve) => {
      complete = resolve;
      self.postMessage({ elkGraph: graph });
    }),
};

self.onmessage = async (event: MessageEvent<{ raw: PublishedModel['raw']; scopeId?: string; elkResult?: ElkNode }>) => {
  if (event.data.elkResult) {
    complete?.(event.data.elkResult);
    return;
  }
  try {
    const model = adaptPublication(event.data.raw);
    const seed = buildFlowMap(model, event.data.scopeId, { overviewDepth: 0 });
    self.postMessage({ layout: await layoutElkFlowMap(seed, engine) });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
