import { compile } from "tailwindcss";
import preflight from "tailwindcss/preflight.css?raw";
import theme from "tailwindcss/theme.css?raw";
import { type ProjectFiles, resolveModule } from "./project";

export async function compileStyles(files: ProjectFiles, entries: readonly string[]) {
  return compile(
    `${theme}\n@tailwind utilities;\n${[...new Set(entries)].map((path) => `@import "./${path}";`).join("\n")}`,
    {
      async loadStylesheet(name, base) {
        if (name === "tailwindcss" || name === "tailwindcss/preflight.css")
          return { path: "tailwindcss/preflight.css", base: "", content: preflight };
        if (name === "tailwindcss/theme.css") return { path: name, base: "", content: theme };
        if (name === "tailwindcss/utilities.css") return { path: name, base: "", content: "" };
        if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(name))
          throw new Error(`Unsupported stylesheet import: ${name}`);
        const path = resolveModule(
          files,
          `${base ? `${base}/` : ""}stylesheet.css`,
          name.startsWith(".") ? name : `./${name}`,
        );
        if (!path.endsWith(".css")) throw new Error(`Not a CSS file: ${path}`);
        return { path, base: path.split("/").slice(0, -1).join("/"), content: files[path] ?? "" };
      },
    },
  );
}
