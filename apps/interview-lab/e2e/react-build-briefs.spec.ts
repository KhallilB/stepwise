import { expect, test } from "@playwright/test";
import { findChallenge } from "../app/react-lab/curriculum";
import { openTool, startProject } from "./lab-tools";

test("build brief gives inputs and observable examples before opening an empty editor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab/product-projection");
  await expect(page.getByRole("heading", { name: "Sample data", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Starting UI", exact: true })).toBeVisible();
  const examples = page.getByRole("list", { name: "Sample inputs and expected UI", exact: true });
  await expect(examples).toContainText("Tea — 12.50");
  await expect(examples).toContainText("Toggle empty");
  await expect(page.locator(".lab-reference-code")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeInViewport();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
  await startProject(page);
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    "export default function App() {\n  return null;\n}\n",
  );
  await openTool(page, "Brief");
  await expect(
    page.getByRole("list", { name: "Sample inputs and expected UI", exact: true }),
  ).toContainText("Tea — 12.50");
});

test("staged examples follow the unlocked stage and preserve earlier examples", async ({
  page,
}) => {
  await page.goto("/react-lab/build-directory");
  await expect(page.getByRole("heading", { name: "Search and clear", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Combine role and query", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Recover after a failed search", exact: true }),
  ).toHaveCount(0);
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const challenge = findChallenge("build-directory");
  if (!challenge) throw new Error("Missing directory");
  await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(challenge.solution);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed", { exact: true })).toBeVisible();
  await openTool(page, "Brief");
  await page.getByRole("button", { name: "Unlock next stage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Combine role and query", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Search and clear", exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recover after a failed search", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".lab-reference-code")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    challenge.solution,
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Combine role and query", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recover after a failed search", exact: true }),
  ).toHaveCount(0);
});
