import { expect, test } from "@playwright/test";
import { startProject } from "../../interview-lab/e2e/lab-tools";

test("built desktop frontend connects both tools and retains profile and walkthrough", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Your practice profile" }).click();
  await page.getByRole("textbox", { name: "Display name" }).fill("Local learner");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Local learner");
  await page.getByRole("link", { name: "Algorithm walkthroughs" }).click();
  await page.getByRole("link", { name: "Binary search", exact: true }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.reload();
  await expect(page.getByText(/^Step 2 of /)).toBeVisible();
  await page.getByRole("link", { name: "Problems", exact: true }).click();
  await page.getByRole("link", { name: "Frontend practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Think in React." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Stepwise", exact: true })).toHaveAttribute(
    "href",
    "/",
  );
});

test("built editor checks run offline; learner frame cannot reach parent storage or native bridge", async ({
  page,
}) => {
  test.setTimeout(60000);
  const external: string[] = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).host !== "localhost:5185")
      external.push(request.url());
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.fill(`export default function App() {
    let storage = "blocked", native = "blocked";
    try { parent.localStorage.getItem("secret"); storage = "accessible"; } catch {}
    try { if (parent.__TAURI_INTERNALS__ || window.__TAURI_INTERNALS__ || window.ipc) native = "accessible"; } catch {}
    return <p>{storage + " / " + native}</p>;
  }`);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByText("blocked / blocked"),
  ).toBeVisible({ timeout: 30000 });
  await page.reload();
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    /parent.__TAURI_INTERNALS__/,
  );
  expect(external).toEqual([]);
});

test("notebook import restores drafts; invalid backup preserves saved work", async ({ page }) => {
  const backup = {
    version: 1,
    entries: {
      snapshot: {
        code: "export default function App() { return <p>Recovered draft</p>; }",
        notes: "My explanation",
        completed: false,
      },
    },
  };
  await page.goto("/react-lab");
  await page.locator('input[type="file"]').setInputFiles({
    name: "notebook.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("stepwise.react-lab.v1")))
    .toContain("Recovered draft");
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.getByText(/Choose a valid version 1 notebook/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("stepwise.react-lab.v1"))).toContain(
    "Recovered draft",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/profile");
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("local-model setup uses narrow native commands with explicit download", async ({ page }) => {
  const calls: string[] = [];
  let phase = "missing";
  await page.exposeFunction("testNative", (command: string) => {
    calls.push(command);
    if (command === "start_model_download") {
      phase = "downloading";
      return null;
    }
    if (command === "cancel_local_operation") {
      phase = "missing";
      return null;
    }
    return {
      phase,
      model: "qwen2.5-coder:7b",
      completed: 10,
      total: 100,
      operationId: phase === "downloading" ? "model-download" : undefined,
    };
  });
  await page.addInitScript(() => {
    if (window.top !== window) return;
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        invoke: (command: string, args: unknown) =>
          (
            window as unknown as {
              testNative: (command: string, args: unknown) => Promise<unknown>;
            }
          ).testNative(command, args),
      },
    });
  });
  await page.goto("/local-model");
  await expect(page.getByText("missing · qwen2.5-coder:7b")).toBeVisible();
  expect(calls).not.toContain("start_model_download");
  await page.getByRole("button", { name: "Download / use selected model", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cancel local operation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel local operation", exact: true }).click();
  await expect.poll(() => calls.includes("cancel_local_operation")).toBe(true);
});
