import { expect, type Page, test } from "@playwright/test";
import { binarySearch } from "../app/problems/binary-search";
import { problems } from "../app/problems/catalog";
import type { Problem } from "../app/problems/problem";
import { sortedPairSum } from "../app/problems/sorted-pair-sum";
import { frameAt } from "../app/walkthrough/frame";

// Line, picture and sentence on screen must all describe step i.
async function expectInSync(page: Page, problem: Problem, i: number) {
  const frame = frameAt(problem, i);
  const sourceLines = problem.trace.source.split("\n");

  await expect(page.getByText(`Step ${i + 1} of ${frame.total}`)).toBeVisible();

  const current = page.getByRole("list", { name: "Code" }).locator('[aria-current="step"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("data-line", String(frame.line));
  await expect(current).toContainText(sourceLines[frame.line - 1]?.trim() ?? "");

  const array = frame.arrays[0];
  if (!array) throw new Error(`${problem.slug} step ${i} draws no array`);
  const cells = page.getByRole("list", { name: array.name }).getByRole("listitem");
  await expect(cells).toHaveCount(array.items.length);
  for (const [index, value] of array.items.entries()) {
    const names = array.pointers.filter((p) => p.index === index).map((p) => p.name);
    const label = [`index ${index}`, `value ${value}`, ...names].join(", ");
    await expect(cells.nth(index)).toHaveAccessibleName(label);
  }

  await expect(page.getByRole("status")).toHaveText(frame.sentence);
}

// Clicks forward to the bug, runs `atBug`, then arrows back to the start.
async function walkToBugAndBack(page: Page, problem: Problem, atBug: () => Promise<void>) {
  await page.goto("/");
  await page.getByRole("link", { name: problem.title }).click();
  await expect(page.getByRole("heading", { level: 1, name: problem.title })).toBeVisible();

  const back = page.getByRole("button", { name: "Previous step" });
  const next = page.getByRole("button", { name: "Next step" });

  await expectInSync(page, problem, 0);
  await expect(back).toBeDisabled();

  for (let i = 1; i <= problem.bugStep; i++) {
    await next.click();
    await expectInSync(page, problem, i);
  }

  await atBug();

  // Arrow keys step from anywhere outside the toolbar, which keeps them for its own focus moves.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let i = problem.bugStep - 1; i >= 0; i--) {
    await page.keyboard.press("ArrowLeft");
    await expectInSync(page, problem, i);
  }
  await expect(back).toBeDisabled();
}

test("binary search: steps to the planted off-by-one and back in sync", async ({ page }) => {
  await walkToBugAndBack(page, binarySearch, async () => {
    // Both pointers rest on 15, yet the loop has ended.
    await expect(page.getByRole("status")).toHaveText(/7 < 7 is false/);
    await expect(page.getByRole("listitem", { name: "index 7, value 15, lo, hi" })).toBeVisible();
  });
});

test("sorted pair sum: steps to the pointer moving the wrong way and back in sync", async ({
  page,
}) => {
  await walkToBugAndBack(page, sortedPairSum, async () => {
    // The sum is too small, yet hi leaves 9, the only partner for 3.
    await expect(page.getByRole("status")).toHaveText(/hi moves down/);
    await expect(page.getByRole("listitem", { name: "index 3, value 6, hi" })).toBeVisible();
    await expect(page.getByRole("listitem", { name: "index 4, value 9" })).toBeVisible();
  });
});

test("the picker opens every problem with Tab and Enter, and each page leads back", async ({
  page,
}) => {
  for (const problem of problems) {
    await page.goto("/");
    const item = page.getByRole("listitem").filter({ hasText: problem.title });
    await expect(item).toContainText(problem.pattern);
    await expect(item).toContainText(problem.difficulty);

    const link = page.getByRole("link", { name: problem.title });
    // Tab to the link the way a keyboard user would reach it.
    for (let tabs = 0; tabs < 10; tabs++) {
      if (await link.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(`/problems/${problem.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: problem.title })).toBeVisible();

    await page.getByRole("link", { name: "Problems" }).click();
    await expect(page).toHaveURL("/");
  }
});

test("step buttons show their name and key in a tooltip", async ({ page }) => {
  await page.goto(`/problems/${binarySearch.slug}`);
  await page.getByRole("button", { name: "Next step" }).hover();
  await expect(page.getByText("Next step (→)")).toBeVisible();

  // Keyboard focus too: the toolbar's own arrow keys move focus to the previous button.
  await page.getByRole("button", { name: "Next step" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Previous step" })).toBeFocused();
  await expect(page.getByText("Previous step (←)")).toBeVisible();
});
