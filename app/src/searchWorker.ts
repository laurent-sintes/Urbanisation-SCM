import type { ModelingGuide } from './modelingGuide';
import { searchPublication } from './search';
import type { PublishedModel } from './types';

let model: PublishedModel;
let guide: ModelingGuide | undefined;
let metaGuide: ModelingGuide | undefined;

self.onmessage = (
  event: MessageEvent<
    | { type: 'init'; model: PublishedModel; guide?: ModelingGuide; metaGuide?: ModelingGuide }
    | { type: 'query'; id: number; query: string }
  >,
) => {
  const message = event.data;
  if (message.type === 'init') {
    model = message.model;
    guide = message.guide;
    metaGuide = message.metaGuide;
    return;
  }
  const results = searchPublication(model, message.query, guide, metaGuide);
  self.postMessage({ id: message.id, results });
};
