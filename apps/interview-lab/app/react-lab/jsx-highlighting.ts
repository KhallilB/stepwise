import type { Plugin } from "prettier";
import typescript from "prettier/plugins/typescript";
import { format } from "prettier/standalone";

export type JsxHighlight = { start: number; length: number; kind: "class" | "property" | "string" };
type SyntaxNode = Record<string, unknown> & { type: string };
function isNode(value: unknown): value is SyntaxNode {
  return !!value && typeof value === "object" && "type" in value && typeof value.type === "string";
}

// kbui stopgap: Editor colors/theme (G7); owner approved JSX tokens using VS Dark colors.
export async function jsxHighlights(source: string): Promise<JsxHighlight[]> {
  const tokens: JsxHighlight[] = [];
  const startOffset = source.charCodeAt(0) === 0xfeff ? 1 : 0;
  const normalized = source.slice(startOffset).replace(/\r\n?/g, "\n");
  // Prettier normalizes line endings; preserve original editor offsets.
  const offsets: number[] = [];
  for (let index = startOffset; index < source.length; index++) {
    offsets.push(index);
    if (source[index] === "\r" && source[index + 1] === "\n") index++;
  }
  offsets.push(source.length);
  function color(value: unknown, kind: JsxHighlight["kind"]) {
    if (!isNode(value) || !Array.isArray(value.range)) return;
    const [start, end]: unknown[] = value.range;
    if (typeof start !== "number" || typeof end !== "number") return;
    for (const match of normalized.slice(start, end).matchAll(/\S(?:[^\r\n]*\S)?/g)) {
      const originalStart = offsets[start + match.index];
      if (originalStart !== undefined)
        tokens.push({ start: originalStart, length: match[0].length, kind });
    }
  }
  function visit(value: unknown) {
    if (!isNode(value)) return;
    if (value.type === "JSXOpeningElement" || value.type === "JSXClosingElement")
      color(value.name, "class");
    if (value.type === "JSXAttribute") color(value.name, "property");
    if (value.type === "JSXText") color(value, "string");
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (isNode(child)) visit(child);
    }
  }
  // Inspect native AST, then print empty root; comment printing is irrelevant to colors.
  const plugin: Plugin<unknown> = {
    parsers: {
      "jsx-highlight": {
        ...typescript.parsers.typescript,
        astFormat: "jsx-highlight",
        async parse(text, options) {
          visit(await typescript.parsers.typescript.parse(text, options));
          return {};
        },
        locStart: () => 0,
        locEnd: () => normalized.length,
      },
    },
    printers: { "jsx-highlight": { print: () => "" } },
  };
  try {
    await format(normalized, { filepath: "App.tsx", parser: "jsx-highlight", plugins: [plugin] });
    return tokens.sort((a, b) => a.start - b.start);
  } catch {
    // Incomplete drafts retain native lexical highlighting and real diagnostics.
    return [];
  }
}
