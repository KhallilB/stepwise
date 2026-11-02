import { expect, type Page, test } from "@playwright/test";
import { startProject } from "./lab-tools";

async function seedDraft(page: Page, source: string) {
  await page.addInitScript((code) => {
    if (window.top !== window || localStorage.getItem("stepwise.react-lab.v1")) return;
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({ version: 1, entries: { snapshot: { code, notes: "", completed: false } } }),
    );
  }, source);
}

test("long lines wrap for reading, formatting breaks JSX, and both retain undo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  const source =
    'export default function App(){return <section aria-label="A long descriptive label for the editor wrapping test" data-message="Another long descriptive attribute that should occupy its own line"><button onClick={()=>console.log("clicked")}>A long readable button label for the React interview practice editor</button></section>}';
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await expect.poll(() => page.locator(".monaco-editor .view-line").count()).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
      ),
    )
    .toMatch(/<section\s*\n/);
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.press("Control+z");
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
      ),
    )
    .toBe(source);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Disable line wrapping", exact: true }).click();
  await expect(page.locator(".monaco-editor .view-line")).toHaveCount(1);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Enable line wrapping", exact: true }).click();
  await expect.poll(() => page.locator(".monaco-editor .view-line").count()).toBeGreaterThan(1);
});

test("JSX uses native tag and attribute colors while expressions retain TypeScript colors", async ({
  page,
}) => {
  const source =
    '// JSX keeps colors with comments too. <Fake />\nexport default function App() {\n  const label = "Hi";\n  const identity = <T,>(value: T) => value;\n  return <section aria-label="Panel"><button disabled>{label}</button>Plain text</section>;\n}';
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  for (const [text, color] of [
    ["section", "rgb(86, 156, 214)"],
    ["disabled", "rgb(156, 220, 254)"],
    ["Plain", "rgb(206, 145, 120)"],
    ["label", "rgb(212, 212, 212)"],
  ]) {
    await expect
      .poll(
        () =>
          page
            .locator(".view-line span")
            .evaluateAll(
              (nodes, match) =>
                nodes
                  .filter((node) => node.textContent === match)
                  .map((node) => getComputedStyle(node).color),
              text,
            ),
        { timeout: 15000 },
      )
      .toContain(color);
  }
  expect(errors).toEqual([]);
});

test("formatting an unfinished draft reports the problem and leaves code intact", async ({
  page,
}) => {
  const source = "export default function App(){return <section";
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Formatting could not finish" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
    ),
  ).toBe(source);
});

test("save shortcut formats JSX, persists it, and keeps formatting undoable", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  const source =
    'export default function App(){return <p role="status">{true?"Your notification subscription is active":"Not subscribed"}</p>}';
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.press("ControlOrMeta+s");
  const saved = () =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
    );
  await expect.poll(saved).toContain('    <p role="status">\n');
  await editor.press("Control+z");
  await expect.poll(saved).toBe(source);
  await editor.press("Control+s");
  await expect.poll(saved).toContain('    <p role="status">\n');
  await page.reload();
  await startProject(page);
  await expect.poll(saved).toContain('    <p role="status">\n');
});

test("save shortcut leaves unfinished source intact with a recoverable error", async ({ page }) => {
  const source = "export default function App(){return <section";
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await page.getByRole("textbox", { name: "App.tsx", exact: true }).press("ControlOrMeta+s");
  await expect(
    page.getByRole("alert").filter({ hasText: "Formatting could not finish" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
    ),
  ).toBe(source);
});

test("plain editor save formats source without requiring Monaco", async ({ page }) => {
  const source = "export default function App(){return <p>Plain editor</p>}";
  await seedDraft(page, source);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.press("ControlOrMeta+s");
  await expect(editor).toHaveValue(
    "export default function App() {\n  return <p>Plain editor</p>;\n}\n",
  );
});
