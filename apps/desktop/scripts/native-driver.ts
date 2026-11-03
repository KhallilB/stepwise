import { strict as assert } from "node:assert";
import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

export async function until<T>(
  name: string,
  check: () => Promise<T>,
  timeout = 30000,
): Promise<NonNullable<T>> {
  const deadline = Date.now() + timeout;
  let last: unknown;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value as NonNullable<T>;
    } catch (error) {
      last = error;
    }
    await delay(200);
  }
  throw new Error(`${name} timed out${last ? `: ${last}` : ""}`);
}

export class NativeDriver {
  private constructor(
    readonly app: ChildProcess,
    readonly log: string,
    private readonly base: string,
  ) {}

  static async launch(binary: string, data: string, log: string) {
    const listener = createServer();
    await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
    const address = listener.address();
    assert(address && typeof address !== "string");
    const port = address.port;
    await new Promise<void>((resolve) => listener.close(() => resolve()));
    const output = openSync(log, "w");
    const app = spawn(binary, [], {
      env: { ...process.env, TAURI_WEBDRIVER_PORT: String(port), INTERVIEW_E2E_DATA_DIR: data },
      stdio: ["ignore", output, output],
    });
    closeSync(output);
    const driver = new NativeDriver(app, log, `http://127.0.0.1:${port}`);
    app.on("error", (error) => console.error("Native app launch failed", error));
    try {
      await until("native WebDriver startup", async () => {
        assert(!app.signalCode && app.exitCode === null, await readFile(log, "utf8"));
        const response = await fetch(`${driver.base}/status`, {
          signal: AbortSignal.timeout(1000),
        });
        return response.ok;
      });
      await until("native frontend startup", () =>
        driver.evaluate(() => !!document.querySelector("h1")),
      );
      return driver;
    } catch (error) {
      driver.stop();
      throw error;
    }
  }

  async evaluate<T, A extends unknown[]>(
    fn: (...args: A) => T | Promise<T>,
    ...args: A
  ): Promise<T> {
    const id = crypto.randomUUID();
    const script = `const done = arguments[arguments.length - 1];
      const cache = window.__NATIVE_E2E_EVAL__ ??= new Map();
      const id = ${JSON.stringify(id)};
      if (!cache.has(id)) cache.set(id, Promise.resolve()
        .then(() => (${fn.toString()})(...${JSON.stringify(args)}))
        .then(value => ({ ok: true, value }), error => ({ ok: false, error: String(error) })));
      cache.get(id).then(done);`;
    const response = await fetch(`${this.base}/wdio/eval`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ script, timeout_ms: 15000 }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    assert(response.ok && !result.error, JSON.stringify(result));
    return result.value as T;
  }

  async navigate(path: string) {
    const marker = crypto.randomUUID();
    await this.evaluate(
      (path, marker) => {
        Reflect.set(window, "__NATIVE_NAV__", marker);
        location.href = `${location.origin}${path}`;
      },
      path,
      marker,
    ).catch(() => {});
    await until(`navigate ${path}`, () =>
      this.evaluate(
        (path, marker) =>
          Reflect.get(window, "__NATIVE_NAV__") !== marker &&
          location.pathname === path &&
          !!document.querySelector("h1"),
        path,
        marker,
      ),
    );
  }

  async click(name: string) {
    await until(`click ${name}`, () =>
      this.evaluate((name) => {
        const button = [...document.querySelectorAll<HTMLElement>("button, [role=menuitem]")].find(
          (element) => {
            if (element.getAttribute("aria-label") === name) return true;
            const content = element.cloneNode(true) as HTMLElement;
            for (const hidden of content.querySelectorAll('[aria-hidden="true"], svg'))
              hidden.remove();
            return content.textContent?.replace(/\s+/g, " ").trim() === name;
          },
        );
        if (!button || button.hasAttribute("disabled")) return false;
        button.click();
        return true;
      }, name),
    ).catch(async (error) => {
      const state = await this.evaluate(() => ({
        path: location.pathname,
        heading: document.querySelector("h1")?.textContent,
        buttons: [...document.querySelectorAll("button")].map((button) => ({
          text: button.textContent?.trim(),
          label: button.getAttribute("aria-label"),
          disabled: button.disabled,
        })),
      }));
      throw new Error(`${error}; ${JSON.stringify(state)}`);
    });
  }

  async fill(selector: string, value: string) {
    await until(`fill ${selector}`, () =>
      this.evaluate(
        (selector, value) => {
          const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
          if (!input) return false;
          const prototype =
            input instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return input.value === value;
        },
        selector,
        value,
      ),
    );
  }

  async close() {
    const children = this.children();
    const response = await fetch(`${this.base}/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ capabilities: { alwaysMatch: {} } }),
    });
    const { value } = await response.json();
    await fetch(`${this.base}/session/${value.sessionId}/window`, { method: "DELETE" }).catch(
      () => {},
    );
    await until("native app shutdown", async () => this.app.exitCode !== null, 10000);
    await until(
      "owned reviewer shutdown",
      async () =>
        children.every((pid) => {
          try {
            process.kill(pid, 0);
            return false;
          } catch {
            return true;
          }
        }),
      5000,
    );
  }

  stop() {
    if (this.app.exitCode === null) {
      for (const pid of this.children()) {
        try {
          process.kill(-pid, "SIGTERM");
        } catch {}
      }
      this.app.kill("SIGTERM");
    }
  }

  private children(): number[] {
    if (!this.app.pid) return [];
    try {
      return execFileSync("pgrep", ["-P", String(this.app.pid)], { encoding: "utf8" })
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(Number);
    } catch {
      return [];
    }
  }
}
