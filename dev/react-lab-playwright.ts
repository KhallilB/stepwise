import { existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { BrowserContext } from "@playwright/test";
import type { Plugin } from "vite";
import {
  type PlaywrightRequest,
  readPlaywrightRequest,
} from "../app/react-lab/playwright-contract.ts";

const path = "/__react-lab/playwright";
function json(response: ServerResponse, status: number, value: unknown) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}
async function body(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    bytes += data.length;
    if (bytes > 150000) throw new Error("Request too large");
    chunks.push(data);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function verify(origin: string, request: PlaywrightRequest, signal: AbortSignal) {
  const { chromium, expect } = await import("@playwright/test");
  if (signal.aborted) throw new Error("Cancelled");
  const browser = await chromium.launch({ headless: true, timeout: 10000 });
  const cancel = () => {
    void browser.close().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: false });
    if (signal.aborted) throw new Error("Cancelled");
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.addInitScript(({ challengeId, code, stage }) => {
      if (window.top !== window) return;
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { [challengeId]: { code, stage, notes: "", completed: false } },
        }),
      );
    }, request);
    const navigation = await page.goto(`${origin}/react-lab/${request.challengeId}`);
    if (navigation?.status() === 404) throw new Error("Unknown challenge");
    await page.getByRole("button", { name: "Resume project", exact: true }).click();
    await page.getByRole("tab", { name: "Checks", exact: true }).click();
    const panel = page.getByRole("region", { name: "Behavior checks", exact: true });
    if (Number(await panel.getAttribute("data-check-stage")) !== request.stage)
      throw new Error("Unknown stage");
    await panel.getByRole("button", { name: "Check settings", exact: true }).click();
    await panel.getByRole("combobox", { name: "Run with", exact: true }).click();
    await page.getByRole("option", { name: "Preview browser", exact: true }).click();
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    await expect
      .poll(() => panel.getAttribute("data-check-state"), { timeout: 15000 })
      .toMatch(/^(done|error)$/);
    const error = await panel.getAttribute("data-check-error");
    if (error) return { error: error.slice(0, 1000) };
    const results = await panel.locator("[data-check-name]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.getAttribute("data-check-name") ?? "",
        passed: node.getAttribute("data-check-passed") === "true",
        detail: node.getAttribute("data-check-detail") ?? "",
      })),
    );
    if (!results.length) throw new Error("No authored results");
    return { results };
  } finally {
    signal.removeEventListener("abort", cancel);
    await context?.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

export function reactLabPlaywright(): Plugin {
  let busy = false;
  return {
    name: "stepwise-local-playwright",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split("?")[0] !== path) return next();
        const host = request.headers.host ?? "";
        if (!/^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(host))
          return json(response, 403, { error: "Local development only." });
        const address = server.httpServer?.address();
        if (
          !address ||
          typeof address === "string" ||
          Number(host.slice(host.lastIndexOf(":") + 1)) !== address.port
        )
          return json(response, 403, { error: "Use this development server's local origin." });
        const origin = new URL(`http://${host}`).origin;
        if (request.method === "GET") {
          try {
            const { chromium } = await import("@playwright/test");
            return json(response, 200, {
              available: existsSync(chromium.executablePath()),
              browser: "chromium",
            });
          } catch {
            return json(response, 200, { available: false });
          }
        }
        if (request.method !== "POST") return json(response, 405, { error: "Use GET or POST." });
        if (
          request.headers.origin !== origin ||
          !request.headers["content-type"]?.startsWith("application/json")
        )
          return json(response, 403, { error: "Same-origin JSON requests only." });
        let input: PlaywrightRequest | null;
        try {
          input = readPlaywrightRequest(await body(request));
        } catch {
          input = null;
        }
        if (!input) return json(response, 400, { error: "Invalid challenge, stage or draft." });
        if (busy)
          return json(response, 409, {
            error: "Another local Playwright run is active. Try again shortly.",
          });
        busy = true;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        const disconnect = () => {
          if (!response.writableEnded) controller.abort();
        };
        response.once("close", disconnect);
        try {
          const result = await verify(origin, input, controller.signal);
          if (!response.destroyed)
            json(response, 200, {
              engine: "playwright",
              browser: "chromium",
              runId: input.runId,
              stage: input.stage,
              ...result,
            });
        } catch {
          if (!response.destroyed)
            json(response, 503, {
              error: controller.signal.aborted
                ? "Playwright timed out or was cancelled. Your draft is saved."
                : "Playwright could not finish. Retry or use Preview browser.",
            });
        } finally {
          clearTimeout(timeout);
          response.off("close", disconnect);
          busy = false;
        }
      });
    },
  };
}
