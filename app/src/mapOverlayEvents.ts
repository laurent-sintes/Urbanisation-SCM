export const MAP_PANEL_EVENT = 'atlas-map-panel-open';

export function announceMapPanel(element: HTMLElement | null, owner: string) {
  element?.dispatchEvent(new CustomEvent(MAP_PANEL_EVENT, { bubbles: true, detail: owner }));
}
