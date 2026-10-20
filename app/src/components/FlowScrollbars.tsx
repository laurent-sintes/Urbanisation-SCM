import { useLayoutEffect, useRef } from 'react';
import { FLOW_SCROLLBAR_SIZE, type flowScrollGeometry } from '../flowMapScroll';
import './flow-scrollbars.css';

export function FlowScrollbars({
  geometry,
  size,
  canvasId,
  onScroll,
}: {
  geometry: ReturnType<typeof flowScrollGeometry>;
  size: { width: number; height: number };
  canvasId: string;
  onScroll: (axis: 'horizontal' | 'vertical', value: number) => void;
}) {
  const horizontal = useRef<HTMLDivElement>(null),
    vertical = useRef<HTMLDivElement>(null);
  const synchronized = useRef<Partial<Record<'horizontal' | 'vertical', number>>>({});
  useLayoutEffect(() => {
    for (const [axis, element] of [
      ['horizontal', horizontal.current],
      ['vertical', vertical.current],
    ] as const) {
      if (!element) continue;
      const property = axis === 'horizontal' ? 'scrollLeft' : 'scrollTop';
      if (Math.abs(element[property] - geometry[axis].value) > 0.75) {
        synchronized.current[axis] = geometry[axis].value;
        element[property] = geometry[axis].value;
      }
    }
  }, [geometry]);
  return (
    <>
      {(['horizontal', 'vertical'] as const).map((axis) => {
        const state = geometry[axis];
        if (!state.visible) return null;
        const horizontalAxis = axis === 'horizontal';
        const length =
          (horizontalAxis ? size.width : size.height) -
          (geometry[horizontalAxis ? 'vertical' : 'horizontal'].visible ? FLOW_SCROLLBAR_SIZE : 0);
        return (
          <div
            key={axis}
            ref={horizontalAxis ? horizontal : vertical}
            className={`flow-scrollbar is-${axis}`}
            role="scrollbar"
            tabIndex={0}
            aria-label={`Défilement ${horizontalAxis ? 'horizontal' : 'vertical'} de la carte`}
            aria-controls={canvasId}
            aria-orientation={axis}
            aria-valuemin={0}
            aria-valuemax={Math.round(state.range)}
            aria-valuenow={Math.round(state.value)}
            style={
              horizontalAxis
                ? { right: geometry.vertical.visible ? FLOW_SCROLLBAR_SIZE : 0 }
                : { bottom: geometry.horizontal.visible ? FLOW_SCROLLBAR_SIZE : 0 }
            }
            onScroll={(event) => {
              const value = horizontalAxis ? event.currentTarget.scrollLeft : event.currentTarget.scrollTop;
              const expected = synchronized.current[axis];
              delete synchronized.current[axis];
              if (expected !== undefined && Math.abs(value - expected) < 1) {
                return;
              }
              onScroll(axis, value);
            }}
          >
            <div
              aria-hidden="true"
              style={
                horizontalAxis
                  ? { width: Math.ceil(length + state.range), height: 1 }
                  : { height: Math.ceil(length + state.range), width: 1 }
              }
            />
          </div>
        );
      })}
    </>
  );
}
