import type { Problem } from "../problems/problem";
import type { HeapObj, Step, Value } from "../trace/trace";

export type ArrayFrame = {
  kind: "array";
  name: string;
  /** False until the bound variable is in scope. */
  defined: boolean;
  items: unknown[];
  pointers: { name: string; index: number }[];
};

export type GridFrame = {
  kind: "grid";
  name: string;
  defined: boolean;
  cells: unknown[][];
  /** Same shape as `cells`. */
  visited: boolean[][];
  /** May fall outside the grid; that is often the bug. */
  cursors: { name: string; row: number; col: number }[];
};

export type ViewFrame = ArrayFrame | GridFrame;

/** Everything on screen for one step. Line, picture and sentence never come from different steps. */
export type WalkFrame = {
  index: number;
  total: number;
  line: number;
  sentence: string;
  views: ViewFrame[];
};

type ArrayObj = Extract<HeapObj, { kind: "array" }>;

const arrayOf = (step: Step, value: Value | undefined): ArrayObj | undefined => {
  const obj = value?.kind === "ref" ? step.heap[value.id] : undefined;
  return obj?.kind === "array" ? obj : undefined;
};

// A ref to a small array, like a queued [row, col], reads as its contents.
const display = (step: Step, value: Value): unknown => {
  if (value.kind === "prim") return value.v;
  const array = arrayOf(step, value);
  return array
    ? `[${array.items.map((v) => String(display(step, v))).join(", ")}]`
    : `→${value.id}`;
};

const numberIn = (locals: Record<string, Value>, name: string) => {
  const v = locals[name];
  return v?.kind === "prim" && typeof v.v === "number" ? v.v : undefined;
};

const rowsOf = (step: Step, value: Value | undefined) =>
  (arrayOf(step, value)?.items ?? []).map((row) => arrayOf(step, row)?.items ?? []);

export function frameAt(problem: Problem, index: number): WalkFrame {
  const { steps } = problem.trace;
  const step = steps[index];
  if (!step) throw new RangeError(`${problem.slug} has no step ${index}`);
  const locals = step.stack.at(-1)?.locals ?? {};

  const views = problem.viewSpec.views.map((view): ViewFrame => {
    const bound = locals[view.bind];
    const defined = bound !== undefined;

    if (view.type === "grid") {
      const cells = rowsOf(step, bound).map((row) => row.map((v) => display(step, v)));
      const visitedSet = view.overlays?.find((o) => o.style === "visited")?.set;
      const marks = visitedSet ? rowsOf(step, locals[visitedSet]) : [];
      const visited = cells.map((row, r) =>
        row.map((_, c) => {
          const mark = marks[r]?.[c];
          return mark?.kind === "prim" && mark.v === true;
        }),
      );
      const cursors = view.cursors.flatMap(([rowName, colName]) => {
        const row = numberIn(locals, rowName);
        const col = numberIn(locals, colName);
        return row === undefined || col === undefined
          ? []
          : [{ name: `${rowName},${colName}`, row, col }];
      });
      return { kind: "grid", name: view.bind, defined, cells, visited, cursors };
    }

    const pointers = view.pointers.flatMap((name) => {
      const i = numberIn(locals, name);
      return i === undefined ? [] : [{ name, index: i }];
    });
    const items = (arrayOf(step, bound)?.items ?? []).map((v) => display(step, v));
    return { kind: "array", name: view.bind, defined, items, pointers };
  });

  return {
    index,
    total: steps.length,
    line: step.line,
    sentence: problem.narration[index] ?? "",
    views,
  };
}

export const clampStep = (index: number, total: number) => Math.min(Math.max(index, 0), total - 1);
