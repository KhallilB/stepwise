import { expect, it } from "vitest";
import { challenges } from "./curriculum";

it("every build has sample data, starting UI and concrete action/result examples", () => {
  const builds = challenges.filter((challenge) => challenge.kind === "build");
  expect(builds).toHaveLength(19);
  for (const challenge of builds) {
    const spec = challenge.buildBrief;
    expect(spec, challenge.id).toBeDefined();
    if (!spec) throw new Error(`Missing build brief for ${challenge.id}`);
    expect(spec.inputs.length, challenge.id).toBeGreaterThan(30);
    expect(spec.initialUi.length, challenge.id).toBeGreaterThan(30);
    expect(spec.examples.length, challenge.id).toBeGreaterThanOrEqual(3);
    expect(new Set(spec.examples.map((example) => example.title)).size, challenge.id).toBe(
      spec.examples.length,
    );
    for (const example of spec.examples) {
      expect(example.title.length, challenge.id).toBeGreaterThan(5);
      expect(example.input.length, challenge.id).toBeGreaterThan(8);
      expect(example.action.length, challenge.id).toBeGreaterThan(8);
      expect(example.expected.length, challenge.id).toBeGreaterThan(15);
      if (challenge.stages) expect(example.stage, challenge.id).toBeGreaterThanOrEqual(0);
      else expect(example.stage, challenge.id).toBeUndefined();
    }
    if (challenge.stages)
      for (const index of challenge.stages.keys()) {
        expect(
          spec.examples.some((example) => example.stage === index),
          `${challenge.id}/stage${index}`,
        ).toBe(true);
      }
  }
});

it("visible build briefs describe outcomes rather than React code or algorithm recipes", () => {
  for (const challenge of challenges.filter((challenge) => challenge.kind === "build")) {
    const visible = JSON.stringify([
      challenge.brief,
      challenge.buildBrief,
      challenge.requirements,
      challenge.stages?.map((stage) => stage.constraints),
    ]);
    expect(visible, challenge.id).not.toMatch(
      /\buse(?:State|Reducer|Effect|Ref|Memo|Callback)\b|=>|export\s+(?:default|function)|return\s*</,
    );
    expect(visible, challenge.id).not.toMatch(
      /indegrees?|adjacency index|left boundary|FIFO queue|toSorted|copy before sort|indexed linear-pass/i,
    );
  }
});

it("price-card samples state currency conversion and empty recovery without implementation", () => {
  const sample = challenges.find((challenge) => challenge.id === "product-projection")?.buildBrief;
  expect(sample?.inputs).toContain("1250");
  expect(sample?.initialUi).toContain("Toggle empty");
  expect(sample?.examples.map((example) => example.expected).join(" ")).toContain("Tea — 12.50");
  expect(sample?.examples.map((example) => example.expected).join(" ")).toContain("0");
});
