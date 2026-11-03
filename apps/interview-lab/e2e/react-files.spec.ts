import { expect, test } from "@playwright/test";
import { enableCommunication, startProject } from "./lab-tools";

test("tree collapse and tab closure preserve code and Monaco undo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  const codePane = page.getByRole("region", { name: "App.tsx", exact: true });
  await expect(
    page
      .getByRole("navigation", { name: "Practice tools" })
      .getByRole("button", { name: /file explorer/ }),
  ).toHaveCount(0);
  await codePane.getByRole("button", { name: "Expand file explorer" }).click();
  await expect(codePane.getByRole("tree", { name: "Project files" })).toBeVisible();
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Counter.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    "export default function Counter(){ return <h2>Saved across tab closure</h2>}",
  );
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Saved across tab closure" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close Counter.tsx", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "App.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("treeitem", { name: "Project", exact: true }).press("ArrowLeft");
  await expect(page.getByRole("treeitem", { name: "Counter.tsx", exact: true })).toBeHidden();
  await page.getByRole("treeitem", { name: "Project", exact: true }).press("ArrowRight");
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  await editor.press("Control+z");
  await expect(page.locator(".monaco-editor .view-lines")).not.toContainText(
    "Saved across tab closure",
  );
  await editor.press("Control+y");
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Saved across tab closure" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close Counter.tsx", exact: true }).click();
  await page.getByRole("button", { name: "Close App.tsx", exact: true }).click();
  await expect(page.getByText("Open a file to start coding.")).toBeVisible();
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  await expect(page.locator(".monaco-editor .view-lines")).toContainText(
    "Saved across tab closure",
  );
  await page.getByRole("button", { name: "Collapse file explorer" }).click();
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await page.getByRole("button", { name: "Expand file explorer" }).click();
  await expect(page.getByRole("tree", { name: "Project files" })).toBeVisible();
  await page.getByRole("treeitem", { name: "App.tsx", exact: true }).click();
  await page.getByRole("tab", { name: "Counter.tsx", exact: true }).click();
  await editor.press("Control+Home");
  await page.screenshot({ path: "/tmp/stepwise-react-lab/ide-files.png" });
});

test("nested folders and tabs support keyboard navigation on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const files = {
      "App.tsx":
        'import Card from "./components/Card"; export default function App(){return <Card />}',
      "components/Card.tsx": "export default function Card(){return <h2>Nested file</h2>}",
      "components/utils.ts": "export const value = 1;",
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
  await page
    .getByRole("region", { name: "App.tsx", exact: true })
    .getByRole("button", { name: "Expand file explorer" })
    .click();
  const root = page.getByRole("treeitem", { name: "Project", exact: true });
  await root.press("ArrowRight");
  const folder = page.getByRole("treeitem", { name: "components", exact: true });
  await expect(folder).toBeFocused();
  await folder.press("ArrowLeft");
  await expect(
    page.getByRole("treeitem", { name: "components/Card.tsx", exact: true }),
  ).toBeHidden();
  await folder.press("ArrowRight");
  await folder.press("ArrowRight");
  const card = page.getByRole("treeitem", { name: "components/Card.tsx", exact: true });
  await expect(card).toBeFocused();
  await card.press("Enter");
  const tab = page.getByRole("tab", { name: "components/Card.tsx", exact: true });
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Expand file explorer" })).toBeFocused();
  await tab.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "App.tsx", exact: true })).toBeFocused();
  await page.getByRole("tab", { name: "App.tsx", exact: true }).press("End");
  await tab.press("Delete");
  await expect(tab).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "App.tsx", exact: true })).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
});

test("editor explorer stays independent of pinned brief and final review", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Brief", exact: true }).click();
  await page
    .getByRole("region", { name: "App.tsx", exact: true })
    .getByRole("button", { name: "Expand file explorer" })
    .click();
  await expect(page.getByRole("region", { name: "The brief", exact: true })).toBeVisible();
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  await expect(page.getByRole("region", { name: "The brief", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reference", exact: true }).click();
  await page.getByRole("treeitem", { name: "App.tsx", exact: true }).click();
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await enableCommunication(page);
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Keep this review open while browsing.");
  await page.getByRole("treeitem", { name: "App.tsx", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Keep this review open while browsing.",
  );
  await page.getByRole("button", { name: "Collapse file explorer" }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toBeVisible();
  await page.getByRole("button", { name: "Back to code", exact: true }).click();
  await page.getByRole("button", { name: "Expand file explorer" }).click();
  await page.getByRole("treeitem", { name: "Project", exact: true }).press("Escape");
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Expand file explorer" })).toBeFocused();
});
