import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { openTool, startProject } from "./lab-tools";

test("quota failures preserve session notes across challenge navigation", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.top !== window) return;
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "stepwise.react-lab.v1") throw new DOMException("quota", "QuotaExceededError");
      return write.call(this, key, value);
    };
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Keep this unsaved reasoning during navigation");
  await expect(page.getByText("Device storage unavailable", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Think in React." })).toBeVisible();
  await page.getByRole("link", { name: "Seat reservation counter", exact: true }).click();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Keep this unsaved reasoning during navigation",
  );
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Think in React." })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook", exact: true }).click();
  const path = await (await downloading).path();
  expect(JSON.parse(await readFile(path as string, "utf8")).entries.snapshot.notes).toContain(
    "Keep this unsaved reasoning",
  );
});

test("cross-file rename persists import and sibling export together", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.top !== window || localStorage.getItem("stepwise.react-lab.v1")) return;
    const files = {
      "App.tsx":
        'import { value } from "./value"; export default function App() { return <p>{value}</p>; }',
      "value.ts": "export const value = 1;",
    };
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: {
          "modular-snapshot": {
            code: `// @stepwise/project\n${JSON.stringify(files)}`,
            notes: "",
            completed: false,
          },
        },
      }),
    );
  });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.locator(".monaco-editor").first()).toBeVisible();
  await page.evaluate(async () => {
    const modulePath = "/app/react-lab/monaco.client.ts";
    const { monaco } = await import(/* @vite-ignore */ modulePath);
    const editor = monaco.editor.getEditors()[0];
    editor.setPosition({ lineNumber: 1, column: 10 });
    editor.focus();
  });
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const modulePath = "/app/react-lab/monaco.client.ts";
        const { monaco } = await import(/* @vite-ignore */ modulePath);
        return monaco.editor.getEditors()[0].getAction("editor.action.rename").isSupported();
      }),
    )
    .toBe(true);
  await page.keyboard.press("F2");
  const rename = page.locator(".rename-box input");
  await rename.fill("renamed");
  await rename.press("Enter");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const code = JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries[
          "modular-snapshot"
        ].code;
        return JSON.parse(code.slice("// @stepwise/project\n".length))["value.ts"];
      }),
    )
    .toContain("export const renamed");
});

test("preview cannot navigate itself to an external document", async ({ page, context }) => {
  const requests: string[] = [];
  await context.route("https://external.invalid/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ contentType: "text/html", body: "blocked fixture" });
  });
  await page.addInitScript(() => {
    if (window.top !== window || localStorage.getItem("stepwise.react-lab.v1")) return;
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: {
          snapshot: {
            code: 'export default function App(){ return <button onClick={()=>location.href="https://external.invalid/leak"}>Navigate</button>; }',
            notes: "",
            completed: false,
          },
        },
      }),
    );
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page
    .frameLocator('iframe[title="React preview"]')
    .getByRole("button", { name: "Navigate", exact: true })
    .click();
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);
});
