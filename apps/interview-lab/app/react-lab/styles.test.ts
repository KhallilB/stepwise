import { expect, it } from "vitest";
import { compileStyles } from "./styles";

it("compiles genuine Tailwind utilities, variants, and arbitrary values locally", async () => {
  const compiler = await compileStyles({}, []);
  const css = compiler.build(["p-4", "md:grid-cols-2", "hover:bg-[#123456]"]);
  expect(css).toContain(".p-4");
  expect(css).toContain("48rem");
  expect(css).toContain("#123456");
});

it("resolves local CSS imports and combines theme directives with ordinary rules", async () => {
  const compiler = await compileStyles(
    {
      "styles.css":
        '@import "./styles/base.css"; @theme { --color-brand: #123456; } .card { @apply bg-brand; padding: 7px; }',
      "styles/base.css": ".card { color: red; }",
    },
    ["styles.css", "styles.css"],
  );
  const css = compiler.build(["p-4"]);
  expect(css).toContain("color: red");
  expect(css).toContain("--color-brand: #123456");
  expect(css).toContain("padding: 7px");
});

it("rejects missing or non-CSS imports and invalid Tailwind apply directives", async () => {
  await expect(
    compileStyles({ "styles.css": '@import "./missing.css";' }, ["styles.css"]),
  ).rejects.toThrow("Cannot resolve");
  await expect(
    compileStyles({ "styles.css": '@import "./logic.ts";', "logic.ts": "export default 1;" }, [
      "styles.css",
    ]),
  ).rejects.toThrow("Not a CSS file");
  await expect(
    compileStyles({ "styles.css": ".card { @apply missing-utility; }" }, ["styles.css"]),
  ).rejects.toThrow();
});
