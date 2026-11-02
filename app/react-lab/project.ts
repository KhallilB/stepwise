const prefix = "// @stepwise/project\n";
const maxFiles = 20;
export type ProjectFiles = Record<string, string>;
export function readProject(code: string): ProjectFiles {
  if (!code.startsWith(prefix)) return { "App.tsx": code };
  const files: unknown = JSON.parse(code.slice(prefix.length));
  if (!files || typeof files !== "object" || Array.isArray(files))
    throw new Error("Invalid project files");
  const entries = Object.entries(files);
  if (
    entries.length > maxFiles ||
    !Object.hasOwn(files, "App.tsx") ||
    entries.some(
      ([path, source]) =>
        !/^(?:[\w-]+\/)*[\w-]+\.(?:tsx?|jsx?|css)$/.test(path) || typeof source !== "string",
    ) ||
    code.length > 30000
  )
    throw new Error("Invalid project files");
  return files as ProjectFiles;
}
export function writeProject(files: ProjectFiles): string {
  return prefix + JSON.stringify(files);
}
export function editableProject(code: string): ProjectFiles {
  const files = readProject(code);
  if (Object.keys(files).length >= maxFiles) return files;
  return { "styles.css": "", ...files };
}
export function updateProjectFile(code: string, path: string, source: string): string {
  if (path === "App.tsx" && !code.startsWith(prefix)) return source;
  return writeProject({ ...readProject(code), [path]: source });
}
export function resolveModule(files: ProjectFiles, from: string, name: string): string {
  if (!name.startsWith(".")) throw new Error(`Unsupported import: ${name}`);
  const parts = from.split("/").slice(0, -1);
  for (const part of name.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  const base = parts.join("/");
  const path = [
    base,
    ...[".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"].map((ext) => base + ext),
  ].find((path) => Object.hasOwn(files, path));
  if (!path) throw new Error(`Cannot resolve ${name} from ${from}`);
  return path;
}
