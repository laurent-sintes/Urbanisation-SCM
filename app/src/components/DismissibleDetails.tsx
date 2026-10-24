import { type ComponentPropsWithRef, useEffect, useImperativeHandle, useRef } from 'react';

/** A temporary disclosure. React capture also includes controls rendered in portals. */
export function DismissibleDetails({
  ref,
  onToggle,
  onPointerDownCapture,
  ...props
}: ComponentPropsWithRef<'details'>) {
  const panel = useRef<HTMLDetailsElement>(null);
  const inside = useRef(new WeakSet<Event>());
  useImperativeHandle(ref, () => panel.current as HTMLDetailsElement);
  useEffect(() => {
    const pointer = (event: PointerEvent) => {
      if (!panel.current?.open) return;
      if (inside.current.has(event) || panel.current?.contains(event.target as Node)) return;
      if (panel.current) panel.current.open = false;
    };
    const keyboard = (event: KeyboardEvent) => {
      if (!panel.current?.open || event.key !== 'Escape' || event.defaultPrevented) return;
      // Nested floating controls handle their own Escape before their parent.
      if (panel.current?.querySelector('[aria-expanded="true"], details[open]')) return;
      event.preventDefault();
      if (panel.current) panel.current.open = false;
      panel.current?.querySelector('summary')?.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keyboard);
    };
  }, []);
  return (
    <details
      {...props}
      ref={panel}
      onToggle={onToggle}
      onPointerDownCapture={(event) => {
        inside.current.add(event.nativeEvent);
        onPointerDownCapture?.(event);
      }}
    />
  );
}
