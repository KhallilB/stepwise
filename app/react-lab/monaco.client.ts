import * as monaco from "monaco-editor/editor/editor.api";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import CssWorker from "monaco-editor/languages/features/css/css.worker?worker";
import * as css from "monaco-editor/languages/features/css/register";
import * as ts from "monaco-editor/languages/features/typescript/register";
import TypeScriptWorker from "monaco-editor/languages/features/typescript/ts.worker?worker";
import "monaco-editor/languages/definitions/css/register";
import "monaco-editor/languages/definitions/typescript/register";
import "monaco-editor/editor/browser/widget/codeEditor/codeEditorWidget";
import "monaco-editor/editor/browser/coreCommands";
import "monaco-editor/editor/contrib/clipboard/browser/clipboard";
import "monaco-editor/editor/contrib/codeAction/browser/codeActionContributions";
import "monaco-editor/editor/contrib/comment/browser/comment";
import "monaco-editor/editor/contrib/contextmenu/browser/contextmenu";
import "monaco-editor/editor/contrib/find/browser/findController";
import "monaco-editor/editor/contrib/folding/browser/folding";
import "monaco-editor/editor/contrib/format/browser/formatActions";
import "monaco-editor/editor/contrib/hover/browser/hoverContribution";
import "monaco-editor/editor/contrib/gotoError/browser/gotoError";
import "monaco-editor/editor/contrib/gotoSymbol/browser/goToCommands";
import "monaco-editor/editor/contrib/rename/browser/rename";
import "monaco-editor/editor/contrib/multicursor/browser/multicursor";
import "monaco-editor/editor/contrib/parameterHints/browser/parameterHints";
import "monaco-editor/editor/contrib/snippet/browser/snippetController2";
import "monaco-editor/editor/contrib/suggest/browser/suggestController";
import "monaco-editor/editor/contrib/semanticTokens/browser/documentSemanticTokens";
import "monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching";
import "monaco-editor/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode";
import "monaco-editor/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess";
import "../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css";
import reactGlobals from "../../node_modules/@types/react/global.d.ts?raw";
import reactTypes from "../../node_modules/@types/react/index.d.ts?raw";
import reactJsxTypes from "../../node_modules/@types/react/jsx-runtime.d.ts?raw";
import cssTypes from "../../node_modules/csstype/index.d.ts?raw";
import { formatSource } from "./format-source";

self.MonacoEnvironment = {
  getWorker: (_id, label) =>
    label === "typescript" || label === "javascript"
      ? new TypeScriptWorker()
      : label === "css"
        ? new CssWorker()
        : new EditorWorker(),
};
css.cssDefaults.setOptions({
  validate: true,
  data: {
    dataProviders: {
      tailwind: {
        version: 1.1,
        atDirectives: [
          "@theme",
          "@apply",
          "@utility",
          "@variant",
          "@custom-variant",
          "@tailwind",
        ].map((name) => ({ name })),
      },
    },
  },
});
css.cssDefaults.setModeConfiguration({
  ...css.cssDefaults.modeConfiguration,
  documentFormattingEdits: false,
  documentRangeFormattingEdits: false,
});
ts.typescriptDefaults.setModeConfiguration({
  ...ts.typescriptDefaults.modeConfiguration,
  documentRangeFormattingEdits: false,
});
ts.typescriptDefaults.setCompilerOptions({
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  esModuleInterop: true,
  allowNonTsExtensions: true,
  noEmit: true,
  skipLibCheck: true,
});
ts.typescriptDefaults.addExtraLib(reactTypes, "file:///node_modules/@types/react/index.d.ts");
ts.typescriptDefaults.addExtraLib(reactGlobals, "file:///node_modules/@types/react/global.d.ts");
ts.typescriptDefaults.addExtraLib(
  reactJsxTypes,
  "file:///node_modules/@types/react/jsx-runtime.d.ts",
);
ts.typescriptDefaults.addExtraLib(cssTypes, "file:///node_modules/csstype/index.d.ts");
ts.typescriptDefaults.addExtraLib(
  'declare module "*.css" {}',
  "file:///node_modules/@types/practice-css/index.d.ts",
);
ts.typescriptDefaults.setEagerModelSync(true);

