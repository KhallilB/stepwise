import ts from "typescript";
import { expect, it } from "vitest";
import { challenges } from "./curriculum";
import { readProject } from "./project";

const buildIds = [
  "product-projection",
  "stock-availability",
  "cart-lookup",
  "sales-summary",
  "merge-feed-pages",
  "rank-products",
  "tag-facets",
  "activity-window",
  "timeline-seek",
  "comment-tree",
  "command-history",
  "dependency-planner",
  "build-directory",
  "build-board",
  "build-checkout",
  "build-virtual-feed",
  "build-async-registration",
  "build-concurrent-stars",
  "build-conflict-editor",
];

it("build exercises leave application state, functions, imports and markup to the learner", () => {
  expect(
    challenges
      .filter((c) => c.track === "build" || c.track === "algorithms")
      .map((c) => c.id)
      .sort(),
  ).toEqual([...buildIds].sort());
  expect(challenges.filter((c) => c.kind === "build")).toHaveLength(19);
  for (const id of buildIds) {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) throw new Error(`Missing ${id}`);
    const files = readProject(challenge.starter);
    const app = ts.createSourceFile(
      "App.tsx",
      files["App.tsx"] ?? "",
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    expect(app.statements.length, id).toBe(1);
    expect(challenge.kind, id).toBe("build");
    const entry = app.statements[0];
    expect(entry && ts.isFunctionDeclaration(entry), id).toBe(true);
    if (!entry || !ts.isFunctionDeclaration(entry)) throw new Error(`Missing App entry for ${id}`);
    expect(entry.name?.text, id).toBe("App");
    expect(entry.body?.statements.length, id).toBe(1);
    const result = entry.body?.statements[0];
    expect(
      result &&
        ts.isReturnStatement(result) &&
        result.expression?.kind === ts.SyntaxKind.NullKeyword,
      id,
    ).toBe(true);
    expect(challenge.requirements.join(" "), id).toContain("own state");
  }
});

it("debugging exercises retain their existing buggy implementation", () => {
  const snapshot = challenges.find((c) => c.id === "snapshot");
  expect(snapshot?.kind).not.toBe("build");
  expect(snapshot?.starter).toContain("setCount(count + 1)");
  expect(snapshot?.starter.match(/setCount\(count \+ 1\)/g)).toHaveLength(3);
  expect(challenges.find((c) => c.id === "semantic-action")?.starter).toContain("onClick");
});

it("build files are valid strict TSX/TypeScript and fixtures contain no React hooks", () => {
  const directory = decodeURIComponent(new URL(".", import.meta.url).pathname);
  const sources = new Map(
    challenges
      .filter((c) => c.kind === "build")
      .flatMap((challenge) =>
        Object.entries(readProject(challenge.starter)).map(([path, source]) => [
          `${directory}__build-${challenge.id}/${path}`,
          source,
        ]),
      ),
  );
  for (const [path, source] of sources) {
    if (path.endsWith("fixtures.ts"))
      expect(source, path).not.toMatch(/\buse(?:State|Reducer|Ref|Effect|Memo|Callback)\b/);
  }
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: ["react"],
  };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (path, version, error, fresh) =>
    sources.has(path)
      ? ts.createSourceFile(
          path,
          sources.get(path) ?? "",
          version,
          true,
          path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
        )
      : original(path, version, error, fresh);
  const program = ts.createProgram([...sources.keys()], options, host);
  expect(
    ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.file && sources.has(d.file.fileName))
      .map((d) => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`),
  ).toEqual([]);
});
