import { expect, test } from "@playwright/test";
import { advancedBuilds } from "../app/react-lab/advanced-builds";
import { builds } from "../app/react-lab/builds";
import { openTool, startProject } from "./lab-tools";

const review = {
  summary: "Good diagnosis; explain the updater queue more precisely.",
  correctness: {
    score: 4,
    evidence: "Functional updates compose.",
    improve: "Discuss reset behavior.",
  },
  reasoning: {
    score: 3,
    evidence: "Identifies a captured snapshot.",
    improve: "Explain replacement versus updater.",
  },
  communication: {
    score: 4,
    evidence: "Failure precedes fix.",
    improve: "Start with the invariant.",
  },
  tradeoffs: {
    score: 2,
    evidence: "No alternate implementation discussed.",
    improve: "Compare +3 with three +1 updates.",
  },
  strengths: ["Locates the stale value."],
  nextSteps: ["Predict a mixed replacement/update queue."],
  followUp: "What changes if setCount(10) appears between updaters?",
};

test("AI scoring is explicit, handles stale feedback and retains useful history", async ({
  page,
}) => {
  await page.route("**/api/react-lab/status", (route) =>
    route.fulfill({
      json: {
        review: { ready: true, provider: "ollama", model: "test-model" },
        speech: { ready: true, provider: "local", model: "test-speech" },
      },
    }),
  );
  let sent = 0;
  await page.route("**/api/react-lab/review", async (route) => {
    sent++;
    const body = route.request().postDataJSON();
    expect(body.challengeId).toBe("snapshot");
    expect(body.explanation).toContain("snapshot");
    await route.fulfill({ json: { review, model: "test-model" } });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("The closure reads one snapshot; functional updates consume pending state.");
  await expect(page.getByRole("button", { name: "Review my implementation" })).toBeEnabled();
  expect(sent).toBe(0);
  await page.getByRole("button", { name: "Review my implementation" }).click();
  await expect(page.getByText("65 / 100", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Improve: Compare +3 with three +1 updates.", { exact: true }),
  ).toBeVisible();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("A different explanation of the snapshot.");
  await expect(
    page.getByText("Feedback describes an earlier draft.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByText("65 / 100", { exact: true })).toBeVisible();
});

test("voice capture stops microphone and appends transcription to latest typed notes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => ({
          getTracks: () => [
            {
              stop: () => {
                document.documentElement.dataset.tracksStopped = "true";
              },
            },
          ],
        }),
      },
    });
    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      value: class extends EventTarget {
        static isTypeSupported() {
          return true;
        }
        state = "inactive";
        mimeType = "audio/webm";
        start() {
          this.state = "recording";
        }
        stop() {
          this.state = "inactive";
          this.dispatchEvent(
            new BlobEvent("dataavailable", {
              data: new Blob(["test recording"], { type: "audio/webm" }),
            }),
          );
          this.dispatchEvent(new Event("stop"));
        }
      },
    });
  });
  await page.route("**/api/react-lab/status", (route) =>
    route.fulfill({
      json: {
        review: { ready: true, provider: "ollama", model: "test-model" },
        speech: { ready: true, provider: "local", model: "test-speech" },
      },
    }),
  );
  await page.route("**/api/react-lab/transcribe", async (route) =>
    route.fulfill({ json: { text: "Each updater receives pending state." } }),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("My typed prediction.");
  await page.getByRole("button", { name: "Record explanation", exact: true }).click();
  await expect(page.getByText("Recording", { exact: true })).toBeVisible();
  await openTool(page, "Brief");
  await expect(page.getByRole("button", { name: "Stop recording", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop recording", exact: true }).click();
  await openTool(page, "Coach");
  await expect(
    page.getByRole("button", { name: "Send audio & transcribe", exact: true }),
  ).toBeVisible();
  expect(await page.locator("html").getAttribute("data-tracks-stopped")).toBe("true");
  await page.getByRole("button", { name: "Send audio & transcribe", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Explain your reasoning" })).toHaveValue(
    "My typed prediction.\n\nEach updater receives pending state.",
  );
  await openTool(page, "Coach");
  await page.getByRole("textbox", { name: "Explain your reasoning" }).fill("x".repeat(12000));
  await page.getByRole("button", { name: "Record explanation", exact: true }).click();
  await page.getByRole("button", { name: "Stop recording", exact: true }).click();
  await page.getByRole("button", { name: "Send audio & transcribe", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Transcript to copy" })).toHaveValue(
    "Each updater receives pending state.",
  );
  await expect(
    page.getByRole("button", { name: "Record explanation", exact: true }),
  ).toBeDisabled();
});

test("missing AI configuration preserves typed practice without invented scores", async ({
  page,
}) => {
  await page.route("**/api/react-lab/status", (route) =>
    route.fulfill({
      json: {
        review: { ready: false, provider: "ollama", model: "test-model" },
        speech: { ready: false, provider: "local", model: "test-speech" },
      },
    }),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openTool(page, "Coach");
  await expect(page.getByText("Coach needs setup", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Review my implementation" })).toBeDisabled();
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("Typed practice still works.");
  await expect(page.getByText(/\d+ \/ 100/)).toHaveCount(0);
});

for (const challenge of [...builds, ...advancedBuilds]) {
  test(`${challenge.id}: constraints grow cumulatively and all reference stages pass`, async ({
    page,
  }) => {
    await page.goto(`/react-lab/${challenge.id}`);
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    const score = page.getByText(/^\d of \d checks passed$/);
    await expect(score).toBeVisible({ timeout: 30000 });
    await openTool(page, "Brief");
    await expect(page.getByRole("button", { name: "Unlock next stage" })).toBeDisabled();
    await page.getByRole("textbox", { name: "App.tsx" }).fill(challenge.solution);
    let total = 0;
    for (const [index, stage] of (challenge.stages ?? []).entries()) {
      total += stage.checks.length;
      await page.getByRole("button", { name: "Run checks", exact: true }).click();
      await expect(score).toHaveText(`${total} of ${total} checks passed`, { timeout: 30000 });
      if (index < (challenge.stages?.length ?? 0) - 1)
        await page.getByRole("button", { name: "Unlock next stage" }).click();
    }
    await openTool(page, "Coach");
    await page
      .getByRole("textbox", { name: "Explain your reasoning" })
      .fill("I preserved earlier contracts while introducing the new state transitions.");
    await expect(page.getByRole("button", { name: "Complete challenge" })).toBeEnabled();
  });
}

test("loading a later build stage cannot reuse earlier passing checks", async ({
  page,
  context,
}) => {
  const challenge = builds.find((item) => item.id === "build-directory");
  if (!challenge) throw new Error("Missing directory build");
  await page.goto("/react-lab/build-directory");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page.getByRole("textbox", { name: "App.tsx" }).fill(challenge.solution);
  await openTool(page, "Coach");
  await page
    .getByRole("textbox", { name: "Explain your reasoning" })
    .fill("I kept query and role independent.");
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed")).toBeVisible({ timeout: 30000 });
  const other = await context.newPage();
  await other.goto("/react-lab");
  await expect(other.getByRole("searchbox", { name: "Find a challenge" })).toBeEnabled();
  await other.evaluate(() => {
    const notebook = JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}");
    notebook.entries["build-directory"].stage = 2;
    localStorage.setItem("stepwise.react-lab.v1", JSON.stringify(notebook));
  });
  // Return to the coding tab before running timer-based React fixtures.
  await page.bringToFront();
  await page.getByRole("button", { name: "Load other tab's draft" }).click();
  await expect(page.getByRole("button", { name: "Complete challenge" })).toBeDisabled();
  await expect(page.getByText("2 of 2 checks passed")).toHaveCount(0);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("5 of 5 checks passed")).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("button", { name: "Complete challenge" })).toBeEnabled();
  await other.close();
});
