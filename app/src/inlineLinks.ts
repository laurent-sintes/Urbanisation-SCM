export type InlinePart = { text: string; kind?: 'glossary' | 'model' | 'method'; target?: string; anchor?: string };
const unescape = (text: string) => text.replace(/\\([\[\]\\()])/g, '$1');
export function inlineParts(text: string): InlinePart[] {
  const pattern = /(?<!\\)\[((?:\\.|[^\]\\\n])+)\]\((glossary|model|method):([A-Za-z0-9_.-]+)(?:#([A-Za-z0-9_-]+))?\)/g;
  const parts: InlinePart[] = [];
  let from = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > from) parts.push({ text: unescape(text.slice(from, match.index)) });
    parts.push({ text: unescape(match[1]), kind: match[2] as InlinePart['kind'], target: match[3], anchor: match[4] });
    from = match.index + match[0].length;
  }
  if (from < text.length) parts.push({ text: unescape(text.slice(from)) });
  return parts;
}
export const plainInlineText = (text: string) => inlineParts(text).map(part => part.text).join('');
