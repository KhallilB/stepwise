import { expect, test } from "@playwright/test";
import { findChallenge } from "../../interview-lab/app/react-lab/curriculum";
import { enableCommunication, startProject } from "../../interview-lab/e2e/lab-tools";

test("built final review completes without coaching and keeps optional notes", async ({ page }) => {
  const code = findChallenge("snapshot")?.solution;
  if (!code) throw new Error("Missing seat-counter fixture");
  await page.addInitScript((code) => {
    if (window === top && !localStorage.getItem("stepwise.react-lab.v1"))
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      );
  }, code);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await expect(page.getByText("All final checks passed", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  const notes = page.getByRole("textbox", { name: "Explain your reasoning", exact: true });
  await expect(notes).toBeHidden();
  await page.getByRole("button", { name: "Complete challenge", exact: true }).click();
  await enableCommunication(page);
  await notes.fill("Optional notes stay local.");
  await notes.clear();
  await expect(page.getByRole("button", { name: "Completed", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Run final checks again", exact: true }).click();
  await expect(page.getByRole("region", { name: "1. Final checks", exact: true })).toBeVisible();
  await expect(page.getByText("All final checks passed", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot
          .completed,
    ),
  ).toBe(true);
});
