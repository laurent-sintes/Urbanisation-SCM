import type { FlowMapBox } from './flowMapLayout.ts';
import type { FlowPortChoices, FlowRoutingInput } from './flowMapRouting.ts';
import { flowFacingSides } from './flowMapSpacing.ts';

/** Choose an external face when an intermediate territory blocks the facing corridor. */
export function bypassPorts(
  inputs: readonly FlowRoutingInput[],
  boxes: readonly FlowMapBox[],
  clockwise: boolean,
): FlowPortChoices {
  const choices = new Map<string, readonly [number, number]>();
  for (const edge of inputs) {
    const { source: s, target: t } = edge;
    const faces = flowFacingSides(s, t);
    const horizontal = faces[0] < 2 && faces[1] < 2;
    const vertical = faces[0] >= 2 && faces[1] >= 2;
    const x = (s.x + s.width / 2 + t.x + t.width / 2) / 2;
    const y = (s.y + s.height / 2 + t.y + t.height / 2) / 2;
    const blocked = boxes.some(
      (box) =>
        box.id !== s.id &&
        box.id !== t.id &&
        (horizontal
          ? box.x > Math.min(s.x, t.x) && box.x < Math.max(s.x, t.x) && box.y <= y && box.y + box.height >= y
          : vertical &&
            box.y > Math.min(s.y, t.y) &&
            box.y < Math.max(s.y, t.y) &&
            box.x <= x &&
            box.x + box.width >= x),
    );
    if (blocked) choices.set(edge.id, horizontal ? (clockwise ? [3, 3] : [2, 2]) : clockwise ? [0, 0] : [1, 1]);
  }
  return choices;
}
