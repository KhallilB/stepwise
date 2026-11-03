import { expect, test } from "@playwright/test";
import { findChallenge } from "../app/react-lab/curriculum";
import { startProject } from "./lab-tools";

const additions = [
  "semantic-action",
  "field-labels",
  "image-alt",
  "preference-checkbox",
  "first-counter",
  "character-count",
  "native-select",
  "page-landmarks",
  "responsive-grid",
  "long-content",
  "toolbar-wrap",
  "fluid-image",
  "spacing-tokens",
  "readable-type",
  "empty-recovery",
  "locale-price",
  "fieldset-group",
  "component-callback",
  "responsive-navigation",
  "container-card",
  "rtl-layout",
  "theme-tokens",
  "bulk-selection",
  "dependent-selects",
  "dialog-focus",
  "tab-contract",
  "payload-validation",
  "hook-isolation",
  "async-combobox",
  "inline-editing",
  "abortable-search",
  "reorder-focus",
  "product-projection",
  "stock-availability",
  "cart-lookup",
  "sales-summary",
  "merge-feed-pages",
  "rank-products",
  "tag-facets",
  "activity-window",
  "timeline-seek",
  "comment-tree",
  "command-history",
  "dependency-planner",
];

for (const id of additions) {
  test(`${id}: incomplete starter is detected and reference satisfies behavior`, async ({
    page,
  }) => {
    const challenge = findChallenge(id);
    expect(challenge, id).toBeDefined();
    if (!challenge) throw new Error(`Missing challenge ${id}`);
    await page.goto(`/react-lab/${id}`);
    const failures: string[] = [];
    await page.exposeFunction(
      "captureCurriculumResults",
      (results: { name: string; passed: boolean; detail: string }[]) => {
        failures.splice(
          0,
          failures.length,
          ...results
            .filter((result) => !result.passed)
            .map((result) => `${result.name}: ${result.detail}`),
        );
      },
    );
    await page.evaluate(() => {
      window.addEventListener("message", (event) => {
        if (event.data?.channel === "stepwise-react-lab" && event.data?.type === "results")
          (
            window as unknown as { captureCurriculumResults: (results: unknown) => void }
          ).captureCurriculumResults(event.data.results);
      });
    });
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    const score = page.getByText(/^\d+ of \d+ checks passed$/);
    await expect(score).toBeVisible({ timeout: 30000 });
    const perfect = `${challenge.checks.length} of ${challenge.checks.length} checks passed`;
    await expect(score).not.toHaveText(perfect);
    await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(challenge.solution);
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    try {
      await expect(score).toHaveText(perfect, { timeout: 10000 });
    } catch (error) {
      console.error(failures.join("\n"));
      throw error;
    }
    const frame = page.frameLocator('iframe[title="React preview"]');
    if (id === "semantic-action") {
      await frame.getByRole("button", { name: "Notify me" }).focus();
      await frame.getByRole("button", { name: "Notify me" }).press("Space");
      await expect(frame.getByRole("status")).toHaveText("Subscribed");
    }
    if (id === "dialog-focus") {
      await frame.getByRole("button", { name: "Edit settings" }).click();
      await frame.getByRole("textbox", { name: "Display name" }).press("Escape");
      await expect(frame.getByRole("dialog")).toBeHidden();
      await expect(frame.getByRole("button", { name: "Edit settings" })).toBeFocused();
    }
  });
}

test("very easy curriculum is filterable, reloadable, and reachable by keyboard on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab?level=Very+easy");
  await expect(page.getByRole("status").filter({ hasText: "9 challenges" })).toBeVisible();
  const link = page.getByRole("link", { name: "An action deserves a button", exact: true });
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(/\/react-lab\/semantic-action$/);
  await expect(
    page.getByRole("heading", { name: "An action deserves a button", exact: true, level: 1 }),
  ).toBeVisible();
  await page.goBack();
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "9 challenges" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("subscription reference exposes one delivery per current-room event", async ({ page }) => {
  const challenge = findChallenge("cleanup");
  if (!challenge) throw new Error("Missing cleanup challenge");
  await page.goto("/react-lab/cleanup");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(challenge.solution);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed")).toBeVisible();
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Join studio" }).click();
  await frame.getByRole("button", { name: "Send studio" }).click();
  await expect(frame.getByLabel("Deliveries")).toHaveText("1");
  await frame.getByRole("button", { name: "Send lobby" }).click();
  await expect(frame.getByLabel("Deliveries")).toHaveText("1");
});

