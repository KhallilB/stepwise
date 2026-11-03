import { expect, type Page } from "@playwright/test";
import { startProject } from "./lab-tools";

export const source =
  "// alpha beta gamma\n// delta epsilon\nexport default function App() { return <p>Keyboard practice</p>; }";

export async function openEditor(page: Page, mac: boolean) {
  await page.addInitScript(
    ({ source, mac }) => {
      const agent = navigator.userAgent.replace(
        /\([^)]*\)/,
        mac ? "(Macintosh; Intel Mac OS X 14_0)" : "(Windows NT 10.0; Win64; x64)",
      );
      Object.defineProperty(navigator, "userAgent", { get: () => agent });
      Object.defineProperty(navigator, "platform", { get: () => (mac ? "MacIntel" : "Win32") });
      if (window.top === window && !localStorage.getItem("stepwise.react-lab.v1"))
        localStorage.setItem(
          "stepwise.react-lab.v1",
          JSON.stringify({
            version: 1,
            entries: { snapshot: { code: source, notes: "", completed: false } },
          }),
        );
    },
    { source, mac },
  );
  await page.goto("/react-lab/snapshot");
  await startProject(page);
  await expect(page.getByRole("button", { name: "Format", exact: true })).toBeEnabled({
    timeout: 15000,
  });
  return page.getByRole("textbox", { name: "App.tsx", exact: true });
}

export function saved(page: Page) {
  return page.evaluate(
    () => JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries.snapshot.code,
  );
}
