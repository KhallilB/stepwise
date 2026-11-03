import { expect, test } from "@playwright/test";
import { openCheckSettings, openTool, startProject } from "./lab-tools";

test("Monaco edits hot reload without granting behavior-check completion", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByRole("button", { name: "Reserve 3" }),
  ).toBeVisible({ timeout: 30000 });
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    "export default function App() { return <h2>Live changes work</h2>; }",
  );
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Live changes work" }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: "Complete challenge" })).toHaveCount(0);
  await expect(page.getByText(/^\d of \d checks passed$/)).toHaveCount(0);
  await page.getByRole("switch", { name: "Live preview" }).uncheck();
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText("export default function App() { return <h2>Paused edit</h2>; }");
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Live changes work" }),
  ).toBeVisible();
  await page.getByRole("switch", { name: "Live preview" }).check();
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Paused edit" }),
  ).toBeVisible({ timeout: 30000 });
});

test("React snippets, type diagnostics, formatting and editor fallback preserve the draft", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    'const count: number = "oops"; export default function App(){return <p>{count}</p>}',
  );
  await page.getByText(/^Problems ·/).click();
  await expect(
    page.getByRole("button", { name: /Type 'string' is not assignable to type 'number'/ }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const plain = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await expect(plain).toHaveValue(/function App\(\) \{/);
  await plain.fill("");
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Use Monaco" }).click();
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await editor.focus();
  await page.keyboard.type("rcomponent");
  await editor.press("Control+Space");
  await expect(page.locator(".suggest-widget.visible")).toContainText("rcomponent");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(plain).toHaveValue(/export default function App\(\)/);
  await expect(plain).not.toHaveValue(/\$\{/);
  await page.reload();
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(plain).toHaveValue(/export default function App\(\)/);
});

test("desktop workbench keeps editor, output and actions in one viewport while context switches", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.locator(".monaco-editor")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
    true,
  );
  for (const label of ["Run checks", "Finish & review"]) {
    const box = await page.getByRole("button", { name: label, exact: true }).boundingBox();
    expect(box && box.y + box.height <= 900).toBeTruthy();
  }
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Reasoning stays beside the code.");
  await openTool(page, "Brief");
  await expect(page.getByRole("heading", { name: "The brief", exact: true })).toBeVisible();
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Reasoning stays beside the code.",
  );
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
    true,
  );
});

test("keyboard resizing changes usable editor width without pushing output off screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const editor = page.getByRole("region", { name: "App.tsx", exact: true });
  await openTool(page, "Brief");
  const initial = await editor.boundingBox();
  await page.getByRole("separator", { name: "Resize code editor" }).press("ArrowRight");
  await expect
    .poll(async () => (await editor.boundingBox())?.width)
    .toBeGreaterThan(initial?.width ?? 0);
  await page.getByRole("separator", { name: "Resize code editor" }).press("End");
  await page.getByRole("separator", { name: "Resize brief and coach" }).press("End");
  const output = await page
    .getByRole("region", { name: "Live preview", exact: true })
    .boundingBox();
  expect(output && output.width > 200 && output.x + output.width <= 1440).toBeTruthy();
});

test("one navigation row opens every mobile workspace view and keeps the draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("navigation", { name: "Workspace view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Format", exact: true })).toHaveText("");
  await expect(page.getByRole("button", { name: "Plain editor", exact: true })).toBeHidden();
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Keep my reasoning.");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Live preview", exact: true })).toBeVisible();
  await openTool(page, "Brief");
  await expect(page.getByRole("heading", { name: "The brief", exact: true })).toBeVisible();
  await openTool(page, "Reference");
  await expect(page.getByRole("link", { name: "Official reference ↗", exact: true })).toBeVisible();
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Keep my reasoning.",
  );
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
    true,
  );
});

test("context collapses without losing notes and returns space to code and output", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("heading", { name: "The brief", exact: true })).toBeHidden();
  const editor = page.getByRole("region", { name: "App.tsx", exact: true });
  const wide = await editor.boundingBox();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Preserve my reasoning while I code.");
  const context = page.locator(".lab-sidebar-stack");
  const reviewWidth = (await context.boundingBox())?.width ?? 0;
  await page.getByRole("separator", { name: "Resize brief and coach" }).press("ArrowLeft");
  await expect.poll(async () => (await context.boundingBox())?.width).toBeLessThan(reviewWidth);
  await expect.poll(async () => (await editor.boundingBox())?.width).toBeLessThan(wide?.width ?? 0);
  await page.getByRole("button", { name: "Collapse context" }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Finish & review", exact: true })).toBeFocused();
  await expect.poll(async () => (await editor.boundingBox())?.width).toBe(wide?.width);
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Preserve my reasoning while I code.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Collapse context" }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toBeVisible();
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Preserve my reasoning while I code.",
  );
});

test("output can reload, expand and restore without discarding code or checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const frame = page.frameLocator('iframe[title="React preview"]');
  await expect(frame.getByRole("button", { name: "Reserve 3" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Challenge checks", exact: true })).toBeHidden();
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
  await page.getByRole("switch", { name: "Live preview" }).uncheck();
  await page.getByRole("button", { name: "Reload preview" }).click();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("0");
  await expect(page.getByRole("switch", { name: "Live preview" })).not.toBeChecked();
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible();
  await expect(page.getByRole("list", { name: "Challenge checks", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Expand output" }).click();
  await expect(page.getByRole("button", { name: "Restore workspace" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeHidden();
  await expect(frame.getByRole("button", { name: "Reserve 3" })).toBeVisible();
  await page.getByRole("button", { name: "Restore workspace" }).click();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible();
  await page.getByRole("button", { name: "Reload preview" }).click();
  await expect(frame.getByRole("button", { name: "Reserve 3" })).toBeVisible();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible();
  await openCheckSettings(page);
  await page.getByRole("button", { name: "Clear check results" }).click();
  await expect(page.getByText("0 of 2 checks passed")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Complete challenge" })).toHaveCount(0);
  await page.getByRole("button", { name: "Expand output" }).click();
  await page.getByRole("button", { name: "Restore workspace" }).click();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
});
