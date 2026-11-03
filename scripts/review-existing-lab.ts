import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Context = {
  branch: string;
  origin: string;
  foundationMerged: boolean;
  fixHeadPresent: boolean;
  dirty: boolean;
  changedFiles: readonly string[];
};
const policyFiles = new Set([
  "scripts/review-existing-lab.ts",
  "scripts/review-existing-lab.test.ts",
  "docs/review-existing-lab.md",
  ".github/workflows/platform-checks.yml",
  "vitest.config.ts",
]);

export function foundationReview(context: Context) {
  const origin = context.origin
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
  if (origin !== "https://github.com/KhallilB/stepwise") throw new Error("Wrong repository");
  if (context.branch !== "khallil/react-interview-lab")
    throw new Error("Only the existing React lab foundation is eligible");
  if (context.foundationMerged)
    throw new Error("Foundation cap expired: foundation is already on main");
  if (!context.fixHeadPresent) throw new Error("Foundation fixes are missing");
  if (context.dirty) throw new Error("Commit or preserve local changes before review");
  if (context.changedFiles.some((file) => !policyFiles.has(file)))
    throw new Error("Foundation source changed beyond its approved fix snapshot");
  return { sizeLimit: 13000, fileLimit: 60 };
}

export function foundationGateArguments(args: readonly string[]) {
  const allowed = new Set([
    "probes",
    "artifact",
    "coupled",
    "scope_manifest",
    "manifest",
    "static",
    "security",
    "deps",
    "mutation",
    "perf",
    "widget",
    "confirm",
  ]);
  const seen = new Set<string>();
  for (const arg of args) {
    const equal = arg.indexOf("=");
    const key = arg.slice(0, equal);
    const value = arg.slice(equal + 1);
    if (equal < 1 || !allowed.has(key) || !value.trim() || seen.has(key))
      throw new Error("Invalid or duplicate gate argument");
    if (key === "probes" && !/^[1-9][0-9]*$/.test(value))
      throw new Error("Probe count must be positive");
    seen.add(key);
  }
  if (!["probes", "artifact", "coupled"].every((key) => seen.has(key)))
    throw new Error("Gate requires probes, artifact and coupled evidence");
  return ["gate", "tier=full", "base=origin/main", ...args];
}

function main() {
  const git = (...args: string[]) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const ancestor = (commit: string, ref: string) => {
    try {
      git("merge-base", "--is-ancestor", commit, ref);
      return true;
    } catch {
      return false;
    }
  };
  const fixed = "3e2030430c398725b2095e1f05ee54003f3dc445";
  const policy = foundationReview({
    branch: git("branch", "--show-current"),
    origin: git("remote", "get-url", "origin"),
    foundationMerged: ancestor("d26ee1bde38331a6ed015d117ba2c26484774b0c", "origin/main"),
    fixHeadPresent: ancestor(fixed, "HEAD"),
    dirty: !!git("status", "--porcelain"),
    changedFiles: git("diff", "--name-only", fixed, "HEAD").split("\n").filter(Boolean),
  });
  const ownPath = "scripts/review-existing-lab.ts";
  if (
    git("show", `origin/main:${ownPath}`) !==
    readFileSync(fileURLToPath(import.meta.url), "utf8").trim()
  )
    throw new Error("Review policy must first land on main unchanged");
  for (const path of policyFiles)
    if (git("show", `HEAD:${path}`) !== git("show", `origin/main:${path}`))
      throw new Error(`Policy file differs from reviewed main: ${path}`);
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--check") {
    console.log(
      JSON.stringify({
        head: git("rev-parse", "HEAD"),
        base: git("rev-parse", "origin/main"),
        ...policy,
      }),
    );
    return;
  }
  const runner = [".codex", ".claude"]
    .map((root) => join(homedir(), root, "skills/review-loop/scripts/review_loop_round.sh"))
    .find(existsSync);
  if (!runner) throw new Error("Install the repository's review-loop tooling before review");
  execFileSync("bash", [runner, ...foundationGateArguments(args)], {
    stdio: "inherit",
    env: {
      ...process.env,
      REVIEW_LOOP_SIZE_LIMIT: String(policy.sizeLimit),
      REVIEW_LOOP_FILE_LIMIT: String(policy.fileLimit),
    },
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
