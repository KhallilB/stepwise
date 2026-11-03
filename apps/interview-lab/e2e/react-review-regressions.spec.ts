import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";
import type { editor } from "monaco-editor";
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
  await page.locator('a[href="/react-lab/semantic-action"]').first().click();
  await startProject(page);
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second unsaved draft");
  await page.evaluate(() => sessionStorage.setItem("quota-recovered", "true"));
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second saved draft");
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await page.locator('a[href="/react-lab/snapshot"]').first().click();
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
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const modulePath = "/app/react-lab/monaco.client.ts";
          const { monaco } = await import(modulePath);
          const editor = monaco.editor.getEditors()[0];
          if (!editor) return false;
          editor.setPosition({ lineNumber: 1, column: 10 });
          editor.focus();
          return editor.getAction("editor.action.rename")?.isSupported() ?? false;
        }),
      { timeout: 10000 },
    )
    .toBe(true);
  await page.evaluate(async () => {
    const modulePath = "/app/react-lab/monaco.client.ts";
    const { monaco } = await import(modulePath);
    void monaco.editor.getEditors()[0]?.getAction("editor.action.rename")?.run();
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

for (const limit of ["file", "project", "three-file project"]) {
  test(`a cross-file rename exceeding the ${limit} limit restores all models and undo history`, async ({
    page,
  }) => {
    const files: Record<string, string> = {
      "App.tsx":
        'import { value } from "./value"; export default function App(){return <p>{value}</p>}',
      "value.ts": `export const value = 1; export const values = [${Array(
        limit === "file" ? 1000 : 600,
      )
        .fill("value")
        .join(",")}];`,
    };
    if (limit === "three-file project")
      files["tail.ts"] = 'import { value } from "./value"; export const tail = value;';
    if (limit !== "file") files["padding.ts"] = `//${"x".repeat(10000)}`;
    await page.addInitScript((files) => {
      if (top !== window) return;
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
    }, files);
    await page.goto("/react-lab/modular-snapshot");
    await startProject(page);
    await expect(page.locator(".monaco-editor")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const modulePath = "/app/react-lab/monaco.client.ts";
          const { monaco } = await import(modulePath);
          const editor = monaco.editor.getEditors()[0];
          if (!editor) return false;
          editor.setPosition({ lineNumber: 1, column: 10 });
          editor.focus();
          return editor.getAction("editor.action.rename")?.isSupported() ?? false;
        }),
      )
      .toBe(true);
    await page.evaluate(async () => {
      const modulePath = "/app/react-lab/monaco.client.ts";
      const { monaco } = await import(modulePath);
      const editor = monaco.editor.getEditors()[0];
      const model = editor.getModel();
      const end = model.getFullModelRange().getEndPosition();
      editor.executeEdits("test", [
        { range: monaco.Range.fromPositions(end), text: " // Keep me" },
      ]);
      editor.pushUndoStop();
    });
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("stepwise.react-lab.v1")))
      .toContain("Keep me");
    await page.evaluate(async () => {
      const modulePath = "/app/react-lab/monaco.client.ts";
      const { monaco } = await import(modulePath);
      const editor = monaco.editor.getEditors()[0];
      editor.setPosition({ lineNumber: 1, column: 10 });
      editor.focus();
      void editor.getAction("editor.action.rename")?.run();
    });
    const rename = page.locator(".rename-box input");
    await rename.fill("renamedBeyondTheProjectCharacterLimit");
    await rename.press("Enter");
    await expect(page.getByText(/limit is .*characters\. Edit was not saved/)).toBeVisible();
    const sources = () =>
      page.evaluate(async () => {
        const modulePath = "/app/react-lab/monaco.client.ts";
        const { monaco } = await import(modulePath);
        return Object.fromEntries(
          monaco.editor
            .getModels()
            .map((model: editor.ITextModel) => [
              model.uri.path.split("/").at(-1),
              model.getValue(),
            ]),
        );
      });
    await expect.poll(async () => (await sources())["value.ts"] === files["value.ts"]).toBe(true);
    expect((await sources())["App.tsx"]).toBe(`${files["App.tsx"]} // Keep me`);
    if (limit === "three-file project") expect((await sources())["tail.ts"]).toBe(files["tail.ts"]);
    expect(await page.evaluate(() => localStorage.getItem("stepwise.react-lab.v1"))).not.toContain(
      "renamedBeyondTheProjectCharacterLimit",
    );
    await page.evaluate(async () => {
      const modulePath = "/app/react-lab/monaco.client.ts";
      const { monaco } = await import(modulePath);
      monaco.editor.getEditors()[0].trigger("test", "undo", null);
    });
    await expect.poll(async () => (await sources())["App.tsx"]).toBe(files["App.tsx"]);
  });
}

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
    await page.locator('a[href="/react-lab/snapshot"]').first().click();
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

test("an unresolved cross-tab draft choice survives in-app navigation", async ({
  page,
  context,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Local choice");
  const other = await context.newPage();
  await other.goto("/react-lab/snapshot");
  await startProject(other);
  await openTool(other, "Coach");
  await other.getByRole("textbox", { name: "Explain your reasoning" }).fill("Other choice");
  await expect(page.getByText("Another tab changed this challenge", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await page.locator('a[href="/react-lab/snapshot"]').first().click();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByText("Another tab changed this challenge", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Local choice",
  );
  await page.getByRole("button", { name: "Load other tab's draft", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Other choice",
  );
  await other.close();
});

for (const wrapper of ["memo(App)", "forwardRef((_props, _ref) => <App />)"]) {
  test(`a valid ${wrapper} default export runs behavior checks`, async ({ page }) => {
    await page.goto("/react-lab/snapshot");
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await page
      .getByRole("textbox", { name: "App.tsx", exact: true })
      .fill(`import { memo, forwardRef, useState } from "react";
function App() {
  const [count, setCount] = useState(0);
  return <section><output aria-label="Reserved seats">{count}</output><button onClick={() => setCount(current => current + 3)}>Reserve 3</button><button onClick={() => setCount(0)}>Reset</button></section>;
}
export default ${wrapper};`);
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    await expect(page.getByText("2 of 2 checks passed")).toBeVisible({ timeout: 10000 });
  });
}

for (const source of ["export const value = 1;", "export default {};"]) {
  test(`invalid component export stays visible: ${source}`, async ({ page }) => {
    await page.goto("/react-lab/snapshot");
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(source);
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    await expect(page.getByText("Run needs attention", { exact: true })).toBeVisible();
    await expect(page.getByText("2 of 2 checks passed")).not.toBeVisible();
  });
}
