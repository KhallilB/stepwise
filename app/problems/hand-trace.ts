import { type HeapObj, num, type Step, type StepTag, type Value } from "../trace/trace";

/** One hand-written step: line, tags, the locals in scope (numbers or values), and its sentence. */
export type Row = [
  line: number,
  tags: StepTag[],
  locals: Record<string, number | Value>,
  sentence: string,
];

type Heap = Record<string, HeapObj>;

/**
 * A one-frame trace: `args` stay in scope throughout, first row is the call.
 * Last row is the return, or the exception when one is given. A heap function gets each row's index.
 */
export function handTrace(
  fn: string,
  heap: Heap | ((row: number) => Heap),
  args: Record<string, Value>,
  rows: Row[],
  exception?: Step["exception"],
) {
  const steps: Step[] = rows.map(([line, tags, locals], i) => {
    const last = i === rows.length - 1;
    return {
      line,
      event: i === 0 ? "call" : !last ? "line" : exception ? "exception" : "return",
      tags,
      stack: [
        {
          fn,
          line,
          locals: {
            ...args,
            ...Object.fromEntries(
              Object.entries(locals).map(([k, v]): [string, Value] => [
                k,
                typeof v === "number" ? num(v) : v,
              ]),
            ),
          },
        },
      ],
      heap: typeof heap === "function" ? heap(i) : heap,
      ...(last && exception ? { exception } : {}),
    };
  });
  return { steps, narration: rows.map((row) => row[3]) };
}
