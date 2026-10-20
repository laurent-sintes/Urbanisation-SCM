export type FlowTextMeasure = (text: string, font: number) => number;

/** Explicit lines use the same measurement as the rendered font, without a CSS clamp or ellipsis. */
function wrapFlowText(text: string, width: number, font: number, measure: FlowTextMeasure): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, font) <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const character of word) {
      if (line && measure(line + character, font) > width) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export function fitFlowText(
  text: string,
  width: number,
  height: number,
  preferred: number,
  measure: FlowTextMeasure,
  minimum = 11,
) {
  let font = preferred;
  const words = text.trim().split(/\s+/);
  while (font > minimum && words.some((word) => measure(word, font) > width)) font = Math.max(minimum, font - 0.25);
  let lines = wrapFlowText(text, Math.max(1, width), font, measure);
  while (font > minimum && lines.length * font * 1.25 > height) {
    font = Math.max(minimum, font - 0.25);
    lines = wrapFlowText(text, Math.max(1, width), font, measure);
  }
  return {
    font,
    lines,
    fits: lines.length * font * 1.25 <= height && words.every((word) => measure(word, font) <= width),
  };
}
