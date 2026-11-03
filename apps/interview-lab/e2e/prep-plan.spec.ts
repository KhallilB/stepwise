import { expect, test } from "@playwright/test";

test("plan is discoverable, timed and keeps checklist progress across navigation and reload", async ({
  page,
}) => {
  await page.goto("/react-lab");
  await page.getByRole("link", { name: "Senior+ prep plan", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Senior+ frontend interview prep" }),
  ).toBeVisible();
  await expect(page.getByText("November 4, 2026", { exact: false })).toBeVisible();
  await expect(page.getByText("300 minutes · 5 hours", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(16);
  const checkbox = page.getByRole("checkbox", {
    name: "Complete Seat reservation counter",
    exact: true,
  });
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole("progressbar", { name: "Prep checklist" })).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await expect(page.getByText("280 planned minutes remaining", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "State as a snapshot ↗", exact: true }),
  ).toHaveAttribute("href", "https://react.dev/learn/state-as-a-snapshot");
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  await page.getByRole("link", { name: "Open Seat reservation counter", exact: true }).click();
  await expect(page).toHaveURL(/\/react-lab\/snapshot$/);
  await expect(
    page.getByRole("heading", { name: "Seat reservation counter", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Senior+ prep plan", exact: true }).click();
  await expect(page).toHaveURL(/\/prep$/);
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
});

test("storage failure remains visible while unsaved checklist changes stay usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "interview.prep.senior-2026-11-04.v1")
        throw new DOMException("quota", "QuotaExceededError");
      return write.call(this, key, value);
    };
  });
  await page.goto("/prep");
  const checkbox = page.getByRole("checkbox", {
    name: "Complete Seat reservation counter",
    exact: true,
  });
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole("alert")).toContainText("Progress is not saved");
});

test("phone layout and corrupt storage remain usable without affecting notebook", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "interview.prep.senior-2026-11-04.v1",
      '{"version":2,"completed":["snapshot"]}',
    );
    localStorage.setItem(
      "stepwise.react-lab.v1",
      '{"version":1,"entries":{"snapshot":{"code":"draft","notes":"keep","completed":false}}}',
    );
  });
  await page.goto("/prep");
  await expect(page.getByRole("checkbox")).toHaveCount(16);
  await expect(
    page.getByRole("checkbox", { name: "Complete Seat reservation counter", exact: true }),
  ).not.toBeChecked();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.notes,
    ),
  ).toBe("keep");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("pending progress survives further toggles and saves together after storage recovers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const key = "interview.prep.senior-2026-11-04.v1";
    if (!localStorage.getItem(key))
      localStorage.setItem(key, JSON.stringify({ version: 1, completed: ["semantic-action"] }));
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && !sessionStorage.getItem("recovered"))
        throw new DOMException("quota", "QuotaExceededError");
      return write.call(this, name, value);
    };
  });
  await page.goto("/prep");
  const seat = page.getByRole("checkbox", {
    name: "Complete Seat reservation counter",
    exact: true,
  });
  const totals = page.getByRole("checkbox", { name: "Complete Ticket cart totals", exact: true });
  await seat.check();
  await totals.check();
  await expect(seat).toBeChecked();
  await page.evaluate(() => sessionStorage.setItem("recovered", "yes"));
  await page.getByRole("checkbox", { name: "Complete Notification signup", exact: true }).uncheck();
  await page.reload();
  await expect(seat).toBeChecked();
  await expect(totals).toBeChecked();
});

test("privacy restrictions leave an honest usable session checklist", async ({ page }) => {
  await page.addInitScript(() => {
    const read = Storage.prototype.getItem,
      write = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "interview.prep.senior-2026-11-04.v1")
        throw new DOMException("denied", "SecurityError");
      return read.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "interview.prep.senior-2026-11-04.v1")
        throw new DOMException("denied", "SecurityError");
      return write.call(this, key, value);
    };
  });
  await page.goto("/prep");
  await expect(page.getByRole("alert")).toContainText("Progress is not saved");
  const item = page.getByRole("checkbox", { name: "Complete Browser DevTools", exact: true });
  await item.check();
  await expect(item).toBeChecked();
});

test("saved checklist updates reach another tab", async ({ page, context }) => {
  await page.goto("/prep");
  const other = await context.newPage();
  await other.goto("/prep");
  await page.getByRole("checkbox", { name: "Complete Browser DevTools", exact: true }).check();
  await expect(
    other.getByRole("checkbox", { name: "Complete Browser DevTools", exact: true }),
  ).toBeChecked();
  await other.getByRole("checkbox", { name: "Complete React DevTools", exact: true }).check();
  await expect(
    page.getByRole("checkbox", { name: "Complete React DevTools", exact: true }),
  ).toBeChecked();
});

test("a cleared saved checklist is not resurrected by the next toggle", async ({ page }) => {
  await page.goto("/prep");
  const seat = page.getByRole("checkbox", {
    name: "Complete Seat reservation counter",
    exact: true,
  });
  await seat.check();
  await page.evaluate(() => localStorage.removeItem("interview.prep.senior-2026-11-04.v1"));
  await page.getByRole("checkbox", { name: "Complete Ticket cart totals", exact: true }).check();
  await expect(seat).not.toBeChecked();
});
