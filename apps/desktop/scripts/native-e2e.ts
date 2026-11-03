import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAttempts, reviewStorageKey } from "../../interview-lab/app/react-lab/coach";
import { NativeDriver, until } from "./native-driver";
import { verifyNativePermissions } from "./native-permissions";

assert.equal(process.platform, "darwin", "Native WKWebView tests require macOS");
const desktop = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(desktop, "src-tauri/target");
const data = join(target, "native-e2e-data");
const binary = join(
  target,
  "debug/bundle/macos/Interview Practice Native Test.app/Contents/MacOS/interview-practice",
);
await mkdir(data, { recursive: true });
if (!existsSync(join(data, "models"))) {
  const source = [
    join(homedir(), "Library/Application Support/pro.kcb.interview-practice/models"),
    join(target, "live-review-data/models"),
  ].find(existsSync);
  assert(source, "Download Qwen Coder 7B in the app or run test:live-review first");
  execFileSync("cp", ["-cR", source, join(data, "models")]);
}
await writeFile(join(data, "model.json"), JSON.stringify("qwen2.5-coder:7b"));
let driver: NativeDriver | undefined;
try {
  driver = await NativeDriver.launch(binary, data, join(target, "native-e2e-first.log"));
  const platform = await driver.evaluate(() => ({
    origin: location.origin,
    userAgent: navigator.userAgent,
    native: "__TAURI_INTERNALS__" in window,
  }));
  assert(platform.userAgent.includes("AppleWebKit") && platform.native);
  console.log("Actual WKWebView started", platform);
  const first = driver;
  await driver.navigate("/profile");
  await driver.fill("input", "WKWebView test");
  await driver.click("Save profile");
  await until("profile saved", () =>
    first.evaluate(
      () =>
        JSON.parse(localStorage.getItem("interview.profile.v1") ?? "null")?.displayName ===
        "WKWebView test",
    ),
  );
  await driver.close();
  driver = await NativeDriver.launch(binary, data, join(target, "native-e2e-second.log"));
  const app = driver;
  await driver.navigate("/profile");
  assert.equal(
    await driver.evaluate(() => document.querySelector<HTMLInputElement>("input")?.value),
    "WKWebView test",
  );
  console.log("Native profile survives app quit and relaunch");
  await driver.navigate("/local-model");
  await until(
    "cached local model ready",
    () => app.evaluate(() => document.body.textContent?.includes("ready · qwen2.5-coder:7b")),
    30000,
  );
  console.log("Bundled Ollama and app-owned test model ready");
  await app.navigate("/react-lab/snapshot");
  await app.evaluate(() => {
    localStorage.removeItem("stepwise.react-lab.v1");
    localStorage.removeItem("stepwise.react-reviews.v1.snapshot");
  });
  await app.navigate("/react-lab/snapshot");
  await app.click("Start project");
  await app.click("Editor options");
  await app.click("Plain editor");
  console.log(
    "Native document CSP",
    await app.evaluate(async () =>
      (await fetch("/")).headers
        .get("content-security-policy")
        ?.replace(/nonce-[^' ]+/g, "nonce-present"),
    ),
  );
  await app.click("Run checks");
  await until("native starter behavior checks", () =>
    app.evaluate(() => document.body.textContent?.includes("0 of 2 checks passed")),
  );
  const permissions = await verifyNativePermissions(app);
  console.log("Actual WKWebView preview cannot reach native handlers", permissions);
  const implementation = `import { useState } from "react";
export default function App() {
  const [seats, setSeats] = useState(0);
  return <section><h2>Seat reservations</h2>
    <output aria-label="Reserved seats">{seats}</output>
    <button onClick={() => { setSeats(n => n + 1); setSeats(n => n + 1); setSeats(n => n + 1); }}>Reserve 3</button>
    <button onClick={() => setSeats(0)}>Reset</button>
  </section>;
}`;
  await app.fill("textarea.lab-code-input", implementation);
  await app.click("Run checks");
  await until("native behavior checks", () =>
    app.evaluate(() => document.body.textContent?.includes("2 of 2 checks passed")),
  );
  console.log("Learner implementation passes behavior checks in native WKWebView");
  await app.click("Finish & review");
  await app.fill(
    ".lab-coach textarea",
    "Each functional updater receives pending state. Three queued updaters reserve three seats per activation; Reset starts again at zero. The output label and buttons keep the interaction accessible.",
  );
  const started = Date.now();
  await app.click("Review my implementation");
  const raw = await until(
    "real Ollama review in native UI",
    async () => {
      const value = await app.evaluate(
        (key) => localStorage.getItem(key),
        reviewStorageKey("snapshot"),
      );
      return value && parseAttempts(value).length ? value : null;
    },
    190000,
  );
  const [attempt] = parseAttempts(raw);
  assert.equal(attempt.model, "qwen2.5-coder:7b");
  assert.equal(attempt.code, implementation);
  assert(attempt.review.summary.length > 0);
  assert(
    await app.evaluate(
      (summary) => document.querySelector(".lab-assessment")?.textContent?.includes(summary),
      attempt.review.summary,
    ),
  );
  const reviewSeconds = (Date.now() - started) / 1000;
  console.log(`Real local review rendered and saved in ${reviewSeconds.toFixed(2)}s`);
  await app.navigate("/react-lab/snapshot");
  await app.click("Resume project");
  await app.click("Finish & review");
  await until("saved review after reload", () =>
    app.evaluate(
      (summary) => document.querySelector(".lab-assessment")?.textContent?.includes(summary),
      attempt.review.summary,
    ),
  );
  await writeFile(
    join(target, "native-e2e-result.json"),
    JSON.stringify(
      {
        platform,
        profileRelaunch: true,
        modelReady: true,
        permissions,
        behaviorChecks: "2/2",
        reviewSeconds,
        review: attempt.review,
        reviewReload: true,
      },
      null,
      2,
    ),
  );
  await driver.close();
  console.log("Native app exited and its reviewer process stopped");
} finally {
  driver?.stop();
}
