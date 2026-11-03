import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { verifyChecksum } from "./checksum";

export async function pinnedRuntime() {
  const pin: { version: string; url: string; sha256: string } = JSON.parse(
    await readFile(new URL("../third-party/ollama-runtime.json", import.meta.url), "utf8"),
  );
  const cache = join("src-tauri/target/vendor", `ollama-${pin.version}`);
  const archive = join(cache, "ollama-darwin.tgz");
  const directory = join(cache, "runtime");
  await mkdir(cache, { recursive: true });
  if (!existsSync(archive)) {
    console.log(`Downloading Ollama ${pin.version} runtime`);
    const partial = `${archive}.partial`;
    execFileSync(
      "curl",
      [
        "--fail",
        "--silent",
        "--show-error",
        "--location",
        "--retry",
        "2",
        "--output",
        partial,
        pin.url,
      ],
      { stdio: "inherit" },
    );
    await verifyChecksum(partial, pin.sha256);
    await rename(partial, archive);
  }
  await verifyChecksum(archive, pin.sha256);
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory);
  execFileSync("tar", ["-xzf", archive, "-C", directory]);
  return { ...pin, directory };
}
