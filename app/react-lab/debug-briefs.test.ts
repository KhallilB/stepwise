import { expect, it } from "vitest";
import { challenges } from "./curriculum";

const debugging = challenges.filter((challenge) => challenge.kind === "debug");

it("every debugging problem supplies data, target UI and three action/result examples", () => {
  expect(debugging).toHaveLength(57);
  for (const challenge of debugging) {
    const details = challenge.debugBrief;
    expect(details, challenge.id).toBeDefined();
    if (!details) throw new Error(`Missing debugging brief: ${challenge.id}`);
    expect(details.inputs.length, challenge.id).toBeGreaterThan(25);
    expect(details.initialUi.length, challenge.id).toBeGreaterThan(25);
    expect(details.examples.length, challenge.id).toBeGreaterThanOrEqual(3);
    expect(new Set(details.examples.map((example) => example.title)).size, challenge.id).toBe(
      details.examples.length,
    );
    for (const example of details.examples) {
      expect(example.input.length, challenge.id).toBeGreaterThan(8);
      expect(example.action.length, challenge.id).toBeGreaterThan(8);
      expect(example.expected.length, challenge.id).toBeGreaterThan(15);
      expect(example.stage, challenge.id).toBeUndefined();
    }
  }
});

it("public debugging copy gives a contract without root causes or repair recipes", () => {
  for (const challenge of debugging) {
    const publicCopy = JSON.stringify([
      challenge.title,
      challenge.summary,
      challenge.brief,
      challenge.debugBrief,
      challenge.requirements,
      challenge.tags,
    ]);
    expect(publicCopy, challenge.id).not.toMatch(
      /\buse(?:State|Reducer|Effect|Ref|Memo|Callback|SyncExternalStore)\b|=>|captured value|functional updates|replacement updates|stale closure|mutates? the|same reference|clickable div|setter three times|replace (?:it|the)|add a cleanup|copy before sort|lexicographic/i,
    );
  }
});

it("seat examples specify repeated reservations and reset without explaining the failure", () => {
  const counter = debugging.find((challenge) => challenge.id === "snapshot");
  expect(counter?.title).toBe("Seat reservation counter");
  const details = counter?.debugBrief;
  expect(details?.initialUi).toContain("0");
  expect(details?.examples.map((example) => example.action).join(" ")).toContain("Reserve 3");
  expect(details?.examples.map((example) => example.expected).join(" ")).toContain("6");
  expect(counter?.starter).toContain("setCount(count + 1)");
  expect(counter?.hints.join(" ")).toContain("Use setCount");
});
