import { expect, test } from "@playwright/test";
import { openTool, startProject } from "./lab-tools";

test("workbench uses compact practice controls and a shared resizable bottom panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("navigation", { name: "Practice tools" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run checks", exact: true })).toHaveCount(1);
  const editor = page.getByRole("region", { name: "App.tsx", exact: true });
  const preview = page.getByRole("region", { name: "Live preview", exact: true });
  await expect(editor).toBeVisible();
  await expect(preview).toBeVisible();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("State stays while tools move.");
  await page.getByRole("button", { name: "Brief", exact: true }).click();
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "State stays while tools move.",
  );
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible();
  const checks = await page
    .getByRole("region", { name: "Behavior checks", exact: true })
    .boundingBox();
  const code = await editor.boundingBox();
  const output = await preview.boundingBox();
  expect(
    checks &&
      code &&
      output &&
      checks.y >= code.y + code.height - 1 &&
      checks.y >= output.y + output.height - 1,
  ).toBeTruthy();
  await page
    .frameLocator('iframe[title="React preview"]')
    .getByRole("button", { name: "Reserve 3" })
    .click();
  await page.getByRole("tab", { name: "Console", exact: true }).click();
  await expect(page.getByRole("region", { name: "Behavior checks", exact: true })).toBeHidden();
  await page.getByRole("tab", { name: "Console", exact: true }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Checks", exact: true })).toBeFocused();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Expand file explorer" }).click();
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  await page.getByRole("textbox", { name: "Counter.tsx", exact: true }).press("Control+Home");
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("treeitem", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.screenshot({ path: "/tmp/stepwise-react-lab/cohesive-workbench.png" });
});

test("phone workbench switches code, preview and tools without losing state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Phone draft retained.");
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Phone draft retained.",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
});

test("code gets the default space and file drawer remains a deliberate toggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByRole("button", { name: "Reserve 3" }),
  ).toBeVisible();
  const tabsBox = await page.getByRole("tablist", { name: "Open files" }).boundingBox();
  const previewHeader = await page.locator(".lab-preview-panel > .kb-panel-header").boundingBox();
  expect(
    tabsBox &&
      previewHeader &&
      Math.abs(tabsBox.y - previewHeader.y) <= 1 &&
      Math.abs(tabsBox.height - previewHeader.height) <= 1,
  ).toBeTruthy();
  const canvas = page.locator(".lab-editor-column");
  const wide = await canvas.boundingBox();
  await page.getByRole("button", { name: "Expand file explorer" }).click();
  await expect(page.getByRole("tree", { name: "Project files" })).toBeVisible();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBeLessThan(wide?.width ?? 0);
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  const tabs = page.getByRole("tablist", { name: "Open files" });
  await expect(tabs.getByRole("tab", { selected: true })).toHaveCount(1);
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: "App.tsx", exact: true }).hover();
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Collapse file explorer" }).click();
  await expect(page.getByRole("tree", { name: "Project files" })).toBeHidden();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBe(wide?.width);
  await page.mouse.move(10, 10);
  await page.screenshot({
    path: "/tmp/stepwise-react-lab/code-first-workbench.png",
    animations: "disabled",
  });
});
