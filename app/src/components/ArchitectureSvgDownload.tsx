import { Download } from 'lucide-react';
import { architectureSvg } from '../architectureSvg';
import type { PublishedModel } from '../types';
import { ui } from '../ui.ts';

export function ArchitectureSvgDownload({ model }: { model: PublishedModel }) {
  const save = () => {
    const svg = architectureSvg(
      { version: model.version, nodes: model.nodes, relations: model.relations },
      {
        title: ui('architectureSvg.title'),
        focus: ui('architectureSvg.focus'),
        domains: ui('app.domaines'),
        capabilities: ui('app.capacites_2'),
        capability: ui('architectureSvg.capability'),
        subdomains: ui('app.sous_domaines'),
        published: ui('architectureSvg.published'),
        receipt: ui('architectureSvg.receipt'),
        provenance: ui('architectureSvg.provenance'),
      },
      new URL(import.meta.env.BASE_URL, location.href).href,
    );
    const href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })),
      link = document.createElement('a');
    link.href = href;
    link.download = `flow-business-architecture-${model.version}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  return (
    <button className="map-action" type="button" onClick={save}>
      <Download size={16} aria-hidden="true" />
      {ui('architectureSvg.download')}
    </button>
  );
}