for (const [id, label] of [
  ["recovery", "Report ready"],
  ["build-directory", "No people found"],
  ["build-virtual-feed", "No events"],
] as const) {
  test(`${id}: check rejects text present only in source`, async ({ page }) => {
    const challenge = findChallenge(id);
    if (!challenge) throw new Error(`Missing challenge ${id}`);
    await page.goto(`/react-lab/${id}`);
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await page
      .getByRole("textbox", { name: "App.tsx", exact: true })
      .fill(challenge.solution.replaceAll(label, "Wrong visible feedback"));
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    const checks = challenge.stages?.[0]?.checks ?? challenge.checks;
    const score = page.getByText(/^\d+ of \d+ checks passed$/);
    await expect(score).toBeVisible();
    await expect(score).not.toHaveText(`${checks.length} of ${checks.length} checks passed`);
  });
}

test("timeline exercise rejects a correct-looking linear search above its read budget", async ({
  page,
}) => {
  const challenge = findChallenge("timeline-seek");
  if (!challenge) throw new Error("Missing timeline-seek");
  const linear = challenge.solution.replace(
    /export function lowerBound[\s\S]*?\n}\n/,
    "export function lowerBound(times:readonly number[],target:number){const index=times.findIndex(value=>value>=target);return index<0?times.length:index;}\n",
  );
  expect(linear).not.toBe(challenge.solution);
  await page.goto("/react-lab/timeline-seek");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(linear);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  const score = page.getByText(/^\d+ of \d+ checks passed$/);
  await expect(score).toBeVisible();
  await expect(score).not.toHaveText(
    `${challenge.checks.length} of ${challenge.checks.length} checks passed`,
  );
});

test("named algorithm exports are fresh for each isolated sandbox check", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByRole("button", { name: "Reserve 3" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.addEventListener("message", (event) => {
      if (event.data?.runId === "export-contract" && event.data?.type === "results")
        console.log(`export-contract:${JSON.stringify(event.data.results)}`);
    });
  });
  const result = page.waitForEvent("console", {
    predicate: (message) => message.text().startsWith("export-contract:"),
  });
  const frame = await (
    await page.locator('iframe[title="React preview"]').elementHandle()
  )?.contentFrame();
  if (!frame) throw new Error("Missing preview frame");
  await frame.evaluate(async () => {
    const sandbox = window as unknown as {
      startReactLab: (boot: {
        runId: string;
        code: string;
        checks: { name: string; script: string }[];
      }) => Promise<void>;
    };
    await sandbox.startReactLab({
      runId: "export-contract",
      code: "let calls=0;export function tick(){return ++calls;}export default function App(){return <p>Probe</p>;}",
      checks: [
        { name: "Own invocation", script: "equal(exercise.tick(),1);equal(exercise.tick(),2);" },
        { name: "Fresh module", script: "equal(exercise.tick(),1);" },
      ],
    });
  });
  const results = JSON.parse((await result).text().slice("export-contract:".length));
  expect(results).toEqual([
    { name: "Own invocation", passed: true, detail: "Behavior matched." },
    { name: "Fresh module", passed: true, detail: "Behavior matched." },
  ]);
});

test("traffic exercise rejects repeated prefix scans above its read budget", async ({ page }) => {
  const challenge = findChallenge("activity-window");
  if (!challenge) throw new Error("Missing activity-window");
  const quadratic = challenge.solution.replace(
    /export function windowCounts[\s\S]*?\n}\n/,
    "export function windowCounts(times:readonly number[],span:number){return times.map((time,index)=>times.slice(0,index+1).filter(value=>value>time-span).length);}\n",
  );
  expect(quadratic).not.toBe(challenge.solution);
  await page.goto("/react-lab/activity-window");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page.getByRole("textbox", { name: "App.tsx", exact: true }).fill(quadratic);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  const score = page.getByText(/^\d+ of \d+ checks passed$/);
  await expect(score).toHaveText("2 of 3 checks passed");
});

test("algorithm milestone combines topic and difficulty filters on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab?track=algorithms");
  await expect(page.getByRole("status").filter({ hasText: "12 challenges" })).toBeVisible();
  await page.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Hard", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "4 challenges" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Find a challenge" }).fill("binary");
  await expect(page.getByRole("status").filter({ hasText: "1 challenge" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Milestone" })).toContainText(
    "Algorithms in the UI",
  );
  const link = page.getByRole("link", {
    name: "Seek the next transcript cue with binary search",
    exact: true,
  });
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(/\/timeline-seek$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
