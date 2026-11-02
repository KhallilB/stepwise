import { expect, test } from "@playwright/test";
import { openProjectFile, startProject } from "./lab-tools";

for (const id of ["product-projection", "build-virtual-feed", "build-concurrent-stars"]) {
  test(`${id}: build starts with an empty App and separate fixtures`, async ({ page }) => {
    await page.goto(`/react-lab/${id}`);
    await expect(page.getByText("Build from scratch", { exact: true })).toBeVisible();
    await startProject(page);
    await page.getByRole("button", { name: "Editor options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
      "export default function App() {\n  return null;\n}\n",
    );
    await openProjectFile(page, "fixtures.ts");
    await expect(page.getByRole("textbox", { name: "fixtures.ts", exact: true })).not.toHaveValue(
      "",
    );
    await page.getByRole("button", { name: "Run checks", exact: true }).click();
    await expect(page.getByText(/^0 of \d+ checks passed$/)).toBeVisible();
  });
}

test("debug exercises retain the buggy state to diagnose", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await expect(page.getByText("Debug existing code", { exact: true })).toBeVisible();
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    /setCount\(count \+ 1\)/,
  );
});

test("learner-written state can import the provided star transport", async ({ page }) => {
  await page.goto("/react-lab/build-concurrent-stars");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(`import { useState } from "react";
import { createStarService } from "./fixtures";
export default function App() {
  const [service] = useState(createStarService);
  const [message, setMessage] = useState("Ready");
  return <section><button onClick={() => {setMessage("Pending"); service.write("Ada", true).then(() => setMessage("Saved"), error => setMessage(error.message));}}>Probe transport</button><output>{message} / {service.calls}</output></section>;
}`);
  const preview = page.frameLocator('iframe[title="React preview"]');
  await expect(preview.locator("output")).toHaveText("Ready / 0");
  await preview.getByRole("button", { name: "Probe transport" }).click();
  await expect(preview.locator("output")).toHaveText("Rejected / 1");
  await preview.getByRole("button", { name: "Probe transport" }).click();
  await expect(preview.locator("output")).toHaveText("Saved / 2");
});

test("learner-written state can import the versioned document fixture", async ({ page }) => {
  await page.goto("/react-lab/build-conflict-editor");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(`import { useState } from "react";
import { createDocumentService } from "./fixtures";
export default function App() {
  const [service] = useState(createDocumentService);
  const [message, setMessage] = useState("Ready");
  return <section><button onClick={() => {service.remoteEdit(); service.saveRemote("Mine", 1).then(() => setMessage("Saved"), snapshot => setMessage(snapshot.text + " / " + snapshot.revision));}}>Probe conflict</button><output>{message}</output></section>;
}`);
  const preview = page.frameLocator('iframe[title="React preview"]');
  await expect(preview.locator("output")).toHaveText("Ready");
  await preview.getByRole("button", { name: "Probe conflict" }).click();
  await expect(preview.locator("output")).toHaveText("Remote revision / 2");
});
