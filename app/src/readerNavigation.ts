/** Scroll only the reading pane, never the app shell or the page header. */
export function revealSection(target: HTMLElement, behavior: ScrollBehavior = 'instant') {
  const pane = target.closest<HTMLElement>('.workspace-content');
  if (!pane) return;
  for (let parent: HTMLElement | null = target; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') (parent as HTMLDetailsElement).open = true;
  }
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  pane.scrollTo({
    top: pane.scrollTop + target.getBoundingClientRect().top - pane.getBoundingClientRect().top,
    behavior,
  });
}
