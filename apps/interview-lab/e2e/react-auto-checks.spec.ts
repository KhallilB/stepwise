import { expect, test } from "@playwright/test";
import { openCheckSettings, startProject } from "./lab-tools";

test("opt-in auto checks verify current edits without completing the challenge", async ({
  page,
}) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await page.getByRole("tab", { name: "Checks", exact: true }).click();
  await openCheckSettings(page);
  await page.getByRole("switch", { name: "Auto checks", exact: true }).check();
  await expect(page.getByText("0 of 2 checks passed", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    'import {useState} from "react"; export default function App(){const [count,setCount]=useState(0);return <section><output aria-label="Reserved seats">{count}</output><button onClick={()=>{setCount(n=>n+1);setCount(n=>n+1);setCount(n=>n+1)}}>Reserve 3</button><button onClick={()=>setCount(0)}>Reset</button></section>}',
  );
  await expect(page.getByText("2 of 2 checks passed", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("button", { name: "Complete challenge", exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("switch", { name: "Auto checks", exact: true }).uncheck();
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    "export default function App(){return <p>Changed after pausing checks</p>}",
  );
  await expect(
    page.frameLocator('iframe[title="React preview"]').getByText("Changed after pausing checks"),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("2 of 2 checks passed", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Draft changed. Run checks again to verify this version."),
  ).toBeVisible();
});
