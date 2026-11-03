import { cp, lstat, mkdir, readdir, readlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { sha256File } from "./checksum";
import { pinnedRuntime } from "./fetch-ollama";

if (process.platform !== "darwin") throw new Error("Desktop packaging supports macOS only.");
const override = process.env.OLLAMA_RUNTIME_DIR;
if (override && process.env.INTERVIEW_ALLOW_UNPINNED_RUNTIME !== "1")
  throw new Error(
    "Local runtime override requires INTERVIEW_ALLOW_UNPINNED_RUNTIME=1; use pinned runtime for releases.",
  );
const pin = override ? null : await pinnedRuntime();
const source = override ?? pin?.directory;
if (!source) throw new Error("Ollama runtime source unavailable.");
for (const name of ["ollama", "llama-server", "llama-quantize"]) await lstat(join(source, name));
const target = "src-tauri/resources/ollama";
await rm(target, { recursive: true, force: true });
await mkdir("src-tauri/resources", { recursive: true });
await cp(source, target, { recursive: true, verbatimSymlinks: true });
await cp("third-party/OLLAMA-LICENSE", join(target, "OLLAMA-LICENSE"));
const inputFiles: { file: string; sha256?: string; symlink?: string }[] = [];
async function inventory(relative = "") {
  for (const name of (await readdir(join(target, relative))).sort()) {
    const file = join(relative, name),
      absolute = join(target, file);
    const info = await lstat(absolute);
    if (info.isDirectory()) await inventory(file);
    else if (info.isSymbolicLink()) inputFiles.push({ file, symlink: await readlink(absolute) });
    else if (info.isFile()) inputFiles.push({ file, sha256: await sha256File(absolute) });
  }
}
await inventory();
await Bun.write(
  join(target, "runtime-manifest.json"),
  JSON.stringify(
    {
      source: pin ? "Ollama GitHub release" : "unverified local override",
      version: pin?.version ?? null,
      archiveUrl: pin?.url ?? null,
      archiveSha256: pin?.sha256 ?? null,
      architecture: "universal",
      inputFiles,
    },
    null,
    2,
  ),
);
console.log(
  `Bundled ${pin ? `verified Ollama ${pin.version}` : "development runtime override"} and license notices; model weights stay separate.`,
);
