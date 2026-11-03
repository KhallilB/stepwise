import { readProject, updateProjectFile } from "./project";

export async function formatSource(source: string, filename: string, printWidth = 80) {
  const { format } = await import("prettier/standalone");
  const css = filename.endsWith(".css");
  const plugins = css
    ? [await import("prettier/plugins/postcss")]
    : await Promise.all([import("prettier/plugins/typescript"), import("prettier/plugins/estree")]);
  return format(source, {
    parser: css ? "css" : "typescript",
    filepath: filename,
    plugins,
    printWidth,
    tabWidth: 2,
  });
}

export async function formatProjectSource(code: string): Promise<string> {
  let formatted = code;
  for (const [filename, source] of Object.entries(readProject(code)))
    formatted = updateProjectFile(formatted, filename, await formatSource(source, filename));
  return formatted;
}
