import { Button, Callout, Inline, Menu, Text, Textarea, Tooltip } from "@kb.ui/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatSource } from "./format-source";
import { maxCodeLength } from "./progress";

export function CodeEditor({
  code,
  filename = "App.tsx",
  files,
  ready,
  onChange,
  onRun,
  onOpenFile,
}: {
  code: string;
  filename?: string;
  files?: Record<string, string>;
  ready: boolean;
  onChange: (code: string) => undefined | boolean;
  onRun: () => void;
  onOpenFile: (path: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<editor.IStandaloneCodeEditor | null>(null);
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map());
  const latest = useRef({ code, filename, files, ready, onChange, onRun, onOpenFile });
  latest.current = { code, filename, files, ready, onChange, onRun, onOpenFile };
  const [loaded, setLoaded] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const formattingRef = useRef(false);
  const [plain, setPlain] = useState(false);
  const [wrap, setWrap] = useState(true);
  const wrapRef = useRef(wrap);
  wrapRef.current = wrap;
  const [error, setError] = useState("");
  const [problems, setProblems] = useState<{ message: string; line: number; column: number }[]>([]);
  const formatDocument = useCallback(async () => {
    if (!latest.current.ready || formattingRef.current) return;
    formattingRef.current = true;
    setFormatting(true);
    setError("");
    const { code, filename } = latest.current;
    try {
      if (instance.current) {
        await instance.current.getAction("editor.action.formatDocument")?.run();
      } else {
        const formatted = await formatSource(code, filename);
        if (
          latest.current.ready &&
          latest.current.filename === filename &&
          latest.current.code === code
        )
          latest.current.onChange(formatted);
      }
    } catch {
      if (latest.current.filename === filename)
        setError(
          "Formatting could not finish. Complete the JSX, TypeScript, or CSS syntax, then retry. Your draft is unchanged.",
        );
    } finally {
      formattingRef.current = false;
      setFormatting(false);
    }
  }, []);
  useEffect(() => {
    if (plain) return;
    let active = true;
    let dispose: (() => void) | undefined;
    void import("./monaco.client")
      .then(({ monaco }) => {
        if (!active || !host.current) return;
        const base = `file:///practice-${crypto.randomUUID()}/`;
        const models = new Map(
          Object.entries(
            latest.current.files ?? { [latest.current.filename]: latest.current.code },
          ).map(([path, source]) => [
            path,
            monaco.editor.createModel(
              source,
              path.endsWith(".css") ? "css" : "typescript",
              monaco.Uri.parse(base + path),
            ),
          ]),
        );
        const model = models.get(latest.current.filename);
        if (!model) throw new Error("Project entry missing");
        modelsRef.current = models;
        const view = monaco.editor.create(host.current, {
          model,
          theme: "vs-dark",
          ariaLabel: latest.current.filename,
          automaticLayout: true,
          editContext: false,
          readOnly: !latest.current.ready,
          fontSize: 13,
          lineHeight: 22,
          tabSize: 2,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          fixedOverflowWidgets: true,
          wordWrap: wrapRef.current ? "bounded" : "off",
          wordWrapColumn: 80,
          wrappingIndent: "indent",
          "semanticHighlighting.enabled": true,
          tabCompletion: "on",
          snippetSuggestions: "top",
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, highlightActiveIndentation: true },
          matchBrackets: "always",
          suggest: { showWords: false },
        });
        instance.current = view;
        const content = view.onDidChangeModelContent(() => {
          const value = view.getValue();
          if (value.length > maxCodeLength) {
            view.trigger("limit", "undo", null);
            setError(
              `Code limit is ${maxCodeLength.toLocaleString()} characters. Edit was not saved.`,
            );
            return;
          }
          setError("");
          if (latest.current.onChange(value) === false) {
            view.trigger("project-limit", "undo", null);
            setError("Project limit is 30,000 characters. Edit was not saved.");
          }
        });
        function refreshProblems() {
          setProblems(
            monaco.editor
              .getModelMarkers({ resource: view.getModel()?.uri })
              .filter((item) => item.severity >= monaco.MarkerSeverity.Warning)
              .slice(0, 8)
              .map((item) => ({
                message: item.message,
                line: item.startLineNumber,
                column: item.startColumn,
              })),
          );
        }
        const markers = monaco.editor.onDidChangeMarkers((resources) => {
          if (resources.some((uri) => uri.toString() === view.getModel()?.uri.toString()))
            refreshProblems();
        });
        const modelChange = view.onDidChangeModel(refreshProblems);
        const opener = monaco.editor.registerEditorOpener({
          openCodeEditor(source, resource, location) {
            if (source !== view) return false;
            const target = [...models].find(
              ([, model]) => model.uri.toString() === resource.toString(),
            );
            if (!target) return false;
            latest.current.onOpenFile(target[0]);
            view.setModel(target[1]);
            if (location) {
              const position =
                "startLineNumber" in location
                  ? { lineNumber: location.startLineNumber, column: location.startColumn }
                  : location;
              view.setPosition(position);
              view.revealPositionInCenter(position);
            }
            view.focus();
            return true;
          },
        });
        const command = view.addAction({
          id: "lab.run-checks",
          label: "Run interview checks",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          run: () => latest.current.onRun(),
        });
        const save = view.addAction({
          id: "lab.save-file",
          label: "Format and save file",
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyS,
          ],
          run: formatDocument,
        });
        setLoaded(true);
        dispose = () => {
          command.dispose();
          save.dispose();
          markers.dispose();
          modelChange.dispose();
          opener.dispose();
          content.dispose();
          view.dispose();
          for (const model of models.values()) model.dispose();
          modelsRef.current.clear();
          instance.current = null;
        };
      })
      .catch(() => {
        if (active) {
          setError("Monaco could not load. Plain editor remains available.");
          setPlain(true);
        }
      });
    return () => {
      active = false;
      dispose?.();
    };
  }, [plain, formatDocument]);
  useEffect(() => {
    const view = instance.current;
    for (const [path, source] of Object.entries(files ?? { [filename]: code })) {
      const model = modelsRef.current.get(path);
      if (model && model.getValue() !== source) model.setValue(source);
    }
    const next = modelsRef.current.get(filename);
    if (view && next && view.getModel() !== next) {
      view.setModel(next);
    }
    view?.updateOptions({ readOnly: !ready, ariaLabel: filename });
  }, [code, files, filename, ready]);
  useEffect(() => {
    instance.current?.updateOptions({ wordWrap: wrap ? "bounded" : "off" });
  }, [wrap]);
  return (
    <>
      <div className="lab-editor-canvas">
        {plain ? (
          <Textarea
            label={filename}
            visuallyHidden
            value={code}
            disabled={!ready}
            maxLength={maxCodeLength}
            rows={20}
            spellCheck={false}
            classNames={{ control: "lab-code-input" }}
            onValueChange={onChange}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                void formatDocument();
              }
            }}
          />
        ) : (
          <>
            <div className="lab-monaco" ref={host} aria-busy={!loaded} />
            <Tooltip content="Format document · ⌘/Ctrl S to format and save">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Format"
                className="lab-format-action"
                disabled={!loaded || !ready || formatting}
                onClick={formatDocument}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 5h11M9 10h7M9 15h11M9 20h7M3 9l2 3-2 3" />
                </svg>
              </Button>
            </Tooltip>
          </>
        )}
      </div>
      {!loaded && !plain && (
        <Text role="status" className="lab-editor-loading">
          Loading editor…
        </Text>
      )}
      {error && (
        <Callout role="alert" tone="warning">
          {error}
        </Callout>
      )}
      <Inline className="lab-editor-status" justify="between" align="start">
        {!plain && (
          <details className="lab-diagnostics">
            <summary>
              Problems · {problems.length}
              {problems.length === 8 ? "+" : ""}
            </summary>
            {problems.length ? (
              problems.map((item) => (
                <Button
                  key={`${item.line}-${item.column}-${item.message}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    instance.current?.setPosition({ lineNumber: item.line, column: item.column });
                    instance.current?.revealLineInCenter(item.line);
                    instance.current?.focus();
                  }}
                >
                  Ln {item.line}: {item.message}
                </Button>
              ))
            ) : (
              <Text size="sm">No diagnostics reported. Behavior checks still required.</Text>
            )}
          </details>
        )}
        <Menu>
          <Menu.Trigger
            render={<Button variant="ghost" size="sm" className="lab-editor-options" />}
          >
            Editor options
          </Menu.Trigger>
          <Menu.Content side="top" align="end">
            <Menu.Item disabled={plain} onClick={() => setWrap((current) => !current)}>
              {wrap ? "Disable line wrapping" : "Enable line wrapping"}
            </Menu.Item>
            <Menu.Item
              disabled={formatting}
              onClick={() => {
                setLoaded(false);
                setPlain(!plain);
                setProblems([]);
              }}
            >
              {plain ? "Use Monaco" : "Plain editor"}
            </Menu.Item>
            <Menu.Separator />
            <Text size="sm" className="lab-editor-menu-help">
              F1 commands · Ctrl Space snippets
              <br />
              ⌘/Ctrl Enter checks · ⌘/Ctrl F find
              <br />
              ⌘/Ctrl S format and save · Shift Alt F format
              <br />
              F12 definition · F2 rename · ⌘/Ctrl . quick fix
              <br />
              Ctrl M lets Tab leave editor.
              <br />
              Type rstate or reffect for React snippets.
            </Text>
          </Menu.Content>
        </Menu>
      </Inline>
    </>
  );
}
