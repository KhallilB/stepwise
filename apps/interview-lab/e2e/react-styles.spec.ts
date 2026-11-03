import { expect, type Page, test } from "@playwright/test";
import { writeProject } from "../app/react-lab/project";
import { openProjectFile, startProject } from "./lab-tools";

async function plainEditor(page: Page) {
  await page.getByRole("button", { name: "Editor options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Plain editor", exact: true }).click();
}

test("Tailwind utilities style the preview, update after interaction, and respond to width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await plainEditor(page);
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(
      `import {useState} from 'react';export default function App(){const [large,setLarge]=useState(false);return <section><button onClick={()=>setLarge(v=>!v)}>Grow</button><div data-box className={large?'p-8 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#123456]':'p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#123456]'}><span>A</span><span>B</span></div></section>;}`,
    );
  const box = page.frameLocator('iframe[title="React preview"]').locator("[data-box]");
  await expect(box).toHaveCSS("padding-top", "16px");
  await expect(box).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await page
    .frameLocator('iframe[title="React preview"]')
    .getByRole("button", { name: "Grow" })
    .click();
  await expect(box).toHaveCSS("padding-top", "32px");
  await page.getByRole("button", { name: "Expand output", exact: true }).click();
  await expect
    .poll(() =>
      box.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length),
    )
    .toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      box.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length),
    )
    .toBe(1);
});

test("editable styles.css updates real CSS and survives draft reload", async ({ page }) => {
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await plainEditor(page);
  await page
    .getByRole("textbox", { name: "App.tsx", exact: true })
    .fill(
      'import "./styles.css"; export default function App(){return <div className="card" data-card>Styled card</div>;}',
    );
  await openProjectFile(page, "styles.css");
  const css = ".card { padding: 13px; color: rgb(1, 2, 3); }";
  await page.getByRole("textbox", { name: "styles.css", exact: true }).fill(css);
  const card = page.frameLocator('iframe[title="React preview"]').locator("[data-card]");
  await expect(card).toHaveCSS("padding-top", "13px");
  const restored = page.getByRole("textbox", { name: "styles.css", exact: true });
  await restored.fill("");
  await expect(card).toHaveCSS("padding-top", "0px");
  await restored.fill(".card { @apply missing-utility; }");
  await expect(page.getByRole("alert").filter({ hasText: "missing-utility" })).toBeVisible();
  await restored.fill(css);
  await expect(card).toHaveCSS("padding-top", "13px");
  await expect(card).toHaveCSS("color", "rgb(1, 2, 3)");
  await page.reload();
  await startProject(page);
  await plainEditor(page);
  await openProjectFile(page, "styles.css");
  await expect(page.getByRole("textbox", { name: "styles.css", exact: true })).toHaveValue(css);
  await expect(card).toHaveCSS("padding-top", "13px");
});

test("CSS cannot request external stylesheets or images from the isolated preview", async ({
  page,
}) => {
  let requests = 0;
  await page.route("https://example.com/styles-probe*", async (route) => {
    requests++;
    await route.fulfill({ body: ".card {padding:99px;}" });
  });
  const files = {
    "App.tsx": 'export default function App(){return <div className="card">Card</div>}',
    "styles.css":
      '@import "https://example.com/styles-probe.css"; .card { padding: 13px; background-image: url("https://example.com/styles-probe.png"); }',
  };
  await page.addInitScript(
    (code) =>
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      ),
    writeProject(files),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.frameLocator('iframe[title="React preview"]').locator(".card")).toHaveCSS(
    "padding-top",
    "13px",
  );
  expect(requests).toBe(0);
});

test("local CSS imports, Tailwind directives, and custom overrides compose without network", async ({
  page,
}) => {
  const files = {
    "App.tsx":
      'import "./styles.css";export default function App(){return <div data-card className="card p-4">Styled</div>;}',
    "styles.css":
      '@import "tailwindcss"; @import "./styles/base.css"; @theme { --color-brand: #123456; } .card { @apply bg-brand; padding: 7px; }',
    "styles/base.css": ".card { color: rgb(3, 2, 1); }",
  };
  await page.addInitScript(
    (code) =>
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      ),
    writeProject(files),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  const card = page.frameLocator('iframe[title="React preview"]').locator("[data-card]");
  await expect(card).toHaveCSS("padding-top", "7px");
  await expect(card).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await expect(card).toHaveCSS("color", "rgb(3, 2, 1)");
});

test("CSS save uses shared formatting and preserves other project files", async ({ page }) => {
  const files = {
    "App.tsx": 'export default function App(){return <div className="card">Card</div>}',
    "styles.css": ".card{padding:13px;color:rgb(1,2,3)}",
  };
  await page.addInitScript(
    (code) =>
      localStorage.setItem(
        "stepwise.react-lab.v1",
        JSON.stringify({
          version: 1,
          entries: { snapshot: { code, notes: "", completed: false } },
        }),
      ),
    writeProject(files),
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await openProjectFile(page, "styles.css");
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled();
  await page.getByRole("textbox", { name: "styles.css", exact: true }).press("ControlOrMeta+s");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const code =
          JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries?.snapshot
            ?.code ?? "";
        return code.startsWith("// @stepwise/project\n")
          ? JSON.parse(code.slice("// @stepwise/project\n".length))["styles.css"]
          : "";
      }),
    )
    .toBe(".card {\n  padding: 13px;\n  color: rgb(1, 2, 3);\n}\n");
  const savedFiles = await page.evaluate(() => {
    const code = JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot
      .code;
    return JSON.parse(code.slice("// @stepwise/project\n".length));
  });
  expect(savedFiles["App.tsx"]).toBe(files["App.tsx"]);
  await expect(page.frameLocator('iframe[title="React preview"]').locator(".card")).toHaveCSS(
    "padding-top",
    "13px",
  );
});
