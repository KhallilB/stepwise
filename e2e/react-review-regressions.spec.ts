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
    const { monaco } = await import("../app/react-lab/monaco.client");
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
    const { monaco } = await import("../app/react-lab/monaco.client");
    monaco.editor.getEditors()[0]?.trigger("test", "undo", null);
  });
  await expect.poll(async () => (await files())["App.tsx"]).toContain("import { value }");
  await openProjectFile(page, "value.ts");
  await page.evaluate(async () => {
    const { monaco } = await import("../app/react-lab/monaco.client");
    monaco.editor.getEditors()[0]?.trigger("test", "undo", null);
  });
  await expect.poll(async () => (await files())["value.ts"]).toContain("export const value");
});
