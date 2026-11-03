import { describe, expect, it } from "vitest";
import { binarySearch, nums, target } from "./binary-search";

const { trace, narration, bugStep, expected } = binarySearch;
const lines = trace.source.split("\n");

const run = (source: string) =>
  new Function(`${source}\nreturn search;`)() as (nums: number[], target: number) => number;

describe("binary search walkthrough", () => {
  it("has one sentence per step, each under 90 characters", () => {
    expect(narration).toHaveLength(trace.steps.length);
    for (const sentence of narration) expect(sentence.length).toBeLessThan(90);
  });

  it("only points at non-blank source lines", () => {
    for (const step of trace.steps) expect(lines[step.line - 1]?.trim()).toBeTruthy();
  });

  it("shows code that really has the planted bug", () => {
    expect(run(trace.source)(nums, target)).toBe(-1);
    expect(expected).toBe(nums.indexOf(target));
    expect(trace.steps.at(-1)).toMatchObject({ event: "return", line: 10 });
  });

  it("puts the bug step where the loop ends on the target", () => {
    const locals = trace.steps[bugStep]?.stack[0]?.locals;
    expect(trace.steps[bugStep]?.line).toBe(4);
    expect(locals?.lo).toEqual({ kind: "prim", type: "number", v: expected });
    expect(locals?.hi).toEqual({ kind: "prim", type: "number", v: expected });
  });
});
