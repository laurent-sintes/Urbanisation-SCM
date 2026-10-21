/** Browser measurements shared by Catalogue framing and transition recipes. */
import assert from 'node:assert/strict';

/** Measure the actual docks, including narrow panels inside a desktop window. */
export async function assertMapOverlayCorners(page) {
  const geometry = await page.evaluate(() => {
    const frame = document.querySelector('.flow-map-canvas,.catalogue-navigation-stage');
    const navigator = frame.querySelector('.flow-navigator-tools,.catalogue-navigator');
    const legend = frame.querySelector('.map-legend');
    const camera = frame.querySelector('.flow-camera-tools');
    const rect = (element) => element.getBoundingClientRect().toJSON();
    const surfaces = [navigator, navigator?.querySelector('button'), legend.querySelector('button'), frame.querySelector('.react-flow__minimap')].filter(Boolean);
    return {
      frame: rect(frame), navigator: navigator && rect(navigator), legend: rect(legend), camera: camera && rect(camera),
      surfaces: surfaces.map((element) => ({
        opacity: getComputedStyle(element).opacity,
        background: getComputedStyle(element).backgroundColor,
        blur: getComputedStyle(element).backdropFilter,
      })),
    };
  });
  const { frame, navigator, legend } = geometry;
  if (navigator) assert.ok(navigator.x - frame.x >= 0 && navigator.x - frame.x <= 24, 'Navigator stays docked on the left');
  assert.ok(frame.right - legend.right >= 0 && frame.right - legend.right <= 32, 'Legend stays docked on the right');
  for (const [name, box] of [['Navigator', navigator], ['Legend', legend]]) {
    if (!box) continue;
    assert.ok(box.y >= frame.y && box.right <= frame.right + 1, `${name} stays inside the canvas`);
    assert.ok(frame.bottom - box.bottom >= 0 && frame.bottom - box.bottom <= 32, `${name} stays docked at the bottom`);
  }
  if (navigator) assert.ok(navigator.right + 4 <= legend.x, 'The two docks leave the centre free and never overlap');
  if (geometry.camera) {
    const camera = geometry.camera;
    assert.ok(camera.right <= frame.right && camera.bottom <= frame.bottom && camera.x >= frame.x && camera.y >= frame.y,
      'Camera tools stay inside the canvas');
    assert.ok(camera.right <= legend.x || legend.right <= camera.x || camera.bottom <= legend.y || legend.bottom <= camera.y,
      'Camera and legend remain separate, including beside native scrollbars');
  }
  for (const surface of geometry.surfaces) {
    // The Flux navigator shell is transparent; its button carries the translucent background.
    if (surface.background === 'rgba(0, 0, 0, 0)') continue;
    const alpha = Number(surface.background.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1]);
    assert.ok(alpha >= 0.54 && alpha <= 0.71, 'Floating surfaces use a moderately translucent background');
    assert.equal(surface.opacity, '1', 'Text and symbols remain fully opaque');
    assert.equal(surface.blur, 'blur(3px)', 'Floating surfaces soften the map underneath');
  }
}

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
