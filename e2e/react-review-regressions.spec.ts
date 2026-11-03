import { readFile } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";
import { openTool, startProject } from "./lab-tools";

async function exportedNotes(page: Page, id: string) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook", exact: true }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Missing notebook export");
  return JSON.parse(await readFile(path, "utf8")).entries[id]?.notes;
}

test("quota failures preserve unsaved drafts across navigation and another challenge save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (window.top !== window) return;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "stepwise.react-lab.v1" && !sessionStorage.getItem("quota-recovered"))
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Unsaved snapshot draft");
  await expect(page.getByText("Device storage unavailable", { exact: true })).toBeVisible();
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "An action deserves a button", exact: true }).click();
  await startProject(page);
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second unsaved draft");
  await page.evaluate(() => sessionStorage.setItem("quota-recovered", "true"));
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Second saved draft");
  expect(await exportedNotes(page, "snapshot")).toBe("Unsaved snapshot draft");
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await page.getByRole("link", { name: "State is a snapshot", exact: true }).click();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Unsaved snapshot draft",
  );
});
