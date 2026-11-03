import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { type NativeDriver, until } from "./native-driver";

type ProbeState = {
  report?: {
    origin: string;
    parentStorage: string;
    commands: { command: string; api: string; raw: string }[];
  };
  replies: Record<string, { allowed: boolean; value: unknown }>;
};
type NativeWindow = Window &
  typeof globalThis & {
    __TAURI_INTERNALS__: {
      invoke: (command: string, args: Record<string, unknown>) => Promise<unknown>;
      transformCallback: (callback: (value: unknown) => void, once: boolean) => number;
    };
    __NATIVE_PROBE__: ProbeState;
  };

export async function verifyNativePermissions(driver: NativeDriver) {
  const nonce = crypto.randomUUID();
  const operations = await driver.evaluate(async () => {
    const native = (window as NativeWindow).__TAURI_INTERNALS__;
    let key = "";
    const original = window.fetch;
    window.fetch = (input, init) => {
      key = new Headers(init?.headers).get("Tauri-Invoke-Key") ?? key;
      return original(input, init);
    };
    try {
      await native.invoke("cancel_local_operation", { operationId: "native-e2e-key-probe" });
    } finally {
      window.fetch = original;
    }
    if (!key) throw new Error("Could not capture authenticated IPC for hostile-frame test");
    const operations = [
      { command: "ollama_status", payload: {} },
      { command: "start_model_download", payload: { model: "qwen2.5-coder:7b" } },
      {
        command: "review_solution",
        payload: {
          requestId: "native-e2e-hostile",
          submission: {
            challengeId: "snapshot",
            stage: 0,
            code: "export default function App(){ return <p>probe</p> }",
            explanation: "Hostile frame must not reach this native operation.",
          },
        },
      },
      { command: "cancel_local_operation", payload: { operationId: "native-e2e-hostile" } },
    ];
    const state: ProbeState = { replies: {} };
    (window as NativeWindow).__NATIVE_PROBE__ = state;
    return operations.map((operation) => ({
      ...operation,
      key,
      callback: native.transformCallback((value) => {
        state.replies[operation.command] = { allowed: true, value };
      }, true),
      error: native.transformCallback((value) => {
        state.replies[operation.command] = { allowed: false, value };
      }, true),
    }));
  });
  await driver.evaluate((nonce) => {
    window.addEventListener("message", (event) => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe[title="React preview"]');
      if (event.source === frame?.contentWindow && event.data?.nativeProbe === nonce)
        (window as NativeWindow).__NATIVE_PROBE__.report = {
          ...event.data.report,
          origin: event.origin,
        };
    });
  }, nonce);
  const source = `import { useEffect } from "react";
export default function App() {
  useEffect(() => { void (async () => {
    const report = { parentStorage: "blocked", commands: [] };
    try { parent.localStorage.getItem("interview.profile.v1"); report.parentStorage = "accessible"; } catch {}
    for (const operation of ${JSON.stringify(operations)}) {
      let api = "absent", raw = "absent";
      if (window.__TAURI_INTERNALS__?.invoke) {
        try { await Promise.race([window.__TAURI_INTERNALS__.invoke(operation.command, operation.payload), new Promise((_, reject) => setTimeout(() => reject(new Error("no reply")), 1000))]); api = "allowed"; }
        catch (error) { api = String(error); }
      }
      const post = window.ipc?.postMessage?.bind(window.ipc) ?? window.webkit?.messageHandlers?.ipc?.postMessage?.bind(window.webkit.messageHandlers.ipc);
      if (post) {
        try { post(JSON.stringify({ cmd: operation.command, callback: operation.callback, error: operation.error, payload: operation.payload, options: { customProtocolIpcBlocked: true }, __TAURI_INVOKE_KEY__: operation.key })); raw = "sent"; }
        catch (error) { raw = String(error); }
      }
      report.commands.push({ command: operation.command, api, raw });
      if (api === "allowed") break;
    }
    parent.postMessage({ nativeProbe: ${JSON.stringify(nonce)}, report }, "*");
  })(); }, []);
  return <p>Native boundary probe</p>;
}`;
  const before = (await readFile(driver.log, "utf8")).match(/NATIVE_E2E command=/g)?.length ?? 0;
  await driver.fill("textarea.lab-code-input", source);
  await driver.click("Run checks");
  const report = await until("sandboxed WKWebView probe", () =>
    driver.evaluate(() => (window as NativeWindow).__NATIVE_PROBE__.report),
  ).catch(async (error) => {
    const state = await driver.evaluate(() => ({
      alerts: [...document.querySelectorAll('[role="alert"]')].map(
        (element) => element.textContent,
      ),
      scriptNonces: [...document.querySelectorAll<HTMLScriptElement>("script")].map(
        (script) => !!script.nonce,
      ),
      csp: document
        .querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]')
        ?.content?.replace(/nonce-[^' ]+/g, "nonce-present"),
      iframeBytes: document.querySelector<HTMLIFrameElement>("iframe")?.srcdoc.length,
    }));
    throw new Error(`${error}; ${JSON.stringify(state)}`);
  });
  await delay(1500);
  const replies = await driver.evaluate(() => (window as NativeWindow).__NATIVE_PROBE__.replies);
  const after = (await readFile(driver.log, "utf8")).match(/NATIVE_E2E command=/g)?.length ?? 0;
  assert.equal(report.origin, "null", "learner preview must keep its opaque origin");
  assert.equal(report.parentStorage, "blocked");
  assert.equal(report.commands.length, 4);
  assert.equal(after, before, "hostile iframe reached a native command handler");
  for (const result of report.commands) assert.notEqual(result.api, "allowed");
  for (const reply of Object.values(replies))
    assert(!reply.allowed && String(reply.value).includes("not allowed"), JSON.stringify(reply));
  return { ...report, replies, nativeHandlersReached: after - before };
}
