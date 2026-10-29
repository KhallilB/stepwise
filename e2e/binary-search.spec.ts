import { expect, type Page, test } from "@playwright/test";
import { binarySearch } from "../app/problems/binary-search";
import { frameAt } from "../app/walkthrough/frame";

const total = binarySearch.trace.steps.length;
const sourceLines = binarySearch.trace.source.split("\n");

// Line, picture and sentence on screen must all describe step i.
async function expectInSync(page: Page, i: number) {
  const frame = frameAt(binarySearch, i);

  await expect(page.getByText(`Step ${i + 1} of ${total}`)).toBeVisible();

  const current = page.getByRole("list", { name: "Code" }).locator('[aria-current="step"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("data-line", String(frame.line));
  await expect(current).toContainText(sourceLines[frame.line - 1]?.trim() ?? "");

  const array = frame.arrays[0];
  if (!array) throw new Error(`step ${i} draws no array`);
  const cells = page.getByRole("list", { name: "nums" }).getByRole("listitem");
  await expect(cells).toHaveCount(array.items.length);
  for (const [index, value] of array.items.entries()) {
    const names = array.pointers.filter((p) => p.index === index).map((p) => p.name);
    const label = [`index ${index}`, `value ${value}`, ...names].join(", ");
    await expect(cells.nth(index)).toHaveAccessibleName(label);
  }

  await expect(page.getByRole("status")).toHaveText(frame.sentence);
}

test("steps to the planted bug and back with line, picture and sentence in sync", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Binary search" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Binary search" })).toBeVisible();

  const back = page.getByRole("button", { name: "Previous step" });
  const next = page.getByRole("button", { name: "Next step" });

  await expectInSync(page, 0);
  await expect(back).toBeDisabled();

  for (let i = 1; i <= binarySearch.bugStep; i++) {
    await next.click();
    await expectInSync(page, i);
  }

  // The bug: both pointers rest on 15, yet the loop has ended.
  await expect(page.getByRole("status")).toHaveText(/7 < 7 is false/);
  await expect(page.getByRole("listitem", { name: "index 7, value 15, lo, hi" })).toBeVisible();

  // Arrow keys step from anywhere outside the toolbar, which keeps them for its own focus moves.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let i = binarySearch.bugStep - 1; i >= 0; i--) {
    await page.keyboard.press("ArrowLeft");
    await expectInSync(page, i);
  }
  await expect(back).toBeDisabled();
});
