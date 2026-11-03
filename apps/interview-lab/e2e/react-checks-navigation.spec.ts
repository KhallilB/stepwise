import { expect, test } from "@playwright/test";
import { findChallenge } from "../app/react-lab/curriculum";
import { openCheckSettings, startProject } from "./lab-tools";

test("local verification rejects cross-origin and malformed requests", async ({
  request,
  baseURL,
}) => {
  const url = "/__react-lab/playwright";
  expect((await request.post(url, { data: {} })).status()).toBe(403);
  expect(
    (await request.post(url, { headers: { Origin: "https://example.com" }, data: {} })).status(),
  ).toBe(403);
  expect(
    (
      await request.post(url, {
        headers: { Origin: baseURL ?? "" },
        data: { challengeId: "../outside", code: "", runId: "test", stage: 0 },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post(url, {
        headers: { Host: "localhost:0", Origin: "http://localhost:0" },
        data: { challengeId: "snapshot", code: "", runId: "host-proof", stage: 0 },
      })
    ).status(),
  ).toBe(403);
});

test("simultaneous verification requests cannot start two local browsers", async ({
  request,
  baseURL,
}) => {
  test.setTimeout(45000);
  const data = {
    challengeId: "snapshot",
    code: "export default function App(){return null}",
    runId: "concurrent",
    stage: 0,
  };
  const replies = await Promise.all(
    [1, 2].map(() =>
      request.post("/__react-lab/playwright", {
        headers: { Origin: baseURL ?? "" },
        data,
      }),
    ),
  );
  expect(replies.map((reply) => reply.status()).sort()).toEqual([200, 409]);
});

test("checks show inline failures and keep advanced controls behind settings", async ({ page }) => {
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  const panel = page.getByRole("region", { name: "Behavior checks", exact: true });
  await expect(panel.getByText("0 of 2 checks passed", { exact: true })).toBeVisible();
  await expect(panel.getByRole("list", { name: "Challenge checks" })).toBeVisible();
  await expect(panel.getByRole("combobox", { name: "Show checks", exact: true })).toHaveCount(0);
  await expect(panel.getByRole("combobox", { name: "Run with", exact: true })).toBeHidden();
  const name = findChallenge("modular-snapshot")?.checks[0]?.name ?? "Missing check";
  const details = panel.getByRole("button", { name, exact: true });
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await details.click();
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await details.press("Enter");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await panel.getByRole("button", { name: "Check settings", exact: true }).click();
  await expect(panel.getByRole("combobox", { name: "Run with", exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Check settings", exact: true }).click();
  await expect(panel.getByRole("combobox", { name: "Run with", exact: true })).toBeHidden();
});

test("the Playwright runner checks a submitted solution in a separate Chromium browser", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("tab", { name: "Checks", exact: true }).click();
  const panel = page.getByRole("region", { name: "Behavior checks", exact: true });
  await openCheckSettings(page);
  await panel.getByRole("combobox", { name: "Run with", exact: true }).click();
  await page.getByRole("option", { name: "Playwright · Chromium", exact: true }).click();
  const preview = page.frameLocator('iframe[title="React preview"]');
  await preview.getByRole("button", { name: "Reserve 3", exact: true }).click();
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/__react-lab/playwright") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(panel.getByText("0 of 2 checks passed", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(
    panel.getByText("Verified with Playwright · Chromium", { exact: true }),
  ).toBeVisible();
  await expect(preview.getByLabel("Reserved seats")).toHaveText("1");
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(
      'import {useState} from "react"; export default function App(){const [count,setCount]=useState(0);return <section><output aria-label="Reserved seats">{count}</output><button onClick={()=>setCount(n=>n+3)}>Reserve 3</button><button onClick={()=>setCount(0)}>Reset</button></section>}',
    );
  await expect(
    panel.getByText("Draft changed. Run checks again to verify this version."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(panel.getByText("2 of 2 checks passed", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(panel.locator('[data-check-passed="true"]')).toHaveCount(2);
  for (const check of findChallenge("snapshot")?.checks ?? [])
    await expect(panel.getByRole("button", { name: check.name, exact: true })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  await expect(page.getByRole("button", { name: "Complete challenge", exact: true })).toHaveCount(
    0,
  );
});

test("a cancelled Playwright response cannot overwrite the current checks", async ({ page }) => {
  const checks = findChallenge("snapshot")?.checks ?? [];
  let release = () => {};
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/__react-lab/playwright", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true, browser: "chromium" } });
    const request = route.request().postDataJSON();
    await blocked;
    await route
      .fulfill({
        json: {
          engine: "playwright",
          browser: "chromium",
          runId: request.runId,
          stage: 0,
          results: checks.map((check) => ({ name: check.name, passed: true, detail: "Matched" })),
        },
      })
      .catch(() => {});
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("tab", { name: "Checks", exact: true }).click();
  await openCheckSettings(page);
  await page.getByRole("combobox", { name: "Run with", exact: true }).click();
  await page.getByRole("option", { name: "Playwright · Chromium", exact: true }).click();
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  release();
  await expect(page.getByRole("button", { name: "Run checks", exact: true })).toBeEnabled();
  await expect(page.getByText("Ready to check", { exact: true })).toBeVisible();
  await expect(page.getByText(/^\d+ of \d+ checks passed$/)).toHaveCount(0);
});

test("Playwright verifies the cumulative requirements for the requested build stage", async ({
  request,
  baseURL,
}) => {
  test.setTimeout(45000);
  const challenge = findChallenge("build-board");
  if (!challenge?.stages) throw new Error("Missing staged build");
  const response = await request.post("/__react-lab/playwright", {
    headers: { Origin: baseURL ?? "" },
    data: { challengeId: challenge.id, code: challenge.solution, runId: "stage-proof", stage: 1 },
  });
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.stage).toBe(1);
  expect(result.results).toHaveLength(
    challenge.stages.slice(0, 2).flatMap((stage) => stage.checks).length,
  );
  expect(result.results.every((row: { passed: boolean }) => row.passed)).toBe(true);
});

test("phone checks can focus results and restore the coding layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed", { exact: true })).toBeVisible();
  const focus = page.getByRole("button", { name: "Focus checks", exact: true });
  await expect(focus).toBeVisible();
  await focus.click();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeHidden();
  const name = findChallenge("snapshot")?.checks[1]?.name ?? "Missing check";
  const details = page.getByRole("button", { name, exact: true });
  await expect(details).toBeInViewport();
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await details.click();
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await details.press("Enter");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("combobox", { name: "Selected check", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Restore coding layout", exact: true }).click();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
});
