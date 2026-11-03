import { expect, test } from "@playwright/test";
import { startProject } from "./lab-tools";

test("context preview waits for intent, stays beside code, and can be pinned", async ({ page }) => {
  const start = new Date("2026-11-04T09:00:00Z");
  await page.clock.install({ time: start });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.mouse.move(700, 300);
  // Pause after startup; RPC latency must not consume hover budget.
  await page.clock.pauseAt(new Date(start.getTime() + 60_000));
  const brief = page.getByRole("button", { name: "Brief", exact: true });
  const reference = page.getByRole("button", { name: "Reference", exact: true });
  const pane = page.locator(".lab-sidebar-stack");
  await brief.hover();
  await page.clock.runFor(100);
  await expect(pane).toBeHidden({ timeout: 100 });
  await page.mouse.move(700, 300);
  await page.clock.runFor(300);
  await expect(pane).toBeHidden();
  await brief.hover();
  await page.clock.runFor(300);
  await expect(pane).toBeVisible();
  await pane.hover();
  await page.screenshot({ path: "/tmp/pr12-hover-visual/desktop-preview.png" });
  const box = await pane.boundingBox(),
    nav = await page.getByRole("navigation", { name: "Practice tools" }).boundingBox();
  expect(box && nav && Math.abs(box.x - nav.x) < 2 && box.y >= nav.y + nav.height).toBeTruthy();
  await page.getByRole("button", { name: "Keep Brief open", exact: true }).click();
  await expect(brief).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "/tmp/pr12-hover-visual/desktop-pinned.png" });
  await reference.hover();
  await page.clock.runFor(350);
  await expect(page.getByRole("region", { name: "The brief", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeHidden();
  await reference.click();
  await expect(reference).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeVisible();
});

test("keyboard focus keeps a quick reference open and Escape returns to its trigger", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const trigger = page.getByRole("button", { name: "Reference", exact: true });
  await trigger.focus();
  const link = page.getByRole("link", { name: "Official reference ↗", exact: true });
  await link.focus();
  await page.mouse.move(1000, 250);
  await page.waitForTimeout(350);
  await expect(link).toBeVisible();
  await link.press("Escape");
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("reduced motion and phone access retain the same context controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Brief", exact: true }).focus();
  const pane = page.locator(".lab-sidebar-stack");
  await expect(pane).toBeVisible();
  expect(await pane.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.getByRole("button", { name: "Collapse context", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Reference", exact: true }).click();
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeVisible();
  await page.screenshot({ path: "/tmp/pr12-hover-visual/phone-reference.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
