import { type HeapObj, num, type Step, type StepTag, type Value } from "../trace/trace";

/** One hand-written step: line, tags, the numeric locals in scope, and its sentence. */
export type Row = [line: number, tags: StepTag[], locals: Record<string, number>, sentence: string];

/** A one-frame trace: `args` stay in scope throughout, first row is the call, last the return. */
export function handTrace(
  fn: string,
  heap: Record<string, HeapObj>,
  args: Record<string, Value>,
  rows: Row[],
) {
  const steps: Step[] = rows.map(([line, tags, locals], i) => ({
    line,
    event: i === 0 ? "call" : i === rows.length - 1 ? "return" : "line",
    tags,
    stack: [
      {
        fn,
        line,
        locals: {
          ...args,
          ...Object.fromEntries(
            Object.entries(locals).map(([k, v]): [string, Value] => [k, num(v)]),
          ),
        },
      },
    ],
    heap,
  }));
  return { steps, narration: rows.map((row) => row[3]) };
}
