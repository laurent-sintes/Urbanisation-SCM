import { staticUrl } from './publication.ts';
import type { AtlasDocument, PublishedModel } from './types';

export const DOCUMENT_CATEGORY: Record<AtlasDocument['category'], string> = {
  analysis: 'Analyse',
  source: 'Source',
  decision: 'Décision',
  guide: 'Guide',
};

export function documentUrl(model: PublishedModel, document: AtlasDocument): string {
  return staticUrl(
    `data/${encodeURIComponent(model.version)}/documents/${encodeURIComponent(document.id)}.${documentFormat(document).toLowerCase()}`,
  );
}

export function documentFormat(document: AtlasDocument): 'PDF' | 'PPTX' {
  return document.asset.media_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ? 'PPTX'
    : 'PDF';
}

export function documentDownloadName(document: AtlasDocument): string {
  return `flow-atlas-${document.id}.${documentFormat(document).toLowerCase()}`;
}

export function documentsForHotspot(model: PublishedModel, documentIds: readonly string[]): AtlasDocument[] {
  const byId = new Map((model.raw.document_catalog?.documents || []).map((document) => [document.id, document]));
  return documentIds.flatMap((id) => {
    const document = byId.get(id);
    return document ? [document] : [];
  });
}
