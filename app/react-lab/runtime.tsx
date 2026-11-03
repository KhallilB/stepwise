import * as React from "react";
import * as ReactJsxRuntime from "react/jsx-runtime";
import { createRoot, type Root } from "react-dom/client";
import {
  flattenDiagnosticMessageText,
  JsxEmit,
  ModuleKind,
  ScriptTarget,
  transpileModule,
} from "typescript";
import { readProject, resolveModule } from "./project";
import { compileStyles } from "./styles";
import type { Check } from "./types";

type Boot = { code: string; checks: Check[]; runId: string };
type Result = { name: string; passed: boolean; detail: string };
type ModuleExports = { default?: React.ComponentType; [name: string]: unknown };
declare global {
  interface Window {
    startReactLab: (boot: Boot) => Promise<void>;
  }
}

const pause = (milliseconds = 35) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let root: Root | undefined;
let disposeStyles: (() => void) | undefined;

window.startReactLab = async ({ code, checks, runId }: Boot) => {
  disposeStyles?.();
  const send = (type: string, payload: object) =>
    parent.postMessage({ channel: "stepwise-react-lab", runId, type, ...payload }, "*");
  let messageCount = 0;
  const serialize = (value: unknown): string => {
    try {
      return value instanceof Error
        ? `${value.name}: ${value.message}`
        : typeof value === "string"
          ? value
          : (JSON.stringify(value) ?? String(value));
    } catch {
      return "[Unserializable value]";
    }
  };
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      if (messageCount++ < 200)
        send("console", { level, text: args.map(serialize).join(" ").slice(0, 4000) });
    };
  }
  window.addEventListener("error", (event) => send("error", { message: event.message }));
  window.addEventListener("unhandledrejection", (event) =>
    send("error", { message: String(event.reason) }),
  );
  try {
    const files = readProject(code);
    const compiled = Object.fromEntries(
      Object.entries(files)
        .filter(([path]) => !path.endsWith(".css"))
        .map(([path, source]) => {
          const result = transpileModule(source, {
            compilerOptions: {
              target: ScriptTarget.ES2022,
              module: ModuleKind.CommonJS,
              jsx: JsxEmit.ReactJSX,
              esModuleInterop: true,
            },
            reportDiagnostics: true,
            fileName: path,
          });
          const diagnostic = result.diagnostics?.find((item) => item.category === 1);
          if (diagnostic)
            throw new Error(
              `${path}: Syntax: ${flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
            );
          return [path, result.outputText];
        }),
    );
    const styleCompilers = new Map<string, ReturnType<typeof compileStyles>>();
    let exercise: ModuleExports = {};
    const mount = async () => {
      disposeStyles?.();
      root?.unmount();
      const container = document.getElementById("root");
      if (!container) throw new Error("Preview root unavailable");
      container.replaceChildren();
      const styles = new Set<string>(Object.hasOwn(files, "styles.css") ? ["styles.css"] : []);
      const cache = new Map<string, ModuleExports>();
      const load = (path: string): ModuleExports => {
        if (path.endsWith(".css")) {
          styles.add(path);
          return {};
        }
        const cached = cache.get(path);
        if (cached) return cached;
        const exports: ModuleExports = {};
        cache.set(path, exports);
        const require = (name: string) => {
          if (name === "react") return React;
          if (name === "react/jsx-runtime") return ReactJsxRuntime;
          return load(resolveModule(files, path, name));
        };
        // Learner modules execute only inside opaque preview frame.
        new Function("React", "require", "exports", `${compiled[path]}\n//# sourceURL=lab/${path}`)(
          React,
          require,
          exports,
        );
        return exports;
      };
      const exports = load("App.tsx");
      if (exports.default === undefined || exports.default === null)
        throw new Error("Export a React component as default.");
      exercise = exports;
      const styleKey = JSON.stringify([...styles]);
      let pendingCompiler = styleCompilers.get(styleKey);
      if (!pendingCompiler) {
        pendingCompiler = compileStyles(files, [...styles]);
        styleCompilers.set(styleKey, pendingCompiler);
      }
      const compiler = await pendingCompiler;
      const stylesheet = document.createElement("style");
      stylesheet.dataset.learnerStyles = "";
      document.head.appendChild(stylesheet);
      const refreshStyles = () => {
        const classes = [container, ...container.querySelectorAll<HTMLElement>("[class]")].flatMap(
          (node) => [...node.classList],
        );
        const css = compiler.build(classes);
        if (stylesheet.textContent !== css) stylesheet.textContent = css;
      };
      const observer = new MutationObserver(refreshStyles);
      observer.observe(container, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class"],
      });
      disposeStyles = () => {
        observer.disconnect();
        stylesheet.remove();
      };
      refreshStyles();
      root = createRoot(container, {
        onUncaughtError: (error) => send("error", { message: String(error) }),
        onCaughtError: (error) =>
          send("console", { level: "error", text: String(error).slice(0, 4000) }),
      });
      root.render(
        React.createElement(React.StrictMode, null, React.createElement(exports.default)),
      );
      await pause(50);
      refreshStyles();
    };
    const find = (selector: string): HTMLElement => {
      const element = document.querySelector<HTMLElement>(`#root ${selector}`);
      if (!element) throw new Error(`Missing element: ${selector}`);
      return element;
    };
    const equal = (actual: unknown, expected: unknown) => {
      if (actual !== expected)
        throw new Error(
          `Expected ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}.`,
        );
    };
    const assert = (condition: unknown, message: string) => {
      if (!condition) throw new Error(message);
    };
    const click = async (label: string) => {
      const button = Array.from(document.querySelectorAll<HTMLButtonElement>("#root button")).find(
        (item) => item.textContent?.trim() === label,
      );
      if (!button) throw new Error(`Missing button: ${label}`);
      button.click();
      await pause();
    };
    const input = async (selector: string, value: string) => {
      const field = find(selector);
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement))
        throw new Error(`Not an input: ${selector}`);
      const prototype =
        field instanceof HTMLInputElement
          ? HTMLInputElement.prototype
          : HTMLTextAreaElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      await pause();
    };
    const results: Result[] = [];
    for (const check of checks) {
      try {
        await mount();
        const run = new Function(
          "find",
          "text",
          "value",
          "click",
          "input",
          "equal",
          "assert",
          "wait",
          "exercise",
          `return (async () => { ${check.script}\n })()`,
        );
        await run(
          find,
          (selector: string) => find(selector).textContent?.trim(),
          (selector: string) => (find(selector) as HTMLInputElement).value,
          click,
          input,
          equal,
          assert,
          pause,
          exercise,
        );
        results.push({ name: check.name, passed: true, detail: "Behavior matched." });
      } catch (error) {
        results.push({
          name: check.name,
          passed: false,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
    await mount();
    send("results", { results });
  } catch (error) {
    send("error", { message: error instanceof Error ? error.message : String(error) });
  }
};
