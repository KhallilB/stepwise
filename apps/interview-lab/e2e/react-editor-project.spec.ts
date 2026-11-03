import { expect, test } from "@playwright/test";
import { startProject } from "./lab-tools";

test("React JSX and sibling imports typecheck while genuine errors stay visible", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const files = {
      "App.tsx":
        'import Counter from "./Counter"; const count: number = "oops"; export default function App(){return <Counter count={count} />}',
      "Counter.tsx":
        "export default function Counter({count}: {count: number}){return <output>{count}</output>}",
    };
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({
        version: 1,
        entries: {
          "modular-snapshot": {
            code: `// @stepwise/project\n${JSON.stringify(files)}`,
            notes: "",
            completed: false,
          },
        },
      }),
    );
  });
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await page.getByText(/^Problems ·/).click();
  await expect(
    page.getByRole("button", { name: /Type 'string' is not assignable to type 'number'/ }),
  ).toBeVisible({ timeout: 15000 });
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    'import type { JSX } from "react/jsx-runtime"; import Counter from "./Counter"; export default function App(): JSX.Element {return <Counter count={1} />}',
  );
  await expect(page.getByText("Problems · 0", { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.frameLocator('iframe[title="React preview"]').locator("output")).toHaveText(
    "1",
    { timeout: 15000 },
  );
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    'import Counter from "./Counter"; export default function App(){return <Counter count="bad" />}',
  );
  await expect(
    page.getByRole("button", { name: /Type 'string' is not assignable to type 'number'/ }),
  ).toBeVisible({ timeout: 15000 });
  await editor.focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(
    'import Missing from "./Missing"; export default function App(){return <Missing />}',
  );
  await expect(page.getByRole("button", { name: /Cannot find module '.\/Missing'/ })).toBeVisible({
    timeout: 15000,
  });
});

test("go to definition opens sibling files through the editor's tabs", async ({ page }) => {
  await page.goto("/react-lab/modular-snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  const editor = page.getByRole("textbox", { name: "App.tsx", exact: true });
  await editor.focus();
  await page.keyboard.press("Control+Home");
  for (let n = 0; n < 8; n++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("F12");
  await expect(page.getByRole("tab", { name: "Counter.tsx", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
    { timeout: 15000 },
  );
  await expect(page.getByRole("textbox", { name: "Counter.tsx", exact: true })).toBeFocused();
});
