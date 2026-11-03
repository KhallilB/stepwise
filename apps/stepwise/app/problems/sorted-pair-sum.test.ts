import { describe, expect, it } from "vitest";
import { nums, sortedPairSum, target } from "./sorted-pair-sum";

const { trace, narration, bugStep, expected } = sortedPairSum;
const lines = trace.source.split("\n");

const run = (source: string) =>
  new Function(`${source}\nreturn pairSum;`)() as (nums: number[], target: number) => number[];

const local = (step: number, name: string) => trace.steps[step]?.stack[0]?.locals[name];

describe("sorted pair sum walkthrough", () => {
  it("has one sentence per step, each under 90 characters", () => {
    expect(narration).toHaveLength(trace.steps.length);
    for (const sentence of narration) expect(sentence.length).toBeLessThan(90);
  });

  it("only points at non-blank source lines", () => {
    for (const step of trace.steps) expect(lines[step.line - 1]?.trim()).toBeTruthy();
  });

  it("shows code that really has the planted bug", () => {
    expect(run(trace.source)(nums, target)).toEqual([]);
    const pair = (expected as number[]).map((i) => nums[i] ?? Number.NaN);
    expect(pair).toHaveLength(2);
    expect(pair.reduce((a, b) => a + b, 0)).toBe(target);
    expect(trace.steps.at(-1)).toMatchObject({ event: "return", line: 10 });
  });

  it("puts the bug step where hi moves down although the sum is too small", () => {
    const before = trace.steps[bugStep - 1]?.stack[0]?.locals;
    expect(trace.steps[bugStep]?.line).toBe(7);
    expect(before?.sum).toEqual({ kind: "prim", type: "number", v: 10 });
    expect(local(bugStep - 1, "hi")).toEqual({ kind: "prim", type: "number", v: 4 });
    expect(local(bugStep, "hi")).toEqual({ kind: "prim", type: "number", v: 3 });
    expect(local(bugStep, "lo")).toEqual(local(bugStep - 1, "lo"));
  });
});
