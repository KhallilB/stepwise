import { expect, test } from "@playwright/test";
import { openEditor, saved, source } from "./editor-keyboard-tools";
import { startProject } from "./lab-tools";

for (const mac of [true, false]) {
  test.describe(mac ? "macOS editor keys" : "Windows editor keys", () => {
    const primary = mac ? "Meta" : "Control";
    const word = mac ? "Alt" : "Control";
    const top = mac ? "Meta+ArrowUp" : "Control+Home";
    const bottom = mac ? "Meta+ArrowDown" : "Control+End";
    const end = mac ? "Meta+ArrowRight" : "End";

    test("word-left movement and Shift selection replace the intended word", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(top);
      await editor.press(end);
      await editor.press(`${word}+ArrowLeft`);
      await editor.press(`${word}+Shift+ArrowLeft`);
      await page.keyboard.insertText("replacement ");
      await expect.poll(() => saved(page)).toBe(source.replace("beta ", "replacement "));
    });

    test("word-right movement and Shift selection replace the intended word", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(top);
      for (let i = 0; i < 3; i++) await editor.press("ArrowRight");
      await editor.press(`${word}+ArrowRight`);
      await editor.press(`${word}+Shift+ArrowRight`);
      await page.keyboard.insertText(" B");
      await expect.poll(() => saved(page)).toBe(source.replace(" beta", " B"));
    });

    test("word deletion supports platform undo and redo and persists", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(top);
      await editor.press(end);
      await editor.press(`${word}+Backspace`);
      await expect.poll(() => saved(page)).toBe(source.replace("gamma", ""));
      await editor.press(`${primary}+z`);
      await expect.poll(() => saved(page)).toBe(source);
      await editor.press(mac ? "Meta+Shift+z" : "Control+y");
      await expect.poll(() => saved(page)).toBe(source.replace("gamma", ""));
      await page.reload();
      await startProject(page);
      await expect.poll(() => saved(page)).toBe(source.replace("gamma", ""));
    });

    test("line moves and copies stay undoable", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(top);
      await editor.press("Alt+ArrowDown");
      await expect
        .poll(() => saved(page))
        .toBe(
          source.replace(
            "// alpha beta gamma\n// delta epsilon",
            "// delta epsilon\n// alpha beta gamma",
          ),
        );
      await editor.press("Alt+Shift+ArrowDown");
      await expect
        .poll(() => saved(page))
        .toBe(
          source.replace(
            "// alpha beta gamma\n// delta epsilon",
            "// delta epsilon\n// alpha beta gamma\n// alpha beta gamma",
          ),
        );
      await editor.press(`${primary}+z`);
      await editor.press(`${primary}+z`);
      await expect.poll(() => saved(page)).toBe(source);
    });

    test("document and line boundaries extend selections", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(bottom);
      await editor.press(top);
      await editor.press(mac ? "Meta+Shift+ArrowRight" : "Shift+End");
      await page.keyboard.insertText("// replaced line");
      await expect
        .poll(() => saved(page))
        .toBe(source.replace("// alpha beta gamma", "// replaced line"));
      await editor.press(`${primary}+z`);
      await editor.press(bottom);
      await editor.press(mac ? "Meta+Shift+ArrowUp" : "Control+Shift+Home");
      await page.keyboard.insertText(
        "export default function App() { return <p>Replacement</p>; }",
      );
      await expect
        .poll(() => saved(page))
        .toBe("export default function App() { return <p>Replacement</p>; }");
    });

    test("run-check shortcut keeps code intact and Tab can leave the editor", async ({ page }) => {
      const editor = await openEditor(page, mac);
      await editor.press(`${primary}+Enter`);
      await expect(page.getByText("0 of 2 checks passed", { exact: false })).toBeVisible({
        timeout: 15000,
      });
      await expect.poll(() => saved(page)).toBe(source);
      await editor.press(mac ? "Control+Shift+m" : "Control+m");
      await editor.press("Tab");
      await expect(editor).not.toBeFocused();
    });
  });
}
