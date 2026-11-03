import { describe, expect, it } from "vitest";
import { jsxHighlights } from "./jsx-highlighting";

async function colored(source: string) {
  return (await jsxHighlights(source)).map((token) => ({
    text: source.slice(token.start, token.start + token.length),
    kind: token.kind,
  }));
}

describe("JSX highlighting", () => {
  it("distinguishes elements, attributes and text while expressions keep native tokens", async () => {
    expect(
      await colored(
        'const view = <UI.Card disabled aria-label="card" onClick={() => count + 1}>Hello {name}<span>World</span></UI.Card>;',
      ),
    ).toEqual([
      { text: "UI.Card", kind: "class" },
      { text: "disabled", kind: "property" },
      { text: "aria-label", kind: "property" },
      { text: "onClick", kind: "property" },
      { text: "Hello", kind: "string" },
      { text: "span", kind: "class" },
      { text: "World", kind: "string" },
      { text: "span", kind: "class" },
      { text: "UI.Card", kind: "class" },
    ]);
  });

  it("does not reinterpret TypeScript generics, comparisons, comments or string contents", async () => {
    expect(
      await colored(
        'const ref = useRef<HTMLDivElement>(null); const id = <T,>(value: T) => value; const smaller = a < b; const text = "<div>hello</div>"; // <Fake />',
      ),
    ).toEqual([]);
  });

  it("handles fragments, nested expressions, spread props and CRLF text without overlap", async () => {
    const source =
      "const view = <>\r\n  Hello\r\n  world\r\n  {items.map(item => <Card {...item} value={item.id} />)}\r\n</>;";
    const tokens = await jsxHighlights(source);
    expect(await colored(source)).toEqual([
      { text: "Hello", kind: "string" },
      { text: "world", kind: "string" },
      { text: "Card", kind: "class" },
      { text: "value", kind: "property" },
    ]);
    for (let n = 0; n < tokens.length; n++) {
      const token = tokens[n];
      expect(token).toBeDefined();
      if (!token) continue;
      expect(source.slice(token.start, token.start + token.length)).not.toMatch(/[\r\n]/);
      if (n)
        expect(token.start).toBeGreaterThanOrEqual(
          (tokens[n - 1]?.start ?? 0) + (tokens[n - 1]?.length ?? 0),
        );
    }
  });

  it("falls back to native tokens for an unfinished draft", async () => {
    await expect(
      jsxHighlights("export default function App(){return <Card title={"),
    ).resolves.toEqual([]);
  });

  it("keeps original offsets for a BOM and non-ASCII JSX text", async () => {
    expect(await colored('\uFEFFconst view = <Panel title="😀">Olá 👋</Panel>;')).toEqual([
      { text: "Panel", kind: "class" },
      { text: "title", kind: "property" },
      { text: "Olá 👋", kind: "string" },
      { text: "Panel", kind: "class" },
    ]);
  });

  it("ignores fake markup in comments without losing actual JSX colors", async () => {
    expect(
      await colored("/** <Fake /> */ const view = <Card>{/* <Hidden /> */}Hello</Card>; // end"),
    ).toEqual([
      { text: "Card", kind: "class" },
      { text: "Hello", kind: "string" },
      { text: "Card", kind: "class" },
    ]);
  });
});
