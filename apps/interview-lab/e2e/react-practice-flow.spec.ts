import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { enableCommunication, startProject } from "./lab-tools";

const sampleReview = {
  summary: "Trace the queued state transitions before changing the handler.",
  correctness: {
    score: 2,
    evidence: "Three replacement updates read the same captured value.",
    improve: "Predict the pending value after each queued update.",
  },
  reasoning: {
    score: 2,
    evidence: "No reasoning was supplied.",
    improve: "State the invariant you want to preserve.",
  },
  communication: {
    score: 1,
    evidence: "Only code was provided.",
    improve: "Explain the event sequence in your own words.",
  },
  tradeoffs: {
    score: 2,
    evidence: "The handler uses repeated setters.",
    improve: "Compare update composition with replacement.",
  },
  strengths: ["The UI contract stays small."],
  nextSteps: ["Trace one click on paper, then reattempt."],
  followUp: "Which value does each call capture?",
};

test("compact tools keep code visible; hover docks the brief and files switch directly", async ({
  page,
}) => {
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Coach", exact: true })).toHaveCount(0);
  const editor = page.getByRole("region", { name: "App.tsx", exact: true });
  await page.getByRole("button", { name: "Brief", exact: true }).hover();
  const brief = page.getByRole("region", { name: "The brief", exact: true });
  await expect(brief).toBeVisible();
  const a = await editor.boundingBox(),
    b = await brief.boundingBox();
  expect(a && b && (a.x + a.width <= b.x + 1 || b.x + b.width <= a.x + 1)).toBeTruthy();
  await expect(page.locator(".lab-brief-peek")).toHaveCount(0);
  await page.getByRole("button", { name: "Brief", exact: true }).press("Escape");
  await expect(brief).toBeHidden();
  await page.getByRole("button", { name: "Expand file explorer" }).click();
  await page.getByRole("treeitem", { name: "Counter.tsx", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Reference", exact: true }).hover();
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal reference solution" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Counter.tsx", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reference", exact: true }).click();
  await page.getByRole("button", { name: "Collapse context", exact: true }).click();
  await expect(page.getByRole("region", { name: "References", exact: true })).toBeHidden();
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  await page.getByRole("button", { name: "Expand output", exact: true }).click();
  await expect(editor).toBeHidden();
  await page.getByRole("button", { name: "Restore workspace", exact: true }).click();
  await page.getByRole("treeitem", { name: "App.tsx", exact: true }).click();
  await expect(editor).toBeVisible();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
});

test("review is a final step, guides a retry without showing the answer, and shows fresh check results", async ({
  page,
}) => {
  await page.route("**/api/react-lab/status", (r) =>
    r.fulfill({
      json: {
        review: { ready: true, provider: "ollama", model: "local-fixture" },
        speech: { ready: false, provider: "local", model: "fixture" },
      },
    }),
  );
  let sent: { explanation: string; code: string } | undefined;
  await page.route("**/api/react-lab/review", async (r) => {
    sent = r.request().postDataJSON();
    await r.fulfill({ json: { review: sampleReview, model: "local-fixture" } });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  await expect(page.getByRole("button", { name: "Get review & takeaways" })).toBeHidden();
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries?.snapshot?.code,
    ),
  ).toContain("setCount");
  await page.getByRole("button", { name: "Get review & takeaways", exact: true }).click();
  await expect(page.getByText(sampleReview.summary, { exact: true })).toBeVisible();
  expect(sent?.explanation).toBe("");
  expect(sent?.code).toContain("setCount");
  await expect(
    page.getByText("Trace one click on paper, then reattempt.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to code", exact: true }).click();
  await expect(frame.getByLabel("Reserved seats")).toHaveText("0");
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
});

test("answer disclosure ends the attempt, survives reload, and is distinct from completion", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await page.getByRole("button", { name: "Show answer", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("end this attempt");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("region", { name: "App.tsx", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show answer", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "End attempt and show answer", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Answer viewed", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run checks", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Answer viewed", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await expect(page.getByText("0 / 76 complete", { exact: true })).toBeVisible();
  await expect(page.getByText("Answer viewed", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start practicing", exact: false })).toHaveAttribute(
    "href",
    "/react-lab/semantic-action",
  );
});

test("individual and whole-lab resets confirm scope, clear coaching, and preserve cancellation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("seeded")) {
      localStorage.setItem("seeded", "yes");
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: {
            snapshot: {
              code: "export default function App(){return <p>A</p>}",
              notes: "one",
              completed: true,
            },
            identity: {
              code: "export default function App(){return <p>B</p>}",
              notes: "two",
              completed: true,
            },
          },
        }),
      );
      localStorage.setItem("stepwise.react-reviews.v1.snapshot", "[]");
      localStorage.setItem("stepwise.react-reviews.v1.identity", "[]");
    }
  });
  await page.goto("/react-lab/snapshot");
  await page.getByRole("button", { name: "Reset challenge", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.notes,
    ),
  ).toBe("one");
  await page.getByRole("button", { name: "Reset challenge", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset challenge", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeVisible();
  const remaining = await page.evaluate(() => ({
    notebook: JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}"),
    review: localStorage.getItem("stepwise.react-reviews.v1.snapshot"),
  }));
  expect(remaining.notebook.entries.snapshot).toBeUndefined();
  expect(remaining.notebook.entries.identity.notes).toBe("two");
  expect(remaining.review).toBeNull();
  await page.getByRole("link", { name: "All challenges", exact: true }).click();
  await page.getByRole("button", { name: "Reset all progress", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries,
    ),
  ).toEqual({});
  expect(
    await page.evaluate(() => localStorage.getItem("stepwise.react-reviews.v1.identity")),
  ).toBeNull();
  await expect(page.getByText("0 / 76 complete", { exact: true })).toBeVisible();
});

