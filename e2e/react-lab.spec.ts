import { expect, test } from "@playwright/test";
import { openTool, startProject } from "./lab-tools";

test("lab opens from library, runs learner edits and preserves personal work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "React interview lab" }).click();
  await expect(page.getByRole("heading", { name: "Think in React." })).toBeVisible();
  await page.getByRole("link", { name: "State is a snapshot", exact: true }).click();
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "App.tsx" });
  await expect(editor).toBeVisible();
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible({ timeout: 30000 });
  await editor.fill(
    (await editor.inputValue()).replaceAll("setCount(count + 1)", "setCount(c => c + 1)"),
  );
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed")).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: "Complete challenge" })).toHaveCount(0);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Each updater receives the pending value; three increments compose.");
  await page.getByRole("button", { name: "Complete challenge" }).click();
  await expect(page.getByText("Challenge complete", { exact: true })).toBeVisible();
  await page.reload();
  await startProject(page);
  await openTool(page, "Coach");
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(editor).toHaveValue(/setCount\(c => c \+ 1\)/);
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    /three increments/,
  );
  await expect(page.getByText("Challenge complete", { exact: true })).toBeVisible();
  await editor.fill("export default function App() { return <p>changed</p>; }");
  await expect(page.getByText("Challenge complete", { exact: true })).toHaveCount(0);
});

test("syntax errors recover and frame cannot access parent storage or network", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "App.tsx" });
  await editor.fill("export default function App() { return <div>;");
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.locator(".kb-callout[role=alert]")).toContainText(
    /syntax|closing|expected|terminated/i,
    {
      timeout: 30000,
    },
  );
  await editor.fill(`export default function App() {
    let storage = "blocked";
    try { parent.localStorage.getItem("secret"); storage = "accessible"; } catch {}
    return <p>{storage}</p>;
  }`);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.frameLocator('iframe[title="React preview"]').getByText("blocked")).toBeVisible(
    { timeout: 30000 },
  );
  await expect(page.locator('iframe[title="React preview"]')).toHaveAttribute(
    "sandbox",
    "allow-scripts allow-forms",
  );
});

test("small screen, keyboard selection, filter reset and URL navigation work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/react-lab");
  await page.getByRole("searchbox", { name: "Find a challenge" }).fill("no such challenge");
  await expect(page.getByRole("heading", { name: "No matching challenges" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  const challenge = page.getByRole("link", { name: "State is a snapshot", exact: true });
  await challenge.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/react-lab\/snapshot$/);
  await startProject(page);
  await openTool(page, "Reference");
  await page.getByRole("button", { name: "Reveal next hint" }).click();
  await expect(page.getByText("Hint 1 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Code", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole("link", { name: "All challenges" }).click();
  await expect(page.getByRole("heading", { name: "Think in React." })).toBeVisible();
});

// Checks assert DOM behavior independently of each reference's implementation.
for (const id of [
  "snapshot",
  "identity",
  "derived",
  "race",
  "cleanup",
  "stale",
  "reducer",
  "accessible",
  "recovery",
  "memo",
  "optimistic",
  "external-store",
  "disclosure",
  "password-toggle",
  "immutable-cart",
  "search-empty",
  "form-errors",
  "pagination",
  "sort-table",
  "debounced-preview",
  "retry-request",
  "keyboard-listbox",
  "undo-history",
  "request-cache",
]) {
  test(`${id}: planted bug fails and reference passes all runtime checks`, async ({ page }) => {
    const { findChallenge } = await import("../app/react-lab/curriculum");
    const challenge = findChallenge(id);
    if (!challenge) throw new Error(`Missing challenge ${id}`);
    await page.goto(`/react-lab/${id}`);
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "App.tsx" });
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    const score = page.getByText(/^\d of \d checks passed$/);
    await expect(score).toBeVisible({ timeout: 30000 });
    await expect(score).not.toHaveText(
      `${challenge.checks.length} of ${challenge.checks.length} checks passed`,
    );
    await editor.fill(challenge.solution);
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    await expect(score).toHaveText(
      `${challenge.checks.length} of ${challenge.checks.length} checks passed`,
      { timeout: 30000 },
    );
  });
}

