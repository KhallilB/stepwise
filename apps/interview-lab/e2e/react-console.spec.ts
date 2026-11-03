import { expect, test } from "@playwright/test";
import { openProjectFile, startProject } from "./lab-tools";

test("console captures logs and runtime errors, clears and collapses", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor" }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(
      `export default function App(){ return <button onClick={() => {console.log("hello", {count: 2}); console.warn("careful"); throw new Error("button crashed");}}>Log event</button> }`,
    );
  await page
    .frameLocator('iframe[title="React preview"]')
    .getByRole("button", { name: "Log event" })
    .click();
  const consolePanel = page.getByRole("region", { name: "Console", exact: true });
  await expect(consolePanel).toContainText('hello {"count":2}');
  await expect(consolePanel).toContainText("careful");
  await expect(consolePanel).toContainText("button crashed");
  await page.getByRole("button", { name: "Clear console" }).click();
  await expect(consolePanel).not.toContainText("hello");
  await page.getByRole("button", { name: "Collapse console" }).click();
  await expect(consolePanel.getByText("No console messages yet.")).toBeHidden();
});

test("multi-file edits resolve imports, survive navigation/reload, and update preview", async ({
  page,
}) => {
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor" }).click();
  await openProjectFile(page, "Counter.tsx");
  const editor = page.getByRole("textbox", { name: "Counter.tsx", exact: true });
  await editor.fill(
    (await editor.inputValue()).replaceAll("setCount(count + 1)", "setCount(c => c + 1)"),
  );
  await page.getByRole("button", { name: "Run checks", exact: true }).click();
  await expect(page.getByText("2 of 2 checks passed")).toBeVisible();
  await openProjectFile(page, "App.tsx");
  await expect(page.getByRole("textbox", { name: "App.tsx", exact: true })).toHaveValue(
    /\.\/Counter/,
  );
  await page.reload();
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor" }).click();
  await openProjectFile(page, "Counter.tsx");
  await expect(editor).toHaveValue(/setCount\(c => c \+ 1\)/);
});

test("Monaco keeps module models and undo history while switching files", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await openProjectFile(page, "Counter.tsx");
  const editor = page.getByRole("textbox", { name: "Counter.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    "export default function Counter(){ console.info('Counter module rendered'); return <h2>Module updated</h2>}",
  );
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Module updated" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand console" }).click();
  await page.screenshot({ path: "/tmp/stepwise-react-lab/multi-file-console.png" });
  await openProjectFile(page, "App.tsx");
  await openProjectFile(page, "Counter.tsx");
  await editor.press("Control+z");
  await expect(page.locator(".monaco-editor .view-lines")).not.toContainText("Module updated");
  await editor.press("Control+y");
  await expect(
    page
      .frameLocator('iframe[title="React preview"]')
      .getByRole("heading", { name: "Module updated" }),
  ).toBeVisible();
});

test("handled React errors stay inspectable without replacing boundary recovery", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor" }).click();
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(`import {Component} from "react";
 class Boundary extends Component { state = {failed:false}; static getDerivedStateFromError(){return {failed:true}} render(){return this.state.failed ? <p>Recovered safely</p> : this.props.children} }
 function Child(){throw new Error("child crashed")}
 export default function App(){return <Boundary><Child /></Boundary>}`);
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByText("Recovered safely"),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Console", exact: true })).toContainText(
    "child crashed",
  );
});

test("console height resizes with keyboard without resetting the preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const frame = page.frameLocator('iframe[title="React preview"]');
  await frame.getByRole("button", { name: "Reserve 3" }).click();
  await page.getByRole("button", { name: "Expand console" }).click();
  const consolePanel = page.getByRole("region", { name: "Console", exact: true });
  const before = await consolePanel.boundingBox();
  await page.getByRole("separator", { name: "Resize workspace and tools" }).press("ArrowUp");
  await expect
    .poll(async () => (await consolePanel.boundingBox())?.height)
    .toBeGreaterThan(before?.height ?? 0);
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
  const handle = await page
    .getByRole("separator", { name: "Resize workspace and tools" })
    .boundingBox();
  const keyboardHeight = (await consolePanel.boundingBox())?.height ?? 0;
  if (!handle) throw new Error("Resize handle missing");
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2, handle.y - 45);
  await page.mouse.up();
  await expect
    .poll(async () => (await consolePanel.boundingBox())?.height)
    .toBeGreaterThan(keyboardHeight);
  await expect(frame.getByLabel("Reserved seats")).toHaveText("1");
  await page.getByRole("button", { name: "Collapse console" }).click();
  await expect(page.getByRole("separator", { name: "Resize workspace and tools" })).toBeHidden();
});
