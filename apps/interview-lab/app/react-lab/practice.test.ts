import ts from "typescript";
import { expect, it } from "vitest";
import { advancedBuilds } from "./advanced-builds";
import { algorithmPractice } from "./algorithm-practice";
import { designPractice } from "./design-practice";
import { foundations } from "./foundations";
import { frontendHard } from "./frontend-hard";
import { frontendPractice } from "./frontend-practice";
import { practice } from "./practice";

it("new starters and references are valid strict TSX in the editor's React environment", () => {
  const directory = decodeURIComponent(new URL(".", import.meta.url).pathname);
  const sources = new Map(
    [
      ...practice,
      ...advancedBuilds,
      ...foundations,
      ...designPractice,
      ...frontendPractice,
      ...frontendHard,
      ...algorithmPractice,
    ].flatMap((challenge) =>
      (["starter", "solution"] as const).map((kind) => [
        `${directory}__${challenge.id}-${kind}.tsx`,
        challenge[kind],
      ]),
    ),
  );
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    jsx: ts.JsxEmit.React,
    strict: true,
    esModuleInterop: true,
    allowUmdGlobalAccess: true,
    skipLibCheck: true,
    noEmit: true,
    types: ["react"],
  };
  const host = ts.createCompilerHost(options);
  const originalSource = host.getSourceFile.bind(host);
  host.getSourceFile = (path, languageVersion, onError, createNew) =>
    sources.has(path)
      ? ts.createSourceFile(path, sources.get(path) ?? "", languageVersion, true, ts.ScriptKind.TSX)
      : originalSource(path, languageVersion, onError, createNew);
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file && sources.has(d.file.fileName));
  expect(
    diagnostics.map(
      (d) =>
        `${d.file?.fileName.split("/").pop()}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
    ),
  ).toEqual([]);
});