const formattingProvider: monaco.languages.DocumentFormattingEditProvider = {
  async provideDocumentFormattingEdits(model, _options, token) {
    const version = model.getVersionId();
    const source = model.getValue();
    const view = monaco.editor.getEditors().find((view) => view.getModel() === model);
    const columns = view
      ? Math.floor(
          view.getLayoutInfo().contentWidth /
            view.getOption(monaco.editor.EditorOption.fontInfo).typicalHalfwidthCharacterWidth,
        ) - 2
      : 80;
    const text = await formatSource(source, model.uri.path, Math.max(40, Math.min(80, columns)));
    if (token.isCancellationRequested || model.isDisposed() || model.getVersionId() !== version)
      return [];
    return [{ range: model.getFullModelRange(), text, eol: monaco.editor.EndOfLineSequence.LF }];
  },
};
monaco.languages.registerDocumentFormattingEditProvider("typescript", formattingProvider);
monaco.languages.registerDocumentFormattingEditProvider("css", formattingProvider);
monaco.languages.registerDocumentSemanticTokensProvider("typescript", {
  getLegend: () => ({ tokenTypes: ["tag", "attribute.name", "string"], tokenModifiers: [] }),
  async provideDocumentSemanticTokens(model, _lastResultId, token) {
    if (!/\.[jt]sx$/.test(model.uri.path)) return { data: new Uint32Array() };
    const version = model.getVersionId();
    const source = model.getValue();
    const { jsxHighlights } = await import("./jsx-highlighting");
    const spans = await jsxHighlights(source);
    if (token.isCancellationRequested || model.isDisposed() || model.getVersionId() !== version)
      return null;
    const data: number[] = [];
    let previousLine = 0,
      previousColumn = 0;
    for (const span of spans) {
      const position = model.getPositionAt(span.start);
      const line = position.lineNumber - 1,
        column = position.column - 1;
      data.push(
        line - previousLine,
        line === previousLine ? column - previousColumn : column,
        span.length,
        span.kind === "class" ? 0 : span.kind === "property" ? 1 : 2,
        0,
      );
      previousLine = line;
      previousColumn = column;
    }
    return { data: new Uint32Array(data) };
  },
  releaseDocumentSemanticTokens() {},
});

const snippets = [
  {
    label: "rcomponent",
    detail: "React function component",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "export default function ${1:App}() {\n  return (\n    <${2:section}>\n      $0\n    </${2:section}>\n  );\n}",
  },
  {
    label: "rstate",
    detail: "State with functional setter",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "const [${1:count}, ${2:setCount}] = useState(${3:0});",
  },
  {
    label: "reffect",
    detail: "Effect with cleanup",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "useEffect(() => {\n  $1\n  return () => {\n    $2\n  };\n}, [${3}]);",
  },
  {
    label: "rref",
    detail: "Typed DOM ref",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "const ${1:inputRef} = useRef<${2:HTMLInputElement}>(null);",
  },
  {
    label: "rmemo",
    detail: "Derived memoized value",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "const ${1:value} = useMemo(() => ${2:compute()}, [${3}]);",
  },
  {
    label: "rreducer",
    detail: "Reducer state",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "const [${1:state}, ${2:dispatch}] = useReducer(${3:reducer}, ${4:initialState});",
  },
  {
    label: "rcallback",
    detail: "Memoized callback",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Monaco snippet placeholders.
    text: "const ${1:handleClick} = useCallback(() => {\n  $2\n}, [${3}]);",
  },
];
monaco.languages.registerCompletionItemProvider("typescript", {
  provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn,
    );
    return {
      suggestions: snippets.map((item) => ({
        label: item.label,
        detail: item.detail,
        documentation: "React practice snippet. Import any hooks used from react.",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: item.text,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      })),
    };
  },
});

export { monaco };
