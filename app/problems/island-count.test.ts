import { describe, expect, it } from "vitest";
import { grid, islandCount } from "./island-count";

const { trace, narration, bugStep, expected } = islandCount;
const lines = trace.source.split("\n");

const run = (source: string) =>
  new Function(`${source}\nreturn numIslands;`)() as (grid: number[][]) => number;

const copy = () => grid.map((row) => [...row]);
const local = (step: number, name: string) => trace.steps[step]?.stack[0]?.locals[name];
const n = (v: number) => ({ kind: "prim", type: "number", v });

describe("island count walkthrough", () => {
  it("has one sentence per step, each under 90 characters", () => {
    expect(narration).toHaveLength(trace.steps.length);
    for (const sentence of narration) expect(sentence.length).toBeLessThan(90);
  });

  it("only points at non-blank source lines", () => {
    for (const step of trace.steps) expect(lines[step.line - 1]?.trim()).toBeTruthy();
  });

  it("shows code that really has the planted bug", () => {
    expect(() => run(trace.source)(copy())).toThrow(TypeError);
    const fixed = trace.source.replace("nr > rows", "nr >= rows");
    expect(fixed).not.toBe(trace.source);
    expect(run(fixed)(copy())).toBe(expected);
  });

  it("puts the bug step where row 2 passes the bounds check", () => {
    expect(trace.steps[bugStep]?.line).toBe(16);
    expect(local(bugStep, "rows")).toEqual(n(2));
    expect(local(bugStep, "nr")).toEqual(n(2));
    expect(local(bugStep, "nc")).toEqual(n(0));
  });

  it("ends on the TypeError the real code throws, one step after the bug", () => {
    const last = trace.steps.at(-1);
    expect(trace.steps.length - 1).toBe(bugStep + 1);
    expect(last).toMatchObject({ event: "exception", line: 17 });
    let thrown: unknown;
    try {
      run(trace.source)(copy());
    } catch (error) {
      thrown = error;
    }
    expect(last?.exception).toEqual({
      type: "TypeError",
      message: (thrown as Error).message,
    });
  });

  it("keeps seen and q in step with the search", () => {
    const heap = (step: number) => trace.steps[step]?.heap ?? {};
    // q holds (1, 0) after the push, and is empty again once it is shifted.
    const push = narration.findIndex((s) => s.startsWith("[1, 0] joins"));
    expect(heap(push).q).toMatchObject({ kind: "array", len: 1 });
    expect(heap(bugStep).q).toMatchObject({ kind: "array", len: 0 });
    expect(heap(bugStep).seen1).toMatchObject({
      items: [
        { kind: "prim", v: true },
        { kind: "prim", v: false },
        { kind: "prim", v: false },
      ],
    });
  });
});
