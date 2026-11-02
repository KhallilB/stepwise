import { expect, test } from "@playwright/test";
import { findChallenge } from "../app/react-lab/curriculum";
import { formatSource } from "../app/react-lab/format-source";
import { readProject } from "../app/react-lab/project";
import { startProject } from "./lab-tools";

for (const id of ["semantic-action", "modular-snapshot", "product-projection"]) {
  test(`${id}: reference files use the shared format after explicit answer disclosure`, async ({
    page,
  }) => {
    if (id === "semantic-action") await page.setViewportSize({ width: 390, height: 844 });
    const draft = "export default function App(){return <p>My unfinished approach</p>}";
    await page.addInitScript(
      ({ id, code }) => {
        if (window.top !== window || localStorage.getItem("stepwise.react-lab.v1")) return;
        localStorage.setItem(
          "stepwise.react-lab.v1",
          JSON.stringify({
            version: 1,
            entries: { [id]: { code, notes: "My reasoning", completed: false } },
          }),
        );
      },
      { id, code: draft },
    );
    await page.goto(`/react-lab/${id}`);
    await startProject(page);
    await expect(page.locator(".lab-reference-code")).toHaveCount(0);
    await page.getByRole("button", { name: "Finish & review", exact: true }).click();
    await page.getByRole("button", { name: "Show answer", exact: true }).click();
    await expect(page.locator(".lab-reference-code")).toHaveCount(0);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "End attempt and show answer", exact: true })
      .click();
    await expect(page.getByRole("heading", { name: "Answer viewed", exact: true })).toBeVisible();
    const challenge = findChallenge(id);
    if (!challenge) throw new Error(`Missing ${id}`);
    const files = Object.entries(readProject(challenge.solution));
    await expect(page.locator(".lab-reference-code")).toHaveCount(files.length);
    for (const [index, [path, source]] of files.entries()) {
      const expected = await formatSource(source, path);
      await expect
        .poll(() => page.locator(".lab-reference-code code").nth(index).textContent())
        .toBe(expected);
    }
    const saved = await page.evaluate(
      (id) => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries[id],
      id,
    );
    expect(saved.code).toBe(draft);
    expect(saved.notes).toBe("My reasoning");
    expect(saved.answerRevealed).toBe(true);
    expect(saved.completed).toBe(false);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Answer viewed", exact: true })).toBeVisible();
    await expect
      .poll(() => page.locator(".lab-reference-code code").first().textContent())
      .toBe(await formatSource(files[0]?.[1] ?? "", files[0]?.[0] ?? "App.tsx"));
  });
}
