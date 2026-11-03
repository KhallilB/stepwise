import { expect, test } from "@playwright/test";
import { openEditor, saved, source } from "../../interview-lab/e2e/editor-keyboard-tools";

for (const mac of [true, false]) {
  test(`${mac ? "macOS" : "Windows"} editing keys survive desktop bundling`, async ({ page }) => {
    const editor = await openEditor(page, mac);
    await editor.press(mac ? "Meta+ArrowUp" : "Control+Home");
    await editor.press(mac ? "Meta+ArrowRight" : "End");
    await editor.press(mac ? "Alt+ArrowLeft" : "Control+ArrowLeft");
    await editor.press(mac ? "Alt+Shift+ArrowLeft" : "Control+Shift+ArrowLeft");
    await editor.press("Backspace");
    await expect.poll(() => saved(page)).toBe(source.replace("beta ", ""));
    await editor.press(mac ? "Meta+z" : "Control+z");
    await expect.poll(() => saved(page)).toBe(source);
    await editor.press("Alt+ArrowDown");
    await expect
      .poll(() => saved(page))
      .toBe(
        source.replace(
          "// alpha beta gamma\n// delta epsilon",
          "// delta epsilon\n// alpha beta gamma",
        ),
      );
  });
}
