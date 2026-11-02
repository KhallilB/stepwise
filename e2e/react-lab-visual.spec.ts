import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { startProject } from "./lab-tools";

for (const width of [390, 768, 1024, 1440]) {
  test(`lab reading and coding surfaces fit ${width}px`, async ({ page }) => {
    await mkdir("/tmp/stepwise-react-lab", { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/react-lab");
    await expect(page.getByRole("searchbox", { name: "Find a challenge" })).toBeEnabled();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/stepwise-react-lab/dashboard-${width}.png` });
    await page.goto("/react-lab/build-directory");
    await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeInViewport();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/stepwise-react-lab/brief-${width}.png` });
    await startProject(page);
    await expect(page.getByRole("textbox", { name: "App.tsx" })).toBeEnabled();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
    ).toBe(true);
    if (width >= 800)
      await expect(page.frameLocator('iframe[title="React preview"]').locator("#root")).toBeEmpty({
        timeout: 30000,
      });
    if (width >= 800) {
      await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Live preview", exact: true })).toBeVisible();
    }
    await page.screenshot({ path: `/tmp/stepwise-react-lab/workspace-${width}.png` });
    if (width < 800) await page.getByRole("button", { name: "Preview", exact: true }).click();
    await page.getByRole("button", { name: "Expand output" }).click();
    await expect(page.frameLocator('iframe[title="React preview"]').locator("#root")).toBeEmpty();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollHeight <= innerHeight + 1 &&
          document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/stepwise-react-lab/output-${width}.png` });
    await page.getByRole("button", { name: "Restore workspace" }).click();
  });
}
