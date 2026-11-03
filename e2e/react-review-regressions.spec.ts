import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";
import { openProjectFile, openTool, startProject } from "./lab-tools";

async function exportedNotes(page: Page, id: string) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook", exact: true }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Missing notebook export");
  return JSON.parse(await readFile(path, "utf8")).entries[id]?.notes;
}

test("quota failures preserve unsaved drafts across navigation and another challenge save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (window.top !== window) return;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "stepwise.react-lab.v1" && !sessionStorage.getItem("quota-recovered"))
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Unsaved snapshot draft");
  await expect(page.getByText("Device storage unavailable", { exact: true })).toBeVisible();
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "An action deserves a button", exact: true }).click();
  await startProject(page);
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second unsaved draft");
  await page.evaluate(() => sessionStorage.setItem("quota-recovered", "true"));
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second saved draft");
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await page.getByRole("link", { name: "State is a snapshot", exact: true }).click();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Unsaved snapshot draft",
  );
});

test("F2 rename persists every affected file and retains each file undo history", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (top !== window) return;
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: {
          "modular-snapshot": {
            code:
              "// @stepwise/project\n" +
              JSON.stringify({
                "App.tsx":
                  'import { value } from "./value"; export default function App(){return <p>{value}</p>}',
                "value.ts": "export const value = 1;",
              }),
            notes: "",
            completed: false,
          },
        },
      }),
    );
  });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.evaluate(async () => {
    const modulePath = "/app/react-lab/monaco.client.ts";
    const { monaco } = await import(modulePath);
    const editor = monaco.editor.getEditors()[0];
    if (!editor) throw new Error("Editor missing");
    editor.setPosition({ lineNumber: 1, column: 10 });
    editor.focus();
    void editor.getAction("editor.action.rename")?.run();
  });
  const rename = page.locator(".rename-box input");
  await rename.fill("renamed");
  await rename.press("Enter");
  const files = () =>
    page.evaluate(() => {
      const code = JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries[
        "modular-snapshot"
      ].code;
      return JSON.parse(code.slice("// @stepwise/project\n".length));
    });
  await expect.poll(async () => (await files())["value.ts"]).toContain("export const renamed");
  expect((await files())["App.tsx"]).toContain("import { renamed }");
  await page.evaluate(async () => {
    const modulePath = "/app/react-lab/monaco.client.ts";
    const { monaco } = await import(modulePath);
    monaco.editor.getEditors()[0]?.trigger("test", "undo", null);
  });
  await expect.poll(async () => (await files())["App.tsx"]).toContain("import { value }");
  await openProjectFile(page, "value.ts");
  await page.evaluate(async () => {
    const modulePath = "/app/react-lab/monaco.client.ts";
    const { monaco } = await import(modulePath);
    monaco.editor.getEditors()[0]?.trigger("test", "undo", null);
  });
  await expect.poll(async () => (await files())["value.ts"]).toContain("export const value");
});

for (const navigation of ["automatic", "anchor", "handler"]) {
  test(`parent policy prevents preview ${navigation} navigation after SPA entry`, async ({
    page,
    context,
  }) => {
    const outside: string[] = [];
    await context.route("https://external.invalid/**", (route) => {
      outside.push(route.request().url());
      return route.fulfill({ body: "intercepted" });
    });
    const attempt =
      'console.log("navigation-attempt"); location.href="https://external.invalid/probe"';
    const code =
      navigation === "automatic"
        ? `queueMicrotask(()=>{${attempt}});export default function App(){return <p>Preview remains available</p>}`
        : navigation === "anchor"
          ? 'export default function App(){return <a href="https://external.invalid/probe" onClick={()=>console.log("navigation-attempt")}>Navigate</a>}'
          : `export default function App(){return <button onClick={()=>{${attempt}}}>Navigate</button>}`;
    await page.addInitScript((code) => {
      if (top !== window) return;
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      );
    }, code);
    const document = await page.goto("/");
    expect(document?.headers()["content-security-policy"]).toContain("frame-src 'self'");
    await page.getByRole("link", { name: "React interview lab", exact: true }).click();
    await page.getByRole("link", { name: "State is a snapshot", exact: true }).click();
    const attempted = page.waitForEvent("console", {
      predicate: (message) => message.text() === "navigation-attempt",
    });
    const blocked = page.waitForEvent("console", {
      predicate: (message) =>
        message.text().includes("frame-src") && message.text().includes("external.invalid"),
    });
    await startProject(page);
    const frame = page.frameLocator('iframe[title="React preview"]');
    if (navigation !== "automatic") await frame.getByText("Navigate", { exact: true }).click();
    await attempted;
    await blocked;
    expect(outside).toEqual([]);
  });
}
