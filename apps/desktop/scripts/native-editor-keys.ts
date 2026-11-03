import { type NativeDriver, until } from "./native-driver";

export async function verifyNativeEditorKeys(app: NativeDriver) {
  const source =
    "// alpha beta gamma\n// delta epsilon\nexport default function App() { return <p>Keyboard practice</p>; }";
  await app.navigate("/react-lab/snapshot");
  await app.evaluate((code) => {
    localStorage.setItem(
      "stepwise.react-lab.v1",
      JSON.stringify({ version: 1, entries: { snapshot: { code, notes: "", completed: false } } }),
    );
  }, source);
  await app.navigate("/react-lab/snapshot");
  const start = await app.evaluate(() =>
    [...document.querySelectorAll("button")].some((button) =>
      button.textContent?.trim().startsWith("Resume project"),
    )
      ? "Resume project"
      : "Start project",
  );
  await app.click(start);
  await until("native Monaco ready", () =>
    app.evaluate(() => !!document.querySelector('button[aria-label="Format"]:not(:disabled)')),
  );
  await app.evaluate(() =>
    document.querySelector<HTMLTextAreaElement>(".monaco-editor textarea")?.focus(),
  );

  // DOM events verify WKWebView integration; OS-reserved keys stay outside this probe.
  async function press(
    key: string,
    keyCode: number,
    modifiers: { metaKey?: boolean; altKey?: boolean; shiftKey?: boolean } = {},
  ) {
    await app.evaluate(
      (key, keyCode, modifiers) => {
        const target = document.activeElement;
        if (!target?.closest(".monaco-editor")) throw new Error("Native editor lost focus");
        for (const type of ["keydown", "keyup"])
          target.dispatchEvent(
            new KeyboardEvent(type, {
              key,
              keyCode,
              which: keyCode,
              code: key.startsWith("Arrow") ? key : key === "z" ? "KeyZ" : key,
              bubbles: true,
              cancelable: true,
              ...modifiers,
            }),
          );
      },
      key,
      keyCode,
      modifiers,
    );
  }
  async function saved(expected: string) {
    await until("native keyboard edit saved", () =>
      app.evaluate(
        (expected) =>
          JSON.parse(localStorage.getItem("stepwise.react-lab.v1") ?? "{}").entries?.snapshot
            ?.code === expected,
        expected,
      ),
    );
  }
  await press("ArrowUp", 38, { metaKey: true });
  await press("ArrowRight", 39, { metaKey: true });
  await press("ArrowLeft", 37, { altKey: true });
  await press("ArrowLeft", 37, { altKey: true, shiftKey: true });
  await press("Backspace", 8);
  await saved(source.replace("beta ", ""));
  await press("z", 90, { metaKey: true });
  await saved(source);
  await press("ArrowRight", 39, { metaKey: true });
  await press("Backspace", 8, { altKey: true });
  await saved(source.replace("gamma", ""));
  await press("z", 90, { metaKey: true });
  await saved(source);
  await press("ArrowDown", 40, { altKey: true });
  await saved(
    source.replace(
      "// alpha beta gamma\n// delta epsilon",
      "// delta epsilon\n// alpha beta gamma",
    ),
  );
  await press("ArrowDown", 40, { metaKey: true });
  await press("ArrowUp", 38, { metaKey: true, shiftKey: true });
  await press("Backspace", 8);
  await saved("");
  console.log(
    "Native WKWebView Monaco navigation, selection, deletion, undo and line moves passed",
  );
}
