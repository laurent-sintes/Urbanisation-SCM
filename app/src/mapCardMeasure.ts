/** Measure wrapped card content at a candidate width without changing the visible map. */
export function measureMapCards(
  container: HTMLElement | null,
  ids: readonly string[],
  detail: number,
  width: number,
): Map<string, number> {
  const heights = new Map<string, number>();
  if (!container || !ids.length) return heights;
  const sourceCards = new Map(
    [...container.querySelectorAll<HTMLElement>('.business-card[data-node-id]')]
      .filter((card) => card.dataset.detail === String(detail))
      .map((card) => [card.dataset.nodeId || '', card]),
  );
  if (!sourceCards.size) return heights;
  const stage = document.createElement('div');
  stage.className = 'graph-canvas zoom-width';
  stage.setAttribute('aria-hidden', 'true');
  stage.inert = true;
  Object.assign(stage.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${width}px`,
    height: 'auto',
    visibility: 'hidden',
    pointerEvents: 'none',
  });
  document.body.append(stage);
  try {
    for (const id of ids) {
      const source = sourceCards.get(id);
      if (!source) continue;
      const card = source.cloneNode(true) as HTMLElement;
      card.style.width = `${width}px`;
      card.style.height = 'auto';
      stage.append(card);
      heights.set(id, card.offsetHeight);
      card.remove();
    }
  } finally {
    stage.remove();
  }
  return heights;
}
