import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { messages, parameters, schema } from './label-resources.mjs';

const app = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve('vite/package.json'));
const { parseSync } = await import(pathToFileURL(viteRequire.resolve('rolldown/utils')).href);
const readerAttributes = new Set([
  'aria-label',
  'aria-description',
  'aria-valuetext',
  'aria-roledescription',
  'data-label',
  'title',
  'alt',
  'placeholder',
  'label',
  'labels',
  'text',
  'description',
  'caption',
  'heading',
  'intro',
  'emptyMessage',
]);
const technicalMethods = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'setAttribute',
  'getAttribute',
  'createElement',
  'addEventListener',
  'removeEventListener',
  'matchMedia',
]);
const keyboard =
  /^(Escape|Enter|Tab|Arrow(Left|Right|Up|Down)|Page(Up|Down)|Home|End|Backspace|Delete|Shift|Control|Alt|Meta|F\d+)$/;
const technical = (value) =>
  keyboard.test(value) ||
  /^(?:\.{0,2}\/|https?:|(?:glossary|method|model|principle):|#[\w-]+$|(?:var|calc|rgba?|hsla?)\(|\([\w-]+:|[\w.-]+\.(?:json|ya?ml|pdf|js|ts|svg|png)$)/.test(
    value,
  );
const human = (value) =>
  /\p{L}/u.test(value) && !technical(value) && (/[\sÀ-ÿ’]/u.test(value) || /^[A-Z][a-z]/.test(value));
const readerName =
  /(?:labels?|titles?|subtitles?|messages?|errors?|captions?|headings?|descriptions?|placeholders?|tooltips?|feedback|hints?|notice|intro|summary|text)$/i;

