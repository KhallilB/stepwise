import { mkdir } from "node:fs/promises";
import { writeChecksum } from "./checksum";

if (process.platform !== "darwin") throw new Error("Local desktop packaging supports macOS only.");
const bundle = "src-tauri/target/release/bundle/macos/Interview Practice.app";
const output = `src-tauri/target/release/bundle/downloads/Interview-Practice-macos-${process.arch}.zip`;
async function run(args: string[]) {
  const command = Bun.spawn(args, { stdout: "inherit", stderr: "inherit" });
  if (await command.exited) throw new Error(`${args[0]} failed; local package is not ready.`);
}
// Preview signature; stable releases need Developer ID and notarization.
await run(["codesign", "--force", "--deep", "--sign", "-", bundle]);
await run(["codesign", "--verify", "--deep", "--strict", bundle]);
await mkdir("src-tauri/target/release/bundle/downloads", { recursive: true });
await run(["ditto", "-c", "-k", "--sequesterRsrc", "--keepParent", bundle, output]);
await run(["unzip", "-tq", output]);
const checksum = await writeChecksum(output);
console.log(`Checksum: ${checksum}`);
console.log(`Local test build: ${output}. Ad-hoc signed; not notarized.`);
