import { expect, type Page, test } from "@playwright/test";
import { findChallenge } from "../../interview-lab/app/react-lab/curriculum";
import { enableCommunication, startProject } from "../../interview-lab/e2e/lab-tools";

async function seedDraft(page: Page, code: string) {
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
}

test("built final review completes without coaching and keeps optional notes", async ({ page }) => {
  const code = findChallenge("snapshot")?.solution;
  if (!code) throw new Error("Missing seat-counter fixture");
  await seedDraft(page, code);
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

for (const scenario of [
  {
    name: "empty render",
    code: "export default function App(){return null;}",
    status: "Some checks need fixes",
  },
  {
    name: "render error",
    code: 'export default function App(){throw new Error("Deliberate render failure");}',
    status: "Final run could not finish",
  },
]) {
  test(`final checks report ${scenario.name} without hanging`, async ({ page }) => {
    await seedDraft(page, scenario.code);
    await page.goto("/react-lab/snapshot");
    await startProject(page);
    await page.getByRole("button", { name: "Final run & review", exact: true }).click();
    const checks = page.getByRole("region", { name: "1. Final checks", exact: true });
    await expect(checks.getByRole("status")).toHaveText(scenario.status, { timeout: 30000 });
    await expect(
      page.getByRole("button", { name: "Complete challenge", exact: true }),
    ).toBeDisabled();
    if (scenario.name === "empty render")
      await expect(page.getByText("0 of 2 checks passed", { exact: true })).toBeVisible();
    else await expect(checks).toContainText("Deliberate render failure");
  });
}
