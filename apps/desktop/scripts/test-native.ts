import { execFileSync } from "node:child_process";

if (process.platform !== "darwin") throw new Error("Native WKWebView tests require macOS.");
const bundle = "src-tauri/target/debug/bundle/macos/Interview Practice Native Test.app";
for (const args of [
  ["bun", "run", "prepare:runtime"],
  [
    "bun",
    "run",
    "tauri",
    "build",
    "--debug",
    "--features",
    "native-e2e",
    "--config",
    "src-tauri/tauri.native-e2e.conf.json",
    "--bundles",
    "app",
  ],
  ["codesign", "--force", "--deep", "--sign", "-", bundle],
  ["codesign", "--verify", "--deep", "--strict", bundle],
  ["bun", "run", "scripts/native-e2e.ts"],
])
  execFileSync(args[0], args.slice(1), { stdio: "inherit" });
