import type { Trace } from "../trace/trace";
import type { ViewSpec } from "../views/view-spec";

/** A prototype walkthrough written by hand: no learner code runs yet (M1). */
export type Problem = {
  slug: string;
  title: string;
  pattern: string;
  difficulty: "Easy" | "Medium" | "Hard";
  trace: Trace;
  viewSpec: ViewSpec;
  /** One sentence per step, same order as trace.steps. */
  narration: string[];
  /** 0-based index of the step where the planted bug shows. */
  bugStep: number;
  /** What a correct solution returns for this input. */
  expected: unknown;
};