/** Technical literals are distinguished by syntax; there is no existing-code waiver. */
export function scanLabels(filename, source) {
  const parsed = parseSync(filename, source);
  const findings = parsed.errors.map((error) => ({ line: 1, text: String(error) }));
  const add = (node, text) => findings.push({ line: source.slice(0, node.start).split('\n').length, text });
  function walk(node, parent, inType = false, attribute, ancestors = []) {
    if (!node?.type) return;
    const typeOnly =
      inType ||
      (node.type.startsWith('TS') &&
        ![
          'TSAsExpression',
          'TSSatisfiesExpression',
          'TSNonNullExpression',
          'TSTypeAssertion',
          'TSInstantiationExpression',
        ].includes(node.type));
    if (typeOnly) return;
    const attr = ['ArrowFunctionExpression', 'FunctionExpression', 'BlockStatement'].includes(node.type)
      ? undefined
      : node.type === 'JSXAttribute'
        ? node.name.name
        : attribute;
    const labelVariable = ancestors.some(
      (ancestor) =>
        ancestor.type === 'VariableDeclarator' &&
        ancestor.id?.type === 'Identifier' &&
        readerName.test(ancestor.id.name),
    );
    const prop = parent?.type === 'Property' ? parent.key?.name || parent.key?.value : undefined;
    const reader =
      parent?.type !== 'BinaryExpression' &&
      (readerAttributes.has(attr) ||
        labelVariable ||
        readerName.test(prop ?? '') ||
        parent?.type === 'JSXExpressionContainer');
    const propertyKey =
      (parent?.type === 'Property' && parent.key === node) ||
      (parent?.type === 'MemberExpression' && parent.property === node);
    const call = ancestors.findLast((ancestor) => ancestor.type === 'CallExpression');
    const resourceCall = ['ui', 'uiCount'].includes(call?.callee?.name);
    const readerCall =
      call?.callee?.type === 'Identifier' && /^(setError|setMessage|alert|confirm|prompt)$/.test(call.callee.name);
    const errorConstructor = parent?.type === 'NewExpression' && parent.callee.name === 'Error';
    const diagnosticCode =
      errorConstructor &&
      typeof node.value === 'string' &&
      (node.value === 'integrity' || node.value.startsWith('ui.'));
    const technicalCall = call?.callee?.type === 'MemberExpression' && technicalMethods.has(call.callee.property.name);
    const styleAssignment =
      parent?.type === 'AssignmentExpression' &&
      parent.left?.type === 'MemberExpression' &&
      ['font', 'fillStyle', 'strokeStyle', 'transform'].includes(parent.left.property?.name);
    const excluded =
      propertyKey ||
      diagnosticCode ||
      (attr && !readerAttributes.has(attr)) ||
      resourceCall ||
      technicalCall ||
      styleAssignment ||
      ['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(parent?.type) ||
      ['icon', 'className', 'selector'].includes(prop);
    if (node.type === 'JSXText' && /\p{L}/u.test(node.value)) add(node, node.value.trim());
    if (
      node.type === 'Literal' &&
      typeof node.value === 'string' &&
      !excluded &&
      (((reader || readerCall || errorConstructor) && /\p{L}/u.test(node.value)) || human(node.value))
    )
      add(node, node.value);
    if (node.type === 'TemplateLiteral' && !excluded) {
      const value = node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join('');
      if ((reader && /\p{L}/u.test(value)) || human(value)) add(node, value);
    }
    if (node.type === 'CallExpression' && node.callee.name === 'ui' && node.arguments[0]?.type === 'Literal') {
      const key = node.arguments[0].value;
      if (!Object.hasOwn(messages, key)) add(node, `Unknown resource: ${key}`);
      else {
        const expected = parameters(messages[key]);
        const supplied =
          node.arguments[1]?.properties?.map((property) => property.key.name || property.key.value) ?? [];
        if (
          expected.some((parameter) => !supplied.includes(parameter)) ||
          supplied.some((parameter) => !expected.includes(parameter))
        )
          add(node, `Resource parameters differ: ${key}`);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (['comments', 'loc', 'raw', 'start', 'end'].includes(key)) continue;
      const type = ['typeAnnotation', 'typeArguments', 'typeParameters', 'returnType'].includes(key);
      if (Array.isArray(value)) {
        for (const child of value) walk(child, node, type, attr, [...ancestors, node]);
      } else if (value && typeof value === 'object') walk(value, node, type, attr, [...ancestors, node]);
    }
  }
  walk(parsed.program);
  return findings;
}

export function scanBootstrap(html) {
  const findings = [];
  const body = html.replace(/__ATLAS_TEXT_([\w.]+)__/g, (_match, key) => {
    if (!Object.hasOwn(messages, key)) findings.push(`Unknown bootstrap resource: ${key}`);
    return '';
  });
  if (/>[^<>]*\p{L}[^<>]*</u.test(body)) findings.push('Literal bootstrap text');
  for (const match of html.matchAll(/\b(?:title|alt|placeholder|aria-label)\s*=\s*(["'])(.*?)\1/g)) {
    if (match[2] && !/^__ATLAS_TEXT_[\w.]+__$/.test(match[2])) findings.push('Literal bootstrap attribute');
  }
  for (const match of html.matchAll(
    /<meta\b[^>]*(?:name|property)\s*=\s*["'](?:description|og:title|og:description|twitter:title|twitter:description)["'][^>]*>/gi,
  )) {
    const content = match[0].match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (content && !/^__ATLAS_TEXT_[\w.]+__$/.test(content)) findings.push('Literal bootstrap metadata');
  }
  return findings;
}

export function checkLabels() {
  const findings = [];
  for (const relative of fs.readdirSync(path.join(app, 'src'), { recursive: true })) {
    const file = path.join(app, 'src', relative);
    if (/\.(ts|tsx)$/.test(relative) && !relative.endsWith('.d.ts')) {
      findings.push(...scanLabels(file, fs.readFileSync(file, 'utf8')).map((row) => ({ file: relative, ...row })));
    }
    if (relative.endsWith('.css')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/content:\s*['"]([^'"]+)['"]/g)) {
        if (/\p{L}/u.test(match[1]))
          findings.push({ file: relative, line: source.slice(0, match.index).split('\n').length, text: match[1] });
      }
    }
  }
  if (fs.readFileSync(path.join(app, 'src/ui-schema.d.ts'), 'utf8') !== schema())
    findings.push({ file: 'src/ui-schema.d.ts', line: 1, text: 'Resource types need regeneration' });
  const html = fs.readFileSync(path.join(app, 'index.html'), 'utf8');
  findings.push(...scanBootstrap(html).map((text) => ({ file: 'index.html', line: 1, text })));
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = checkLabels();
  for (const finding of findings) console.error(`${finding.file}:${finding.line}: ${finding.text}`);
  if (findings.length) process.exitCode = 1;
  else console.log('Atlas labels: no embedded reader text; resource keys and parameters verified.');
}
