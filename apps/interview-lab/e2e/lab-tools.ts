import type { Page } from "@playwright/test";
export async function openCheckSettings(page: Page) {
  const toggle = page.getByRole("button", { name: "Check settings", exact: true });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
}
export async function openTool(page: Page, name: string) {
  if (name === "Coach") {
    const finish = page.getByRole("button", { name: "Finish & review", exact: true });
    if (await finish.isVisible()) await finish.click();
    else if (!(await page.getByRole("textbox", { name: "Explain your reasoning" }).isVisible()))
      await page.getByRole("button", { name: "Tools", exact: true }).click();
    return;
  }
  const tool = page.getByRole("button", { name, exact: true });
  if (!(await tool.isVisible()))
    await page.getByRole("button", { name: "Tools", exact: true }).click();
  if ((await tool.getAttribute("aria-pressed")) !== "true") await tool.click();
}

export async function openProjectFile(page: Page, path: string) {
  if (!(await page.getByRole("tree", { name: "Project files" }).isVisible())) {
    const trigger = page.getByRole("button", { name: "Expand file explorer" });
    if (!(await trigger.isVisible()))
      await page.getByRole("button", { name: "Code", exact: true }).click();
    await trigger.click();
  }
  await page.getByRole("treeitem", { name: path, exact: true }).click();
}

export async function startProject(page: Page) {
  await page.getByRole("button", { name: /^(Start|Resume) project$/ }).click();
}
