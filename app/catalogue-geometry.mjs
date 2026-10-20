/** Browser measurements shared by Catalogue framing and transition recipes. */
export async function waitForCatalogueGeometry(page) {
  await page.evaluate(() => { window.catalogueQaGeometry = undefined; });
  await page.waitForFunction(() => {
    const viewport = document.querySelector('.overview-map-scroll,.map-scroll-viewport');
    if (!viewport || document.fonts.status !== 'loaded') return false;
    const camera = viewport.querySelector('.react-flow__viewport,.urbanisation-overview');
    const signature = JSON.stringify([
      viewport.clientWidth, viewport.clientHeight, viewport.scrollWidth, viewport.scrollHeight,
      camera && getComputedStyle(camera).transform,
      ...[...viewport.querySelectorAll('.business-card,.overview-system,.hotspot-map-marker')].map((element) => {
        const box = element.getBoundingClientRect();
        return [element.dataset.nodeId || element.dataset.id, box.x, box.y, box.width, box.height];
      }),
    ]);
    const now = performance.now();
    if (window.catalogueQaGeometry?.signature !== signature)
      window.catalogueQaGeometry = { signature, since: now };
    return now - window.catalogueQaGeometry.since >= 220;
  }, undefined, { polling: 'raf' });
}

export function catalogueTextIntegrity() {
  const viewport = document.querySelector('.overview-map-scroll,.map-scroll-viewport');
  const camera = viewport.querySelector('.react-flow__viewport,.urbanisation-overview');
  const zoom = camera ? new DOMMatrix(getComputedStyle(camera).transform).a : 1;
  const texts = [];
  for (const element of viewport.querySelectorAll('.business-card,.overview-system,.container-label,.category-banner')) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (!text.textContent.trim() || text.parentElement.closest('.hotspot-map-point,.catalogue-hotspot-leaders')) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const rect of range.getClientRects())
        if (rect.width && rect.height) texts.push({ text: text.textContent.trim(), rect });
    }
  }
  const collisions = [];
  for (const marker of viewport.querySelectorAll('.hotspot-map-marker')) {
    const rect = marker.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    for (const text of texts)
      if (Math.hypot(x - Math.max(text.rect.left, Math.min(x, text.rect.right)), y - Math.max(text.rect.top, Math.min(y, text.rect.bottom))) < rect.width / 2 - 0.5)
        collisions.push({ marker: marker.dataset.id, text: text.text });
  }
  const unreadable = [...viewport.querySelectorAll('.overview-system > h3,.overview-domain-link,.overview-subdomain-link,.business-card h3,.business-card h4')]
    .filter((element) => element.getBoundingClientRect().width > 0 && Number.parseFloat(getComputedStyle(element).fontSize) * zoom < 10)
    .map((element) => element.textContent.trim());
  return { collisions, unreadable };
}