test("reset in another tab cannot silently resurrect deleted challenges", async ({
  page,
  context,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await enableCommunication(page);
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("A draft before reset");
  const other = await context.newPage();
  await other.goto("/react-lab");
  await other.getByRole("button", { name: "Reset all progress", exact: true }).click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await expect(page.getByText("Another tab changed this challenge", { exact: true })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Keep this local draft for now");
  expect(
    await other.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries,
    ),
  ).toEqual({});
  await page.getByRole("button", { name: "Load other tab's draft", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start project", exact: true })).toBeVisible();
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await enableCommunication(page);
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue("");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("Fresh attempt");
  expect(
    Object.keys(
      await other.evaluate(
        () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries,
      ),
    ),
  ).toEqual(["snapshot"]);
  await other.close();
});

test("a late local-model response cannot restore coaching after reset", async ({
  page,
  context,
}) => {
  await page.route("**/api/react-lab/status", (r) =>
    r.fulfill({
      json: {
        review: { ready: true, provider: "ollama", model: "local-fixture" },
        speech: { ready: false, provider: "local", model: "fixture" },
      },
    }),
  );
  let release: (() => void) | undefined,
    settled = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/react-lab/review", async (r) => {
    await gate;
    try {
      await r.fulfill({ json: { review: sampleReview, model: "local-fixture" } });
    } catch {
    } finally {
      settled = true;
    }
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await page.getByRole("button", { name: "Get review & takeaways", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/react-lab");
  await other.getByRole("button", { name: "Reset all progress", exact: true }).click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  release?.();
  await expect.poll(() => settled).toBe(true);
  expect(
    await other.evaluate(() => localStorage.getItem("stepwise.react-reviews.v1.snapshot")),
  ).toBeNull();
  await expect(page.getByText(sampleReview.summary, { exact: true })).toHaveCount(0);
  await other.close();
});

test("a partial coaching-history cleanup is reported and old history remains invalidated", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      if (key.startsWith("stepwise.react-reviews.")) throw new Error("storage denied");
      original.call(this, key);
    };
    localStorage.setItem("stepwise.react-reviews.v1.snapshot", "[]");
  });
  await page.goto("/react-lab");
  await page.getByRole("button", { name: "Reset all progress", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await expect(
    page.getByText(
      "Progress was reset. Some older coaching files could not be deleted from device storage; they are excluded from new attempts and exports.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries,
    ),
  ).toEqual({});
});

test("exports exclude invalidated coaching even if another tab retains a draft and cleanup failed", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    const remove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      if (key.startsWith("stepwise.react-reviews.")) throw new Error("denied");
      remove.call(this, key);
    };
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await page.evaluate(
    (review) =>
      localStorage.setItem(
        "stepwise.react-reviews.v1.snapshot",
        JSON.stringify([
          {
            code: "draft",
            explanation: "why",
            model: "local",
            createdAt: "2026-11-02T16:00:00Z",
            review,
          },
        ]),
      ),
    sampleReview,
  );
  const other = await context.newPage();
  await other.goto("/react-lab");
  await other.getByRole("button", { name: "Reset all progress", exact: true }).click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Reset all progress", exact: true })
    .click();
  await expect(page.getByText("Another tab changed this challenge", { exact: true })).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook", exact: true }).click();
  const path = await (await downloaded).path();
  if (!path) throw new Error("Missing export");
  expect(JSON.parse(await readFile(path, "utf8")).coaching.snapshot).toEqual([]);
  await other.close();
});

test("keeping a stale tab draft cannot reopen an attempt whose answer was revealed", async ({
  page,
  context,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/react-lab/snapshot");
  await startProject(other);
  await page.getByRole("button", { name: "Show answer", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "End attempt and show answer", exact: true })
    .click();
  await expect(
    other.getByText("Another tab changed this challenge", { exact: true }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Keep this tab's draft", exact: true }).click();
  await expect(other.getByRole("heading", { name: "Answer viewed", exact: true })).toBeVisible();
  expect(
    await other.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot
          .completed,
    ),
  ).toBe(false);
  await other.close();
});
