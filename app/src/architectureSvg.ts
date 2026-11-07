/** Vector context map generated from the hierarchy being read, with no copied business catalogue. */
export type SvgNode = { id: string; name: string; kind: string };
export type SvgRelation = { sourceId: string; targetId: string; type: string };
export type ArchitectureSvgInput = { nodes: readonly SvgNode[]; relations: readonly SvgRelation[]; version: string };
export type ArchitectureSvgLabels = {
  title: string;
  focus: string;
  domains: string;
  capabilities: string;
  capability: string;
  subdomains: string;
  published: string;
  receipt: string;
  provenance: string;
};
const xml = (value: unknown) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
function lines(value: string, limit: number) {
  const result: string[] = [];
  for (const word of value.split(/\s+/)) {
    const last = result.length - 1;
    if (last < 0 || result[last].length + word.length + 1 > limit) result.push(word);
    else result[last] += ` ${word}`;
  }
  return result;
}
export function architectureSvg(input: ArchitectureSvgInput, L: ArchitectureSvgLabels, atlasBase: string): string {
  const nodes = new Map(input.nodes.map((n) => [n.id, n]));
  const children = (id: string) =>
    input.relations
      .filter((r) => r.sourceId === id && ['contains', 'presents'].includes(r.type))
      .map((r) => nodes.get(r.targetId))
      .filter((n): n is SvgNode => Boolean(n));
  const count = (id: string) => {
    const seen = new Set<string>(),
      todo = [id];
    let result = 0;
    while (todo.length) {
      const next = todo.pop();
      if (next === undefined) break;
      if (seen.has(next)) continue;
      seen.add(next);
      if (nodes.get(next)?.kind === 'capability') result++;
      todo.push(...children(next).map((n) => n.id));
    }
    return result;
  };
  const ops = nodes.get('system-business-operations');
  if (!ops) throw Error('ERR_ARCHITECTURE_SCOPE');
  const root = input.nodes.find((n) => n.kind === 'universe');
  const systems = [
    'system-design-development',
    'system-business-operations',
    'system-enterprise-management-control',
    'domain-logistics-execution',
  ]
    .map((id) => nodes.get(id))
    .filter((n): n is SvgNode => Boolean(n && n.kind === 'business_system'));
  const domains = children(ops.id).filter((n) => n.kind === 'domain');
  const focusIds = ['domain-master-data', 'supply-chain-orchestration'];
  const focus = focusIds.flatMap((id) => domains.filter((n) => n.id === id));
  const context = domains.filter((n) => !focusIds.includes(n.id));
  const chunks: string[] = [];
  const rect = (x: number, y: number, w: number, h: number, fill: string, stroke = '#C5D6D0', width = 1.5) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
  const glyph = (value: string, x: number, y: number, size = 20, weight = 400, limit = 44, color = '#182632') =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${lines(value, limit)
      .map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.35 : 0}">${xml(line)}</tspan>`)
      .join('')}</text>`;
  const href = (id: string) => xml(`${atlasBase}#/map?${new URLSearchParams({ scope: id })}`);
  const linked = (n: SvgNode, body: string) =>
    `<a href="${href(n.id)}" data-node-id="${xml(n.id)}"><title>${xml(n.name)}</title>${body}</a>`;
  const systemHeight =
    96 + Math.max(1, ...systems.map((n) => children(n.id).filter((c) => c.kind === 'domain').length)) * 48;
  chunks.push(glyph(root?.name || L.title, 30, 48, 30, 700, 90));
  chunks.push(glyph(L.focus, 30, 80, 18, 400, 110, '#45525A'));
  const systemW = (1540 - (systems.length - 1) * 20) / Math.max(1, systems.length);
  systems.forEach((system, i) => {
    const x = 30 + i * (systemW + 20),
      inside = children(system.id).filter((n) => n.kind === 'domain');
    chunks.push(
      linked(
        system,
        rect(
          x,
          110,
          systemW,
          systemHeight,
          system.id === ops.id ? '#D9F2EA' : '#F4F5FB',
          system.id === ops.id ? '#236159' : '#CAD3DF',
          system.id === ops.id ? 3 : 1.5,
        ) + glyph(system.name, x + 18, 143, 21, 700, Math.floor(systemW / 12)),
      ),
    );
    inside.forEach((n, j) => {
      chunks.push(
        linked(
          n,
          glyph(n.name, x + 18, 200 + j * 48, 17, n.id === 'domain-master-data' ? 700 : 400, Math.floor(systemW / 9)),
        ),
      );
    });
  });
  let y = 110 + systemHeight + 60;
  chunks.push(glyph(ops.name, 30, y, 28, 700, 80));
  y += 26;
  if (context.length) {
    const w = (1540 - (context.length - 1) * 20) / context.length;
    context.forEach((n, i) => {
      const x = 30 + i * (w + 20);
      chunks.push(
        linked(
          n,
          rect(x, y, w, 100, '#FAF7F1') +
            glyph(n.name, x + 20, y + 34, 23, 700, Math.floor(w / 13)) +
            glyph(
              `${count(n.id)} ${count(n.id) === 1 ? L.capability : L.capabilities}`,
              x + 20,
              y + 78,
              17,
              400,
              70,
              '#45525A',
            ),
        ),
      );
    });
    y += 132;
  }
  for (const [index, domain] of focus.entries()) {
    const subdomains = children(domain.id).filter((n) => n.kind === 'area'),
      rows = Math.ceil(subdomains.length / 3),
      height = 104 + rows * 114;
    const master = domain.id === 'domain-master-data',
      fill = master ? '#F2ECF8' : '#F0F8F5',
      stroke = master ? '#805BA5' : '#236159';
    chunks.push(
      `<g data-domain-id="${xml(domain.id)}">` +
        linked(
          domain,
          rect(30, y, 1540, height, fill, stroke, 3) +
            glyph(domain.name, 52, y + 39, 27, 700, 80) +
            glyph(
              `${subdomains.length} ${L.subdomains} · ${count(domain.id)} ${L.capabilities}`,
              52,
              y + 72,
              17,
              400,
              100,
              '#45525A',
            ),
        ),
    );
    subdomains.forEach((n, j) => {
      const x = 52 + (j % 3) * 505,
        top = y + 94 + Math.floor(j / 3) * 114;
      chunks.push(
        linked(
          n,
          rect(
            x,
            top,
            486,
            100,
            '#FFFFFF',
            n.id === 'business-references' ? '#D1923D' : '#C5D6D0',
            n.id === 'business-references' ? 2.5 : 1,
          ) +
            glyph(n.name, x + 14, top + 27, 18, 650, 43) +
            glyph(
              `${count(n.id)} ${count(n.id) === 1 ? L.capability : L.capabilities}`,
              x + 14,
              top + 86,
              15,
              400,
              60,
              '#45525A',
            ),
        ),
      );
    });
    chunks.push('</g>');
    y += height;
    if (index < focus.length - 1) {
      chunks.push(
        `<path d="M640 ${y + 6} C640 ${y + 30},600 ${y + 35},600 ${y + 64}" fill="none" stroke="#236159" stroke-width="2" marker-end="url(#arrow)"/><path d="M1000 ${y + 64} C1000 ${y + 35},960 ${y + 30},960 ${y + 6}" fill="none" stroke="#805BA5" stroke-width="2" marker-end="url(#return)"/>` +
          glyph(L.published, 335, y + 43, 17, 600, 30, '#236159') +
          glyph(L.receipt, 1018, y + 43, 17, 600, 35, '#6C488E'),
      );
      y += 82;
    } else y += 30;
  }
  chunks.push(glyph(`${L.provenance} ${input.version}`, 30, y + 22, 16, 400, 130, '#45525A'));
  y += 54;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="${y}" viewBox="0 0 1600 ${y}" role="img" aria-labelledby="title description"><title id="title">${xml(L.title)}</title><desc id="description">${xml(L.focus)}</desc><metadata>${xml(JSON.stringify({ version: input.version, scope: ops.id, domains: domains.map((n) => n.id), capabilities: focus.map((n) => ({ id: n.id, count: count(n.id) })) }))}</metadata><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#236159"/></marker><marker id="return" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#805BA5"/></marker></defs><rect width="1600" height="${y}" fill="#FFFFFF"/><g font-family="Segoe UI,Arial,sans-serif">${chunks.join('')}</g></svg>`;
}
