import { expect, it } from "vitest";
import {
  editableProject,
  readProject,
  resolveModule,
  updateProjectFile,
  writeProject,
  writeProjectSnapshot,
} from "./project";

it("round trips bounded files and resolves relative imports only inside the project", () => {
  const files = {
    "App.tsx": "export default function App() {}",
    "components/Counter.tsx": "export default function Counter() {}",
    "state.ts": "export const count = 1;",
  };
  expect(readProject(writeProject(files))).toEqual(files);
  expect(readProject("export default function App() {}")["App.tsx"]).toContain("export default");
  expect(resolveModule(files, "App.tsx", "./components/Counter")).toBe("components/Counter.tsx");
  expect(resolveModule(files, "components/Counter.tsx", "../state")).toBe("state.ts");
  expect(() => resolveModule(files, "App.tsx", "https://example.com/code")).toThrow(
    "Unsupported import",
  );
  expect(() => resolveModule(files, "App.tsx", "./missing")).toThrow("Cannot resolve");
  expect(() => readProject(writeProject({ "../App.tsx": "bad" }))).toThrow("Invalid project");
});

it("accepts bounded CSS files and resolves their explicit local imports", () => {
  const files = {
    "App.tsx": "import './styles.css'; export default function App() {}",
    "styles.css": "@import './styles/base.css'; .card { padding: 13px; }",
    "styles/base.css": ".card { color: red; }",
  };
  expect(readProject(writeProject(files))).toEqual(files);
  expect(resolveModule(files, "App.tsx", "./styles.css")).toBe("styles.css");
  expect(() => readProject(writeProject({ "App.tsx": "", "../styles.css": "" }))).toThrow(
    "Invalid project",
  );
  expect(() => readProject(writeProject({ "App.tsx": "", "styles.scss": "" }))).toThrow(
    "Invalid project",
  );
});

it("offers an empty stylesheet without rewriting legacy JavaScript-only drafts", () => {
  const source = "export default function App(){return <p>Draft</p>}";
  expect(editableProject(source)).toEqual({ "App.tsx": source, "styles.css": "" });
  expect(updateProjectFile(source, "App.tsx", `${source}\n`)).toBe(`${source}\n`);
  const styled = updateProjectFile(source, "styles.css", "p { color: red; }");
  expect(readProject(styled)).toEqual({ "App.tsx": source, "styles.css": "p { color: red; }" });
  expect(
    readProject(updateProjectFile(styled, "App.tsx", "export default function App(){}"))[
      "styles.css"
    ],
  ).toBe("p { color: red; }");
});

it("keeps a full imported project within its existing file capacity", () => {
  const files = {
    "App.tsx": "export default function App(){}",
    ...Object.fromEntries(
      Array.from({ length: 19 }, (_, i) => [`part${i}.ts`, "export const value=1;"]),
    ),
  };
  const code = writeProject(files);
  expect(editableProject(code)).toEqual(files);
  expect(
    Object.keys(
      readProject(
        updateProjectFile(code, "App.tsx", "export default function App(){return null;}"),
      ),
    ),
  ).toHaveLength(20);
});

it("keeps plain drafts plain when only their offered empty stylesheet is present", () => {
  const code = "export default function App(){return null;}";
  const next = "export default function App(){return <p>Changed</p>}";
  expect(writeProjectSnapshot(code, { "App.tsx": next, "styles.css": "" })).toBe(next);
});

it("serializes complete project snapshots once and preserves explicit files", () => {
  const plain = "export default function App(){return null;}";
  const styled = { "App.tsx": plain, "styles.css": "p{color:red}" };
  expect(readProject(writeProjectSnapshot(plain, styled))).toEqual(styled);
  const withEmptyFile = { "App.tsx": plain, "styles.css": "", "utility.ts": "" };
  expect(readProject(writeProjectSnapshot(plain, withEmptyFile))).toEqual(withEmptyFile);
  const existing = writeProject({ "App.tsx": plain, "styles.css": "" });
  expect(writeProjectSnapshot(existing, { "App.tsx": plain, "styles.css": "" })).toBe(existing);
  const snapshot = {
    "App.tsx": "x".repeat(15000),
    "value.ts": "x".repeat(15000),
    "tail.ts": "changed",
  };
  expect(writeProjectSnapshot(existing, snapshot)).toBe(
    `// @stepwise/project\n${JSON.stringify(snapshot)}`,
  );
});
