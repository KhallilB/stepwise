import { expect, test } from "@playwright/test";
import { enableCommunication, startProject } from "./lab-tools";

const code = `import { useState } from "react";
export default function App() {
 const [seats, setSeats] = useState(0);
 return <section><h2>Seat reservations</h2><output aria-label="Reserved seats">{seats}</output>
 <button onClick={() => { setSeats(n => n + 1); setSeats(n => n + 1); setSeats(n => n + 1); }}>Reserve 3</button>
 <button onClick={() => setSeats(0)}>Reset</button></section>;
}`;
const assessment = {
  score: 5,
  evidence: "Composes updates correctly.",
  improve: "Try repeated bookings.",
};
const feedback = {
  summary: "The implementation meets its interaction contract.",
  correctness: assessment,
  reasoning: assessment,
  tradeoffs: assessment,
  strengths: ["Functional updates compose from pending state."],
  nextSteps: ["Test booking after a reset."],
  followUp: "What changes with a capacity limit?",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((code) => {
    if (top === window && !localStorage.getItem("stepwise.react-lab.v1"))
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      );
  }, code);
  await page.route("**/api/react-lab/status", (route) =>
    route.fulfill({
      json: {
        review: { ready: true, provider: "ollama", model: "test-model" },
        speech: { ready: false, provider: "local", model: "" },
      },
    }),
  );
});

test("passing checks allow completion without explanation or AI review", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Final run & review" }).click();
  const complete = page.getByRole("button", { name: "Complete challenge", exact: true });
  await expect(complete).toBeEnabled();
  await complete.click();
  await enableCommunication(page);
  const notes = page.getByRole("textbox", { name: "Explain your reasoning", exact: true });
  await notes.fill("Optional practice notes.");
  await notes.clear();
  await expect(page.getByRole("button", { name: "Completed", exact: true })).toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot
          .completed,
    ),
  ).toBe(true);
});

test("default review is code-only with saved takeaways and no communication grade", async ({
  page,
}) => {
  await page.route("**/api/react-lab/review", async (route) => {
    expect(route.request().postDataJSON().explanation).toBe("");
    await route.fulfill({ json: { review: feedback, model: "test-model" } });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review" }).click();
  await expect(
    page.getByRole("textbox", { name: "Explain your reasoning", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record explanation", exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Get review & takeaways" }).click();
  await expect(page.getByRole("heading", { name: "Takeaways", exact: true })).toBeVisible();
  await expect(page.getByText("100 / 100", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Communication", exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("Test booking after a reset.", { exact: true })).toBeVisible();
  await page.reload();
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review" }).click();
  await expect(page.getByText("Test booking after a reset.", { exact: true })).toBeVisible();
});

test("optional communication feedback stays separate and opting out keeps notes local", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/react-lab/review", async (route) => {
    const explanation = route.request().postDataJSON().explanation;
    expect(explanation).toBe(requests++ === 0 ? "Pending updates compose." : "");
    await route.fulfill({
      json: {
        review: explanation
          ? { ...feedback, communication: { ...assessment, score: 1 } }
          : feedback,
        model: "test-model",
      },
    });
  });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await enableCommunication(page);
  const notes = page.getByRole("textbox", { name: "Explain your reasoning", exact: true });
  await notes.fill("Pending updates compose.");
  await page.getByRole("button", { name: "Get review & takeaways", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Optional communication feedback", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Communication (optional)", exact: true }),
  ).toHaveCount(1);
  await expect(page.getByText("100 / 100", { exact: true })).toBeVisible();
  await page
    .getByRole("switch", { name: "Communication practice (optional)", exact: true })
    .uncheck();
  await expect(notes).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Optional communication feedback", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Get review & takeaways", exact: true }).click();
  await expect.poll(() => requests).toBe(2);
  await expect(page.getByText("Earlier scores:", { exact: false })).toBeVisible();
  await enableCommunication(page);
  await expect(notes).toHaveValue("Pending updates compose.");
});

test("failed checks and changed drafts cannot complete even with a perfect AI score", async ({
  page,
}) => {
  await page.route("**/api/react-lab/review", (route) =>
    route.fulfill({ json: { review: feedback, model: "test-model" } }),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await expect(page.getByText("All final checks passed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to code", exact: true }).click();
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill("export default function App(){ return <p>Incomplete draft</p>; }");
  await page.getByRole("button", { name: "Final run & review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Complete challenge", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("Some checks need fixes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Get review & takeaways", exact: true }).click();
  await expect(page.getByText("100 / 100", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Complete challenge", exact: true }),
  ).toBeDisabled();
});
