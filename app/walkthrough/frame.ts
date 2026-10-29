import type { Problem } from "../problems/problem";
import type { Value } from "../trace/trace";

export type ArrayFrame = {
  name: string;
  items: unknown[];
  pointers: { name: string; index: number }[];
};

/** Everything on screen for one step. Line, picture and sentence never come from different steps. */
export type WalkFrame = {
  index: number;
  total: number;
  line: number;
  sentence: string;
  arrays: ArrayFrame[];
};

const display = (value: Value) => (value.kind === "prim" ? value.v : `→${value.id}`);

export function frameAt(problem: Problem, index: number): WalkFrame {
  const { steps } = problem.trace;
  const step = steps[index];
  if (!step) throw new RangeError(`${problem.slug} has no step ${index}`);
  const locals = step.stack.at(-1)?.locals ?? {};

  const arrays = problem.viewSpec.views.map((view) => {
    const bound = locals[view.bind];
    const obj = bound?.kind === "ref" ? step.heap[bound.id] : undefined;
    const pointers = view.pointers.flatMap((name) => {
      const v = locals[name];
      return v?.kind === "prim" && typeof v.v === "number" ? [{ name, index: v.v }] : [];
    });
    return {
      name: view.bind,
      items: obj?.kind === "array" ? obj.items.map(display) : [],
      pointers,
    };
  });

  return {
    index,
    total: steps.length,
    line: step.line,
    sentence: problem.narration[index] ?? "",
    arrays,
  };
}

export const clampStep = (index: number, total: number) => Math.min(Math.max(index, 0), total - 1);