test("timer, reference disclosure, notebook export and invalid route work", async ({ page }) => {
  await page.goto("/react-lab/race");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page.getByRole("button", { name: "Start interview" }).click();
  await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();
  await page.getByRole("button", { name: "Pause timer" }).click();
  await expect(page.getByRole("button", { name: "Resume timer" })).toBeVisible();
  await page.getByRole("button", { name: "Reset interview timer" }).click();
  await expect(page.getByRole("button", { name: "Start interview" })).toBeVisible();
  await openTool(page, "Reference");
  await expect(page.getByRole("link", { name: "Official reference ↗", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reveal reference solution" })).toHaveCount(0);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Ignore results from cleaned-up requests.");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook" }).click();
  expect((await download).suggestedFilename()).toBe("stepwise-react-notebook.json");
  await page.goto("/react-lab/not-a-challenge");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("interactive preview errors remain visible after checks finish", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx" })
    .fill(
      'export default function App() { return <button onClick={() => { throw new Error("Clicked failure"); }}>Crash</button>; }',
    );
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible({ timeout: 30000 });
  await page
    .frameLocator('iframe[title="React preview"]')
    .getByRole("button", { name: "Crash" })
    .click();
  await expect(page.locator(".kb-callout[role=alert]")).toContainText("Clicked failure");
});

test("browser CSP blocks fetches and form navigation from learner preview", async ({ page }) => {
  let requests = 0;
  await page.route("https://example.com/lab-probe", async (route) => {
    requests++;
    await route.fulfill({ body: "ok", headers: { "access-control-allow-origin": "*" } });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx" })
    .fill(`import {useEffect,useState} from "react";
export default function App() {
 const [status,setStatus]=useState("waiting");
 useEffect(()=>{fetch("https://example.com/lab-probe").then(()=>setStatus("accessible"),()=>setStatus("network blocked"));},[]);
 return <><p>{status}</p><form action="https://example.com/lab-probe"><button>Send outside</button></form></>;
}`);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("0 of 2 checks passed")).toBeVisible({ timeout: 30000 });
  const frame = page.frameLocator('iframe[title="React preview"]');
  await expect(frame.getByText("network blocked")).toBeVisible();
  const blocked = page.waitForEvent("console", {
    predicate: (message) =>
      message.text().includes("https://example.com/lab-probe") &&
      (message.text().includes("frame-src") || message.text().includes("form-action")),
  });
  await frame.getByRole("button", { name: "Send outside" }).click();
  await blocked;
  expect(requests).toBe(0);
});

test("unavailable device storage retains in-memory drafts and offers export", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage denied", "SecurityError");
      },
    });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByText("Device storage unavailable", { exact: true })).toBeVisible();
  await openTool(page, "Coach");
  const notes = page.getByRole("textbox", { name: "Explain your reasoning" });
  await notes.fill("Kept in this session.");
  await expect(notes).toHaveValue("Kept in this session.");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export notebook" }).click();
  expect((await download).suggestedFilename()).toBe("stepwise-react-notebook.json");
});

test("different tabs cannot silently replace each other's challenge drafts", async ({
  page,
  context,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/react-lab/identity");
  await startProject(other);
  await openTool(other, "Coach");
  await expect(other.getByRole("textbox", { name: "Explain your reasoning" })).toBeEnabled();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Snapshot draft from tab one.");
  await openTool(other, "Coach");
  await other
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Identity draft from tab two.");
  await page.reload();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Snapshot draft from tab one.",
  );
  await other.goto("/react-lab/snapshot");
  await startProject(other);
  await openTool(other, "Coach");
  await expect(other.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "Snapshot draft from tab one.",
  );
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("New snapshot from tab one.");
  await expect(
    other.getByText("Another tab changed this challenge", { exact: true }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Load other tab's draft" }).click();
  await expect(other.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "New snapshot from tab one.",
  );
  await other.close();
});

test("a late runtime download never starts code after preview timeout", async ({ page }) => {
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/react-lab-runtime.js", async (route) => {
    await gate;
    await route.fulfill({
      contentType: "text/javascript",
      body: 'window.startReactLab=()=>{document.getElementById("root").textContent="Late run executed";};',
    });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx" })).toBeEnabled();
  await page.clock.install();
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await page.clock.fastForward(16000);
  await expect(page.locator(".kb-callout[role=alert]")).toContainText(
    "did not finish within 15 seconds",
  );
  const finished = page.waitForResponse("**/react-lab-runtime.js");
  release?.();
  await finished;
  await page.clock.runFor(100);
  await expect(page.locator('iframe[title="React preview"]')).toHaveCount(0);
});

test("difficulty filters compose with search and milestone; totals describe the whole milestone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/react-lab?level=Very+hard");
  await expect(page.getByRole("status").filter({ hasText: "5 challenges" })).toBeVisible();
  await expect(page.getByText("0 / 7 complete", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Difficulty" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/stepwise-react-lab/difficulty-library.png" });
  await page.getByRole("searchbox", { name: "Find a challenge" }).fill("virtual");
  await expect(
    page.getByRole("link", { name: "Build a bounded activity feed", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "1 challenge" })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Build a bounded activity feed", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("searchbox", { name: "Find a challenge" }).fill("not-found");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status").filter({ hasText: "76 challenges" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Difficulty" })).toBeVisible();
  await page.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Medium", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "27 challenges" })).toBeVisible();
  await page.getByRole("combobox", { name: "Milestone" }).click();
  await page.getByRole("option", { name: "Components & contracts", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "14 challenges" })).toBeVisible();
  await expect(page.getByText("0 / 18 complete", { exact: true })).toBeVisible();
  await page.screenshot({ path: "/tmp/stepwise-react-lab/difficulty-phone.png" });
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/react-lab/build-async-registration");
    await startProject(page);
    await expect(page.getByRole("button", { name: "Run checks", exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: `/tmp/stepwise-react-lab/long-title-${width}.png` });
  }
});
