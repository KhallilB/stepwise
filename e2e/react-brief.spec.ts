import { expect, test } from "@playwright/test";
import { openTool } from "./lab-tools";

test("a challenge begins with its brief and an explicit project start", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await expect(
    page.getByRole("heading", { name: "State is a snapshot", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "The brief", exact: true })).toBeVisible();
  await expect(
    page.getByText("Reserve 3 adds exactly three seats, including on repeated clicks.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Run checks", exact: true })).toHaveCount(0);
  await expect(page.locator('iframe[title="React preview"]')).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Start project", exact: true }).click();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "State is a snapshot", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("button", { name: "Start interview", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Expand file explorer" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("hover and keyboard brief panes preserve code/output and restore editor space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await page.getByRole("button", { name: "Start project", exact: true }).click();
  const editor = page.getByRole("region", { name: "App.tsx", exact: true });
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  const width = (await editor.boundingBox())?.width;
  const brief = page.getByRole("button", { name: "Brief", exact: true });
  await brief.hover();
  const peek = page.getByRole("region", { name: "The brief", exact: true });
  await expect(peek).toContainText("Reserve 3 adds exactly three seats");
  await peek.hover();
  await expect(peek).toBeVisible();
  await expect(editor).toBeVisible();
  const codeBox = await editor.boundingBox(),
    briefBox = await peek.boundingBox();
  expect(
    codeBox &&
      briefBox &&
      (briefBox.x + briefBox.width <= codeBox.x + 1 || codeBox.x + codeBox.width <= briefBox.x + 1),
  ).toBeTruthy();
  await page.mouse.move(1400, 20);
  await expect(peek).toBeHidden();
  expect((await editor.boundingBox())?.width).toBe(width);
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
  await brief.focus();
  await expect(peek).toBeVisible();
  await brief.press("Escape");
  await expect(peek).toBeHidden();
  await expect(brief).toBeFocused();
  await brief.press("Enter");
  await expect(page.getByRole("region", { name: "The brief", exact: true })).toBeVisible();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
});

test("phone brief fits, saved work resumes, and new challenges start with their own brief", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/build-conflict-editor");
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeVisible();
  await expect(page.getByText("Draft and saved baseline", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Resolve a revision conflict deliberately", { exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Start project", exact: true }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Keep newer edits when the old request returns.");
  await page.reload();
  await page.getByRole("button", { name: "Resume project", exact: true }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Keep newer edits when the old request returns.",
  );
  await page.getByRole("button", { name: "Brief", exact: true }).click();
  await expect(page.getByRole("region", { name: "The brief", exact: true })).toBeVisible();
  await page.goto("/react-lab/snapshot");
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeVisible();
});
