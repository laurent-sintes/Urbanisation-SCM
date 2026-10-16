import { type RefObject, useLayoutEffect, useRef } from 'react';

type ScrollOffset = { top: number; left: number };
const offsets = new Map<string, ScrollOffset>();

/** Remember only this session's Catalogue reading position, independently for each publication and scope. */
export function useCatalogueScrollMemory(
  viewport: RefObject<HTMLDivElement | null>,
  publication: string,
  scope: string | undefined,
  restore: boolean,
  readySelector: string,
) {
  const key = `${publication}:${scope || '@root'}`;
  const restoring = useRef(false);
  useLayoutEffect(() => {
    const target = viewport.current;
    if (!target) return;
    const remember = () => {
      if (!restoring.current) offsets.set(key, { top: target.scrollTop, left: target.scrollLeft });
    };
    target.addEventListener('scroll', remember, { passive: true });
    return () => {
      remember();
      target.removeEventListener('scroll', remember);
    };
  }, [viewport, key]);

  useLayoutEffect(() => {
    const target = viewport.current;
    const offset = offsets.get(key);
    if (!target || !restore || !offset) return;
    restoring.current = true;
    let active = true;
    let quietTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (!active) return;
      active = false;
      restoring.current = false;
      clearTimeout(quietTimer);
      clearTimeout(deadline);
      mutations.disconnect();
      sizes.disconnect();
      target.removeEventListener('wheel', interrupt);
      target.removeEventListener('pointerdown', interrupt);
      target.removeEventListener('touchstart', interrupt);
      target.removeEventListener('keydown', interrupt);
    };
    const interrupt = () => {
      finish();
      offsets.set(key, { top: target.scrollTop, left: target.scrollLeft });
    };
    const schedule = () => {
      if (!active) return;
      clearTimeout(quietTimer);
      // Lazy cards, their measured dimensions, framing and focus settle before a single restoration.
      quietTimer = setTimeout(() => {
        if (!target.querySelector(readySelector)) return;
        target.scrollTo({ ...offset, behavior: 'instant' });
        finish();
        offsets.set(key, { top: target.scrollTop, left: target.scrollLeft });
      }, 240);
    };
    const sizes = new ResizeObserver(schedule);
    const observeContent = () => {
      sizes.observe(target);
      for (const child of target.children) sizes.observe(child);
    };
    const mutations = new MutationObserver(() => {
      observeContent();
      schedule();
    });
    mutations.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    observeContent();
    target.addEventListener('wheel', interrupt, { passive: true });
    target.addEventListener('pointerdown', interrupt, { passive: true });
    target.addEventListener('touchstart', interrupt, { passive: true });
    target.addEventListener('keydown', interrupt);
    const deadline = setTimeout(finish, 5000);
    void document.fonts.ready.then(schedule);
    schedule();
    return finish;
  }, [viewport, key, restore, readySelector]);
}
