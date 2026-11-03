import { expect, test } from "@playwright/test";
import { openTool, startProject } from "./lab-tools";

test("debugging brief states the seat contract without revealing diagnosis and keeps buggy code", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/snapshot");
  await expect(
    page.getByRole("heading", { name: "Seat reservation counter", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sample data", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Expected starting UI", exact: true }),
  ).toBeVisible();
  const examples = page.getByRole("list", { name: "Sample inputs and expected UI", exact: true });
  await expect(examples).toContainText("6");
  await expect(examples).toContainText("Reset");
  await expect(page.locator("body")).not.toContainText("captured value");
  await expect(page.locator("body")).not.toContainText("functional updates");
  await expect(page.locator(".lab-reference-code")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await startProject(page);
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    /setCount\(count \+ 1\)/,
  );
  await openTool(page, "Brief");
  await expect(
    page.getByRole("list", { name: "Sample inputs and expected UI", exact: true }),
  ).toContainText("6");
});

for (const id of ["race", "responsive-grid"]) {
  test(`${id} has concrete debugging examples before starting`, async ({ page }) => {
    await page.goto(`/react-lab/${id}`);
    await expect(page.getByRole("heading", { name: "Sample data", exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Expected starting UI", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("list", { name: "Sample inputs and expected UI", exact: true })
        .getByRole("listitem"),
    ).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeEnabled();
  });
}
