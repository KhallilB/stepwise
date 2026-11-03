import { expect, test } from "@playwright/test";

test("walkthrough resumes last viewed step after reload", async ({ page }) => {
  await page.goto("/problems/binary-search");
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText(/^Step 2 of /)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/^Step 2 of /)).toBeVisible();
});
test("profile saves locally and rejects invalid imports without erasing profile", async ({
  page,
}) => {
  await page.goto("/profile");
  await page.getByRole("textbox", { name: "Display name" }).fill("Sam");
  await page.getByRole("textbox", { name: "Practice goal" }).fill("Frontend interviews");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByText("Profile saved on this device.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Sam");
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":2}'),
  });
  await expect(page.getByText(/Choose a valid interview-profile/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Sam");
});
