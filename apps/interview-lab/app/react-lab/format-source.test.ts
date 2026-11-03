import { describe, expect, it } from "vitest";
import { challenges } from "./curriculum";
import { formatProjectSource, formatSource } from "./format-source";
import { maxCodeLength } from "./progress";
import { readProject, writeProject } from "./project";

describe("practice source formatting", () => {
  it("keeps JSX children and closing tags together at the available column width", async () => {
    const source =
      'import {useState} from "react";export default function App(){const [subscribed,setSubscribed]=useState(false);return <section><div onClick={()=>setSubscribed(true)}>Notify me</div><p role="status">{subscribed?"Subscribed":"Not subscribed"}</p></section>}';
    const formatted = await formatSource(source, "App.tsx", 70);
    expect(formatted).toContain(
      '      <p role="status">\n        {subscribed ? "Subscribed" : "Not subscribed"}\n      </p>',
    );
    expect(formatted.split("\n").every((line) => line.length <= 70)).toBe(true);
    expect(await formatSource(formatted, "App.tsx", 70)).toBe(formatted);
  });

  it("uses the same indentation and trailing newline for CSS", async () => {
    expect(await formatSource(".card{padding:13px;color:rgb(1,2,3)}", "styles.css")).toBe(
      ".card {\n  padding: 13px;\n  color: rgb(1, 2, 3);\n}\n",
    );
  });

  it("rejects incomplete syntax instead of substituting source", async () => {
    await expect(
      formatSource("export default function App(){return <section", "App.tsx"),
    ).rejects.toThrow();
  });
});

it("formats every file in a starter project without changing its file structure", async () => {
  const project = writeProject({
    "App.tsx": 'import Counter from "./Counter";export default function App(){return <Counter/>}',
    "Counter.tsx": "export default function Counter(){return <p>Count</p>}",
    "styles.css": ".card{padding:16px}",
  });
  const formatted = readProject(await formatProjectSource(project));
  expect(Object.keys(formatted)).toEqual(["App.tsx", "Counter.tsx", "styles.css"]);
  expect(formatted["Counter.tsx"]).toBe(
    "export default function Counter() {\n  return <p>Count</p>;\n}\n",
  );
  expect(formatted["styles.css"]).toBe(".card {\n  padding: 16px;\n}\n");
  expect(await formatProjectSource("export default function App(){return <p>Hi</p>}")).toBe(
    "export default function App() {\n  return <p>Hi</p>;\n}\n",
  );
});

it("prepares every starter and reference with the same format within project limits", async () => {
  for (const challenge of challenges) {
    for (const kind of ["starter", "solution"] as const) {
      const formatted = await formatProjectSource(challenge[kind]);
      expect(formatted.length, `${challenge.id}/${kind}`).toBeLessThanOrEqual(maxCodeLength);
      expect(Object.keys(readProject(formatted)), `${challenge.id}/${kind}`).toEqual(
        Object.keys(readProject(challenge[kind])),
      );
      for (const [path, source] of Object.entries(readProject(formatted))) {
        expect(source, `${challenge.id}/${kind}/${path}`).toBe(await formatSource(source, path));
      }
    }
  }
});
