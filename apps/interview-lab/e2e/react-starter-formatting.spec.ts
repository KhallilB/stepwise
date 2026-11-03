import { expect, test } from "@playwright/test";
import { openProjectFile, startProject } from "./lab-tools";

async function usePlainEditor(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
}

test("new problems open with formatted starter source before Save, including after reset", async ({
  page,
}) => {
  await page.goto("/react-lab/semantic-action");
  await startProject(page);
  await usePlainEditor(page);
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await expect(editor).toHaveValue(
    /import \{ useState \} from "react";\nexport default function App\(\) \{/,
  );
  await expect(editor).toHaveValue(/return \(\n {4}<section>/);
  await expect(page.frameLocator('iframe[title="React preview"]').getByRole("status")).toHaveText(
    "Not subscribed",
  );
  const starter = await editor.inputValue();
  await editor.fill("export default function App(){return <p>Changed</p>}");
  await page.getByRole("button", { name: "Reset code", exact: true }).click();
  await expect(editor).toHaveValue(starter);
});

test("multi-file starter files are formatted when each file opens", async ({ page }) => {
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await usePlainEditor(page);
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    'import Counter from "./Counter";\nexport default function App() {\n  return <Counter />;\n}\n',
  );
  await openProjectFile(page, "Counter.tsx");
  await expect(page.getByRole("textbox", { name: "Counter.tsx", exact: true })).toHaveValue(
    /return \(\n {4}<section>/,
  );
});

test("opening a problem preserves a learner's unfinished saved draft", async ({ page }) => {
  const source = "export default function App(){return <section";
  await page.addInitScript((code) => {
    if (window.top !== window) return;
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: { "semantic-action": { code, notes: "Keep my notes", completed: false } },
      }),
    );
  }, source);
  await page.goto("/react-lab/semantic-action");
  await startProject(page);
  await usePlainEditor(page);
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(source);
});

test("an untouched saved starter opens formatted without rewriting the notebook", async ({
  page,
}) => {
  const { findChallenge } = await import("../app/react-lab/curriculum");
  const source = findChallenge("semantic-action")?.starter ?? "";
  await page.addInitScript((code) => {
    if (window.top !== window) return;
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: { "semantic-action": { code, notes: "My prediction", completed: false } },
      }),
    );
  }, source);
  await page.goto("/react-lab/semantic-action");
  await startProject(page);
  await usePlainEditor(page);
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    /import \{ useState \} from "react";\n/,
  );
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries["semantic-action"],
  );
  expect(saved.code).toBe(source);
  expect(saved.notes).toBe("My prediction");
});
